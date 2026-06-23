import { defineRelations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

const randomArtifactName = sql<string>`(
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
)[1 + floor(random() * 8)::integer]`;

export const DEFAULT_ARTIFACT_PREVIEW_KEY = "preview/preview-fallback.png";

export const artifact = pgTable(
  "artifact",
  {
    artifactKey: text("artifact_key").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    isPublic: boolean("is_public").default(false).notNull(),
    name: text("name").default(randomArtifactName).notNull(),
    previewKey: text("preview_key")
      .default(DEFAULT_ARTIFACT_PREVIEW_KEY)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("artifact_userId_idx").on(table.userId)]
);

const artifactSchema = { artifact, user };

export const artifactRelations = defineRelations(artifactSchema, (r) => ({
  artifact: {
    user: r.one.user({
      from: r.artifact.userId,
      to: r.user.id,
    }),
  },
  user: {
    artifacts: r.many.artifact(),
  },
}));
