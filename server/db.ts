import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";

console.log("Checking database configuration for Turso...");

const tursoUrl = process.env.TURSO_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.warn("TURSO_URL is missing. Falling back to local SQLite file:local.db");
}

const client = createClient({
  url: tursoUrl || "file:local.db",
  authToken: tursoAuthToken,
});

export const db = drizzle(client, { schema });
console.log("Database initialized with Turso/libSQL.");
