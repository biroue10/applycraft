import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createTranslator } from "../src/i18n/helpers.js";
import { resources } from "../src/i18n/index.js";
import {
  DEFAULT_LANG,
  DOCUMENT_LANG_KEY,
  INTERFACE_LANG_KEY,
  LANGUAGE_SCHEMA_VERSION,
  LANGUAGE_SCHEMA_VERSION_KEY,
  LEGACY_SITE_LANG_KEY,
  INTERFACE_LANGUAGE_METADATA,
  isRtlLang,
  migratePreferences,
} from "../src/i18n/languages.js";
import { localizedLanguageHref } from "../src/seo/localizedRoutes.js";
import { sectionLabel } from "../src/i18n/documentLabels.js";
import { formatDateRange, normalizeDateRange } from "../src/resumeQuality.js";
import { EVENTS } from "../src/analytics.js";
import consentEn from "../src/i18n/namespaces/en/consent.js";
import consentFr from "../src/i18n/namespaces/fr/consent.js";
import consentAr from "../src/i18n/namespaces/ar/consent.js";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const analytics = await readFile(new URL("../src/analytics.js", import.meta.url), "utf8");
const consentAssetSource = await readFile(new URL("./generate-consent-asset.mjs", import.meta.url), "utf8");

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    console.error(`  fail ${name}`);
    throw error;
  }
}

test("translation fallback, missing key, interpolation, plural, and namespaces work", () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    const testResources = {
      en: {
        common: {
          hello: "Hello {name}",
          files: { one: "{count} file", other: "{count} files" },
        },
        builder: { save: "Save" },
      },
      fr: { common: { hello: "Bonjour {name}" } },
      ar: { common: {} },
    };
    const translate = createTranslator(testResources, { dev: true });
    assert.equal(translate({ language: "fr", namespace: "common", key: "hello", values: { name: "Sam" } }), "Bonjour Sam");
    assert.equal(translate({ language: "fr", namespace: "common", key: "files", count: 2 }), "2 files");
    assert.equal(translate({ language: "ar", namespace: "builder", key: "save" }), "Save");
    assert.equal(translate({ language: "fr", namespace: "missing", key: "unknown" }), "unknown");
    assert.ok(warnings.some((message) => message.includes("Missing translation key: missing.unknown for language fr")));
  } finally {
    console.warn = originalWarn;
  }
});

test("missing production translations fall back safely without crashing", () => {
  const translate = createTranslator(resources, { dev: false });
  assert.equal(
    translate({ language: "fr", namespace: "common", key: "definitelyMissingKey" }),
    "definitelyMissingKey"
  );
  assert.equal(
    translate({ language: "zz", namespace: "builder", key: "exportBtn" }),
    resources.en.builder.exportBtn
  );
});

test("production namespaces resolve for English, French, and Arabic", () => {
  for (const language of ["en", "fr", "ar"]) {
    assert.equal(typeof resources[language]?.common?.dlPdf, "string", `${language}.common.dlPdf missing`);
    assert.equal(typeof resources[language]?.builder?.documentLanguage, "string", `${language}.builder.documentLanguage missing`);
    assert.equal(typeof resources[language]?.status?.pdfFail, "string", `${language}.status.pdfFail missing`);
  }
});

test("cookie consent follows interface language with localized legal links and RTL", () => {
  assert.equal(consentEn.title, "Cookie preferences");
  assert.equal(consentFr.title, "Préférences de cookies");
  assert.equal(consentAr.title, "تفضيلات ملفات تعريف الارتباط");
  for (const dictionary of [consentEn, consentFr, consentAr]) {
    for (const key of ["body", "accept", "reject", "manage", "save", "essential", "analytics", "privacyLink", "cookiePolicyLink"]) {
      assert.equal(typeof dictionary[key], "string", `consent.${key} missing`);
    }
  }
  assert.match(consentAssetSource, /data-ac-interface-language/);
  assert.doesNotMatch(consentAssetSource, /documentLanguage/);
  assert.match(consentAssetSource, /new MutationObserver/);
  assert.match(consentAssetSource, /code === "fr"/);
  assert.match(consentAssetSource, /RTL_LANGS\.indexOf\(interfaceLang\(\)\)/);
  assert.match(consentAssetSource, /event\.key === "Escape"/);
  assert.match(consentAssetSource, /show\(true\)/);
  assert.match(consentAssetSource, /event\.key === "Tab"/);
});

test("interface language switcher metadata has stable local flags and safe routes", () => {
  assert.deepEqual(Object.keys(INTERFACE_LANGUAGE_METADATA), ["en", "fr", "ar"]);
  for (const [code, language] of Object.entries(INTERFACE_LANGUAGE_METADATA)) {
    assert.equal(language.code, code);
    assert.match(language.flagSrc, /^\/assets\/flags\/[a-z]{2}\.svg$/);
    assert.ok(language.native);
    assert.ok(language.displayCode);
  }
  assert.equal(localizedLanguageHref("/", "fr"), "/fr/");
  assert.equal(localizedLanguageHref("/fr/", "en"), "/");
  assert.equal(localizedLanguageHref("/fr/", "ar"), "/ar/");
  assert.equal(localizedLanguageHref("/fr/blog/exemple-cv-maroc/", "ar"), "/ar/");
});

