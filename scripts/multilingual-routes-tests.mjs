import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALIZED_ROUTES, localizeRoute } from "../src/seo/localizedRoutes.js";

for (const locale of ["en", "fr", "ar"]) {
  const href = localizeRoute("/cover-letter-builder/", locale);
  assert.equal(new URL(href, "https://applycraft.io").pathname, "/cover-letter-builder/",
    `${locale} Cover Letter navigation must open the builder`);
  assert.notEqual(href, localizeRoute("/cover-letter/templates/", locale),
    `${locale} builder and gallery must retain distinct intents`);
}

for (const [route, variants] of Object.entries(LOCALIZED_ROUTES)) {
  assert(variants.en, `${route} must define an English route`);
  for (const href of Object.values(variants)) {
    assert.equal(new URL(href, "https://applycraft.io").origin, "https://applycraft.io");
  }
}

const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
assert.match(redirects, /^\/cover-letter\/?\s+\/cover-letter-builder\/\s+301$/m);

const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
assert(!/[?&](?:ui|docLang)=/.test(sitemap), "sitemap must not contain locale-state queries");
assert(!sitemap.includes("https://applycraft.io/cover-letter/</loc>"), "redirect alias must not be indexed");

console.log("Multilingual route consistency tests passed.");
