import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "../auth/user";

export const room = sqliteTable("room", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
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

export const roomParticipant = sqliteTable("room_participant", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .references(() => room.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});

export const roomSettings = sqliteTable("room_settings", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .references(() => room.id)
    .notNull(),
  allowChat: integer("allow_chat", { mode: "boolean" }).default(true).notNull(),
  allowFileSharing: integer("allow_file_sharing", { mode: "boolean" })
    .default(true)
    .notNull(),
  requireApproval: integer("require_approval", { mode: "boolean" })
    .default(false)
    .notNull(),
  customSettings: text("custom_settings"),
});

export type InsertRoom = typeof room.$inferInsert;
export type SelectRoom = typeof room.$inferSelect;
export type InsertRoomParticipant = typeof roomParticipant.$inferInsert;
export type SelectRoomParticipant = typeof roomParticipant.$inferSelect;
export type InsertRoomSettings = typeof roomSettings.$inferInsert;
export type SelectRoomSettings = typeof roomSettings.$inferSelect;
