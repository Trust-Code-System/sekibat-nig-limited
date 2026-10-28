import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Resolves backend/.env from either src/config or dist/config; never loads the frontend's secrets.
try { loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url))); }
catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Unable to load backend/.env."); }

const postgresUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "postgres:" || protocol === "postgresql:";
}, "Use a PostgreSQL connection URL.");
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().trim().min(1).default("127.0.0.1"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.preprocess((value) => value === "" ? undefined : value, postgresUrl.optional()),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(3),
});

export function parseEnv(input: Record<string, string | undefined>) {
  const result = schema.safeParse(input);
  if (!result.success) {
    // Report field names only; Zod messages/input could contain connection credentials.
    throw new Error(`Invalid environment configuration: ${[...new Set(result.error.issues.map((issue) => issue.path.join(".")))].join(", ")}`);
  }
  return result.data;
}
export const env = parseEnv(process.env);
