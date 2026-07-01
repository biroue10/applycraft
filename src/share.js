// ──────────────────────────────────────────────────────────────────────────
// Shareable-resume links. The whole document is LZ-compressed into the URL
// fragment (after #) — nothing is uploaded to a server (browser-first). The
// viewer at /r decodes and renders it.
// ──────────────────────────────────────────────────────────────────────────

import LZString from "lz-string";

const SUPPORTED_SHARE_LANGS = new Set(["en", "fr", "ar", "es", "de"]);
const RTL_CONTENT_RE = /[\u0590-\u08ff\uFB1D-\uFDFF\uFE70-\uFEFF]/g;

// Legacy base64url fallback (links created before LZ compression).
function fromB64Url(s) {
  try {
    const norm = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(norm);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch { return null; }
}

export function encodeShare(payload) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(str) {
  // Try LZ first; fall back to the old base64url scheme.
  try {
    const json = LZString.decompressFromEncodedURIComponent(str);
    if (json) return JSON.parse(json);
  } catch { /* try legacy */ }
  const legacy = fromB64Url(str);
  if (legacy) { try { return JSON.parse(legacy); } catch { /* noop */ } }
  return null;
}

export function normalizeShareLanguage(language, fallback = "en") {
  const raw = String(language || "").trim().toLowerCase();
  const code = raw.split(/[-_]/)[0];
  return SUPPORTED_SHARE_LANGS.has(code) ? code : fallback;
}

function collectText(value, out = []) {
  if (!value) return out;
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, out));
    return out;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectText(item, out));
  }
  return out;
}

function inferLanguageFromContent(data) {
  const text = collectText(data).join(" ");
  const matches = text.match(RTL_CONTENT_RE) || [];
  return matches.length >= 8 ? "ar" : "en";
}

export function normalizeSharedDocument(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = raw.k === "cover" ? "cover" : raw.k === "resume" ? "resume" : null;
  if (!kind) return null;
  const data = raw.d && typeof raw.d === "object" ? raw.d : {};
  const hasExplicitLanguage = Boolean(raw.l || raw.language || raw.documentLanguage);
  const inferredFallback = hasExplicitLanguage ? "en" : inferLanguageFromContent(data);
  return {
    v: Number(raw.v || 1),
    k: kind,
    t: String(raw.t || raw.templateId || "modern"),
    l: normalizeShareLanguage(raw.l || raw.language || raw.documentLanguage, inferredFallback),
    p: String(raw.p || raw.pageSize || "a4").toLowerCase() === "letter" ? "letter" : "a4",
    c: raw.c && typeof raw.c === "object" ? raw.c : {},
    d: data,
  };
}

export function buildShareUrl(payload) {
  const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "https://applycraft.io";
  return `${origin}/r#${encodeShare(payload)}`;
}
