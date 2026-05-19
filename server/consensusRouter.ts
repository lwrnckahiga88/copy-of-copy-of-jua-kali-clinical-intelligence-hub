import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  calculateConsensusScore,
  formatConsensusForDisplay,
  AgentAnalysis,
} from "./consensusEngine";

export const consensusRouter = router({
  // Calculate consensus from multiple agent analyses
  calculateConsensus: protectedProcedure
    .input(
      z.object({
        analyses: z.array(
          z.object({
            agentId: z.string(),
            agentName: z.string(),
            analysisType: z.enum(["diagnosis", "treatment", "prognosis", "risk_assessment"]),
            result: z.string(),
            confidence: z.number().min(0).max(1),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.analyses.length === 0) {
          throw new Error("At least one analysis is required");
        }

        // Convert input to AgentAnalysis format
        const analyses: AgentAnalysis[] = input.analyses.map((a) => ({
          agentId: a.agentId,
          agentName: a.agentName,
          analysisType: a.analysisType,
          result: a.result,
          confidence: a.confidence,
          timestamp: Date.now(),
        }));

        // Calculate consensus
        const consensus = await calculateConsensusScore(analyses);

        // Format for display
        const formatted = formatConsensusForDisplay(consensus);

        return {
          success: true,
          consensus: formatted,
          rawConsensus: consensus,
        };
      } catch (error) {
        console.error("[Consensus] Error calculating consensus:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get consensus for a specific analysis type
  getConsensusForType: protectedProcedure
    .input(
      z.object({
        analysisType: z.enum(["diagnosis", "treatment", "prognosis", "risk_assessment"]),
        agentResults: z.record(z.string(), z.string()), // agentId -> result
      })
    )
    .query(async ({ input }) => {
      try {
        // Convert agent results to analyses
        const analyses: AgentAnalysis[] = Object.entries(input.agentResults).map(
          ([agentId, result]) => ({
            agentId,
            agentName: agentId.charAt(0).toUpperCase() + agentId.slice(1),
            analysisType: input.analysisType,
            result: String(result),
            confidence: 0.8, // Default confidence
            timestamp: Date.now(),
          })
        );

        if (analyses.length === 0) {
          throw new Error("At least one agent result is required");
        }

        const consensus = await calculateConsensusScore(analyses);
        return {
          success: true,
          consensus: formatConsensusForDisplay(consensus),
        };
      } catch (error) {
        console.error("[Consensus] Error getting consensus:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Compare multiple agent analyses
  compareAnalyses: protectedProcedure
    .input(
      z.object({
        analyses: z.array(
          z.object({
            agentId: z.string(),
            agentName: z.string(),
            result: z.string(),
            confidence: z.number().min(0).max(1),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const analyses: AgentAnalysis[] = input.analyses.map((a) => ({
          agentId: a.agentId,
          agentName: a.agentName,
          analysisType: "diagnosis" as const,
          result: a.result,
          confidence: a.confidence,
          timestamp: Date.now(),
        }));

        const consensus = await calculateConsensusScore(analyses);

        return {
          success: true,
          comparison: {
            totalAgents: analyses.length,
            agreementScore: (consensus.agreementScore * 100).toFixed(1) + "%",
            confidenceLevel: consensus.confidenceLevel,
            agents: analyses.map((a) => ({
              name: a.agentName,
              confidence: (a.confidence * 100).toFixed(1) + "%",
            })),
            summary: consensus.clinicalSummary,
          },
        };
      } catch (error) {
        console.error("[Consensus] Error comparing analyses:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get recommendations from consensus
  getRecommendations: protectedProcedure
    .input(
      z.object({
        consensusResult: z.string(),
        analysisType: z.enum(["diagnosis", "treatment", "prognosis", "risk_assessment"]),
      })
    )
    .query(async ({ input }) => {
      try {
        // Create a minimal consensus object for recommendation generation
        const mockConsensus: AgentAnalysis[] = [
          {
            agentId: "consensus",
            agentName: "Consensus",
            analysisType: input.analysisType as "diagnosis" | "treatment" | "prognosis" | "risk_assessment",
            result: input.consensusResult,
            confidence: 0.85,
            timestamp: Date.now(),
          },
        ];

        const consensus = await calculateConsensusScore(mockConsensus as AgentAnalysis[]);

        return {
          success: true,
          recommendations: consensus.recommendations,
          clinicalSummary: consensus.clinicalSummary,
        };
      } catch (error: unknown) {
        console.error("[Consensus] Error getting recommendations:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
