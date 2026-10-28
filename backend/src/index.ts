import express from "express";
import { securityHeaders, jsonBody } from "./middleware/common.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error.js";

// Vercel imports the app; local.ts owns the optional long-running listener.
const app = express();
app.disable("x-powered-by");
app.use(requestId, requestLogger, securityHeaders, jsonBody);

app.get("/v1/health", (_request, response) => {
  // Liveness only. Use db:check to verify database connectivity separately.
  response.set("Cache-Control", "no-store").json({ status: "ok", service: "sekibat-backend" });
});

app.use(notFound);
app.use(errorHandler);
export default app;
