import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// The token-level guard (scripts/contrast-tests.mjs) proves the palette is sound.
// This proves the palette is what actually renders: axe's color-contrast rule
// needs real layout and computed styles, so it only works in a browser.
const axeSource = readFileSync("node_modules/axe-core/axe.js", "utf8");

const PAGES = ["/", "/fr/", "/ar/", "/resume-builder?template=modern", "/app/ats-checker"];

test.skip(({ isMobile }) => isMobile, "contrast is viewport-independent here");

for (const path of PAGES) {
  test(`no color-contrast violations (${path})`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(() =>
      window.axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] } })
    );
    const offenders = results.violations.flatMap((v) =>
      v.nodes.map((n) => `${n.html.slice(0, 90)} — ${n.failureSummary.split("\n").slice(1, 2).join("").trim()}`)
    );
    expect(offenders, offenders.join("\n")).toHaveLength(0);
  });
}
