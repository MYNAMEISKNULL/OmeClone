import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

console.log("Checking DATABASE_URL environment variable...");
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing!");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Database URL found, initializing connection pool...");
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

console.log("Drizzle ORM initializing...");
export const db = drizzle(pool, { schema });
console.log("Database module loaded successfully.");
