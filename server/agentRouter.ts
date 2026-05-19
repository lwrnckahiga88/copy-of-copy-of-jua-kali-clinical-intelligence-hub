import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  shareAnalysisData,
  getSharedDataForAgent,
  getAllSharedData,
  updateDataAccessibility,
  getAgentSyncStats,
} from './agentSyncService';

export const agentRouter = router({
  /**
   * Share analysis data with other agents
   */
  shareData: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
      sourceAgent: z.string(),
      dataType: z.enum(['variants', 'risk_assessment', 'protein_structure', 'cancer_profile', 'clinical_notes']),
      data: z.record(z.string(), z.unknown()),
      accessibleAgents: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const result = await shareAnalysisData({
          analysisId: input.analysisId,
          userId: ctx.user.id,
          sourceAgent: input.sourceAgent,
          dataType: input.dataType,
          data: input.data,
          accessibleAgents: input.accessibleAgents,
        });

        if (!result) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to share data',
          });
        }

        return {
          success: true,
          analysisId: result.analysisId,
          sharedWith: result.accessibleAgents,
        };
      } catch (error) {
        console.error('[Agent] Share data failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to share data',
        });
      }
    }),

  /**
   * Get shared data accessible to an agent
   */
  getSharedData: protectedProcedure
    .input(z.object({
      agentName: z.string(),
      dataType: z.enum(['variants', 'risk_assessment', 'protein_structure', 'cancer_profile', 'clinical_notes']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const data = await getSharedDataForAgent(ctx.user.id, input.agentName, input.dataType);
        return {
          success: true,
          count: data.length,
          data,
        };
      } catch (error) {
        console.error('[Agent] Get shared data failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve shared data',
        });
      }
    }),

  /**
   * Get all shared data for user
   */
  getAllSharedData: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const data = await getAllSharedData(ctx.user.id);
        return {
          success: true,
          count: data.length,
          data,
        };
      } catch (error) {
        console.error('[Agent] Get all shared data failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve shared data',
        });
      }
    }),

  /**
   * Update data accessibility for specific agents
   */
  updateAccessibility: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
      accessibleAgents: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const success = await updateDataAccessibility(
          input.analysisId,
          ctx.user.id,
          input.accessibleAgents
        );

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update accessibility',
          });
        }

        return {
          success: true,
          analysisId: input.analysisId,
          accessibleAgents: input.accessibleAgents,
        };
      } catch (error) {
        console.error('[Agent] Update accessibility failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update accessibility',
        });
      }
    }),

  /**
   * Get agent sync statistics
   */
  getSyncStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const stats = await getAgentSyncStats(ctx.user.id);
        return {
          success: true,
          stats,
        };
      } catch (error) {
        console.error('[Agent] Get sync stats failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve sync statistics',
        });
      }
    }),
});

export type AgentRouter = typeof agentRouter;
