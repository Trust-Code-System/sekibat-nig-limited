import Link from "next/link";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import {
  ButtonLink,
  Container,
  Display,
  Eyebrow,
  Section,
  TextLink,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { EDITORIAL, RATIO, SIZES } from "@/lib/images";
import type { Company, Service } from "@/types";

/**
 * Homepage sections. All presentational — they receive fetched data as props and never await.
 */

/* ---------------------------------------------------------------------- hero */

export function Hero({ company }: { company: Company }) {
  return (
    <section className="border-b border-rule">
      <Container className="pt-16 md:pt-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="flex flex-col justify-center pb-4 md:col-span-5 md:pb-24">
            <Eyebrow>Nigeria &nbsp;/&nbsp; Established property company</Eyebrow>
            <Display as="h1" level={1} className="mt-7">
              {company.positioning}
            </Display>
            <p className="mt-8 max-w-[42ch] text-md text-ink-muted">{company.ownedSide}</p>
            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href="/properties">Explore properties</ButtonLink>
              <TextLink href="/services">Our services</TextLink>
            </div>
          </div>

          <figure className="md:col-span-7 md:pb-24">
            <ImageFrame ratio={RATIO.hero}>
              <SmartImage
                src={EDITORIAL.homeHero}
                alt="A residential development at dusk"
                sizes={SIZES.half}
                priority
              />
            </ImageFrame>
            <figcaption className="label mt-4 flex justify-between gap-4">
              <span>Residential &amp; commercial</span>
              <span>Lagos &amp; Abuja</span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------- services rail */

export function ServicesRail({ services }: { services: Service[] }) {
  return (
    <section className="border-b border-rule">
      <Container>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service, i) => (
            <li
              key={service.slug}
              className="border-b border-rule last:border-b-0 sm:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <Link
                href={`/services/${service.slug}`}
                className="group block py-8 pr-8 transition-colors lg:py-10"
              >
                <span className="label font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 block max-w-[16ch] text-md text-ink transition-colors group-hover:text-clay">
                  {service.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------- ownership split */

/**
 * The two-sided business, stated as two halves of one spread. This is the section that has to
 * do the most work on the homepage: a visitor must understand within one screen that Sekibat
 * both owns property and works on other people's.
 */
export function OwnershipSplit({ company }: { company: Company }) {
  return (
    <Section index="01" label="Who we are" tone="deep">
      <Reveal>
        <Display as="p" level={2} className="max-w-[20ch]">
          We build for ourselves, and for the people who own the rest.
        </Display>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-10 border-t border-rule pt-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <Eyebrow>Our own portfolio</Eyebrow>
          <p className="mt-5 max-w-[44ch] text-md text-ink-muted">{company.ownedSide}</p>
          <div className="mt-8">
            <TextLink href="/properties?ownership=sekibat">Sekibat-owned property</TextLink>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <Eyebrow>Work for clients</Eyebrow>
          <p className="mt-5 max-w-[44ch] text-md text-ink-muted">{company.clientSide}</p>
          <div className="mt-8">
            <TextLink href="/projects">Selected projects</TextLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- plate break */

/** Full-bleed image with the caption set in the margin — a breath between sections. */
export function PlateBreak({
  src = EDITORIAL.homePlate,
  alt,
  caption,
  meta,
}: {
  src?: string;
  alt: string;
  caption: string;
  meta?: string;
}) {
  return (
    <section>
      <ImageFrame ratio={RATIO.plate} className="w-full">
        <SmartImage src={src} alt={alt} sizes={SIZES.full} />
      </ImageFrame>
      <Container className="pt-4">
        <div className="label flex justify-between gap-6">
          <span>{caption}</span>
          {meta && <span>{meta}</span>}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- why sekibat */

export function WhySekibat({ company }: { company: Company }) {
  return (
    <Section index="04" label="Why Sekibat" note="No claims we cannot evidence, just how we work.">
      <dl className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
        {company.values.map((value, i) => (
          <Reveal key={value.title} delay={(i % 2) * 60}>
            <div className="border-t border-rule pt-6">
              <dt className="font-display text-d3 font-normal tracking-[-0.01em]">
                {value.title}
              </dt>
              <dd className="mt-4 max-w-[46ch] text-base text-ink-muted">{value.body}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
