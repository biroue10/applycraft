import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildResumeStarterUrl,
  getResumeStarterMeta,
  STARTER_METADATA,
  starterIdForSlug,
} from "../src/data/resumeStarters/index.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

assert.equal(
  buildResumeStarterUrl("sales-representative"),
  "/resume-builder?starter=sales-representative",
  "starter helper should build the canonical starter URL",
);
assert.equal(
  buildResumeStarterUrl("arabic-resume", { interfaceLanguage: "ar", documentLanguage: "ar" }),
  "/resume-builder?starter=arabic-resume&ui=ar&docLang=ar",
  "starter helper should preserve interface and document language",
);
assert.equal(starterIdForSlug("sales-representative-resume"), "sales-representative");
assert.equal(starterIdForSlug("it-support-resume"), "it-support-technician");
assert.equal(starterIdForSlug("customer-service-resume"), "customer-service");
assert.ok(getResumeStarterMeta("sales-representative"), "sales representative starter metadata should exist");

const starterIndex = await read("src/data/resumeStarters/index.js");
const starterContent = await read("src/data/resumeStarters/starterContent.js");
assert.doesNotMatch(starterIndex, /James Carter|Daniel Park|Elena Rodriguez/, "starter sample content must not live in the metadata/helper module");
assert.match(starterContent, /James Carter/, "full starter content should live in the lazy content module");

const app = await read("src/ResumeGenerator.jsx");
const routes = await read("src/routes.jsx");
assert.match(routes, /path: "\/resume-builder"/, "SPA should serve /resume-builder");
assert.match(app, /await import\("\.\/data\/resumeStarters\/index\.js"\)/, "builder should lazy-load starter registry");
assert.match(app, /params\.get\("starter"\)/, "builder should read ?starter=");
assert.match(app, /params\.get\("template"\)/, "builder should read ?template=");
assert.match(app, /Template could not be loaded\. Starting with a blank résumé\./, "invalid starter fallback message should exist");
assert.doesNotMatch(app, /localStorage\.setItem\(["']resumeData["']|localStorage\.setItem\(["']ac_resume_draft["']/, "starter data must not be passed or saved through resume localStorage");

const publicChecks = [
  ["public/examples/sales-representative-resume/index.html", /href="\/resume-builder\?starter=sales-representative"/, /Use This Template Free/],
  ["public/examples/it-support-technician-resume/index.html", /href="\/resume-builder\?starter=it-support-technician"/, /Use This Template Free/],
  ["public/examples/customer-service-resume/index.html", /href="\/resume-builder\?starter=customer-service"/, /Use This Template Free/],
  ["public/resume-in-french/index.html", /href="\/resume-builder\?starter=french-cv&ui=fr&docLang=fr"/, /Utiliser ce modèle gratuitement/],
  ["public/resume-in-arabic/index.html", /href="\/resume-builder\?starter=arabic-resume&ui=ar&docLang=ar"/, /استخدم هذا القالب مجانًا/],
];

for (const [file, hrefPattern, labelPattern] of publicChecks) {
  const html = await read(file);
  assert.match(html, hrefPattern, `${file} should link example CTA to the correct starter`);
  assert.match(html, labelPattern, `${file} should keep expected CTA text`);
}

for (const starter of STARTER_METADATA) {
  assert.ok(starter.id && starter.slug && starter.templateId && starter.documentLanguage, `starter metadata incomplete for ${starter.id}`);
}

console.log("Starter CTA tests passed.");
