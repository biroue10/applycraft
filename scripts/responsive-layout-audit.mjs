import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:4173";
const widths = process.env.RESPONSIVE_WIDTHS
  ? process.env.RESPONSIVE_WIDTHS.split(",").map(Number)
  : [1920, 1600, 1440, 1366, 1280, 1180, 1024, 912, 768, 430, 390, 360, 320];
const heights = new Map([
  [1920, 1080], [1600, 900], [1440, 900], [1366, 768], [1280, 720],
  [1180, 820], [1024, 768], [912, 1368], [768, 1024], [430, 932],
  [390, 844], [360, 800], [320, 568],
]);
const paths = process.env.RESPONSIVE_PATHS?.split(",") || ["/", "/fr/", "/ar/"];
const screenshotDir = process.env.RESPONSIVE_SCREENSHOTS;

let preview;
try {
  await fetch(`${baseURL}/`);
} catch {
  preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
    stdio: "ignore",
    detached: false,
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const response = await fetch(`${baseURL}/`);
      if (response.ok) break;
    } catch {
      if (attempt === 29) throw new Error("Production preview did not become ready");
    }
  }
}

if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
let checks = 0;

try {
  for (const path of paths) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: heights.get(width) || 820 } });
      await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => {
        const boxFor = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const box = element.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height, display: getComputedStyle(element).display };
        };
        const viewport = document.documentElement.clientWidth;
        const overflowing = [...document.querySelectorAll("body *")]
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.position === "fixed" && style.visibility === "hidden") return false;
            const box = element.getBoundingClientRect();
            if (!(box.width > 0 && (box.right > viewport + 1 || box.left < -1))) return false;
            for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
              const ancestorStyle = getComputedStyle(ancestor);
              if (ancestorStyle.overflowX === "auto" || ancestorStyle.overflowX === "scroll") {
                const ancestorBox = ancestor.getBoundingClientRect();
                if (ancestorBox.left >= -1 && ancestorBox.right <= viewport + 1) return false;
              }
            }
            return true;
          })
          .slice(0, 12)
          .map((element) => ({
            tag: element.tagName,
            className: typeof element.className === "string" ? element.className : "",
            id: element.id,
            left: Math.round(element.getBoundingClientRect().left),
            right: Math.round(element.getBoundingClientRect().right),
          }));
        return {
          viewport,
          pageWidth: document.body.getBoundingClientRect().width,
          scrollWidth: document.documentElement.scrollWidth,
          header: (() => {
            const element = document.querySelector(".ac-global-header");
            if (!element) return null;
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return { left: box.left, right: box.right, width: box.width, height: box.height,
              background: style.backgroundColor, borderBottomWidth: style.borderBottomWidth,
              borderBottomColor: style.borderBottomColor };
          })(),
          status: boxFor(".ac-workspace-status-bar"),
          logo: boxFor(".ac-nav-logo"),
          nav: boxFor(".ac-global-header__nav"),
          language: boxFor(".ac-global-header__language"),
          cta: boxFor(".ac-nav-cta"),
          menu: boxFor(".ac-global-header__menu-button"),
          hero: boxFor(".ac-hero-visual"),
          overflowing,
        };
      });

      assert.ok(result.logo?.width > 0, `${path} ${width}: logo must be visible`);
      assert.ok(result.header, `${path} ${width}: global header must exist`);
      assert.ok(Math.abs(result.header.left) <= 1, `${path} ${width}: header must start at viewport edge`);
      assert.ok(Math.abs(result.header.width - result.pageWidth) <= 1, `${path} ${width}: header must span the full layout viewport`);
      assert.equal(Math.round(result.header.height), width <= 1120 ? 60 : 64, `${path} ${width}: shared header height`);
      assert.equal(result.header.background, "rgba(6, 8, 15, 0.98)", `${path} ${width}: shared opaque background`);
      assert.equal(result.header.borderBottomWidth, "1px", `${path} ${width}: shared bottom border`);
      assert.equal(result.header.borderBottomColor, "rgb(32, 50, 78)", `${path} ${width}: shared bottom border color`);
      if (result.status) {
        assert.ok(result.status.top >= result.header.height - 1, `${path} ${width}: workspace status must remain below header`);
      }
      assert.ok(result.logo.left >= -1 && result.logo.right <= result.viewport + 1, `${path} ${width}: logo is clipped`);
      assert.ok(result.language?.width > 0, `${path} ${width}: language selector must be visible`);
      assert.ok(result.language.left >= -1 && result.language.right <= result.viewport + 1, `${path} ${width}: language selector is clipped`);
      assert.ok(result.scrollWidth <= result.viewport + 1, `${path} ${width}: document width ${result.scrollWidth} exceeds ${result.viewport}`);
      assert.deepEqual(result.overflowing, [], `${path} ${width}: overflowing elements ${JSON.stringify(result.overflowing)}`);
      const isLocalizedHomepage = path === "/" || path === "/fr/" || path === "/ar/";
      if (isLocalizedHomepage && width > 600) assert.ok(result.cta?.width > 0, `${path} ${width}: homepage CTA must be visible`);

      const mobileMode = result.menu?.display !== "none" && result.menu?.width > 0;
      if (mobileMode) {
        assert.equal(result.nav?.display, "none", `${path} ${width}: desktop navigation should be hidden`);
        assert.ok(result.menu?.width >= 36, `${path} ${width}: hamburger must be visible`);
        await page.locator(".ac-global-header__menu-button").click();
        const visibleLinks = await page.locator(".ac-global-header__mobile-menu > a:visible:not(.ac-mobile-menu-cta)").evaluateAll(
          (links) => links.map((link) => new URL(link.href).pathname),
        );
        assert.equal(visibleLinks.length, 8, `${path} ${width}: all eight localized navigation destinations must remain accessible`);
        assert.equal(new Set(visibleLinks).size, 8, `${path} ${width}: mobile navigation destinations must be unique`);
        if (width <= 600) {
          const menuCta = page.locator(".ac-mobile-menu-cta:visible").first();
          if (await menuCta.count()) {
            const ctaBox = await menuCta.boundingBox();
            assert.ok(ctaBox && ctaBox.x >= 0 && ctaBox.x + ctaBox.width <= width, `${path} ${width}: menu CTA is clipped`);
          }
          if (isLocalizedHomepage) assert.equal(await menuCta.count(), 1, `${path} ${width}: homepage CTA must remain in the mobile menu`);
        } else {
          assert.ok(!result.cta || result.cta.width === 0 || result.cta.right <= result.viewport + 1, `${path} ${width}: header CTA is clipped`);
        }
        await page.keyboard.press("Escape");
      } else {
        assert.notEqual(result.nav?.display, "none", `${path} ${width}: navigation should be visible`);
        assert.ok(!result.cta || result.cta.width === 0 || (result.cta.left >= -1 && result.cta.right <= result.viewport + 1), `${path} ${width}: CTA is clipped`);
      }

      if (result.hero) {
        assert.ok(result.hero.left >= -1 && result.hero.right <= result.viewport + 1, `${path} ${width}: hero preview is clipped`);
      }
      if (screenshotDir) {
        const slug = path === "/" ? "en-home" : path.replace(/^\/|\/$/g, "").replaceAll("/", "-");
        await page.screenshot({ path: `${screenshotDir}/${slug}-${width}x${heights.get(width) || 820}.png`, fullPage: true });
      }
      checks += 1;
      await page.close();
    }
  }
} finally {
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

console.log(`Responsive layout checks passed: ${checks} viewport/page combinations.`);
