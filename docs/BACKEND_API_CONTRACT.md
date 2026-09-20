# Sekibat frontend ↔ backend contract

This is the integration boundary already implemented by the frontend. Set `SEKIBAT_API_URL`
to the backend API root (for example `https://api.example.com/v1`) and the frontend switches
from bundled placeholder records to these endpoints. No UI changes are required.

## Authentication and transport

- All requests accept and return JSON over HTTPS.
- When `SEKIBAT_API_KEY` is set, the frontend sends it as `x-api-key`.
- Read endpoints may be cached by Next.js for up to five minutes and revalidated by webhook.
- A missing detail record returns `404`. Other non-2xx responses are treated as backend errors.
- Record fields use the TypeScript contracts in `types/`. Optional fields must be omitted or
  `undefined`, not filled with fake values or zeroes.

## Read endpoints

### Company and services

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/company` | `Company` |
| GET | `/services` | `Service[]` |
| GET | `/services/slugs` | `string[]` |
| GET | `/services/:slug` | `Service` or `404` |

### Properties

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/properties` | `Paged<Property>` |
| GET | `/properties/slugs` | `string[]` |
| GET | `/properties/facets` | `PropertyFacets` |
| GET | `/properties/:slug` | `Property` or `404` |
| GET | `/properties/:slug/related?limit=3` | `Property[]` |

`GET /properties` accepts these query parameters:

- `q`, `city`, `state`, `ownership`
- repeated `type` and `status` keys
- `featured` (`true` or `false`), `bedrooms`, `minPrice`, `maxPrice`
- `sort`: `featured`, `newest`, `price-asc`, `price-desc`, or `title-asc`
- `page` and `perPage`

Example response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "perPage": 9,
  "totalPages": 1
}
```

The facets response is:

```json
{
  "cities": ["Lagos"],
  "states": ["Lagos"],
  "types": ["residential", "commercial", "land", "mixed-use"],
  "statuses": ["available", "under-development", "completed", "leased", "sold"]
}
```

### Projects

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/projects` | `Paged<Project>` |
| GET | `/projects/slugs` | `string[]` |
| GET | `/projects/:slug` | `Project` or `404` |
| GET | `/projects/:slug/related?limit=2` | `Project[]` |

`GET /projects` accepts `q`, repeated `status`, `service`, `featured`, `sort`, `page`, and
`perPage`. Sort is `featured`, `newest`, or `title-asc`. The paged envelope is identical to
the property response.

## Enquiry endpoint

`POST /enquiries` receives the validated server-side payload. The frontend never sends this
request directly from the browser.

```json
{
  "kind": "property",
  "name": "Amina Yusuf",
  "email": "amina@example.com",
  "phone": "+234...",
  "subject": "property",
  "message": "I would like more information.",
  "property": {
    "slug": "sekibat-heights",
    "title": "Sekibat Heights",
    "reference": "PROP-000123"
  },
  "source": "/properties/sekibat-heights",
  "submittedAt": "2026-09-20T12:00:00.000Z"
}
```

For a general contact request, `kind` is `contact` and `property` is omitted. Return any 2xx
status and preferably `{ "id": "..." }` or `{ "reference": "..." }`. The backend should
rate-limit, persist, notify the appropriate team, and avoid logging message content or contact
details in plaintext application logs.

## Cache revalidation webhook

After publishing or changing content, POST to the frontend deployment:

```http
POST /api/revalidate
Content-Type: application/json
x-revalidation-secret: <SEKIBAT_REVALIDATE_SECRET>
```

```json
{ "resource": "properties", "slug": "sekibat-heights" }
```

`resource` is one of `properties`, `projects`, `services`, or `company`. Include `slug` for a
property or project record update. The frontend validates the shared secret with a constant-time
comparison and immediately expires the relevant Next.js cache tags. A successful response is:

```json
{ "ok": true, "revalidated": ["properties", "property:sekibat-heights"] }
```

## Integration checklist

1. Implement the endpoints above using the field definitions in `types/`.
2. Supply real company details, records, prices and approved media URLs.
3. Configure the three server-only environment variables in the hosting platform.
4. Submit both a general and a property enquiry in staging and confirm persistence/delivery.
5. Trigger the revalidation webhook and confirm an edited record appears without redeployment.
6. Run `pnpm lint`, `pnpm build`, and `pnpm smoke` before production release.
