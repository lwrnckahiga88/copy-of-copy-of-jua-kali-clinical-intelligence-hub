-- Migration: 0002_juakali_courses_neuro
-- Adds 6 new tables: courses, courseModules, userProgress, cpdPoints,
-- oncoaiPwaAssessments, neuroSyncData

-- ─── courses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `slug` varchar(128) NOT NULL UNIQUE,
  `title` varchar(256) NOT NULL,
  `description` text,
  `category` enum('techskills','oncoai','clinical') NOT NULL,
  `subcategory` varchar(128),
  `totalModules` int NOT NULL DEFAULT 0,
  `cpdPoints` int NOT NULL DEFAULT 0,
  `difficulty` enum('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'intermediate',
  `estimatedHours` int NOT NULL DEFAULT 0,
  `thumbnailUrl` text,
  `isActive` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

-- ─── courseModules ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `courseModules` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `courseId` int NOT NULL,
  `moduleIndex` int NOT NULL,
  `title` varchar(256) NOT NULL,
  `description` text,
  `contentType` enum('video','reading','quiz','simulation','lab','assessment') NOT NULL DEFAULT 'reading',
  `contentUrl` text,
  `durationMinutes` int NOT NULL DEFAULT 30,
  `cpdPoints` int NOT NULL DEFAULT 0,
  `isLocked` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- ─── userProgress ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `userProgress` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `courseId` int NOT NULL,
  `moduleId` int NOT NULL,
  `status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `score` int,
  `completedAt` timestamp,
  `timeSpentMinutes` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`moduleId`) REFERENCES `courseModules`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_module_unique` (`userId`, `moduleId`)
);

-- ─── cpdPoints ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cpdPoints` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `courseId` int,
  `moduleId` int,
  `points` int NOT NULL,
  `category` enum('techskills','oncoai','clinical','cpd_generator') NOT NULL,
  `description` text,
  `awardedAt` timestamp NOT NULL DEFAULT NOW(),
  `expiresAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- ─── oncoaiPwaAssessments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `oncoaiPwaAssessments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `sessionId` varchar(128) NOT NULL,
  `subModule` enum('imaging','pipeline','treatment') NOT NULL,
  `patientId` varchar(64),
  `imagingModality` varchar(64),
  `tumorDetected` int DEFAULT 0,
  `tumorSize` varchar(32),
  `tumorLocation` varchar(128),
  `imagingConfidence` int,
  `pipelineStage` varchar(64),
  `biomarkerStatus` text,
  `genomicProfile` text,
  `pipelineScore` int,
  `treatmentProtocol` varchar(128),
  `radiationDose` varchar(64),
  `chemotherapyRegimen` varchar(128),
  `treatmentResponse` enum('complete','partial','stable','progressive'),
  `seizureRisk` int,
  `strokeProbability` int,
  `cognitiveStatus` enum('normal','mild_impairment','moderate_impairment','severe_impairment'),
  `overallRiskScore` int,
  `notes` text,
  `assessedAt` timestamp NOT NULL DEFAULT NOW(),
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- ─── neuroSyncData ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `neuroSyncData` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `sessionId` varchar(128) NOT NULL,
  `agentId` varchar(64) NOT NULL,
  `agentName` varchar(128) NOT NULL,
  `agentType` enum('eeg_analyzer','mri_processor','seizure_predictor','stroke_detector','cognitive_assessor','treatment_optimizer','drug_interaction','neuro_monitor') NOT NULL,
  `connectionStatus` enum('connected','syncing','idle','error') NOT NULL DEFAULT 'idle',
  `dataPayload` text,
  `confidenceScore` int,
  `processingTimeMs` int,
  `alphaWave` int,
  `betaWave` int,
  `thetaWave` int,
  `deltaWave` int,
  `syncedAt` timestamp NOT NULL DEFAULT NOW(),
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
