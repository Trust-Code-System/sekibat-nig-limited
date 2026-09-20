import Link from "next/link";
import { ArrowIcon } from "@/components/home/icons";
import { SmartImage } from "@/components/media/SmartImage";
import { formatNaira, formatSize, PROPERTY_TYPE_LABEL } from "@/lib/format";
import { propertyImageAlt, SIZES } from "@/lib/images";
import type { Property } from "@/types";

/**
 * The cinematic-home property card: a soft white rounded plate on ivory — photograph,
 * title, lime-pinned location, and a spec row closed by the lime circle arrow. Distinct
 * from the editorial `PropertyCard` used on the ledger pages; this one belongs to the
 * reference-video visual language and only appears on the homepage.
 */
export function HomePropertyCard({
  property,
  priority = false,
}: {
  property: Property;
  priority?: boolean;
}) {
  const size = formatSize(property.size, property.sizeUnit ?? "sqm");

  return (
    <article className="group h-full">
      <Link
        href={`/properties/${property.slug}`}
        className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(12,14,10,0.05),0_12px_32px_-16px_rgba(12,14,10,0.18)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(12,14,10,0.06),0_20px_44px_-16px_rgba(12,14,10,0.24)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ivory-deep">
          <SmartImage
            src={property.images[0]}
            alt={propertyImageAlt(property.title, property.location.city, 0)}
            sizes={SIZES.card}
            priority={priority}
            className="transition-transform duration-700 ease-(--ease-editorial) group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-md font-semibold tracking-[-0.01em] text-ink">
              {property.title}
            </h3>
            <p className="shrink-0 text-sm font-semibold text-ink">
              {formatNaira(property.price)}
            </p>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <PinIcon />
            {property.location.city}, {property.location.state}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-rule pt-4">

            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              {property.bedrooms !== undefined && (
                <li className="flex items-center gap-1.5">
                  <BedIcon />
                  {property.bedrooms}
                </li>
              )}
              {property.bathrooms !== undefined && (
                <li className="flex items-center gap-1.5">
                  <BathIcon />
                  {property.bathrooms}
                </li>
              )}
              {size && (
                <li className="flex items-center gap-1.5">
                  <AreaIcon />
                  {size}
                </li>
              )}
              {property.bedrooms === undefined && !size && (
                <li>{PROPERTY_TYPE_LABEL[property.type]}</li>
              )}
            </ul>
            <span className="cine-arrow-btn shrink-0" aria-hidden>
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* --- inline icons: 16px stroke set, inherit currentColor -------------------- */

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function PinIcon() {
  return (
    <svg {...iconProps} className="text-lime-deep">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M2 17h20" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 12h16a1 1 0 0 1 1 1 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 1 1 0 0 1 1-1Z" />
      <path d="M6 12V5a2 2 0 0 1 4 0" />
      <path d="M7 19 6 21M17 19l1 2" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}
