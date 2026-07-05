const HEADER = "X-AC-Trace";
const EVENT = "ac:translation-dev-state";
const FN = "__actdiag";
const HASH_RE = /^[a-f0-9]{64}$/i;

function storageKeys(hash) {
  if (!HASH_RE.test(hash || "")) return null;
  return {
    enabled: `ac:${hash.slice(0, 12)}:t`,
    token: `ac:${hash.slice(12, 24)}:s`,
  };
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isActive(hash) {
  if (typeof localStorage === "undefined") return false;
  const keys = storageKeys(hash);
  if (!keys) return false;
  try {
    return localStorage.getItem(keys.enabled) === "1" && Boolean(localStorage.getItem(keys.token));
  } catch {
    return false;
  }
}

export function token(hash) {
  if (typeof localStorage === "undefined" || !isActive(hash)) return "";
  const keys = storageKeys(hash);
  if (!keys) return "";
  try {
    return localStorage.getItem(keys.token) || "";
  } catch {
    return "";
  }
}

export function install(hash, target = globalThis) {
  if (!target || !HASH_RE.test(hash || "")) return false;
  Object.defineProperty(target, FN, {
    configurable: true,
    writable: false,
    value: async (candidate) => {
      const keys = storageKeys(hash);
      if (!keys || typeof localStorage === "undefined") return false;
      if (candidate === false || candidate === "off") {
        clear(hash);
        return true;
      }
      const raw = String(candidate || "");
      if ((await sha256Hex(raw)).toLowerCase() !== hash.toLowerCase()) return false;
      localStorage.setItem(keys.enabled, "1");
      localStorage.setItem(keys.token, raw);
      target.dispatchEvent?.(new CustomEvent(EVENT));
      return true;
    },
  });
  return true;
}

export function clear(hash) {
  if (typeof localStorage === "undefined") return;
  const keys = storageKeys(hash);
  if (!keys) return;
  try {
    localStorage.removeItem(keys.enabled);
    localStorage.removeItem(keys.token);
    globalThis.dispatchEvent?.(new CustomEvent(EVENT));
  } catch {
    /* noop */
  }
}

export const eventName = EVENT;
export const functionName = FN;
export const headerName = HEADER;
