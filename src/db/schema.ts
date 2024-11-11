import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),     // For identifying users
  password: text("password").notNull(),         // For storing hashed passwords
  createdAt: timestamp("created_at", {         // Optional: track account creation time
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
export const contentTable = pgTable("content", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  title: text("title") 
});
//TODO:
//implement some logic in the logout handler, ref => auth.ts
//learn more about middleware
//test the auth in backend only using Postman.
//learn about headers in the request.

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
