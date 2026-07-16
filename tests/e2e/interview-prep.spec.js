import { test, expect } from "@playwright/test";

// Interview Prep is a lazy, locale-aware route. These checks cover the public
// page (render + i18n + RTL + shared chrome) and the full simulation flow with
// the Worker endpoints mocked, so we exercise the SSE client and the three
// screens without a live Anthropic key.

const LOCALES = [
  { path: "/interview-prep/", heading: "Interview Prep", start: "Start simulation", rtl: false },
  { path: "/fr/interview-prep/", heading: "Préparation entretien", start: "Démarrer la simulation", rtl: false },
  { path: "/ar/interview-prep/", heading: "تحضير المقابلة", start: "ابدأ المحاكاة", rtl: true },
];

for (const locale of LOCALES) {
  test(`renders localized setup screen at ${locale.path}`, async ({ page }) => {
    await page.goto(locale.path, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.heading);
    await expect(page.getByRole("button", { name: locale.start })).toBeVisible();
    await expect(page.locator("#ac-iv-offer")).toBeVisible();
    // Shared chrome: unified footer + the Interview Prep nav item is active.
    await expect(page.locator('[data-footer="unified"]')).toHaveCount(1);
    if (locale.rtl) {
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    }
  });
}

test("start button is disabled until a job offer is pasted", async ({ page }) => {
  await page.goto("/interview-prep/", { waitUntil: "networkidle" });
  const start = page.getByRole("button", { name: "Start simulation" });
  await expect(start).toBeDisabled();
  await page.locator("#ac-iv-offer").fill("We are hiring a backend engineer to build APIs.");
  await expect(start).toBeEnabled();
});

test("runs a mocked simulation: stream a question, answer, then feedback", async ({ page }) => {
  const sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`;
  let questionsAsked = 0;

  await page.route("**/api/interview", async (route) => {
    questionsAsked += 1;
    const body =
      sse({ meta: { turn: questionsAsked, maxTurns: 8 } }) +
      sse({ text: `Mock question ${questionsAsked}?` }) +
      sse({ done: true }) +
      "data: [DONE]\n\n";
    await route.fulfill({ status: 200, contentType: "text/event-stream", body });
  });

  await page.route("**/api/interview/feedback", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locale: "en",
        feedback: {
          strengths: ["Clear structure"],
          improvements: ["Add measurable results"],
          rephrasings: [{ question: "Tell me about yourself", suggestion: "I am a backend engineer with 3 years..." }],
          score: 78,
          summary: "A solid, focused interview.",
        },
      }),
    });
  });

  await page.goto("/interview-prep/", { waitUntil: "networkidle" });
  await page.locator("#ac-iv-offer").fill("Backend engineer role building REST APIs in Node.js.");
  await page.getByRole("button", { name: "Start simulation" }).click();

  // First recruiter question streams in, with a turn counter.
  await expect(page.getByText("Mock question 1?")).toBeVisible();
  await expect(page.getByText("Question 1 / 8")).toBeVisible();

  // Answer → next question.
  await page.locator("#ac-iv-answer").fill("I have three years building Node.js APIs.");
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByText("Mock question 2?")).toBeVisible();

  // Finish → structured feedback in the chosen language.
  await page.getByRole("button", { name: "Finish & get my feedback" }).click();
  await expect(page.getByRole("heading", { name: "Your interview feedback" })).toBeVisible();
  await expect(page.getByText("78 / 100")).toBeVisible();
  await expect(page.getByText("Clear structure")).toBeVisible();
  await expect(page.getByText("Add measurable results")).toBeVisible();
});

// ── Contextual launch from the Job Tracker ──────────────────────────────────

test("an Interview-stage application offers a contextual launch into Interview Prep", async ({ page }) => {
  await page.goto("/job-tracker/", { waitUntil: "networkidle" });

  // Add an application straight into the "Interview" column.
  await page.locator('div:has(> div > span:text-is("INTERVIEW")) button:text-is("+")').first().click();
  await page.getByPlaceholder("e.g. Stripe").fill("Stripe");
  await page.getByPlaceholder("e.g. Senior Engineer").fill("Senior Backend Engineer");
  await page.getByRole("button", { name: "Add application" }).click();

  // The card now carries the contextual CTA, pointing at the current locale's
  // Interview Prep route with the role + company as query params.
  const cta = page.getByRole("link", { name: /Interview secured/ });
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).toContain("/interview-prep/");
  expect(href).toContain("jobTitle=Senior+Backend+Engineer");
  expect(href).toContain("company=Stripe");

  // Following it opens the existing simulator, pre-filled in its session header.
  await cta.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Interview Prep");
  await expect(page.getByText("Preparing for: Senior Backend Engineer at Stripe")).toBeVisible();
});

test("interview prep renders context from query params, and stays generic without them", async ({ page }) => {
  await page.goto("/fr/interview-prep/?jobTitle=D%C3%A9veloppeur&company=Acme", { waitUntil: "networkidle" });
  await expect(page.getByText("Préparation : Développeur chez Acme")).toBeVisible();

  // No context → the generic simulator, with no session header (no regression).
  await page.goto("/interview-prep/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Interview Prep");
  await expect(page.getByText(/Preparing for:/)).toHaveCount(0);
  await expect(page.locator("#ac-iv-offer")).toBeVisible();
});
