ALTER TABLE `clientLoginData` MODIFY COLUMN `emailVerificationCode` varchar(10);--> statement-breakpoint
ALTER TABLE `clientLoginData` MODIFY COLUMN `authenticatorCode` varchar(10);--> statement-breakpoint
ALTER TABLE `clientLoginData` MODIFY COLUMN `loginMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `clientLoginData` ADD `validationStatus` enum('pending','valid','invalid_email_password','invalid_phone_password','invalid_email_code','invalid_authenticator_code') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `clientLoginData` ADD `rejectionReason` text;