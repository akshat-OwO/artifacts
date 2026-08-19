import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "src/lib/db/migrations",
  schema: "src/lib/db/schemas/index.ts",
});
