import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/api/client";

const bodySchema = z.object({
  resource: z.enum(["properties", "projects", "services", "company"]),
  slug: z.string().trim().min(1).max(160).optional(),
});

function secretsMatch(received: string | null, expected: string): boolean {
  if (!received) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const secret = process.env.SEKIBAT_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "Revalidation is not configured" },
      { status: 503 }
    );
  }

  if (!secretsMatch(request.headers.get("x-revalidation-secret"), secret)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid revalidation payload" },
      { status: 400 }
    );
  }

  const { resource, slug } = parsed.data;
  const tags = new Set<string>();

  if (resource === "properties") {
    tags.add(CACHE_TAGS.properties);
    if (slug) tags.add(CACHE_TAGS.property(slug));
  } else if (resource === "projects") {
    tags.add(CACHE_TAGS.projects);
    if (slug) tags.add(CACHE_TAGS.project(slug));
  } else if (resource === "services") {
    tags.add(CACHE_TAGS.services);
  } else {
    tags.add(CACHE_TAGS.company);
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ ok: true, revalidated: [...tags] });
}
