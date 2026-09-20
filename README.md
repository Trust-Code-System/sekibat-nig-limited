# Sekibat Nig Limited — Public Website

Production-style public frontend for Sekibat Nig Limited, a Nigerian property company that
develops and owns property and provides property services to external clients.

The site uses placeholder records and photography today, but all page components read through
an asynchronous repository layer so the UI can move to a CMS or Sekibat Admin API without a
route or component rewrite.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Zod validation and React Server Actions
- Playwright smoke and visual checks

Use the version-matched framework documentation in `node_modules/next/dist/docs/` when changing
Next.js behavior. This project follows Next.js 16 conventions, which differ from earlier
versions.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Production verification:

```bash
pnpm lint
pnpm build
```

For browser smoke checks, keep `pnpm dev` running in one terminal and run this in another:

```bash
pnpm smoke
```

The smoke suite visits every URL in the generated sitemap and verifies responsive overflow,
basic document/accessibility invariants, mobile navigation, property filtering, the ledger
view, the property gallery, the 404 route, validation, and enquiry submission.

To take a local route screenshot:

```bash
pnpm shot -- / screenshots/home.png 1440 900
```

## Routes

- `/` — Homepage
- `/properties` and `/properties/[slug]` — Filterable catalogue and property records
- `/projects` and `/projects/[slug]` — Project case studies
- `/services` and `/services/[slug]` — Five service lines
- `/about` — Company and working principles
- `/contact` — General enquiry form
- `/sitemap.xml` and `/robots.txt` — Generated crawler metadata

## Architecture

- `data/` contains placeholder records only.
- `lib/api/` is the data seam used by pages and components. UI code must not import `data/`
  directly.
- `types/` contains the stable record contracts expected from a future API.
- `components/` contains the design system, cards, filters, galleries, forms and page sections.
- `lib/actions/contact.ts` validates form submissions.
- `lib/notifications/deliver-enquiry.ts` is the single delivery integration seam.

The locked visual direction and content constraints live in `STYLESEED.md`.

## Environment

Copy `.env.example` to `.env.local`. The site is fully usable with only the public URL:

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, structured data, the sitemap and robots file.
Set it to the final production domain before deployment.

When the backend is ready, add:

```dotenv
SEKIBAT_API_URL=https://api.example.com/v1
SEKIBAT_API_KEY=server-only-api-key
SEKIBAT_REVALIDATE_SECRET=long-random-shared-secret
```

Setting `SEKIBAT_API_URL` switches all repositories and enquiry delivery from local preview
data to the remote backend. No page or component changes are required. `SEKIBAT_API_KEY` and
`SEKIBAT_REVALIDATE_SECRET` are server-only and must never use a `NEXT_PUBLIC_` prefix.

## Content replacement

Client-supplied information still required before launch:

- logo and final brand assets
- registered address, phone number and enquiry email
- confirmed social profile URLs
- real property and project records
- real photography and pricing
- approved company history and final marketing copy

Replace company/contact content in `data/company.ts` and property, project and service records
in their respective files under `data/` while working locally. In an integrated environment,
set `SEKIBAT_API_URL` and serve the contract in `docs/BACKEND_API_CONTRACT.md` instead.

Placeholder photography is stored locally in `public/media/`. Its reproducible source manifest
and the documented hero crop are in `scripts/media-manifest.mjs`. When approved photography
arrives, keep the same local filenames or update the paths in the data records.

## Enquiry delivery

The forms, validation, pending state, success state and property-reference payload are complete.
With no API URL, a local preview delivery logs only non-personal metadata. With the API URL set,
the same server-side delivery posts to `POST /enquiries` with a ten-second timeout.

## Backend handoff

The exact request/response shapes, query parameters, enquiry payload, authentication and cache
revalidation webhook are documented in `docs/BACKEND_API_CONTRACT.md`. The frontend exposes
`POST /api/revalidate`; the backend should call it after a record is published or changed.

## Deployment

The application requires a Next.js-capable Node.js host because it uses Server Actions for the
enquiry forms. A normal Next.js deployment supports the existing `build` and `start` scripts.
