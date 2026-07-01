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
  isRtlLang,
  migratePreferences,
} from "../src/i18n/languages.js";
import { sectionLabel } from "../src/i18n/documentLabels.js";
import { EVENTS } from "../src/analytics.js";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const analytics = await readFile(new URL("../src/analytics.js", import.meta.url), "utf8");

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
    assert.ok(warnings.some((message) => message.includes("fr.missing.unknown")));
  } finally {
    console.warn = originalWarn;
  }
});

test("production namespaces resolve for English, French, Arabic, Spanish, and German", () => {
  for (const language of ["en", "fr", "ar", "es", "de"]) {
    assert.equal(typeof resources[language]?.common?.dlPdf, "string", `${language}.common.dlPdf missing`);
    assert.equal(typeof resources[language]?.builder?.documentLanguage, "string", `${language}.builder.documentLanguage missing`);
    assert.equal(typeof resources[language]?.status?.pdfFail, "string", `${language}.status.pdfFail missing`);
  }
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

test("document section labels localize and fall back safely", () => {
  assert.equal(sectionLabel("en", "experience"), "Work Experience");
  assert.equal(sectionLabel("fr", "experience"), "Expérience professionnelle");
  assert.equal(sectionLabel("ar", "experience"), "الخبرة العملية");
  assert.equal(sectionLabel("zz", "experience"), "Work Experience");
  assert.equal(sectionLabel("ar", "notASection"), "notASection");
});

test("custom section label behavior is present and protected", () => {
  assert.match(app, /sectionTitles/);
  assert.match(app, /heading !== defaultHeading/);
  assert.match(app, /Restore default label/);
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
  assert.match(app, /callAi\("translate-resume"/);
  assert.match(app, /window\.confirm\(translateLabel\(bu\.translateContentConfirm/);
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
