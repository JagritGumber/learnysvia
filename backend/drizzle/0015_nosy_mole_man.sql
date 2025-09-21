PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_catalogs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_catalogs`("id", "name", "description", "user_id", "created_at", "updated_at") SELECT "id", "name", "description", "user_id", "created_at", "updated_at" FROM `catalogs`;--> statement-breakpoint
DROP TABLE `catalogs`;--> statement-breakpoint
ALTER TABLE `__new_catalogs` RENAME TO `catalogs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `room_participant` DROP COLUMN `anonymous_id`;