import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  assertProtectedTermsPreserved,
  buildResumeTranslationRequest,
  createTranslatedResumeCopy,
  parseTranslationJson,
  postProcessTranslatedResume,
  serializeResumeTranslationContent,
  TRANSLATION_STATUSES,
} from "../src/translation.js";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const translationSource = await readFile(new URL("../src/translation.js", import.meta.url), "utf8");
const translationDevBypassSource = await readFile(new URL("../src/translationDevBypass.js", import.meta.url), "utf8");
const workerSource = await readFile(new URL("../worker.js", import.meta.url), "utf8");

const original = {
  name: "ISAAC BIROUE",
  email: "biroueisaac@gmail.com",
  phone: "+33 773406333",
  linkedin: "https://www.linkedin.com/in/isaac-biroue",
  title: "Service Desk Analyst L2",
  summary: "Resolved Microsoft Intune, Active Directory, and Jamf Pro incidents.",
  experience: "Created user guides for Microsoft 365 and Windows devices.",
  certifications: "RHCSA — Red Hat",
};

const request = buildResumeTranslationRequest(original, {
  sourceLanguage: "en",
  targetLanguage: "ar",
  targetLanguageName: "Arabic",
});

assert.equal(request.type, "resume");
assert.equal(request.targetLanguage, "ar");
assert.equal(request.content.summary, original.summary);
assert.ok(request.rules.some((rule) => /field-by-field/.test(rule)), "translation request should require field-by-field structure preservation");
assert.ok(request.preserveTerms.includes("Microsoft Intune"));
assert.ok(request.preserveTerms.includes("Active Directory"));
assert.ok(request.preserveTerms.includes("Jamf Pro"));
assert.ok(request.preserveTerms.includes("Microsoft 365"));
assert.ok(request.preserveTerms.includes("RHCSA"));
assert.ok(request.preserveTerms.includes("Red Hat"));

const translated = parseTranslationJson(JSON.stringify({
  title: "محلل دعم فني من المستوى الثاني",
  summary: "حللت حوادث Microsoft Intune و Active Directory و Jamf Pro.",
  experience: "أنشأت أدلة مستخدم لأجهزة Microsoft 365 و Windows.",
  certifications: "RHCSA — Red Hat",
  email: "should be ignored",
}));

assert.equal(translated.email, undefined, "contact fields must not be translated");
assert.equal(parseTranslationJson("```json\n{\"summary\":\"Résumé professionnel\"}\n```").summary, "Résumé professionnel");
assert.throws(() => parseTranslationJson("not-json"), /invalid-translation-json/);

const copy = createTranslatedResumeCopy(original, translated, {
  sourceLanguage: "en",
  targetLanguage: "ar",
  targetLanguageName: "Arabic",
  translatedAt: "2026-07-03T00:00:00.000Z",
  sourceVersionId: "original-en",
});

assert.equal(original.summary, "Resolved Microsoft Intune, Active Directory, and Jamf Pro incidents.");
assert.equal(copy.name, original.name, "candidate name should be preserved");
assert.equal(copy.email, original.email, "email should be preserved");
assert.equal(copy.phone, original.phone, "phone should be preserved");
assert.equal(copy.linkedin, original.linkedin, "URL should be preserved");
assert.equal(copy.translationMeta.fields.summary.translationStatus, TRANSLATION_STATUSES.aiTranslated);
assert.equal(copy.translationMeta.fields.summary.sourceLanguage, "en");
assert.equal(copy.translationMeta.fields.summary.targetLanguage, "ar");
assert.equal(copy.translationMeta.sourceVersionId, "original-en");
assert.equal(copy.translationMeta.reviewed, false);

const inEditorResume = {
  name: "Sofia Amrani",
  email: "sofia@example.com",
  title: "Cheffe de projet digital",
  summary: "Pilotage de projets web et coordination des équipes produit.",
  experience: "Lancement d'un portail client avec réduction des délais de traitement.",
  skills: "Gestion de projet, UX, Analytics",
};

const inEditorRequest = buildResumeTranslationRequest(inEditorResume, {
  sourceLanguage: "fr",
  targetLanguage: "en",
  targetLanguageName: "English",
});

assert.equal(inEditorRequest.type, "resume");
assert.equal(inEditorRequest.content.summary, inEditorResume.summary);
assert.equal(inEditorRequest.content.experience, inEditorResume.experience);
assert.equal(inEditorRequest.content.skills, inEditorResume.skills);

const importedEditorState = {
  ...inEditorResume,
  documentLanguage: "fr",
  experience: "<p>Lancement d'un portail client.</p><p>Coordination produit.</p>",
};
const importTimeRequest = buildResumeTranslationRequest(importedEditorState, {
  sourceLanguage: "fr",
  targetLanguage: "en",
  targetLanguageName: "English",
});
const onDemandRequest = buildResumeTranslationRequest(importedEditorState, {
  sourceLanguage: "fr",
  targetLanguage: "en",
  targetLanguageName: "English",
});

