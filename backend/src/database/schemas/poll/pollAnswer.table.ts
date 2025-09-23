import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { poll } from "./poll.table";
import { user } from "../auth";
import { options } from "../core/option";
import { relations } from "drizzle-orm";

export const pollAnswer = sqliteTable("poll_answer", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  pollId: text("poll_id")
    .notNull()
    .references(() => poll.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  optionId: text("option_id")
    .notNull()
    .references(() => options.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export type InsertPollAnswer = typeof pollAnswer.$inferInsert;
export type SelectPollAnswer = typeof pollAnswer.$inferSelect;

export const pollAnswerRelations = relations(pollAnswer, ({ one }) => ({
  poll: one(poll, {
    fields: [pollAnswer.pollId],
    references: [poll.id],
  }),
  user: one(user, {
    fields: [pollAnswer.userId],
    references: [user.id],
  }),
}));
