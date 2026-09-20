import { cache } from "react";
import { properties } from "@/data/properties";
import type { Property } from "@/types";
import { apiPath, CACHE_TAGS, remoteOrLocal, remoteOrLocalNullable } from "./client";
import {
  DEFAULT_PER_PAGE,
  type Paged,
  type PropertyFacets,
  type PropertyQuery,
  type PropertySortKey,
} from "./types";

/**
 * Property repository.
 *
 * Contract (see lib/api/index.ts):
 *   - every read is async, even though the source is local today
 *   - a single record returns `T | null` — never throws, never calls notFound()
 *   - a list-with-query returns Paged<T>; a fixed-size helper returns T[]
 *   - every read is wrapped in React cache() so generateMetadata, the page and the JSON-LD
 *     builder share one call per request
 *
 * Setting SEKIBAT_API_URL switches these reads to the remote endpoint. Without it, local
 * placeholder records keep development and design review self-contained.
 */

const STATUS_RANK: Record<Property["status"], number> = {
  available: 0,
  "under-development": 1,
  completed: 2,
  leased: 3,
  sold: 4,
};

function matches(p: Property, q: PropertyQuery): boolean {
  if (q.q) {
    const needle = q.q.toLowerCase();
    const haystack = [
      p.title,
      p.reference,
      p.shortDescription,
      p.location.city,
      p.location.state,
      p.location.address ?? "",
      ...p.features,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (q.city && p.location.city !== q.city) return false;
  if (q.state && p.location.state !== q.state) return false;
  if (q.type?.length && !q.type.includes(p.type)) return false;
  if (q.status?.length && !q.status.includes(p.status)) return false;
  if (q.ownership && p.ownership !== q.ownership) return false;
  if (q.featured !== undefined && p.featured !== q.featured) return false;
  if (q.bedrooms !== undefined && (p.bedrooms ?? 0) < q.bedrooms) return false;
  if (q.minPrice !== undefined && (p.price ?? 0) < q.minPrice) return false;
  if (q.maxPrice !== undefined && p.price !== undefined && p.price > q.maxPrice) return false;
  return true;
}

function compare(a: Property, b: Property, sort: PropertySortKey): number {
  switch (sort) {
    case "newest":
      return b.listedAt.localeCompare(a.listedAt);
    case "price-asc":
      return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
    case "price-desc":
      return (b.price ?? -1) - (a.price ?? -1);
    case "title-asc":
      return a.title.localeCompare(b.title);
    case "featured":
    default:
      // featured first, then by availability, then newest — the default browse order
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) {
        return STATUS_RANK[a.status] - STATUS_RANK[b.status];
      }
      return b.listedAt.localeCompare(a.listedAt);
  }
}

function localProperties(query: PropertyQuery): Paged<Property> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const filtered = properties
    .filter((p) => matches(p, query))
    .sort((a, b) => compare(a, b, query.sort ?? "featured"));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * perPage;

  return {
    items: filtered.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages,
  };
}

export const getProperties = cache(
  async (query: PropertyQuery = {}): Promise<Paged<Property>> => {
    return remoteOrLocal(
      apiPath("/properties", {
        ...query,
        type: query.type,
        status: query.status,
      }),
      [CACHE_TAGS.properties],
      () => localProperties(query)
    );
  }
);

export const getPropertyBySlug = cache(async (slug: string): Promise<Property | null> => {
  return remoteOrLocalNullable(
    `/properties/${encodeURIComponent(slug)}`,
    [CACHE_TAGS.properties, CACHE_TAGS.property(slug)],
    () => properties.find((p) => p.slug === slug) ?? null
  );
});

export const getFeaturedProperties = cache(async (limit = 3): Promise<Property[]> => {
  const { items } = await getProperties({ featured: true, perPage: limit });
  return items;
});

/**
 * Related = same city first, then same type, excluding the property itself.
 * Falls back to filling from the general pool so this never returns an empty rail.
 */
export const getRelatedProperties = cache(
  async (slug: string, limit = 3): Promise<Property[]> => {
    return remoteOrLocal(
      apiPath(`/properties/${encodeURIComponent(slug)}/related`, { limit }),
      [CACHE_TAGS.properties, CACHE_TAGS.property(slug)],
      async () => {
        const current = await getPropertyBySlug(slug);
        if (!current) return [];

        const pool = properties.filter((p) => p.slug !== slug);
        const score = (p: Property) =>
          (p.location.city === current.location.city ? 2 : 0) + (p.type === current.type ? 1 : 0);

        return [...pool]
          .sort((a, b) => score(b) - score(a) || compare(a, b, "featured"))
          .slice(0, limit);
      }
    );
  }
);

export const getPropertySlugs = cache(async (): Promise<string[]> => {
  return remoteOrLocal("/properties/slugs", [CACHE_TAGS.properties], () =>
    properties.map((p) => p.slug)
  );
});

export const getPropertyFacets = cache(async (): Promise<PropertyFacets> => {
  return remoteOrLocal("/properties/facets", [CACHE_TAGS.properties], () => {
    const uniq = <T,>(xs: T[]) => [...new Set(xs)];
    return {
      cities: uniq(properties.map((p) => p.location.city)).sort((a, b) => a.localeCompare(b)),
      states: uniq(properties.map((p) => p.location.state)).sort((a, b) => a.localeCompare(b)),
      types: uniq(properties.map((p) => p.type)),
      statuses: uniq(properties.map((p) => p.status)),
    };
  });
});
