import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { LOCALIZED_ROUTES, localizeRoute } from "../src/seo/localizedRoutes.js";

const baseURL = process.env.NAVBAR_ALL_ROUTES_BASE_URL || "http://127.0.0.1:4173";
const output = new URL("../.audit/navbar-zero-movement/", import.meta.url).pathname;
const routes = [
  { id: "resume", href: "/resume-builder/" },
  { id: "cover", href: "/cover-letter-builder/" },
  { id: "ats", href: "/ats-checker/" },
  { id: "application-pack", href: "/application-pack/" },
  { id: "tracker", href: "/job-tracker/" },
  { id: "interview", href: "/interview-prep/" },
  { id: "templates", href: "/resume/templates/" },
  { id: "pricing", href: "/pricing/" },
];
const locales = {
  en: routes,
  fr: routes,
  ar: routes.filter((route) => LOCALIZED_ROUTES[route.href]?.ar),
};
const responsiveViewports = [
  [1920, 1080], [1600, 900], [1440, 900], [1366, 768], [1280, 720], [1180, 820],
  [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 800], [320, 568],
];

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
const report = {
  matrix: {},
  responsive: {},
  maximumDelta: {},
  largestTransitions: [],
  persistedHeaderTransitions: 0,
  fullPageTransitions: 0,
};

const measure = async (page) => page.evaluate(() => {
  const rect = (node) => {
    if (!node) return null;
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      x: box.x, y: box.y, width: box.width, height: box.height,
      padding: style.padding, margin: style.margin, borderWidth: style.borderWidth,
      fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
      lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, display: style.display,
      gap: style.gap,
    };
  };
  const header = document.querySelector(".ac-global-header");
  const primaryLinks = [...document.querySelectorAll(".ac-global-header__nav > .ac-nav-link")];
  const activeIds = new Set([...document.querySelectorAll('.ac-nav-link[aria-current="page"]')].map((node) => node.dataset.navId));
  return {
    header: rect(header),
    inner: rect(document.querySelector(".ac-global-header__inner")),
    logo: rect(document.querySelector(".ac-nav-logo")),
    nav: rect(document.querySelector(".ac-global-header__nav")),
    actions: rect(document.querySelector(".ac-global-header__actions")),
    language: rect(document.querySelector(".ac-global-header__language")),
    cta: rect(document.querySelector(".ac-nav-cta")),
    menuButton: rect(document.querySelector(".ac-global-header__menu-button")),
    links: Object.fromEntries(primaryLinks.map((node) => [node.dataset.navId, rect(node)])),
    itemOrder: primaryLinks.map((node) => node.dataset.navId),
    activeIds: [...activeIds],
    clientWidth: document.documentElement.clientWidth,
    hasVerticalScrollbar: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    borderBottom: getComputedStyle(header).borderBottomWidth,
    boxShadow: getComputedStyle(header).boxShadow,
  };
});

