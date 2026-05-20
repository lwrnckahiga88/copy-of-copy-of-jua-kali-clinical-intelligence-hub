import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  float,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id:            int("id").autoincrement().primaryKey(),
  openId:        varchar("open_id", { length: 255 }).notNull().unique(),
  name:          varchar("name", { length: 255 }),
  email:         varchar("email", { length: 255 }),
  loginMethod:   varchar("login_method", { length: 64 }),
  role:          varchar("role", { length: 64 }).default("user"),
  plan:          varchar("plan", { length: 64 }).default("free"),
  lastSignedIn:  timestamp("last_signed_in"),
  createdAt:     timestamp("created_at").defaultNow(),
  updatedAt:     timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// ─── Credits ──────────────────────────────────────────────────────────────────

export const credits = mysqlTable("credits", {
  id:           int("id").autoincrement().primaryKey(),
  userId:       int("user_id").notNull(),
  balance:      int("balance").notNull().default(0),
  totalEarned:  int("total_earned").notNull().default(0),
  totalSpent:   int("total_spent").notNull().default(0),
  createdAt:    timestamp("created_at").defaultNow(),
  updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ─── Agent Usage Log ──────────────────────────────────────────────────────────

export const agentUsageLog = mysqlTable("agent_usage_log", {
  id:          int("id").autoincrement().primaryKey(),
  userId:      int("user_id").notNull(),
  agentId:     varchar("agent_id", { length: 255 }).notNull(),
  agentName:   varchar("agent_name", { length: 255 }).notNull(),
  creditsCost: int("credits_cost").notNull().default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ─── Payment Transactions ─────────────────────────────────────────────────────

export const paymentTransactions = mysqlTable("payment_transactions", {
  id:                  int("id").autoincrement().primaryKey(),
  userId:              int("user_id").notNull(),
  transactionId:       varchar("transaction_id", { length: 255 }).notNull().unique(),
  phoneNumber:         varchar("phone_number", { length: 20 }).notNull(),
  amount:              decimal("amount", { precision: 10, scale: 2 }).notNull(),
  credits:             int("credits").notNull(),
  status:              varchar("status", { length: 32 }).notNull().default("pending"),
  mpesaReceiptNumber:  varchar("mpesa_receipt_number", { length: 255 }),
  mpesaResultCode:     varchar("mpesa_result_code", { length: 32 }),
  mpesaResultDesc:     text("mpesa_result_desc"),
  completedAt:         timestamp("completed_at"),
  createdAt:           timestamp("created_at").defaultNow(),
  updatedAt:           timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ─── Genomics Mutations ───────────────────────────────────────────────────────

export const genomicsMutations = mysqlTable("genomics_mutations", {
  id:                   int("id").autoincrement().primaryKey(),
  analysisId:           varchar("analysis_id", { length: 255 }).notNull(),
  userId:               int("user_id").notNull(),
  chromosome:           varchar("chromosome", { length: 10 }).notNull(),
  position:             int("position").notNull(),
  reference:            varchar("reference", { length: 255 }).notNull(),
  alternate:            varchar("alternate", { length: 255 }).notNull(),
  variantType:          varchar("variant_type", { length: 64 }).notNull(),
  consequence:          varchar("consequence", { length: 255 }),
  clinicalSignificance: varchar("clinical_significance", { length: 128 }),
  alleleFrequency:      float("allele_frequency"),
  metadata:             json("metadata"),
  createdAt:            timestamp("created_at").defaultNow(),
});

// ─── Protein Structures ───────────────────────────────────────────────────────

export const proteinStructures = mysqlTable("protein_structures", {
  id:                int("id").autoincrement().primaryKey(),
  analysisId:        varchar("analysis_id", { length: 255 }).notNull(),
  userId:            int("user_id").notNull(),
  proteinId:         varchar("protein_id", { length: 255 }).notNull(),
  sequence:          text("sequence").notNull(),
  pdbStructure:      text("pdb_structure"),
  confidenceScore:   float("confidence_score"),
  predictedFunction: text("predicted_function"),
  drugInteractions:  json("drug_interactions"),
  metadata:          json("metadata"),
  createdAt:         timestamp("created_at").defaultNow(),
});

// ─── Cancer Profiles ──────────────────────────────────────────────────────────

export const cancerProfiles = mysqlTable("cancer_profiles", {
  id:                        int("id").autoincrement().primaryKey(),
  analysisId:                varchar("analysis_id", { length: 255 }).notNull(),
  userId:                    int("user_id").notNull(),
  cancerType:                varchar("cancer_type", { length: 128 }).notNull(),
  stage:                     varchar("stage", { length: 32 }),
  tumorMutationalBurden:     float("tumor_mutational_burden"),
  mutationCount:             int("mutation_count"),
  riskScore:                 float("risk_score"),
  prognosis:                 text("prognosis"),
  treatmentRecommendations:  json("treatment_recommendations"),
  biomarkers:                json("biomarkers"),
  metadata:                  json("metadata"),
  createdAt:                 timestamp("created_at").defaultNow(),
});

// ─── Genetic Screening Results ────────────────────────────────────────────────

export const geneticScreeningResults = mysqlTable("genetic_screening_results", {
  id:              int("id").autoincrement().primaryKey(),
  analysisId:      varchar("analysis_id", { length: 255 }).notNull(),
  userId:          int("user_id").notNull(),
  screeningType:   varchar("screening_type", { length: 128 }),
  result:          text("result"),
  riskLevel:       varchar("risk_level", { length: 32 }),
  recommendations: json("recommendations"),
  metadata:        json("metadata"),
  createdAt:       timestamp("created_at").defaultNow(),
});

// ─── Cross-Agent Sync Data ────────────────────────────────────────────────────

export const crossAgentSyncData = mysqlTable("cross_agent_sync_data", {
  id:               int("id").autoincrement().primaryKey(),
  analysisId:       varchar("analysis_id", { length: 255 }).notNull(),
  userId:           int("user_id").notNull(),
  sourceAgent:      varchar("source_agent", { length: 128 }).notNull(),
  dataType:         varchar("data_type", { length: 128 }).notNull(),
  data:             json("data"),
  isShared:         boolean("is_shared").default(false),
  accessibleAgents: text("accessible_agents"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ─── Analytics Aggregates ─────────────────────────────────────────────────────

export const analyticsAggregates = mysqlTable("analytics_aggregates", {
  id:          int("id").autoincrement().primaryKey(),
  metricName:  varchar("metric_name", { length: 255 }).notNull(),
  metricValue: float("metric_value"),
  dimensions:  json("dimensions"),
  periodStart: timestamp("period_start"),
  periodEnd:   timestamp("period_end"),
  createdAt:   timestamp("created_at").defaultNow(),
});
