export const LOCALIZED_ROUTES = {
  "/": { en: "/", fr: "/fr/", ar: "/ar/" },
  "/resume-builder/": { en: "/resume-builder/", fr: "/fr/", ar: "/ar/" },
  "/free-resume-builder/": { en: "/free-resume-builder/", fr: "/fr/creer-cv-gratuit/", ar: "/ar/free-resume-builder/" },
  "/student-resume-builder/": { en: "/student-resume-builder/", fr: "/fr/creer-cv-etudiant/" },
  "/ats-checker/": { en: "/ats-checker/", fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  "/pricing/": { en: "/pricing/", fr: "/fr/pricing/" },
  "/blog/": {
    en: "/blog/",
    fr: "/fr/blog/",
    // Switch Arabic blog links to /ar/blog/ when an Arabic blog index exists.
    ar: "/blog/",
  },
  "/examples/": { en: "/examples/", fr: "/examples/french-cv-example/" },
  "/terms/": { en: "/terms/", fr: "/fr/terms/" },
  "/privacy/": { en: "/privacy/", fr: "/fr/privacy/" },
  "/cookies/": { en: "/cookies/", fr: "/fr/cookies/" },
  "/gdpr/": { en: "/gdpr/", fr: "/fr/gdpr/" },
  "/refund-policy/": { en: "/refund-policy/", fr: "/fr/refund-policy/" },
  "/ai-disclosure/": { en: "/ai-disclosure/", fr: "/fr/ai-disclosure/" },
};

export function normalizeRoutePath(path = "") {
  const raw = String(path || "").trim();
  if (!raw || raw === "/") return "/";
  const [pathname, suffix = ""] = raw.split(/(?=[?#])/);
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${normalized}${suffix}`;
}

export function localizeRoute(path = "", lang = "en") {
  const normalized = normalizeRoutePath(path);
  const [pathname, suffix = ""] = normalized.split(/(?=[?#])/);
  const localized = LOCALIZED_ROUTES[pathname]?.[lang] || pathname;
  return `${localized}${suffix}`;
}
