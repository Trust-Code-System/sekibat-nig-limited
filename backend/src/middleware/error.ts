import type { ErrorRequestHandler } from "express";
import { AppError } from "../util/app-error.js";
import { logger } from "../util/logger.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) return next(error);
  let failure = error instanceof AppError ? error : AppError.internal();
  const type = typeof error === "object" && error !== null && "type" in error ? error.type : undefined;
  if (!(error instanceof AppError)) {
    if (type === "entity.parse.failed") failure = new AppError(400, "INVALID_JSON", "Request body must be valid JSON.");
    else if (type === "entity.too.large") failure = new AppError(413, "BODY_TOO_LARGE", "Request body exceeds the size limit.");
    else if (type === "encoding.unsupported" || type === "charset.unsupported") failure = new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Unsupported request encoding.");
  }
  const log = request.log ?? logger;
  if (failure.statusCode >= 500) log.error({ code: failure.code }, "Request failed");
  response.set("Cache-Control", "no-store").status(failure.statusCode).json({
    error: {
      code: failure.code,
      // Never expose internal messages, even for an explicitly constructed 5xx AppError.
      message: failure.statusCode >= 500 ? (failure.statusCode === 503 ? "Service temporarily unavailable." : "Unable to complete the request.") : failure.message,
    },
    requestId: request.requestId,
  });
};
