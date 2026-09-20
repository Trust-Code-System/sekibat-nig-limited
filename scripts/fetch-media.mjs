/**
 * Downloads the placeholder photography listed in media-manifest.mjs into public/media/.
 * Dev-only utility. Re-running skips files that already exist (pass --force to refetch).
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { MEDIA, CROPS } from "./media-manifest.mjs";

const OUT = join(process.cwd(), "public", "media");
const force = process.argv.includes("--force");
const WIDTH = 2000;

const exists = (p) => access(p).then(() => true, () => false);

let done = 0, skipped = 0, failed = 0;
// Only re-crop what was actually (re)downloaded this run.
const cropNeeded = new Set();

await Promise.all(
  Object.entries(MEDIA).map(async ([rel, id]) => {
    const out = join(OUT, rel);
    if (!force && (await exists(out))) { skipped++; return; }
    const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${WIDTH}&q=75`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, Buffer.from(await res.arrayBuffer()));
      done++;
      cropNeeded.add(rel);
    } catch (err) {
      failed++;
      console.error(`FAIL ${rel} (${id}): ${err.message}`);
    }
  })
);

// Apply the documented crops. See CROPS in media-manifest.mjs for why each one exists.
const toCrop = Object.entries(CROPS).filter(([rel]) => cropNeeded.has(rel));
if (toCrop.length) {
  const browser = await chromium.launch();
  for (const [rel, { top = 0, bottom = 0 }] of toCrop) {
    const file = join(OUT, rel);
    const page = await browser.newPage();
    await page.goto(pathToFileURL(file).href);
    const box = await page.evaluate(() => {
      const img = document.querySelector("img");
      return { w: img.naturalWidth, h: img.naturalHeight };
    });
    await page.setViewportSize({ width: box.w, height: box.h });
    await page.evaluate(() => {
      const img = document.querySelector("img");
      document.body.style.margin = "0";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.display = "block";
    });
    const y = Math.round(box.h * top);
    const h = box.h - y - Math.round(box.h * bottom);
    await page.screenshot({
      path: file,
      type: "jpeg",
      quality: 84,
      clip: { x: 0, y, width: box.w, height: h },
    });
    await page.close();
    console.log(`cropped ${rel} -> ${box.w}x${h}`);
  }
  await browser.close();
}

console.log(`downloaded ${done}, skipped ${skipped}, failed ${failed}`);
if (failed) process.exit(1);
