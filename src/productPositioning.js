// Canonical multilingual positioning and Application Pack story.
// Intent-specific SEO pages retain their own focused copy.
export const PRODUCT_POSITIONING = {
  locales: {
    en: {
      headline: "Create a professional resume—in English, French or Arabic.",
      supportingText: "Create a free ATS-conscious resume, tailor it, add a matching cover letter and track your applications with secure passwordless access. No watermark.",
      primaryCta: "Create my resume free",
      secondaryCta: "Check my existing resume",
      trustItems: ["Secure email sign-in", "No watermark", "PDF & DOCX", "English · Français · العربية"],
    },
    fr: {
      headline: "Créez un CV professionnel en anglais, français ou arabe.",
      supportingText: "Créez un CV gratuit adapté aux ATS, personnalisez-le, ajoutez une lettre et suivez vos candidatures avec une connexion sécurisée sans mot de passe. Sans filigrane.",
      primaryCta: "Créer mon CV gratuitement",
      secondaryCta: "Vérifier mon CV existant",
      trustItems: ["Connexion sécurisée", "Sans filigrane", "PDF et DOCX", "English · Français · العربية"],
    },
    ar: {
      headline: "أنشئ سيرة ذاتية احترافية بالإنجليزية أو الفرنسية أو العربية.",
      supportingText: "أنشئ سيرة ذاتية مجانية تراعي أنظمة ATS، ثم خصّصها وأضف خطاب تقديم وتابع طلباتك عبر تسجيل دخول آمن دون كلمة مرور. دون علامة مائية.",
      primaryCta: "إنشاء سيرتي الذاتية مجانًا",
      secondaryCta: "فحص سيرتي الذاتية الحالية",
      trustItems: ["تسجيل دخول آمن", "دون علامة مائية", "PDF وDOCX", "English · Français · العربية"],
    },
  },
};

export function positioningFor(locale = "en") {
  return PRODUCT_POSITIONING.locales[locale] || PRODUCT_POSITIONING.locales.en;
}
