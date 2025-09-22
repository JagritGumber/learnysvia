import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { poll } from "./poll.table";
import { relations } from "drizzle-orm";

export const pollAnswer = sqliteTable("poll_answer", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  pollId: text("poll_id")
    .notNull()
    .references(() => poll.id),
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

export const pollRelations = relations(pollAnswer, ({ one }) => ({
  poll: one(poll, {
    fields: [pollAnswer.pollId],
    references: [poll.id],
  }),
}));
