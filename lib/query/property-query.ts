import { z } from "zod";
import type { PropertyQuery, PropertySortKey } from "@/lib/api/types";
import { DEFAULT_PER_PAGE } from "@/lib/api/types";

/**
 * Bidirectional serialisation for the property query.
 *
 * This module is the reason filtering does not have to be rewritten when the admin API
 * arrives: `propertyQueryToSearchParams` produces the exact query string the real endpoint
 * will receive, and `parsePropertyQuery` reads it back off the URL.
 *
 * Array filters serialise as repeated keys (`type=residential&type=land`), which
 * `URLSearchParams.getAll` round-trips and every REST API in this space accepts.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const PROPERTY_TYPES = ["residential", "commercial", "land", "mixed-use"] as const;
export const PROPERTY_STATUSES = [
  "available",
  "under-development",
  "completed",
  "leased",
  "sold",
] as const;
export const OWNERSHIPS = ["sekibat", "client"] as const;
export const SORT_KEYS = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "title-asc",
] as const;

export const SORT_LABELS: Record<PropertySortKey, string> = {
  featured: "Featured first",
  newest: "Most recent",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  "title-asc": "Name, A–Z",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Every field uses `.catch()` so a hand-edited or stale URL degrades to a sane default
 * instead of throwing — `?page=banana` renders page 1, it does not 500.
 */
const schema = z.object({
  q: z.string().trim().min(1).max(80).optional().catch(undefined),
  city: z.string().trim().min(1).max(60).optional().catch(undefined),
  state: z.string().trim().min(1).max(60).optional().catch(undefined),
  type: z.array(z.enum(PROPERTY_TYPES)).optional().catch(undefined),
  status: z.array(z.enum(PROPERTY_STATUSES)).optional().catch(undefined),
  ownership: z.enum(OWNERSHIPS).optional().catch(undefined),
  bedrooms: z.coerce.number().int().min(1).max(10).optional().catch(undefined),
  minPrice: z.coerce.number().min(0).optional().catch(undefined),
  maxPrice: z.coerce.number().min(0).optional().catch(undefined),
  sort: z.enum(SORT_KEYS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(999).optional().catch(undefined),
});

export function parsePropertyQuery(sp: RawSearchParams): PropertyQuery {
  const types = toArray(sp.type).filter((v): v is (typeof PROPERTY_TYPES)[number] =>
    (PROPERTY_TYPES as readonly string[]).includes(v)
  );
  const statuses = toArray(sp.status).filter((v): v is (typeof PROPERTY_STATUSES)[number] =>
    (PROPERTY_STATUSES as readonly string[]).includes(v)
  );

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const parsed = schema.safeParse({
    q: first(sp.q),
    city: first(sp.city),
    state: first(sp.state),
    type: types.length ? types : undefined,
    status: statuses.length ? statuses : undefined,
    ownership: first(sp.ownership),
    bedrooms: first(sp.bedrooms),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
    sort: first(sp.sort),
    page: first(sp.page),
  });

  const data = parsed.success ? parsed.data : {};

  return {
    ...data,
    page: data.page ?? 1,
    perPage: DEFAULT_PER_PAGE,
  };
}

/** Serialise back to the URL. `perPage` is a server concern and is deliberately omitted. */
export function propertyQueryToSearchParams(query: PropertyQuery): URLSearchParams {
  const sp = new URLSearchParams();

  if (query.q) sp.set("q", query.q);
  if (query.city) sp.set("city", query.city);
  if (query.state) sp.set("state", query.state);
  for (const t of query.type ?? []) sp.append("type", t);
  for (const s of query.status ?? []) sp.append("status", s);
  if (query.ownership) sp.set("ownership", query.ownership);
  if (query.bedrooms !== undefined) sp.set("bedrooms", String(query.bedrooms));
  if (query.minPrice !== undefined) sp.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) sp.set("maxPrice", String(query.maxPrice));
  if (query.sort && query.sort !== "featured") sp.set("sort", query.sort);
  if (query.page && query.page > 1) sp.set("page", String(query.page));

  return sp;
}

/** Href for `/properties` carrying a query. Returns a clean path when the query is empty. */
export function propertyHref(query: PropertyQuery): string {
  const sp = propertyQueryToSearchParams(query);
  const qs = sp.toString();
  return qs ? `/properties?${qs}` : "/properties";
}

/** Any filter change resets pagination — otherwise you land on an out-of-range page. */
export function withFilter(query: PropertyQuery, patch: Partial<PropertyQuery>): PropertyQuery {
  return { ...query, ...patch, page: 1 };
}

/** Add or remove one value from an array filter. */
export function toggleInList<T extends string>(list: T[] | undefined, value: T): T[] | undefined {
  const current = list ?? [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return next.length ? next : undefined;
}

export function hasActiveFilters(query: PropertyQuery): boolean {
  return Boolean(
    query.q ||
      query.city ||
      query.state ||
      query.type?.length ||
      query.status?.length ||
      query.ownership ||
      query.bedrooms !== undefined ||
      query.minPrice !== undefined ||
      query.maxPrice !== undefined
  );
}
