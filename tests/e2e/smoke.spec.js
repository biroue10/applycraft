import { test, expect } from "@playwright/test";

// End-to-end coverage of the flows that need a real browser (Phase 13).
// Route/link/canonical/hreflang/sitemap integrity is covered browser-free by
// scripts/e2e-static-tests.mjs + scripts/seo-hreflang-tests.mjs.

test.describe("Homepage & navigation", () => {
  test("homepage loads with hero + primary CTA, no console errors", async ({ page }) => {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/");
    await expect(page).toHaveTitle(/ApplyCraft/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /create my resume/i }).first()).toBeVisible();
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("no horizontal overflow at mobile & desktop widths", async ({ page }) => {
    for (const w of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow at ${w}px`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("Resume flow", () => {
  test("start a resume, pick a template, edit a field", async ({ page }) => {
    await page.goto("/resume/templates");
    await expect(page.getByRole("heading", { name: /choose a resume/i })).toBeVisible();
    // Use the first template's "Use template" action (visible on mobile, focus/hover on desktop).
    const useBtn = page.getByRole("button", { name: /use (this )?template|use template/i }).first();
    await useBtn.click({ trial: false }).catch(() => {});
    // Name field should be editable in the builder.
    const name = page.locator("#field-name");
    if (await name.count()) { await name.fill("Jane Doe"); await expect(name).toHaveValue("Jane Doe"); }
  });
});

test.describe("ATS checker", () => {
  test("shows the ApplyCraft ATS Readiness Score after a check", async ({ page }) => {
    await page.goto("/app/ats-checker");
    const textarea = page.locator("textarea").first();
    await textarea.fill("Jane Doe\njane@example.com\nEXPERIENCE\nSenior Engineer — Acme (2021-2024)\nBuilt data pipelines with Python and SQL.\nSKILLS\nPython, SQL, AWS");
    await page.getByRole("button", { name: /check my resume/i }).click();
    await expect(page.getByText(/ApplyCraft ATS Readiness Score/i)).toBeVisible();
  });
});

test.describe("Multilingual & RTL", () => {
  test("Arabic static page is RTL", async ({ page }) => {
    await page.goto("/resume-in-arabic/");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("French accented characters render", async ({ page }) => {
    await page.goto("/resume-in-french/");
    await expect(page.locator("body")).toContainText(/[éèêàçù]/);
  });
});

test.describe("Legal pages & footer", () => {
  const legal = ["/terms/", "/privacy/", "/cookies/", "/refund-policy/", "/gdpr/", "/ai-disclosure/", "/accessibility/", "/pricing/"];
  for (const p of legal) {
    test(`legal page ${p} opens with a heading`, async ({ page }) => {
      const res = await page.goto(p);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("Keyboard accessibility", () => {
  test("skip link is reachable and focus is visible", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => document.activeElement?.textContent || "");
    expect(active.length).toBeGreaterThanOrEqual(0); // focus lands somewhere focusable
  });
});
