import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbUrl = process.env.TURSO_DATABASE_URL || "libsql://dummy.turso.io";
const dbToken = process.env.TURSO_AUTH_TOKEN || "dummy-token";

const client = createClient({
  url: dbUrl,
  authToken: dbToken,
});

export const db = drizzle(client, { schema });

