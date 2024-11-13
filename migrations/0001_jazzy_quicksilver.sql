CREATE TABLE IF NOT EXISTS "content" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content" ADD CONSTRAINT "content_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
