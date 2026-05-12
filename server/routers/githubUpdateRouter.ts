import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getGitHubUpdateAgent } from "../agents/githubUpdateAgent";
import { JarvisPatchEngine } from "../jarvisPatchEngine";

/**
 * GitHub Update Router
 * Safe execution layer for Jarvis-controlled repository updates
 * 
 * All endpoints require authentication and enforce safety rules
 */

export const githubUpdateRouter = router({
  /**
   * Generate a patch based on a Jarvis intent
   * This does NOT apply changes, only generates the diff
   */
  generatePatch: protectedProcedure
    .input(
      z.object({
        intentType: z.string(),
        agentId: z.string().optional(),
        payload: z.any(),
        metadata: z.any().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = JarvisPatchEngine.generatePatch({
          type: input.intentType,
          agentId: input.agentId,
          payload: input.payload,
          metadata: input.metadata,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Validate a patch before applying it
   * Checks for safety violations and conflicts
   */
  validatePatch: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            path: z.string(),
            content: z.string(),
            action: z.enum(["create", "update", "delete"]),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const agent = getGitHubUpdateAgent();
        const validation = await agent.validatePatch(input.changes);

        return {
          success: true,
          data: validation,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Apply a validated patch to the repository
   * ADMIN ONLY - requires approval
   */
  applyPatch: adminProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            path: z.string(),
            content: z.string(),
            action: z.enum(["create", "update", "delete"]),
          })
        ),
        branch: z.string().default("main"),
        commitMessage: z.string().default("Jarvis autonomous update"),
        requiresApproval: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check approval if required
        if (input.requiresApproval) {
          // In production, this would check an approval queue
          console.log(`[APPROVAL REQUIRED] Changes require manual approval`);
          return {
            success: false,
            error: "Changes require manual approval",
            requiresApproval: true,
          };
        }

        const agent = getGitHubUpdateAgent();

        // Validate first
        const validation = await agent.validatePatch(input.changes);
        if (!validation.valid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(", ")}`,
          };
        }

        // Apply patch
        const result = await agent.applyPatch(
          input.changes,
          input.branch,
          input.commitMessage
        );

        // Log the action
        console.log(`[GITHUB UPDATE] ${ctx.user?.name} applied patch:`, {
          commitSha: result.commitSha,
          message: input.commitMessage,
          filesChanged: input.changes.length,
          timestamp: result.timestamp,
        });

        return {
          success: result.success,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Rollback to a previous commit
   * ADMIN ONLY
   */
  rollback: adminProcedure
    .input(
      z.object({
        commitSha: z.string(),
        branch: z.string().default("main"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = getGitHubUpdateAgent();
        const result = await agent.rollback(input.branch, input.commitSha);

        // Log the action
        console.log(`[GITHUB ROLLBACK] ${ctx.user?.name} rolled back to ${input.commitSha}`);

        return {
          success: result.success,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get commit history for audit trail
   */
  getCommitHistory: protectedProcedure
    .input(
      z.object({
        branch: z.string().default("main"),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const agent = getGitHubUpdateAgent();
        const commits = await agent.getCommitHistory(input.branch, input.limit);

        return {
          success: true,
          data: commits,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get current branch status
   */
  getBranchStatus: protectedProcedure
    .input(
      z.object({
        branch: z.string().default("main"),
      })
    )
    .query(async ({ input }) => {
      try {
        const agent = getGitHubUpdateAgent();
        const status = await agent.getBranchStatus(input.branch);

        return {
          success: true,
          data: status,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Create a rollback snapshot
   * Useful before applying major changes
   */
  createSnapshot: protectedProcedure
    .input(
      z.object({
        branch: z.string().default("main"),
        description: z.string(),
        files: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = getGitHubUpdateAgent();
        const snapshot = await agent.createRollbackSnapshot(
          input.branch,
          input.description,
          input.files
        );

        return {
          success: true,
          data: snapshot,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
