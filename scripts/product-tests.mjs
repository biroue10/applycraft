// ──────────────────────────────────────────────────────────────────────────
// Product-consistency tests (Phase 1).
//
// Fails (non-zero exit) when the single source of truth in src/product.js
// drifts from:
//   1. the actual template / language arrays in src/ResumeGenerator.jsx, or
//   2. the optional-pass defaults in src/config.js, or
//   3. the product claims printed in the static HTML pages.
//
// Run: npm run test:product
// ──────────────────────────────────────────────────────────────────────────
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { PRODUCT } = await import(path.join(root, "src/product.js"));
const { ACTIVE_SEARCH_PASS } = await import(path.join(root, "src/config.js"));

let failures = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  ok  ${name}`); }
  catch (e) { failures++; console.error(`  FAIL ${name}\n       ${e.message}`); }
};

const gen = readFileSync(path.join(root, "src/ResumeGenerator.jsx"), "utf8");

// Bracket-accurate extraction of a top-level array literal.
function arrayLiteral(marker) {
  const start = gen.indexOf("[", gen.indexOf(marker));
  let depth = 0, i = start;
  for (; i < gen.length; i++) {
    if (gen[i] === "[") depth++;
    else if (gen[i] === "]") { depth--; if (depth === 0) { i++; break; } }
  }
  return gen.slice(start, i);
}
const countEntries = (block) => [...block.matchAll(/\{\s*id:\s*"([^"]+)"/g)].length;
const countBlank = (block) => [...block.matchAll(/blank:\s*true/g)].length;

const tplBlock = arrayLiteral("const TEMPLATES =");
const covBlock = arrayLiteral("const COVER_TEMPLATES =");
const wlBlock = arrayLiteral("const WORLD_LANGUAGES =");
const resumeCount = countEntries(tplBlock) - countBlank(tplBlock);
const coverCount = countEntries(covBlock);
const docCount = [...wlBlock.matchAll(/code:\s*"/g)].length;
const uiCount = (gen.match(/const UI_LANGS = new Set\(\[([^\]]*)\]/)?.[1].match(/"/g)?.length ?? 0) / 2;

// 1. Code arrays match the declared counts.
check("resume template count matches code", () =>
  assert.equal(PRODUCT.resumeTemplateCount, resumeCount,
    `product.js says ${PRODUCT.resumeTemplateCount} non-blank resume templates, code has ${resumeCount}`));
check("cover-letter template count matches code", () =>
  assert.equal(PRODUCT.coverLetterTemplateCount, coverCount,
    `product.js says ${PRODUCT.coverLetterTemplateCount} cover templates, code has ${coverCount}`));
check("writable language picker count matches code", () =>
  assert.equal(PRODUCT.writableLanguageCount, docCount,
    `product.js says ${PRODUCT.writableLanguageCount} writable languages, WORLD_LANGUAGES has ${docCount}`));
check("localized document language count is production scoped", () =>
  assert.equal(PRODUCT.localizedDocumentLanguageCount, 3,
    "production localized document labels should currently be English, French, and Arabic"));
check("interface language count matches code", () =>
  assert.equal(PRODUCT.interfaceLanguageCount, uiCount,
    `product.js says ${PRODUCT.interfaceLanguageCount} interface languages, UI_LANGS has ${uiCount}`));

// 2. Paid-pass facts match config.js defaults.
check("paid-pass duration matches config", () =>
  assert.equal(PRODUCT.paidPassDurationDays, ACTIVE_SEARCH_PASS.days));
check("paid-pass price matches config", () =>
  assert.equal(PRODUCT.paidPassPriceUsd, ACTIVE_SEARCH_PASS.priceUsd));

// 3. Static HTML product claims match product.js.
function walkHtml(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkHtml(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const outdatedLocalizedClaimRe = /99 document languages|99 langues de document|99 idiomas de documento|99 Dokumentsprachen/gi;
const htmlFiles = walkHtml(path.join(root, "public"));
const claimMismatches = [];
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(outdatedLocalizedClaimRe)) claimMismatches.push(`${path.relative(root, f)}: "${m[0]}"`);
}
check("static HTML avoids inaccurate 99 localized language claims", () =>
  assert.equal(claimMismatches.length, 0,
    `outdated language claims:\n       ${claimMismatches.join("\n       ")}`));

console.log("");
if (failures) { console.error(`Product consistency: ${failures} check(s) failed.`); process.exit(1); }
console.log("Product consistency: all checks passed.");
