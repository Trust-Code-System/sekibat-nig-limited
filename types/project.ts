export type ProjectStatus = "planned" | "ongoing" | "completed";

export interface Project {
  id: string;
  /** Human-facing reference, mirrors the internal system: PRJ-2026-000014 */
  reference: string;
  slug: string;

  title: string;
  /** Omitted until the project location is confirmed. */
  location?: string;
  projectType: string;

  /** Client name, when supplied. Absence does not establish ownership. */
  client?: string;

  /** Omitted until the construction status is confirmed. */
  status?: ProjectStatus;
  /** ISO date, or undefined while the project is planned/ongoing. */
  completionDate?: string;

  /** Slugs of the services Sekibat provided on this project. */
  services: string[];

  shortDescription: string;
  description: string;

  /** Case-study body. Every field optional so a thin record still renders. */
  brief?: string;
  role?: string;
  work?: string[];
  outcome?: string;

  /** Explicit links to sale listings belonging to this project. */
  propertySlugs?: string[];

  images: string[];
  featured: boolean;
}
