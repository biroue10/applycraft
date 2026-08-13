import { test, expect } from "@playwright/test";

const localizedScannerDescriptions = [
  {
    locale: "EN",
    route: "/",
    description: "Illustration of a professional resume being scanned and organized into an ATS-friendly structure",
  },
  {
    locale: "FR",
    route: "/fr/",
    description: "Illustration d’un CV professionnel analysé et organisé dans une structure adaptée aux ATS",
  },
  {
    locale: "AR",
    route: "/ar/",
    description: "رسم توضيحي لسيرة ذاتية احترافية يجري تحليلها وتنظيمها في بنية ملائمة لأنظمة ATS",
  },
];

test.describe("hero resume scanner accessibility", () => {
  for (const { locale, route, description } of localizedScannerDescriptions) {
    test(`${locale} exposes one localized scanner image`, async ({ page }) => {
      await page.goto(route);

      const scanner = page.locator(".ac-resume-scanner");
      await expect(scanner).toBeVisible();
      await expect(page.locator("section[role=img]")).toHaveCount(0);
      await expect(scanner.locator('[role="img"]')).toHaveCount(1);
      await expect(scanner.locator('[role="img"]')).toHaveAttribute("aria-label", description);

      for (const visualSelector of [".ac-scan-glow", ".ac-scan-orbit", ".ac-scan-back", ".ac-scan-paper", ".ac-scan-notes"]) {
        await expect(scanner.locator(visualSelector)).toHaveAttribute("aria-hidden", "true");
      }
    });
  }
});
