DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "room_code_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `room_code_unique` ON `room` (`code`);--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `account` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogs` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogs` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `options` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `options` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `room_participant` ALTER COLUMN "joined_at" TO "joined_at" integer NOT NULL;