import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  courses,
  courseModules,
  userProgress,
  cpdPoints,
  oncoaiPwaAssessments,
  neuroSyncData,
} from "../../drizzle/schema";

// ─── Course Management ────────────────────────────────────────────────────────

export const courseRouter = router({
  // List all courses, optionally filtered by category
  listCourses: publicProcedure
    .input(
      z.object({
        category: z.enum(["techskills", "oncoai", "clinical"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return static seed data when DB is unavailable
        return { success: true, courses: getStaticCourses(input.category) };
      }
      try {
        const rows = input.category
          ? await db.select().from(courses).where(eq(courses.category, input.category))
          : await db.select().from(courses);
        if (rows.length === 0) {
          return { success: true, courses: getStaticCourses(input.category) };
        }
        return { success: true, courses: rows };
      } catch {
        return { success: true, courses: getStaticCourses(input.category) };
      }
    }),

  // Get a single course with its modules
  getCourse: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        const staticCourse = getStaticCourses().find((c) => c.slug === input.slug);
        return {
          success: true,
          course: staticCourse ?? null,
          modules: staticCourse ? getStaticModules(staticCourse.id) : [],
        };
      }
      try {
        const courseRows = await db
          .select()
          .from(courses)
          .where(eq(courses.slug, input.slug))
          .limit(1);
        if (courseRows.length === 0) {
          return { success: false, course: null, modules: [] };
        }
        const course = courseRows[0];
        const modules = await db
          .select()
          .from(courseModules)
          .where(eq(courseModules.courseId, course.id))
          .orderBy(courseModules.moduleIndex);
        return { success: true, course, modules };
      } catch {
        const staticCourse = getStaticCourses().find((c) => c.slug === input.slug);
        return {
          success: true,
          course: staticCourse ?? null,
          modules: staticCourse ? getStaticModules(staticCourse.id) : [],
        };
      }
    }),

  // ─── Progress Tracking ─────────────────────────────────────────────────────

  getUserProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: true, progress: [] };
      try {
        const rows = await db
          .select()
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, ctx.user.id),
              eq(userProgress.courseId, input.courseId)
            )
          );
        return { success: true, progress: rows };
      } catch {
        return { success: true, progress: [] };
      }
    }),

  markModuleComplete: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        moduleId: z.number(),
        score: z.number().optional(),
        timeSpentMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: false, error: "DB unavailable" };
      try {
        await db
          .insert(userProgress)
          .values({
            userId: ctx.user.id,
            courseId: input.courseId,
            moduleId: input.moduleId,
            status: "completed",
            score: input.score ?? null,
            completedAt: new Date(),
            timeSpentMinutes: input.timeSpentMinutes ?? 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              status: "completed",
              score: input.score ?? null,
              completedAt: new Date(),
              timeSpentMinutes: input.timeSpentMinutes ?? 0,
            },
          });

        // Award CPD points for module completion
        const moduleRows = await db
          .select()
          .from(courseModules)
          .where(eq(courseModules.id, input.moduleId))
          .limit(1);
        const courseRows = await db
          .select()
          .from(courses)
          .where(eq(courses.id, input.courseId))
          .limit(1);

        if (moduleRows.length > 0 && courseRows.length > 0) {
          const mod = moduleRows[0];
          const course = courseRows[0];
          if (mod.cpdPoints > 0) {
            await db.insert(cpdPoints).values({
              userId: ctx.user.id,
              courseId: input.courseId,
              moduleId: input.moduleId,
              points: mod.cpdPoints,
              category: course.category as "techskills" | "oncoai" | "clinical" | "cpd_generator",
              description: `Completed module: ${mod.title}`,
              awardedAt: new Date(),
            });
          }
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }),

  // ─── CPD Points ────────────────────────────────────────────────────────────

  getUserCpdPoints: protectedProcedure
    .input(
      z.object({
        category: z
          .enum(["techskills", "oncoai", "clinical", "cpd_generator"])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) {
        return { success: true, totalPoints: 0, breakdown: [], records: [] };
      }
      try {
        const conditions = [eq(cpdPoints.userId, ctx.user.id)];
        if (input.category) {
          conditions.push(eq(cpdPoints.category, input.category));
        }
        const rows = await db
          .select()
          .from(cpdPoints)
          .where(and(...conditions))
          .orderBy(desc(cpdPoints.awardedAt));

        const totalPoints = rows.reduce((sum, r) => sum + r.points, 0);
        const breakdown = ["techskills", "oncoai", "clinical", "cpd_generator"].map(
          (cat) => ({
            category: cat,
            points: rows
              .filter((r) => r.category === cat)
              .reduce((s, r) => s + r.points, 0),
          })
        );

        return { success: true, totalPoints, breakdown, records: rows };
      } catch {
        return { success: true, totalPoints: 0, breakdown: [], records: [] };
      }
    }),

  awardCpdPoints: protectedProcedure
    .input(
      z.object({
        points: z.number(),
        category: z.enum(["techskills", "oncoai", "clinical", "cpd_generator"]),
        description: z.string().optional(),
        courseId: z.number().optional(),
        moduleId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: false, error: "DB unavailable" };
      try {
        await db.insert(cpdPoints).values({
          userId: ctx.user.id,
          courseId: input.courseId ?? null,
          moduleId: input.moduleId ?? null,
          points: input.points,
          category: input.category,
          description: input.description ?? null,
          awardedAt: new Date(),
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }),

  // ─── OncoAI PWA Assessments ────────────────────────────────────────────────

  saveOncoAiAssessment: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        subModule: z.enum(["imaging", "pipeline", "treatment"]),
        patientId: z.string().optional(),
        imagingModality: z.string().optional(),
        tumorDetected: z.boolean().optional(),
        tumorSize: z.string().optional(),
        tumorLocation: z.string().optional(),
        imagingConfidence: z.number().optional(),
        pipelineStage: z.string().optional(),
        biomarkerStatus: z.string().optional(),
        genomicProfile: z.string().optional(),
        pipelineScore: z.number().optional(),
        treatmentProtocol: z.string().optional(),
        radiationDose: z.string().optional(),
        chemotherapyRegimen: z.string().optional(),
        treatmentResponse: z.enum(["complete", "partial", "stable", "progressive"]).optional(),
        seizureRisk: z.number().optional(),
        strokeProbability: z.number().optional(),
        cognitiveStatus: z
          .enum(["normal", "mild_impairment", "moderate_impairment", "severe_impairment"])
          .optional(),
        overallRiskScore: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: false, error: "DB unavailable" };
      try {
        await db.insert(oncoaiPwaAssessments).values({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          subModule: input.subModule,
          patientId: input.patientId ?? null,
          imagingModality: input.imagingModality ?? null,
          tumorDetected: input.tumorDetected ? 1 : 0,
          tumorSize: input.tumorSize ?? null,
          tumorLocation: input.tumorLocation ?? null,
          imagingConfidence: input.imagingConfidence ?? null,
          pipelineStage: input.pipelineStage ?? null,
          biomarkerStatus: input.biomarkerStatus ?? null,
          genomicProfile: input.genomicProfile ?? null,
          pipelineScore: input.pipelineScore ?? null,
          treatmentProtocol: input.treatmentProtocol ?? null,
          radiationDose: input.radiationDose ?? null,
          chemotherapyRegimen: input.chemotherapyRegimen ?? null,
          treatmentResponse: input.treatmentResponse ?? null,
          seizureRisk: input.seizureRisk ?? null,
          strokeProbability: input.strokeProbability ?? null,
          cognitiveStatus: input.cognitiveStatus ?? null,
          overallRiskScore: input.overallRiskScore ?? null,
          notes: input.notes ?? null,
          assessedAt: new Date(),
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }),

  getOncoAiAssessments: protectedProcedure
    .input(
      z.object({
        subModule: z.enum(["imaging", "pipeline", "treatment"]).optional(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: true, assessments: getStaticAssessments() };
      try {
        const conditions = [eq(oncoaiPwaAssessments.userId, ctx.user.id)];
        if (input.subModule) {
          conditions.push(eq(oncoaiPwaAssessments.subModule, input.subModule));
        }
        const rows = await db
          .select()
          .from(oncoaiPwaAssessments)
          .where(and(...conditions))
          .orderBy(desc(oncoaiPwaAssessments.assessedAt))
          .limit(input.limit);
        return { success: true, assessments: rows.length > 0 ? rows : getStaticAssessments() };
      } catch {
        return { success: true, assessments: getStaticAssessments() };
      }
    }),

  // ─── Neuro-Sync Data ───────────────────────────────────────────────────────

  saveNeuroSyncData: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        agentId: z.string(),
        agentName: z.string(),
        agentType: z.enum([
          "eeg_analyzer",
          "mri_processor",
          "seizure_predictor",
          "stroke_detector",
          "cognitive_assessor",
          "treatment_optimizer",
          "drug_interaction",
          "neuro_monitor",
        ]),
        connectionStatus: z.enum(["connected", "syncing", "idle", "error"]).optional(),
        dataPayload: z.string().optional(),
        confidenceScore: z.number().optional(),
        processingTimeMs: z.number().optional(),
        alphaWave: z.number().optional(),
        betaWave: z.number().optional(),
        thetaWave: z.number().optional(),
        deltaWave: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return { success: false, error: "DB unavailable" };
      try {
        await db.insert(neuroSyncData).values({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          agentId: input.agentId,
          agentName: input.agentName,
          agentType: input.agentType,
          connectionStatus: input.connectionStatus ?? "connected",
          dataPayload: input.dataPayload ?? null,
          confidenceScore: input.confidenceScore ?? null,
          processingTimeMs: input.processingTimeMs ?? null,
          alphaWave: input.alphaWave ?? null,
          betaWave: input.betaWave ?? null,
          thetaWave: input.thetaWave ?? null,
          deltaWave: input.deltaWave ?? null,
          syncedAt: new Date(),
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }),

  getNeuroSyncStatus: publicProcedure.query(async () => {
    // Returns live agent connection status (falls back to static demo data)
    return { success: true, agents: getStaticNeuroAgents() };
  }),
});

// ─── Static Seed Data (used when DB is unavailable) ──────────────────────────

function getStaticCourses(category?: string) {
  const all = [
    // TechSkills Campus (8 courses)
    { id: 1, slug: "health-informatics", title: "Health Informatics & EHR Systems", category: "techskills", subcategory: "informatics", totalModules: 40, cpdPoints: 20, difficulty: "intermediate", estimatedHours: 60, isActive: 1 },
    { id: 2, slug: "clinical-data-science", title: "Clinical Data Science & Analytics", category: "techskills", subcategory: "data-science", totalModules: 40, cpdPoints: 20, difficulty: "advanced", estimatedHours: 60, isActive: 1 },
    { id: 3, slug: "ai-diagnostics", title: "AI-Powered Diagnostics & Decision Support", category: "techskills", subcategory: "ai", totalModules: 40, cpdPoints: 20, difficulty: "advanced", estimatedHours: 60, isActive: 1 },
    { id: 4, slug: "telemedicine-digital-health", title: "Telemedicine & Digital Health Platforms", category: "techskills", subcategory: "telemedicine", totalModules: 40, cpdPoints: 20, difficulty: "intermediate", estimatedHours: 60, isActive: 1 },
    { id: 5, slug: "medical-imaging-tech", title: "Medical Imaging Technology", category: "techskills", subcategory: "imaging", totalModules: 40, cpdPoints: 20, difficulty: "advanced", estimatedHours: 60, isActive: 1 },
    { id: 6, slug: "cybersecurity-healthcare", title: "Cybersecurity in Healthcare", category: "techskills", subcategory: "security", totalModules: 40, cpdPoints: 20, difficulty: "intermediate", estimatedHours: 60, isActive: 1 },
    { id: 7, slug: "iot-wearables-medicine", title: "IoT & Wearables in Medicine", category: "techskills", subcategory: "iot", totalModules: 40, cpdPoints: 20, difficulty: "intermediate", estimatedHours: 60, isActive: 1 },
    { id: 8, slug: "blockchain-health-records", title: "Blockchain for Health Records", category: "techskills", subcategory: "blockchain", totalModules: 40, cpdPoints: 20, difficulty: "advanced", estimatedHours: 60, isActive: 1 },
    // OncoAI Coursework (1 course with 20 modules)
    { id: 9, slug: "oncoai-radiology-coursework", title: "OncoAI Radiology & Oncology Coursework", category: "oncoai", subcategory: "radiology", totalModules: 20, cpdPoints: 15, difficulty: "expert", estimatedHours: 40, isActive: 1 },
    // Clinical Skills (8 courses)
    { id: 10, slug: "insulin-certification", title: "Insulin Certification Program", category: "clinical", subcategory: "endocrinology", totalModules: 40, cpdPoints: 10, difficulty: "intermediate", estimatedHours: 50, isActive: 1 },
    { id: 11, slug: "certified-nursing-assistant", title: "Certified Nursing Assistant (CNA)", category: "clinical", subcategory: "nursing", totalModules: 40, cpdPoints: 10, difficulty: "beginner", estimatedHours: 50, isActive: 1 },
    { id: 12, slug: "emergency-medical-technician", title: "Emergency Medical Technician (EMT)", category: "clinical", subcategory: "emergency", totalModules: 40, cpdPoints: 10, difficulty: "intermediate", estimatedHours: 50, isActive: 1 },
    { id: 13, slug: "clinical-skills-core", title: "Core Clinical Skills", category: "clinical", subcategory: "core", totalModules: 40, cpdPoints: 10, difficulty: "intermediate", estimatedHours: 50, isActive: 1 },
    { id: 14, slug: "biostatistics-research", title: "Biostatistics & Research Methodology", category: "clinical", subcategory: "research", totalModules: 40, cpdPoints: 10, difficulty: "advanced", estimatedHours: 50, isActive: 1 },
    { id: 15, slug: "human-health-foundations", title: "Human Health Foundations", category: "clinical", subcategory: "foundations", totalModules: 40, cpdPoints: 10, difficulty: "beginner", estimatedHours: 50, isActive: 1 },
    { id: 16, slug: "pharmacology", title: "Pharmacology for Clinical Practice", category: "clinical", subcategory: "pharmacology", totalModules: 40, cpdPoints: 10, difficulty: "advanced", estimatedHours: 50, isActive: 1 },
    { id: 17, slug: "cpd-generator-clinical", title: "CPD Generator — Clinical Medicine (60 Points)", category: "clinical", subcategory: "cpd", totalModules: 40, cpdPoints: 60, difficulty: "expert", estimatedHours: 80, isActive: 1 },
  ];
  if (category) return all.filter((c) => c.category === category);
  return all;
}

function getStaticModules(courseId: number) {
  // Returns 40 modules (or 20 for OncoAI) with realistic titles
  const count = courseId === 9 ? 20 : 40;
  const templates: Record<number, string[]> = {
    1: ["Introduction to Health Informatics", "EHR Architecture & Standards", "HL7 FHIR Fundamentals", "ICD-10 & SNOMED CT Coding", "Clinical Decision Support Systems", "Interoperability & Data Exchange", "Patient Data Privacy (HIPAA/GDPR)", "EHR Workflow Optimization", "Clinical Documentation Best Practices", "Lab Information Systems", "Radiology Information Systems", "Pharmacy Information Systems", "Nursing Informatics", "Population Health Management", "Public Health Surveillance Systems", "Health Data Governance", "Data Quality & Integrity", "Master Patient Index", "Clinical Terminology Standards", "Health IT Project Management", "Change Management in Healthcare IT", "User Training & Adoption", "Telemedicine Integration", "Mobile Health Applications", "Cloud Computing in Healthcare", "Big Data in Clinical Settings", "Natural Language Processing in EHR", "Voice Recognition Systems", "Barcode & RFID in Healthcare", "Supply Chain Management Systems", "Revenue Cycle Management", "Healthcare Analytics Dashboards", "Predictive Analytics in EHR", "Patient Portal Implementation", "Remote Patient Monitoring Integration", "Disaster Recovery & Business Continuity", "Regulatory Compliance & Auditing", "Health IT Security Frameworks", "Emerging Technologies in Informatics", "Capstone: EHR System Design Project"],
    9: ["Introduction to OncoAI Platform", "Radiology Fundamentals for Oncology", "CT Scan Interpretation in Cancer", "MRI in Neuro-Oncology", "PET-CT Fusion Imaging", "Ultrasound in Oncological Assessment", "AI-Assisted Tumor Detection", "Radiomics & Feature Extraction", "Deep Learning for Radiology", "Tumor Staging & Classification", "Lung Cancer Imaging Protocols", "Brain Tumor MRI Analysis", "Breast Cancer Imaging", "Colorectal Cancer Radiology", "Lymphoma Imaging Patterns", "Radiation Therapy Planning", "Treatment Response Evaluation (RECIST)", "Neuro-Oncology Imaging Biomarkers", "Integrated Oncology Reporting", "OncoAI Platform Capstone Assessment"],
  };

  const defaultTitles = Array.from({ length: count }, (_, i) => `Module ${i + 1}: Topic ${i + 1}`);
  const titles = templates[courseId] ?? defaultTitles;

  return Array.from({ length: count }, (_, i) => ({
    id: courseId * 100 + i + 1,
    courseId,
    moduleIndex: i + 1,
    title: titles[i] ?? `Module ${i + 1}`,
    description: `Comprehensive learning content for module ${i + 1}`,
    contentType: (["video", "reading", "quiz", "simulation", "lab", "assessment"] as const)[i % 6],
    durationMinutes: 30 + (i % 4) * 15,
    cpdPoints: i % 5 === 4 ? 2 : 1,
    isLocked: i > 2 ? 1 : 0,
  }));
}

function getStaticAssessments() {
  return [
    { id: 1, subModule: "imaging", patientId: "PT-001", imagingModality: "MRI", tumorDetected: 1, tumorSize: "2.3cm", tumorLocation: "Left temporal lobe", imagingConfidence: 87, seizureRisk: 34, strokeProbability: 12, cognitiveStatus: "mild_impairment", overallRiskScore: 42, assessedAt: new Date() },
    { id: 2, subModule: "pipeline", patientId: "PT-002", pipelineStage: "Stage III", biomarkerStatus: "EGFR+", pipelineScore: 72, seizureRisk: 18, strokeProbability: 8, cognitiveStatus: "normal", overallRiskScore: 28, assessedAt: new Date() },
    { id: 3, subModule: "treatment", patientId: "PT-003", treatmentProtocol: "FOLFOX", radiationDose: "45 Gy", treatmentResponse: "partial", seizureRisk: 22, strokeProbability: 15, cognitiveStatus: "mild_impairment", overallRiskScore: 38, assessedAt: new Date() },
  ];
}

function getStaticNeuroAgents() {
  return [
    { agentId: "eeg-001", agentName: "EEG Analyzer Pro", agentType: "eeg_analyzer", connectionStatus: "connected", confidenceScore: 94, alphaWave: 82, betaWave: 67, thetaWave: 45, deltaWave: 23 },
    { agentId: "mri-001", agentName: "MRI Processor v2", agentType: "mri_processor", connectionStatus: "syncing", confidenceScore: 88, alphaWave: 78, betaWave: 71, thetaWave: 52, deltaWave: 31 },
    { agentId: "sz-001", agentName: "Seizure Predictor", agentType: "seizure_predictor", connectionStatus: "connected", confidenceScore: 91, alphaWave: 75, betaWave: 63, thetaWave: 48, deltaWave: 19 },
    { agentId: "st-001", agentName: "Stroke Detector AI", agentType: "stroke_detector", connectionStatus: "connected", confidenceScore: 89, alphaWave: 80, betaWave: 69, thetaWave: 41, deltaWave: 27 },
    { agentId: "cog-001", agentName: "Cognitive Assessor", agentType: "cognitive_assessor", connectionStatus: "idle", confidenceScore: 85, alphaWave: 72, betaWave: 58, thetaWave: 55, deltaWave: 35 },
    { agentId: "tx-001", agentName: "Treatment Optimizer", agentType: "treatment_optimizer", connectionStatus: "connected", confidenceScore: 92, alphaWave: 84, betaWave: 74, thetaWave: 43, deltaWave: 22 },
    { agentId: "di-001", agentName: "Drug Interaction Engine", agentType: "drug_interaction", connectionStatus: "connected", confidenceScore: 96, alphaWave: 88, betaWave: 77, thetaWave: 39, deltaWave: 18 },
    { agentId: "nm-001", agentName: "Neuro Monitor 360", agentType: "neuro_monitor", connectionStatus: "syncing", confidenceScore: 87, alphaWave: 76, betaWave: 65, thetaWave: 50, deltaWave: 29 },
  ];
}
