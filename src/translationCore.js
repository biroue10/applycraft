export const TRANSLATION_STATUSES = {
  original: "original",
  aiTranslated: "ai_translated",
  editedAfterTranslation: "edited_after_translation",
  needsReview: "needs_review",
  humanReviewed: "human_reviewed",
};

export const TRANSLATABLE_RESUME_FIELDS = [
  "title",
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "projects",
  "volunteer",
  "awards",
  "extracurricular",
];

function normalizeTranslationText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();
}

export function serializeResumeTranslationContent(form) {
  const content = {};
  for (const key of TRANSLATABLE_RESUME_FIELDS) {
    const value = normalizeTranslationText(form?.[key]);
    if (value) content[key] = value;
  }
  return content;
}
