import { test, expect } from "@playwright/test";

const homepageRoutes = [
  { locale: "en", route: "/", direction: "ltr" },
  { locale: "fr", route: "/fr/", direction: "ltr" },
  { locale: "ar", route: "/ar/", direction: "rtl" },
];

test.describe("homepage SSG hydration", () => {
  for (const { locale, route, direction } of homepageRoutes) {
    test(`${locale} hydrates without React errors`, async ({ page }) => {
      const errors = [];
      await page.route("**/api/account", (request) => request.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ account: null }),
      }));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(String(error)));

      await page.goto(route, { waitUntil: "networkidle" });

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#main-content")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", direction);
      await expect(page.locator(".ac-resume-scanner")).toBeVisible();
      await expect(page.locator(".ac-global-header")).toBeVisible();
      await expect(page.locator(".ac-language-trigger")).toBeVisible();
      await expect(page.locator(".ac-nav-cta")).toHaveCount(1);
      await expect(page.locator(".ac-nav-cta")).toHaveAttribute("href", /resume-builder|free-resume-builder|creer-cv/);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${locale}: no horizontal overflow`).toBeLessThanOrEqual(1);
      expect(errors, `${locale}: unexpected browser errors`).toEqual([]);
    });
  }
});
