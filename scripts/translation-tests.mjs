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
});

assert.equal(original.summary, "Resolved Microsoft Intune, Active Directory, and Jamf Pro incidents.");
assert.equal(copy.name, original.name, "candidate name should be preserved");
assert.equal(copy.email, original.email, "email should be preserved");
assert.equal(copy.phone, original.phone, "phone should be preserved");
assert.equal(copy.linkedin, original.linkedin, "URL should be preserved");
assert.equal(copy.translationMeta.fields.summary.translationStatus, TRANSLATION_STATUSES.aiTranslated);
assert.equal(copy.translationMeta.fields.summary.sourceLanguage, "en");
assert.equal(copy.translationMeta.fields.summary.targetLanguage, "ar");

assert.deepEqual(assertProtectedTermsPreserved(request.content, translated), []);
assert.ok(assertProtectedTermsPreserved(request.content, { summary: "حللت حوادث Intune." }).includes("Microsoft Intune"));

assert.match(app, /setDocumentLanguagePreference[\s\S]{0,500}setDocumentLanguage\(nextCode\)/, "document language change should localize document settings only");
assert.doesNotMatch(app, /setDocumentLanguagePreference[\s\S]{0,700}callAi\("translate-resume"/, "changing document language must not call translation");
assert.match(app, /setTranslationConfirm\(\{ open: true/, "translation must require explicit confirmation");
assert.match(app, /resumes\.upsertResume\(\{ title: copyTitle, data: nextForm \}\)/, "translation should create a separate resume copy");
assert.match(translationSource, /\/api\/translate-document/, "translation must call the dedicated backend endpoint");
assert.doesNotMatch(app, /callAi\("translate-resume"/, "translation must not use the generic frontend AI endpoint");
assert.match(app, /translatedBadge/, "AI translated fields should show a review badge");

console.log("translation tests passed.");
