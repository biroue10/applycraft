import { test, expect } from "@playwright/test";

// The skip link is the first thing a keyboard/screen-reader user meets. It was
// present but pointed at #main-content, which no SPA-rendered page defined — so
// activating it did nothing. <main> now carries that id plus tabindex="-1" so it
// can actually receive focus.
const PAGES = ["/", "/fr/", "/ar/"];

for (const url of PAGES) {
  test(`skip link is the first tab stop and moves focus to main (${url})`, async ({ page }) => {
    await page.goto(url);
    await page.locator("main#main-content").waitFor({ state: "attached" });

    // Off-screen until focused.
    const link = page.locator("a.skip-link");
    const topBefore = await link.evaluate((n) => n.getBoundingClientRect().top);
    expect(topBefore, "skip link should start off-screen").toBeLessThan(0);

    // 1. First Tab lands on the skip link...
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();

    // 2. ...and it becomes visible while focused.
    await expect.poll(() => link.evaluate((n) => n.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    await expect(link).toBeInViewport();

    // 3. Enter moves focus into the main landmark.
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });
}

test("main landmark is unique and is a real <main>", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#main-content")).toHaveCount(1);
  await expect(page.locator("main#main-content")).toHaveCount(1);
});
