import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth/user";

export const lesson = sqliteTable("lesson", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }),
  scheduledTime: text("scheduled_time"), // HH:MM format
  duration: integer("duration").default(60), // duration in minutes
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Enrollment schema to track which students are enrolled in which lessons
export const enrollment = sqliteTable("enrollment", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  status: text("status").default("active").notNull(), // active, completed, cancelled
});

export type InsertLesson = typeof lesson.$inferInsert;
export type SelectLesson = typeof lesson.$inferSelect;
export type InsertEnrollment = typeof enrollment.$inferInsert;
export type SelectEnrollment = typeof enrollment.$inferSelect;
