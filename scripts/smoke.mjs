#!/usr/bin/env node
import { chromium } from "playwright";

const base = process.env.SMOKE_BASE ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
const audited = new Set();

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(String(error)));
page.on("requestfailed", (request) => errors.push(`request failed: ${request.url()}`));

async function visit(path) {
  const response = await page.goto(new URL(path, base).toString(), {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  if (!response?.ok()) throw new Error(`${path} returned ${response?.status()}`);
  return response;
}

async function audit(path) {
  await visit(path);
  const issues = await page.evaluate(() => {
    const found = [];
    if (!document.querySelector("main")) found.push("missing main landmark");
    if (document.querySelectorAll("h1").length !== 1) {
      found.push(`expected one h1, found ${document.querySelectorAll("h1").length}`);
    }
    if (!document.title.trim()) found.push("missing document title");
    if (!document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim()) {
      found.push("missing meta description");
    }
    if (document.documentElement.scrollWidth > window.innerWidth + 2) {
      found.push(
        `horizontal overflow: ${document.documentElement.scrollWidth}px at ${window.innerWidth}px`
      );
    }
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length) found.push(`duplicate ids: ${[...new Set(duplicates)].join(", ")}`);
    for (const image of document.querySelectorAll("img")) {
      if (!image.hasAttribute("alt")) found.push(`image without alt: ${image.currentSrc}`);
    }
    for (const control of document.querySelectorAll("input:not([type=hidden]), select, textarea")) {
      const labelled =
        control.labels?.length ||
        control.getAttribute("aria-label") ||
        control.getAttribute("aria-labelledby");
      if (!labelled) {
        found.push(
          `unlabelled control: ${control.tagName.toLowerCase()}[name="${control.name}"]`
        );
      }
    }
    if (document.querySelector('a[href="#"]')) found.push("placeholder hash link is exposed");
    return found;
  });
  if (issues.length) throw new Error(`${path}:\n- ${issues.join("\n- ")}`);
  audited.add(path);
}

const sitemapResponse = await fetch(new URL("/sitemap.xml", base));
if (!sitemapResponse.ok) throw new Error(`/sitemap.xml returned ${sitemapResponse.status}`);
const sitemapXml = await sitemapResponse.text();
const sitemapPaths = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, location]) => new URL(location).pathname
);

for (const path of sitemapPaths) {
  await audit(path);
}

await visit("/robots.txt");

const revalidationProbe = await fetch(new URL("/api/revalidate", base), {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ resource: "properties" }),
});
if (![401, 503].includes(revalidationProbe.status)) {
  throw new Error(`Unauthenticated revalidation returned ${revalidationProbe.status}`);
}

const errorsBeforeExpected404 = errors.length;
const missing = await page.goto(new URL("/this-page-does-not-exist", base).toString(), {
  waitUntil: "networkidle",
});
if (missing?.status() !== 404) throw new Error(`404 route returned ${missing?.status()}`);
await page.getByRole("heading", { name: "This page is not in the ledger." }).waitFor();
// Chromium reports the intentional document-level 404 as a console error. Discard only the
// messages emitted by this expected navigation; every other page remains under error capture.
errors.splice(errorsBeforeExpected404);

await visit("/");
await page.getByRole("button", { name: "Open menu" }).click();
await page.getByRole("link", { name: "Services", exact: true }).first().click();
await page.waitForURL("**/services");
if (await page.getByRole("button", { name: "Close menu" }).count()) {
  throw new Error("Mobile navigation stayed open after route change");
}

await visit("/properties");
await page.getByRole("link", { name: "Ledger" }).click();
await page.waitForURL("**/properties?view=ledger");
if (!(await page.locator("table").count())) throw new Error("Ledger view did not render");

await visit("/properties?city=Epe&type=commercial");
await page.getByText("Nothing matches those filters.").waitFor();
await page.getByRole("link", { name: /Epe.*Remove filter/ }).waitFor();
await page.getByRole("link", { name: /Commercial.*Remove filter/ }).waitFor();

await visit("/properties/sekibat-heights");
await page.getByRole("button", { name: "Enlarge" }).click();
await page.getByRole("dialog").waitFor();
await page.keyboard.press("ArrowRight");
await page.getByText("02 / 04", { exact: true }).waitFor();
await page.getByRole("button", { name: "Close" }).click();

await visit("/contact");
await page.getByRole("button", { name: "Send enquiry" }).click();
await page.getByText("Please check the highlighted fields.").waitFor();

await page.getByLabel("Your name").fill("Amina Yusuf");
await page.getByLabel("Email").fill("amina@example.com");
await page.getByLabel("Message").fill(
  "I would like to discuss an estate management instruction for a property in Lagos."
);
await page.getByRole("button", { name: "Send enquiry" }).click();
await page.getByText("Enquiry received").waitFor({ timeout: 10_000 });

for (const viewport of [
  { width: 320, height: 760 },
  { width: 768, height: 900 },
  { width: 1440, height: 900 },
]) {
  await page.setViewportSize(viewport);
  for (const path of ["/", "/properties", "/services", "/contact"]) {
    await visit(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    if (overflow > 2) {
      const offenders = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .map((element) => ({
            element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
              element.classList.length ? `.${[...element.classList].slice(0, 3).join(".")}` : ""
            }`,
            left: Math.round(element.getBoundingClientRect().left),
            right: Math.round(element.getBoundingClientRect().right),
            width: Math.round(element.getBoundingClientRect().width),
          }))
          .filter((item) => item.right > window.innerWidth + 2 || item.left < -2)
          .slice(0, 8)
      );
      throw new Error(
        `${path} overflows by ${overflow}px at ${viewport.width}px:\n${JSON.stringify(offenders, null, 2)}`
      );
    }
  }
}

await browser.close();

if (errors.length) {
  throw new Error([...new Set(errors)].join("\n"));
}

console.log(
  `Smoke checks passed: ${audited.size} sitemap routes, responsive overflow, document/accessibility invariants, mobile navigation, filters, ledger, gallery, 404, validation and enquiry submission.`
);
