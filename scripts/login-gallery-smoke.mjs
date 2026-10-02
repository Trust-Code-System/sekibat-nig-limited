import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SMOKE_BASE || "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const names = [
  "Sekibat Heights",
  "Oakview Residences",
  "Emerald Court",
  "Horizon Villas",
];
const selected = () =>
  page
    .locator('.cms-signin-photo-switches button[aria-pressed="true"]')
    .getAttribute("aria-label");
try {
  await page.clock.install();
  await page.goto(`${base}/admin/login`);
  await page.getByRole("button", { name: "Pause photo slideshow" }).waitFor();
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".cms-signin-photo-switches button")].every(
      (button) => !button.disabled,
    ),
  );
  await page
    .getByLabel("Email address", { exact: true })
    .fill("test@sekibat.com");
  await page.getByLabel("Administrator password").fill("not-submitted");
  // Reset the cadence after image decoding and form interaction.
  await page.getByRole("button", { name: "Pause photo slideshow" }).click();
  await page.getByRole("button", { name: "Show Sekibat Heights" }).click();
  await page.getByRole("button", { name: "Resume photo slideshow" }).click();
  for (const name of [...names.slice(1), names[0]]) {
    await page.clock.fastForward(3000);
    await page.waitForFunction(
      (expected) =>
        document
          .querySelector(
            '.cms-signin-photo-switches button[aria-pressed="true"]',
          )
          ?.getAttribute("aria-label") === `Show ${expected}`,
      name,
    );
    assert.equal(await selected(), `Show ${name}`);
    assert.equal(
      await page.locator(".cms-signin-photo-footer > span").first().innerText(),
      name.toUpperCase(),
    );
    assert(
      await page
        .locator(".cms-signin-slide.is-active img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
      "The active photograph must be loaded.",
    );
  }
  assert.equal(
    await page.getByLabel("Administrator password").inputValue(),
    "not-submitted",
    "Image rotation must preserve the sign-in form.",
  );
  await page.getByRole("button", { name: "Pause photo slideshow" }).click();
  await page.clock.fastForward(9000);
  assert.equal(
    await selected(),
    "Show Sekibat Heights",
    "Pause must stop automatic changes.",
  );
  await page.getByRole("button", { name: "Show Emerald Court" }).click();
  assert.equal(
    await selected(),
    "Show Emerald Court",
    "Manual image selection must work.",
  );
  await page.getByRole("button", { name: "Resume photo slideshow" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Pause photo slideshow" })
    .waitFor({ state: "hidden" });
  const reducedSelection = await selected();
  await page.clock.fastForward(9000);
  assert.equal(
    await selected(),
    reducedSelection,
    "Reduced motion must disable automatic rotation.",
  );
  await page.getByRole("button", { name: "Show Oakview Residences" }).click();
  assert.equal(await selected(), "Show Oakview Residences");
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 617 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    const layoutPage = await browser.newPage({
      viewport: size,
      reducedMotion: "reduce",
    });
    layoutPage.on("pageerror", (error) => errors.push(error.message));
    await layoutPage.goto(`${base}/admin/login`);
    await layoutPage.getByLabel("Email address", { exact: true }).waitFor();
    await layoutPage.evaluate(() => document.fonts.ready);
    const fit = await layoutPage.evaluate(() => {
      const root = document.documentElement;
      const copy = document
        .querySelector(".cms-signin-photo-copy")
        .getBoundingClientRect();
      const footer = document
        .querySelector(".cms-signin-photo-footer")
        .getBoundingClientRect();
      return {
        height: root.scrollHeight,
        width: root.scrollWidth,
        viewportHeight: innerHeight,
        viewportWidth: innerWidth,
        overlap: copy.bottom > footer.top && copy.height > 0,
      };
    });
    assert(
      fit.height <= fit.viewportHeight + 1 &&
        fit.width <= fit.viewportWidth + 1,
      `Login must fit the screen: ${JSON.stringify(fit)}`,
    );
    assert(
      !fit.overlap,
      "Gallery copy must not overlap its captions or controls.",
    );
    await layoutPage.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors.");
  console.log(
    "Login gallery passed: three-second cycling, decoded photos, matching captions, preserved form, pause/resume, manual selection, reduced motion, and six viewport layouts.",
  );
} finally {
  await browser.close();
}