test("language migration keeps interface and document languages independent", () => {
  assert.deepEqual(migratePreferences({ [LEGACY_SITE_LANG_KEY]: "fr" }).writes, {
    [INTERFACE_LANG_KEY]: "fr",
    [DOCUMENT_LANG_KEY]: "fr",
    [LANGUAGE_SCHEMA_VERSION_KEY]: LANGUAGE_SCHEMA_VERSION,
  });
  assert.equal(migratePreferences({ [LEGACY_SITE_LANG_KEY]: "1234" }).interface, DEFAULT_LANG);
  assert.equal(migratePreferences({ [LEGACY_SITE_LANG_KEY]: "1234" }).document, DEFAULT_LANG);
  const existing = migratePreferences({
    [LEGACY_SITE_LANG_KEY]: "fr",
    [INTERFACE_LANG_KEY]: "ar",
    [DOCUMENT_LANG_KEY]: "en",
  });
  assert.equal(existing.interface, "ar");
  assert.equal(existing.document, "en");
  assert.equal(existing.keptForRollback, LEGACY_SITE_LANG_KEY);
});

test("direction can differ between application root and document preview", () => {
  const cases = [
    ["en", "ar", "ltr", "rtl"],
    ["ar", "en", "rtl", "ltr"],
    ["fr", "ar", "ltr", "rtl"],
    ["ar", "ar", "rtl", "rtl"],
  ];
  for (const [interfaceLanguage, documentLanguage, interfaceDirection, documentDirection] of cases) {
    assert.equal(isRtlLang(interfaceLanguage) ? "rtl" : "ltr", interfaceDirection);
    assert.equal(isRtlLang(documentLanguage) ? "rtl" : "ltr", documentDirection);
  }
  assert.match(app, /document\.documentElement\.lang = interfaceLanguage/);
  assert.match(app, /dir=\{documentRtl \? "rtl" : "ltr"\}/);
});

test("English, French, and Arabic UI namespaces do not leak common interface strings from other languages", () => {
  const namespaces = ["common", "account", "landing", "builder", "cover", "ats", "tracker", "master", "status", "modal", "landing2", "footer"];
  const flatten = (value) => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
    return [];
  };
  const textFor = (language) => namespaces.flatMap((namespace) => flatten(resources[language][namespace])).join("\n");
  const leakChecks = {
    en: [/Aucune inscription/i, /Enregistrer/i, /Télécharger/i, /Créer mon CV/i, /Erreur/i, /Paramètres/i, /Exportation/i, /Modèle de CV/i, /جارٍ/, /خطأ/, /تنزيل/],
    fr: [/No sign-up required/i, /Save or export/i, /Continue with this resume/i, /Try a sample profile/i, /Reset demo/i, /Resume template/i, /Accent color/i, /\bSelected\b/i, /\bDownload\b/i, /\bExporting\b/i, /Create my resume/i, /\bSettings\b/i, /\bTry again\b/i, /\bSaved\b/],
    ar: [/No sign-up required/i, /Save or export/i, /Continue with this resume/i, /Try a sample profile/i, /Reset demo/i, /Resume template/i, /Accent color/i, /\bSelected\b/i, /\bDownload\b/i, /\bExporting\b/i, /Create my resume/i, /\bSettings\b/i, /Aucune inscription/i, /Erreur/i, /Télécharger/i, /Créer mon CV/i, /Paramètres/i],
  };
  for (const [language, patterns] of Object.entries(leakChecks)) {
    const text = textFor(language);
    for (const pattern of patterns) {
      assert.doesNotMatch(text, pattern, `${language} UI leaked ${pattern}`);
    }
  }
});

test("interactive demo interface copy is translated through landing2 instead of JSX literals", () => {
  for (const language of ["en", "fr", "ar"]) {
    for (const key of [
      "continueResume",
      "noSignupSaveExport",
      "trySampleProfile",
      "resetDemo",
      "resumeTemplate",
      "accentColor",
      "language",
      "atsFriendly",
      "selected",
    ]) {
      assert.equal(typeof resources[language]?.landing2?.demo?.[key], "string", `${language}.landing2.demo.${key} missing`);
    }
  }
  assert.doesNotMatch(app, />\s*No sign-up required to start\. Save or export when ready\.\s*</);
  assert.doesNotMatch(app, />\s*Continue with this resume\s*</);
  assert.doesNotMatch(app, />\s*Try a sample profile\s*</);
  assert.doesNotMatch(app, />\s*Reset demo\s*</);
  assert.doesNotMatch(app, />\s*Resume template\s*</);
  assert.doesNotMatch(app, />\s*Accent color\s*</);
});