assert.deepEqual(onDemandRequest.content, importTimeRequest.content, "import-time and on-demand translation should use the same serializer");
assert.equal(onDemandRequest.content.experience, "Lancement d'un portail client.\nCoordination produit.");
assert.deepEqual(serializeResumeTranslationContent({ summary: "  Bonjour&nbsp; ", experience: "<p>Ligne 1</p><p>Ligne 2</p>" }), {
  summary: "Bonjour",
  experience: "Ligne 1\nLigne 2",
});

const inEditorCopy = createTranslatedResumeCopy(inEditorResume, {
  title: "Digital Project Manager",
  summary: "Led web projects and coordinated product teams.",
  experience: "Launched a client portal that reduced processing time.",
  skills: "Project management, UX, Analytics",
}, {
  sourceLanguage: "fr",
  targetLanguage: "en",
  targetLanguageName: "English",
  translatedAt: "2026-07-03T00:00:00.000Z",
  sourceVersionId: "",
});

assert.equal(inEditorCopy.summary, "Led web projects and coordinated product teams.");
assert.equal(inEditorCopy.translationMeta.fields.summary.translationStatus, TRANSLATION_STATUSES.aiTranslated);
assert.equal(inEditorCopy.translationMeta.targetLanguage, "en");
assert.equal(inEditorCopy.translationMeta.reviewed, false);

const structuredArabic = postProcessTranslatedResume({
  educationEntries: [{
    title: "دبلوم مهندس دولة في المعلوماتية",
    subtitle: "ENSIAS",
    startDate: "2018",
    endDate: "",
    location: "Rabat",
    description: "",
  }],
  experienceEntries: [
    { title: "مهندس برمجيات أول", company: "Groupe OCP", startDate: "Mars 2022", endDate: "", isCurrent: true },
    { title: "مهندس Full Stack", company: "Inwi", startDate: "Janvier 2019", endDate: "Février 2022" },
  ],
}, "ar");

assert.equal(structuredArabic.educationEntries[0].title, "دبلوم مهندس دولة في المعلوماتية");
assert.equal(structuredArabic.educationEntries[0].subtitle, "ENSIAS");
assert.equal(structuredArabic.experienceEntries[0].startDate, "مارس 2022");
assert.equal(structuredArabic.experienceEntries[1].startDate, "يناير 2019");
assert.equal(structuredArabic.experienceEntries[1].endDate, "فبراير 2022");
assert.doesNotMatch(JSON.stringify(structuredArabic), /Mars|Janvier|Février/);

assert.deepEqual(assertProtectedTermsPreserved(request.content, translated), []);
assert.ok(assertProtectedTermsPreserved(request.content, { summary: "حللت حوادث Intune." }).includes("Microsoft Intune"));

