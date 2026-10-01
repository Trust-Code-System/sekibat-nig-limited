import { z } from "zod";

const text = z.string().trim().min(1, "This field is required.").max(20000);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(120);
const image = z.string().regex(/^\/media\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp|avif)$/, "Choose an image from the media library.");
const optionalText = z.string().trim().max(20000).optional();
const number = z.number().finite().nonnegative().optional();
const pair = z.object({ title: text, body: text });
const identity = { id: text, slug, title: text };
export const schemas = {
  properties: z.object({ ...identity, reference: text, location: z.object({ city: text, state: text, address: optionalText }), type: z.enum(["residential", "commercial", "land", "mixed-use"]), status: z.enum(["available", "sold", "leased", "under-development", "completed"]), ownership: z.enum(["sekibat", "client"]), shortDescription: text, description: text, price: number, currency: z.literal("NGN").optional(), bedrooms: z.number().int().nonnegative().optional(), bathrooms: z.number().int().nonnegative().optional(), size: number, sizeUnit: z.literal("sqm").optional(), features: z.array(text).max(50), images: z.array(image).min(1).max(30), featured: z.boolean(), listedAt: z.iso.date() }),
  projects: z.object({ ...identity, reference: text, location: text, projectType: text, client: optionalText, status: z.enum(["planned", "ongoing", "completed"]), completionDate: z.iso.date().optional(), services: z.array(slug).max(30), shortDescription: text, description: text, brief: optionalText, role: optionalText, work: z.array(text).max(50).optional(), outcome: optionalText, images: z.array(image).min(1).max(30), featured: z.boolean() }),
  services: z.object({ ...identity, shortTitle: text, summary: text, description: text, capabilities: z.array(pair).min(1).max(30), audience: text, image, order: z.number().int().nonnegative() }),
  company: z.object({ name: text, legalName: text, positioning: text, ownedSide: text, clientSide: text, intro: text, values: z.array(pair).min(1).max(30), contact: z.object({ addressLines: z.array(text).min(1).max(10), phone: text, email: z.email(), hours: text, isPlaceholder: z.boolean() }), social: z.array(z.object({ label: text, href: z.union([z.literal("#"), z.url().refine((v) => /^https:\/\//.test(v), "Use an https:// link.")]) })).max(20) }),
  homepage: z.object({ eyebrow: text, heading: text, headingAccent: text, introduction: text, heroImage: image, storyImage: image, ctaImage: image, ctaHeading: text, ctaAccent: text, ctaBody: text, ctaLabel: text }),
};
export type Collection = keyof typeof schemas;
export type HomeContent = z.infer<typeof schemas.homepage>;
export type Content = Record<string, unknown>;
export interface Entry { id: string; collection: Collection; draft: Content; published: Content | null; revision: number; updatedAt: string | null }
export const COLLECTIONS: { key: Collection; label: string; description: string }[] = [
  { key: "homepage", label: "Homepage", description: "Opening copy, photography and enquiry section" },
  { key: "company", label: "Company & contact", description: "About Sekibat, values and contact information" },
  { key: "properties", label: "Properties", description: "The public property catalogue" },
  { key: "projects", label: "Projects", description: "Development work and case studies" },
  { key: "services", label: "Services", description: "Service descriptions and capabilities" },
];
export function isCollection(value: string): value is Collection { return Object.hasOwn(schemas, value); }
