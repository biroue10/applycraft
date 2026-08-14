// Canonical multilingual positioning and Application Pack story.
// Intent-specific SEO pages retain their own focused copy.
export const PRODUCT_POSITIONING = {
  locales: {
    en: {
      headline: "Build a resume in your language.",
      supportingText: "Turn your experience into a clear, ATS-conscious resume, add a matching cover letter, and keep your applications organised. No watermark.",
      primaryCta: "Build my resume",
      secondaryCta: "Check my resume",
      trustItems: ["Secure email sign-in", "No watermark", "PDF & DOCX", "English · Français · العربية"],
    },
    fr: {
      headline: "Créez un CV dans votre langue.",
      supportingText: "Transformez votre parcours en CV clair et adapté aux ATS, ajoutez une lettre assortie et gardez vos candidatures organisées. Sans filigrane.",
      primaryCta: "Créer mon CV",
      secondaryCta: "Vérifier mon CV",
      trustItems: ["Connexion sécurisée", "Sans filigrane", "PDF et DOCX", "English · Français · العربية"],
    },
    ar: {
      headline: "أنشئ سيرتك الذاتية بلغتك.",
      supportingText: "حوّل خبرتك إلى سيرة ذاتية واضحة تراعي أنظمة ATS، وأضف خطاب تقديم متناسقًا ونظّم طلباتك. دون علامة مائية.",
      primaryCta: "إنشاء سيرتي الذاتية",
      secondaryCta: "فحص سيرتي الذاتية",
      trustItems: ["تسجيل دخول آمن", "دون علامة مائية", "PDF وDOCX", "English · Français · العربية"],
    },
  },
};

export function positioningFor(locale = "en") {
  return PRODUCT_POSITIONING.locales[locale] || PRODUCT_POSITIONING.locales.en;
}
