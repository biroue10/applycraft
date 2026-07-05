import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  assertProtectedTermsPreserved,
  buildResumeTranslationRequest,
  createTranslatedResumeCopy,
  parseTranslationJson,
  TRANSLATION_STATUSES,
} from "../src/translation.js";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const translationSource = await readFile(new URL("../src/translation.js", import.meta.url), "utf8");
const translationDevBypassSource = await readFile(new URL("../src/translationDevBypass.js", import.meta.url), "utf8");

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

assert.deepEqual(assertProtectedTermsPreserved(request.content, translated), []);
assert.ok(assertProtectedTermsPreserved(request.content, { summary: "حللت حوادث Intune." }).includes("Microsoft Intune"));

assert.match(app, /setDocumentLanguagePreference[\s\S]{0,500}setDocumentLanguage\(nextCode\)/, "document language change should localize document settings only");
assert.doesNotMatch(app, /setDocumentLanguagePreference[\s\S]{0,700}callAi\("translate-resume"/, "changing document language must not call translation");
assert.match(app, /setTranslationConfirm\(\{ open: true/, "translation must require explicit confirmation");
assert.match(app, /setTranslationReview\(\{\s*open: true/, "translation should open a review modal before applying translated content");
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
assert.match(app, /preservedSections/, "translation metadata should track preserved original sections");
assert.match(app, /translateSectionsPartial/, "users should be warned when sections are kept from the original");
assert.match(app, /EVENTS\.TRANSLATION_STARTED/, "translation analytics should track safe metadata only");
assert.match(app, /EVENTS\.TRANSLATION_COPY_CREATED/, "copy-created analytics should track safe metadata only");
assert.match(translationSource, /\/api\/translate-document/, "translation must call the dedicated backend endpoint");
assert.match(translationSource, /translation_limit_reached/, "frontend should handle worker translation limits");
assert.doesNotMatch(app, /callAi\("translate-resume"/, "translation must not use the generic frontend AI endpoint");
assert.match(app, /translatedBadge/, "AI translated fields should show a review badge");
assert.match(app, /bu\.acceptTranslation/, "review modal should use explicit translated-copy action copy");

console.log("translation tests passed.");
