import assert from "node:assert/strict";
import { activeNavIdForPath, normalizeNavPath, PRIMARY_NAV_ITEMS } from "../src/nav/navItems.js";
import { headerHtml } from "./shared-header.mjs";

const matrix = {
  "/resume-builder/": "resume",
  "/resume-builder?source=nav#start": "resume",
  "/free-resume-builder/": "resume",
  "/ats-resume-builder/": "ats",
  "/cover-letter-builder": "cover",
  "/cover-letter/templates/modern/": "cover",
  "/ats-checker/": "ats",
  "/ats-checker-fr/": "ats",
  "/ats-checker-ar/": "ats",
  "/resume-checker/": "ats",
  "/application-pack/": "application-pack",
  "/job-tracker/?stage=interview": "tracker",
  "/interview-prep/#practice": "interview",
  "/fr/interview-prep/": "interview",
  "/ar/interview-prep/": "interview",
  "/resume/templates/": "templates",
  "/resume/templates/modern/?country=canada#preview": "templates",
  "/pricing/": "pricing",
  "/fr/pricing/": "pricing",
};

for (const [route, expected] of Object.entries(matrix)) {
  assert.equal(activeNavIdForPath(route), expected, `${route} should activate ${expected}`);
}
assert.equal(activeNavIdForPath("/blog/"), "", "unrelated routes should not activate a product");
assert.equal(normalizeNavPath("//fr//pricing?x=1#plans"), "/pricing/", "route normalization should remove locale, duplicate slashes, query and hash");
assert.equal(new Set(PRIMARY_NAV_ITEMS.map((item) => item.id)).size, PRIMARY_NAV_ITEMS.length, "navigation IDs must be unique");

for (const [route, expected] of Object.entries(matrix)) {
  const html = headerHtml(route.startsWith("/fr/") ? "fr" : route.startsWith("/ar/") ? "ar" : "en", route);
  const current = [...html.matchAll(/<a class="ac-nav-link"[^>]+aria-current="page"[^>]*>/g)];
  assert.equal(current.length, 2, `${route}: desktop and mobile markup should each have exactly one current link`);
  assert.ok(current.every((match) => match[0].includes(`data-nav-id="${expected}"`)), `${route}: current item should match ${expected}`);
}

for (const [locale, label] of Object.entries({ en: "Create Resume", fr: "Créer mon CV", ar: "إنشاء سيرتي الذاتية" })) {
  assert.match(headerHtml(locale, locale === "en" ? "/" : `/${locale}/`), new RegExp(`class="ac-static-cta"[^>]*>${label}<`), `${locale}: navbar CTA wording should be canonical`);
}

console.log(`Navbar state tests passed: ${Object.keys(matrix).length} route variants.`);
