import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readSitemapUrls } from "./submit-indexnow.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const ROUTE = "/blog/canadian-resume-format-checklist/";
const CANONICAL = `https://applycraft.io${ROUTE}`;
const ARTICLE_FILE = join(PUBLIC, "blog/canadian-resume-format-checklist/index.html");
const EXAMPLE_FILE = join(PUBLIC, "examples/canadian-resume-format/index.html");
const IMMIGRANT_FILE = join(PUBLIC, "blog/canadian-resume-for-immigrants/index.html");
const INDEX_FILE = join(PUBLIC, "blog/index.html");
const failures = [];
const fail = (message) => failures.push(message);
const html = existsSync(ARTICLE_FILE) ? readFileSync(ARTICLE_FILE, "utf8") : "";

if (!html) fail("Canadian checklist article is missing");
const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
if (title !== "Canadian Resume Format Checklist 2026 | ApplyCraft") fail("SEO title mismatch");
if (title.length < 45 || title.length > 60) fail(`SEO title length is ${title.length}, expected 45-60`);
const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || "";
if (description !== "Use this Canadian resume format checklist to organize every section, remove unnecessary personal details, tailor your keywords and submit a clear resume.") fail("meta description mismatch");
if ((html.match(/<h1\b/gi) || []).length !== 1) fail("article must have exactly one H1");
if (!html.includes("<h1>Canadian Resume Format Checklist: What to Include and Remove in 2026</h1>")) fail("H1 mismatch");
if (!html.includes(`<link rel="canonical" href="${CANONICAL}"`)) fail("self-referencing canonical missing");
if (/hreflang="(?:fr|ar)"/i.test(html)) fail("English-only article must not fabricate French or Arabic alternates");
if (/noindex/i.test(html)) fail("article must not be noindex");

const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || "";
const text = article.replace(/<[^>]+>/g, " ").replace(/&(?:[a-z]+|#\d+);/gi, " ").replace(/\s+/g, " ").trim();
const wordCount = text ? text.split(" ").length : 0;
if (wordCount < 3500 || wordCount > 4500) fail(`article word count ${wordCount} is outside 3500-4500`);
const keywordCount = (text.toLowerCase().match(/canadian resume format checklist/g) || []).length;
if (keywordCount < 2 || keywordCount > 8) fail(`primary keyword count ${keywordCount} is outside the natural range 2-8`);
if ((article.match(/href="\/examples\/canadian-resume-format\/"/g) || []).length < 3) fail("article needs at least three contextual links to the Canadian example");
if ((article.match(/<table\b/g) || []).length < 7) fail("required practical tables are missing");
if ((article.match(/<caption>/g) || []).length !== (article.match(/<table\b/g) || []).length) fail("every article table needs a caption");
if ((article.match(/<th scope="(?:row|col)">/g) || []).length < 20) fail("semantic table headers are incomplete");
const checklistBlock = article.match(/<h2 id="final-checklist">[\s\S]*?<div class="cta-box">/)?.[0] || "";
if ((checklistBlock.match(/<li>/g) || []).length !== 25) fail("final checklist must contain exactly 25 checks");

const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
for (const type of ["BlogPosting", "BreadcrumbList", "FAQPage"]) if (!schemas.some((schema) => schema["@type"] === type)) fail(`${type} schema missing`);
const posting = schemas.find((schema) => schema["@type"] === "BlogPosting");
if (posting?.mainEntityOfPage !== CANONICAL || posting?.inLanguage !== "en-CA") fail("BlogPosting canonical or language mismatch");
const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
if (faq?.mainEntity?.length !== 12) fail("FAQ schema must contain 12 questions");
for (const item of faq?.mainEntity || []) {
  const visible = `<details><summary>${item.name}</summary><p>${item.acceptedAnswer.text}</p></details>`;
  if (!article.includes(visible)) fail(`FAQ schema differs from visible FAQ: ${item.name}`);
}

for (const match of article.matchAll(/<a[^>]+href="https:\/\/[^\"]+"[^>]*>/g)) {
  if (!/target="_blank"/.test(match[0]) || !/rel="noopener noreferrer"/.test(match[0])) fail(`external source link is not opened safely: ${match[0]}`);
}
for (const [file, label] of [[EXAMPLE_FILE, "example"], [IMMIGRANT_FILE, "immigrant guide"], [INDEX_FILE, "blog index"]]) {
  if (!readFileSync(file, "utf8").includes(`href="${ROUTE}"`)) fail(`${label} does not link to checklist article`);
}
const immigrant = readFileSync(IMMIGRANT_FILE, "utf8");
if (!immigrant.includes('href="/examples/canadian-resume-format/"')) fail("immigrant guide does not link to Canadian example");

const intents = JSON.parse(readFileSync(join(ROOT, "scripts/seo-content-intents.json"), "utf8"));
const expectedIntents = new Map([
  ["/examples/canadian-resume-format/", "See and edit a complete example"],
  ["/blog/canadian-resume-for-immigrants/", "Adapt international experience for Canada"],
  [ROUTE, "Verify every section before submission"],
]);
for (const [route, intent] of expectedIntents) if (!intents.some((item) => item.route === route && item.primaryIntent === intent)) fail(`content intent missing for ${route}`);

const comparisonFiles = [EXAMPLE_FILE, IMMIGRANT_FILE, join(PUBLIC, "fr/blog/cv-canadien-maroc/index.html")];
const articleParagraphs = [...article.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).filter((p) => p.length > 160);
for (const file of comparisonFiles) {
  const other = readFileSync(file, "utf8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const paragraph of articleParagraphs) if (other.includes(paragraph)) fail(`large paragraph duplicated from ${file}`);
}

for (const claim of ["22 templates", "50+ languages", "99 languages"]) if (html.includes(claim)) fail(`outdated claim found: ${claim}`);
const sitemapUrls = readSitemapUrls(join(PUBLIC, "sitemap.xml"));
if (!sitemapUrls.includes(CANONICAL)) fail("article missing from sitemap/IndexNow canonical list");

const allTitles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name === "index.html") allTitles.push({ path, title: readFileSync(path, "utf8").match(/<title>([^<]+)<\/title>/i)?.[1] || "" });
  }
}
walk(PUBLIC);
if (allTitles.filter((item) => item.title === title).length !== 1) fail("SEO title is duplicated");

if (failures.length) {
  console.error("Canadian checklist tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Canadian checklist tests passed (${wordCount} words, ${keywordCount} exact primary-keyword uses, ${faq.mainEntity.length} FAQs).`);
