import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { catalogs } from "./catalog";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { relations } from "drizzle-orm";
import { options } from "./option";

export const questions = sqliteTable("questions", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  text: text("title").notNull(),
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

export type SelectQuestion = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const questionRelations = relations(questions, ({ many }) => ({
  options: many(options),
}));

export const createQuestionSchema = createInsertSchema(questions);
export const updateQuestionSchema = createUpdateSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions, {
  id: z.string(),
  text: z.string(),
  catalogId: z.string(),
});
