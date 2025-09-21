import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { questions } from "./question";
import { relations } from "drizzle-orm";

export const options = sqliteTable("options", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  text: text("text").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" })
    .default(false)
    .notNull(),
  questionId: text("question_id")
    .references(() => questions.id)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const optionRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

export type SelectOption = typeof options.$inferSelect;
export type InsertOption = typeof options.$inferInsert;
