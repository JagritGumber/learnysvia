import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "../auth/user";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const room = sqliteTable("room", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  code: text("code").notNull().unique(),
  name: text("name").$type<string>().notNull(),
  description: text("description").$type<string>(),
  createdBy: text("created_by")
    .references(() => user.id)
    .notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).default(true).notNull(),
  maxParticipants: integer("max_participants").default(50),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const updateRoomSchema = createUpdateSchema(room);
export const createRoomSchema = createInsertSchema(room);
export const getRoomSchema = createSelectSchema(room);

export const roomParticipant = sqliteTable("room_participant", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  roomId: text("room_id")
    .references(() => room.id)
    .notNull(),
  userId: text("user_id").references(() => user.id),
  anonymousId: text("anonymous_id"),
  displayName: text("display_name"),
  participantType: text("participant_type", {
    enum: ["authenticated", "anonymous"],
  })
    .notNull()
    .default("authenticated"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});

export type InsertRoom = typeof room.$inferInsert;
export type SelectRoom = typeof room.$inferSelect;
export type InsertRoomParticipant = typeof roomParticipant.$inferInsert;
export type SelectRoomParticipant = typeof roomParticipant.$inferSelect;
