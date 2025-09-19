ALTER TABLE `room_participant` RENAME COLUMN "joined_at" TO "created_at";--> statement-breakpoint
DROP TABLE `room_settings`;--> statement-breakpoint
ALTER TABLE `room_participant` ADD `anonymous_id` text;--> statement-breakpoint
ALTER TABLE `room_participant` ADD `participant_type` text DEFAULT 'authenticated' NOT NULL;--> statement-breakpoint
ALTER TABLE `room_participant` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `room` DROP COLUMN `allow_anonymous`;