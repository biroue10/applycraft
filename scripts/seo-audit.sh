#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_URL="${SEO_AUDIT_SITE_URL:-https://applycraft.io}"
if [[ -f "$ROOT_DIR/dist/sitemap.xml" && "${SEO_AUDIT_SOURCE:-0}" != "1" ]]; then
  SITEMAP_PATH="$ROOT_DIR/dist/sitemap.xml"
else
  SITEMAP_PATH="$ROOT_DIR/public/sitemap.xml"
fi

cd "$ROOT_DIR"

for required in package.json index.html public public/robots.txt public/sitemap.xml public/og.png public/favicon.svg; do
  if [[ ! -e "$required" ]]; then
    echo "SEO audit failed: missing required file: $required" >&2
    exit 1
  fi
done

node <<'NODE'
const fs = require("fs");
const path = require("path");

const SITE = "https://applycraft.io";
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const USE_DIST = fs.existsSync(path.join(DIST, "index.html")) && process.env.SEO_AUDIT_SOURCE !== "1";
const HTML_ROOT = USE_DIST ? DIST : PUBLIC;
const errors = [];
const warnings = [];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) walk(filePath, files);
    else if (entry.endsWith(".html")) files.push(filePath);
  }
  return files;
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z_:.-]+)=["']([^"']*)["']/g)) out[match[1]] = match[2];
  return out;
}

function firstTag(html, regex) {
  return html.match(regex)?.[0] || "";
}

function meta(html, name) {
  return attrs(firstTag(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))).content || "";
}

function prop(html, name) {
  return attrs(firstTag(html, new RegExp(`<meta[^>]+property=["']${name}["'][^>]*>`, "i"))).content || "";
}

function link(html, rel) {
  return attrs(firstTag(html, new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, "i"))).href || "";
}

function title(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "";
}

function routeFor(filePath) {
  if (!USE_DIST && filePath === path.join(ROOT, "index.html")) return "/";
  if (filePath === path.join(HTML_ROOT, "404.html")) return "/404.html";
  const rel = path.relative(HTML_ROOT, filePath).replaceAll(path.sep, "/");
  if (rel === "index.html") return "/";
  if (path.basename(rel) === "index.html") {
    return `/${path.dirname(rel).replace(/^\.$/, "")}/`;
  }
  return `/${rel.replace(/\.html$/, "")}/`;
}

function isNoindex(html) {
  return /noindex/i.test(meta(html, "robots"));
}

function visibleH1Count(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

function imageExists(imageUrl) {
  if (!imageUrl.startsWith(SITE + "/")) return false;
  const assetPath = imageUrl.replace(SITE + "/", "");
  return fs.existsSync(path.join(HTML_ROOT, assetPath)) || fs.existsSync(path.join(PUBLIC, assetPath));
}

const htmlFiles = USE_DIST ? walk(HTML_ROOT) : [path.join(ROOT, "index.html"), ...walk(PUBLIC)];
const pages = [];
const routeMap = new Map();
const titleMap = new Map();
const descriptionMap = new Map();
const canonicalMap = new Map();
const APP_SHELL_ROUTES = new Set([
  "/app/ats-checker/",
  "/cover-letter/builder/",
  "/cover-letter/templates/",
  "/email-signature/",
  "/job-tracker/",
  "/master-profile/",
  "/personal-website/",
  "/r/",
  "/resume/builder/",
  "/resume/templates/",
]);

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  routeMap.set(route, filePath);

  const page = {
    filePath,
    route,
    html,
    title: title(html),
    description: meta(html, "description"),
    canonical: link(html, "canonical"),
    robots: meta(html, "robots"),
    h1: visibleH1Count(html),
    ogImage: prop(html, "og:image"),
    twitterImage: meta(html, "twitter:image"),
    noindex: isNoindex(html),
  };
  page.appShell = USE_DIST && APP_SHELL_ROUTES.has(route);
  pages.push(page);

  if (!page.appShell) {
    if (page.title) titleMap.set(page.title, [...(titleMap.get(page.title) || []), route]);
    if (page.description) descriptionMap.set(page.description, [...(descriptionMap.get(page.description) || []), route]);
    if (page.canonical) canonicalMap.set(page.canonical, [...(canonicalMap.get(page.canonical) || []), route]);
  }
}

