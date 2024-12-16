ALTER TABLE "user" ADD COLUMN "github_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");