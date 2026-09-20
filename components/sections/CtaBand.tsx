import type { ReactNode } from "react";
import { SmartImage } from "@/components/media/SmartImage";
import { CineAction } from "@/components/ui/CineAction";
import { Container } from "@/components/ui/primitives";
import { EDITORIAL, SIZES } from "@/lib/images";

export function CtaBand({
  eyebrow = "Enquiries",
  title,
  body,
  primary = { href: "/contact", label: "Start an enquiry" },
  secondary,
}: {
  eyebrow?: string;
  title: ReactNode;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section
      className="on-night relative isolate overflow-hidden bg-onyx text-ivory"
      data-nav-tone="dark"
    >
      <div className="absolute inset-0 opacity-40">
        <SmartImage
          src={EDITORIAL.cineCta}
          alt="Dusk light on a residential balcony stack"
          sizes={SIZES.full}
        />
      </div>
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-onyx via-onyx/80 to-onyx/55" />

      <Container className="relative py-24 md:py-32">
        <p className="cine-eyebrow text-ivory/75">{eyebrow}</p>
        <h2 className="mt-6 max-w-[16ch] font-sans text-[clamp(2.25rem,1rem+3.8vw,4.25rem)] leading-[0.96] font-medium tracking-[-0.04em]">
          {title}
        </h2>
        <p className="mt-6 max-w-[46ch] text-md text-ivory/65">{body}</p>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <CineAction href={primary.href} invert>
            {primary.label}
          </CineAction>
          {secondary && (
            <CineAction href={secondary.href} invert caption="Keep browsing">
              {secondary.label}
            </CineAction>
          )}
        </div>
      </Container>
    </section>
  );
}
