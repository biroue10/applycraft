// ──────────────────────────────────────────────────────────────────────────
// Shareable-resume links. The whole document is encoded into the URL fragment
// (after #), so nothing is uploaded to a server — consistent with the
// browser-first promise. The viewer at /r decodes and renders it.
// ──────────────────────────────────────────────────────────────────────────

function toB64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(s) {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShare(payload) { return toB64Url(JSON.stringify(payload)); }
export function decodeShare(str) {
  try { return JSON.parse(fromB64Url(str)); } catch { return null; }
}

export function buildShareUrl(payload) {
  const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "https://applycraft.io";
  return `${origin}/r#${encodeShare(payload)}`;
}
