export interface Service {
  id: string;
  slug: string;
  title: string;
  /** Short label used in rails and tag lists. */
  shortTitle: string;
  summary: string;
  description: string;
  /** What the service actually covers, as discrete deliverables. */
  capabilities: { title: string; body: string }[];
  /** Who this is for — keeps the two-sided business legible. */
  audience: string;
  image: string;
  order: number;
}
