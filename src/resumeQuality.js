const PLACEHOLDER_RE = /\b(?:lorem(?:\s+ipsum)?|test|asdf|sample text|placeholder)\b/i;
const EMPTY_COLON_RE = /^\s*(?:[•\-*]\s*)?[\p{L}\p{N}][\p{L}\p{N}\s/&().-]{1,48}:\s*$/u;

const CAPITALIZATION_SUGGESTIONS = [
  { re: /\bredhat\b/i, label: "Red Hat" },
  { re: /\bcesaup\b/i, label: "CESA SUP" },
  { re: /\bmaroc\b/i, label: "Morocco / Maroc" },
];

const ROLE_KEYWORDS = {
  design: /\b(product designer|ux|ui|figma|prototype|design system|user research|wireframe)\b/i,
  it: /\b(service desk|it support|help ?desk|linux|mdm|active directory|endpoint|ticket|sysadmin|network)\b/i,
  engineering: /\b(engineer|developer|software|frontend|backend|devops|python|react|node|java|api)\b/i,
  product: /\b(product manager|roadmap|stakeholder|launch|metrics|analytics|go-to-market)\b/i,
};

const PRESENT_LABELS = {
  en: "Present",
  fr: "Présent",
  ar: "حتى الآن",
  es: "Presente",
  de: "Heute",
};

export function presentLabel(language = "en") {
  const lang = String(language || "en").toLowerCase().split("-")[0];
  return PRESENT_LABELS[lang] || PRESENT_LABELS.en;
}

export function isPlaceholderText(value) {
  return PLACEHOLDER_RE.test(String(value || ""));
}

export function isPlaceholderOnly(value) {
  const text = String(value || "").trim();
  return !!text && /^(?:lorem(?:\s+ipsum)?|test|asdf|sample text|placeholder)$/i.test(text);
}

export function normalizeDateRange(value, lang = "en") {
  const text = String(value || "").trim();
  if (!text) return "";
  const dash = lang === "ar" ? " – " : " – ";
  const present = presentLabel(lang);
  return text
    .replace(/\s*[—–-]\s*/g, dash)
    .replace(/\b(\d{4})\s+(\d{4}|present|présent|aujourd'hui|الحاضر|حتى الآن)\b/gi, `$1${dash}$2`)
    .replace(/\b([A-Za-zÀ-ÿ]{3,9}\s+\d{4})\s+([A-Za-zÀ-ÿ]{3,9}\s+\d{4}|present|présent|aujourd'hui)\b/gi, `$1${dash}$2`)
    .replace(/\b(?:present|présent|aujourd'hui)\b/gi, present)
    .replace(/(?:الحاضر|حتى الآن)/g, present)
    .replace(/\s+–\s+/g, dash)
    .trim();
}

export function formatDateRange({ startDate = "", endDate = "", isCurrent = false, language = "en" } = {}) {
  const start = String(startDate || "").trim();
  const end = isCurrent ? presentLabel(language) : String(endDate || "").trim();
  if (start && end) return normalizeDateRange(`${start} – ${end}`, language);
  if (start) return start;
  if (end) return normalizeDateRange(end, language);
  return "";
}

function allResumeText(data, form) {
  const pieces = [
    data?.name,
    data?.title,
    ...(data?.contact || []),
    data?.summary,
    ...(data?.sections || []).flatMap((section) => [section.heading, ...(section.items || [])]),
  ];
  if (form) {
    pieces.push(form.email, form.phone, form.location, form.linkedin, form.website);
    for (const value of Object.values(form)) {
      if (typeof value === "string") pieces.push(value);
    }
  }
  return pieces.filter(Boolean).join("\n");
}

function detectRole(text) {
  for (const [role, re] of Object.entries(ROLE_KEYWORDS)) {
    if (re.test(text)) return role;
  }
  return "";
}

function contactHasEmail(data, form) {
  const email = String(form?.email || "").trim().toLowerCase();
  if (!email) return true;
  return (data?.contact || []).some((item) => String(item || "").toLowerCase().includes(email));
}

function pushUnique(warnings, warning) {
  if (!warnings.some((w) => w.type === warning.type && w.detail === warning.detail)) warnings.push(warning);
}

export function analyzeResumeQuality(data, form = {}, options = {}) {
  const lang = options.lang || "en";
  const warnings = [];
  const text = allResumeText(data, form);

  const placeholder = text.match(PLACEHOLDER_RE)?.[0];
  if (placeholder) pushUnique(warnings, {
    type: "placeholder",
    detail: placeholder,
    message: "Your résumé contains placeholder text. Replace it before sending your application.",
    short: `Placeholder text found: ${placeholder}`,
  });

  const titleRole = detectRole(data?.title || "");
  const bodyRole = detectRole([data?.summary, ...(data?.sections || []).flatMap((s) => s.items || [])].join(" "));
  if (titleRole && bodyRole && titleRole !== bodyRole) pushUnique(warnings, {
    type: "headlineMismatch",
    message: "Your headline may not match your résumé content. Consider using a title that reflects your target role.",
    short: "Your headline may not match your experience.",
  });

  if (!contactHasEmail(data, form)) pushUnique(warnings, {
    type: "hiddenEmail",
    message: "Your email may not be visible in the main contact section.",
    short: "Your email may not be visible in the main contact section.",
  });

  for (const section of data?.sections || []) {
    for (const item of section.items || []) {
      if (EMPTY_COLON_RE.test(item)) pushUnique(warnings, {
        type: "emptyBullet",
        detail: item.trim(),
        message: "One of your bullets appears incomplete. Add details or remove it.",
        short: `Empty bullet found: ${item.trim()}`,
      });
      if (/\b\d{4}\s+\d{4}\b/.test(item)) pushUnique(warnings, {
        type: "dateDash",
        detail: normalizeDateRange(item, lang),
        message: "Date range should use a dash.",
        short: `Date range should use a dash: ${normalizeDateRange(item, lang)}`,
      });
    }
  }

  for (const suggestion of CAPITALIZATION_SUGGESTIONS) {
    if (suggestion.re.test(text)) pushUnique(warnings, {
      type: "capitalization",
      detail: suggestion.label,
      message: "Some names or locations may need capitalization corrections.",
      short: `Possible capitalization: ${suggestion.label}`,
    });
  }

  const bulletCounts = (data?.sections || [])
    .filter((s) => /experience|work|expér|projects?|projets?/i.test(`${s.key || ""} ${s.heading || ""}`))
    .flatMap((s) => s.items || [])
    .length;
  if (bulletCounts > 18) pushUnique(warnings, {
    type: "longSections",
    message: "Several sections are long. Consider keeping 3–5 bullets per role.",
    short: "Several sections are long. Consider keeping 3–5 bullets per role.",
  });

  return warnings;
}
