import type { Logger } from "pino";

declare global {
  // Express exposes this namespace for application-specific request context.
  namespace Express {
    interface Request {
      requestId: string;
      log: Logger;
    }
  }
}
