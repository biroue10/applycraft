import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.NAVBAR_BASE_URL || "http://127.0.0.1:4173";
const output = ".audit/navbar-state";
const routes = [
  ["interview-prep", "/interview-prep/", "interview"],
  ["job-tracker", "/job-tracker/", "tracker"],
  ["application-pack", "/application-pack/", "application-pack"],
  ["cover-letter", "/cover-letter-builder/", "cover"],
  ["ats-checker", "/ats-checker/", "ats"],
  ["resume-templates", "/resume/templates/", "templates"],
  ["pricing", "/pricing/", "pricing"],
  ["fr-interview", "/fr/interview-prep/", "interview"],
  ["ar-interview", "/ar/interview-prep/", "interview"],
];
const viewports = [[1440, 900], [1280, 720], [390, 844]];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, route, activeId] of routes) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript(() => localStorage.setItem("ac_cookie_consent", "denied"));
      await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
      const menuButton = page.locator(".ac-site-mobile-menu-button:visible, .ac-static-menu-button:visible");
      if (await menuButton.count()) {
        await menuButton.click();
      } else if (await page.locator(".ac-site-more > button:visible").count() && ["tracker", "interview", "templates", "pricing"].includes(activeId)) {
        await page.locator(".ac-site-more > button").click();
      }
      const visibleCurrent = page.locator(`.ac-nav-link[data-nav-id="${activeId}"][aria-current="page"]:visible`);
      assert.equal(await visibleCurrent.count(), 1, `${route} ${width}: expected one visible current item`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `${route} ${width}: horizontal overflow ${overflow}px`);
      await page.screenshot({ path: `${output}/${name}-${width}x${height}.png`, fullPage: false });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`Navbar state screenshots passed: ${routes.length * viewports.length} captures in ${output}.`);
