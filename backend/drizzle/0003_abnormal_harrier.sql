CREATE TABLE `enrollment` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`student_id` text NOT NULL,
	`enrolled_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
