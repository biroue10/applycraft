#!/usr/bin/env node
// Dead internal-link guard.
//
// Every internal href in the built dist/ HTML must resolve to something the
// site can actually serve: a built page (dist/<path>/index.html or the flat
// dist/<path>.html), a static asset file, or a known redirect source
// (public/_redirects sources + worker.js trailing-slash / share-viewer routes).
// Fails the build on any href that resolves to nothing (a dead link).
//
// Usage: node scripts/dead-links.mjs [--list]
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

// ── Build the set of servable paths from the build output ──
const servable = new Set(); // normalized paths the site can serve
const htmlFiles = [];

function addServable(p) {
  if (!p) return;
  servable.add(p);
  // Accept both trailing-slash and non-slash forms (worker/html_handling serve both).
  if (p.endsWith("/") && p !== "/") servable.add(p.slice(0, -1));
  else if (p !== "/" && !/\.[a-z0-9]+$/i.test(p)) servable.add(`${p}/`);
}

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) { walk(abs); continue; }
    const rel = "/" + relative(DIST, abs).split("\\").join("/");
    if (rel.endsWith("/index.html")) {
      addServable(rel.slice(0, -"index.html".length)); // "/foo/index.html" -> "/foo/"
      htmlFiles.push(abs);
    } else if (rel.endsWith(".html")) {
      const base = rel.slice(0, -".html".length); // "/resume/templates.html" -> "/resume/templates"
      addServable(base);
      addServable(`${base}/`);
      htmlFiles.push(abs);
    } else {
      addServable(rel); // exact static asset
    }
  }
})(DIST);
// index.html at dist root serves "/"
if (existsSync(join(DIST, "index.html"))) addServable("/");

// ── Redirect sources that are valid entry points ──
// public/_redirects (column 1) + worker.js trailing-slash map keys.
const redirectsFile = join(ROOT, "public", "_redirects");
if (existsSync(redirectsFile)) {
  for (const line of readFileSync(redirectsFile, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const src = t.split(/\s+/)[0];
    if (src?.startsWith("/")) addServable(src);
  }
}
const workerFile = join(ROOT, "worker.js");
if (existsSync(workerFile)) {
  const w = readFileSync(workerFile, "utf8");
  const mapBlock = w.match(/TRAILING_SLASH_HTML_ASSETS = new Map\(\[([\s\S]*?)\]\)/);
  if (mapBlock) {
    for (const m of mapBlock[1].matchAll(/\["([^"]+)"/g)) addServable(m[1]);
  }
}
// Share-viewer dynamic route handled by worker.js: /r/<id>
const SHARE_RE = /^\/r\/[A-Za-z0-9_-]{8,24}\/?$/;

// ── Extract and check internal hrefs ──
const HREF_RE = /(?:href|src)\s*=\s*(["'])(.*?)\1/g;
const failures = [];
const checked = new Set();

function isInternal(href) {
  if (!href) return false;
  if (/^(https?:)?\/\//i.test(href)) return false;      // absolute / protocol-relative
  if (/^(mailto:|tel:|data:|javascript:|blob:)/i.test(href)) return false;
  if (href.startsWith("#")) return false;
  return href.startsWith("/");
}

function resolves(pathOnly) {
  if (servable.has(pathOnly)) return true;
  if (SHARE_RE.test(pathOnly)) return true;
  // tolerate both slash variants
  const alt = pathOnly.endsWith("/") ? pathOnly.slice(0, -1) : `${pathOnly}/`;
  return servable.has(alt);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(HREF_RE)) {
    const rawHref = m[2].replace(/&amp;/g, "&");
    if (!isInternal(rawHref)) continue;
    const pathOnly = rawHref.split(/[?#]/)[0] || "/";
    const key = `${relative(DIST, file)}::${pathOnly}`;
    if (checked.has(key)) continue;
    checked.add(key);
    if (!resolves(pathOnly)) {
      failures.push({ file: relative(ROOT, file), href: rawHref, path: pathOnly });
    }
  }
}

const listMode = process.argv.includes("--list");
if (listMode) {
  console.log(`Servable paths: ${servable.size} · HTML files scanned: ${htmlFiles.length} · internal links checked: ${checked.size}`);
}

if (failures.length) {
  console.error(`\n✖ dead-links: ${failures.length} internal link(s) point to a path with no built page/asset:\n`);
  const seen = new Set();
  for (const f of failures) {
    const line = `  ${f.path}  ←  ${f.file}`;
    if (seen.has(line)) continue;
    seen.add(line);
    console.error(line);
  }
  process.exit(1);
}
console.log(`✓ dead-links: all ${checked.size} internal links resolve to a built page or asset (${htmlFiles.length} HTML files).`);
