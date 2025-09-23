PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_poll_answer` (
	`id` text PRIMARY KEY NOT NULL,
	`poll_id` text NOT NULL,
	`user_id` text NOT NULL,
	`option_id` text,
	`status` text DEFAULT 'answered' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_poll_answer`("id", "poll_id", "user_id", "option_id", "status", "created_at", "updated_at") SELECT "id", "poll_id", "user_id", "option_id", "status", "created_at", "updated_at" FROM `poll_answer`;--> statement-breakpoint
DROP TABLE `poll_answer`;--> statement-breakpoint
ALTER TABLE `__new_poll_answer` RENAME TO `poll_answer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;