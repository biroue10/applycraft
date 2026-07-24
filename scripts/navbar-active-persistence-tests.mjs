import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.NAVBAR_ACTIVE_BASE_URL || "http://127.0.0.1:4173";
const output = new URL("../.audit/navbar-active-persistence/", import.meta.url).pathname;
const activeColor = "rgba(99, 102, 241, 0.094)";
const routes = [
  ["/resume-builder/", "resume"],
  ["/cover-letter-builder/", "cover"],
  ["/cover-letter/templates/", "cover"],
  ["/ats-checker/", "ats"],
  ["/application-pack/", "application-pack"],
  ["/job-tracker/", "tracker"],
  ["/interview-prep/", "interview"],
  ["/resume/templates/", "templates"],
  ["/pricing/", "pricing"],
];
let preview;

try {
  await fetch(`${baseURL}/`);
} catch {
  preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], { stdio: "ignore" });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      if ((await fetch(`${baseURL}/`)).ok) break;
    } catch {
      if (attempt === 29) throw new Error("Production preview did not become ready");
    }
  }
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
let checks = 0;

async function state(page) {
  return page.evaluate((expectedActiveColor) => {
    const isVisible = (element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const currentLinks = [...document.querySelectorAll('.ac-nav-link[aria-current="page"]')];
    const visibleCurrent = currentLinks.filter(isVisible);
    const currentIds = [...new Set(currentLinks.map((link) => link.dataset.navId))];
    const visibleCurrentIds = [...new Set(visibleCurrent.map((link) => link.dataset.navId))];
    const more = document.querySelector(".ac-site-more > button");
    const activeLink = currentLinks[0];
    const style = activeLink ? getComputedStyle(activeLink) : null;
    const header = document.querySelector(".ac-global-header")?.getBoundingClientRect();
    return {
      url: `${location.pathname}${location.search}${location.hash}`,
      currentIds,
      visibleCurrentIds,
      background: style?.backgroundColor,
      decoration: style?.textDecorationLine,
      activeFocus: activeLink?.matches(":focus, :focus-visible, :active") || false,
      moreActive: more?.dataset.activeChild === "true",
      moreBackground: more ? getComputedStyle(more).backgroundColor : "",
      headerBorder: getComputedStyle(document.querySelector(".ac-global-header")).borderBottomWidth,
      header: header ? { x: header.x, y: header.y, width: header.width, height: header.height } : null,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      expectedActiveColor,
    };
  }, activeColor);
}

function assertCurrent(result, expectedId, context) {
  assert.deepEqual(result.currentIds, [expectedId], `${context}: exactly one active destination`);
  assert.equal(result.background, activeColor, `${context}: route-driven active background`);
  assert.equal(result.decoration, "none", `${context}: no active underline`);
  assert.equal(result.headerBorder, "0px", `${context}: no header bottom border`);
  assert.equal(result.overflow, false, `${context}: no horizontal overflow`);
}

try {
  for (const [path, id] of routes) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
    for (const suffix of ["?ui=fr", "?ui=fr#pipeline"]) {
      await page.goto(`${baseURL}${path}${suffix}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2100);
      const result = await state(page);
      assertCurrent(result, id, `${path}${suffix}`);
      assert.deepEqual(result.visibleCurrentIds, [id], `${path}${suffix}: current link remains visible on full desktop`);
      assert.equal(result.activeFocus, false, `${path}${suffix}: current state does not depend on click/focus pseudo-state`);
      checks += 1;
    }
    await page.reload({ waitUntil: "networkidle" });
    assertCurrent(await state(page), id, `${path}: refresh`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
  await page.goto(`${baseURL}/cover-letter/templates/?ui=fr&docLang=fr`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('.ac-global-header__nav > .ac-nav-link[data-nav-id="tracker"]').textContent(), "Suivi des candidatures",
    "French navigation is present before the Job Tracker transition");
  const sourceHeader = (await state(page)).header;
  const tracker = page.locator('.ac-global-header__nav > .ac-nav-link[data-nav-id="tracker"]');
  await tracker.dispatchEvent("mousedown");
  assert.equal((await state(page)).currentIds[0], "cover", "mousedown must not create route state");
  await Promise.all([page.waitForURL(/job-tracker/), tracker.click({ force: true })]);

  for (const [label, delay] of [["navigation", 0], ["100ms", 100], ["500ms", 400], ["2s", 1500], ["5s", 3000]]) {
    if (delay) await page.waitForTimeout(delay);
    const result = await state(page);
    assertCurrent(result, "tracker", `Job Tracker ${label}`);
    assert.match(result.url, /[?&]ui=fr(?:&|#|$)/, `Job Tracker ${label}: French interface parameter persists`);
    assert.equal(result.activeFocus, false, `Job Tracker ${label}: independent from focus`);
    assert.deepEqual(result.header, sourceHeader, `Job Tracker ${label}: navbar geometry`);
    await page.screenshot({ path: `${output}/job-tracker-${label}.png`, clip: { x: 0, y: 0, width: 1920, height: 200 } });
  }

  await page.locator("main").click({ position: { x: 20, y: 100 }, force: true });
  assertCurrent(await state(page), "tracker", "Job Tracker after blur");
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  assertCurrent(await state(page), "tracker", "Job Tracker after scroll");
  await page.locator(".ac-language-trigger").click();
  assertCurrent(await state(page), "tracker", "Job Tracker with language menu open");
  await page.keyboard.press("Escape");
  await page.goBack({ waitUntil: "networkidle" });
  assertCurrent(await state(page), "cover", "browser Back");
  await page.goForward({ waitUntil: "networkidle" });
  assertCurrent(await state(page), "tracker", "browser Forward");
  await page.close();

  for (const [width, id] of [[1366, "tracker"], [1366, "interview"], [1366, "templates"], [1366, "pricing"]]) {
    const compact = await browser.newPage({ viewport: { width, height: 768 } });
    const path = routes.find(([, routeId]) => routeId === id)?.[0];
    await compact.goto(`${baseURL}${path}?ui=fr`, { waitUntil: "networkidle" });
    const closed = await state(compact);
    assertCurrent(closed, id, `${id} compact`);
    assert.equal(closed.moreActive, true, `${id} compact: More persistently exposes its active child`);
    assert.equal(closed.moreBackground, activeColor, `${id} compact: More uses the active background`);
    await compact.locator(".ac-site-more > button").click();
    assert.deepEqual((await state(compact)).visibleCurrentIds, [id], `${id} compact: opening More exposes the current link`);
    await compact.close();
  }

  for (const width of [430, 390, 360, 320]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 } });
    await mobile.goto(`${baseURL}/job-tracker/?ui=fr`, { waitUntil: "networkidle" });
    await mobile.locator(".ac-global-header__menu-button").click();
    const result = await state(mobile);
    assertCurrent(result, "tracker", `mobile ${width}px`);
    assert.deepEqual(result.visibleCurrentIds, ["tracker"], `mobile ${width}px: current item visible after reopening menu`);
    await mobile.locator(".ac-global-header__menu-button").click();
    await mobile.locator(".ac-global-header__menu-button").click();
    assert.deepEqual((await state(mobile)).visibleCurrentIds, ["tracker"], `mobile ${width}px: current item survives close/reopen`);
    await mobile.close();
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

console.log(`Navbar active persistence checks passed: ${checks} direct route variants plus interaction, compact, and mobile flows.`);
