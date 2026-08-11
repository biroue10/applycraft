import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { isValidEditorialDate, publishedArticles } from "./article-dates.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PRIORITY = new Map([
  ["/blog/teacher-resume-skills-achievements/", ["2026-07-26", "2026-08-11"]],
  ["/blog/student-resume-summary-examples/", ["2026-08-01", "2026-08-07"]],
  ["/blog/student-resume-no-experience/", ["2026-07-26", "2026-08-07"]],
  ["/fr/blog/exemple-cv-maroc/", ["2026-07-05", "2026-08-07"]],
]);

function articleJsonLd(document, route) {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    let data;
    try { data = JSON.parse(script.textContent); } catch { continue; }
    const entries = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
    const entry = entries.find((item) => {
      const types = Array.isArray(item?.["@type"]) ? item["@type"] : [item?.["@type"]];
      return types.includes("Article") || types.includes("BlogPosting");
    });
    if (entry) return entry;
  }
  assert.fail(`${route}: Article/BlogPosting JSON-LD missing`);
}

for (const article of publishedArticles) {
  const file = join(ROOT, "public", article.route, "index.html");
  const html = readFileSync(file, "utf8");
  assert.ok(isValidEditorialDate(article.datePublished), `${article.route}: valid datePublished`);
  assert.ok(!article.dateModified || isValidEditorialDate(article.dateModified), `${article.route}: valid dateModified`);
  assert.ok(!article.dateModified || article.dateModified >= article.datePublished, `${article.route}: chronological dates`);
  assert.doesNotMatch(html, /^(?:<{7}|={7}|>{7})/m, `${article.route}: no merge markers`);

  const document = new JSDOM(html).window.document;
  const publishedTime = document.querySelector(".editorial-date--published time");
  assert.equal(publishedTime?.getAttribute("datetime"), article.datePublished, `${article.route}: visible publication date`);
  const modifiedTime = document.querySelector(".editorial-date--modified time");
  if (article.dateModified && article.dateModified > article.datePublished) {
    assert.equal(modifiedTime?.getAttribute("datetime"), article.dateModified, `${article.route}: visible modified date`);
  } else {
    assert.equal(modifiedTime, null, `${article.route}: no fabricated visible update`);
  }

  const publishedMeta = document.querySelector('meta[property="article:published_time"]')?.content;
  assert.equal(publishedMeta, `${article.datePublished}T00:00:00Z`, `${article.route}: OG publication date`);
  const modifiedMeta = document.querySelector('meta[property="article:modified_time"]')?.content;
  assert.equal(modifiedMeta, article.dateModified ? `${article.dateModified}T00:00:00Z` : undefined, `${article.route}: OG modified date`);
  const schema = articleJsonLd(document, article.route);
  assert.equal(schema.datePublished, article.datePublished, `${article.route}: JSON-LD publication date`);
  assert.equal(schema.dateModified, article.dateModified, `${article.route}: JSON-LD modified date`);
}

for (const [route, [datePublished, dateModified]] of PRIORITY) {
  const article = publishedArticles.find((entry) => entry.route === route);
  assert.ok(article, `${route}: priority registry entry`);
  assert.equal(article.datePublished, datePublished, `${route}: factual publication date`);
  assert.equal(article.dateModified, dateModified, `${route}: factual editorial revision`);
  assert.ok(article.datePublished <= "2026-08-11" && article.dateModified <= "2026-08-11", `${route}: no future date`);
}

const freshnessScripts = [
  "scripts/apply-gsc-top10-seo.mjs",
  "scripts/generate-search-demand-articles.mjs",
  "scripts/generate-bilingual-resume-articles.mjs",
  "scripts/generate-application-question-articles.mjs",
  "scripts/sync-article-dates.mjs",
  "scripts/generate-sitemap.mjs",
].map((relative) => [relative, readFileSync(join(ROOT, relative), "utf8")]);

for (const [relative, source] of freshnessScripts) {
  assert.doesNotMatch(source, /const\s+TODAY\b/, `${relative}: no global TODAY`);
  assert.doesNotMatch(source, /(?:dateModified|modified_time)[\s\S]{0,160}(?:Date\.now\s*\(|new\s+Date\s*\(|mtime|git\s+log|process\.env[^\n]*(?:DATE|TIME|TIMESTAMP))/i, `${relative}: no dynamic editorial freshness`);
}

console.log(`✓ Article editorial dates synchronized for ${publishedArticles.length} published pages`);
