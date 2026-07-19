import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { footerHtml } from "./shared-footer.mjs";
import { buildResumeStarterUrl } from "../src/data/resumeStarters/index.js";
import { localizeRoute } from "../src/seo/localizedRoutes.js";

const ROOT = new URL("../public/", import.meta.url);
const SITE = "https://applycraft.io";

const HOME_ALTERNATES = [
  { hreflang: "en", href: `${SITE}/` },
  { hreflang: "fr", href: `${SITE}/fr/` },
  { hreflang: "ar", href: `${SITE}/ar/` },
  { hreflang: "x-default", href: `${SITE}/` },
];

const FREE_ALTERNATES = [
  { hreflang: "en", href: `${SITE}/free-resume-builder/` },
  { hreflang: "fr", href: `${SITE}/fr/creer-cv-gratuit/` },
  { hreflang: "ar", href: `${SITE}/ar/free-resume-builder/` },
  { hreflang: "x-default", href: `${SITE}/free-resume-builder/` },
];

function schemaFaq(faqs) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  });
}

function breadcrumb(path, label) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE}${path}` },
    ],
  });
}

function appSchema(lang) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: "ApplyCraft.io",
    alternateName: "ApplyCraft",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE}/`,
    inLanguage: lang,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  });
}

function alternates(items) {
  return items.map((item) => `<link rel="alternate" hreflang="${item.hreflang}" href="${item.href}"/>`).join("\n");
}

function localeAlternates(locales) {
  return locales.map((locale) => `<meta property="og:locale:alternate" content="${locale}"/>`).join("\n");
}

function languageSwitcher(items) {
  const labels = { en: "English", fr: "Français", ar: "العربية" };
  return `<div class="language-switcher" aria-label="Language versions">${items.filter((item) => item.hreflang !== "x-default").map((item) => `<a href="${item.href.replace(SITE, "")}">${labels[item.hreflang]}</a>`).join("")}</div>`;
}

function page(config) {
  const canonical = `${SITE}${config.path}`;
  const image = `${SITE}${config.image}`;
  const imageAlt = config.imageAlt || "ApplyCraft resume builder and cover letter maker preview";
  const builderUrl = buildResumeStarterUrl("", {
    interfaceLanguage: config.lang === "en" ? "" : config.lang,
    documentLanguage: config.dir === "rtl" ? config.lang : "",
  });
  const homeHref = localizeRoute("/", config.lang);
  return `<!doctype html>
<html lang="${config.lang}"${config.dir ? ` dir="${config.dir}"` : ""}>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${config.title}</title>
<meta name="description" content="${config.description}"/>
<link rel="canonical" href="${canonical}"/>
${alternates(config.alternates)}
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="ApplyCraft.io"/>
<meta property="og:locale" content="${config.ogLocale}"/>
${localeAlternates(config.ogAlternateLocales)}
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${config.title}"/>
<meta property="og:description" content="${config.description}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:secure_url" content="${image}"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${imageAlt}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${config.title}"/>
<meta name="twitter:description" content="${config.description}"/>
<meta name="twitter:image" content="${image}"/>
<meta name="twitter:image:alt" content="${imageAlt}"/>
<link rel="icon" href="/favicon.ico?v=2" sizes="any"/>
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml"/>
<link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" sizes="32x32"/>
<link rel="icon" href="/favicon-16x16.png?v=2" type="image/png" sizes="16x16"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"/>
<link rel="manifest" href="/site.webmanifest?v=2"/>
<link rel="stylesheet" href="${config.css || "../_seo.css"}"/>
<script type="application/ld+json">${schemaFaq(config.faqs)}</script>
<script type="application/ld+json">${breadcrumb(config.path, config.h1)}</script>
${config.software ? `<script type="application/ld+json">${appSchema(config.lang)}</script>` : ""}
<!-- Cookie consent + consent-gated Google Analytics (see scripts/generate-consent-asset.mjs) -->
<script src="/consent.js" defer></script>
</head>
<body>
<nav class="nav"><a href="${homeHref}" class="nav-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="eager" decoding="async"></a><a href="${builderUrl}" class="nav-cta">${config.cta}</a></nav>
<main>
  <div class="page">
    ${languageSwitcher(config.alternates)}
    <section class="hero">
      <div class="hero-eyebrow">${config.eyebrow}</div>
      <h1>${config.h1}</h1>
      <p>${config.sub}</p>
      <div class="hero-btns"><a href="${builderUrl}" class="btn-primary">${config.primary}</a><a href="${config.secondaryHref}" class="btn-secondary">${config.secondary}</a></div>
      <div class="trust">${config.trust.map((item) => `<span>${item}</span>`).join("")}</div>
    </section>
  </div>
  <div class="page"><section class="section"><h2>${config.sectionTitle}</h2><p>${config.sectionIntro}</p><div class="grid-2">${config.cards.map((card) => `<div class="card"><div class="card-icon">${card.icon}</div><h3>${card.title}</h3><p>${card.body}</p></div>`).join("")}</div></section></div>
  <section class="faq page"><h2>${config.faqTitle}</h2>${config.faqs.map(({ q, a }) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</section>
</main>
${footerHtml(config.lang)}
</body>
</html>`;
}

