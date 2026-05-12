import { relations } from "drizzle-orm";
import {
  users,
  clinicalAlerts,
  creditLedger,
  patientRecords,
  courses,
  courseModules,
  userProgress,
  cpdPoints,
  oncoaiPwaAssessments,
  neuroSyncData,
} from "./schema";

// Users → ClinicalAlerts
export const usersRelations = relations(users, ({ many }) => ({
  clinicalAlerts: many(clinicalAlerts),
  creditLedger: many(creditLedger),
  patientRecords: many(patientRecords),
  userProgress: many(userProgress),
  cpdPoints: many(cpdPoints),
  oncoaiPwaAssessments: many(oncoaiPwaAssessments),
  neuroSyncData: many(neuroSyncData),
}));

// Courses → CourseModules
export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(courseModules),
  userProgress: many(userProgress),
  cpdPoints: many(cpdPoints),
}));

// CourseModules → Course
export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  userProgress: many(userProgress),
}));

// UserProgress → User + Course + Module
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userProgress.courseId],
    references: [courses.id],
  }),
  module: one(courseModules, {
    fields: [userProgress.moduleId],
    references: [courseModules.id],
  }),
}));

// CpdPoints → User + Course + Module
export const cpdPointsRelations = relations(cpdPoints, ({ one }) => ({
  user: one(users, {
    fields: [cpdPoints.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [cpdPoints.courseId],
    references: [courses.id],
  }),
  module: one(courseModules, {
    fields: [cpdPoints.moduleId],
    references: [courseModules.id],
  }),
}));

// OncoAI Assessments → User
export const oncoaiPwaAssessmentsRelations = relations(oncoaiPwaAssessments, ({ one }) => ({
  user: one(users, {
    fields: [oncoaiPwaAssessments.userId],
    references: [users.id],
  }),
}));

// NeuroSync Data → User
export const neuroSyncDataRelations = relations(neuroSyncData, ({ one }) => ({
  user: one(users, {
    fields: [neuroSyncData.userId],
    references: [users.id],
  }),
}));
