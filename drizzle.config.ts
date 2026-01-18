import { defineConfig } from "drizzle-kit";

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn("TURSO_URL or TURSO_AUTH_TOKEN missing for drizzle-kit. Using local fallback.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
