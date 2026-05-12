CREATE TABLE `clinicalAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`severity` enum('LOW','MODERATE','HIGH','CRITICAL') NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`resolved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinicalAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`costPerRun` int NOT NULL,
	`agentType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patientId` varchar(64) NOT NULL,
	`name` text,
	`age` int,
	`medicalHistory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientRecords_id` PRIMARY KEY(`id`)
);
