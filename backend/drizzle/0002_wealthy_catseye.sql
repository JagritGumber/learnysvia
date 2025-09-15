ALTER TABLE `lesson` ADD `scheduled_date` integer;--> statement-breakpoint
ALTER TABLE `lesson` ADD `scheduled_time` text;--> statement-breakpoint
ALTER TABLE `lesson` ADD `duration` integer DEFAULT 60;