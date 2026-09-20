export type PropertyType = "residential" | "commercial" | "land" | "mixed-use";

export type PropertyStatus =
  | "available"
  | "sold"
  | "leased"
  | "under-development"
  | "completed";

/** Whether Sekibat owns the asset, or holds/manages it for a client. */
export type Ownership = "sekibat" | "client";

export interface PropertyLocation {
  city: string;
  state: string;
  address?: string;
}

export interface Property {
  id: string;
  /** Human-facing reference, mirrors the internal system: PROP-000123 */
  reference: string;
  slug: string;
  title: string;

  location: PropertyLocation;

  type: PropertyType;
  status: PropertyStatus;
  ownership: Ownership;

  shortDescription: string;
  description: string;

  /** Omitted entirely when the price is not public — never render 0. */
  price?: number;
  currency?: "NGN";

  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: "sqm";

  features: string[];
  images: string[];

  featured: boolean;
  /** ISO date the record was listed — drives "newest" sorting. */
  listedAt: string;
}
