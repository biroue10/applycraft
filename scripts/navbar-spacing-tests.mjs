import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.NAVBAR_SPACING_BASE_URL || "http://127.0.0.1:4173";
const widths = [1440, 1366, 1280, 1180, 1024];
const routes = [
  ["/fr/application-pack/", "application-pack"],
  ["/fr/pricing/", "pricing"],
];
const shotDir = new URL("../.audit/navbar-locale/", import.meta.url).pathname;
await mkdir(shotDir, { recursive: true });

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
let minimumGap = Infinity;
try {
  for (const [route, activeId] of routes) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width >= 1280 ? 900 : 820 } });
      await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => {
        const rect = (element) => {
          const box = element?.getBoundingClientRect();
          return box ? { left: box.left, right: box.right, width: box.width } : null;
        };
        const visible = (element) => {
          const style = getComputedStyle(element);
          return style.display !== "none" && style.visibility !== "hidden" && element.getBoundingClientRect().width > 0;
        };
        const nav = document.querySelector(".ac-global-header__nav");
        const items = nav ? [...nav.children].filter(visible).map(rect) : [];
        return {
          viewport: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          logo: rect(document.querySelector(".ac-nav-logo")),
          nav: rect(nav),
          items,
          menuVisible: visible(document.querySelector(".ac-global-header__menu-button")),
          cta: rect(document.querySelector(".ac-nav-cta")),
          language: rect(document.querySelector(".ac-global-header__language")),
          visibleActive: [...document.querySelectorAll('.ac-nav-link[aria-current="page"]')].filter(visible).map((node) => node.dataset.navId),
        };
      });
      assert.ok(layout.scrollWidth <= layout.viewport + 1, `${route} ${width}: no horizontal overflow`);
      assert.ok(layout.cta && layout.cta.right <= layout.viewport + 1, `${route} ${width}: CTA inside viewport`);
      assert.ok(layout.language && layout.language.right <= layout.viewport + 1, `${route} ${width}: selector inside viewport`);
      if (layout.menuVisible) {
        assert.ok(width <= 1240, `${route} ${width}: mobile mode only at intended breakpoint`);
        await page.locator(".ac-global-header__menu-button").click();
        assert.equal(await page.locator(".ac-global-header__mobile-menu > .ac-nav-link:visible").count(), 8, `${route} ${width}: all links in mobile menu`);
      } else {
        assert.ok(layout.nav.left - layout.logo.right >= 23, `${route} ${width}: logo/nav separation`);
        for (let index = 1; index < layout.items.length; index += 1) {
          const gap = layout.items[index].left - layout.items[index - 1].right;
          minimumGap = Math.min(minimumGap, gap);
          assert.ok(gap >= 5.5, `${route} ${width}: adjacent items overlap or touch (${gap}px)`);
        }
        if (activeId === "pricing") {
          await page.locator(".ac-site-more > button").click();
        }
        assert.equal(await page.locator(`.ac-nav-link[data-nav-id="${activeId}"][aria-current="page"]:visible`).count(), 1, `${route} ${width}: one visible active item`);
      }
      await page.screenshot({ path: `${shotDir}${activeId}-${width}.png`, clip: { x: 0, y: 0, width, height: Math.min(180, width >= 1280 ? 900 : 820) } });
      await page.close();
    }
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

console.log(`Navbar spacing tests passed; minimum measured desktop gap ${minimumGap}px.`);
