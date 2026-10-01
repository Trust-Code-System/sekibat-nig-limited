import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Display, Eyebrow, Prose, Section } from "@/components/ui/primitives";
import {
  getProjectBySlug,
  getProjectSlugs,
  getRelatedProjects,
  getServicesBySlugs,
} from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDate, PROJECT_STATUS_LABEL, statusTone } from "@/lib/format";
import { RATIO, SIZES } from "@/lib/images";
import { breadcrumbJsonLd, buildMetadata, projectJsonLd } from "@/lib/seo";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  return buildMetadata({
    title: `${project.title}, ${project.location}`,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
    image: project.images[0],
    imageAlt: `${project.title}, ${project.location}`,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [services, related] = await Promise.all([
    getServicesBySlugs(project.services),
    getRelatedProjects(slug, 2),
  ]);

  const tone = statusTone(project.status);

  const facts = [
    { label: "Reference", value: project.reference, mono: true },
    { label: "Location", value: project.location },
    { label: "Type", value: project.projectType },
    { label: "Client", value: project.client ?? "Sekibat (own development)" },
    { label: "Status", value: PROJECT_STATUS_LABEL[project.status] },
    ...(project.completionDate
      ? [{ label: "Completed", value: formatDate(project.completionDate) ?? "-" }]
      : []),
  ];

  return (
    <>
      <PageHeader
        tone="dark"
        eyebrow={project.projectType}
        title={project.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title, href: `/projects/${project.slug}` },
        ]}
        aside={
          <div>
            <p className="font-mono text-sm text-lime">{project.reference}</p>
            <p className={cn("mt-4 text-[0.625rem] font-medium tracking-[0.16em] uppercase", tone === "accent" ? "text-lime" : "text-ivory/45")}>
              {PROJECT_STATUS_LABEL[project.status]}
              {project.completionDate && ` · ${formatDate(project.completionDate)}`}
            </p>
            <p className="mt-2 text-[0.625rem] font-medium tracking-[0.16em] text-ivory/45 uppercase">{project.location}</p>
          </div>
        }
      />

      <Container className="py-14 md:py-20" data-nav-tone="light">
        <ImageFrame ratio={RATIO.plate}>
          <SmartImage
            src={project.images[0]}
            alt={`${project.title}, ${project.location}`}
            sizes={SIZES.full}
            priority
          />
        </ImageFrame>
      </Container>

      <Section index="01" label="The work" tone="deep">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Display as="h2" level={3} className="max-w-[24ch]">
              {project.shortDescription}
            </Display>
            <Prose text={project.description} className="mt-8" />

            {project.brief && (
              <div className="mt-14">
                <Eyebrow>The brief</Eyebrow>
                <Prose text={project.brief} className="mt-4" />
              </div>
            )}

            {project.role && (
              <div className="mt-12">
                <Eyebrow>Sekibat&rsquo;s role</Eyebrow>
                <Prose text={project.role} className="mt-4" />
              </div>
            )}

            {project.work && project.work.length > 0 && (
              <div className="mt-12">
                <Eyebrow>Work undertaken</Eyebrow>
                <ol className="mt-5 border-t border-rule">
                  {project.work.map((item, i) => (
                    <li
                      key={item}
                      className="flex gap-6 border-b border-rule py-4 text-base text-ink-muted"
                    >
                      <span className="label font-mono shrink-0 pt-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {project.outcome && (
              <div className="mt-12">
                <Eyebrow>Outcome</Eyebrow>
                <Prose text={project.outcome} className="mt-4" />
              </div>
            )}
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <Eyebrow>Record</Eyebrow>
            <dl className="mt-6 border-t border-rule">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-6 border-b border-rule py-3.5"
                >
                  <dt className="label">{fact.label}</dt>
                  <dd
                    className={cn(
                      "text-right text-base text-ink",
                      fact.mono && "font-mono text-sm text-lime-deep"
                    )}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            {services.length > 0 && (
              <>
                <Eyebrow className="mt-12 block">Services provided</Eyebrow>
                <ul className="mt-5 border-t border-rule">
                  {services.map((service) => (
                    <li key={service.slug} className="border-b border-rule">
                      <Link
                        href={`/services/${service.slug}`}
                        className="block py-3.5 text-base text-ink transition-colors hover:text-lime-deep"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </Section>

      {project.images.length > 1 && (
        <Section index="02" label="Gallery">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {project.images.slice(1).map((src, i) => (
              <ImageFrame key={src} ratio={RATIO.gallery}>
                <SmartImage
                  src={src}
                  alt={`${project.title}, view ${i + 2}`}
                  sizes={SIZES.half}
                />
              </ImageFrame>
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section index="03" label="Related work" tone="deep">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        title={
          <>
            Working on something <span className="accent-serif">similar?</span>
          </>
        }
        body="Tell us where the project has got to and what you need taken on: development, delivery, sales or ongoing management."
        primary={{ href: "/contact", label: "Start an enquiry" }}
        secondary={{ href: "/projects", label: "All projects" }}
      />

      <JsonLd data={projectJsonLd(project)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
    </>
  );
}
