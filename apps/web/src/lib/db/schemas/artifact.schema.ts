import { defineRelations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

const ARTIFACT_NAMES = [
  "Amber Comet",
  "Brave Badger",
  "Copper Finch",
  "Dancing Otter",
  "Electric Orchid",
  "Frosted Moon",
  "Golden Sparrow",
  "Hidden Lagoon",
] as const;

const randomArtifactName = () =>
  ARTIFACT_NAMES[Math.floor(Math.random() * ARTIFACT_NAMES.length)] as string;

export const artifact = sqliteTable(
  "artifact",
  {
    artifactKey: text("artifact_key").notNull().unique(),
    artifactSizeBytes: integer("artifact_size_bytes").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    isPublic: integer("is_public", { mode: "boolean" })
      .default(false)
      .notNull(),
    name: text("name").$defaultFn(randomArtifactName).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
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
