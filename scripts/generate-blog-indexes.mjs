import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishedBlogArticles } from "./blog-articles.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const markers = { start: "    <!-- BLOG_ARTICLES_START -->", end: "    <!-- BLOG_ARTICLES_END -->" };
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function dateLabel(date, locale) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { day:"numeric", month:"long", year:"numeric", timeZone:"UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function card(article) {
  const meta = `<div class="post-meta"><span class="tag">${esc(article.category)}</span><span>${esc(dateLabel(article.publishedAt, article.locale))}</span><span>· ${article.readMinutes} ${article.locale === "fr" ? "min de lecture" : "min read"}</span></div>`;
  const body = `${meta}\n        <h2>${esc(article.title)}</h2>\n        <p>${esc(article.description)}</p>\n        <span class="read-more">${article.locale === "fr" ? "Lire l’article" : "Read article"} →</span>`;
  if (article.locale === "fr") {
    return `    <a class="post-card" href="${article.route}">\n      <img src="${article.image}" width="${article.imageWidth}" height="${article.imageHeight}" alt="${esc(article.imageAlt)}" loading="lazy" decoding="async">\n      <div>\n        ${body}\n      </div>\n    </a>`;
  }
  return `    <a class="post-card" href="${article.route}">\n      ${body}\n    </a>`;
}

for (const [locale, relative] of [["en", "public/blog/index.html"], ["fr", "public/fr/blog/index.html"]]) {
  const file = join(ROOT, relative);
  const html = readFileSync(file, "utf8");
  const start = html.indexOf(markers.start);
  const end = html.indexOf(markers.end);
  if (start < 0 || end < start) throw new Error(`${relative} is missing blog registry markers`);
  const cards = publishedBlogArticles(locale).map(card).join("\n");
  writeFileSync(file, `${html.slice(0, start)}${markers.start}\n${cards}\n${html.slice(end)}`, "utf8");
  console.log(`✓ ${relative}: ${publishedBlogArticles(locale).length} published cards`);
}
