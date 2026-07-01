const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DOMAIN_RE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;
const PHONE_RE = /^(?:\+\d[\d\s().-]{5,}\d|\d{10,15})$/;
const TOKEN_RE = /((?:https?:\/\/|mailto:|www\.)[^\s<>()]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>()]*)?)|(?:\+\d[\d\s().-]{5,}\d|\b\d{10,15}\b))/gi;
const TRAILING_PUNCTUATION_RE = /[.,;:!?)]*$/;

function trimToken(raw) {
  const value = String(raw || "");
  const trailing = value.match(TRAILING_PUNCTUATION_RE)?.[0] || "";
  if (!trailing) return { token: value, trailing: "" };
  return { token: value.slice(0, -trailing.length), trailing };
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function normalizeLinkHref(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  if (/^(?:javascript|data|vbscript|file):/i.test(text)) return "";

  if (lower.startsWith("mailto:")) {
    const email = text.slice(7);
    return EMAIL_RE.test(email) ? `mailto:${email}` : "";
  }

  if (/^https?:\/\//i.test(text)) return safeUrl(text);
  if (/^www\./i.test(text)) return safeUrl(`https://${text}`);
  if (EMAIL_RE.test(text)) return `mailto:${text}`;
  if (PHONE_RE.test(text)) {
    const normalized = text.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    return normalized.length >= 7 ? `tel:${normalized}` : "";
  }
  if (DOMAIN_RE.test(text)) return safeUrl(`https://${text}`);
  return "";
}

export function linkifyText(input) {
  const text = String(input ?? "");
  if (!text) return [{ type: "text", text: "" }];

  const parts = [];
  let cursor = 0;

  for (const match of text.matchAll(TOKEN_RE)) {
    const raw = match[0];
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ type: "text", text: text.slice(cursor, index) });

    const { token, trailing } = trimToken(raw);
    const href = normalizeLinkHref(token);
    if (href) {
      const protocol = href.split(":")[0] + ":";
      parts.push({
        type: "link",
        text: token,
        href,
        external: protocol === "http:" || protocol === "https:",
      });
    } else {
      parts.push({ type: "text", text: token });
    }
    if (trailing) parts.push({ type: "text", text: trailing });
    cursor = index + raw.length;
  }

  if (cursor < text.length) parts.push({ type: "text", text: text.slice(cursor) });
  return parts.length ? parts : [{ type: "text", text }];
}
