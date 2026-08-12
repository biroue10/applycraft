import { test, expect } from "@playwright/test";

const IMPACT_TAG_URL = "https://utt.impactcdn.com/P-A7607934-979a-4ead-843a-d7d27241d7e71.js";

async function impactScriptCount(page) {
  return page.locator(`script[src="${IMPACT_TAG_URL}"]`).count();
}

async function waitForConsentLoader(page) {
  await page.waitForFunction(() => typeof window.acCookiePreferences === "function");
}

test.describe("Impact affiliate tag consent", () => {
  test("does not load before marketing consent", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("ac_cookie_consent");
      localStorage.removeItem("ac_marketing_consent");
    });
    await page.goto("/");
    await waitForConsentLoader(page);
    await expect.poll(() => impactScriptCount(page)).toBe(0);
  });

  test("loads exactly once after marketing consent and remains singular after client navigation", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("ac_cookie_consent");
      localStorage.removeItem("ac_marketing_consent");
    });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
    await page.getByRole("button", { name: "Accept all" }).click();
    await expect.poll(() => impactScriptCount(page)).toBe(1);

    const navigated = await page.evaluate(() => {
      const target = [...document.querySelectorAll("main a[href]")]
        .find((link) => link.getAttribute("href") === "/ats-checker/");
      if (!target) return false;
      target.click();
      return true;
    });
    expect(navigated).toBe(true);
    await expect(page).toHaveURL(/\/ats-checker\/?$/);
    await expect.poll(() => impactScriptCount(page)).toBe(1);
  });

  test("does not load with rejected marketing consent", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("ac_cookie_consent");
      localStorage.removeItem("ac_marketing_consent");
    });
    await page.goto("/fr/");
    await expect(page.getByRole("button", { name: "Refuser les cookies facultatifs" })).toBeVisible();
    await page.getByRole("button", { name: "Refuser les cookies facultatifs" }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("ac_marketing_consent"))).toBe("denied");
    await expect.poll(() => impactScriptCount(page)).toBe(0);
  });
});
