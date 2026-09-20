import Link from "next/link";
import { ArrowIcon } from "@/components/home/icons";
import { SmartImage } from "@/components/media/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { EDITORIAL, SIZES } from "@/lib/images";
import type { Company } from "@/types";

const PILLARS = [
  { label: "Where we work", value: "Lagos & Abuja" },
  { label: "What we hold", value: "Our portfolio, and clients'" },
  { label: "How far we stay", value: "Develop, sell, manage" },
] as const;

export function HomeStory({ company }: { company: Company }) {
  return (
    <section
      className="on-night bg-onyx text-ivory"
      data-nav-tone="dark"
      aria-labelledby="home-story-heading"
    >
      <div className="mx-auto grid w-full max-w-(--container-site) items-center gap-12 px-6 py-24 md:grid-cols-12 md:gap-10 md:px-12 md:py-32">
        <Reveal className="md:col-span-5">
          <p className="cine-eyebrow text-lime">About us</p>
          <h2
            id="home-story-heading"
            className="mt-6 font-sans text-[clamp(2.5rem,1.2rem+4vw,4.5rem)] leading-[0.96] font-medium tracking-[-0.04em]"
          >
            Our <span className="accent-serif">story</span>
          </h2>
          <p className="mt-7 max-w-[42ch] text-base leading-relaxed text-ivory/65">{company.intro}</p>
          <Link href="/about" className="group mt-10 inline-flex items-center gap-4">
            <span className="rounded-full border border-ivory/25 px-6 py-3 text-sm text-ivory transition-colors duration-300 group-hover:border-ivory/50">
              Learn more
            </span>
            <span className="cine-arrow-btn cine-arrow-btn-sm">
              <ArrowIcon />
            </span>
          </Link>
        </Reveal>

        <Reveal delay={80} className="md:col-span-6 md:col-start-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-onyx-soft md:aspect-[5/6]">
            <SmartImage
              src={EDITORIAL.cineStory}
              alt="A Sekibat residential tower, planted balconies against a clear sky"
              sizes={SIZES.half}
            />
          </div>
        </Reveal>
      </div>

      <div className="mx-auto grid w-full max-w-(--container-site) grid-cols-1 gap-8 border-t border-white/10 px-6 py-12 md:grid-cols-3 md:px-12 md:py-16">
        {PILLARS.map((item, i) => (
          <Reveal key={item.label} delay={i * 60}>
            <p className="text-[0.625rem] font-medium tracking-[0.2em] text-ivory/45 uppercase">
              {item.label}
            </p>
            <p className="accent-serif mt-3 text-[clamp(1.75rem,1rem+2vw,2.75rem)] leading-none">
              {item.value}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
