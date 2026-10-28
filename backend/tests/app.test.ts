import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import app from "../src/index.js";

test("health returns JSON with security headers and no cache", async () => {
  const response = await request(app).get("/v1/health").expect(200);
  assert.deepEqual(response.body, { status: "ok", service: "sekibat-backend" });
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-powered-by"], undefined);
});

test("unimplemented CMS endpoints are not exposed", async () => {
  const response = await request(app).post("/v1/properties").send({ title: "Example" }).expect(404);
  assert.equal(response.body.error.code, "NOT_FOUND");
});

test("malformed JSON receives a safe error without echoing input", async () => {
  const response = await request(app).post("/v1/properties").set("Content-Type", "application/json").send('{"secret":').expect(400);
  assert.equal(response.body.error.code, "INVALID_JSON");
  assert.equal(JSON.stringify(response.body).includes("secret"), false);
});

test("oversized JSON is rejected", async () => {
  const response = await request(app).post("/v1/properties").send({ value: "x".repeat(110_000) }).expect(413);
  assert.equal(response.body.error.code, "BODY_TOO_LARGE");
});
