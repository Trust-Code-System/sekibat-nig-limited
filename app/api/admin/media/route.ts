import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { signedIn } from "@/lib/cms/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await signedIn())) return Response.json({ error: "Sign in before uploading an image." }, { status: 401 });
  const origin = request.headers.get("origin");
  // Next's internal URL may use localhost even when the browser uses 127.0.0.1.
  // Compare the browser origin with the incoming Host header, including its port.
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).host === request.headers.get("host") && /^https?:$/.test(new URL(origin).protocol)); } catch { /* Invalid origin is rejected below. */ }
  if (!sameOrigin) return Response.json({ error: "Invalid upload origin." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024) return Response.json({ error: "Choose an image smaller than 8 MB." }, { status: 413 });
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) return Response.json({ error: "Choose an image smaller than 8 MB." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? "jpg" : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png" : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
    if (!extension) return Response.json({ error: "Use a JPEG, PNG or WebP image." }, { status: 400 });
    const name = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "media", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), bytes, { flag: "wx" });
    return Response.json({ src: `/media/uploads/${name}` });
  } catch { return Response.json({ error: "The image could not be uploaded. Check server storage and try again." }, { status: 500 }); }
}
