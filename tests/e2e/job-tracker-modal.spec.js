import { test, expect } from "@playwright/test";

const LOCALES = [
  { path: "/job-tracker/", title: "New Application", salary: "Salary / Range", add: "Add application", rtl: false },
  { path: "/job-tracker/?ui=fr&docLang=fr", title: "Nouvelle candidature", salary: "Salaire / Fourchette", add: "Ajouter la candidature", rtl: false },
  { path: "/job-tracker/?ui=ar&docLang=ar", title: "تقديم جديد", salary: "الراتب / النطاق", add: "أضف التقديم", rtl: true },
];

async function openNewApplication(page, locale) {
  await page.goto(locale.path, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Add first application|Ajouter une première candidature|أضف أول تقديم/ }).click();
  return page.getByRole("dialog", { name: locale.title });
}

for (const locale of LOCALES) {
  test(`New Application modal has separated regions and correct direction at ${locale.path}`, async ({ page }) => {
    const dialog = await openNewApplication(page, locale);
    const header = dialog.getByTestId("tracker-dialog-header");
    const body = dialog.getByTestId("tracker-dialog-body");
    const footer = dialog.getByTestId("tracker-dialog-footer");
    const salary = dialog.getByLabel(locale.salary);

    await expect(dialog).toBeVisible();
    await expect(header).toBeVisible();
    await expect(salary).toBeVisible();
    await expect(footer.getByRole("button", { name: locale.add })).toBeVisible();
    await expect(dialog).toHaveAttribute("dir", locale.rtl ? "rtl" : "ltr");

    const regions = await Promise.all([header, body, footer, salary].map((locator) => locator.boundingBox()));
    const [headerBox, bodyBox, footerBox, salaryBox] = regions;
    expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(bodyBox.y + 1);
    expect(salaryBox.y).toBeGreaterThan(headerBox.y + headerBox.height);
    expect(bodyBox.y + bodyBox.height).toBeLessThanOrEqual(footerBox.y + 1);

    const positionsBefore = { header: headerBox.y, footer: footerBox.y };
    await body.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    const [headerAfter, footerAfter] = await Promise.all([header.boundingBox(), footer.boundingBox()]);
    expect(headerAfter.y).toBeCloseTo(positionsBefore.header, 0);
    expect(footerAfter.y).toBeCloseTo(positionsBefore.footer, 0);
  });
}

test("New Application modal traps focus, closes with Escape, and still saves", async ({ page }) => {
  const dialog = await openNewApplication(page, LOCALES[0]);

  const close = dialog.getByRole("button", { name: "Close" });
  const cancel = dialog.getByRole("button", { name: "Cancel" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await dialog.getByLabel("Company *").fill("Acme");
  await dialog.getByLabel("Position *").fill("Platform Engineer");
  await dialog.getByRole("button", { name: "Add application" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Acme", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "+", exact: true }).first().click();
  const reopened = page.getByRole("dialog", { name: "New Application" });
  await expect(reopened).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(reopened).toHaveCount(0);
});
