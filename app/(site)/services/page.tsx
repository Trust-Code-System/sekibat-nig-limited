import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/home/icons";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getServices } from "@/lib/api";
import { cn } from "@/lib/cn";
import { RATIO, SIZES } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Property development and management, sales and marketing, maintenance, estate management and project management in Nigeria.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="bg-ivory" data-nav-tone="light">
      <PageHeader
        eyebrow="Services"
        title={
          <>
            Five disciplines, held as <span className="accent-serif">one.</span>
          </>
        }
        intro="Engage Sekibat for one defined instruction or keep the same team from site appraisal through occupation and ongoing management."
      />

      <Container className="pb-20 md:pb-28">
        <ol className="space-y-6">
          {services.map((service, index) => (
            <li key={service.slug}>
              <Reveal>
                <article className="cine-card group grid grid-cols-1 items-center gap-8 rounded-3xl bg-white p-4 md:grid-cols-12 md:gap-10 md:p-6">
                  <Link
                    href={`/services/${service.slug}`}
                    className={cn("md:col-span-5", index % 2 === 1 && "md:col-start-8")}
                  >
                    <ImageFrame ratio={RATIO.gallery}>
                      <SmartImage
                        src={service.image}
                        alt={`${service.title} by Sekibat`}
                        sizes={SIZES.half}
                        priority={index < 2}
                        className="transition-transform duration-700 ease-(--ease-editorial) group-hover:scale-[1.05]"
                      />
                    </ImageFrame>
                  </Link>

                  <div
                    className={cn(
                      "px-2 pb-4 md:col-span-6 md:px-2 md:pb-0",
                      index % 2 === 0 ? "md:col-start-7" : "md:col-start-1 md:row-start-1"
                    )}
                  >
                    <p className="font-mono text-[0.625rem] tracking-[0.18em] text-ink-faint uppercase">
                      {String(index + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 max-w-[16ch] font-sans text-[clamp(1.75rem,1rem+2vw,2.75rem)] leading-[1.02] font-medium tracking-[-0.03em]">
                      <Link href={`/services/${service.slug}`} className="transition-colors hover:text-lime-deep">
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-5 max-w-[48ch] text-md text-ink-muted">{service.summary}</p>
                    <p className="mt-4 text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase">
                      For {service.audience}
                    </p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/link mt-8 inline-flex items-center gap-3 text-sm font-medium"
                    >
                      View service
                      <span className="cine-arrow-btn cine-arrow-btn-sm">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>

      <CtaBand
        eyebrow="An instruction"
        title={
          <>
            Not sure where one service <span className="accent-serif">ends?</span>
          </>
        }
        body="That is often the point. Tell us the state of the property now and the outcome you need; we will map the work around it."
        primary={{ href: "/contact", label: "Discuss the work" }}
        secondary={{ href: "/projects", label: "See related projects" }}
      />
    </div>
  );
}
