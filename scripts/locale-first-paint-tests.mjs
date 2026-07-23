import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const SHOTS = join(ROOT, ".audit/navbar-locale");
const baseURL = process.env.LOCALE_FIRST_PAINT_BASE_URL || "http://127.0.0.1:4173";
const cases = [
  {
    locale: "fr",
    route: "/fr/modeles-cv/",
    file: join(DIST, "fr/modeles-cv/index.html"),
    expected: "Créateur de CV",
    forbidden: "Resume Builder",
    selector: "FR",
  },
  {
    locale: "ar",
    route: "/ar/resume-templates/",
    file: join(DIST, "ar/resume-templates/index.html"),
    expected: "منشئ السيرة الذاتية",
    forbidden: "Resume Builder",
    selector: "AR",
  },
];

await mkdir(SHOTS, { recursive: true });
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
const browser = await chromium.launch({ headless: true });
try {
  for (const test of cases) {
    assert.ok(existsSync(test.file), `${test.route}: prerendered file exists`);
    const html = readFileSync(test.file, "utf8");
    const header = html.match(/<header[^>]+data-site-header="applycraft"[\s\S]*?<\/header>/)?.[0] || "";
    assert.match(html, new RegExp(`<html[^>]+lang="${test.locale}"`), `${test.route}: html language`);
    assert.ok(header.includes(test.expected), `${test.route}: localized navbar in response HTML`);
    assert.ok(!header.includes(test.forbidden), `${test.route}: no English navbar in response HTML`);
    assert.ok(header.includes(`>${test.selector}<`), `${test.route}: localized selector in response HTML`);

    const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    await noJs.goto(`${baseURL}${test.route}`, { waitUntil: "load" });
    assert.ok((await noJs.locator(".ac-global-header").innerText()).includes(test.expected), `${test.route}: first paint is localized`);
    await noJs.screenshot({ path: join(SHOTS, `${test.locale}-templates-initial.png`) });
    await noJs.close();

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|did not match|server html/i.test(message.text())) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${baseURL}${test.route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const hydratedHeader = await page.locator(".ac-global-header").innerText();
    assert.ok(hydratedHeader.includes(test.expected), `${test.route}: hydrated navbar remains localized`);
    assert.ok(!hydratedHeader.includes(test.forbidden), `${test.route}: no English navbar after hydration`);
    assert.deepEqual(errors, [], `${test.route}: no hydration mismatch`);
    await page.screenshot({ path: join(SHOTS, `${test.locale}-templates-hydrated.png`) });
    await page.close();
  }

  const flow = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const flowErrors = [];
  const frames = [];
  await flow.exposeFunction("recordNavbar", (text) => frames.push(text));
  await flow.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const header = document.querySelector(".ac-global-header");
      const capture = () => window.recordNavbar(header?.innerText || "");
      capture();
      if (header) new MutationObserver(capture).observe(header, { subtree: true, childList: true, characterData: true });
    });
  });
  flow.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match|server html/i.test(message.text())) flowErrors.push(message.text());
  });
  await flow.goto(`${baseURL}/fr/`, { waitUntil: "networkidle" });
  await flow.locator(".ac-site-more > button").click();
  await flow.locator('.ac-site-more-menu .ac-nav-link[data-nav-id="templates"]').click();
  await flow.waitForTimeout(500);
  assert.ok(frames.length > 0 && frames.every((text) => text.includes("Créateur de CV")), "French navigation flow stays French in every observed frame");
  assert.ok(frames.every((text) => !text.includes("Resume Builder")), "French navigation flow never renders English navbar labels");
  assert.equal(new URL(flow.url()).pathname, "/fr/modeles-cv/", "French SPA navigation keeps a localized URL");
  assert.deepEqual(flowErrors, [], "French navigation flow has no hydration mismatch");
  await flow.screenshot({ path: join(SHOTS, "fr-templates-navigation.png") });
  await flow.close();
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

console.log("Locale first-paint tests passed for French and Arabic template routes.");
