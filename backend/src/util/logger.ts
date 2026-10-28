import { pino, type DestinationStream } from "pino";
import { env } from "../config/env.js";

export function createLogger(stream?: DestinationStream) {
  const options = {
    level: env.LOG_LEVEL,
    base: { service: "sekibat-backend", environment: env.NODE_ENV },
    redact: {
      paths: ["password", "secret", "token", "authorization", "cookie", "databaseUrl", "DATABASE_URL", "headers.authorization", "headers.cookie", "req.headers.authorization", "req.headers.cookie", "req.body", "body", "*.password", "*.token", "*.secret"],
      censor: "[REDACTED]",
    },
  };
  return stream ? pino(options, stream) : pino(options);
}

// Structured stdout works locally and in function logs. Never pass raw request/error objects.
export const logger = createLogger();
