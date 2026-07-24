import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.NAVBAR_VISUAL_BASE_URL || "http://127.0.0.1:4173";
const output = new URL("../.audit/navbar-no-underline/", import.meta.url).pathname;
const viewports = [[1440, 200], [1280, 200], [1024, 200], [390, 200]];
const routes = [
  ["cover-letter", "/cover-letter-builder/", "cover"],
  ["application-pack", "/application-pack/", "application-pack"],
  ["ats-checker", "/ats-checker/", "ats"],
  ["job-tracker", "/job-tracker/", "tracker"],
  ["interview-prep", "/interview-prep/", "interview"],
  ["resume-templates", "/resume/templates/", "templates"],
  ["pricing", "/pricing/", "pricing"],
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
const measurements = {};
try {
  for (const [width, height] of viewports) {
    measurements[width] = {};
    let reference;
    for (const [name, route, activeId] of routes) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript(() => localStorage.setItem("ac_cookie_consent", "denied"));
      const errors = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
      const mobile = await page.locator(".ac-global-header__menu-button:visible").count() > 0;
      if (mobile) await page.locator(".ac-global-header__menu-button").click();
      else if (["tracker", "interview", "templates", "pricing"].includes(activeId)) {
        await page.locator(".ac-site-more > button:visible").click();
      }
      const state = await page.evaluate((activeId) => {
        const visible = (node) => node && getComputedStyle(node).display !== "none" && node.getBoundingClientRect().width > 0;
        const box = (selector) => {
          const node = [...document.querySelectorAll(selector)].find(visible);
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right };
        };
        const header = document.querySelector(".ac-global-header");
        const active = [...document.querySelectorAll(`.ac-nav-link[data-nav-id="${activeId}"][aria-current="page"]`)].find(visible);
        const activeStyle = getComputedStyle(active);
        const before = active.getBoundingClientRect();
        active.removeAttribute("aria-current");
        const after = active.getBoundingClientRect();
        active.setAttribute("aria-current", "page");
        return {
          header: box(".ac-global-header"),
          nav: box(".ac-global-header__nav"),
          actions: box(".ac-global-header__actions"),
          language: box(".ac-global-header__language"),
          cta: box(".ac-nav-cta"),
          active: { x: before.x, y: before.y, width: before.width, height: before.height },
          defaultDimensions: { width: after.width, height: after.height },
          headerBorder: getComputedStyle(header).borderBottomWidth,
          headerShadow: getComputedStyle(header).boxShadow,
          textDecoration: activeStyle.textDecorationLine,
          beforeContent: getComputedStyle(active, "::before").content,
          afterContent: getComputedStyle(active, "::after").content,
          activeBackground: activeStyle.backgroundColor,
          activeWeight: activeStyle.fontWeight,
          visibleActiveCount: [...document.querySelectorAll('.ac-nav-link[aria-current="page"]')].filter(visible).length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      }, activeId);
      assert.equal(state.headerBorder, "0px", `${route} ${width}: no header border`);
      assert.equal(state.headerShadow, "none", `${route} ${width}: no header separator shadow`);
      assert.equal(state.textDecoration, "none", `${route} ${width}: no active underline`);
      assert.ok(state.beforeContent === "none" || state.beforeContent === "normal", `${route}: no ::before decoration`);
      assert.ok(state.afterContent === "none" || state.afterContent === "normal", `${route}: no ::after decoration`);
      assert.equal(state.active.width, state.defaultDimensions.width, `${route}: active width is stable`);
      assert.equal(state.active.height, state.defaultDimensions.height, `${route}: active height is stable`);
      assert.notEqual(state.activeBackground, "rgba(0, 0, 0, 0)", `${route}: active state uses a fill`);
      assert.equal(state.activeWeight, "650", `${route}: active and default weight stay identical`);
      assert.equal(state.visibleActiveCount, 1, `${route}: exactly one visible active link`);
      assert.ok(state.overflow <= 1, `${route} ${width}: no horizontal overflow`);
      assert.deepEqual(errors, [], `${route}: no console errors`);
      const stable = {
        headerHeight: state.header.height,
        navX: state.nav?.x ?? null,
        actionsX: state.actions.x,
        languageX: state.language.x,
        ctaX: state.cta?.x ?? null,
      };
      if (!reference) reference = stable;
      else assert.deepEqual(stable, reference, `${route} ${width}: shared navbar positions remain stable`);
      measurements[width][route] = { ...stable, active: state.active };
      await page.screenshot({ path: `${output}${name}-${width}x${height}.png`, clip: { x: 0, y: 0, width, height } });
      await page.close();
    }
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

await writeFile(`${output}measurements.json`, `${JSON.stringify(measurements, null, 2)}\n`);
console.log(`Navbar visual-state tests passed (${routes.length * viewports.length} route/viewport combinations).`);
