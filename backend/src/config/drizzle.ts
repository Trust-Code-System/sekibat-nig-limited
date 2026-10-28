import { defineConfig } from "drizzle-kit";
import { env } from "./env.js";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(env.DATABASE_URL ? { dbCredentials: { url: env.DATABASE_URL } } : {}),
});
