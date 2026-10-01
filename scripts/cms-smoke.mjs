import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.SMOKE_BASE || "http://127.0.0.1:3000";
const env = await readFile(".env.local", "utf8").catch(() => "");
const localEnv = (name) => env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2");
const password = process.env.SEKIBAT_ADMIN_PASSWORD || localEnv("SEKIBAT_ADMIN_PASSWORD");
assert(password, "Configure SEKIBAT_ADMIN_PASSWORD before running CMS checks.");
const directory = path.resolve(process.env.SEKIBAT_CMS_DIR || localEnv("SEKIBAT_CMS_DIR") || ".cms");
const storage = path.join(directory, "content.json");
const backup = await readFile(storage).catch((error) => { if (error.code !== "ENOENT") throw error; return null; });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
let uploaded;
page.on("pageerror", (error) => errors.push(error.message));
async function signIn(target) {
  await target.goto(`${base}/admin`);
  await target.getByLabel("Administrator password").fill(password);
  await target.getByRole("button", { name: "Sign in →" }).click();
  await target.getByRole("heading", { name: "A place for your next update." }).waitFor();
}
async function openHome(target) { await target.getByRole("button", { name: "Edit homepage" }).click(); await target.getByLabel("Heading", { exact: true }).waitFor(); }
try {
  await page.goto(`${base}/admin`);
  assert(new URL(page.url()).pathname === "/admin/login", "Admin must redirect signed-out visitors.");
  const denied = await page.request.post(`${base}/api/admin/media`, { multipart: { file: { name: "test.jpg", mimeType: "image/jpeg", buffer: Buffer.from("invalid") } } });
  assert.equal(denied.status(), 401, "Uploads require authentication.");
  await page.getByLabel("Administrator password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in →" }).click();
  await page.getByRole("alert").filter({ hasText: "incorrect" }).waitFor();
  await signIn(page);
  await mkdir(".artifacts", { recursive: true });
  await page.screenshot({ path: ".artifacts/cms-overview.png", fullPage: true });
  await openHome(page);
  const original = await page.getByLabel("Heading", { exact: true }).inputValue();
  const next = "CMS smoke check heading";
  await page.getByLabel("Heading", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  const publicPage = await context.newPage();
  await publicPage.goto(base);
  assert((await publicPage.locator("h1").textContent()).includes(original), "A draft must not change the public homepage.");
  await page.reload();
  await openHome(page);
  assert.equal(await page.getByLabel("Heading", { exact: true }).inputValue(), next, "Drafts must survive reloads.");
  // Two editors start from the same revision; the second must never overwrite the first.
  const stale = await context.newPage();
  await stale.goto(`${base}/admin`);
  await openHome(stale);
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await publicPage.reload();
  assert((await publicPage.locator("h1").textContent()).includes(next), "Published changes must reach public pages.");
  await stale.getByLabel("Heading", { exact: true }).fill("Stale editor change");
  await stale.getByRole("button", { name: "Save draft", exact: true }).click();
  await stale.getByRole("alert").filter({ hasText: "another session" }).waitFor();
  await page.getByLabel("Heading", { exact: true }).fill("");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("alert").filter({ hasText: "required" }).waitFor();
  await page.getByLabel("Heading", { exact: true }).fill(original);
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  const invalidUpload = await page.request.post(`${base}/api/admin/media`, { headers: { origin: base }, multipart: { file: { name: "fake.jpg", mimeType: "image/jpeg", buffer: Buffer.from("invalid") } } });
  assert.equal(invalidUpload.status(), 400, "Upload validation must inspect file contents.");
  const upload = await page.request.post(`${base}/api/admin/media`, { headers: { origin: base }, multipart: { file: { name: "photo.jpg", mimeType: "image/jpeg", buffer: await readFile("public/media/properties/sekibat-heights-01.jpg") } } });
  assert.equal(upload.status(), 200);
  uploaded = (await upload.json()).src;
  assert.equal((await page.request.get(`${base}${uploaded}`)).status(), 200, "Uploaded photos must be served.");
  await page.getByRole("button", { name: "Change photograph" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0, "Escape closes the media picker.");
  await page.goto(`${base}/admin`);
  await page.getByRole("button", { name: "Properties", exact: false }).first().click();
  await page.getByRole("row").filter({ hasText: "Published" }).first().click();
  const publishedHref = await page.getByRole("link", { name: "View published page" }).getAttribute("href");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Unpublish this record" }).click();
  await page.getByRole("status").filter({ hasText: "Unpublished." }).waitFor();
  const response = await publicPage.goto(`${base}${publishedHref}`);
  // Next returns 200 for already-streaming not-found responses, and adds noindex.
  assert([200, 404].includes(response.status()));
  await publicPage.getByRole("heading", { name: "This page is not in the ledger." }).waitFor();
  assert(await publicPage.locator('meta[name="robots"][content*="noindex"]').count(), "Unpublished detail pages must be excluded from indexing.");
  const sitemap = await page.request.get(`${base}/sitemap.xml`);
  assert(!(await sitemap.text()).includes(publishedHref), "Unpublished records must be removed from the sitemap.");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await page.getByRole("navigation", { name: "Content management" }).getByRole("button", { name: "Properties" }).click();
  await page.getByRole("button", { name: "Add property" }).click();
  await page.getByLabel("Title", { exact: true }).fill("CMS test property");
  await page.getByLabel(/^Slug/).fill("cms-test-property");
  await page.getByLabel("City", { exact: true }).fill("Lagos");
  await page.getByLabel("State", { exact: true }).fill("Lagos");
  await page.getByLabel("Short description", { exact: true }).fill("A temporary listing for CMS verification.");
  await page.getByLabel("Description", { exact: true }).fill("A property created through the editor to verify the full draft and publish workflow.");
  await page.getByRole("button", { name: "Add photograph" }).click();
  await page.getByRole("button", { name: "Use photograph" }).first().click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  await publicPage.goto(`${base}/properties/cms-test-property`);
  await publicPage.getByRole("heading", { name: "This page is not in the ledger." }).waitFor();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await publicPage.reload();
  await publicPage.getByRole("heading", { name: "CMS test property", exact: true }).waitFor();
  // Complex nested records must round-trip through validation without losing fields.
  for (const section of ["Company & contact", "Projects", "Services"]) {
    await page.goto(`${base}/admin`);
    await page.getByRole("navigation", { name: "Content management" }).getByRole("button", { name: section }).click();
    await page.getByRole("row").nth(1).click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
    await page.getByRole("button", { name: "Publish changes" }).click();
    await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  }
  await page.goto(`${base}/admin`);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), "Admin must fit mobile screens.");
  await page.screenshot({ path: ".artifacts/cms-mobile.png", fullPage: true });
  await page.getByRole("navigation", { name: "Content management" }).getByRole("button", { name: "Homepage" }).click();
  await page.getByRole("row").filter({ hasText: "Homepage" }).first().click();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), "Editor must fit mobile screens.");
  await page.screenshot({ path: ".artifacts/cms-editor-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Welcome back." }).waitFor();
  await page.goto(`${base}/cms`);
  assert.equal(new URL(page.url()).pathname, "/admin/login", "The CMS alias must use protected access.");
  assert.deepEqual(errors, [], "No browser runtime errors.");
  console.log("CMS checks passed: authentication, protected uploads, draft persistence, publishing, validation, conflict prevention, unpublishing, image uploads, media dialog, new property creation, mobile layout, sign-out and CMS alias.");
} finally {
  await browser.close();
  if (backup) await writeFile(storage, backup); else await unlink(storage).catch((error) => { if (error.code !== "ENOENT") throw error; });
  if (uploaded) {
    const target = path.resolve("public", uploaded.slice(1));
    assert(target.startsWith(path.resolve("public/media/uploads") + path.sep));
    await unlink(target);
  }
}
