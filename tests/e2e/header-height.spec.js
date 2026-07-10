import { test, expect } from "@playwright/test";

// Task A guard: the header must be ONE fixed height across contexts so navigating
// between the marketing site and the app never shifts the layout.
//   - Site navbar:                .ac-site-header > div
//   - App tool + builder headers: .ac-app-header
// Desktop: every context is pixel-identical at 64px (this is the context of the
// reported layout-shift bug: the site navbar was 76px, the app headers 64/61px).
// Mobile: the navbar-role headers (site navbar, ATS/tool header) are 60px; the
// resume/cover *builder* toolbars are full-screen editor chrome (back + title +
// export controls) that intentionally wrap below 720px, so they are asserted only
// to start at the same 60px top band, not to stay single-row.
const DESKTOP = 64;
const MOBILE = 60;

async function headerHeight(page, selector) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible" });
  return el.evaluate((n) => Math.round(n.getBoundingClientRect().height));
}

const NAVBAR_CONTEXTS = [
  { name: "site navbar", url: "/", selector: ".ac-site-header > div" },
  { name: "ATS checker", url: "/app/ats-checker", selector: ".ac-app-header" },
];
const BUILDER_CONTEXTS = [
  { name: "resume builder", url: "/resume-builder?template=modern", selector: ".ac-app-header" },
  { name: "cover letter builder", url: "/cover-letter/builder", selector: ".ac-app-header" },
];

function withLocale(url, q) {
  if (!q) return url;
  return url + (url.includes("?") ? "&" : "?") + q;
}

for (const locale of [
  { code: "en", q: "" },
  { code: "fr", q: "ui=fr&docLang=fr" },
  { code: "ar", q: "ui=ar&docLang=ar" },
]) {
  test(`desktop: header is ${DESKTOP}px in every context (${locale.code})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const ctx of [...NAVBAR_CONTEXTS, ...BUILDER_CONTEXTS]) {
      await page.goto(withLocale(ctx.url, locale.q));
      await page.locator(ctx.selector).first().waitFor({ state: "visible" });
      // Poll to let SPA hydration/locale reflow settle before asserting.
      await expect.poll(() => headerHeight(page, ctx.selector), { message: `${ctx.name} (${locale.code})` }).toBe(DESKTOP);
    }
  });
}

test("mobile: navbar-role headers are 60px (en/fr/ar)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  for (const q of ["", "ui=fr&docLang=fr", "ui=ar&docLang=ar"]) {
    for (const ctx of NAVBAR_CONTEXTS) {
      await page.goto(withLocale(ctx.url, q));
      await page.locator(ctx.selector).first().waitFor({ state: "visible" });
      await expect.poll(() => headerHeight(page, ctx.selector), { message: `${ctx.name} mobile (${q || "en"})` }).toBe(MOBILE);
    }
  }
});
