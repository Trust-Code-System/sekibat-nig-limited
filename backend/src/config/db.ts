import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { env } from "./env.js";
import { logger } from "../util/logger.js";
import { AppError } from "../util/app-error.js";
import * as schema from "../db/schema.js";

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

/** Reuse one bounded pool per runtime instance. Use a provider's pooled URL in serverless. */
export function getDb() {
  if (!env.DATABASE_URL) throw AppError.unavailable();
  if (!database) {
    pool = new Pool({ connectionString: env.DATABASE_URL, max: env.DATABASE_POOL_MAX, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000, statement_timeout: 10_000, allowExitOnIdle: true });
    // TLS configuration comes from the URL/provider; never disable certificate verification here.
    pool.on("error", () => logger.error({ code: "DB_POOL_ERROR" }, "Database pool connection failed"));
    database = drizzle(pool, { schema });
  }
  return database;
}

export async function checkDatabase() {
  await getDb().execute(sql`select 1`);
}

/** For the local process shutdown/one-off scripts, not after each serverless request. */
export async function closeDatabase() {
  const current = pool;
  pool = undefined;
  database = undefined;
  await current?.end();
}
