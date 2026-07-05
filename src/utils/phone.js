export function formatPhoneForResume(phone, phoneCode = "", defaultPhoneCode = "") {
  const raw = String(phone || "").trim();
  if (!raw) return "";
  if (/^\+\d/.test(raw)) return raw;
  const selectedCode = String(phoneCode || "").trim();
  const fallbackCode = String(defaultPhoneCode || "").trim();
  if (selectedCode && selectedCode !== fallbackCode) return `${selectedCode} ${raw}`;
  return raw;
}
