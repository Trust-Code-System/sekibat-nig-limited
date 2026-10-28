import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../util/logger.js";

export const requestId: RequestHandler = (request, response, next) => {
  // Generate internally rather than trusting client IDs in logs.
  request.requestId = randomUUID();
  request.log = logger.child({ requestId: request.requestId });
  response.setHeader("X-Request-ID", request.requestId);
  next();
};
