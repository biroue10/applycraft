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
// The homepage cluster uses crawlable localized URLs at /fr/ and /ar/.
export const ALTERNATES = {
  "/": [
    { hreflang: "en", href: `${ORIGIN}/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/` },
    { hreflang: "x-default", href: `${ORIGIN}/` },
  ],
  "/fr/": [
    { hreflang: "en", href: `${ORIGIN}/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/` },
    { hreflang: "x-default", href: `${ORIGIN}/` },
  ],
  "/ar/": [
    { hreflang: "en", href: `${ORIGIN}/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/` },
    { hreflang: "x-default", href: `${ORIGIN}/` },
  ],
  "/application-pack/": [
    { hreflang: "en", href: `${ORIGIN}/application-pack/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/application-pack/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/application-pack/` },
    { hreflang: "x-default", href: `${ORIGIN}/application-pack/` },
  ],
  "/fr/application-pack/": [
    { hreflang: "en", href: `${ORIGIN}/application-pack/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/application-pack/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/application-pack/` },
    { hreflang: "x-default", href: `${ORIGIN}/application-pack/` },
  ],
  "/ar/application-pack/": [
    { hreflang: "en", href: `${ORIGIN}/application-pack/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/application-pack/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/application-pack/` },
    { hreflang: "x-default", href: `${ORIGIN}/application-pack/` },
  ],
  "/resume/templates/": [
    { hreflang: "en", href: `${ORIGIN}/resume/templates/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/modeles-cv/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/resume-templates/` },
    { hreflang: "x-default", href: `${ORIGIN}/resume/templates/` },
  ],
  "/resume/templates": [
    { hreflang: "en", href: `${ORIGIN}/resume/templates/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/modeles-cv/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/resume-templates/` },
    { hreflang: "x-default", href: `${ORIGIN}/resume/templates/` },
  ],
  "/fr/modeles-cv/": [
    { hreflang: "en", href: `${ORIGIN}/resume/templates/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/modeles-cv/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/resume-templates/` },
    { hreflang: "x-default", href: `${ORIGIN}/resume/templates/` },
  ],
  "/ar/resume-templates/": [
    { hreflang: "en", href: `${ORIGIN}/resume/templates/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/modeles-cv/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/resume-templates/` },
    { hreflang: "x-default", href: `${ORIGIN}/resume/templates/` },
  ],
  "/interview-prep/": [
    { hreflang: "en", href: `${ORIGIN}/interview-prep/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/interview-prep/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/interview-prep/` },
    { hreflang: "x-default", href: `${ORIGIN}/interview-prep/` },
  ],
  "/fr/interview-prep/": [
    { hreflang: "en", href: `${ORIGIN}/interview-prep/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/interview-prep/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/interview-prep/` },
    { hreflang: "x-default", href: `${ORIGIN}/interview-prep/` },
  ],
  "/ar/interview-prep/": [
    { hreflang: "en", href: `${ORIGIN}/interview-prep/` },
    { hreflang: "fr", href: `${ORIGIN}/fr/interview-prep/` },
    { hreflang: "ar", href: `${ORIGIN}/ar/interview-prep/` },
    { hreflang: "x-default", href: `${ORIGIN}/interview-prep/` },
  ],
};

// Self-canonical for any SPA route. Root stays "/"; the public resume builder
// route uses the site-wide trailing-slash convention.
export function canonicalFor(path) {
  if (!path || path === "/") return `${ORIGIN}/`;
  if (path === "/fr" || path === "/fr/") return `${ORIGIN}/fr/`;
  if (path === "/ar" || path === "/ar/") return `${ORIGIN}/ar/`;
  if (path === "/resume-builder" || path === "/resume-builder/") return `${ORIGIN}/resume-builder/`;
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return ORIGIN + normalized;
}

// hreflang alternates for a route, or [] when it has no translated equivalents.
export function hreflangFor(path) {
  return ALTERNATES[path] || [];
}
