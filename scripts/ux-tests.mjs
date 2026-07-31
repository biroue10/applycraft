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
const siteChrome = await readFile(new URL("../src/siteChrome.jsx", import.meta.url), "utf8");
const navbarCss = await readFile(new URL("../public/app-navbar.css", import.meta.url), "utf8");

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
assert.match(app, /const \[tplFilter, setTplFilter\] = useState\("all"\)/,
  "template gallery should select the All filter by default");
assert.match(app, /Math\.max\(0, 24 - currentItemCount\)/,
  "template thumbnails should use dense one-page demo content");
assert.match(app, /no real builder\/export data is/,
  "thumbnail enrichment must remain isolated from real resume data");
assert.match(app, /const layoutId = template\.variant \|\| template\.id/,
  "the default All view should collapse visually duplicate template variants");
assert.match(app, /aspectRatio: "210 \/ 297", background: "#fff"[\s\S]*overflow: "hidden"/,
  "template thumbnail frames should remain white and clip document overflow");
assert.match(app, /ACCOUNTS_ENABLED && !currentUser[\s\S]*setSaveProfileReturnTo\(routeWithParam\("\/resume-builder\/"/,
  "choosing a template while signed out should open authentication with the selected template as destination");
assert.match(app, /maxWidth: 1480/, "template gallery should give resume previews more horizontal space");
assert.match(app, /minmax\(min\(100%, 390px\), 1fr\)/, "template cards should remain large in the responsive gallery");
assert.match(app, /mobileResumeMode/, "mobile edit and preview modes should be explicit");
assert.match(builder, /Draft saved on this device/, "editor should accurately describe local draft autosave");
assert.match(app, /clearApplyCraftLocalData/, "app should clear old sensitive document storage keys");
assert.match(app, /beforeunload/, "app should warn before closing with unsaved document content");
assert.match(app, /meaningfulDraft\(form\) && !draftPersistedRef\.current/, "beforeunload should ignore untouched/default resume data");
assert.match(app, /\[form, coverForm, draftState\]/, "beforeunload should be removed as soon as autosave completes");
assert.match(app, /resumeDraft\.js/, "resume drafts should use the validated local persistence module");
assert.match(app, /initialResumeDraft/, "resume drafts should restore synchronously before editor render");
assert.match(common, /Download PDF/, "PDF export should remain obvious");
assert.match(common, /Download DOCX/, "DOCX export should remain obvious");
assert.match(landing2, /write content in any language/i, "multilingual claim should be accurate");
assert.match(app, /UX_MEASUREMENT_ENABLED = false/, "privacy-preserving measurement must be disabled by default");
assert.doesNotMatch(app, /from ["'](?:@?fullstory|hotjar|mixpanel|amplitude)|https?:\/\/[^"']*(?:fullstory|hotjar|mixpanel|amplitude|google-analytics)|gtag\(/i, "no invasive analytics should be added");
assert.ok(pkg.scripts["test:ux"], "package.json should expose npm run test:ux");
assert.ok(pkg.scripts["test:responsive-layout"], "package.json should expose the responsive layout regression suite");
assert.match(navbarCss, /max-width:1680px/, "navbar should enter compact mode before long French labels clip");
assert.match(navbarCss, /max-width:1240px/, "navbar should enter hamburger mode at the measured content breakpoint");
assert.match(siteChrome, /ac-mobile-menu-cta/, "narrow mobile navigation must retain the primary CTA");
assert.match(navbarCss, /aria-current=page/, "navbar CSS should expose one route-driven active-state contract");
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
