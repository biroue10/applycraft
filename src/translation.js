export const TRANSLATION_STATUSES = {
  original: "original",
  aiTranslated: "ai_translated",
  editedAfterTranslation: "edited_after_translation",
  needsReview: "needs_review",
  humanReviewed: "human_reviewed",
};

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

export const TRANSLATABLE_RESUME_FIELDS = [
  "title",
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "projects",
  "volunteer",
  "awards",
  "extracurricular",
];

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
  const content = {};
  for (const key of TRANSLATABLE_RESUME_FIELDS) {
    const value = String(form?.[key] || "").trim();
    if (value) content[key] = value;
  }
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
  const res = await fetch("/api/translate-document", {
    method: "POST",
    headers,
    body: JSON.stringify({
      documentType,
      sourceLanguage,
      targetLanguage,
      protectedTerms,
      payload,
    }),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("translation-failed");
  }
  if (!res.ok || !data?.ok) {
    if (data?.error === "translation_unavailable") throw new Error("translation-unavailable");
    if (data?.error === "rate_limited" || data?.error === "translation_limit_reached") throw new Error("translation-rate-limited");
    throw new Error("translation-failed");
  }
  if (!data.document || typeof data.document !== "object") throw new Error("translation-failed");
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
