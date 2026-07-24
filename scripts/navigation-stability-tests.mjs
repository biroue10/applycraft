import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.NAVIGATION_STABILITY_BASE_URL || "http://127.0.0.1:4173";
const output = new URL("../.audit/navigation-stability/", import.meta.url).pathname;
const scenarios = [
  { locale: "en", start: "/cover-letter/templates/", transitions: 50 },
  { locale: "fr", start: "/cover-letter/templates/?ui=fr&docLang=fr", transitions: 50 },
  { locale: "ar", start: "/cover-letter/templates/?ui=ar&docLang=ar", transitions: 50 },
];
const responsiveWidths = [1920, 1600, 1440, 1366, 1280, 1180, 1024, 768, 430, 390, 360, 320];

let preview;
try {
  await fetch(baseURL);
} catch {
  preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], { stdio: "ignore" });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try { if ((await fetch(baseURL)).ok) break; } catch {
      if (attempt === 29) throw new Error("Preview did not start");
    }
  }
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { scenarios: {}, responsive: {}, maximumDelta: {} };

const boxState = async (page) => page.evaluate(() => {
  const visible = (node) => node && getComputedStyle(node).display !== "none" && node.getBoundingClientRect().width > 0;
  const box = (selector) => {
    const node = [...document.querySelectorAll(selector)].find(visible);
    if (!node) return null;
    const { x, y, width, height } = node.getBoundingClientRect();
    return { x, y, width, height };
  };
  return {
    header: box(".ac-global-header"),
    logo: box(".ac-nav-logo"),
    nav: box(".ac-global-header__nav"),
    actions: box(".ac-global-header__actions"),
    language: box(".ac-global-header__language"),
    cta: box(".ac-nav-cta"),
    activeCount: new Set([...document.querySelectorAll('.ac-nav-link[aria-current="page"]')].map((node) => node.dataset.navId)).size,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});

const delta = (left, right, property) => Math.abs((left?.[property] ?? 0) - (right?.[property] ?? 0));
const assertStable = (reference, current, label) => {
  for (const element of ["header", "logo", "nav", "actions", "language", "cta"]) {
    if (!reference[element] && !current[element]) continue;
    assert.ok(reference[element] && current[element], `${label}: ${element} visibility stays stable`);
    for (const property of ["x", "y", "width", "height"]) {
      const value = delta(reference[element], current[element], property);
      report.maximumDelta[`${element}.${property}`] = Math.max(report.maximumDelta[`${element}.${property}`] || 0, value);
      assert.ok(value <= 1, `${label}: ${element}.${property} delta ${value}px`);
    }
  }
  assert.equal(current.activeCount, 1, `${label}: exactly one visible active item`);
  assert.ok(current.overflow <= 1, `${label}: no horizontal overflow`);
};

const clickNav = async (page, id, locale = "en") => {
  const desktop = page.locator(`.ac-global-header__nav > .ac-nav-link[data-nav-id="${id}"]:visible`);
  if (await desktop.count()) {
    await desktop.click({ force: true });
  } else {
    const button = page.locator(".ac-global-header__menu-button:visible");
    if (await page.locator(".ac-global-header__mobile-menu:visible").count() === 0) await button.click();
    await page.locator(`.ac-global-header__mobile-menu .ac-nav-link[data-nav-id="${id}"]:visible`).click({ force: true });
  }
  await page.waitForFunction((activeId) => (
    document.querySelector(`.ac-nav-link[data-nav-id="${activeId}"][aria-current="page"]`) !== null
  ), id);
  if (locale) {
    await page.waitForFunction((expectedLocale) => document.documentElement.lang.split("-")[0] === expectedLocale, locale);
  }
  await page.waitForFunction(() => {
    const header = document.querySelector(".ac-global-header");
    return header && getComputedStyle(header).position === "sticky"
      && Math.abs(header.getBoundingClientRect().x) <= 1;
  });
  await page.evaluate(() => document.fonts?.ready);
};

try {
  for (const scenario of scenarios) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => localStorage.setItem("ac_cookie_consent", "denied"));
    const consoleErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    await page.goto(`${baseURL}${scenario.start}`, { waitUntil: "networkidle" });
    const reference = await boxState(page);
    const urls = [page.url()];
    let maximumUrlLength = page.url().length;
    for (let index = 0; index < scenario.transitions; index += 1) {
      const id = index % 2 === 0 ? "ats" : "cover";
      await clickNav(page, id, scenario.locale);
      const current = await boxState(page);
      assertStable(reference, current, `${scenario.locale} transition ${index + 1}`);
      const currentUrl = page.url();
      const parsed = new URL(currentUrl);
      assert.ok((currentUrl.match(/\?/g) || []).length <= 1, `${scenario.locale}: no repeated question mark`);
      assert.ok(parsed.searchParams.getAll("ui").length <= 1, `${scenario.locale}: ui remains unique`);
      assert.ok(parsed.searchParams.getAll("docLang").length <= 1, `${scenario.locale}: docLang remains unique`);
      maximumUrlLength = Math.max(maximumUrlLength, currentUrl.length);
      urls.push(currentUrl);
    }
    // A newly-created Playwright page retains its initial about:blank entry;
    // exclude it so the history audit never leaves the ApplyCraft origin.
    const availableBackEntries = await page.evaluate(() => Math.max(0, history.length - 2));
    const requestedHistoryChecks = Math.min(10, availableBackEntries);
    let historyChecks = 0;
    for (let index = 0; index < requestedHistoryChecks; index += 1) {
      await page.goBack({ waitUntil: "domcontentloaded" });
      if (!page.url().startsWith(baseURL)) {
        await page.goForward({ waitUntil: "domcontentloaded" });
        break;
      }
      await page.locator(".ac-global-header").waitFor({ state: "visible" });
      historyChecks += 1;
    }
    for (let index = 0; index < historyChecks; index += 1) {
      await page.goForward({ waitUntil: "domcontentloaded" });
      await page.locator(".ac-global-header").waitFor({ state: "visible" });
    }
    await page.locator(".ac-global-header").waitFor({ state: "visible" });
    assertStable(reference, await boxState(page), `${scenario.locale} back/forward`);
    assert.deepEqual(consoleErrors, [], `${scenario.locale}: no console errors`);
    await page.screenshot({ path: `${output}${scenario.locale}-after-50.png`, fullPage: false });
    report.scenarios[scenario.locale] = { transitions: scenario.transitions, historyChecks, maximumUrlLength, finalUrl: page.url(), urls };
    await page.close();
  }

  for (const width of responsiveWidths) {
    process.stdout.write(`\rresponsive ${width}px   `);
    const page = await browser.newPage({ viewport: { width, height: width <= 768 ? 844 : 900 } });
    await page.addInitScript(() => localStorage.setItem("ac_cookie_consent", "denied"));
    await page.goto(`${baseURL}/cover-letter/templates/?ui=fr&docLang=fr`, { waitUntil: "networkidle" });
    const reference = await boxState(page);
    await clickNav(page, "ats", "");
    await clickNav(page, "cover", "");
    assert.equal(await page.evaluate(() => document.documentElement.lang.split("-")[0]), "fr",
      `responsive ${width}: locale remains French`);
    const current = await boxState(page);
    assertStable(reference, current, `responsive ${width}`);
    report.responsive[width] = current;
    await page.close();
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

await writeFile(`${output}report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Navigation stability passed: 150 locale transitions + ${responsiveWidths.length * 2} responsive transitions.`);
