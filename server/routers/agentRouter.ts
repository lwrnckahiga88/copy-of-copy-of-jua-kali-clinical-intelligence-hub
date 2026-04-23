import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  agentSyncManager,
  syncAgentData,
  syncAgentStatus,
  syncAgentError,
} from "../agentSync";

export const agentRouter = router({
  /**
   * Get agent state
   */
  getState: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(({ input }) => {
      const state = agentSyncManager.getState(input.agentId);
      return state || { agentId: input.agentId, data: {}, lastUpdate: 0 };
    }),

  /**
   * Update agent state
   */
  updateState: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        data: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      agentSyncManager.setState(input.agentId, input.data);
      await syncAgentData(input.agentId, input.data);
      return { success: true };
    }),

  /**
   * Set agent status
   */
  setStatus: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        status: z.enum(["active", "inactive", "error", "loading"]),
      })
    )
    .mutation(async ({ input }) => {
      await syncAgentStatus(input.agentId, input.status);
      return { success: true };
    }),

  /**
   * Report agent error
   */
  reportError: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        error: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await syncAgentError(input.agentId, input.error);
      return { success: true };
    }),

  /**
   * Get sync statistics
   */
  getStats: publicProcedure.query(() => {
    return agentSyncManager.getStats();
  }),

  /**
   * Get subscription count for an agent
   */
  getSubscriptionCount: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(({ input }) => {
      return {
        agentId: input.agentId,
        subscriptionCount: agentSyncManager.getSubscriptions(input.agentId),
      };
    }),

  /**
   * Clear subscriptions for an agent
   */
  clearSubscriptions: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(({ input }) => {
      agentSyncManager.clearSubscriptions(input.agentId);
      return { success: true };
    }),

  /**
   * Batch update multiple agents
   */
  batchUpdate: publicProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            agentId: z.string(),
            data: z.record(z.string(), z.unknown()),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      for (const update of input.updates) {
        await syncAgentData(update.agentId, update.data);
      }
      return { success: true, count: input.updates.length };
    }),
});
