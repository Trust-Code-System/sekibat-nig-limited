import { checkDatabase, closeDatabase } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { logger } from "../src/util/logger.js";

try {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  await checkDatabase();
  logger.info("Database connection verified");
} catch {
  logger.error({ code: env.DATABASE_URL ? "DB_CONNECTION_FAILED" : "DB_NOT_CONFIGURED" }, "Database check failed. Check DATABASE_URL, network access and provider TLS settings.");
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
