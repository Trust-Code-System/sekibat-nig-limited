import type { RequestHandler } from "express";
import { performance } from "node:perf_hooks";

export const requestLogger: RequestHandler = (request, response, next) => {
  const start = performance.now();
  let logged = false;
  const complete = (aborted: boolean) => {
    if (logged) return;
    logged = true;
    // Route pattern, not URL/query/body: URLs may contain personal data or tokens.
    const fields = { method: request.method, route: request.route?.path ?? "unmatched", statusCode: response.statusCode, durationMs: Math.round(performance.now() - start), aborted };
    if (aborted || response.statusCode >= 500) request.log.error(fields, "Request completed");
    else if (response.statusCode >= 400) request.log.warn(fields, "Request completed");
    else request.log.info(fields, "Request completed");
  };
  response.once("finish", () => complete(false));
  response.once("close", () => complete(!response.writableFinished));
  next();
};
