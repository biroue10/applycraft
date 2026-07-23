import { test, expect } from "@playwright/test";

// One shared navbar: the marketing header and the in-app tool header are the same
// <SiteHeader> component driven by the same PRIMARY_NAV_ITEMS config, so label,
// height and order can never drift apart again.
//
// Before this guard the two diverged in three ways:
//   label  — "Resume Builder" (marketing) vs "Resume" (in-app)
//   height — the in-app header used its own logo/padding rules
//   order  — ...ATS Checker · Job Tracker vs ...Job Tracker · ATS Checker
// This spec sets the viewport it needs on every test, so running it again under
// the emulated-mobile project would only re-measure the same widths.
test.skip(({ isMobile }) => isMobile, "drives its own viewport sizes");

const HEADER = ".ac-site-header > div";
const NAV_ITEMS = ".ac-site-nav-links > a";
const LOGO = ".ac-site-header .ac-brand-logo-img";
const DESKTOP_HEIGHT = 64;

const LOCALES = {
  en: {
    labels: ["Resume Builder", "Cover Letter", "ATS Checker", "Application Pack", "Job Tracker", "Interview Prep", "Resume Templates", "Pricing"],
    marketing: "/",
    app: "/app/ats-checker",
    rtl: false,
  },
  fr: {
    labels: ["Créateur de CV", "Lettre de motivation", "Vérificateur ATS", "Pack de candidature", "Suivi des candidatures", "Préparation entretien", "Modèles de CV", "Tarifs"],
    marketing: "/fr/",
    app: "/app/ats-checker?ui=fr&docLang=fr",
    rtl: false,
  },
  ar: {
    labels: ["منشئ السيرة الذاتية", "خطاب التقديم", "فاحص ATS", "حزمة التقديم", "متابعة الوظائف", "تحضير المقابلة", "قوالب السيرة الذاتية", "الأسعار"],
    marketing: "/ar/",
    app: "/app/ats-checker?ui=ar&docLang=ar",
    rtl: true,
  },
};

async function readShape(page) {
  return {
    height: await page.locator(HEADER).first().evaluate((n) => Math.round(n.getBoundingClientRect().height)),
    logoHeight: await page.locator(LOGO).first().evaluate((n) => Math.round(n.getBoundingClientRect().height)),
    labels: (await page.locator(NAV_ITEMS).allTextContents()).map((s) => s.trim()),
  };
}

// SPA hydration re-measures the header and swaps in the locale labels, so settle
// on a stable shape before comparing contexts.
async function navbarShape(page, expected) {
  await page.locator(HEADER).first().waitFor({ state: "visible" });
  await page.locator(NAV_ITEMS).first().waitFor({ state: "visible" });
  await expect.poll(async () => (await readShape(page)).labels).toEqual(expected.labels);
  await expect.poll(async () => (await readShape(page)).height).toBe(expected.height);
  return readShape(page);
}

for (const [code, locale] of Object.entries(LOCALES)) {
  test(`marketing and in-app navbars are identical (${code})`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });

    const expected = { labels: locale.labels, height: DESKTOP_HEIGHT };

    // 1. LABEL + 3. ORDER: same items, same order, translated, in both contexts.
    // 2. HEIGHT: pixel-identical, and equal to the shared token.
    await page.goto(locale.marketing);
    const marketing = await navbarShape(page, expected);

    await page.goto(locale.app);
    const app = await navbarShape(page, expected);

    expect(app.labels).toEqual(marketing.labels);
    expect(app.height).toBe(marketing.height);
    expect(app.logoHeight).toBe(marketing.logoHeight);
  });
}

test("no layout shift or nav change across landing → builder → tracker → checker", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  const routes = ["/", "/resume/templates/", "/job-tracker/", "/app/ats-checker", "/cover-letter/templates/"];
  const expected = { labels: LOCALES.en.labels, height: DESKTOP_HEIGHT };
  const shapes = [];
  for (const route of routes) {
    await page.goto(route);
    shapes.push({ route, ...(await navbarShape(page, expected)) });
  }
  for (const shape of shapes) {
    expect(shape.logoHeight, `logo height on ${shape.route}`).toBe(shapes[0].logoHeight);
  }
});

test("Arabic navbar renders right-to-left in both contexts", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const url of [LOCALES.ar.marketing, LOCALES.ar.app]) {
    await page.goto(url);
    await page.locator(NAV_ITEMS).first().waitFor({ state: "visible" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const items = page.locator(NAV_ITEMS);
    // In RTL the first nav item sits to the RIGHT of the last one. The SPA flips
    // `dir` during hydration, so poll until the mirrored layout has settled.
    await expect.poll(async () => {
      const first = await items.first().evaluate((n) => n.getBoundingClientRect().left);
      const last = await items.last().evaluate((n) => n.getBoundingClientRect().left);
      return first > last;
    }, { message: `RTL nav order on ${url}` }).toBe(true);
  }
});

test("mobile: nav collapses to the menu button in both contexts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  for (const url of ["/", "/app/ats-checker"]) {
    await page.goto(url);
    const header = page.locator(HEADER).first();
    await header.waitFor({ state: "visible" });
    await expect.poll(() => header.evaluate((n) => Math.round(n.getBoundingClientRect().height)), { message: url }).toBe(60);
    await expect(page.locator(".ac-site-nav-links")).toBeHidden();
    await expect(page.locator(".ac-site-mobile-menu-button")).toBeVisible();
  }
});

test("compact navbar preserves secondary links in the More menu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".ac-site-more > button")).toBeVisible();
  await expect(page.locator(".ac-site-nav-secondary").first()).toBeHidden();
  await page.locator(".ac-site-more > button").click();
  await expect(page.locator(".ac-site-more-menu > a")).toHaveCount(4);
});
