import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { blogArticles } from "./blog-articles.mjs";

const root = new URL("..", import.meta.url).pathname;
const specs = [
  { locale:"en", route:"/blog/how-applycraft-works/", file:"dist/blog/how-applycraft-works/index.html", h1:"How ApplyCraft Works: From Resume to Interview", alternate:"https://applycraft.io/fr/blog/comment-fonctionne-applycraft/" },
  { locale:"fr", route:"/fr/blog/comment-fonctionne-applycraft/", file:"dist/fr/blog/comment-fonctionne-applycraft/index.html", h1:"Comment fonctionne ApplyCraft : du CV à l’entretien", alternate:"https://applycraft.io/blog/how-applycraft-works/" },
];
const plainText = (html) => html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&[a-z#0-9]+;/gi," ").replace(/\s+/g," ").trim();
for (const spec of specs) {
  const html = readFileSync(join(root, spec.file), "utf8");
  assert.equal((html.match(/<h1\b/gi)||[]).length, 1, `${spec.route} must have one H1`);
  assert.ok(html.includes(`<h1>${spec.h1}</h1>`), `${spec.route} H1`);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  assert.ok(title.length >= 35 && title.length <= 60, `${spec.route} title length ${title.length}`);
  assert.match(html, /<meta name="description" content="[^"]{100,170}">/i);
  assert.ok(html.includes(`<link rel="canonical" href="https://applycraft.io${spec.route}">`), `${spec.route} canonical`);
  assert.ok(html.includes(`hreflang="${spec.locale}" href="https://applycraft.io${spec.route}"`), `${spec.route} self hreflang`);
  assert.ok(html.includes(`href="${spec.alternate}"`), `${spec.route} reciprocal alternate`);
  assert.match(html, /"@type":"BlogPosting"/); assert.match(html, /"@type":"BreadcrumbList"/); assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /<caption>[^<]*(workflow|parcours)[^<]*<\/caption>/i);
  assert.match(html, /<caption>[^<]*(ApplyCraft compared|ApplyCraft et)[^<]*<\/caption>/i);
  assert.match(html, spec.locale === "en" ? /What ApplyCraft does not do/ : /Ce qu’ApplyCraft ne fait pas/);
  assert.ok(plainText(html).split(/\s+/).length >= 3500, `${spec.route} must contain at least 3500 useful words`);
  assert.doesNotMatch(html, /AggregateRating|guaranteed ATS|ATS garanti/i);
  assert.doesNotMatch(html, /22 templates|50\+ languages|99 languages|22 modèles|50\+ langues|99 langues/i);
  assert.ok(blogArticles.some((entry) => entry.route === spec.route && entry.status === "published"), `${spec.route} registry entry`);
  const index = readFileSync(join(root, spec.locale === "en" ? "dist/blog/index.html" : "dist/fr/blog/index.html"), "utf8");
  assert.equal((index.match(new RegExp(`href="${spec.route}"`, "g"))||[]).length, 1, `${spec.route} visible once on locale index`);
}
const sitemap = readFileSync(join(root, "public/sitemap.xml"), "utf8");
for (const spec of specs) assert.ok(sitemap.includes(`https://applycraft.io${spec.route}`), `${spec.route} sitemap entry`);
console.log("Workflow guide tests passed: static content, metadata, reciprocal hreflang, schemas, index cards, word counts and sitemap entries are valid.");
