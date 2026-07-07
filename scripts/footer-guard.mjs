#!/usr/bin/env node
// Unified-footer guard.
//
// Every built HTML page must carry the shared site footer, detected by the
// data-footer="unified" marker emitted by the single-source footer
// (src/siteChrome.jsx SiteFooter for React pages, scripts/shared-footer.mjs for
// static pages). Fails the build on any page missing it.
//
// The only exemptions are the in-app builder workspace views, which
// deliberately hide the marketing footer (ResumeGenerator renders the footer
// only when `!isFormView`).
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const MARKER = 'data-footer="unified"';

// Prerendered builder editor workspaces — no marketing footer by design.
const EXEMPT = new Set([
  "resume-builder.html",
  "resume/builder.html",
  "cover-letter/builder.html",
]);

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs);
    else if (name.endsWith(".html")) htmlFiles.push(abs);
  }
})(DIST);

const missing = [];
for (const file of htmlFiles) {
  const rel = relative(DIST, file).split("\\").join("/");
  if (EXEMPT.has(rel)) continue;
  if (!readFileSync(file, "utf8").includes(MARKER)) missing.push(rel);
}

if (missing.length) {
  console.error(`\n✖ footer-guard: ${missing.length} page(s) missing the unified footer (${MARKER}):\n`);
  for (const m of missing.sort()) console.error(`  ${m}`);
  console.error(`\n  Static pages get the footer via scripts/refresh-static-footers.mjs (npm run seo:pages);`);
  console.error(`  React pages via <SiteFooter/> in src/siteChrome.jsx. Do not hand-write footers.`);
  process.exit(1);
}
console.log(`✓ footer-guard: unified footer present on all ${htmlFiles.length - EXEMPT.size} content pages (${EXEMPT.size} builder-workspace pages exempt).`);
