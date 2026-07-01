// ──────────────────────────────────────────────────────────────────────────
// Privacy-respecting analytics (Plausible — cookieless, no consent banner).
//
// Only the six whitelisted events below are ever sent, and payloads are
// filtered to non-PII scalars. No emails, names, resume text, or IDs.
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
};

const ALLOWED = new Set(Object.values(EVENTS));

let loaded = false;

// Inject the Plausible script once, in the browser only, and only when
// analytics is enabled and a script src is configured.
//
// Supports the modern Plausible "tagged" snippet (src ".../pa-<id>.js", which
// encodes the site and needs plausible.init()) as well as the classic
// script.js (which uses a data-domain attribute). Set VITE_PLAUSIBLE_SRC to
// the exact src Plausible gives you in the dashboard.
export function initAnalytics() {
  if (loaded || typeof window === "undefined") return;
  if (!ANALYTICS.enabled || !ANALYTICS.src) return;
  loaded = true;

  // Stub queue + init shim so events fired before the script finishes loading
  // are preserved, matching Plausible's official inline snippet.
  window.plausible =
    window.plausible ||
    function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
  window.plausible.init =
    window.plausible.init ||
    function (i) {
      window.plausible.o = i || {};
    };

  const s = document.createElement("script");
  s.async = true;
  s.src = ANALYTICS.src;
  // Only the classic script.js needs the domain attribute; the tagged script
  // ignores it. Harmless to set when present.
  if (ANALYTICS.domain) s.setAttribute("data-domain", ANALYTICS.domain);
  document.head.appendChild(s);

  // No-op for classic script.js; starts auto pageview tracking for the
  // tagged script.
  window.plausible.init();
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
    window.plausible?.(name, Object.keys(safe).length ? { props: safe } : undefined);
  } catch {
    /* analytics must never break the app */
  }
}
