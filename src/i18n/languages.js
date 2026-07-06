// ──────────────────────────────────────────────────────────────────────────
// Language registries + persistence for the TWO independent settings:
//   • interfaceLanguage — the app UI (nav, buttons, forms, notifications…)
//   • documentLanguage  — résumé/cover labels, template direction, exports
//
// These are deliberately separate: a user can run the UI in French while
// writing an English résumé, or the UI in English while writing an Arabic one.
//
// Backward-compatible migration: the old single `ac_site_language` key seeds
// both new keys on first load and is KEPT for rollback (never deleted here).
// SSR-safe (all storage access guarded).
// ──────────────────────────────────────────────────────────────────────────

// Interface languages that have full UI translations today. English/French/
// Arabic are the first-class production targets.
// To add a new interface language later: add its code here + its dictionaries.
export const INTERFACE_LANGUAGES = ["en", "fr", "ar"];
export const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "sd", "yi"];

export const INTERFACE_LANG_KEY = "ac_interface_language";
export const DOCUMENT_LANG_KEY = "ac_document_language";
export const LEGACY_SITE_LANG_KEY = "ac_site_language"; // kept for rollback
export const LANGUAGE_SCHEMA_VERSION_KEY = "ac_language_schema_version";
export const LANGUAGE_SCHEMA_VERSION = "2";

export const DEFAULT_LANG = "en";
export const isRtlLang = (code) => RTL_LANGUAGES.includes(String(code || "").toLowerCase());
export const isInterfaceLang = (code) => INTERFACE_LANGUAGES.includes(String(code || "").toLowerCase());
export const isDocumentLang = (code) => /^[a-z]{2,3}$/.test(String(code || "").toLowerCase());

const hasLS = () => typeof localStorage !== "undefined";
const read = (k) => { try { return hasLS() ? localStorage.getItem(k) : null; } catch { return null; } };
const write = (k, v) => { try { if (hasLS()) localStorage.setItem(k, v); } catch { /* quota / privacy mode */ } };

// A base-language code from a BCP-47 tag or language object/string.
export function baseCode(input) {
  const raw = typeof input === "object" && input ? input.code : input;
  return String(raw || "").toLowerCase().split("-")[0];
}

function browserSuggestion(allowed) {
  if (typeof navigator === "undefined") return null;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ""];
  for (const l of langs) { const c = baseCode(l); if (allowed.includes(c)) return c; }
  return null;
}

// Resolve the initial INTERFACE language, running the one-time migration.
// Priority: explicit new key → legacy site key → browser suggestion → English.
// Only interface-translated codes are accepted (falls back to English).
export function initialInterfaceLanguage() {
  const explicit = baseCode(read(INTERFACE_LANG_KEY));
  if (isInterfaceLang(explicit)) return explicit;
  const legacy = baseCode(read(LEGACY_SITE_LANG_KEY));
  if (isInterfaceLang(legacy)) { write(INTERFACE_LANG_KEY, legacy); write(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION); return legacy; }
  const suggested = browserSuggestion(INTERFACE_LANGUAGES);
  const code = suggested || DEFAULT_LANG;
  write(INTERFACE_LANG_KEY, code);
  write(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION);
  return code;
}

// Resolve the initial DOCUMENT language, running the one-time migration.
// Priority: explicit new key → legacy site key → English. Any language code is
// allowed here (resume content can be written in any supported picker language).
export function initialDocumentLanguage() {
  const explicit = baseCode(read(DOCUMENT_LANG_KEY));
  if (isDocumentLang(explicit)) return explicit;
  const legacy = baseCode(read(LEGACY_SITE_LANG_KEY));
  const code = isDocumentLang(legacy) ? legacy : DEFAULT_LANG;
  write(DOCUMENT_LANG_KEY, code);
  write(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION);
  return code;
}

export function persistInterfaceLanguage(code) {
  const next = isInterfaceLang(baseCode(code)) ? baseCode(code) : DEFAULT_LANG;
  write(INTERFACE_LANG_KEY, next);
  write(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION);
}
export function persistDocumentLanguage(code) {
  const next = isDocumentLang(baseCode(code)) ? baseCode(code) : DEFAULT_LANG;
  write(DOCUMENT_LANG_KEY, next);
  write(LANGUAGE_SCHEMA_VERSION_KEY, LANGUAGE_SCHEMA_VERSION);
}

// Pure migration (used by tests): given a storage snapshot, return the resolved
// { interface, document } codes and the keys that should be written. Does not
// remove the legacy key.
export function migratePreferences(store = {}) {
  const iExplicit = baseCode(store[INTERFACE_LANG_KEY]);
  const dExplicit = baseCode(store[DOCUMENT_LANG_KEY]);
  const legacy = baseCode(store[LEGACY_SITE_LANG_KEY]);
  const iface = isInterfaceLang(iExplicit) ? iExplicit
    : isInterfaceLang(legacy) ? legacy : DEFAULT_LANG;
  const doc = isDocumentLang(dExplicit) ? dExplicit : isDocumentLang(legacy) ? legacy : DEFAULT_LANG;
  return {
    interface: iface,
    document: doc,
    writes: { [INTERFACE_LANG_KEY]: iface, [DOCUMENT_LANG_KEY]: doc, [LANGUAGE_SCHEMA_VERSION_KEY]: LANGUAGE_SCHEMA_VERSION },
    keptForRollback: LEGACY_SITE_LANG_KEY,
  };
}
