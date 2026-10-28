# Checks and deployment

## Continuous integration

`.github/workflows/ci.yml` runs on pushes, pull requests and manual dispatch. It uses Node 22 and the pnpm version declared in the root package manifest, installs with the frozen lockfile, lints the workspace, builds the backend, applies committed Drizzle migrations to a disposable PostgreSQL 17 database, checks the connection, runs backend tests, and builds/typechecks the Next.js site.

No production secrets are required. The database exists only for that job. The workflow does not deploy or migrate production. Actions are pinned to release commits; Dependabot checks their pins monthly. Superseded runs on the same ref are cancelled.

Once the workflow has been pushed and completed, configure a GitHub rule for `main` requiring pull requests and the `Lint, tests and builds` status check. This repository file does not enable branch protection by itself. Avoid direct pushes to `main` if you want checks to gate releases.

## Continuous deployment

Use Vercel's Git integration for preview and production deployments. A connected project builds branch pushes as previews and updates production when its production branch changes. GitHub Actions checks do not automatically make Vercel wait: require passing checks before merging to the production branch. No Vercel token is needed in this CI workflow.

The backend is not yet deployed. Its independent Vercel project should use `backend` as its Root Directory, with the Node version aligned to 22. See `backend/README.md` for deployment details. Frontend-to-backend routing still needs configuring before switching the existing CMS over.

## Remaining before production CMS rollout

- Provision managed PostgreSQL, with separate preview and production databases and environment variables.
- Configure durable image storage and its credentials.
- Configure backend deployment and frontend API routing.
- Add the CMS schema and committed migrations; choose a controlled production migration step before enabling database-backed features. CI already verifies migrations against a fresh database.
- Implement authentication/authorization alongside admin features, including any shared session or rate-limit storage they require.

These do not prevent local feature development. The local database, environment validation, logger, error handling and CI foundation are in place. CI must run on GitHub once pushed to verify the hosted runner as well.
