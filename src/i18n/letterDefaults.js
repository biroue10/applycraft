// Single source of truth for locale-aware letter defaults (date formatting and
// cover-letter sign-offs). Shared by the builder (ResumeGenerator) and the document
// renderers (DocumentPapers) so English defaults can never leak into a non-English
// document. The i18n guard (scripts/i18n-no-literals.mjs) enforces that date
// formatting and default sign-offs go through these helpers rather than hardcoded
// en-US / "Sincerely" literals.

// BCP-47 locales used to format letter dates in the document's language.
export const LETTER_LOCALE = { en: "en-US", fr: "fr-FR", es: "es-ES", ar: "ar-MA", de: "de-DE" };

// Format a date in the document language, e.g. FR "9 juillet 2026", AR (ar-MA)
// "9 يوليوز 2026", EN "July 9, 2026". Falls back to en-US for unknown languages.
export function formatLetterDate(date, docLang) {
  const value = date instanceof Date ? date : new Date(date || Date.now());
  const locale = LETTER_LOCALE[docLang] || LETTER_LOCALE.en;
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(value);
  } catch {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(value);
  }
}

// Locale-aware cover-letter closings (sign-offs). Non-EN documents must not default to
// the English "Sincerely". First entry is the default; the rest are offered as
// alternatives in the editor.
export const COVER_SIGNOFFS = {
  en: ["Sincerely", "Best regards"],
  fr: ["Cordialement", "Salutations distinguées", "Bien cordialement"],
  es: ["Atentamente", "Cordialmente"],
  ar: ["مع خالص التقدير", "وتفضلوا بقبول فائق الاحترام"],
  de: ["Mit freundlichen Grüßen", "Freundliche Grüße"],
};

export function defaultCoverSignoff(docLang) {
  return (COVER_SIGNOFFS[docLang] || COVER_SIGNOFFS.en)[0];
}
