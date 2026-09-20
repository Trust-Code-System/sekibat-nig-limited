import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyCard } from "@/components/cards/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { PropertyLedger } from "@/components/properties/PropertyLedger";
import {
  ActiveFilters,
  EmptyState,
  Pagination,
  ViewSwitch,
} from "@/components/properties/ResultsChrome";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getProperties, getPropertyFacets } from "@/lib/api";
import { parsePropertyQuery } from "@/lib/query/property-query";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Properties",
  description:
    "Residential, commercial, mixed-use and land across Lagos and Abuja: developments owned by Sekibat and property held on behalf of clients.",
  path: "/properties",
});

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = parsePropertyQuery(sp);
  const view = (Array.isArray(sp.view) ? sp.view[0] : sp.view) === "ledger" ? "ledger" : "grid";

  const [result, facets] = await Promise.all([getProperties(query), getPropertyFacets()]);

  return (
    <div className="bg-ivory" data-nav-tone="light">
      <PageHeader
        eyebrow="Properties"
        title={
          <>
            Every property on <span className="accent-serif">record.</span>
          </>
        }
        intro="Developments Sekibat owns outright, and property we hold, market or manage for clients. Each record carries the same reference used inside our management system."
      />

      <Container className="pb-8">
        <Suspense fallback={<div className="h-24 rounded-2xl bg-white" />}>
          <PropertyFilters facets={facets} resultCount={result.total} view={view} />
        </Suspense>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Suspense fallback={null}>
            <ActiveFilters query={query} view={view} />
          </Suspense>
          <ViewSwitch query={query} view={view} />
        </div>
      </Container>

      <Container className="pb-20 md:pb-28">
        {result.items.length === 0 ? (
          <EmptyState query={query} view={view} />
        ) : view === "ledger" ? (
          <div className="overflow-hidden rounded-2xl bg-white px-4">
            <PropertyLedger properties={result.items} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((property, i) => (
              <Reveal key={property.id} delay={i * 60}>
                <PropertyCard property={property} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          query={query}
          page={result.page}
          totalPages={result.totalPages}
          view={view}
        />
      </Container>

      <CtaBand
        eyebrow="Cannot see it here"
        title={
          <>
            Tell us what you are <span className="accent-serif">looking for.</span>
          </>
        }
        body="Not everything we hold is listed, and new developments are released as they reach the right stage. Tell us the location, size and budget and we will come back to you."
        primary={{ href: "/contact", label: "Start an enquiry" }}
        secondary={{ href: "/projects", label: "See our projects" }}
      />
    </div>
  );
}
