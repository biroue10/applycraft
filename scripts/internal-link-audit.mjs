import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { JSDOM } from "jsdom";

const ROOT = new URL("..", import.meta.url).pathname;
const CRAWL_ROOT = existsSync(join(ROOT, "dist")) ? join(ROOT, "dist") : join(ROOT, "public");
const SITE = "https://applycraft.io";
const priorities = [
  "/", "/fr/", "/resume/templates/", "/free-resume-builder/",
  "/blog/teacher-resume-skills-achievements/",
  "/blog/student-resume-summary-examples/",
  "/blog/student-resume-no-experience/",
  "/fr/blog/exemple-cv-maroc/",
  "/fr/blog/cv-canadien-maroc/",
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (name.endsWith(".html")) files.push(path);
  }
  return files;
}

function cleanPath(value, base = `${SITE}/`) {
  try {
    const url = new URL(value, base);
    if (url.origin !== SITE || url.search || url.hash) return null;
    let path = url.pathname;
    if (path.endsWith(".html")) path = path.replace(/\.html$/, "/");
    if (path !== "/" && !/\.[a-z0-9]+$/i.test(path) && !path.endsWith("/")) path += "/";
    return path;
  } catch { return null; }
}

const pages = new Map();
for (const file of walk(CRAWL_ROOT)) {
  const html = readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  if (/noindex/i.test(doc.querySelector('meta[name="robots"]')?.content || "")) continue;
  const fallback = `/${relative(CRAWL_ROOT, file).replace(/index\.html$/, "").replace(/\.html$/, "/")}`.replace(/\/+/g, "/");
  const route = cleanPath(doc.querySelector('link[rel="canonical"]')?.href || fallback);
  if (!route || pages.has(route)) continue;
  const links = [...doc.querySelectorAll("a[href]")].map((anchor) => {
    const target = cleanPath(anchor.getAttribute("href"), `${SITE}${route}`);
    if (!target) return null;
    const shared = Boolean(anchor.closest("header, nav, footer"));
    return { target, anchor: anchor.textContent.replace(/\s+/g, " ").trim(), shared };
  }).filter(Boolean);
  pages.set(route, links);
}

const depths = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length) {
  const source = queue.shift();
  for (const { target } of pages.get(source) || []) {
    if (pages.has(target) && !depths.has(target)) {
      depths.set(target, depths.get(source) + 1);
      queue.push(target);
    }
  }
}

const report = priorities.map((target) => {
  const inbound = [];
  for (const [source, links] of pages) {
    for (const link of links) if (link.target === target) inbound.push({ source, ...link });
  }
  const anchors = new Map();
  for (const link of inbound) anchors.set(link.anchor, (anchors.get(link.anchor) || 0) + 1);
  return {
    target,
    totalInbound: inbound.length,
    uniqueSources: new Set(inbound.map((link) => link.source)).size,
    contextualInbound: inbound.filter((link) => !link.shared).length,
    sharedNavFooterInbound: inbound.filter((link) => link.shared).length,
    anchorDiversity: anchors.size,
    clickDepth: depths.get(target) ?? null,
    orphan: inbound.length === 0,
    anchors: [...anchors].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([text, count]) => ({ text, count })),
  };
});

console.log(JSON.stringify({ crawlRoot: relative(ROOT, CRAWL_ROOT), crawledPages: pages.size, priorities: report }, null, 2));
if (report.some((item) => item.orphan)) process.exitCode = 1;
