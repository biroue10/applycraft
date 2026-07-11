// Interview Prep translations.
//
// These live inside the lazy-loaded interview module (NOT the global i18n index)
// so the strings ship in the /interview-prep/ route chunk and never bloat the
// initial homepage bundle. The primary navbar/footer LABEL is the only interview
// string in the shared i18n namespace (see src/i18n/namespaces/*/footer.js).
const INTERVIEW_I18N = {
  en: {
    dir: "ltr",
    heading: "Interview Prep",
    subheading: "Practise a realistic job interview with an AI recruiter, then get structured feedback — free, in your browser, no signup.",
    setup: {
      jobOfferLabel: "Paste the job offer",
      jobOfferPlaceholder: "Paste the full job description here — role, responsibilities, requirements…",
      jobOfferHint: "{count} / {max} characters",
      languageLabel: "Interview language",
      levelLabel: "Experience level",
      startBtn: "Start simulation",
      privacyNotice: "Your interview stays in your browser for this session only. We never store your answers.",
    },
    levels: { junior: "Junior", confirme: "Mid-level", senior: "Senior" },
    languages: { en: "English", fr: "French", ar: "Arabic" },
    validation: {
      jobOfferRequired: "Please paste the job offer first.",
      jobOfferTooLong: "The job offer is too long (max {max} characters).",
    },
    chat: {
      counter: "Question {n} / {max}",
      recruiter: "Recruiter",
      you: "You",
      answerPlaceholder: "Type your answer…",
      answerHint: "{count} / {max} characters",
      send: "Send answer",
      finish: "Finish & get my feedback",
      thinking: "The recruiter is thinking…",
      restart: "Start over",
    },
    feedback: {
      heading: "Your interview feedback",
      score: "Overall score",
      scoreOutOf: "{score} / 100",
      strengths: "Strengths",
      improvements: "Areas to improve",
      rephrasings: "Suggested rephrasings",
      questionLabel: "Question",
      suggestionLabel: "Stronger answer",
      summary: "Summary",
      generating: "Analysing your interview…",
      startOver: "Practise again",
    },
    quota: {
      left: "{n} free simulations left this session",
      reachedTitle: "You've used your free simulations",
      reachedBody: "You've reached the free interview simulations for now. More practice is coming soon.",
    },
    errors: {
      rate_limited: "You've reached today's free interview limit. Please try again later.",
      upstream_failed: "The AI recruiter is temporarily unavailable. Please try again.",
      timeout: "The recruiter took too long to respond. Please try again.",
      generic: "Something went wrong. Please try again.",
    },
  },
  fr: {
    dir: "ltr",
    heading: "Préparation entretien",
    subheading: "Entraînez-vous à un entretien d'embauche réaliste avec un recruteur IA, puis recevez un retour structuré — gratuit, dans votre navigateur, sans inscription.",
    setup: {
      jobOfferLabel: "Collez l'offre d'emploi",
      jobOfferPlaceholder: "Collez ici la description complète du poste — intitulé, missions, exigences…",
      jobOfferHint: "{count} / {max} caractères",
      languageLabel: "Langue de l'entretien",
      levelLabel: "Niveau d'expérience",
      startBtn: "Démarrer la simulation",
      privacyNotice: "Votre entretien reste dans votre navigateur pour cette session uniquement. Nous ne stockons jamais vos réponses.",
    },
    levels: { junior: "Junior", confirme: "Confirmé", senior: "Senior" },
    languages: { en: "Anglais", fr: "Français", ar: "Arabe" },
    validation: {
      jobOfferRequired: "Veuillez d'abord coller l'offre d'emploi.",
      jobOfferTooLong: "L'offre d'emploi est trop longue (max {max} caractères).",
    },
    chat: {
      counter: "Question {n} / {max}",
      recruiter: "Recruteur",
      you: "Vous",
      answerPlaceholder: "Saisissez votre réponse…",
      answerHint: "{count} / {max} caractères",
      send: "Envoyer la réponse",
      finish: "Terminer et voir mon bilan",
      thinking: "Le recruteur réfléchit…",
      restart: "Recommencer",
    },
    feedback: {
      heading: "Votre bilan d'entretien",
      score: "Note globale",
      scoreOutOf: "{score} / 100",
      strengths: "Points forts",
      improvements: "Axes d'amélioration",
      rephrasings: "Reformulations suggérées",
      questionLabel: "Question",
      suggestionLabel: "Réponse renforcée",
      summary: "Synthèse",
      generating: "Analyse de votre entretien…",
      startOver: "S'entraîner à nouveau",
    },
    quota: {
      left: "{n} simulations gratuites restantes cette session",
      reachedTitle: "Vous avez utilisé vos simulations gratuites",
      reachedBody: "Vous avez atteint les simulations d'entretien gratuites pour le moment. Plus d'entraînement bientôt disponible.",
    },
    errors: {
      rate_limited: "Vous avez atteint la limite d'entretiens gratuits du jour. Réessayez plus tard.",
      upstream_failed: "Le recruteur IA est momentanément indisponible. Veuillez réessayer.",
      timeout: "Le recruteur a mis trop de temps à répondre. Veuillez réessayer.",
      generic: "Une erreur s'est produite. Veuillez réessayer.",
    },
  },
  ar: {
    dir: "rtl",
    heading: "تحضير المقابلة",
    subheading: "تدرّب على مقابلة عمل واقعية مع مسؤول توظيف بالذكاء الاصطناعي، ثم احصل على ملاحظات منظمة — مجاناً، في متصفحك، دون تسجيل.",
    setup: {
      jobOfferLabel: "الصق عرض العمل",
      jobOfferPlaceholder: "الصق هنا الوصف الكامل للوظيفة — المسمى والمهام والمتطلبات…",
      jobOfferHint: "{count} / {max} حرف",
      languageLabel: "لغة المقابلة",
      levelLabel: "مستوى الخبرة",
      startBtn: "ابدأ المحاكاة",
      privacyNotice: "تبقى مقابلتك في متصفحك لهذه الجلسة فقط. نحن لا نخزّن إجاباتك أبداً.",
    },
    levels: { junior: "مبتدئ", confirme: "متوسط", senior: "خبير" },
    languages: { en: "الإنجليزية", fr: "الفرنسية", ar: "العربية" },
    validation: {
      jobOfferRequired: "يرجى لصق عرض العمل أولاً.",
      jobOfferTooLong: "عرض العمل طويل جداً (الحد الأقصى {max} حرف).",
    },
    chat: {
      counter: "السؤال {n} / {max}",
      recruiter: "مسؤول التوظيف",
      you: "أنت",
      answerPlaceholder: "اكتب إجابتك…",
      answerHint: "{count} / {max} حرف",
      send: "إرسال الإجابة",
      finish: "إنهاء والحصول على ملاحظاتي",
      thinking: "مسؤول التوظيف يفكّر…",
      restart: "ابدأ من جديد",
    },
    feedback: {
      heading: "ملاحظات مقابلتك",
      score: "الدرجة الإجمالية",
      scoreOutOf: "{score} / 100",
      strengths: "نقاط القوة",
      improvements: "مجالات التحسين",
      rephrasings: "إعادة صياغة مقترحة",
      questionLabel: "السؤال",
      suggestionLabel: "إجابة أقوى",
      summary: "الخلاصة",
      generating: "جارٍ تحليل مقابلتك…",
      startOver: "تدرّب مرة أخرى",
    },
    quota: {
      left: "بقيت {n} محاكاة مجانية في هذه الجلسة",
      reachedTitle: "لقد استخدمت محاكاتك المجانية",
      reachedBody: "لقد وصلت إلى حد محاكاة المقابلات المجانية حالياً. المزيد من التدريب قادم قريباً.",
    },
    errors: {
      rate_limited: "لقد وصلت إلى حد المقابلات المجانية لليوم. حاول لاحقاً.",
      upstream_failed: "مسؤول التوظيف بالذكاء الاصطناعي غير متاح مؤقتاً. حاول مرة أخرى.",
      timeout: "استغرق مسؤول التوظيف وقتاً طويلاً للرد. حاول مرة أخرى.",
      generic: "حدث خطأ ما. حاول مرة أخرى.",
    },
  },
};

export const INTERVIEW_LOCALES = ["en", "fr", "ar"];
export const INTERVIEW_LEVELS = ["junior", "confirme", "senior"];

export function interviewCopy(locale) {
  return INTERVIEW_I18N[locale] || INTERVIEW_I18N.en;
}

export function fmt(template, vars = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}
