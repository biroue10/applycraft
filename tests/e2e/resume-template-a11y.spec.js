import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// Resume/cover templates render on white paper, so the site's dark-theme token
// guard says nothing about them. These were the last two Lighthouse failures:
//
//   color-contrast — muted greys (#888/#999/#aaa) and 11 of 32 template accents
//                    fell under 4.5:1 as text on white.
//   target-size    — a.contact-link was ~7px tall inside scaled-down thumbnails.
//
// axe needs real layout for both rules, so this runs in a browser over every
// template thumbnail and every full-size preview.
const axeSource = readFileSync("node_modules/axe-core/axe.js", "utf8");
const RULES = ["color-contrast", "target-size"];

test.skip(({ isMobile }) => isMobile, "audited at desktop width; scale is what matters");

async function violations(page, selector) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async ({ rules, selector }) => {
    const root = selector ? document.querySelector(selector) : document;
    const result = await window.axe.run(root, { runOnly: { type: "rule", values: rules } });
    return result.violations.flatMap((v) =>
      v.nodes.map((n) => `${v.id}: ${n.failureSummary.replace(/\s+/g, " ").slice(0, 140)} — ${n.html.slice(0, 80)}`)
    );
  }, { rules: RULES, selector });
}

for (const gallery of ["/resume/templates/", "/cover-letter/templates/"]) {
  test(`every thumbnail in ${gallery} passes contrast and target-size`, async ({ page }) => {
    await page.goto(gallery, { waitUntil: "networkidle" });
    await expect(page.locator(".resume-paper").first()).toBeVisible();
    const found = await violations(page);
    expect(found, found.join("\n")).toHaveLength(0);
  });

  test(`thumbnails in ${gallery} expose contact details as text, not tiny links`, async ({ page }) => {
    await page.goto(gallery, { waitUntil: "networkidle" });
    await expect(page.locator(".resume-paper").first()).toBeVisible();
    // A 0.3-scaled paper cannot offer a usable link target.
    expect(await page.locator(".resume-paper a.contact-link").count()).toBe(0);
  });
}

test("every resume template preview passes contrast and target-size", async ({ page }) => {
  test.slow();
  await page.goto("/resume/templates/", { waitUntil: "networkidle" });
  const cards = page.locator("article");
  const total = await cards.count();
  expect(total).toBeGreaterThan(10);

  const failures = [];
  for (let i = 0; i < total; i++) {
    const card = cards.nth(i);
    const name = (await card.getByRole("heading").first().textContent())?.trim() || `#${i}`;
    await card.hover();
    await card.getByRole("button", { name: /preview/i }).first().click({ force: true });
    await expect(page.locator('[role="dialog"] .resume-paper')).toBeVisible();

    // Scope to the dialog: the gallery card behind it is site chrome, not a template.
    const found = await violations(page, '[role="dialog"]');
    if (found.length) failures.push(`${name}: ${found[0]}`);

    // Full-size previews keep live contact links; they must be real touch targets.
    const small = await page.$$eval('[role="dialog"] a.contact-link', (links) =>
      links
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width < 24 || r.height < 24)
        .map((r) => `${r.width.toFixed(1)}x${r.height.toFixed(1)}`)
    );
    for (const size of small) failures.push(`${name}: contact-link is ${size}, needs 24x24`);

    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  }
  expect(failures, failures.join("\n")).toHaveLength(0);
});
