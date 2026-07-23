import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { INTERFACE_LANGUAGES, interfaceLanguageByCode } from "../src/i18n/languages.js";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const routes = [
  "/", "/resume-builder/", "/cover-letter-builder/", "/ats-checker/",
  "/application-pack/", "/job-tracker/", "/interview-prep/",
  "/resume/templates/", "/pricing/", "/fr/pricing/",
];

function builtFile(route) {
  if (route === "/") return join(DIST, "index.html");
  const clean = route.replace(/^\/|\/$/g, "");
  return [join(DIST, clean, "index.html"), join(DIST, `${clean}.html`)].find(existsSync);
}

assert.deepEqual(INTERFACE_LANGUAGES, ["en", "fr", "ar"]);
for (const code of INTERFACE_LANGUAGES) {
  const language = interfaceLanguageByCode(code);
  assert.ok(existsSync(join(ROOT, "public", language.flagSrc)), `${language.flagSrc} must exist`);
}

for (const route of routes) {
  const file = builtFile(route);
  assert.ok(file, `${route}: built page must exist`);
  const html = readFileSync(file, "utf8");
  assert.equal((html.match(/data-site-header="applycraft"/g) || []).length, 1, `${route}: one header`);
  assert.equal((html.match(/class="ac-language-trigger"/g) || []).length, 1, `${route}: one language trigger`);
  assert.match(html, /<button[^>]+class="ac-language-trigger"[^>]+aria-expanded=/, `${route}: semantic trigger`);
  const languageMenu = html.match(/class="ac-language-menu"[\s\S]*?<\/div>/)?.[0] || "";
  const positions = INTERFACE_LANGUAGES.map((code) => languageMenu.indexOf(`lang="${code}"`));
  assert.ok(positions.every((position) => position >= 0), `${route}: all interface languages`);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${route}: language order`);
  assert.doesNotMatch(languageMenu, />\s*GB\s*</, `${route}: no plain GB flag fallback`);
  assert.doesNotMatch(html, /Search interface language|\bSITE\b/, `${route}: no legacy rich selector`);
  assert.match(html, /class="ac-nav-cta"[^>]*>(?:Create Resume|Créer mon CV|إنشاء سيرتي الذاتية)</, `${route}: canonical localized CTA`);
}

const ats = readFileSync(builtFile("/ats-checker/"), "utf8");
assert.match(ats, /<h1>See exactly how your resume[\s\S]*scores — and how to fix it<\/h1>/);
assert.equal((ats.match(/<h1\b/g) || []).length, 1, "ATS page has one intentional H1");

const redirects = readFileSync(join(ROOT, "public/_redirects"), "utf8");
assert.match(redirects, /^\/cover-letter\/?\s+\/cover-letter-builder\/\s+301$/m);

console.log(`Navbar consistency tests passed (${routes.length} main routes).`);
