// ──────────────────────────────────────────────────────────────────────────
// Central config for the OPTIONAL account, analytics, and the OPTIONAL paid
// "Active Search Pass". Every value is read from Vite env (VITE_*) at build
// time. Privacy-preserving defaults keep everything OFF until you configure
// it, so the app ships as the fully-free, no-account builder unless enabled.
//
// IMPORTANT: nothing here gates an existing free feature. Accounts and the
// pass only add NEW optional capabilities (cross-device sync + AI tailoring).
// ──────────────────────────────────────────────────────────────────────────

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};

// Master switches. When false, the matching UI entry points are hidden and
// the app behaves exactly as the no-account, free-forever builder.
export const ACCOUNTS_ENABLED = true;
export const REQUIRE_RESUME_LOGIN = true;
export const PAYMENTS_ENABLED = env.VITE_PAYMENTS_ENABLED === "true";

// Google Analytics 4 measurement ID. Not env-driven: it is baked into the
// generated public/consent.js, which is what actually loads gtag.js, so a
// build-time override would silently disagree with the static asset.
export const GA_MEASUREMENT_ID = "G-V4RE1M2Q52";

// Impact's public affiliate-tracking tag. This is intentionally a single
// constant because scripts/generate-consent-asset.mjs is the sole site-wide
// loader, and it must never be added to individual routes or components.
export const IMPACT_AFFILIATE_TAG_URL = "https://utt.impactcdn.com/P-A7607934-979a-4ead-843a-d7d27241d7e71.js";

export const ANALYTICS = {
  // Gates whether the app emits events at all. Loading of gtag.js is decided
  // separately by visitor consent — see public/consent.js.
  enabled: env.VITE_ANALYTICS_ENABLED === "true",
  // Key that public/consent.js writes the visitor's choice to.
  consentKey: "ac_cookie_consent",
};

// The single paid product: a one-time, NON-recurring pass that unlocks AI
// tailoring + Master Profile cloud sync for a fixed window. Not a subscription.
export const ACTIVE_SEARCH_PASS = {
  priceUsd: Number(env.VITE_PASS_PRICE_USD || 7),
  days: Number(env.VITE_PASS_DAYS || 7),
  // Lemon Squeezy variant ID for the pass. The server creates the checkout;
  // this is only used to display the price/label and as a sanity check.
  variantId: env.VITE_LEMONSQUEEZY_VARIANT_ID || "",
};

// LocalStorage keys owned by the account/billing layer. Kept separate from the
// resume-data keys so "Delete local data" and "Delete my saved data" stay
// clearly scoped.
export const ACCOUNT_STORAGE_KEYS = ["ac_session", "ac_account", "ac_consent_sync"];
