import Link from "next/link";
import { cn } from "@/lib/cn";
import { OWNERSHIP_LABEL, PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/format";
import type { PropertyQuery } from "@/lib/api";
import { propertyHref } from "@/lib/query/property-query";
import type { Ownership, PropertyStatus, PropertyType } from "@/types";

/**
 * Everything around the results: view switch, active-filter chips, pagination and the empty
 * state. All plain links carrying a serialised query, so every one of them is a real,
 * shareable URL and works without JavaScript.
 */

function hrefWithView(query: PropertyQuery, view: "grid" | "ledger"): string {
  const base = propertyHref(query);
  if (view === "grid") return base;
  return base.includes("?") ? `${base}&view=ledger` : `${base}?view=ledger`;
}

export function ViewSwitch({ query, view }: { query: PropertyQuery; view: string }) {
  const options = [
    { key: "grid" as const, label: "Plates" },
    { key: "ledger" as const, label: "Ledger" },
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="label">View</span>
      <div className="flex items-center gap-3">
        {options.map((option) => {
          const active = (view === "ledger" ? "ledger" : "grid") === option.key;
          return (
            <Link
              key={option.key}
              href={hrefWithView(query, option.key)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "border-b pb-1 text-2xs font-medium tracking-[0.14em] uppercase transition-colors",
                active
                  ? "border-lime-deep text-ink"
                  : "border-transparent text-ink-faint hover:text-ink"
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Removable chips for whatever is currently filtering the list. */
export function ActiveFilters({ query, view }: { query: PropertyQuery; view: string }) {
  const chips: { label: string; next: PropertyQuery }[] = [];
  const keepView = (q: PropertyQuery) => q;

  if (query.q) chips.push({ label: `“${query.q}”`, next: { ...query, q: undefined, page: 1 } });
  if (query.city)
    chips.push({ label: query.city, next: { ...query, city: undefined, page: 1 } });
  for (const type of query.type ?? []) {
    chips.push({
      label: PROPERTY_TYPE_LABEL[type as PropertyType],
      next: { ...query, type: query.type?.filter((t) => t !== type), page: 1 },
    });
  }
  for (const status of query.status ?? []) {
    chips.push({
      label: PROPERTY_STATUS_LABEL[status as PropertyStatus],
      next: { ...query, status: query.status?.filter((s) => s !== status), page: 1 },
    });
  }
  if (query.ownership)
    chips.push({
      label: OWNERSHIP_LABEL[query.ownership as Ownership],
      next: { ...query, ownership: undefined, page: 1 },
    });
  if (query.bedrooms !== undefined)
    chips.push({
      label: `${query.bedrooms}+ bedrooms`,
      next: { ...query, bedrooms: undefined, page: 1 },
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-5">
      <span className="label">Filtering by</span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={hrefWithView(keepView(chip.next), view === "ledger" ? "ledger" : "grid")}
          className="group inline-flex items-center gap-2 rounded-full border border-rule bg-white px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          {chip.label}
          <span aria-hidden className="text-ink-faint group-hover:text-lime-deep">
            ×
          </span>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link
        href={hrefWithView({}, view === "ledger" ? "ledger" : "grid")}
        className="label ml-1 border-b border-rule pb-0.5 text-ink transition-colors hover:border-ink"
      >
        Clear all
      </Link>
    </div>
  );
}

export function EmptyState({ view }: { query: PropertyQuery; view: string }) {
  return (
    // No top rule here: the active-filters row above already closes with one, and two rules
    // separated by the section padding read as an empty box rather than a divider.
    <div className="py-8 text-center md:py-12">
      <p className="label">No matches</p>
      <p className="font-display mx-auto mt-5 max-w-[22ch] text-d2 font-light">
        Nothing matches those filters.
      </p>
      <p className="mx-auto mt-6 max-w-[44ch] text-md text-ink-muted">
        Try widening the location or status, or clear the filters to see everything currently on
        record.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href={hrefWithView({}, view === "ledger" ? "ledger" : "grid")}
          className="rounded-full bg-onyx px-6 py-4 text-2xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-ink"
        >
          Clear all filters
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-ink px-6 py-4 text-2xs font-medium tracking-[0.14em] uppercase transition-colors hover:bg-ink hover:text-ivory"
        >
          Tell us what you are looking for
        </Link>
      </div>
    </div>
  );
}

export function Pagination({
  query,
  page,
  totalPages,
  view,
}: {
  query: PropertyQuery;
  page: number;
  totalPages: number;
  view: string;
}) {
  if (totalPages <= 1) return null;
  const v = view === "ledger" ? "ledger" : "grid";

  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-between border-t border-rule pt-6">
      {page > 1 ? (
        <Link
          href={hrefWithView({ ...query, page: page - 1 }, v)}
          className="label text-ink transition-colors hover:text-lime-deep"
        >
          ← Previous
        </Link>
      ) : (
        <span className="label opacity-40">← Previous</span>
      )}

      <p className="label font-mono">
        Page {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </p>

      {page < totalPages ? (
        <Link
          href={hrefWithView({ ...query, page: page + 1 }, v)}
          className="label text-ink transition-colors hover:text-lime-deep"
        >
          Next →
        </Link>
      ) : (
        <span className="label opacity-40">Next →</span>
      )}
    </nav>
  );
}
