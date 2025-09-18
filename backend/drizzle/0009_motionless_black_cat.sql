CREATE TABLE `room` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`max_participants` integer DEFAULT 50,
	`allow_anonymous` integer DEFAULT true NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_code_unique` ON `room` (`code`);--> statement-breakpoint
CREATE TABLE `room_participant` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text,
	`display_name` text,
	`role` text DEFAULT 'participant' NOT NULL,
	`joined_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`allow_chat` integer DEFAULT true NOT NULL,
	`allow_file_sharing` integer DEFAULT true NOT NULL,
	`require_approval` integer DEFAULT false NOT NULL,
	`custom_settings` text,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
