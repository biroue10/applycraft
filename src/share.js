// ──────────────────────────────────────────────────────────────────────────
// Shareable document links. Private offline links keep document data in the
// URL fragment; the paused short-link API remains here for a future storage-backed release.
// The older LZ-compressed URL fragment format remains available as a private
// offline fallback and for backward compatibility.
// ──────────────────────────────────────────────────────────────────────────

import LZString from "lz-string";
import { normalizeResumeData } from "./resumeData.js";

const SUPPORTED_SHARE_LANGS = new Set(["en", "fr", "ar", "es", "de"]);
const RTL_CONTENT_RE = /[\u0590-\u08ff\uFB1D-\uFDFF\uFE70-\uFEFF]/g;
export const SHARE_ID_RE = /^[A-Za-z0-9_-]{8,24}$/;

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
    d: kind === "resume" ? normalizeResumeData(data) : data,
  };
}

export function buildShareUrl(payload) {
  const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "https://applycraft.io";
  return `${origin}/r#${encodeShare(payload)}`;
}

export const buildPrivateShareUrl = buildShareUrl;

export async function createShortShareLink(payload, { expiresInDays = 30 } = {}) {
  const response = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, expiresInDays }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok || !data?.ok || !data?.url) {
    const code = data?.error?.code || data?.error || "network_error";
    const err = new Error(code);
    err.code = code;
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function fetchShortSharedDocument(shareId) {
  if (!SHARE_ID_RE.test(String(shareId || ""))) {
    const err = new Error("invalid_link");
    err.code = "invalid_link";
    throw err;
  }
  const response = await fetch(`/api/share/${shareId}`, { headers: { Accept: "application/json" } });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok || !data?.ok || !data?.payload) {
    const code = data?.error || data?.error?.code || (response.status === 404 ? "not_found" : "network_error");
    const err = new Error(code);
    err.code = code;
    err.status = response.status;
    throw err;
  }
  return normalizeSharedDocument(data.payload);
}
