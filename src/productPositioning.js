// Canonical multilingual positioning and Application Pack story.
// Intent-specific SEO pages retain their own focused copy.
export const PRODUCT_POSITIONING = {
  locales: {
    en: {
      headline: "Build, tailor and track every job application—in English, French or Arabic.",
      supportingText: "Create an ATS-conscious resume, matching cover letter and interview plan from one career profile. No mandatory account, no watermark, with PDF and DOCX export.",
      primaryCta: "Create my application package",
      secondaryCta: "Check my existing resume",
      trustItems: ["No mandatory account", "No watermark", "PDF & DOCX", "English · Français · العربية"],
    },
    fr: {
      headline: "Créez, adaptez et suivez chaque candidature en anglais, français ou arabe.",
      supportingText: "Créez un CV adapté aux ATS, une lettre de motivation assortie et un plan de préparation à l’entretien à partir d’un seul profil professionnel. Sans compte obligatoire, sans filigrane, avec export PDF et DOCX.",
      primaryCta: "Créer mon dossier de candidature",
      secondaryCta: "Vérifier mon CV existant",
      trustItems: ["Sans compte obligatoire", "Sans filigrane", "PDF et DOCX", "English · Français · العربية"],
    },
    ar: {
      headline: "أنشئ كل طلب توظيف وخصّصه وتابعه بالإنجليزية أو الفرنسية أو العربية.",
      supportingText: "أنشئ سيرة ذاتية تراعي أنظمة ATS وخطاب تقديم متناسقًا وخطة للاستعداد للمقابلة انطلاقًا من ملف مهني واحد، دون حساب إلزامي أو علامة مائية، مع التصدير إلى PDF وDOCX.",
      primaryCta: "إنشاء حزمة التقديم الخاصة بي",
      secondaryCta: "فحص سيرتي الذاتية الحالية",
      trustItems: ["دون حساب إلزامي", "دون علامة مائية", "PDF وDOCX", "English · Français · العربية"],
    },
  },
};

export function positioningFor(locale = "en") {
  return PRODUCT_POSITIONING.locales[locale] || PRODUCT_POSITIONING.locales.en;
}
