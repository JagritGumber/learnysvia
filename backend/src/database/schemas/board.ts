import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth/user";

export const board = sqliteTable("board", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  data: text("data", { mode: "json" }), // Store tldraw snapshot data
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Board collaborators (for sharing boards with other users)
export const boardCollaborator = sqliteTable("board_collaborator", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("editor").notNull(), // editor, viewer
  addedAt: integer("added_at", { mode: "timestamp" }).defaultNow().notNull(),
});

export type InsertBoard = typeof board.$inferInsert;
export type SelectBoard = typeof board.$inferSelect;
export type InsertBoardCollaborator = typeof boardCollaborator.$inferInsert;
export type SelectBoardCollaborator = typeof boardCollaborator.$inferSelect;
