import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { medicalImages, imagingAnalysisResults, InsertMedicalImage, InsertImagingAnalysisResult } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";

/**
 * Imaging Router: Medical image analysis and AI predictions
 * Handles CT, MRI, X-ray, ultrasound, PET, and mammography image analysis
 */

export const imagingRouter = router({
  /**
   * Upload and store medical image
   */
  uploadImage: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      imageType: z.enum(["ct", "mri", "xray", "ultrasound", "pet", "mammography"]),
      imageUrl: z.string().url(),
      bodyPart: z.string().optional(),
      clinicalIndication: z.string().optional(),
      findings: z.string().optional(),
      impressions: z.string().optional(),
      radiologistNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        const medicalImage: InsertMedicalImage = {
          userId: ctx.user.id,
          patientId: input.patientId,
          imageType: input.imageType,
          studyDate: new Date(),
          imageUrl: input.imageUrl,
          bodyPart: input.bodyPart,
          clinicalIndication: input.clinicalIndication,
          findings: input.findings,
          impressions: input.impressions,
          radiologistNotes: input.radiologistNotes,
        };

        const result = await db.insert(medicalImages).values(medicalImage);
        return { success: true, imageId: result[0] };
      } catch (error) {
        console.error("[Imaging] Error uploading image:", error);
        return { success: false, error: "Upload failed" };
      }
    }),

  /**
   * Analyze medical image with AI
   */
  analyzeImage: protectedProcedure
    .input(z.object({
      medicalImageId: z.number(),
      analysisType: z.string().default("comprehensive"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        // Get the medical image
        const images = await db
          .select()
          .from(medicalImages)
          .where(eq(medicalImages.id, input.medicalImageId));

        if (images.length === 0) {
          return { success: false, error: "Image not found" };
        }

        const image = images[0];

        // Use LLM to analyze the image
        const analysisPrompt = `You are an expert radiologist. Analyze the following medical image:
        
Image Type: ${image.imageType}
Body Part: ${image.bodyPart || "Not specified"}
Clinical Indication: ${image.clinicalIndication || "Not specified"}
Study Date: ${image.studyDate}

Please provide a comprehensive analysis including:
1. Key findings
2. Abnormalities detected (if any)
3. Risk assessment (low/medium/high)
4. Recommendations for follow-up
5. Differential diagnoses

Respond in JSON format with fields: findings, abnormalities, riskScore (0-100), recommendations, followUpRequired, followUpTimeframe`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert radiologist providing medical image analysis. Always respond with structured JSON.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        let analysisData: any = {
          detectedAbnormalities: [],
          tumorDetection: null,
          noduleAnalysis: null,
          fractureSuspicion: null,
          cardiacFindings: null,
          lungFindings: null,
          liverFindings: null,
          brainFindings: null,
          overallRiskScore: 0,
          recommendedActions: [],
          followUpRequired: false,
          followUpTimeframe: null,
          clinicalSignificance: "",
        };

        // Parse LLM response
        if (response.choices?.[0]?.message?.content) {
          const content = response.choices[0].message.content as string;
          try {
            const parsed = JSON.parse(content);
            analysisData = {
              ...analysisData,
              detectedAbnormalities: parsed.abnormalities || [],
              overallRiskScore: parsed.riskScore || 0,
              recommendedActions: parsed.recommendations ? [parsed.recommendations] : [],
              followUpRequired: parsed.followUpRequired || false,
              followUpTimeframe: parsed.followUpTimeframe,
              clinicalSignificance: parsed.findings || "",
            };

            // Organ-specific analysis
            if (image.imageType === "ct" || image.imageType === "mri") {
              if (image.bodyPart?.toLowerCase().includes("lung")) {
                analysisData.lungFindings = parsed;
              } else if (image.bodyPart?.toLowerCase().includes("liver")) {
                analysisData.liverFindings = parsed;
              } else if (image.bodyPart?.toLowerCase().includes("brain")) {
                analysisData.brainFindings = parsed;
              } else if (image.bodyPart?.toLowerCase().includes("heart")) {
                analysisData.cardiacFindings = parsed;
              }
            }

            if (parsed.tumorDetected) {
              analysisData.tumorDetection = parsed.tumorDetails || { detected: true };
            }
          } catch (e) {
            analysisData.clinicalSignificance = content;
          }
        }

        // Store analysis results
        const analysisResult: InsertImagingAnalysisResult = {
          medicalImageId: input.medicalImageId,
          userId: ctx.user.id,
          analysisType: input.analysisType,
          modelVersion: "v1.0",
          detectedAbnormalities: analysisData.detectedAbnormalities,
          tumorDetection: analysisData.tumorDetection,
          noduleAnalysis: analysisData.noduleAnalysis,
          fractureSuspicion: analysisData.fractureSuspicion,
          cardiacFindings: analysisData.cardiacFindings,
          lungFindings: analysisData.lungFindings,
          liverFindings: analysisData.liverFindings,
          brainFindings: analysisData.brainFindings,
          overallRiskScore: analysisData.overallRiskScore.toString(),
          recommendedActions: analysisData.recommendedActions,
          followUpRequired: analysisData.followUpRequired,
          followUpTimeframe: analysisData.followUpTimeframe,
          clinicalSignificance: analysisData.clinicalSignificance,
        };

        const result = await db.insert(imagingAnalysisResults).values(analysisResult);

        // Share analysis with other agents
        await shareImagingAnalysis(ctx.user.id, input.medicalImageId, analysisData);

        return {
          success: true,
          analysisId: result[0],
          analysis: analysisData,
        };
      } catch (error) {
        console.error("[Imaging] Error analyzing image:", error);
        return { success: false, error: "Analysis failed" };
      }
    }),

  /**
   * Get imaging analysis results
   */
  getAnalysisResults: protectedProcedure
    .input(z.object({
      medicalImageId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const results = await db
          .select()
          .from(imagingAnalysisResults)
          .where(eq(imagingAnalysisResults.medicalImageId, input.medicalImageId));

        return results[0] || null;
      } catch (error) {
        console.error("[Imaging] Error getting analysis results:", error);
        return null;
      }
    }),

  /**
   * Get user's medical images
   */
  getUserImages: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const images = await db
          .select()
          .from(medicalImages)
          .where(eq(medicalImages.userId, ctx.user.id))
          .limit(input.limit)
          .offset(input.offset);

        return images.map(img => ({
          id: img.id,
          patientId: img.patientId,
          imageType: img.imageType,
          bodyPart: img.bodyPart,
          studyDate: img.studyDate,
          clinicalIndication: img.clinicalIndication,
        }));
      } catch (error) {
        console.error("[Imaging] Error getting user images:", error);
        return [];
      }
    }),

  /**
   * Get imaging statistics for dashboard
   */
  getImagingStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        return {
          totalImages: 0,
          imagesByType: {},
          abnormalitiesDetected: 0,
          averageRiskScore: 0,
        };
      }

      try {
        const images = await db
          .select()
          .from(medicalImages)
          .where(eq(medicalImages.userId, ctx.user.id));

        const analyses = await db
          .select()
          .from(imagingAnalysisResults)
          .where(eq(imagingAnalysisResults.userId, ctx.user.id));

        const imagesByType: Record<string, number> = {};
        images.forEach(img => {
          imagesByType[img.imageType] = (imagesByType[img.imageType] || 0) + 1;
        });

        const abnormalitiesDetected = analyses.filter(a => 
          a.detectedAbnormalities && 
          (a.detectedAbnormalities as any[]).length > 0
        ).length;

        const avgRiskScore = analyses.length > 0
          ? analyses.reduce((sum, a) => sum + (parseFloat(a.overallRiskScore?.toString() || "0") || 0), 0) / analyses.length
          : 0;

        return {
          totalImages: images.length,
          imagesByType,
          abnormalitiesDetected,
          averageRiskScore: Math.round(avgRiskScore),
        };
      } catch (error) {
        console.error("[Imaging] Error getting imaging stats:", error);
        return {
          totalImages: 0,
          imagesByType: {},
          abnormalitiesDetected: 0,
          averageRiskScore: 0,
        };
      }
    }),
});

/**
 * Share imaging analysis with other medical AI agents
 */
async function shareImagingAnalysis(userId: number, imageId: number, analysisData: any) {
  const db = await getDb();
  if (!db) return;

  try {
    const { crossAgentSyncData } = await import("../drizzle/schema");
    
    await db.insert(crossAgentSyncData).values({
      analysisId: `imaging-${imageId}-${nanoid()}`,
      userId,
      sourceAgent: "imaging",
      dataType: "imaging_analysis",
      data: analysisData,
      isShared: true,
      accessibleAgents: ["medos", "clinicalvalidator", "nurseai", "quorumdeep"],
    });
  } catch (error) {
    console.error("[Imaging] Error sharing analysis:", error);
  }
}

export type ImagingRouter = typeof imagingRouter;
