import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { INDEXABLE_APP_PATHS, SITE, isIndexablePublicUrl, normalizePublicPath } from "./seo-url-policy.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const HTML_ROOT = PUBLIC;
const SITEMAP = join(HTML_ROOT, "sitemap.xml");
const ROBOTS = join(PUBLIC, "robots.txt");

const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function attrs(tag = "") {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z_:.-]+)=["']([^"']*)["']/g)) out[match[1]] = match[2];
  return out;
}

function canonical(html) {
  return attrs(html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]).href || "";
}

function routeFor(filePath) {
  const rel = relative(HTML_ROOT, filePath).replaceAll("\\", "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return normalizePublicPath(`/${rel.replace(/\.html$/, "")}`);
}

if (!existsSync(SITEMAP)) fail(`sitemap.xml missing at ${relative(ROOT, SITEMAP)}`);
if (!existsSync(ROBOTS)) fail("public/robots.txt missing");

const robots = existsSync(ROBOTS) ? readFileSync(ROBOTS, "utf8") : "";
if (!/Sitemap:\s*https:\/\/applycraft\.io\/sitemap\.xml/i.test(robots)) {
  fail("robots.txt must reference https://applycraft.io/sitemap.xml");
}

const xml = existsSync(SITEMAP) ? readFileSync(SITEMAP, "utf8") : "";
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)].map((match) => ({
  loc: match[1].trim(),
  body: match[2],
}));
const unique = new Set(urls);
if (urls.length !== unique.size) fail("sitemap.xml contains duplicate URLs");
if (entries.length !== urls.length) fail("sitemap.xml URL entry count does not match loc count");

for (const url of urls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail(`invalid sitemap URL: ${url}`);
    continue;
  }

  if (!isIndexablePublicUrl(url)) fail(`non-indexable URL in sitemap: ${url}`);
  if (parsed.hostname !== "applycraft.io" || parsed.protocol !== "https:") fail(`sitemap URL must use production HTTPS host: ${url}`);
  if (parsed.search) fail(`sitemap URL must not include query params: ${url}`);
  if (parsed.hash) fail(`sitemap URL must not include hash fragments: ${url}`);
  if (/localhost|127\.0\.0\.1|staging|preview/i.test(url)) fail(`non-production URL in sitemap: ${url}`);
  if (parsed.pathname !== "/" && !parsed.pathname.endsWith("/")) fail(`sitemap URL must use trailing slash: ${url}`);
  if (parsed.pathname.startsWith("/app/")) fail(`internal /app route in sitemap: ${url}`);
}

const missingLastmod = [];
for (const entry of entries) {
  const lastmod = entry.body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || "";
  if (!lastmod) missingLastmod.push(entry.loc);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) fail(`sitemap URL has invalid lastmod format: ${entry.loc} (${lastmod})`);
}
if (missingLastmod.length) {
  fail(`Missing lastmod:\n${missingLastmod.map((url) => `- ${url}`).join("\n")}`);
}

const sitemapSet = new Set(urls);
const matchingGuides = [
  {
    route: "/blog/resume-and-cover-letter-match/",
    file: join(PUBLIC, "blog/resume-and-cover-letter-match/index.html"),
    canonical: "https://applycraft.io/blog/resume-and-cover-letter-match/",
    alternate: "https://applycraft.io/fr/blog/cv-lettre-motivation-correspondance-candidature/",
    indexFile: join(PUBLIC, "blog/index.html"),
  },
  {
    route: "/fr/blog/cv-lettre-motivation-correspondance-candidature/",
    file: join(PUBLIC, "fr/blog/cv-lettre-motivation-correspondance-candidature/index.html"),
    canonical: "https://applycraft.io/fr/blog/cv-lettre-motivation-correspondance-candidature/",
    alternate: "https://applycraft.io/blog/resume-and-cover-letter-match/",
    indexFile: join(PUBLIC, "fr/blog/index.html"),
  },
];

for (const guide of matchingGuides) {
  if (!sitemapSet.has(guide.canonical)) fail(`matching guide missing from sitemap: ${guide.canonical}`);
  const html = readFileSync(guide.file, "utf8");
  if (canonical(html) !== guide.canonical) fail(`${guide.route} canonical mismatch`);
  if (!html.includes(`hreflang="en"`) || !html.includes(`hreflang="fr"`) || !html.includes(`href="${guide.alternate}"`)) {
    fail(`${guide.route} reciprocal English/French hreflang missing`);
  }
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  for (const type of ["BlogPosting", "BreadcrumbList", "FAQPage"]) {
    if (!schemas.some((schema) => schema["@type"] === type)) fail(`${guide.route} missing ${type} schema`);
  }
  const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
  const visibleFaq = html.match(/<section class="faq">([\s\S]*?)<\/section>/)?.[1] || "";
  for (const item of faq?.mainEntity || []) {
    if (!visibleFaq.includes(`<h3>${item.name}</h3><p>${item.acceptedAnswer.text}</p>`)) {
      fail(`${guide.route} FAQ schema differs from visible answer: ${item.name}`);
    }
  }
  const indexHtml = readFileSync(guide.indexFile, "utf8");
  if (!indexHtml.includes(`href="${guide.route}"`)) fail(`${guide.route} missing from localized blog index`);
}

for (const appPath of INDEXABLE_APP_PATHS) {
  const loc = `${SITE}${appPath}`;
  if (!sitemapSet.has(loc)) fail(`indexable app route missing from sitemap: ${loc}`);
}

for (const redirected of ["/app/ats-checker/", "/cover-letter/builder/", "/email-signature/"]) {
  const loc = `${SITE}${redirected}`;
  if (sitemapSet.has(loc)) fail(`internal or redirected route must not be in sitemap: ${loc}`);
}

const canonicalMap = new Map();
if (existsSync(HTML_ROOT)) {
  for (const file of walk(HTML_ROOT)) {
    if (file.endsWith("/404.html")) continue;
    const html = readFileSync(file, "utf8");
    const can = canonical(html);
    if (!can) continue;
    canonicalMap.set(can, routeFor(file));

    const alternateTags = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)].map((match) => attrs(match[0]));
    for (const tag of alternateTags) {
      if (!tag.hreflang || !tag.href) fail(`${relative(ROOT, file)} has incomplete hreflang`);
      if (tag.href && !sitemapSet.has(tag.href)) fail(`${relative(ROOT, file)} hreflang target missing from sitemap: ${tag.href}`);
    }
  }
}

for (const url of urls) {
  if (INDEXABLE_APP_PATHS.includes(new URL(url).pathname)) continue;
  if (!canonicalMap.has(url)) fail(`sitemap URL is not represented by a local canonical page: ${url}`);
}

if (failures.length) {
  console.error("Sitemap tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Sitemap tests passed (${urls.length} URLs).`);
