ALTER TABLE `poll` ADD `total_participants_at_creation` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `poll` ADD `final_results` text;--> statement-breakpoint
ALTER TABLE `poll` ADD `is_completed` integer DEFAULT false NOT NULL;