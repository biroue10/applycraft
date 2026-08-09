import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { editorialDateMarkup, publishedArticles } from "./article-dates.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function setArticleMeta(html, property, value) {
  const pattern = new RegExp(`<meta\\s+property=["']${property.replace(":", "\\:")}["'][^>]*>`, "i");
  const tag = `<meta property="${property}" content="${value}">`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<meta\s+property=["']og:type["'][^>]*>/i, (match) => `${match}${tag}`);
}

function removeArticleMeta(html, property) {
  const pattern = new RegExp(`<meta\\s+property=["']${property.replace(":", "\\:")}["'][^>]*>`, "gi");
  return html.replace(pattern, "");
}

function syncJsonLd(html, article) {
  let found = false;
  const synced = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (full, raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return full; }
    const entries = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
    let changed = false;
    for (const entry of entries) {
      const types = Array.isArray(entry?.["@type"]) ? entry["@type"] : [entry?.["@type"]];
      if (!types.includes("Article") && !types.includes("BlogPosting")) continue;
      entry.datePublished = article.datePublished;
      if (article.dateModified) entry.dateModified = article.dateModified;
      else delete entry.dateModified;
      changed = true;
      found = true;
    }
    return changed ? `<script type="application/ld+json">${JSON.stringify(data)}</script>` : full;
  });
  if (!found) throw new Error(`${article.route}: no Article or BlogPosting JSON-LD found`);
  return synced;
}

function syncVisibleDates(html, article) {
  const metaPattern = /<(div|p)\s+class=["'](?:post-meta|meta|article-meta)["'][^>]*>[\s\S]*?<\/\1>/i;
  if (!metaPattern.test(html)) throw new Error(`${article.route}: visible article metadata container not found`);
  const className = html.match(metaPattern)?.[0].match(/class=["']([^"']+)["']/i)?.[1] || "post-meta";
  const tagName = html.match(metaPattern)?.[1] || "div";
  const tag = `<span class="tag">${escapeHtml(article.category)}</span>`;
  return html.replace(metaPattern, `<${tagName} class="${className}">${tag}${editorialDateMarkup(article)}</${tagName}>`);
}

for (const article of publishedArticles) {
  const file = join(ROOT, "public", article.route, "index.html");
  const before = readFileSync(file, "utf8");
  let html = syncVisibleDates(before, article);
  html = setArticleMeta(html, "article:published_time", `${article.datePublished}T00:00:00Z`);
  html = article.dateModified
    ? setArticleMeta(html, "article:modified_time", `${article.dateModified}T00:00:00Z`)
    : removeArticleMeta(html, "article:modified_time");
  html = syncJsonLd(html, article);
  if (html !== before) writeFileSync(file, html, "utf8");
  console.log(`✓ ${article.route}: ${article.datePublished}${article.dateModified ? ` → ${article.dateModified}` : ""}`);
}
