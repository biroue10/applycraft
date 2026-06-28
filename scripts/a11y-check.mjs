#!/usr/bin/env node
/**
 * WCAG 2.2 AA automated check on the pre-rendered dist/index.html.
 * Injects axe-core into a JSDOM window so no headless browser is required in CI.
 *
 * Exit 0 → no violations
 * Exit 1 → violations found
 *
 * Limitation: only checks the server-rendered HTML shell; interactive
 * React state (modals, dynamic forms) is not evaluated.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distHtml = resolve(__dirname, "../dist/index.html");
const axePath = resolve(__dirname, "../node_modules/axe-core/axe.js");

const html = readFileSync(distHtml, "utf8");
const axeSource = readFileSync(axePath, "utf8");

const dom = new JSDOM(html, {
  url: "https://applycraft.io/",
  runScripts: "dangerously",
  resources: "usable",
});

const { window } = dom;

// Inject axe-core into the jsdom window context
const scriptEl = window.document.createElement("script");
scriptEl.textContent = axeSource;
window.document.head.appendChild(scriptEl);

// Wait a tick for the script to run, then execute axe
const results = await new Promise((resolve, reject) => {
  window.setTimeout(() => {
    window.axe
      .run(window.document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      })
      .then(resolve)
      .catch(reject);
  }, 100);
});

if (results.violations.length === 0) {
  console.log("✓ No WCAG 2.2 AA violations found in pre-rendered HTML.\n");
  console.log(
    `  Passed: ${results.passes.length} rules · Incomplete: ${results.incomplete.length} (need manual review)`
  );
  process.exit(0);
} else {
  console.error(
    `\n✗ ${results.violations.length} WCAG 2.2 AA violation(s) in dist/index.html:\n`
  );
  for (const v of results.violations) {
    console.error(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
    console.error(`    Help: ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 2)) {
      console.error(`    Element: ${node.html.slice(0, 120)}`);
    }
    console.error("");
  }
  process.exit(1);
}
