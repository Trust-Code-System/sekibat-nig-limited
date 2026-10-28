# Sekibat Express backend

TypeScript / Express 5 scaffold. Runs as a local Node server or an exported Express application on Vercel. It currently exposes only `GET /v1/health`; this checks process liveness, not database readiness.

## Local development

From the repository root:

```sh
pnpm install
cp -n backend/.env.example backend/.env
# On a fresh checkout, replace the password placeholders in backend/.env.
pnpm --filter @sekibat/backend db:up
pnpm --filter @sekibat/backend db:check
pnpm --filter @sekibat/backend dev
```

Visit http://127.0.0.1:4000/v1/health. The Next.js site still runs separately with `pnpm dev` on port 3000. `src/config/env.ts` loads and validates `backend/.env` for local and CLI use. It never loads the website's `.env.local`. Platform-provided environment variables take precedence.

```sh
pnpm --filter @sekibat/backend typecheck
pnpm --filter @sekibat/backend lint
pnpm --filter @sekibat/backend test
pnpm --filter @sekibat/backend build
pnpm --filter @sekibat/backend start
```

## Vercel

Vercel supports a default-exported Express app at `src/index.ts`. That entry point never opens a port; `src/local.ts` is the local/self-hosted runner only.

To deploy independently on Vercel, import this repository as an Express project with Root Directory `backend`. Use the repository's pnpm workspace and lockfile, and allow build access to files outside the root directory for workspace installation. Keep the existing frontend project's root unchanged. There is no need for Railway or Render.

Deploying the frontend and Express app as one Vercel project requires explicit multi-service routing configuration; this scaffold does not enable it or deploy anything. See [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).

## Next implementation steps

- Provision PostgreSQL and implement the CMS schema/migration; never write production content into this app's local filesystem.
- Add authenticated admin operations, shared rate limiting and the scoped CMS controls tracked in GitHub issue #9.
- Implement the read/enquiry API in `../docs/BACKEND_API_CONTRACT.md` before switching the frontend's `SEKIBAT_API_URL`. The scaffold is not yet a CMS API replacement.
- Decide same-origin routing or an explicit CORS allowlist and session/origin protections when connecting a separate frontend. CORS is not authorization.

The existing Next.js CMS remains in place. Local PostgreSQL is provided through Docker Compose; a production database still needs provisioning. Authentication migration, uploads, email integration and deployment are not implemented. JSON request limits, Helmet headers and safe error responses are baseline protections, not a completed security review.

## Backend structure

- `src/index.ts`: app composition and health route.
- `src/local.ts`: local listener and graceful HTTP/database shutdown.
- `src/config/env.ts`: validated runtime configuration (only field names appear in validation errors).
- `src/config/db.ts`: lazy, reusable PostgreSQL pool, Drizzle client, connection check and cleanup.
- `src/config/drizzle.ts`: Drizzle Kit configuration.
- `src/middleware/`: request IDs, request completion logging, security headers, JSON parsing, not-found and error handling.
- `src/util/app-error.ts`: `AppError` factories for common HTTP errors.
- `src/util/logger.ts`: Pino structured JSON logging with sensitive-field redaction.
- `src/types/express.d.ts`: typed `request.requestId` and `request.log`.
- `src/db/schema.ts`: future domain table definitions; intentionally empty until the CMS data model is designed.

## Errors and tracing

Routes can throw `AppError.notFound()`, `AppError.unauthorized()`, `AppError.forbidden()`, `AppError.badRequest()`, `AppError.validation()`, `AppError.conflict()`, `AppError.tooManyRequests()`, `AppError.unavailable()` or `AppError.internal()`. Express 5 forwards rejected async handlers to the final error middleware. Authentication/authorization still needs implementation; error helpers do not enforce it.

Every request gets a server-generated `X-Request-ID`, also present in error JSON and its child logger. Incoming IDs are deliberately ignored. Completion logs include method, route pattern, status, duration and aborted-request state, without query strings, raw bodies or authorization headers. Unexpected errors get generic responses. Use `request.log` for safe diagnostic fields; never log raw database errors, credentials or user input. Redaction protects specified fields, not secrets embedded in arbitrary message strings.

## Database setup

### Local Docker database

Install Docker with Compose and start its daemon. `backend/compose.yaml` runs PostgreSQL 17, bound only to `127.0.0.1:5433` (avoiding the usual PostgreSQL port). The database and username are both `sekibat`. Set the same URL-safe password in `POSTGRES_PASSWORD` and `DATABASE_URL` in the ignored `backend/.env`. The backend loader does not expand variables inside `DATABASE_URL`; enter the full URL. The initial local setup creates this file with a generated password. Keep the example file as a template, never commit actual credentials.

From the repository root:

```sh
pnpm --filter @sekibat/backend db:up     # Start and wait until healthy
pnpm --filter @sekibat/backend db:check  # Verify via the backend's Drizzle connection
pnpm --filter @sekibat/backend db:logs
pnpm --filter @sekibat/backend db:down   # Stop; retain database data
```

Data lives in the `sekibat-local_postgres_data` Docker volume and survives container recreation. Do not remove this volume unless you intend to delete the local database. PostgreSQL initializes its credentials only on the first start with an empty volume; editing the password in `.env` does not change an existing database password. `db:up` starts only the database; run the backend and Next.js dev commands separately. Docker is for local development and is not part of the Vercel deployment.

### Production and migrations

Set `DATABASE_URL` on Vercel to the managed PostgreSQL provider's connection URL. Use its recommended pooled endpoint for serverless operation and TLS settings appropriate to the provider. Do not disable certificate verification. `DATABASE_POOL_MAX` defaults to 3 per runtime instance; total connections still depend on concurrency, so a provider-side pooler matters. Do not copy the local Docker connection URL into production.

```sh
pnpm --filter @sekibat/backend db:check
# After adding pgTable definitions to src/db/schema.ts:
pnpm --filter @sekibat/backend db:generate
# Review generated SQL before applying it to your chosen database:
pnpm --filter @sekibat/backend db:migrate
pnpm --filter @sekibat/backend db:studio
```

`getDb()` opens the pool on demand. Missing credentials yield a safe service-unavailable error; `/v1/health` remains a liveness check and does not imply database readiness. `db:check` performs `SELECT 1` and closes its pool. No migrations run during application startup or deployment. Drizzle migrations belong in `backend/drizzle/` and should be committed when created. Studio is a local development tool, not a public admin endpoint.
