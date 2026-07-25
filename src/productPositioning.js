// Canonical multilingual positioning and Application Pack story.
// Intent-specific SEO pages retain their own focused copy.
export const PRODUCT_POSITIONING = {
  locales: {
    en: {
      headline: "Create a professional resume—in English, French or Arabic.",
      supportingText: "Start with a free ATS-conscious resume, then tailor it, add a matching cover letter and track your applications when you are ready. No mandatory account or watermark.",
      primaryCta: "Create my resume free",
      secondaryCta: "Check my existing resume",
      trustItems: ["No mandatory account", "No watermark", "PDF & DOCX", "English · Français · العربية"],
    },
    fr: {
      headline: "Créez un CV professionnel en anglais, français ou arabe.",
      supportingText: "Commencez par un CV gratuit adapté aux ATS, puis personnalisez-le, ajoutez une lettre et suivez vos candidatures lorsque vous êtes prêt. Sans compte obligatoire ni filigrane.",
      primaryCta: "Créer mon CV gratuitement",
      secondaryCta: "Vérifier mon CV existant",
      trustItems: ["Sans compte obligatoire", "Sans filigrane", "PDF et DOCX", "English · Français · العربية"],
    },
    ar: {
      headline: "أنشئ سيرة ذاتية احترافية بالإنجليزية أو الفرنسية أو العربية.",
      supportingText: "ابدأ بسيرة ذاتية مجانية تراعي أنظمة ATS، ثم خصّصها وأضف خطاب تقديم وتابع طلباتك عندما تكون مستعدًا. دون حساب إلزامي أو علامة مائية.",
      primaryCta: "إنشاء سيرتي الذاتية مجانًا",
      secondaryCta: "فحص سيرتي الذاتية الحالية",
      trustItems: ["دون حساب إلزامي", "دون علامة مائية", "PDF وDOCX", "English · Français · العربية"],
    },
  },
};

export function positioningFor(locale = "en") {
  return PRODUCT_POSITIONING.locales[locale] || PRODUCT_POSITIONING.locales.en;
}
