import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const walk = (dir, files = []) => { for (const name of readdirSync(dir)) { const path = join(dir, name); statSync(path).isDirectory() ? walk(path, files) : name === "index.html" && files.push(path); } return files; };
const overlays = {
  "/resume-builder/": ["resume builder", "Create and export a resume", "/resume/templates/"],
  "/free-resume-builder/": ["free resume builder", "Create a no-signup, no-watermark resume", "/resume-builder/"],
  "/ats-resume-builder/": ["ATS resume builder", "Build an ATS-conscious resume", "/ats-checker/"],
  "/ats-checker/": ["ATS checker", "Review an existing resume", "/resume-checker/"],
  "/canadian-resume-builder/": ["Canadian resume builder", "Create a resume for Canadian applications", "/examples/canadian-resume-format/"],
  "/blog/canadian-resume-format-checklist/": ["canadian resume format checklist", "Verify every section before submission", "/examples/canadian-resume-format/"],
  "/blog/canadian-resume-for-immigrants/": ["Canadian resume for immigrants", "Adapt international experience for Canada", "/blog/canadian-resume-format-checklist/"],
  "/blog/how-applycraft-works/": ["how ApplyCraft works", "Understand the complete ApplyCraft product workflow and its differentiators", "/application-pack/"],
  "/fr/blog/comment-fonctionne-applycraft/": ["comment fonctionne ApplyCraft", "Comprendre le fonctionnement complet d’ApplyCraft et ses différences", "/fr/application-pack/"],
  "/examples/canadian-resume-format/": ["Canadian resume example", "See and edit a complete example", "/canadian-resume-builder/"],
};
const pages = walk(PUBLIC).map((file) => {
  const html = readFileSync(file, "utf8");
  if (/noindex/i.test(html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "")) return null;
  const route = `/${relative(PUBLIC, file).replace(/index\.html$/, "")}`.replace(/\/+/g, "/");
  const title = html.match(/<title>([^<]+)/i)?.[1]?.replace(/\s*\|\s*ApplyCraft.*$/i, "").trim() || route;
  const overlay = overlays[route] || [title.toLowerCase(), `Serve the specific informational or product intent expressed by ${title}`, ""];
  return { route, locale: route.startsWith("/fr/") ? "fr" : route.startsWith("/ar/") ? "ar" : "en", primaryKeyword: overlay[0], secondaryKeywords: [], searchIntent: overlay[1], canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || "", parentHub: route.includes("ats") ? "/ats-resume-resources/" : route.includes("example") ? "/resume-examples-by-role/" : "", primaryCta: overlay[2], overlappingPages: overlay[2] ? [overlay[2]] : [], differentiationNote: overlay[1] };
}).filter(Boolean);
writeFileSync(join(PUBLIC, "seo-intent-registry.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2)}\n`);
console.log(`✓ SEO intent registry: ${pages.length} public pages`);
