import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import request from "supertest";
import { AppError } from "../src/util/app-error.js";
import { errorHandler } from "../src/middleware/error.js";
import { requestId } from "../src/middleware/request-id.js";
import { createLogger } from "../src/util/logger.js";
import { parseEnv } from "../src/config/env.js";

function errorApp(failure: unknown) {
  const app = express();
  app.use(requestId);
  app.get("/failure", async () => { throw failure; });
  app.use(errorHandler);
  return app;
}

test("AppError statuses survive async Express handlers and include request ID", async () => {
  for (const error of [AppError.badRequest(), AppError.unauthorized(), AppError.forbidden(), AppError.notFound(), AppError.conflict(), AppError.validation(), AppError.tooManyRequests(), AppError.unavailable()]) {
    const response = await request(errorApp(error)).get("/failure").expect(error.statusCode);
    assert.equal(response.body.error.code, error.code);
    assert.equal(response.body.requestId, response.headers["x-request-id"]);
    assert.match(response.body.requestId, /^[a-f\d-]{36}$/);
  }
});

test("unexpected errors cannot leak messages or control the HTTP status", async () => {
  for (const error of [new Error("postgres://user:secret@database"), { status: 401, message: "secret" }, new AppError(500, "INTERNAL_ERROR", "secret")]) {
    const response = await request(errorApp(error)).get("/failure").expect(500);
    assert.equal(response.body.error.message, "Unable to complete the request.");
    assert.equal(JSON.stringify(response.body).includes("secret"), false);
    assert.equal(response.body.stack, undefined);
  }
});

test("request IDs are fresh and cannot be forged through incoming headers", async () => {
  const app = errorApp(AppError.notFound());
  const first = await request(app).get("/failure").set("X-Request-ID", "client-controlled");
  const second = await request(app).get("/failure");
  assert.notEqual(first.body.requestId, "client-controlled");
  assert.notEqual(first.body.requestId, second.body.requestId);
});

test("logger emits structured context and redacts sensitive fields", () => {
  const lines: string[] = [];
  const log = createLogger({ write: (line: string) => { lines.push(line); } });
  log.level = "info";
  log.child({ requestId: "test-request" }).info({ password: "hidden-password", DATABASE_URL: "hidden-url", headers: { authorization: "hidden-auth" }, body: { email: "hidden-email" } }, "Safe message");
  const output = JSON.parse(lines[0]);
  assert.equal(output.requestId, "test-request");
  assert.equal(output.service, "sekibat-backend");
  assert.equal(output.password, "[REDACTED]");
  assert.equal(lines[0].includes("hidden-"), false);
});

test("environment defaults and database URL validation do not expose credentials", () => {
  assert.equal(parseEnv({}).PORT, 4000);
  assert.equal(parseEnv({}).DATABASE_URL, undefined);
  assert.equal(parseEnv({ DATABASE_URL: "" }).DATABASE_URL, undefined);
  assert.equal(parseEnv({ DATABASE_URL: "postgresql://user:secret@localhost/db" }).DATABASE_POOL_MAX, 3);
  for (const input of [{ PORT: "0" }, { LOG_LEVEL: "bad" }, { DATABASE_URL: "https://user:secret@host/db" }, { DATABASE_POOL_MAX: "0" }]) {
    assert.throws(() => parseEnv(input), (error: unknown) => error instanceof Error && error.message.startsWith("Invalid environment configuration:") && !error.message.includes("secret"));
  }
});
