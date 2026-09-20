import type { MetadataRoute } from "next";
import { getProjectSlugs, getPropertySlugs, getServiceSlugs } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [propertySlugs, projectSlugs, serviceSlugs] = await Promise.all([
    getPropertySlugs(),
    getProjectSlugs(),
    getServiceSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/properties"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/projects"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  const records: MetadataRoute.Sitemap = [
    ...propertySlugs.map((slug) => ({
      url: absoluteUrl(`/properties/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...projectSlugs.map((slug) => ({
      url: absoluteUrl(`/projects/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...serviceSlugs.map((slug) => ({
      url: absoluteUrl(`/services/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...records];
}
