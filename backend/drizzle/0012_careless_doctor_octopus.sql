ALTER TABLE `room` RENAME COLUMN "expires_at" TO "duration";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "room_code_unique";--> statement-breakpoint
ALTER TABLE `room` ALTER COLUMN "duration" TO "duration" text NOT NULL DEFAULT '60m';--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `room_code_unique` ON `room` (`code`);--> statement-breakpoint
ALTER TABLE `room` ADD `status` text DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `room_participant` ADD `role` text;