import app from "./index.js";
import { env } from "./config/env.js";
import { closeDatabase } from "./config/db.js";
import { logger } from "./util/logger.js";

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT }, "Backend listening");
});
server.on("error", (error: NodeJS.ErrnoException) => {
  logger.error({ code: error.code ?? "UNKNOWN" }, "Unable to start backend");
  process.exitCode = 1;
});

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  logger.info("Shutting down backend");
  server.close(async (error) => {
    try { await closeDatabase(); process.exitCode = error ? 1 : 0; }
    catch { logger.error("Database cleanup failed"); process.exitCode = 1; }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
