/**
 * THE DATA SEAM.
 *
 * This barrel is the only data entry point the UI is allowed to use. Nothing outside
 * `lib/api/` may import from `data/*` — an ESLint `no-restricted-imports` rule enforces it.
 *
 * The contract, which holds today against local arrays and tomorrow against the Sekibat
 * admin API:
 *
 *   1. Every read is `async`. `await` is the signature that survives the swap.
 *   2. A single record returns `T | null`. The repository never throws and never calls
 *      `notFound()` — it does not know it is running inside a route. Pages decide.
 *   3. A list-with-query returns `Paged<T>`. A fixed-size helper returns `T[]`.
 *   4. Every read is wrapped in React `cache()`, so `generateMetadata`, the page body and the
 *      JSON-LD builder share one call per request.
 *   5. Query objects are the wire format. `lib/query/*` serialises them into the search params
 *      a real endpoint will receive, so filtering does not get rewritten later.
 *
 * Set `SEKIBAT_API_URL` to switch every repository to the documented backend endpoints. Do not
 * add `export const revalidate` to a page — caching belongs in `client.ts` alone.
 */

export {
  getProperties,
  getPropertyBySlug,
  getFeaturedProperties,
  getRelatedProperties,
  getPropertySlugs,
  getPropertyFacets,
} from "./properties";

export {
  getProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getRelatedProjects,
  getProjectsByService,
  getProjectSlugs,
} from "./projects";

export { getServices, getServiceBySlug, getServicesBySlugs, getServiceSlugs } from "./services";

export { getCompany } from "./company";

export {
  DEFAULT_PER_PAGE,
  type Paged,
  type PropertyFacets,
  type PropertyQuery,
  type PropertySortKey,
  type ProjectQuery,
  type ProjectSortKey,
} from "./types";
