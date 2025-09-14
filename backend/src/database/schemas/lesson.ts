import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth/user";

export const lesson = sqliteTable("lesson", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type InsertLesson = typeof lesson.$inferInsert;
export type SelectLesson = typeof lesson.$inferSelect;