test("document section labels localize and fall back safely", () => {
  assert.equal(sectionLabel("en", "experience"), "Work Experience");
  assert.equal(sectionLabel("fr", "experience"), "Expérience professionnelle");
  assert.equal(sectionLabel("ar", "experience"), "الخبرة العملية");
  assert.equal(sectionLabel("zz", "experience"), "Work Experience");
  assert.equal(sectionLabel("ar", "notASection"), "notASection");
});

test("current experience date ranges localize by document language", () => {
  assert.equal(formatDateRange({ startDate: "2020", endDate: "", isCurrent: true, language: "en" }), "2020 – Present");
  assert.equal(formatDateRange({ startDate: "2020", endDate: "", isCurrent: true, language: "fr" }), "2020 – Présent");
  assert.equal(formatDateRange({ startDate: "2020", endDate: "", isCurrent: true, language: "ar" }), "2020 – حتى الآن");
  assert.equal(normalizeDateRange("2020 – Present", "fr"), "2020 – Présent");
  assert.equal(normalizeDateRange("2020 – Present", "ar"), "2020 – حتى الآن");
});

test("custom section label behavior is present and protected", () => {
  assert.match(app, /sectionTitles/);
  assert.match(app, /heading !== defaultHeading/);
  assert.match(app, /restoreDefaultLabel/);
  assert.match(app, /delete nextTitles\[key\]/);
  assert.match(app, /headingOf = \(key, def\) => \(form\.sectionTitles && form\.sectionTitles\[key\]\) \|\| def/);
});

test("analytics whitelist contains multilingual events only with safe scalar props", () => {
  for (const event of [
    "INTERFACE_LANGUAGE_SELECTED",
    "DOCUMENT_LANGUAGE_SELECTED",
    "RTL_INTERFACE_ENABLED",
    "RTL_DOCUMENT_ENABLED",
    "MULTILINGUAL_RESUME_EXPORTED",
    "MULTILINGUAL_COVER_LETTER_EXPORTED",
    "PDF_EXPORT_STARTED",
    "PDF_EXPORT_COMPLETED",
    "PDF_EXPORT_FAILED",
    "DOCX_EXPORT_STARTED",
    "DOCX_EXPORT_COMPLETED",
    "DOCX_EXPORT_FAILED",
    "TRANSLATION_STARTED",
    "TRANSLATION_COPY_CREATED",
    "DOCUMENT_AUTOSAVE_DISABLED",
    "BEFOREUNLOAD_WARNING_SHOWN",
  ]) {
    assert.equal(typeof EVENTS[event], "string", `${event} missing`);
  }
  assert.match(analytics, /Object\.entries\(props\)\.filter/);
  assert.doesNotMatch(app, /track\([^)]*(?:name|email|phone|address|summary|experience|education|coverText|jobDescription)\b/i);
});

test("direct RTL PDF export avoids popup print flow and preserves visual metadata", () => {
  assert.doesNotMatch(app, /document\.write|insertAdjacentHTML|dangerouslySetInnerHTML|\.innerHTML\s*=/);
  assert.doesNotMatch(app, /window\.open\(/);
  assert.doesNotMatch(app, /about:blank|Open print dialog|Headers and footers|html_print/);
  assert.match(app, /const exportVisualPdf = useCallback/);
  assert.match(app, /await import\("html2canvas"\)/);
  assert.match(app, /await import\("jspdf"\)/);
  assert.match(app, /document\.fonts\?\.ready/);
  assert.match(app, /cloneNode\(true\)/);
  assert.match(app, /host\.appendChild\(clone\)/);
  assert.match(app, /clone\.setAttribute\("lang", docLang/);
  assert.match(app, /clone\.setAttribute\("dir", direction\)/);
  assert.match(app, /canvas\.width \* \(pageHeight \/ pageWidth\)/);
  assert.match(app, /inner\.style\.alignItems = "flex-start"/);
  assert.match(app, /export_type: "visual_pdf"/);
  assert.match(app, /await exportVisualPdf\(resumePrintRef/);
  assert.match(app, /await exportVisualPdf\(coverPrintRef/);
});

test("content translation remains explicit and opt-in", () => {
  assert.match(app, /translateDocumentContent/);
  assert.doesNotMatch(app, /callAi\("translate-resume"/);
  assert.match(app, /translateContentConfirm/);
  assert.match(app, /translateContentConfirmButton/);
  assert.match(app, /translateContentButton/);
  assert.match(app, /translateContentHint/);
  assert.match(app, /docLang !== "en"/);
  assert.doesNotMatch(app, /setDocumentLanguagePreference[\s\S]{0,500}translateCV\(/);
});

test("Arabic DOCX export uses bidi paragraph and RTL run options", () => {
  assert.match(app, /bidirectional: docxRtl/);
  assert.match(app, /rightToLeft: docxRtl/);
  assert.match(app, /AlignmentType\.RIGHT/);
  assert.match(app, /Noto Sans Arabic/);
  assert.match(app, /indent: docxRtl \? \{ right: 260 \} : \{ left: 260 \}/);
});

console.log("Multilingual i18n tests passed.");
