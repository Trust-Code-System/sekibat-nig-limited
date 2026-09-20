import Link from "next/link";
import { HomePropertyCard } from "@/components/home/HomePropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Property } from "@/types";

export function HomeProperties({ properties }: { properties: Property[] }) {
  return (
    <section className="bg-ivory" data-nav-tone="light" aria-labelledby="home-properties-heading">
      <div className="mx-auto w-full max-w-(--container-site) px-6 pt-6 pb-24 md:px-12 md:pb-32">
        <h2 id="home-properties-heading" className="only-rm font-sans text-d2 font-medium tracking-[-0.04em] text-ink">
          Explore our <span className="accent-mark">properties</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property, i) => (
            <Reveal key={property.id} delay={i * 60}>
              <HomePropertyCard property={property} priority={i < 2} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link href="/properties" className="group inline-flex items-center gap-3 text-sm font-medium text-ink">
            View all properties
            <span className="cine-arrow-btn cine-arrow-btn-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
