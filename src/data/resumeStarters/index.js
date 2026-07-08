export const STARTER_METADATA = [
  { id: "sales-representative", slug: "sales-representative-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "sales-representative-resume" }, labels: { en: "Sales Representative", fr: "commercial", ar: "مندوب المبيعات" } },
  { id: "it-support-technician", slug: "it-support-technician-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "it-support-technician-resume", legacy: "it-support-resume" }, labels: { en: "IT Support Technician", fr: "technicien support informatique", ar: "فني دعم تقني" } },
  { id: "customer-service", slug: "customer-service-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "customer-service-resume", legacy: "customer-service-resume" }, labels: { en: "Customer Service", fr: "service client", ar: "خدمة العملاء" } },
  { id: "project-manager", slug: "project-manager-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "project-manager-resume" }, labels: { en: "Project Manager", fr: "chef de projet", ar: "مدير مشروع" } },
  { id: "data-analyst", slug: "data-analyst-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "data-analyst-resume" }, labels: { en: "Data Analyst", fr: "analyste de données", ar: "محلل بيانات" } },
  { id: "teacher", slug: "teacher-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "teacher-resume" }, labels: { en: "Teacher", fr: "enseignant", ar: "معلم" } },
  { id: "software-engineer", slug: "software-engineer-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "software-engineer-resume" }, labels: { en: "Software Engineer", fr: "ingénieur logiciel", ar: "مهندس برمجيات" } },
  { id: "accountant", slug: "accountant-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "accountant-resume" }, labels: { en: "Accountant", fr: "comptable", ar: "محاسب" } },
  { id: "administrative-assistant", slug: "administrative-assistant-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "administrative-assistant-resume" }, labels: { en: "Administrative Assistant", fr: "assistant administratif", ar: "مساعد إداري" } },
  { id: "entry-level", slug: "entry-level-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "entry-level-resume" }, labels: { en: "Entry-Level", fr: "débutant", ar: "مبتدئ" } },
  { id: "registered-nurse", slug: "registered-nurse-resume", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "registered-nurse-resume" }, labels: { en: "Registered Nurse", fr: "infirmier diplômé", ar: "ممرض مسجل" } },
  { id: "help-desk-analyst", slug: "help-desk-analyst-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "help-desk-analyst-resume" }, labels: { en: "Help Desk Analyst", fr: "analyste help desk", ar: "محلل مكتب المساعدة" } },
  { id: "linux-administrator", slug: "linux-administrator-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "linux-administrator-resume", legacy: "linux-administrator-resume" }, labels: { en: "Linux Administrator", fr: "administrateur Linux", ar: "مدير أنظمة لينكس" } },
  { id: "linux-system-administrator", slug: "linux-system-administrator-resume", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "linux-system-administrator-resume" }, labels: { en: "Linux System Administrator", fr: "administrateur systèmes Linux", ar: "مدير أنظمة لينكس" } },
  { id: "student", slug: "student-resume-builder", templateId: "modern", documentLanguage: "en", localizedSlugs: { en: "student-resume-builder" }, labels: { en: "Student", fr: "étudiant", ar: "طالب" } },
  { id: "canadian", slug: "canadian-resume-builder", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "canadian-resume-builder", fr: "creer-cv-canadien", example: "canadian-resume-format" }, labels: { en: "Canadian Resume", fr: "CV canadien", ar: "سيرة ذاتية كندية" } },
  { id: "french-cv", slug: "resume-in-french", templateId: "elegant", documentLanguage: "fr", localizedSlugs: { en: "resume-in-french", fr: "cv-francais", example: "french-cv-example" }, labels: { en: "French CV", fr: "CV français", ar: "سيرة ذاتية فرنسية" } },
  { id: "arabic-resume", slug: "resume-in-arabic", templateId: "minimal", documentLanguage: "ar", localizedSlugs: { en: "resume-in-arabic", ar: "resume-in-arabic" }, labels: { en: "Arabic Resume", fr: "CV arabe", ar: "سيرة ذاتية عربية" } },
  { id: "uk-cv", slug: "uk-cv-format", templateId: "classic", documentLanguage: "en", localizedSlugs: { en: "uk-cv-format" }, labels: { en: "UK CV", fr: "CV britannique", ar: "سيرة ذاتية بريطانية" } },
];

export function getResumeStarterMeta(starterId) {
  return STARTER_METADATA.find((starter) => starter.id === starterId) || null;
}

export function starterIdForSlug(slug) {
  const clean = String(slug || "").replace(/^\/+|\/+$/g, "").split("/").pop();
  const starter = STARTER_METADATA.find((item) =>
    item.slug === clean || Object.values(item.localizedSlugs || {}).includes(clean)
  );
  return starter?.id || "";
}

export function buildResumeStarterUrl(starterId, options = {}) {
  const params = new URLSearchParams();
  if (starterId) params.set("starter", starterId);
  if (options.interfaceLanguage) params.set("ui", options.interfaceLanguage);
  if (options.documentLanguage) params.set("docLang", options.documentLanguage);
  const query = params.toString();
  return query ? `/resume-builder/?${query}` : "/resume-builder/";
}

export function buildTemplateUrl(templateId, options = {}) {
  const params = new URLSearchParams();
  if (templateId) params.set("template", templateId);
  if (options.interfaceLanguage) params.set("ui", options.interfaceLanguage);
  if (options.documentLanguage) params.set("docLang", options.documentLanguage);
  const query = params.toString();
  return query ? `/resume-builder/?${query}` : "/resume-builder/";
}

export async function loadResumeStarter(starterId) {
  const { getResumeStarter } = await import("./starterContent.js");
  return getResumeStarter(starterId);
}
