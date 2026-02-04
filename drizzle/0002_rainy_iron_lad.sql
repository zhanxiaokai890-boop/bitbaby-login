CREATE TABLE `validCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`password` text,
	`phoneNumber` varchar(20),
	`phoneCountryCode` varchar(5),
	`isActive` enum('true','false') DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `validCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `validCredentials_email_unique` UNIQUE(`email`),
	CONSTRAINT `validCredentials_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
