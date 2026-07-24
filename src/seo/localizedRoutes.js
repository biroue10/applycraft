export const LOCALIZED_ROUTES = {
  "/": { en: "/", fr: "/fr/", ar: "/ar/" },
  "/application-pack/": { en: "/application-pack/", fr: "/fr/application-pack/", ar: "/ar/application-pack/" },
  "/resume-builder/": { en: "/resume-builder/", fr: "/resume-builder/?ui=fr&docLang=fr", ar: "/resume-builder/?ui=ar&docLang=ar" },
  "/resume/templates/": { en: "/resume/templates/", fr: "/fr/modeles-cv/", ar: "/ar/resume-templates/" },
  "/cover-letter/templates/": { en: "/cover-letter/templates/", fr: "/cover-letter/templates/?ui=fr&docLang=fr", ar: "/cover-letter/templates/?ui=ar&docLang=ar" },
  "/job-tracker/": { en: "/job-tracker/", fr: "/job-tracker/?ui=fr&docLang=fr", ar: "/job-tracker/?ui=ar&docLang=ar" },
  "/interview-prep/": { en: "/interview-prep/", fr: "/fr/interview-prep/", ar: "/ar/interview-prep/" },
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
  "/canadian-resume-builder/": { en: "/canadian-resume-builder/", fr: "/fr/creer-cv-canadien/", ar: "/ar/resume-templates/?country=canada" },
  "/resume-in-french/": { en: "/resume-in-french/", fr: "/fr/", ar: "/ar/" },
  "/resume-in-arabic/": { en: "/resume-in-arabic/", fr: "/fr/", ar: "/ar/" },
  "/terms/": { en: "/terms/", fr: "/fr/terms/" },
  "/privacy/": { en: "/privacy/", fr: "/fr/privacy/" },
  "/cookies/": { en: "/cookies/", fr: "/fr/cookies/" },
  "/gdpr/": { en: "/gdpr/", fr: "/fr/gdpr/" },
  "/refund-policy/": { en: "/refund-policy/", fr: "/fr/refund-policy/" },
  "/ai-disclosure/": { en: "/ai-disclosure/", fr: "/fr/ai-disclosure/" },
};

const INTERNAL_ORIGIN = "https://applycraft.io";
const INTERFACE_LANGUAGE_CODES = new Set(["en", "fr", "ar"]);
const DOCUMENT_LANGUAGE_PATTERN = /^[a-z]{2,3}$/;

// Query state belongs to destinations, not to whichever page linked to them.
export const ROUTE_CAPABILITIES = Object.freeze({
  "/": Object.freeze({ supportsInterfaceLanguage: false, supportsDocumentLanguage: false, allowedParams: Object.freeze(["ac_checkout"]) }),
  "/resume-builder/": Object.freeze({ supportsInterfaceLanguage: true, supportsDocumentLanguage: true, allowedParams: Object.freeze(["starter", "template", "country", "importResume"]) }),
  "/resume/templates/": Object.freeze({ supportsInterfaceLanguage: true, supportsDocumentLanguage: true, allowedParams: Object.freeze(["country"]) }),
  "/cover-letter-builder/": Object.freeze({ supportsInterfaceLanguage: true, supportsDocumentLanguage: true, allowedParams: Object.freeze(["template"]) }),
  "/cover-letter/templates/": Object.freeze({ supportsInterfaceLanguage: true, supportsDocumentLanguage: true, allowedParams: Object.freeze(["template"]) }),
  "/job-tracker/": Object.freeze({ supportsInterfaceLanguage: true, supportsDocumentLanguage: false, allowedParams: Object.freeze([]) }),
  "/interview-prep/": Object.freeze({ supportsInterfaceLanguage: false, supportsDocumentLanguage: false, allowedParams: Object.freeze(["jobTitle", "company", "applicationLanguage"]) }),
});

