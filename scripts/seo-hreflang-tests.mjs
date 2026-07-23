// ──────────────────────────────────────────────────────────────────────────
// Canonical + hreflang validity tests (Phase 6). Runs against the built dist/.
// Run: npm run build && npm run test:seo:hreflang
//
// Verifies, across every prerendered + static HTML page:
//   • exactly one canonical, pointing at the page's own URL
//   • hreflang only on pages with genuine translated equivalents
//   • hreflang clusters are reciprocal and self-referential, with x-default
//   • every alternate URL resolves to a real built file (HTTP 200 locally)
//   • valid language codes; Arabic pages carry lang="ar" dir="rtl"
//   • pages WITHOUT a cluster carry no hreflang (no false translations)
// ──────────────────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(root, "dist");
const ORIGIN = "https://applycraft.io";
const VALID_LANG = new Set(["en", "fr", "ar", "es", "de", "x-default"]);

let failures = 0;
const fail = (m) => { failures++; console.error("  FAIL " + m); };

if (!existsSync(DIST)) { console.error("dist/ not found — run `npm run build` first."); process.exit(1); }

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Map a canonical/alternate URL to the dist file that should serve it.
function urlToFile(url) {
  const p = url.replace(ORIGIN, "") || "/";
  if (p === "/") return path.join(DIST, "index.html");
  if (p.endsWith("/")) {
    const directoryFile = path.join(DIST, p, "index.html");
    if (existsSync(directoryFile)) return directoryFile;
    return path.join(DIST, p.slice(0, -1) + ".html");
  }
  return path.join(DIST, p + ".html"); // SPA route, e.g. /resume/templates
}

const pages = {}; // url -> { file, canonical, hreflang: {lang:href}, lang, dir, noindex }
for (const file of walk(DIST)) {
  const html = readFileSync(file, "utf8");
  const canonical = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1] || null;
  const hreflang = {};
  for (const m of html.matchAll(/rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)) hreflang[m[1]] = m[2];
  // also accept attribute order href-before-hreflang
  for (const m of html.matchAll(/rel="alternate"\s+href="([^"]+)"\s+hreflang="([^"]+)"/g)) hreflang[m[2]] = m[1];
  const htmlTag = (html.match(/<html[^>]*>/) || [""])[0];
  const lang = (htmlTag.match(/lang="([^"]+)"/) || [])[1] || "";
  const dir = (htmlTag.match(/dir="([^"]+)"/) || [])[1] || "";
  const noindex = /name="robots"\s+content="[^"]*noindex/.test(html);
  if (canonical) pages[canonical] = { file, canonical, hreflang, lang, dir, noindex };
  else if (!noindex) fail(`${path.relative(root, file)}: no canonical`);
}

for (const [url, p] of Object.entries(pages)) {
  const langs = Object.keys(p.hreflang);
  if (langs.length === 0) continue; // no cluster → nothing more to check

  // valid codes + x-default present
  for (const l of langs) if (!VALID_LANG.has(l)) fail(`${url}: invalid hreflang code "${l}"`);
  if (!langs.includes("x-default")) fail(`${url}: cluster missing x-default`);

  // self-referential: one alternate must equal this page's canonical
  if (!Object.values(p.hreflang).includes(url)) fail(`${url}: hreflang set does not include itself`);

  for (const [lang, href] of Object.entries(p.hreflang)) {
    if (lang === "x-default") continue;
    // target file exists (HTTP 200 locally)
    if (!existsSync(urlToFile(href))) { fail(`${url}: alternate ${lang}→${href} has no built page`); continue; }
    // reciprocity: the target must list THIS url back under the same lang
    const target = pages[href];
    if (!target) { fail(`${url}: alternate ${lang}→${href} not parsed (missing canonical there?)`); continue; }
    if (!Object.values(target.hreflang).includes(url)) fail(`${url}: ${href} does not reciprocally reference it`);
  }
}

// Arabic pages must be RTL.
for (const [url, p] of Object.entries(pages)) {
  if (p.lang === "ar" && p.dir !== "rtl") fail(`${url}: lang=ar but dir is not "rtl"`);
}

const total = Object.keys(pages).length;
const clustered = Object.values(pages).filter((p) => Object.keys(p.hreflang).length).length;
console.log(`Scanned ${total} pages with canonicals; ${clustered} in hreflang clusters.`);
if (failures) { console.error(`\nhreflang/canonical: ${failures} problem(s).`); process.exit(1); }
console.log("hreflang/canonical: all checks passed.");
