"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowIcon } from "@/components/home/icons";
import { SmartImage } from "@/components/media/SmartImage";
import { EDITORIAL, SIZES } from "@/lib/images";
import type { Property } from "@/types";

/**
 * The pinned opening scene: a full-viewport dusk photograph that, as the user scrolls,
 * clips into a centred arch while ivory washes in and the "Explore our properties" heading
 * rises — the reference video's signature transition.
 *
 * Everything is a pure function of one CSS variable (`--p`, 0→1 across the 260vh track),
 * written directly to the DOM from a rAF scroll loop: no React re-renders, fully scrubbed,
 * and it reverses naturally when the user scrolls back up. Without JS, `--p` stays 0 and
 * the scene degrades to a static hero followed by the properties section.
 */
export function CinematicHero({ featured }: { featured?: Property }) {
  const trackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.dataset.navTone = "dark";
      return;
    }

    let raf = 0;
    const write = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      track.style.setProperty("--p", p.toFixed(4));
      track.dataset.navTone = p > 0.38 ? "light" : "dark";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className="cine-track"
      data-nav-tone="dark"
      aria-label="Introduction"
    >
      <div className="cine-stage">
        <div className="cine-ivory absolute inset-0" aria-hidden />

        <div className="cine-media absolute inset-0">
          <div className="cine-media-zoom absolute inset-0">
            <SmartImage
              src={EDITORIAL.cineHero}
              alt="A Sekibat residential house at dusk, interior lights glowing"
              sizes={SIZES.full}
              priority
            />
          </div>
        </div>

        <div
          aria-hidden
          className="cine-shade absolute inset-0 bg-linear-to-t from-onyx/70 via-onyx/15 to-onyx/20"
        />

        <div className="cine-hero-copy pointer-events-none absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-(--container-site) px-6 pb-28 md:px-12 md:pb-24">
            <p className="cine-eyebrow text-ivory/80">Innovative living</p>
            <h1 className="mt-6 max-w-[16ch] font-sans text-[clamp(2.75rem,1.2rem+6.4vw,6.25rem)] leading-[0.94] font-medium tracking-[-0.045em] text-ivory">
              Elevate your space with{" "}
              <span className="accent-serif tracking-[-0.02em]">smart design.</span>
            </h1>
            <p className="mt-7 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ivory/70">
              Discover modern living spaces reimagined through architecture we build,
              own and look after across Lagos and Abuja.
            </p>
          </div>

          {featured && (
            <Link
              href={`/properties/${featured.slug}`}
              className="cine-hotspot pointer-events-auto"
            >
              <span className="cine-hotspot-dot" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[0.625rem] font-medium tracking-[0.18em] text-ivory/55 uppercase">
                  Featured home
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-ivory">
                  {featured.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ivory/60">
                  {featured.location.city}, {featured.location.state}
                </span>
              </span>
              <span className="cine-arrow-btn cine-arrow-btn-sm shrink-0">
                <ArrowIcon />
              </span>
            </Link>
          )}

          <div className="absolute right-6 bottom-10 md:right-12 md:bottom-12">
            <Link href="/properties" className="group pointer-events-auto flex items-center gap-4">
              <span className="cine-arrow-btn">
                <ArrowIcon />
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-medium text-ivory">Explore properties</span>
                <span className="mt-0.5 block text-xs text-ivory/60">Your journey starts here</span>
              </span>
            </Link>
          </div>

          <div
            aria-hidden
            className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 md:block"
          >
            <span className="cine-scroll-cue block" />
          </div>
        </div>

        <div className="cine-arch-heading pointer-events-none absolute inset-x-0 top-[56%] px-6 text-center md:top-[58%]">
          <h2 className="font-sans text-[clamp(2.25rem,1rem+5vw,5rem)] leading-[0.98] font-medium tracking-[-0.04em] text-ink">
            Explore our <span className="accent-mark">properties</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-sm text-ink-muted">
            Homes and commercial spaces we have built, own and look after, held to the same
            standard whether they are ours or a client&rsquo;s.
          </p>
        </div>
      </div>
    </section>
  );
}
