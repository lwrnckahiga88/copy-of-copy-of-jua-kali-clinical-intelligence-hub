import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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