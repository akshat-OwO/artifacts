import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: the Cloudflare plugin rejects the
// `resolve.external` that vitest injects into the `ssr` environment, and the
// tests here don't need the Workers runtime.
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: { environment: "jsdom" },
});
