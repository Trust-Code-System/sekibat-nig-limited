import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getProjects } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Explore Sekibat’s developments, including Wemabod Housing Estate and its homes and land.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const { items } = await getProjects({ perPage: 24, sort: "featured" });

  return (
    <div className="bg-ivory" data-nav-tone="light">
      <PageHeader
        eyebrow="Projects"
        title={
          <>
            Explore our <span className="accent-serif">projects.</span>
          </>
        }
        intro="Discover Wemabod Housing Estate and explore the homes and land within the development."
      />

      <Container className="pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((project, i) => (
            <Reveal key={project.id} delay={(i % 2) * 60}>
              <ProjectCard project={project} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </Container>

      <CtaBand
        eyebrow="Your project"
        title={
          <>
            Something you need <span className="accent-serif">built?</span>
          </>
        }
        body="We take on development, delivery, sales and management instructions for owners across Lagos, Abuja and Ekiti. Tell us what stage you are at."
        primary={{ href: "/contact", label: "Start an enquiry" }}
        secondary={{ href: "/services", label: "See our services" }}
      />
    </div>
  );
}
