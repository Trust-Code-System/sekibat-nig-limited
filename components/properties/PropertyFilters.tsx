"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CineSelect } from "@/components/ui/CineSelect";
import { cn } from "@/lib/cn";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL, OWNERSHIP_LABEL } from "@/lib/format";
import { SORT_LABELS, SORT_KEYS } from "@/lib/query/property-query";
import type { PropertyFacets } from "@/lib/api";
import type { PropertyStatus, PropertyType } from "@/types";

/**
 * Filter panel.
 *
 * It owns no filter state. It is a real `<form method="get" action="/properties">`, and the
 * only thing it does with JavaScript is serialise itself on change and push that to the URL —
 * which is exactly what a no-JS GET submit would produce. The server component reads
 * `searchParams` and does the actual filtering, so a filtered URL is shareable, bookmarkable
 * and crawlable, and the predicate moves to the admin API untouched.
 */
export function PropertyFilters({
  facets,
  resultCount,
  view,
}: {
  facets: PropertyFacets;
  resultCount: number;
  view: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  // Keep the form in sync when navigation changes the URL (back button, "clear all").
  useEffect(() => {
    formRef.current?.reset();
  }, [searchParams]);

  function push(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      if (typeof value !== "string" || value === "") continue;
      // Any filter change resets pagination — otherwise you land on a page that no longer exists.
      if (key === "page") continue;
      if (key === "sort" && value === "featured") continue;
      params.append(key, value);
    }

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false });
    });
  }

  function onChange(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const target = event.target as HTMLElement;
    const isText = target instanceof HTMLInputElement && target.type === "search";

    if (debounce.current) clearTimeout(debounce.current);
    if (isText) {
      debounce.current = setTimeout(() => push(form), 300);
    } else {
      push(form);
    }
  }

  const current = (key: string) => searchParams.get(key) ?? "";
  const checked = (key: string, value: string) => searchParams.getAll(key).includes(value);
  const applySelect = () => {
    if (formRef.current) push(formRef.current);
  };

  return (
    <form
      ref={formRef}
      method="get"
      action="/properties"
      onChange={onChange}
      onSubmit={(e) => {
        e.preventDefault();
        push(e.currentTarget);
      }}
      className={cn("rounded-2xl bg-white px-5 md:px-7", isPending && "opacity-70")}
      aria-busy={isPending}
    >
      {/* Preserve the chosen view across filter changes. */}
      <input type="hidden" name="view" value={view === "ledger" ? "ledger" : ""} />

      <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:gap-8">
        <div className="flex-1">
          <label htmlFor="q" className="sr-only">
            Search properties
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={current("q")}
            placeholder="Search by name, location, reference or feature"
            className="w-full bg-transparent py-2 text-md text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="label whitespace-nowrap" aria-live="polite">
            {resultCount} {resultCount === 1 ? "property" : "properties"}
          </p>

          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <CineSelect
            id="sort"
            name="sort"
            variant="plain"
            defaultValue={current("sort") || "featured"}
            onValueChange={applySelect}
            options={SORT_KEYS.map((key) => ({
              value: key,
              label: SORT_LABELS[key],
            }))}
          />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="label border-b border-rule pb-1 text-ink transition-colors hover:border-ink md:hidden"
          >
            {open ? "Hide filters" : "Filters"}
          </button>
        </div>
      </div>

      <div
        id="filter-panel"
        className={cn(
          "border-t border-rule py-8 md:block",
          open ? "block" : "hidden"
        )}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-10">
          <fieldset>
            <legend className="label">Type</legend>
            <div className="mt-4 space-y-2.5">
              {facets.types.map((type) => (
                <Checkbox
                  key={type}
                  name="type"
                  value={type}
                  label={PROPERTY_TYPE_LABEL[type as PropertyType]}
                  defaultChecked={checked("type", type)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Status</legend>
            <div className="mt-4 space-y-2.5">
              {facets.statuses.map((status) => (
                <Checkbox
                  key={status}
                  name="status"
                  value={status}
                  label={PROPERTY_STATUS_LABEL[status as PropertyStatus]}
                  defaultChecked={checked("status", status)}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="city" className="label block">
              Location
            </label>
            <div className="mt-4">
              <CineSelect
                id="city"
                name="city"
                surface="ivory"
                defaultValue={current("city")}
                onValueChange={applySelect}
                options={[
                  { value: "", label: "All locations" },
                  ...facets.cities.map((city) => ({ value: city, label: city })),
                ]}
              />
            </div>

            <label htmlFor="bedrooms" className="label mt-6 block">
              Bedrooms
            </label>
            <div className="mt-4">
              <CineSelect
                id="bedrooms"
                name="bedrooms"
                surface="ivory"
                defaultValue={current("bedrooms")}
                onValueChange={applySelect}
                options={[
                  { value: "", label: "Any" },
                  ...[1, 2, 3, 4, 5].map((n) => ({
                    value: String(n),
                    label: `${n}+ bedrooms`,
                  })),
                ]}
              />
            </div>
          </div>

          <fieldset>
            <legend className="label">Ownership</legend>
            <div className="mt-4 space-y-2.5">
              {(["sekibat", "client"] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 text-base">
                  <input
                    type="radio"
                    name="ownership"
                    value={value}
                    defaultChecked={current("ownership") === value}
                    className="size-4 accent-lime"
                  />
                  {OWNERSHIP_LABEL[value]}
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-3 text-base">
                <input
                  type="radio"
                  name="ownership"
                  value=""
                  defaultChecked={current("ownership") === ""}
                  className="size-4 accent-lime"
                />
                Either
              </label>
            </div>
          </fieldset>
        </div>

        {/* Only reachable without JavaScript; with JS the form pushes on change. */}
        <noscript>
          <button
            type="submit"
            className="mt-8 rounded-xs bg-clay px-6 py-3.5 text-2xs tracking-[0.14em] text-paper uppercase"
          >
            Apply filters
          </button>
        </noscript>
      </div>
    </form>
  );
}

function Checkbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-base">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-lime"
      />
      {label}
    </label>
  );
}
