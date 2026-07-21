const SESSION_KEY = "ac_session";
const ACCOUNT_KEY = "ac_account";
export const CONSENT_KEY = "ac_consent_sync";

export function readAccountValue(key, fallback = null) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function writeAccountValue(key, value) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* unavailable */ }
}

export const getSession = () => readAccountValue(SESSION_KEY);
export const getAccount = () => readAccountValue(ACCOUNT_KEY);
export function setAccount(account) { if (account) writeAccountValue(ACCOUNT_KEY, account); }
export function hasActivePass() {
  const account = getAccount();
  return Boolean(account?.activePass && account.passExpires && new Date(account.passExpires).getTime() > Date.now());
}
export function logout() {
  if (typeof localStorage === "undefined") return;
  [SESSION_KEY, ACCOUNT_KEY].forEach((key) => localStorage.removeItem(key));
}
