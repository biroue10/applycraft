import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = {
  en: await readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
  fr: await readFile(new URL("../dist/fr/index.html", import.meta.url), "utf8"),
  ar: await readFile(new URL("../dist/ar/index.html", import.meta.url), "utf8"),
};

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1].replaceAll("&amp;", "&"));
}

const requiredEnglishLinks = [
  "/resume-builder/",
  "/cover-letter-builder/",
  "/ats-checker/",
  "/job-tracker/",
  "/interview-prep/",
  "/pricing/",
  "/examples/",
  "/fr/",
  "/ar/",
];

const englishHrefs = anchorHrefs(pages.en);
for (const href of requiredEnglishLinks) {
  assert(englishHrefs.includes(href), `homepage must prerender a real <a href="${href}"> link`);
}

const localizedRequired = {
  fr: [
    "/resume-builder/?ui=fr&docLang=fr",
    "/cover-letter/templates/?ui=fr&docLang=fr",
    "/ats-checker-fr/",
    "/job-tracker/?ui=fr",
    "/fr/interview-prep/",
    "/fr/pricing/",
  ],
  ar: [
    "/resume-builder/?ui=ar&docLang=ar",
    "/cover-letter/templates/?ui=ar&docLang=ar",
    "/ats-checker-ar/",
    "/job-tracker/?ui=ar",
    "/ar/interview-prep/",
  ],
};

for (const [lang, hrefs] of Object.entries(localizedRequired)) {
  const rendered = anchorHrefs(pages[lang]);
  for (const href of hrefs) {
    assert(rendered.includes(href), `${lang} homepage must use localized link ${href}`);
  }
}

for (const [lang, html] of Object.entries(pages)) {
  const hrefs = anchorHrefs(html);
  for (const oldRoute of ["/app/ats-checker", "/cover-letter/builder", "/email-signature"]) {
    assert(!hrefs.some((href) => href === oldRoute || href.startsWith(`${oldRoute}/`) || href.startsWith(`${oldRoute}?`)),
      `${lang} homepage must not link to old route ${oldRoute}`);
  }
  assert(!/<button\b[^>]*>\s*(?:Create my resume|Créer mon CV|أنشئ سيرتي الذاتية)\s*<\/button>/i.test(html),
    `${lang} primary route CTA must not prerender as a button`);
}

console.log("Navigation link tests passed.");
