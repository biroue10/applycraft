#!/usr/bin/env node
/**
 * Performance budget validator.
 * Run after `npm run build`. Reads the dist/ folder and fails if any
 * threshold is exceeded.
 *
 * Exit 0 = all budgets pass.
 * Exit 1 = one or more budgets fail.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import { gzipSync } from "zlib";

const DIST = new URL("../dist/assets", import.meta.url).pathname;
const DIST_ROOT = new URL("../dist", import.meta.url).pathname;
const PUBLIC = new URL("../public", import.meta.url).pathname;

// ── Budgets ────────────────────────────────────────────────────────────────

// Libraries that must NOT appear in any initial (synchronous) chunk.
// They are large and only needed when the user clicks export.
const LAZY_ONLY = ["jspdf", "docx", "html2canvas", "dompurify"];

// Max gzip size of any single initial JS chunk, in bytes.
const MAX_INITIAL_CHUNK_GZ = 192_000;   // current app shell baseline

// Max total gzip size of all JS loaded synchronously on initial page load, in bytes.
// Rebaselined for the shipped 5-language interface i18n (en/fr/es/ar/de), whose
// inline string dictionaries live in the app chunk. The per-chunk cap below and
// the lazy-only library guard are unchanged.
// Bumped +1 KB for locale-aware letter defaults (src/i18n/letterDefaults.js:
// per-language date formatting + cover-letter sign-offs for en/fr/es/ar/de), so
// non-English documents no longer render English dates/closings.
// Bumped +1 KB for the SectionErrorBoundary that isolates builder section panels
// (a field-level render error degrades to a localized message instead of crashing
// the whole app) plus its EN/FR/AR copy.
// Bumped +1 KB for src/theme/colors.js: the WCAG contrast helpers (chipInk /
// readableInk) that derive a readable text colour for preview skill chips. The
// accent is chosen at runtime from a swatch picker, so the ink cannot be a
// precomputed constant.
// Bumped +1 KB for the Job Tracker → Interview Prep contextual launch: the
// localized "Interview secured" CTA (tracker namespace, en/fr/ar) plus the
// write side of src/interview/context.js, which the tracker pulls into the
// initial chunk. The read side lives in the lazy interview route instead.
// Bumped +1 KB for the IBM Plex Sans + IBM Plex Sans Arabic rebrand: the
// self-hosted family names ("'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui,
// sans-serif") are ~30 chars longer than the old "'Inter', …" and appear on all
// ~58 template registry entries plus the app-shell font-family, which lands in
// the initial chunk. Measured delta of the whole brand pass was +214 B gz over
// the previous 263,850 B. The woff2 files themselves are NOT counted here (this
// guard measures JS only) and are self-hosted + preloaded, no CDN.
// TODO(perf): code-split the non-English dictionaries (load fr/ar on language
// switch) and lower this back toward 200 KB. Note this is NOT a small change:
// dictionaries are read synchronously (src/ResumeGenerator.jsx:3668-3683) and
// /fr/ + /ar/ are prerendered with the locale taken from the pathname, so the
// dictionary must exist at first render on both the server and at hydration —
// a dynamic import alone cannot supply it without a blocking round-trip or a
// hydration mismatch. The lazyLanding2 pattern in that file is not a precedent:
// it only covers es/de, which are never prerendered as interface locales.
// Product requirement: never raise this ceiling merely to make a build pass.
const MAX_INITIAL_TOTAL_GZ = 260_000;

// Max raw (uncompressed) size of any image served from /public, in bytes.
const MAX_IMAGE_SIZE = 250_000;         // 250 KB

// ── Helpers ────────────────────────────────────────────────────────────────

function gzSize(filePath) {
  const src = readFileSync(filePath);
  return gzipSync(src, { level: 9 }).length;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB (${bytes} bytes)`;
}

function allFiles(dir) {
  return readdirSync(dir).map((f) => join(dir, f));
}

// ── Parse the generated index.html to find initial chunks ─────────────────
// vite-react-ssg writes the final HTML to dist/index.html. We parse
// <script type="module"> and <link rel="modulepreload"> to find everything
// the browser loads synchronously on first visit.

const indexHtml = readFileSync(join(DIST_ROOT, "index.html"), "utf8");

const initialSrcs = [];

// Every local external script, including classic deferred helpers.
for (const [, src] of indexHtml.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  initialSrcs.push(src);
}
// Modulepreload links
for (const [, href] of indexHtml.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) {
  initialSrcs.push(href);
}

// Resolve paths: /assets/foo.js → dist/assets/foo.js
const directInitialFiles = initialSrcs
  .filter((s) => s.startsWith("/") && !s.startsWith("//"))
  .map((s) => join(DIST_ROOT, s.replace(/^\//, "")));

// Modulepreload entries can themselves contain static imports that are fetched
// before their module can execute. Include that complete graph; counting only
// tags in HTML substantially under-reports route-lazy landing dependencies.
const manifest = JSON.parse(readFileSync(join(DIST_ROOT, ".vite/manifest.json"), "utf8"));
const manifestKeyByFile = new Map(Object.entries(manifest).map(([key, value]) => [value.file, key]));
const initialFileSet = new Set();
function addStaticImports(filePath) {
  if (initialFileSet.has(filePath)) return;
  initialFileSet.add(filePath);
  const relativeFile = filePath.slice(DIST_ROOT.length + 1);
  const key = manifestKeyByFile.get(relativeFile);
  if (!key) return;
  for (const importedKey of manifest[key].imports || []) {
    const imported = manifest[importedKey];
    if (imported?.file) addStaticImports(join(DIST_ROOT, imported.file));
  }
}
for (const file of directInitialFiles) addStaticImports(file);
const initialFiles = [...initialFileSet];

// ── Run checks ────────────────────────────────────────────────────────────

const errors = [];
const warnings = [];

// 1. No lazy-only library in initial chunks.
for (const file of initialFiles) {
  const name = basename(file).toLowerCase();
  for (const lib of LAZY_ONLY) {
    if (name.includes(lib)) {
      errors.push(
        `FAIL [eager-load] ${basename(file)} (${lib}) is in the initial load. ` +
        `It must be dynamically imported and never appear in modulepreload.`
      );
    }
  }
}

// 2. No individual initial chunk over MAX_INITIAL_CHUNK_GZ.
let totalInitialGz = 0;
for (const file of initialFiles) {
  try {
    const gz = gzSize(file);
    totalInitialGz += gz;
    if (gz > MAX_INITIAL_CHUNK_GZ) {
      errors.push(
        `FAIL [chunk-size] ${basename(file)}: ${formatBytes(gz)} gz ` +
        `> budget ${formatBytes(MAX_INITIAL_CHUNK_GZ)} gz`
      );
    } else {
      console.log(`  ok  ${basename(file)}: ${formatBytes(gz)} gz`);
    }
  } catch {
    warnings.push(`WARN could not read ${file}`);
  }
}

// 3. Total initial JS gzip.
if (totalInitialGz > MAX_INITIAL_TOTAL_GZ) {
  errors.push(
    `FAIL [total-initial] Total initial JS: ${formatBytes(totalInitialGz)} gz ` +
    `> budget ${formatBytes(MAX_INITIAL_TOTAL_GZ)} gz`
  );
} else {
  console.log(`  ok  Total initial JS: ${formatBytes(totalInitialGz)} gz`);
}

// 4. No unoptimised raster image > MAX_IMAGE_SIZE.
function walkImages(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      files = files.concat(walkImages(full));
    } else if (/\.(png|jpg|jpeg|webp|avif|gif)$/i.test(name)) {
      files.push(full);
    }
  }
  return files;
}

for (const img of walkImages(PUBLIC)) {
  const size = statSync(img).size;
  if (size > MAX_IMAGE_SIZE) {
    errors.push(
      `FAIL [image-size] ${img.replace(PUBLIC, "public")}: ` +
      `${(size / 1024).toFixed(1)} KB > budget ${(MAX_IMAGE_SIZE / 1024).toFixed(0)} KB`
    );
  }
}

// 5. No source maps in dist (unless intentionally enabled).
for (const file of allFiles(DIST)) {
  if (file.endsWith(".map")) {
    warnings.push(`WARN [source-map] ${basename(file)} is in dist/assets — remove before production.`);
  }
}

// ── Report ─────────────────────────────────────────────────────────────────

console.log("");
if (warnings.length) {
  warnings.forEach((w) => console.warn(w));
}

if (errors.length) {
  console.error("\nPerformance budget FAILED:");
  errors.forEach((e) => console.error(" ", e));
  process.exit(1);
} else {
  console.log("Performance budget passed.");
  process.exit(0);
}
