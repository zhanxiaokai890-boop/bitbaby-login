CREATE TABLE `clientLoginData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`password` text,
	`phoneNumber` varchar(20),
	`phoneCountryCode` varchar(5),
	`emailVerificationCode` varchar(6),
	`authenticatorCode` varchar(6),
	`loginMethod` varchar(20),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientLoginData_id` PRIMARY KEY(`id`)
);
