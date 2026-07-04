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
// TODO(perf): code-split the non-English dictionaries (load fr/es/ar/de on
// language switch) and lower this back toward 200 KB.
const MAX_INITIAL_TOTAL_GZ = 260_000;   // current multilingual app shell baseline

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

// Entry script (type="module" src="...")
for (const [, src] of indexHtml.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) {
  initialSrcs.push(src);
}
// Modulepreload links
for (const [, href] of indexHtml.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) {
  initialSrcs.push(href);
}

// Resolve paths: /assets/foo.js → dist/assets/foo.js
const initialFiles = initialSrcs
  .filter((s) => s.startsWith("/assets/"))
  .map((s) => join(DIST_ROOT, s.replace(/^\//, "")));

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
