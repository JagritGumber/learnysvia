import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth/user";

export const school = sqliteTable("school", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  domain: text("domain"), // Optional custom domain
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  settings: text("settings", { mode: "json" }).default("{}"), // School settings like theme, features, etc.
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// School members (teachers, admins, etc.)
export const schoolMember = sqliteTable("schoolMember", {
  id: text("id").primaryKey(),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(), // owner, admin, teacher, student
  joinedAt: integer("joined_at", { mode: "timestamp" }).defaultNow().notNull(),
});

// Classes within schools (like channels in Slack)
export const schoolClass = sqliteTable("class", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id, { onDelete: "cascade" }),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  settings: text("settings", { mode: "json" }).default("{}"), // Class settings
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Class members (students enrolled in classes)
export const classMember = sqliteTable("classMember", {
  id: text("id").primaryKey(),
  classId: text("class_id")
    .notNull()
    .references(() => schoolClass.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("student").notNull(), // teacher, student
  joinedAt: integer("joined_at", { mode: "timestamp" }).defaultNow().notNull(),
});

// Messages in classes (like messages in Slack channels)
export const message = sqliteTable("message", {
  id: text("id").primaryKey(),
  classId: text("class_id")
    .notNull()
    .references(() => schoolClass.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: text("type").default("text").notNull(), // text, file, image, etc.
  metadata: text("metadata", { mode: "json" }), // Additional data like file info, etc.
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type InsertSchool = typeof school.$inferInsert;
export type SelectSchool = typeof school.$inferSelect;
export type InsertSchoolMember = typeof schoolMember.$inferInsert;
export type SelectSchoolMember = typeof schoolMember.$inferSelect;
export type InsertClass = typeof schoolClass.$inferInsert;
export type SelectClass = typeof schoolClass.$inferSelect;
export type InsertClassMember = typeof classMember.$inferInsert;
export type SelectClassMember = typeof classMember.$inferSelect;
export type InsertMessage = typeof message.$inferInsert;
export type SelectMessage = typeof message.$inferSelect;
