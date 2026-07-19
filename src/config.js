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
export const ACCOUNTS_ENABLED = env.VITE_ACCOUNTS_ENABLED === "true";
export const PAYMENTS_ENABLED = env.VITE_PAYMENTS_ENABLED === "true";

export const ANALYTICS = {
  enabled: env.VITE_ANALYTICS_ENABLED === "true",
  // Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX".
  measurementId: env.VITE_GA_MEASUREMENT_ID || "",
  // gtag.js loader origin. See public/_headers for the matching CSP entries.
  src: env.VITE_GA_SRC || "https://www.googletagmanager.com/gtag/js",
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
