PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`catalog_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_questions`("id", "title", "content", "catalog_id", "created_at", "updated_at") SELECT "id", "title", "content", "catalog_id", "created_at", "updated_at" FROM `questions`;--> statement-breakpoint
DROP TABLE `questions`;--> statement-breakpoint
ALTER TABLE `__new_questions` RENAME TO `questions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;