assert.match(app, /setDocumentLanguagePreference[\s\S]{0,500}setDocumentLanguage\(nextCode\)/, "document language change should localize document settings only");
assert.doesNotMatch(app, /setDocumentLanguagePreference[\s\S]{0,700}callAi\("translate-resume"/, "changing document language must not call translation");
assert.match(app, /setTranslationConfirm\(\{ open: true/, "translation must require explicit confirmation");
assert.match(app, /setTranslationReview\(\{\s*open: true/, "translation should open a review modal before applying translated content");
const translateCvSource = app.slice(app.indexOf("async function translateCV"), app.indexOf("function scrollToError"));
assert.doesNotMatch(translateCvSource, /if \(langCode === "en"\) return;/, "resume content translation must support English as an on-demand target");
const translateCvBeforeServiceCall = translateCvSource.slice(0, translateCvSource.indexOf("const response = await translateDocumentContent"));
assert.doesNotMatch(translateCvBeforeServiceCall, /setTranslationConfirm\(\{\s*open:\s*false/, "on-demand resume translation must keep the confirmation modal open while loading");
assert.match(translateCvSource, /setTranslating\(true\);[\s\S]{0,1800}const response = await translateDocumentContent/, "on-demand resume translation should show loading before the shared service call");
assert.match(translateCvSource, /setTranslationReview\(\{\s*open: true/, "on-demand resume translation should open the shared diff review modal");
assert.match(translateCvSource, /setTranslationConfirm\(\(current\) => \(\{ \.\.\.current, error: message \}\)\)/, "translation failures should render a modal-local error instead of failing silently");
assert.match(app, /translationConfirm\.error && \([\s\S]{0,220}<div role="alert"/, "translation confirmation modal should expose localized failure text");
assert.match(app, /translationTargetLabel\(translationConfirm\.target\)/, "translation confirmation title should use localized target language names");
assert.doesNotMatch(app, /translateContentButton[\s\S]{0,180}target\?\.native \|\| translationConfirm\.target\?\.name/, "translation confirmation title must not interpolate raw native language names");
assert.doesNotMatch(app, /translateContentButton[\s\S]{0,180}selectedDocumentLang(?:\?|\.)\.native \|\| selectedDocumentLang(?:\?|\.)\.name/, "translation entry point labels must use UI-localized language names");
assert.match(app, /showDocumentLanguageTranslationPrompt/, "changing document labels to a different content language should surface an explicit translation prompt");
assert.match(app, /documentLanguageContentPrompt/, "document-language mismatch prompt should use localized copy");
assert.match(app, /resumeTranslationLanguageSample\(sourceForm\)/, "translation source language should be detected from resume content, not only document labels");
assert.match(app, /resumes\.upsertResume\(\{ title: copyTitle, data: nextForm \}\)/, "translation should create a separate resume copy");
assert.match(app, /sourceVersionId: sourceId/, "translated resume copies should retain their source version id");
assert.match(app, /setCurrentResumeId\(newId\)/, "editor should switch to the translated resume version after acceptance");
assert.match(app, /reviewedTranslationBadge/, "reviewed translations should show a reviewed badge");
assert.match(app, /versionLabel/, "builder should expose a resume version selector");
assert.match(app, /translatePartial/, "partial translations should show a safe warning");
assert.match(app, /TRANSLATION_USAGE_KEY = "ac_translation_usage"/, "free translation usage should be stored locally");
assert.match(app, /translationLimitReached/, "translation limit reached state should be enforced");
assert.match(app, /TRANSLATION_DEV_BYPASS_HASH = import\.meta\.env\.VITE_DEV_BYPASS/, "developer bypass should require a build-time env flag");
assert.match(app, /import\("\.\/translationDevBypass\.js"\)/, "developer bypass code should be loaded dynamically only when configured");
assert.match(app, /translationDevBypass\.active/, "developer bypass should explicitly gate the client-side translation limit");
assert.match(translationSource, /devBypassToken/, "translation API helper should accept a developer bypass token");
assert.match(translationDevBypassSource, /X-AC-Trace/, "developer bypass token should be sent only through the dedicated dev header");
assert.match(translationDevBypassSource, /__actdiag/, "developer console activator should stay isolated in the dev bypass module");
assert.match(app, /activeTranslatedToSelected/, "same-language translated resumes should disable normal translation");
assert.match(app, /alreadyTranslatedTo/, "already translated state should be shown in the UI");
assert.match(app, /retranslateFromOriginal/, "translated versions should offer deliberate retranslation from original");
assert.match(app, /findExistingTranslatedVersion/, "existing translated versions should be detected");
assert.match(app, /openExistingTranslation/, "duplicate translation flow should prefer opening the existing version");
assert.match(app, /function mergeTranslatedEntries/, "translated sections should be merged into original entry structure");
assert.match(app, /parsed\.length < original\.length/, "missing translated entries should fall back to original sections");
assert.match(app, /labelKeys: \{ title: "degree", subtitle: "institution"/, "education entry title should be the degree, not the institution");
assert.match(app, /title: e\.degree \|\| "", titleUrl: "", subtitle: e\.school \|\| ""/, "import should hydrate education title from degree and institution from school");
assert.match(app, /setImportLanguageNotice\(\{ open: false, detected: "", previous: "" \}\);[\s\S]{0,120}setMobileResumeMode\("edit"\)/, "accepting translated copy should dismiss the stale untranslated import banner");
assert.match(app, /preservedSections/, "translation metadata should track preserved original sections");
assert.match(app, /translateSectionsPartial/, "users should be warned when sections are kept from the original");
assert.match(app, /EVENTS\.TRANSLATION_STARTED/, "translation analytics should track safe metadata only");
assert.match(app, /EVENTS\.TRANSLATION_COPY_CREATED/, "copy-created analytics should track safe metadata only");
assert.match(translationSource, /\/api\/translate-document/, "translation must call the dedicated backend endpoint");
assert.match(translationSource, /title stays title, institution\/school stays institution\/school/, "translation rules must preserve education field mapping");
assert.match(translationSource, /translation_limit_reached/, "frontend should handle worker translation limits");
assert.match(translationSource, /class TranslationRequestError/, "translation helper should preserve API status and error codes");
assert.match(workerSource, /translation_upstream_failed/, "worker should distinguish upstream failures from quota and network failures");
assert.match(app, /translationErrorMessage/, "builder should map translation failures to specific localized messages");
assert.match(app, /serializeResumeTranslationContent\(form\)/, "builder should use the shared serializer for on-demand translation state");
assert.doesNotMatch(app, /callAi\("translate-resume"/, "translation must not use the generic frontend AI endpoint");
assert.match(app, /translatedBadge/, "AI translated fields should show a review badge");
assert.match(app, /bu\.acceptTranslation/, "review modal should use explicit translated-copy action copy");

console.log("translation tests passed.");
