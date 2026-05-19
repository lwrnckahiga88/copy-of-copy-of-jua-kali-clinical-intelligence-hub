import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { users, paymentTransactions, agentUsageLog, credits } from '../drizzle/schema';

/**
 * Admin Router for platform-wide analytics and management
 * Only accessible to users with admin role
 */

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get platform-wide statistics
   */
  getPlatformStats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      // Get total users
      const userCount = await db.select().from(users);
      
      // Get total revenue
      const payments = await db.select().from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'completed'));
      
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalCreditsIssued = payments.reduce((sum, p) => sum + p.credits, 0);

      // Get agent usage stats
      const usageLogs = await db.select().from(agentUsageLog);
      const agentStats: Record<string, { count: number; creditsUsed: number }> = {};
      
      usageLogs.forEach(log => {
        if (!agentStats[log.agentName]) {
          agentStats[log.agentName] = { count: 0, creditsUsed: 0 };
        }
        agentStats[log.agentName].count += 1;
        agentStats[log.agentName].creditsUsed += log.creditsCost;
      });

      // Get payment stats
      const totalTransactions = await db.select().from(paymentTransactions);
      const completedTransactions = payments.length;
      const failedTransactions = totalTransactions.filter(t => t.status === 'failed').length;
      const pendingTransactions = totalTransactions.filter(t => t.status === 'pending').length;

      return {
        users: userCount.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalCreditsIssued,
        totalTransactions: totalTransactions.length,
        completedTransactions,
        failedTransactions,
        pendingTransactions,
        agentStats: Object.entries(agentStats).map(([name, stats]) => ({
          name,
          usageCount: stats.count,
          creditsUsed: stats.creditsUsed,
        })),
      };
    } catch (error) {
      console.error('[Admin] Get platform stats failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch platform statistics',
      });
    }
  }),

  /**
   * Get detailed user analytics
   */
  getUserAnalytics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const userList = await db.select().from(users);
      const userCredits = await db.select().from(credits);
      const usageLogs = await db.select().from(agentUsageLog);

      const analytics = userList.map(user => {
        const userCredit = userCredits.find(c => c.userId === user.id);
        const userUsages = usageLogs.filter(log => log.userId === user.id);
        const totalSpent = userUsages.reduce((sum, log) => sum + log.creditsCost, 0);

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          creditBalance: userCredit?.balance || 0,
          totalSpent,
          totalEarned: userCredit?.totalEarned || 0,
          usageCount: userUsages.length,
          lastSignedIn: user.lastSignedIn,
          createdAt: user.createdAt,
        };
      });

      return analytics;
    } catch (error) {
      console.error('[Admin] Get user analytics failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user analytics',
      });
    }
  }),

  /**
   * Get payment analytics
   */
  getPaymentAnalytics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const payments = await db.select().from(paymentTransactions);
      
      // Group by status
      const byStatus = {
        completed: payments.filter(p => p.status === 'completed'),
        pending: payments.filter(p => p.status === 'pending'),
        failed: payments.filter(p => p.status === 'failed'),
        cancelled: payments.filter(p => p.status === 'cancelled'),
      };

      // Calculate totals
      const stats = {
        totalTransactions: payments.length,
        totalRevenue: Number(
          byStatus.completed.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)
        ),
        totalCreditsIssued: byStatus.completed.reduce((sum, p) => sum + p.credits, 0),
        byStatus: {
          completed: byStatus.completed.length,
          pending: byStatus.pending.length,
          failed: byStatus.failed.length,
          cancelled: byStatus.cancelled.length,
        },
        averageTransaction: payments.length > 0
          ? Number((
              payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length
            ).toFixed(2))
          : 0,
        recentTransactions: payments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(p => ({
            id: p.id,
            transactionId: p.transactionId,
            userId: p.userId,
            amount: Number(p.amount),
            credits: p.credits,
            status: p.status,
            createdAt: p.createdAt,
          })),
      };

      return stats;
    } catch (error) {
      console.error('[Admin] Get payment analytics failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch payment analytics',
      });
    }
  }),

  /**
   * Get agent usage analytics
   */
  getAgentAnalytics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const usageLogs = await db.select().from(agentUsageLog);
      
      const agentStats: Record<string, {
        count: number;
        totalCredits: number;
        uniqueUsers: Set<number>;
      }> = {};

      usageLogs.forEach(log => {
        if (!agentStats[log.agentName]) {
          agentStats[log.agentName] = {
            count: 0,
            totalCredits: 0,
            uniqueUsers: new Set(),
          };
        }
        agentStats[log.agentName].count += 1;
        agentStats[log.agentName].totalCredits += log.creditsCost;
        agentStats[log.agentName].uniqueUsers.add(log.userId);
      });

      const analytics = Object.entries(agentStats)
        .map(([name, stats]) => ({
          name,
          usageCount: stats.count,
          totalCreditsUsed: stats.totalCredits,
          uniqueUsers: stats.uniqueUsers.size,
          averageCreditsPerUse: stats.count > 0 ? (stats.totalCredits / stats.count).toFixed(2) : 0,
        }))
        .sort((a, b) => b.usageCount - a.usageCount);

      return {
        totalAgents: analytics.length,
        totalUsages: usageLogs.length,
        totalCreditsUsed: usageLogs.reduce((sum, log) => sum + log.creditsCost, 0),
        agents: analytics,
      };
    } catch (error) {
      console.error('[Admin] Get agent analytics failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch agent analytics',
      });
    }
  }),
});

export type AdminRouter = typeof adminRouter;
