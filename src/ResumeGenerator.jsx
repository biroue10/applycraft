import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ACCOUNTS_ENABLED, REQUIRE_RESUME_LOGIN, PAYMENTS_ENABLED, ACTIVE_SEARCH_PASS } from "./config.js";
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
import TrackApplicationAction from "./components/TrackApplicationAction.jsx";
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
import { buildInternalUrl, localizeRoute, localizedLanguageHref } from "./seo/localizedRoutes.js";
import { jobContextQuery } from "./interview/context.js";
import "./styles/trackerDashboard.css";

const CustomResumeSectionUI = React.lazy(() => import("./components/CustomResumeSectionUI.jsx"));

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
const LandingStats = React.lazy(() => import("./components/LandingStats.jsx"));
const TrackerPrivacyControls = React.lazy(() => import("./components/TrackerPrivacyControls.jsx"));
const EvidenceLibrary = React.lazy(() => import("./components/EvidenceLibrary.jsx"));
const AtsAiAssistant = React.lazy(() => import("./components/EvidenceLibrary.jsx").then((module) => ({ default: module.AtsAiAssistant })));
const TrackerFilters = React.lazy(() => import("./components/TrackerFilters.jsx"));
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
    description: "A spacious one-column layout that keeps attention on experience and achieve…158116 tokens truncated…e: "rgba(37,99,235,0.20)",  // blue glow
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
  cardEdge: "rgba(148,163,184,0.065)",
  cardEdgeActive: "rgba(129,140,248,0.18)",
  rowShadow: "0 3px 12px rgba(0,0,0,0.08)",
  rowHoverBg: "rgba(37,54,85,0.82)",
  rowDivider: "rgba(148,163,184,0.055)",
  inputEdge: "rgba(148,163,184,0.10)",
  popoverEdge: "rgba(148,163,184,0.08)",
  expandedShadow: "0 14px 34px rgba(0,0,0,0.20)",
  softSurface: "rgba(19,32,54,0.72)",
  emptySurface: "linear-gradient(135deg, rgba(91,74,255,0.075), rgba(59,130,246,0.045))",
  emptyEdge: "rgba(129,140,248,0.20)",
  iconHighlight: "rgba(255,255,255,0.06)",
  progressTrack: "rgba(148,163,184,0.14)",
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
  fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
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
        className={expanded ? "ac-preview-scroll-hidden" : undefined}
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
        <div ref={printRef} className={expanded ? "ac-preview-scroll-hidden" : undefined} style={expanded ? { width: "min(780px, 94vw)", maxHeight: "94vh", overflowY: "auto", borderRadius: 8 } : {
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
    documentHeight: DOCUMENT_PREVIEW_PAGE_HEIGHT,
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

        // Gallery samples may contain more than one page of useful detail.
        // Fit their measured height instead of clipping everything after page one.
        const contentHeight = Math.max(
          DOCUMENT_PREVIEW_PAGE_HEIGHT,
          content.scrollHeight || DOCUMENT_PREVIEW_PAGE_HEIGHT,
        );
        const rawScale = Math.min(frameWidth / DOCUMENT_PREVIEW_WIDTH, frameHeight / contentHeight);
        const scale = rawScale > 0 && Number.isFinite(rawScale) ? rawScale : (isMobile ? 0.28 : 0.38);
        const scaledWidth = DOCUMENT_PREVIEW_WIDTH * scale;
        const pageCount = contentHeight > DOCUMENT_PREVIEW_PAGE_HEIGHT + 12
          ? Math.ceil(contentHeight / DOCUMENT_PREVIEW_PAGE_HEIGHT)
          : 1;
        const next = {
          scale,
          left: Math.max(0, (frameWidth - scaledWidth) / 2),
          top: 0,
          documentHeight: contentHeight,
          pageCount,
        };
        setFit((prev) => (
          Math.abs(prev.scale - next.scale) < 0.001 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.documentHeight - next.documentHeight) < 1 &&
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
      style={{ position: "relative", aspectRatio: "210 / 297", background: "#fff",
        borderRadius: 6, border: "1px solid rgba(148,163,184,0.24)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}>
      <div
        style={{ width: DOCUMENT_PREVIEW_WIDTH, height: fit.documentHeight,
          position: "absolute", left: fit.left, top: fit.top,
          transform: `scale(${fit.scale})`, transformOrigin: "top left",
          pointerEvents: "none", userSelect: "none", background: "#fff",
          overflow: "hidden" }}>
        <div ref={contentRef} style={{ width: "100%", minHeight: "100%" }}>
          <LinkifyLinksProvider enabled={false}>
            {type === "cover" ? (
              <CoverLetterPaper tpl={template} data={template.id === RECOMMENDED_TEMPLATE_ID ? (SAMPLE_COVER_BY_LANG[lang] || COVER_THUMB_SAMPLES[template.id] || SAMPLE_COVER) : (COVER_THUMB_SAMPLES[template.id] || SAMPLE_COVER)} preview />
            ) : (
              <ResumePaper tpl={template}
                result={resumeResult || THUMB_SAMPLES[template.id]?.result || SAMPLE_RESUME}
                rtl={rtl}
                lang={lang}
                placeholder={false}
                preview />
            )}
          </LinkifyLinksProvider>
        </div>
      </div>
      {fit.pageCount > 1 && (
        <span className="sr-only">
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
      rtl={resumeRtl ?? resumeLang === "ar"}
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

