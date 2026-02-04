CREATE TABLE `pageViewStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageType` varchar(50) NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pageViewStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `pageViewStats_pageType_unique` UNIQUE(`pageType`)
);