const numericProperties = ["x", "y", "width", "height"];
const usedBoxDelta = (left, right) => {
  const a = String(left).match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  const b = String(right).match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  return a.length === b.length ? Math.max(0, ...a.map((value, index) => Math.abs(value - b[index]))) : Infinity;
};
function compare(source, destination, label) {
  let transitionMax = 0;
  for (const element of ["header", "inner", "logo", "nav", "actions", "language", "cta", "menuButton"]) {
    assert.equal(Boolean(source[element]), Boolean(destination[element]), `${label}: ${element} presence`);
    if (!source[element]) continue;
    for (const property of numericProperties) {
      const value = Math.abs(source[element][property] - destination[element][property]);
      transitionMax = Math.max(transitionMax, value);
      report.maximumDelta[`${element}.${property}`] = Math.max(report.maximumDelta[`${element}.${property}`] || 0, value);
      assert.ok(value <= 1, `${label}: ${element}.${property} moved ${value}px`);
    }
    const stableProperties = ["padding", "borderWidth", "display", "gap"];
    if (["header", "nav", "language", "cta", "menuButton"].includes(element)) {
      stableProperties.push("fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing");
    }
    for (const property of stableProperties) {
      assert.equal(destination[element][property], source[element][property], `${label}: ${element}.${property}`);
    }
    // Browsers expose an auto flex margin as its resolved pixel value. A
    // subpixel rounding difference is governed by the same <=1px geometry
    // tolerance rather than indicating a different CSS margin declaration.
    assert.ok(usedBoxDelta(destination[element].margin, source[element].margin) <= 1,
      `${label}: ${element}.margin`);
  }
  assert.deepEqual(destination.itemOrder, source.itemOrder, `${label}: item order`);
  for (const id of source.itemOrder) {
    for (const property of numericProperties) {
      const value = Math.abs(source.links[id][property] - destination.links[id][property]);
      transitionMax = Math.max(transitionMax, value);
      report.maximumDelta[`link.${id}.${property}`] = Math.max(report.maximumDelta[`link.${id}.${property}`] || 0, value);
      assert.ok(value <= 1, `${label}: ${id}.${property} moved ${value}px`);
    }
    for (const property of ["padding", "margin", "borderWidth", "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "display"]) {
      assert.equal(destination.links[id][property], source.links[id][property], `${label}: ${id}.${property}`);
    }
  }
  assert.equal(destination.clientWidth, source.clientWidth, `${label}: stable document client width`);
  assert.equal(destination.activeIds.length, 1, `${label}: exactly one active destination`);
  assert.equal(destination.borderBottom, "0px", `${label}: no header border`);
  assert.equal(destination.boxShadow, "none", `${label}: no header shadow`);
  assert.ok(destination.overflow <= 1, `${label}: no horizontal overflow`);
  return transitionMax;
}

async function ready(page, locale = "en") {
  await page.locator(".ac-global-header").waitFor({ state: "visible" });
  await page.waitForFunction((expectedLocale) => (
    document.documentElement.lang.split("-")[0] === expectedLocale
    && document.querySelector(".ac-global-header")?.dir === (expectedLocale === "ar" ? "rtl" : "ltr")
  ), locale);
  await page.evaluate(() => document.fonts?.ready);
}

async function openRoute(page, href, locale = "en") {
  await page.goto(`${baseURL}${href}`, { waitUntil: "domcontentloaded" });
  await ready(page, locale);
}

async function clickDestination(page, id, locale = "en") {
  const link = page.locator(`.ac-global-header__nav > .ac-nav-link[data-nav-id="${id}"]`);
  await link.click();
  await page.waitForFunction((activeId) => (
    new Set([...document.querySelectorAll('.ac-nav-link[aria-current="page"]')].map((node) => node.dataset.navId)).has(activeId)
  ), id);
  await ready(page, locale);
}

try {
  for (const [locale, localeRoutes] of Object.entries(locales)) {
    report.matrix[locale] = [];
    for (const sourceRoute of localeRoutes) {
      for (const destinationRoute of localeRoutes) {
        if (sourceRoute.id === destinationRoute.id) continue;
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        await page.addInitScript((language) => {
          localStorage.setItem("ac_cookie_consent", "denied");
          localStorage.setItem("ac_interface_language", language);
          localStorage.setItem("ac_document_language", language);
        }, locale);
        const errors = [];
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        const sourceHref = localizeRoute(sourceRoute.href, locale);
        await openRoute(page, sourceHref, locale);
        const source = await measure(page);
        await page.evaluate(() => { window.__acHeaderIdentity = document.querySelector(".ac-global-header"); });
        process.stdout.write(`\r${locale} ${sourceRoute.id} -> ${destinationRoute.id}   `);
        await clickDestination(page, destinationRoute.id, locale);
        const destination = await measure(page);
        const persisted = await page.evaluate(() => window.__acHeaderIdentity === document.querySelector(".ac-global-header"));
        if (persisted) report.persistedHeaderTransitions += 1;
        else report.fullPageTransitions += 1;
        const label = `${locale} ${sourceRoute.id} -> ${destinationRoute.id}`;
        const maximumDelta = compare(source, destination, label);
        const url = page.url();
        const parsed = new URL(url);
        assert.ok((url.match(/\?/g) || []).length <= 1, `${label}: one question mark`);
        assert.ok(parsed.searchParams.getAll("ui").length <= 1, `${label}: one ui value`);
        assert.ok(parsed.searchParams.getAll("docLang").length <= 1, `${label}: one docLang value`);
        assert.deepEqual(errors, [], `${label}: no console errors`);
        report.matrix[locale].push({ source: sourceRoute.id, destination: destinationRoute.id, maximumDelta, persisted, url });
        report.largestTransitions.push({ label, maximumDelta });
        await page.close();
      }
    }
  }

  // Responsive mode and geometry must be route-independent at each viewport.
  for (const [width, height] of responsiveViewports) {
    report.responsive[width] = {};
    let reference;
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript(() => localStorage.setItem("ac_cookie_consent", "denied"));
      await openRoute(page, route.href);
      const current = await measure(page);
      if (!reference) reference = current;
      else compare(reference, current, `responsive ${width} ${route.id}`);
      report.responsive[width][route.id] = current;
      if (width === 1920 || width === 1280 || width === 390) {
        await page.screenshot({ path: `${output}${route.id}-${width}x${height}.png`, clip: { x: 0, y: 0, width, height: Math.min(height, 200) } });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

report.largestTransitions.sort((left, right) => right.maximumDelta - left.maximumDelta);
await writeFile(`${output}all-routes-report.json`, `${JSON.stringify(report, null, 2)}\n`);
const transitionCount = Object.values(report.matrix).reduce((total, entries) => total + entries.length, 0);
console.log(`Navbar all-routes passed: ${transitionCount} directed locale transitions + ${responsiveViewports.length * routes.length} responsive route checks.`);
