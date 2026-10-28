/** Only these deliberate errors may supply public error codes/messages. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message = "Invalid request.") { return new AppError(400, "BAD_REQUEST", message); }
  static unauthorized(message = "Authentication required.") { return new AppError(401, "UNAUTHORIZED", message); }
  static forbidden(message = "Access denied.") { return new AppError(403, "FORBIDDEN", message); }
  static notFound(message = "Resource not found.") { return new AppError(404, "NOT_FOUND", message); }
  static conflict(message = "This record has changed. Reload and try again.") { return new AppError(409, "CONFLICT", message); }
  static validation(message = "Please check the submitted fields.") { return new AppError(422, "VALIDATION_ERROR", message); }
  static tooManyRequests(message = "Too many requests. Try again later.") { return new AppError(429, "TOO_MANY_REQUESTS", message); }
  static unavailable() { return new AppError(503, "SERVICE_UNAVAILABLE", "Service temporarily unavailable."); }
  static internal() { return new AppError(500, "INTERNAL_ERROR", "Unable to complete the request."); }
}
