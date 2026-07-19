// ──────────────────────────────────────────────────────────────────────────
// Product analytics (Google Analytics 4 / gtag.js).
//
// Only the whitelisted events below are ever sent, and payloads are filtered
// to non-PII scalars. No emails, names, resume text, or IDs.
//
// NOTE: unlike the Plausible setup this replaced, GA4 sets first-party
// cookies (_ga, _ga_<id>) and is not cookieless. The privacy and cookie
// policies disclose this; consent gating is still outstanding — see
// docs/SECURITY.md and the policy pages under public/.
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

let loaded = false;

// Inject gtag.js once, in the browser only, and only when analytics is
// enabled and a measurement ID is configured.
//
// The static marketing pages under public/ carry the equivalent inline
// snippet in their <head>; this guards against double-tagging by bailing out
// if gtag has already been installed on the page.
export function initAnalytics() {
  if (loaded || typeof window === "undefined") return;
  if (!ANALYTICS.enabled || !ANALYTICS.measurementId) return;
  loaded = true;

  // dataLayer + gtag shim, so events fired before the script finishes loading
  // are queued rather than dropped. Matches Google's official snippet.
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // Only load the remote script if a page-level snippet hasn't already.
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `${ANALYTICS.src}?id=${encodeURIComponent(ANALYTICS.measurementId)}`;
    document.head.appendChild(s);
  }

  window.gtag("js", new Date());
  window.gtag("config", ANALYTICS.measurementId);
}

// Track one whitelisted event. `props` must be non-PII scalars only.
export function track(name, props = {}) {
  if (!ANALYTICS.enabled || typeof window === "undefined") return;
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
