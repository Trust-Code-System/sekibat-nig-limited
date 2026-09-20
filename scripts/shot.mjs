#!/usr/bin/env node
/**
 * Visual gate.
 *
 * Renders a route and screenshots it — but scrolls the whole page first, so scroll-revealed
 * content is actually in its final state when captured. A full-page screenshot taken without
 * scrolling shows reveal-on-scroll sections as blank, which silently hides real regressions.
 *
 * Also reports the two invisible failures: webfonts that fell back, and console errors.
 *
 * Usage: node scripts/shot.mjs <path|url> <out.png> [width] [height] [--no-scroll]
 *   node scripts/shot.mjs /properties shots/properties.png 1440 900
 *   node scripts/shot.mjs / shots/home-mobile.png 390 844
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [target = "/", out = "shot.png", w = "1440", h = "900"] = process.argv.slice(2);
const noScroll = process.argv.includes("--no-scroll");
// --at <y> captures just the viewport at that scroll offset, which is readable at a glance;
// a full-page shot of a long marketing page downscales to an unjudgeable strip.
const atIdx = process.argv.indexOf("--at");
const at = atIdx > -1 ? Number(process.argv[atIdx + 1]) : null;
const base = process.env.SHOT_BASE ?? "http://localhost:3000";
const url = /^https?:\/\//.test(target) ? target : new URL(target, base).toString();

await mkdir(dirname(out), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await page.evaluate(() => document.fonts.ready);

if (!noScroll) {
  // Walk the page so IntersectionObserver reveals fire and lazy images load.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForLoadState("networkidle");
}

await page.waitForTimeout(400);

const fonts = await page.evaluate(() => {
  const seen = new Set();
  document.querySelectorAll("h1,h2,h3,p,button,a,body").forEach((el) => {
    const f = getComputedStyle(el).fontFamily;
    seen.add(f.split(",")[0].replace(/["']/g, ""));
  });
  return [...seen].slice(0, 8);
});

if (at !== null) {
  await page.evaluate((y) => window.scrollTo(0, y), at);
  await page.waitForTimeout(700);
  await page.screenshot({ path: out });
} else {
  await page.screenshot({ path: out, fullPage: true });
}
await browser.close();

console.log(`saved: ${out}  (${w}x${h}${at !== null ? ` @y=${at}` : " fullPage"} @2x)  ${url}`);
console.log(`fonts: ${fonts.join(" | ")}`);
console.log(
  errors.length
    ? `PAGE ERRORS (${errors.length}):\n${[...new Set(errors)].slice(0, 8).join("\n")}`
    : "no console errors"
);
