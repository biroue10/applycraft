import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ACCOUNTS_ENABLED, PAYMENTS_ENABLED, ACTIVE_SEARCH_PASS } from "./config.js";
import * as accountSession from "./accountSession.js";
import { scoreFromIssues, scoreBand, issueCost, READINESS_EXPLAINER } from "./ats/scoring.js";
import { pdfSafe, containsNonLatin1 } from "./pdf/text.js";
import { useFocusTrap } from "./a11y/useFocusTrap.js";
import * as resumes from "./resumes.js";
import { asArray, isResumeDataEmpty, normalizeResumeData } from "./resumeData.js";
import { linkifyText, normalizeLinkHref } from "./utils/linkify.js";
import { getContactHref, normalizeContactItems } from "./utils/contactLinks.js";
import { formatPhoneForResume } from "./utils/phone.js";
import { detectImportedResumeLanguage } from "./importLanguage.js";
import { ResumePaper, CoverLetterPaper, structureSectionItems } from "./documents/DocumentPapers.jsx";
import { analyzeResumeQuality, formatDateRange, isPlaceholderOnly, normalizeDateRange, presentLabel } from "./resumeQuality.js";
import { serializeResumeTranslationContent, TRANSLATABLE_RESUME_FIELDS, TRANSLATION_STATUSES } from "./translationCore.js";
import { LinkifyLinksProvider } from "./components/LinkifiedText.jsx";
import { TEMPLATES, COVER_TEMPLATES, RESUME_TEMPLATE_COUNT, COVER_TEMPLATE_COUNT, RECOMMENDED_TEMPLATE_ID, TEMPLATE_COUNTRIES, templateCountries } from "./documents/templateRegistry.js";
import { PRODUCT } from "./product.js";
import { positioningFor } from "./productPositioning.js";
import { SiteHeader as SharedSiteHeader, SiteFooter as SharedSiteFooter, WorkspaceStatusBar, HEADER_HEIGHT, shouldUseNativeNavigation, BRAND_LOGO_SRC } from "./siteChrome.jsx";
import { primaryNavLabelKey } from "./nav/navItems.js";
import { COLORS, chipInk, accentOnPaper } from "./theme/colors.js";
import { UI, ENTRY_UI, ACCT_UI, LANDING_UI, BUILDER_UI, COVER_UI, ATS_UI, TRACKER_UI, MASTER_UI, STATUS_UI, MODAL_UI, LANDING2_UI, FOOTER_UI } from "./i18n/index.js";
import {
  INTERFACE_LANGUAGES,
  initialInterfaceLanguage,
  initialDocumentLanguage,
  persistInterfaceLanguage,
  persistDocumentLanguage,
  INTERFACE_LANGUAGE_METADATA,
  isInterfaceLang,
  isDocumentLang,
  isRtlLang,
} from "./i18n/languages.js";
import { LANGUAGE_SCHEMA_VERSION, LANGUAGE_SCHEMA_VERSION_KEY } from "./i18n/config.js";
import { documentLabelsFor } from "./i18n/documentLabels.js";
import { formatLetterDate, defaultCoverSignoff, COVER_SIGNOFFS, LETTER_LOCALE } from "./i18n/letterDefaults.js";
import { localizeRoute, localizedLanguageHref } from "./seo/localizedRoutes.js";
import { jobContextQuery } from "./interview/context.js";

// Event ids normally match their lowercase constant name. Keeping this tiny
// call-site map avoids pulling the full analytics whitelist into first paint.
const EVENTS = new Proxy({ COVER_STARTED: "cover_letter_started" }, {
  get: (overrides, key) => overrides[key] || String(key).toLowerCase(),
});

function hasAnalyticsConsent() {
  try { return typeof window !== "undefined" && localStorage.getItem("ac_cookie_consent") === "granted"; }
  catch { return false; }
}

function initAnalytics() {
  if (!hasAnalyticsConsent()) return;
  const load = () => import("./analytics.js").then((module) => module.initAnalytics());
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 2000 });
  else setTimeout(load, 0);
}

function track(eventId, props) {
  if (!hasAnalyticsConsent()) return;
  void import("./analytics.js").then((module) => module.track(eventId, props));
}

const LANDING2_LOADERS = {
  es: () => import("./i18n/namespaces/es/landing2.js"),
  de: () => import("./i18n/namespaces/de/landing2.js"),
};

// The interactive editor demo is below the fold. Its crawlable heading and
// description are prerendered below, while the full controls load shortly
// before they enter the viewport.
const InteractiveResumeDemo = React.lazy(() => import("./components/InteractiveResumeDemo.jsx"));
const ApplicationPackSection = React.lazy(() => import("./components/ApplicationPackSection.jsx"));
const TrackerPrivacyControls = React.lazy(() => import("./components/TrackerPrivacyControls.jsx"));
const EvidenceLibrary = React.lazy(() => import("./components/EvidenceLibrary.jsx"));
const TrackerFilters = React.lazy(() => import("./components/TrackerFilters.jsx"));
const TrackApplicationAction = React.lazy(() => import("./components/TrackApplicationAction.jsx"));
const ATS_RESULT_LOADERS = {
  en: () => import("./i18n/atsResults/en.js"),
  fr: () => import("./i18n/atsResults/fr.js"),
  ar: () => import("./i18n/atsResults/ar.js"),
};
const atsResultCache = new Map();
async function loadAtsResultCopy(language) {
  const code = ATS_RESULT_LOADERS[language] ? language : "en";
  if (atsResultCache.has(code)) return atsResultCache.get(code);
  const module = await ATS_RESULT_LOADERS[code]();
  atsResultCache.set(code, module.default);
  return module.default;
}

// ── UI translation codes (languages with full UI translation) ──────
const UI_LANGS = new Set(["en", "fr", "ar"]);
const SITE_LANGUAGE_CODES = new Set(INTERFACE_LANGUAGES);
const INTERFACE_LANGUAGE_DROPDOWN_COPY = {
  en: {
    ariaLabel: "Select interface language",
    searchPlaceholder: "Search interface language...",
    emptyLabel: "No interface language found",
    siteBadge: "SITE",
    uiBadge: "UI",
  },
  fr: {
    ariaLabel: "Choisir la langue de l’interface",
    searchPlaceholder: "Rechercher une langue d’interface...",
    emptyLabel: "Aucune langue d’interface trouvée",
    siteBadge: "SITE",
    uiBadge: "UI",
  },
  ar: {
    ariaLabel: "اختيار لغة الواجهة",
    searchPlaceholder: "ابحث عن لغة الواجهة...",
    emptyLabel: "لم يتم العثور على لغة واجهة",
    siteBadge: "الموقع",
    uiBadge: "الواجهة",
  },
  es: {
    ariaLabel: "Seleccionar idioma de la interfaz",
    searchPlaceholder: "Buscar idioma de la interfaz...",
    emptyLabel: "No se encontró ningún idioma de interfaz",
    siteBadge: "SITIO",
    uiBadge: "IU",
  },
  de: {
    ariaLabel: "Sprache der Benutzeroberfläche auswählen",
    searchPlaceholder: "Sprache der Benutzeroberfläche suchen...",
    emptyLabel: "Keine Sprache der Benutzeroberfläche gefunden",
    siteBadge: "SEITE",
    uiBadge: "UI",
  },
};
const STARTER_STATUS_COPY = {
  en: {
    loaded: "{role} example loaded. Replace the sample text with your own details.",
    invalid: "Template could not be loaded. Starting with a blank résumé.",
  },
  fr: {
    loaded: "Exemple de {role} chargé. Remplacez le texte d’exemple par vos propres informations.",
    invalid: "Le modèle n’a pas pu être chargé. Un CV vide a été ouvert.",
  },
  ar: {
    loaded: "تم تحميل مثال {role}. استبدل النص التجريبي بمعلوماتك الخاصة.",
    invalid: "تعذر تحميل القالب. تم فتح سيرة ذاتية فارغة.",
  },
};
// Centralized in src/product.js; verified against WORLD_LANGUAGES / UI_LANGS
// by scripts/product-tests.mjs.
const LOCALIZED_DOCUMENT_LANGUAGE_COUNT = PRODUCT.localizedDocumentLanguageCount;
const UI_LANGUAGE_COUNT = PRODUCT.interfaceLanguageCount;
// BRAND_LOGO_SRC imported from ./siteChrome.jsx — single source for the mark.
const TRANSLATION_USAGE_KEY = "ac_translation_usage";
const TRANSLATION_DEV_BYPASS_HASH = import.meta.env.VITE_DEV_BYPASS || "";

function readTranslationUsage(limit = 1) {
  if (typeof localStorage === "undefined") return { fullResumeTranslationsUsed: 0, limit, resetAt: null };
  try {
    const parsed = JSON.parse(localStorage.getItem(TRANSLATION_USAGE_KEY) || "{}");
    const used = Number(parsed.fullResumeTranslationsUsed || 0);
    return {
      fullResumeTranslationsUsed: Number.isFinite(used) && used > 0 ? used : 0,
      limit,
      resetAt: parsed.resetAt || null,
    };
  } catch {
    return { fullResumeTranslationsUsed: 0, limit, resetAt: null };
  }
}

function writeTranslationUsage(usage) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(TRANSLATION_USAGE_KEY, JSON.stringify(usage)); } catch { /* noop */ }
}

function AppBrandLogo({ compact = false, style = {} }) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="ApplyCraft"
      width="1180"
      height="304"
      style={{
        display: "block",
        height: compact ? 28 : 30,
        width: "auto",
        maxWidth: compact ? 145 : 170,
        objectFit: "contain",
        background: "transparent",
        border: 0,
        boxShadow: "none",
        ...style,
      }}
    />
  );
}

// ── All world languages for the picker ────────────────────────────
const WORLD_LANGUAGES = [
  { code: "af", name: "Afrikaans",         flag: "🇿🇦", native: "Afrikaans" },
  { code: "sq", name: "Albanian",          flag: "🇦🇱", native: "Shqip" },
  { code: "am", name: "Amharic",           flag: "🇪🇹", native: "አማርኛ" },
  INTERFACE_LANGUAGE_METADATA.ar,
  { code: "hy", name: "Armenian",          flag: "🇦🇲", native: "Հայերեն" },
  { code: "az", name: "Azerbaijani",       flag: "🇦🇿", native: "Azərbaycanca" },
  { code: "eu", name: "Basque",            flag: "🇪🇸", native: "Euskara" },
  { code: "be", name: "Belarusian",        flag: "🇧🇾", native: "Беларуская" },
  { code: "bn", name: "Bengali",           flag: "🇧🇩", native: "বাংলা" },
  { code: "bs", name: "Bosnian",           flag: "🇧🇦", native: "Bosanski" },
  { code: "bg", name: "Bulgarian",         flag: "🇧🇬", native: "Български" },
  { code: "ca", name: "Catalan",           flag: "🇪🇸", native: "Català" },
  { code: "zh", name: "Chinese",           flag: "🇨🇳", native: "中文" },
  { code: "hr", name: "Croatian",          flag: "🇭🇷", native: "Hrvatski" },
  { code: "cs", name: "Czech",             flag: "🇨🇿", native: "Čeština" },
  { code: "da", name: "Danish",            flag: "🇩🇰", native: "Dansk" },
  { code: "nl", name: "Dutch",             flag: "🇳🇱", native: "Nederlands" },
  INTERFACE_LANGUAGE_METADATA.en,
  { code: "et", name: "Estonian",          flag: "🇪🇪", native: "Eesti" },
  { code: "tl", name: "Filipino",          flag: "🇵🇭", native: "Filipino" },
  { code: "fi", name: "Finnish",           flag: "🇫🇮", native: "Suomi" },
  INTERFACE_LANGUAGE_METADATA.fr,
  { code: "gl", name: "Galician",          flag: "🇪🇸", native: "Galego" },
  { code: "ka", name: "Georgian",          flag: "🇬🇪", native: "ქართული" },
  { code: "de", name: "German",            flag: "🇩🇪", native: "Deutsch" },
  { code: "el", name: "Greek",             flag: "🇬🇷", native: "Ελληνικά" },
  { code: "gu", name: "Gujarati",          flag: "🇮🇳", native: "ગુજરાતી" },
  { code: "ht", name: "Haitian Creole",    flag: "🇭🇹", native: "Kreyòl ayisyen" },
  { code: "ha", name: "Hausa",             flag: "🇳🇬", native: "Hausa" },
  { code: "he", name: "Hebrew",            flag: "🇮🇱", native: "עברית", rtl: true },
  { code: "hi", name: "Hindi",             flag: "🇮🇳", native: "हिंदी" },
  { code: "hu", name: "Hungarian",         flag: "🇭🇺", native: "Magyar" },
  { code: "is", name: "Icelandic",         flag: "🇮🇸", native: "Íslenska" },
  { code: "ig", name: "Igbo",              flag: "🇳🇬", native: "Igbo" },
  { code: "id", name: "Indonesian",        flag: "🇮🇩", native: "Bahasa Indonesia" },
  { code: "ga", name: "Irish",             flag: "🇮🇪", native: "Gaeilge" },
  { code: "it", name: "Italian",           flag: "🇮🇹", native: "Italiano" },
  { code: "ja", name: "Japanese",          flag: "🇯🇵", native: "日本語" },
  { code: "jv", name: "Javanese",          flag: "🇮🇩", native: "Basa Jawa" },
  { code: "kn", name: "Kannada",           flag: "🇮🇳", native: "ಕನ್ನಡ" },
  { code: "kk", name: "Kazakh",            flag: "🇰🇿", native: "Қазақша" },
  { code: "km", name: "Khmer",             flag: "🇰🇭", native: "ខ្មែរ" },
  { code: "rw", name: "Kinyarwanda",       flag: "🇷🇼", native: "Ikinyarwanda" },
  { code: "ko", name: "Korean",            flag: "🇰🇷", native: "한국어" },
  { code: "ku", name: "Kurdish",           flag: "🇮🇶", native: "Kurdî" },
  { code: "ky", name: "Kyrgyz",            flag: "🇰🇬", native: "Кыргызча" },
  { code: "lo", name: "Lao",               flag: "🇱🇦", native: "ລາວ" },
  { code: "lv", name: "Latvian",           flag: "🇱🇻", native: "Latviešu" },
  { code: "lt", name: "Lithuanian",        flag: "🇱🇹", native: "Lietuvių" },
  { code: "lb", name: "Luxembourgish",     flag: "🇱🇺", native: "Lëtzebuergesch" },
  { code: "mk", name: "Macedonian",        flag: "🇲🇰", native: "Македонски" },
  { code: "mg", name: "Malagasy",          flag: "🇲🇬", native: "Malagasy" },
  { code: "ms", name: "Malay",             flag: "🇲🇾", native: "Bahasa Melayu" },
  { code: "ml", name: "Malayalam",         flag: "🇮🇳", native: "മലയാളം" },
  { code: "mt", name: "Maltese",           flag: "🇲🇹", native: "Malti" },
  { code: "mi", name: "Maori",             flag: "🇳🇿", native: "Māori" },
  { code: "mr", name: "Marathi",           flag: "🇮🇳", native: "मराठी" },
  { code: "mn", name: "Mongolian",         flag: "🇲🇳", native: "Монгол" },
  { code: "my", name: "Myanmar (Burmese)", flag: "🇲🇲", native: "မြန်မာဘာသာ" },
  { code: "ne", name: "Nepali",            flag: "🇳🇵", native: "नेपाली" },
  { code: "no", name: "Norwegian",         flag: "🇳🇴", native: "Norsk" },
  { code: "ny", name: "Nyanja (Chichewa)", flag: "🇲🇼", native: "Nyanja" },
  { code: "or", name: "Odia",              flag: "🇮🇳", native: "ଓଡ଼ିଆ" },
  { code: "ps", name: "Pashto",            flag: "🇦🇫", native: "پښتو", rtl: true },
  { code: "fa", name: "Persian",           flag: "🇮🇷", native: "فارسی", rtl: true },
  { code: "pl", name: "Polish",            flag: "🇵🇱", native: "Polski" },
  { code: "pt", name: "Portuguese",        flag: "🇵🇹", native: "Português" },
  { code: "pa", name: "Punjabi",           flag: "🇮🇳", native: "ਪੰਜਾਬੀ" },
  { code: "ro", name: "Romanian",          flag: "🇷🇴", native: "Română" },
  { code: "ru", name: "Russian",           flag: "🇷🇺", native: "Русский" },
  { code: "sm", name: "Samoan",            flag: "🇼🇸", native: "Samoa" },
  { code: "sr", name: "Serbian",           flag: "🇷🇸", native: "Српски" },
  { code: "sn", name: "Shona",             flag: "🇿🇼", native: "chiShona" },
  { code: "sd", name: "Sindhi",            flag: "🇵🇰", native: "سنڌي", rtl: true },
  { code: "si", name: "Sinhala",           flag: "🇱🇰", native: "සිංහල" },
  { code: "sk", name: "Slovak",            flag: "🇸🇰", native: "Slovenčina" },
  { code: "sl", name: "Slovenian",         flag: "🇸🇮", native: "Slovenščina" },
  { code: "so", name: "Somali",            flag: "🇸🇴", native: "Soomaali" },
  { code: "st", name: "Sotho",             flag: "🇿🇦", native: "Sesotho" },
  { code: "es", name: "Spanish",           flag: "🇪🇸", native: "Español" },
  { code: "su", name: "Sundanese",         flag: "🇮🇩", native: "Basa Sunda" },
  { code: "sw", name: "Swahili",           flag: "🇰🇪", native: "Kiswahili" },
  { code: "sv", name: "Swedish",           flag: "🇸🇪", native: "Svenska" },
  { code: "tg", name: "Tajik",             flag: "🇹🇯", native: "Тоҷикӣ" },
  { code: "ta", name: "Tamil",             flag: "🇮🇳", native: "தமிழ்" },
  { code: "tt", name: "Tatar",             flag: "🇷🇺", native: "Татарча" },
  { code: "te", name: "Telugu",            flag: "🇮🇳", native: "తెలుగు" },
  { code: "th", name: "Thai",              flag: "🇹🇭", native: "ภาษาไทย" },
  { code: "tr", name: "Turkish",           flag: "🇹🇷", native: "Türkçe" },
  { code: "tk", name: "Turkmen",           flag: "🇹🇲", native: "Türkmençe" },
  { code: "uk", name: "Ukrainian",         flag: "🇺🇦", native: "Українська" },
  { code: "ur", name: "Urdu",              flag: "🇵🇰", native: "اردو", rtl: true },
  { code: "uz", name: "Uzbek",             flag: "🇺🇿", native: "O'zbek" },
  { code: "vi", name: "Vietnamese",        flag: "🇻🇳", native: "Tiếng Việt" },
  { code: "cy", name: "Welsh",             flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", native: "Cymraeg" },
  { code: "xh", name: "Xhosa",             flag: "🇿🇦", native: "isiXhosa" },
  { code: "yi", name: "Yiddish",           flag: "🇮🇱", native: "ייִדיש", rtl: true },
  { code: "yo", name: "Yoruba",            flag: "🇳🇬", native: "Yorùbá" },
  { code: "zu", name: "Zulu",              flag: "🇿🇦", native: "isiZulu" },
];

// ── Account / sync / paid-pass strings (optional features) ──────────
// Kept separate from the main UI dictionary for clarity. Accessed with the
// same active language code; RTL is handled by the existing dir="rtl" logic.


// ── Landing-page / site-chrome translations (full-site i18n, phase 1) ──
// Keyed by interface language (en/fr/es/ar/de). Access via LANDING_UI[lang].

// ── Resume-builder chrome translations (full-site i18n, phase 2) ──

// ── Cover-letter-builder chrome translations (full-site i18n, phase 3) ──

// ── ATS Checker / Job Tracker / Master Profile translations (phase 4) ──
// ── Toast / status-message translations (phase 5) ──
// ── Modal translations (upload-resume + feedback) (phase 5) ──
// ── Landing marketing-body translations (phase 6) ──
// ── Site-footer translations (phase 7) ──

// ── Templates ─────────────────────────────────────────────────────
const TEMPLATE_GALLERY_META = {
  classic: {
    description: "A traditional one-column resume with formal typography and generous section spacing.",
    bestFor: "Best for finance, government, legal, education, and conservative applications.",
    attributes: ["ATS-friendly", "One-column", "Traditional"],
    layout: "One-column",
    filters: ["ats", "one", "traditional", "rtl"],
  },
  modern: {
    description: "A balanced two-column layout designed for clear scanning and flexible content.",
    bestFor: "Best for product, technology, marketing, operations, and general professional roles.",
    attributes: ["Recommended", "ATS-friendly", "Two-column"],
    layout: "Two-column",
    filters: ["recommended", "ats", "two", "modern", "rtl"],
  },
  minimal: {
    description: "A spacious one-column layout that keeps attention on experience and achievements.",
    bestFor: "Best for writing, consulting, research, and text-focused applications.",
    attributes: ["ATS-friendly", "One-column", "Minimal"],
    layout: "One-column",
    filters: ["recommended", "ats", "one", "modern", "rtl"],
  },
  bold: {
    description: "A confident header-led design with strong contrast and a compact content rhythm.",
    bestFor: "Best for sales, leadership, brand, and applications with concise experience.",
    attributes: ["Compact", "Strong header", "RTL-friendly"],
    layout: "One-column",
    filters: ["compact", "modern", "rtl"],
  },
  elegant: {
    description: "A refined serif resume with subtle rules and a polished editorial feel.",
    bestFor: "Best for legal, academic, editorial, executive, and senior professional roles.",
    attributes: ["One-column", "Traditional", "Refined"],
    layout: "One-column",
    filters: ["one", "traditional"],
  },
  executive: {
    description: "A structured leadership resume with strong section hierarchy and restrained accents.",
    bestFor: "Best for senior professionals, management, finance, and leadership roles.",
    attributes: ["Recommended", "Two-column", "Executive"],
    layout: "Two-column",
    filters: ["recommended", "two", "traditional", "modern"],
  },
  creative: {
    description: "A distinctive design with a color panel and clear separation for profile details.",
    bestFor: "Best for design, brand, communications, and creative portfolios.",
    attributes: ["Two-column", "Creative", "RTL-friendly"],
    layout: "Two-column",
    filters: ["two", "modern", "rtl"],
  },
  tech: {
    description: "A technical visual style with monospace details and a developer-focused tone.",
    bestFor: "Best for engineering portfolios and technical profiles that need a distinctive look.",
    attributes: ["Compact", "Technical", "Distinctive"],
    layout: "One-column",
    filters: ["compact", "modern"],
  },
  sharp: {
    description: "A crisp corporate layout with black-and-white hierarchy and minimal ornament.",
    bestFor: "Best for consulting, business, finance, and formal applications.",
    attributes: ["ATS-friendly", "Compact", "Corporate"],
    layout: "One-column",
    filters: ["ats", "compact", "traditional"],
  },
  slate: {
    description: "A polished sidebar layout with a dark navigation column and warm accents.",
    bestFor: "Best for experienced professionals who want a structured, premium presentation.",
    attributes: ["Two-column", "Compact", "Premium"],
    layout: "Two-column",
    filters: ["two", "compact", "modern"],
  },
  prism: {
    description: "A modern resume with an energetic header treatment and clean content blocks.",
    bestFor: "Best for startup, growth, product, and marketing applications.",
    attributes: ["Two-column", "Modern", "Expressive"],
    layout: "Two-column",
    filters: ["two", "modern"],
  },
  compact: {
    description: "A high-density two-column template built to fit more experience on one page.",
    bestFor: "Best for content-heavy resumes, contractors, and experienced applicants.",
    attributes: ["ATS-friendly", "Two-column", "Compact"],
    layout: "Two-column",
    filters: ["recommended", "ats", "two", "compact", "rtl"],
  },
  horizon: {
    description: "A centered banner header with strong first-impression hierarchy.",
    bestFor: "Best for management, operations, sales, and general professional resumes.",
    attributes: ["Two-column", "Modern", "Header-led"],
    layout: "Two-column",
    filters: ["two", "modern"],
  },
  nordic: {
    description: "A calm Scandinavian-inspired resume with wide margins and a light editorial tone.",
    bestFor: "Best for research, design strategy, consulting, and academic-adjacent roles.",
    attributes: ["One-column", "Minimal", "Refined"],
    layout: "One-column",
    filters: ["one", "traditional"],
  },
  dusk: {
    description: "A dark paper concept for portfolios and profiles where presentation matters.",
    bestFor: "Best for creative portfolios and non-traditional applications.",
    attributes: ["Distinctive", "Modern", "Portfolio"],
    layout: "One-column",
    filters: ["modern"],
  },
  vertex: {
    description: "A reversed two-column layout with strong contact hierarchy and crisp dividers.",
    bestFor: "Best for product, engineering, design, and modern business roles.",
    attributes: ["Two-column", "Modern", "Structured"],
    layout: "Two-column",
    filters: ["two", "modern"],
  },
  academy: {
    description: "An academic CV format with classic typography and formal section rules.",
    bestFor: "Best for education, research, publications, and academic applications.",
    attributes: ["ATS-friendly", "One-column", "Academic"],
    layout: "One-column",
    filters: ["recommended", "ats", "one", "traditional"],
  },
  spark: {
    description: "A vibrant professional layout with visible section bands and compact structure.",
    bestFor: "Best for sales, marketing, startups, and energetic professional profiles.",
    attributes: ["Two-column", "Compact", "Modern"],
    layout: "Two-column",
    filters: ["two", "compact", "modern"],
  },
  stone: {
    description: "A warm gray serif template with understated hierarchy and conservative spacing.",
    bestFor: "Best for consulting, administration, policy, and traditional applications.",
    attributes: ["One-column", "Traditional", "Refined"],
    layout: "One-column",
    filters: ["one", "traditional"],
  },
  ivy: {
    description: "A British CV-inspired layout with double rules and formal serif typography.",
    bestFor: "Best for academic, legal, education, and UK-style applications.",
    attributes: ["One-column", "Traditional", "CV style"],
    layout: "One-column",
    filters: ["one", "traditional"],
  },
  carbon: {
    description: "A charcoal sidebar design with square profile hierarchy and concise sections.",
    bestFor: "Best for technology, operations, leadership, and content-dense resumes.",
    attributes: ["Two-column", "Compact", "Modern"],
    layout: "Two-column",
    filters: ["two", "compact", "modern"],
  },
  pulse: {
    description: "A startup-ready layout with a gradient rail and fast-scanning content blocks.",
    bestFor: "Best for product, growth, technology, and modern business roles.",
    attributes: ["Two-column", "Modern", "Flexible"],
    layout: "Two-column",
    filters: ["two", "modern"],
  },
};

// Maps the finite English attribute/layout vocabulary used across the template
// gallery to builder i18n keys, so chips render in the active UI language
// (FR/EN/AR) instead of leaking English. Terms already localized by a
// template's gallery.{fr,ar} data (e.g. "Maroc", "FR/AR") simply fall through
// unchanged. Keep in sync with the attr* keys in i18n/namespaces/*/builder.js.
const TEMPLATE_ATTR_I18N_KEY = {
  "Recommended": "attrRecommended", "ATS-friendly": "attrAtsFriendly",
  "ATS-safe": "attrAtsSafe", "ATS-first": "attrAtsFirst",
  "One-column": "attrOneColumn", "Two-column": "attrTwoColumn",
  "Traditional": "attrTraditional", "Minimal": "attrMinimal",
  "Compact": "attrCompact", "Strong header": "attrStrongHeader",
  "RTL-friendly": "attrRtlFriendly", "RTL-ready": "attrRtlReady",
  "Executive": "attrExecutive", "Creative": "attrCreative",
  "Technical": "attrTechnical", "Distinctive": "attrDistinctive",
  "Corporate": "attrCorporate", "Premium": "attrPremium",
  "Modern": "attrModern", "Expressive": "attrExpressive",
  "Header-led": "attrHeaderLed", "Refined": "attrRefined",
  "Academic": "attrAcademic", "Structured": "attrStructured",
  "CV style": "attrCvStyle", "Portfolio": "attrPortfolio",
  "Flexible": "attrFlexible", "Professional": "attrProfessional",
  "Plain text": "attrPlainText", "Sidebar": "attrSidebar",
  "Skills sidebar": "attrSkillsSidebar", "Readable": "attrReadable",
  "Serif": "attrSerif", "Formal": "attrFormal",
  "Conservative": "attrConservative", "Rules": "attrRules",
  "Chronological": "attrChronological", "No photo": "attrNoPhoto",
  "Photo optional": "attrPhotoOptional", "Canada": "attrCanada",
  "France": "attrFrance", "Morocco": "attrMorocco",
  "Gulf": "attrGulf", "International": "attrInternational",
};
// Localize a single attribute/layout term; passes through anything already
// localized or outside the known vocabulary (e.g. "FR/AR", locale codes).
const localizeTemplateTerm = (term, bu) => bu?.[TEMPLATE_ATTR_I18N_KEY[term]] || term;

const TEMPLATE_QUICK_FILTERS = [
  { id: "all", label: "All" },
  { id: "recommended", label: "Recommended" },
  { id: "ats", label: "ATS-friendly" },
  { id: "one", label: "One-column" },
  { id: "two", label: "Two-column" },
];

const TEMPLATE_MORE_FILTERS = [
  { id: "compact", label: "Compact" },
  { id: "traditional", label: "Traditional" },
  { id: "modern", label: "Modern" },
  { id: "rtl", label: "RTL-friendly" },
];

const TEMPLATE_COUNTRY_FILTERS = ["all", ...TEMPLATE_COUNTRIES];

// ── Per-template thumbnail samples (6 visible slots on landing) ───
const THUMB_SAMPLES = {
  classic: {
    rtl: true,
    result: {
      name: "يوسف الأمين",
      title: "مهندس برمجيات أول",
      contact: ["youssef@example.com", "+212 661 234 567", "الدار البيضاء، المغرب"],
      summary: "مهندس برمجيات بخبرة تزيد عن عشر سنوات في تطوير تطبيقات الويب والأنظمة الموزعة. متخصص في هندسة الخدمات المصغرة وقواعد البيانات عالية الأداء.",
      sections: [
        { heading: "الخبرة المهنية", items: [
          "كبير مهندسي البرمجيات — مجموعة OCP (2020–الحاضر)",
          "قاد تطوير منصة إدارة البيانات الصناعية لأكثر من 3000 مستخدم",
          "بنى نظام مراقبة في الوقت الفعلي خفّض الأعطال بنسبة 60٪",
          "مهندس برمجيات — Inwi (2016–2020)",
          "بنى نظام الفوترة في الوقت الفعلي لأكثر من 10 ملايين مشترك",
        ]},
        { heading: "المهارات", items: ["Python", "Node.js", "React", "PostgreSQL", "Docker", "Kubernetes"] },
        { heading: "التعليم", items: ["ماجستير علوم الحاسوب — Université Mohammed V، الرباط — 2016"] },
        { heading: "اللغات", items: ["العربية (اللغة الأم)", "الفرنسية (طليق)", "الإنجليزية (محترف)"] },
      ],
    },
  },
  modern: {
    rtl: false,
    result: {
      name: "Léa Tremblay",
      title: "Responsable Marketing Digital",
      contact: ["lea.tremblay@example.com", "+33 6 12 34 56 78", "Paris, France", "linkedin.com/in/leatremblay"],
      summary: "Responsable marketing digital avec 7 ans d'expérience en acquisition client, stratégie de contenu et gestion de campagnes multicanal. Spécialisée dans les startups SaaS B2B.",
      sections: [
        { heading: "Expérience", items: [
          "Head of Marketing — Payfit (2021–présent)",
          "Augmenté le trafic organique de 180 % en 18 mois",
          "Géré un budget publicitaire annuel de 2 M€ sur Google, LinkedIn et Meta",
          "Marketing Manager — Doctolib (2017–2021)",
          "Lancé 4 nouveaux marchés européens en 2 ans",
          "Constitué l'équipe marketing de 2 à 14 personnes",
        ]},
        { heading: "Compétences", items: ["SEO/SEA", "Google Analytics", "HubSpot", "Salesforce", "Copywriting", "AB Testing"] },
        { heading: "Formation", items: ["Master Marketing Digital — ESCP Business School, Paris — 2017"] },
        { heading: "Langues", items: ["Français (langue maternelle)", "Anglais (TOEFL 110)", "Espagnol (intermédiaire)"] },
      ],
    },
  },
  minimal: {
    rtl: false,
    result: {
      name: "Sarah Okonkwo",
      title: "Software Engineer",
      contact: ["s.okonkwo@example.com", "+44 7700 900 142", "London, UK", "github.com/sokonkwo"],
      summary: "Full-stack engineer with 5 years building scalable web apps for fintech and e-commerce. Strong in React, Python, and cloud infrastructure.",
      sections: [
        { heading: "Experience", items: [
          "Software Engineer — Monzo Bank (2022–Present)",
          "Built real-time fraud detection pipeline processing 1M+ daily transactions",
          "Reduced API latency by 40% through Redis caching strategy",
          "Junior Engineer — Jumia (2019–2022)",
          "Developed seller portal used by 120,000 merchants across Africa",
        ]},
        { heading: "Skills", items: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "AWS", "Terraform"] },
        { heading: "Education", items: ["B.Sc. Computer Science — University of Lagos, 2019"] },
      ],
    },
  },
  bold: {
    rtl: false,
    result: {
      name: "Karim Benali",
      title: "Ingénieur Génie Civil | BTP",
      contact: ["k.benali@example.com", "+213 555 123 456", "Alger, Algérie"],
      summary: "Ingénieur génie civil avec 9 ans d'expérience en gestion de projets d'infrastructure à grande échelle. Expert en calculs de structures et coordination de chantiers.",
      sections: [
        { heading: "Expérience", items: [
          "Chef de Projet — Cosider Groupe (2018–présent)",
          "Supervisé la construction d'un complexe résidentiel de 450 logements (120 M€)",
          "Coordonné 60 sous-traitants sur un chantier de 4 ans",
          "Ingénieur Structures — Colas Algérie (2015–2018)",
          "Conçu les fondations de l'autoroute Est-Ouest, tronçon Sétif–Constantine",
        ]},
        { heading: "Compétences", items: ["AutoCAD", "Revit", "ETABS", "Béton précontraint", "Eurocodes", "MS Project"] },
        { heading: "Formation", items: ["Diplôme d'ingénieur — École Nationale Polytechnique, Alger — 2015"] },
      ],
    },
  },
  elegant: {
    rtl: false,
    result: {
      name: "María García López",
      title: "Diseñadora UX Senior",
      contact: ["maria.garcia@example.com", "+34 612 345 678", "Barcelona, España"],
      summary: "Diseñadora UX con 6 años de experiencia creando productos digitales centrados en el usuario para empresas de retail, banca y salud digital.",
      sections: [
        { heading: "Experiencia", items: [
          "UX Lead — Glovo (2021–actualidad)",
          "Rediseñó el flujo de checkout, aumentando la conversión un 22%",
          "Lideró equipo de 5 diseñadoras en 3 mercados simultáneos",
          "Diseñadora UX — CaixaBank (2018–2021)",
          "Dirigió el rediseño de la app móvil con 3M de usuarios activos",
        ]},
        { heading: "Habilidades", items: ["Figma", "Adobe XD", "Investigación de usuarios", "Sistemas de diseño", "HTML/CSS"] },
        { heading: "Formación", items: ["Máster en Diseño de Interacción — IED Barcelona — 2018"] },
        { heading: "Idiomas", items: ["Español (nativo)", "Catalán (nativo)", "Inglés (C1)", "Francés (B2)"] },
      ],
    },
  },
  executive: {
    rtl: false,
    result: {
      name: "David Chen",
      title: "Chief Financial Officer",
      contact: ["d.chen@example.com", "+65 9123 4567", "Singapore", "linkedin.com/in/davidchen-cfo"],
      summary: "CFO with 18 years leading finance at high-growth technology companies across APAC. Track record of IPO preparation, M&A, and scaling finance teams from 5 to 50+.",
      sections: [
        { heading: "Experience", items: [
          "CFO — Sea Limited (2019–Present)",
          "Managed $4.2B annual revenue across Shopee, Garena, and SeaMoney",
          "Led Singapore Exchange dual listing, raising $2.1B in 2021",
          "VP Finance — Grab (2015–2019)",
          "Built financial infrastructure supporting expansion to 8 countries",
        ]},
        { heading: "Skills", items: ["Financial Modeling", "M&A Integration", "Investor Relations", "FP&A", "IFRS", "Power BI"] },
        { heading: "Education", items: ["MBA — INSEAD (Fontainebleau) — 2007", "B.Com. Accounting — NUS Business School — 2003"] },
      ],
    },
  },
  creative: {
    rtl: true,
    result: {
      name: "نادية مالك",
      title: "مصممة تجربة مستخدم",
      contact: ["nadia@example.com", "+213 770 123 456", "الجزائر العاصمة"],
      summary: "مصممة تجربة مستخدم بخبرة 6 سنوات في تصميم واجهات المستخدم للتطبيقات المحمولة وتجارة التجزئة الرقمية. متخصصة في تصميم لغات العربية وتجربة المستخدم ثنائي الاتجاه.",
      sections: [
        { heading: "الخبرة", items: [
          "مصممة رئيسية — Yassir (2022–الحاضر)",
          "أعادت تصميم تطبيق المشاركة برمجيًا لزيادة التقييمات بنسبة 35٪",
          "مصممة UI/UX — Algérie Télécom (2018–2022)",
          "بنت نظام التصميم لتطبيق Idoom Fibre المستخدم من 2M مشترك",
        ]},
        { heading: "المهارات", items: ["Figma", "Illustrator", "UX Research", "تصميم RTL", "Prototyping"] },
        { heading: "التعليم", items: ["بكالوريوس إعلام آلي — ESI Alger — 2018"] },
      ],
    },
  },
  tech: {
    rtl: false,
    result: {
      name: "Ahmed El-Sayed",
      title: "DevOps Engineer",
      contact: ["ahmed@example.com", "+20 100 234 5678", "Cairo, Egypt", "github.com/aelsayed"],
      summary: "DevOps engineer with 7 years automating infrastructure and CI/CD pipelines for fintech and e-commerce platforms across the MENA region.",
      sections: [
        { heading: "Experience", items: [
          "Senior DevOps — Fawry (2021–Present)",
          "Reduced deployment time from 4h to 18min via GitHub Actions + Terraform",
          "Maintained 99.98% uptime for payment gateway processing $200M/month",
          "DevOps Engineer — Souq.com/Amazon (2017–2021)",
          "Migrated 140 microservices to Kubernetes on AWS EKS",
        ]},
        { heading: "Skills", items: ["Kubernetes", "Terraform", "AWS", "Docker", "GitHub Actions", "Prometheus", "Go", "Python"] },
        { heading: "Education", items: ["B.Sc. Computer Engineering — Cairo University — 2017"] },
      ],
    },
  },
  sharp: {
    rtl: false,
    result: {
      name: "Catherine Morrison",
      title: "Corporate Solicitor",
      contact: ["c.morrison@example.com", "+44 20 7946 0102", "London, UK"],
      summary: "Corporate solicitor with 9 years advising on M&A, private equity, and commercial contracts. Qualified in England & Wales. Experience across UK, France, and UAE jurisdictions.",
      sections: [
        { heading: "Experience", items: [
          "Senior Associate — Linklaters LLP (2019–Present)",
          "Led legal due diligence on £1.2B acquisition of Aviva's Italian subsidiary",
          "Drafted and negotiated 40+ SPAs in a single calendar year",
          "Associate — Clifford Chance (2015–2019)",
          "Advised GPs on fund formation for three private equity vehicles totalling £800M",
        ]},
        { heading: "Education", items: ["LPC — BPP University Law School — 2014", "LLB — University of Edinburgh — 2013"] },
        { heading: "Admissions", items: ["Solicitor of England & Wales — 2015", "DIFC registered legal practitioner — 2020"] },
      ],
    },
  },
  nordic: {
    rtl: false,
    result: {
      name: "Erik Lindström",
      title: "Arkitekt | MNAL",
      contact: ["erik@example.com", "+47 400 12 345", "Oslo, Norge"],
      summary: "Arkitekt med 11 års erfaring innen bærekraftig boligbygging og offentlige bygg. Spesialist på passivhus-standarder og BREEAM-sertifisering.",
      sections: [
        { heading: "Erfaring", items: [
          "Prosjektarkitekt — Snøhetta (2019–nå)",
          "Ledet designteam for nytt kulturhus i Bergen (NOK 420M)",
          "Arkitekt — Rambøll Norge (2013–2019)",
          "Tegnet 14 BREEAM Excellent-sertifiserte kontorbygg",
        ]},
        { heading: "Ferdigheter", items: ["Revit", "ArchiCAD", "Rhino", "BREEAM", "Passivhus", "BIM"] },
        { heading: "Utdanning", items: ["Master i arkitektur — NTNU, Trondheim — 2013"] },
        { heading: "Språk", items: ["Norsk (morsmål)", "Engelsk (flytende)", "Svensk (funksjonelt)"] },
      ],
    },
  },
  slate: {
    rtl: false,
    result: {
      name: "Chidinma Obi",
      title: "Finance Manager",
      contact: ["c.obi@example.com", "+33 6 78 90 12 34", "Paris, France"],
      summary: "Finance manager with 8 years in investment banking and corporate finance across West Africa and France. CFA Charterholder. Fluent in English, French, and Igbo.",
      sections: [
        { heading: "Experience", items: [
          "Finance Manager — Total Energies (2021–Present)",
          "Managed $320M annual capex budget across 6 African subsidiaries",
          "Led IFRS 16 transition project, restating 3 years of lease obligations",
          "Associate — BNP Paribas (2016–2021)",
          "Structured project finance deals totalling $1.8B in Sub-Saharan Africa",
        ]},
        { heading: "Skills", items: ["Financial Modeling", "IFRS", "Bloomberg", "SAP", "Power BI", "VBA"] },
        { heading: "Education", items: ["MSc Finance — HEC Paris — 2016", "BSc Economics — University of Lagos — 2014"] },
        { heading: "Certifications", items: ["CFA Charterholder — 2020"] },
      ],
    },
  },
  horizon: {
    rtl: false,
    result: {
      name: "Aïsha Diallo",
      title: "Directrice des Ressources Humaines",
      contact: ["a.diallo@example.com", "+221 77 123 45 67", "Dakar, Sénégal"],
      summary: "DRH avec 10 ans d'expérience dans les télécommunications et le secteur bancaire en Afrique subsaharienne. Spécialisée dans la transformation RH et la gestion des talents en contexte multiculturel.",
      sections: [
        { heading: "Expérience", items: [
          "DRH — Wave Mobile Money (2021–présent)",
          "Mis en place la politique RH pour 800 employés au Sénégal, Côte d'Ivoire et Mali",
          "Responsable RH — Société Générale Sénégal (2014–2021)",
          "Réduit le turnover de 28 % à 11 % en 3 ans via le programme de fidélisation",
        ]},
        { heading: "Compétences", items: ["SIRH (SAP HCM)", "Recrutement", "Formation", "Relations sociales", "Droit du travail OHADA"] },
        { heading: "Formation", items: ["Master RH — Université Paris-Dauphine — 2013"] },
        { heading: "Langues", items: ["Français (bilingue)", "Anglais (C1)", "Wolof (courant)"] },
      ],
    },
  },
  prism: {
    rtl: false,
    result: {
      name: "Priya Sharma",
      title: "Senior Product Manager",
      contact: ["priya.sharma@example.com", "+91 98765 43210", "Bangalore, India", "linkedin.com/in/priyasharma-pm"],
      summary: "Senior PM with 7 years building B2B SaaS products at scale. Led 0→1 launches for payments and analytics verticals, growing ARR from $2M to $28M in two product cycles.",
      sections: [
        { heading: "Experience", items: [
          "Senior Product Manager — Razorpay (2021–Present)",
          "Launched RazorpayX Payroll, onboarding 4,000+ businesses in year one",
          "Reduced payment failure rate by 22% through ML-driven retry logic",
          "Product Manager — Freshworks (2017–2021)",
          "Owned Freshdesk's Analytics module, adding $4.2M in net-new ARR",
        ]},
        { heading: "Skills", items: ["Product Strategy", "SQL", "Mixpanel", "JIRA", "A/B Testing", "Go-to-market"] },
        { heading: "Education", items: ["MBA — IIM Bangalore — 2017", "B.Tech CS — NIT Trichy — 2015"] },
      ],
    },
  },
};

const THUMB_SAMPLE_LANG = {
  classic: "ar",
  modern: "fr",
  minimal: "en",
  bold: "fr",
  elegant: "es",
  executive: "en",
  creative: "ar",
  tech: "en",
  sharp: "en",
  nordic: "no",
  slate: "en",
  horizon: "fr",
  prism: "en",
};

function sampleLangForTemplate(template) {
  return THUMB_SAMPLES[template?.id]?.lang || THUMB_SAMPLE_LANG[template?.id] || "en";
}

// ── Sample data used in template thumbnail previews ───────────────
const SAMPLE_RESUME = {
  name: "Alexandra Johnson",
  title: "Senior Product Designer",
  contact: ["alex.johnson@email.com", "+1 (415) 555-0192", "San Francisco, CA", "linkedin.com/in/alexjohnson"],
  summary: "Creative product designer with 8+ years crafting intuitive digital experiences for SaaS and consumer apps. Passionate about human-centered design, design systems, and cross-functional collaboration. Proven track record of shipping products that delight users and drive measurable business results.",
  sections: [
    { heading: "Experience", items: [
      "Lead Product Designer — Stripe (2021–Present)",
      "Redesigned onboarding flow, reducing drop-off by 34% across 2M+ merchants",
      "Directed design of the Stripe Dashboard v3, increasing daily active usage by 28%",
      "Mentored a team of 5 junior designers and established quarterly design critiques",
      "Collaborated with PMs and engineers to build a reusable component library in Figma",
      "Senior UX Designer — Figma (2018–2021)",
      "Created the core design system adopted across 200+ engineers and 40 product squads",
      "Shipped 12 major features including multiplayer cursors and auto-layout",
      "Increased onboarding completion rate from 52% to 79% through iterative A/B testing",
      "UX Designer — Airbnb (2016–2018)",
      "Redesigned the host dashboard, cutting support tickets related to listings by 41%",
      "Led end-to-end research and design for the mobile booking confirmation flow",
    ]},
    { heading: "Education", items: [
      "B.S. Human-Computer Interaction — Stanford University, 2016",
      "Minor in Computer Science — GPA 3.9 / 4.0",
      "Dean's List — 6 consecutive semesters",
    ]},
    { heading: "Skills", items: [
      "Figma", "Prototyping", "User Research", "Usability Testing",
      "Design Systems", "Information Architecture", "React", "TypeScript", "CSS",
    ]},
    { heading: "Languages", items: ["English (native)", "French (professional)", "Spanish (conversational)"] },
    { heading: "Certifications", items: [
      "Google UX Design Professional Certificate — 2022",
      "AWS Certified Cloud Practitioner — 2023",
      "Nielsen Norman Group UX Certification — 2020",
    ]},
    { heading: "Projects", items: [
      "DesignMetrics.io — SaaS tool to track design KPIs, 1,200+ active users",
      "Open-source Figma plugin for accessibility auditing — 8,400 installs",
    ]},
  ],
};

// ── Cover letter templates ────────────────────────────────────────
const COVER_GALLERY_META = {
  blank: {
    description: "A plain-text letter for conservative applications and easy copying.",
    attributes: ["Plain text", "Flexible"],
  },
  classic: {
    description: "A formal block-letter layout with traditional spacing and serif type.",
    attributes: ["Traditional", "Formal"],
  },
  modern: {
    description: "A polished sidebar layout that pairs well with modern resume templates.",
    attributes: ["Recommended", "Sidebar"],
  },
  minimal: {
    description: "A spacious letter style focused on clean reading and simple hierarchy.",
    attributes: ["Minimal", "Readable"],
  },
  bold: {
    description: "A confident accent-header design for concise, high-impact applications.",
    attributes: ["Header-led", "Distinctive"],
  },
  elegant: {
    description: "A refined cover letter with soft sidebar details and editorial typography.",
    attributes: ["Refined", "Serif"],
  },
};

const SAMPLE_COVER = {
  name: "Alexandra Johnson", jobTitle: "Senior Product Designer",
  email: "alex.johnson@email.com", phone: "+1 415 555 0192", location: "San Francisco, CA",
  date: "June 26, 2026",
  recipientName: "Mr. David Chen", recipientTitle: "Head of Design",
  company: "Stripe", companyAddress: "354 Oyster Point Blvd, South San Francisco, CA",
  subject: "Senior Product Designer Position",
  opening: "Mr. Chen",
  body: "I am writing to express my strong interest in the Senior Product Designer position at Stripe. With eight years of experience crafting intuitive digital experiences for high-growth SaaS companies, I am confident in my ability to contribute meaningfully to your team.\n\nAt Figma, I led the redesign of the core editor interface, shipping 12 major features that improved user satisfaction by 40%. I also established a company-wide design system adopted by 200+ engineers across 40 product squads. Prior to that, at Airbnb, I redesigned the host dashboard and reduced support tickets by 41% through research-driven iteration.\n\nStripe's commitment to making financial infrastructure simple and trustworthy resonates deeply with my design philosophy. I am excited by the challenge of bringing clarity to complex financial flows for millions of merchants worldwide.",
  closing: "Thank you sincerely for your time and consideration. I would welcome the opportunity to discuss how my background in design systems and cross-functional leadership can contribute to Stripe's mission.",
  signoff: "Sincerely,",
};

const COVER_THUMB_SAMPLES = {
  classic: {
    name: "Léa Tremblay", jobTitle: "Responsable Marketing Digital",
    email: "lea.tremblay@example.com", phone: "+33 6 12 34 56 78", location: "Paris, France",
    date: "27 juin 2026",
    recipientName: "Mme Dubois", recipientTitle: "Directrice Marketing",
    company: "Payfit", companyAddress: "9 rue du Mail, 75002 Paris",
    subject: "Candidature — Responsable Marketing Digital",
    opening: "Madame Dubois",
    body: "Je me permets de vous adresser ma candidature pour le poste de Responsable Marketing Digital chez Payfit. Fort de sept années d'expérience en acquisition client et gestion de campagnes multicanal pour des startups SaaS B2B, je suis convaincu de pouvoir contribuer significativement à vos objectifs de croissance.\n\nAu cours de mon expérience chez Doctolib, j'ai lancé quatre nouveaux marchés européens en deux ans et constitué une équipe marketing de deux à quatorze personnes. J'ai également géré un budget publicitaire annuel de deux millions d'euros sur Google, LinkedIn et Meta, avec un ROAS moyen de 4,2.\n\nLa vision de Payfit, simplifier la gestion RH et paie pour les PME européennes, rejoint pleinement ma conviction que la technologie doit libérer les équipes des tâches administratives à faible valeur ajoutée.",
    closing: "Je serais ravi d'échanger avec vous sur la manière dont mon profil peut répondre aux enjeux de Payfit. Je reste disponible pour un entretien à votre convenance.",
    signoff: "Cordialement,",
  },
  modern: {
    name: "Sarah Okonkwo", jobTitle: "Software Engineer",
    email: "s.okonkwo@example.com", phone: "+44 7700 900 142", location: "London, UK",
    date: "27 June 2026",
    recipientName: "Ms Adeyemi", recipientTitle: "Engineering Manager",
    company: "Monzo Bank", companyAddress: "Broadwalk House, 5 Appold St, London EC2A 2AG",
    subject: "Software Engineer — Backend (Payments)",
    opening: "Ms Adeyemi",
    body: "I am writing to apply for the Backend Software Engineer role in the Payments team at Monzo. With five years of full-stack experience in fintech and e-commerce, and a proven track record of building resilient systems at scale, I am excited by the opportunity to work on infrastructure that millions of people rely on every day.\n\nIn my current role at Jumia, I built and maintained the seller portal used by 120,000 merchants across six African markets. I reduced average page load time by 58% and introduced an event-driven architecture that improved reliability during peak sale periods.\n\nMonzo's commitment to radical transparency and genuine financial wellbeing for its customers is exactly the culture I want to contribute to.",
    closing: "I would welcome the chance to discuss how my background in distributed systems and payments aligns with the team's current priorities.",
    signoff: "Best regards,",
  },
  minimal: {
    name: "Karim Benali", jobTitle: "Ingénieur Génie Civil",
    email: "k.benali@example.com", phone: "+213 555 123 456", location: "Alger, Algérie",
    date: "27 juin 2026",
    recipientName: "M. Amrani", recipientTitle: "Directeur Technique",
    company: "Cosider Groupe", companyAddress: "Route de Belouizdad, Alger",
    subject: "Chef de Projet BTP — Complexe Résidentiel Ouest",
    opening: "Monsieur Amrani",
    body: "Je vous soumets ma candidature pour le poste de Chef de Projet sur le chantier du complexe résidentiel Ouest. Ingénieur génie civil depuis neuf ans, j'ai coordonné des projets d'infrastructure à grande échelle impliquant des dizaines de corps de métier et des budgets dépassant les cent millions d'euros.\n\nMon expérience la plus récente chez Colas Algérie m'a permis de maîtriser les fondations sur sols complexes et les bétons à haute performance, compétences directement applicables aux contraintes géotechniques de ce projet.\n\nJe suis convaincu que mon profil et ma connaissance du contexte réglementaire algérien constituent un atout solide pour tenir les délais et garantir la qualité.",
    closing: "Je me tiens disponible pour toute discussion technique à votre convenance.",
    signoff: "Respectueusement,",
  },
  bold: {
    name: "María García López", jobTitle: "Diseñadora UX Senior",
    email: "maria.garcia@example.com", phone: "+34 612 345 678", location: "Barcelona, España",
    date: "27 de junio de 2026",
    recipientName: "Sr. Martínez", recipientTitle: "Director de Producto",
    company: "Glovo", companyAddress: "Carrer de Pallars, 65, 08005 Barcelona",
    subject: "UX Lead — Experiencia del usuario en marketplace",
    opening: "Estimado Sr. Martínez",
    body: "Me dirijo a usted para expresar mi interés en el puesto de UX Lead en el equipo de marketplace de Glovo. A lo largo de seis años diseñando productos digitales para empresas de retail, banca y salud, he desarrollado una metodología de diseño centrada en el usuario que equilibra la velocidad de entrega con la profundidad de la investigación.\n\nEn CaixaBank, lideré el rediseño de la aplicación móvil utilizada por tres millones de usuarios activos, logrando un aumento del 18 % en la puntuación NPS en seis meses. Anteriormente, rediseñé el flujo de pago de un e-commerce de moda, incrementando la conversión en un 22 %.\n\nGlovo representa para mí el reto ideal: escalar la experiencia de usuario en múltiples mercados con contextos culturales y de conectividad muy distintos.",
    closing: "Quedo a su disposición para ampliar cualquier aspecto de mi candidatura en la entrevista que considere oportuno.",
    signoff: "Atentamente,",
  },
  elegant: {
    name: "David Chen", jobTitle: "Chief Financial Officer",
    email: "d.chen@example.com", phone: "+65 9123 4567", location: "Singapore",
    date: "27 June 2026",
    recipientName: "Mr. Tan", recipientTitle: "Chairman",
    company: "Grab Holdings", companyAddress: "3 Media Close, Singapore 138498",
    subject: "CFO — Grab Holdings",
    opening: "Dear Mr. Tan",
    body: "I write to express my interest in the Chief Financial Officer position at Grab. Over eighteen years in technology-led finance across APAC, I have led functions through hypergrowth, dual listings, and complex multi-jurisdiction regulatory environments — precisely the terrain Grab navigates every quarter.\n\nAs CFO at Sea Limited, I oversaw $4.2 billion in annual revenue across three distinct verticals and led our Singapore Exchange dual listing in 2021, raising $2.1 billion. Prior to that, at Grab, I built the financial infrastructure that supported our expansion to eight countries in four years.\n\nI believe the next chapter for Grab requires a CFO who can navigate both capital markets and operational rigour simultaneously. That is the work I have spent two decades preparing to do.",
    closing: "I would welcome the opportunity to discuss how my experience aligns with Grab's priorities for the year ahead.",
    signoff: "Yours sincerely,",
  },
};

// Locale-appropriate default cover-letter sample. Prevents an English featured
// letter (Sarah Okonkwo) from showing inside a French/Arabic interface: the
// preview modal and the recommended template card pick the sample that matches
// the active UI language. Per-template thumbnails intentionally keep varied
// languages to showcase versatility; only the featured/default sample follows
// the UI locale.
const SAMPLE_COVER_BY_LANG = {
  en: SAMPLE_COVER,
  fr: COVER_THUMB_SAMPLES.classic,
  ar: {
    name: "ليلى المنصوري", jobTitle: "مديرة تسويق رقمي",
    email: "layla.mansouri@example.com", phone: "+971 50 123 4567", location: "دبي، الإمارات",
    date: "٢٧ يونيو ٢٠٢٦",
    recipientName: "السيد أحمد الهاشمي", recipientTitle: "مدير التسويق",
    company: "Careem", companyAddress: "أبراج بحيرات جميرا، دبي",
    subject: "طلب توظيف — مديرة تسويق رقمي",
    opening: "السيد الهاشمي",
    body: "يسعدني أن أتقدم بطلبي لشغل وظيفة مديرة التسويق الرقمي في Careem. بخبرة تمتد لسبع سنوات في اكتساب العملاء وإدارة الحملات متعددة القنوات لشركات التقنية الناشئة، أثق في قدرتي على الإسهام بفاعلية في تحقيق أهداف النمو لديكم.\n\nخلال عملي في مجموعة رائدة، أطلقت أربعة أسواق إقليمية جديدة خلال عامين، وطوّرت فريق تسويق من فردين إلى أربعة عشر فرداً. كما أدرت ميزانية إعلانية سنوية على Google وLinkedIn وMeta بعائد استثماري متوسط بلغ 4.2.\n\nإن رؤية Careem في تبسيط الخدمات اليومية لملايين المستخدمين في المنطقة تتوافق تماماً مع قناعتي بأن التقنية يجب أن تُيسّر حياة الناس.",
    closing: "يشرفني أن أناقش معكم كيف يمكن لخبرتي أن تخدم أولويات Careem في المرحلة المقبلة، وأبقى على استعداد لإجراء مقابلة في الوقت المناسب لكم.",
    signoff: "مع خالص التقدير،",
  },
};

// ── Author info (edit here to update the footer) ─────────────────
const AUTHOR = {
  name: "Biroue Digital Ltd",
  email: "hello@applycraft.io",
  github: "https://github.com/biroue10",
  linkedin: "", // paste your LinkedIn URL here, e.g. "https://linkedin.com/in/yourname"
};

const LANG_CODE = { en: "+1", fr: "+33", es: "+34", ar: "+212", de: "+49" };

// digits: [min, max] local digits the user types (with or without leading 0)
const COUNTRIES = [
  { flag: "🇩🇿", name: "Algeria",        code: "+213", digits: [9,  10] },
  { flag: "🇦🇷", name: "Argentina",      code: "+54",  digits: [10, 10] },
  { flag: "🇦🇺", name: "Australia",      code: "+61",  digits: [9,  10] },
  { flag: "🇦🇹", name: "Austria",        code: "+43",  digits: [7,  11] },
  { flag: "🇧🇪", name: "Belgium",        code: "+32",  digits: [9,   9] },
  { flag: "🇧🇷", name: "Brazil",         code: "+55",  digits: [10, 11] },
  { flag: "🇨🇲", name: "Cameroon",       code: "+237", digits: [9,   9] },
  { flag: "🇨🇦", name: "Canada",         code: "+1",   digits: [10, 10] },
  { flag: "🇨🇱", name: "Chile",          code: "+56",  digits: [9,   9] },
  { flag: "🇨🇳", name: "China",          code: "+86",  digits: [11, 11] },
  { flag: "🇨🇴", name: "Colombia",       code: "+57",  digits: [10, 10] },
  { flag: "🇨🇩", name: "Congo (DRC)",    code: "+243", digits: [9,  10] },
  { flag: "🇨🇮", name: "Côte d'Ivoire",  code: "+225", digits: [10, 10] },
  { flag: "🇩🇰", name: "Denmark",        code: "+45",  digits: [8,   8] },
  { flag: "🇪🇬", name: "Egypt",          code: "+20",  digits: [10, 11] },
  { flag: "🇫🇷", name: "France",         code: "+33",  digits: [9,  10] },
  { flag: "🇩🇪", name: "Germany",        code: "+49",  digits: [7,  11] },
  { flag: "🇬🇭", name: "Ghana",          code: "+233", digits: [9,  10] },
  { flag: "🇬🇷", name: "Greece",         code: "+30",  digits: [10, 10] },
  { flag: "🇮🇳", name: "India",          code: "+91",  digits: [10, 10] },
  { flag: "🇮🇩", name: "Indonesia",      code: "+62",  digits: [9,  12] },
  { flag: "🇮🇶", name: "Iraq",           code: "+964", digits: [10, 10] },
  { flag: "🇮🇪", name: "Ireland",        code: "+353", digits: [9,  10] },
  { flag: "🇮🇱", name: "Israel",         code: "+972", digits: [9,   9] },
  { flag: "🇮🇹", name: "Italy",          code: "+39",  digits: [9,  11] },
  { flag: "🇯🇵", name: "Japan",          code: "+81",  digits: [10, 11] },
  { flag: "🇯🇴", name: "Jordan",         code: "+962", digits: [9,  10] },
  { flag: "🇰🇪", name: "Kenya",          code: "+254", digits: [9,  10] },
  { flag: "🇰🇼", name: "Kuwait",         code: "+965", digits: [8,   8] },
  { flag: "🇱🇧", name: "Lebanon",        code: "+961", digits: [7,   8] },
  { flag: "🇱🇾", name: "Libya",          code: "+218", digits: [9,  10] },
  { flag: "🇲🇾", name: "Malaysia",       code: "+60",  digits: [9,  10] },
  { flag: "🇲🇦", name: "Morocco",        code: "+212", digits: [9,  10] },
  { flag: "🇲🇽", name: "Mexico",         code: "+52",  digits: [10, 10] },
  { flag: "🇳🇱", name: "Netherlands",    code: "+31",  digits: [9,  10] },
  { flag: "🇳🇬", name: "Nigeria",        code: "+234", digits: [10, 11] },
  { flag: "🇳🇴", name: "Norway",         code: "+47",  digits: [8,   8] },
  { flag: "🇵🇰", name: "Pakistan",       code: "+92",  digits: [10, 11] },
  { flag: "🇵🇱", name: "Poland",         code: "+48",  digits: [9,   9] },
  { flag: "🇵🇹", name: "Portugal",       code: "+351", digits: [9,   9] },
  { flag: "🇶🇦", name: "Qatar",          code: "+974", digits: [8,   8] },
  { flag: "🇷🇺", name: "Russia",         code: "+7",   digits: [10, 10] },
  { flag: "🇸🇦", name: "Saudi Arabia",   code: "+966", digits: [9,   9] },
  { flag: "🇸🇳", name: "Senegal",        code: "+221", digits: [9,   9] },
  { flag: "🇿🇦", name: "South Africa",   code: "+27",  digits: [9,  10] },
  { flag: "🇰🇷", name: "South Korea",    code: "+82",  digits: [9,  10] },
  { flag: "🇪🇸", name: "Spain",          code: "+34",  digits: [9,   9] },
  { flag: "🇸🇩", name: "Sudan",          code: "+249", digits: [9,   9] },
  { flag: "🇸🇪", name: "Sweden",         code: "+46",  digits: [9,   9] },
  { flag: "🇨🇭", name: "Switzerland",    code: "+41",  digits: [9,   9] },
  { flag: "🇸🇾", name: "Syria",          code: "+963", digits: [9,   9] },
  { flag: "🇹🇳", name: "Tunisia",        code: "+216", digits: [8,   8] },
  { flag: "🇹🇷", name: "Turkey",         code: "+90",  digits: [10, 10] },
  { flag: "🇦🇪", name: "UAE",            code: "+971", digits: [9,   9] },
  { flag: "🇬🇧", name: "United Kingdom", code: "+44",  digits: [10, 10] },
  { flag: "🇺🇸", name: "United States",  code: "+1",   digits: [10, 10] },
  { flag: "🇾🇪", name: "Yemen",          code: "+967", digits: [9,   9] },
];

function useIsMobile(bp = 1120) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    // A resize handler that reads window.innerWidth runs for every resize event
    // and can force style/layout work before updating React state. matchMedia
    // only notifies us when the breakpoint actually changes, which preserves
    // the responsive behaviour without continuous layout reads or rerenders.
    const query = window.matchMedia(`(max-width: ${bp - 0.02}px)`);
    const sync = (event) => setMobile(event.matches);
    setMobile(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [bp]);
  return mobile;
}

const SITE_LANGUAGE_STORAGE_KEY = "ac_site_language";
const STORAGE_POLICY_VERSION_KEY = "ac_storage_policy_version";
const STORAGE_POLICY_VERSION = "no-document-autosave-v1";
const SENSITIVE_STORAGE_KEYS = [
  "ac_resume_draft",
  "ac_resume_draft_saved_at",
  "ac_master",
  "ac_tracker",
  "ac_ats_text",
  "ac_resumes",
  "ac_current_resume_id",
  "ac_cover_letter_data",
  "ac_builder_state",
  "ac_translated_versions",
  "resumeData",
  "coverLetterData",
  "masterProfile",
  "builderState",
  "translatedVersions",
];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_RESUME_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_RESUME_IMPORT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const UX_MEASUREMENT_ENABLED = false;

const QUALITY_REVIEW_UI = {
  en: {
    title: "Review before download",
    intro: "Before downloading, ApplyCraft found a few things you may want to review.",
    review: "Review résumé",
    download: "Download anyway",
    placeholder: (d) => `Placeholder text found: ${d || "placeholder"}`,
    headlineMismatch: () => "Your headline may not match your experience.",
    hiddenEmail: () => "Your email may not be visible in the main contact section.",
    emptyBullet: (d) => `Empty bullet found: ${d || "incomplete bullet"}`,
    dateDash: (d) => `Date range should use a dash: ${d || "2020 – 2025"}`,
    capitalization: (d) => `Possible capitalization: ${d || "review spelling"}`,
    longSections: () => "Several sections are long. Consider keeping 3–5 bullets per role.",
  },
  fr: {
    title: "Relire avant le téléchargement",
    intro: "Avant le téléchargement, ApplyCraft a trouvé quelques points à vérifier.",
    review: "Relire le CV",
    download: "Télécharger quand même",
    placeholder: (d) => `Texte provisoire trouvé : ${d || "placeholder"}`,
    headlineMismatch: () => "L'intitulé peut ne pas correspondre à votre expérience.",
    hiddenEmail: () => "Votre e-mail peut ne pas être visible dans la section contact principale.",
    emptyBullet: (d) => `Puce incomplète trouvée : ${d || "puce incomplète"}`,
    dateDash: (d) => `La période doit utiliser un tiret : ${d || "2020 – 2025"}`,
    capitalization: (d) => `Capitalisation possible : ${d || "à vérifier"}`,
    longSections: () => "Plusieurs sections sont longues. Essayez de garder 3 à 5 puces par poste.",
  },
  ar: {
    title: "المراجعة قبل التنزيل",
    intro: "قبل التنزيل، وجد ApplyCraft بعض النقاط التي قد ترغب في مراجعتها.",
    review: "مراجعة السيرة الذاتية",
    download: "التنزيل على أي حال",
    placeholder: (d) => `تم العثور على نص مؤقت: ${d || "placeholder"}`,
    headlineMismatch: () => "قد لا يتطابق العنوان المهني مع محتوى سيرتك الذاتية.",
    hiddenEmail: () => "قد لا يكون بريدك الإلكتروني ظاهرًا في قسم معلومات الاتصال الرئيسي.",
    emptyBullet: (d) => `تم العثور على نقطة غير مكتملة: ${d || "نقطة غير مكتملة"}`,
    dateDash: (d) => `يجب أن يستخدم نطاق التاريخ شرطة: ${d || "2020 – 2025"}`,
    capitalization: (d) => `قد تحتاج بعض الأسماء إلى تصحيح الكتابة: ${d || "مراجعة الكتابة"}`,
    longSections: () => "بعض الأقسام طويلة. حاول إبقاء كل دور بين 3 و5 نقاط.",
  },
};

function qualityReviewText(language, warning) {
  const ui = QUALITY_REVIEW_UI[language] || QUALITY_REVIEW_UI.en;
  const render = ui[warning.type];
  return render ? render(warning.detail) : warning.short || warning.message;
}

function hasDangerousKey(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasDangerousKey);
  return Object.keys(value).some((key) => DANGEROUS_KEYS.has(key) || hasDangerousKey(value[key]));
}

function safeParseStoredJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return hasDangerousKey(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function languageByCode(code, fallback = "en") {
  return WORLD_LANGUAGES.find((l) => l.code === code) || WORLD_LANGUAGES.find((l) => l.code === fallback) || WORLD_LANGUAGES[0];
}

function resumeTranslationLanguageSample(resumeForm = {}) {
  return TRANSLATABLE_RESUME_FIELDS.map((key) => resumeForm?.[key]).filter(Boolean).join("\n");
}

function getInitialSiteLanguage() {
  if (typeof window === "undefined") return languageByCode("en");
  try {
    const saved = localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
    if (SITE_LANGUAGE_CODES.has(saved)) return languageByCode(saved);
  } catch {}
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  for (const browserLanguage of browserLanguages) {
    const code = String(browserLanguage || "").toLowerCase().split("-")[0];
    if (SITE_LANGUAGE_CODES.has(code)) return languageByCode(code);
  }
  return languageByCode("en");
}

function sanitizeFilename(value, fallback = "resume") {
  const cleaned = String(value || fallback)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w .-]/g, "")
    .replace(/[./\\:*?"<>|]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80)
    .toLowerCase();
  return cleaned || fallback;
}

function drawPdfContactItems(doc, items, options = {}) {
  const {
    x,
    y,
    maxWidth,
    separator = "  |  ",
    lineHeight = 4.5,
    color = [90, 90, 90],
    safe = (value) => String(value || ""),
  } = options;
  const contactItems = normalizeContactItems(items)
    .map((item) => ({ ...item, value: safe(item.value) }))
    .filter((item) => item.value);
  if (!contactItems.length) return 0;

  const rows = [[]];
  let rowWidth = 0;
  contactItems.forEach((item, index) => {
    const prefix = index > 0 ? separator : "";
    const width = doc.getTextWidth(prefix + item.value);
    if (rowWidth && rowWidth + width > maxWidth) {
      rows.push([{ item, prefix: "" }]);
      rowWidth = doc.getTextWidth(item.value);
    } else {
      rows[rows.length - 1].push({ item, prefix });
      rowWidth += width;
    }
  });

  rows.forEach((row, rowIndex) => {
    const rowText = row.map((part) => `${part.prefix}${part.item.value}`).join("");
    let cursor = x - doc.getTextWidth(rowText) / 2;
    const rowY = y + rowIndex * lineHeight;
    row.forEach(({ item, prefix }) => {
      if (prefix) {
        doc.setTextColor(...color);
        doc.text(prefix, cursor, rowY);
        cursor += doc.getTextWidth(prefix);
      }
      const href = getContactHref(item);
      doc.setTextColor(...color);
      if (href) doc.textWithLink(item.value, cursor, rowY, { url: href });
      else doc.text(item.value, cursor, rowY);
      cursor += doc.getTextWidth(item.value);
    });
  });

  return rows.length * lineHeight;
}

function validateProfilePhoto(file) {
  return !!file && ALLOWED_PHOTO_TYPES.has(file.type) && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}

function validateResumeImport(file) {
  if (!file || file.size <= 0 || file.size > MAX_RESUME_UPLOAD_BYTES) return false;
  const lowerName = file.name.toLowerCase();
  const extensionOk = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");
  const mimeOk = !file.type || ALLOWED_RESUME_IMPORT_TYPES.has(file.type);
  return extensionOk && mimeOk;
}

function clearApplyCraftLocalData() {
  if (typeof localStorage === "undefined") return;
  try {
    SENSITIVE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(STORAGE_POLICY_VERSION_KEY, STORAGE_POLICY_VERSION);
  } catch {}
}

function hasMeaningfulCoverLetterContent(form) {
  if (!form || typeof form !== "object") return false;
  return [
    "name",
    "jobTitle",
    "email",
    "phone",
    "location",
    "recipientName",
    "recipientTitle",
    "company",
    "companyAddress",
    "subject",
    "opening",
    "body",
    "closing",
  ].some((key) => String(form[key] || "").trim().length > 0);
}

function trackUxEvent(name, data = {}) {
  if (!UX_MEASUREMENT_ENABLED) return;
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
  );
  window.dispatchEvent(new CustomEvent("applycraft:ux", { detail: { name, ...safeData } }));
}

async function callAi(action, text, language = "en", context = "") {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, text, language, ...(context ? { context } : {}) }),
  });
  if (!res.ok) throw new Error("api-error");
  const data = await res.json();
  if (!data || typeof data.result !== "string") throw new Error("api-response");
  return data.result.trim();
}

// ── Structured entry model (FlowCV-style) ─────────────────────────────────
// Each section is a list of discrete entry objects — the editing source of
// truth. The flat string field on `form` (e.g. form.experience) is kept as a
// synced projection of these entries so the many existing string consumers
// (ATS checker, achievement coach, AI prompts, validation, progress checklist)
// keep working unchanged. buildLiveData below reads the arrays directly so it
// can respect each entry's `visible` flag.

let __uidCounter = 0;
// SSR/old-browser-safe unique id.
function uid() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch { /* fall through */ }
  return `e-${Date.now().toString(36)}-${(__uidCounter++).toString(36)}`;
}

// One schema per section drives parsing, serialization and which fields render.
// `type`: "role" (dated, has description), "line" (single line, no description),
// "tag" (comma list), "generic" (title/subtitle + description).
const ENTRY_SCHEMAS = {
  experience:     { type: "role",    icon: "💼", fields: ["title", "company", "startDate", "endDate", "description"], primary: "title",  secondary: "company" },
  education:      { type: "edu",     icon: "🎓", fields: ["title", "titleUrl", "subtitle", "startDate", "endDate", "location", "description"], primary: "title", secondary: "subtitle",
                    fieldTypes: { startDate: "month", endDate: "month" }, linkFor: { title: "titleUrl" },
                    labelKeys: { title: "degree", subtitle: "institution", location: "location" } },
  skills:         { type: "tag",     icon: "⚡", fields: ["name"],                                                   primary: "name", labelKeys: { name: "skill" } },
  languages:      { type: "tag",     icon: "🌐", fields: ["name"],                                                   primary: "name", labelKeys: { name: "language" } },
  certifications: { type: "generic", icon: "📜", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "certification", subtitle: "issuer", description: "details" } },
  projects:       { type: "generic", icon: "🛠️", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "project", subtitle: "tech" } },
  volunteer:      { type: "generic", icon: "🤝", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "role", subtitle: "organization" } },
  awards:         { type: "generic", icon: "🏆", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "award", subtitle: "issuer", description: "details" } },
  publications:   { type: "generic", icon: "📚", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "pubTitle", subtitle: "publisher", description: "details" } },
  references:     { type: "generic", icon: "📇", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "refName", subtitle: "refRelation", description: "contact" } },
  extracurricular:{ type: "generic", icon: "🎯", fields: ["title", "subtitle", "description"],                       primary: "title",  secondary: "subtitle", labelKeys: { title: "activity", subtitle: "organization" } },
};
const SECTION_KEYS = Object.keys(ENTRY_SCHEMAS);
// Always-visible core sections vs. ones the user can remove (and re-add via the
// "Add content" picker). Every section in both groups is rendered from the start:
// discovery must not depend on opening the picker.
const CORE_SECTIONS = ["experience", "education", "skills", "languages"];
const OPTIONAL_SECTIONS = ["certifications", "projects", "volunteer", "awards", "publications", "references", "extracurricular"];
// The only mandatory content is Personal Info (name + contact, enforced by the
// field validators) plus AT LEAST ONE of Experience / Education. Everything else
// is opt-in, so it carries an "Optional" badge and never blocks completion.
const REQUIRED_SECTIONS = ["experience", "education"];
const isOptionalSection = (key) => !REQUIRED_SECTIONS.includes(key);
// Catalog order shown in the picker (summary is the always-present FieldCard).
const PICKER_CATALOG = ["summary", "experience", "education", "skills", "languages", "certifications", "projects", "volunteer", "awards", "publications", "references", "extracurricular"];
const PICKER_ICONS = { summary: "📝", ...Object.fromEntries(SECTION_KEYS.map((k) => [k, ENTRY_SCHEMAS[k].icon])) };

function blankEntry(key) {
  const e = { id: uid(), visible: true };
  ENTRY_SCHEMAS[key].fields.forEach((f) => { e[f] = ""; });
  if (key === "experience") e.isCurrent = false;
  return e;
}

// A "header" line carries structure (a — / – / | delimiter); bullets and plain
// continuation text are treated as description body.
function isHeaderLine(line) {
  const l = line.trim();
  if (!l) return false;
  if (/^([•\-*]|\d+\.)\s/.test(l)) return false;
  return /\s[—–]\s|\|/.test(l);
}

function looksLikeEducationTitle(value) {
  return /\b(?:b\.?s\.?|m\.?s\.?|bachelor|master|mba|phd|doctorat|licence|maîtrise|dipl[oô]me|degree|computer science|engineering|arts?|science|sciences|informatique|management|ing[eé]nieur)\b/i.test(String(value || ""));
}

// Build the single header line for an entry (mirrors the legacy "Title — Company | dates" format).
function entryHeader(key, e, lang = "en") {
  const s = ENTRY_SCHEMAS[key];
  const parts = [e[s.primary], s.secondary ? e[s.secondary] : ""].map((x) => (x || "").trim()).filter(Boolean);
  let head = parts.join(" — ");
  if (s.type === "role") {
    const d = formatDateRange({ startDate: e.startDate, endDate: e.endDate, isCurrent: e.isCurrent, language: lang });
    if (d) head += (head ? " | " : "") + d;
  } else if (key === "education" && (e.year || "").trim()) {
    head += (head ? " | " : "") + normalizeDateRange(e.year.trim());
  }
  return head;
}

// Flat list of preview/export lines for one entry (header + description bullets).
function entryToLines(key, e, lang = "en") {
  const s = ENTRY_SCHEMAS[key];
  if (s.type === "tag") return [(e.name || "").trim()].filter(Boolean);
  if (s.type === "line") return [entryHeader(key, e, lang)].filter(Boolean);
  if (s.type === "edu") {
    // Render education professionally: degree/program as the title, school/location/date as metadata.
    // Separators are only added around present values (no stray "—"/"|").
    const out = [];
    const dates = normalizeDateRange([e.startDate, e.endDate].map((x) => (x || "").trim()).filter(Boolean).join(" – "));
    const degree = (e.title || "").trim();
    const school = (e.subtitle || "").trim();
    const head = degree || school;
    if (head) out.push(head);
    if (school && school !== head) out.push(school);
    const loc = (e.location || "").trim(); if (loc) out.push(loc);
    if (dates) out.push(dates);
    (e.description || "").split("\n").forEach((l) => { if (l.trim() && !isPlaceholderOnly(l)) out.push(l); });
    return out;
  }
  const out = [];
  const h = entryHeader(key, e, lang);
  if (h) out.push(h);
  (e.description || "").split("\n").forEach((l) => { if (l.trim()) out.push(l); });
  return out;
}

// Serialize entries back into the flat string projection kept on `form`.
function entriesToText(key, entries, lang = "en") {
  const list = entries || [];
  const s = ENTRY_SCHEMAS[key];
  if (s.type === "tag")  return list.map((e) => (e.name || "").trim()).filter(Boolean).join(", ");
  if (s.type === "line") return list.map((e) => entryHeader(key, e, lang)).filter(Boolean).join("\n");
  return list.map((e) => entryToLines(key, e, lang).join("\n")).filter(Boolean).join("\n\n");
}

// Visible-only flat items for the preview / export (matches old lines()/csv()).
function entriesToItems(key, entries, lang = "en") {
  const list = (entries || []).filter((e) => e.visible !== false);
  if (ENTRY_SCHEMAS[key].type === "tag") return list.map((e) => (e.name || "").trim()).filter(Boolean);
  return list.flatMap((e) => entryToLines(key, e, lang)).filter(Boolean);
}

// Parse an existing flat string field into structured entries (migration / AI write-back).
function parseEntries(key, text) {
  if (!text || !text.trim()) return [];
  const s = ENTRY_SCHEMAS[key];
  const splitHead = (head) => head.split(/\s+[—–-]\s+/);
  if (s.type === "tag") {
    return text.split(/[,\n]/).map((x) => x.trim()).filter(Boolean).map((name) => ({ id: uid(), name, visible: true }));
  }
  if (s.type === "line") {
    return text.split("\n").map((x) => x.trim()).filter(Boolean).map((line) => {
      const e = blankEntry(key);
      let head = line, datePart = "";
      const pipe = head.indexOf("|");
      if (pipe !== -1) { datePart = head.slice(pipe + 1).trim(); head = head.slice(0, pipe).trim(); }
      const d = splitHead(head);
      e[s.primary] = (d[0] || "").trim();
      if (s.secondary) e[s.secondary] = d.slice(1).join(" — ").trim();
      if (key === "education") e.year = datePart;
      return e;
    });
  }
  if (s.type === "edu") {
    // Reverse of entryToLines: blocks separated by blank lines; per block →
    // "Title | Start – End" / Subtitle / Location / Description.
    return text.split(/\n{2,}/).map((block) => {
      const lines = block.split("\n").map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim());
      const e = blankEntry(key);
      if (lines.length) {
        let head = lines[0], datePart = "";
        const pipe = head.indexOf("|");
        if (pipe !== -1) { datePart = head.slice(pipe + 1).trim(); head = head.slice(0, pipe).trim(); }
        e.title = head.trim();
        if (datePart) { const dd = datePart.split(/\s*[–-]\s*/); e.startDate = (dd[0] || "").trim(); e.endDate = (dd[1] || "").trim(); }
        const rest = lines.slice(1);
        if (rest[0] && !/^[•\-*]/.test(rest[0])) e.subtitle = rest[0];
        const afterSub = e.subtitle ? rest.slice(1) : rest;
        if (afterSub[0] && !/^[•\-*]/.test(afterSub[0])) e.location = afterSub[0];
        const desc = e.location ? afterSub.slice(1) : afterSub;
        if (desc.length) e.description = desc.join("\n");
      }
      return e;
    }).filter((e) => e.title || e.subtitle || e.location || e.description);
  }
  // role / generic: group header + following body lines into one entry.
  const entries = [];
  let cur = null;
  text.split("\n").forEach((raw) => {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) return;
    if (isHeaderLine(line) || !cur) {
      cur = blankEntry(key);
      let head = line.trim(), datePart = "";
      const pipe = head.indexOf("|");
      if (pipe !== -1) { datePart = head.slice(pipe + 1).trim(); head = head.slice(0, pipe).trim(); }
      const d = splitHead(head);
      cur[s.primary] = (d[0] || "").trim();
      if (s.secondary) cur[s.secondary] = d.slice(1).join(" — ").trim();
      if (datePart) {
        if (s.type === "role") {
          const dd = datePart.split(/\s*[–-]\s*/);
          cur.startDate = (dd[0] || "").trim();
          cur.endDate = (dd[1] || "").trim();
          if (/^(present|présent|aujourd'hui|الحاضر|حتى الآن)$/i.test(cur.endDate)) {
            cur.isCurrent = true;
            cur.endDate = "";
          }
        } else if (s.secondary) {
          cur[s.secondary] = [cur[s.secondary], datePart].filter(Boolean).join(" · ");
        }
      }
      entries.push(cur);
    } else {
      cur.description = cur.description ? cur.description + "\n" + line : line;
    }
  });
  return entries;
}

// Normalize a saved/loaded form: ensure every section has an entries array and a
// synced string projection. Migrates legacy string-only drafts without data loss.
function migrateForm(form) {
  const out = { ...form };
  if (!out.sectionTitles || typeof out.sectionTitles !== "object") out.sectionTitles = {};
  SECTION_KEYS.forEach((key) => {
    const arrKey = key + "Entries";
    let entries = Array.isArray(out[arrKey]) ? out[arrKey] : null;
    if (!entries) entries = parseEntries(key, typeof out[key] === "string" ? out[key] : "");
    // Migrate legacy Education entries (degree/institution/year) into the new shape
    // without dropping data.
    if (key === "education") {
      entries = entries.map((e) => {
        const n = { ...e };
        if (!n.title && n.degree) n.title = n.degree;
        if (!n.subtitle && (n.institution || n.school)) n.subtitle = n.institution || n.school;
        if (n.title && n.subtitle && !looksLikeEducationTitle(n.title) && looksLikeEducationTitle(n.subtitle)) {
          const previousTitle = n.title;
          n.title = n.subtitle;
          n.subtitle = previousTitle;
        }
        if (!n.endDate && n.year) n.endDate = n.year;
        return n;
      });
    }
    // Guarantee shape (id + visible) on every entry.
    entries = entries.map((e) => {
      const next = { ...e, id: e.id || uid(), visible: e.visible !== false };
      if (key === "experience") {
        const end = String(next.endDate || "").trim();
        const currentByText = /^(present|présent|aujourd'hui|الحاضر|حتى الآن)$/i.test(end);
        next.isCurrent = Boolean(next.isCurrent || next.current || currentByText);
        if (next.isCurrent && currentByText) next.endDate = "";
      }
      return next;
    });
    out[arrKey] = entries;
    out[key] = entriesToText(key, entries);
  });
  // Which optional sections are active in the editor. Every one of them is shown
  // by default, so a resume saved before that change gains the sections it never
  // had — empty and collapsed, never an error. The user's own order is kept and
  // anything missing is appended in catalog order.
  const added = Array.isArray(out.addedSections) ? out.addedSections.filter((k) => OPTIONAL_SECTIONS.includes(k)) : [];
  OPTIONAL_SECTIONS.forEach((key) => {
    if (!added.includes(key)) added.push(key);
  });
  out.addedSections = added;
  return out;
}

function mergeTranslatedEntries(key, originalEntries = [], translatedText = "") {
  const original = Array.isArray(originalEntries) ? originalEntries : [];
  const parsed = parseEntries(key, translatedText);
  if (!original.length) return { entries: parsed, preservedOriginal: false };
  if (!translatedText || !String(translatedText).trim() || parsed.length < original.length) {
    return { entries: original.map((entry) => ({ ...entry })), preservedOriginal: true };
  }
  const schema = ENTRY_SCHEMAS[key];
  const entries = original.map((oldEntry, index) => {
    const incoming = parsed[index] || {};
    const next = { ...oldEntry };
    schema.fields.forEach((field) => {
      const translatedValue = typeof incoming[field] === "string" ? incoming[field].trim() : incoming[field];
      if (translatedValue) next[field] = translatedValue;
    });
    next.id = oldEntry.id || incoming.id || uid();
    next.visible = oldEntry.visible !== false;
    if (key === "education") {
      next.titleUrl = oldEntry.titleUrl || incoming.titleUrl || "";
      next.startDate = oldEntry.startDate || incoming.startDate || "";
      next.endDate = oldEntry.endDate || incoming.endDate || "";
      const dateTokens = new Set([next.startDate, next.endDate].filter(Boolean).map((value) => String(value).trim()));
      next.description = String(next.description || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !dateTokens.has(line) && !(/^\d{4}$/.test(line) && dateTokens.has(line)))
        .join("\n");
    }
    if (schema.type === "role") {
      next.startDate = oldEntry.startDate || incoming.startDate || "";
      next.endDate = oldEntry.endDate || incoming.endDate || "";
      next.isCurrent = Boolean(oldEntry.isCurrent || oldEntry.current);
    }
    return next;
  });
  if (parsed.length > original.length) entries.push(...parsed.slice(original.length));
  return { entries, preservedOriginal: false };
}

// Build resume data straight from the form so the preview updates as the user types.
// Reads the entry arrays directly so hidden entries are excluded from the output.
function buildLiveData(form, t, lang = "en") {
  const label = (key) => t[key].replace(/\s*\(.*\)/, "");
  const headingOf = (key, def) => (form.sectionTitles && form.sectionTitles[key]) || def;
  const sections = [];
  // An optional section the user removed from the editor must not reach the
  // output even if its entries survive on the form (removal is non-destructive,
  // so re-adding restores them). Absent addedSections => nothing was removed.
  const inEditor = (key) => !OPTIONAL_SECTIONS.includes(key)
    || !Array.isArray(form.addedSections)
    || form.addedSections.includes(key);
  // A section only exists in the output once it has content: an untouched
  // "References" or "Publications" must never print as a bare heading.
  const add = (key, heading) => {
    if (!inEditor(key)) return;
    const items = entriesToItems(key, form[key + "Entries"], lang);
    if (items.length) sections.push({ key, heading, isCustom: Boolean(form.sectionTitles?.[key]), items });
  };
  add("experience",     headingOf("experience", t.experience));
  add("education",       headingOf("education", t.education));
  add("skills",          headingOf("skills", label("skills")));
  add("certifications",  headingOf("certifications", t.certifications));
  add("projects",        headingOf("projects", t.projects));
  add("languages",       headingOf("languages", label("languages")));
  add("volunteer",       headingOf("volunteer", t.volunteer));
  add("awards",          headingOf("awards", t.awards));
  add("publications",    headingOf("publications", t.publications));
  add("references",      headingOf("references", t.references));
  add("extracurricular", headingOf("extracurricular", t.extracurricular));
  return {
    name: form.name || "",
    title: form.title || "",
    contact: [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean),
    summary: form.summary || "",
    sections,
    photo: form.photo || null,
  };
}

// ── Entry-editor microcopy (5 languages, RTL-aware via caller) ─────────────

// Inline rich-text editor for an entry description. Reuses the markdown-marker
// toolbar (bold/italic/underline/strike/bullet/numbered/divider/clear) but works
// on its own textarea ref + value/onChange instead of the global form field.
function EntryDescriptionEditor({ value, onChange, placeholder, rtl }) {
  const ref = useRef(null);
  const v = value || "";
  const restore = (s, e) => setTimeout(() => { const el = ref.current; if (el) { el.focus(); el.setSelectionRange(s, e); } }, 0);
  const wrap = (marker, endMarker) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = v.slice(start, end);
    const close = endMarker !== undefined ? endMarker : marker;
    if (selected.startsWith(marker) && selected.endsWith(close) && selected.length >= marker.length + close.length) {
      const inner = selected.slice(marker.length, selected.length - close.length);
      onChange(v.slice(0, start) + inner + v.slice(end)); restore(start, start + inner.length);
    } else {
      onChange(v.slice(0, start) + marker + selected + close + v.slice(end)); restore(start + marker.length, end + marker.length);
    }
  };
  const linePrefix = (prefix, numbered) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const lineStart = v.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = v.indexOf("\n", end);
    const block = v.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const ls = block.split("\n");
    const allPrefixed = ls.every(l => l.startsWith(prefix) || (numbered && /^\d+\. /.test(l)));
    let n = 1;
    const updated = ls.map(l => {
      if (allPrefixed) return l.replace(/^[•\-] |^\d+\. /, "");
      if (numbered) return `${n++}. ${l}`;
      return l.startsWith(prefix) ? l : `${prefix}${l}`;
    }).join("\n");
    onChange(v.slice(0, lineStart) + updated + (lineEnd === -1 ? "" : v.slice(lineEnd)));
    restore(lineStart, lineStart + updated.length);
  };
  const btn = (label, title, onClick, extra = {}) => (
    <button type="button" title={title} aria-label={title} onClick={onClick}
      style={{ background: SECTION_TOKENS.softSurface, border: "none", borderRadius: 6, padding: "3px 8px",
        fontSize: 12, fontWeight: 700, color: C.text2, cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5, ...extra }}>
      {label}
    </button>
  );
  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap" }}>
        {btn("B", "Bold", () => wrap("**"), { fontWeight: 900 })}
        {btn("I", "Italic", () => wrap("*"), { fontStyle: "italic", fontWeight: 400 })}
        {btn("U", "Underline", () => wrap("__"), { textDecoration: "underline" })}
        {btn("S", "Strikethrough", () => wrap("~~"), { textDecoration: "line-through" })}
        <div style={{ width: 1, background: SECTION_TOKENS.rowDivider, margin: "3px 2px" }} />
        {btn("•", "Bullet list", () => linePrefix("• "))}
        {btn("1.", "Numbered list", () => linePrefix("1. ", true))}
        <div style={{ width: 1, background: SECTION_TOKENS.rowDivider, margin: "3px 2px" }} />
        {btn("—", "Insert dash", () => wrap(" — ", ""), { fontWeight: 400 })}
        {btn("✕", "Clear formatting", () => onChange(v.replace(/\*\*|__|\*|~~/g, "")), { fontSize: 10, color: C.text3 })}
      </div>
      <textarea ref={ref} value={v} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} rows={4}
        dir={rtl ? "rtl" : "ltr"}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.elevated,
          border: `1px solid ${SECTION_TOKENS.inputEdge}`, borderRadius: 8, color: C.text1, fontSize: 14, outline: "none",
          resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
    </div>
  );
}

// One structured entry: drag handle, two-tone label, visibility + delete, and
// an expandable inline edit form driven by the section schema.
function EntryRow({ sectionKey, entry, index, eui, rtl, expanded, onToggleExpand, onChange, onDelete, onToggleVisible, dnd, dropSide }) {
  const schema = ENTRY_SCHEMAS[sectionKey];
  const primary = (entry[schema.primary] || "").trim();
  const secondary = schema.secondary ? (entry[schema.secondary] || "").trim() : "";
  const hidden = entry.visible === false;
  const labelFor = (f) => {
    const token = (schema.labelKeys && schema.labelKeys[f]) || f;
    return eui.labels[token] || eui.labels[f] || f;
  };
  const iconBtn = (content, title, onClick, extra = {}) => (
    <button type="button" title={title} aria-label={title} onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: "transparent", border: "none", borderRadius: SECTION_TOKENS.iconBtnRadius,
        width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: C.text2, fontSize: 14, lineHeight: 1, flexShrink: 0, ...extra }}>
      {content}
    </button>
  );
  const [linkOpen, setLinkOpen] = useState({});
  const urlFields = new Set(Object.values(schema.linkFor || {}));
  const nonDesc = schema.fields.filter((f) => f !== "description" && !urlFields.has(f));
  const fieldType = (f) => (schema.fieldTypes && schema.fieldTypes[f]) || "text";
  const currentRoleId = `current-role-${entry.id}`;
  return (
    <div
      onDragOver={(e) => {
        if (dnd.dragging() == null) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        dnd.onOver(index, e.clientY < r.top + r.height / 2 ? "above" : "below");
      }}
      onDrop={(e) => { e.preventDefault(); dnd.onDrop(); }}
      style={{ borderTop: index === 0 ? "none" : `1px solid ${SECTION_TOKENS.rowDivider}`,
        boxShadow: dropSide === "above" ? `inset 0 2px 0 0 ${C.accent}` : dropSide === "below" ? `inset 0 -2px 0 0 ${C.accent}` : "none",
        opacity: hidden ? 0.55 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: SECTION_TOKENS.gap2, padding: `${SECTION_TOKENS.gap2}px ${SECTION_TOKENS.gap1}px` }}>
        <span draggable role="button" aria-label={eui.reorder} title={eui.reorder}
          onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(index)); } catch { /* IE guard */ } dnd.onDragStart(index); }}
          onDragEnd={() => dnd.onDragEnd()}
          style={{ cursor: "grab", color: C.text3, fontSize: 14, lineHeight: 1, userSelect: "none", flexShrink: 0, padding: "0 2px" }}>⠿</span>
        <button type="button" onClick={onToggleExpand}
          style={{ flex: 1, textAlign: rtl ? "right" : "left", background: "none", border: "none", cursor: "pointer",
            color: C.text1, fontFamily: "inherit", fontSize: 14.5, padding: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <strong style={{ fontWeight: 700 }}>{primary || eui.untitled}</strong>
          {secondary && <span style={{ color: C.text3, fontWeight: 400 }}>, {secondary}</span>}
        </button>
        {iconBtn(hidden ? "🚫" : "👁", hidden ? eui.show : eui.hide, onToggleVisible, hidden ? {} : { color: C.accent2 })}
        {iconBtn("🗑", eui.remove, onDelete)}
        <span aria-hidden style={{ color: C.text3, fontSize: 11, width: 12, textAlign: "center", flexShrink: 0 }}>{expanded ? "▾" : "▸"}</span>
      </div>
      {expanded && (
        <div style={{ padding: `0 ${SECTION_TOKENS.gap1}px ${SECTION_TOKENS.gap3}px`, display: "flex", flexDirection: "column", gap: SECTION_TOKENS.gap2 }}>
          {nonDesc.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: nonDesc.length === 1 ? "1fr" : "1fr 1fr", gap: SECTION_TOKENS.gap2 }}>
              {nonDesc.map((f) => {
                const urlKey = schema.linkFor && schema.linkFor[f];
                const showUrl = !!(urlKey && (linkOpen[f] || (entry[urlKey] || "").trim()));
                const isDate = fieldType(f) === "month" || (sectionKey === "experience" && (f === "startDate" || f === "endDate"));
                const disabled = sectionKey === "experience" && f === "endDate" && entry.isCurrent;
                const hasVal = (entry[f] || "").trim();
                return (
                  <div key={f}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, minHeight: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.text3 }}>{labelFor(f)}</label>
                      {urlKey && (
                        <button type="button" onClick={() => setLinkOpen((s) => ({ ...s, [f]: !showUrl }))}
                          aria-expanded={showUrl}
                          style={{ background: "none", border: "none", color: C.accent2, fontSize: 11, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit", padding: 0 }}>🔗 {eui.labels.link}</button>
                      )}
                    </div>
                    <div style={{ position: "relative" }}>
                      <input value={entry[f] || ""} onChange={(e) => onChange({ [f]: e.target.value })}
                        placeholder={isDate ? (f === "endDate" ? presentLabel("en") : "MM/YYYY") : labelFor(f)}
                        dir={rtl ? "rtl" : "ltr"}
                        disabled={disabled}
                        style={{ width: "100%", boxSizing: "border-box",
                          padding: isDate && hasVal ? "9px 30px 9px 12px" : "9px 12px", background: C.elevated,
                          border: `1px solid ${SECTION_TOKENS.inputEdge}`, borderRadius: 8, color: C.text1, fontSize: 14, outline: "none", fontFamily: "inherit",
                          opacity: disabled ? 0.45 : 1 }} />
                      {isDate && hasVal && !disabled && (
                        <button type="button" aria-label={`Clear ${labelFor(f)}`} onClick={() => onChange({ [f]: "" })}
                          style={{ position: "absolute", top: "50%", insetInlineEnd: 8, transform: "translateY(-50%)",
                            background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                      )}
                    </div>
                    {showUrl && (
                      <input value={entry[urlKey] || ""} onChange={(e) => onChange({ [urlKey]: e.target.value })}
                        placeholder="https://…" dir="ltr" type="url"
                        style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", marginTop: 6, background: C.elevated,
                          border: `1px solid ${SECTION_TOKENS.inputEdge}`, borderRadius: 8, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {sectionKey === "experience" && (
            <div>
              <label htmlFor={currentRoleId} style={{ display: "flex", alignItems: "center", gap: 8, color: C.text2, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <input
                  id={currentRoleId}
                  type="checkbox"
                  checked={!!entry.isCurrent}
                  onChange={(e) => onChange({ isCurrent: e.target.checked, endDate: e.target.checked ? "" : entry.endDate || "" })}
                  style={{ accentColor: C.accent }}
                />
                {eui.currentRole || "I currently work here"}
              </label>
              {entry.isCurrent && (
                <div style={{ marginTop: 5, color: C.text3, fontSize: 11.5 }}>
                  {eui.currentRoleHint || "End date is not required for your current role."}
                </div>
              )}
            </div>
          )}
          {schema.fields.includes("description") && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text3, marginBottom: 4 }}>{labelFor("description")}</label>
              <EntryDescriptionEditor value={entry.description} onChange={(val) => onChange({ description: val })} rtl={rtl} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable section card. Drives every section from ENTRY_SCHEMAS — no per-section markup.
function SectionCard({ sectionKey, heading, defaultHeading, entries, eui, rtl, builderText = (key) => key, optional = false, collapsed, onToggleCollapse, onEditHeading, onRestoreDefault, onRemove, onAdd, onChangeEntry, onDeleteEntry, onToggleVisible, onReorder }) {
  const schema = ENTRY_SCHEMAS[sectionKey];
  const [expandedId, setExpandedId] = useState(null);
  const [editingHeading, setEditingHeading] = useState(false);
  const [headingDraft, setHeadingDraft] = useState(heading);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [over, setOver] = useState(null); // { index, side: "above" | "below" }
  const dragFrom = useRef(null);
  const list = entries || [];
  const visibleCount = list.filter(entry => entry.visible !== false).length;
  const status = visibleCount > 0 ? "Complete" : "Missing";
  const countLabel = visibleCount === 0 ? status : `${visibleCount} ${visibleCount === 1 ? "entry" : "entries"} · ${status}`;
  const statusColor = statusTone(status);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);
  const dnd = {
    dragging: () => dragFrom.current,
    onDragStart: (i) => { dragFrom.current = i; },
    onDragEnd: () => { dragFrom.current = null; setOver(null); },
    onOver: (index, side) => { if (dragFrom.current != null) setOver({ index, side }); },
    onDrop: () => {
      const from = dragFrom.current;
      const o = over;
      dragFrom.current = null; setOver(null);
      if (from == null || !o) return;
      let to = o.side === "below" ? o.index + 1 : o.index; // insertion slot in original array
      if (from < to) to -= 1;                              // account for removal of dragged item
      if (to !== from) onReorder(from, to);
    },
  };
  const commitHeading = () => { setEditingHeading(false); const h = headingDraft.trim(); if (h && h !== heading) onEditHeading(h); else setHeadingDraft(heading); };
  return (
    <section style={{ background: collapsed ? SECTION_TOKENS.rowBg : SECTION_TOKENS.expandedBg,
      border: "none",
      borderRadius: 12, boxShadow: collapsed ? "none" : SECTION_TOKENS.expandedShadow,
      padding: 0, overflow: "visible", marginTop: 10 }}>
      <header role="button" tabIndex={0} aria-expanded={!collapsed}
        aria-label={collapsed ? eui.expand : eui.collapse}
        onClick={() => { if (!editingHeading && !menuOpen) onToggleCollapse(); }}
        onKeyDown={(e) => { if (!editingHeading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onToggleCollapse(); } }}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none",
          padding: collapsed ? "12px 14px" : "14px 16px",
          boxShadow: collapsed ? "none" : `inset 0 -1px 0 ${SECTION_TOKENS.rowDivider}` }}>
        <span aria-hidden style={{ fontSize: 16, flexShrink: 0 }}>{schema.icon}</span>
        {editingHeading ? (
          <input autoFocus value={headingDraft} onChange={(e) => setHeadingDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitHeading} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") commitHeading(); if (e.key === "Escape") { setEditingHeading(false); setHeadingDraft(heading); } }}
            dir={rtl ? "rtl" : "ltr"}
            style={{ flex: 1, background: C.elevated, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "6px 10px",
              color: C.text1, fontSize: 16, fontWeight: 800, fontFamily: "inherit", outline: "none" }} />
        ) : (
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: C.text1, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{heading}</h3>
            <span title={countLabel} aria-label={countLabel}
              style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, opacity: visibleCount > 0 ? 0.95 : 0.55, flexShrink: 0 }} />
            {visibleCount > 0 && (
              <span aria-hidden style={{ color: C.text3, fontSize: 11.5, fontWeight: 700 }}>{visibleCount}</span>
            )}
            {/* Optional sections are shown from the start, so say plainly that
                leaving one empty is fine. Dropped once it holds content — at
                that point the badge is noise. */}
            {optional && visibleCount === 0 && (
              <span style={{ color: C.text3, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 0.6, background: C.elevated, borderRadius: 999, padding: "2px 7px",
                flexShrink: 0, whiteSpace: "nowrap" }}>{eui.optional}</span>
            )}
          </div>
        )}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button type="button" aria-label={`${heading} options`} aria-expanded={menuOpen}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
            style={{ width: 40, height: 40, borderRadius: 10, border: "none",
              background: "transparent", color: C.text2, cursor: "pointer", fontFamily: "inherit", fontSize: 18, lineHeight: 1 }}>
            …
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 170, zIndex: 20,
              background: C.surface, border: "none", borderRadius: 10,
              boxShadow: "0 12px 36px rgba(0,0,0,0.45)", overflow: "hidden" }}>
              <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setHeadingDraft(heading); setEditingHeading(true); }}
                style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left",
                  background: "none", border: "none", color: C.text1, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit" }}>
                {builderText("renameSection")}
              </button>
              {heading !== defaultHeading && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setHeadingDraft(defaultHeading); onRestoreDefault?.(); }}
                  style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left",
                    background: "none", border: "none", color: C.text1, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", boxShadow: `inset 0 1px 0 ${SECTION_TOKENS.rowDivider}` }}>
                  {builderText("restoreDefaultLabel")}
                </button>
              )}
              {/* Only removable sections get this. Entries are kept on the form,
                  so re-adding from the picker brings the content back. */}
              {onRemove && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRemove(); }}
                  style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left",
                    background: "none", border: "none", color: C.text1, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", boxShadow: `inset 0 1px 0 ${SECTION_TOKENS.rowDivider}` }}>
                  {builderText("removeSection")}
                </button>
              )}
              <div style={{ padding: "9px 12px", boxShadow: `inset 0 1px 0 ${SECTION_TOKENS.rowDivider}`, color: C.text3,
                fontSize: 11.5, lineHeight: 1.4 }}>
                {builderText("sectionEntryActionsHint")}
              </div>
            </div>
          )}
        </div>
        <span aria-hidden style={{ color: C.text2, fontSize: 22, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>
          {collapsed ? "▸" : "▾"}
        </span>
      </header>
      {!collapsed && (
        <SectionErrorBoundary label={eui?.sectionError} resetKey={collapsed}>
          <div style={{ padding: "8px 16px 16px" }}>
            <div onDragOver={(e) => { e.preventDefault(); }}>
              {list.map((entry, i) => (
                <EntryRow key={entry.id} sectionKey={sectionKey} entry={entry} index={i} eui={eui} rtl={rtl}
                  expanded={expandedId === entry.id}
                  onToggleExpand={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
                  onChange={(ch) => onChangeEntry(entry.id, ch)}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onToggleVisible={() => onToggleVisible(entry.id)}
                  dnd={dnd}
                  dropSide={over && over.index === i && dragFrom.current != null && dragFrom.current !== i ? over.side : null} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: SECTION_TOKENS.gap3 }}>
              <button type="button" onClick={() => { const id = onAdd(); if (id) setExpandedId(id); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.accent}18`,
                  border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700,
                  color: C.accent2, cursor: "pointer", fontFamily: "inherit" }}>
                + {eui.addEntry}
              </button>
            </div>
          </div>
        </SectionErrorBoundary>
      )}
    </section>
  );
}

// Isolates a single builder section so a render error inside one panel shows a
// localized fallback instead of crashing the entire builder to the React error
// screen. `resetKey` lets a section recover: changing it (e.g. collapse/reopen)
// clears the error and re-renders the children.
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: "12px 14px", borderRadius: 10, background: `${C.warn || "#f59e0b"}14`,
          color: C.text2, fontSize: 13, lineHeight: 1.5 }}>
          {this.props.label || "This section couldn’t be displayed."}
        </div>
      );
    }
    return this.props.children;
  }
}

// Same card chrome as SectionCard, but for fixed-field sections (Personal Info,
// Summary) that aren't entry lists. Collapsible, no add/reorder/edit-heading.
function FieldCard({ icon, title, status, children, collapsed, onToggleCollapse, rtl, eui, menu }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusLabel = status || (collapsed ? "Not started" : "In progress");
  const statusColor = statusTone(statusLabel);
  return (
    <section style={{ background: collapsed ? SECTION_TOKENS.rowBg : SECTION_TOKENS.expandedBg, border: "none",
      borderRadius: 12, boxShadow: collapsed ? "none" : SECTION_TOKENS.expandedShadow,
      padding: 0, overflow: "visible", marginTop: 10 }}>
      <header role="button" tabIndex={0} aria-expanded={!collapsed}
        aria-label={collapsed ? eui.expand : eui.collapse}
        onClick={() => { if (!menuOpen) onToggleCollapse(); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleCollapse(); } }}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none",
          padding: collapsed ? "12px 14px" : "14px 16px",
          boxShadow: collapsed ? "none" : `inset 0 -1px 0 ${SECTION_TOKENS.rowDivider}` }}>
        <span aria-hidden style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: rtl ? "flex-end" : "flex-start" }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: C.text1, textAlign: rtl ? "right" : "left", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h3>
          <span title={statusLabel} aria-label={statusLabel}
            style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, opacity: statusColor === SECTION_TOKENS.statusComplete ? 0.95 : 0.55, flexShrink: 0 }} />
        </div>
        {menu && menu.length > 0 && (
          <div style={{ position: "relative" }}>
            <button type="button" aria-label={`${title} options`} aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent",
                color: C.text2, cursor: "pointer", fontFamily: "inherit", fontSize: 18, lineHeight: 1 }}>…</button>
            {menuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 170, zIndex: 20,
                background: C.surface, border: "none", borderRadius: 10, boxShadow: "0 12px 36px rgba(0,0,0,0.45)", overflow: "hidden" }}>
                {menu.map((m, i) => (
                  <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); m.onClick(); }}
                    style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", background: "none",
                      border: "none", color: m.danger ? "#f87171" : C.text1, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <span aria-hidden style={{ color: C.text2, fontSize: 22, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>
          {collapsed ? "▸" : "▾"}
        </span>
      </header>
      {!collapsed && (
        <div style={{ padding: "8px 16px 16px" }}>
          <SectionErrorBoundary label={eui?.sectionError} resetKey={collapsed}>
            {children}
          </SectionErrorBoundary>
        </div>
      )}
    </section>
  );
}

const HERO_PREVIEW_THEMES = ["#2563eb", "#0f766e", "#7c3aed", "#d97706", "#db2777", "#111827"];

const HERO_PREVIEW_COPY = {
  en: {
    aria: "Sample professional resume",
    photo: "Professional profile photo",
    name: "Maya Bennett",
    title: "Senior Product Manager",
    contact: ["maya@email.com", "San Francisco", "linkedin.com/in/maya"],
    profile: "Profile",
    profileText: "Customer-focused product manager with 8+ years building SaaS onboarding, AI workflows, and analytics products.",
    skills: "Skills",
    skillItems: ["Roadmaps", "AI UX", "SQL", "A/B tests", "Figma", "Jira"],
    education: "Education",
    educationLines: ["MBA, Berkeley Haas", "B.S. Computer Science"],
    certification: "Certification",
    certificationText: "Certified Scrum Product Owner",
    experience: "Experience",
    roles: [
      { title: "Lead Product Manager", company: "Northstar AI · 2022-Present", bullets: ["Launched AI resume insights used by 120k candidates.", "Improved activation 31% by redesigning onboarding."] },
      { title: "Product Manager", company: "BrightHire · 2018-2022", bullets: ["Shipped ATS-friendly profile scoring across 14 markets.", "Cut weekly support requests by 22% with clearer guidance."] },
    ],
    projects: "Projects",
    projectTitle: "Career Match Engine",
    projectCompany: "Internal platform",
    projectBullets: ["Mapped job descriptions to measurable resume achievements."],
    atsFriendly: "ATS friendly",
    aiSuggestions: "AI tips",
    aiSuggestionItems: [],
  },
  fr: {
    aria: "Exemple de CV professionnel",
    photo: "Photo de profil professionnelle",
    name: "Maya Benali",
    title: "Cheffe de produit senior",
    contact: ["maya@email.com", "Casablanca", "linkedin.com/in/maya"],
    profile: "Profil",
    profileText: "Cheffe de produit orientée client, avec 8 ans d'expérience sur l'onboarding SaaS, les parcours IA et les produits d'analyse.",
    skills: "Compétences",
    skillItems: ["Roadmaps", "UX IA", "SQL", "Tests A/B", "Figma", "Jira"],
    education: "Formation",
    educationLines: ["MBA, HEM Business School", "Licence informatique"],
    certification: "Certification",
    certificationText: "Certified Scrum Product Owner",
    experience: "Expérience",
    roles: [
      { title: "Lead Product Manager", company: "Northstar AI · 2022-Présent", bullets: ["Lancement d'insights CV IA utilisés par 120k candidats.", "Activation améliorée de 31 % grâce à une refonte de l'onboarding."] },
      { title: "Product Manager", company: "BrightHire · 2018-2022", bullets: ["Déploiement d'un scoring de profil compatible ATS sur 14 marchés.", "Réduction de 22 % des demandes support avec des conseils plus clairs."] },
    ],
    projects: "Projets",
    projectTitle: "Moteur de correspondance emploi",
    projectCompany: "Plateforme interne",
    projectBullets: ["Association des offres d'emploi à des réalisations mesurables du CV."],
    atsFriendly: "Compatible ATS",
    aiSuggestions: "Conseils IA",
    aiSuggestionItems: [],
  },
  ar: {
    aria: "نموذج سيرة ذاتية احترافية",
    photo: "صورة ملف شخصي احترافية",
    name: "مايا بنعلي",
    title: "مديرة منتج أولى",
    contact: ["maya@email.com", "الدار البيضاء", "linkedin.com/in/maya"],
    profile: "الملخص",
    profileText: "مديرة منتج تركز على المستخدم، لديها 8 سنوات من الخبرة في تجارب SaaS وسير عمل الذكاء الاصطناعي ومنتجات التحليلات.",
    skills: "المهارات",
    skillItems: ["خارطة المنتج", "تجربة IA", "SQL", "اختبارات A/B", "Figma", "Jira"],
    education: "التعليم",
    educationLines: ["ماجستير إدارة الأعمال، HEM", "إجازة في علوم الحاسوب"],
    certification: "الشهادات",
    certificationText: "Certified Scrum Product Owner",
    experience: "الخبرة",
    roles: [
      { title: "مديرة منتج رئيسية", company: "Northstar AI · 2022-الحاضر", bullets: ["إطلاق رؤى سيرة ذاتية مدعومة بالذكاء الاصطناعي استخدمها 120 ألف مرشح.", "تحسين التفعيل بنسبة 31% عبر إعادة تصميم تجربة البدء."] },
      { title: "مديرة منتج", company: "BrightHire · 2018-2022", bullets: ["إطلاق تقييم ملف متوافق مع ATS في 14 سوقاً.", "خفض طلبات الدعم الأسبوعية بنسبة 22% من خلال إرشادات أوضح."] },
    ],
    projects: "المشاريع",
    projectTitle: "محرك مطابقة الوظائف",
    projectCompany: "منصة داخلية",
    projectBullets: ["ربط أوصاف الوظائف بإنجازات قابلة للقياس في السيرة الذاتية."],
    atsFriendly: "متوافق مع ATS",
    aiSuggestions: "اقتراحات IA",
    aiSuggestionItems: [],
  },
};

function HeroResumePreview({ isMobile, lang = "en" }) {
  const [selectedAccent, setSelectedAccent] = useState(HERO_PREVIEW_THEMES[0]);
  const accent = accentOnPaper(selectedAccent, 5);
  const compact = isMobile;
  const sample = HERO_PREVIEW_COPY[lang] || HERO_PREVIEW_COPY.en;
  const text = {
    ink: "#172033",
    muted: "#5f6f86",
    line: "#dce6f2",
  };
  const panel = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(203,213,225,0.82)",
    boxShadow: "0 16px 42px rgba(15,23,42,0.16)",
    backdropFilter: "blur(10px)",
  };
  const focusRing = `0 0 0 3px ${accent}33`;

  return (
    <section aria-label="Interactive resume customization preview"
      className="ac-hero-preview"
      style={{ position: "relative", width: "100%", maxWidth: compact ? 360 : 440,
        margin: compact ? "0 auto" : 0, padding: compact ? "24px 18px 18px" : "28px 30px 22px",
        overflow: "visible" }}>
      <div aria-hidden style={{ position: "absolute", inset: compact ? "18px 0 0" : "10px 4px 0",
        borderRadius: 28, background: `linear-gradient(135deg, ${accent}1f, #e8f1ff 46%, #ffffff 100%)`,
        boxShadow: `0 28px 80px ${accent}22`, transform: "rotate(-2deg)" }} />
      {!compact && (
        <>
          <div aria-hidden style={{ position: "absolute", width: 94, height: 94, borderRadius: "50%",
            background: `${accent}20`, top: 2, right: 24, filter: "blur(2px)" }} />
          <div aria-hidden style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%",
            background: "#fde68a", top: 64, left: 28, boxShadow: "0 0 22px #fde68a" }} />
          <div aria-hidden style={{ position: "absolute", width: 7, height: 7, borderRadius: "50%",
            background: "#bfdbfe", right: 2, bottom: 104, boxShadow: "0 0 18px #bfdbfe" }} />
        </>
      )}

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: compact ? "1fr" : "42px 1fr",
        gap: compact ? 12 : 14, alignItems: "center" }}>
        <div aria-label="Choose resume theme color" role="group"
          style={{ ...panel, borderRadius: 999, padding: compact ? "8px 10px" : "10px 8px",
            display: "flex", flexDirection: compact ? "row" : "column", gap: 8,
            justifyContent: "center", justifySelf: compact ? "center" : "auto" }}>
          {HERO_PREVIEW_THEMES.map(color => (
            <button key={color} type="button" aria-label={`Use ${color} resume accent`}
              aria-pressed={accent === color}
              onClick={() => setSelectedAccent(color)}
              onFocus={e => { e.currentTarget.style.boxShadow = focusRing; }}
              onBlur={e => { e.currentTarget.style.boxShadow = accent === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : "none"; }}
              style={{ width: compact ? 24 : 22, height: compact ? 24 : 22, borderRadius: "50%",
                background: color, border: "2px solid #fff", cursor: "pointer",
                boxShadow: selectedAccent === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : "none",
                transition: "transform 0.18s ease, box-shadow 0.18s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            />
          ))}
        </div>

        <div style={{ position: "relative", justifySelf: "center", width: "100%", maxWidth: compact ? 330 : 364 }}>
          <div aria-hidden style={{ position: "absolute", inset: "-14px -18px", borderRadius: 24,
            background: "linear-gradient(145deg, rgba(255,255,255,0.38), rgba(148,163,184,0.10))",
            filter: "blur(1px)" }} />
          <article aria-label={sample.aria} dir={lang === "ar" ? "rtl" : "ltr"}
            style={{ position: "relative", background: "#fff", color: text.ink, borderRadius: 14,
              overflow: "hidden", border: "1px solid #dbe5f2",
              boxShadow: "0 28px 70px rgba(15,23,42,0.28)",
              transform: compact ? "none" : "perspective(1000px) rotateY(-3deg) rotateX(1deg)",
              transformOrigin: "center", transition: "border-color 0.22s ease, transform 0.22s ease" }}>
            <header style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
              color: "#fff", padding: compact ? "16px 16px 14px" : "18px 20px 16px",
              display: "grid", gridTemplateColumns: "58px 1fr", gap: 14, alignItems: "center",
              transition: "background 0.24s ease" }}>
              <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                background: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.72)" }}>
                <svg viewBox="0 0 64 64" width="56" height="56" role="img" aria-label={sample.photo}>
                  <defs>
                    <linearGradient id="hero-avatar-bg" x1="0" x2="1" y1="0" y2="1">
                      <stop stopColor="#dbeafe" />
                      <stop offset="1" stopColor="#f8fafc" />
                    </linearGradient>
                  </defs>
                  <rect width="64" height="64" fill="url(#hero-avatar-bg)" />
                  <circle cx="32" cy="25" r="12" fill="#334155" />
                  <path d="M14 64c3-15 12-23 18-23s15 8 18 23" fill="#475569" />
                  <path d="M20 64c2-10 7-16 12-16s10 6 12 16" fill="#e2e8f0" opacity=".9" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: compact ? 20 : 23, lineHeight: 1.1, color: "#fff",
                  letterSpacing: "0", fontWeight: 800 }}>{sample.name}</h2>
                <p style={{ margin: "4px 0 8px", fontSize: compact ? 11.5 : 12.5,
                  color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{sample.title}</p>
                <InlineList items={sample.contact}
                  color="rgba(255,255,255,0.84)" fontSize={9.5} />
              </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "0.82fr 1.28fr",
              minHeight: compact ? 360 : 396 }}>
              <aside style={{ background: "#f5f8fc", padding: compact ? "14px 16px" : "16px 18px",
                borderRight: compact ? "none" : `1px solid ${text.line}` }}>
                <ResumeMiniSection accent={accent} title={sample.profile}>
                  {sample.profileText}
                </ResumeMiniSection>
                <ResumeMiniSection accent={accent} title={sample.skills}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {sample.skillItems.map(skill => (
                      <span key={skill} style={{ fontSize: 9.5, color: chipInk(accent, "#f5f8fc"),
                        background: `${accent}12`,
                        border: `1px solid ${accent}20`, borderRadius: 999, padding: "2px 7px", fontWeight: 700 }}>{skill}</span>
                    ))}
                  </div>
                </ResumeMiniSection>
                <ResumeMiniSection accent={accent} title={sample.education}>
                  {sample.educationLines.map((line, index) => (
                    <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>
                  ))}
                </ResumeMiniSection>
                {!compact && (
                  <ResumeMiniSection accent={accent} title={sample.certification}>
                    {sample.certificationText}
                  </ResumeMiniSection>
                )}
              </aside>
              <main style={{ padding: compact ? "14px 16px 16px" : "16px 20px 20px" }}>
                <ResumeMiniSection accent={accent} title={sample.experience}>
                  {sample.roles.map((role) => (
                    <ResumeMiniRole key={`${role.title}-${role.company}`} title={role.title} company={role.company}
                      bullets={role.bullets} />
                  ))}
                </ResumeMiniSection>
                <ResumeMiniSection accent={accent} title={sample.projects}>
                  <ResumeMiniRole title={sample.projectTitle} company={sample.projectCompany}
                    bullets={sample.projectBullets} />
                </ResumeMiniSection>
              </main>
            </div>
          </article>

          <div style={{ position: "absolute", top: compact ? 10 : 18, right: compact ? 4 : -40,
            display: "flex", gap: 8 }}>
            {["PDF", "DOCX"].map(label => (
              <button key={label} type="button" aria-label={`${label} export preview button`}
                onFocus={e => { e.currentTarget.style.boxShadow = focusRing; }}
                onBlur={e => { e.currentTarget.style.boxShadow = panel.boxShadow; }}
                style={{ ...panel, color: text.ink, borderRadius: 999, padding: compact ? "7px 9px" : "8px 11px",
                  display: "inline-flex", alignItems: "center", gap: 5, fontSize: compact ? 10 : 11,
                  fontWeight: 800, cursor: "default" }}>
                <LineIcon name="document" size={compact ? 12 : 13} color={accent} />
                {label}
              </button>
            ))}
          </div>

          <div aria-label={sample.atsFriendly} style={{ ...panel, position: "absolute", top: compact ? 62 : 84,
            left: compact ? 4 : -28, borderRadius: 999, padding: compact ? "7px 10px" : "9px 13px",
            display: "inline-flex", alignItems: "center", gap: 6, color: "#166534",
            fontSize: compact ? 10.5 : 12, fontWeight: 800 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#dcfce7",
              display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <LineIcon name="check" size={12} color="#16a34a" />
            </span>
            {sample.atsFriendly}
          </div>

          <div style={{ ...panel, position: "absolute", right: compact ? 4 : -44,
            bottom: compact ? 14 : 28, width: compact ? 205 : 224, borderRadius: 14,
            padding: compact ? "10px 11px" : "12px 13px", color: text.ink }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7,
              fontSize: compact ? 11.5 : 12.5, fontWeight: 900 }}>
              <LineIcon name="spark" size={14} color={accent} />
              {sample.aiSuggestions}
            </div>
            {sample.aiSuggestionItems.map(item => (
              <p key={item} style={{ display: "flex", gap: 6, margin: "5px 0 0", fontSize: compact ? 9.5 : 10.5,
                lineHeight: 1.4, color: text.muted }}>
                <LineIcon name="check" size={11} color="#16a34a" style={{ marginTop: 1 }} />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResumeMiniSection({ accent, title, children }) {
  return (
    <section style={{ marginBottom: 13 }}>
      <h3 style={{ margin: "0 0 7px", color: accent, fontSize: 9.5, lineHeight: 1,
        letterSpacing: "1px", textTransform: "uppercase", fontWeight: 900 }}>{title}</h3>
      <div style={{ color: "#526174", fontSize: 10.8, lineHeight: 1.55 }}>{children}</div>
    </section>
  );
}

function InlineList({ items, color = "inherit", separator = " · ", justifyContent = "flex-start", fontSize }) {
  const values = (Array.isArray(items) ? items : []).filter(Boolean);
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.2rem 0.5rem", alignItems: "center",
      justifyContent, color, fontSize, lineHeight: 1.35 }}>
      {values.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && <span aria-hidden="true" style={{ opacity: 0.72 }}>{separator}</span>}
          <bdi dir="auto" style={{ unicodeBidi: "isolate", overflowWrap: "anywhere" }}>{item}</bdi>
        </React.Fragment>
      ))}
    </span>
  );
}

function ResumeMiniRole({ title, company, bullets }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11.5, fontWeight: 900, color: "#172033", lineHeight: 1.25 }}>{title}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#526174", margin: "2px 0 4px" }}>{company}</div>
      <ul style={{ margin: 0, paddingLeft: 15, color: "#526174", fontSize: 10.3, lineHeight: 1.45 }}>
        {bullets.map(bullet => <li key={bullet} style={{ marginBottom: 2 }}>{bullet}</li>)}
      </ul>
    </div>
  );
}

// The demo is one of the heaviest landing-page subtrees (editor controls,
// preview, ATS card, and modal). It is below the fold, so hydrating all of it
// during first paint creates avoidable DOM and main-thread work. Keep its
// crawlable introduction in the prerendered HTML and mount the interactive
// controls shortly before they enter the viewport.
function DeferredInteractiveResumeDemo({ isMobile, onContinue, copy, closeLabel }) {
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    const marker = markerRef.current;
    if (!marker || !("IntersectionObserver" in window)) {
      const id = window.setTimeout(() => setReady(true), 1);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(marker);
    return () => observer.disconnect();
  }, [ready]);

  if (ready) {
    return (
      <React.Suspense fallback={<div aria-hidden="true" style={{ minHeight: 520 }} />}>
        <InteractiveResumeDemo isMobile={isMobile} onContinue={onContinue} copy={copy} closeLabel={closeLabel} />
      </React.Suspense>
    );
  }

  return (
    <section ref={markerRef} aria-labelledby="interactive-demo-title"
      style={{ minHeight: 300, padding: "78px 24px", contentVisibility: "auto",
        containIntrinsicSize: "auto 520px", background: `linear-gradient(180deg, ${C.accent}08, transparent 78%)` }}>
      <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{copy.eyebrow}</p>
        <h2 id="interactive-demo-title" style={{ fontSize: "clamp(24px, 3.4vw, 40px)", fontWeight: 800,
          letterSpacing: "-0.8px", color: C.text1, margin: "0 0 12px" }}>{copy.title}</h2>
        <p style={{ fontSize: 15.5, color: C.text2, margin: 0, lineHeight: 1.65 }}>{copy.desc}</p>
      </div>
    </section>
  );
}

function DeferredApplicationPack({ locale, mobile }) {
  const [ready, setReady] = useState();
  useEffect(() => { setReady(1); }, []);
  if (ready) return <React.Suspense fallback={null}><ApplicationPackSection locale={locale} mobile={mobile} /></React.Suspense>;
  return null;
}

// Section picker opened by the "Add content" button. Accessible (role=dialog,
// focus trap, Esc/backdrop close, visible ×); bottom-sheet on mobile.
function AddContentModal({ open, onClose, addedSet, onAdd, sectionName, eui, rtl, isMobile }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.activeElement;
    const focusables = () => (dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
      : []);
    const first = focusables()[0]; if (first) first.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (prev && prev.focus) prev.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} dir={rtl ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex",
        alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 24 }}>
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="addcontent-title"
        style={{ background: C.surface, border: "none",
          borderRadius: isMobile ? "16px 16px 0 0" : 16, padding: "22px 22px 24px",
          width: "100%", maxWidth: isMobile ? "100%" : 460, maxHeight: isMobile ? "85vh" : "80vh",
          overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <h3 id="addcontent-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text1 }}>{eui.addContent}</h3>
          <button type="button" onClick={onClose} aria-label={eui.close}
            style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 2px" }}>×</button>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: C.text2 }}>{eui.addContentSub}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PICKER_CATALOG.map((key) => {
            const added = addedSet.has(key);
            return (
              <button key={key} type="button" disabled={added} onClick={() => onAdd(key)}
                style={{ display: "flex", alignItems: "center", gap: 12, textAlign: rtl ? "right" : "left",
                  background: added ? "transparent" : SECTION_TOKENS.softSurface, border: "none", borderRadius: 10,
                  padding: "11px 14px", cursor: added ? "default" : "pointer", fontFamily: "inherit", color: C.text1,
                  opacity: added ? 0.55 : 1, width: "100%" }}>
                <span aria-hidden style={{ fontSize: 18, flexShrink: 0 }}>{PICKER_ICONS[key]}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{sectionName(key)}</span>
                {added
                  ? <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, flexShrink: 0 }}>✓ {eui.alreadyAdded}</span>
                  : <span aria-hidden style={{ fontSize: 18, color: C.accent2, fontWeight: 800, flexShrink: 0 }}>+</span>}
              </button>
            );
          })}
        </div>
        {/* TODO: custom/blank section with a user-defined title — the app has no
            custom-section concept yet; add a "Custom section" entry here that
            creates a user-titled generic section when that model exists. */}
      </div>
    </div>
  );
}

function TemplatePreviewModal({ template, meta, onClose, onUse, isMobile, rtl, kind = "resume", labels = {}, bu = {}, coverSample = SAMPLE_COVER }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!template || typeof document === "undefined") return;
    const prev = document.activeElement;
    const focusables = () => (dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
      : []);
    setTimeout(() => focusables()[0]?.focus(), 20);
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (prev && prev.focus) prev.focus();
    };
  }, [template, onClose]);

  if (!template) return null;
  const info = meta || {
    description: template.tag || "Professional layout with clear sections and export support.",
    bestFor: "Best for general professional applications.",
    attributes: ["Professional", "Flexible"],
    layout: "Flexible",
  };
  const sample = kind === "cover" ? {} : (THUMB_SAMPLES[template.id] || {});
  const isRtlPreview = sample.rtl || rtl;
  const sampleLang = sampleLangForTemplate(template);
  return (
    <div onClick={onClose} dir={rtl ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.68)",
        display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center",
        padding: isMobile ? 0 : 24 }}>
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        aria-labelledby="template-preview-title"
        style={{ width: "100%", maxWidth: isMobile ? "100%" : 1040, maxHeight: isMobile ? "100vh" : "88vh",
          overflowY: "auto", background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: isMobile ? 0 : 18, boxShadow: "0 30px 90px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: `${C.surface}f5`,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.border}`, padding: isMobile ? "14px 16px" : "16px 20px",
          display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.2px", textTransform: "uppercase",
              color: C.accent2, marginBottom: 4 }}>{labels.previewEyebrow || "Template preview"}</div>
            <h2 id="template-preview-title" style={{ margin: 0, color: C.text1, fontSize: isMobile ? 20 : 24,
              letterSpacing: "-0.3px", lineHeight: 1.15 }}>{template.name}</h2>
          </div>
          <button type="button" onClick={() => onUse(template)}
            style={{ minHeight: 42, background: C.grad, color: "#fff", border: "none", borderRadius: 9,
              padding: isMobile ? "0 12px" : "0 18px", fontSize: 13.5, fontWeight: 900,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {labels.useTemplate || "Use this template"}
          </button>
          <button type="button" onClick={onClose} aria-label={labels.close || "Close template preview"}
            style={{ width: 42, height: 42, borderRadius: 9, border: `1px solid ${C.border}`,
              background: "transparent", color: C.text2, cursor: "pointer", fontSize: 22, lineHeight: 1,
              fontFamily: "inherit" }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 0.72fr) minmax(260px, 0.28fr)",
          gap: isMobile ? 18 : 24, padding: isMobile ? 16 : 24, alignItems: "start" }}>
          <div style={{ background: "transparent", borderRadius: 0, padding: 0,
            overflow: "auto", display: "flex", justifyContent: "center" }}>
            {kind === "cover" ? (
              <div style={{ width: "min(100%, 700px)", minWidth: isMobile ? 0 : 520 }}>
                <CoverLetterPaper tpl={template} data={coverSample} />
              </div>
            ) : (
              <div style={{ width: "min(100%, 700px)", minWidth: isMobile ? 0 : 520 }}>
                <ResumePaper tpl={template}
                  result={sample.result || SAMPLE_RESUME}
                  rtl={isRtlPreview}
                  lang={sampleLang}
                  placeholder={false} />
              </div>
            )}
          </div>
          <aside style={{ display: "grid", gap: 14 }}>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ margin: "0 0 8px", color: C.text1, fontSize: 15.5 }}>{(labels.whyChoose || "Why choose {name}").replace("{name}", template.name)}</h3>
              <p style={{ margin: "0 0 12px", color: C.text2, fontSize: 13.5, lineHeight: 1.6 }}>{info.description}</p>
              <p style={{ margin: 0, color: C.text3, fontSize: 13, lineHeight: 1.55 }}>{info.bestFor}</p>
            </div>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ margin: "0 0 10px", color: C.text1, fontSize: 15.5 }}>{labels.templateDetails || "Template details"}</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  [bu.detailLayout || "Layout", localizeTemplateTerm(info.layout || "Flexible", bu)],
                  [bu.detailAtsStatus || "ATS status", kind === "cover" ? (bu.detailProfessionalLetter || "Professional letter layout") : ((info.attributes || []).includes("ATS-friendly") ? (bu.detailAtsFriendly || "ATS-friendly structure") : (bu.detailProfessionalStructure || "Professional structure"))],
                  [bu.detailRtlSupport || "RTL support", kind === "cover" ? (bu.detailUsesDocLang || "Uses document language settings") : ((info.filters || []).includes("rtl") ? (bu.detailRtlSupported || "Supported") : (bu.detailRtlStandard || "Standard left-to-right preview"))],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12,
                    borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <span style={{ color: C.text3, fontSize: 12.5 }}>{label}</span>
                    <span style={{ color: C.text1, fontSize: 12.5, fontWeight: 800, textAlign: rtl ? "left" : "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(info.attributes || []).map((attr) => (
                <span key={attr} style={{ border: `1px solid ${C.border}`, background: C.elevated,
                  color: C.text2, borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 800 }}>
                  {localizeTemplateTerm(attr, bu)}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const defaultMaster = {
  name: "", email: "", phone: "", location: "", linkedin: "", website: "",
  headline: "", summary: "",
  jobs: [], education: [], skills: [], certifications: [],
  projects: [], languages: [], achievements: [], volunteer: [], careerEvidence: [],
};

const DEFAULT_APP_ROUTE = { appView: "landing", navPage: "resume", step: "templates", coverStep: "templates" };

function handleRouteLink(event, action) {
  if (shouldUseNativeNavigation(event)) return;
  event.preventDefault();
  action();
}

function routeWithParam(path, lang, key, value) {
  const href = localizeRoute(path, lang);
  return `${href}${href.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

function routeFromAppPath(pathname = "/", hash = "") {
  const hashRoute = hash ? hash.replace(/^#\/?/, "").replace(/\/+$/, "") : "";
  const pathnameRoute = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const legacyHashRoutes = new Set(["resume", "resume/templates", "resume-builder", "resume/builder", "cover-letter", "cover-letter/templates", "cover-letter-builder", "cover-letter/builder", "job-tracker", "ats-checker", "app/ats-checker", "master-profile", "about", "email-signature", "personal-website"]);
  const clean = legacyHashRoutes.has(hashRoute) ? hashRoute : pathnameRoute;
  if (!clean) return { ...DEFAULT_APP_ROUTE };
  const route = { ...DEFAULT_APP_ROUTE, appView: "app" };
  if (clean === "resume" || clean === "resume/templates") return { ...route, navPage: "resume", step: "templates" };
  if (clean === "resume-builder" || clean === "resume/builder") return { ...route, navPage: "resume", step: "form" };
  if (clean === "cover-letter" || clean === "cover-letter/templates") return { ...route, navPage: "cover", coverStep: "templates" };
  if (clean === "cover-letter-builder" || clean === "cover-letter/builder") return { ...route, navPage: "cover", coverStep: "form" };
  if (clean === "job-tracker") return { ...route, navPage: "tracker" };
  if (clean === "ats-checker" || clean === "app/ats-checker" || hashRoute === "ats-checker") return { ...route, navPage: "ats" };
  if (clean === "master-profile") return { ...route, navPage: "master" };
  if (clean === "about") return { ...route, navPage: "about" };
  if (clean === "email-signature") return { ...route, navPage: "signature" };
  if (clean === "personal-website") return { ...route, navPage: "website" };
  return { ...DEFAULT_APP_ROUTE };
}

function pathFromRoute({ appView, navPage, step, coverStep }) {
  if (appView !== "app") return "/";
  if (navPage === "resume") return step === "form" ? "/resume-builder/" : "/resume/templates/";
  if (navPage === "cover") return coverStep === "form" ? "/cover-letter-builder/" : "/cover-letter/templates/";
  if (navPage === "tracker") return "/job-tracker/";
  if (navPage === "ats") return "/ats-checker/";
  if (navPage === "master") return "/master-profile/";
  if (navPage === "about") return "/about";
  if (navPage === "signature") return "/email-signature";
  if (navPage === "website") return "/personal-website";
  return "/";
}

function getInitialAppRoute(pathname, hash) {
  if (pathname) return routeFromAppPath(pathname, hash || "");
  if (typeof window === "undefined") return { ...DEFAULT_APP_ROUTE };
  return routeFromAppPath(window.location.pathname, window.location.hash);
}

function routeLanguageOverride(pathname = "") {
  if (pathname === "/fr" || pathname === "/fr/") return "fr";
  if (pathname === "/ar" || pathname === "/ar/") return "ar";
  return "";
}

export default function ResumeGenerator() {
  const location = useLocation();
  const initialRoute = getInitialAppRoute(location.pathname, location.hash);
  const routeLang = routeLanguageOverride(location.pathname);
  // During static generation there is no browser storage or navigator, and the
  // SSG process renders every route in one shared context — so a persisted
  // language from an earlier /fr/ or /ar/ render could otherwise leak into the
  // English routes and mis-localize their pre-rendered chrome (e.g. the footer
  // home link pointing to /fr/). On the server, derive the language purely from
  // the route: /fr/* → fr, /ar/* → ar, everything else → en. Client-side this
  // stays empty so the existing storage/browser-preference logic is untouched.
  const ssrRouteLang = typeof window === "undefined" ? (routeLang || "en") : "";
  const initialSearchParams = new URLSearchParams(location.search || "");
  const initialInterfaceLang = initialSearchParams.get("ui") || routeLang || ssrRouteLang;
  const initialDocumentLang = initialSearchParams.get("docLang") || routeLang || ssrRouteLang;
  const initialTemplateCountry = (() => {
    const value = initialSearchParams.get("country") || "all";
    return TEMPLATE_COUNTRY_FILTERS.includes(value) ? value : "all";
  })();
  const [navPage, setNavPage] = useState(initialRoute.navPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sideSearch, setSideSearch] = useState("");
  const [tplSearch, setTplSearch] = useState("");
  const [tplFilter, setTplFilter] = useState(initialTemplateCountry === "all" ? "recommended" : "all");
  const [tplCountry, setTplCountry] = useState(initialTemplateCountry);
  const [templateFiltersOpen, setTemplateFiltersOpen] = useState(false);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [templateHover, setTemplateHover] = useState("");
  const [templateFocus, setTemplateFocus] = useState("");
  const [coverTemplatePreview, setCoverTemplatePreview] = useState(null);
  const [coverTemplateHover, setCoverTemplateHover] = useState("");
  const [coverTemplateFocus, setCoverTemplateFocus] = useState("");
  const [step, setStep] = useState(initialRoute.step);
  const [interfaceLanguage, setInterfaceLanguage] = useState(() => isInterfaceLang(initialInterfaceLang) ? initialInterfaceLang : initialInterfaceLanguage());
  const [documentLanguage, setDocumentLanguage] = useState(() => isDocumentLang(initialDocumentLang) ? initialDocumentLang : initialDocumentLanguage());
  const [lazyLanding2, setLazyLanding2] = useState(null);
  const [lazyAtsResults, setLazyAtsResults] = useState(null);
  const selectedLang = languageByCode(interfaceLanguage);
  const selectedDocumentLang = languageByCode(documentLanguage);
  const lang = UI_LANGS.has(interfaceLanguage) ? interfaceLanguage : "en";
  const docLang = selectedDocumentLang?.code || "en";
  const documentRtl = isRtlLang(docLang);
  const [tpl, setTpl] = useState(() => (
    initialRoute.navPage === "resume" && initialRoute.step === "form"
      ? TEMPLATES.find((template) => template.id === RECOMMENDED_TEMPLATE_ID) || TEMPLATES.find((template) => !template.blank) || null
      : null
  ));
  const emptyResumeForm = useMemo(() => migrateForm({
    name: "", title: "", email: "", phone: "", location: "",
    linkedin: "", website: "",
    summary: "", experience: "", education: "", skills: "",
    certifications: "", languages: "", projects: "", volunteer: "", awards: "",
    sectionTitles: {},
  }), []);
  const [form, setForm] = useState(() => emptyResumeForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [educationError, setEducationError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [shakeField, setShakeField] = useState("");
  const [phoneCode, setPhoneCode] = useState(() => LANG_CODE[interfaceLanguage] || "+1");
  const [mobileResumeMode, setMobileResumeMode] = useState("edit");
  const [exporting, setExporting] = useState("");
  const [activeToolbarPanel, setActiveToolbarPanel] = useState(null);
  const resumeToolbarRef = useRef(null);
  const coverToolbarRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = new URL(window.location.href);
    if (tplCountry === "all") current.searchParams.delete("country");
    else current.searchParams.set("country", tplCountry);
    const next = `${current.pathname}${current.search}${current.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState({}, "", next);
    }
  }, [tplCountry]);
  const mobileResumeToolbarRef = useRef(null);
  const mobileCoverToolbarRef = useRef(null);
  const [reviewModal, setReviewModal] = useState({ open: false, format: "", warnings: [] });
  const [guidanceDismissed, setGuidanceDismissed] = useState(false);
  const [exportSuccess, setExportSuccess] = useState("");
  const [aiPolished, setAiPolished] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationConfirm, setTranslationConfirm] = useState({ open: false, target: null, error: "" });
  const [importLanguageNotice, setImportLanguageNotice] = useState({ open: false, detected: "", previous: "" });
  const [translationReview, setTranslationReview] = useState({ open: false, original: null, translated: null, fields: [], meta: null, warning: "" });
  const [translationDuplicate, setTranslationDuplicate] = useState({ open: false, existingId: "", target: null });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [authModal, setAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(() => accountSession.getAccount());
  // Optional account / sync / paid-pass UI state.
  const [saveProfileOpen, setSaveProfileOpen] = useState(false);
  const [upsell, setUpsell] = useState(null); // null | "sync" | "tailor"
  const [syncStatus, setSyncStatus] = useState("");
  const [aiTailoring, setAiTailoring] = useState(false);
  const hasPass = accountSession.hasActivePass();
  const translationLimit = hasPass ? 30 : currentUser ? 3 : 1;
  const [translationUsage, setTranslationUsage] = useState(() => readTranslationUsage(translationLimit));
  const [translationDevBypass, setTranslationDevBypass] = useState({ active: false, token: "", header: "" });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const resumePrintRef = useRef(null);
  const coverPrintRef = useRef(null);
  const setSiteLanguage = useCallback((language) => {
    const nextCode = SITE_LANGUAGE_CODES.has(language?.code) ? language.code : "en";
    setInterfaceLanguage(nextCode);
    setPhoneCode(LANG_CODE[nextCode] || "+1");
    persistInterfaceLanguage(nextCode);
    track(EVENTS.INTERFACE_LANGUAGE_SELECTED, {
      language: nextCode,
      interface_direction: isRtlLang(nextCode) ? "rtl" : "ltr",
    });
    if (isRtlLang(nextCode)) track(EVENTS.RTL_INTERFACE_ENABLED, { language: nextCode });
    try {
      localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, nextCode);
      localStorage.setItem(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION);
    } catch {}
  }, []);
  const setDocumentLanguagePreference = useCallback((language) => {
    const nextCode = languageByCode(language?.code || "en").code || "en";
    setDocumentLanguage(nextCode);
    persistDocumentLanguage(nextCode);
    track(EVENTS.DOCUMENT_LANGUAGE_SELECTED, {
      language: nextCode,
      document_direction: isRtlLang(nextCode) ? "rtl" : "ltr",
    });
    if (isRtlLang(nextCode)) track(EVENTS.RTL_DOCUMENT_ENABLED, { language: nextCode });
  }, []);

  useEffect(() => {
    const loader = LANDING2_LOADERS[lang];
    if (!loader) {
      setLazyLanding2(null);
      return undefined;
    }
    let cancelled = false;
    loader()
      .then((module) => {
        if (!cancelled) setLazyLanding2({ language: lang, dictionary: module.default });
      })
      .catch(() => {
        if (!cancelled) setLazyLanding2(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const exportVisualPdf = useCallback(async (ref, fileNameBase, type = "resume") => {
    const node = ref.current;
    if (!node || typeof document === "undefined") return false;
    const direction = isRtlLang(docLang) ? "rtl" : "ltr";
    if (document.fonts?.ready) {
      try { await document.fonts.ready; } catch { /* continue with available fonts */ }
    }
    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");
    const source = node.querySelector?.(".resume-paper") || node;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    Object.assign(host.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "794px",
      background: "#fff",
      pointerEvents: "none",
      zIndex: "-1",
      direction,
    });
    const clone = source.cloneNode(true);
    clone.style.width = "794px";
    clone.style.maxWidth = "794px";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.overflow = "visible";
    clone.style.direction = direction;
    clone.setAttribute("lang", docLang || "en");
    clone.setAttribute("dir", direction);
    const inner = clone.firstElementChild;
    if (inner) {
      inner.style.minHeight = "auto";
      inner.style.alignItems = "flex-start";
    }
    host.appendChild(clone);
    document.body.appendChild(host);
    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const sliceHeight = Math.max(1, Math.floor(canvas.width * (pageHeight / pageWidth)));
      let y = 0;
      let pageIndex = 0;
      while (y < canvas.height) {
        const currentSliceHeight = Math.min(sliceHeight, canvas.height - y);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeight;
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) throw new Error("canvas");
        ctx.drawImage(canvas, 0, y, canvas.width, currentSliceHeight, 0, 0, canvas.width, currentSliceHeight);
        const imgData = pageCanvas.toDataURL("image/png");
        const imgHeight = pageWidth * (currentSliceHeight / canvas.width);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight, undefined, "FAST");
        y += currentSliceHeight;
        pageIndex += 1;
      }
      pdf.save(`${sanitizeFilename(fileNameBase, type === "cover" ? "cover-letter" : "resume")}${type === "cover" ? "-cover-letter" : ""}.pdf`);
      return true;
    } finally {
      host.remove();
    }
  }, [docLang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const direction = isRtlLang(interfaceLanguage) ? "rtl" : "ltr";
    document.documentElement.lang = interfaceLanguage || "en";
    document.documentElement.dataset.acInterfaceLanguage = interfaceLanguage || "en";
    document.documentElement.dir = direction;
    document.body?.setAttribute("dir", direction);
  }, [interfaceLanguage]);

  useEffect(() => {
    const close = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Analytics init + optional-account bootstrap (runs once in the browser).
  useEffect(() => {
    initAnalytics();
    clearApplyCraftLocalData();
    track(EVENTS.DOCUMENT_AUTOSAVE_DISABLED, { storagePolicy: "no_document_content_persistence" });
    try {
      track(EVENTS.LANGUAGE_MIGRATION_COMPLETED, {
        interface_language: lang,
        document_language: docLang,
        interface_direction: rtl ? "rtl" : "ltr",
        document_direction: documentRtl ? "rtl" : "ltr",
      });
    } catch {
      track(EVENTS.LANGUAGE_MIGRATION_FAILED);
    }
    if (!ACCOUNTS_ENABLED) return;
    let cancelled = false;
    (async () => {
      // 1) Complete a magic-link sign-in if the URL carries a token.
      const account = await import("./account.js");
      const acct = await account.consumeLoginFromUrl();
      if (acct && !cancelled) {
        setCurrentUser(acct);
        // Pull the cloud Master Profile if the pass is active.
        if (accountSession.hasActivePass()) {
          try {
            const { master: cloud } = await account.pullMasterProfile();
            if (cloud && !cancelled) setMaster(m => ({ ...m, ...cloud }));
          } catch { /* no pass / nothing saved */ }
        }
      } else if (accountSession.getSession() && !cancelled) {
        // 2) Refresh pass status for an existing session.
        const refreshed = await account.refreshAccount();
        if (refreshed && !cancelled) setCurrentUser(refreshed);
      }
      // 3) Returning from a successful checkout.
      if (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("ac_checkout") === "success") {
        track(EVENTS.CHECKOUT_COMPLETED);
        const url = new URL(window.location.href);
        url.searchParams.delete("ac_checkout");
        window.history.replaceState({}, "", url.toString());
        const refreshed = await account.refreshAccount();
        if (refreshed && !cancelled) setCurrentUser(refreshed);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateProfilePhoto(file)) {
      setStatusMsg(st.photoType);
      e.target.value = "";
      setTimeout(() => setStatusMsg(""), 2500);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target.result);
    reader.onerror = () => setStatusMsg(st.photoRead);
    reader.readAsDataURL(file);
  };
  const [uploadedResume, setUploadedResume] = useState(null);
  const [postImportTemplatePickerOpen, setPostImportTemplatePickerOpen] = useState(false);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [appView, setAppView] = useState(initialRoute.appView);
  const [coachOpen, setCoachOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState(null);
  const [coachBullet, setCoachBullet] = useState("");
  const [coachBulletIdx, setCoachBulletIdx] = useState(0);
  const [coachAnswers, setCoachAnswers] = useState({});
  const [coachResult, setCoachResult] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [master, setMaster] = useState(() => ({ ...defaultMaster }));
  const [masterTab, setMasterTab] = useState("personal");
  const [masterOpen, setMasterOpen] = useState({});
  const [tailorOpen, setTailorOpen] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdKws, setJdKws] = useState(null);
  const [tailorSel, setTailorSel] = useState(null);
  const [skillDraft, setSkillDraft] = useState("");
  const [trackerStorageEnabled, setTrackerStorageEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("ac_tracker_metadata_enabled") === "true"; } catch { return false; }
  });
  const [trackerCards, setTrackerCards] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      if (localStorage.getItem("ac_tracker_metadata_enabled") !== "true") return [];
      const saved = safeParseStoredJson(localStorage.getItem("ac_tracker_metadata_v1"), []);
      return Array.isArray(saved) ? saved : [];
    } catch { return []; }
  });
  const [trackerModal, setTrackerModal] = useState({ open: false, card: null });
  const trackerDialogRef = useRef(null);
  useFocusTrap(trackerDialogRef, trackerModal.open);
  useEffect(() => {
    if (!trackerModal.open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setTrackerModal({ open: false, card: null });
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [trackerModal.open]);
  const [trackerDragId, setTrackerDragId] = useState(null);
  const [trackerDragOver, setTrackerDragOver] = useState(null);
  const [trackerFilters, setTrackerFilters] = useState({ query: "", market: "", language: "", resume: "", followUpDue: false });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (trackerStorageEnabled) {
        localStorage.setItem("ac_tracker_metadata_enabled", "true");
        localStorage.setItem("ac_tracker_metadata_v1", JSON.stringify(trackerCards));
      } else {
        localStorage.removeItem("ac_tracker_metadata_enabled");
        localStorage.removeItem("ac_tracker_metadata_v1");
      }
    } catch { /* storage can be unavailable in private browsing */ }
  }, [trackerCards, trackerStorageEnabled]);
  const [atsText, setAtsText] = useState("");
  const [atsJd, setAtsJd] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [atsFromChecker, setAtsFromChecker] = useState("");
  const [coverStep, setCoverStep] = useState(initialRoute.coverStep);
  const [coverTpl, setCoverTpl] = useState(() => (
    initialRoute.navPage === "cover" && initialRoute.coverStep === "form"
      ? COVER_TEMPLATES.find((template) => template.id === "modern") || COVER_TEMPLATES.find((template) => !template.blank) || null
      : null
  ));
  const [mobileCoverMode, setMobileCoverMode] = useState("edit");
  // Tracks the last auto-generated (locale-derived) date/signoff so we can re-localize
  // them when the document language changes — but only while the user has not edited them.
  const coverAutoDefaults = useRef({ date: "", signoff: "" });
  const [coverForm, setCoverForm] = useState(() => {
    const date = formatLetterDate(new Date(), docLang);
    const signoff = defaultCoverSignoff(docLang);
    coverAutoDefaults.current = { date, signoff };
    return {
      name: "", jobTitle: "", email: "", phone: "", location: "",
      date,
      recipientName: "", recipientTitle: "", company: "", companyAddress: "",
      subject: "", opening: "", body: "", closing: "", signoff,
    };
  });
  // Re-localize the date and sign-off default when the document language changes,
  // unless the user has customized them (value differs from the previous auto-default).
  useEffect(() => {
    const date = formatLetterDate(new Date(), docLang);
    const signoff = defaultCoverSignoff(docLang);
    setCoverForm((f) => {
      const next = { ...f };
      if (f.date === coverAutoDefaults.current.date) next.date = date;
      if (f.signoff === coverAutoDefaults.current.signoff) next.signoff = signoff;
      return next;
    });
    coverAutoDefaults.current = { date, signoff };
  }, [docLang]);
  // Collapse state for the cover-letter section cards (collapsed by default, like the resume builder).
  const [coverCollapsed, setCoverCollapsed] = useState({ recipient: true, sender: true, opening: true, body: true, closing: true });
  const toggleCoverCollapse = useCallback((k) => setCoverCollapsed(c => ({ ...c, [k]: !c[k] })), []);
  // Landing-page mobile hamburger menu.
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const [appHeaderMenuOpen, setAppHeaderMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const route = getInitialAppRoute();
      setAppView(route.appView);
      setNavPage(route.navPage);
      setStep(route.step);
      setCoverStep(route.coverStep);
      setSidebarOpen(false);
    };
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextPath = pathFromRoute({ appView, navPage, step, coverStep });
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const target = `${nextPath}${window.location.search || ""}`;
    if (currentPath !== target) {
      window.history.pushState({}, "", target);
    }
  }, [appView, navPage, step, coverStep]);

  useEffect(() => {
    if (navPage !== "ats") return undefined;
    let cancelled = false;
    loadAtsResultCopy(lang)
      .then((dictionary) => {
        if (!cancelled) setLazyAtsResults({ language: lang, dictionary });
      })
      .catch(() => {
        if (!cancelled) setLazyAtsResults(null);
      });
    return () => {
      cancelled = true;
    };
  }, [navPage, lang]);

  const t = UI[lang];
  const documentBaseT = UI[UI_LANGS.has(docLang) ? docLang : "en"] || UI.en;
  const docLabels = ["en", "fr", "ar"].includes(docLang) ? documentLabelsFor(docLang).sections : {};
  const documentT = { ...documentBaseT, ...docLabels, extracurricular: docLabels.achievements || documentBaseT.extracurricular };
  const at = ACCT_UI[lang]; // account / sync / pass strings
  const eui = ENTRY_UI[lang] || ENTRY_UI.en; // structured-entry editor strings
  const lx = LANDING_UI[lang] || LANDING_UI.en; // landing / site-chrome strings
  const bu = BUILDER_UI[lang] || BUILDER_UI.en; // resume-builder chrome strings
  const cu = COVER_UI[lang] || COVER_UI.en; // cover-letter-builder chrome strings
  const ats = ATS_UI[lang] || ATS_UI.en; // ATS checker strings
  const atsResults = lazyAtsResults?.language === lang ? lazyAtsResults.dictionary : null;
  const tk = TRACKER_UI[lang] || TRACKER_UI.en; // job tracker strings
  const ms = MASTER_UI[lang] || MASTER_UI.en; // master profile strings
  const st = STATUS_UI[lang] || STATUS_UI.en; // toast / status messages
  const reviewUi = QUALITY_REVIEW_UI[lang] || QUALITY_REVIEW_UI.en;
  const l2 = lazyLanding2?.language === lang ? lazyLanding2.dictionary : (LANDING2_UI[lang] || LANDING2_UI.en); // landing marketing body
  const why = l2.why || LANDING2_UI.en.why;
  const positioning = positioningFor(lang);
  const rtl = isRtlLang(interfaceLanguage);
  const translateLabel = useCallback((template, values = {}) => (
    String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "")
  ), []);
  const builderText = useCallback((key, values = {}) => (
    translateLabel(bu[key] || BUILDER_UI.en[key] || key, values)
  ), [bu, translateLabel]);
  const masterText = useCallback((key, values = {}) => (
    translateLabel(ms[key] || MASTER_UI.en[key] || key, values)
  ), [ms, translateLabel]);
  const landingText = useCallback((key, values = {}) => (
    translateLabel(lx[key] || LANDING_UI.en[key] || key, values)
  ), [lx, translateLabel]);
  const templateTagText = useCallback((template) => (
    l2.templateTags?.[template?.id] || template?.tag || ""
  ), [l2]);
  const statusText = useCallback((key, values = {}) => (
    translateLabel(st[key] || STATUS_UI.en[key] || key, values)
  ), [st, translateLabel]);
  const translationErrorMessage = useCallback((error) => {
    switch (error?.message) {
      case "translation-unavailable":
        return statusText("translateUnavailable");
      case "translation-rate-limited":
        return statusText("translateRateLimited");
      case "translation-timeout":
      case "translation-network":
        return statusText("translateNetworkFail");
      case "translation-payload-too-large":
        return statusText("translatePayloadTooLarge");
      case "translation-invalid-request":
      case "translation-bad-response":
      case "translation-server":
        return statusText("translateServerFail");
      default:
        return statusText("translateFail");
    }
  }, [statusText]);
  const accountText = useCallback((key, values = {}) => (
    translateLabel(at[key] || ACCT_UI.en[key] || key, values)
  ), [at, translateLabel]);
  const commonText = useCallback((key, values = {}) => (
    translateLabel(t[key] || UI.en[key] || key, values)
  ), [t, translateLabel]);
  const translationLanguageName = useCallback((code) => {
    const localized = {
      en: { en: "English", fr: "French", ar: "Arabic", es: "Spanish", de: "German" },
      fr: { en: "anglais", fr: "français", ar: "arabe", es: "espagnol", de: "allemand" },
      ar: { en: "الإنجليزية", fr: "الفرنسية", ar: "العربية", es: "الإسبانية", de: "الألمانية" },
      es: { en: "inglés", fr: "francés", ar: "árabe", es: "español", de: "alemán" },
      de: { en: "Englisch", fr: "Französisch", ar: "Arabisch", es: "Spanisch", de: "Deutsch" },
    };
    return localized[lang]?.[code] || languageByCode(code)?.name || code;
  }, [lang]);
  const translationTargetLabel = useCallback((target, fallbackCode = docLang) => (
    translationLanguageName(target?.code || fallbackCode || "en")
  ), [docLang, translationLanguageName]);
  useEffect(() => {
    setTranslationUsage((usage) => {
      const next = { ...usage, limit: translationLimit };
      writeTranslationUsage(next);
      return next;
    });
  }, [translationLimit]);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!TRANSLATION_DEV_BYPASS_HASH) return undefined;
    let cancelled = false;
    let cleanup = () => {};
    import("./translationDevBypass.js").then((mod) => {
      if (cancelled) return;
      mod.install(TRANSLATION_DEV_BYPASS_HASH, window);
      const refreshDevBypass = () => setTranslationDevBypass({
        active: mod.isActive(TRANSLATION_DEV_BYPASS_HASH),
        token: mod.token(TRANSLATION_DEV_BYPASS_HASH),
        header: mod.headerName,
      });
      refreshDevBypass();
      window.addEventListener(mod.eventName, refreshDevBypass);
      window.addEventListener("storage", refreshDevBypass);
      cleanup = () => {
        window.removeEventListener(mod.eventName, refreshDevBypass);
        window.removeEventListener("storage", refreshDevBypass);
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
  const translationLimitReached = !translationDevBypass.active && translationUsage.fullResumeTranslationsUsed >= translationLimit;
  const incrementTranslationUsage = useCallback(() => {
    if (translationDevBypass.active) return;
    setTranslationUsage((usage) => {
      const next = {
        ...usage,
        fullResumeTranslationsUsed: Math.max(0, Number(usage.fullResumeTranslationsUsed || 0)) + 1,
        limit: translationLimit,
      };
      writeTranslationUsage(next);
      return next;
    });
  }, [translationDevBypass.active, translationLimit]);
  const set = useCallback((k) => (e) => setForm(f => ({ ...f, [k]: e.target.value })), []);
  const setField = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  // ── Structured-entry update path ──────────────────────────────────────────
  // The entry arrays are the editing source of truth; the flat string field is
  // re-synced on every change so legacy string consumers keep working.
  const setEntries = useCallback((key, updater) => {
    setForm((f) => {
      const prev = f[key + "Entries"] || [];
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...f, [key + "Entries"]: next, [key]: entriesToText(key, next) };
    });
  }, []);
  // Set a section from a flat string (AI write-backs, Master fill, demo data),
  // preserving each entry's visibility by position where possible.
  const setSectionFromText = useCallback((key, text) => {
    setForm((f) => {
      const old = f[key + "Entries"] || [];
      const parsed = parseEntries(key, text).map((e, i) => ({
        ...e,
        visible: old[i] ? old[i].visible !== false : true,
      }));
      return { ...f, [key + "Entries"]: parsed, [key]: entriesToText(key, parsed) };
    });
  }, []);
  const setSectionTitle = useCallback((key, title) => {
    setForm((f) => ({ ...f, sectionTitles: { ...(f.sectionTitles || {}), [key]: title } }));
  }, []);

  // Hydrate the whole builder form from a parsed resume object (ATS handoff).
  // Replaces the form with clean structured fields — no raw text dumps.
  const hydrateFromParsed = useCallback((p) => {
    const entry = (fields) => ({ id: uid(), visible: true, ...fields });
    const detectedDocumentLanguage = detectImportedResumeLanguage(p);
    const previousDocumentLanguage = docLang;
    const next = migrateForm({
      name: p.name || "", title: p.title || "", email: p.email || "", phone: p.phone || "",
      location: p.location || "", linkedin: p.linkedin || "", website: p.website || "",
      summary: p.summary || "", sectionTitles: {}, addedSections: [],
      documentLanguage: detectedDocumentLanguage,
      translationMeta: null,
      experienceEntries: (p.experience || []).map((e) => entry({
        title: e.title || "", company: [e.company, e.location].filter(Boolean).join(" · "),
        startDate: e.startDate || "", endDate: e.endDate || "", isCurrent: Boolean(e.isCurrent),
        description: (e.bullets || []).map((b) => (/^[•\-*]/.test(b) ? b : `• ${b}`)).join("\n"),
      })),
      educationEntries: (p.education || []).map((e) => entry({
        title: e.degree || "", titleUrl: "", subtitle: e.school || "",
        startDate: e.startDate || "", endDate: e.endDate || "", location: e.location || "", description: e.description || "",
      })),
      skillsEntries: (p.skills || []).map((name) => entry({ name })),
      languagesEntries: (p.languages || []).map((name) => entry({ name })),
      certificationsEntries: (p.certifications || []).map((it) => entry(it)),
      projectsEntries: (p.projects || []).map((it) => entry(it)),
      awardsEntries: (p.awards || []).map((it) => entry(it)),
      volunteerEntries: (p.volunteer || []).map((it) => entry(it)),
      extracurricularEntries: (p.extracurricular || []).map((it) => entry(it)),
    });
    setForm(next);
    setDocumentLanguage(detectedDocumentLanguage);
    setImportLanguageNotice({
      open: Boolean(previousDocumentLanguage && previousDocumentLanguage !== detectedDocumentLanguage),
      detected: detectedDocumentLanguage,
      previous: previousDocumentLanguage,
    });
    if (/^\+\d/.test(p.phone || "")) setPhoneCode(LANG_CODE[interfaceLanguage] || "+1");
  }, [docLang, interfaceLanguage]);
  // Per-section entry handlers shared by every SectionCard.
  const addSectionEntry = useCallback((key) => {
    const e = blankEntry(key);
    setEntries(key, (list) => [...list, e]);
    return e.id;
  }, [setEntries]);
  const changeSectionEntry = useCallback((key, id, ch) => {
    setEntries(key, (list) => list.map((x) => (x.id === id ? { ...x, ...ch } : x)));
  }, [setEntries]);
  const deleteSectionEntry = useCallback((key, id) => {
    setEntries(key, (list) => list.filter((x) => x.id !== id));
  }, [setEntries]);
  const toggleSectionEntryVisible = useCallback((key, id) => {
    setEntries(key, (list) => list.map((x) => (x.id === id ? { ...x, visible: x.visible === false } : x)));
  }, [setEntries]);
  const reorderSectionEntry = useCallback((key, from, to) => {
    setEntries(key, (list) => { const a = [...list]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
  }, [setEntries]);
  // Every section card starts collapsed; the user expands what they need.
  const [collapsedSections, setCollapsedSections] = useState(() => {
    const init = { personal: true, summary: true };
    SECTION_KEYS.forEach((k) => { init[k] = true; });
    return init;
  });
  const toggleSectionCollapse = useCallback((key) => {
    setCollapsedSections((c) => ({ ...c, [key]: !c[key] }));
  }, []);
  // ── "Add content" section picker ──────────────────────────────────────────
  const [addContentOpen, setAddContentOpen] = useState(false);
  const sectionName = useCallback((key) => t[key] || key, [t]);
  // A section is "present" if it's core/summary or has been added by the user.
  const addedSet = new Set(["summary", ...CORE_SECTIONS, ...(form.addedSections || [])]);
  const addSection = useCallback((key) => {
    if (!OPTIONAL_SECTIONS.includes(key)) return; // core/summary always present
    setForm((f) => {
      const added = f.addedSections || [];
      if (added.includes(key)) return f;
      const next = { ...f, addedSections: [...added, key] };
      // Give it a blank entry so the card is immediately useful.
      if ((f[key + "Entries"] || []).length === 0) {
        const e = blankEntry(key);
        next[key + "Entries"] = [e];
        next[key] = entriesToText(key, [e]);
      }
      return next;
    });
    setCollapsedSections((c) => ({ ...c, [key]: false })); // open it
    setAddContentOpen(false);
  }, []);
  // Takes an optional section out of the editor. The entries stay on the form,
  // so re-adding it from the picker restores whatever was typed — buildLiveData
  // keeps it out of the preview and the export in the meantime.
  const removeSection = useCallback((key) => {
    if (!OPTIONAL_SECTIONS.includes(key)) return; // core sections cannot be removed
    setForm((f) => ({ ...f, addedSections: (f.addedSections || []).filter((k) => k !== key) }));
  }, []);
  const defaultPhoneCode = LANG_CODE[interfaceLanguage] || "+1";
  const rawPhone = form.phone.trim();
  const fullPhone = formatPhoneForResume(rawPhone, phoneCode, defaultPhoneCode);
  // Memoised so non-form state changes (modal open, ATS result, etc.) don't
  // trigger an expensive re-parse of the entire form on every render.
  const liveData = useMemo(
    () => buildLiveData({ ...form, phone: fullPhone, photo: photoUrl }, documentT, docLang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, fullPhone, photoUrl, docLang, lang]
  );
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const hasResumeContent = !isResumeDataEmpty(liveData);
    const hasCoverContent = hasMeaningfulCoverLetterContent(coverForm);
    if (!hasResumeContent && !hasCoverContent) return undefined;
    const handler = (event) => {
      track(EVENTS.BEFOREUNLOAD_WARNING_SHOWN, {
        documentType: hasResumeContent && hasCoverContent ? "multiple" : hasResumeContent ? "resume" : "coverLetter",
      });
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [liveData, coverForm]);
  const shouldReviewBeforeExport = useCallback((format, skipReview = false) => {
    if (skipReview) return false;
    const warnings = analyzeResumeQuality(result || liveData, { ...form, phone: fullPhone }, { lang: docLang });
    if (!warnings.length) return false;
    setReviewModal({ open: true, format, warnings });
    return true;
  }, [result, liveData, form, fullPhone, docLang]);
  const isMobile = useIsMobile();
  const rPage  = isMobile ? rPageMobile  : rPageDesktop;
  const rShell = isMobile ? rShellMobile : rShellDesktop;
  const recommendedTemplate = TEMPLATES.find((template) => template.id === RECOMMENDED_TEMPLATE_ID) || TEMPLATES.find((template) => !template.blank);

  const openPostImportTemplatePicker = useCallback(() => {
    if (!tpl && recommendedTemplate) setTpl(recommendedTemplate);
    setPostImportTemplatePickerOpen(true);
    setNavPage("resume");
    setStep("form");
    setAppView("app");
  }, [tpl, recommendedTemplate]);

  const startResume = useCallback((source = "primary") => {
    if (!tpl && recommendedTemplate) setTpl(recommendedTemplate);
    setStep("form");
    setNavPage("resume");
    setAppView("app");
    setMobileResumeMode("edit");
    trackUxEvent("resume_editor_started", { source });
    track(EVENTS.RESUME_STARTED, { source });
  }, [tpl, recommendedTemplate]);

  // Open the full template gallery (not the editor). Used by "Browse all templates".
  const browseTemplates = useCallback((source = "browse") => {
    setNavPage("resume");
    setStep("templates");
    setAppView("app");
    trackUxEvent("template_gallery_opened", { source });
  }, []);

  // ── Multiple resumes (save / open / new) with the free-tier limit ─────────
  const [savedResumes, setSavedResumes] = useState(() => resumes.listResumes());
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const refreshResumes = useCallback(() => setSavedResumes(resumes.listResumes()), []);

  const pendingSaveRef = useRef(false);
  // Keep a version available only while this page is open. Document content is
  // intentionally not persisted to browser storage.
  const doSaveResume = useCallback(() => {
    const title = form.name?.trim()
      ? `${form.name.trim()}${form.title?.trim() ? ` — ${form.title.trim()}` : ""}`
      : "Untitled resume";
    const id = resumes.upsertResume({ id: currentResumeId, title, data: form });
    setCurrentResumeId(id);
    refreshResumes();
    setStatusMsg(st.sessionVersionSaved);
    setTimeout(() => setStatusMsg(""), 3000);
  }, [form, currentResumeId, refreshResumes, st.sessionVersionSaved]);

  const saveCurrentResume = useCallback(() => {
    doSaveResume();
  }, [doSaveResume]);

  const newResume = useCallback(() => {
    setForm(emptyResumeForm);
    setCurrentResumeId(null);
    setTpl(null);
    setPostImportTemplatePickerOpen(false);
    setNavPage("resume");
    setStep("templates");
    setStatusMsg(st.newStarted);
    setTimeout(() => setStatusMsg(""), 2000);
  }, [emptyResumeForm]);

  const openResume = useCallback((id) => {
    const r = resumes.getResume(id);
    if (!r) return;
    setForm(migrateForm({ ...emptyResumeForm, ...r.data }));
    setCurrentResumeId(id);
    setPostImportTemplatePickerOpen(false);
    setNavPage("resume");
    setStep(tpl ? "form" : "templates");
  }, [emptyResumeForm, tpl]);

  const removeResume = useCallback((id) => {
    resumes.deleteResume(id);
    refreshResumes();
    setCurrentResumeId((cur) => (cur === id ? null : cur));
  }, [refreshResumes]);

  const toggleToolbarPanel = useCallback((panelName) => {
    setActiveToolbarPanel((current) => (current === panelName ? null : panelName));
    setShareUrl("");
  }, []);

  useEffect(() => {
    if (!activeToolbarPanel) return undefined;
    const refs = [resumeToolbarRef, coverToolbarRef, mobileResumeToolbarRef, mobileCoverToolbarRef];
    const handlePointerDown = (event) => {
      if (refs.some((ref) => ref.current?.contains(event.target))) return;
      setActiveToolbarPanel(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveToolbarPanel(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeToolbarPanel]);

  // ── Share / email document (⋮ menu on the resume + cover editors) ─────────
  const [shareUrl, setShareUrl] = useState("");
  const shareCopy = useMemo(() => ({
    create: statusText("shareCreate"),
    email: statusText("shareEmail"),
    copyShort: statusText("shareCopyPrivate"),
    open: statusText("shareOpen"),
    ready: statusText("shareReady"),
    canView: statusText("shareCanView"),
    stored: statusText("shareStored"),
    failed: statusText("shareFailed"),
    empty: statusText("shareEmptyResume"),
    privateReady: statusText("shareReady"),
    emailBody: (url) => statusText("shareEmailBody", { url }),
  }), [statusText]);
  const shareLink = useCallback(async (getPayload) => {
    try {
      const payload = getPayload();
      if (payload?.k === "resume" && isResumeDataEmpty(payload.d)) {
        setShareUrl("");
        setStatusMsg(shareCopy.empty);
        setTimeout(() => setStatusMsg(""), 3000);
        return "";
      }
      const { buildPrivateShareUrl } = await import("./share.js");
      const url = buildPrivateShareUrl(payload);
      setShareUrl(url);
      try { navigator.clipboard && navigator.clipboard.writeText(url); } catch { /* noop */ }
      setStatusMsg(shareCopy.privateReady);
      setTimeout(() => setStatusMsg(""), 2500);
      return url;
    } catch {
      setStatusMsg(shareCopy.failed);
      setTimeout(() => setStatusMsg(""), 2500);
      return "";
    }
  }, [shareCopy.empty, shareCopy.failed, shareCopy.privateReady]);
  const emailLink = useCallback(async (getPayload, subject) => {
    const url = await shareLink(getPayload);
    if (!url) return;
    const body = encodeURIComponent(shareCopy.emailBody(url));
    if (typeof window !== "undefined") window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  }, [shareCopy, shareLink]);
  const resumeSharePayload = useCallback(() => {
    const d = normalizeResumeData(liveData);
    return { v: 2, k: "resume", t: tpl?.id || "modern", l: docLang || "en", p: "a4", c: {}, d };
  }, [tpl, liveData, docLang]);
  const coverSharePayload = useCallback(() => {
    const f = coverForm, d = {};
    ["name", "jobTitle", "email", "phone", "location", "date", "recipientName", "recipientTitle",
      "company", "companyAddress", "subject", "opening", "body", "closing", "signoff"]
      .forEach((k) => { if (f[k] && String(f[k]).trim()) d[k] = f[k]; });
    return { v: 2, k: "cover", t: coverTpl?.id || "modern", l: docLang || "en", p: "a4", c: {}, d };
  }, [coverForm, coverTpl, docLang]);
  // Reusable ⋮ menu for secondary editor actions.
  const renderMoreMenu = (panelName, getPayload, subject, options = {}) => {
    const open = activeToolbarPanel === panelName;
    return (
    <div style={{ position: "relative" }}>
      <button type="button" aria-label={builderText("moreOptions")} aria-haspopup="menu" aria-expanded={open}
        aria-controls={`p-${panelName}`}
        onClick={() => toggleToolbarPanel(panelName)}
        style={{ ...softBtn, padding: "7px 11px", fontWeight: 800 }}>⋮</button>
      {open && (
        <div id={`p-${panelName}`} role="menu" style={{ position: "absolute", top: "calc(100% + 8px)", insetInlineEnd: 0, zIndex: 120, width: 290,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 18px 54px rgba(0,0,0,0.5)", padding: 10 }}>
          {options.content}
          {(options.items || []).map((item, index) => (
            <button key={`${item.label}-${index}`} type="button" role="menuitem" onClick={() => { setActiveToolbarPanel(null); item.onClick?.(); }}
              disabled={item.disabled}
              style={{ display: "block", width: "100%", textAlign: "left", background: item.primary ? `${C.accent}18` : "none",
                border: "none", color: item.disabled ? C.text3 : item.color || C.text1,
                padding: "10px 10px", fontSize: 13.5, fontWeight: 750, cursor: item.disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit", borderRadius: 8 }}>
              {item.label}
              {item.hint && <span style={{ display: "block", color: C.text3, fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{item.hint}</span>}
            </button>
          ))}
          {((options.items || []).length > 0 || options.content) && (
            <div aria-hidden style={{ height: 1, background: C.border, opacity: 0.65, margin: "6px 0" }} />
          )}
          <button type="button" role="menuitem" onClick={() => { emailLink(getPayload, subject); }}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
              color: C.text1, padding: "10px 10px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", borderRadius: 8 }}>
            📧 {shareCopy.email}
          </button>
          <button type="button" role="menuitem" onClick={() => shareLink(getPayload)}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
              color: C.text1, padding: "10px 10px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", borderRadius: 8 }}>
            🔗 {shareCopy.create}
          </button>
          {shareUrl && (
            <div style={{ marginTop: 8, padding: "9px 10px", background: C.elevated, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>
                {shareCopy.ready}
              </div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 6, lineHeight: 1.5 }}>
                {shareCopy.stored}<br />{shareCopy.canView}
              </div>
              <input readOnly value={shareUrl} onFocus={(e) => e.target.select()}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 11.5, padding: "6px 8px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text2, fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button type="button" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(shareUrl); } catch { /* noop */ } setStatusMsg(st.copied); setTimeout(() => setStatusMsg(""), 1500); }}
                  style={{ flex: 1, background: `${C.accent}18`, border: `1px solid ${C.accent}40`, borderRadius: 7, padding: "6px", fontSize: 12, fontWeight: 700, color: C.accent2, cursor: "pointer", fontFamily: "inherit" }}>{shareCopy.copyShort}</button>
                <a href={shareUrl} target="_blank" rel="noreferrer"
                  style={{ flex: 1, textAlign: "center", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px", fontSize: 12, fontWeight: 700, color: C.text2, textDecoration: "none", fontFamily: "inherit" }}>{shareCopy.open} ↗</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    );
  };

  const handleSubscribe = useCallback(async () => {
    track(EVENTS.CHECKOUT_STARTED, { plan: "monthly" });
    try {
      const { url, configured } = await (await import("./account.js")).startCheckout({ lang, plan: "monthly" });
      if (configured && url) { window.location.href = url; return; }
    } catch { /* fall through to coming-soon */ }
    setSubModalOpen(false);
    setStatusMsg(`Subscriptions launch soon — email ${AUTHOR.email} for early access.`);
    setTimeout(() => setStatusMsg(""), 4500);
  }, [lang]);

  const startWithTemplate = useCallback((template, source = "template") => {
    setTpl(template);
    setForm(emptyResumeForm);
    setCurrentResumeId(null);
    setStep("form");
    setNavPage("resume");
    setAppView("app");
    setMobileResumeMode("edit");
    trackUxEvent("resume_editor_started", { source, template: template.id });
    track(EVENTS.TEMPLATE_SELECTED, { template: template.id });
  }, [emptyResumeForm]);

  const applyTemplateOnly = useCallback((template, source = "template_switch") => {
    if (!template) return;
    setTpl(template);
    track(EVENTS.TEMPLATE_SELECTED, { template: template.id, source });
  }, []);

  const starterQueryAppliedRef = useRef("");
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(location.search || window.location.search || "");
    const starterId = params.get("starter") || "";
    const templateId = params.get("template") || "";
    const queryUi = params.get("ui") || "";
    const queryDocLang = params.get("docLang") || "";
    const importRequested = params.get("importResume") === "1";
    const key = `${location.pathname}?${params.toString()}`;
    if (starterQueryAppliedRef.current === key) return undefined;
    starterQueryAppliedRef.current = key;

    if (isInterfaceLang(queryUi) && queryUi !== interfaceLanguage) {
      setSiteLanguage(languageByCode(queryUi));
    }
    if (isDocumentLang(queryDocLang) && queryDocLang !== documentLanguage) {
      setDocumentLanguagePreference(languageByCode(queryDocLang));
    }
    if (importRequested) setUploadModalOpen(true);

    if (!starterId && templateId) {
      const template = TEMPLATES.find((item) => item.id === templateId) || recommendedTemplate;
      setForm(emptyResumeForm);
      setCurrentResumeId(null);
      setTpl(template || null);
      setNavPage("resume");
      setStep("form");
      setAppView("app");
      setMobileResumeMode("edit");
      return undefined;
    }
    if (!starterId) return undefined;

    let cancelled = false;
    (async () => {
      const copy = STARTER_STATUS_COPY[lang] || STARTER_STATUS_COPY.en;
      try {
        const { loadResumeStarter } = await import("./data/resumeStarters/index.js");
        const starter = await loadResumeStarter(starterId);
        if (cancelled) return;
        if (!starter) {
          setForm(emptyResumeForm);
          setCurrentResumeId(null);
          setTpl(recommendedTemplate || null);
          setNavPage("resume");
          setStep("form");
          setAppView("app");
          setMobileResumeMode("edit");
          setStatusMsg(copy.invalid);
          setTimeout(() => setStatusMsg(""), 3500);
          return;
        }
        const nextDocLang = isDocumentLang(queryDocLang) ? queryDocLang : starter.documentLanguage;
        if (isDocumentLang(nextDocLang) && nextDocLang !== documentLanguage) {
          setDocumentLanguagePreference(languageByCode(nextDocLang));
        }
        const template = TEMPLATES.find((item) => item.id === starter.templateId) || recommendedTemplate;
        setForm(migrateForm({ ...emptyResumeForm, ...starter.data }));
        setCurrentResumeId(null);
        setTpl(template || null);
        setNavPage("resume");
        setStep("form");
        setAppView("app");
        setMobileResumeMode("edit");
        const role = starter.labels?.[lang] || starter.labels?.en || starter.id;
        setStatusMsg(translateLabel(copy.loaded, { role }));
        setTimeout(() => setStatusMsg(""), 4500);
        track(EVENTS.TEMPLATE_SELECTED, { template: template?.id || "", starter: starter.id });
      } catch {
        if (cancelled) return;
        setForm(emptyResumeForm);
        setCurrentResumeId(null);
        setTpl(recommendedTemplate || null);
        setNavPage("resume");
        setStep("form");
        setAppView("app");
        setMobileResumeMode("edit");
        setStatusMsg(copy.invalid);
        setTimeout(() => setStatusMsg(""), 3500);
      }
    })();
    return () => { cancelled = true; };
  }, [location.pathname, location.search, interfaceLanguage, documentLanguage, emptyResumeForm, lang, recommendedTemplate, setDocumentLanguagePreference, setSiteLanguage, translateLabel]);

  // ── Optional account / sync / paid-pass handlers ──────────────────────────
  const handleSyncNow = useCallback(async () => {
    try {
      setSyncStatus(at.syncing);
      await (await import("./account.js")).pushMasterProfile(master);
      setSyncStatus(at.synced);
      setTimeout(() => setSyncStatus(""), 3000);
    } catch (e) {
      setSyncStatus("");
      if (e?.status === 402) setUpsell("sync");        // signed in, no pass → upsell
      else if (e?.status === 401) setSaveProfileOpen(true); // not signed in → capture
      else { setSyncStatus(at.notConfigured); setTimeout(() => setSyncStatus(""), 3000); }
    }
  }, [master, at]);

  const handleStartCheckout = useCallback(async () => {
    track(EVENTS.CHECKOUT_STARTED);
    try {
      const { url, configured } = await (await import("./account.js")).startCheckout({ lang });
      if (configured && url) { window.location.href = url; return; }
    } catch { /* fall through to the "coming soon" message */ }
    setUpsell(null);
    setStatusMsg(at.paymentsSoon);
    setTimeout(() => setStatusMsg(""), 3000);
  }, [lang, at]);

  const handleAiTailor = useCallback(async () => {
    if (!hasPass) { setUpsell("tailor"); return; }   // gate: AI tailoring is paid
    try {
      setAiTailoring(true);
      track(EVENTS.AI_TAILORING_USED);
      // NEW paid capability — AI rewrites the profile to match the JD.
      // TODO(server): add a "tailor-resume" action to /api/ai that ALSO verifies
      // the active pass server-side (mirror the gating in functions/api/sync.js).
      const text = await callAi("tailor-resume", JSON.stringify({ master, jd: jdText }), docLang || "en");
      if (text) { setResult(prev => ({ ...(prev || {}), tailored: text })); setStatusMsg(at.synced); setTimeout(() => setStatusMsg(""), 3000); }
    } catch {
      setStatusMsg(at.notConfigured); setTimeout(() => setStatusMsg(""), 3000);
    } finally {
      setAiTailoring(false);
    }
  }, [hasPass, master, jdText, docLang, at]);

  const handleDeleteSavedData = useCallback(async () => {
    try { await (await import("./account.js")).deleteSavedData(); } catch { /* ignore */ }
    setCurrentUser(null);
    setStatusMsg(at.deletedSaved);
    setTimeout(() => setStatusMsg(""), 3000);
  }, [at]);

  const handleSignOut = useCallback(() => { accountSession.logout(); setCurrentUser(null); }, []);

  function validateEmail(val) {
    if (!val.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? "" : t.emailError;
  }
  function validatePhone(val, code = phoneCode) {
    if (!val.trim()) return "";
    const country = COUNTRIES.find(c => c.code === code);
    const [min, max] = country ? country.digits : [4, 15];
    const n = val.replace(/\D/g, "").length;
    if (n < min || n > max) {
      const range = min === max ? `${min}` : `${min}–${max}`;
      return `${t.phoneError} — ${range} ${t.phoneDigits}`;
    }
    return "";
  }
  function onNameChange(e) {
    setForm({ ...form, name: e.target.value });
    if (nameError && e.target.value.trim()) setNameError("");
  }
  function onEmailChange(e) {
    setForm({ ...form, email: e.target.value });
    if (emailError) setEmailError(validateEmail(e.target.value));
  }
  function onPhoneChange(e) {
    setForm({ ...form, phone: e.target.value });
    if (phoneError) setPhoneError(validatePhone(e.target.value));
  }

  const selectedDocumentLanguageLabel = translationLanguageName(docLang);
  const resumeTranslationContent = serializeResumeTranslationContent(form);
  const hasResumeTranslatableContent = Object.keys(resumeTranslationContent).length > 0;
  const detectedResumeContentLanguage = hasResumeTranslatableContent
    ? (form.translationMeta?.targetLanguage || form.documentLanguage || detectImportedResumeLanguage(resumeTranslationLanguageSample(form)))
    : "";
  const activeTranslationMeta = form.translationMeta || {};
  const activeTranslatedToSelected = Boolean(
    activeTranslationMeta.targetLanguage
    && activeTranslationMeta.targetLanguage === docLang
    && activeTranslationMeta.translationStatus
    && activeTranslationMeta.translationStatus !== TRANSLATION_STATUSES.original
  );
  const findExistingTranslatedVersion = useCallback((targetLanguage = docLang, sourceVersionId = currentResumeId) => (
    savedResumes.find((resume) => {
      if (!resume || resume.id === currentResumeId) return false;
      const meta = resume.data?.translationMeta || {};
      if (meta.targetLanguage !== targetLanguage) return false;
      return sourceVersionId ? meta.sourceVersionId === sourceVersionId : true;
    }) || null
  ), [currentResumeId, docLang, savedResumes]);
  const showDocumentLanguageTranslationPrompt = Boolean(
    hasResumeTranslatableContent
    && detectedResumeContentLanguage
    && detectedResumeContentLanguage !== docLang
    && !activeTranslatedToSelected
    && !translationConfirm.open
    && !translationReview.open
  );

  function requestResumeTranslation({ allowDuplicate = false } = {}) {
    if (translating) return;
    const langCode = docLang || "en";
    if (activeTranslatedToSelected) return;
    const existing = !allowDuplicate ? findExistingTranslatedVersion(langCode, currentResumeId) : null;
    if (existing) {
      setTranslationDuplicate({ open: true, existingId: existing.id, target: selectedDocumentLang || languageByCode(langCode) });
      return;
    }
    if (translationLimitReached) {
      setStatusMsg(statusText("translateLimitReached"));
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    setTranslationConfirm({ open: true, target: selectedDocumentLang || languageByCode(langCode), kind: "resume", error: "" });
  }

  function requestResumeRetranslation() {
    if (translating) return;
    const langCode = docLang || "en";
    if (translationLimitReached) {
      setStatusMsg(statusText("translateLimitReached"));
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    const sourceId = form.translationMeta?.sourceVersionId;
    const source = sourceId ? resumes.getResume(sourceId) : null;
    if (!source?.data) {
      setStatusMsg(statusText("translateFail"));
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    setTranslationConfirm({
      open: true,
      target: selectedDocumentLang || languageByCode(langCode),
      kind: "resume",
      retranslate: true,
      sourceResumeId: sourceId,
      error: "",
    });
  }

  function markTranslatedFields(status) {
    setForm((f) => ({
      ...f,
      translationMeta: {
        ...(f.translationMeta || {}),
        translationStatus: status,
        reviewed: status === TRANSLATION_STATUSES.humanReviewed,
        fields: Object.fromEntries(Object.entries(f.translationMeta?.fields || {}).map(([key, meta]) => [
          key,
          { ...meta, translationStatus: status },
        ])),
      },
    }));
  }

  const clearTranslationReview = () => setTranslationReview({ open: false, original: null, translated: null, fields: [], meta: null, warning: "" });

  const resumeVersionTitle = (data, langCode, source = "translated") => {
    const langName = languageByCode(langCode || "en")?.name || langCode || "English";
    const rawName = String(data?.name || "").trim();
    const base = rawName ? `${rawName.split(/\s+/)[0]}'s résumé` : "Résumé";
    return `${source === "original" ? "Original " : ""}${base} — ${langName}`;
  };

  const useTranslatedResumeCopy = () => {
    if (!translationReview.translated || !translationReview.original || !translationReview.meta) return;
    const { targetLanguage, sourceLanguage, targetLanguageName, translatedAt, sourceVersionId } = translationReview.meta;
    const existingSource = sourceVersionId ? resumes.getResume(sourceVersionId) : currentResumeId ? resumes.getResume(currentResumeId) : null;
    const sourceTitle = existingSource?.title || resumeVersionTitle(translationReview.original, sourceLanguage === "auto" ? "en" : sourceLanguage, "original");
    const sourceId = sourceVersionId || currentResumeId || resumes.upsertResume({
      title: sourceTitle,
      data: translationReview.original,
    });
    if (!sourceVersionId && currentResumeId) {
      resumes.upsertResume({
        id: currentResumeId,
        title: sourceTitle,
        data: translationReview.original,
      });
    }
    const copyTitle = resumeVersionTitle(translationReview.translated, targetLanguage, "translated");
    const nextForm = migrateForm({
      ...emptyResumeForm,
      ...translationReview.translated,
      documentLanguage: targetLanguage,
      translationMeta: {
        ...(translationReview.translated.translationMeta || {}),
        sourceVersionId: sourceId,
        sourceLanguage,
        targetLanguage,
        targetLanguageName,
        translatedAt,
        translationStatus: translationReview.warning ? TRANSLATION_STATUSES.needsReview : TRANSLATION_STATUSES.aiTranslated,
        reviewed: false,
      },
    });
    const newId = resumes.upsertResume({ title: copyTitle, data: nextForm });
    setForm(nextForm);
    setCurrentResumeId(newId);
    setDocumentLanguage(targetLanguage);
    persistDocumentLanguage(targetLanguage);
    refreshResumes();
    setResult(null);
    setAiPolished(false);
    clearTranslationReview();
    setImportLanguageNotice({ open: false, detected: "", previous: "" });
    setMobileResumeMode("edit");
    track(EVENTS.TRANSLATION_COPY_CREATED, {
      documentType: "resume",
      sourceLanguage,
      targetLanguage,
      translationStatus: translationReview.warning ? TRANSLATION_STATUSES.needsReview : TRANSLATION_STATUSES.aiTranslated,
    });
    setStatusMsg(translationReview.warning
      ? statusText("translatePartial")
      : statusText("translateSuccessLanguage", { language: translationLanguageName(targetLanguage) || targetLanguageName || targetLanguage }));
    setTimeout(() => setStatusMsg(""), 4500);
  };

  async function translateCV() {
    if (translating) return;
    const confirm = translationConfirm;
    const langCode = confirm.target?.code || docLang || "en";
    const targetName = translationLanguageName(langCode);
    const sourceResume = confirm.retranslate && confirm.sourceResumeId ? resumes.getResume(confirm.sourceResumeId) : null;
    const sourceForm = sourceResume?.data ? migrateForm({ ...emptyResumeForm, ...sourceResume.data }) : form;
    const sourceVersionId = confirm.retranslate ? confirm.sourceResumeId : currentResumeId;
    setTranslationConfirm((current) => ({ ...current, error: "" }));
    setTranslating(true);
    setStatusMsg(statusText("translateStarted"));
    try {
      const {
        assertProtectedTermsPreserved,
        buildResumeTranslationRequest,
        createTranslatedResumeCopy,
        parseTranslationJson,
        postProcessTranslatedResume,
        translateDocumentContent,
      } = await import("./translation.js");
      const request = buildResumeTranslationRequest(sourceForm, {
        sourceLanguage: detectImportedResumeLanguage(resumeTranslationLanguageSample(sourceForm)) || sourceForm.translationMeta?.targetLanguage || sourceForm.documentLanguage || "auto",
        targetLanguage: langCode,
        targetLanguageName: targetName,
      });
      if (Object.keys(request.content).length === 0) {
        const message = statusText("translateNoContent");
        setTranslationConfirm((current) => ({ ...current, error: message }));
        setStatusMsg(message);
        setTimeout(() => setStatusMsg(""), 3000);
        return;
      }
      if (translationLimitReached) {
        const message = statusText("translateLimitReached");
        setTranslationConfirm((current) => ({ ...current, error: message }));
        setStatusMsg(message);
        setTimeout(() => setStatusMsg(""), 3500);
        return;
      }
      track(EVENTS.TRANSLATION_STARTED, {
        documentType: "resume",
        sourceLanguage: request.sourceLanguage,
        targetLanguage: langCode,
        translationStatus: "started",
      });
      const response = await translateDocumentContent({
        documentType: "resume",
        sourceLanguage: request.sourceLanguage,
        targetLanguage: langCode,
        protectedTerms: request.preserveTerms,
        payload: request.content,
        devBypassToken: translationDevBypass.token,
        devBypassHeader: translationDevBypass.header,
      });
      incrementTranslationUsage();
      const translated = postProcessTranslatedResume(parseTranslationJson(JSON.stringify(response.document)), langCode);
      const missingProtected = assertProtectedTermsPreserved(request.content, translated);
      const untranslatedFields = Object.keys(request.content).filter((key) => typeof translated[key] !== "string" || !translated[key].trim());
      const translatedAt = new Date().toISOString();
      const originalSnapshot = { ...sourceForm };
      const translatedCopy = createTranslatedResumeCopy(sourceForm, translated, {
        sourceLanguage: request.sourceLanguage,
        targetLanguage: langCode,
        targetLanguageName: targetName,
        sourceVersionId: sourceVersionId || "",
        translatedAt,
      });
      const nextForm = (() => {
        const next = { ...translatedCopy };
        next.documentLanguage = langCode;
        const preservedSections = [];
        SECTION_KEYS.forEach((key) => {
          const old = sourceForm[key + "Entries"] || [];
          if (!old.length && typeof translated[key] !== "string") return;
          const merged = mergeTranslatedEntries(key, old, translated[key]);
          if (merged.preservedOriginal) preservedSections.push(key);
          next[key + "Entries"] = merged.entries;
          next[key] = entriesToText(key, merged.entries);
          if (merged.preservedOriginal) {
            next.translationMeta = {
              ...(next.translationMeta || {}),
              fields: {
                ...(next.translationMeta?.fields || {}),
                [key]: {
                  translationStatus: TRANSLATION_STATUSES.needsReview,
                  sourceLanguage: request.sourceLanguage,
                  targetLanguage: langCode,
                  translatedAt,
                },
              },
            };
          }
        });
        next.translationMeta = {
          ...(next.translationMeta || {}),
          translationStatus: preservedSections.length ? TRANSLATION_STATUSES.needsReview : next.translationMeta?.translationStatus,
          reviewed: false,
          preservedSections,
        };
        return postProcessTranslatedResume(next, langCode);
      })();
      const preservedSections = nextForm.translationMeta?.preservedSections || [];
      setTranslationConfirm({ open: false, target: null, error: "" });
      setTranslationReview({
        open: true,
        original: originalSnapshot,
        translated: nextForm,
        fields: TRANSLATABLE_RESUME_FIELDS.filter((key) => typeof translated[key] === "string" || preservedSections.includes(key)),
        meta: {
          sourceLanguage: request.sourceLanguage,
          targetLanguage: langCode,
          targetLanguageName: targetName,
          sourceVersionId: sourceVersionId || "",
          translatedAt,
        },
        warning: missingProtected.length || untranslatedFields.length || preservedSections.length
          ? statusText(preservedSections.length ? "translateSectionsPartial" : "translatePartial")
          : "",
      });
      if (missingProtected.length || untranslatedFields.length || preservedSections.length) {
        setStatusMsg(statusText(preservedSections.length ? "translateSectionsPartial" : "translatePartial"));
        setTimeout(() => setStatusMsg(""), 4500);
      }
    } catch (error) {
      const message = translationErrorMessage(error);
      setTranslationConfirm((current) => ({ ...current, error: message }));
      setStatusMsg(message);
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setTranslating(false);
    }
  }

  function scrollToError(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus();
      // apply shake to the nearest wrapper (the input itself or its parent)
      const target = el.closest("[data-field-wrap]") || el;
      target.classList.remove("ac-shake");
      // Restart on the next frame instead of forcing layout via offsetWidth.
      requestAnimationFrame(() => target.classList.add("ac-shake"));
      setTimeout(() => target.classList.remove("ac-shake"), 450);
    }, 280);
  }

  const clearFieldError = (key) => {
    ({ title: setTitleError, location: setLocationError, summary: setSummaryError,
       experience: setExperienceError, education: setEducationError, skills: setSkillsError }[key] || (() => {}))("");
  };

  async function generate() {
    const nErr  = !form.name.trim()       ? commonText("nameRequired")       : "";
    const eErr  = validateEmail(form.email);
    const pErr  = validatePhone(form.phone);
    const tErr  = !form.title.trim()      ? commonText("titleRequired")      : "";
    const lErr  = !form.location.trim()   ? commonText("locationRequired")   : "";
    const sErr  = !form.summary.trim()    ? commonText("summaryRequired")    : "";
    const xErr  = !form.experience.trim() ? commonText("experienceRequired") : "";
    const edErr = !form.education.trim()  ? commonText("educationRequired")  : "";
    const skErr = !form.skills.trim()     ? commonText("skillsRequired")     : "";
    setNameError(nErr); setEmailError(eErr); setPhoneError(pErr);
    setTitleError(tErr); setLocationError(lErr); setSummaryError(sErr);
    setExperienceError(xErr); setEducationError(edErr); setSkillsError(skErr);
    const firstErr = [
      [nErr, "field-name"], [tErr, "field-title"], [eErr, "field-email"],
      [pErr, "field-phone"], [lErr, "field-location"], [sErr, "field-summary"],
      [xErr, "field-experience"], [edErr, "field-education"], [skErr, "field-skills"],
    ].find(([e]) => e);
    if (firstErr) { scrollToError(firstErr[1]); return; }
    setLoading(true); setResult(null); setAiPolished(false);
    const resumeText = `Candidate details:
Name: ${form.name}
Title: ${form.title}
Email: ${form.email}
Phone: ${fullPhone}
Location: ${form.location}
LinkedIn: ${form.linkedin}
Website: ${form.website}
About: ${form.summary}
Experience: ${form.experience}
Education: ${form.education}
Skills: ${form.skills}
Certifications: ${form.certifications}
Projects: ${form.projects}
Languages: ${form.languages}
Volunteer: ${form.volunteer}
Awards: ${form.awards}`;

    try {
      const text = await callAi("generate-resume", resumeText, docLang || "en");
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setAiPolished(true);
    } catch {
      setResult(buildLiveData({ ...form, phone: fullPhone, photo: photoUrl }, documentT));
    } finally {
      setLoading(false);
    }
  }

  function copyOut() {
    const src = normalizeResumeData(result || liveData);
    if (!src) return;
    const flat = [src.name, src.title, asArray(src.contact).join("  •  "), "",
      src.summary, "",
      ...asArray(src.sections).flatMap((s) => [s.heading, ...asArray(s.items), ""])].join("\n");
    navigator.clipboard.writeText(flat);
    setCopied(true);
    setStatusMsg(st.resumeTextCopied);
    setTimeout(() => { setCopied(false); setStatusMsg(""); }, 1500);
  }

  async function downloadPDF() {
    const options = arguments[0] || {};
    if (exporting) return;
    const src = normalizeResumeData(result || liveData);
    if (!src) return;
    if (isResumeDataEmpty(src)) {
      setStatusMsg(statusText("downloadEmptyResume"));
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    if (shouldReviewBeforeExport("pdf", options.skipReview)) return;
    if (!form.name.trim() || !form.experience.trim() || !form.skills.trim()) {
      setStatusMsg(st.incompleteDownload);
      setTimeout(() => setStatusMsg(""), 3500);
    }
    if (documentRtl) {
      setExporting("pdf");
      track(EVENTS.PDF_EXPORT_STARTED, { document_type: "resume", language: docLang, template: tpl?.id || "", document_direction: "rtl" });
      try {
        await exportVisualPdf(resumePrintRef, src.name || "resume", "resume");
        setExportSuccess(st.pdfSuccess);
        setStatusMsg(st.pdfDownloaded);
        trackUxEvent("pdf_export_completed");
        track(EVENTS.PDF_EXPORT_COMPLETED, { document_type: "resume", language: docLang, template: tpl?.id || "", export_type: "visual_pdf" });
        if (docLang !== lang) track(EVENTS.MULTILINGUAL_RESUME_EXPORTED, { language: docLang, interface_language: lang, export_type: "pdf", template: tpl?.id || "" });
        track(EVENTS.RESUME_EXPORTED, { format: "pdf", template: tpl?.id || "" });
        setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
      } catch {
        setStatusMsg(st.pdfFail);
        track(EVENTS.PDF_EXPORT_FAILED, { document_type: "resume", language: docLang, template: tpl?.id || "", export_type: "visual_pdf" });
        setTimeout(() => setStatusMsg(""), 3500);
      } finally {
        setExporting("");
      }
      return;
    }
    setExporting("pdf");
    setExportSuccess("");
    try {
    track(EVENTS.PDF_EXPORT_STARTED, { document_type: "resume", language: docLang, template: tpl?.id || "", document_direction: "ltr" });
    const { jsPDF } = await import("jspdf");
    // jsPDF built-in fonts render WinAnsi/Latin-1 (accents kept, non-Latin dropped).
    const safe = pdfSafe;
    // Honest heads-up: PDF uses Latin-script fonts; warn for Arabic/other scripts.
    if (containsNonLatin1([src.name, src.title, src.summary, asArray(src.sections).map(s => asArray(s.items).join(" ")).join(" ")].join(" "))) {
      setStatusMsg(st.pdfNonLatin);
      setTimeout(() => setStatusMsg(""), 6000);
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 18;
    const colW = pageW - margin * 2;
    let y = margin;

    const hex2rgb = (h) => [
      parseInt(h.slice(1,3),16),
      parseInt(h.slice(3,5),16),
      parseInt(h.slice(5,7),16),
    ];
    // Same WCAG-AA accent as the on-screen paper (DocumentPapers.withAccessibleAccent):
    // the exported PDF gets the darker, more readable/ATS-friendly heading colour too.
    const [ar, ag, ab] = hex2rgb(accentOnPaper(tpl.accent));

    const addPage = () => { doc.addPage(); y = margin; };
    const checkY = (need = 10) => { if (y + need > 280) addPage(); };

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.text(safe(src.name) || "Resume", margin, y);
    y += 9;

    // Title
    if (src.title) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(ar, ag, ab);
      doc.text(safe(src.title), margin, y);
      y += 7;
    }

    const pdfEmail = safe(form.email || "");
    if (asArray(src.contact).filter(Boolean).length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      y += drawPdfContactItems(doc, src.contact, {
        x: pageW / 2,
        y,
        maxWidth: colW,
        separator: "  |  ",
        lineHeight: 4.5,
        color: [90, 90, 90],
        safe,
      }) + 2;
    }

    // Accent rule
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Summary
    if (src.summary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(55, 55, 55);
      const lines = doc.splitTextToSize(safe(src.summary), colW);
      checkY(lines.length * 5 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    }

    // School/website links to make clickable in the PDF (from Education entries).
    const eduLinks = (form.educationEntries || [])
      .filter((e) => e.visible !== false && (e.titleUrl || "").trim() && (e.title || "").trim())
      .map((e) => ({ title: e.title.trim(), url: e.titleUrl.trim() }));

    // Sections
    for (const section of asArray(src.sections)) {
      checkY(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(ar, ag, ab);
      doc.text(safe(section.heading).toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(ar, ag, ab);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 55, 55);
      const tagSection = /skill|compét|habilidad|مهارات|fähig|^language|^langue|^idioma|^sprach/i.test(`${section.key || ""} ${section.heading || ""}`);
      if (tagSection) {
        const lines = doc.splitTextToSize(asArray(section.items).map((item) => safe(normalizeDateRange(item, docLang))).filter(Boolean).join("  •  "), colW);
        checkY(lines.length * 5 + 2);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      } else {
        for (const entry of structureSectionItems(section, docLang)) {
          if (entry.title) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(30, 30, 30);
            const lines = doc.splitTextToSize(safe(entry.title), colW);
            checkY(lines.length * 5 + 2);
            const link = eduLinks.find((l) => entry.title.startsWith(l.title) || l.title.startsWith(entry.title));
            if (link) doc.textWithLink(lines[0], margin, y, { url: link.url });
            else doc.text(lines, margin, y);
            y += lines.length * 5 + 1;
          }
          if (entry.meta?.length) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.2);
            doc.setTextColor(95, 95, 95);
            const meta = entry.meta.map((item) => safe(normalizeDateRange(item, docLang))).filter(Boolean).join("  ·  ");
            const lines = doc.splitTextToSize(meta, colW);
            checkY(lines.length * 4.5 + 2);
            doc.text(lines, margin, y);
            y += lines.length * 4.5 + 1.5;
          }
          for (const bullet of entry.bullets || []) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(55, 55, 55);
            const lines = doc.splitTextToSize(safe(normalizeDateRange(bullet, docLang)), colW - 7);
            checkY(lines.length * 5 + 2);
            doc.text("•", margin, y);
            const itemHref = normalizeLinkHref(String(bullet).split(/\s+/).find((token) => normalizeLinkHref(token)) || "");
            if (itemHref) {
              doc.setTextColor(ar, ag, ab);
              doc.textWithLink(lines[0], margin + 5, y, { url: itemHref });
              if (lines.length > 1) { doc.setTextColor(55, 55, 55); doc.text(lines.slice(1), margin + 5, y + 5); }
              doc.setTextColor(55, 55, 55);
            } else {
              doc.text(lines, margin + 5, y);
            }
            y += lines.length * 5 + 2;
          }
          y += 1;
        }
      }
      y += 4;
    }

    // Footer on every page: name (left) | page X / Y (right)
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(margin, 286, pageW - margin, 286);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128); // paperMuted, AA on white
      doc.text(safe(src.name || ""), margin, 291);
      if (pdfEmail) doc.text(pdfEmail, pageW / 2, 291, { align: "center" });
      doc.text(`${i} / ${totalPages}`, pageW - margin, 291, { align: "right" });
    }

    const fname = sanitizeFilename(safe(src.name || "resume"), "resume");
    doc.save(`${fname}.pdf`);
    setExportSuccess(st.pdfSuccess);
    setStatusMsg(st.pdfDownloaded);
    trackUxEvent("pdf_export_completed");
    track(EVENTS.PDF_EXPORT_COMPLETED, { document_type: "resume", language: docLang, template: tpl?.id || "", export_type: "jspdf" });
    if (docLang !== lang) track(EVENTS.MULTILINGUAL_RESUME_EXPORTED, { language: docLang, interface_language: lang, export_type: "pdf", template: tpl?.id || "" });
    track(EVENTS.RESUME_EXPORTED, { format: "pdf", template: tpl?.id || "" });
    setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
    } catch {
      setStatusMsg(st.pdfFail);
      track(EVENTS.PDF_EXPORT_FAILED, { document_type: "resume", language: docLang, template: tpl?.id || "", export_type: "jspdf" });
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setExporting("");
    }
  }

  async function downloadDOCX() {
    const options = arguments[0] || {};
    if (exporting) return;
    const src = normalizeResumeData(result || liveData);
    if (!src) return;
    if (isResumeDataEmpty(src)) {
      setStatusMsg(statusText("downloadEmptyResume"));
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    if (shouldReviewBeforeExport("docx", options.skipReview)) return;
    if (!form.name.trim() || !form.experience.trim() || !form.skills.trim()) {
      setStatusMsg(st.incompleteDownload);
      setTimeout(() => setStatusMsg(""), 3500);
    }
    setExporting("docx");
    setExportSuccess("");
    try {
    track(EVENTS.DOCX_EXPORT_STARTED, { document_type: "resume", language: docLang, template: tpl?.id || "" });
    const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, ExternalHyperlink } = await import("docx");

    const accent = accentOnPaper(tpl.accent).replace("#", "").toUpperCase();
    const docxRtl = isRtlLang(docLang);
    const docxAlignment = docxRtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
    const docxFont = docxRtl ? "Noto Sans Arabic" : "Aptos";
    const makeRun = (options = {}) => new TextRun({
      font: docxFont,
      rightToLeft: docxRtl,
      ...options,
    });
    const makeLinkedRuns = (text, options = {}) => linkifyText(text).map((part) => {
      if (part.type !== "link") return makeRun({ text: part.text, ...options });
      return new ExternalHyperlink({
        link: part.href,
        children: [makeRun({
          text: part.text,
          color: accent,
          underline: {},
          ...options,
        })],
      });
    });
    const makeParagraph = (options = {}) => new Paragraph({
      alignment: options.alignment || docxAlignment,
      bidirectional: docxRtl,
      ...options,
    });
    const isDocxTagSection = (section) => /skill|compét|habilidad|مهارات|fähig|^language|^langue|^idioma|^sprach/i.test(section.heading || "");
    const children = [];

    // Name
    children.push(makeParagraph({
      children: makeLinkedRuns(src.name || "", { bold: true, size: 44, color: "111111" }),
      spacing: { after: 60 },
    }));

    // Title
    if (src.title) {
      children.push(makeParagraph({
        children: makeLinkedRuns(src.title, { size: 26, color: accent }),
        spacing: { after: 60 },
      }));
    }

    // Contact
    const contact = asArray(src.contact).filter(Boolean).join("   •   ");
    if (contact) {
      children.push(makeParagraph({
        children: makeLinkedRuns(contact, { size: 20, color: "666666" }),
        spacing: { after: 120 },
      }));
    }

    // Divider
    children.push(makeParagraph({
      border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 8 } },
      spacing: { after: 160 },
    }));

    // Summary
    if (src.summary) {
      children.push(makeParagraph({
        children: makeLinkedRuns(src.summary, { size: 21 }),
        spacing: { after: 240 },
      }));
    }

    // Sections
    for (const section of asArray(src.sections)) {
      children.push(makeParagraph({
        children: [makeRun({ text: section.heading.toUpperCase(), bold: true, size: 22, color: accent })],
        border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 4 } },
        spacing: { before: 240, after: 120 },
      }));
      if (isDocxTagSection(section)) {
        children.push(makeParagraph({
          children: makeLinkedRuns(asArray(section.items).map((item) => normalizeDateRange(item, docLang)).filter(Boolean).join("   •   "), { size: 20 }),
          spacing: { after: 100 },
        }));
        continue;
      }
      for (const entry of structureSectionItems(section, docLang)) {
        if (entry.title) {
          children.push(makeParagraph({
            children: makeLinkedRuns(entry.title, { bold: true, size: 21, color: "111111" }),
            spacing: { before: 80, after: 20 },
          }));
        }
        if (entry.meta?.length) {
          children.push(makeParagraph({
            children: makeLinkedRuns(entry.meta.join("   •   "), { size: 18, color: "666666" }),
            spacing: { after: entry.bullets?.length ? 45 : 95 },
          }));
        }
        for (const bullet of (entry.bullets || [])) {
          children.push(makeParagraph({
            children: makeLinkedRuns(bullet, { size: 20 }),
            bullet: { level: 0 },
            spacing: { after: 60 },
            indent: docxRtl ? { right: 260 } : { left: 260 },
          }));
        }
      }
    }

    const docFile = new Document({
      creator: "ApplyCraft",
      description: `${docLang || "en"} resume export`,
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      }],
    });
    const blob = await Packer.toBlob(docFile);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(src.name, "resume")}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(st.docxSuccess);
    setStatusMsg(st.docxDownloaded);
    trackUxEvent("docx_export_completed");
    track(EVENTS.DOCX_EXPORT_COMPLETED, { document_type: "resume", language: docLang, template: tpl?.id || "" });
    if (docLang !== lang) track(EVENTS.MULTILINGUAL_RESUME_EXPORTED, { language: docLang, interface_language: lang, export_type: "docx", template: tpl?.id || "" });
    track(EVENTS.RESUME_EXPORTED, { format: "docx", template: tpl?.id || "" });
    setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
    } catch (error) {
      console.error("DOCX export failed", error);
      setStatusMsg(st.docxFail);
      track(EVENTS.DOCX_EXPORT_FAILED, { document_type: "resume", language: docLang, template: tpl?.id || "" });
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setExporting("");
    }
  }

  const getTemplateMeta = (template) => {
    const baseMeta = TEMPLATE_GALLERY_META[template.id] || (template.variant ? TEMPLATE_GALLERY_META[template.variant] : null);
    const localizedMeta = template.gallery?.[lang] || template.gallery?.en || null;
    return {
      description: localizedMeta?.description || templateTagText(template) || baseMeta?.description || "Professional layout with clear sections and export support.",
      bestFor: localizedMeta?.bestFor || baseMeta?.bestFor || "Best for general professional applications.",
      attributes: localizedMeta?.attributes || baseMeta?.attributes || ["Professional", "Flexible"],
      layout: localizedMeta?.layout || baseMeta?.layout || "Flexible",
      filters: [...new Set([...(baseMeta?.filters || []), ...(template.filters || [])])],
      countries: templateCountries(template),
    };
  };

  const filterTemplates = (template) => {
    if (template.blank) return false;
    const meta = getTemplateMeta(template);
    const q = tplSearch.trim().toLowerCase();
    const filterOk = tplFilter === "all" || meta.filters.includes(tplFilter) || (tplFilter === "recommended" && template.id === RECOMMENDED_TEMPLATE_ID);
    if (!filterOk) return false;
    if (tplCountry !== "all" && !meta.countries.includes(tplCountry)) return false;
    if (!q) return true;
    return [
      template.name,
      templateTagText(template),
      meta.description,
      meta.bestFor,
      meta.layout,
      ...(meta.attributes || []),
      ...(meta.filters || []),
    ].filter(Boolean).join(" ").toLowerCase().includes(q);
  };

  const visibleTemplates = TEMPLATES
    .filter(filterTemplates)
    .sort((a, b) => (a.id === RECOMMENDED_TEMPLATE_ID ? -1 : b.id === RECOMMENDED_TEMPLATE_ID ? 1 : 0));

  const isTemplateGalleryView = navPage === "resume" && step === "templates";

  // Client-side equivalent of following a nav item's href: the SPA renders the
  // tool in place instead of loading its route.
  const enterPrimaryTool = (item) => {
    setNavPage(item.id);
    if (item.id === "resume") setStep("templates");
    if (item.id === "cover") setCoverStep("templates");
  };

  // The in-app navbar IS the marketing navbar (src/siteChrome.jsx) — same height
  // token, logo, item order and labels. The app-only chrome (active tool, save
  // state, tools drawer) is passed in as props, never forked into a second component.
  const showWorkspaceStatus = (
    (navPage === "resume" && step !== "templates")
    || (navPage === "cover" && coverStep !== "templates")
    || navPage === "ats"
  );

  const AppToolHeader = () => (
    <>
      <SharedSiteHeader
        lang={lang}
        activeId={navPage === "resume" && step === "templates" ? "templates" : navPage}
        onNavigate={(item) => {
          setAppHeaderMenuOpen(false);
          enterPrimaryTool(item);
        }}
        onLogoClick={() => setAppView("landing")}
        currentPath={location.pathname}
        onLanguageSelect={setSiteLanguage}
        mobileMenuOpen={appHeaderMenuOpen}
        onMobileMenuToggle={() => setAppHeaderMenuOpen((open) => !open)}
      />
      {showWorkspaceStatus && <WorkspaceStatusBar>
        <span title={builderText("notSavedHeaderTooltip")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.text3, fontSize: 12.5, fontWeight: 700 }}>
          <LineIcon name="alert" size={14} color={C.text3} /> {bu.notSavedAutomatically}
        </span>
      </WorkspaceStatusBar>}
    </>
  );

  const mainContent = step === "templates" ? (
    <div style={{ minHeight: isMobile ? "auto" : "calc(100vh - 32px)", padding: isMobile ? "0 8px 28px" : "0 0 44px" }}>
      {savedResumes.length > 0 && (
        <section aria-label={builderText("myResumesRegion")} style={{ maxWidth: 1180, margin: "0 auto 6px", padding: isMobile ? "0 4px" : "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: C.text1 }}>
              {bu.myResumes}
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text3, marginInlineStart: 10 }}>
                {resumes.isSubscribed() ? bu.unlimited : `${savedResumes.length} / ${resumes.FREE_RESUME_LIMIT} ${bu.free}`}
              </span>
            </h2>
            <button type="button" onClick={newResume}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.grad, color: "#fff",
                border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit" }}>
              <span aria-hidden style={{ fontSize: 16, fontWeight: 800 }}>+</span> {bu.newResume}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 30 }}>
            {savedResumes.map((r) => (
              <div key={r.id} style={{ background: C.surface, border: `1px solid ${currentResumeId === r.id ? C.accent : C.border}`,
                borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <button type="button" onClick={() => openResume(r.id)}
                  style={{ background: "none", border: "none", textAlign: rtl ? "right" : "left", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: C.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || bu.untitledResume}</div>
                  <div style={{ fontSize: 11.5, color: C.text3, marginTop: 3 }}>{bu.updated} {new Date(r.updatedAt || Date.now()).toLocaleDateString(LETTER_LOCALE[lang] || undefined)}</div>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button type="button" onClick={() => openResume(r.id)}
                    style={{ flex: 1, background: `${C.accent}14`, border: `1px solid ${C.accent}40`, borderRadius: 8,
                      padding: "6px 10px", fontSize: 12.5, fontWeight: 700, color: C.accent2, cursor: "pointer", fontFamily: "inherit" }}>{bu.open}</button>
                  <button type="button" onClick={() => removeResume(r.id)} aria-label={`Delete ${r.title || "resume"}`}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 9px",
                      fontSize: 13, color: C.text3, cursor: "pointer", fontFamily: "inherit" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="template-gallery-title" style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "0 4px" : "0 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 0.92fr) minmax(300px, 0.48fr)",
          gap: isMobile ? 22 : 42, alignItems: "end", marginBottom: isMobile ? 22 : 30 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999,
              background: `${C.accent}12`, border: `1px solid ${C.accent}2E`,
              color: C.accent2, padding: "5px 12px", fontSize: 11, fontWeight: 900,
              letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: 14 }}>
              {bu.templatesEyebrow}
            </div>
            <h1 id="template-gallery-title" style={{ margin: "0 0 12px", color: C.text1,
              fontSize: isMobile ? 30 : 40, lineHeight: 1.08, letterSpacing: "-0.8px", fontWeight: 900 }}>
              {bu.galleryTitle}
            </h1>
            <p style={{ margin: 0, maxWidth: 650, color: C.text2, fontSize: isMobile ? 15 : 16.5, lineHeight: 1.65 }}>
              {bu.gallerySub}
            </p>
          </div>
          <div style={{ display: "grid", gap: 10, justifyContent: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: isMobile ? "flex-start" : "flex-end",
              color: C.text2, fontSize: 13.5 }}>
              <LineIcon name="lock" size={16} color={C.accent2} />
              <span>{bu.allFree}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
              {[bu.badgePdf, bu.badgeDocx, bu.badgeRtl].map((item) => (
                <span key={item} style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.text3,
                  borderRadius: 999, padding: "6px 10px", fontSize: 12.5, fontWeight: 700 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: isMobile ? 18 : 22, marginBottom: isMobile ? 18 : 26 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(260px, 360px) 1fr",
            gap: 12, alignItems: "center" }}>
            <label style={{ display: "block" }}>
              <span className="sr-only">{bu.searchTemplates}</span>
              <input value={tplSearch} onChange={(e) => setTplSearch(e.target.value)}
                placeholder={bu.searchTemplates}
                style={{ width: "100%", minHeight: 46, boxSizing: "border-box", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surface, color: C.text1,
                  padding: "0 14px", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}24`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
              />
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
              {TEMPLATE_QUICK_FILTERS.map((filter) => {
                const active = tplFilter === filter.id;
                return (
                  <button key={filter.id} type="button" onClick={() => setTplFilter(filter.id)}
                    aria-pressed={active}
                    style={{ minHeight: 38, border: `1px solid ${active ? C.accent : C.border}`,
                      background: active ? `${C.accent}1F` : "transparent",
                      color: active ? C.accent2 : C.text2, borderRadius: 999, padding: "0 13px",
                      fontSize: 12.8, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                      display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {active && <LineIcon name="check" size={13} color={C.accent2} />}
                    {bu[`filter_${filter.id}`] || filter.label}
                  </button>
                );
              })}
              <div style={{ position: "relative" }}>
                <button type="button" onClick={() => setTemplateFiltersOpen((open) => !open)}
                  aria-expanded={templateFiltersOpen}
                  style={{ minHeight: 38, border: `1px solid ${TEMPLATE_MORE_FILTERS.some(f => f.id === tplFilter) ? C.accent : C.border}`,
                    background: TEMPLATE_MORE_FILTERS.some(f => f.id === tplFilter) ? `${C.accent}1F` : C.surface,
                    color: C.text2, borderRadius: 999, padding: "0 13px", fontSize: 12.8,
                    fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  {bu.filters}
                </button>
                {templateFiltersOpen && (
                  <div role="menu" aria-label={builderText("moreTemplateFilters")}
                    style={{ position: "absolute", right: rtl ? "auto" : 0, left: rtl ? 0 : "auto", top: "calc(100% + 8px)",
                      minWidth: 190, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                      boxShadow: "0 18px 48px rgba(0,0,0,0.42)", padding: 6, zIndex: 20 }}>
                    {TEMPLATE_MORE_FILTERS.map((filter) => {
                      const active = tplFilter === filter.id;
                      return (
                        <button key={filter.id} type="button" role="menuitemcheckbox" aria-checked={active}
                          onClick={() => { setTplFilter(filter.id); setTemplateFiltersOpen(false); }}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8,
                            border: "none", background: active ? `${C.accent}18` : "transparent",
                            color: active ? C.accent2 : C.text2, borderRadius: 8, padding: "9px 10px",
                            textAlign: rtl ? "right" : "left", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                          <LineIcon name={active ? "check" : "document"} size={14} color={active ? C.accent2 : C.text3} />
                          {bu[`filter_${filter.id}`] || filter.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {(tplSearch || tplFilter !== "all" || tplCountry !== "all") && (
                <button type="button" onClick={() => { setTplSearch(""); setTplFilter("all"); setTplCountry("all"); }}
                  style={{ minHeight: 38, border: "none", background: "transparent", color: C.text3,
                    padding: "0 8px", fontSize: 12.8, fontWeight: 750, cursor: "pointer", fontFamily: "inherit" }}>
                  {bu.clear}
                </button>
              )}
            </div>
          </div>
          <div aria-label={bu.countryFilterLabel}
            style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0 2px",
              marginTop: 8, scrollbarWidth: "thin", direction: rtl ? "rtl" : "ltr" }}>
            {TEMPLATE_COUNTRY_FILTERS.map((country) => {
              const active = tplCountry === country;
              const label = bu[`country_${country}`] || country;
              const hint = bu[`country_${country}_hint`] || "";
              return (
                <button key={country} type="button" onClick={() => setTplCountry(country)}
                  aria-pressed={active}
                  title={hint}
                  style={{ minHeight: 42, flex: "0 0 auto", border: `1px solid ${active ? C.accent : C.border}`,
                    background: active ? `${C.accent}1F` : C.surface,
                    color: active ? C.accent2 : C.text2, borderRadius: 999, padding: "0 14px",
                    fontSize: 12.8, fontWeight: 850, cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                  {active && <LineIcon name="check" size={13} color={C.accent2} />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {tplCountry !== "all" && (
            <p style={{ margin: "7px 0 0", color: C.text3, fontSize: 12.5, lineHeight: 1.45 }}>
              {bu[`country_${tplCountry}_hint`]}
            </p>
          )}
        </div>

        {visibleTemplates.length === 0 ? (
          <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 16,
            padding: isMobile ? "28px 18px" : "42px", textAlign: "center", color: C.text2 }}>
            <h2 style={{ margin: "0 0 8px", color: C.text1, fontSize: 20 }}>{bu.noTemplatesTitle}</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14 }}>{bu.noTemplatesSub}</p>
            <button type="button" onClick={() => { setTplSearch(""); setTplFilter("all"); setTplCountry("all"); }}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                padding: "11px 18px", fontSize: 13.5, fontWeight: 850, cursor: "pointer", fontFamily: "inherit" }}>
              {bu.clearFilters}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: isMobile ? 28 : 42, alignItems: "start" }}>
            {visibleTemplates.map((tp) => {
              const meta = getTemplateMeta(tp);
              const recommended = tp.id === RECOMMENDED_TEMPLATE_ID;
              const selected = tpl?.id === tp.id;
              const active = templateHover === tp.id || templateFocus === tp.id;
              return (
                <article key={tp.id} aria-labelledby={`template-${tp.id}-title`}
                  onMouseEnter={() => setTemplateHover(tp.id)}
                  onMouseLeave={() => setTemplateHover("")}
                  onFocusCapture={() => setTemplateFocus(tp.id)}
                  onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setTemplateFocus(""); }}
                  style={{ position: "relative", minWidth: 0 }}>
                  <div style={{ position: "relative", borderRadius: 0, overflow: "visible", background: "transparent",
                    border: "none",
                    outline: selected ? `2px solid ${C.accent}` : recommended ? `1px solid ${C.accent}66` : "none",
                    outlineOffset: 4,
                    boxShadow: active || selected ? `0 0 0 4px ${C.accent}18` : "none",
                    transition: "box-shadow 0.2s ease, outline-color 0.2s ease, transform 0.2s ease",
                    transform: active ? "translateY(-3px)" : "none" }}>
                      <ThumbPreview tp={tp} isMobile={isMobile} />
                      {(selected || recommended) && (
                        <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex",
                          alignItems: "center", gap: 5, color: selected ? "#fff" : C.accent2,
                          background: selected ? C.accent : "rgba(15,23,42,0.84)",
                          border: `1px solid ${selected ? C.accent : `${C.accent}55`}`,
                          borderRadius: 999, padding: "5px 9px", fontSize: 11, fontWeight: 900,
                          boxShadow: "0 10px 24px rgba(0,0,0,0.25)" }}>
                          <LineIcon name="check" size={12} color={selected ? "#fff" : C.accent2} />
                          {selected ? bu.selected : bu.recommended}
                        </span>
                      )}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 10, padding: 16,
                        background: active ? "rgba(2,6,23,0.48)" : "rgba(2,6,23,0)",
                        opacity: isMobile ? 0 : active ? 1 : 0, pointerEvents: isMobile ? "none" : active ? "auto" : "none",
                        transition: "opacity 0.18s ease, background 0.18s ease" }}>
                        <button type="button" onClick={() => { track(EVENTS.TEMPLATE_PREVIEW_OPENED, { template: tp.id }); setTemplatePreview(tp); }}
                          aria-label={builderText("previewTemplate", { template: tp.name })}
                          style={{ minHeight: 40, padding: "0 14px", background: "rgba(15,23,42,0.82)",
                            color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 9,
                            fontSize: 13, fontWeight: 850, cursor: "pointer", fontFamily: "inherit" }}>
                          {bu.preview}
                        </button>
                        <a role="button" href={routeWithParam("/resume-builder/", lang, "template", tp.id)}
                          aria-label={recommended ? builderText("useRecommendedTemplate") : builderText("useTemplateNamed", { template: tp.name })}
                          onClick={(event) => handleRouteLink(event, () => startWithTemplate(tp, recommended ? "recommended_template" : "template_gallery"))}
                          style={{ minHeight: 40, padding: "0 15px", background: C.grad, color: "#fff",
                            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 900,
                            cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                          {bu.useTemplate}
                        </a>
                      </div>
                    </div>
                  <div style={{ padding: isMobile ? "12px 2px 0" : "14px 2px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 24 }}>
                      <h2 id={`template-${tp.id}-title`} style={{ margin: 0, color: C.text1,
                        fontSize: 16.5, fontWeight: 800, letterSpacing: "0" }}>
                        {tp.name}
                      </h2>
                      {recommended && !selected && (
                        <span style={{ color: C.accent2, background: `${C.accent}14`,
                          borderRadius: 999, padding: "2px 7px", fontSize: 10.5, fontWeight: 900 }}>
                          {bu.recommended}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "4px 0 0", color: C.text2, fontSize: 13.2, lineHeight: 1.45 }}>
                      {meta.description}
                    </p>
                    {isMobile && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button type="button" onClick={() => { track(EVENTS.TEMPLATE_PREVIEW_OPENED, { template: tp.id }); setTemplatePreview(tp); }}
                        aria-label={builderText("previewTemplate", { template: tp.name })}
                        style={{ flex: 1, minHeight: 44, padding: "0 13px", background: "transparent",
                          color: C.text2, border: `1px solid ${C.border}`, borderRadius: 9,
                          fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                        {bu.preview}
                      </button>
                      <a role="button" href={routeWithParam("/resume-builder/", lang, "template", tp.id)}
                        aria-label={recommended ? builderText("useRecommendedTemplate") : builderText("useTemplateNamed", { template: tp.name })}
                        onClick={(event) => handleRouteLink(event, () => startWithTemplate(tp, recommended ? "recommended_template" : "template_gallery"))}
                        style={{ flex: 1, minHeight: 44, background: C.grad,
                          color: "#fff", border: "none",
                          borderRadius: 9, fontSize: 13.5, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                        {bu.useTemplate}
                      </a>
                    </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <TemplatePreviewModal
        template={templatePreview}
        meta={templatePreview ? getTemplateMeta(templatePreview) : null}
        onClose={() => setTemplatePreview(null)}
        onUse={(template) => startWithTemplate(template, "template_preview")}
        isMobile={isMobile}
        rtl={rtl}
        bu={bu}
        labels={{
          previewEyebrow: builderText("templatePreviewEyebrow"),
          useTemplate: builderText("useThisTemplate"),
          close: builderText("closeTemplatePreview"),
          whyChoose: bu.whyChoose || BUILDER_UI.en.whyChoose,
          templateDetails: builderText("templateDetails"),
        }}
      />
    </div>
  ) : null;

  const applyFormat = (key, marker, endMarker) => {
    const el = document.getElementById(`field-${key}`);
    if (!el) return;
    const val = form[key];
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = val.slice(start, end);
    const close = endMarker !== undefined ? endMarker : marker;
    if (selected.startsWith(marker) && selected.endsWith(close)) {
      const inner = selected.slice(marker.length, selected.length - close.length);
      setField(key, val.slice(0, start) + inner + val.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start, start + inner.length); }, 0);
    } else {
      setField(key, val.slice(0, start) + marker + selected + close + val.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + marker.length, end + marker.length); }, 0);
    }
  };

  const applyLinePrefix = (key, prefix, numbered) => {
    const el = document.getElementById(`field-${key}`);
    if (!el) return;
    const val = form[key];
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = val.indexOf("\n", end);
    const block = val.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const lines = block.split("\n");
    const allPrefixed = lines.every(l => l.startsWith(prefix) || (numbered && /^\d+\. /.test(l)));
    let counter = 1;
    const updated = lines.map(l => {
      if (allPrefixed) return l.replace(/^[•\-] |^\d+\. /, "");
      if (numbered) return `${counter++}. ${l}`;
      return l.startsWith(prefix) ? l : `${prefix}${l}`;
    }).join("\n");
    const newVal = val.slice(0, lineStart) + updated + (lineEnd === -1 ? "" : val.slice(lineEnd));
    setField(key, newVal);
    setTimeout(() => { el.focus(); }, 0);
  };

  const clearFormat = (key) => {
    setField(key, (form[key] || "").replace(/\*\*|__|\*|~~/g, ""));
  };

  const FormattingBar = ({ fieldKey }) => {
    const btn = (label, title, onClick, extraStyle = {}) => (
      <button type="button" title={title} aria-label={title} onClick={onClick}
        style={{ background: SECTION_TOKENS.softSurface, border: "none", borderRadius: 6,
          padding: "3px 8px", fontSize: 12, fontWeight: 700, color: C.text2,
          cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5, ...extraStyle }}>
        {label}
      </button>
    );
    return (
      <div style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap" }}>
        {btn("B", "Bold", () => applyFormat(fieldKey, "**"), { fontWeight: 900 })}
        {btn("I", "Italic", () => applyFormat(fieldKey, "*"), { fontStyle: "italic", fontWeight: 400 })}
        {btn("U", "Underline", () => applyFormat(fieldKey, "__"), { textDecoration: "underline" })}
        {btn("~~S~~", "Strikethrough", () => applyFormat(fieldKey, "~~"), { textDecoration: "line-through", fontSize: 10 })}
        <div style={{ width: 1, background: SECTION_TOKENS.rowDivider, margin: "3px 2px" }} />
        {btn("•", "Bullet list", () => applyLinePrefix(fieldKey, "• "))}
        {btn("1.", "Numbered list", () => applyLinePrefix(fieldKey, "1. ", true))}
        <div style={{ width: 1, background: SECTION_TOKENS.rowDivider, margin: "3px 2px" }} />
        {btn("—", "Insert dash", () => applyFormat(fieldKey, " — ", ""), { fontWeight: 400 })}
        {btn("✕", "Clear formatting", () => clearFormat(fieldKey), { fontSize: 10, color: C.text3 })}
      </div>
    );
  };

  const field = (key, multiline, ph, id, error) => {
    const errStyle = error ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {};
    const onChange = (e) => { set(key)(e); if (error) clearFieldError(key); };
    return multiline ? (
      <>
        <FormattingBar fieldKey={key} />
        <textarea id={id || `field-${key}`} value={form[key]} onChange={onChange} placeholder={ph || ""} rows={5}
          dir={documentRtl ? "rtl" : "ltr"}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", ...errStyle }} />
      </>
    ) : (
      <input id={id || `field-${key}`} value={form[key]} onChange={onChange} placeholder={ph || ""} dir={documentRtl ? "rtl" : "ltr"} style={{ ...inputStyle, ...errStyle }} />
    );
  };

  // Render a structured-entry section card for `key`, wired to the shared handlers.
  const renderSection = (key, defaultHeading) => (
    <SectionCard
      sectionKey={key}
      heading={(form.sectionTitles && form.sectionTitles[key]) || defaultHeading}
      defaultHeading={defaultHeading}
      entries={form[key + "Entries"] || []}
      eui={eui} rtl={documentRtl}
      builderText={builderText}
      optional={isOptionalSection(key)}
      collapsed={!!collapsedSections[key]}
      onToggleCollapse={() => toggleSectionCollapse(key)}
      onRemove={OPTIONAL_SECTIONS.includes(key) ? () => removeSection(key) : undefined}
      onEditHeading={(h) => setSectionTitle(key, h)}
      onRestoreDefault={() => setForm((f) => {
        const nextTitles = { ...(f.sectionTitles || {}) };
        delete nextTitles[key];
        return { ...f, sectionTitles: nextTitles };
      })}
      onAdd={() => addSectionEntry(key)}
      onChangeEntry={(id, ch) => changeSectionEntry(key, id, ch)}
      onDeleteEntry={(id) => deleteSectionEntry(key, id)}
      onToggleVisible={(id) => toggleSectionEntryVisible(key, id)}
      onReorder={(from, to) => reorderSectionEntry(key, from, to)}
    />
  );

  // ── Cover-letter formatting helpers ───────────────────────────────────────
  const setCoverField = (k, v) => setCoverForm(f => ({ ...f, [k]: v }));

  const coverApplyFormat = (key, marker, endMarker) => {
    const el = document.getElementById(`cover-field-${key}`);
    if (!el) return;
    const val = coverForm[key];
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = val.slice(start, end);
    const close = endMarker !== undefined ? endMarker : marker;
    if (selected.startsWith(marker) && selected.endsWith(close)) {
      const inner = selected.slice(marker.length, selected.length - close.length);
      setCoverField(key, val.slice(0, start) + inner + val.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start, start + inner.length); }, 0);
    } else {
      setCoverField(key, val.slice(0, start) + marker + selected + close + val.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + marker.length, end + marker.length); }, 0);
    }
  };

  const coverApplyLinePrefix = (key, prefix, numbered) => {
    const el = document.getElementById(`cover-field-${key}`);
    if (!el) return;
    const val = coverForm[key];
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = val.indexOf("\n", end);
    const block = val.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const lines = block.split("\n");
    const allPrefixed = lines.every(l => l.startsWith(prefix) || (numbered && /^\d+\. /.test(l)));
    let counter = 1;
    const updated = lines.map(l => {
      if (allPrefixed) return l.replace(/^[•\-] |^\d+\. /, "");
      if (numbered) return `${counter++}. ${l}`;
      return l.startsWith(prefix) ? l : `${prefix}${l}`;
    }).join("\n");
    setCoverField(key, val.slice(0, lineStart) + updated + (lineEnd === -1 ? "" : val.slice(lineEnd)));
    setTimeout(() => { el.focus(); }, 0);
  };

  const CoverFormattingBar = ({ fieldKey }) => {
    const btn = (label, title, onClick, extraStyle = {}) => (
      <button type="button" title={title} aria-label={title} onClick={onClick}
        style={{ background: C.elevated, border: "none", borderRadius: 5,
          padding: "2px 7px", fontSize: 12, fontWeight: 700, color: C.text2,
          cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5, ...extraStyle }}>
        {label}
      </button>
    );
    return (
      <div style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap" }}>
        {btn("B", "Bold", () => coverApplyFormat(fieldKey, "**"), { fontWeight: 900 })}
        {btn("I", "Italic", () => coverApplyFormat(fieldKey, "*"), { fontStyle: "italic", fontWeight: 400 })}
        {btn("U", "Underline", () => coverApplyFormat(fieldKey, "__"), { textDecoration: "underline" })}
        {btn("~~S~~", "Strikethrough", () => coverApplyFormat(fieldKey, "~~"), { textDecoration: "line-through", fontSize: 10 })}
        <div style={{ width: 1, background: C.border, margin: "2px 1px" }} />
        {btn("•", "Bullet list", () => coverApplyLinePrefix(fieldKey, "• "))}
        {btn("1.", "Numbered list", () => coverApplyLinePrefix(fieldKey, "1. ", true))}
        <div style={{ width: 1, background: C.border, margin: "2px 1px" }} />
        {btn("—", "Insert dash", () => coverApplyFormat(fieldKey, " — ", ""), { fontWeight: 400 })}
        {btn("✕", "Clear formatting", () => setCoverField(fieldKey, (coverForm[fieldKey] || "").replace(/\*\*|__|\*|~~/g, "")), { fontSize: 10, color: C.text3 })}
      </div>
    );
  };

  // ── Achievement coach helpers ──────────────────────────────────────────────
  const WEAK_OPENERS = /^(responsible for|helped?( to)?|assisted?( with)?|worked on|was part of|involved in|supported?|participated in|contributed to|did |handled |performed |undertook |was involved)/i;
  const isWeakBullet = (line) => {
    const trimmed = line.trim();
    if (trimmed.length < 10) return false;
    const hasNumber = /\d/.test(trimmed);
    if (WEAK_OPENERS.test(trimmed)) return true;
    if (!hasNumber && trimmed.length < 60 && /^(managed|led|ran|ran|overseen?|oversaw)/i.test(trimmed)) return true;
    return false;
  };
  const detectCoachContext = (line) => {
    const l = line.toLowerCase();
    if (/customer|client|support|help.?desk|ticket|complaint|satisfaction/.test(l)) return "customer";
    if (/sales|revenue|quota|deal|pipeline|prospect|clos|upsell|convert/.test(l)) return "sales";
    if (/code|software|develop|engineer|build|deploy|api|database|backend|frontend|bug|feature|ci.?cd/.test(l)) return "tech";
    if (/manag|lead|team|supervis|report|hir|train|mentor|coach|staff/.test(l)) return "management";
    if (/market|campaign|seo|content|social|email|analytic|brand|copywrite|advertis/.test(l)) return "marketing";
    if (/account|financ|budget|invoic|reconcil|forecast|audit|tax|bookkeep/.test(l)) return "finance";
    return "general";
  };
  const COACH_QUESTIONS = {
    customer: [
      { id: "volume",  label: "How many customers or requests per day/week?", ph: "e.g. 40+ daily, 200/week" },
      { id: "channel", label: "Via phone, email, live chat, or in-person?",   ph: "e.g. phone and email" },
      { id: "issue",   label: "What type of issues did you solve?",            ph: "e.g. billing, technical, returns" },
      { id: "metric",  label: "Any satisfaction score or resolution rate?",    ph: "e.g. 96% CSAT, 92% first-call resolution" },
    ],
    sales: [
      { id: "volume",  label: "Revenue generated or quota achieved?",          ph: "e.g. $1.2M ARR, 120% of quota" },
      { id: "channel", label: "How? (calls, demos, partnerships…)",            ph: "e.g. cold outreach and product demos" },
      { id: "metric",  label: "Deals closed or conversion rate?",              ph: "e.g. 24 enterprise deals, 18% conversion" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. grew territory 40%, opened new market" },
    ],
    tech: [
      { id: "action",  label: "What exactly did you build or fix?",            ph: "e.g. REST API, CI/CD pipeline, dashboard" },
      { id: "scale",   label: "Scale or size? (users, requests, servers…)",    ph: "e.g. 500k users, 10M req/day, 200 servers" },
      { id: "metric",  label: "Performance gain or time saved?",               ph: "e.g. 40% faster, reduced errors by 70%" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. unblocked 3 teams, saved $50k/year" },
    ],
    management: [
      { id: "volume",  label: "How many people did you lead?",                 ph: "e.g. 8 engineers, cross-functional team of 12" },
      { id: "action",  label: "Main focus? (delivery, hiring, strategy…)",     ph: "e.g. delivery and roadmap planning" },
      { id: "metric",  label: "Key result or outcome?",                        ph: "e.g. shipped 3 major releases, reduced churn 20%" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. scaled team 2×, hit $2M ARR milestone" },
    ],
    marketing: [
      { id: "channel", label: "Which channels? (SEO, paid, email, social…)",   ph: "e.g. SEO and Google Ads" },
      { id: "metric",  label: "Key metric achieved?",                          ph: "e.g. 120% traffic growth, 3.2× ROAS" },
      { id: "volume",  label: "Budget managed or audience size?",              ph: "e.g. $500k budget, 50k email list" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. generated 400 leads, +18% revenue" },
    ],
    finance: [
      { id: "action",  label: "What exactly did you manage or produce?",       ph: "e.g. monthly close, budget variance reports" },
      { id: "volume",  label: "Portfolio or budget size?",                     ph: "e.g. $4M budget, 200-account portfolio" },
      { id: "metric",  label: "Accuracy, time saved, or error reduction?",     ph: "e.g. <0.5% variance, 2-day faster close" },
      { id: "impact",  label: "Business or audit impact?",                     ph: "e.g. zero audit findings, saved $80k" },
    ],
    general: [
      { id: "action",  label: "What specific action did you take?",            ph: "e.g. led, built, redesigned, launched" },
      { id: "volume",  label: "Any numbers? (quantity, frequency, scale)",     ph: "e.g. 20/week, team of 5, $100k budget" },
      { id: "method",  label: "How did you do it?",                            ph: "e.g. automation, cross-team collaboration" },
      { id: "metric",  label: "Measurable result?",                            ph: "e.g. 30% faster, saved 10 hours/week" },
      { id: "impact",  label: "Why did it matter to the business?",            ph: "e.g. enabled growth, reduced costs" },
    ],
  };

  const buildStrongBullet = (original, answers, ctx) => {
    const a = answers;
    const clean = original.trim()
      .replace(/^responsible for /i, "")
      .replace(/^helped? (to )?/i, "")
      .replace(/^assisted? (with )?/i, "")
      .replace(/^was part of /i, "")
      .replace(/^involved in /i, "")
      .replace(/^supported? /i, "")
      .replace(/^participated in /i, "")
      .replace(/^contributed to /i, "");

    const parts = [];
    if (ctx === "customer") {
      const vol = a.volume ? `${a.volume}` : "";
      const ch  = a.channel ? ` via ${a.channel}` : "";
      const iss = a.issue ? ` ${a.issue.toLowerCase()} enquiries` : " customer requests";
      const met = a.metric ? `, maintaining ${a.metric}` : "";
      parts.push(`Resolved ${vol}${iss}${ch}${met}.`);
      if (a.metric && !parts[0].includes(a.metric)) parts[0] = parts[0].replace(".", `, achieving ${a.metric}.`);
    } else if (ctx === "sales") {
      const vol = a.volume ? `${a.volume} in revenue` : "revenue targets";
      const ch  = a.channel ? ` through ${a.channel.toLowerCase()}` : "";
      const met = a.metric ? `, closing ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Generated ${vol}${ch}${met}${imp}.`);
    } else if (ctx === "tech") {
      const act = a.action ? a.action : clean;
      const sc  = a.scale ? ` serving ${a.scale}` : "";
      const met = a.metric ? `, improving performance by ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Built and shipped ${act}${sc}${met}${imp}.`);
    } else if (ctx === "management") {
      const vol = a.volume ? `a ${a.volume}` : "a cross-functional team";
      const act = a.action ? ` focused on ${a.action.toLowerCase()}` : "";
      const met = a.metric ? `, delivering ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Led ${vol}${act}${met}${imp}.`);
    } else if (ctx === "marketing") {
      const ch  = a.channel ? `${a.channel} campaigns` : "marketing campaigns";
      const vol = a.volume ? ` managing ${a.volume}` : "";
      const met = a.metric ? `, achieving ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Executed ${ch}${vol}${met}${imp}.`);
    } else if (ctx === "finance") {
      const act = a.action ? a.action : clean;
      const vol = a.volume ? ` for ${a.volume}` : "";
      const met = a.metric ? ` with ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Managed ${act}${vol}${met}${imp}.`);
    } else {
      const act = a.action ? a.action : clean;
      const vol = a.volume ? ` (${a.volume})` : "";
      const meth = a.method ? ` via ${a.method.toLowerCase()}` : "";
      const met = a.metric ? `, resulting in ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`${act.charAt(0).toUpperCase() + act.slice(1)}${vol}${meth}${met}${imp}.`);
    }
    return parts[0].replace(/\s{2,}/g, " ").replace(/\.\./g, ".").replace(/,\s*\./g, ".").trim();
  };

  const weakBullets = form.experience.split("\n").filter(l => isWeakBullet(l));

  const openCoach = (idx = 0) => {
    const weak = weakBullets[idx];
    if (!weak) return;
    setCoachBullet(weak);
    setCoachBulletIdx(idx);
    setCoachAnswers({});
    setCoachResult("");
    setCoachOpen(true);
  };

  const applyCoachResult = () => {
    if (!coachResult) return;
    const updated = form.experience.split("\n").map(l =>
      l.trim() === coachBullet.trim() ? coachResult : l
    ).join("\n");
    setSectionFromText("experience", updated);
    const remaining = updated.split("\n").filter(l => isWeakBullet(l));
    if (remaining.length > 0) {
      setCoachBullet(remaining[0]);
      setCoachBulletIdx(0);
      setCoachAnswers({});
      setCoachResult("");
    } else {
      setCoachOpen(false);
      setCoachBullet("");
      setCoachResult("");
      setCoachAnswers({});
    }
  };

  // ── ATS checker ───────────────────────────────────────────────────────────
  const computeATSIssues = () => {
    const issues = [];
    const expRaw  = form.experience.trim();
    const expLines = expRaw ? expRaw.split("\n").filter(l => l.trim().length > 5) : [];

    // ── CRITICAL ──
    if (!form.email.trim()) issues.push({
      level: "critical", icon: "✉️", title: "No email address",
      detail: "ATS systems extract email from your resume to create your candidate profile. Without it, your application cannot be processed.",
      fix: "Add email",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-email")?.focus(), 80); }
    });
    if (!form.title.trim()) issues.push({
      level: "critical", icon: "💼", title: "No job title",
      detail: "Your current or target job title is used for keyword matching and candidate ranking. Leaving it blank lowers your ATS score.",
      fix: "Add title",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-title")?.focus(), 80); }
    });
    if (!expRaw) issues.push({
      level: "critical", icon: "📋", title: "Experience section is empty",
      detail: "Work experience is the most heavily weighted section in ATS ranking. An empty section will result in a very low match score.",
      fix: "Add experience",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-experience")?.focus(), 80); }
    });
    if (!form.skills.trim()) issues.push({
      level: "critical", icon: "⚡", title: "No skills listed",
      detail: "ATS systems scan your skills section for exact keyword matches against the job description. This section has the highest keyword density impact.",
      fix: "Add skills",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-skills")?.focus(), 80); }
    });

    // ── WARNING ──
    if (!form.summary.trim()) issues.push({
      level: "warning", icon: "📝", title: "No professional summary",
      detail: "A 2–4 sentence summary at the top increases keyword density and gives ATS systems immediate context about your profile before parsing experience.",
      fix: "Add summary",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-summary")?.focus(), 80); }
    });

    const hasNumbers = expLines.some(l => /\d/.test(l));
    if (expRaw && !hasNumbers) issues.push({
      level: "warning", icon: "🔢", title: "No quantified achievements",
      detail: "Bullets without numbers (%, $, team size, time saved) score lower in ATS ranking and are less compelling to recruiters. Add at least one metric per role.",
      fix: "Open Achievement Coach",
      fixFn: () => { setAtsOpen(false); openCoach(0); }
    });

    const weakLines = expLines.filter(l => isWeakBullet(l));
    if (weakLines.length > 0) issues.push({
      level: "warning", icon: "✍️",
      title: `${weakLines.length} passive bullet ${weakLines.length === 1 ? "opener" : "openers"}`,
      detail: `Phrases like "Responsible for", "Helped", or "Assisted" are passive, keyword-poor, and score lower than active-verb equivalents ("Led", "Built", "Reduced"). They also signal weak impact to human reviewers.`,
      fix: "Fix with Achievement Coach",
      fixFn: () => { setAtsOpen(false); openCoach(0); }
    });

    const longLines = expLines.filter(l => l.trim().length > 160);
    if (longLines.length > 0) issues.push({
      level: "warning", icon: "📏",
      title: `${longLines.length} line${longLines.length > 1 ? "s" : ""} over 160 characters`,
      detail: "Very long single lines are often truncated or misread by ATS parsers. Each bullet point should be one clear, focused sentence — aim for 80–140 characters.",
      fix: "Auto-split at sentence boundaries",
      fixFn: () => {
        const fixed = form.experience.split("\n").map(l => {
          if (l.trim().length > 160) {
            const mid = Math.floor(l.length / 2);
            const idx = l.indexOf(". ", mid);
            if (idx > 0) return l.slice(0, idx + 1) + "\n" + l.slice(idx + 2).trim();
          }
          return l;
        }).join("\n");
        setSectionFromText("experience", fixed);
      }
    });

    const hasDates = expLines.some(l => /\b(19|20)\d{2}\b/.test(l));
    if (expRaw && !hasDates) issues.push({
      level: "warning", icon: "📅", title: "No dates found in experience",
      detail: "ATS systems calculate tenure and employment gaps from year ranges. Include start and end years on each role line (e.g. Jan 2021 – Mar 2024).",
      fix: null
    });

    if (!form.linkedin.trim()) issues.push({
      level: "warning", icon: "🔗", title: "No LinkedIn URL",
      detail: "Many ATS systems auto-link your LinkedIn profile and score completeness partly on its presence. It also helps recruiters verify your background.",
      fix: "Add LinkedIn",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-linkedin")?.focus(), 80); }
    });

    // ── INFO ──
    if (!form.education.trim()) issues.push({
      level: "info", icon: "🎓", title: "Education section empty",
      detail: "Some ATS systems require at least one education entry to process an application. Add your highest qualification at a minimum.",
      fix: null
    });
    if (!form.phone.trim()) issues.push({
      level: "info", icon: "📞", title: "No phone number",
      detail: "Phone number is extracted by ATS systems for your candidate profile. Its absence may reduce completeness scoring.",
      fix: null
    });

    const summaryLen = (form.summary.match(/[.!?]/g) || []).length;
    if (summaryLen > 5) issues.push({
      level: "info", icon: "📄", title: "Professional summary may be too long",
      detail: `Your summary appears to have ${summaryLen} sentences. ATS systems prefer concise summaries of 2–4 sentences that are dense with relevant keywords.`,
      fix: null
    });

    return issues;
  };

  // ── ATS text scorer (for standalone ATS page — works on raw pasted text) ──
  // Keyword tokenization/matching is handled by the Unicode-aware engine in
  // src/ats/engine.js (analyzeKeywords); the regex below only flags weak,
  // passive bullet openers for the readiness checks.
  const WEAK_ATS = /^(responsible for|helped?( to)?|assisted?( with)?|worked on|was part of|involved in|supported?|participated in|contributed to|did |handled |performed |undertook |was involved)/i;

  const scoreRawResume = async (text, jdText) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const issues = [];
    const hasEmail    = /\b[\w.+%-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text);
    const hasPhone    = /(\+?\d[\d\s\-().]{6,14}\d)/.test(text);
    const hasLinkedin = /linkedin\.com/i.test(text);
    const hasExperience = /\b(experience|work history|employment)\b/i.test(text) || /\b(20\d{2}|19[89]\d)\b/.test(text);
    const hasEducation  = /\b(education|degree|university|college|bachelor|master|phd|mba|diploma)\b/i.test(text);
    const hasSkills     = /\b(skills|technologies|tools|expertise|proficient|competencies)\b/i.test(text);
    const hasSummary    = /\b(summary|profile|objective|about me|professional)\b/i.test(text);
    const hasDates      = /\b(20\d{2}|19[89]\d)\b/.test(text);
    const bulletLines   = lines.filter(l => l.length > 15 && l.length < 220);
    const hasNumbers    = bulletLines.some(l => /\d/.test(l));
    const weakLines     = lines.filter(l => { const t = l.trim(); return t.length > 10 && WEAK_ATS.test(t); });
    const longLines     = lines.filter(l => l.length > 180);
    const wordCount     = text.split(/\s+/).filter(Boolean).length;

    if (!hasEmail)      issues.push({ level:"critical", icon:"✉️", code:"NO_EMAIL" });
    if (!hasExperience) issues.push({ level:"critical", icon:"📋", code:"NO_EXPERIENCE" });
    if (!hasSkills)     issues.push({ level:"critical", icon:"⚡", code:"NO_SKILLS" });
    if (!hasPhone)      issues.push({ level:"warning",  icon:"📞", code:"NO_PHONE" });
    if (!hasLinkedin)   issues.push({ level:"warning",  icon:"🔗", code:"NO_LINKEDIN" });
    if (!hasSummary)    issues.push({ level:"warning",  icon:"📝", code:"NO_SUMMARY" });
    if (hasExperience && !hasNumbers) issues.push({ level:"warning", icon:"🔢", code:"NO_NUMBERS" });
    if (hasExperience && !hasDates)   issues.push({ level:"warning", icon:"📅", code:"NO_DATES" });
    if (weakLines.length > 0) issues.push({ level:"warning", icon:"✍️", code:"WEAK_BULLETS", data:{ count: weakLines.length } });
    if (longLines.length > 0) issues.push({ level:"warning", icon:"📏", code:"LONG_LINES", data:{ count: longLines.length } });
    if (wordCount < 200) issues.push({ level:"warning", icon:"📄", code:"TOO_SHORT", data:{ words: wordCount } });
    if (!hasEducation)  issues.push({ level:"info", icon:"🎓", code:"NO_EDUCATION" });
    if (wordCount > 1200) issues.push({ level:"info", icon:"📏", code:"TOO_LONG", data:{ words: wordCount } });

    let kwGap = null;
    if (jdText && jdText.trim().length > 30) {
      const { analyzeKeywords } = await import("./ats/engine.js");
      const a = analyzeKeywords(text, jdText); // stopword-filtered, normalized, cross-language
      if (a.total > 3) {
        const pct = a.pct;
        kwGap = { present: a.present, missing: a.missing, pct, total: a.total,
          crossLanguage: a.crossLanguage, langResume: a.langResume, langJd: a.langJd };
        const data = { pct, crossLanguage: a.crossLanguage, langResume: String(a.langResume || "").toUpperCase(), langJd: String(a.langJd || "").toUpperCase() };
        if (pct < 30) issues.unshift({ level:"critical", icon:"🎯", code:"KW_LOW", data });
        else if (pct < 45) issues.unshift({ level:"warning", icon:"🎯", code:"KW_MED", data });
      }
    }

    const score = scoreFromIssues(issues);
    return { score, issues, kwGap, wordCount };
  };

  // Form completion tracker
  const trackFields = ["name","title","email","phone","location","linkedin","website","summary","experience","education","skills","languages","certifications","projects","volunteer","awards"];
  const filledCount = trackFields.filter(k => form[k]?.trim()).length + (photoUrl ? 1 : 0);
  const totalCount  = trackFields.length + 1;
  const completion  = Math.round(filledCount / totalCount * 100);
  // `required` marks the only mandatory content: Personal Info, plus at least one
  // of Experience / Education (hence the single combined item). The rest stay in
  // the list as suggestions — they still drive "suggested next step" — but they
  // are deliberately not counted, so leaving them empty never reads as unfinished.
  const resumeChecklist = [
    { id: "contact", label: builderText("checklistContact"), done: !!(form.name && form.email && form.location), target: "field-name", required: true },
    { id: "core", label: builderText("checklistCoreSections"), done: !!(form.experience.trim() || form.education.trim()), target: "field-experience", required: true },
    { id: "summary", label: builderText("checklistSummary"), done: !!form.summary.trim(), target: "field-summary" },
    { id: "skills", label: builderText("checklistSkills"), done: form.skills.split(",").filter(s => s.trim()).length >= 5, target: "field-skills" },
    { id: "download", label: builderText("checklistDownload"), done: !!exportSuccess, target: null },
  ];
  const requiredChecklist = resumeChecklist.filter(item => item.required);
  const completedChecklist = requiredChecklist.filter(item => item.done).length;
  // Mandatory items first, so guidance never sends the user to an optional
  // section while a required one is still missing.
  const nextChecklistItem = requiredChecklist.find(item => !item.done) || resumeChecklist.find(item => !item.done);
  const readyForReview = completedChecklist === requiredChecklist.length;
  const atsIssues = computeATSIssues();
  const atsScore = scoreFromIssues(atsIssues);
  const resumeTitle = form.name.trim()
    ? builderText("ownedResumeTitle", { name: form.name.trim().split(/\s+/)[0] })
    : builderText("untitledResume");
  const translationFieldEntries = Object.entries(form.translationMeta?.fields || {});
  const translationReviewed = Boolean(form.translationMeta?.reviewed)
    || (translationFieldEntries.length > 0 && translationFieldEntries.every(([, meta]) => meta?.translationStatus === TRANSLATION_STATUSES.humanReviewed));
  const isTranslatedResume = Boolean(form.translationMeta?.fields);
  const translationButtonText = translationLimitReached
    ? bu.translationLimitReached
    : activeTranslatedToSelected
      ? translateLabel(bu.alreadyTranslatedTo, { language: selectedDocumentLanguageLabel })
      : translating
        ? bu.translatingContentButton
        : translateLabel(bu.translateContentButton, { language: selectedDocumentLanguageLabel });
  const translationButtonDisabled = translating || translationLimitReached || activeTranslatedToSelected || !hasResumeTranslatableContent;
  const versionOptionLabel = useCallback((resume) => {
    const meta = resume?.data?.translationMeta || {};
    const code = meta.targetLanguage || resume?.data?.documentLanguage || "en";
    const languageName = translationLanguageName(code);
    const status = meta.reviewed || meta.translationStatus === TRANSLATION_STATUSES.humanReviewed
      ? bu.versionReviewed
      : meta.translationStatus === TRANSLATION_STATUSES.editedAfterTranslation
        ? bu.versionEditedTranslation
        : meta.translationStatus === TRANSLATION_STATUSES.aiTranslated || meta.translationStatus === TRANSLATION_STATUSES.needsReview
          ? bu.versionAiTranslated
          : bu.versionOriginal;
    return `${status} — ${languageName}`;
  }, [bu.versionAiTranslated, bu.versionEditedTranslation, bu.versionOriginal, bu.versionReviewed, translationLanguageName]);

  const formContent = tpl ? (
    <div style={{ display: "flex", flexDirection: "column", height: "100%",
      boxSizing: "border-box", padding: isMobile ? "8px 4px" : "10px 16px" }}>


      {/* ── Builder top bar ── */}
      <div className="ac-app-header" style={{ position: "sticky", top: HEADER_HEIGHT, zIndex: 60, margin: isMobile ? "-8px -4px 12px" : "-10px -16px 14px",
        height: isMobile ? "auto" : HEADER_HEIGHT, boxSizing: "border-box",
        padding: isMobile ? "10px 12px" : "0 18px", background: `${C.bg}f4`, backdropFilter: "blur(14px)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <button onClick={() => setStep("templates")} aria-label={bu.backToTemplates}
          style={{ ...ghostIconBtn, margin: 0, fontSize: 18 }}>←</button>
        <div style={{ minWidth: 0, flex: "1 1 220px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <h1 style={{ margin: 0, color: C.text1, fontSize: isMobile ? 16 : 18, lineHeight: 1.15,
              fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumeTitle}</h1>
            {currentResumeId ? (
              <span title={builderText("notSavedTooltip")}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.text3,
                  fontSize: 11.5, whiteSpace: "nowrap" }}>
                <LineIcon name="check" size={11} color={C.text3} /> {bu.savedInline}
              </span>
            ) : (
              <button type="button" onClick={saveCurrentResume} title={builderText("notSavedTooltip")}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.accent2,
                  background: `${C.accent}14`, border: `1px solid ${C.accent}30`, borderRadius: 999,
                  padding: "2px 9px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap",
                  cursor: "pointer", fontFamily: "inherit" }}>
                {bu.saveInline}
              </button>
            )}
            {isTranslatedResume && (
              <button type="button" onClick={() => !translationReviewed && markTranslatedFields(TRANSLATION_STATUSES.humanReviewed)}
                disabled={translationReviewed}
                title={translationReviewed ? bu.reviewedTranslationBadge : bu.markReviewed}
                style={{ color: C.accent2, background: `${C.accent}18`, border: `1px solid ${C.accent}35`,
                  borderRadius: 999, padding: "2px 7px", fontSize: 10.5, fontWeight: 900, whiteSpace: "nowrap",
                  cursor: translationReviewed ? "default" : "pointer", fontFamily: "inherit" }}>
                {translationReviewed ? bu.reviewedTranslationBadge : bu.translatedBadge}
              </button>
            )}
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, color: C.text3, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: tpl.accent, flexShrink: 0 }} />
              <span>{tpl.name}</span>
              <span>·</span>
              <span>{completedChecklist}/{requiredChecklist.length} {bu.complete}</span>
            </div>
          )}
        </div>
        <div ref={resumeToolbarRef} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <button type="button" onClick={() => toggleToolbarPanel("c")}
              aria-haspopup="dialog" aria-expanded={activeToolbarPanel === "c"} aria-controls="p-c"
              style={{ ...softBtn }}>{bu.customize}</button>
            {activeToolbarPanel === "c" && (
              <div id="p-c" role="dialog" aria-label={bu.documentSettings}
                style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
                width: 300, maxWidth: "calc(100vw - 24px)", background: C.surface, border: "none",
                borderRadius: 12, boxShadow: "0 18px 54px rgba(0,0,0,0.5)", padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{bu.documentSettings}</div>
                <button onClick={() => { setActiveToolbarPanel(null); setStep("templates"); }}
                  style={{ width: "100%", textAlign: "left", background: C.elevated, border: "none",
                    color: C.text1, borderRadius: 9, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
                  <strong style={{ display: "block", fontSize: 13 }}>{bu.templateLabel}</strong>
                  <span style={{ color: C.text3, fontSize: 12 }}>{tpl.name} · {bu.atsConscious}</span>
                </button>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text3, margin: "12px 0 7px" }}>
                  {bu.documentLanguage}
                </div>
                <LanguageDropdown
                  selected={selectedDocumentLang}
                  onSelect={(l) => {
                    setDocumentLanguagePreference(l);
                  }}
                  ariaLabel={bu.chooseDocumentLanguage}
                  siteBadge={builderText("langBadgeSite")}
                  uiBadge={builderText("langBadgeUi")}
                />
                <p style={{ margin: "10px 0 0", fontSize: 11.5, color: C.text3, lineHeight: 1.5 }}>
                  {bu.languageSeparationNote}
                </p>
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={requestResumeTranslation}
                    disabled={translationButtonDisabled}
                    style={{
                      width: "100%",
                      minHeight: 38,
                      borderRadius: 9,
                      border: `1px solid ${translationButtonDisabled ? C.border : `${C.accent}55`}`,
                      background: translationButtonDisabled ? C.elevated : `${C.accent}18`,
                      color: translationButtonDisabled ? C.text3 : C.accent2,
                      fontSize: 12.5,
                      fontWeight: 850,
                      cursor: translating ? "wait" : translationButtonDisabled ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      padding: "8px 10px",
                    }}
                  >
                    {translationButtonText}
                  </button>
                  {activeTranslatedToSelected && (
                    <button
                      type="button"
                      onClick={requestResumeRetranslation}
                      disabled={translating || translationLimitReached}
                      style={{
                        width: "100%",
                        minHeight: 34,
                        marginTop: 8,
                        borderRadius: 9,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        color: translationLimitReached ? C.text3 : C.text2,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: translating ? "wait" : translationLimitReached ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        padding: "7px 10px",
                      }}
                    >
                      {bu.retranslateFromOriginal}
                    </button>
                  )}
                  {translationLimitReached && (
                    <p style={{ margin: "7px 0 0", fontSize: 11, color: C.text3, lineHeight: 1.45 }}>
                      {statusText("translateLimitReached")} {bu.upgradeTranslateMore}
                    </p>
                  )}
                  <p style={{ margin: "7px 0 0", fontSize: 11, color: C.text3, lineHeight: 1.45 }}>
                    {bu.translateContentHint}
                  </p>
                </div>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setMobileResumeMode(mobileResumeMode === "edit" ? "preview" : "edit")}
              style={{ ...softBtn }}>
              {mobileResumeMode === "edit" ? bu.preview : bu.edit}
            </button>
          )}
          <div style={{ position: "relative" }}>
            <button onClick={() => toggleToolbarPanel("e")} disabled={!!exporting}
              aria-haspopup="menu" aria-expanded={activeToolbarPanel === "e"} aria-controls="p-e"
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 9, minHeight: 38,
                padding: "0 16px", fontSize: 13, fontWeight: 900, cursor: exporting ? "not-allowed" : "pointer",
                fontFamily: "inherit", opacity: exporting ? 0.72 : 1 }}>
              {exporting ? bu.exportingBtn : bu.exportBtn}
            </button>
            {activeToolbarPanel === "e" && (
              <div id="p-e" role="menu" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
                minWidth: 230, background: C.surface, border: "none", borderRadius: 12,
                boxShadow: "0 18px 54px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", boxShadow: `inset 0 -1px 0 ${SECTION_TOKENS.rowDivider}` }}>
                  <div style={{ color: C.text1, fontSize: 13.5, fontWeight: 900 }}>{bu.exportTitle}</div>
                  <div style={{ color: C.text3, fontSize: 11.5, marginTop: 3 }}>
                    {readyForReview ? bu.readyToExport : `${requiredChecklist.length - completedChecklist} ${bu.improvementsRemain}`}
                  </div>
                </div>
                <button role="menuitem" onClick={() => { setActiveToolbarPanel(null); downloadPDF(); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                    background: "none", border: "none", color: C.text1, cursor: "pointer", fontFamily: "inherit" }}>
                  <strong>{t.dlPdf}</strong><br /><span style={{ color: C.text3, fontSize: 12 }}>{bu.pdfHint}</span>
                </button>
                <button role="menuitem" onClick={() => { setActiveToolbarPanel(null); downloadDOCX(); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                    background: "none", border: "none", color: C.text1, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `inset 0 1px 0 ${SECTION_TOKENS.rowDivider}` }}>
                  <strong>{t.dlDocx}</strong><br /><span style={{ color: C.text3, fontSize: 12 }}>{bu.docxHint}</span>
                </button>
              </div>
            )}
          </div>
          {renderMoreMenu("m", resumeSharePayload, `${form.name || "My"} resume`, {
            content: savedResumes.length > 0 ? (
              <label style={{ display: "block", padding: "6px 10px 10px" }}>
                <span style={{ display: "block", color: C.text3, fontSize: 11.5, fontWeight: 800, marginBottom: 6 }}>
                  {bu.versionLabel}
                </span>
                <select value={currentResumeId || ""} onChange={(e) => e.target.value && openResume(e.target.value)}
                  style={{ width: "100%", background: C.elevated, color: C.text2, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "8px 9px", fontSize: 12.5, fontFamily: "inherit" }}>
                  <option value="" disabled>{bu.untitledResume}</option>
                  {savedResumes.map((r) => <option key={r.id} value={r.id}>{versionOptionLabel(r)}</option>)}
                </select>
              </label>
            ) : null,
            items: [
              { label: bu.keepForThisSession, hint: bu.notSavedAutomatically, onClick: saveCurrentResume },
              { label: `ATS ${atsScore}`, hint: atsOpen ? bu.closeAtsChecker : builderText("reviewAtsTips"), onClick: () => setAtsOpen((o) => !o), primary: atsOpen },
            ],
          })}
        </div>
      </div>

      {/* Uploaded resume reference banner */}
      {uploadedResume && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: `${C.accent}10`, border: "none", borderRadius: 8,
          marginBottom: 14 }}>
          <span style={{ fontSize: 15 }}>📂</span>
          <span style={{ fontSize: 12.5, color: C.text2, flex: 1 }}>
            {builderText("referenceLabel")} <strong style={{ color: C.text1 }}>{uploadedResume.name}</strong>
          </span>
          <button onClick={() => setUploadedResume(null)}
            style={{ fontSize: 11, color: C.text3, background: "none", border: "none",
              cursor: "pointer", padding: 0, fontFamily: "inherit" }}>✕</button>
        </div>
      )}

      {importLanguageNotice.open && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, flexWrap: "wrap", padding: "10px 12px", background: `${C.accent}12`,
          border: `1px solid ${C.accent}30`, borderRadius: 10, marginBottom: 14,
          color: C.text2, fontSize: 12.5, lineHeight: 1.45 }}>
          <span>
            {translateLabel(bu.importLanguageDetected, {
              detected: translationLanguageName(importLanguageNotice.detected),
              previous: translationLanguageName(importLanguageNotice.previous),
            })}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button type="button"
              onClick={() => {
                const target = languageByCode(importLanguageNotice.previous);
                setTranslationConfirm({ open: true, target, kind: "resume", error: "" });
                setImportLanguageNotice({ open: false, detected: "", previous: "" });
              }}
              style={{ border: "none", background: `${C.accent}18`, color: C.accent2, borderRadius: 8,
                padding: "7px 10px", fontSize: 12, fontWeight: 850, cursor: "pointer", fontFamily: "inherit" }}>
              {translateLabel(bu.importLanguageTranslateOffer, { language: translationLanguageName(importLanguageNotice.previous) })}
            </button>
            <button type="button" onClick={() => setImportLanguageNotice({ open: false, detected: "", previous: "" })}
              style={{ border: "none", background: C.elevated, color: C.text2, borderRadius: 8,
                padding: "7px 10px", fontSize: 12, fontWeight: 850, cursor: "pointer", fontFamily: "inherit" }}>
              {bu.importLanguageDismiss}
            </button>
          </span>
        </div>
      )}

      {showDocumentLanguageTranslationPrompt && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, flexWrap: "wrap", padding: "10px 12px", background: `${C.accent}10`,
          border: `1px solid ${C.accent}28`, borderRadius: 10, marginBottom: 14,
          color: C.text2, fontSize: 12.5, lineHeight: 1.45 }}>
          <span>
            {translateLabel(bu.documentLanguageContentPrompt, { language: selectedDocumentLanguageLabel })}
          </span>
          <button type="button"
            onClick={requestResumeTranslation}
            disabled={translationButtonDisabled}
            style={{ border: "none", background: `${C.accent}18`, color: translationButtonDisabled ? C.text3 : C.accent2,
              borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 850,
              cursor: translationButtonDisabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {bu.documentLanguageContentPromptCta}
          </button>
        </div>
      )}

      {postImportTemplatePickerOpen && (
        <section aria-labelledby="post-import-template-title"
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: isMobile ? "14px 12px" : "16px 18px", marginBottom: 16,
            boxShadow: "0 14px 40px rgba(0,0,0,0.18)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12,
            justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.accent2, fontSize: 11, fontWeight: 900,
                letterSpacing: "1.1px", textTransform: "uppercase", marginBottom: 4 }}>
                {bu.importTemplateEyebrow}
              </div>
              <h2 id="post-import-template-title" style={{ margin: 0, color: C.text1,
                fontSize: isMobile ? 17 : 19, lineHeight: 1.25, fontWeight: 900 }}>
                {bu.importTemplateTitle}
              </h2>
              <p style={{ margin: "5px 0 0", color: C.text2, fontSize: 12.5, lineHeight: 1.5 }}>
                {bu.importTemplateSub}
              </p>
            </div>
            <button type="button" onClick={() => setPostImportTemplatePickerOpen(false)}
              aria-label={builderText("dismissImportTemplatePicker")}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9,
                border: `1px solid ${C.border}`, background: C.elevated, color: C.text2,
                cursor: "pointer", fontFamily: "inherit", fontSize: 15 }}>
              ✕
            </button>
          </div>
          <div dir={rtl ? "rtl" : "ltr"} data-post-import-template-carousel=""
            style={{ display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden",
              WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory", padding: "2px 2px 12px",
              marginInline: isMobile ? "-2px" : 0 }}>
            {TEMPLATES.filter((template) => !template.blank).map((tp) => {
              const selected = tpl?.id === tp.id;
              return (
                <button key={tp.id} type="button"
                  onClick={() => applyTemplateOnly(tp, "post_import_picker")}
                  aria-pressed={selected}
                  aria-label={builderText("chooseImportedTemplate", { template: tp.name })}
                  style={{ scrollSnapAlign: "start", flex: "0 0 auto", width: isMobile ? 150 : 172,
                    border: `2px solid ${selected ? C.accent : "transparent"}`,
                    background: selected ? `${C.accent}14` : "transparent",
                    color: C.text1, borderRadius: 10, padding: 7, cursor: "pointer",
                    fontFamily: "inherit", textAlign: rtl ? "right" : "left",
                    boxShadow: selected ? `0 0 0 3px ${C.accent}18` : "none" }}>
                  <div style={{ borderRadius: 7, overflow: "hidden", background: "transparent" }}>
                    <ThumbPreview tp={tp} isMobile={isMobile} resumeResult={liveData} resumeRtl={documentRtl} resumeLang={docLang} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8,
                    minHeight: 18, justifyContent: "space-between" }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 850 }}>
                      {tp.name}
                    </span>
                    {selected && <LineIcon name="check" size={14} color={C.accent2} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, flexWrap: "wrap", marginTop: 2 }}>
            <span style={{ color: C.text3, fontSize: 11.5 }}>
              {builderText("selectedTemplateName", { template: tpl?.name || recommendedTemplate?.name || "" })}
            </span>
            <button type="button" onClick={() => setPostImportTemplatePickerOpen(false)}
              style={{ minHeight: 38, border: "none", borderRadius: 9, background: C.grad,
                color: "#fff", padding: "0 14px", fontSize: 12.5, fontWeight: 900,
                cursor: "pointer", fontFamily: "inherit" }}>
              {bu.keepThisDesign}
            </button>
          </div>
        </section>
      )}

      <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "minmax(420px, 45%) minmax(520px, 55%)",
        gap: 18, flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
        <div className="ac-panel-scrollbar" style={{ minWidth: 0, ...(isMobile ? { width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "10px 8px 84px", display: mobileResumeMode === "edit" ? "block" : "none" } : { overflowY: "auto", height: "100%",
          padding: "12px 14px 28px" }) }}>
          {!guidanceDismissed && !readyForReview && nextChecklistItem && (
            <button type="button"
              onClick={() => nextChecklistItem.target && scrollToError(nextChecklistItem.target)}
              style={{ width: "100%", textAlign: rtl ? "right" : "left", background: "transparent", border: "none",
                color: C.text3, fontSize: 12.5, lineHeight: 1.45, padding: "0 2px 8px", cursor: nextChecklistItem.target ? "pointer" : "default",
                fontFamily: "inherit" }}>
              <span style={{ color: C.accent2, fontWeight: 800 }}>{builderText("suggestedNextStep")}:</span> {nextChecklistItem.label}
            </button>
          )}

          {/* ── SECTION: Personal Info ── */}
          <FieldCard icon="👤" title={builderText("personalInfo")} rtl={rtl} eui={eui}
            collapsed={!!collapsedSections.personal} onToggleCollapse={() => toggleSectionCollapse("personal")}>

          {/* Photo upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
            padding: "14px 16px", background: C.elevated, border: "none",
            borderRadius: 10 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              overflow: "hidden", background: C.surface, outline: `2px dashed ${photoUrl ? tpl.accent : "rgba(148,163,184,0.22)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "outline-color 0.2s" }}>
              {photoUrl
                ? <img src={photoUrl} alt={builderText("profilePhoto")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22, opacity: 0.3 }}>👤</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text1, marginBottom: 4 }}>
                {builderText("profilePhoto")} <span style={{ color: C.text3, fontWeight: 400 }}>{builderText("photoOptional")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <label htmlFor="photo-upload"
                  style={{ cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.accent2,
                    padding: "5px 12px", borderRadius: 4, border: "none",
                    background: `${C.accent}10`, display: "inline-block" }}>
                  {photoUrl ? builderText("photoChange") : builderText("photoUpload")}
                </label>
                <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload} style={{ display: "none" }} />
                {photoUrl && (
                  <button onClick={() => setPhotoUrl(null)}
                    style={{ fontSize: 12, color: "#f87171", background: "none", border: "none",
                      cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    {builderText("photoRemove")}
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 5 }}>
                {builderText("photoHint")}
              </div>
            </div>
          </div>

          <div data-field-wrap="">
            <label htmlFor="field-name" style={lbl}>{t.name} <span style={{ color: "#f87171" }}>*</span></label>
            <IconInput icon="✏️">
              <input id="field-name" value={form.name} onChange={onNameChange}
                placeholder={t.placeholderName}
                style={{ ...inputStyle, ...(nameError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
            </IconInput>
            {nameError && <p style={fieldErr}>{nameError}</p>}
          </div>
          <label htmlFor="field-title" style={lbl}>{t.title}</label>
          <IconInput icon="💼">{field("title", false, t.placeholderTitle, undefined, titleError)}</IconInput>
          {titleError && <p style={fieldErr}>{titleError}</p>}

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex: 1 }} data-field-wrap="">
              <label htmlFor="field-email" style={lbl}>{t.email}</label>
              <IconInput icon="✉️">
                <input id="field-email" value={form.email} onChange={onEmailChange}
                  onBlur={() => setEmailError(validateEmail(form.email))}
                  placeholder={t.placeholderEmail}
                  style={{ ...inputStyle, ...(emailError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
              </IconInput>
              {emailError && <p style={fieldErr}>{emailError}</p>}
            </div>
            <div style={{ flex: 1 }} data-field-wrap="">
              <label htmlFor="field-phone" style={lbl}>{t.phone}</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select aria-label={builderText("countryCode")} value={phoneCode} onChange={(e) => {
                  const newCode = e.target.value;
                  setPhoneCode(newCode);
                  if (form.phone.trim()) setPhoneError(validatePhone(form.phone, newCode));
                }} style={codeSelect}>
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input id="field-phone" value={form.phone} onChange={onPhoneChange}
                  onBlur={() => setPhoneError(validatePhone(form.phone))}
                  placeholder={t.placeholderPhone}
                  style={{ ...inputStyle, flex: 1, ...(phoneError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
              </div>
              {phoneError && <p style={fieldErr}>{phoneError}</p>}
            </div>
          </div>

          <label htmlFor="field-location" style={lbl}>{t.location}</label>
          <IconInput icon="📍">{field("location", false, t.placeholderLocation, undefined, locationError)}</IconInput>
          {locationError && <p style={fieldErr}>{locationError}</p>}

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row", marginTop: 0 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="field-linkedin" style={lbl}>{t.linkedin}</label>
              <IconInput icon="🔗">{field("linkedin", false, t.placeholderLinkedin)}</IconInput>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="field-website" style={lbl}>{t.website}</label>
              <IconInput icon="🌐">{field("website", false, t.placeholderWebsite)}</IconInput>
            </div>
          </div>

          </FieldCard>

          {/* ── SECTION: Professional summary ── */}
          <FieldCard icon="📝" title={t.summary} rtl={rtl} eui={eui}
            collapsed={!!collapsedSections.summary} onToggleCollapse={() => toggleSectionCollapse("summary")}>
            {field("summary", true, t.placeholderSummary, undefined, summaryError)}
            {summaryError && <p style={fieldErr}>{summaryError}</p>}
            <Hint text="2–4 sentences. Who you are, your years of experience, and your biggest strength." />
          </FieldCard>

          {weakBullets.length > 0 && !coachOpen && (
            <div style={{ display: "flex", justifyContent: rtl ? "flex-start" : "flex-end", marginTop: 10 }}>
              <button onClick={() => openCoach(0)}
                style={{ fontSize: 11.5, fontWeight: 700, color: C.accent2,
                  background: `${C.accent}14`, border: "none",
                  borderRadius: 999, padding: "3px 12px", cursor: "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                {builderText("coachButton")} · {builderText(weakBullets.length === 1 ? "weakBulletsOne" : "weakBulletsOther", { count: weakBullets.length })}
              </button>
            </div>
          )}
          <div id="field-experience">{renderSection("experience", t.experience)}</div>
          {experienceError && <p style={fieldErr}>{experienceError}</p>}

          {/* ── Achievement Coach Panel ── */}
          {coachOpen && (() => {
            const ctx = detectCoachContext(coachBullet);
            const questions = COACH_QUESTIONS[ctx] || COACH_QUESTIONS.general;
            return (
              <div style={{ background: C.elevated, border: "none", boxShadow: `inset 3px 0 0 ${C.accent}`,
                borderRadius: 12, padding: "18px 20px", marginTop: 8 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.accent2,
                        textTransform: "uppercase", letterSpacing: "1px" }}>
                        {builderText("coachImprove")}
                      </div>
                      {weakBullets.length > 1 && (
                        <span style={{ fontSize: 10.5, color: C.text3 }}>
                          {coachBulletIdx + 1} / {weakBullets.length}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.text3, marginBottom: 10, lineHeight: 1.5 }}>
                      {builderText("coachDisclaimer")}
                    </div>
                    <div style={{ fontSize: 12.5, color: C.text2, background: C.bg,
                      border: "none", borderRadius: 6, padding: "6px 10px",
                      fontStyle: "italic" }}>
                      "{coachBullet.trim()}"
                    </div>
                  </div>
                  <button onClick={() => setCoachOpen(false)} aria-label={builderText("closeAchievementCoach")}
                    style={{ background: "none", border: "none", color: C.text3,
                      cursor: "pointer", fontSize: 16, padding: "0 0 0 12px", lineHeight: 1 }}>✕</button>
                </div>

                {/* ATRNI framework label */}
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {["Action", "Task", "Result", "Number", "Impact"].map((f, i) => (
                    <span key={f} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 999, background: `${C.accent}${["22","1a","14","0e","08"][i]}`,
                      border: "none", color: C.accent2, letterSpacing: "0.5px" }}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {questions.map(q => (
                    <div key={q.id}>
                      <label style={{ ...lbl, marginBottom: 4, fontSize: 12, color: C.text2 }}>{q.label}</label>
                      <input
                        value={coachAnswers[q.id] || ""}
                        onChange={e => setCoachAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder={q.ph}
                        style={{ ...inputStyle, fontSize: 12.5, padding: "7px 10px" }} />
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <button
                  disabled={coachLoading}
                  onClick={async () => {
                    setCoachLoading(true);
                    setCoachResult("");
                    try {
                      const extras = Object.entries(coachAnswers)
                        .filter(([, v]) => v?.trim())
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("\n");
                      const text = await callAi("rewrite-achievement", coachBullet, docLang || "en", extras);
                      setCoachResult(text);
                    } catch {
                      const bullet = buildStrongBullet(coachBullet, coachAnswers, ctx);
                      setCoachResult(bullet);
                    } finally {
                      setCoachLoading(false);
                    }
                  }}
                  style={{ width: "100%", padding: "9px 0", background: C.grad, color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: coachLoading ? "not-allowed" : "pointer", opacity: coachLoading ? 0.7 : 1,
                    fontFamily: "inherit", marginBottom: coachResult ? 12 : 0 }}>
                  {coachLoading ? builderText("coachCreating") : builderText("coachCreate")}
                </button>

                {/* Result */}
                {coachResult && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text3,
                      textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                      {builderText("coachSuggested")}
                    </div>
                    <div style={{ background: `${C.accent}0a`, border: "none",
                      borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                      <textarea
                        value={coachResult}
                        onChange={e => setCoachResult(e.target.value)}
                        rows={2}
                        style={{ ...inputStyle, fontSize: 13, background: "transparent",
                          border: "none", padding: 0, resize: "vertical", boxShadow: "none",
                          outline: "none", color: C.text1, width: "100%", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={applyCoachResult}
                        style={{ flex: 1, padding: "8px 0", background: C.grad, color: "#fff",
                          border: "none", borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit" }}>
                        {builderText("coachAccept")}
                      </button>
                      <button onClick={() => { setCoachResult(""); setCoachAnswers({}); }}
                        style={{ padding: "8px 14px", background: C.surface,
                          border: "none", borderRadius: 7, fontSize: 12,
                          color: C.text2, cursor: "pointer", fontFamily: "inherit" }}>
                        {builderText("coachRetry")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div id="field-education">{renderSection("education", t.education)}</div>
          {educationError && <p style={fieldErr}>{educationError}</p>}

          {/* ── SECTION: Skills & Languages ── */}
          <SectionHeader icon="⚡" title={builderText("skillsAndLanguages")} filled={!!form.skills} filledLabel={builderText("filledBadge")} />
          <div id="field-skills">{renderSection("skills", t.skills.replace(/\s*\(.*\)/, ""))}</div>
          {skillsError && <p style={fieldErr}>{skillsError}</p>}
          {renderSection("languages", t.languages.replace(/\s*\(.*\)/, ""))}

          {/* ── Added optional sections ── */}
          {(form.addedSections || []).map((key) => (
            <div key={key}>{renderSection(key, sectionName(key))}</div>
          ))}

          {/* ── Add content ── */}
          <div style={{ display: "flex", justifyContent: rtl ? "flex-start" : "flex-end", marginTop: 16 }}>
            <button type="button" onClick={() => setAddContentOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.surface, color: C.text1,
                border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit" }}>
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1, fontWeight: 800 }}>+</span> {bu.addSection}
            </button>
          </div>
          <AddContentModal open={addContentOpen} onClose={() => setAddContentOpen(false)}
            addedSet={addedSet} onAdd={addSection} sectionName={sectionName} eui={eui} rtl={rtl} isMobile={isMobile} />

          {/* ── ATS Checker Panel ── */}
          {atsOpen && (() => {
            const issues = computeATSIssues();
            const criticals = issues.filter(i => i.level === "critical");
            const warnings  = issues.filter(i => i.level === "warning");
            const infos     = issues.filter(i => i.level === "info");
            const score = scoreFromIssues(issues);
            const band = scoreBand(score);
            const scoreColor = band.color;
            const scoreLabel = band.label;
            const LEVEL_META = {
              critical: { label: "Critical", color: "#f87171", bg: "#f8717110" },
              warning:  { label: "Warning",  color: "#fbbf24", bg: "#fbbf2410" },
              info:     { label: "Info",     color: "#60a5fa", bg: "#60a5fa10" },
            };
            return (
              <div style={{ background: C.elevated, border: "none", boxShadow: `inset 3px 0 0 ${scoreColor}`,
                borderRadius: 12, padding: "18px 20px", marginTop: 20, marginBottom: 4 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{scoreLabel}</div>
                        <div style={{ fontSize: 10.5, color: C.text3 }}>{builderText("atsReadyTitle")}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.text3, maxWidth: 360, lineHeight: 1.5 }}>
                      {builderText("atsReadyDisclaimer")}
                    </div>
                  </div>
                  <button onClick={() => setAtsOpen(false)} aria-label={builderText("closeAtsChecker")}
                    style={{ background: "none", border: "none", color: C.text3,
                      cursor: "pointer", fontSize: 16, padding: "0 0 0 12px", lineHeight: 1 }}>✕</button>
                </div>

                {/* Score bar */}
                <div style={{ height: 6, borderRadius: 999, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${score}%`, background: scoreColor,
                    borderRadius: 999, transition: "width 0.5s ease" }} />
                </div>

                {issues.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#4ade80", fontSize: 14, fontWeight: 700 }}>
                    {builderText("atsNoIssues")}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {issues.map((issue, idx) => {
                      const meta = LEVEL_META[issue.level];
                      return (
                        <div key={idx} style={{ background: meta.bg, border: "none",
                          borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{issue.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: meta.color,
                                  textTransform: "uppercase", letterSpacing: "0.8px",
                                  background: `${meta.color}20`, borderRadius: 999, padding: "1px 6px" }}>
                                  {meta.label}
                                </span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text1 }}>{issue.title}</span>
                              </div>
                              <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.55, margin: "0 0 6px" }}>
                                {issue.detail}
                              </p>
                              {issue.fix && issue.fixFn && (
                                <button onClick={issue.fixFn}
                                  style={{ fontSize: 11.5, fontWeight: 700, color: meta.color,
                                    background: `${meta.color}18`, border: "none",
                                    borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                                    fontFamily: "inherit" }}>
                                  → {issue.fix}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary counts */}
                {issues.length > 0 && (
                  <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 12,
                    borderTop: `1px solid ${SECTION_TOKENS.rowDivider}`, flexWrap: "wrap" }}>
                    {criticals.length > 0 && <span style={{ fontSize: 11.5, color: "#f87171", fontWeight: 700 }}>● {criticals.length} {builderText("atsCritical")}</span>}
                    {warnings.length  > 0 && <span style={{ fontSize: 11.5, color: "#fbbf24", fontWeight: 700 }}>● {warnings.length} {builderText("atsWarnings")}</span>}
                    {infos.length     > 0 && <span style={{ fontSize: 11.5, color: "#60a5fa", fontWeight: 700 }}>● {infos.length} {builderText("atsInfo")}</span>}
                    <span style={{ fontSize: 11.5, color: C.text3, marginLeft: "auto" }}>
                      {builderText("atsStartCritical")}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Follow-up actions ── */}
          <div style={{ marginTop: 28, padding: "14px 0 4px" }}>
            {exportSuccess && (
              <div style={{ marginTop: 10, background: "#4ade8012", border: "none",
                color: "#4ade80", borderRadius: 8, padding: "9px 11px", fontSize: 12.5,
                lineHeight: 1.5 }}>
                {exportSuccess} <React.Suspense fallback={null}><TrackApplicationAction locale={lang} form={form} template={tpl} documentLanguage={docLang} resumeId={currentResumeId} untitled={bu.untitledResume} onOpen={(card) => { setTrackerModal({ open: true, card }); setNavPage("tracker"); }} /></React.Suspense>
              </div>
            )}
            {result && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => { setNavPage("cover"); setCoverStep("form"); }}
                    style={{ ...dlBtn, flex: 1, justifyContent: "center", display: "flex",
                    alignItems: "center", gap: 5, padding: "10px 8px", fontSize: 13 }}>
                  {builderText("atsCreateCover")}
                </button>
                <button onClick={() => setAtsOpen(true)}
                  style={{ ...dlBtn, flex: 1, justifyContent: "center", display: "flex",
                    alignItems: "center", gap: 5, padding: "10px 8px", fontSize: 13 }}>
                  {builderText("atsReviewTips")}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── Preview column ── */}
        <div className="ac-panel-scrollbar" style={{ minWidth: 0, ...(isMobile ? { width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "10px 8px 84px", marginTop: 0, display: mobileResumeMode === "preview" ? "block" : "none" } : { overflowY: "auto", height: "100%",
          padding: "12px 14px 28px" }) }}>
          <PreviewPane
            ref={resumePrintRef}
            rtl={documentRtl}
            badge={
              <span style={{ ...badge, ...(aiPolished ? badgePolished : badgeLive),
                background: "transparent",
                color: aiPolished ? tpl.accent : C.text3 }}>
                {aiPolished ? `✦ ${bu.aiPolished}` : `● ${bu.livePreview}`}
              </span>
            }
            labels={{
              controls: builderText("previewControls"), zoomOut: builderText("zoomPreviewOut"),
              zoomIn: builderText("zoomPreviewIn"), fit: bu.fit, expand: builderText("expandPreview"),
              close: builderText("closeExpandedPreview"), expandedTitle: builderText("expandedPreview"),
            }}
            overlay={result ? (
              <button onClick={(e) => { e.stopPropagation(); copyOut(); }} style={copyBtn}>
                {copied ? t.copied : t.copy}
              </button>
            ) : null}
          >
            <ResumePaper tpl={tpl} result={result || liveData} rtl={documentRtl} lang={docLang} uiLang={lang} placeholder={false} />
          </PreviewPane>
        </div>
      </div>
      {translationDuplicate.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-translation-duplicate-title"
          onClick={() => setTranslationDuplicate({ open: false, existingId: "", target: null })}
          style={{ position: "fixed", inset: 0, zIndex: 9600, background: "rgba(0,0,0,0.62)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "min(560px, 100%)", background: C.surface, color: C.text1, borderRadius: 14,
              boxShadow: "0 26px 80px rgba(0,0,0,0.52)", padding: 20, direction: rtl ? "rtl" : "ltr" }}>
            <h2 id="resume-translation-duplicate-title" style={{ margin: 0, fontSize: 18, lineHeight: 1.25 }}>
              {translateLabel(bu.existingTranslationTitle, { language: translationTargetLabel(translationDuplicate.target) })}
            </h2>
            <p style={{ margin: "10px 0 16px", color: C.text2, fontSize: 13.5, lineHeight: 1.55 }}>
              {bu.existingTranslationBody}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={() => {
                  const existingId = translationDuplicate.existingId;
                  setTranslationDuplicate({ open: false, existingId: "", target: null });
                  if (existingId) openResume(existingId);
                }}
                style={{ border: "none", background: C.grad, color: "#fff", borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.openExistingTranslation}
              </button>
              <button type="button" onClick={() => {
                  setTranslationDuplicate({ open: false, existingId: "", target: null });
                  requestResumeTranslation({ allowDuplicate: true });
                }}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.createAnotherTranslation}
              </button>
              <button type="button" onClick={() => {
                  setTranslationDuplicate({ open: false, existingId: "", target: null });
                  setTranslationConfirm({
                    open: true,
                    target: translationDuplicate.target || selectedDocumentLang || languageByCode(docLang),
                    kind: "resume",
                    retranslate: true,
                    sourceResumeId: currentResumeId,
                    error: "",
                  });
                }}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.retranslateFromOriginal}
              </button>
            </div>
          </div>
        </div>
      )}
      {translationConfirm.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-translation-confirm-title"
          onClick={() => !translating && setTranslationConfirm({ open: false, target: null, error: "" })}
          style={{ position: "fixed", inset: 0, zIndex: 9600, background: "rgba(0,0,0,0.62)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "min(540px, 100%)", background: C.surface, color: C.text1, borderRadius: 14,
              boxShadow: "0 26px 80px rgba(0,0,0,0.52)", padding: 20, direction: rtl ? "rtl" : "ltr" }}>
            <h2 id="resume-translation-confirm-title" style={{ margin: 0, fontSize: 18, lineHeight: 1.25 }}>
              {translationConfirm.retranslate
                ? bu.retranslateFromOriginal
                : translateLabel(translationConfirm.kind === "cover" ? cu.translateContentButton : bu.translateContentButton, { language: translationTargetLabel(translationConfirm.target) })}
            </h2>
            <p style={{ margin: "10px 0 16px", color: C.text2, fontSize: 13.5, lineHeight: 1.55 }}>
              {translationConfirm.retranslate
                ? bu.retranslateConfirm
                : translationConfirm.kind === "cover" ? cu.translateContentConfirm : bu.translateContentConfirm}
            </p>
            {translationConfirm.error && (
              <div role="alert" style={{ margin: "0 0 14px", background: "#ef444418", border: "1px solid #ef444455",
                color: C.text1, borderRadius: 10, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.45 }}>
                {translationConfirm.error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setTranslationConfirm({ open: false, target: null, error: "" })} disabled={translating}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: translating ? "not-allowed" : "pointer", fontFamily: "inherit",
                  opacity: translating ? 0.7 : 1 }}>
                {bu.translateContentCancelButton}
              </button>
              <button type="button" onClick={translationConfirm.kind === "cover" ? translateCoverLetter : translateCV} disabled={translating}
                style={{ border: "none", background: C.grad, color: "#fff", borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: translating ? "wait" : "pointer", fontFamily: "inherit" }}>
                {translating ? bu.translatingContentButton : bu.translateContentConfirmButton}
              </button>
            </div>
          </div>
        </div>
      )}
      {translationReview.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-translation-review-title"
          onClick={clearTranslationReview}
          style={{ position: "fixed", inset: 0, zIndex: 9550, background: "rgba(0,0,0,0.62)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "min(860px, 100%)", maxHeight: "88vh", overflowY: "auto", background: C.surface, color: C.text1,
              borderRadius: 14, boxShadow: "0 26px 80px rgba(0,0,0,0.52)", padding: 20, direction: rtl ? "rtl" : "ltr" }}>
            <h2 id="resume-translation-review-title" style={{ margin: 0, fontSize: 18, lineHeight: 1.25 }}>
              {bu.reviewTranslatedTitle}
            </h2>
            <p style={{ margin: "10px 0 14px", color: C.text2, fontSize: 13.5, lineHeight: 1.5 }}>
              {bu.reviewTranslatedIntro}
            </p>
            {translationReview.warning && (
              <div role="status" style={{ margin: "0 0 14px", background: "#f59e0b18", border: "1px solid #f59e0b55",
                color: C.text1, borderRadius: 10, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.45 }}>
                {translationReview.warning}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {translationReview.fields.slice(0, 4).map((key) => (
                <React.Fragment key={key}>
                  <div style={{ background: C.elevated, borderRadius: 10, padding: 12 }}>
                    <div style={{ color: C.text3, fontSize: 11.5, fontWeight: 900, marginBottom: 6 }}>
                      {bu.originalText} · {sectionName(key)}
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: C.text2, fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.55 }}>
                      {translationReview.original?.[key] || ""}
                    </pre>
                  </div>
                  <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}22`, borderRadius: 10, padding: 12 }}>
                    <div style={{ color: C.accent2, fontSize: 11.5, fontWeight: 900, marginBottom: 6 }}>
                      {bu.translatedText} · {sectionName(key)}
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: C.text2, fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.55 }}>
                      {translationReview.translated?.[key] || ""}
                    </pre>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" onClick={clearTranslationReview}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.keepOriginal}
              </button>
              <button type="button" onClick={() => { useTranslatedResumeCopy(); setMobileResumeMode("edit"); }}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.editTranslation}
              </button>
              <button type="button" onClick={() => { clearTranslationReview(); requestResumeTranslation(); }}
                style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.retranslate}
              </button>
              <button type="button" onClick={useTranslatedResumeCopy}
                style={{ border: "none", background: C.grad, color: "#fff", borderRadius: 9,
                  padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                {bu.acceptTranslation}
              </button>
            </div>
          </div>
        </div>
      )}
      {reviewModal.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-export-review-title"
          onClick={() => setReviewModal({ open: false, format: "", warnings: [] })}
          style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(0,0,0,0.62)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "min(520px, 100%)", background: C.surface, color: C.text1, borderRadius: 14,
              boxShadow: "0 26px 80px rgba(0,0,0,0.52)", padding: 20, direction: rtl ? "rtl" : "ltr" }}>
            <h2 id="resume-export-review-title" style={{ margin: 0, fontSize: 18, lineHeight: 1.25 }}>
              {reviewUi.title}
            </h2>
            <p style={{ margin: "10px 0 14px", color: C.text2, fontSize: 13.5, lineHeight: 1.5 }}>
              {reviewUi.intro}
            </p>
            <ul style={{ margin: "0 0 18px", paddingInlineStart: 20, color: C.text2, fontSize: 13, lineHeight: 1.55 }}>
              {reviewModal.warnings.map((warning, index) => (
                <li key={`${warning.type}-${index}`}>{qualityReviewText(lang, warning)}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={() => {
                setReviewModal({ open: false, format: "", warnings: [] });
                setMobileResumeMode("edit");
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
              }} style={{ border: "none", background: C.elevated, color: C.text1, borderRadius: 9,
                padding: "10px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {reviewUi.review}
              </button>
              <button type="button" onClick={() => {
                const format = reviewModal.format;
                setReviewModal({ open: false, format: "", warnings: [] });
                if (format === "docx") downloadDOCX({ skipReview: true });
                else downloadPDF({ skipReview: true });
              }} style={{ border: "none", background: C.grad, color: "#fff", borderRadius: 9,
                padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                {reviewUi.download}
              </button>
            </div>
          </div>
        </div>
      )}
      {isMobile && (
        <div ref={mobileResumeToolbarRef} style={{ position: "sticky", bottom: 0, zIndex: 20, margin: "12px -4px -8px",
          padding: "10px 12px", background: `${C.bg}f2`, backdropFilter: "blur(10px)",
          boxShadow: "0 -12px 28px rgba(0,0,0,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8 }}>
          <button onClick={() => setMobileResumeMode(mobileResumeMode === "edit" ? "preview" : "edit")}
            style={{ border: "none", background: C.surface, color: C.text1,
              borderRadius: 8, padding: "10px 6px", fontSize: 12, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 4 }}>
            {mobileResumeMode === "edit" ? bu.preview : bu.edit}
          </button>
          <button onClick={() => toggleToolbarPanel("e")} disabled={!!exporting}
            aria-haspopup="menu" aria-expanded={activeToolbarPanel === "e"} aria-controls="p-e"
            style={{ border: "none", background: C.grad, color: "#fff",
              borderRadius: 8, padding: "10px 6px", fontSize: 12, fontWeight: 800,
              cursor: exporting ? "not-allowed" : "pointer", fontFamily: "inherit",
              opacity: exporting ? 0.7 : 1 }}>
            {exporting ? bu.exportingBtn : bu.exportBtn}
          </button>
        </div>
      )}
    </div>
  ) : null;

  // ── Cover letter helpers ──────────────────────────────────────────
  const coverField = (key, multiline, ph, icon) => {
    const control = multiline ? (
      <>
        <CoverFormattingBar fieldKey={key} />
        <textarea id={`cover-field-${key}`} value={coverForm[key]} onChange={e => setCoverForm(f => ({ ...f, [key]: e.target.value }))}
          dir={documentRtl ? "rtl" : "ltr"}
          placeholder={ph} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 90 }} />
      </>
    ) : (
      <input id={`cover-field-${key}`} value={coverForm[key]} onChange={e => setCoverForm(f => ({ ...f, [key]: e.target.value }))}
        dir={documentRtl ? "rtl" : "ltr"}
        placeholder={ph} style={inputStyle} />
    );
    return icon && !multiline ? <IconInput icon={icon}>{control}</IconInput> : control;
  };

  async function translateCoverLetter() {
    if (translating) return;
    const confirm = translationConfirm;
    const langCode = confirm.target?.code || docLang || "en";
    const targetName = translationLanguageName(langCode);
    const contentKeys = ["jobTitle", "subject", "opening", "body", "closing", "signoff"];
    const content = Object.fromEntries(contentKeys.filter((key) => coverForm[key]?.trim()).map((key) => [key, coverForm[key]]));
    if (!Object.keys(content).length) {
      const message = statusText("translateNoContent");
      setTranslationConfirm((current) => ({ ...current, error: message }));
      setStatusMsg(message);
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }
    setTranslationConfirm((current) => ({ ...current, error: "" }));
    setTranslating(true);
    setStatusMsg(statusText("translateStarted"));
    try {
      const { extractProtectedTerms, parseTranslationJson, translateDocumentContent } = await import("./translation.js");
      const protectedTerms = Array.from(new Set(Object.values(content).flatMap((value) => extractProtectedTerms(value))));
      const request = {
        type: "cover_letter",
        sourceLanguage: "auto",
        targetLanguage: langCode,
        targetLanguageName: targetName,
        preserveTerms: protectedTerms,
        content,
      };
      const response = await translateDocumentContent({
        documentType: "coverLetter",
        sourceLanguage: request.sourceLanguage,
        targetLanguage: langCode,
        protectedTerms,
        payload: content,
        devBypassToken: translationDevBypass.token,
        devBypassHeader: translationDevBypass.header,
      });
      const translated = parseTranslationJson(JSON.stringify(response.document), contentKeys);
      const translatedAt = new Date().toISOString();
      setCoverForm((f) => ({
        ...f,
        ...translated,
        translationMeta: {
          sourceLanguage: "auto",
          targetLanguage: langCode,
          targetLanguageName: targetName,
          translatedAt,
          fields: Object.fromEntries(Object.keys(translated).map((key) => [key, {
            translationStatus: TRANSLATION_STATUSES.aiTranslated,
            sourceLanguage: "auto",
            targetLanguage: langCode,
            translatedAt,
          }])),
        },
      }));
      setTranslationConfirm({ open: false, target: null, error: "" });
      setStatusMsg(statusText("translateSuccess"));
      setTimeout(() => setStatusMsg(""), 4500);
    } catch (error) {
      const message = translationErrorMessage(error);
      setTranslationConfirm((current) => ({ ...current, error: message }));
      setStatusMsg(message);
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setTranslating(false);
    }
  }

  async function downloadCoverPDF() {
    if (!coverTpl) return;
    if (exporting) return;
    if (documentRtl) {
      setExporting("pdf");
      track(EVENTS.PDF_EXPORT_STARTED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", document_direction: "rtl" });
      try {
        await exportVisualPdf(coverPrintRef, coverForm.name || "cover-letter", "cover");
        setExportSuccess(st.pdfSuccess);
        setStatusMsg(st.pdfDownloaded);
        track(EVENTS.PDF_EXPORT_COMPLETED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", export_type: "visual_pdf" });
        if (docLang !== lang) track(EVENTS.MULTILINGUAL_COVER_LETTER_EXPORTED, { language: docLang, interface_language: lang, export_type: "pdf", template: coverTpl?.id || "" });
        setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
      } catch {
        setStatusMsg(st.pdfFail);
        track(EVENTS.PDF_EXPORT_FAILED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", export_type: "visual_pdf" });
        setTimeout(() => setStatusMsg(""), 3500);
      } finally {
        setExporting("");
      }
      return;
    }
    setExporting("pdf");
    try {
      track(EVENTS.PDF_EXPORT_STARTED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", document_direction: "ltr" });
      const { default: jsPDF } = await import("jspdf");
      const d = coverForm;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = 210; const margin = 20; const colW = pageW - 2 * margin;
      let y = margin;
      const safe = pdfSafe;
      if (containsNonLatin1([d.name, d.jobTitle, d.body, d.opening, d.closing].join(" "))) {
        setStatusMsg(st.pdfNonLatin);
        setTimeout(() => setStatusMsg(""), 6000);
      }
      const checkY = (h = 10) => { if (y + h > 277) { doc.addPage(); y = margin; } };
      const coverAccent = accentOnPaper(coverTpl.accent);
      const [ar, ag, ab] = [
        parseInt(coverAccent.slice(1,3),16),
        parseInt(coverAccent.slice(3,5),16),
        parseInt(coverAccent.slice(5,7),16),
      ];
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(17,17,17);
      doc.text(safe(d.name), margin, y); y += 7;
      if (d.jobTitle) { doc.setFont("helvetica","italic"); doc.setFontSize(11); doc.setTextColor(ar,ag,ab); doc.text(safe(d.jobTitle), margin, y); y += 5; }
      if ([d.email, d.phone, d.location].filter(Boolean).length) {
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
        y += drawPdfContactItems(doc, [d.email, d.phone, d.location], {
          x: pageW / 2,
          y,
          maxWidth: pageW - margin * 2,
          separator: "   ·   ",
          lineHeight: 4.5,
          color: [120, 120, 120],
          safe,
        }) + 0.5;
      }
      doc.setDrawColor(ar,ag,ab); doc.setLineWidth(0.4); doc.line(margin, y, pageW-margin, y); y += 7;
      if (d.date) { doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(100,100,100); doc.text(safe(d.date), margin, y); y += 6; }
      if (d.recipientName) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(30,30,30); doc.text(safe(d.recipientName), margin, y); y += 5; }
      if (d.recipientTitle) { doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.text(safe(d.recipientTitle), margin, y); y += 5; }
      if (d.company) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(ar,ag,ab); doc.text(safe(d.company), margin, y); y += 5; }
      if (d.companyAddress) { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(107, 114, 128); doc.text(safe(d.companyAddress), margin, y); y += 6; }
      y += 2;
      if (d.subject) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(30,30,30); doc.text(`Re: ${safe(d.subject)}`, margin, y); y += 6; }
      if (d.opening) { doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(50,50,50); doc.text(`Dear ${safe(d.opening)},`, margin, y); y += 8; }
      for (const para of [d.body, d.closing].filter(Boolean)) {
        for (const block of para.split("\n\n").filter(Boolean)) {
          checkY(10); doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(55,55,55);
          const lines = doc.splitTextToSize(safe(block), colW);
          checkY(lines.length * 5 + 4); doc.text(lines, margin, y); y += lines.length * 5 + 5;
        }
      }
      y += 4;
      doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(50,50,50);
      doc.text(safe(d.signoff || defaultCoverSignoff(docLang)), margin, y); y += 14;
      doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(17,17,17);
      doc.text(safe(d.name), margin, y);
      // Footer on every page: name (left) | page X / Y (right)
      const pageW2 = 210;
      const totalPages2 = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages2; i++) {
        doc.setPage(i);
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(margin, 286, pageW2 - margin, 286);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128); // paperMuted, AA on white
        doc.text(safe(d.name || ""), margin, 291);
        doc.text(`${i} / ${totalPages2}`, pageW2 - margin, 291, { align: "right" });
      }

      doc.save(`${sanitizeFilename(safe(d.name || "cover-letter"), "cover-letter")}-cover-letter.pdf`);
      setExportSuccess(st.pdfSuccess);
      setStatusMsg(st.pdfDownloaded);
      track(EVENTS.PDF_EXPORT_COMPLETED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", export_type: "jspdf" });
      if (docLang !== lang) track(EVENTS.MULTILINGUAL_COVER_LETTER_EXPORTED, { language: docLang, interface_language: lang, export_type: "pdf", template: coverTpl?.id || "" });
      setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
    } catch {
      setStatusMsg(st.pdfFail);
      track(EVENTS.PDF_EXPORT_FAILED, { document_type: "cover", language: docLang, template: coverTpl?.id || "", export_type: "jspdf" });
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setExporting("");
    }
  }

  async function downloadCoverDOCX() {
    if (!coverTpl || exporting) return;
    const d = coverForm;
    setExporting("docx");
    setExportSuccess("");
    try {
      track(EVENTS.DOCX_EXPORT_STARTED, { document_type: "cover", language: docLang, template: coverTpl?.id || "" });
      const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, ExternalHyperlink } = await import("docx");
      const accent = accentOnPaper(coverTpl.accent).replace("#", "").toUpperCase();
      const docxRtl = isRtlLang(docLang);
      const docxAlignment = docxRtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
      const docxFont = docxRtl ? "Noto Sans Arabic" : "Aptos";
      const makeRun = (options = {}) => new TextRun({
        font: docxFont,
        rightToLeft: docxRtl,
        ...options,
      });
      const makeLinkedRuns = (text, options = {}) => linkifyText(text).map((part) => {
        if (part.type !== "link") return makeRun({ text: part.text, ...options });
        return new ExternalHyperlink({
          link: part.href,
          children: [makeRun({
            text: part.text,
            color: accent,
            underline: {},
            ...options,
          })],
        });
      });
      const makeParagraph = (options = {}) => new Paragraph({
        alignment: options.alignment || docxAlignment,
        bidirectional: docxRtl,
        ...options,
      });
      const addTextParagraph = (children, text, options = {}) => {
        if (!String(text || "").trim()) return;
        children.push(makeParagraph({
          children: makeLinkedRuns(String(text), options.run || {}),
          spacing: options.spacing || { after: 100 },
          ...options.paragraph,
        }));
      };

      const children = [];
      addTextParagraph(children, d.name || "Cover Letter", {
        run: { bold: true, size: 34, color: "111111" },
        spacing: { after: 60 },
      });
      addTextParagraph(children, d.jobTitle, {
        run: { size: 22, color: accent },
        spacing: { after: 60 },
      });
      addTextParagraph(children, [d.email, d.phone, d.location].filter(Boolean).join("   •   "), {
        run: { size: 18, color: "666666" },
        spacing: { after: 120 },
      });
      children.push(makeParagraph({
        border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { after: 180 },
      }));
      addTextParagraph(children, d.date, { run: { size: 20, color: "666666" } });
      addTextParagraph(children, d.recipientName, { run: { bold: true, size: 20, color: "111111" }, spacing: { after: 40 } });
      addTextParagraph(children, d.recipientTitle, { run: { size: 20 }, spacing: { after: 40 } });
      addTextParagraph(children, d.company, { run: { bold: true, size: 20, color: accent }, spacing: { after: 40 } });
      addTextParagraph(children, d.companyAddress, { run: { size: 18, color: "666666" }, spacing: { after: 140 } });
      addTextParagraph(children, d.subject ? `Re: ${d.subject}` : "", {
        run: { bold: true, size: 20, color: "111111" },
        spacing: { after: 120 },
      });
      addTextParagraph(children, d.opening ? `Dear ${d.opening},` : "", {
        run: { size: 21, color: "333333" },
        spacing: { after: 140 },
      });
      for (const para of [d.body, d.closing].filter(Boolean)) {
        for (const block of String(para).split(/\n\s*\n/).filter(Boolean)) {
          addTextParagraph(children, block, {
            run: { size: 21, color: "333333" },
            spacing: { after: 180 },
          });
        }
      }
      addTextParagraph(children, d.signoff || defaultCoverSignoff(docLang), {
        run: { size: 21, color: "333333" },
        spacing: { before: 120, after: 220 },
      });
      addTextParagraph(children, d.name, {
        run: { bold: true, size: 21, color: "111111" },
        spacing: { after: 60 },
      });

      const docFile = new Document({
        creator: "ApplyCraft",
        description: `${docLang || "en"} cover letter export`,
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children,
        }],
      });
      const blob = await Packer.toBlob(docFile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(d.name || "cover-letter", "cover-letter")}-cover-letter.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(st.docxSuccess);
      setStatusMsg(st.docxDownloaded);
      track(EVENTS.DOCX_EXPORT_COMPLETED, { document_type: "cover", language: docLang, template: coverTpl?.id || "" });
      if (docLang !== lang) track(EVENTS.MULTILINGUAL_COVER_LETTER_EXPORTED, { language: docLang, interface_language: lang, export_type: "docx", template: coverTpl?.id || "" });
      setTimeout(() => { setExportSuccess(""); setStatusMsg(""); }, 4500);
    } catch {
      setStatusMsg(st.docxFail);
      track(EVENTS.DOCX_EXPORT_FAILED, { document_type: "cover", language: docLang, template: coverTpl?.id || "" });
      setTimeout(() => setStatusMsg(""), 3500);
    } finally {
      setExporting("");
    }
  }

  const getCoverTemplateMeta = (template) => {
    const baseMeta = COVER_GALLERY_META[template.id] || (template.variant ? COVER_GALLERY_META[template.variant] : null);
    return {
      description: template.tag || baseMeta?.description || "Professional cover letter layout.",
      attributes: baseMeta?.attributes || ["Professional"],
    };
  };

  const coverTemplatesContent = (
    <div style={{ minHeight: isMobile ? "auto" : "calc(100vh - 32px)", padding: isMobile ? "0 8px 28px" : "0 0 44px" }}>
      <section aria-labelledby="cover-gallery-title" style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 4px 0" : "42px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 0.95fr) minmax(280px, 0.42fr)",
          gap: isMobile ? 18 : 40, alignItems: "end", marginBottom: isMobile ? 22 : 30 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999,
              background: `${C.accent}12`, border: `1px solid ${C.accent}2E`,
              color: C.accent2, padding: "5px 12px", fontSize: 11, fontWeight: 900,
              letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: 14 }}>
              {cu.eyebrow}
            </div>
            <h1 id="cover-gallery-title" style={{ margin: "0 0 12px", color: C.text1,
              fontSize: isMobile ? 30 : 40, lineHeight: 1.08, letterSpacing: "-0.8px", fontWeight: 900 }}>
              {cu.galleryTitle}
            </h1>
            <p style={{ margin: 0, maxWidth: 650, color: C.text2, fontSize: isMobile ? 15 : 16.5, lineHeight: 1.65 }}>
              {cu.gallerySub}
            </p>
          </div>
          <div style={{ display: "grid", gap: 10, justifyContent: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: isMobile ? "flex-start" : "flex-end",
              color: C.text2, fontSize: 13.5 }}>
              <LineIcon name="document" size={16} color={C.accent2} />
              <span>{COVER_TEMPLATE_COUNT} {cu.stylesAvailable}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
              {[bu.livePreview, bu.badgePdf, cu.resumeMatching].map((item) => (
                <span key={item} style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.text3,
                  borderRadius: 999, padding: "6px 10px", fontSize: 12.5, fontWeight: 700 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: isMobile ? 18 : 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: isMobile ? 28 : 42, alignItems: "start" }}>
            {COVER_TEMPLATES.map((tp) => {
              const meta = getCoverTemplateMeta(tp);
              const recommended = tp.id === "modern";
              const selected = coverTpl?.id === tp.id;
              const active = coverTemplateHover === tp.id || coverTemplateFocus === tp.id;
              return (
                <article key={tp.id} aria-labelledby={`cover-template-${tp.id}-title`}
                  onMouseEnter={() => setCoverTemplateHover(tp.id)}
                  onMouseLeave={() => setCoverTemplateHover("")}
                  onFocusCapture={() => setCoverTemplateFocus(tp.id)}
                  onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setCoverTemplateFocus(""); }}
                  style={{ position: "relative", minWidth: 0 }}>
                  <div style={{ position: "relative", borderRadius: 0, overflow: "visible", background: "transparent",
                    border: "none",
                    outline: selected ? `2px solid ${C.accent}` : recommended ? `1px solid ${C.accent}66` : "none",
                    outlineOffset: 4,
                    boxShadow: active || selected ? `0 0 0 4px ${C.accent}18` : "none",
                    transition: "box-shadow 0.2s ease, outline-color 0.2s ease, transform 0.2s ease",
                    transform: active ? "translateY(-3px)" : "none" }}>
                      <CoverThumbPreview tp={tp} isMobile={isMobile} lang={lang} rtl={rtl} />
                      {(selected || recommended) && (
                        <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex",
                          alignItems: "center", gap: 5, color: selected ? "#fff" : C.accent2,
                          background: selected ? C.accent : "rgba(15,23,42,0.84)",
                          border: `1px solid ${selected ? C.accent : `${C.accent}55`}`,
                          borderRadius: 999, padding: "5px 9px", fontSize: 11, fontWeight: 900,
                          boxShadow: "0 10px 24px rgba(0,0,0,0.25)" }}>
                          <LineIcon name="check" size={12} color={selected ? "#fff" : C.accent2} />
                          {selected ? bu.selected : bu.recommended}
                        </span>
                      )}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 10, padding: 16,
                        background: active ? "rgba(2,6,23,0.48)" : "rgba(2,6,23,0)",
                        opacity: isMobile ? 0 : active ? 1 : 0, pointerEvents: isMobile ? "none" : active ? "auto" : "none",
                        transition: "opacity 0.18s ease, background 0.18s ease" }}>
                        <button type="button" onClick={() => { track(EVENTS.TEMPLATE_PREVIEW_OPENED, { template: tp.id }); setCoverTemplatePreview(tp); }}
                          aria-label={builderText("previewCoverTemplate", { template: tp.name })}
                          style={{ minHeight: 40, padding: "0 14px", background: "rgba(15,23,42,0.82)",
                            color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 9,
                            fontSize: 13, fontWeight: 850, cursor: "pointer", fontFamily: "inherit" }}>
                          {bu.preview}
                        </button>
                        <button type="button"
                          aria-label={recommended ? builderText("useRecommendedCoverTemplate") : builderText("useCoverTemplateNamed", { template: tp.name })}
                          onClick={(event) => handleRouteLink(event, () => { track(EVENTS.COVER_STARTED, { template: tp.id }); setCoverTpl(tp); setMobileCoverMode("edit"); setCoverStep("form"); })}
                          style={{ minHeight: 40, padding: "0 15px", background: C.grad, color: "#fff",
                            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 900,
                            cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                          {bu.useTemplate}
                        </button>
                      </div>
                    </div>
                  <div style={{ padding: isMobile ? "12px 2px 0" : "14px 2px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 24 }}>
                      <h2 id={`cover-template-${tp.id}-title`} style={{ margin: 0, color: C.text1,
                        fontSize: 16.5, fontWeight: 800, letterSpacing: "0" }}>{tp.name}</h2>
                      {recommended && !selected && (
                        <span style={{ color: C.accent2, background: `${C.accent}14`,
                          borderRadius: 999, padding: "2px 7px", fontSize: 10.5, fontWeight: 900 }}>
                          {bu.recommended}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "4px 0 0", color: C.text2, fontSize: 13.2, lineHeight: 1.45 }}>{meta.description}</p>
                    {isMobile && (
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button type="button" onClick={() => { track(EVENTS.TEMPLATE_PREVIEW_OPENED, { template: tp.id }); setCoverTemplatePreview(tp); }}
                          aria-label={builderText("previewCoverTemplate", { template: tp.name })}
                          style={{ flex: 1, minHeight: 44, padding: "0 13px", background: "transparent",
                            color: C.text2, border: `1px solid ${C.border}`, borderRadius: 9,
                            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          {bu.preview}
                        </button>
                        <button type="button"
                          aria-label={recommended ? builderText("useRecommendedCoverTemplate") : builderText("useCoverTemplateNamed", { template: tp.name })}
                          onClick={(event) => handleRouteLink(event, () => { track(EVENTS.COVER_STARTED, { template: tp.id }); setCoverTpl(tp); setMobileCoverMode("edit"); setCoverStep("form"); })}
                          style={{ flex: 1, minHeight: 44, background: C.grad, color: "#fff", border: "none",
                            borderRadius: 9, fontSize: 13.5, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                          {bu.useTemplate}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <TemplatePreviewModal
        template={coverTemplatePreview}
        meta={coverTemplatePreview ? getCoverTemplateMeta(coverTemplatePreview) : null}
        onClose={() => setCoverTemplatePreview(null)}
        onUse={(template) => { setCoverTpl(template); setMobileCoverMode("edit"); setCoverStep("form"); }}
        isMobile={isMobile}
        rtl={rtl}
        kind="cover"
        bu={bu}
        coverSample={SAMPLE_COVER_BY_LANG[lang] || SAMPLE_COVER}
        labels={{
          previewEyebrow: builderText("templatePreviewEyebrow"),
          useTemplate: builderText("useThisTemplate"),
          close: builderText("closeTemplatePreview"),
          whyChoose: bu.whyChoose || BUILDER_UI.en.whyChoose,
          templateDetails: builderText("templateDetails"),
        }}
      />
    </div>
  );

  const coverFormContent = coverTpl ? (() => {
    const coverReady = !!coverForm.name.trim();
    const filledCoverFields = ["name", "email", "company", "body"].filter((key) => coverForm[key]?.trim()).length;
    // 3-state status (Not started / Missing / Complete) from whether fields are filled.
    const coverStatus = (fields, required) => {
      const anyFilled = fields.some(k => (coverForm[k] || "").trim());
      if (!anyFilled) return cu.notStarted;
      return required.every(k => (coverForm[k] || "").trim()) ? cu.complete : cu.missing;
    };
    const cov = (key) => ({ collapsed: !!coverCollapsed[key], onToggleCollapse: () => toggleCoverCollapse(key), eui, rtl });

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%",
        boxSizing: "border-box", padding: isMobile ? "8px 4px" : "10px 16px" }}>
        <div className="ac-app-header" style={{ position: "sticky", top: HEADER_HEIGHT, zIndex: 60, margin: isMobile ? "-8px -4px 12px" : "-10px -16px 14px",
          height: isMobile ? "auto" : HEADER_HEIGHT, boxSizing: "border-box",
          padding: isMobile ? "10px 12px" : "0 18px", background: `${C.bg}f4`, backdropFilter: "blur(14px)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <button onClick={() => setCoverStep("templates")} aria-label={bu.backToTemplates}
            style={{ ...ghostIconBtn, margin: 0, fontSize: 18 }}>←</button>
          <div style={{ minWidth: 0, flex: "1 1 220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <h1 style={{ margin: 0, color: C.text1, fontSize: isMobile ? 16 : 18, lineHeight: 1.15,
                fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cu.heading}
              </h1>
              <span style={{ color: C.text3, fontSize: 11.5, whiteSpace: "nowrap" }}>· {cu.draft}</span>
            </div>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, color: C.text3, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: coverTpl.accent, flexShrink: 0 }} />
                <span>{coverTpl.name}</span>
                <span>·</span>
                <span>{filledCoverFields}/4 {cu.essentials}</span>
              </div>
            )}
          </div>
          <div ref={coverToolbarRef} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setActiveToolbarPanel(null); setCoverStep("templates"); }} style={{ ...softBtn }}>{bu.customize}</button>
            {isMobile && (
              <button onClick={() => setMobileCoverMode(mobileCoverMode === "edit" ? "preview" : "edit")}
                style={{ ...softBtn }}>
                {mobileCoverMode === "edit" ? bu.preview : bu.edit}
              </button>
            )}
            <div style={{ position: "relative" }}>
              <button onClick={() => toggleToolbarPanel("e")} disabled={!coverReady || !!exporting}
                aria-haspopup="menu" aria-expanded={activeToolbarPanel === "e"} aria-controls="p-e"
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 9, minHeight: 38,
                  padding: "0 16px", fontSize: 13, fontWeight: 900, cursor: coverReady && !exporting ? "pointer" : "not-allowed",
                  fontFamily: "inherit", opacity: coverReady && !exporting ? 1 : 0.55 }}>
                {exporting ? bu.exportingBtn : bu.exportBtn}
              </button>
              {activeToolbarPanel === "e" && (
                <div id="p-e" role="menu" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
                  minWidth: 210, background: C.surface, border: "none", borderRadius: 12,
                  boxShadow: "0 18px 54px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                  <button role="menuitem" onClick={() => { setActiveToolbarPanel(null); downloadCoverPDF(); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                      background: "none", border: "none", color: C.text1, cursor: "pointer", fontFamily: "inherit" }}>
                    <strong>{t.dlPdf}</strong>
                  </button>
                  <button role="menuitem" onClick={() => { setActiveToolbarPanel(null); downloadCoverDOCX(); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                      background: "none", border: "none", color: C.text1, cursor: "pointer", fontFamily: "inherit",
                      boxShadow: `inset 0 1px 0 ${SECTION_TOKENS.rowDivider}` }}>
                    <strong>{t.dlDocx}</strong>
                  </button>
                </div>
              )}
            </div>
            {renderMoreMenu("m", coverSharePayload, `${coverForm.name || "My"} cover letter`, {
              content: (
                <div style={{ padding: "6px 10px 10px" }}>
                  <div style={{ color: C.text3, fontSize: 11.5, fontWeight: 800, marginBottom: 6 }}>
                    {bu.documentLanguage}
                  </div>
                  <LanguageDropdown
                    selected={selectedDocumentLang}
                    onSelect={setDocumentLanguagePreference}
                    ariaLabel={bu.chooseDocumentLanguage}
                    siteBadge={builderText("langBadgeSite")}
                    uiBadge={builderText("langBadgeUi")}
                  />
                  {docLang !== "en" && (
                    <button type="button" onClick={() => setTranslationConfirm({ open: true, target: selectedDocumentLang || languageByCode(docLang), kind: "cover", error: "" })}
                      disabled={translating}
                      title={cu.translateContentHint}
                      style={{ width: "100%", marginTop: 10, minHeight: 36, borderRadius: 8, border: "none",
                        background: `${C.accent}18`, color: translating ? C.text3 : C.accent2,
                        fontSize: 12.5, fontWeight: 850, cursor: translating ? "wait" : "pointer", fontFamily: "inherit" }}>
                      {translating ? cu.translatingContentButton : translateLabel(cu.translateContentButton, { language: selectedDocumentLanguageLabel })}
                    </button>
                  )}
                  {coverForm.translationMeta?.fields && (
                    <div style={{ marginTop: 8, color: C.accent2, fontSize: 11.5, fontWeight: 800 }}>
                      {cu.translatedBadge}
                    </div>
                  )}
                </div>
              ),
            })}
          </div>
        </div>

        <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "minmax(420px, 45%) minmax(520px, 55%)",
          gap: 18, flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
          <div className="ac-panel-scrollbar" style={{ minWidth: 0, ...(isMobile ? { width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "10px 8px 84px", display: mobileCoverMode === "edit" ? "block" : "none" } : { overflowY: "auto", height: "100%",
            padding: "12px 14px 28px" }) }}>
            {!coverReady && (
              <div style={{ color: C.text3, fontSize: 12.5, lineHeight: 1.45, padding: "0 2px 8px", textAlign: rtl ? "right" : "left" }}>
                <span style={{ color: C.accent2, fontWeight: 800 }}>{cu.nextStep}:</span> {cu.nextStepBody}
              </div>
            )}
            <FieldCard icon="🏢" title={cu.cardRecipient} {...cov("recipient")}
              status={coverStatus(["company", "recipientName", "recipientTitle", "companyAddress", "date"], ["company"])}>
              <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="cover-field-date" style={lbl}>{cu.lblDate}</label>{coverField("date", false, "June 26, 2026", "📅")}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="cover-field-company" style={lbl}>{cu.lblCompany}</label>{coverField("company", false, "Stripe", "🏢")}
                </div>
              </div>
              <label htmlFor="cover-field-recipientName" style={lbl}>{cu.lblRecipientName}</label>{coverField("recipientName", false, "Mr. David Chen", "👤")}
              <label htmlFor="cover-field-recipientTitle" style={lbl}>{cu.lblRecipientTitle}</label>{coverField("recipientTitle", false, "Head of Design", "💼")}
              <label htmlFor="cover-field-companyAddress" style={lbl}>{cu.lblCompanyAddress}</label>{coverField("companyAddress", false, "123 Main St, City", "📍")}
            </FieldCard>

            <FieldCard icon="👤" title={cu.cardYourInfo} {...cov("sender")}
              status={coverStatus(["name", "jobTitle", "email", "phone", "location"], ["name"])}>
              <label htmlFor="cover-field-name" style={lbl}>{cu.lblFullName}</label>{coverField("name", false, "Alexandra Johnson", "✏️")}
              <label htmlFor="cover-field-jobTitle" style={lbl}>{cu.lblJobTitle}</label>{coverField("jobTitle", false, "Senior Product Designer", "💼")}
              <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="cover-field-email" style={lbl}>{cu.lblEmail}</label>{coverField("email", false, "you@email.com", "✉️")}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="cover-field-phone" style={lbl}>{cu.lblPhone}</label>{coverField("phone", false, "+1 415 555 0000", "☎️")}
                </div>
              </div>
              <label htmlFor="cover-field-location" style={lbl}>{cu.lblLocation}</label>{coverField("location", false, "City, Country", "📍")}
            </FieldCard>

            <SectionHeader icon="✍️" title={cu.cardLetterContent} filled={!!(coverForm.opening || coverForm.body || coverForm.closing)} filledLabel={builderText("filledBadge")} />

            <FieldCard icon="📌" title={cu.cardOpening} {...cov("opening")}
              status={coverStatus(["subject", "opening"], ["opening"])}>
              <label htmlFor="cover-field-subject" style={lbl}>{cu.lblSubject}</label>{coverField("subject", false, "Senior Product Designer Position", "📌")}
              <label htmlFor="cover-field-opening" style={lbl}>{cu.lblSalutation}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13.5, color: C.text2, whiteSpace: "nowrap" }} aria-hidden="true">{cu.dear}</span>
                <div style={{ flex: 1 }}>
                  <IconInput icon="👤">
                    <input id="cover-field-opening" value={coverForm.opening} onChange={e => setCoverForm(f => ({ ...f, opening: e.target.value }))}
                      placeholder={cu.phOpening} style={inputStyle} />
                  </IconInput>
                </div>
                <span style={{ fontSize: 13.5, color: C.text2 }} aria-hidden="true">,</span>
              </div>
            </FieldCard>

            <FieldCard icon="📝" title={cu.cardBody} {...cov("body")}
              status={coverStatus(["body"], ["body"])}>
              <label htmlFor="cover-field-body" style={lbl}>{cu.lblBodyParas}</label>
              <CoverFormattingBar fieldKey="body" />
              <textarea id="cover-field-body" value={coverForm.body} onChange={e => setCoverForm(f => ({ ...f, body: e.target.value }))}
                placeholder={cu.phBody}
                rows={8} style={{ ...inputStyle, resize: "vertical", minHeight: 160 }} />
            </FieldCard>

            <FieldCard icon="✅" title={cu.cardClosing} {...cov("closing")}
              status={coverStatus(["closing", "signoff"], ["closing"])}>
              <label htmlFor="cover-field-closing" style={lbl}>{cu.lblClosingPara}</label>
              <CoverFormattingBar fieldKey="closing" />
              <textarea id="cover-field-closing" value={coverForm.closing} onChange={e => setCoverForm(f => ({ ...f, closing: e.target.value }))}
                placeholder={cu.phClosing}
                rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} />
              <label htmlFor="cover-field-signoff" style={lbl}>{cu.lblSignoff}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <IconInput icon="✍️">
                    <input id="cover-field-signoff" list="cover-signoff-options" value={coverForm.signoff} onChange={e => setCoverForm(f => ({ ...f, signoff: e.target.value }))}
                      dir={documentRtl ? "rtl" : "ltr"}
                      placeholder={cu.phSignoff} style={inputStyle} />
                  </IconInput>
                  <datalist id="cover-signoff-options">
                    {(COVER_SIGNOFFS[docLang] || COVER_SIGNOFFS.en).map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <span style={{ fontSize: 13.5, color: C.text2 }} aria-hidden="true">,</span>
              </div>
            </FieldCard>

            {/* TODO: custom cover-letter blocks. Pill present for parity with the
                resume builder's "+ Add content"; full custom-section support needs
                editor + preview + PDF/DOCX wiring (left for a follow-up). */}
            <div style={{ display: "flex", justifyContent: rtl ? "flex-start" : "flex-end", marginTop: 16 }}>
              <button type="button"
                onClick={() => { setStatusMsg(cu.comingSoon); setTimeout(() => setStatusMsg(""), 2500); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.accent}18`,
                  border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700,
                  color: C.accent2, cursor: "pointer", fontFamily: "inherit" }}>
                <span aria-hidden style={{ fontSize: 15, fontWeight: 800 }}>+</span> {bu.addSection}
              </button>
            </div>
          </div>

          <div className="ac-panel-scrollbar" style={{ minWidth: 0, ...(isMobile ? { width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "10px 8px 84px", marginTop: 0, display: mobileCoverMode === "preview" ? "block" : "none" } : { overflowY: "auto", height: "100%",
            padding: "12px 14px 28px" }) }}>
            <PreviewPane
              ref={coverPrintRef}
              rtl={documentRtl}
              badge={<span style={{ ...badge, ...badgeLive, background: "transparent", color: C.text3 }}>● {bu.livePreview}</span>}
              labels={{
                controls: builderText("previewControls"), zoomOut: builderText("zoomPreviewOut"),
                zoomIn: builderText("zoomPreviewIn"), fit: bu.fit, expand: builderText("expandPreview"),
                close: builderText("closeExpandedPreview"), expandedTitle: builderText("expandedPreview"),
              }}
            >
              <CoverLetterPaper tpl={coverTpl} data={coverForm} rtl={documentRtl} lang={docLang} />
            </PreviewPane>
          </div>
        </div>
        {isMobile && (
          <div ref={mobileCoverToolbarRef} style={{ position: "sticky", bottom: 0, zIndex: 20, margin: "12px -4px -8px",
            padding: "10px 12px", background: `${C.bg}f2`, backdropFilter: "blur(10px)",
            boxShadow: "0 -12px 28px rgba(0,0,0,0.18)", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8 }}>
            <button onClick={() => setMobileCoverMode(mobileCoverMode === "edit" ? "preview" : "edit")}
              style={{ border: "none", background: C.surface, color: C.text1,
                borderRadius: 8, padding: "10px 6px", fontSize: 12, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit" }}>
              {mobileCoverMode === "edit" ? bu.preview : bu.edit}
            </button>
            <button onClick={() => { setActiveToolbarPanel(null); downloadCoverPDF(); }} disabled={!coverReady || !!exporting}
              style={{ border: "none", background: C.grad, color: "#fff",
                borderRadius: 8, padding: "10px 6px", fontSize: 12, fontWeight: 800,
                cursor: coverReady && !exporting ? "pointer" : "not-allowed", fontFamily: "inherit",
                opacity: coverReady && !exporting ? 1 : 0.55 }}>
              {t.dlPdf}
            </button>
            <button onClick={() => { setActiveToolbarPanel(null); downloadCoverDOCX(); }} disabled={!coverReady || !!exporting}
              style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.text1,
                borderRadius: 8, padding: "10px 6px", fontSize: 12, fontWeight: 800,
                cursor: coverReady && !exporting ? "pointer" : "not-allowed", fontFamily: "inherit",
                opacity: coverReady && !exporting ? 1 : 0.55 }}>
              {t.dlDocx}
            </button>
          </div>
        )}
      </div>
    );
  })() : null;

  // ── Sidebar nav items ──────────────────────────────────────────────
  // Primary tools take their label from the shared navbar config, so the sidebar,
  // the mobile drawer and the navbar never disagree about what a tool is called.
  const toolLabel = (id) => (FOOTER_UI[lang] || FOOTER_UI.en)[primaryNavLabelKey(id)];
  const NAV = [
    { id: "resume",    icon: "📄", label: toolLabel("resume") },
    { id: "master",    icon: "⭐", label: builderText("masterProfileNav") },
    { id: "cover",     icon: "✉️",  label: toolLabel("cover") },
    { id: "tracker",   icon: "📋", label: toolLabel("tracker") },
    { id: "ats",       icon: "🎯", label: toolLabel("ats") },
    { id: "signature", icon: "✍️",  label: builderText("emailSignatureNav"), soon: true },
    { id: "website",   icon: "🌐", label: builderText("personalWebsiteNav"), soon: true },
    { id: "about",     icon: "ℹ️",  label: builderText("aboutNav") },
  ];

  const COMING_SOON_COPY = {
    signature: {
      title: builderText("emailSignatureNav"),
      sub: builderText("emailSignatureSub"),
      cta: builderText("emailSignatureCta"),
    },
    website: {
      title: builderText("personalWebsiteNav"),
      sub: builderText("personalWebsiteSub"),
      cta: builderText("personalWebsiteCta"),
    },
  };

  const ComingSoon = ({ id, label }) => {
    const copy = COMING_SOON_COPY[id] || { title: label, sub: builderText("featureOnWay"), cta: builderText("stayTuned") };
    return (
      <div style={{ padding: isMobile ? 20 : 40, maxWidth: 560 }}>
        <PageHeader eyebrow={builderText("comingSoon")} icon="🚧" title={copy.title} sub={copy.sub} isMobile={isMobile} />
        <div style={{ marginTop: 8, fontSize: 14.5, color: C.text2 }}>
          {copy.cta}{" "}
          <a href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent(copy.title + " — early access")}`}
            style={{ color: C.accent2, fontWeight: 600, textDecoration: "none" }}>
            {AUTHOR.email} →
          </a>
        </div>
      </div>
    );
  };


  const ATSPage = () => {
    const [localText, setLocalText] = useState(atsText || atsFromChecker || "");
    const [localJd, setLocalJd] = useState(atsJd || "");
    const [result, setResult] = useState(atsResult);
    const [running, setRunning] = useState(false);
    const [aiOut, setAiOut] = useState("");
    const [aiBusy, setAiBusy] = useState(false);
    const lastAiRef = useRef(0);
    const fileRef = useRef(null);
    const [reading, setReading] = useState(false);

    // Read an uploaded PDF/DOCX/TXT into the resume box (client-side, lazy libs).
    const onUploadFile = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (e.target) e.target.value = "";
      if (!file) return;
      setReading(true);
      try {
        const { extractResumeText } = await import("./ats/extractText.js");
        const text = await extractResumeText(file);
        if (text && text.trim()) setLocalText(text.trim());
        else { setStatusMsg(st.noReadableText); setTimeout(() => setStatusMsg(""), 3500); }
      } catch {
        setStatusMsg(st.couldntReadFile);
        setTimeout(() => setStatusMsg(""), 3500);
      } finally { setReading(false); }
    };

    // Detected languages for the badges (client-side, cheap).
    // OPT-IN AI layer — only fires on explicit click, with a rapid-call guard.
    const getAiSuggestions = async () => {
      const now = Date.now();
      if (aiBusy || now - lastAiRef.current < 8000 || localText.trim().length < 40) return;
      lastAiRef.current = now;
      setAiBusy(true); setAiOut("");
      try {
        const payload = `RESUME:\n${localText.slice(0, 6000)}\n\nJOB DESCRIPTION:\n${(localJd || "").slice(0, 3500)}`;
        const text = await callAi("ats-suggestions", payload, selectedLang?.code || "en");
        setAiOut(text);
        track(EVENTS.AI_TAILORING_USED, { surface: "ats" });
      } catch {
        setAiOut("Could not reach the AI helper right now. Your local score is unaffected — try again in a moment.");
      } finally { setAiBusy(false); }
    };

    const check = () => {
      if (localText.trim().length < 40) return;
      track(EVENTS.ATS_STARTED);
      setRunning(true);
      setTimeout(async () => {
        try {
          const dictionary = await loadAtsResultCopy(lang);
          setLazyAtsResults({ language: lang, dictionary });
        } catch {
          setLazyAtsResults(null);
        }
        const r = await scoreRawResume(localText, localJd);
        setResult(r);
        setAtsResult(r);
        setAtsText(localText);
        setAtsJd(localJd);
        if (atsFromChecker) {
          setAtsFromChecker("");
        }
        setRunning(false);
      }, 150);
    };

    const importToBuilder = async () => {
      if (localText.trim().length < 20) return;
      const { parseResume } = await import("./ats/parseResume.js");
      hydrateFromParsed(parseResume(localText)); // structured parse → correct fields, no dumps
      openPostImportTemplatePicker();
      setStatusMsg(st.resumeImported);
      setTimeout(() => setStatusMsg(""), 2500);
    };

    const band = result ? scoreBand(result.score) : null;
    const scoreColor = band ? band.color : C.accent2;
    const localizedBand = band ? atsResults?.scoreBands?.[band.code] : null;
    const scoreLabel = localizedBand?.label || band?.label || "";
    const scoreMeaning = localizedBand?.meaning || band?.meaning || ats.scoreDesc;
    const formatIssueText = (issue, field) => {
      const entry = atsResults?.issueText?.[issue.code] || {};
      const data = issue.data || {};
      const cross = data.crossLanguage && atsResults?.crossLangIssue
        ? atsResults.crossLangIssue
            .replace("{resumeLang}", data.langResume || "")
            .replace("{jobLang}", data.langJd || "")
        : "";
      return String(entry[field] || (field === "title" ? issue.code : ""))
        .replace("{count}", data.count ?? "")
        .replace("{words}", data.words ?? "")
        .replace("{pct}", data.pct ?? "")
        .replace("{cross}", cross);
    };

    const IssueRow = ({ issue }) => {
      const bColor = issue.level === "critical" ? "#f87171" : issue.level === "warning" ? "#fbbf24" : "#60a5fa";
      const bBg    = issue.level === "critical" ? "#450a0a44" : issue.level === "warning" ? "#431407aa" : "#1e3a5f44";
      const severityLabel = issue.level === "critical" ? ats.critical : issue.level === "warning" ? ats.warning : ats.info;
      return (
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{issue.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 4,
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {formatIssueText(issue, "title")}
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                background: bBg, color: bColor, border: `1px solid ${bColor}22`,
                textTransform: "uppercase", letterSpacing: ".8px", flexShrink: 0 }}>
                {severityLabel} · −{issueCost(issue)}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>{formatIssueText(issue, "detail")}</div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ minHeight: isMobile ? "auto" : "calc(100vh - 32px)", padding: isMobile ? "0 8px 28px" : "0 0 44px" }}>
        <section aria-labelledby="ats-checker-title" style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "24px 4px 0" : "42px 28px 0" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999,
            background: `${C.accent}12`, border: `1px solid ${C.accent}2E`,
            color: C.accent2, padding: "5px 12px", fontSize: 11, fontWeight: 900,
            letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: 14 }}>
            {ats.freeTool}
          </div>
          <h1 id="ats-checker-title" style={{ margin: "0 0 12px", color: C.text1,
            fontSize: isMobile ? 30 : 40, lineHeight: 1.08, letterSpacing: "-0.8px", fontWeight: 900 }}>
            {ats.title}
          </h1>
          <p style={{ margin: 0, maxWidth: 720, color: C.text2, fontSize: isMobile ? 15 : 16.5, lineHeight: 1.65 }}>
            {ats.sub}
          </p>
        </div>

        {atsFromChecker && (
          <div style={{ background: `${C.accent}14`, border: `1.5px solid ${C.accent}40`,
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 13.5, color: C.text1, flex: 1 }}>{ats.detected}</span>
            <button onClick={() => { setLocalText(atsFromChecker); setTimeout(check, 50); }}
              style={{ fontSize: 12.5, fontWeight: 700, color: C.accent2, background: "none",
                border: `1px solid ${C.accent}40`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              {ats.loadCheck}
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "1px" }}>{ats.yourResume}</span>
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={reading}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${C.accent}14`,
                  border: `1px solid ${C.accent}40`, borderRadius: 7, padding: "4px 10px", fontSize: 11.5, fontWeight: 700,
                  color: C.accent2, cursor: reading ? "wait" : "pointer", fontFamily: "inherit" }}>
                {reading ? ats.reading : `📎 ${ats.uploadBtn}`}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={onUploadFile} style={{ display: "none" }} />
            </div>
            <textarea value={localText} onChange={e => setLocalText(e.target.value)}
              placeholder={ats.pasteResumePh}
              style={{ width: "100%", height: 240, resize: "vertical", background: C.elevated,
                border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text1,
                fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontSize: 13, lineHeight: 1.6,
                padding: "12px 14px", outline: "none", fontWeight: 400 }} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 8 }}>{ats.jdLabel} <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— {ats.optional}</span></div>
            <textarea value={localJd} onChange={e => setLocalJd(e.target.value)}
              placeholder={ats.pasteJdPh}
              style={{ width: "100%", height: 240, resize: "vertical", background: C.elevated,
                border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text1,
                fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontSize: 13, lineHeight: 1.6,
                padding: "12px 14px", outline: "none", fontWeight: 400 }} />
          </div>
        </div>

        <button onClick={check} disabled={running || localText.trim().length < 40}
          style={{ width: "100%", padding: "14px", background: C.grad, border: "none",
            borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", opacity: (running || localText.trim().length < 40) ? 0.5 : 1,
            marginBottom: 32 }}>
          {running ? ats.analysing : ats.checkBtn}
        </button>

        {result && (<>
          {/* Score */}
          <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", color: C.accent2, marginBottom: 6 }}>
              {ats.readinessTitle}
            </div>
            <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, letterSpacing: "-2px", lineHeight: 1 }}>
              {result.score}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: scoreColor, marginTop: 6 }}>{scoreLabel}</div>
            <div style={{ fontSize: 12.5, color: C.text3, marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
              {scoreMeaning}
            </div>
            <details style={{ marginTop: 14, maxWidth: 460, marginInline: "auto", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", fontSize: 12, color: C.accent2, fontWeight: 700 }}>{ats.howCalculated}</summary>
              <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, margin: "8px 0 0" }}>{READINESS_EXPLAINER}</p>
            </details>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
              {result.issues.filter(i => i.level === "critical").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#450a0a44", color: "#f87171", border: "1px solid #7f1d1d44" }}>
                  {result.issues.filter(i => i.level === "critical").length} {ats.critical}
                </span>
              )}
              {result.issues.filter(i => i.level === "warning").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#43140744", color: "#fbbf24", border: "1px solid #92400e44" }}>
                  {result.issues.filter(i => i.level === "warning").length} {ats.warning}
                </span>
              )}
              {result.issues.filter(i => i.level === "info").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#1e3a5f44", color: "#60a5fa", border: "1px solid #1d4ed844" }}>
                  {result.issues.filter(i => i.level === "info").length} {ats.info}
                </span>
              )}
              {result.issues.length === 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#14532d44", color: "#4ade80", border: "1px solid #16a34a44" }}>{ats.allClear}</span>
              )}
            </div>
          </div>

          {/* Keyword gap */}
          {result.kwGap && (
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>{ats.keywordMatch}</div>
              {result.kwGap.crossLanguage && (
                <div style={{ fontSize: 11.5, color: C.accent2, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  🌍 {ats.crossLangPre} {String(result.kwGap.langResume || "").toUpperCase()} {ats.resumeWord} {ats.crossLangVs} {String(result.kwGap.langJd || "").toUpperCase()} {ats.jdWord}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.text1 }}>{result.kwGap.pct}%</span>
                  <span style={{ fontSize: 13, color: C.text2, marginLeft: 8 }}>{ats.kwMatchJd}</span>
                </div>
                <div style={{ fontSize: 12, color: C.text3 }}>
                  {result.kwGap.present.length} {ats.matchedWord} · {result.kwGap.missing.length} {ats.missingWord}
                </div>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ height: "100%", width: `${result.kwGap.pct}%`, background: C.grad, borderRadius: 999, transition: "width .6s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>{ats.matchedLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {result.kwGap.present.map(w => (
                  <span key={w} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#14532d44", color: "#4ade80", border: "1px solid #16a34a44" }}>✓ {w}</span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>{ats.missingLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.kwGap.missing.length > 0
                  ? result.kwGap.missing.map(w => <span key={w} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#450a0a44", color: "#f87171", border: "1px solid #7f1d1d44" }}>✗ {w}</span>)
                  : <span style={{ fontSize: 13, color: "#4ade80" }}>{ats.noMissing}</span>
                }
              </div>
            </div>
          )}

          {/* Opt-in AI layer — explicit, consent-based; never auto-fires */}
          <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text1 }}>✨ {ats.aiSuggestions} <span style={{ fontSize: 11, fontWeight: 600, color: C.text3 }}>· {ats.optional}</span></div>
                <div style={{ fontSize: 12.5, color: C.text3, marginTop: 3, maxWidth: 460 }}>
                  {ats.aiDesc1}{localJd.trim() ? ` ${ats.aiDescJd}` : ""} {ats.aiDesc2}
                </div>
              </div>
              <button onClick={getAiSuggestions} disabled={aiBusy || localText.trim().length < 40}
                style={{ flexShrink: 0, background: aiBusy ? C.surface : C.grad, color: aiBusy ? C.text3 : "#fff",
                  border: aiBusy ? `1px solid ${C.border}` : "none", borderRadius: 10, padding: "10px 18px",
                  fontSize: 13.5, fontWeight: 700, cursor: (aiBusy || localText.trim().length < 40) ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: localText.trim().length < 40 ? 0.5 : 1 }}>
                {aiBusy ? ats.thinking : `✨ ${ats.getAi}`}
              </button>
            </div>
            {aiOut && (
              <div style={{ marginTop: 16, padding: "14px 16px", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, color: C.text1, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {aiOut}
              </div>
            )}
          </div>

          {/* Issues */}
          {result.issues.length === 0
            ? <div style={{ background: "#14532d22", border: "1px solid #16a34a44", borderRadius: 12, padding: "20px 24px", color: "#4ade80", fontWeight: 600, textAlign: "center", marginBottom: 24 }}>
                {ats.noIssues}
              </div>
            : <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{ats.issues}</div>
                {result.issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
              </>
          }

          {/* Fix CTA */}
          <div style={{ background: `${C.accent}0E`, border: `1.5px solid ${C.accent}28`, borderRadius: 14, padding: "24px", textAlign: "center", marginTop: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text1, marginBottom: 8 }}>{ats.fixTitle}</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 20, lineHeight: 1.6 }}>
              {ats.fixDesc}
            </div>
            <button onClick={importToBuilder}
              style={{ padding: "12px 28px", background: C.grad, border: "none", borderRadius: 9,
                color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 20px ${C.accent}44` }}>
              {ats.openBuilder}
            </button>
          </div>
        </>)}
        </section>
      </div>
    );
  };

  const AboutPage = () => (
    <div style={{ padding: isMobile ? 20 : 40, maxWidth: 720 }}>
      <PageHeader
        eyebrow={landingText("aboutEyebrow")}
        icon="✦"
        title={landingText("aboutTitle")}
        sub={positioning.supportingText}
        isMobile={isMobile}
      />

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 36 }} />

      {/* Mission */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>{landingText("aboutMission")}</div>
        <p style={{ fontSize: 14.5, color: C.text1, lineHeight: 1.8, margin: 0 }}>
          {landingText("aboutMissionBody")}
        </p>
      </div>

      {/* What you can do */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 16 }}>{landingText("aboutWhatYouCanDo")}</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[
            ["document", landingText("aboutFeatResumeTitle"), landingText("aboutFeatResumeDesc", { count: RESUME_TEMPLATE_COUNT })],
            ["document", landingText("aboutFeatCoverTitle"), landingText("aboutFeatCoverDesc")],
            ["globe", landingText("aboutFeatLangTitle"), landingText("aboutFeatLangDesc")],
            ["upload", landingText("aboutFeatExportTitle"), landingText("aboutFeatExportDesc")],
            ["lock", landingText("aboutFeatBrowserTitle"), landingText("aboutFeatBrowserDesc")],
            ["spark", landingText("aboutFeatAiTitle"), landingText("aboutFeatAiDesc")],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: C.elevated, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <LineIcon name={icon} size={22} color={C.accent2} style={{ marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 36 }} />

      {/* Built by */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>{landingText("aboutBuiltBy")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%",
            background: C.grad, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            BD
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>Biroue Digital Ltd</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 3 }}>
              {landingText("aboutStudioDesc")}
            </div>
            {AUTHOR.github && (
              <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: C.accent2, textDecoration: "none", marginTop: 4, display: "inline-block" }}>
                GitHub →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 28 }} />

      {/* Footer links */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <button onClick={() => setAppView("landing")}
          style={{ fontSize: 13.5, color: C.accent2, background: "none", border: "none",
            cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
          {landingText("aboutBack")}
        </button>
        {AUTHOR.github && (
          <a href={`${AUTHOR.github}/applycraft`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13.5, color: C.text2, textDecoration: "none" }}>
            {landingText("aboutViewSource")}
          </a>
        )}
      </div>
    </div>
  );

  // ── Job Tracker ─────────────────────────────────────────────────────
  const TRACKER_COLS = [
    { id: "saved",      label: tk.colSaved,     icon: "🔖", color: "#64748B" },
    { id: "preparing",  label: tk.colPreparing, icon: "✏️",  color: "#6366F1" },
    { id: "applied",    label: tk.colApplied,   icon: "📤", color: "#3B82F6" },
    { id: "interview",  label: tk.colInterview, icon: "🎤", color: "#F59E0B" },
    { id: "offer",      label: tk.colOffer,     icon: "🎉", color: "#10B981" },
    { id: "rejected",   label: tk.colRejected,  icon: "✕",  color: C.danger },
  ];

  const newCard = (col) => ({
    id: `tc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    column: col,
    company: "", position: "", jobDescription: "", salary: "", link: "",
    resume: "", coverLetter: "", interviewDate: "", notes: "",
    location: "", marketMode: "international", applicationLanguage: docLang,
    applicationDate: "", resumeVersion: null, coverLetterVersion: null,
    atsReview: null, interviewPrep: null,
    recruiter: "", reminder: "",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  const saveCard = async (card) => {
    const { createApplicationRecord, toTrackerCard } = await import("./application/applicationRecord.js");
    const normalized = toTrackerCard(createApplicationRecord(card));
    setTrackerCards(prev => prev.some(c => c.id === normalized.id)
      ? prev.map(c => c.id === normalized.id ? normalized : c)
      : [...prev, normalized]);
    setTrackerModal({ open: false, card: null });
  };

  const deleteTrackerData = () => {
    setTrackerCards([]);
    setTrackerStorageEnabled(false);
  };

  const deleteCard = (id) => {
    setTrackerCards(prev => prev.filter(c => c.id !== id));
    setTrackerModal({ open: false, card: null });
  };

  const moveCard = (id, toCol) => {
    setTrackerCards(prev => prev.map(c => c.id === id ? { ...c, column: toCol } : c));
  };

  const trackerContent = (() => {
    const col = TRACKER_COLS.find(c => c.id === (trackerModal.card?.column || "saved"));
    const editCard = trackerModal.card;

    return (
      <div style={{ minHeight: isMobile ? "auto" : "calc(100vh - 32px)", padding: isMobile ? "0 8px 28px" : "0 0 44px" }}>
        <section aria-labelledby="job-tracker-title" style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 4px 0" : "34px 28px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999,
              background: `${C.accent}12`, border: `1px solid ${C.accent}2E`,
              color: C.accent2, padding: "5px 12px", fontSize: 11, fontWeight: 900,
              letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: 14 }}>
              {tk.eyebrow}
            </div>
            <h1 id="job-tracker-title" style={{ margin: 0, fontSize: isMobile ? 30 : 40, lineHeight: 1.08,
              fontWeight: 900, color: C.text1, letterSpacing: "-0.8px" }}>{tk.title}</h1>
            <p style={{ margin: "8px 0 0", fontSize: isMobile ? 14.5 : 16, color: C.text2, lineHeight: 1.6 }}>
              {tk.sub}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.text3 }}>
              {trackerCards.length} {tk.tracked}
            </p>
          </div>
          {/* Stats chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: tk.statApplied, count: trackerCards.filter(c => ["applied","interview","offer"].includes(c.column)).length, color: "#3B82F6" },
              { label: tk.statInterviews, count: trackerCards.filter(c => c.column === "interview").length, color: "#F59E0B" },
              { label: tk.statOffers, count: trackerCards.filter(c => c.column === "offer").length, color: "#10B981" },
            ].map(s => (
              <div key={s.label} style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`,
                borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: s.color }}>
                {s.count} {s.label}
              </div>
            ))}
          </div>
        </div>

        <React.Suspense fallback={null}><TrackerPrivacyControls locale={lang} enabled={trackerStorageEnabled} setEnabled={setTrackerStorageEnabled} cards={trackerCards} replace={setTrackerCards} clear={deleteTrackerData} /></React.Suspense>
        <React.Suspense fallback={null}><TrackerFilters locale={lang} value={trackerFilters} onChange={setTrackerFilters} cards={trackerCards} /></React.Suspense>

        {/* Kanban board */}
        <div style={{ overflowX: "auto", margin: isMobile ? "0 -8px" : "0 -20px" }}>
        <div style={{ display: "flex", gap: 14, padding: isMobile ? "0 8px 16px" : "0 20px 16px",
          alignItems: "flex-start", minHeight: 400, minWidth: isMobile ? "max-content" : 0 }}>
          {TRACKER_COLS.map(tcol => {
            const cards = trackerCards.filter(c => c.column === tcol.id
              && (!trackerFilters.query || `${c.company} ${c.position}`.toLowerCase().includes(trackerFilters.query.toLowerCase()))
              && (!trackerFilters.market || c.marketMode === trackerFilters.market)
              && (!trackerFilters.language || c.applicationLanguage === trackerFilters.language)
              && (!trackerFilters.resume || (c.resumeVersion?.name || c.resume) === trackerFilters.resume)
              && (!trackerFilters.followUpDue || (c.reminder && c.reminder <= new Date().toISOString().slice(0, 10))));
            const isDragTarget = trackerDragOver === tcol.id;
            return (
              <div key={tcol.id}
                onDragOver={e => { e.preventDefault(); setTrackerDragOver(tcol.id); }}
                onDragLeave={() => setTrackerDragOver(null)}
                onDrop={e => {
                  e.preventDefault();
                  if (trackerDragId) moveCard(trackerDragId, tcol.id);
                  setTrackerDragId(null); setTrackerDragOver(null);
                }}
                style={{ flex: isMobile ? "0 0 220px" : "1 1 0", minWidth: isMobile ? undefined : 176,
                  background: isDragTarget ? `${tcol.color}18` : C.surface,
                  border: `1.5px solid ${isDragTarget ? tcol.color : C.border}`,
                  borderRadius: 12, padding: "12px 10px", minHeight: 160,
                  transition: "border-color 0.15s, background 0.15s" }}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{tcol.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tcol.color,
                      textTransform: "uppercase", letterSpacing: "0.8px" }}>{tcol.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text3,
                      background: C.elevated, borderRadius: 999, padding: "1px 8px",
                      border: `1px solid ${C.border}` }}>{cards.length}</span>
                    <button onClick={() => setTrackerModal({ open: true, card: { ...newCard(tcol.id) } })}
                      style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                        width: 22, height: 22, cursor: "pointer", color: C.text3, fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1, padding: 0, fontFamily: "inherit" }}>+</button>
                  </div>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cards.map(card => (
                    <div key={card.id}
                      draggable
                      onDragStart={() => setTrackerDragId(card.id)}
                      onDragEnd={() => { setTrackerDragId(null); setTrackerDragOver(null); }}
                      onClick={() => setTrackerModal({ open: true, card: { ...card } })}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9,
                        padding: "10px 12px", cursor: "grab", transition: "transform 0.1s, box-shadow 0.1s",
                        opacity: trackerDragId === card.id ? 0.45 : 1,
                        borderLeft: `3px solid ${tcol.color}` }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px #0006"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginBottom: 3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {card.company || <span style={{ color: C.text3 }}>{tk.companyPh}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.text2, marginBottom: 6,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {card.position || <span style={{ color: C.text3 }}>{tk.positionPh}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {card.salary && (
                          <span style={{ fontSize: 10, color: "#10B981", background: "#10B98114",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{card.salary}</span>
                        )}
                        {card.interviewDate && (
                          <span style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B14",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>📅 {card.interviewDate}</span>
                        )}
                        {card.reminder && (
                          <span style={{ fontSize: 10, color: "#6366F1", background: "#6366F114",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>⏰</span>
                        )}
                      </div>

                      {/* Reached the interview stage → launch the existing Interview Prep
                          simulator, pre-filled with this application's role + company.
                          A real link (the module is its own lazy route), localized so it
                          never jumps locale, and stopPropagation so it doesn't open the
                          card modal or get dragged instead of the card. */}
                      {tcol.id === "interview" && (
                        <a
                          href={localizeRoute(`/interview-prep/${jobContextQuery({ jobTitle: card.position, company: card.company, applicationLanguage: card.applicationLanguage })}`, lang)}
                          draggable={false}
                          onClick={e => e.stopPropagation()}
                          style={{ display: "block", marginTop: 8, padding: "6px 8px", borderRadius: 6,
                            textDecoration: "none", textAlign: "center", fontSize: 10.5, fontWeight: 700,
                            color: tcol.color, background: `${tcol.color}14`, border: `1px solid ${tcol.color}33` }}>
                          {tk.prepCta}
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 8px", color: C.text3, fontSize: 12 }}>
                    {tk.dropHere}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>

        {/* Add first application CTA */}
        {trackerCards.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 32, padding: "28px 24px",
            background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 8 }}>
              {tk.emptyTitle}
            </div>
            <div style={{ fontSize: 13, color: C.text2, marginBottom: 20 }}>
              {tk.emptySub}
            </div>
            <button onClick={() => setTrackerModal({ open: true, card: { ...newCard("saved") } })}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {tk.addFirst}
            </button>
          </div>
        )}

        {/* ── Detail Modal ── */}
        {trackerModal.open && editCard && (() => {
          const tcol = TRACKER_COLS.find(c => c.id === editCard.column) || TRACKER_COLS[0];
          const isNew = !trackerCards.find(c => c.id === editCard.id);
          const setField = (k) => (e) => setTrackerModal(m => ({ ...m, card: { ...m.card, [k]: e.target.value } }));
          const mInput = { width: "100%", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: C.text1,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

          return (
            <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
              dir={rtl ? "rtl" : "ltr"}
              onClick={e => { if (e.target === e.currentTarget) setTrackerModal({ open: false, card: null }); }}>
              <div ref={trackerDialogRef} role="dialog" aria-modal="true" aria-labelledby="tracker-dialog-title"
                dir={rtl ? "rtl" : "ltr"}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18,
                  width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", padding: 0,
                  display: "flex", flexDirection: "column" }}>

                {/* Modal header */}
                <div data-testid="tracker-dialog-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
                  background: `${tcol.color}10`, borderRadius: "18px 18px 0 0", flex: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{tcol.icon}</span>
                    <div>
                      <div id="tracker-dialog-title" style={{ fontSize: 15, fontWeight: 800, color: C.text1 }}>
                        {isNew ? tk.newApplication : (editCard.company || tk.application)}
                      </div>
                      <div style={{ fontSize: 12, color: tcol.color, fontWeight: 600 }}>{tcol.label}</div>
                    </div>
                  </div>
                  <button type="button" aria-label={eui.close} onClick={() => setTrackerModal({ open: false, card: null })}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                      width: 32, height: 32, cursor: "pointer", color: C.text2, fontSize: 16,
                      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
                      flex: "none" }}>✕</button>
                </div>

                <div data-testid="tracker-dialog-body" style={{ padding: "20px 24px", flex: "1 1 auto",
                  minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
                  {/* Move to column */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1px", color: C.text3, display: "block", marginBottom: 8 }}>{tk.stage}</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {TRACKER_COLS.map(tc => (
                        <button key={tc.id}
                          onClick={() => setTrackerModal(m => ({ ...m, card: { ...m.card, column: tc.id } }))}
                          style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${editCard.column === tc.id ? tc.color : C.border}`,
                            background: editCard.column === tc.id ? `${tc.color}20` : "transparent",
                            color: editCard.column === tc.id ? tc.color : C.text2,
                            cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s" }}>
                          {tc.icon} {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core fields */}
                  {[
                    { k: "company",   label: tk.lblCompany,       ph: "e.g. Stripe" },
                    { k: "position",  label: tk.lblPosition,      ph: "e.g. Senior Engineer" },
                    { k: "location",  label: tk.lblLocation,      ph: "e.g. Toronto, ON" },
                    { k: "applicationDate", label: tk.lblApplicationDate, ph: "YYYY-MM-DD" },
                    { k: "salary",    label: tk.lblSalary,  ph: "e.g. $120k–$140k" },
                    { k: "link",      label: tk.lblLink, ph: "https://..." },
                    { k: "recruiter", label: tk.lblRecruiter, ph: "Name · email · LinkedIn" },
                    { k: "resume",    label: tk.lblResume,     ph: "e.g. Atlas template — tech variant" },
                    { k: "coverLetter", label: tk.lblCover, ph: "e.g. Modern template" },
                    { k: "interviewDate", label: tk.lblInterviewDate, ph: "e.g. 2026-07-15 at 14:00" },
                    { k: "reminder",  label: tk.lblReminder, ph: "e.g. Follow up if no reply by July 10" },
                  ].map(({ k, label, ph }) => (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <label htmlFor={`tracker-${k}`} style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                        display: "block", marginBottom: 5 }}>{label}</label>
                      <input id={`tracker-${k}`} value={editCard[k] || ""} onChange={setField(k)}
                        placeholder={ph} style={mInput}
                        onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div><label htmlFor="tracker-market" style={{ fontSize: 11.5, fontWeight: 600, color: C.text2, display: "block", marginBottom: 5 }}>{tk.lblMarket}</label>
                      <select id="tracker-market" value={editCard.marketMode || "international"} onChange={setField("marketMode")} style={{ ...mInput, colorScheme: "dark" }}>
                        {["canada","morocco","france","united-kingdom","gulf","international"].map(id => <option key={id} value={id}>{tk[`market_${id.replace("-", "_")}`]}</option>)}
                      </select></div>
                    <div><label htmlFor="tracker-language" style={{ fontSize: 11.5, fontWeight: 600, color: C.text2, display: "block", marginBottom: 5 }}>{tk.lblLanguage}</label>
                      <select id="tracker-language" value={editCard.applicationLanguage || "en"} onChange={setField("applicationLanguage")} style={{ ...mInput, colorScheme: "dark" }}>
                        <option value="en">{tk.langEn}</option><option value="fr">{tk.langFr}</option><option value="ar">{tk.langAr}</option>
                      </select></div>
                  </div>

                  {/* Job description */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="tracker-job-description" style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                      display: "block", marginBottom: 5 }}>{tk.lblJobDesc}</label>
                    <textarea id="tracker-job-description" value={editCard.jobDescription || ""} onChange={setField("jobDescription")}
                      placeholder={tk.phJobDesc}
                      rows={4} style={{ ...mInput, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="tracker-notes" style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                      display: "block", marginBottom: 5 }}>{tk.lblNotes}</label>
                    <textarea id="tracker-notes" value={editCard.notes || ""} onChange={setField("notes")}
                      placeholder={tk.phNotes}
                      rows={3} style={{ ...mInput, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                  </div>

                </div>

                {/* Modal footer */}
                <div data-testid="tracker-dialog-footer" style={{ display: "flex", gap: 10,
                  justifyContent: "space-between", alignItems: "center", flexWrap: "wrap",
                  padding: "14px 24px", borderTop: `1px solid ${C.border}`,
                  background: C.bg, flex: "none" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => saveCard(editCard)}
                      style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                        padding: "10px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      {isNew ? tk.addApp : tk.saveChanges}
                    </button>
                    <button type="button" onClick={() => setTrackerModal({ open: false, card: null })}
                      style={{ background: "transparent", color: C.text2, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "10px 16px", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                      {tk.cancel}
                    </button>
                  </div>
                  {!isNew && (
                    <button type="button" onClick={() => deleteCard(editCard.id)}
                      style={{ background: "transparent", color: C.danger, border: `1px solid ${C.danger}30`,
                        borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      {tk.delete}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        </section>
      </div>
    );
  })();

  // ── Master Profile ──────────────────────────────────────────────────
  const masterContent = (() => {
    const uid = () => `m${Date.now()}${Math.random().toString(36).slice(2,5)}`;
    const upM = (k, v) => setMaster(m => ({...m, [k]: v}));
    const mField = (k) => (e) => upM(k, e.target.value);

    // Job helpers
    const addJob = () => { const id = uid(); setMaster(m => ({...m, jobs: [...m.jobs, {id, company:"", title:"", startDate:"", endDate:"", current:false, location:"", bullets:[""]}]})); setMasterOpen(o => ({...o, [id]: true})); };
    const upJob = (id, ch) => upM("jobs", master.jobs.map(j => j.id===id ? {...j,...ch} : j));
    const delJob = (id) => upM("jobs", master.jobs.filter(j => j.id!==id));
    const upJobBullet = (jid, bi, v) => upJob(jid, {bullets: master.jobs.find(j=>j.id===jid).bullets.map((b,i) => i===bi ? v : b)});
    const addJobBullet = (jid) => upJob(jid, {bullets: [...(master.jobs.find(j=>j.id===jid)?.bullets||[]), ""]});
    const delJobBullet = (jid, bi) => upJob(jid, {bullets: master.jobs.find(j=>j.id===jid).bullets.filter((_,i) => i!==bi)});
    const masterJobDateRange = (job) => formatDateRange({
      startDate: job.startDate,
      endDate: job.endDate,
      isCurrent: Boolean(job.current || job.isCurrent),
      language: docLang,
    });

    // Education helpers
    const addEdu = () => { const id = uid(); setMaster(m => ({...m, education: [...m.education, {id, school:"", degree:"", field:"", startDate:"", endDate:"", gpa:""}]})); setMasterOpen(o => ({...o, [id]: true})); };
    const upEdu = (id, ch) => upM("education", master.education.map(e => e.id===id ? {...e,...ch} : e));
    const delEdu = (id) => upM("education", master.education.filter(e => e.id!==id));

    // Skills helpers
    const addSkill = (name) => { if (!name.trim() || master.skills.find(s => s.name.toLowerCase()===name.trim().toLowerCase())) return; upM("skills", [...master.skills, {id: uid(), name: name.trim()}]); setSkillDraft(""); };
    const delSkill = (id) => upM("skills", master.skills.filter(s => s.id!==id));

    // Other sections helpers
    const addCert = () => upM("certifications", [...master.certifications, {id:uid(), name:"", issuer:"", date:"", url:""}]);
    const upCert = (id, ch) => upM("certifications", master.certifications.map(c => c.id===id ? {...c,...ch} : c));
    const delCert = (id) => upM("certifications", master.certifications.filter(c => c.id!==id));

    const addProject = () => upM("projects", [...master.projects, {id:uid(), name:"", tech:"", url:"", description:""}]);
    const upProject = (id, ch) => upM("projects", master.projects.map(p => p.id===id ? {...p,...ch} : p));
    const delProject = (id) => upM("projects", master.projects.filter(p => p.id!==id));

    const addLang = () => upM("languages", [...master.languages, {id:uid(), name:"", level:""}]);
    const upLang = (id, ch) => upM("languages", master.languages.map(l => l.id===id ? {...l,...ch} : l));
    const delLang = (id) => upM("languages", master.languages.filter(l => l.id!==id));

    const addAch = () => upM("achievements", [...master.achievements, {id:uid(), title:"", description:"", date:""}]);
    const upAch = (id, ch) => upM("achievements", master.achievements.map(a => a.id===id ? {...a,...ch} : a));
    const delAch = (id) => upM("achievements", master.achievements.filter(a => a.id!==id));

    const addVol = () => upM("volunteer", [...master.volunteer, {id:uid(), org:"", role:"", startDate:"", endDate:"", description:""}]);
    const upVol = (id, ch) => upM("volunteer", master.volunteer.map(v => v.id===id ? {...v,...ch} : v));
    const delVol = (id) => upM("volunteer", master.volunteer.filter(v => v.id!==id));

    const toggleOpen = (id) => setMasterOpen(o => ({...o, [id]: !o[id]}));

    // Keyword analysis
    const STOP = new Set(["and","or","the","a","an","in","of","to","for","with","on","at","by","from","as","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","can","this","that","their","they","we","you","i","it","its","our","your","which","who","what","when","where","how","not","but","if","than","then","so","yet","both","also","just","more","most","very","too","about","into","each","many","all","any","some","such","no","only","same","other","per","via","able","using"]);
    const getKws = (jd) => new Set(((String(jd || "").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)) || []).filter(w => w.length > 2 && !STOP.has(w)));
    const scoreText = (text, kws) => { if (!kws || !kws.size) return 0; const words = (String(text || "").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)) || []; const uniq = new Set(words.filter(w => kws.has(w))); return Math.min(100, Math.round((uniq.size / kws.size) * 300)); };
    const badge = (score) => score >= 40 ? {label:"Strong match", color:"#10B981"} : score >= 15 ? {label:"Relevant", color:"#F59E0B"} : {label:"Low match", color:"#64748B"};

    const analyzeJD = () => {
      const kws = getKws(jdText);
      setJdKws(kws);
      setTailorSel({
        jobs: Object.fromEntries(master.jobs.map(j => [j.id, true])),
        education: Object.fromEntries(master.education.map(e => [e.id, true])),
        skills: Object.fromEntries(master.skills.map(s => [s.id, true])),
        certifications: Object.fromEntries(master.certifications.map(c => [c.id, true])),
        projects: Object.fromEntries(master.projects.map(p => [p.id, true])),
        languages: Object.fromEntries(master.languages.map(l => [l.id, true])),
        achievements: Object.fromEntries(master.achievements.map(a => [a.id, true])),
      });
    };
    const toggleSel = (group, id) => setTailorSel(s => ({...s, [group]: {...s[group], [id]: !s[group]?.[id]}}));

    const generateTailored = () => {
      const s = tailorSel || {};
      const selJobs = master.jobs.filter(j => s.jobs?.[j.id] !== false);
      const experience = selJobs.map(j => [`${j.title}${j.company ? ` | ${j.company}` : ""}${j.location ? ` | ${j.location}` : ""}${masterJobDateRange(j) ? ` | ${masterJobDateRange(j)}` : ""}`, ...j.bullets.filter(Boolean).map(b => `• ${b}`)].join("\n")).join("\n\n");
      const education = master.education.filter(e => s.education?.[e.id] !== false).map(e => {
        const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
        const head = [e.school, dates].filter(Boolean).join("  |  ");
        const subtitle = `${e.degree || ""}${e.field ? ` in ${e.field}` : ""}`.trim();
        const gpa = e.gpa ? `• GPA ${e.gpa}` : "";
        return [head, subtitle, gpa].filter(Boolean).join("\n");
      }).join("\n\n");
      const skills = master.skills.filter(sk => s.skills?.[sk.id] !== false).map(sk => sk.name).join(", ");
      const certifications = master.certifications.filter(c => s.certifications?.[c.id] !== false).map(c => `${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}`).join("\n");
      const projects = master.projects.filter(p => s.projects?.[p.id] !== false).map(p => `${p.name}${p.tech ? ` | ${p.tech}` : ""}${p.url ? ` | ${p.url}` : ""}${p.description ? `\n${p.description}` : ""}`).join("\n\n");
      const languages = master.languages.filter(l => s.languages?.[l.id] !== false).map(l => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ");
      const achievements = master.achievements.filter(a => s.achievements?.[a.id] !== false).map(a => `${a.title}${a.date ? ` (${a.date})` : ""}${a.description ? ` — ${a.description}` : ""}`).join("\n");
      setForm(f => {
        const next = {...f, name: master.name||f.name, title: master.headline||f.title, email: master.email||f.email, phone: master.phone||f.phone, location: master.location||f.location, linkedin: master.linkedin||f.linkedin, website: master.website||f.website, summary: master.summary||f.summary, experience: experience||f.experience, education: education||f.education, skills: skills||f.skills, certifications: certifications||f.certifications, projects: projects||f.projects, languages: languages||f.languages, achievements: achievements||f.achievements};
        // Re-derive structured entries from the freshly built section strings.
        ["experience","education","skills","certifications","projects","languages"].forEach((key) => {
          const parsed = parseEntries(key, next[key] || "");
          next[key + "Entries"] = parsed;
          next[key] = entriesToText(key, parsed);
        });
        return next;
      });
      setTailorOpen(false); setJdKws(null); setTailorSel(null);
      setNavPage("resume");
      if (tpl) setStep("form"); // stay on form if template already picked
    };

    // Shared styles
    const mi = {width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", fontSize:13.5, color:C.text1, fontFamily:"inherit", outline:"none", boxSizing:"border-box"};
    const lb = {fontSize:12, fontWeight:600, color:C.text2, display:"block", marginBottom:5};
    const g2 = {display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14};

    const totalItems = master.jobs.length + master.education.length + master.skills.length + master.certifications.length + master.projects.length + master.languages.length + master.achievements.length + master.volunteer.length;

    const TABS = [
      {id:"personal", label:ms.tabPersonal},
      {id:"experience", label:ms.tabExperience, count:master.jobs.length},
      {id:"education", label:ms.tabEducation, count:master.education.length},
      {id:"skills", label:ms.tabSkills, count:master.skills.length},
      {id:"more", label:ms.tabMore, count:master.certifications.length+master.projects.length+master.languages.length+master.achievements.length+master.volunteer.length},
    ];

    // Inline selectable item row for tailor panel (avoid nested component)
    const renderSelRow = (item, group, scoreText_val, labelText) => {
      const checked = tailorSel?.[group]?.[item.id] !== false;
      const bd = badge(scoreText_val);
      return (
        <label key={item.id} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, marginBottom:4, cursor:"pointer", background: checked ? `${bd.color}10` : C.surface, border:`1px solid ${checked ? bd.color+"40" : C.border}`, transition:"all 0.12s"}}>
          <input type="checkbox" checked={checked} onChange={() => toggleSel(group, item.id)} style={{accentColor:bd.color, flexShrink:0}} />
          <div style={{flex:1, minWidth:0, fontSize:13, fontWeight:600, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{labelText}</div>
          <span style={{fontSize:10.5, fontWeight:700, color:bd.color, background:`${bd.color}18`, padding:"2px 8px", borderRadius:999, whiteSpace:"nowrap", flexShrink:0}}>{bd.label} · {scoreText_val}%</span>
        </label>
      );
    };

    return (
      <div style={{padding: isMobile ? "16px 12px" : "24px 28px", maxWidth:860, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16, flexWrap:"wrap"}}>
          <div>
            <h2 style={{margin:"0 0 4px", fontSize: isMobile ? 20 : 26, fontWeight:800, color:C.text1, letterSpacing:"-0.5px"}}>{ms.title}</h2>
            <p style={{margin:0, fontSize:13.5, color:C.text2}}>{totalItems > 0 ? `${totalItems} ${ms.subItems}` : ms.subEmpty}</p>
          </div>
          <button onClick={() => setTailorOpen(o => !o)} disabled={totalItems === 0}
            style={{background:C.grad, color:"#fff", border:"none", borderRadius:9, padding:"10px 20px", fontSize:14, fontWeight:700, cursor: totalItems===0 ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity: totalItems===0 ? 0.45 : 1}}>
            ✨ {ms.tailorBtn} →
          </button>
        </div>

        {/* Optional account / cloud-sync strip (free builder is unaffected) */}
        {ACCOUNTS_ENABLED && (
          <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
            background:C.elevated, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:20}}>
            {currentUser ? (<>
              <span style={{fontSize:12.5, color:C.text2}}>{at.signedInAs} <strong style={{color:C.text1}}>{currentUser.email}</strong></span>
              {hasPass && <span style={{fontSize:11, fontWeight:700, color:"#4ade80", background:"#4ade8018", border:"1px solid #4ade8044", borderRadius:999, padding:"2px 10px"}}>{at.passActive}</span>}
              <div style={{flex:1, minWidth:8}} />
              {syncStatus && <span style={{fontSize:12, color:C.text3}}>{syncStatus}</span>}
              <button onClick={handleSyncNow} disabled={totalItems===0}
                style={{background:`${C.accent}18`, color:C.accent2, border:`1px solid ${C.accent}44`, borderRadius:8, padding:"7px 14px", fontSize:12.5, fontWeight:700, cursor: totalItems===0 ? "not-allowed":"pointer", fontFamily:"inherit", opacity: totalItems===0?0.5:1}}>{at.syncNow}</button>
              <button onClick={handleDeleteSavedData} style={{background:"transparent", color:C.text3, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit"}}>{at.deleteSaved}</button>
              <button onClick={handleSignOut} style={{background:"transparent", color:C.text3, border:"none", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit"}}>{at.signOut}</button>
            </>) : (<>
              <span style={{fontSize:12.5, color:C.text2, flex:1, minWidth:180}}>☁️ {at.saveDesc}</span>
              <button onClick={() => setSaveProfileOpen(true)}
                style={{background:`${C.accent}18`, color:C.accent2, border:`1px solid ${C.accent}44`, borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap"}}>{at.saveTitle}</button>
            </>)}
          </div>
        )}

        {/* Tailor Panel */}
        {tailorOpen && (
          <div style={{background:`${C.accent}08`, border:`1.5px solid ${C.accent}40`, borderRadius:14, padding:"20px 22px", marginBottom:24}}>
            <div style={{fontSize:15, fontWeight:800, color:C.text1, marginBottom:4}}>{ms.tailorTitle}</div>
            <div style={{fontSize:13, color:C.text2, marginBottom:14}}>{ms.tailorDesc}</div>
            <textarea value={jdText} onChange={e => { setJdText(e.target.value); setJdKws(null); setTailorSel(null); }}
              placeholder={ms.tailorPh} rows={6}
              style={{...mi, resize:"vertical", lineHeight:1.6, marginBottom:12}} />
            <div style={{display:"flex", gap:10, alignItems:"center", marginBottom: jdKws ? 20 : 0}}>
              <button onClick={analyzeJD} disabled={!jdText.trim()}
                style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13.5, fontWeight:700, cursor: jdText.trim() ? "pointer" : "not-allowed", fontFamily:"inherit", opacity: jdText.trim() ? 1 : 0.5}}>
                {ms.analyze}
              </button>
              {ACCOUNTS_ENABLED && (
                <button onClick={handleAiTailor} disabled={!jdText.trim() || aiTailoring}
                  title={hasPass ? "" : at.upsellTailor}
                  style={{background:"transparent", color:C.accent2, border:`1.5px solid ${C.accent}55`, borderRadius:8, padding:"9px 16px", fontSize:13.5, fontWeight:700, cursor: jdText.trim() && !aiTailoring ? "pointer" : "not-allowed", fontFamily:"inherit", opacity: jdText.trim() ? 1 : 0.5}}>
                  {aiTailoring ? at.tailoring : at.aiTailor}{!hasPass ? " 🔒" : ""}
                </button>
              )}
              {jdKws && <span style={{fontSize:12.5, color:C.text2}}>{jdKws.size} {ms.kwExtracted}</span>}
            </div>

            {tailorSel && jdKws && (
              <div style={{borderTop:`1px solid ${C.border}`, paddingTop:20}}>
                <div style={{fontSize:14, fontWeight:700, color:C.text1, marginBottom:14}}>{ms.selectInclude}</div>
                {master.jobs.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, marginBottom:8}}>{ms.workExperience}</div>{master.jobs.map(j => renderSelRow(j, "jobs", scoreText(j.title+" "+j.company+" "+j.bullets.join(" "), jdKws), `${j.title}${j.company ? " · "+j.company : ""}${masterJobDateRange(j) ? " ("+masterJobDateRange(j)+")" : ""}`))}</>)}
                {master.education.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>{ms.education}</div>{master.education.map(e => renderSelRow(e, "education", scoreText(e.degree+" "+e.field+" "+e.school, jdKws), `${e.degree}${e.field ? " in "+e.field : ""} — ${e.school}`))}</>)}
                {master.skills.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>{ms.skills}</div><div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:4}}>{master.skills.map(sk => { const sc = scoreText(sk.name, jdKws); const bd = badge(sc); const checked = tailorSel.skills?.[sk.id] !== false; return (<button key={sk.id} onClick={() => toggleSel("skills", sk.id)} style={{padding:"5px 12px", borderRadius:999, fontSize:12.5, fontWeight:600, border:`1.5px solid ${checked ? bd.color : C.border}`, background: checked ? `${bd.color}18` : "transparent", color: checked ? bd.color : C.text3, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s"}}>{sk.name}</button>); })}</div></>)}
                {master.projects.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>{ms.projects}</div>{master.projects.map(p => renderSelRow(p, "projects", scoreText(p.name+" "+p.tech+" "+p.description, jdKws), `${p.name}${p.tech ? " · "+p.tech : ""}`))}</>)}
                {master.certifications.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>{ms.certifications}</div>{master.certifications.map(c => renderSelRow(c, "certifications", scoreText(c.name+" "+c.issuer, jdKws), `${c.name}${c.issuer ? " · "+c.issuer : ""}`))}</>)}
                {master.languages.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>{ms.languages}</div>{master.languages.map(l => renderSelRow(l, "languages", scoreText(l.name, jdKws), `${l.name}${l.level ? " ("+l.level+")" : ""}`))}</>)}
                <div style={{display:"flex", gap:10, marginTop:20, flexWrap:"wrap"}}>
                  <button onClick={generateTailored}
                    style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>
                    {ms.generateTailored}
                  </button>
                  <button onClick={() => { setTailorOpen(false); setJdKws(null); setTailorSel(null); setJdText(""); }}
                    style={{background:"transparent", color:C.text2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 16px", fontSize:13.5, cursor:"pointer", fontFamily:"inherit"}}>
                    {ms.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex", gap:0, marginBottom:24, borderBottom:`1px solid ${C.border}`, overflowX:"auto"}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMasterTab(tab.id)}
              style={{padding:"9px 16px", fontSize:13, fontWeight: masterTab===tab.id ? 700 : 500, color: masterTab===tab.id ? C.accent2 : C.text2, background:"none", border:"none", borderBottom:`2px solid ${masterTab===tab.id ? C.accent : "transparent"}`, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", marginBottom:-1, transition:"color 0.15s"}}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{marginLeft:6, fontSize:10.5, fontWeight:700, color: masterTab===tab.id ? C.accent : C.text3, background: masterTab===tab.id ? `${C.accent}18` : C.elevated, padding:"1px 6px", borderRadius:999, border:`1px solid ${C.border}`}}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Personal tab */}
        {masterTab === "personal" && (
          <div>
            <div style={g2}>
              {[["name",masterText("fullName"),"Alexandra Johnson"],["headline",masterText("headline"),"Senior Product Designer"],["email",masterText("email"),"alex@email.com"],["phone",masterText("phone"),"+1 415 555 0000"],["location",masterText("location"),"San Francisco, CA"],["linkedin",masterText("linkedin"),"linkedin.com/in/alexj"],["website",masterText("website"),"alexj.design"]].map(([k,label,ph]) => (
                <div key={k}>
                  <label style={lb}>{label}</label>
                  <input value={master[k]||""} onChange={mField(k)} placeholder={ph} style={mi} />
                </div>
              ))}
            </div>
            <div style={{marginTop:14}}>
              <label style={lb}>{masterText("summaryLabel")}</label>
              <textarea value={master.summary||""} onChange={mField("summary")} placeholder={masterText("summaryPh")} rows={4} style={{...mi, resize:"vertical", lineHeight:1.6}} />
            </div>
          </div>
        )}

        {/* Experience tab */}
        {masterTab === "experience" && (
          <div>
            {master.jobs.length === 0 && <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>{masterText("noWork")}</div>}
            {master.jobs.map(job => (
              <div key={job.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, marginBottom:10, overflow:"hidden"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", userSelect:"none"}} onClick={() => toggleOpen(job.id)}>
                  <span style={{color:C.text3, fontSize:12, display:"inline-block", transform: masterOpen[job.id] ? "rotate(90deg)" : "none", transition:"transform 0.15s"}}>▶</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:700, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{job.title||masterText("untitledRole")}{job.company ? ` · ${job.company}` : ""}</div>
                    {(job.startDate||job.endDate||job.current||job.isCurrent) && <div style={{fontSize:11.5, color:C.text3, marginTop:1}}>{masterJobDateRange(job)}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); delJob(job.id); }} style={{background:"none", border:"none", color:C.danger, cursor:"pointer", fontSize:13, padding:"4px 6px", borderRadius:6, fontFamily:"inherit", opacity:0.7}}>✕</button>
                </div>
                {masterOpen[job.id] && (
                  <div style={{padding:"0 14px 16px", borderTop:`1px solid ${C.border}`}}>
                    <div style={{...g2, marginTop:14}}>
                      {[["title",masterText("jobTitle"),"Software Engineer"],["company",masterText("company"),"Stripe"],["startDate",masterText("startDate"),"Jan 2022"],["location",masterText("location"),"Remote"]].map(([k,label,ph]) => (
                        <div key={k}><label style={lb}>{label}</label><input value={job[k]||""} onChange={e => upJob(job.id, {[k]:e.target.value})} placeholder={ph} style={mi} /></div>
                      ))}
                      <div>
                        <label style={lb}>{masterText("endDate")}</label>
                        <input value={job.endDate||""} onChange={e => upJob(job.id, {endDate:e.target.value})} placeholder={presentLabel(docLang)} disabled={job.current || job.isCurrent} style={{...mi, opacity: (job.current || job.isCurrent) ? 0.45 : 1}} />
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:8, paddingTop:22}}>
                        <input type="checkbox" id={`cur_${job.id}`} checked={!!(job.current || job.isCurrent)} onChange={e => upJob(job.id, {current:e.target.checked, isCurrent:e.target.checked, endDate:""})} style={{accentColor:C.accent}} />
                        <label htmlFor={`cur_${job.id}`} style={{fontSize:13, color:C.text2, cursor:"pointer"}}>{eui.currentRole || "I currently work here"}</label>
                      </div>
                    </div>
                    <div style={{marginTop:16}}>
                      <label style={lb}>{masterText("achievements")}</label>
                      {job.bullets.map((b, bi) => (
                        <div key={bi} style={{display:"flex", gap:8, marginBottom:6, alignItems:"center"}}>
                          <span style={{color:C.text3, fontSize:16, flexShrink:0, lineHeight:"38px"}}>•</span>
                          <input value={b} onChange={e => upJobBullet(job.id, bi, e.target.value)} placeholder={masterText("bulletPh")} style={{...mi, flex:1}} />
                          <button onClick={() => delJobBullet(job.id, bi)} style={{background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:14, padding:"4px 6px", flexShrink:0, fontFamily:"inherit"}}>✕</button>
                        </div>
                      ))}
                      <button onClick={() => addJobBullet(job.id)} style={{marginTop:4, background:"none", border:`1px dashed ${C.border}`, borderRadius:7, padding:"6px 12px", fontSize:12.5, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addBullet")}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addJob} style={{width:"100%", background:C.surface, border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"11px", fontSize:13.5, color:C.text2, cursor:"pointer", fontFamily:"inherit", marginTop:4}}>{masterText("addWork")}</button>
          </div>
        )}

        {/* Education tab */}
        {masterTab === "education" && (
          <div>
            {master.education.length === 0 && <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>{masterText("noEducation")}</div>}
            {master.education.map(edu => (
              <div key={edu.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, marginBottom:10, overflow:"hidden"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", userSelect:"none"}} onClick={() => toggleOpen(edu.id)}>
                  <span style={{color:C.text3, fontSize:12, display:"inline-block", transform: masterOpen[edu.id] ? "rotate(90deg)" : "none", transition:"transform 0.15s"}}>▶</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:700, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{edu.degree||masterText("degree")}{edu.field ? ` in ${edu.field}` : ""}{edu.school ? ` · ${edu.school}` : ""}</div>
                    {edu.endDate && <div style={{fontSize:11.5, color:C.text3, marginTop:1}}>{edu.endDate}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); delEdu(edu.id); }} style={{background:"none", border:"none", color:C.danger, cursor:"pointer", fontSize:13, padding:"4px 6px", borderRadius:6, fontFamily:"inherit", opacity:0.7}}>✕</button>
                </div>
                {masterOpen[edu.id] && (
                  <div style={{padding:"0 14px 16px", borderTop:`1px solid ${C.border}`}}>
                    <div style={{...g2, marginTop:14}}>
                      {[["school",masterText("schoolUniversity"),"MIT"],["degree",masterText("degree"),"B.Sc."],["field",masterText("fieldOfStudy"),"Computer Science"],["endDate",masterText("graduationYear"),"2024"],["gpa",masterText("gpaOptional"),"3.8 / 4.0"]].map(([k,label,ph]) => (
                        <div key={k}><label style={lb}>{label}</label><input value={edu[k]||""} onChange={e => upEdu(edu.id, {[k]:e.target.value})} placeholder={ph} style={mi} /></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addEdu} style={{width:"100%", background:C.surface, border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"11px", fontSize:13.5, color:C.text2, cursor:"pointer", fontFamily:"inherit", marginTop:4}}>{masterText("addEducation")}</button>
          </div>
        )}

        {/* Skills tab */}
        {masterTab === "skills" && (
          <div>
            <div style={{marginBottom:20}}>
              <label style={lb}>{masterText("addSkill")}</label>
              <div style={{display:"flex", gap:8}}>
                <input value={skillDraft} onChange={e => setSkillDraft(e.target.value)} onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); addSkill(skillDraft); } }} placeholder={masterText("skillPh")} style={{...mi, flex:1}} />
                <button onClick={() => addSkill(skillDraft)} disabled={!skillDraft.trim()} style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13.5, fontWeight:700, cursor: skillDraft.trim() ? "pointer" : "not-allowed", fontFamily:"inherit", flexShrink:0, opacity: skillDraft.trim() ? 1 : 0.5}}>{masterText("addBtn")}</button>
              </div>
              <div style={{fontSize:11.5, color:C.text3, marginTop:5}}>{masterText("pressEnter")}</div>
            </div>
            {master.skills.length > 0 ? (
              <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
                {master.skills.map(s => (
                  <div key={s.id} style={{display:"flex", alignItems:"center", gap:5, background:`${C.accent}14`, border:`1px solid ${C.accent}30`, borderRadius:999, padding:"5px 10px 5px 14px", fontSize:13, color:C.accent2, fontWeight:600}}>
                    {s.name}
                    <button onClick={() => delSkill(s.id)} style={{background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:12, padding:0, lineHeight:1, fontFamily:"inherit"}}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>{masterText("noSkills")}</div>
            )}
            {master.skills.length > 0 && <div style={{marginTop:12, fontSize:12.5, color:C.text3}}>{masterText(master.skills.length === 1 ? "skillCountOne" : "skillCountOther", { count: master.skills.length })}</div>}
          </div>
        )}

        {/* More tab */}
        {masterTab === "more" && (
          <div>
            {/* Certifications */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>{masterText("certifications")}</span>
                <button onClick={addCert} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addShort")}</button>
              </div>
              {master.certifications.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>{masterText("noneAdded")}</div>}
              {master.certifications.map(c => (
                <div key={c.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>{masterText("certName")}</label><input value={c.name||""} onChange={e => upCert(c.id, {name:e.target.value})} placeholder="AWS Solutions Architect" style={mi} /></div>
                    <div><label style={lb}>{masterText("issuingOrg")}</label><input value={c.issuer||""} onChange={e => upCert(c.id, {issuer:e.target.value})} placeholder="Amazon Web Services" style={mi} /></div>
                    <div><label style={lb}>{masterText("dateLabel")}</label><input value={c.date||""} onChange={e => upCert(c.id, {date:e.target.value})} placeholder="March 2024" style={mi} /></div>
                    <div><label style={lb}>{masterText("urlOptional")}</label><input value={c.url||""} onChange={e => upCert(c.id, {url:e.target.value})} placeholder={masterText("credentialLinkPh")} style={mi} /></div>
                  </div>
                  <button onClick={() => delCert(c.id)} style={{fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>{masterText("remove")}</button>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>{masterText("projects")}</span>
                <button onClick={addProject} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addShort")}</button>
              </div>
              {master.projects.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>{masterText("noneAdded")}</div>}
              {master.projects.map(p => (
                <div key={p.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>{masterText("projectName")}</label><input value={p.name||""} onChange={e => upProject(p.id, {name:e.target.value})} placeholder="Portfolio website" style={mi} /></div>
                    <div><label style={lb}>{masterText("techStack")}</label><input value={p.tech||""} onChange={e => upProject(p.id, {tech:e.target.value})} placeholder="React, Node.js, PostgreSQL" style={mi} /></div>
                  </div>
                  <div style={{marginBottom:10}}><label style={lb}>{masterText("descriptionLabel")}</label><textarea value={p.description||""} onChange={e => upProject(p.id, {description:e.target.value})} placeholder={masterText("descImpactPh")} rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <div style={{marginBottom:8}}><label style={lb}>{masterText("urlOptional")}</label><input value={p.url||""} onChange={e => upProject(p.id, {url:e.target.value})} placeholder="github.com/..." style={mi} /></div>
                  <button onClick={() => delProject(p.id)} style={{fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>{masterText("remove")}</button>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>{masterText("languages")}</span>
                <button onClick={addLang} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addShort")}</button>
              </div>
              {master.languages.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>{masterText("noneAdded")}</div>}
              {master.languages.map(l => (
                <div key={l.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:8}}>
                    <div><label style={lb}>{masterText("language")}</label><input value={l.name||""} onChange={e => upLang(l.id, {name:e.target.value})} placeholder="Spanish" style={mi} /></div>
                    <div><label style={lb}>{masterText("proficiency")}</label>
                      <select value={l.level||""} onChange={e => upLang(l.id, {level:e.target.value})} style={{...mi, cursor:"pointer"}}>
                        <option value="">{masterText("selectLevel")}</option>
                        {[["Native","levelNative"],["Fluent","levelFluent"],["Advanced","levelAdvanced"],["Intermediate","levelIntermediate"],["Basic","levelBasic"]].map(([lv,lk]) => <option key={lv} value={lv}>{masterText(lk)}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => delLang(l.id)} style={{fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>{masterText("remove")}</button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>{masterText("awardsTitle")}</span>
                <button onClick={addAch} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addShort")}</button>
              </div>
              {master.achievements.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>{masterText("noneAdded")}</div>}
              {master.achievements.map(a => (
                <div key={a.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>{masterText("awardName")}</label><input value={a.title||""} onChange={e => upAch(a.id, {title:e.target.value})} placeholder="Employee of the Year" style={mi} /></div>
                    <div><label style={lb}>{masterText("dateOptional")}</label><input value={a.date||""} onChange={e => upAch(a.id, {date:e.target.value})} placeholder="2023" style={mi} /></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={lb}>{masterText("descriptionOptional")}</label><textarea value={a.description||""} onChange={e => upAch(a.id, {description:e.target.value})} placeholder={masterText("briefDescPh")} rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <button onClick={() => delAch(a.id)} style={{fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>{masterText("remove")}</button>
                </div>
              ))}
            </div>

            <React.Suspense fallback={null}><EvidenceLibrary locale={lang} items={master.careerEvidence || []} onChange={(careerEvidence) => setMaster((current) => ({ ...current, careerEvidence }))} /></React.Suspense>

            {/* Volunteer */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>{masterText("volunteerTitle")}</span>
                <button onClick={addVol} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>{masterText("addShort")}</button>
              </div>
              {master.volunteer.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>{masterText("noneAdded")}</div>}
              {master.volunteer.map(v => (
                <div key={v.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>{masterText("organization")}</label><input value={v.org||""} onChange={e => upVol(v.id, {org:e.target.value})} placeholder="Red Cross" style={mi} /></div>
                    <div><label style={lb}>{masterText("role")}</label><input value={v.role||""} onChange={e => upVol(v.id, {role:e.target.value})} placeholder="Event Coordinator" style={mi} /></div>
                    <div><label style={lb}>{masterText("startDate")}</label><input value={v.startDate||""} onChange={e => upVol(v.id, {startDate:e.target.value})} placeholder="Jan 2022" style={mi} /></div>
                    <div><label style={lb}>{masterText("endDate")}</label><input value={v.endDate||""} onChange={e => upVol(v.id, {endDate:e.target.value})} placeholder={presentLabel(docLang)} style={mi} /></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={lb}>{masterText("descriptionLabel")}</label><textarea value={v.description||""} onChange={e => upVol(v.id, {description:e.target.value})} placeholder={masterText("volDescImpactPh")} rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <button onClick={() => delVol(v.id)} style={{fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>{masterText("remove")}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })();

  let pageBody;
  if (navPage === "resume") pageBody = step === "form" ? (formContent || mainContent) : mainContent;
  else if (navPage === "cover") pageBody = coverStep === "form" ? (coverFormContent || coverTemplatesContent) : coverTemplatesContent;
  else if (navPage === "master") pageBody = masterContent;
  else if (navPage === "tracker") pageBody = trackerContent;
  else if (navPage === "ats") pageBody = <ATSPage />;
  else if (navPage === "about") pageBody = <AboutPage />;
  else pageBody = <ComingSoon id={navPage} label={NAV.find(n => n.id === navPage)?.label || ""} />;

  // Two-column independent scroll: only on desktop, resume form view
  const isFormView = useMemo(() =>
    !isMobile && (
      (navPage === "resume" && step === "form" && !!tpl) ||
      (navPage === "cover" && coverStep === "form" && !!coverTpl)
    ),
    [isMobile, navPage, step, tpl, coverStep, coverTpl]
  );
  const isFocusedToolView = isTemplateGalleryView ||
    (navPage === "cover" && coverStep === "templates") ||
    navPage === "tracker" ||
    navPage === "ats";
  const isImmersiveAppView = isFormView || isFocusedToolView;

  // ── Landing page ──────────────────────────────────────────────────
  if (appView === "landing") {
    const enter = (page) => {
      if (page === "resume") startResume("landing_link");
      else { setNavPage(page); setAppView("app"); }
    };
    return (
      <div style={{ background: C.bg, color: C.text1, minHeight: "100vh", fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif", overflowX: "hidden" }}>
        <style>{`
          .ac-hero-grid :where(*) { min-width: 0; }
          .ac-hero-visual { max-width: 100%; }
          @media (max-width: 900px) {
            .ac-hero-grid {
              grid-template-columns: minmax(0, 1fr) !important;
              gap: 34px !important;
              padding: 112px 20px 52px !important;
            }
            .ac-hero-text { text-align: center !important; }
            .ac-hero-text p { margin-inline: auto !important; }
            .ac-hero-text div { justify-content: center !important; }
            .ac-hero-visual { width: min(100%, 560px); margin-inline: auto; }
          }
        `}</style>
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusMsg}</div>
        {/* Nav */}
        <SharedSiteHeader
          lang={lang}
          onLogoClick={() => setAppView("landing")}
          onCtaClick={() => startResume("nav_cta")}
          currentPath={location.pathname}
          onLanguageSelect={setSiteLanguage}
          mobileMenuOpen={landingMenuOpen}
          onMobileMenuToggle={() => setLandingMenuOpen(o => !o)}
          onNavigate={(item) => { setLandingMenuOpen(false); setAppView("app"); enterPrimaryTool(item); }}
        />
        <AuthModal open={authModal} initialTab={authModalTab} onClose={() => setAuthModal(false)} at={at}
          onLogin={user => {
            try { localStorage.setItem("ac_account", JSON.stringify(user)); } catch { /* noop */ }
            setCurrentUser(user); setAuthModal(false);
            if (pendingSaveRef.current) { pendingSaveRef.current = false; doSaveResume(); }
          }} />
        {ACCOUNTS_ENABLED && <SaveProfileModal open={saveProfileOpen} onClose={() => setSaveProfileOpen(false)} at={at} rtl={rtl} C={C} lang={lang} />}
        {ACCOUNTS_ENABLED && <UpsellModal feature={upsell} onClose={() => setUpsell(null)} onGetPass={handleStartCheckout} at={at} rtl={rtl} C={C} />}
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} lang={lang} />
        <UploadResumeModal
          lang={lang}
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onImprove={async (file, email) => {
            setUploadedResume(file);
            setUploadModalOpen(false);
            setStatusMsg(st.readingResume);
            try {
              const [{ extractResumeText }, { parseResume }] = await Promise.all([
                import("./ats/extractText.js"),
                import("./ats/parseResume.js"),
              ]);
              const text = await extractResumeText(file);
              const parsed = parseResume(text);
              if (email) parsed.email = parsed.email || email;
              hydrateFromParsed(parsed);
              openPostImportTemplatePicker();
              setStatusMsg(st.importedReview);
            } catch {
              if (email) setForm(f => ({ ...f, email: email || f.email }));
              setStatusMsg(st.couldntReadAuto);
            }
            startResume("resume_upload");
            setTimeout(() => setStatusMsg(""), 3500);
          }}
        />

        {/* Coming soon modal */}
        {comingSoonFeature && (
          <div onClick={() => setComingSoonFeature(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: "36px 32px", maxWidth: 400, width: "100%", textAlign: "center",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: C.text1 }}>
                {comingSoonFeature}
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: C.text2, lineHeight: 1.6 }}>
                {lx.comingSoonBody}
              </p>
              <button onClick={() => setComingSoonFeature(null)}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 10,
                  padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit" }}>
                {lx.gotIt}
              </button>
            </div>
          </div>
        )}

        {/* The skip link in index.html targets #main-content; tabIndex -1 lets it
            actually receive focus when the link is activated. */}
        <main id="main-content" tabIndex={-1}>
        {/* Hero */}
        <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${C.glow} 0%, transparent 70%)` }}>
          <div className="ac-hero-grid" style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "108px 20px 48px" : "144px 24px 72px",
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.02fr 0.98fr",
            gap: isMobile ? 34 : 52, alignItems: "center" }}>
            <div className="ac-hero-text" style={{ textAlign: isMobile ? "center" : "left" }}>
              <div style={{ animation: isMobile ? "none" : "acFadeUp 0.6s ease 0.05s both", display: "inline-block",
                fontSize: 12, fontWeight: 600, letterSpacing: "2px",
                textTransform: "uppercase", color: C.accent2, background: `${C.accent}18`,
                border: `1px solid ${C.accent}44`, borderRadius: 999, padding: "4px 14px", marginBottom: 24 }}>
                {lx.heroEyebrow}
              </div>
              <h1 style={{ animation: isMobile ? "none" : "acFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both",
                fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 800, lineHeight: 1.08,
                letterSpacing: "-0.8px", margin: "0 0 22px",
                background: "linear-gradient(135deg, #EEF2FF 0%, #94A3B8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {positioning.headline}
              </h1>
              <p style={{ animation: isMobile ? "none" : "acFadeUp 0.65s ease 0.34s both",
                fontSize: "clamp(16px, 2vw, 19px)", color: C.text2, maxWidth: 590,
                margin: isMobile ? "0 auto 34px" : "0 0 34px", lineHeight: 1.65 }}>
                {positioning.supportingText}
              </p>
              <div style={{ animation: isMobile ? "none" : "acFadeUp 0.65s ease 0.5s both",
                display: "flex", gap: 12, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              <a href={localizeRoute("/resume-builder/", lang)}
                onClick={(event) => handleRouteLink(event, () => { track(EVENTS.HERO_CTA_CLICKED, { location: "hero" }); startResume("hero_primary"); })}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  animation: isMobile ? "none" : "acPulse 2.8s ease-in-out 1.4s infinite",
                  transition: "opacity 0.2s", fontFamily: "inherit", textDecoration: "none" }}>
                {positioning.primaryCta}
              </a>
              <a href={localizeRoute("/ats-checker/", lang)}
                onClick={(event) => handleRouteLink(event, () => enter("ats"))}
                style={{ background: "transparent", color: C.text2, border: `1.5px solid ${C.border}`,
                  borderRadius: 3, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s", fontFamily: "inherit", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent2; e.currentTarget.style.color = C.accent2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
                {positioning.secondaryCta}
              </a>
              </div>
              {/* Trust row */}
              <div style={{ animation: isMobile ? "none" : "acFadeUp 0.5s ease 0.65s both",
                display: "flex", gap: 16, justifyContent: isMobile ? "center" : "flex-start",
                flexWrap: "wrap", marginTop: 24 }}>
                {positioning.trustItems.map(t => (
                  <span key={t} style={{ fontSize: 12.5, color: C.text3 }}>{t}</span>
                ))}
              </div>

              {/* Upload existing resume */}
              <div style={{ marginTop: 34, maxWidth: 430,
                marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: "1px",
                  textTransform: "uppercase", whiteSpace: "nowrap" }}>{lx.orImprove}</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <button onClick={() => setUploadModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  border: `2px dashed ${C.border}`, borderRadius: C.radiusLg,
                  padding: "18px 24px", width: "100%", background: C.surface,
                  transition: "border-color 0.2s, background 0.2s", fontFamily: "inherit",
                  textAlign: "left" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: `${C.accent}14`, border: `1px solid ${C.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="upload" size={22} color={C.accent2} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 3 }}>
                    {lx.uploadResume}
                  </div>
                  <div style={{ fontSize: 12, color: C.text3 }}>
                    {lx.uploadHint}
                  </div>
                </div>
                <LineIcon name="upload" size={18} color={C.text3} style={{ marginLeft: "auto" }} />
              </button>
              </div>
            </div>
            <div className="ac-hero-visual" style={{ animation: isMobile ? "none" : "acFadeUp 0.65s ease 0.42s both" }}>
              <HeroResumePreview isMobile={isMobile} lang={lang} />
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ background: C.surface, padding: "28px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto",
            display: "flex", justifyContent: "space-around", alignItems: "center",
            flexWrap: "wrap", gap: "16px 32px" }}>
            {[
              { n: `${RESUME_TEMPLATE_COUNT}`, label: lx.statTemplates },
              { n: `${COVER_TEMPLATE_COUNT}`, label: lx.statCover },
              { n: `${LOCALIZED_DOCUMENT_LANGUAGE_COUNT}`, label: lx.statDocLangs },
              { n: "2", label: lx.statFormats },
              { n: "∞", label: lx.statDownloads },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, lineHeight: 1,
                  background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.n}</div>
                <div style={{ fontSize: 11.5, color: C.text3, marginTop: 5, textTransform: "uppercase",
                  letterSpacing: "0.8px", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full workflow UI is a small below-the-fold chunk; its public route is
            crawlable even before hydration and links to every real tool. */}
        <DeferredApplicationPack locale={lang} mobile={isMobile} />

        <DeferredInteractiveResumeDemo
          isMobile={isMobile}
          copy={l2.demo}
          closeLabel={builderText("closeExpandedPreview")}
          onContinue={(demo) => {
            setForm(f => {
              const expStr = demo.achievement || f.experience;
              const parsed = parseEntries("experience", expStr);
              return {
                ...f,
                name: demo.name || f.name,
                title: demo.title || f.title,
                experience: entriesToText("experience", parsed),
                experienceEntries: parsed,
              };
            });
            const nextTpl = TEMPLATES.find(t => t.id === demo.templateId) || recommendedTemplate;
            if (nextTpl) setTpl(nextTpl);
            const nextLang = WORLD_LANGUAGES.find(l => l.code === demo.langCode);
            if (nextLang && SITE_LANGUAGE_CODES.has(nextLang.code)) setSiteLanguage(nextLang);
            startResume("interactive_demo");
          }}
        />

        {/* Why job seekers choose ApplyCraft */}
        <FadeIn>
          <section aria-labelledby="why-applycraft-title" style={{ padding: isMobile ? "56px 16px" : "72px 24px 32px" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>{why.eyebrow}</p>
                <h2 id="why-applycraft-title" style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800,
                  letterSpacing: "-0.8px", color: C.text1, margin: 0, lineHeight: 1.15 }}>
                  {why.title}
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                {why.items.map((item) => (
                  <div key={item.t} style={{ background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: 18, minHeight: 128 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${C.accent}16`,
                      border: `1px solid ${C.accent}30`, color: C.accent2, display: "flex",
                      alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <LineIcon name={item.icon} size={18} />
                    </div>
                    <h3 style={{ fontSize: 15, color: C.text1, margin: "0 0 7px", lineHeight: 1.25 }}>{item.t}</h3>
                    <p style={{ fontSize: 13, color: C.text2, margin: 0, lineHeight: 1.55 }}>{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Master Profile teaser */}
        <FadeIn>
          <div style={{ padding: "72px 24px 80px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto", display: "flex",
              flexDirection: isMobile ? "column" : "row", gap: isMobile ? 32 : 64,
              alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{l2.mp.eyebrow}</p>
                <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 800,
                  letterSpacing: "-0.8px", color: C.text1, margin: "0 0 16px", lineHeight: 1.2 }}>
                  {l2.mp.t1}<br />{l2.mp.t2}
                </h2>
                <p style={{ fontSize: 16, color: C.text2, lineHeight: 1.75, margin: "0 0 28px" }}>
                  {l2.mp.desc}
                </p>
                <a href="/master-profile/"
                  onClick={(event) => handleRouteLink(event, () => enter("master"))}
                  style={{ padding: "12px 28px", background: C.grad, border: "none", borderRadius: 10,
                    color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accent}44`, display: "inline-block", textDecoration: "none" }}>
                  {l2.mp.btn}
                </a>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 12,
                width: isMobile ? "100%" : 280 }}>
                {[
                  { icon: "📋", step: "1", text: l2.mp.s1 },
                  { icon: "📋", step: "2", text: l2.mp.s2 },
                  { icon: "⭐", step: "3", text: l2.mp.s3 },
                  { icon: "📄", step: "4", text: l2.mp.s4 },
                ].map(({ icon, step, text }) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 16px", background: C.elevated,
                    borderRadius: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.grad,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {step}
                    </div>
                    <div style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.5 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* How it works */}
        <div style={{ padding: "72px 24px 80px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{l2.hiw.eyebrow}</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: "0 0 52px" }}>
                {l2.hiw.title}
              </h2>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
              {[
                { n: "1", title: l2.hiw.s1t, desc: l2.hiw.s1d.replace("{n}", RESUME_TEMPLATE_COUNT) },
                { n: "2", title: l2.hiw.s2t, desc: l2.hiw.s2d },
                { n: "3", title: l2.hiw.s3t, desc: l2.hiw.s3d },
              ].map((s, i) => (
                <FadeIn key={s.n} delay={i * 120} style={{ textAlign: "center", padding: "0 28px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.grad,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 auto 18px" }}>{s.n}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.7 }}>{s.desc}</div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={400} style={{ textAlign: "center", marginTop: 44 }}>
              <a href={localizeRoute("/resume/templates/", lang)}
                onClick={(event) => handleRouteLink(event, () => { setStep("templates"); setNavPage("resume"); setAppView("app"); })}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "13px 30px", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                  transition: "opacity 0.2s, transform 0.2s", display: "inline-block", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
                {l2.hiw.browse}
              </a>
            </FadeIn>
          </div>
        </div>

        {/* Template strip */}
        <div style={{ padding: "0 24px 100px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.text3, marginBottom: 40 }}>{RESUME_TEMPLATE_COUNT} {l2.strip.suffix}</p>
            </FadeIn>
            {(() => {
              const q = tplSearch.trim().toLowerCase();
              const all = TEMPLATES.filter(t => !t.blank).slice(0, RESUME_TEMPLATE_COUNT).filter(t =>
                !q || t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q)
              );
              const visible = all.slice(0, 6);
              if (visible.length === 0) return (
                <div style={{ textAlign: "center", padding: "60px 0", color: C.text3 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text2 }}>{l2.strip.noMatch} "{tplSearch}"</div>
                  <button onClick={() => setTplSearch("")}
                    style={{ marginTop: 12, fontSize: 13, color: C.accent2, background: "none",
                      border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    {l2.strip.clearSearch}
                  </button>
                </div>
              );
              return (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 32 }}>
              {visible.map((tp, i) => (
                <FadeIn key={tp.id} delay={i * 60}>
                  <div
                    style={{ background: "transparent", border: "none", borderRadius: 0,
                      overflow: "visible", padding: 0, width: "100%",
                      transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
                      fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-7px) scale(1.015)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                    <div style={{ borderRadius: 0, overflow: "hidden",
                      boxShadow: "0 4px 22px rgba(0,0,0,0.38)",
                      transition: "box-shadow 0.22s ease" }}>
                      <ThumbPreview tp={tp} isMobile={false} />
                    </div>
                    <div style={{ padding: "10px 4px 0" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{tp.name}</div>
                      <div style={{ fontSize: 11.5, color: C.text2, marginTop: 2 }}>{templateTagText(tp)}</div>
                      <a href={routeWithParam("/resume-builder/", lang, "template", tp.id)}
                        onClick={(event) => handleRouteLink(event, () => startWithTemplate(tp, "landing_template"))}
                        style={{ marginTop: 8, minHeight: 36, borderRadius: 6, border: `1px solid ${C.borderHi}`,
                          background: `${C.accent}12`, color: C.accent2, fontSize: 12.5, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", padding: "7px 11px", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                        {bu.useTemplate}
                      </a>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={420} style={{ textAlign: "center", marginTop: 48 }}>
              <a href={localizeRoute("/resume/templates/", lang)}
                onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; e.preventDefault(); browseTemplates("how_it_works"); }}
                style={{ display: "inline-block", textDecoration: "none", background: "transparent",
                  border: `1.5px solid ${C.borderHi}`,
                  borderRadius: 3, padding: "13px 36px", fontSize: 14.5, fontWeight: 600,
                  color: C.text1, cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.borderHi}18`; e.currentTarget.style.borderColor = C.accent2; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.borderHi; }}>
                {l2.strip.browseAllPre} {RESUME_TEMPLATE_COUNT} {l2.strip.browseAllSuf}
              </a>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 10 }}>
                {all.length > 6 ? `${l2.strip.showingPre} ${all.length} ${l2.strip.templatesWord}` : `${all.length} ${l2.strip.templatesWord} ${l2.strip.foundSuf}`}
              </div>
            </FadeIn>
              </>);
            })()}
          </div>
        </div>

        {/* Free pledge */}
        <FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${C.accent}14 0%, ${C.accent2}08 100%)`,
            padding: "80px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2.5px", color: C.accent2, marginBottom: 16 }}>{l2.pledge.eyebrow}</div>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
                letterSpacing: "-1px", color: C.text1, margin: "0 0 16px", lineHeight: 1.15 }}>
                {l2.pledge.t1} <span style={{ background: C.grad,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{l2.pledge.hi}</span>
              </h2>
              <p style={{ fontSize: 16, color: C.text2, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 560 }}>
                {l2.pledge.desc}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {l2.pledge.chips.map(c => `✓ ${c}`).map(t => (
                  <span key={t} style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 16px",
                    borderRadius: 999, border: `1.5px solid ${C.accent}44`,
                    color: C.accent2, background: `${C.accent}12` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Comparison — why we stand out */}
        <FadeIn>
          <div style={{ padding: isMobile ? "56px 16px" : "80px 24px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2.5px", color: C.accent2, marginBottom: 14 }}>{l2.cmp.eyebrow}</div>
                <h2 style={{ fontSize: "clamp(24px, 3.2vw, 38px)", fontWeight: 800,
                  letterSpacing: "-0.8px", color: C.text1, margin: "0 0 12px", lineHeight: 1.15 }}>
                  {l2.cmp.title}
                </h2>
                <p style={{ fontSize: 15.5, color: C.text2, lineHeight: 1.7, margin: "0 auto", maxWidth: 560 }}>
                  {l2.cmp.desc}
                </p>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflowX: "auto" }}>
                <table style={{ width: "100%", maxWidth: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 0 }}>
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: isMobile ? "46%" : "52%", padding: isMobile ? "12px" : "16px 22px", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.text3, fontSize: 12 }}>{l2.cmp.feature || "Feature"}</span>
                      </th>
                      <th scope="col" style={{ width: isMobile ? "24%" : "22%", padding: isMobile ? "12px 8px" : "16px 14px", textAlign: "center", borderBottom: `1px solid ${C.border}`, color: C.accent2, fontSize: isMobile ? 12 : 13.5 }}>
                        ApplyCraft
                      </th>
                      <th scope="col" style={{ width: isMobile ? "30%" : "26%", padding: isMobile ? "12px 8px" : "16px 14px", textAlign: "center", borderBottom: `1px solid ${C.border}`, color: C.text3, fontSize: isMobile ? 11 : 12.5 }}>
                        {l2.cmp.col2}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {l2.cmp.rows.map(([label, other], i, arr) => (
                      <tr key={label}>
                        <th scope="row" style={{ padding: isMobile ? "11px 12px" : "13px 22px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", textAlign: "left", color: C.text1, fontSize: isMobile ? 13 : 14.5, fontWeight: 600, lineHeight: 1.35 }}>
                          {label}
                        </th>
                        <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", textAlign: "center", color: SECTION_TOKENS.statusComplete, fontSize: 17, fontWeight: 800 }} aria-label={l2.cmp.included}>
                          ✓
                        </td>
                        <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", textAlign: "center", color: C.text3, fontSize: isMobile ? 11 : 12.5, lineHeight: 1.35 }}>
                          {other}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ textAlign: "center", fontSize: 12.5, color: C.text3, margin: "16px auto 0", maxWidth: 560 }}>
                {l2.cmp.footnote}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Multilingual superpowers */}
        <div style={{ background: C.surface, padding: "72px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{l2.ml.eyebrow}</p>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1px",
                color: C.text1, margin: "0 0 16px" }}>{l2.ml.title}</h2>
              <p style={{ fontSize: 15.5, color: C.text2, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
                {l2.ml.desc.replace("{docs}", LOCALIZED_DOCUMENT_LANGUAGE_COUNT).replace("{ui}", UI_LANGUAGE_COUNT)}
              </p>
              {/* Knowing these markets is the other half of the multilingual
                  claim, so point at the guides. localizeRoute keeps the link in
                  the current locale (ar falls back to /blog/ until it exists). */}
              {l2.ml.guides ? (
                <p style={{ fontSize: 14, margin: "14px auto 0", maxWidth: 560 }}>
                  <a href={localizeRoute("/blog/", lang)} style={{ color: C.accent2, fontWeight: 700 }}>
                    {l2.ml.guides}
                  </a>
                </p>
              ) : null}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 16 }}>
              {l2.ml.cards.map((c) => ({ icon: c.icon, title: c.t.replace("{docs}", LOCALIZED_DOCUMENT_LANGUAGE_COUNT).replace("{ui}", UI_LANGUAGE_COUNT), desc: c.d.replace("{docs}", LOCALIZED_DOCUMENT_LANGUAGE_COUNT).replace("{ui}", UI_LANGUAGE_COUNT) })).map((f, i) => {
                const icons = ["globe", "document", "arrowRight", "check", "document"];
                f.icon = icons[i] || "check";
                return (
                <FadeIn key={f.title} delay={i * 55}>
                  <div style={{ background: C.elevated,
                    borderRadius: 3, padding: "22px 20px",
                    transition: "transform 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                    <LineIcon name={f.icon} size={24} color={C.accent2} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 6 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </FadeIn>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy Trust section */}
        <div style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{l2.priv.eyebrow}</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: "0 0 14px" }}>
                {l2.priv.title}
              </h2>
              <p style={{ fontSize: 15, color: C.text2, maxWidth: 520, margin: "0 auto" }}>
                {l2.priv.desc}
              </p>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 16, marginBottom: 40 }}>
              {l2.priv.cards.map((c, i) => ({ icon: ["lock","spark","check","trash","document","lock"][i], title: c.t, body: c.b })).map((f, i) => (
                <FadeIn key={f.title} delay={i * 60}>
                  <div style={{ background: C.elevated,
                    borderRadius: 12, padding: "22px 20px" }}>
                    <LineIcon name={f.icon} size={24} color={C.accent2} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 6 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{f.body}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <button
                onClick={() => {
                  clearApplyCraftLocalData();
                  setForm(emptyResumeForm);
                  setMaster({...defaultMaster});
                  deleteTrackerData();
                  setAtsFromChecker("");
                  setDraftSavedAt("");
                  setStatusMsg(st.localDataDeleted);
                  setTimeout(() => setStatusMsg(""), 2500);
                }}
                style={{ background: "transparent", color: C.text2, border: `1px solid ${C.borderHi}`,
                  borderRadius: 6, padding: "10px 18px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit" }}>
                {l2.priv.del}
              </button>
            </div>
            <FadeIn style={{ textAlign: "center" }}>
              <a href={localizeRoute("/privacy/", lang)} style={{ fontSize: 13.5, color: C.accent2, textDecoration: "none",
                borderBottom: `1px solid ${C.accent}44`, paddingBottom: 2 }}>
                {l2.priv.read}
              </a>
            </FadeIn>
          </div>
        </div>

        {/* Early adopter CTA — replaces fake testimonials */}
        <div style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <FadeIn>
              <LineIcon name="spark" size={32} color={C.accent2} style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800,
                letterSpacing: "-0.6px", color: C.text1, margin: "0 0 14px" }}>
                {l2.ea.title}
              </h2>
              <p style={{ fontSize: 15.5, color: C.text2, lineHeight: 1.7, margin: "0 0 12px" }}>
                {l2.ea.p1}
              </p>
              <p style={{ fontSize: 14.5, color: C.text3, lineHeight: 1.7, margin: "0 0 32px" }}>
                {l2.ea.p2}
              </p>
              <button onClick={() => setFeedbackOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8,
                  background: C.grad, color: "#fff", borderRadius: 8, border: "none",
                  padding: "12px 28px", fontSize: 14.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit" }}>
                {l2.ea.share}
              </button>
            </FadeIn>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: "80px 24px 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{l2.faq.eyebrow}</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: 0 }}>{l2.faq.title}</h2>
            </FadeIn>
            {l2.faq.items.map((raw, i) => {
              const item = { q: raw.q.replace("{docs}", LOCALIZED_DOCUMENT_LANGUAGE_COUNT), a: raw.a.replace(/\{docs\}/g, LOCALIZED_DOCUMENT_LANGUAGE_COUNT) };
              return <FAQItem key={i} item={item} C={C} />;
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <FadeIn>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1px",
                margin: "0 0 16px", color: C.text1 }}>{l2.final.title}</h2>
              <p style={{ fontSize: 16, color: C.text2, margin: "0 0 36px" }}>
                {l2.final.sub}
              </p>
            </FadeIn>
            <FadeIn delay={120}>
              <a href={localizeRoute("/resume-builder/", lang)}
                onClick={(event) => handleRouteLink(event, () => startResume("final_cta"))}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
                  transition: "opacity 0.2s, transform 0.2s", display: "inline-block", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
                {lx.createResume}
              </a>
            </FadeIn>
          </div>
        </div>

        </main>

        {/* Footer */}
        <SharedSiteFooter lang={lang} />
      </div>
    );
  }

  const sbW = sidebarOpen ? 224 : 56;

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ ...rPage, display: "flex", flexDirection: "column", padding: 0, height: "100vh", overflow: "hidden" }}>
      <style>{`
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible,
        [role=button]:focus-visible {
          outline: 2px solid ${C.accent2};
          outline-offset: 3px;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
        }
      `}</style>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusMsg}</div>
      <AppToolHeader />
      <div className="ac-workspace-layout" data-clarity-mask="true" style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

      {/* ── Sidebar (desktop) ── */}
      {!isMobile && !isImmersiveAppView && (
        <aside style={{ width: sbW, flexShrink: 0,
          background: `linear-gradient(180deg, ${C.sidebar} 0%, rgba(6,8,15,0.96) 100%)`,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden",
          transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>

          {/* Logo + toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: sidebarOpen ? "20px 14px 20px 20px" : "20px 0",
            borderBottom: `1px solid ${C.border}`, minHeight: 56, transition: "padding .22s" }}>
            {sidebarOpen && (
              <button onClick={() => setAppView("landing")}
                style={{ overflow: "hidden", whiteSpace: "nowrap", background: "none",
                  border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                <AppBrandLogo />
              </button>
            )}
            <button onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                background: C.surface, border: `1px solid ${C.border}`, color: C.text2,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, margin: sidebarOpen ? 0 : "0 auto", transition: "margin .22s",
                fontFamily: "inherit" }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Sidebar search */}
          {sidebarOpen && (
            <div style={{ padding: "10px 12px 4px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: C.text3, fontSize: 13, pointerEvents: "none" }}>🔍</span>
                <input
                  aria-label={builderText("searchFeatures")}
                  value={sideSearch}
                  onChange={e => setSideSearch(e.target.value)}
                  placeholder={l2.searchFeatures}
                  style={{ width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 28px 7px 32px", fontSize: 13.5, color: C.text1,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = C.accent; }}
                  onBlur={e => { e.target.style.borderColor = C.border; }}
                />
                {sideSearch && (
                  <button onClick={() => setSideSearch("")} aria-label={builderText("clearSearch")}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: C.text3, cursor: "pointer",
                      fontSize: 13, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>✕</button>
                )}
              </div>
            </div>
          )}

          {/* Main nav */}
          <nav aria-label={builderText("mainNavigation")} style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {(sideSearch ? NAV.filter(n => n.label.toLowerCase().includes(sideSearch.toLowerCase())) : NAV).map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                aria-label={!sidebarOpen ? item.label : undefined}
                aria-current={navPage === item.id ? "page" : undefined}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  padding: sidebarOpen ? "9px 12px" : "9px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
                  fontSize: 15.5, fontWeight: navPage === item.id ? 700 : 500,
                  background: navPage === item.id ? `${C.accent}18` : "transparent",
                  color: navPage === item.id ? C.accent2 : C.text2,
                  transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxShadow: navPage === item.id ? `inset 2px 0 0 ${C.accent}` : "none" }}>
                <span style={{ fontSize: 19, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{item.label}</span>}
                {sidebarOpen && item.soon && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent2, background: `${C.accent}20`, borderRadius: 999, padding: "2px 6px", flexShrink: 0 }}>{builderText("soon")}</span>}
              </button>
            ))}
          </nav>

          {/* Free badge */}
          {sidebarOpen && (
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ padding: "10px 12px", background: `${C.accent}0E`,
                border: `1px solid ${C.accent}30`, borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.accent2, marginBottom: 4,
                  letterSpacing: "0.4px" }}>{builderText("freeBadge")}</div>
                <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.55 }}>
                  {builderText("freeBadgeBody")}
                </div>
                {AUTHOR.github && (
                  <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 700,
                      color: C.accent2, textDecoration: "none" }}>
                    {landingText("starOnGithub")}
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ── Main content ── */}
      <main id="main-content" tabIndex={-1} style={{ flex: 1, minWidth: 0, overflow: isFormView ? "hidden" : "auto",
        padding: isFormView || isFocusedToolView ? 0 : (isMobile ? "8px 4px" : "16px 24px"),
        ...(isFormView ? { display: "flex", flexDirection: "column" } : {}) }}>
        <div style={{ width: "100%",
          ...(isFormView ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } :
            isFocusedToolView ? { maxWidth: "none", margin: 0 } : { maxWidth: 1320, margin: "0 auto" }) }}>

        {/* Persistent account controls (desktop only). Interface language lives
            exclusively in the global header; document language stays in the
            document settings toolbar. */}
        <div style={{ display: isMobile || isFormView || isFocusedToolView ? "none" : "flex", justifyContent: "flex-end", alignItems: "center",
          marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
          {currentUser ? (
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 11px",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
                  cursor: "pointer", fontFamily: "inherit", color: C.text1 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {(currentUser.name || currentUser.email || "?").charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name || currentUser.email}</span>
                <span style={{ fontSize: 9, color: C.text3 }}>▾</span>
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 180,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 9999 }}>
                  <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{currentUser.name || currentUser.email}</div>
                    <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>{currentUser.email}</div>
                  </div>
                  <button onClick={() => { accountSession.logout(); setCurrentUser(null); setUserMenuOpen(false); }}
                    style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left",
                      background: "none", border: "none", color: "#f87171", fontSize: 13,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {at.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <AuthModal open={authModal} initialTab={authModalTab} onClose={() => setAuthModal(false)} at={at}
          onLogin={user => {
            try { localStorage.setItem("ac_account", JSON.stringify(user)); } catch { /* noop */ }
            setCurrentUser(user); setAuthModal(false);
            if (pendingSaveRef.current) { pendingSaveRef.current = false; doSaveResume(); }
          }} />
        {ACCOUNTS_ENABLED && <SaveProfileModal open={saveProfileOpen} onClose={() => setSaveProfileOpen(false)} at={at} rtl={rtl} C={C} lang={lang} />}
        {ACCOUNTS_ENABLED && <UpsellModal feature={upsell} onClose={() => setUpsell(null)} onGetPass={handleStartCheckout} at={at} rtl={rtl} C={C} />}

        {/* Subscription upsell — shown when the free resume limit is reached */}
        {subModalOpen && (
          <div onClick={() => setSubModalOpen(false)} role="dialog" aria-modal="true" aria-label={accountText("subscribeMoreAria")} dir={rtl ? "rtl" : "ltr"}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "30px 28px", maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: C.accent2, marginBottom: 10 }}>{accountText("unlockMoreResumes")}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.text1 }}>{accountText("freeLimitReached", { count: resumes.FREE_RESUME_LIMIT })}</h3>
              <p style={{ margin: "0 0 18px", fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>
                {accountText("freeLimitBody", { count: resumes.FREE_RESUME_LIMIT, price: `$${resumes.SUBSCRIPTION.priceUsd}`, period: resumes.SUBSCRIPTION.period })}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[accountText("unlimitedSavedResumes"), accountText("switchVersions"), accountText("cancelAnytime")].map((b) => (
                  <div key={b} style={{ fontSize: 13, color: C.text2, display: "flex", gap: 8 }}><span style={{ color: SECTION_TOKENS.statusComplete }}>✓</span>{b}</div>
                ))}
              </div>
              <button type="button" onClick={handleSubscribe}
                style={{ width: "100%", background: C.grad, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
                {accountText("subscribeButton", { price: `$${resumes.SUBSCRIPTION.priceUsd}`, period: resumes.SUBSCRIPTION.period })}
              </button>
              <button type="button" onClick={() => setSubModalOpen(false)}
                style={{ width: "100%", background: "transparent", color: C.text3, border: "none", padding: "8px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {at.notNow}
              </button>
            </div>
          </div>
        )}

        {/* Mobile top bar */}
        {isMobile && !isFocusedToolView && (
          <div style={{ display: "flex", alignItems: "center",
            borderBottom: `1px solid ${C.border}`, marginBottom: 12, paddingBottom: 8 }}>
            <button onClick={() => setSidebarOpen((open) => !open)} aria-label={builderText("openMenu")} aria-expanded={sidebarOpen}
              style={{ minHeight: 40, borderRadius: 8, background: C.surface, padding: "8px 12px",
                border: `1px solid ${C.border}`, color: C.text2, cursor: "pointer",
                fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "inherit", fontWeight: 700 }}>
              <span aria-hidden="true">☰</span> {builderText("openMenu")}
            </button>
          </div>
        )}

        {/* Mobile sidebar drawer */}
        {isMobile && sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200 }} />
            <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 240, zIndex: 201,
              background: `linear-gradient(180deg, ${C.sidebar} 0%, rgba(6,8,15,0.98) 100%)`,
              borderRight: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column", padding: "0 0 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => { setAppView("landing"); setSidebarOpen(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                  <AppBrandLogo compact />
                </button>
                <button onClick={() => setSidebarOpen(false)} aria-label={builderText("closeMenu")}
                  style={{ width: 30, height: 30, borderRadius: 8, background: C.surface,
                    border: `1px solid ${C.border}`, color: C.text2, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontFamily: "inherit" }}>✕</button>
              </div>
              <nav aria-label={builderText("mainNavigation")} style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map((item) => (
                  <button key={item.id} onClick={() => { setNavPage(item.id); setSidebarOpen(false); }}
                    aria-current={navPage === item.id ? "page" : undefined}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                      fontSize: 14, fontWeight: navPage === item.id ? 700 : 500, fontFamily: "inherit",
                      background: navPage === item.id ? `${C.accent}18` : "transparent",
                      color: navPage === item.id ? C.accent2 : C.text2,
                      boxShadow: navPage === item.id ? `inset 2px 0 0 ${C.accent}` : "none" }}>
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    {item.label}
                    {item.soon && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent2, background: `${C.accent}20`, borderRadius: 999, padding: "2px 6px", marginLeft: "auto", flexShrink: 0 }}>{builderText("soon")}</span>}
                  </button>
                ))}
              </nav>
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: "10px 12px", background: `${C.accent}0E`, border: `1px solid ${C.accent}30`, borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.accent2, marginBottom: 4 }}>{builderText("freeBadge")}</div>
                  <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.55 }}>{builderText("freeBadgeBody")}</div>
                  {AUTHOR.github && (
                    <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 7, fontSize: 12, fontWeight: 700, color: C.accent2, textDecoration: "none" }}>
                      {landingText("starOnGithub")}
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}

        {isFormView
          ? <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{pageBody}</div>
          : (navPage === "tracker" || navPage === "master" || navPage === "ats")
            ? <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{pageBody}</div>
            : pageBody}
        {!isFormView && <SharedSiteFooter lang={lang} />}
        </div>
      </main>
      </div>
    </div>
  );
}

// ── UploadResumeModal ─────────────────────────────────────────────
function UploadResumeModal({ open, onClose, onImprove, lang }) {
  const m = (MODAL_UI[lang] || MODAL_UI.en).upload;
  const [file, setFile] = useState(null);
  // dialogRef declared below; focus-trap wired after it via useFocusTrap.
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, open);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFile(null); setEmail(""); setEmailError(""); setDragOver(false); setFileError("");
      setTimeout(() => dialogRef.current?.querySelector("input[type='email']")?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function acceptFile(f) {
    if (!f) return;
    if (!validateResumeImport(f)) {
      setFileError(m.fileErr);
      return;
    }
    setFileError("");
    setFile(f);
  }

  function validateEmailLocal(val) {
    if (!val.trim()) return m.emailReq;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return m.emailInvalid;
    return "";
  }

  function handleImprove() {
    const err = validateEmailLocal(email);
    if (err) { setEmailError(err); return; }
    if (!file) { setFileError(m.selectFirst); return; }
    onImprove(file, email.trim());
  }

  const canImprove = email.trim().length > 0 && !!file;

  if (!open) return null;

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div ref={dialogRef} onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="upload-modal-title"
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "32px 28px", maxWidth: 480, width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)", position: "relative" }}>

        {/* Close */}
        <button onClick={onClose} aria-label={m.close}
          style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28,
            borderRadius: "50%", background: C.elevated, border: `1px solid ${C.border}`,
            color: C.text2, cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, fontFamily: "inherit" }}>✕</button>

        <h2 id="upload-modal-title"
          style={{ fontSize: 20, fontWeight: 800, color: C.text1, margin: "0 0 6px", paddingRight: 32 }}>
          {m.title}
        </h2>
        <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6, margin: "0 0 24px" }}>
          {m.desc}
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileInputRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? C.accent : file ? "#4ade80" : C.border}`,
            borderRadius: C.radiusLg, padding: "22px 20px", marginBottom: 8,
            background: dragOver ? `${C.accent}08` : file ? "rgba(74,222,128,0.06)" : C.elevated,
            cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
          {file ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text1 }}>{file.name}</div>
                <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>
                  {(file.size / 1024).toFixed(0)} KB · {m.clickChange}
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#4ade80", marginLeft: "auto" }}>✓</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⬆️</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 4 }}>
                {m.dragDrop}
              </div>
              <div style={{ fontSize: 12, color: C.text3 }}>{m.pdfMax}</div>
            </>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: "none" }}
            onChange={e => { acceptFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        {fileError && (
          <p role="alert" style={{ color: "#f87171", fontSize: 12, margin: "0 0 16px" }}>{fileError}</p>
        )}
        {!fileError && <div style={{ marginBottom: 20 }} />}

        {/* Email */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="upload-modal-email"
            style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text2,
              marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            {m.emailLabel}
          </label>
          <input id="upload-modal-email" type="email" value={email}
            onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
            onBlur={() => setEmailError(validateEmailLocal(email))}
            placeholder="you@email.com"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "upload-email-err" : undefined}
            style={{ width: "100%", background: C.elevated,
              border: `1px solid ${emailError ? "#f87171" : C.border}`,
              borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: C.text1,
              fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          {emailError && (
            <p id="upload-email-err" role="alert"
              style={{ color: "#f87171", fontSize: 12, margin: "6px 0 0" }}>{emailError}</p>
          )}
        </div>

        <button onClick={handleImprove} disabled={!canImprove}
          style={{ width: "100%", background: C.grad, color: "#fff", border: "none",
            borderRadius: 8, padding: "13px 0", fontSize: 14.5, fontWeight: 700,
            cursor: canImprove ? "pointer" : "not-allowed", fontFamily: "inherit",
            opacity: canImprove ? 1 : 0.45, transition: "opacity 0.15s" }}>
          {m.improveBtn}
        </button>
      </div>
    </div>
  );
}

// ── FeedbackModal ─────────────────────────────────────────────────
function FeedbackModal({ open, onClose, lang }) {
  const m = (MODAL_UI[lang] || MODAL_UI.en).feedback;
  const RATINGS = [
    { value: 1, emoji: "😕", label: m.r1 },
    { value: 2, emoji: "😐", label: m.r2 },
    { value: 3, emoji: "😊", label: m.r3 },
    { value: 4, emoji: "😍", label: m.r4 },
    { value: 5, emoji: "🚀", label: m.r5 },
  ];
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (open) {
      setRating(null); setMessage(""); setEmail(""); setStatus("idle");
      setTimeout(() => dialogRef.current?.querySelector("button")?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit() {
    if (!rating || !message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: RATINGS.find(r => r.value === rating)?.label,
          message: message.trim(),
          email: email.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  const inp = {
    width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: C.text1,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };
  const fieldLbl = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.text2,
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px",
  };

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div ref={dialogRef} onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="fb-modal-title"
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "32px 28px", maxWidth: 460, width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)", position: "relative",
          maxHeight: "90vh", overflowY: "auto" }}>

        <button onClick={onClose} aria-label={m.done}
          style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28,
            borderRadius: "50%", background: C.elevated, border: `1px solid ${C.border}`,
            color: C.text2, cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, fontFamily: "inherit" }}>✕</button>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🙏</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: "0 0 10px" }}>
              {m.thankYou}
            </h2>
            <p style={{ fontSize: 14.5, color: C.text2, lineHeight: 1.65, margin: "0 0 28px" }}>
              {m.thankDesc}
            </p>
            <button onClick={onClose}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                padding: "11px 32px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit" }}>
              {m.done}
            </button>
          </div>
        ) : (
          <>
            <div id="fb-modal-title"
              style={{ fontSize: 20, fontWeight: 800, color: C.text1, marginBottom: 6, paddingRight: 32 }}>
              {m.title}
            </div>
            <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6, margin: "0 0 24px" }}>
              {m.desc}
            </p>

            {/* Rating */}
            <div style={{ marginBottom: 20 }}>
              <div style={fieldLbl}>{m.rateQ}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {RATINGS.map(r => (
                  <button key={r.value} onClick={() => setRating(r.value)}
                    aria-pressed={rating === r.value} title={r.label}
                    style={{ flex: 1, padding: "10px 4px", borderRadius: 10,
                      border: `2px solid ${rating === r.value ? C.accent : C.border}`,
                      background: rating === r.value ? `${C.accent}14` : C.elevated,
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 4, transition: "all 0.15s", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{r.emoji}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1.2, textAlign: "center",
                      color: rating === r.value ? C.accent2 : C.text3 }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="fb-message" style={fieldLbl}>
                {m.diffQ}
              </label>
              <textarea id="fb-message" value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder={m.msgPh}
                style={{ ...inp, resize: "vertical", lineHeight: 1.6, minHeight: 100 }}
                onFocus={e => { e.target.style.borderColor = C.accent; }}
                onBlur={e => { e.target.style.borderColor = C.border; }} />
            </div>

            {/* Optional email */}
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="fb-email" style={fieldLbl}>
                {m.emailLabel}{" "}
                <span style={{ textTransform: "none", fontWeight: 400, color: C.text3, letterSpacing: 0 }}>
                  {m.emailOptional}
                </span>
              </label>
              <input id="fb-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={inp}
                onFocus={e => { e.target.style.borderColor = C.accent; }}
                onBlur={e => { e.target.style.borderColor = C.border; }} />
            </div>

            {status === "error" && (
              <p role="alert" style={{ color: "#f87171", fontSize: 12.5, margin: "0 0 12px" }}>
                {m.errGeneric}
              </p>
            )}

            <button onClick={submit}
              disabled={!rating || !message.trim() || status === "sending"}
              style={{ width: "100%", background: C.grad, color: "#fff", border: "none",
                borderRadius: 8, padding: "13px 0", fontSize: 14.5, fontWeight: 700,
                cursor: (!rating || !message.trim() || status === "sending") ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: (!rating || !message.trim()) ? 0.5 : 1,
                transition: "opacity 0.15s" }}>
              {status === "sending" ? m.sending : m.send}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── AuthModal ─────────────────────────────────────────────────────
// ── SaveProfileModal ──────────────────────────────────────────────────────
// Optional, passwordless email capture for Master Profile sync. Never gates
// the free builder; fully dismissable. Sends a magic link via the backend.
function SaveProfileModal({ open, onClose, at, rtl, C, lang }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState(""); // "" | "sending" | "sent" | "soon" | "error"
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setEmail(""); setConsent(true); setStatus(""); setErr(""); } }, [open]);
  if (!open) return null;

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  async function submit(e) {
    e.preventDefault();
    if (!valid) { setErr("•"); return; }
    setStatus("sending");
    try {
      const res = await (await import("./account.js")).requestMagicLink(email.trim(), { consent, lang });
      if (res?.configured === false) { setStatus("soon"); return; }
      track(EVENTS.EMAIL_CAPTURED);
      setStatus("sent");
    } catch { setStatus("error"); }
  }

  return (
    <div onClick={onClose} dir={rtl ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "30px 28px", maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: C.text1 }}>{at.saveTitle}</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>{at.saveDesc}</p>
        {status === "sent" ? (
          <div style={{ fontSize: 14, color: "#4ade80", fontWeight: 600, padding: "8px 0 4px" }}>✓ {at.linkSent}</div>
        ) : status === "soon" ? (
          <div style={{ fontSize: 14, color: C.text2, fontWeight: 600, padding: "8px 0 4px" }}>{at.notConfigured}</div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: C.text2, display: "block", marginBottom: 6 }}>{at.emailLabel}</label>
            <input type="email" autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); setErr(""); }}
              style={{ width: "100%", padding: "11px 13px", fontSize: 14, borderRadius: 8,
                border: `1.5px solid ${err ? "#f87171" : C.border}`, background: C.elevated, color: C.text1,
                fontFamily: "inherit", marginBottom: 14 }} placeholder="you@example.com" />
            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, color: C.text2,
              lineHeight: 1.5, marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
              <span>{at.consent}</span>
            </label>
            <button type="submit" disabled={status === "sending" || !consent}
              style={{ width: "100%", background: C.grad, color: "#fff", border: "none", borderRadius: 9,
                padding: "12px", fontSize: 14, fontWeight: 700, cursor: status === "sending" || !consent ? "not-allowed" : "pointer",
                fontFamily: "inherit", opacity: status === "sending" || !consent ? 0.55 : 1 }}>
              {status === "sending" ? at.sending : at.sendLink}
            </button>
            {status === "error" && <div style={{ fontSize: 12.5, color: "#f87171", marginTop: 10 }}>{at.notConfigured}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

// ── UpsellModal ───────────────────────────────────────────────────────────
// Non-naggy, point-of-use upsell for the one-time Active Search Pass. Shown
// only when a user tries a paid feature (AI tailoring or cross-device sync).
function UpsellModal({ feature, onClose, onGetPass, at, rtl, C }) {
  if (!feature) return null;
  const benefit = feature === "tailor" ? at.upsellTailor : at.upsellSync;
  const price = `$${ACTIVE_SEARCH_PASS.priceUsd}`;
  return (
    <div onClick={onClose} dir={rtl ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "32px 28px", maxWidth: 420, width: "100%", textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
        <h3 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: C.text1 }}>{at.upsellTitle}</h3>
        <p style={{ margin: "0 0 6px", fontSize: 14, color: C.text1, fontWeight: 600, lineHeight: 1.55 }}>{benefit}</p>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{at.upsellBody}</p>
        <button onClick={onGetPass}
          style={{ width: "100%", background: C.grad, color: "#fff", border: "none", borderRadius: 9,
            padding: "13px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
          {at.getPass} — {price}
        </button>
        <button onClick={onClose}
          style={{ background: "transparent", color: C.text3, border: "none", fontSize: 13,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {at.notNow}
        </button>
      </div>
    </div>
  );
}

function AuthModal({ open, initialTab = "login", onClose, onLogin, at = ACCT_UI.en }) {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [captchaQ, setCaptchaQ] = useState({ a: 3, b: 7 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setForm({ name: "", email: "", password: "", confirm: "" });
      setErrors({});
      setCaptchaInput("");
      setSignupDone(false);
      setShowPw(false);
      setShowCf(false);
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
      setTimeout(() => {
        const first = dialogRef.current?.querySelector(`input, button:not([aria-label="${at.close || "Close"}"])`);
        first?.focus();
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (tab === "signup") {
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
      setCaptchaInput("");
      setErrors(e => ({ ...e, captcha: "" }));
    }
  }, [tab]);

  if (!open) return null;

  const setF = (k) => (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: "" }));
  };

  function pwStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  }
  const strength = pwStrength(form.password);
  const strengthLabel = ["", at.weak, at.fair, at.good, at.strong][strength];
  const strengthColor = ["", "#f87171", "#fbbf24", "#34d399", "#4ade80"][strength];

  async function handleLogin(e) {
    e.preventDefault();
    const er = {};
    if (!form.email.trim()) er.email = at.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = at.emailInvalid;
    if (!form.password) er.password = at.passwordRequired;
    if (Object.keys(er).length) { setErrors(er); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onLogin({ email: form.email, name: form.email.split("@")[0] });
  }

  async function handleSignup(e) {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = at.fullNameRequired;
    if (!form.email.trim()) er.email = at.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = at.emailInvalid;
    if (!form.password) er.password = at.passwordRequired;
    else if (form.password.length < 8) er.password = at.passwordMin;
    if (form.confirm !== form.password) er.confirm = at.passwordMismatch;
    if (!captchaInput.trim()) er.captcha = at.securityRequired;
    else if (parseInt(captchaInput, 10) !== captchaQ.a + captchaQ.b) {
      er.captcha = at.securityIncorrect;
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
      setCaptchaInput("");
    }
    if (Object.keys(er).length) { setErrors(er); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSignupDone(true);
    setTimeout(() => {
      setSignupDone(false);
      setTab("login");
      setForm(f => ({ ...f, password: "", confirm: "" }));
    }, 2000);
  }

  const minp = (extra = {}) => ({
    width: "100%", boxSizing: "border-box", padding: "11px 14px",
    background: C.elevated, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text1, fontSize: 14, outline: "none",
    fontFamily: "inherit", transition: "border-color .15s, box-shadow .15s",
    ...extra,
  });
  const mlbl = {
    display: "block", fontSize: 11.5, fontWeight: 700, color: C.accent2,
    margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.7px",
  };
  const merr = { color: "#f87171", fontSize: 11.5, margin: "5px 0 0", lineHeight: 1.4 };

  const SocialBtn = ({ icon, label }) => (
    <button type="button" title={at.socialSoonTitle}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 14px", background: C.elevated, border: `1px solid ${C.border}`,
        borderRadius: 8, color: C.text2, fontSize: 13.5, fontWeight: 500, cursor: "not-allowed",
        fontFamily: "inherit", opacity: 0.6 }}>
      <span style={{ width: 22, height: 22, borderRadius: 4, background: C.surface,
        border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center",
        justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{icon}</span>
      {label}
      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: C.text3,
        background: C.surface, padding: "2px 7px", borderRadius: 999,
        border: `1px solid ${C.border}`, letterSpacing: "0.3px" }}>{at.soon}</span>
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"
        style={{ width: "100%", maxWidth: 430, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 16,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "acFadeUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}>

        {/* ── Header ── */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div id="auth-modal-title">
            <AppBrandLogo />
          </div>
          <button onClick={onClose} aria-label={at.close}
            style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`,
              background: C.elevated, color: C.text2, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontFamily: "inherit" }} aria-hidden="false">✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: "16px 28px 0" }}>
          <div role="tablist" aria-label={at.signInOptions} style={{ display: "flex", background: C.elevated, borderRadius: 8,
            padding: 3, border: `1px solid ${C.border}` }}>
            {[["login", at.loginTab], ["signup", at.createAccountTab]].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} aria-controls={`auth-panel-${id}`}
                id={`auth-tab-${id}`} onClick={() => { setTab(id); setErrors({}); }}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 6, border: "none",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                  background: tab === id ? C.surface : "transparent",
                  color: tab === id ? C.text1 : C.text3,
                  boxShadow: tab === id ? "0 2px 8px rgba(0,0,0,0.35)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 28px 28px", overflowY: "auto", maxHeight: "70vh" }}>

          {/* Success state */}
          {signupDone && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>
                {at.accountCreated}
              </div>
              <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>
                {at.welcomeRedirect}
              </div>
            </div>
          )}

          {!signupDone && (<>

            {/* Social buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              <SocialBtn icon="G" label={at.continueGoogle} />
              <SocialBtn icon="f" label={at.continueFacebook} />
              <SocialBtn icon="in" label={at.continueLinkedIn} />
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 600, letterSpacing: "0.5px" }}>{at.or}</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* ── Login form ── */}
            {tab === "login" && (
              <form id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login" onSubmit={handleLogin} noValidate>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="auth-login-email" style={mlbl}>{at.emailLabel}</label>
                  <input id="auth-login-email" type="email" autoComplete="email" value={form.email} onChange={setF("email")}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? "auth-login-email-err" : undefined}
                    style={{ ...minp(), ...(errors.email ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.email ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.email && <p id="auth-login-email-err" role="alert" style={merr}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="auth-login-password" style={mlbl}>{at.password}</label>
                  <div style={{ position: "relative" }}>
                    <input id="auth-login-password" type={showPw ? "text" : "password"} autoComplete="current-password"
                      value={form.password} onChange={setF("password")} placeholder="••••••••"
                      aria-invalid={!!errors.password} aria-describedby={errors.password ? "auth-login-pw-err" : undefined}
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.password ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.password ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? at.hidePassword : at.showPassword}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: C.text3,
                        fontSize: 16, padding: 0, lineHeight: 1 }}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                  {errors.password && <p id="auth-login-pw-err" role="alert" style={merr}>{errors.password}</p>}
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", background: C.grad, border: "none",
                    borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                    transition: "opacity 0.15s" }}>
                  {loading ? at.signingIn : at.loginTab}
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: C.text3, margin: "16px 0 0" }}>
                  {at.noAccount}{" "}
                  <button type="button" onClick={() => { setTab("signup"); setErrors({}); }}
                    style={{ color: C.accent2, background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
                    {at.createOneFree}
                  </button>
                </p>
              </form>
            )}

            {/* ── Sign up form ── */}
            {tab === "signup" && (
              <form id="auth-panel-signup" role="tabpanel" aria-labelledby="auth-tab-signup" onSubmit={handleSignup} noValidate>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="auth-signup-name" style={mlbl}>{at.fullName}</label>
                  <input id="auth-signup-name" autoComplete="name" value={form.name} onChange={setF("name")}
                    placeholder="Jane Doe"
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? "auth-signup-name-err" : undefined}
                    style={{ ...minp(), ...(errors.name ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.name ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.name && <p id="auth-signup-name-err" role="alert" style={merr}>{errors.name}</p>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="auth-signup-email" style={mlbl}>{at.emailLabel}</label>
                  <input id="auth-signup-email" type="email" autoComplete="email" value={form.email} onChange={setF("email")}
                    placeholder="you@example.com"
                    style={{ ...minp(), ...(errors.email ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.email ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.email && <p id="auth-signup-email-err" role="alert" style={merr}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="auth-signup-password" style={mlbl}>{at.password}</label>
                  <div style={{ position: "relative" }}>
                    <input id="auth-signup-password" type={showPw ? "text" : "password"} autoComplete="new-password"
                      value={form.password} onChange={setF("password")} placeholder={at.minPassword}
                      aria-invalid={!!errors.password} aria-describedby={errors.password ? "auth-signup-pw-err" : undefined}
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.password ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.password ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? at.hidePassword : at.showPassword}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: C.text3, fontSize: 16, padding: 0, lineHeight: 1 }}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                  {form.password.length > 0 && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 7 }} aria-live="polite" aria-atomic="true">
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 999,
                          background: i <= strength ? strengthColor : C.elevated,
                          transition: "background 0.22s" }} aria-hidden="true" />
                      ))}
                      <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor,
                        marginLeft: 6, flexShrink: 0, minWidth: 36 }}>{strengthLabel}</span>
                    </div>
                  )}
                  {errors.password && <p id="auth-signup-pw-err" role="alert" style={merr}>{errors.password}</p>}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="auth-signup-confirm" style={mlbl}>{at.confirmPassword}</label>
                  <div style={{ position: "relative" }}>
                    <input id="auth-signup-confirm" type={showCf ? "text" : "password"} autoComplete="new-password"
                      value={form.confirm} onChange={setF("confirm")} placeholder={at.repeatPassword}
                      aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "auth-signup-confirm-err" : undefined}
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.confirm ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.confirm ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowCf(v => !v)}
                      aria-label={showCf ? at.hideConfirmPassword : at.showConfirmPassword}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: C.text3, fontSize: 16, padding: 0, lineHeight: 1 }}>{showCf ? "🙈" : "👁"}</button>
                  </div>
                  {errors.confirm && <p id="auth-signup-confirm-err" role="alert" style={merr}>{errors.confirm}</p>}
                </div>

                {/* CAPTCHA */}
                <div style={{ marginBottom: 22, padding: "14px 16px",
                  background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent2,
                    textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6 }}>
                    <span aria-hidden="true">🔒</span> {at.securityCheck}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.text2, marginBottom: 10 }}>
                    {at.securityPrompt}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div id="auth-captcha-question" style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700,
                      color: C.text1, background: C.surface, padding: "8px 18px",
                      borderRadius: 8, border: `1px solid ${C.border}`,
                      letterSpacing: "2px", flexShrink: 0 }}>
                      {captchaQ.a} + {captchaQ.b} = ?
                    </div>
                    <input id="auth-captcha-answer" type="number" inputMode="numeric" value={captchaInput}
                      aria-label={String(at.securityAria || "").replace("{a}", captchaQ.a).replace("{b}", captchaQ.b)}
                      aria-invalid={!!errors.captcha} aria-describedby={errors.captcha ? "auth-captcha-err" : undefined}
                      onChange={e => { setCaptchaInput(e.target.value); if (errors.captcha) setErrors(er => ({ ...er, captcha: "" })); }}
                      placeholder={at.answer}
                      style={{ ...minp({ width: 100, flexShrink: 0 }), ...(errors.captcha ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.captcha ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  </div>
                  {errors.captcha && <p id="auth-captcha-err" role="alert" style={{ ...merr, marginTop: 8 }}>{errors.captcha}</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", background: C.grad, border: "none",
                    borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                    transition: "opacity 0.15s" }}>
                  {loading ? at.creatingAccount : at.createAccountFree}
                </button>
                <p style={{ textAlign: "center", fontSize: 12.5, color: C.text3, margin: "14px 0 0", lineHeight: 1.5 }}>
                  {at.termsAgree}{" "}
                  <span style={{ color: C.text2, textDecoration: "underline", cursor: "pointer" }}>{at.terms}</span>
                  {" "}{at.and}{" "}
                  <span style={{ color: C.text2, textDecoration: "underline", cursor: "pointer" }}>{at.privacyPolicy}</span>.
                </p>
                <p style={{ textAlign: "center", fontSize: 13, color: C.text3, margin: "10px 0 0" }}>
                  {at.alreadyAccount}{" "}
                  <button type="button" onClick={() => { setTab("login"); setErrors({}); }}
                    style={{ color: C.accent2, background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
                    {at.logInArrow}
                  </button>
                </p>
              </form>
            )}

          </>)}
        </div>
      </div>
    </div>
  );
}

function LanguageFlag({ language, size = 20 }) {
  if (!language?.flagSrc) {
    return <span aria-hidden="true" style={{ fontSize: size - 2, lineHeight: 1, flexShrink: 0 }}>{language?.flag}</span>;
  }
  return (
    <img
      src={language.flagSrc}
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round(size * 0.7)}
      loading="eager"
      decoding="async"
      style={{ width: size, height: Math.round(size * 0.7), display: "block", objectFit: "cover", borderRadius: 3, flexShrink: 0, boxShadow: "0 0 0 1px rgba(255,255,255,.18)" }}
    />
  );
}

function LanguageDropdown({
  selected,
  onSelect,
  siteOnly = false,
  ariaLabel = "Choose language",
  searchPlaceholder,
  emptyLabel,
  siteBadge = "SITE",
  uiBadge = "UI",
  currentPath = "/",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const languageOptions = siteOnly ? WORLD_LANGUAGES.filter((l) => SITE_LANGUAGE_CODES.has(l.code)) : WORLD_LANGUAGES;
  const filtered = languageOptions.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );
  const resolvedSearchPlaceholder = searchPlaceholder || (siteOnly ? "Search interface language..." : "Search language...");
  const resolvedEmptyLabel = emptyLabel || "No language found";

  return (
    <div
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          setSearch("");
        }
      }}
      style={{ position: "relative", zIndex: 500 }}
    >
      <style>{`
        @media (max-width: 480px) {
          .ac-language-trigger-label { display: none !important; }
          .ac-language-trigger { padding-inline: 9px !important; gap: 6px !important; }
        }
      `}</style>
      <button className="ac-language-trigger" type="button" onClick={() => setOpen(o => !o)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} style={{
        display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
        color: C.text1, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", transition: "border-color .15s",
      }}>
        <LanguageFlag language={selected} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".04em" }}>{selected.displayCode || selected.code.toUpperCase()}</span>
        <span className="ac-language-trigger-label">{selected.native || selected.name}</span>
        <span aria-hidden="true" style={{ fontSize: 10, color: C.text3, marginInlineStart: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          width: 290, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px ${C.accent}10`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Search box */}
          <div style={{ padding: "10px 10px 8px", borderBottom: `1px solid ${C.border}` }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={resolvedSearchPlaceholder}
              placeholder={resolvedSearchPlaceholder}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px", background: C.elevated,
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text1, fontSize: 13, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Language list */}
          <div role="listbox" aria-label={ariaLabel} style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "20px 14px", color: C.text3, fontSize: 13, textAlign: "center" }}>
                {resolvedEmptyLabel}
              </div>
            )}
            {filtered.map(l => {
              const OptionTag = siteOnly ? "a" : "button";
              const optionProps = siteOnly
                ? { href: localizedLanguageHref(currentPath, l.code) }
                : { type: "button" };
              return (
              <OptionTag key={l.code} {...optionProps} role="option" aria-selected={l.code === selected.code} aria-current={l.code === selected.code ? "page" : undefined} onClick={(event) => {
                if (siteOnly && shouldUseNativeNavigation(event)) return;
                onSelect(l);
                setOpen(false);
                setSearch("");
              }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 14px", border: "none", background: l.code === selected.code ? `${C.accent}14` : "transparent",
                  cursor: "pointer", textAlign: "start", fontFamily: "inherit", textDecoration: "none",
                  borderInlineStart: l.code === selected.code ? `2px solid ${C.accent}` : "2px solid transparent",
                  transition: "background .1s",
                }}>
                <LanguageFlag language={l} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 650, color: C.text1, display: "block" }}>{siteOnly ? l.native : l.name}</span>
                  {!siteOnly && <span style={{ fontSize: 11.5, color: C.text3 }}>{l.native}</span>}
                </span>
                {siteOnly ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.accent2,
                    background: `${C.accent}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                    {siteBadge}
                  </span>
                ) : UI_LANGS.has(l.code) && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.accent2,
                    background: `${C.accent}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                    {uiBadge}
                  </span>
                )}
              </OptionTag>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FadeIn({ children, delay = 0, style = {}, as: Tag = "div" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(22px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      willChange: "opacity, transform",
      ...style
    }}>{children}</Tag>
  );
}

function FAQItem({ item, C }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn>
      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ width: "100%", display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "20px 0", background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            fontSize: 15, fontWeight: 600, color: C.text1 }}>
          <span>{item.q}</span>
          <span style={{ fontSize: 22, color: C.accent2, flexShrink: 0, marginLeft: 16,
            display: "inline-block",
            transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
            transform: open ? "rotate(45deg)" : "none" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 220 : 0, overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: C.text2, lineHeight: 1.8 }}>
            {item.a}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

function LineIcon({ name, size = 18, color = "currentColor", style = {}, decorative = true }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: "block", flexShrink: 0, ...style },
    ...(decorative ? { "aria-hidden": true, focusable: "false" } : { role: "img" }),
  };
  const paths = {
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 4.4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21" /><path d="M12 3c-2.5 2.7-3.7 5.7-3.7 9S9.5 18.3 12 21" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    spark: <><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="m5.6 18.4 2.8-2.8" /><path d="m15.6 8.4 2.8-2.8" /></>,
    trash: <><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
    document: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  };
  return <svg {...common}>{paths[name] || paths.document}</svg>;
}

function PageHeader({ eyebrow, icon, title, sub, pill, isMobile }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
        background: `${C.accent}12`, border: `1px solid ${C.accent}28`,
        borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
        {icon && <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>}
        <span style={{ fontSize: 10.5, fontWeight: 800, color: C.accent2,
          textTransform: "uppercase", letterSpacing: "1.4px" }}>{eyebrow}</span>
        {pill && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3,
            background: C.elevated, borderRadius: 999, padding: "1px 8px",
            border: `1px solid ${C.border}`, marginLeft: 2 }}>{pill}</span>
        )}
      </div>
      <h1 style={{ ...h1, fontSize: isMobile ? 22 : 32, margin: "0 0 10px",
        lineHeight: 1.15 }}>{title}</h1>
      {sub && (
        <p style={{ ...subtitle, margin: 0, maxWidth: 520, fontSize: isMobile ? 13.5 : 15 }}>{sub}</p>
      )}
      <div style={{ marginTop: 18, height: 2, width: 48,
        background: `linear-gradient(90deg, ${C.accent}, ${C.blue})`,
        borderRadius: 999 }} />
    </div>
  );
}

function SectionHeader({ icon, title, filled, filledLabel = "Filled" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px",
      paddingBottom: 2 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase",
        letterSpacing: "1px", color: C.text2, flex: 1 }}>{title}</span>
      {filled && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80",
        background: "rgba(74,222,128,0.12)", padding: "2px 8px", borderRadius: 999 }}>✓ {filledLabel}</span>}
    </div>
  );
}

function Hint({ text }) {
  return (
    <div style={{ fontSize: 11.5, color: C.text3, marginTop: 6, lineHeight: 1.6, fontStyle: "italic" }}>{text}</div>
  );
}

function IconInput({ icon, children }) {
  // Clone only a single element child to inject the icon padding. Guarding against
  // a non-element / multiple children keeps a stray sibling (e.g. a <datalist>)
  // from crashing on `children.props` being undefined.
  const child = React.isValidElement(children) ? children : null;
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        fontSize: 14, opacity: 0.45, pointerEvents: "none", lineHeight: 1 }}>{icon}</span>
      {child
        ? React.cloneElement(child, { style: { ...child.props.style, paddingLeft: 34 } })
        : children}
    </div>
  );
}

function PageFooter({ t }) {
  const year = new Date().getFullYear();
  const dot = <span style={footerDot}>·</span>;
  return (
    <footer style={footerWrap}>
      <span>{t.madeBy} <strong style={{ color: C.text1 }}>{AUTHOR.name}</strong></span>
      {dot}
      <span>© {year}</span>
      {dot}
      <a href={`mailto:${AUTHOR.email}`} style={footerLink}>{AUTHOR.email}</a>
      {dot}
      <a href={AUTHOR.github} target="_blank" rel="noreferrer" style={footerLink}>GitHub</a>
      {AUTHOR.linkedin && <>{dot}<a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" style={footerLink}>LinkedIn</a></>}
      {dot}
      <a href="/accessibility/" style={footerLink}>{t.accessibility || "Accessibility"}</a>
    </footer>
  );
}

const C = {
  ...COLORS,             // bg / sidebar / surface / elevated / border / text / accent / grad
  gradHov:  "linear-gradient(135deg,#5254CC 0%,#2563EB 100%)",
  glow:     "rgba(99,102,241,0.14)",  // indigo glow
  glowBlue: "rgba(59,130,246,0.10)", // blue glow
  // success / warning / danger now come from ...COLORS (single source of truth).
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 14,
};

// ── Section-card design tokens (FlowCV-style structure, dark theme colors) ──
// Centralized here so radius / shadow / spacing / accent live in one place.
const SECTION_TOKENS = {
  radius: 16,
  shadow: "0 14px 34px rgba(0,0,0,0.18)",
  padCard: 22,
  gap1: 8, gap2: 12, gap3: 16, gap4: 24,
  rowBg: "rgba(20,31,51,0.74)",
  expandedBg: "rgba(25,38,62,0.94)",
  rowHoverBg: "rgba(37,54,85,0.82)",
  rowDivider: "rgba(148,163,184,0.055)",
  inputEdge: "rgba(148,163,184,0.10)",
  popoverEdge: "rgba(148,163,184,0.08)",
  expandedShadow: "0 14px 34px rgba(0,0,0,0.20)",
  softSurface: "rgba(19,32,54,0.72)",
  iconBtnBg: "transparent",
  iconBtnRadius: 8,
  accent: C.accent,
  // Section status label colors (shared by both builders).
  statusComplete: "#4ade80", // green
  statusMissing: "#fbbf24",  // amber
  statusNeutral: C.text3,    // muted grey ("Not started" / "Optional" / "In progress")
};

// Color for a section status label, shared across the resume + cover builders.
function statusTone(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("complete") || value.includes("complet") || value.includes("termin") || value.includes("مكتمل")) return SECTION_TOKENS.statusComplete;
  if (value.includes("missing") || value.includes("manquant") || value.includes("مفقود")) return SECTION_TOKENS.statusMissing;
  return SECTION_TOKENS.statusNeutral;
}
// Matching CSS custom properties for the builder root (single source of truth).
const SECTION_CSS_VARS = {
  "--ac-radius": `${SECTION_TOKENS.radius}px`,
  "--ac-gap-1": `${SECTION_TOKENS.gap1}px`,
  "--ac-gap-2": `${SECTION_TOKENS.gap2}px`,
  "--ac-gap-3": `${SECTION_TOKENS.gap3}px`,
  "--ac-gap-4": `${SECTION_TOKENS.gap4}px`,
  "--ac-accent": SECTION_TOKENS.accent,
};

const page = {
  minHeight: "100vh",
  background: `radial-gradient(ellipse 70% 55% at 15% 0%, ${C.glow} 0%, transparent 65%),
               radial-gradient(ellipse 55% 45% at 85% 100%, ${C.glowBlue} 0%, transparent 60%),
               ${C.bg}`,
  padding: "16px 8px",
  fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif",
  color: C.text1,
};
// Pre-baked mobile/desktop variants so the component doesn't spread+override on every render.
const rPageDesktop = { ...page, padding: "16px 8px", overflowX: "hidden" };
const rPageMobile  = { ...page, padding: "8px 4px",  overflowX: "hidden" };
const shell = {
  margin: "0 auto",
  background: `linear-gradient(160deg, rgba(99,102,241,0.04) 0%, transparent 40%), ${C.surface}`,
  borderRadius: C.radiusLg,
  padding: "28px 32px",
  border: `1px solid ${C.border}`,
  boxShadow: `0 0 0 1px rgba(99,102,241,0.06), 0 24px 64px rgba(0,0,0,0.45)`,
};
const rShellDesktop = { ...shell, padding: "28px 32px" };
const rShellMobile  = { ...shell, padding: "16px 12px" };
const h1 = {
  fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 800, margin: "0 0 6px",
  color: C.text1, letterSpacing: "-0.6px",
  fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
  background: `linear-gradient(135deg, ${C.text1} 40%, ${C.accent2} 100%)`,
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
};
const subtitle = {
  color: C.text2, fontSize: 15, margin: "0 0 24px", lineHeight: 1.65,
  fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif", fontWeight: 400,
};
const tplGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 };
const tplCard = {
  background: "transparent",
  border: "none",
  borderRadius: 4, overflow: "visible", cursor: "pointer", padding: 0, textAlign: "left",
  transition: "transform .15s",
  boxShadow: "none",
};
const splitGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 };
const lbl = {
  display: "block", fontSize: 11.5, fontWeight: 700, color: C.accent2,
  margin: "16px 0 7px", textTransform: "uppercase", letterSpacing: "0.7px",
};
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 14px",
  background: C.elevated, border: `1px solid ${SECTION_TOKENS.inputEdge}`,
  borderRadius: C.radiusMd, color: C.text1, fontSize: 14.5, outline: "none",
  transition: "border-color .15s, box-shadow .15s",
};
const chip = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
  background: C.elevated, border: `1px solid ${C.border}`,
  borderRadius: 999, color: C.text2, fontSize: 13.5, cursor: "pointer", fontWeight: 500,
};
const chipActive = { background: `${C.accent}22`, borderColor: C.accent, color: C.accent2 };
const cta = {
  marginTop: 26, width: "100%", padding: "15px", color: "#fff", border: "none",
  borderRadius: C.radiusMd, fontSize: 16, fontWeight: 700, cursor: "pointer",
  background: C.grad, boxShadow: `0 4px 24px rgba(99,102,241,0.35)`,
  transition: "box-shadow .2s, opacity .15s",
};
const backBtn = {
  padding: "7px 14px", background: "transparent", border: "none",
  borderRadius: C.radiusSm, color: C.text2, fontSize: 13.5, cursor: "pointer",
  fontFamily: "inherit",
};
const copyBtn = {
  position: "absolute", top: 12, insetInlineEnd: 12, zIndex: 2, padding: "6px 12px",
  background: `${C.surface}cc`, backdropFilter: "blur(8px)",
  border: "none", borderRadius: C.radiusSm, color: C.text2, fontSize: 12.5, cursor: "pointer",
  fontFamily: "inherit",
};
const badge = { fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.4px" };
const badgeLive  = { border: "none", color: C.text2, background: "transparent" };
const badgePolished = { border: "none", background: `${C.accent}14` };
const dlBtn = {
  padding: "5px 13px", background: `${C.accent}16`, border: "none",
  borderRadius: C.radiusSm, fontSize: 12, fontWeight: 700, cursor: "pointer",
  color: C.accent2, transition: "background .15s", fontFamily: "inherit",
};
const previewToolBtn = {
  width: 32, height: 32, borderRadius: 8, background: "transparent",
  border: "none", color: C.text2, cursor: "pointer",
  fontSize: 14, fontWeight: 800, fontFamily: "inherit",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const softBtn = {
  border: "none", background: C.surface, color: C.text1,
  borderRadius: 9, minHeight: 38, padding: "0 12px", fontSize: 13, fontWeight: 800,
  cursor: "pointer", fontFamily: "inherit",
};

const PREVIEW_ZOOM_MIN = 60;
const PREVIEW_ZOOM_MAX = 120;
const PREVIEW_ZOOM_DEFAULT = 86;
const PREVIEW_ZOOM_STEP = 10;

// Shared live-preview pane for both the resume and cover-letter builders: a header
// (status badge + zoom controls) over a document that can be clicked to expand to a
// full-screen overlay. Owns its own zoom + expanded state so both builders stay
// consistent from one implementation. `printRef` is forwarded to the document
// container so PDF/DOCX export can capture it in either state. Keyboard-accessible
// (Esc to close, focus trap) and RTL-correct (close button flips side, dir set).
const PreviewPane = React.forwardRef(function PreviewPane({
  rtl = false, badge: badgeNode, labels = {}, overlay = null, children,
}, printRef) {
  const [zoom, setZoom] = useState(PREVIEW_ZOOM_DEFAULT);
  const [expanded, setExpanded] = useState(false);
  const overlayRef = useRef(null);
  const closeRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    if (!expanded || typeof document === "undefined") return;
    restoreFocusRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => { if (closeRef.current) closeRef.current.focus(); });
    const focusable = () => (overlayRef.current
      ? Array.from(overlayRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => !el.disabled && el.offsetParent !== null)
      : []);
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); setExpanded(false); return; }
      if (e.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      const prev = restoreFocusRef.current;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [expanded]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        marginBottom: 12, flexWrap: "wrap" }}>
        {badgeNode}
        <div aria-label={labels.controls} style={{ display: "flex", alignItems: "center", gap: 4,
          background: "transparent", borderRadius: 10, padding: 3 }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(PREVIEW_ZOOM_MIN, z - PREVIEW_ZOOM_STEP))}
            aria-label={labels.zoomOut} style={{ ...previewToolBtn }}>−</button>
          <span style={{ color: C.text3, fontSize: 12, minWidth: 42, textAlign: "center" }}>{zoom}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(PREVIEW_ZOOM_MAX, z + PREVIEW_ZOOM_STEP))}
            aria-label={labels.zoomIn} style={{ ...previewToolBtn }}>+</button>
          <button type="button" onClick={() => setZoom(PREVIEW_ZOOM_DEFAULT)}
            style={{ ...previewToolBtn, width: "auto", padding: "0 9px", fontSize: 11.5 }}>{labels.fit}</button>
        </div>
      </div>
      <div
        ref={overlayRef}
        onClick={() => setExpanded((e) => !e)}
        title={expanded ? undefined : labels.expand}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded ? "true" : undefined}
        aria-label={expanded ? labels.expandedTitle : undefined}
        dir={rtl ? "rtl" : "ltr"}
        style={{
          cursor: expanded ? "zoom-out" : "pointer",
          ...(expanded ? {
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", overflowY: "auto",
          } : { position: "relative", overflowX: "auto" }),
        }}
      >
        {!expanded && overlay}
        <div ref={printRef} style={expanded ? { width: "min(780px, 94vw)", maxHeight: "94vh", overflowY: "auto", borderRadius: 8 } : {
          maxWidth: 760, margin: "0 auto", transform: `scale(${zoom / 100})`, transformOrigin: "top center",
          transition: "transform 0.18s ease", paddingBottom: `${Math.max(0, 100 - zoom) * 2}px`,
        }}>
          {children}
        </div>
        {expanded && (
          <button
            ref={closeRef}
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            aria-label={labels.close}
            style={{ position: "fixed", top: 14, [rtl ? "left" : "right"]: 14, zIndex: 9001,
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: C.surface, color: C.text2, fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit" }}>
            ✕
          </button>
        )}
      </div>
    </>
  );
});
const ghostIconBtn = {
  border: "none", background: "transparent", color: C.text2,
  borderRadius: 10, minHeight: 40, minWidth: 40, padding: 0,
  cursor: "pointer", fontFamily: "inherit",
};
const fieldErr  = { color: "#f87171", fontSize: 11.5, margin: "4px 0 0", lineHeight: 1.4 };
const codeSelect = {
  boxSizing: "border-box", padding: "10px 8px", background: C.elevated,
  border: `1px solid ${SECTION_TOKENS.inputEdge}`, borderRadius: C.radiusSm, color: C.text1, fontSize: 14,
  outline: "none", cursor: "pointer", minWidth: 82, flexShrink: 0, fontFamily: "inherit",
};
const footerWrap = {
  marginTop: 40, paddingTop: 22, borderTop: `1px solid ${C.border}`,
  display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
  gap: "6px 4px", fontSize: 13, color: C.text3,
};
const footerDot  = { color: C.border, margin: "0 2px" };
const footerLink = { color: C.text2, textDecoration: "none", transition: "color .15s" };

const DOCUMENT_PREVIEW_WIDTH = 700;
const DOCUMENT_PREVIEW_PAGE_HEIGHT = 990;

function DocumentThumbnailPreview({ type = "resume", template, isMobile, rtl = false, lang = "", resumeResult = null }) {
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({
    scale: isMobile ? 0.28 : 0.38,
    left: 0,
    top: 0,
    pageCount: 1,
  });

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content || typeof ResizeObserver === "undefined") return undefined;

    let raf = 0;
    const measure = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const frameRect = frame.getBoundingClientRect();
        const frameWidth = frameRect.width;
        // Height is provided by the frame's aspect-ratio; if it hasn't resolved
        // yet (reports 0 while width is set) derive it from the width so the
        // scale below can never collapse to 0 and blank out the preview.
        const frameHeight = frameRect.height || (frameWidth * DOCUMENT_PREVIEW_PAGE_HEIGHT / DOCUMENT_PREVIEW_WIDTH);
        if (!frameWidth) return;

        const rawScale = Math.min(frameWidth / DOCUMENT_PREVIEW_WIDTH, frameHeight / DOCUMENT_PREVIEW_PAGE_HEIGHT);
        const scale = rawScale > 0 && Number.isFinite(rawScale) ? rawScale : (isMobile ? 0.28 : 0.38);
        const scaledWidth = DOCUMENT_PREVIEW_WIDTH * scale;
        const contentHeight = content.scrollHeight || DOCUMENT_PREVIEW_PAGE_HEIGHT;
        const pageCount = contentHeight > DOCUMENT_PREVIEW_PAGE_HEIGHT + 12
          ? Math.ceil(contentHeight / DOCUMENT_PREVIEW_PAGE_HEIGHT)
          : 1;
        const next = {
          scale,
          left: Math.max(0, (frameWidth - scaledWidth) / 2),
          top: 0,
          pageCount,
        };
        setFit((prev) => (
          Math.abs(prev.scale - next.scale) < 0.001 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.top - next.top) < 0.5 &&
          prev.pageCount === next.pageCount
            ? prev
            : next
        ));
      });
    };

    const frameObserver = new ResizeObserver(measure);
    const contentObserver = new ResizeObserver(measure);
    frameObserver.observe(frame);
    contentObserver.observe(content);
    measure();

    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      frameObserver.disconnect();
      contentObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMobile, template?.id, type, resumeResult]);

  if (template.blank) {
    return (
      <div ref={frameRef} aria-label={`Blank ${type} template preview`}
        style={{ position: "relative", aspectRatio: "210 / 297", background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 0, border: 0, overflow: "visible" }}>
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 6,
          border: "1px solid rgba(148,163,184,0.24)", boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="38%" height="38%" viewBox="0 0 100 100"
            fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="50" y1="8" x2="50" y2="92" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="8" y1="50" x2="92" y2="50" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={frameRef} aria-label={`${template.name} ${type} template preview`}
      style={{ position: "relative", aspectRatio: "210 / 297", background: "transparent",
        borderRadius: 0, border: 0, boxShadow: "none", overflow: "visible" }}>
      <div
        style={{ width: DOCUMENT_PREVIEW_WIDTH, height: DOCUMENT_PREVIEW_PAGE_HEIGHT,
          position: "absolute", left: fit.left, top: fit.top,
          transform: `scale(${fit.scale})`, transformOrigin: "top left",
          pointerEvents: "none", userSelect: "none", background: "#fff",
          borderRadius: 6, border: "1px solid rgba(148,163,184,0.24)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        <div ref={contentRef} style={{ width: "100%", minHeight: "100%" }}>
          <LinkifyLinksProvider enabled={false}>
            {type === "cover" ? (
              <CoverLetterPaper tpl={template} data={template.id === RECOMMENDED_TEMPLATE_ID ? (SAMPLE_COVER_BY_LANG[lang] || COVER_THUMB_SAMPLES[template.id] || SAMPLE_COVER) : (COVER_THUMB_SAMPLES[template.id] || SAMPLE_COVER)} preview />
            ) : (
              <ResumePaper tpl={template}
                result={resumeResult || THUMB_SAMPLES[template.id]?.result || SAMPLE_RESUME}
                rtl={rtl}
                lang={lang || sampleLangForTemplate(template)}
                placeholder={false}
                preview />
            )}
          </LinkifyLinksProvider>
        </div>
      </div>
      {fit.pageCount > 1 && (
        <span style={{ position: "absolute", right: 8, bottom: 8, zIndex: 1,
          background: "rgba(15,23,42,0.82)", color: "#fff", border: "1px solid rgba(255,255,255,0.24)",
          borderRadius: 999, padding: "4px 8px", fontSize: 10.5, fontWeight: 900,
          boxShadow: "0 8px 20px rgba(15,23,42,0.18)" }}>
          {fit.pageCount} pages
        </span>
      )}
    </div>
  );
}

function ThumbPreview({ tp, isMobile, resumeResult = null, resumeRtl = null, resumeLang = "" }) {
  return (
    <DocumentThumbnailPreview
      type="resume"
      template={tp}
      isMobile={isMobile}
      rtl={resumeRtl ?? (THUMB_SAMPLES[tp.id]?.rtl || false)}
      lang={resumeLang}
      resumeResult={resumeResult}
    />
  );
}

// ── CoverThumbPreview ─────────────────────────────────────────────
function CoverThumbPreview({ tp, isMobile, lang = "", rtl = false }) {
  return (
    <DocumentThumbnailPreview
      type="cover"
      template={tp}
      isMobile={isMobile}
      lang={lang}
      rtl={rtl}
    />
  );
}
