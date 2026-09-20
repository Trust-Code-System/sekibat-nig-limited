import { cache } from "react";
import { services } from "@/data/services";
import type { Service } from "@/types";
import { CACHE_TAGS, remoteOrLocal, remoteOrLocalNullable } from "./client";

/** Service repository. A small fixed set, so no query/pagination surface. */

export const getServices = cache(async (): Promise<Service[]> => {
  return remoteOrLocal("/services", [CACHE_TAGS.services], () =>
    [...services].sort((a, b) => a.order - b.order)
  );
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  return remoteOrLocalNullable(
    `/services/${encodeURIComponent(slug)}`,
    [CACHE_TAGS.services],
    () => services.find((s) => s.slug === slug) ?? null
  );
});

/** Resolve a list of service slugs to records, dropping any that no longer exist. */
export const getServicesBySlugs = cache(async (slugs: string[]): Promise<Service[]> => {
  const all = await getServices();
  return slugs
    .map((slug) => all.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s));
});

export const getServiceSlugs = cache(async (): Promise<string[]> => {
  return remoteOrLocal("/services/slugs", [CACHE_TAGS.services], () =>
    services.map((s) => s.slug)
  );
});
