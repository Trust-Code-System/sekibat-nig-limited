import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  formatNairaCompact,
  OWNERSHIP_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
  statusTone,
} from "@/lib/format";
import type { Property } from "@/types";

/**
 * The ledger view — the distinctive move of this design.
 *
 * Properties as referenced records rather than marketing cards, carrying the same
 * `PROP-000123` references the internal management system will use. It is the dense,
 * scannable counterpart to the plate grid, and it is what an owner or agent actually wants
 * when comparing eight records.
 *
 * Rendered as a real <table> so it is navigable and announced correctly by a screen reader.
 */
export function PropertyLedger({ properties }: { properties: Property[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] border-collapse text-left">
        <caption className="sr-only">
          Sekibat properties, with reference, location, type, status and price
        </caption>
        <thead>
          <tr className="border-y border-ink">
            <Th className="w-[9rem]">Ref</Th>
            <Th>Property</Th>
            <Th className="w-[11rem]">Location</Th>
            <Th className="w-[9rem]">Type</Th>
            <Th className="w-[11rem]">Ownership</Th>
            <Th className="w-[9rem]">Status</Th>
            <Th className="w-[10rem] text-right">Price</Th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const tone = statusTone(property.status);
            return (
              <tr
                key={property.id}
                className="group border-b border-rule transition-colors hover:bg-ivory-deep"
              >
                <Td className="font-mono text-sm text-lime-deep">{property.reference}</Td>
                <Td>
                  <Link
                    href={`/properties/${property.slug}`}
                    className="font-display text-lg font-normal tracking-[-0.01em] after:absolute after:inset-0 after:content-['']"
                  >
                    {property.title}
                  </Link>
                </Td>
                <Td className="text-sm text-ink-muted">
                  {property.location.city}, {property.location.state}
                </Td>
                <Td className="text-sm text-ink-muted">
                  {PROPERTY_TYPE_LABEL[property.type]}
                </Td>
                <Td className="text-sm text-ink-muted">
                  {OWNERSHIP_LABEL[property.ownership]}
                </Td>
                <Td>
                  <span
                    className={cn(
                      "text-2xs font-medium tracking-[0.14em] uppercase",
                      tone === "accent" ? "text-lime-deep" : "text-ink-faint"
                    )}
                  >
                    {PROPERTY_STATUS_LABEL[property.status]}
                  </span>
                </Td>
                <Td className="text-right font-mono text-sm">
                  {property.price !== undefined ? (
                    formatNairaCompact(property.price)
                  ) : (
                    <span className="text-ink-faint">On request</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "py-3 pr-6 text-2xs font-medium tracking-[0.14em] text-ink-faint uppercase last:pr-0",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("relative py-5 pr-6 align-middle last:pr-0", className)}>{children}</td>
  );
}
