import { cache } from "react";
import { projects } from "@/data/projects";
import type { Project } from "@/types";
import { apiPath, CACHE_TAGS, remoteOrLocal, remoteOrLocalNullable } from "./client";
import { DEFAULT_PER_PAGE, type Paged, type ProjectQuery, type ProjectSortKey } from "./types";

/** Project repository. Mirrors the property repository contract exactly. */

const STATUS_RANK: Record<Project["status"], number> = {
  ongoing: 0,
  completed: 1,
  planned: 2,
};

/** Ongoing projects have no completion date; sort them to the front of "newest". */
function recencyKey(p: Project): string {
  return p.completionDate ?? "9999-12-31";
}

function matches(p: Project, q: ProjectQuery): boolean {
  if (q.q) {
    const needle = q.q.toLowerCase();
    const haystack = [p.title, p.reference, p.location, p.projectType, p.shortDescription]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (q.status?.length && !q.status.includes(p.status)) return false;
  if (q.service && !p.services.includes(q.service)) return false;
  if (q.featured !== undefined && p.featured !== q.featured) return false;
  return true;
}

function compare(a: Project, b: Project, sort: ProjectSortKey): number {
  switch (sort) {
    case "newest":
      return recencyKey(b).localeCompare(recencyKey(a));
    case "title-asc":
      return a.title.localeCompare(b.title);
    case "featured":
    default:
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) {
        return STATUS_RANK[a.status] - STATUS_RANK[b.status];
      }
      return recencyKey(b).localeCompare(recencyKey(a));
  }
}

function localProjects(query: ProjectQuery): Paged<Project> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const filtered = projects
    .filter((p) => matches(p, query))
    .sort((a, b) => compare(a, b, query.sort ?? "featured"));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * perPage;

  return { items: filtered.slice(start, start + perPage), total, page, perPage, totalPages };
}

export const getProjects = cache(async (query: ProjectQuery = {}): Promise<Paged<Project>> => {
  return remoteOrLocal(
    apiPath("/projects", { ...query, status: query.status }),
    [CACHE_TAGS.projects],
    () => localProjects(query)
  );
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  return remoteOrLocalNullable(
    `/projects/${encodeURIComponent(slug)}`,
    [CACHE_TAGS.projects, CACHE_TAGS.project(slug)],
    () => projects.find((p) => p.slug === slug) ?? null
  );
});

export const getFeaturedProjects = cache(async (limit = 3): Promise<Project[]> => {
  const { items } = await getProjects({ featured: true, perPage: limit });
  return items;
});

export const getRelatedProjects = cache(
  async (slug: string, limit = 2): Promise<Project[]> => {
    return remoteOrLocal(
      apiPath(`/projects/${encodeURIComponent(slug)}/related`, { limit }),
      [CACHE_TAGS.projects, CACHE_TAGS.project(slug)],
      async () => {
        const current = await getProjectBySlug(slug);
        if (!current) return [];

        const shared = (p: Project) =>
          p.services.filter((s) => current.services.includes(s)).length;

        return projects
          .filter((p) => p.slug !== slug)
          .sort((a, b) => shared(b) - shared(a) || compare(a, b, "featured"))
          .slice(0, limit);
      }
    );
  }
);

/** Projects that used a given service, powers the related work rail on a service page. */
export const getProjectsByService = cache(
  async (serviceSlug: string, limit = 3): Promise<Project[]> => {
    const { items } = await getProjects({ service: serviceSlug, perPage: limit });
    return items;
  }
);

export const getProjectSlugs = cache(async (): Promise<string[]> => {
  return remoteOrLocal("/projects/slugs", [CACHE_TAGS.projects], () =>
    projects.map((p) => p.slug)
  );
});
