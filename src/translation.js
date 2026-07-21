import { TRANSLATABLE_RESUME_FIELDS, TRANSLATION_STATUSES, serializeResumeTranslationContent } from "./translationCore.js";
export { TRANSLATABLE_RESUME_FIELDS, TRANSLATION_STATUSES, serializeResumeTranslationContent } from "./translationCore.js";

export const PRESERVE_TERMS = [
  "Microsoft Intune",
  "Jamf Pro",
  "JFrog Artifactory",
  "Active Directory",
  "Microsoft 365",
  "Windows",
  "Linux",
  "Docker",
  "Jenkins",
  "SonarQube",
  "Nexus",
  "RHCSA",
  "RHCE",
  "RHCA",
  "Red Hat",
  "Kandji",
  "Intelligent Hub",
  "LinkedIn",
];

export class TranslationRequestError extends Error {
  constructor(message, { status = 0, code = "translation_failed", body = null } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export function extractProtectedTerms(value, glossary = PRESERVE_TERMS) {
  const text = String(value || "");
  const found = new Set();
  for (const term of glossary) {
    if (term && text.toLowerCase().includes(String(term).toLowerCase())) found.add(term);
  }
  const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const urlRe = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
  const phoneRe = /(?:\+?\d[\d\s().-]{6,}\d)/g;
  for (const re of [emailRe, urlRe, phoneRe]) {
    for (const match of text.matchAll(re)) found.add(match[0]);
  }
  return Array.from(found);
}

export function buildResumeTranslationRequest(form, { sourceLanguage = "auto", targetLanguage = "en", targetLanguageName = "English" } = {}) {
  const content = serializeResumeTranslationContent(form);
  const protectedTerms = Array.from(new Set(Object.values(content).flatMap((value) => extractProtectedTerms(value))));
  return {
    type: "resume",
    sourceLanguage,
    targetLanguage,
    targetLanguageName,
    rules: [
      "Preserve names, emails, phone numbers, URLs, company names, certifications, tools, technologies, and acronyms.",
      "Do not invent achievements or add experience.",
      "Use natural, concise, professional resume language in the target language.",
      ...(targetLanguage === "ar" ? ["Localize French/English month names in date ranges to Arabic month names, and keep mixed technical titles in natural Arabic order, e.g. مهندس Full Stack."] : []),
      "Translate field-by-field: title stays title, institution/school stays institution/school, dates stay dates, and descriptions stay descriptions.",
      "Keep bullet points as bullet points and preserve dates and numbers.",
      "Preserve section boundaries, blank-line entry breaks, and the number of entries in each section.",
      "Return valid JSON only with the same top-level field keys.",
    ],
    preserveTerms: protectedTerms,
    content,
  };
}

const ARABIC_MONTHS = new Map([
  ["janvier", "يناير"], ["jan", "يناير"], ["january", "يناير"],
  ["février", "فبراير"], ["fevrier", "فبراير"], ["fév", "فبراير"], ["february", "فبراير"],
  ["mars", "مارس"], ["march", "مارس"],
  ["avril", "أبريل"], ["april", "أبريل"],
  ["mai", "مايو"], ["may", "مايو"],
  ["juin", "يونيو"], ["june", "يونيو"],
  ["juillet", "يوليو"], ["july", "يوليو"],
  ["août", "أغسطس"], ["aout", "أغسطس"], ["august", "أغسطس"],
  ["septembre", "سبتمبر"], ["september", "سبتمبر"],
  ["octobre", "أكتوبر"], ["october", "أكتوبر"],
  ["novembre", "نوفمبر"], ["november", "نوفمبر"],
  ["décembre", "ديسمبر"], ["decembre", "ديسمبر"], ["december", "ديسمبر"],
]);

function postProcessArabicText(value) {
  return String(value || "")
    .replace(/\b([A-Za-zÀ-ÿ]+)\s+(\d{4})\b/g, (match, month, year) => {
      const direct = month.toLowerCase();
      const normalized = month.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const arabic = ARABIC_MONTHS.get(direct) || ARABIC_MONTHS.get(normalized);
      return arabic ? `${arabic} ${year}` : match;
    })
    .replace(/Aujourd['’]?hui|Présent|Present/gi, "حتى الآن")
    .replace(/Full Stack\s+(مهندس|مطور)/g, "$1 Full Stack");
}

export function postProcessTranslatedValue(value, targetLanguage = "en") {
  if (targetLanguage !== "ar") return value;
  if (typeof value === "string") return postProcessArabicText(value);
  if (Array.isArray(value)) return value.map((item) => postProcessTranslatedValue(item, targetLanguage));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [
      key,
      postProcessTranslatedValue(entryValue, targetLanguage),
    ]));
  }
  return value;
}

export function postProcessTranslatedResume(translated, targetLanguage = "en") {
  if (!translated || typeof translated !== "object") return translated;
  return postProcessTranslatedValue(translated, targetLanguage);
}

export async function translateDocumentContent({
  documentType,
  sourceLanguage = "auto",
  targetLanguage,
  payload,
  protectedTerms = [],
  devBypassToken = "",
  devBypassHeader = "",
} = {}) {
  const headers = { "Content-Type": "application/json" };
  if (devBypassToken && devBypassHeader && import.meta.env.VITE_DEV_BYPASS) headers[devBypassHeader] = devBypassToken;
  const requestBody = {
    documentType,
    sourceLanguage,
    targetLanguage,
    protectedTerms,
    payload,
  };
  let res;
  try {
    res = await fetch("/api/translate-document", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    throw new TranslationRequestError("translation-network", {
      status: 0,
      code: "network_error",
      body: { message: error?.message || "" },
    });
  }
  let data = null;
  const status = res.status;
  try {
    data = await res.json();
  } catch {
    throw new TranslationRequestError("translation-bad-response", { status, code: "bad_json_response", body: null });
  }
  if (!res.ok || !data?.ok) {
    const code = data?.error || (res.ok ? "translation_failed" : "http_error");
    if (code === "translation_unavailable") throw new TranslationRequestError("translation-unavailable", { status, code, body: data });
    if (code === "rate_limited" || code === "translation_limit_reached") throw new TranslationRequestError("translation-rate-limited", { status, code, body: data });
    if (code === "translation_timeout") throw new TranslationRequestError("translation-timeout", { status, code, body: data });
    if (code === "payload_too_large") throw new TranslationRequestError("translation-payload-too-large", { status, code, body: data });
    if (code === "invalid_request" || code === "invalid_json") throw new TranslationRequestError("translation-invalid-request", { status, code, body: data });
    if (code === "translation_bad_response") throw new TranslationRequestError("translation-bad-response", { status, code, body: data });
    throw new TranslationRequestError("translation-server", { status, code, body: data });
  }
  if (!data.document || typeof data.document !== "object") {
    throw new TranslationRequestError("translation-bad-response", { status, code: "missing_document", body: data });
  }
  return data;
}

export function parseTranslationJson(raw, allowedKeys = TRANSLATABLE_RESUME_FIELDS) {
  const clean = String(raw || "").replace(/```json|```/gi, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("invalid-translation-json");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid-translation-json");
  const out = {};
  for (const key of allowedKeys) {
    if (typeof parsed[key] === "string") out[key] = parsed[key];
  }
  return out;
}

export function createTranslationMetadata(keys, { sourceLanguage = "auto", targetLanguage = "en", translatedAt = new Date().toISOString() } = {}) {
  return Object.fromEntries((keys || []).map((key) => [key, {
    translationStatus: TRANSLATION_STATUSES.aiTranslated,
    sourceLanguage,
    targetLanguage,
    translatedAt,
  }]));
}

export function createTranslatedResumeCopy(form, translated, {
  sourceLanguage = "auto",
  targetLanguage = "en",
  targetLanguageName = targetLanguage,
  sourceVersionId = "",
  translatedAt = new Date().toISOString(),
} = {}) {
  const keys = Object.keys(translated || {}).filter((key) => typeof translated[key] === "string");
  return {
    ...form,
    ...translated,
    translationMeta: {
      ...(form?.translationMeta || {}),
      sourceLanguage,
      targetLanguage,
      targetLanguageName,
      sourceVersionId,
      translationStatus: TRANSLATION_STATUSES.aiTranslated,
      reviewed: false,
      translatedAt,
      originalName: form?.name || "",
      fields: createTranslationMetadata(keys, { sourceLanguage, targetLanguage, translatedAt }),
    },
  };
}

export function assertProtectedTermsPreserved(originalContent, translatedContent, terms = PRESERVE_TERMS) {
  const original = Object.values(originalContent || {}).join("\n");
  const translated = Object.values(translatedContent || {}).join("\n");
  const required = extractProtectedTerms(original, terms);
  return required.filter((term) => !translated.includes(term));
}
