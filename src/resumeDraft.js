export const RESUME_DRAFT_KEY = "applycraft:resume-builder:draft:v1";
export const RESUME_DRAFT_VERSION = 1;

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function sanitize(value, depth = 0) {
  if (depth > 12) return null;
  if (Array.isArray(value)) return value.slice(0, 500).map((item) => sanitize(item, depth + 1));
  if (!value || typeof value !== "object") {
    return ["string", "number", "boolean"].includes(typeof value) || value === null ? value : null;
  }
  const clean = Object.create(null);
  for (const [key, item] of Object.entries(value)) {
    if (!FORBIDDEN_KEYS.has(key)) clean[key] = sanitize(item, depth + 1);
  }
  return clean;
}

export function hasMeaningfulResumeDraft(data) {
  if (!data || typeof data !== "object") return false;
  const scalar = ["name", "title", "email", "phone", "location", "linkedin", "website", "summary"];
  if (scalar.some((key) => String(data[key] || "").trim())) return true;
  return Object.keys(data).some((key) => key.endsWith("Entries")
    && Array.isArray(data[key])
    && data[key].some((entry) => entry && Object.entries(entry)
      .some(([field, value]) => field !== "id" && field !== "visible" && String(value || "").trim())));
}

export function createResumeDraftEnvelope({ data, interfaceLanguage, documentLanguage, templateId, documentId }) {
  return {
    version: RESUME_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    documentId: String(documentId || "local"),
    interfaceLanguage: ["en", "fr", "ar"].includes(interfaceLanguage) ? interfaceLanguage : "en",
    documentLanguage: String(documentLanguage || "en").slice(0, 12),
    templateId: templateId ? String(templateId).slice(0, 80) : undefined,
    data: sanitize(data),
  };
}

export function readResumeDraft(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(RESUME_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== RESUME_DRAFT_VERSION || !parsed.data || typeof parsed.data !== "object") return null;
    const clean = createResumeDraftEnvelope(parsed);
    clean.savedAt = Number.isNaN(Date.parse(parsed.savedAt)) ? new Date(0).toISOString() : parsed.savedAt;
    return hasMeaningfulResumeDraft(clean.data) ? clean : null;
  } catch {
    return null;
  }
}

export function writeResumeDraft(envelope, storage = globalThis.localStorage) {
  try {
    storage?.setItem(RESUME_DRAFT_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function clearResumeDraft(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(RESUME_DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}
