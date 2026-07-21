#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { localizeRoute } from "../src/seo/localizedRoutes.js";

const root = new URL("../dist/", import.meta.url).pathname;
const pages = [
  { file: "index.html", lang: "en", dir: null },
  { file: "fr/index.html", lang: "fr", dir: null },
  { file: "ar/index.html", lang: "ar", dir: "rtl" },
];
const requiredLinks = [
  "/resume-builder/", "/cover-letter-builder/", "/ats-checker/",
  "/job-tracker/", "/interview-prep/", "/pricing/", "/examples/",
];
const failures = [];

for (const page of pages) {
  const html = readFileSync(join(root, page.file), "utf8");
  const label = page.file;
  const requireMatch = (condition, message) => {
    if (!condition) failures.push(`${label}: ${message}`);
  };

  requireMatch(new RegExp(`<html[^>]*lang="${page.lang}"`, "i").test(html), `missing lang=${page.lang}`);
  if (page.dir) requireMatch(new RegExp(`<html[^>]*dir="${page.dir}"`, "i").test(html), `missing dir=${page.dir}`);
  requireMatch(/<main[^>]+id="main-content"/i.test(html), "missing main landmark");
  requireMatch(/class="ac-hero-grid"/i.test(html), "missing full hero layout");
  requireMatch(/class="ac-hero-preview"/i.test(html), "missing real resume preview");
  requireMatch(/id="interactive-demo-title"/i.test(html), "missing interactive demo introduction");
  requireMatch(/id="why-applycraft-title"/i.test(html), "missing product-benefits section");
  requireMatch((html.match(/<h2\b/gi) || []).length >= 9, "fewer than nine major homepage sections");
  requireMatch((html.match(/<footer\b/gi) || []).length >= 1, "missing footer");
  requireMatch(/>60<\/div>[\s\S]{0,300}Templates/i.test(html) || page.lang !== "en" && />60<\/div>/.test(html),
    "missing official 60-template count");
  requireMatch(/<link[^>]+rel="canonical"/i.test(html), "missing canonical");
  requireMatch((html.match(/hreflang=/gi) || []).length >= 4, "missing hreflang cluster");
  requireMatch(/application\/ld\+json/i.test(html), "missing JSON-LD");
  requireMatch(/<script[^>]+type="module"/i.test(html), "homepage hydration script missing");
  requireMatch(!/\/landing\.js/.test(html), "obsolete static-shell enhancer present");

  for (const href of requiredLinks) {
    const localized = localizeRoute(href, page.lang).replaceAll("&", "&amp;");
    requireMatch(html.includes(`href="${localized}"`),
      `missing crawlable link to ${href}`);
  }
}

if (failures.length) {
  console.error("Homepage integrity FAILED:");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
console.log("Homepage integrity passed: full EN/FR/AR structure, hydration, metadata, 60-template count, and product links are present.");
