export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function asText(value) {
  return value == null ? "" : String(value);
}

export function normalizeResumeData(raw = {}) {
  const safe = asObject(raw);

  return {
    name: asText(safe.name),
    title: asText(safe.title),
    summary: asText(safe.summary),
    contact: asArray(safe.contact).filter(Boolean),
    sections: asArray(safe.sections).map(normalizeResumeSection).filter(Boolean),
    skills: asArray(safe.skills).filter(Boolean),
    languages: asArray(safe.languages).filter(Boolean),
    certifications: asArray(safe.certifications).filter(Boolean),
    projects: asArray(safe.projects).filter(Boolean),
    education: asArray(safe.education).filter(Boolean),
    experience: asArray(safe.experience).filter(Boolean),
    photo: safe.photo || null,
  };
}

export function normalizeResumeSection(section = {}) {
  const safe = asObject(section);
  const heading = asText(safe.heading);
  const key = asText(safe.key);
  const items = asArray(safe.items).filter(Boolean);
  if (!heading && !key && !items.length) return null;
  return {
    key,
    heading,
    isCustom: Boolean(safe.isCustom),
    items,
  };
}

function meaningfulText(value) {
  const text = asText(value).trim();
  return text && text !== "—";
}

export function isResumeDataEmpty(raw = {}) {
  const data = normalizeResumeData(raw);
  return !meaningfulText(data.name)
    && !meaningfulText(data.title)
    && !meaningfulText(data.summary)
    && !data.contact.some(meaningfulText)
    && !data.experience.some(meaningfulText)
    && !data.education.some(meaningfulText)
    && !data.skills.some(meaningfulText)
    && !data.languages.some(meaningfulText)
    && !data.certifications.some(meaningfulText)
    && !data.projects.some(meaningfulText)
    && !data.sections.some((section) => (
      meaningfulText(section.heading) || asArray(section.items).some(meaningfulText)
    ));
}

export function emptyResumePreviewMessage(lang = "en") {
  if (lang === "fr") return "Ajoutez vos informations pour prévisualiser votre CV.";
  if (lang === "ar") return "ابدأ بإضافة معلوماتك لمعاينة سيرتك الذاتية.";
  return "Start adding your details to preview your résumé.";
}
