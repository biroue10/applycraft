import { normalizeLinkHref } from "./linkify.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_RE = /^(?:\+\d[\d\s().-]{5,}\d|\d{10,15})$/;
const URL_RE = /^(?:https?:\/\/|www\.|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)$/i;
const BLOCKED_PROTOCOL_RE = /^(?:javascript|data|vbscript|file|blob):/i;

export function getContactHref(item) {
  const value = String(item?.value || "").trim();
  const type = String(item?.type || "").toLowerCase();
  if (!value || BLOCKED_PROTOCOL_RE.test(value)) return "";

  if (type === "email") return EMAIL_RE.test(value) ? `mailto:${value}` : "";
  if (type === "phone") {
    if (!PHONE_RE.test(value)) return "";
    const phone = value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    return phone.length >= 7 ? `tel:${phone}` : "";
  }
  if (type === "location") return "";
  if (type === "url" || type === "linkedin" || type === "website") return normalizeContactUrl(value);

  if (EMAIL_RE.test(value)) return `mailto:${value}`;
  if (PHONE_RE.test(value)) {
    const phone = value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    return phone.length >= 7 ? `tel:${phone}` : "";
  }
  return URL_RE.test(value) ? normalizeContactUrl(value) : "";
}

function normalizeContactUrl(value) {
  const href = normalizeLinkHref(value);
  return href.replace(/^(https?:\/\/[^/]+)\/$/i, "$1");
}

export function inferContactType(value, index = -1) {
  const text = String(value || "").trim();
  if (!text) return "text";
  if (EMAIL_RE.test(text) || text.toLowerCase().startsWith("mailto:")) return "email";
  if (PHONE_RE.test(text)) return "phone";
  if (/linkedin\.com/i.test(text)) return "linkedin";
  if (URL_RE.test(text)) return "website";
  if (index === 0) return "email";
  if (index === 1) return "phone";
  if (index === 2) return "location";
  if (index === 3) return "linkedin";
  if (index === 4) return "website";
  return "text";
}

export function normalizeContactItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return {
          type: item.type || inferContactType(item.value, index),
          value: String(item.value || "").trim(),
        };
      }
      const value = String(item || "").trim();
      return { type: inferContactType(value, index), value };
    })
    .filter((item) => item.value);
}
