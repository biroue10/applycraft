import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const SITE = "https://applycraft.io";
const STATIC_APP_ROUTES = [
  "/",
  "/fr/",
  "/ar/",
  "/resume/templates",
  "/cover-letter/templates",
  "/cover-letter/builder",
  "/job-tracker",
  "/app/ats-checker",
  "/master-profile",
  "/email-signature",
  "/personal-website",
];
const REDIRECTED_PATHS = new Set([
  "/resume-builder/",
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) walk(filePath, files);
    else if (entry === "index.html") files.push(filePath);
  }
  return files;
}

function attr(tag, name) {
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function canonicalFromHtml(html) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "";
  const canonical = attr(tag, "href");
  if (canonical) return canonical;
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]*>/i)?.[0] || "";
  return attr(ogUrl, "content");
}

function isNoindex(html) {
  const tag = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "";
  return /noindex/i.test(attr(tag, "content"));
}

function gitLastmod(filePath) {
  try {
    const rel = relative(ROOT, filePath);
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const pages = [join(ROOT, "index.html"), ...walk(PUBLIC_DIR)]
  .map((filePath) => {
    const html = readFileSync(filePath, "utf8");
    const loc = canonicalFromHtml(html);
    if (!loc || !loc.startsWith(`${SITE}/`) || isNoindex(html)) return null;
    const path = new URL(loc).pathname;
    if (REDIRECTED_PATHS.has(path)) return null;
    return { loc, lastmod: gitLastmod(filePath) };
  })
  .filter(Boolean)
  .sort((a, b) => a.loc.localeCompare(b.loc));

for (const route of STATIC_APP_ROUTES) {
  const loc = `${SITE}${route}`;
  if (!pages.some((page) => page.loc === loc)) pages.push({ loc, lastmod: "" });
}
pages.sort((a, b) => a.loc.localeCompare(b.loc));

const seen = new Set();
const urls = [];
for (const page of pages) {
  if (seen.has(page.loc)) {
    throw new Error(`Duplicate canonical URL in sitemap input: ${page.loc}`);
  }
  seen.add(page.loc);
  urls.push(page);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`).join("\n")}
</urlset>
`;

writeFileSync(join(PUBLIC_DIR, "sitemap.xml"), xml, "utf8");
console.log(`✓ Generated public/sitemap.xml with ${urls.length} URLs`);
