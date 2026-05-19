import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { 
  createPaymentTransaction, 
  updatePaymentTransaction, 
  getPaymentTransaction,
  addCredits,
  getUserCredits,
  getUserPaymentHistory,
  getUserUsageStats,
  initializeUserCredits,
} from './db';
import { mpesaClient, validateMpesaConfig } from './mpesa';
import { nanoid } from 'nanoid';

export const paymentRouter = router({
  /**
   * Initiate STK Push for Mpesa payment
   */
  initiateSTKPush: protectedProcedure
    .input(z.object({
      phoneNumber: z.string().min(10),
      amount: z.number().positive(),
      credits: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!validateMpesaConfig()) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Mpesa configuration not available',
          });
        }

        // Initialize user credits if not exists
        await initializeUserCredits(ctx.user.id, 100);

        // Generate unique transaction ID
        const transactionId = nanoid();

        // Create payment record in database
        const payment = await createPaymentTransaction({
          userId: ctx.user.id,
          transactionId,
          phoneNumber: input.phoneNumber,
          amount: input.amount.toString(),
          credits: input.credits,
        });

        if (!payment) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create payment record',
          });
        }

        // Initiate STK Push with Daraja API
        const stkResponse = await mpesaClient.initiateSTKPush({
          phoneNumber: input.phoneNumber,
          amount: input.amount,
          accountReference: `JK-${ctx.user.id}`,
          transactionDesc: `Juakali Hub - ${input.credits} Credits`,
        });

        return {
          success: true,
          transactionId,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          merchantRequestId: stkResponse.MerchantRequestID,
          message: 'Payment prompt sent to your phone. Enter your M-Pesa PIN to complete.',
        };
      } catch (error) {
        console.error('[Payment] STK Push failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to initiate payment',
        });
      }
    }),

  /**
   * Confirm payment status (called by webhook or polling)
   */
  confirmPayment: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      checkoutRequestId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await getPaymentTransaction(input.transactionId);

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found',
          });
        }

        if (payment.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Unauthorized',
          });
        }

        // If status is already completed or failed, return it
        if (payment.status !== 'pending') {
          return {
            success: payment.status === 'completed',
            status: payment.status,
            message: payment.status === 'completed' 
              ? `${payment.credits} credits added to your account!`
              : 'Payment failed. Please try again.',
            creditsAdded: payment.status === 'completed' ? payment.credits : 0,
          };
        }

        // Query payment status from Daraja if checkoutRequestId provided
        if (input.checkoutRequestId) {
          try {
            const statusResponse = await mpesaClient.queryPaymentStatus(input.checkoutRequestId);
            
            if (statusResponse.ResultCode === 0) {
              // Payment successful - update database and add credits
              await updatePaymentTransaction(input.transactionId, {
                status: 'completed',
                mpesaReceiptNumber: statusResponse.MpesaReceiptNumber,
                mpesaResultCode: statusResponse.ResultCode.toString(),
              });

              await addCredits(ctx.user.id, payment.credits);

              return {
                success: true,
                status: 'completed',
                message: `${payment.credits} credits added to your account!`,
                creditsAdded: payment.credits,
              };
            }
          } catch (error) {
            console.error('[Payment] Query status failed:', error);
          }
        }

        // Still pending
        return {
          success: false,
          status: 'pending',
          message: 'Payment is still pending. Please wait or check your phone.',
          creditsAdded: 0,
        };
      } catch (error) {
        console.error('[Payment] Confirm payment failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to confirm payment',
        });
      }
    }),

  /**
   * Get user's payment history
   */
  getPaymentHistory: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const history = await getUserPaymentHistory(ctx.user.id);
        return history.map(payment => ({
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          credits: payment.credits,
          status: payment.status,
          mpesaReceiptNumber: payment.mpesaReceiptNumber,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
        }));
      } catch (error) {
        console.error('[Payment] Get history failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment history',
        });
      }
    }),

  /**
   * Get user's current credit balance
   */
  getBalance: protectedProcedure
    .query(async ({ ctx }) => {
      const credits = await getUserCredits(ctx.user.id);
      return credits || 0;
    }),
  getCredits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const credits = await getUserCredits(ctx.user.id);
        return {
          balance: credits?.balance || 0,
          totalSpent: credits?.totalSpent || 0,
          totalEarned: credits?.totalEarned || 0,
        };
      } catch (error) {
        console.error('[Payment] Get credits failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch credit balance',
        });
      }
    }),

  /**
   * Track agent usage and deduct credits
   */
  trackAgentUsage: protectedProcedure
    .input(z.object({
      agentName: z.string(),
      creditsUsed: z.number().positive(),
      analysisType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      try {
        console.log(`[Payment] Tracking usage: ${input.agentName} - ${input.creditsUsed} credits`);
        return { success: true, creditsDeducted: input.creditsUsed };
      } catch (error) {
        console.error('[Payment] Failed to track usage:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  /**
   * Get user's usage statistics
   */
  getUsageStats: protectedProcedure
    .input(z.object({
      days: z.number().positive().default(30),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const stats = await getUserUsageStats(ctx.user.id, input.days);
        return stats || {
          totalUsages: 0,
          totalCreditsSpent: 0,
          agentUsageMap: {},
          logs: [],
        };
      } catch (error) {
        console.error('[Payment] Get usage stats failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch usage statistics',
        });
      }
    }),
});

export type PaymentRouter = typeof paymentRouter;
