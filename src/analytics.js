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
import { EVENTS } from "./analyticsEvents.js";
export { EVENTS } from "./analyticsEvents.js";

// The ONLY events we send. Anything not in this set is dropped.
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
