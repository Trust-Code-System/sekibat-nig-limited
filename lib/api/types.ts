import type { Ownership, PropertyStatus, PropertyType, ProjectStatus } from "@/types";

/**
 * Query and result shapes shared by every repository function.
 *
 * These are also the WIRE FORMAT. `lib/query/*` serialises a query object straight into the
 * search params a real endpoint will receive, so the same object drives the in-memory adapter
 * today and `GET /properties?...` tomorrow.
 */

export type PropertySortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "title-asc";

export interface PropertyQuery {
  q?: string;
  city?: string;
  state?: string;
  type?: PropertyType[];
  status?: PropertyStatus[];
  ownership?: Ownership;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: PropertySortKey;
  page?: number;
  perPage?: number;
}

export type ProjectSortKey = "featured" | "newest" | "title-asc";

export interface ProjectQuery {
  q?: string;
  status?: ProjectStatus[];
  service?: string;
  featured?: boolean;
  sort?: ProjectSortKey;
  page?: number;
  perPage?: number;
}

/** Every list-with-query read returns this shape. Never a bare array. */
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/** Filter options derived from the data, so the UI never hardcodes a city list. */
export interface PropertyFacets {
  cities: string[];
  states: string[];
  types: PropertyType[];
  statuses: PropertyStatus[];
}

export const DEFAULT_PER_PAGE = 9;
