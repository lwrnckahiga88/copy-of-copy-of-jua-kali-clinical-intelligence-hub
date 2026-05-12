import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clinical data tables for Jua Kali platform
export const clinicalAlerts = mysqlTable("clinicalAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  severity: mysqlEnum("severity", ["LOW", "MODERATE", "HIGH", "CRITICAL"]).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  resolved: int("resolved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClinicalAlert = typeof clinicalAlerts.$inferSelect;
export type InsertClinicalAlert = typeof clinicalAlerts.$inferInsert;

export const creditLedger = mysqlTable("creditLedger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  costPerRun: int("costPerRun").notNull(),
  agentType: varchar("agentType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditLedger = typeof creditLedger.$inferSelect;
export type InsertCreditLedger = typeof creditLedger.$inferInsert;

export const patientRecords = mysqlTable("patientRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: varchar("patientId", { length: 64 }).notNull(),
  name: text("name"),
  age: int("age"),
  medicalHistory: text("medicalHistory"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PatientRecord = typeof patientRecords.$inferSelect;
export type InsertPatientRecord = typeof patientRecords.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 1: courses
// Stores all course definitions across TechSkills Campus, OncoAI, and Clinical tabs
// ─────────────────────────────────────────────────────────────────────────────
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "techskills",
    "oncoai",
    "clinical",
  ]).notNull(),
  subcategory: varchar("subcategory", { length: 128 }),
  totalModules: int("totalModules").default(0).notNull(),
  cpdPoints: int("cpdPoints").default(0).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced", "expert"]).default("intermediate").notNull(),
  estimatedHours: int("estimatedHours").default(0).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 2: courseModules
// Individual learning modules within each course
// ─────────────────────────────────────────────────────────────────────────────
export const courseModules = mysqlTable("courseModules", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  moduleIndex: int("moduleIndex").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", ["video", "reading", "quiz", "simulation", "lab", "assessment"]).default("reading").notNull(),
  contentUrl: text("contentUrl"),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  cpdPoints: int("cpdPoints").default(0).notNull(),
  isLocked: int("isLocked").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = typeof courseModules.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 3: userProgress
// Tracks per-user completion state for each module
// ─────────────────────────────────────────────────────────────────────────────
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  moduleId: int("moduleId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  score: int("score"),
  completedAt: timestamp("completedAt"),
  timeSpentMinutes: int("timeSpentMinutes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 4: cpdPoints
// Continuing Professional Development point ledger per user
// ─────────────────────────────────────────────────────────────────────────────
export const cpdPoints = mysqlTable("cpdPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId"),
  moduleId: int("moduleId"),
  points: int("points").notNull(),
  category: mysqlEnum("category", [
    "techskills",
    "oncoai",
    "clinical",
    "cpd_generator",
  ]).notNull(),
  description: text("description"),
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CpdPoint = typeof cpdPoints.$inferSelect;
export type InsertCpdPoint = typeof cpdPoints.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 5: oncoaiPwaAssessments
// OncoAI PWA v3 assessment results for Imaging, Pipeline, and Treatment sub-modules
// ─────────────────────────────────────────────────────────────────────────────
export const oncoaiPwaAssessments = mysqlTable("oncoaiPwaAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  subModule: mysqlEnum("subModule", ["imaging", "pipeline", "treatment"]).notNull(),
  patientId: varchar("patientId", { length: 64 }),
  // Imaging sub-module fields
  imagingModality: varchar("imagingModality", { length: 64 }),
  tumorDetected: int("tumorDetected").default(0),
  tumorSize: varchar("tumorSize", { length: 32 }),
  tumorLocation: varchar("tumorLocation", { length: 128 }),
  imagingConfidence: int("imagingConfidence"),
  // Pipeline sub-module fields
  pipelineStage: varchar("pipelineStage", { length: 64 }),
  biomarkerStatus: text("biomarkerStatus"),
  genomicProfile: text("genomicProfile"),
  pipelineScore: int("pipelineScore"),
  // Treatment sub-module fields
  treatmentProtocol: varchar("treatmentProtocol", { length: 128 }),
  radiationDose: varchar("radiationDose", { length: 64 }),
  chemotherapyRegimen: varchar("chemotherapyRegimen", { length: 128 }),
  treatmentResponse: mysqlEnum("treatmentResponse", ["complete", "partial", "stable", "progressive"]),
  // Shared risk scores
  seizureRisk: int("seizureRisk"),
  strokeProbability: int("strokeProbability"),
  cognitiveStatus: mysqlEnum("cognitiveStatus", ["normal", "mild_impairment", "moderate_impairment", "severe_impairment"]),
  overallRiskScore: int("overallRiskScore"),
  notes: text("notes"),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OncoaiPwaAssessment = typeof oncoaiPwaAssessments.$inferSelect;
export type InsertOncoaiPwaAssessment = typeof oncoaiPwaAssessments.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// NEW TABLE 6: neuroSyncData
// Multi-agent Neuro-Sync Intelligence panel aggregated data
// ─────────────────────────────────────────────────────────────────────────────
export const neuroSyncData = mysqlTable("neuroSyncData", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  agentName: varchar("agentName", { length: 128 }).notNull(),
  agentType: mysqlEnum("agentType", [
    "eeg_analyzer",
    "mri_processor",
    "seizure_predictor",
    "stroke_detector",
    "cognitive_assessor",
    "treatment_optimizer",
    "drug_interaction",
    "neuro_monitor",
  ]).notNull(),
  connectionStatus: mysqlEnum("connectionStatus", ["connected", "syncing", "idle", "error"]).default("idle").notNull(),
  dataPayload: text("dataPayload"),
  confidenceScore: int("confidenceScore"),
  processingTimeMs: int("processingTimeMs"),
  alphaWave: int("alphaWave"),
  betaWave: int("betaWave"),
  thetaWave: int("thetaWave"),
  deltaWave: int("deltaWave"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NeuroSyncData = typeof neuroSyncData.$inferSelect;
export type InsertNeuroSyncData = typeof neuroSyncData.$inferInsert;
