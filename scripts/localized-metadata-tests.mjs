import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cases = [
  ["dist/fr/index.html", "fr", /Créateur de CV/i],
  ["dist/ar/index.html", "ar", /[\u0600-\u06ff]/],
  ["dist/fr/interview-prep/index.html", "fr", /Préparation entretien/i],
  ["dist/ar/interview-prep/index.html", "ar", /[\u0600-\u06ff]/],
  ["dist/fr/modeles-cv/index.html", "fr", /Modèles de CV/i],
  ["dist/ar/resume-templates/index.html", "ar", /[\u0600-\u06ff]/],
  ["dist/fr/pricing/index.html", "fr", /Tarifs/i],
];

for (const [file, locale, titlePattern] of cases) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  assert(titlePattern.test(title), `${file} title must be localized: ${title}`);
  assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`, "i"), `${file} lang mismatch`);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/i, `${file} missing description`);
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+"/i, `${file} missing localized OG title`);
  assert.match(html, /<meta\s+name="twitter:title"\s+content="[^"]+"/i, `${file} missing localized Twitter title`);
  assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/applycraft\.io\/[^"]+"/i, `${file} missing canonical`);
}

console.log("Localized metadata tests passed.");
