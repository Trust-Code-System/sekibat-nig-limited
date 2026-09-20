import Link from "next/link";
import { ArrowIcon } from "@/components/home/icons";
import { SmartImage } from "@/components/media/SmartImage";
import { EDITORIAL, SIZES } from "@/lib/images";

export function HomeCta() {
  return (
    <section
      className="relative isolate min-h-[88svh] overflow-hidden bg-onyx text-ivory"
      data-nav-tone="dark"
      aria-labelledby="home-cta-heading"
    >
      <div className="absolute inset-0">
        <SmartImage
          src={EDITORIAL.cineCta}
          alt="Dusk light on a residential balcony stack"
          sizes={SIZES.full}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-onyx/80 via-onyx/45 to-onyx/30"
      />

      <div className="relative mx-auto flex min-h-[88svh] w-full max-w-(--container-site) flex-col items-center justify-center px-6 py-28 text-center md:px-12">
        <p className="cine-eyebrow text-ivory/80">Enquiries</p>
        <h2
          id="home-cta-heading"
          className="mt-7 max-w-[16ch] font-sans text-[clamp(2.5rem,1.1rem+5vw,5.5rem)] leading-[0.94] font-medium tracking-[-0.045em]"
        >
          Explore the future of <span className="accent-serif">real estate</span>
        </h2>
        <p className="mt-6 max-w-[40ch] text-base text-ivory/70">
          Tell us about the property, the site, or the building you already hold. We will start
          from there.
        </p>
        <Link href="/contact" className="group mt-12 inline-flex items-center gap-4">
          <span className="cine-arrow-btn">
            <ArrowIcon />
          </span>
          <span className="text-left">
            <span className="block text-sm font-medium text-ivory">Get started</span>
            <span className="mt-0.5 block text-xs text-ivory/60">Start an enquiry</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
