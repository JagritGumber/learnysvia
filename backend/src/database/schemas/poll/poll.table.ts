import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { questions, room } from "../core";
import { relations } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

import type { PollResults } from "@/shared/types/poll";

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
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  // Store participant count at poll creation for consistent statistics
  totalParticipantsAtCreation: integer(
    "total_participants_at_creation"
  ).notNull(),
  // Store final results as JSON when poll completes
  finalResults: text("final_results", { mode: "json" }).$type<PollResults[]>(),
  // Track if poll is completed
  isCompleted: integer("is_completed", { mode: "boolean" })
    .notNull()
    .default(false),
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
