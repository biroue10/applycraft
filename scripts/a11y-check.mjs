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
const axePath = resolve(__dirname, "../node_modules/axe-core/axe.js");
const axeSource = readFileSync(axePath, "utf8");
const siteChromeSource = readFileSync(resolve(__dirname, "../src/siteChrome.jsx"), "utf8");

for (const contract of [
  /aria-expanded=\{moreMenuOpen\}/,
  /aria-controls="ac-more-menu"/,
  /aria-expanded=\{menuOpen\}/,
  /aria-controls="m"/,
  /event\.key !== "Escape"/,
]) {
  if (!contract.test(siteChromeSource)) {
    throw new Error(`Responsive navigation accessibility contract is missing: ${contract}`);
  }
}

// The homepage in each prerendered locale, so an RTL- or translation-only
// regression cannot slip through an English-only audit.
const PAGES = [
  { file: "dist/index.html", url: "https://applycraft.io/" },
  { file: "dist/fr/index.html", url: "https://applycraft.io/fr/" },
  { file: "dist/ar/index.html", url: "https://applycraft.io/ar/" },
];

async function audit({ file, url }) {
  const dom = new JSDOM(readFileSync(resolve(__dirname, "..", file), "utf8"), {
    url,
    runScripts: "dangerously",
    resources: "usable",
  });
  const { window } = dom;
  const scriptEl = window.document.createElement("script");
  scriptEl.textContent = axeSource;
  window.document.head.appendChild(scriptEl);

  const run = (options) =>
    new Promise((res, rej) => {
      window.setTimeout(() => window.axe.run(window.document, options).then(res).catch(rej), 100);
    });

  const wcag = await run({ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });

  // axe's own `skip-link` rule needs layout, so it is inapplicable under jsdom.
  // Assert the contract directly instead: a skip link must point at an element
  // that exists and can take focus, or activating it does nothing.
  const violations = [...wcag.violations];
  const doc = window.document;
  for (const link of doc.querySelectorAll('a.skip-link, a[href^="#"].skip-link')) {
    const id = link.getAttribute("href")?.slice(1);
    const target = id && doc.getElementById(id);
    if (!target) {
      violations.push({
        id: "skip-link",
        impact: "serious",
        description: `skip link targets #${id}, which does not exist on this page`,
        helpUrl: "https://dequeuniversity.com/rules/axe/4.9/skip-link",
        nodes: [{ html: link.outerHTML }],
      });
    } else if (!target.hasAttribute("tabindex") && !/^(a|button|input|select|textarea)$/i.test(target.tagName)) {
      violations.push({
        id: "skip-link",
        impact: "serious",
        description: `skip-link target #${id} is not focusable (add tabindex="-1")`,
        helpUrl: "https://dequeuniversity.com/rules/axe/4.9/skip-link",
        nodes: [{ html: target.outerHTML.slice(0, 120) }],
      });
    }
  }

  return { file, violations, passes: wcag.passes.length, incomplete: wcag.incomplete.length };
}

const results = [];
for (const page of PAGES) results.push(await audit(page));

const failed = results.filter((r) => r.violations.length);
if (failed.length === 0) {
  console.log("✓ No WCAG 2.2 AA violations found in pre-rendered HTML.\n");
  for (const r of results) {
    console.log(`  ${r.file}: passed ${r.passes} rules · ${r.incomplete} incomplete (need manual review)`);
  }
  process.exit(0);
}

for (const r of failed) {
  console.error(`\n✗ ${r.violations.length} accessibility violation(s) in ${r.file}:\n`);
  for (const v of r.violations) {
    console.error(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
    console.error(`    Help: ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 2)) {
      console.error(`    Element: ${node.html.slice(0, 120)}`);
    }
    console.error("");
  }
}
process.exit(1);
