// ──────────────────────────────────────────────────────────────────────────
// Product analytics (Google Analytics 4).
//
// This module only ENQUEUES events. It never loads gtag.js — that is owned
// by public/consent.js, which loads Google's script only after the visitor
// accepts in the cookie banner. If consent was refused (or not yet given),
// gtag.js is absent, no cookies exist, and events are dropped here.
//
// Only the whitelisted events below are ever sent, and payloads are filtered
// to non-PII scalars. No emails, names, resume text, or IDs.
// ──────────────────────────────────────────────────────────────────────────

import { ANALYTICS } from "./config.js";

// The ONLY events we send. Anything not in this set is dropped.
export const EVENTS = {
  RESUME_STARTED: "resume_started",
  RESUME_EXPORTED: "resume_exported",
  AI_TAILORING_USED: "ai_tailoring_used",
  EMAIL_CAPTURED: "email_captured",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_COMPLETED: "checkout_completed",
  // Conversion-funnel events (Phase 10). Props are limited to non-PII scalars
  // like a template id or a UI location — never resume/cover text, names,
  // emails, addresses, or job descriptions.
  HERO_CTA_CLICKED: "hero_cta_clicked",
  TEMPLATE_PREVIEW_OPENED: "template_preview_opened",
  TEMPLATE_SELECTED: "template_selected",
  COVER_STARTED: "cover_letter_started",
  ATS_STARTED: "ats_checker_started",
  PRICING_OPENED: "pricing_opened",
  INTERFACE_LANGUAGE_SELECTED: "interface_language_selected",
  DOCUMENT_LANGUAGE_SELECTED: "document_language_selected",
  RTL_INTERFACE_ENABLED: "rtl_interface_enabled",
  RTL_DOCUMENT_ENABLED: "rtl_document_enabled",
  MULTILINGUAL_RESUME_EXPORTED: "multilingual_resume_exported",
  MULTILINGUAL_COVER_LETTER_EXPORTED: "multilingual_cover_letter_exported",
  PDF_EXPORT_STARTED: "pdf_export_started",
  PDF_EXPORT_COMPLETED: "pdf_export_completed",
  PDF_EXPORT_FAILED: "pdf_export_failed",
  DOCX_EXPORT_STARTED: "docx_export_started",
  DOCX_EXPORT_COMPLETED: "docx_export_completed",
  DOCX_EXPORT_FAILED: "docx_export_failed",
  LANGUAGE_MIGRATION_COMPLETED: "language_migration_completed",
  LANGUAGE_MIGRATION_FAILED: "language_migration_failed",
  MISSING_TRANSLATION_KEY: "missing_translation_key",
  TRANSLATION_STARTED: "translation_started",
  TRANSLATION_COPY_CREATED: "translation_copy_created",
  DOCUMENT_AUTOSAVE_DISABLED: "document_autosave_disabled",
  BEFOREUNLOAD_WARNING_SHOWN: "beforeunload_warning_shown",
};

const ALLOWED = new Set(Object.values(EVENTS));

// True only once the visitor has actively accepted analytics cookies.
function hasConsent() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ANALYTICS.consentKey) === "granted";
  } catch {
    return false; // storage blocked → treat as no consent
  }
}

// Kept for call-site compatibility. Loading is handled by public/consent.js;
// this only makes sure the dataLayer shim exists if that script has not run
// yet, so an early event is queued rather than thrown away.
export function initAnalytics() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
}

// Track one whitelisted event. `props` must be non-PII scalars only.
export function track(name, props = {}) {
  if (!ANALYTICS.enabled || typeof window === "undefined") return;
  if (!hasConsent()) return; // no consent → nothing leaves the browser
  if (!ALLOWED.has(name)) return; // hard whitelist — never send arbitrary names

  const safe = Object.fromEntries(
    Object.entries(props).filter(([, v]) =>
      ["string", "number", "boolean"].includes(typeof v)
    )
  );

  try {
    window.gtag?.("event", name, safe);
  } catch {
    /* analytics must never break the app */
  }
}
