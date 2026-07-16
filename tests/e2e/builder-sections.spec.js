import { test, expect } from "@playwright/test";

// Every resume section is rendered from the start (collapsed, and marked Optional
// when it isn't mandatory), but an untouched optional section must never reach the
// preview or the export. See ENTRY_SCHEMAS / buildLiveData in src/ResumeGenerator.jsx.

const ALL_SECTIONS = [
  "Experience", "Education", "Skills", "Languages",
  "Certifications", "Projects", "Volunteer Work", "Awards & Achievements",
  "Publications", "References", "Extra-Curricular",
];

// Mandatory content is Personal Info + at least one of Experience / Education.
const MANDATORY_SECTIONS = ["Experience", "Education"];
const OPTIONAL_SECTIONS = ALL_SECTIONS.filter((s) => !MANDATORY_SECTIONS.includes(s));

const sectionHeading = (page, name) =>
  page.getByRole("heading", { level: 3, name, exact: true });

test.describe("Builder sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resume-builder?template=modern", { waitUntil: "networkidle" });
  });

  test("a new resume shows every section, collapsed, optional ones marked", async ({ page }) => {
    for (const name of ALL_SECTIONS) {
      await expect(sectionHeading(page, name), `${name} must be visible without opening the picker`).toBeVisible();
    }

    // Collapsed by default: discoverable, not overwhelming.
    for (const name of ALL_SECTIONS) {
      const header = sectionHeading(page, name).locator("xpath=ancestor::header[1]");
      await expect(header, `${name} should start collapsed`).toHaveAttribute("aria-expanded", "false");
    }

    // Empty optional sections say so; the mandatory pair never does.
    for (const name of OPTIONAL_SECTIONS) {
      const card = sectionHeading(page, name).locator("xpath=ancestor::section[1]");
      await expect(card.getByText("Optional", { exact: true }), `${name} should be marked Optional`).toBeVisible();
    }
    for (const name of MANDATORY_SECTIONS) {
      const card = sectionHeading(page, name).locator("xpath=ancestor::section[1]");
      await expect(card.getByText("Optional", { exact: true }), `${name} is mandatory, not optional`).toHaveCount(0);
    }
  });

  test("expanding a section still works and the badge drops once it has content", async ({ page }) => {
    const heading = sectionHeading(page, "Certifications");
    const card = heading.locator("xpath=ancestor::section[1]");
    await heading.click();
    await expect(heading.locator("xpath=ancestor::header[1]")).toHaveAttribute("aria-expanded", "true");

    await card.getByRole("button", { name: /add entry/i }).click();
    await card.getByRole("textbox").first().fill("AWS Solutions Architect");
    await expect(card.getByText("Optional", { exact: true })).toHaveCount(0);
  });

  test("untouched optional sections stay out of the live preview", async ({ page, isMobile }) => {
    // Mobile opens in edit mode with the preview behind a toggle; the exclusion
    // itself is viewport-independent (one buildLiveData feeds preview and export).
    test.skip(isMobile, "preview pane is desktop-only in the split layout");
    const preview = page.locator(".resume-paper").first();
    await expect(preview).toBeVisible();

    // Nothing has been filled in, so no optional heading may be printed —
    // an empty "References" or "Publications" on a resume is the bug this guards.
    for (const name of OPTIONAL_SECTIONS) {
      await expect(preview.getByText(name, { exact: true }), `empty "${name}" must not render in the preview`).toHaveCount(0);
    }

    // Content in an optional section brings it into the output.
    const heading = sectionHeading(page, "Projects");
    const card = heading.locator("xpath=ancestor::section[1]");
    await heading.click();
    await card.getByRole("button", { name: /add entry/i }).click();
    await card.getByRole("textbox").first().fill("ApplyCraft");
    await expect(preview.getByText("Projects", { exact: true })).toBeVisible();
    await expect(preview.getByText("ApplyCraft", { exact: true })).toBeVisible();
  });

  // A starter loads through the same migrateForm({ ...emptyResumeForm, ...data })
  // path a saved resume does, and carries content for only some sections — so it
  // stands in for a resume created before every section was shown by default.
  test("a resume created before this change opens with its content intact", async ({ page, isMobile }) => {
    test.skip(isMobile, "preview pane is desktop-only in the split layout");
    const errors = [];
    page.on("pageerror", (e) => { if (!/Minified React error #(418|423|425)\b/.test(String(e))) errors.push(String(e)); });

    await page.goto("/resume-builder?starter=software-engineer", { waitUntil: "networkidle" });

    // Sections it was saved with keep their content. Assert on the content
    // itself: each template supplies its own section headings.
    const preview = page.locator(".resume-paper").first();
    await expect(preview.getByText("Northwind Cloud")).toBeVisible();
    await expect(preview.getByText("B.Sc. Computer Science")).toBeVisible();

    // Sections it never had are present in the editor but empty — not an error,
    // and never printed.
    for (const name of ["Publications", "References", "Volunteer Work"]) {
      const card = sectionHeading(page, name).locator("xpath=ancestor::section[1]");
      await expect(card.getByText("Optional", { exact: true })).toBeVisible();
      await expect(preview.getByText(name, { exact: true })).toHaveCount(0);
    }

    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("the optional badge is localized and RTL-correct in Arabic", async ({ page }) => {
    await page.goto("/resume-builder/?ui=ar&docLang=ar", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // References — Arabic heading, with the localized Optional badge beside it.
    const card = page.getByRole("heading", { level: 3, name: "المراجع", exact: true })
      .locator("xpath=ancestor::section[1]");
    await expect(card).toBeVisible();
    await expect(card.getByText("اختياري", { exact: true })).toBeVisible();
    await expect(page.getByText("Optional", { exact: true })).toHaveCount(0);
  });

  test("completion counts mandatory content only", async ({ page, isMobile }) => {
    // The builder header hides the counter on narrow viewports ({!isMobile && …}).
    test.skip(isMobile, "completion counter is not rendered in the mobile header");
    // Personal Info + (Experience OR Education) = 2 mandatory items.
    await expect(page.getByText(/^0\/2 complete$/)).toBeVisible();

    // Every card starts collapsed, so its fields are not mounted until opened.
    await page.getByRole("heading", { level: 3, name: "Personal Info", exact: true }).click();
    await page.locator("#field-name").fill("Jane Doe");
    await page.locator("#field-email").fill("jane@example.com");
    await page.locator("#field-location").fill("Toronto, Canada");
    await expect(page.getByText(/^1\/2 complete$/)).toBeVisible();

    // Education alone satisfies the second requirement — Experience is not needed,
    // and no optional section is required to reach a complete state.
    const heading = sectionHeading(page, "Education");
    const card = heading.locator("xpath=ancestor::section[1]");
    await heading.click();
    await card.getByRole("button", { name: /add entry/i }).click();
    await card.getByRole("textbox").first().fill("BSc Computer Science");
    await expect(page.getByText(/^2\/2 complete$/)).toBeVisible();
  });
});
