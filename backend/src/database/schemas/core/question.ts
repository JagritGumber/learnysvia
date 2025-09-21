import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { catalogs } from "./catalog";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export const questions = sqliteTable("questions", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  catalogId: text("catalog_id")
    .references(() => catalogs.id)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export const createQuestionSchema = createInsertSchema(questions);
export const updateQuestionSchema = createUpdateSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions, {
  id: z.string(),
  title: z.string(),
  content: z.string(),
  catalogId: z.string(),
});
