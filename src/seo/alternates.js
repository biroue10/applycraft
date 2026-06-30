// ──────────────────────────────────────────────────────────────────────────
// Route-based canonical + hreflang map (Phase 6).
//
// hreflang alternates are declared ONLY for routes that have genuine translated
// equivalents. Every other route just self-canonicalizes and emits NO hreflang
// (so we never tell Google an unrelated page is a translation).
//
// Validated by scripts/seo-hreflang-tests.mjs (npm run test:seo:hreflang).
// ──────────────────────────────────────────────────────────────────────────

export const ORIGIN = "https://applycraft.io";

// Genuine translated clusters. Each entry is a full, reciprocal set.
// The homepage (SPA "/") is translated by the static /resume-in-french/ and
// /resume-in-arabic/ pages (which carry the matching reciprocal tags).
export const ALTERNATES = {
  "/": [
    { hreflang: "en", href: `${ORIGIN}/` },
    { hreflang: "fr", href: `${ORIGIN}/resume-in-french/` },
    { hreflang: "ar", href: `${ORIGIN}/resume-in-arabic/` },
    { hreflang: "x-default", href: `${ORIGIN}/` },
  ],
};

// Self-canonical for any SPA route. Root stays "/"; other routes keep their
// exact path (no forced trailing slash — matches how the routes are served).
export function canonicalFor(path) {
  if (!path || path === "/") return `${ORIGIN}/`;
  return ORIGIN + path;
}

// hreflang alternates for a route, or [] when it has no translated equivalents.
export function hreflangFor(path) {
  return ALTERNATES[path] || [];
}