function normalizedPathname(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function canonicalRouteForPath(pathname = "/") {
  const normalized = normalizedPathname(pathname);
  for (const [canonical, variants] of Object.entries(LOCALIZED_ROUTES)) {
    if (canonical === normalized) return canonical;
    if (Object.values(variants).some((candidate) => {
      const url = new URL(candidate, INTERNAL_ORIGIN);
      return normalizedPathname(url.pathname) === normalized;
    })) return canonical;
  }
  return normalized;
}

function recoveredParam(rawSearch, name, validator) {
  const pattern = new RegExp(`(?:[?&])${name}=([^?&#]*)`, "gi");
  for (const match of String(rawSearch || "").matchAll(pattern)) {
    let value = "";
    try { value = decodeURIComponent(match[1] || "").toLowerCase(); } catch { continue; }
    if (validator(value)) return value;
  }
  return "";
}

function safeInternalUrl(href) {
  const url = new URL(String(href || "/"), INTERNAL_ORIGIN);
  if (url.origin !== INTERNAL_ORIGIN || !["http:", "https:"].includes(url.protocol)) {
    throw new TypeError("ApplyCraft internal URLs must remain same-origin");
  }
  url.pathname = normalizedPathname(url.pathname);
  return url;
}

// Idempotent URL-state builder shared by localization and SPA navigation.
export function buildInternalUrl(href, options = {}) {
  const url = safeInternalUrl(href);
  const currentUrl = options.currentHref ? safeInternalUrl(options.currentHref) : null;
  const rawSearch = url.search;
  const capability = ROUTE_CAPABILITIES[canonicalRouteForPath(url.pathname)] || {
    supportsInterfaceLanguage: false,
    supportsDocumentLanguage: false,
    allowedParams: [],
  };
  const requestedAllowed = new Set(options.preserveAllowedParams || capability.allowedParams);
  const next = new URLSearchParams();

  const existingUi = recoveredParam(rawSearch, "ui", (value) => INTERFACE_LANGUAGE_CODES.has(value));
  const requestedUi = String(options.interfaceLanguage ?? existingUi).toLowerCase();
  if (capability.supportsInterfaceLanguage && INTERFACE_LANGUAGE_CODES.has(requestedUi)) next.set("ui", requestedUi);

  const existingDocLang = recoveredParam(rawSearch, "docLang", (value) => DOCUMENT_LANGUAGE_PATTERN.test(value));
  const requestedDocLang = String(options.documentLanguage ?? existingDocLang).toLowerCase();
  const preserveDocLang = options.preserveDocumentLanguage ?? Boolean(existingDocLang);
  if (capability.supportsDocumentLanguage && preserveDocLang && DOCUMENT_LANGUAGE_PATTERN.test(requestedDocLang)) {
    next.set("docLang", requestedDocLang);
  }

  for (const name of capability.allowedParams) {
    if (!requestedAllowed.has(name)) continue;
    const value = url.searchParams.get(name) || currentUrl?.searchParams.get(name);
    if (value && !/[?&#]/.test(value)) next.set(name, value);
  }

  const query = next.toString();
  return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
}

export function normalizeInternalUrl(href) {
  const source = safeInternalUrl(href);
  const normalized = safeInternalUrl(buildInternalUrl(href));
  for (const [name, value] of source.searchParams) {
    if (name === "ui" || name === "docLang" || normalized.searchParams.has(name)) continue;
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(name) || /[?&#]/.test(value) || value.length > 512) continue;
    normalized.searchParams.append(name, value);
  }
  return `${normalized.pathname}${normalized.search}${normalized.hash}`;
}

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
  const localizedUrl = safeInternalUrl(localized);
  const sourceUrl = safeInternalUrl(`${pathname}${suffix}`);
  const capability = ROUTE_CAPABILITIES[canonicalRouteForPath(localizedUrl.pathname)];
  const preserveAllowedParams = capability?.allowedParams || [];
  for (const name of preserveAllowedParams) {
    const value = sourceUrl.searchParams.get(name);
    if (value && !localizedUrl.searchParams.has(name)) localizedUrl.searchParams.set(name, value);
  }
  return buildInternalUrl(`${localizedUrl.pathname}${localizedUrl.search}${sourceUrl.hash || localizedUrl.hash}`, {
    interfaceLanguage: recoveredParam(localizedUrl.search, "ui", (value) => INTERFACE_LANGUAGE_CODES.has(value)),
    documentLanguage: recoveredParam(localizedUrl.search, "docLang", (value) => DOCUMENT_LANGUAGE_PATTERN.test(value)),
    preserveDocumentLanguage: localizedUrl.searchParams.has("docLang"),
    preserveAllowedParams,
  });
}

// Resolve the current canonical route back to its language-neutral route, then
// localize it. Unknown/untranslated pages intentionally fall back to the target
// language homepage instead of creating a plausible-looking 404 URL.
export function localizedLanguageHref(currentPath = "/", lang = "en") {
  const pathname = normalizeRoutePath(currentPath).split(/[?#]/)[0];
  for (const [source, variants] of Object.entries(LOCALIZED_ROUTES)) {
    const match = Object.values(variants).some((candidate) => (
      normalizeRoutePath(candidate).split(/[?#]/)[0] === pathname
    ));
    if (match) return variants[lang] || localizeRoute("/", lang);
    if (source === pathname) return variants[lang] || localizeRoute("/", lang);
  }
  return localizeRoute("/", lang);
}
