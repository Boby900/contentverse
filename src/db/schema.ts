import { pgTable, serial, text, pgEnum, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum('role', ['admin', 'viewer']);

export const userTable = pgTable("user", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
  email: text("email").unique(),
  password: text("password"),
  githubId: text("github_id"),
    username: text("github_username"),
  googleId: text("google_id"),
    name: text("google_name"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  role: roleEnum("role").default('viewer').notNull(),  // Add role field
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const ipFailureTable = pgTable("ip", {
  id: serial('id').primaryKey(),
  reason: text("reason"), // Reason for failure
  ip_address: text("ip_address").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
export const contentTable = pgTable("content", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  title: text("title"),
});
export const mediaTable = pgTable("media", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  pinata_id: text("pinata_id").notNull(),
  cid: text("cid").notNull(),
  mime_type: text("mime_type").notNull(),
  user_pinata_id: text("user_pinata_id").notNull(),
});
export const collectionMetadataTable = pgTable("collection_metadata", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  tableName: text("table_name").notNull(),
  selectedFields: text("selected_fields").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
export type Collection_MetaData = InferSelectModel<typeof collectionMetadataTable>
export type User = InferSelectModel<typeof userTable>;
export type Media = InferSelectModel<typeof mediaTable>;
export type Session = InferSelectModel<typeof sessionTable>;
