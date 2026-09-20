import type {
  Ownership,
  ProjectStatus,
  PropertyStatus,
  PropertyType,
} from "@/types";

/**
 * Every label and number the UI renders comes from here.
 *
 * The one rule that matters: a property with no price renders "Price on request", never ₦0.
 * `price` is optional in the data model precisely so the absence is explicit.
 */

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const PRICE_ON_REQUEST = "Price on request";

export function formatNaira(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return PRICE_ON_REQUEST;
  return naira.format(value);
}

/** Compact form for dense contexts like the ledger table — ₦285m, ₦1.2bn. */
export function formatNairaCompact(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return PRICE_ON_REQUEST;
  if (value >= 1_000_000_000) {
    const n = value / 1_000_000_000;
    return `₦${n % 1 === 0 ? n : n.toFixed(1)}bn`;
  }
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `₦${n % 1 === 0 ? n : n.toFixed(1)}m`;
  }
  return naira.format(value);
}

export function formatSize(size: number | undefined, unit: "sqm" = "sqm"): string | undefined {
  if (size === undefined) return undefined;
  return `${new Intl.NumberFormat("en-NG").format(size)} ${unit}`;
}

export function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
  }).format(d);
}

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  land: "Land",
  "mixed-use": "Mixed-use",
};

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  available: "Available",
  "under-development": "Under development",
  completed: "Completed",
  leased: "Leased",
  sold: "Sold",
};

/**
 * Status is carried by label and ink weight, not by a palette of badge colours.
 * Only "available" gets the accent; everything closed is quieter, not red.
 */
export function statusTone(status: PropertyStatus | ProjectStatus): "accent" | "muted" {
  return status === "available" || status === "ongoing" ? "accent" : "muted";
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "Planned",
  ongoing: "Ongoing",
  completed: "Completed",
};

export const OWNERSHIP_LABEL: Record<Ownership, string> = {
  sekibat: "Sekibat-owned",
  client: "Client property",
};

/** The one-line spec shown under a card title. Omits anything the record does not carry. */
export function specLine(p: {
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: "sqm";
  type: PropertyType;
}): string[] {
  const parts: string[] = [];
  if (p.bedrooms) parts.push(`${p.bedrooms} bed`);
  if (p.bathrooms) parts.push(`${p.bathrooms} bath`);
  const size = formatSize(p.size, p.sizeUnit ?? "sqm");
  if (size) parts.push(size);
  if (parts.length === 0) parts.push(PROPERTY_TYPE_LABEL[p.type]);
  return parts;
}

/** "01 / 08" — the plate index used across cards. */
export function plateIndex(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(index + 1)} / ${pad(total)}`;
}
