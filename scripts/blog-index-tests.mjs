import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { blogArticles, publishedBlogArticles } from "./blog-articles.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");
const failures = [];
const fail = (message) => failures.push(message);

function articleRoutes(root, prefix) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, "index.html")))
    .map((entry) => `${prefix}${entry.name}/`);
}

function cardRoutes(html) {
  return [...html.matchAll(/<a\s+class="post-card"\s+href="([^"]+)"/g)].map((match) => match[1]);
}

for (const locale of ["en", "fr"]) {
  const relativeIndex = locale === "en" ? "blog/index.html" : "fr/blog/index.html";
  const indexFile = join(DIST, relativeIndex);
  if (!existsSync(indexFile)) {
    fail(`built ${locale} blog index is missing: dist/${relativeIndex}`);
    continue;
  }

  const html = readFileSync(indexFile, "utf8");
  const actual = cardRoutes(html);
  const expected = publishedBlogArticles(locale).map((article) => article.route);
  const duplicates = actual.filter((route, index) => actual.indexOf(route) !== index);
  if (actual.length !== expected.length) fail(`${locale} index has ${actual.length} cards; registry has ${expected.length} published articles`);
  if (duplicates.length) fail(`${locale} index contains duplicate cards: ${[...new Set(duplicates)].join(", ")}`);
  if (actual.join("\n") !== expected.join("\n")) fail(`${locale} index routes or newest-first order differ from the registry`);

  for (const route of expected) {
    if (!actual.includes(route)) fail(`${locale} published article is absent from its index: ${route}`);
    if (!existsSync(join(DIST, route.slice(1), "index.html"))) fail(`${locale} blog card points to a missing built route: ${route}`);
    if (locale === "en" && (!route.startsWith("/blog/") || route.startsWith("/fr/"))) fail(`English registry contains wrong-locale route: ${route}`);
    if (locale === "fr" && !route.startsWith("/fr/blog/")) fail(`French registry contains wrong-locale route: ${route}`);
  }

  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join("\n");
  if (/\.post-card[^{}]*\{[^{}]*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)/i.test(styles)) fail(`${locale} cards are hidden by CSS`);
  if (/\.post-list[^{}]*\{[^{}]*(?:overflow\s*:\s*hidden|max-height\s*:)/i.test(styles)) fail(`${locale} card grid can clip published cards`);
}

const diskRoutes = [
  ...articleRoutes(join(PUBLIC, "blog"), "/blog/"),
  ...articleRoutes(join(PUBLIC, "fr/blog"), "/fr/blog/"),
];
const registered = new Set(blogArticles.map((article) => article.route));
for (const route of diskRoutes) if (!registered.has(route)) fail(`published article file is not represented in the central registry: ${route}`);
for (const article of blogArticles) {
  if (!article.status) fail(`registry entry has no explicit status: ${article.route}`);
  if (article.status === "published" && !diskRoutes.includes(article.route)) fail(`published registry route has no article file: ${article.route}`);
}

if (failures.length) {
  console.error("Blog index integrity tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Blog index integrity tests passed (${publishedBlogArticles("en").length} English, ${publishedBlogArticles("fr").length} French published cards).`);
