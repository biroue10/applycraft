export const LOCALIZED_ROUTES = {
  "/": { en: "/", fr: "/fr/", ar: "/ar/" },
  "/resume-builder/": { en: "/resume-builder/", fr: "/resume-builder/?ui=fr&docLang=fr", ar: "/resume-builder/?ui=ar&docLang=ar" },
  "/resume/templates/": { en: "/resume/templates/", fr: "/resume/templates/?ui=fr&docLang=fr", ar: "/resume/templates/?ui=ar&docLang=ar" },
  "/cover-letter/templates/": { en: "/cover-letter/templates/", fr: "/cover-letter/templates/?ui=fr&docLang=fr", ar: "/cover-letter/templates/?ui=ar&docLang=ar" },
  "/cover-letter-builder/": { en: "/cover-letter-builder/", fr: "/cover-letter/templates/?ui=fr&docLang=fr", ar: "/cover-letter/templates/?ui=ar&docLang=ar" },
  "/free-resume-builder/": { en: "/free-resume-builder/", fr: "/fr/creer-cv-gratuit/", ar: "/ar/free-resume-builder/" },
  "/student-resume-builder/": { en: "/student-resume-builder/", fr: "/fr/creer-cv-etudiant/" },
  "/ats-checker/": { en: "/ats-checker/", fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  "/ats-resume-builder/": { en: "/ats-resume-builder/", fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  "/pricing/": { en: "/pricing/", fr: "/fr/pricing/" },
  "/blog/": {
    en: "/blog/",
    fr: "/fr/blog/",
    // Switch Arabic blog links to /ar/blog/ when an Arabic blog index exists.
    ar: "/blog/",
  },
  "/examples/": { en: "/examples/", fr: "/examples/french-cv-example/" },
  "/canadian-resume-builder/": { en: "/canadian-resume-builder/", fr: "/fr/creer-cv-canadien/", ar: "/resume/templates/?ui=ar&docLang=ar&country=canada" },
  "/resume-in-french/": { en: "/resume-in-french/", fr: "/fr/", ar: "/ar/" },
  "/resume-in-arabic/": { en: "/resume-in-arabic/", fr: "/fr/", ar: "/ar/" },
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
  if (!suffix || !localized.includes("?")) return `${localized}${suffix}`;
  const [localizedPath, localizedQuery = ""] = localized.split("?");
  const merged = new URLSearchParams(localizedQuery);
  const extra = new URLSearchParams(suffix.replace(/^\?/, ""));
  for (const [key, value] of extra.entries()) merged.set(key, value);
  const query = merged.toString();
  return `${localizedPath}${query ? `?${query}` : ""}`;
}
