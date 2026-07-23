import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "drives desktop and mobile viewports explicitly");

const routes = [
  ["/resume-builder/", "resume"],
  ["/cover-letter-builder/", "cover"],
  ["/ats-checker/", "ats"],
  ["/application-pack/", "application-pack"],
  ["/job-tracker/", "tracker"],
  ["/interview-prep/", "interview"],
  ["/resume/templates/", "templates"],
  ["/pricing/", "pricing"],
  ["/fr/interview-prep/", "interview"],
  ["/ar/interview-prep/", "interview"],
];

test("every product route exposes exactly one correctly active desktop item", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  let expectedHeight;
  for (const [route, id] of routes) {
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(route, { waitUntil: "networkidle" });
    const nav = page.locator(".ac-site-nav-links:visible, .ac-static-desktop-nav:visible").first();
    await expect(nav).toBeVisible();
    const current = nav.locator(':scope > .ac-nav-link[aria-current="page"]');
    await expect(current, route).toHaveCount(1);
    await expect(current).toHaveAttribute("data-nav-id", id);
    const height = await page.locator('[data-site-header="applycraft"] > div').first().evaluate((node) => Math.round(node.getBoundingClientRect().height));
    expectedHeight ??= height;
    expect(height, `${route} navbar height`).toBe(expectedHeight);
    await expect(page.locator(".ac-static-cta:visible, .ac-nav-cta:visible").first()).toHaveText(/^(Create Resume|Créer mon CV|إنشاء سيرتي الذاتية)$/);
    expect(errors, `${route} console errors`).toEqual([]);
  }
});

test("Resume Templates never activates Resume Builder", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/resume/templates/?country=canada#modern", { waitUntil: "networkidle" });
  await expect(page.locator('.ac-nav-link[data-nav-id="templates"][aria-current="page"]:visible')).toHaveCount(1);
  await expect(page.locator('.ac-nav-link[data-nav-id="resume"][aria-current="page"]')).toHaveCount(0);
});

test("focus-visible is distinct and does not create current state", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/interview-prep/", { waitUntil: "networkidle" });
  const tracker = page.locator('.ac-nav-link[data-nav-id="tracker"]:visible').first();
  await tracker.focus();
  expect(await tracker.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
  await expect(tracker).not.toHaveAttribute("aria-current", "page");
  await tracker.press("Enter");
  await page.waitForURL(/job-tracker/);
  await expect(page.locator('.ac-nav-link[data-nav-id="tracker"][aria-current="page"]:visible')).toHaveCount(1);
});

test("mobile menu has one active item and closes after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/interview-prep/", { waitUntil: "networkidle" });
  await page.locator(".ac-site-mobile-menu-button").click();
  const menu = page.locator(".ac-site-mobile-menu");
  await expect(menu.locator('.ac-nav-link[aria-current="page"]')).toHaveCount(1);
  await menu.locator('.ac-nav-link[data-nav-id="tracker"]').click();
  await page.waitForURL(/job-tracker/);
  await expect(page.locator(".ac-site-mobile-menu")).toHaveCount(0);
});
