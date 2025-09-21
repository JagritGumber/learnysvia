import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { room } from "./room";
import { user } from "../auth";
import { createSelectSchema } from "drizzle-zod";

export const roomParticipant = sqliteTable("room_participant", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  roomId: text("room_id")
    .references(() => room.id)
    .notNull(),
  userId: text("user_id").references(() => user.id),
  wsId: text("ws_id"),
  displayName: text("display_name"),
  participantType: text("participant_type", {
    enum: ["authenticated", "anonymous"],
  })
    .notNull()
    .default("authenticated"),
  role: text("role", { enum: ["host", "co_host", "participant"] }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});

export const selectRoomParticipantSchema = createSelectSchema(roomParticipant);

export type InsertRoomParticipant = typeof roomParticipant.$inferInsert;
export type SelectRoomParticipant = typeof roomParticipant.$inferSelect;
