const safeText = (value, max = 500) => String(value || "").trim().slice(0, max);
const safeUrl = (value) => {
  const text = safeText(value, 2000);
  if (!text) return "";
  try { const url = new URL(text, "https://applycraft.io"); return ["http:", "https:"].includes(url.protocol) ? text : ""; } catch { return ""; }
};

export function createPrivateApplicationPackage(input = {}) {
  return {
    schemaVersion: 1,
    title: safeText(input.title, 200),
    resumeUrl: safeUrl(input.resumeUrl),
    coverLetterUrl: safeUrl(input.coverLetterUrl),
    portfolioUrl: safeUrl(input.portfolioUrl),
    contactLabel: safeText(input.contactLabel, 300),
    trackingEnabled: input.trackingEnabled === true,
    indexing: "noindex",
    createdByExplicitAction: input.confirmed === true,
  };
}

export function canShareApplicationPackage(pkg) {
  return pkg?.createdByExplicitAction === true && Boolean(pkg.resumeUrl || pkg.coverLetterUrl || pkg.portfolioUrl);
}

export const TRACKING_DISCLAIMER = "Link activity cannot prove who viewed the document.";
