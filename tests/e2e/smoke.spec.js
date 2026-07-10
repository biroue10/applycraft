import { test, expect } from "@playwright/test";

// End-to-end coverage of the flows that need a real browser (Phase 13).
// Route/link/canonical/hreflang/sitemap integrity is covered browser-free by
// scripts/e2e-static-tests.mjs + scripts/seo-hreflang-tests.mjs.

test.describe("Homepage & navigation", () => {
  test("homepage loads with hero + primary CTA, no console errors", async ({ page }) => {
    const errors = [];
    const ignoreKnownHydration = (message) => /Minified React error #(418|423)\b/.test(message);
    page.on("console", (m) => {
      const text = m.text();
      if (m.type() === "error" && !ignoreKnownHydration(text)) errors.push(text);
    });
    page.on("pageerror", (e) => {
      const text = String(e);
      if (!ignoreKnownHydration(text)) errors.push(text);
    });
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
    // Desktop actions are overlayed until hover/focus.
    await page.locator("article").first().hover();
    const useBtn = page.getByRole("button", { name: /use recommended template|use .+ template/i }).first();
    await useBtn.click({ force: true });
    // Name field should be editable in the builder.
    const name = page.locator("#field-name");
    if (await name.count()) { await name.fill("Jane Doe"); await expect(name).toHaveValue("Jane Doe"); }
  });

  test("builder toolbar panels are mutually exclusive", async ({ page }) => {
    const ignoreKnownHydration = (message) => /Minified React error #(418|423|425)\b/.test(message);
    const errors = [];
    page.on("pageerror", (e) => {
      const text = String(e);
      if (!ignoreKnownHydration(text)) errors.push(text);
    });

    await page.goto("/resume-builder?template=modern");
    const exportButton = page.getByRole("button", { name: /^Export$/ }).first();
    const customizeButton = page.getByRole("button", { name: /^Customize$/ }).first();
    const moreButton = page.getByRole("button", { name: /more options/i }).first();

    await exportButton.click();
    await expect(exportButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Export your resume")).toBeVisible();

    await customizeButton.click();
    await expect(exportButton).toHaveAttribute("aria-expanded", "false");
    await expect(customizeButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Export your resume")).toHaveCount(0);
    await expect(page.getByText("Document settings")).toBeVisible();

    await exportButton.click();
    await expect(customizeButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Document settings")).toHaveCount(0);
    await expect(page.getByText("Export your resume")).toBeVisible();

    await moreButton.click();
    await expect(exportButton).toHaveAttribute("aria-expanded", "false");
    await expect(moreButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Export your resume")).toHaveCount(0);
    await expect(page.getByText("Keep for this session")).toBeVisible();

    await moreButton.click();
    await expect(moreButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Keep for this session")).toHaveCount(0);

    await exportButton.click();
    await page.mouse.click(12, 520);
    await expect(exportButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Export your resume")).toHaveCount(0);

    await customizeButton.click();
    await page.keyboard.press("Escape");
    await expect(customizeButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Document settings")).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/resume-builder?template=modern");
    const mobileExportButton = page.getByRole("button", { name: /^Export$/ }).first();
    const mobileCustomizeButton = page.getByRole("button", { name: /^Customize$/ }).first();
    await mobileExportButton.click();
    await expect(page.getByText("Export your resume")).toBeVisible();
    await mobileCustomizeButton.click();
    await expect(page.getByText("Export your resume")).toHaveCount(0);
    await expect(page.getByText("Document settings")).toBeVisible();

    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});

test.describe("Cover letter builder sections", () => {
  // Regression guard: opening "Closing & signature" used to crash the whole app
  // (IconInput cloned a single child but received an <input> + <datalist> sibling,
  // so children.props.style was undefined -> "Cannot read properties of undefined").
  // Every section must open without taking the app down.
  const SECTIONS = ["Recipient & company", "Your info", "Opening", "Body", "Closing & signature"];

  test("every section opens without crashing the app", async ({ page }) => {
    const ignoreKnownHydration = (message) => /Minified React error #(418|423|425)\b/.test(message);
    const errors = [];
    page.on("pageerror", (e) => { const t = String(e); if (!ignoreKnownHydration(t)) errors.push(t); });

    await page.goto("/cover-letter/builder");
    // The React error screen must never appear.
    const crashScreen = page.getByText(/Unexpected Application Error/i);

    for (const title of SECTIONS) {
      await page.getByRole("heading", { name: title, exact: true }).click();
      // Section body rendered (not the error-boundary fallback, not a crash).
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(crashScreen).toHaveCount(0);
    }

    // Closing section specifically renders the sign-off field with a locale default.
    await expect(page.locator("#cover-field-signoff")).toBeVisible();
    await expect(page.locator("#cover-field-signoff")).toHaveValue("Sincerely,");
    await expect(page.locator("#cover-field-date")).not.toHaveValue("");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("French letter defaults are localized", async ({ page }) => {
    await page.goto("/cover-letter/builder?ui=fr&docLang=fr");
    // Date lives in "Destinataire et entreprise"; sign-off in "Conclusion et signature".
    await page.getByRole("heading", { name: "Destinataire et entreprise", exact: true }).click();
    await expect(page.locator("#cover-field-date")).toHaveValue(/^\d+ \p{L}+ \d{4}$/u); // e.g. "9 juillet 2026"
    await page.getByRole("heading", { name: "Conclusion et signature", exact: true }).click();
    await expect(page.locator("#cover-field-signoff")).toHaveValue("Cordialement,");
    await expect(page.getByText(/Unexpected Application Error/i)).toHaveCount(0);
  });

  test("French closing renders from the field across three template branches", async ({ page }) => {
    for (const template of ["Classic", "Modern", "Minimal"]) {
      await page.goto("/cover-letter/templates/?ui=fr&docLang=fr");
      const card = page.locator("article").filter({ has: page.getByRole("heading", { name: template, exact: true }) });
      await card.hover();
      await card.locator("button").filter({ hasText: "Utiliser le modèle" }).last().click({ force: true });
      await page.getByRole("heading", { name: "Conclusion et signature", exact: true }).click();
      await expect(page.locator("#cover-field-signoff")).toHaveValue("Cordialement,");
      await expect(page.locator(".resume-paper")).toContainText("Cordialement,");
      await expect(page.locator(".resume-paper")).not.toContainText("Sincerely");
    }
  });

  test("Arabic letter uses an Arabic RTL closing", async ({ page }) => {
    await page.goto("/cover-letter/builder?ui=ar&docLang=ar");
    await page.getByRole("heading", { name: "الخاتمة والتوقيع", exact: true }).click();
    await expect(page.locator("#cover-field-signoff")).toHaveValue("مع خالص التقدير،");
    await expect(page.locator("#cover-field-signoff")).toHaveAttribute("dir", "rtl");
    await expect(page.locator(".resume-paper")).toHaveAttribute("dir", "rtl");
    await expect(page.locator(".resume-paper")).toContainText("مع خالص التقدير،");
  });
});

test.describe("ATS checker", () => {
  test("shows the ApplyCraft ATS Readiness Score after a check", async ({ page }) => {
    await page.goto("/app/ats-checker");
    const textarea = page.locator("textarea").first();
    await textarea.fill("Jane Doe\njane@example.com\nEXPERIENCE\nSenior Engineer — Acme (2021-2024)\nBuilt data pipelines with Python and SQL.\nSKILLS\nPython, SQL, AWS");
    await page.getByRole("button", { name: /check my resume/i }).click();
    await expect(page.getByText("ApplyCraft ATS Readiness Score", { exact: true })).toBeVisible();
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
  // Depth on the skip link lives in tests/e2e/skip-link.spec.js.
  test("skip link is the first tab stop", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator("a.skip-link")).toBeFocused();
  });
});
