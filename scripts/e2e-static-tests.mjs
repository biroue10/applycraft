// ──────────────────────────────────────────────────────────────────────────
// Static end-to-end integrity checks (Phase 13) — run against built dist/.
// Browser-free, so it runs anywhere in CI. Catches the failure modes the task
// lists that don't need a real browser: broken routes, broken footer/legal
// links, empty pages, missing canonical, and unresolved sitemap URLs.
// Run: npm run build && npm run test:e2e:static
// (Browser flows — export clicks, keyboard, mobile, RTL, offline — live in the
//  Playwright suite under tests/e2e/, run with `npm run test:e2e`.)
// ──────────────────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(root, "dist");
if (!existsSync(DIST)) { console.error("dist/ not found — run `npm run build` first."); process.exit(1); }

// Internal paths that are served but have no standalone file (SPA client routes).
const SPA_ROUTES = new Set([
  "/", "/r", "/resume-builder", "/resume/templates", "/resume/builder", "/cover-letter/templates",
  "/cover-letter/builder", "/job-tracker", "/app/ats-checker", "/master-profile",
  "/email-signature", "/personal-website",
]);

let failures = 0;
const fail = (m) => { failures++; console.error("  FAIL " + m); };

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Resolve an internal path to a dist file (or accept a known SPA route / asset).
function resolves(p) {
  const clean = p.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("mailto:") || clean.startsWith("http")) return true;
  if (SPA_ROUTES.has(clean)) return true;
  const rel = clean.replace(/^\//, "");
  if (existsSync(path.join(DIST, rel))) return true;                 // exact file/asset
  if (existsSync(path.join(DIST, rel, "index.html"))) return true;   // dir → index.html
  if (clean.endsWith("/") && existsSync(path.join(DIST, rel + "index.html"))) return true;
  if (existsSync(path.join(DIST, rel + ".html"))) return true;       // SPA route file
  return false;
}

const htmlFiles = walk(DIST);

// 1. Every page: has a canonical + <title>, and non-trivial body content.
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  const rel = path.relative(DIST, f);
  if (rel === "404.html") continue;
  if (!/rel="canonical"/.test(html) && !/name="robots"[^>]*noindex/.test(html)) fail(`${rel}: missing canonical`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${rel}: missing <title>`);
  const body = (html.match(/<body[\s\S]*<\/body>/) || [""])[0].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (body.length < 40) fail(`${rel}: page looks empty (${body.length} chars of text)`);
}

// 2. Every internal <a href> across all pages resolves to a real target.
const brokenLinks = new Set();
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
    if (!resolves(href)) brokenLinks.add(`${path.relative(DIST, f)} → ${href}`);
  }
}
if (brokenLinks.size) fail(`broken internal links:\n       ${[...brokenLinks].join("\n       ")}`);

// 3. Legal + key pages exist and are reachable.
for (const p of ["/terms/", "/privacy/", "/cookies/", "/refund-policy/", "/gdpr/", "/ai-disclosure/", "/accessibility/", "/pricing/", "/blog/", "/status/"]) {
  if (!resolves(p)) fail(`key page missing: ${p}`);
}

// 4. Every sitemap URL resolves to a built page.
const sm = path.join(DIST, "sitemap.xml");
if (!existsSync(sm)) fail("sitemap.xml missing from dist");
else {
  for (const m of readFileSync(sm, "utf8").matchAll(/<loc>https:\/\/applycraft\.io([^<]*)<\/loc>/g)) {
    if (!resolves(m[1])) fail(`sitemap URL does not resolve: ${m[1]}`);
  }
}

// 5. All inline JSON-LD parses (no malformed structured data).
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(`${path.relative(DIST, f)}: invalid JSON-LD`); }
  }
}

console.log(`Checked ${htmlFiles.length} built pages + sitemap.`);
if (failures) { console.error(`\nStatic E2E: ${failures} problem(s).`); process.exit(1); }
console.log("Static E2E: all checks passed.");
