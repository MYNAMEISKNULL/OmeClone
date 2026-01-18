import { createClient } from "@libsql/client";
const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
try {
  const rs = await client.execute("SELECT 1");
  console.log("SUCCESS: Connection verified");
} catch (e) {
  console.log("FAIL: " + e.message);
}
