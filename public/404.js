(() => {
  const locale = location.pathname.startsWith("/fr/") ? "fr" : location.pathname.startsWith("/ar/") ? "ar" : "en";
  const copy = {
    en: {
      title: "Page not found | ApplyCraft", heading: "Page not found",
      message: "The page may have moved, or the address may be incorrect.",
      home: "Go to homepage", resume: "Create a resume", homeHref: "/", resumeHref: "/resume-builder/",
    },
    fr: {
      title: "Page introuvable | ApplyCraft", heading: "Page introuvable",
      message: "Cette page a peut-être été déplacée ou l’adresse est incorrecte.",
      home: "Retour à l’accueil", resume: "Créer un CV", homeHref: "/fr/", resumeHref: "/resume-builder/?ui=fr&docLang=fr",
    },
    ar: {
      title: "الصفحة غير موجودة | ApplyCraft", heading: "الصفحة غير موجودة",
      message: "ربما تم نقل هذه الصفحة أو أن العنوان غير صحيح.",
      home: "العودة إلى الصفحة الرئيسية", resume: "إنشاء سيرة ذاتية", homeHref: "/ar/", resumeHref: "/resume-builder/?ui=ar&docLang=ar",
    },
  }[locale];
  const root = document.documentElement;
  root.lang = locale;
  root.dir = locale === "ar" ? "rtl" : "ltr";
  document.title = copy.title;
  document.querySelector("#not-found-title").textContent = copy.heading;
  document.querySelector("#not-found-message").textContent = copy.message;
  const home = document.querySelector("#not-found-home");
  const resume = document.querySelector("#not-found-resume");
  home.textContent = copy.home;
  home.href = copy.homeHref;
  resume.textContent = copy.resume;
  resume.href = copy.resumeHref;
})();
