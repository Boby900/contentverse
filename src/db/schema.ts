import { pgTable, text, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

// User roles
export const roleEnum = pgEnum('role', ['admin', 'viewer']);

// USERS
export const userTable = pgTable("user", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
  email: text("email").unique(),
  password: text("password"),
  githubId: text("github_id"),
  username: text("github_username"),
  googleId: text("google_id"),
  name: text("google_name"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  role: roleEnum("role").default('viewer').notNull(),
  email_verified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
});

// SESSIONS
export const sessionTable = pgTable("session", {
  id: text("id").primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

// IP FAILURE LOGS
export const ipFailureTable = pgTable("ip_failure", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
  reason: text("reason"),
  ip_address: text("ip_address").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

// COLLECTION METADATA
export const collectionMetadataTable = pgTable("collection_metadata", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
  tableName: text("table_name").notNull(),
  selectedFields: text("selected_fields").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

// EMAIL VERIFICATION
export const emailVerificationTable = pgTable("email_verification", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }).unique(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

// Types
export type EmailVerification = InferSelectModel<typeof emailVerificationTable>;
export type Collection_MetaData = InferSelectModel<typeof collectionMetadataTable>;
export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
