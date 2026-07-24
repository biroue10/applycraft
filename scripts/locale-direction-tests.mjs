import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.LOCALE_DIRECTION_BASE_URL || "http://127.0.0.1:4173";
let preview;

try {
  await fetch(`${baseURL}/`);
} catch {
  preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      if ((await fetch(`${baseURL}/`)).ok) break;
    } catch {
      if (attempt === 29) throw new Error("Production preview did not become ready");
    }
  }
}

const routes = [
  { path: "/interview-prep/", lang: "en", dir: "ltr" },
  { path: "/fr/interview-prep/", lang: "fr", dir: "ltr" },
  { path: "/ar/interview-prep/", lang: "ar", dir: "rtl" },
];
const browser = await chromium.launch({ headless: true });
let checks = 0;

try {
  for (const route of routes) {
    const initialHtml = await (await fetch(`${baseURL}${route.path}`)).text();
    assert.match(
      initialHtml,
      new RegExp(`<html[^>]*lang="${route.lang}"[^>]*dir="${route.dir}"`, "i"),
      `${route.path}: initial HTML must serialize the interface language and direction`,
    );

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseURL}${route.path}`, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => {
      const direction = (selector) => getComputedStyle(document.querySelector(selector)).direction;
      const label = document.querySelector("label");
      const counter = document.querySelector("#ac-iv-offer")?.nextElementSibling?.textContent.trim();
      return {
        htmlLang: document.documentElement.lang,
        htmlDir: document.documentElement.dir,
        shellDir: direction("[data-interface-shell]"),
        headerDir: direction("[data-site-header]"),
        mainDir: direction("main"),
        formDir: direction("form"),
        footerDir: direction("footer"),
        labelAlign: getComputedStyle(label).textAlign,
        textareaDir: direction("#ac-iv-offer"),
        counter,
        active: document.querySelectorAll('.ac-nav-link[aria-current="page"][data-nav-id="interview"]').length,
      };
    });
    assert.equal(state.htmlLang, route.lang, `${route.path}: hydrated html language`);
    for (const key of ["htmlDir", "shellDir", "headerDir", "mainDir", "formDir", "footerDir"]) {
      assert.equal(state[key], route.dir, `${route.path}: ${key}`);
    }
    assert.equal(state.active, 1, `${route.path}: Interview Prep is the sole active destination`);
    assert.ok(state.counter?.length, `${route.path}: character counter is rendered`);
    assert.equal(state.labelAlign, "start", `${route.path}: labels use logical start alignment`);

    await page.locator("#ac-iv-lang").selectOption(route.lang === "ar" ? "fr" : "ar");
    const afterInterviewLanguageChange = await page.evaluate(() => ({
      htmlDir: document.documentElement.dir,
      shellDir: getComputedStyle(document.querySelector("[data-interface-shell]")).direction,
      formDir: getComputedStyle(document.querySelector("form")).direction,
      footerDir: getComputedStyle(document.querySelector("footer")).direction,
    }));
    assert.deepEqual(
      afterInterviewLanguageChange,
      { htmlDir: route.dir, shellDir: route.dir, formDir: route.dir, footerDir: route.dir },
      `${route.path}: interview language must not mutate interface direction`,
    );
    checks += 1;
    await page.close();
  }

  for (const width of [1600, 1440, 1366, 1280, 1180, 1024, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 820 } });
    await page.goto(`${baseURL}/fr/interview-prep/`, { waitUntil: "networkidle" });
    const layout = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== "none" && box.width > 0;
      };
      const links = [...document.querySelectorAll(".ac-global-header__nav > .ac-nav-link")].filter(visible);
      const boxes = links.map((link) => link.getBoundingClientRect());
      return {
        overlap: boxes.some((box, index) => index > 0 && box.left < boxes[index - 1].right - 0.5),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        navVisible: visible(document.querySelector(".ac-global-header__nav")),
        moreVisible: visible(document.querySelector(".ac-site-more")),
        mobileVisible: visible(document.querySelector(".ac-global-header__menu-button")),
      };
    });
    assert.equal(layout.overlap, false, `French ${width}px: navigation links must not overlap`);
    assert.equal(layout.overflow, false, `French ${width}px: no horizontal overflow`);
    if (width <= 1180) assert.equal(layout.mobileVisible, true, `French ${width}px: mobile menu activates before overlap`);
    else if (width <= 1600) assert.equal(layout.moreVisible, true, `French ${width}px: compact More menu activates before overlap`);
    checks += 1;
    await page.close();
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

console.log(`Locale direction checks passed: ${checks} route/viewport combinations.`);