for (const page of pages) {
  const label = `${page.route} (${path.relative(ROOT, page.filePath)})`;
  if (!page.title) errors.push(`${label}: missing <title>`);
  if (!page.description) errors.push(`${label}: missing meta description`);
  if (!page.canonical) errors.push(`${label}: missing canonical URL`);
  if (!page.appShell && page.h1 !== 1) errors.push(`${label}: expected exactly one H1, found ${page.h1}`);
  if (page.canonical && !page.canonical.startsWith(SITE + "/")) errors.push(`${label}: canonical must use ${SITE}`);
  if (page.ogImage && !imageExists(page.ogImage)) errors.push(`${label}: og:image does not map to an existing public file: ${page.ogImage}`);
  if (!page.ogImage) errors.push(`${label}: missing og:image`);
  if (!page.twitterImage) errors.push(`${label}: missing twitter:image`);
  if (page.twitterImage && !imageExists(page.twitterImage)) errors.push(`${label}: twitter:image does not map to an existing public file: ${page.twitterImage}`);
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.test|\.local/i.test(page.html)) errors.push(`${label}: development URL detected`);
  if (/<meta[^>]+name=["']keywords["']/i.test(page.html)) errors.push(`${label}: obsolete meta keywords tag found`);

  const jsonLdBlocks = [...page.html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  for (let i = 0; i < jsonLdBlocks.length; i += 1) {
    try {
      JSON.parse(jsonLdBlocks[i][1].trim());
    } catch (error) {
      errors.push(`${label}: invalid JSON-LD block ${i + 1}: ${error.message}`);
    }
  }
}

function duplicateRows(map, label) {
  for (const [value, routes] of map.entries()) {
    if (routes.length > 1) errors.push(`duplicate ${label}: ${JSON.stringify(value)} on ${routes.join(", ")}`);
  }
}

duplicateRows(titleMap, "title");
duplicateRows(descriptionMap, "description");
duplicateRows(canonicalMap, "canonical");

const sitemap = fs.readFileSync(path.join(HTML_ROOT, "sitemap.xml"), "utf8");
if (!sitemap.includes("<urlset") || !sitemap.includes("</urlset>")) errors.push("public/sitemap.xml does not look like valid sitemap XML");

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set();
for (const loc of sitemapUrls) {
  if (sitemapSet.has(loc)) errors.push(`duplicate sitemap URL: ${loc}`);
  sitemapSet.add(loc);
  if (!loc.startsWith(SITE + "/")) errors.push(`sitemap URL must use ${SITE}: ${loc}`);
}

for (const page of pages) {
  if (page.appShell) continue;
  if (page.noindex && sitemapSet.has(page.canonical)) errors.push(`${page.route}: noindex page included in sitemap`);
  if (!page.noindex && page.route !== "/404.html" && !sitemapSet.has(page.canonical)) errors.push(`${page.route}: indexable page missing from sitemap`);
}

for (const loc of sitemapUrls) {
  const page = pages.find((candidate) => candidate.canonical === loc);
  if (!page) errors.push(`sitemap URL is not represented by a local canonical page: ${loc}`);
}

for (const page of pages) {
  const links = [...page.html.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const href of links) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (/^https?:\/\//.test(href) && !href.startsWith(SITE + "/")) continue;

    let pathname = href.startsWith(SITE + "/") ? new URL(href).pathname : href.split("#")[0].split("?")[0];
    if (!pathname || pathname === "/") continue;
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      const assetPath = pathname.startsWith("/")
        ? path.join(HTML_ROOT, pathname.replace(/^\//, ""))
        : path.resolve(path.dirname(page.filePath), pathname);
      if (!fs.existsSync(assetPath) && !fs.existsSync(path.join(PUBLIC, pathname.replace(/^\//, ""))) && !fs.existsSync(path.join(ROOT, pathname.replace(/^\//, "")))) {
        errors.push(`${page.route}: broken internal asset link ${href}`);
      }
      continue;
    }
    if (!pathname.endsWith("/")) pathname += "/";
    if (!routeMap.has(pathname)) errors.push(`${page.route}: broken internal page link ${href}`);
  }
}

for (const page of pages.filter((candidate) => candidate.html.includes("hreflang="))) {
  const alternateTags = [...page.html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)].map((match) => attrs(match[0]));
  for (const alt of alternateTags) {
    if (!alt.hreflang || !alt.href) errors.push(`${page.route}: incomplete hreflang tag`);
    if (alt.href && !sitemapSet.has(alt.href)) errors.push(`${page.route}: hreflang target is not in sitemap: ${alt.href}`);
  }
}

if (warnings.length) {
  console.log("SEO audit warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error("SEO audit failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Local SEO checks passed: ${pages.length} HTML files, ${sitemapUrls.length} sitemap URLs`);
NODE

if [[ "${SEO_AUDIT_SKIP_HTTP:-0}" != "1" ]]; then
  if ! command -v curl >/dev/null 2>&1; then
    echo "SEO audit failed: curl is required for sitemap HTTP checks" >&2
    exit 1
  fi

  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    result="$(curl -sS -o /dev/null -w '%{http_code} %{num_redirects}' "$url")"
    code="${result%% *}"
    redirects="${result##* }"
    if [[ "$code" != "200" || "$redirects" != "0" ]]; then
      echo "SEO audit failed: sitemap URL did not return direct 200: $url ($result)" >&2
      exit 1
    fi
  done < <(grep -oE '<loc>[^<]+' "$SITEMAP_PATH" | sed 's#<loc>##')

  echo "Sitemap HTTP checks passed against $SITE_URL"
fi

echo "SEO audit passed"
