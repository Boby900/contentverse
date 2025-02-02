CREATE TYPE "public"."role" AS ENUM('admin', 'viewer');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'viewer' NOT NULL;