CREATE TABLE `verificationSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientLoginDataId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`status` enum('pending','email_code_requested','email_code_submitted','auth_code_requested','auth_code_submitted','verified','rejected') NOT NULL DEFAULT 'pending',
	`emailCode` varchar(6),
	`authCode` varchar(6),
	`emailCodeAttempts` int NOT NULL DEFAULT 0,
	`authCodeAttempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `verificationSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `verificationSessions_sessionId_unique` UNIQUE(`sessionId`)
);
