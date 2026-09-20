import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Display, Eyebrow, Prose, Section } from "@/components/ui/primitives";
import {
  getProjectsByService,
  getServiceBySlug,
  getServices,
  getServiceSlugs,
} from "@/lib/api";
import { RATIO, SIZES } from "@/lib/images";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };

  return buildMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
    image: service.image,
    imageAlt: `${service.title} by Sekibat`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
  ]);
  if (!service) notFound();

  const projects = await getProjectsByService(service.slug, 2);
  const serviceIndex = allServices.findIndex((item) => item.slug === service.slug);

  return (
    <>
      <PageHeader
        tone="dark"
        eyebrow="Service"
        title={service.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.shortTitle, href: `/services/${service.slug}` },
        ]}
        aside={
          <div>
            <p className="font-mono text-sm text-lime">
              Service {String(serviceIndex + 1).padStart(2, "0")} / {String(allServices.length).padStart(2, "0")}
            </p>
            <p className="mt-4 max-w-[36ch] text-base text-ivory/65">{service.summary}</p>
          </div>
        }
      />

      <Container className="py-14 md:py-20" data-nav-tone="light">
        <ImageFrame ratio={RATIO.plate}>
          <SmartImage
            src={service.image}
            alt={`${service.title} by Sekibat`}
            sizes={SIZES.full}
            priority
          />
        </ImageFrame>
      </Container>

      <Section index="01" label="The instruction" tone="deep">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Display as="h2" level={3} className="max-w-[24ch]">
              {service.summary}
            </Display>
            <Prose text={service.description} className="mt-8" />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Eyebrow>Who it is for</Eyebrow>
            <p className="mt-5 border-t border-rule pt-5 text-md text-ink-muted">
              {service.audience}
            </p>
          </div>
        </div>
      </Section>

      <Section
        index="02"
        label="Scope"
        note="The exact scope is agreed against the property, programme and owner’s requirements."
      >
        <ol className="border-t border-rule">
          {service.capabilities.map((capability, index) => (
            <li
              key={capability.title}
              className="grid grid-cols-1 gap-4 border-b border-rule py-7 sm:grid-cols-12 sm:gap-8"
            >
              <span className="label font-mono text-lime-deep sm:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-xl font-normal sm:col-span-4">
                {capability.title}
              </h2>
              <p className="max-w-[54ch] text-base text-ink-muted sm:col-span-7">
                {capability.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {projects.length > 0 && (
        <Section index="03" label="Related work" tone="deep">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        eyebrow={service.shortTitle}
        title={
          <>
            Tell us what needs to happen <span className="accent-serif">next.</span>
          </>
        }
        body={`If you are considering ${service.title.toLowerCase()}, send us the location, the current stage and what you need taken on.`}
        primary={{ href: "/contact", label: "Start an enquiry" }}
        secondary={{ href: "/services", label: "All services" }}
      />

      <JsonLd data={serviceJsonLd(service)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />
    </>
  );
}
