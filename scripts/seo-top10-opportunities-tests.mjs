import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = route => readFileSync(`public${route}index.html`, "utf8");
const pages = {
  teacher: read("/blog/teacher-resume-skills-achievements/"),
  summary: read("/blog/student-resume-summary-examples/"),
  noExperience: read("/blog/student-resume-no-experience/"),
  teacherExample: read("/examples/teacher-resume/"),
  templatesMeta: readFileSync("vite.config.js", "utf8"),
  maroc: read("/fr/blog/exemple-cv-maroc/"),
};
for (const [name, html] of Object.entries(pages).filter(([name]) => !["templatesMeta"].includes(name))) {
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name}: exactly one H1`);
  assert.match(html, /rel="canonical" href="https:\/\/applycraft\.io\//, `${name}: canonical`);
}
assert.match(pages.teacher, /Teacher Resume Skills and How to Prove Them/);
assert.match(pages.teacher, /"@type":"BlogPosting"/);
assert.match(pages.teacher, /"@type":"FAQPage"/);
assert.match(pages.teacher, /\/resume\/templates\//);
assert.match(pages.teacherExample, /skills to include on a teacher resume/);
assert.match(pages.summary, /What is a good resume summary for a student\?/);
assert.match(pages.summary, /\/blog\/student-resume-no-experience\//);
assert.match(pages.noExperience, /Complete fictional student resume example/);
assert.match(pages.noExperience, /\/blog\/student-resume-summary-examples\//);
assert.match(pages.noExperience, /\/student-resume-builder\//);
assert.match(pages.templatesMeta, /60 Free Resume Templates/);
assert.match(pages.maroc, /href="\/fr\/"/);
const intents = JSON.parse(readFileSync("public/seo-intent-registry.json", "utf8"));
for (const route of ["/blog/teacher-resume-skills-achievements/","/blog/student-resume-summary-examples/","/blog/student-resume-no-experience/"]) assert.ok(intents.pages.some(page => page.route === route), `${route}: intent registered`);
console.log("SEO Top-10 opportunity tests passed: distinct intents, content, canonical URLs, schema and cluster links are present.");
