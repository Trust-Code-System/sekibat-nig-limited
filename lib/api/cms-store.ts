import "server-only";
import { mkdir, readFile, rename, writeFile, rm, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { company } from "@/data/company";
import { properties } from "@/data/properties";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { schemas, type Collection, type Content, type Entry, type HomeContent } from "@/lib/cms/schema";

// Content lives on a separately provisioned persistent disk, not in the build trace.
const directory = path.resolve(/* turbopackIgnore: true */ process.env.SEKIBAT_CMS_DIR || path.join(process.cwd(), ".cms"));
const filename = path.join(directory, "content.json");
const homepage: HomeContent = {
  eyebrow: "Innovative living", heading: "Elevate your space with", headingAccent: "smart design.",
  introduction: "Discover modern living spaces reimagined through architecture we build, own and look after across Lagos and Abuja.",
  heroImage: "/media/properties/sekibat-heights-01.jpg", storyImage: "/media/editorial/home-hero.jpg", ctaImage: "/media/properties/ikoyi-garden-plaza-01.jpg",
  ctaHeading: "Explore the future of", ctaAccent: "real estate", ctaBody: "Tell us about the property, the site, or the building you already hold. We will start from there.", ctaLabel: "Get started",
};
function seed(): Entry[] {
  const groups = { company: [company], homepage: [homepage], properties, projects, services };
  return Object.entries(groups).flatMap(([collection, records]) => records.map((record) => {
    const data = JSON.parse(JSON.stringify(record)) as Content;
    return { id: String(data.id || collection), collection: collection as Collection, draft: data, published: data, revision: 0, updatedAt: null };
  }));
}
export async function readEntries(): Promise<Entry[]> {
  try { return JSON.parse(await readFile(filename, "utf8")) as Entry[]; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return seed(); throw error; }
}
export async function publishedRecords<T>(collection: Collection): Promise<T[]> {
  return (await readEntries()).filter((e) => e.collection === collection && e.published).map((e) => e.published as T);
}
export async function getHomepage(): Promise<HomeContent> { return (await publishedRecords<HomeContent>("homepage"))[0] || homepage; }

/** Atomic writes, an inter-process lock and optimistic revisions for a single Node host. */
export async function mutateEntry(input: { collection: Collection; id: string; revision: number; operation: "draft" | "publish" | "unpublish"; data: unknown }) {
  if (process.env.SEKIBAT_API_URL?.trim()) throw new Error("The remote API is active. Disable it before using the built-in CMS.");
  await mkdir(directory, { recursive: true });
  const lock = path.join(directory, "write.lock");
  let acquired = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { await mkdir(lock); acquired = true; break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; await new Promise((resolve) => setTimeout(resolve, 50)); }
  }
  if (!acquired) throw new Error("Content is busy. Try again shortly. If this persists, ask your administrator to check the storage lock.");
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const entries = await readEntries();
    const existing = entries.find((e) => e.collection === input.collection && e.id === input.id);
    if ((existing?.revision ?? 0) !== input.revision) throw new Error("This record changed in another session. Reload before saving to avoid overwriting those changes.");
    if (!existing && ["company", "homepage"].includes(input.collection)) throw new Error("This page already exists.");
    if (input.operation === "unpublish" && ["company", "homepage"].includes(input.collection)) throw new Error("The homepage and company details must remain published.");
    const data = schemas[input.collection].parse(input.operation === "unpublish" && existing ? existing.draft : input.data) as Content;
    if ("id" in data && data.id !== input.id) throw new Error("The record ID cannot be changed.");
    if (data.slug && entries.some((e) => e.collection === input.collection && e.id !== input.id && (e.draft.slug === data.slug || e.published?.slug === data.slug))) throw new Error("That URL is already used. Choose a unique slug.");
    if (input.operation === "publish") {
      const media = [data.image, data.heroImage, data.storyImage, data.ctaImage, ...(Array.isArray(data.images) ? data.images : [])].filter((v): v is string => typeof v === "string");
      const library = new Set(await mediaLibrary());
      if (media.some((src) => !library.has(src))) throw new Error("An image is missing. Choose an image from the media library before publishing.");
      if (input.collection === "projects" && (data.services as string[]).some((slug) => !entries.some((e) => e.collection === "services" && e.published?.slug === slug))) throw new Error("Choose published services for this project.");
    }
    const entry: Entry = { id: input.id, collection: input.collection, draft: data, published: input.operation === "publish" ? data : input.operation === "unpublish" ? null : existing?.published ?? null, revision: (existing?.revision ?? 0) + 1, updatedAt: new Date().toISOString() };
    if (existing) entries[entries.indexOf(existing)] = entry; else entries.push(entry);
    await writeFile(temporary, JSON.stringify(entries, null, 2), { encoding: "utf8", mode: 0o600 });
    await rename(temporary, filename);
    return entry;
  } finally { await rm(temporary, { force: true }); await rm(lock, { recursive: true, force: true }); }
}
export async function mediaLibrary(): Promise<string[]> {
  const root = path.join(process.cwd(), "public", "media");
  async function walk(dir: string): Promise<string[]> {
    const items = await readdir(dir, { withFileTypes: true });
    return (await Promise.all(items.map((item) => item.isDirectory() ? walk(path.join(dir, item.name)) : Promise.resolve(/\.(jpg|jpeg|png|webp|avif)$/i.test(item.name) ? ["/media/" + path.relative(root, path.join(dir, item.name)).split(path.sep).join("/")] : [])))).flat();
  }
  return (await walk(root)).sort();
}