const pages = [
  {
    path: "/fr/",
    out: "fr/index.html",
    lang: "fr",
    ogLocale: "fr_FR",
    ogAlternateLocales: ["en_US", "ar_MA"],
    alternates: HOME_ALTERNATES,
    image: "/og/home-fr.png",
    imageAlt: "Aperçu du créateur de CV et de lettres de motivation ApplyCraft",
    title: "Créateur de CV gratuit en ligne | ApplyCraft",
    description: "Créez un CV compatible ATS et une lettre de motivation assortie avec aperçu en direct, libellés multilingues et export PDF ou DOCX.",
    eyebrow: "Créateur de CV + lettre de motivation",
    h1: "Créez rapidement un CV compatible ATS et une lettre assortie.",
    sub: "ApplyCraft vous aide à créer des documents de candidature professionnels avec aperçu en direct, modèles soignés et téléchargements PDF ou DOCX.",
    cta: "Créer mon CV",
    primary: "Créer mon CV",
    secondary: "Voir les modèles",
    secondaryHref: "/resume/templates/",
    trust: ["Sans inscription", "PDF et DOCX", "Compatible ATS", "Interface française"],
    sectionTitle: "Pourquoi utiliser ApplyCraft ?",
    sectionIntro: "Un outil rapide pour créer un CV et une lettre de motivation cohérents, en français, anglais ou arabe.",
    cards: [
      { icon: "⚡", title: "Aperçu en direct", body: "Voyez votre CV se construire pendant que vous remplissez les champs." },
      { icon: "📄", title: "Export PDF et DOCX", body: "Téléchargez votre document avant de fermer la page." },
      { icon: "🌍", title: "Multilingue", body: "Interface et libellés en français, anglais et arabe." },
      { icon: "🎯", title: "Compatible ATS", body: "Des modèles lisibles avec titres de sections clairs." },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      { q: "ApplyCraft est-il gratuit ?", a: "Oui. Les modèles, l’aperçu et les téléchargements PDF ou DOCX sont disponibles sans compte." },
      { q: "Puis-je créer une lettre de motivation ?", a: "Oui. ApplyCraft inclut un créateur de lettre de motivation avec des styles assortis aux CV." },
      { q: "Les modèles sont-ils compatibles ATS ?", a: "Oui. Les modèles utilisent une typographie lisible, des sections claires et une structure facile à analyser." },
    ],
    software: true,
  },
  {
    path: "/ar/",
    out: "ar/index.html",
    lang: "ar",
    dir: "rtl",
    ogLocale: "ar_MA",
    ogAlternateLocales: ["en_US", "fr_FR"],
    alternates: HOME_ALTERNATES,
    image: "/og/home-ar.png",
    imageAlt: "معاينة منشئ السيرة الذاتية وخطاب التقديم من ApplyCraft",
    title: "منشئ سيرة ذاتية وخطاب تقديم متوافق مع ATS | ApplyCraft",
    description: "أنشئ سيرة ذاتية متوافقة مع ATS وخطاب تقديم مطابقاً مع معاينة مباشرة وتسميات متعددة اللغات وتنزيل PDF أو DOCX.",
    eyebrow: "منشئ سيرة ذاتية وخطاب تقديم",
    h1: "أنشئ بسرعة سيرة ذاتية متوافقة مع ATS وخطاب تقديم مطابقاً.",
    sub: "يساعدك ApplyCraft على إنشاء مستندات تقديم احترافية مع معاينة مباشرة وقوالب واضحة وتنزيل PDF أو DOCX.",
    cta: "أنشئ سيرتي الذاتية",
    primary: "أنشئ سيرتي الذاتية",
    secondary: "عرض القوالب",
    secondaryHref: "/resume/templates/",
    trust: ["بدون تسجيل", "PDF و DOCX", "متوافق مع ATS", "واجهة عربية"],
    sectionTitle: "لماذا تستخدم ApplyCraft؟",
    sectionIntro: "أداة سريعة لإنشاء سيرة ذاتية وخطاب تقديم متناسقين بالعربية أو الفرنسية أو الإنجليزية.",
    cards: [
      { icon: "⚡", title: "معاينة مباشرة", body: "شاهد سيرتك الذاتية أثناء تعبئة الحقول." },
      { icon: "📄", title: "تصدير PDF و DOCX", body: "نزّل مستندك قبل إغلاق الصفحة." },
      { icon: "🌍", title: "متعدد اللغات", body: "واجهة وتسميات بالإنجليزية والفرنسية والعربية." },
      { icon: "🎯", title: "متوافق مع ATS", body: "قوالب واضحة بعناوين أقسام سهلة القراءة." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل ApplyCraft مجاني؟", a: "نعم. القوالب والمعاينة وتنزيل PDF أو DOCX متاحة بدون حساب." },
      { q: "هل يمكنني إنشاء خطاب تقديم؟", a: "نعم. يتضمن ApplyCraft منشئ خطاب تقديم بأنماط متناسقة مع السيرة الذاتية." },
      { q: "هل القوالب متوافقة مع ATS؟", a: "نعم. تستخدم القوالب خطاً واضحاً وأقساماً منظمة وبنية سهلة التحليل." },
    ],
    software: true,
  },
  {
    path: "/fr/creer-cv-gratuit/",
    out: "fr/creer-cv-gratuit/index.html",
    lang: "fr",
    css: "../../_seo.css",
    ogLocale: "fr_FR",
    ogAlternateLocales: ["en_US", "ar_MA"],
    alternates: FREE_ALTERNATES,
    image: "/og/free-resume-builder-fr.png",
    imageAlt: "Aperçu du créateur de CV gratuit ApplyCraft",
    title: "Créer un CV gratuit | ApplyCraft",
    description: "Créez un CV professionnel gratuit, sans inscription, sans filigrane, sans frais cachés et sans paiement au téléchargement. Export PDF ou DOCX.",
    eyebrow: "Créateur de CV gratuit",
    h1: "Créer un CV gratuit — sans inscription ni frais cachés",
    sub: "Créez un CV professionnel sans compte, sans filigrane et sans frais cachés. Téléchargez en PDF ou DOCX en quelques minutes.",
    cta: "Créer mon CV",
    primary: "Créer mon CV gratuitement",
    secondary: "Version anglaise",
    secondaryHref: "/free-resume-builder/",
    trust: ["Sans inscription", "Sans filigrane", "Sans frais cachés", "PDF et DOCX"],
    sectionTitle: "Ce qui est gratuit",
    sectionIntro: "Le flux principal de création, les modèles, les options de langue et les téléchargements restent accessibles sans compte.",
    cards: [
      { icon: "🔓", title: "Aucun compte", body: "Ouvrez le créateur, remplissez vos informations et téléchargez." },
      { icon: "💰", title: "Aucun frais caché", body: "Pas de paiement surprise au moment du téléchargement." },
      { icon: "🚫", title: "Aucun filigrane", body: "Le CV téléchargé ne contient pas de marque ApplyCraft." },
      { icon: "📄", title: "PDF et DOCX", body: "Exportez un PDF prêt à envoyer ou un DOCX modifiable." },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      { q: "Le créateur de CV est-il vraiment gratuit ?", a: "Oui. Le flux principal, les modèles, l’aperçu et les téléchargements PDF ou DOCX sont disponibles sans compte ni carte bancaire." },
      { q: "Y a-t-il des frais cachés ?", a: "Non. ApplyCraft ne bloque pas le téléchargement du CV principal derrière un paiement caché." },
      { q: "Le CV contient-il un filigrane ?", a: "Non. Les fichiers PDF et DOCX téléchargés ne contiennent pas de filigrane ApplyCraft." },
    ],
  },
  {
    path: "/ar/free-resume-builder/",
    out: "ar/free-resume-builder/index.html",
    lang: "ar",
    dir: "rtl",
    css: "../../_seo.css",
    ogLocale: "ar_MA",
    ogAlternateLocales: ["en_US", "fr_FR"],
    alternates: FREE_ALTERNATES,
    image: "/og/free-resume-builder-ar.png",
    imageAlt: "معاينة منشئ السيرة الذاتية المجاني من ApplyCraft",
    title: "منشئ سيرة ذاتية مجاني بدون تسجيل | ApplyCraft",
    description: "أنشئ سيرة ذاتية احترافية مجاناً بدون تسجيل، بدون علامة مائية، بدون رسوم مخفية وبدون دفع عند التنزيل. تصدير PDF أو DOCX.",
    eyebrow: "منشئ سيرة ذاتية مجاني",
    h1: "منشئ سيرة ذاتية مجاني — بدون تسجيل أو رسوم مخفية",
    sub: "أنشئ سيرة ذاتية احترافية بدون حساب وبدون علامة مائية أو رسوم مخفية. نزّلها بصيغة PDF أو DOCX خلال دقائق.",
    cta: "أنشئ سيرتي الذاتية",
    primary: "أنشئ سيرتي مجاناً",
    secondary: "النسخة الإنجليزية",
    secondaryHref: "/free-resume-builder/",
    trust: ["بدون تسجيل", "بدون علامة مائية", "بدون رسوم مخفية", "PDF و DOCX"],
    sectionTitle: "ما المتاح مجاناً؟",
    sectionIntro: "مسار إنشاء السيرة الذاتية الأساسي والقوالب وخيارات اللغة والتنزيلات متاحة بدون حساب.",
    cards: [
      { icon: "🔓", title: "بدون حساب", body: "افتح المنشئ، أدخل معلوماتك ثم نزّل الملف." },
      { icon: "💰", title: "بدون رسوم مخفية", body: "لا يوجد دفع مفاجئ عند تنزيل السيرة الذاتية." },
      { icon: "🚫", title: "بدون علامة مائية", body: "ملفات PDF و DOCX لا تحتوي على علامة ApplyCraft." },
      { icon: "📄", title: "PDF و DOCX", body: "صدّر ملف PDF جاهزاً أو DOCX قابلاً للتعديل." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل منشئ السيرة الذاتية مجاني فعلاً؟", a: "نعم. المسار الأساسي والقوالب والمعاينة وتنزيل PDF أو DOCX متاحة بدون حساب أو بطاقة بنكية." },
      { q: "هل توجد رسوم مخفية؟", a: "لا. لا يحجب ApplyCraft تنزيل السيرة الذاتية الأساسية خلف دفع مخفي." },
      { q: "هل يحتوي الملف على علامة مائية؟", a: "لا. ملفات PDF و DOCX التي يتم تنزيلها لا تحتوي على علامة ApplyCraft." },
    ],
  },
];

for (const config of pages.filter((item) => item.path !== "/fr/" && item.path !== "/ar/")) {
  const file = join(ROOT.pathname, config.out);
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, page(config), "utf8");
  console.log(`✓ Generated public/${config.out}`);
}
