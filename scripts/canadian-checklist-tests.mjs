import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readSitemapUrls } from "./submit-indexnow.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const ROUTE = "/blog/canadian-resume-format-checklist/";
const CANONICAL = `https://applycraft.io${ROUTE}`;
const FR_ROUTE = "/fr/blog/checklist-cv-canadien/";
const FR_CANONICAL = `https://applycraft.io${FR_ROUTE}`;
const ARTICLE_FILE = join(PUBLIC, "blog/canadian-resume-format-checklist/index.html");
const EXAMPLE_FILE = join(PUBLIC, "examples/canadian-resume-format/index.html");
const IMMIGRANT_FILE = join(PUBLIC, "blog/canadian-resume-for-immigrants/index.html");
const INDEX_FILE = join(PUBLIC, "blog/index.html");
const FR_ARTICLE_FILE = join(PUBLIC, "fr/blog/checklist-cv-canadien/index.html");
const FR_INDEX_FILE = join(PUBLIC, "fr/blog/index.html");
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
if (!html.includes(`hreflang="fr" href="${FR_CANONICAL}"`)) fail("English article is missing its French alternate");
if (/hreflang="ar"/i.test(html)) fail("English article must not fabricate an Arabic alternate");
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
  [FR_ROUTE, "Final section-by-section verification before submission"],
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

const frHtml = existsSync(FR_ARTICLE_FILE) ? readFileSync(FR_ARTICLE_FILE, "utf8") : "";
const frArticle = frHtml.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || "";
const frText = frArticle.replace(/<[^>]+>/g, " ").replace(/&(?:[a-z]+|#\d+);/gi, " ").replace(/\s+/g, " ").trim();
const frWordCount = frText ? frText.split(" ").length : 0;
if (!frHtml) fail("French Canadian checklist article is missing");
if (frHtml.match(/<title>([^<]+)<\/title>/i)?.[1] !== "Checklist CV canadien 2026 | ApplyCraft") fail("French SEO title mismatch");
if ((frHtml.match(/<h1\b/gi) || []).length !== 1) fail("French article must have exactly one H1");
if (!frHtml.includes("<h1>Checklist du CV canadien : quoi inclure et retirer en 2026</h1>")) fail("French H1 mismatch");
if (!frHtml.includes(`<link rel="canonical" href="${FR_CANONICAL}"`)) fail("French self-referencing canonical missing");
if (!frHtml.includes(`hreflang="en" href="${CANONICAL}"`) || !frHtml.includes(`hreflang="fr" href="${FR_CANONICAL}"`) || !frHtml.includes(`hreflang="x-default" href="${CANONICAL}"`)) fail("French reciprocal hreflang set is incomplete");
if (/hreflang="ar"/i.test(frHtml)) fail("French article must not fabricate an Arabic alternate");
if (frWordCount < 3500 || frWordCount > 4500) fail(`French article word count ${frWordCount} is outside 3500-4500`);
if ((frArticle.match(/<table\b/g) || []).length < 7) fail("French practical tables are missing");
if ((frArticle.match(/<details\b/g) || []).length !== 12) fail("French article must contain 12 visible FAQs");
const frSchemas = [...frHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
for (const type of ["BlogPosting", "BreadcrumbList", "FAQPage"]) if (!frSchemas.some((schema) => schema["@type"] === type)) fail(`French ${type} schema missing`);
const frPosting = frSchemas.find((schema) => schema["@type"] === "BlogPosting");
if (frPosting?.mainEntityOfPage !== FR_CANONICAL || frPosting?.inLanguage !== "fr") fail("French BlogPosting canonical or language mismatch");
const frFaq = frSchemas.find((schema) => schema["@type"] === "FAQPage");
if (frFaq?.mainEntity?.length !== 12) fail("French FAQ schema must contain 12 questions");
for (const item of frFaq?.mainEntity || []) {
  const visible = `<details><summary>${item.name}</summary><p>${item.acceptedAnswer.text}</p></details>`;
  if (!frArticle.includes(visible)) fail(`French FAQ schema differs from visible FAQ: ${item.name}`);
}
if (!readFileSync(FR_INDEX_FILE, "utf8").includes(`href="${FR_ROUTE}"`)) fail("French blog index does not link to the checklist article");
const frParagraphs = [...frArticle.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).filter((paragraph) => paragraph.length > 160);
for (const file of [IMMIGRANT_FILE, join(PUBLIC, "fr/blog/cv-canadien-maroc/index.html"), ARTICLE_FILE]) {
  const other = readFileSync(file, "utf8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const paragraph of frParagraphs) if (other.includes(paragraph)) fail(`large French paragraph duplicated from ${file}`);
}
for (const claim of ["22 modèles", "50+ langues", "99 langues"]) if (frHtml.includes(claim)) fail(`outdated French claim found: ${claim}`);

if (failures.length) {
  console.error("Canadian checklist tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Canadian checklist tests passed (English: ${wordCount} words; French: ${frWordCount} words; 12 FAQs per locale).`);
