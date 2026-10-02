import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.SMOKE_BASE || "http://localhost:3000";
const env = await readFile(".env.local", "utf8").catch(() => "");
const localEnv = (name) =>
  env
    .match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]
    ?.trim()
    .replace(/^(["'])(.*)\1$/, "$2");
const password =
  process.env.SEKIBAT_ADMIN_PASSWORD || localEnv("SEKIBAT_ADMIN_PASSWORD");
const email =
  process.env.SEKIBAT_ADMIN_EMAIL ||
  localEnv("SEKIBAT_ADMIN_EMAIL") ||
  "test@sekibat.com";
assert(password, "Configure SEKIBAT_ADMIN_PASSWORD before running CMS checks.");
const directory = path.resolve(
  process.env.SEKIBAT_CMS_DIR || localEnv("SEKIBAT_CMS_DIR") || ".cms",
);
const storage = path.join(directory, "content.json");
const backup = await readFile(storage).catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return null;
});
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Africa/Lagos",
});
const page = await context.newPage();
const errors = [];
let uploaded;
page.on("pageerror", (error) => errors.push(error.message));
async function signIn(target) {
  await target.goto(`${base}/admin`);
  await target.getByLabel("Email address", { exact: true }).fill(email);
  await target.getByLabel("Administrator password").fill(password);
  await target.getByRole("button", { name: "Sign in" }).click();
  await target
    .getByRole("heading", {
      name: /^(Good morning|Good afternoon|Good evening|Welcome back)/,
    })
    .waitFor();
  await target.locator('.cms-workspace[data-ready="true"]').waitFor();
}
async function openHome(target) {
  await target.getByRole("button", { name: "Edit homepage" }).click();
  await target.getByLabel("Heading", { exact: true }).waitFor();
}
async function clickOutside(target) {
  const box = await target.locator(".cms-topbar").boundingBox();
  assert(box, "The studio header remains visible above open controls.");
  await target.mouse.click(box.x + 150, box.y + 25);
}
async function checkLoginFit(target, sizes) {
  for (const viewport of sizes) {
    await target.setViewportSize(viewport);
    const fit = await target.evaluate(() => {
      const root = document.documentElement;
      const controls = [
        ...document.querySelectorAll(
          '.cms-signin input, .cms-signin-fields > button, .cms-signin [role="alert"], .cms-signin-header, .cms-signin-footer',
        ),
      ];
      return {
        height: root.scrollHeight,
        width: root.scrollWidth,
        clipped: controls
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return (
              bounds.height > 0 &&
              (bounds.top < -1 ||
                bounds.bottom > innerHeight + 1 ||
                bounds.left < -1 ||
                bounds.right > innerWidth + 1)
            );
          })
          .map(
            (element) =>
              element.getAttribute("aria-label") ||
              element.textContent ||
              element.id,
          ),
      };
    });
    assert(
      fit.height <= viewport.height + 1 && fit.width <= viewport.width + 1,
      `Login must fit ${viewport.width}×${viewport.height}: ${JSON.stringify(fit)}`,
    );
    assert.deepEqual(
      fit.clipped,
      [],
      "Login controls and errors stay within the screen.",
    );
  }
  await target.setViewportSize({ width: 1440, height: 1000 });
}
async function checkContentToolbarFit(target) {
  for (const width of [
    320, 360, 390, 760, 761, 820, 900, 1024, 1200, 1280, 1440,
  ]) {
    await target.setViewportSize({ width, height: 900 });
    const fit = await target
      .locator(".cms-list-toolbar")
      .evaluate((toolbar) => {
        const bounds = toolbar.getBoundingClientRect();
        const search = toolbar.querySelector(".cms-search");
        const input = search.querySelector("input");
        const controls = [...toolbar.querySelectorAll("button, .cms-search")];
        return {
          searchWidth: search.getBoundingClientRect().width,
          inputWidth: input.getBoundingClientRect().width,
          clipped: controls
            .filter((control) => {
              const rect = control.getBoundingClientRect();
              return (
                rect.left < bounds.left - 1 ||
                rect.right > bounds.right + 1 ||
                rect.top < bounds.top - 1 ||
                rect.bottom > bounds.bottom + 1
              );
            })
            .map(
              (control) =>
                control.getAttribute("aria-label") || control.textContent,
            ),
        };
      });
    assert(
      fit.searchWidth >= 150 && fit.inputWidth >= 90,
      `Search must remain usable at ${width}px: ${JSON.stringify(fit)}`,
    );
    assert.deepEqual(
      fit.clipped,
      [],
      `Toolbar controls must stay inside their panel at ${width}px.`,
    );
  }
  await target.setViewportSize({ width: 1440, height: 1000 });
}
try {
  await page.goto(`${base}/admin`);
  assert(
    new URL(page.url()).pathname === "/admin/login",
    "Admin must redirect signed-out visitors.",
  );
  const denied = await page.request.post(`${base}/api/admin/media`, {
    multipart: {
      file: {
        name: "test.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("invalid"),
      },
    },
  });
  assert.equal(denied.status(), 401, "Uploads require authentication.");
  await mkdir(".artifacts", { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await checkLoginFit(page, [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 617 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 844, height: 390 },
    { width: 568, height: 320 },
  ]);
  await page.screenshot({ path: ".artifacts/cms-login.png", fullPage: true });
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Administrator password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("alert").filter({ hasText: "incorrect" }).waitFor();
  await checkLoginFit(page, [
    { width: 320, height: 568 },
    { width: 1280, height: 617 },
    { width: 844, height: 390 },
    { width: 568, height: 320 },
  ]);
  await page
    .getByLabel("Email address", { exact: true })
    .fill("wrong@sekibat.com");
  await page.getByLabel("Administrator password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("alert").filter({ hasText: "incorrect" }).waitFor();
  assert.equal(
    new URL(page.url()).pathname,
    "/admin/login",
    "Correct password cannot bypass email validation.",
  );
  await signIn(page);
  await checkContentToolbarFit(page);
  const clockPage = await context.newPage();
  clockPage.on("pageerror", (error) => errors.push(error.message));
  await clockPage.clock.install({
    time: new Date("2026-10-02T11:59:00+01:00"),
  });
  await clockPage.goto(`${base}/admin`);
  await clockPage.getByRole("heading", { name: "Good morning." }).waitFor();
  await clockPage.clock.fastForward("02:00");
  await clockPage.getByRole("heading", { name: "Good afternoon." }).waitFor();
  await clockPage.clock.fastForward("05:00:00");
  await clockPage.getByRole("heading", { name: "Good evening." }).waitFor();
  await clockPage.clock.fastForward("07:00:00");
  await clockPage.getByRole("heading", { name: "Welcome back." }).waitFor();
  assert.match(
    await clockPage.locator(".cms-greeting .cms-eyebrow").innerText(),
    /SATURDAY,? 3 OCTOBER/,
  );
  await clockPage.clock.fastForward("05:00:00");
  await clockPage.getByRole("heading", { name: "Good morning." }).waitFor();
  await clockPage.close();
  assert.equal(
    await page.locator('a[href="/"]:visible').count(),
    1,
    "Only one global website link remains.",
  );
  assert.equal(await page.locator(".cms-site-switch").count(), 0);
  await page.getByRole("combobox", { name: "Sort content" }).click();
  await page.getByRole("listbox").waitFor();
  await clickOutside(page);
  await page.getByRole("listbox").waitFor({ state: "hidden" });
  assert.equal(
    await page
      .getByRole("combobox", { name: "Sort content" })
      .getAttribute("aria-expanded"),
    "false",
    "Outside presses close dropdowns.",
  );
  await page.getByRole("combobox", { name: "Sort content" }).click();
  await page.getByRole("option", { name: "Title A–Z" }).click();
  assert.match(
    await page.getByRole("combobox", { name: "Sort content" }).innerText(),
    /Title A–Z/,
  );
  await page.getByRole("combobox", { name: "Sort content" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({ state: "hidden" });
  assert.equal(
    await page.getByRole("listbox").count(),
    0,
    "Escape closes dropdowns.",
  );
  await page.getByRole("button", { name: "Create content" }).click();
  await page.getByRole("menu").waitFor();
  await clickOutside(page);
  await page.getByRole("menu").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Create content" }).click();
  await page.getByRole("menuitem", { name: "New project" }).click();
  await page.getByLabel("Title", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Open profile", exact: true }).click();
  assert.equal(
    await page.getByLabel("Sign-in email").inputValue(),
    email.toLowerCase(),
  );
  await page.getByLabel("Display name").fill("Studio Admin");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Profile preferences saved" })
    .waitFor();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .waitFor();
  await page.reload();
  await page.getByRole("heading", { name: /, Studio\.$/ }).waitFor();
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .waitFor();
  assert.equal(
    await page.locator(".cms-topbar-avatar").innerText(),
    "SA",
    "Profile and compact navigation persist after reload.",
  );
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page.getByRole("button", { name: "Open profile", exact: true }).click();
  await page.getByLabel("Display name").fill("Administrator");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await mkdir(".artifacts", { recursive: true });
  await page.screenshot({
    path: ".artifacts/cms-overview.png",
    fullPage: true,
  });
  // Search opens with a keyboard shortcut and navigates to an existing record.
  await page.keyboard.press("Control+k");
  await page.getByRole("dialog", { name: "Quick search" }).waitFor();
  await page.getByLabel("Search pages and records").fill("Sekibat Heights");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Sekibat Heights.*properties/ })
    .click();
  await page.getByLabel("Title", { exact: true }).waitFor();
  assert.equal(
    await page
      .locator(
        'select:not([aria-hidden="true"]):visible, input[type="date"]:visible',
      )
      .count(),
    0,
    "Editor uses branded controls.",
  );
  await page.getByRole("combobox", { name: "Type", exact: true }).click();
  await page.getByRole("option", { name: "Commercial", exact: true }).click();
  assert.match(
    await page.getByRole("combobox", { name: "Type", exact: true }).innerText(),
    /Commercial/,
  );
  await page.getByRole("combobox", { name: "Status", exact: true }).click();
  await page.getByRole("option", { name: "Leased", exact: true }).click();
  await page.getByRole("combobox", { name: "Ownership", exact: true }).click();
  await page.getByRole("option", { name: "Client", exact: true }).click();
  await page.getByLabel("Date listed", { exact: true }).click();
  await page.locator(".cms-calendar-popover").waitFor();
  await clickOutside(page);
  await page.locator(".cms-calendar-popover").waitFor({ state: "hidden" });
  await page.getByLabel("Date listed", { exact: true }).click();
  await page
    .getByRole("button", { name: "Go to the Next Month", exact: true })
    .click();
  await page
    .locator(".cms-calendar .rdp-day:not(.rdp-outside) button")
    .filter({ hasText: /^15$/ })
    .click();
  assert.match(
    await page.locator('input[name="cms-listedAt"]').inputValue(),
    /^\d{4}-\d{2}-15$/,
  );
  await page.getByLabel("Date listed", { exact: true }).click();
  await page.keyboard.press("Escape");
  await page.locator(".cms-calendar-popover").waitFor({ state: "hidden" });
  assert.equal(await page.locator(".cms-calendar-popover").count(), 0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  // Discard these unsaved UI-control checks and continue with the original content.
  await page.getByRole("button", { name: "Edit homepage" }).waitFor();
  await page.keyboard.press("Control+k");
  await page.getByLabel("Search pages and records").fill("Sekibat Heights");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Sekibat Heights.*properties/ })
    .click();
  await page.getByRole("button", { name: "Compact preview" }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Compact preview" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.goto(`${base}/admin`);
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  await page.getByLabel("Search content").fill("Sekibat Heights");
  assert.equal(
    await page.locator(".cms-record-card").count(),
    2,
    "Grid search finds both the property and project with this title.",
  );
  await page
    .getByRole("button", { name: "Needs attention", exact: true })
    .click();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await openHome(page);
  const original = await page
    .getByLabel("Heading", { exact: true })
    .inputValue();
  const next = "CMS smoke check heading";
  await page.getByLabel("Heading", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  const publicPage = await context.newPage();
  await publicPage.goto(base);
  assert(
    (await publicPage.locator("h1").textContent()).includes(original),
    "A draft must not change the public homepage.",
  );
  await page.reload();
  await openHome(page);
  assert.equal(
    await page.getByLabel("Heading", { exact: true }).inputValue(),
    next,
    "Drafts must survive reloads.",
  );
  // Two editors start from the same revision; the second must never overwrite the first.
  const stale = await context.newPage();
  await stale.goto(`${base}/admin`);
  await openHome(stale);
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await publicPage.reload();
  assert(
    (await publicPage.locator("h1").textContent()).includes(next),
    "Published changes must reach public pages.",
  );
  await stale
    .getByLabel("Heading", { exact: true })
    .fill("Stale editor change");
  await stale.getByRole("button", { name: "Save draft", exact: true }).click();
  await stale
    .getByRole("alert")
    .filter({ hasText: "another session" })
    .waitFor();
  await page.getByLabel("Heading", { exact: true }).fill("");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("alert").filter({ hasText: "required" }).waitFor();
  await page.getByLabel("Heading", { exact: true }).fill(original);
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  const invalidUpload = await page.request.post(`${base}/api/admin/media`, {
    headers: { origin: base },
    multipart: {
      file: {
        name: "fake.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("invalid"),
      },
    },
  });
  assert.equal(
    invalidUpload.status(),
    400,
    "Upload validation must inspect file contents.",
  );
  const upload = await page.request.post(`${base}/api/admin/media`, {
    headers: { origin: base },
    multipart: {
      file: {
        name: "photo.jpg",
        mimeType: "image/jpeg",
        buffer: await readFile(
          "public/media/properties/sekibat-heights-01.jpg",
        ),
      },
    },
  });
  assert.equal(upload.status(), 200);
  uploaded = (await upload.json()).src;
  assert.equal(
    (await page.request.get(`${base}${uploaded}`)).status(),
    200,
    "Uploaded photos must be served.",
  );
  await page.getByRole("button", { name: "Change photograph" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(
    await page.getByRole("dialog").count(),
    0,
    "Escape closes the media picker.",
  );
  await page.goto(`${base}/admin`);
  await page
    .getByRole("button", { name: "Properties", exact: false })
    .first()
    .click();
  await page.getByRole("row").filter({ hasText: "Published" }).first().click();
  const publishedHref = await page
    .getByRole("link", { name: "View published page" })
    .getAttribute("href");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Unpublish this record" }).click();
  await page.getByRole("status").filter({ hasText: "Unpublished." }).waitFor();
  const response = await publicPage.goto(`${base}${publishedHref}`);
  // Next returns 200 for already-streaming not-found responses, and adds noindex.
  assert([200, 404].includes(response.status()));
  await publicPage
    .getByRole("heading", { name: "This page is not in the ledger." })
    .waitFor();
  assert(
    await publicPage.locator('meta[name="robots"][content*="noindex"]').count(),
    "Unpublished detail pages must be excluded from indexing.",
  );
  const sitemap = await page.request.get(`${base}/sitemap.xml`);
  assert(
    !(await sitemap.text()).includes(publishedHref),
    "Unpublished records must be removed from the sitemap.",
  );
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await page
    .getByRole("navigation", { name: "Content management" })
    .getByRole("button", { name: "Properties" })
    .click();
  await page.getByRole("button", { name: "Add property" }).click();
  await page.getByLabel("Title", { exact: true }).fill("CMS test property");
  await page.getByLabel(/^Slug/).fill("cms-test-property");
  await page.getByLabel("City", { exact: true }).fill("Lagos");
  await page.getByLabel("State", { exact: true }).fill("Lagos");
  await page
    .getByLabel("Short description", { exact: true })
    .fill("A temporary listing for CMS verification.");
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "A property created through the editor to verify the full draft and publish workflow.",
    );
  await page.getByRole("button", { name: "Add photograph" }).click();
  await page.getByRole("button", { name: "Use photograph" }).first().click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  await publicPage.goto(`${base}/properties/cms-test-property`);
  await publicPage
    .getByRole("heading", { name: "This page is not in the ledger." })
    .waitFor();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  await publicPage.reload();
  await publicPage
    .getByRole("heading", { name: "CMS test property", exact: true })
    .waitFor();
  // Complex nested records must round-trip through validation without losing fields.
  for (const section of ["Company & contact", "Projects", "Services"]) {
    await page.goto(`${base}/admin`);
    await page
      .getByRole("navigation", { name: "Content management" })
      .getByRole("button", { name: section })
      .click();
    await page.getByRole("row").nth(1).click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
    await page.getByRole("button", { name: "Publish changes" }).click();
    await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  }
  await page.goto(`${base}/admin`);
  await page
    .getByRole("navigation", { name: "Content management" })
    .getByRole("button", { name: "Media library" })
    .click();
  await page
    .getByRole("button", { name: /^Properties/ })
    .last()
    .click();
  assert((await page.locator(".cms-media-card").count()) > 0);
  assert(
    (
      await page
        .locator(".cms-media-card img")
        .evaluateAll((images) =>
          images.map((image) => image.getAttribute("src")),
        )
    ).every((src) => src.includes("/properties/")),
    "Media folders filter images.",
  );
  await page.goto(`${base}/admin`);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 2,
    ),
    "Admin must fit mobile screens.",
  );
  await page.screenshot({ path: ".artifacts/cms-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog", { name: "Workspace navigation" })
    .getByRole("button", { name: "Homepage" })
    .click();
  assert.equal(
    await page.getByRole("dialog", { name: "Workspace navigation" }).count(),
    0,
    "Mobile navigation closes after choosing a section.",
  );
  await page.getByRole("row").filter({ hasText: "Homepage" }).first().click();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 2,
    ),
    "Editor must fit mobile screens.",
  );
  await page.screenshot({
    path: ".artifacts/cms-editor-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Sign out" }).click();
  await page
    .getByRole("heading", { name: "Sign in to your studio." })
    .waitFor();
  await page.goto(`${base}/cms`);
  assert.equal(
    new URL(page.url()).pathname,
    "/admin/login",
    "The CMS alias must use protected access.",
  );
  assert.deepEqual(errors, [], "No browser runtime errors.");
  console.log(
    "CMS checks passed: email/password authentication, branded dropdowns and calendars, profile preferences, collapsible sidebar persistence, protected uploads, draft persistence, publishing, validation, conflict prevention, unpublishing, media picker and folders, new content, quick search, list/grid filtering, compact preview, mobile layout/navigation, sign-out and CMS alias.",
  );
} finally {
  await browser.close();
  if (backup) await writeFile(storage, backup);
  else
    await unlink(storage).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  if (uploaded) {
    const target = path.resolve("public", uploaded.slice(1));
    assert(target.startsWith(path.resolve("public/media/uploads") + path.sep));
    await unlink(target);
  }
}
