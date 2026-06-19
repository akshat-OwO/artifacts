CREATE TABLE "artifact" (
	"artifact_key" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text DEFAULT (
  ARRAY[
    'Amber Comet',
    'Brave Badger',
    'Copper Finch',
    'Dancing Otter',
    'Electric Orchid',
    'Frosted Moon',
    'Golden Sparrow',
    'Hidden Lagoon'
  ]
)[1 + floor(random() * 8)::integer] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "artifact_userId_idx" ON "artifact" ("user_id");--> statement-breakpoint
ALTER TABLE "artifact" ADD CONSTRAINT "artifact_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;