import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const css = read("public/_seo.css");
const app = read("src/ResumeGenerator.jsx");

for (const token of [
  "--color-bg-page",
  "--color-bg-surface",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-accent-primary",
  "--color-border-subtle",
  "--radius-md",
  "--content-width",
]) {
  assert.match(css, new RegExp(`${token}:`), `Missing shared design token ${token}`);
}

assert.match(app, /const LOCALIZED_DOCUMENT_LANGUAGE_COUNT = PRODUCT\.localizedDocumentLanguageCount;/, "Localized document-language count should be explicit");
assert.match(app, /const UI_LANGUAGE_COUNT = PRODUCT\.interfaceLanguageCount;/, "UI language count should come from product facts");
assert.match(app, /function LineIcon/, "React app should use the lightweight inline icon helper");
assert.doesNotMatch(app, /50\+ languages|50\+ language|ATS-safe|Full UI/, "React app contains outdated product claims");

const htmlFiles = [];
function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name);
    const abs = join(root, rel);
    if (statSync(abs).isDirectory()) walk(rel);
    else if (name.endsWith(".html")) htmlFiles.push(rel);
  }
}
walk("public");

for (const file of htmlFiles) {
  const html = read(file);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!file.endsWith("404.html")) assert.equal(h1Count, 1, `${file} should keep exactly one H1`);
  assert.doesNotMatch(html, /50\+ languages|50\+ language|50\+ langues|50\+ لغة|99 document languages|99 langues de document|13 templates|ATS-safe|Full UI/, `${file} contains outdated product claims`);
  if (!file.endsWith("404.html")) {
    assert.match(html, /<link rel="canonical"/, `${file} should keep a canonical link`);
  }
}

for (const path of [
  "public/free-resume-builder/index.html",
  "public/ats-resume-builder/index.html",
  "public/resume-in-french/index.html",
  "public/resume-in-arabic/index.html",
  "public/privacy/index.html",
  "public/help/index.html",
]) {
  assert.ok(existsSync(join(root, path)), `${path} should exist`);
}

console.log(`Visual regression checks passed for ${htmlFiles.length} HTML pages.`);
