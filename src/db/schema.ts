import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),  // TODO: use randomevalues from crypto if possible, instead of generic numbers.
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


export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
