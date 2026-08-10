#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const pages = [
  { locale: "en", file: "index.html", sampleName: "Maya Bennett", labels: ["Profile", "Skills", "Education", "Certification", "Experience", "Projects"] },
  { locale: "fr", file: "fr/index.html", sampleName: "Maya Bennett", labels: ["Profil", "Compétences", "Formation", "Certification", "Expérience", "Projets"] },
  { locale: "ar", file: "ar/index.html", sampleName: "مايا بنعلي", labels: ["الملخص", "المهارات", "التعليم", "الشهادات", "الخبرة", "المشاريع"] },
];

function headingText(html) {
  return [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((match) => match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

for (const page of pages) {
  const html = readFileSync(join(DIST, page.file), "utf8");
  const headings = headingText(html);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page.locale}: homepage must contain exactly one H1`);
  assert.equal((html.match(/<h2\b/gi) || []).length, 8, `${page.locale}: genuine marketing H2 sections must remain`);
  assert.match(html, /<h2\b[^>]*id="interactive-demo-title"/i, `${page.locale}: interactive demo marketing H2 missing`);
  assert.match(html, /<h2\b[^>]*id="why-applycraft-title"/i, `${page.locale}: product-benefits marketing H2 missing`);
  assert.ok(!headings.includes(page.sampleName), `${page.locale}: sample candidate name must not be a heading`);
  for (const label of page.labels) {
    assert.ok(!headings.includes(label), `${page.locale}: sample resume label must not be a heading: ${label}`);
  }
}

console.log("Homepage heading semantics passed for EN/FR/AR prerendered HTML.");
