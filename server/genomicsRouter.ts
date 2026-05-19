import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  saveGenomicsMutation,
  saveProteinStructure,
  saveCancerProfile,
  shareAnalysisData,
  getSharedAnalysisData,
} from './db';
import { nanoid } from 'nanoid';
import { invokeLLM } from './_core/llm';
import {
  analyzeCancer,
  analyzeBloodDisorder,
  generateTreatmentRecommendations,
  generateClinicalSummary,
  SUPPORTED_CANCER_TYPES,
  SUPPORTED_BLOOD_DISORDERS,
  type CancerType,
  type BloodDisorderType,
} from './multiCancerAnalysis';

/**
 * Genomics Analysis Module
 * Integrates sequence analysis, genetic screening, protein folding, and pan-cancer analysis
 */

export const genomicsRouter = router({
  /**
   * Sequence Analysis: Variant calling and annotation
   */
  analyzeSequence: protectedProcedure
    .input(z.object({
      sequenceData: z.string(),
      referenceGenome: z.string().default('GRCh38'),
      analysisType: z.enum(['wgs', 'wes', 'targeted']).default('wes'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Use LLM to analyze sequence data and identify variants
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a genomics expert. Analyze the provided DNA sequence and identify potential variants, their clinical significance, and functional impact. Return a JSON object with variant information.`,
            } as any,
            {
              role: 'user',
              content: `Analyze this DNA sequence for variants (reference: ${input.referenceGenome}, analysis: ${input.analysisType}): ${input.sequenceData.substring(0, 500)}...`,
            } as any,
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'variant_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  variants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        chromosome: { type: 'string' },
                        position: { type: 'number' },
                        reference: { type: 'string' },
                        alternate: { type: 'string' },
                        variantType: { type: 'string' },
                        consequence: { type: 'string' },
                        clinicalSignificance: { type: 'string' },
                        alleleFrequency: { type: 'number' },
                      },
                      required: ['chromosome', 'position', 'reference', 'alternate', 'variantType'],
                    },
                  },
                  summary: { type: 'string' },
                },
                required: ['variants', 'summary'],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const analysisResult = JSON.parse(contentStr);

        // Save variants to database
        for (const variant of analysisResult.variants) {
          await saveGenomicsMutation({
            analysisId,
            userId: ctx.user.id,
            chromosome: variant.chromosome,
            position: variant.position,
            reference: variant.reference,
            alternate: variant.alternate,
            variantType: variant.variantType,
            consequence: variant.consequence || '',
            clinicalSignificance: variant.clinicalSignificance || '',
            alleleFrequency: variant.alleleFrequency || 0,
            metadata: { referenceGenome: input.referenceGenome },
          });
        }

        // Share analysis data with other agents
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'Sequence Analysis',
          dataType: 'variants',
          data: analysisResult,
          accessibleAgents: ['OncoAI', 'Clinical Validator', 'Genomica'],
        });

        return {
          success: true,
          analysisId,
          variantCount: analysisResult.variants.length,
          summary: analysisResult.summary,
          variants: analysisResult.variants,
        };
      } catch (error) {
        console.error('[Genomics] Sequence analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Sequence analysis failed',
        });
      }
    }),

  /**
   * Genetic Screening: Risk assessment for inherited diseases
   */
  screenGenetics: protectedProcedure
    .input(z.object({
      familyHistory: z.string(),
      ethnicity: z.string().optional(),
      screeningType: z.enum(['cancer', 'cardiovascular', 'neurological', 'metabolic']).default('cancer'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Use LLM to assess genetic risk based on family history
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a genetic counselor. Based on family history and ethnicity, assess the risk of inherited ${input.screeningType} conditions. Return a JSON object with risk assessment.`,
            } as any,
            {
              role: 'user',
              content: `Assess genetic risk for ${input.screeningType} conditions. Family history: ${input.familyHistory}${input.ethnicity ? `, Ethnicity: ${input.ethnicity}` : ''}`,
            } as any,
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'genetic_risk_assessment',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  riskLevel: { type: 'string', enum: ['low', 'moderate', 'high'] },
                  riskScore: { type: 'number' },
                  inheritedConditions: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  carrierStatus: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                  },
                  recommendations: { type: 'string' },
                },
                required: ['riskLevel', 'riskScore', 'inheritedConditions', 'recommendations'],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const screeningResult = JSON.parse(contentStr);

        // Share screening results with other agents
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'Genetic Screening',
          dataType: 'risk_assessment',
          data: screeningResult,
          accessibleAgents: ['OncoAI', 'Clinical Validator', 'CardiaX', 'NeuroX'],
        });

        return {
          success: true,
          analysisId,
          riskLevel: screeningResult.riskLevel,
          riskScore: screeningResult.riskScore,
          inheritedConditions: screeningResult.inheritedConditions,
          recommendations: screeningResult.recommendations,
        };
      } catch (error) {
        console.error('[Genomics] Genetic screening failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Genetic screening failed',
        });
      }
    }),

  /**
   * Protein Folding: 3D structure prediction and drug interaction analysis
   */
  predictProteinStructure: protectedProcedure
    .input(z.object({
      proteinSequence: z.string(),
      proteinName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Use LLM to predict protein structure and drug interactions
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a structural biologist. Predict the 3D protein structure from the amino acid sequence and identify potential drug binding sites and interactions. Return a JSON object with structure prediction.`,
            } as any,
            {
              role: 'user',
              content: `Predict 3D structure for protein "${input.proteinName}" with sequence: ${input.proteinSequence.substring(0, 200)}...`,
            } as any,
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'protein_structure_prediction',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  confidenceScore: { type: 'number' },
                  predictedFunction: { type: 'string' },
                  bindingSites: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        site: { type: 'string' },
                        function: { type: 'string' },
                      },
                    },
                  },
                  drugInteractions: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  therapeuticTargets: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['confidenceScore', 'predictedFunction', 'bindingSites'],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const structureResult = JSON.parse(contentStr);

        // Save protein structure
        await saveProteinStructure({
          analysisId,
          userId: ctx.user.id,
          proteinId: input.proteinName,
          sequence: input.proteinSequence,
          confidenceScore: structureResult.confidenceScore,
          predictedFunction: structureResult.predictedFunction,
          drugInteractions: structureResult.drugInteractions || [],
          metadata: {
            bindingSites: structureResult.bindingSites || [],
            therapeuticTargets: structureResult.therapeuticTargets || [],
          },
        });

        // Share with other agents
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'Protein Folding',
          dataType: 'protein_structure',
          data: structureResult,
          accessibleAgents: ['OncoAI', 'Drug Discovery', 'Molecular Design'],
        });

        return {
          success: true,
          analysisId,
          proteinName: input.proteinName,
          confidenceScore: structureResult.confidenceScore,
          predictedFunction: structureResult.predictedFunction,
          bindingSites: structureResult.bindingSites || [],
          drugInteractions: structureResult.drugInteractions || [],
          therapeuticTargets: structureResult.therapeuticTargets || [],
        };
      } catch (error) {
        console.error('[Genomics] Protein folding failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Protein folding prediction failed',
        });
      }
    }),

  /**
   * Pan-Cancer Analysis: Cross-cancer mutation analysis
   */
  analyzePanCancer: protectedProcedure
    .input(z.object({
      cancerType: z.string(),
      mutations: z.array(z.string()),
      stage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Use LLM to analyze cancer mutations across cancer types
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are an oncology AI expert. Analyze mutations in the context of pan-cancer genomics. Identify shared mutations across cancer types, prognosis, and treatment recommendations. Return a JSON object with cancer analysis.`,
            } as any,
            {
              role: 'user',
              content: `Analyze ${input.cancerType} cancer (stage: ${input.stage || 'unknown'}) with mutations: ${input.mutations.join(', ')}. Provide pan-cancer context and treatment recommendations.`,
            } as any,
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'pan_cancer_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  tumorMutationalBurden: { type: 'number' },
                  riskScore: { type: 'number' },
                  prognosis: { type: 'string' },
                  sharedMutations: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  biomarkers: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  treatmentRecommendations: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['tumorMutationalBurden', 'riskScore', 'prognosis', 'treatmentRecommendations'],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const cancerAnalysis = JSON.parse(contentStr);

        // Save cancer profile
        await saveCancerProfile({
          analysisId,
          userId: ctx.user.id,
          cancerType: input.cancerType,
          stage: input.stage,
          tumorMutationalBurden: cancerAnalysis.tumorMutationalBurden,
          mutationCount: input.mutations.length,
          riskScore: cancerAnalysis.riskScore,
          prognosis: cancerAnalysis.prognosis,
          treatmentRecommendations: cancerAnalysis.treatmentRecommendations,
          biomarkers: cancerAnalysis.biomarkers || [],
        });

        // Share with all agents for integrated analysis
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'Pan-Cancer Analysis',
          dataType: 'cancer_profile',
          data: cancerAnalysis,
          accessibleAgents: ['OncoAI', 'Clinical Validator', 'Medos', 'NurseAI', 'Genomica'],
        });

        return {
          success: true,
          analysisId,
          tumorMutationalBurden: cancerAnalysis.tumorMutationalBurden,
          riskScore: cancerAnalysis.riskScore,
          prognosis: cancerAnalysis.prognosis,
          sharedMutations: cancerAnalysis.sharedMutations || [],
          biomarkers: cancerAnalysis.biomarkers || [],
          treatmentRecommendations: cancerAnalysis.treatmentRecommendations,
        };
      } catch (error) {
        console.error('[Genomics] Pan-cancer analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Pan-cancer analysis failed',
        });
      }
    }),

  /**
   * Multi-Cancer Analysis: Comprehensive biomarker analysis for all cancer types
   */
  analyzeMultiCancer: protectedProcedure
    .input(z.object({
      cancerType: z.enum(SUPPORTED_CANCER_TYPES as [CancerType, ...CancerType[]]),
      biomarkers: z.array(z.string()),
      stage: z.enum(['I', 'II', 'III', 'IV']),
      grade: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Analyze cancer with biomarker profile
        const cancerProfile = await analyzeCancer(
          input.cancerType,
          input.biomarkers,
          input.stage,
          input.grade
        );

        // Generate treatment recommendations
        const treatments = await generateTreatmentRecommendations(cancerProfile);

        // Generate clinical summary
        const clinicalSummary = await generateClinicalSummary(cancerProfile, treatments);

        // Save cancer profile to database
        await saveCancerProfile({
          userId: ctx.user.id,
          analysisId,
          cancerType: input.cancerType,
          stage: input.stage,
          tumorMutationalBurden: cancerProfile.mutationBurden,
          prognosis: `Stage ${input.stage}, Grade ${input.grade}`,
          biomarkers: JSON.stringify(cancerProfile.biomarkers),
          metadata: {
            immuneInfiltration: cancerProfile.immuneInfiltration,
            estimatedSurvival: cancerProfile.estimatedSurvival,
          },
        });

        // Share results with other agents
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'genomica',
          dataType: 'cancer_profile',
          data: {
            cancerType: input.cancerType,
            stage: input.stage,
            biomarkers: cancerProfile.biomarkers.map(b => b.gene),
            treatments: treatments.map(t => t.treatmentName),
            survival: cancerProfile.estimatedSurvival,
          },
          accessibleAgents: ['medos', 'clinicalvalidator', 'nurseai', 'quorumdee', 'kemci'],
        });

        return {
          success: true,
          analysisId,
          cancerProfile,
          treatments,
          clinicalSummary,
          sharedAgents: ['medos', 'clinicalvalidator', 'nurseai', 'quorumdee', 'kemci'],
        };
      } catch (error) {
        console.error('[Genomics] Multi-cancer analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Multi-cancer analysis failed',
        });
      }
    }),

  /**
   * Blood Disorder Analysis: Comprehensive analysis for hematologic disorders
   */
  analyzeBloodDisorder: protectedProcedure
    .input(z.object({
      disorderType: z.enum(SUPPORTED_BLOOD_DISORDERS as [BloodDisorderType, ...BloodDisorderType[]]),
      geneticMutations: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysisId = nanoid();

        // Analyze blood disorder
        const disorderProfile = await analyzeBloodDisorder(
          input.disorderType,
          input.geneticMutations
        );

        // Generate clinical recommendations using LLM
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a hematology expert. Generate clinical recommendations for a blood disorder patient.`,
            } as any,
            {
              role: 'user',
              content: `Generate recommendations for: ${input.disorderType}\nSeverity: ${disorderProfile.severity}\nBleeding Risk: ${disorderProfile.bleedingRiskScore}\nThrombosis Risk: ${disorderProfile.thrombosisRiskScore}`,
            } as any,
          ],
        });

        const recommendations = typeof response.choices[0]?.message.content === 'string'
          ? response.choices[0].message.content
          : 'Unable to generate recommendations';

        // Share results with other agents
        await shareAnalysisData({
          analysisId,
          userId: ctx.user.id,
          sourceAgent: 'genomica',
          dataType: 'risk_assessment',
          data: {
            disorderType: input.disorderType,
            severity: disorderProfile.severity,
            bleedingRisk: disorderProfile.bleedingRiskScore,
            thrombosisRisk: disorderProfile.thrombosisRiskScore,
            managementStrategy: disorderProfile.managementStrategy,
          },
          accessibleAgents: ['medos', 'nurseai', 'clinicalvalidator'],
        });

        return {
          success: true,
          analysisId,
          disorderProfile,
          recommendations,
          sharedAgents: ['medos', 'nurseai', 'clinicalvalidator'],
        };
      } catch (error) {
        console.error('[Genomics] Blood disorder analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Blood disorder analysis failed',
        });
      }
    }),

  /**
   * Get supported cancer types
   */
  getSupportedCancerTypes: protectedProcedure
    .query(() => {
      return {
        cancerTypes: SUPPORTED_CANCER_TYPES,
        count: SUPPORTED_CANCER_TYPES.length,
      };
    }),

  /**
   * Get supported blood disorders
   */
  getSupportedBloodDisorders: protectedProcedure
    .query(() => {
      return {
        bloodDisorders: SUPPORTED_BLOOD_DISORDERS,
        count: SUPPORTED_BLOOD_DISORDERS.length,
      };
    }),

  /**
   * Get shared analysis data from other agents
   */
  getSharedData: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sharedData = await getSharedAnalysisData(ctx.user.id, input.analysisId);
        return {
          success: true,
          data: sharedData,
        };
      } catch (error) {
        console.error('[Genomics] Get shared data failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve shared analysis data',
        });
      }
    }),
});

export type GenomicsRouter = typeof genomicsRouter;
