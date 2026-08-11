import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

await import("./apply-gsc-top10-seo.mjs");

const ROOT = process.cwd();
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

function expectContains(html, needle, label) {
  assert.ok(html.includes(needle), `${label}: expected ${JSON.stringify(needle)}`);
}

function expectCanonical(html, canonical, label) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  assert.ok(match, `${label}: canonical link missing`);
  assert.equal(match[1], canonical, `${label}: unexpected canonical`);
}

function expectIndexable(html, label) {
  assert.ok(!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html), `${label}: must remain indexable`);
}

const teacher = read("public/blog/teacher-resume-skills-achievements/index.html");
const teacherDocument = new JSDOM(teacher).window.document;
expectContains(teacher, "<title>Teacher Resume Skills: Examples & Achievements | ApplyCraft</title>", "teacher title");
expectContains(teacher, "Teacher Resume Skills: How to List Them With Examples", "teacher H1");
expectContains(teacher, 'data-gsc-seo="teacher-direct-answer"', "teacher direct answer");
expectContains(teacher, 'data-gsc-seo="teacher-skills-evidence"', "teacher evidence table");
expectContains(teacher, 'data-gsc-seo="teacher-role-examples"', "teacher role examples");
expectContains(teacher, 'data-gsc-seo="teacher-new-experience"', "teacher limited-experience guidance");
expectContains(teacher, 'data-gsc-seo="teacher-achievement-examples"', "teacher achievement examples");
expectContains(teacher, 'id="best-teacher-skills"', "teacher skills jump target");
expectContains(teacher, 'id="teacher-contexts"', "teacher contexts jump target");
expectContains(teacher, 'id="achievement-examples"', "teacher achievements jump target");
expectContains(teacher, 'href="/examples/teacher-resume/"', "teacher example link");
expectContains(teacher, 'href="/resume-builder/"', "teacher builder link");
expectContains(teacher, 'href="/resume/templates/"', "teacher templates link");
expectContains(teacher, 'href="/ats-checker/"', "teacher ATS checker link");
expectCanonical(teacher, "https://applycraft.io/blog/teacher-resume-skills-achievements/", "teacher");
expectIndexable(teacher, "teacher");
assert.equal(teacherDocument.querySelectorAll("h1").length, 1, "teacher must have one H1");
assert.ok(!teacher.includes("60+"), "teacher must not claim 60+ templates");
assert.ok(!/guarante(?:e|ed|es)[^<]{0,40}(?:ATS|interview|job|hire)/i.test(teacher), "teacher must not promise an ATS or hiring outcome");
assert.ok(!/href=["'][^"']*(?:ui|docLang|template|country)=/i.test(teacher), "teacher internal links must not contain presentation parameters");
const teacherHeadings = [...teacherDocument.querySelectorAll("h1, h2, h3")]
  .map((heading) => heading.textContent.trim().toLowerCase());
assert.equal(new Set(teacherHeadings).size, teacherHeadings.length, "teacher must not contain duplicate H1-H3 headings");
const teacherSchemas = [...teacherDocument.querySelectorAll('script[type="application/ld+json"]')]
  .map((script) => JSON.parse(script.textContent));
const teacherArticle = teacherSchemas.find((schema) => [schema["@type"]].flat().some((type) => ["Article", "BlogPosting"].includes(type)));
assert.ok(teacherArticle, "teacher Article schema missing");
assert.equal(teacherArticle.datePublished, "2026-07-26", "teacher publication date must remain unchanged");
assert.equal(teacherArticle.dateModified, "2026-08-11", "teacher modification date must match the substantive update");
assert.equal(teacherArticle.mainEntityOfPage, "https://applycraft.io/blog/teacher-resume-skills-achievements/", "teacher schema canonical mismatch");
assert.ok(!teacher.includes("Teacher Resume Skills and Achievements That Stand | ApplyCraft"), "teacher title must not use the old truncation");

const teacherExample = read("public/examples/teacher-resume/index.html");
expectContains(teacherExample, 'data-gsc-seo="teacher-example-backlink"', "teacher example backlink block");
expectContains(teacherExample, 'href="/blog/teacher-resume-skills-achievements/"', "teacher example backlink");

const studentSummary = read("public/blog/student-resume-summary-examples/index.html");
expectContains(studentSummary, "<title>Student Resume Summary Examples | ApplyCraft</title>", "student summary title");
expectContains(studentSummary, "Student Resume Summary Examples: 25 Strong Profiles", "student summary H1");
expectContains(studentSummary, 'data-gsc-seo="student-summary-direct-answer"', "student summary direct answer");
expectContains(studentSummary, 'data-gsc-seo="student-summary-before-after"', "student summary before/after");
expectContains(studentSummary, 'href="/blog/student-resume-no-experience/"', "student summary reciprocal link");
expectCanonical(studentSummary, "https://applycraft.io/blog/student-resume-summary-examples/", "student summary");
expectIndexable(studentSummary, "student summary");

const studentNoExperience = read("public/blog/student-resume-no-experience/index.html");
expectContains(studentNoExperience, "<title>Student Resume With No Experience | ApplyCraft</title>", "student no-experience title");
expectContains(studentNoExperience, "How to Write a Student Resume With No Experience", "student no-experience H1");
expectContains(studentNoExperience, 'data-gsc-seo="student-complete-example"', "student complete example");
expectContains(studentNoExperience, 'data-gsc-seo="student-skills-evidence"', "student evidence table");
expectContains(studentNoExperience, 'href="/blog/student-resume-summary-examples/"', "student no-experience reciprocal link");
expectContains(studentNoExperience, 'href="/student-resume-builder/"', "student builder link");
expectCanonical(studentNoExperience, "https://applycraft.io/blog/student-resume-no-experience/", "student no experience");
expectIndexable(studentNoExperience, "student no experience");

const studentBuilder = read("public/student-resume-builder/index.html");
expectContains(studentBuilder, 'data-gsc-seo="student-builder-guides"', "student builder guides");
expectContains(studentBuilder, 'href="/blog/student-resume-summary-examples/"', "student builder summary link");
expectContains(studentBuilder, 'href="/blog/student-resume-no-experience/"', "student builder no-experience link");

const freeBuilder = read("public/free-resume-builder/index.html");
expectContains(freeBuilder, 'data-gsc-seo="free-builder-resources"', "free builder resources");
expectContains(freeBuilder, 'href="/resume/templates/"', "free builder templates link");
expectContains(freeBuilder, 'href="/blog/teacher-resume-skills-achievements/"', "free builder teacher link");

const cvMaroc = read("public/fr/blog/exemple-cv-maroc/index.html");
expectContains(cvMaroc, 'data-gsc-seo="cv-maroc-cluster"', "CV Maroc cluster");
for (const route of [
  "/fr/",
  "/fr/creer-cv-gratuit/",
  "/fr/blog/lettre-de-motivation-maroc/",
  "/fr/blog/cv-canadien-maroc/",
  "/fr/blog/cv-etudiant-sans-experience-exemples/",
]) {
  expectContains(cvMaroc, `href="${route}"`, `CV Maroc link ${route}`);
}
expectIndexable(cvMaroc, "CV Maroc");

const intents = JSON.parse(read("scripts/seo-content-intents.json"));
const intentsByRoute = new Map(intents.map((entry) => [entry.route, entry]));
for (const [route, keyword] of [
  ["/blog/teacher-resume-skills-achievements/", "teacher resume skills"],
  ["/blog/student-resume-summary-examples/", "student resume summary"],
  ["/blog/student-resume-no-experience/", "student resume no experience"],
  ["/resume/templates/", "resume templates"],
  ["/free-resume-builder/", "free resume builder"],
  ["/fr/blog/exemple-cv-maroc/", "exemple CV Maroc"],
]) {
  assert.equal(intentsByRoute.get(route)?.primaryKeyword, keyword, `intent map mismatch for ${route}`);
}
assert.notEqual(
  intentsByRoute.get("/blog/student-resume-summary-examples/")?.primaryIntent,
  intentsByRoute.get("/blog/student-resume-no-experience/")?.primaryIntent,
  "student summary and no-experience pages must keep distinct search intents",
);

const sitemapPath = path.join(ROOT, "public/sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  assert.ok(!/[?&](?:ui|docLang|template|country)=/i.test(sitemap), "sitemap must not contain UI/document/template query variants");
  for (const route of [
    "/blog/teacher-resume-skills-achievements/",
    "/blog/student-resume-summary-examples/",
    "/blog/student-resume-no-experience/",
    "/resume/templates/",
    "/free-resume-builder/",
    "/fr/blog/exemple-cv-maroc/",
  ]) {
    expectContains(sitemap, `https://applycraft.io${route}`, `sitemap ${route}`);
  }
}

console.log("GSC Top-10 SEO opportunity checks passed.");
