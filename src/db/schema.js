import { pgTable, serial, text } from 'drizzle-orm/pg-core';
export const usersTable = pgTable('users_table', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
});
// export type InsertUser = typeof usersTable.$inferInsert;
// export type SelectUser = typeof usersTable.$inferSelect;