import { defineConfig } from "drizzle-kit";

if (!Bun.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dbCredentials: {
    url: Bun.env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "src/lib/db/migrations",
  schema: "src/lib/db/schemas/index.ts",
});
