import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  runBioinformaticsPipeline,
  predictProteinStructure,
  callVariantsWithGATK,
  alignSequenceWithBWA,
  predictDrugInteraction,
  cacheStructure,
  cacheVariants,
  getCachedStructure,
  getCachedVariants,
} from "./bioinformatics";

export const bioinformaticsRouter = router({
  // Run full bioinformatics pipeline
  runPipeline: protectedProcedure
    .input(
      z.object({
        sampleId: z.string(),
        bamFile: z.string(),
        referenceGenome: z.string(),
        proteinSequence: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(`[Bioinformatics] Running pipeline for ${input.sampleId}`);

        const result = await runBioinformaticsPipeline(
          input.sampleId,
          input.bamFile,
          input.referenceGenome,
          input.proteinSequence
        );

        // Cache results
        cacheStructure(result.structure);
        cacheVariants(input.sampleId, result.variants);

        return {
          success: true,
          data: {
            variantCount: result.variants.length,
            alignmentQuality: result.alignment.matchPercentage,
            structureConfidence: result.structure.structure.confidence,
            drugInteractionCount: result.drugInteractions.length,
            variants: result.variants,
            alignment: result.alignment,
            structure: result.structure,
            drugInteractions: result.drugInteractions,
          },
        };
      } catch (error) {
        console.error("[Bioinformatics] Pipeline error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Call variants with GATK
  callVariants: protectedProcedure
    .input(
      z.object({
        bamFile: z.string(),
        referenceGenome: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const variants = await callVariantsWithGATK(input.bamFile, input.referenceGenome);
        return {
          success: true,
          variants,
          count: variants.length,
        };
      } catch (error) {
        console.error("[Bioinformatics] Variant calling error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Align sequence with BWA
  alignSequence: protectedProcedure
    .input(
      z.object({
        querySequence: z.string(),
        referenceGenome: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const alignment = await alignSequenceWithBWA(
          input.querySequence,
          input.referenceGenome
        );
        return {
          success: true,
          alignment,
          matchPercentage: alignment.matchPercentage,
        };
      } catch (error) {
        console.error("[Bioinformatics] Alignment error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Predict protein structure with AlphaFold
  predictStructure: protectedProcedure
    .input(
      z.object({
        proteinSequence: z.string(),
        proteinId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check cache first
        const cached = await getCachedStructure(input.proteinId);
        if (cached) {
          console.log(`[Bioinformatics] Using cached structure for ${input.proteinId}`);
          return {
            success: true,
            structure: cached,
            cached: true,
          };
        }

        const structure = await predictProteinStructure(
          input.proteinSequence,
          input.proteinId
        );

        // Cache for future use
        cacheStructure(structure);

        return {
          success: true,
          structure,
          cached: false,
          confidence: structure.structure.confidence,
        };
      } catch (error) {
        console.error("[Bioinformatics] Structure prediction error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Predict drug interactions
  predictDrugInteractions: protectedProcedure
    .input(
      z.object({
        proteinId: z.string(),
        drugNames: z.array(z.string()),
        proteinSequence: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get or predict protein structure
        let structure = await getCachedStructure(input.proteinId);
        if (!structure) {
          structure = await predictProteinStructure(
            input.proteinSequence,
            input.proteinId
          );
          cacheStructure(structure);
        }

        // Predict interactions for each drug
        const interactions = [];
        for (const drug of input.drugNames) {
          const interaction = await predictDrugInteraction(
            input.proteinId,
            drug,
            structure
          );
          interactions.push(interaction);
        }

        // Sort by efficacy score
        interactions.sort((a, b) => b.efficacyScore - a.efficacyScore);

        return {
          success: true,
          interactions,
          topDrug: interactions[0],
        };
      } catch (error) {
        console.error("[Bioinformatics] Drug interaction error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get cached variants
  getCachedVariants: protectedProcedure
    .input(z.object({ sampleId: z.string() }))
    .query(async ({ input }) => {
      try {
        const variants = await getCachedVariants(input.sampleId);
        if (!variants) {
          return {
            success: false,
            error: "No cached variants found",
          };
        }
        return {
          success: true,
          variants,
          count: variants.length,
        };
      } catch (error) {
        console.error("[Bioinformatics] Cache retrieval error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get cached structure
  getCachedStructure: protectedProcedure
    .input(z.object({ proteinId: z.string() }))
    .query(async ({ input }) => {
      try {
        const structure = await getCachedStructure(input.proteinId);
        if (!structure) {
          return {
            success: false,
            error: "No cached structure found",
          };
        }
        return {
          success: true,
          structure,
          confidence: structure.structure.confidence,
        };
      } catch (error) {
        console.error("[Bioinformatics] Cache retrieval error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
