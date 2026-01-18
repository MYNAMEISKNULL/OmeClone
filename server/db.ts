import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";

console.log("Checking database configuration...");

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn("TURSO_URL or TURSO_AUTH_TOKEN missing. Using local SQLite if available.");
}

const client = createClient({
  url: process.env.TURSO_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
console.log("Database initialized with Turso/libSQL.");
