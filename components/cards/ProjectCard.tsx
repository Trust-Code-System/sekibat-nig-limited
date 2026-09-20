import Link from "next/link";
import { ArrowIcon } from "@/components/home/icons";
import { SmartImage } from "@/components/media/SmartImage";
import { formatDate, PROJECT_STATUS_LABEL } from "@/lib/format";
import { SIZES } from "@/lib/images";
import type { Project } from "@/types";

export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  index?: number;
  total?: number;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <article className="cine-card group h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(12,14,10,0.05),0_12px_32px_-16px_rgba(12,14,10,0.18)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ivory-deep">
          <SmartImage
            src={project.images[0]}
            alt={`${project.title}, ${project.location}`}
            sizes={SIZES.cardWide}
            priority={priority}
            className="transition-transform duration-700 ease-(--ease-editorial) group-hover:scale-[1.05]"
          />
        </div>

        <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
          <p className="text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
            {PROJECT_STATUS_LABEL[project.status]}
            {project.completionDate && ` · ${formatDate(project.completionDate)}`}
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">{project.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <span className="text-lime-deep" aria-hidden>
              ▸
            </span>
            {project.location}
            <span aria-hidden className="text-rule">
              ·
            </span>
            {project.projectType}
          </p>
          <p className="mt-3 max-w-[46ch] text-sm text-ink-muted">{project.shortDescription}</p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-rule pt-4">
            <p className="text-sm text-ink-muted">
              {project.client ? `Client: ${project.client}` : "Sekibat-owned development"}
            </p>
            <span className="cine-arrow-btn cine-arrow-btn-sm shrink-0" aria-hidden>
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
