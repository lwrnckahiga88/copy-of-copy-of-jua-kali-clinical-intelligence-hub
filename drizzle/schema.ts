import { mysqlTable, serial, varchar, text, timestamp, int, decimal, boolean, json, datetime, float } from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// --- Core User & Auth ---
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  openId: varchar('open_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  loginMethod: varchar('login_method', { length: 50 }),
  role: varchar('role', { length: 50 }).default('user'),
  lastSignedIn: timestamp('last_signed_in').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// --- Credits & Usage ---
export const credits = mysqlTable('credits', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  balance: int('balance').default(100).notNull(),
  totalEarned: int('total_earned').default(100).notNull(),
  totalSpent: int('total_spent').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const agentUsageLog = mysqlTable('agent_usage_log', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  agentId: varchar('agent_id', { length: 255 }).notNull(),
  agentName: varchar('agent_name', { length: 255 }).notNull(),
  creditsCost: int('credits_cost').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Payments ---
export const paymentTransactions = mysqlTable('payment_transactions', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  transactionId: varchar('transaction_id', { length: 255 }).unique().notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  credits: int('credits').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, completed, failed, cancelled
  mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 255 }),
  mpesaResultCode: varchar('mpesa_result_code', { length: 50 }),
  mpesaResultDesc: text('mpesa_result_desc'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// --- Genomics ---
export const genomicsMutations = mysqlTable('genomics_mutations', {
  id: serial('id').primaryKey(),
  analysisId: varchar('analysis_id', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  chromosome: varchar('chromosome', { length: 50 }).notNull(),
  position: int('position').notNull(),
  reference: varchar('reference', { length: 255 }).notNull(),
  alternate: varchar('alternate', { length: 255 }).notNull(),
  variantType: varchar('variant_type', { length: 64 }).notNull(),
  consequence: varchar('consequence', { length: 255 }),
  clinicalSignificance: varchar('clinical_significance', { length: 128 }),
  alleleFrequency: float('allele_frequency'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const proteinStructures = mysqlTable('protein_structures', {
  id: serial('id').primaryKey(),
  analysisId: varchar('analysis_id', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  proteinId: varchar('protein_id', { length: 255 }).notNull(),
  sequence: text('sequence').notNull(),
  pdbStructure: text('pdb_structure'),
  confidenceScore: float('confidence_score'),
  predictedFunction: text('predicted_function'),
  drugInteractions: json('drug_interactions'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cancerProfiles = mysqlTable('cancer_profiles', {
  id: serial('id').primaryKey(),
  analysisId: varchar('analysis_id', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  cancerType: varchar('cancer_type', { length: 128 }).notNull(),
  stage: varchar('stage', { length: 32 }),
  tumorMutationalBurden: float('tumor_mutational_burden'),
  mutationCount: int('mutation_count'),
  riskScore: float('risk_score'),
  prognosis: text('prognosis'),
  treatmentRecommendations: json('treatment_recommendations'),
  biomarkers: json('biomarkers'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const geneticScreeningResults = mysqlTable('genetic_screening_results', {
  id: serial('id').primaryKey(),
  analysisId: varchar('analysis_id', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  screeningType: varchar('screening_type', { length: 128 }),
  result: text('result'),
  riskLevel: varchar('risk_level', { length: 32 }),
  recommendations: json('recommendations'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Imaging ---
export const medicalImages = mysqlTable('medical_images', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  imageUrl: text('image_url').notNull(),
  modality: varchar('modality', { length: 50 }), // MRI, CT, X-Ray, etc.
  bodyPart: varchar('body_part', { length: 100 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type InsertMedicalImage = typeof medicalImages.$inferInsert;

export const imagingAnalysisResults = mysqlTable('imaging_analysis_results', {
  id: serial('id').primaryKey(),
  imageId: int('image_id').notNull(),
  userId: int('user_id').notNull(),
  findings: text('findings').notNull(),
  diagnosis: text('diagnosis'),
  confidenceScore: float('confidence_score'),
  aiModel: varchar('ai_model', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type InsertImagingAnalysisResult = typeof imagingAnalysisResults.$inferInsert;

// --- Clinical Grid & Dispatch ---
export const ambulances = mysqlTable('ambulances', {
  id: serial('id').primaryKey(),
  plateNumber: varchar('plate_number', { length: 50 }).unique().notNull(),
  status: varchar('status', { length: 50 }).default('available'), // available, busy, maintenance
  currentLocation: varchar('current_location', { length: 255 }),
  type: varchar('type', { length: 50 }), // Basic, Advanced, ICU
  lastMaintenance: datetime('last_maintenance'),
});

export const hospitals = mysqlTable('hospitals', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  capacity: int('capacity'),
  availableBeds: int('available_beds'),
  specialties: json('specialties'),
  contactNumber: varchar('contact_number', { length: 20 }),
});

export const dispatchRecords = mysqlTable('dispatch_records', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  ambulanceId: int('ambulance_id'),
  hospitalId: int('hospital_id'),
  patientName: varchar('patient_name', { length: 255 }),
  condition: text('condition').notNull(),
  priority: varchar('priority', { length: 50 }), // Low, Medium, High, Critical
  status: varchar('status', { length: 50 }).default('pending'), // pending, dispatched, arrived, completed
  pickupLocation: varchar('pickup_location', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export type InsertDispatchRecord = typeof dispatchRecords.$inferInsert;

// --- Cross-Agent Sync & Analytics ---
export const crossAgentSyncData = mysqlTable('cross_agent_sync_data', {
  id: serial('id').primaryKey(),
  analysisId: varchar('analysis_id', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  sourceAgent: varchar('source_agent', { length: 128 }).notNull(),
  dataType: varchar('data_type', { length: 128 }).notNull(),
  data: json('data'),
  isShared: boolean('is_shared').default(false),
  accessibleAgents: text('accessible_agents'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const analyticsAggregates = mysqlTable('analytics_aggregates', {
  id: serial('id').primaryKey(),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  metricValue: float('metric_value'),
  dimensions: json('dimensions'),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  createdAt: timestamp('created_at').defaultNow(),
});
