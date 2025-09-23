import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { questions, room } from "../core";
import { relations } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

export const poll = sqliteTable("poll", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  roomId: text("room_id")
    .notNull()
    .references(() => room.id),
  timeLimit: integer("time_limit").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export const pollRelations = relations(poll, ({ one }) => ({
  question: one(questions, {
    fields: [poll.questionId],
    references: [questions.id],
  }),
  room: one(room, {
    fields: [poll.roomId],
    references: [room.id],
  }),
}));

export type InsertPoll = typeof poll.$inferInsert;
export type SelectPoll = typeof poll.$inferSelect;

export const selectPollSchema = createSelectSchema(poll);
