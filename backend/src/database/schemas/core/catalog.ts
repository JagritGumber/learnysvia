import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "../auth/user";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const catalogs = sqliteTable("catalogs", {
  id: text("id")
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const selectCatalogSchema = createSelectSchema(catalogs);
export const createCatalogSchema = createInsertSchema(catalogs);
export const updateCatalogSchema = createUpdateSchema(catalogs);

export type SelectCatalog = typeof catalogs.$inferSelect;
export type InsertCatalog = typeof catalogs.$inferInsert;
