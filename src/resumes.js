// ──────────────────────────────────────────────────────────────────────────
// Session-only resume versions.
//
// ApplyCraft no longer persists user-written document content in browser
// storage. These helpers keep translated versions/open documents available
// while the current page is open, then intentionally reset on reopen.
// ──────────────────────────────────────────────────────────────────────────

const SUB_KEY = "ac_subscription";
let sessionResumes = [];

export const FREE_RESUME_LIMIT = 2;
export const SUBSCRIPTION = { priceUsd: 3, period: "month" };

const hasLS = () => typeof localStorage !== "undefined";

function read() {
  return Array.isArray(sessionResumes) ? sessionResumes : [];
}
function write(list) {
  sessionResumes = Array.isArray(list) ? list : [];
}

export function newResumeId() {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return "r-" + crypto.randomUUID(); } catch { /* noop */ }
  return "r-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function listResumes() {
  return read().slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
export function getResume(id) { return read().find((r) => r.id === id) || null; }
export function countResumes() { return read().length; }

// Create or update a saved resume; returns its id.
export function upsertResume({ id, title, data }) {
  const list = read();
  const now = Date.now();
  const idx = id ? list.findIndex((r) => r.id === id) : -1;
  if (idx >= 0) { list[idx] = { ...list[idx], title, data, updatedAt: now }; write(list); return id; }
  const newId = id || newResumeId();
  list.push({ id: newId, title, data, createdAt: now, updatedAt: now });
  write(list);
  return newId;
}
export function deleteResume(id) { write(read().filter((r) => r.id !== id)); }

export function isSubscribed() { return hasLS() && localStorage.getItem(SUB_KEY) === "active"; }
export function setSubscribed(active) { if (hasLS()) { try { localStorage.setItem(SUB_KEY, active ? "active" : ""); } catch { /* noop */ } } }

// Can the user create/save ANOTHER (new) resume right now?
export function canCreateNew() { return isSubscribed() || read().length < FREE_RESUME_LIMIT; }
