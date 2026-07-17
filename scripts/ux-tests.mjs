import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const templateRegistry = await readFile(new URL("../src/documents/templateRegistry.js", import.meta.url), "utf8");
const landing = await readFile(new URL("../src/i18n/namespaces/en/landing.js", import.meta.url), "utf8");
const landing2 = await readFile(new URL("../src/i18n/namespaces/en/landing2.js", import.meta.url), "utf8");
const common = await readFile(new URL("../src/i18n/namespaces/en/common.js", import.meta.url), "utf8");
const builder = await readFile(new URL("../src/i18n/namespaces/en/builder.js", import.meta.url), "utf8");
const entryEn = await readFile(new URL("../src/i18n/namespaces/en/entry.js", import.meta.url), "utf8");
const entryFr = await readFile(new URL("../src/i18n/namespaces/fr/entry.js", import.meta.url), "utf8");
const entryAr = await readFile(new URL("../src/i18n/namespaces/ar/entry.js", import.meta.url), "utf8");
const starterContent = await readFile(new URL("../src/data/resumeStarters/starterContent.js", import.meta.url), "utf8");
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

assert.match(landing, /Create my resume/, "homepage needs a specific primary CTA");
assert.match(landing, /Check my existing resume/, "homepage needs a specific secondary CTA");
// The hero must lead with what sets ApplyCraft apart from generic builders —
// the FR/EN/AR multilingual support — while still naming the product category.
assert.match(landing, /The resume builder that speaks your language/, "homepage hero should lead with the multilingual differentiator");
assert.match(landing, /English, French and Arabic/, "homepage hero should name the three supported languages");
assert.match(app, /startResume\("hero_primary"\)/, "hero CTA should use the fast-start resume path");
assert.match(templateRegistry, /RECOMMENDED_TEMPLATE_ID = "modern"/, "resume flow should preselect a recommended template");
assert.match(builder, /Use template/, "template selector should expose a clear use action");
assert.match(builder, /Recommended/, "template selector should call out the default");
assert.match(app, /mobileResumeMode/, "mobile edit and preview modes should be explicit");
assert.match(builder, /Download your résumé before closing this page/, "editor should warn that document content is not autosaved");
assert.match(app, /clearApplyCraftLocalData/, "app should clear old sensitive document storage keys");
assert.match(app, /beforeunload/, "app should warn before closing with unsaved document content");
assert.doesNotMatch(app, /localStorage\.setItem\("ac_resume_draft"/, "resume drafts should not be autosaved locally");
assert.doesNotMatch(app, /localStorage\.getItem\("ac_resume_draft"/, "resume drafts should not be restored locally");
assert.match(common, /Download PDF/, "PDF export should remain obvious");
assert.match(common, /Download DOCX/, "DOCX export should remain obvious");
assert.match(landing2, /write content in any language/i, "multilingual claim should be accurate");
assert.match(app, /UX_MEASUREMENT_ENABLED = false/, "privacy-preserving measurement must be disabled by default");
assert.doesNotMatch(app, /from ["'](?:@?fullstory|hotjar|mixpanel|amplitude)|https?:\/\/[^"']*(?:fullstory|hotjar|mixpanel|amplitude|google-analytics)|gtag\(/i, "no invasive analytics should be added");
assert.ok(pkg.scripts["test:ux"], "package.json should expose npm run test:ux");
assert.match(app, /function SectionCard\([^)]*builderText = \(key\) => key/, "section menus should receive a safe builderText helper");
assert.match(app, /builderText=\{builderText\}/, "section menu translation helper should be passed from the builder component");
assert.match(app, /currentRoleId/, "experience editor should expose a current-role checkbox");
assert.match(app, /isCurrent: e\.target\.checked/, "current-role checkbox should update structured experience data");
assert.match(entryEn, /I currently work here/, "English current-role label missing");
assert.match(entryFr, /J’occupe actuellement ce poste/, "French current-role label missing");
assert.match(entryAr, /ما زلت أعمل هنا حاليًا/, "Arabic current-role label missing");
assert.match(starterContent, /isCurrent: true/, "starter data should use isCurrent for ongoing jobs");
assert.doesNotMatch(starterContent, /endDate: "(?:Present|Présent|الحاضر|حتى الآن)"/, "starter endDate fields should not store localized present labels");

console.log("UX tests passed.");
