// ──────────────────────────────────────────────────────────────────────────
// PRODUCT — single source of truth for product facts that are repeated across
// the app, landing pages, static HTML pages, README, metadata, structured
// data, and footers.
//
// These values are VERIFIED against the live code by scripts/product-tests.mjs
// (run via `npm run test:product`), which fails the build if:
//   • the resume/cover template arrays in ResumeGenerator.jsx drift from the
//     counts declared here, or
//   • any static HTML page / README states a different number.
//
// When you add or remove a template or a document/interface language, update
// the matching count here in ONE place; the test then tells you which copy
// still needs to match.
//
// Pricing/feature flags below describe the product as shipped. The actual
// runtime gating of the optional account + paid pass lives in src/config.js
// (env-driven); this file is only the descriptive source for copy & schema.
// ──────────────────────────────────────────────────────────────────────────

export const PRODUCT = {
  // Counts — verified against TEMPLATES / COVER_TEMPLATES / WORLD_LANGUAGES /
  // UI_LANGS in src/ResumeGenerator.jsx.
  resumeTemplateCount: 46,        // TEMPLATES, excluding the "blank" template
  coverLetterTemplateCount: 18,   // COVER_TEMPLATES (count shown in the gallery)
  writableLanguageCount: 99,      // WORLD_LANGUAGES — users can write content in these languages
  localizedDocumentLanguageCount: 3, // Production document labels: en, fr, ar
  interfaceLanguageCount: 5,      // UI_LANGS — en, fr, es, ar, de

  // Free / account model (matches the live product: the core builder, every
  // template, multilingual support, and PDF/DOCX export work with no account).
  coreBuilderFree: true,
  accountRequired: false,
  noWatermark: true,

  // Optional, one-time, NON-recurring "Active Search Pass" (see src/config.js
  // ACTIVE_SEARCH_PASS for the env-driven runtime values).
  paidPassAvailable: true,
  paidPassDurationDays: 7,
  paidPassPriceUsd: 7,
  paidPassPriceCurrency: "USD",
  paidPassRecurring: false,

  // Optional capabilities unlocked by the pass / account.
  cloudSyncAvailable: true,
  atsKeywordMatchingAvailable: true,

  // Export formats the builder produces.
  exportFormats: ["PDF", "DOCX"],
};

export default PRODUCT;
