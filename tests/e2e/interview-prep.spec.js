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

const SELECT_COPY = {
  en: { path: "/interview-prep/", languages: ["English", "French", "Arabic"], levels: ["Junior", "Mid-level", "Senior"] },
  fr: { path: "/fr/interview-prep/", languages: ["Anglais", "Français", "Arabe"], levels: ["Junior", "Confirmé", "Senior"] },
  ar: { path: "/ar/interview-prep/", languages: ["الإنجليزية", "الفرنسية", "العربية"], levels: ["مبتدئ", "متوسط", "خبير"] },
};

function relativeLuminance([r, g, b]) {
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function rgbChannels(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Expected an opaque RGB color, received: ${value}`);
  return channels;
}

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

test("native interview selects keep every localized option enabled and readable", async ({ page }) => {
  for (const [locale, expected] of Object.entries(SELECT_COPY)) {
    await page.goto(expected.path, { waitUntil: "networkidle" });
    const language = page.locator("#ac-iv-lang");
    const level = page.locator("#ac-iv-level");

    await expect(language).toHaveClass(/ac-interview-select/);
    await expect(level).toHaveClass(/ac-interview-select/);
    await expect(language.locator("option")).toHaveText(expected.languages);
    await expect(level.locator("option")).toHaveText(expected.levels);
    expect(await language.locator("option:disabled").count()).toBe(0);
    expect(await level.locator("option:disabled").count()).toBe(0);

    for (const select of [language, level]) {
      const colors = await select.evaluate((node) => {
        const selectStyle = getComputedStyle(node);
        const optionStyle = getComputedStyle(node.options[0]);
        return {
          colorScheme: selectStyle.colorScheme,
          selectColor: selectStyle.color,
          selectBackground: selectStyle.backgroundColor,
          optionColor: optionStyle.color,
          optionBackground: optionStyle.backgroundColor,
        };
      });
      expect(colors.colorScheme).toContain("dark");
      expect(contrastRatio(rgbChannels(colors.selectColor), rgbChannels(colors.selectBackground))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(rgbChannels(colors.optionColor), rgbChannels(colors.optionBackground))).toBeGreaterThanOrEqual(4.5);
    }

    await language.selectOption("fr");
    await expect(language).toHaveValue("fr");
    await language.selectOption("ar");
    await expect(language).toHaveValue("ar");
    await language.selectOption("en");
    await expect(language).toHaveValue("en");

    await level.focus();
    await page.keyboard.press("ArrowDown");
    await expect(level).toHaveValue("confirme");
    await page.keyboard.press("ArrowDown");
    await expect(level).toHaveValue("senior");
  }
});

test("the chosen interview language stays independent from the English interface", async ({ browser }) => {
  for (const locale of ["en", "fr", "ar"]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    let submitted;
    await page.route("**/api/interview", async (route) => {
      submitted = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: `data: ${JSON.stringify({ text: `Question in ${locale}` })}\n\ndata: ${JSON.stringify({ done: true })}\n\ndata: [DONE]\n\n`,
      });
    });

    await page.goto("/interview-prep/", { waitUntil: "networkidle" });
    await page.locator("#ac-iv-lang").selectOption(locale);
    await page.locator("#ac-iv-level").selectOption("senior");
    await page.locator("#ac-iv-offer").fill("Backend engineer role requiring API design and communication skills.");
    await page.getByRole("button", { name: "Start simulation" }).click();
    await expect(page.getByText(`Question in ${locale}`)).toBeVisible();
    expect(submitted).toMatchObject({ locale, level: "senior" });
    await context.close();
  }
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

  // Add an application straight into the "Interview" column. The column label is
  // uppercased by CSS, so the DOM text is still "Interview".
  const interviewColumn = page
    .locator('div:has(> div > div > span:text-is("Interview"))')
    .filter({ has: page.locator('button:text-is("+")') })
    .last();
  await interviewColumn.getByRole("button", { name: "+", exact: true }).click();
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
