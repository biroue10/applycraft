import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { canonicalFor, hreflangFor } from "./src/seo/alternates.js";

// Per-route language metadata. Drives both the <html> attributes and hreflang
// injection for every React route vite-react-ssg prebuilds. Static pages in
// /public (e.g. /resume-in-arabic/) bypass this pipeline and are edited directly.
const ROUTE_LANG = {
  "/":                  { lang: "en" },
  "/fr/":               { lang: "fr" },
  "/ar/":               { lang: "ar", dir: "rtl" },
  "/resume-in-arabic/": { lang: "ar", dir: "rtl" },
  "/resume-in-french/": { lang: "fr" },
  "/interview-prep/":    { lang: "en" },
  "/fr/interview-prep/": { lang: "fr" },
  "/ar/interview-prep/": { lang: "ar", dir: "rtl" },
};

const ROUTE_META = {
  "/": {
    title: "Free Resume Builder in English, French, Arabic | ApplyCraft",
    description: "Build an ATS-friendly resume and matching cover letter in English, French or Arabic, with real right-to-left support. Free forever: no signup, no watermark, PDF and DOCX.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft resume builder and cover letter maker preview",
    locale: "en_US",
    alternateLocales: ["fr_FR", "ar_MA"],
  },
  "/fr/": {
    title: "Créateur de CV gratuit en français et arabe | ApplyCraft",
    description: "Créez un CV compatible ATS et une lettre de motivation en français, anglais ou arabe, avec un vrai support de l'arabe de droite à gauche. Gratuit, sans inscription ni filigrane.",
    image: "https://applycraft.io/og/home-fr.png",
    imageAlt: "Aperçu du créateur de CV et de lettres de motivation ApplyCraft",
    locale: "fr_FR",
    alternateLocales: ["en_US", "ar_MA"],
  },
  "/ar/": {
    title: "منشئ سيرة ذاتية مجاني بالعربية والفرنسية | ApplyCraft",
    description: "أنشئ سيرة ذاتية متوافقة مع ATS وخطاب تقديم بالعربية أو الفرنسية أو الإنجليزية، بدعم كامل للكتابة من اليمين إلى اليسار. مجاناً، بدون تسجيل أو علامة مائية.",
    image: "https://applycraft.io/og/home-ar.png",
    imageAlt: "معاينة منشئ السيرة الذاتية وخطاب التقديم من ApplyCraft",
    locale: "ar_MA",
    alternateLocales: ["en_US", "fr_FR"],
  },
  "/resume/templates": {
    title: "Resume Template Gallery — Choose an ATS-Friendly Style | ApplyCraft",
    description: "Browse ApplyCraft resume templates, choose an ATS-friendly style, preview your document, and export as PDF or DOCX.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft resume template gallery preview",
    locale: "en_US",
  },
  "/resume-builder": {
    title: "Resume Builder — Start a Free Editable Resume | ApplyCraft",
    description: "Open the ApplyCraft resume builder with a blank resume or starter example, edit in your browser, and export PDF or DOCX without an account.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft resume builder editor preview",
    locale: "en_US",
  },
  "/cover-letter/templates": {
    title: "Cover Letter Template Gallery — Matching Styles | ApplyCraft",
    description: "Choose a professional cover letter template that matches your resume style, then export as PDF or DOCX.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft cover letter template gallery preview",
    locale: "en_US",
  },
  "/job-tracker": {
    title: "Job Tracker — Organize Your Applications | ApplyCraft",
    description: "Track every job application in one board — saved, applied, interviewing, offer — with ApplyCraft's free browser-based job tracker.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft job application tracker board preview",
    locale: "en_US",
  },
  "/interview-prep/": {
    title: "Interview Prep — Practise with an AI Recruiter | ApplyCraft",
    description: "Practise a realistic job interview with an AI recruiter, one question at a time, then get structured feedback and a score — free, in your browser.",
    image: "https://applycraft.io/og/home.png",
    imageAlt: "ApplyCraft interview practice with an AI recruiter",
    locale: "en_US",
    alternateLocales: ["fr_FR", "ar_MA"],
  },
  "/fr/interview-prep/": {
    title: "Préparation entretien IA | ApplyCraft",
    description: "Entraînez-vous à un entretien d'embauche réaliste avec un recruteur IA, une question à la fois, puis recevez un bilan structuré et une note — gratuit.",
    image: "https://applycraft.io/og/home-fr.png",
    imageAlt: "Simulation d'entretien avec un recruteur IA sur ApplyCraft",
    locale: "fr_FR",
    alternateLocales: ["en_US", "ar_MA"],
  },
  "/ar/interview-prep/": {
    title: "تحضير مقابلة بالذكاء الاصطناعي | ApplyCraft",
    description: "تدرّب على مقابلة عمل واقعية مع مسؤول توظيف بالذكاء الاصطناعي، سؤالاً تلو الآخر، ثم احصل على ملاحظات منظمة ودرجة — مجاناً في متصفحك.",
    image: "https://applycraft.io/og/home-ar.png",
    imageAlt: "محاكاة مقابلة مع مسؤول توظيف بالذكاء الاصطناعي على ApplyCraft",
    locale: "ar_MA",
    alternateLocales: ["en_US", "fr_FR"],
  },
};

const ROUTE_FAQS = {
  "/": [
    {
      question: "Is ApplyCraft really free?",
      answer: "Yes. The core builder, templates, language options, previews, and PDF or DOCX downloads are available without a paid tier, account, or credit card.",
    },
    {
      question: "Do you store or sell my data?",
      answer: "ApplyCraft does not require an account profile to build a resume. Standard editing and export are browser-first; optional AI helpers may process the text you choose to submit.",
    },
    {
      question: "Are the templates ATS-compatible?",
      answer: "The templates are designed with readable typography, clear section headings, and ATS-conscious layouts to improve parsing compatibility.",
    },
    {
      question: "Can I write my resume in any language?",
      answer: "Yes. You can write resume content in any language. Fully localized interface and document-label support is currently production-ready in English, French, and Arabic, with additional languages planned.",
    },
    {
      question: "What download formats are available?",
      answer: "PDF and DOCX. PDF is ideal for most applications. DOCX is available for recruiters or employers who need an editable file.",
    },
    {
      question: "Do I need to create an account?",
      answer: "No. There is no sign-up, no login, no email address required. Open the app and start building immediately.",
    },
  ],
  "/fr/": [
    {
      question: "ApplyCraft est-il vraiment gratuit ?",
      answer: "Oui. L'éditeur, les modèles, les options de langue, les aperçus et les téléchargements PDF ou DOCX sont disponibles sans offre payante, compte ni carte bancaire.",
    },
    {
      question: "Stockez-vous ou vendez-vous mes données ?",
      answer: "ApplyCraft n'exige pas de compte pour créer un CV. L'édition et l'export standards se font dans le navigateur ; les assistants IA facultatifs peuvent traiter le texte que vous choisissez de soumettre.",
    },
    {
      question: "Les modèles sont-ils compatibles ATS ?",
      answer: "Les modèles sont conçus avec une typographie lisible, des intitulés de section clairs et des mises en page compatibles ATS pour améliorer l'analyse.",
    },
    {
      question: "Puis-je rédiger mon CV dans n'importe quelle langue ?",
      answer: "Oui. Vous pouvez rédiger le contenu du CV dans n'importe quelle langue. La prise en charge complète de l'interface et des libellés de document est actuellement prête pour la production en anglais, français et arabe ; d'autres langues sont prévues.",
    },
    {
      question: "Quels formats de téléchargement sont disponibles ?",
      answer: "PDF et DOCX. Le PDF convient à la plupart des candidatures. Le DOCX est disponible pour les recruteurs qui ont besoin d'un fichier modifiable.",
    },
    {
      question: "Dois-je créer un compte ?",
      answer: "Non. Aucune inscription, aucune connexion, aucune adresse e-mail requise. Ouvrez l'application et commencez immédiatement.",
    },
  ],
  "/ar/": [
    {
      question: "هل ApplyCraft مجاني حقاً؟",
      answer: "نعم. المحرر الأساسي والقوالب وخيارات اللغة والمعاينات وتنزيلات PDF أو DOCX متاحة دون مستوى مدفوع أو حساب أو بطاقة ائتمان.",
    },
    {
      question: "هل تخزّنون بياناتي أو تبيعونها؟",
      answer: "لا يتطلب ApplyCraft حساباً لإنشاء سيرة ذاتية. التحرير والتصدير القياسيان يجريان في المتصفح؛ وقد يعالج مساعدو الذكاء الاصطناعي والترجمة الاختياريون النص الذي تختار إرساله.",
    },
    {
      question: "هل القوالب متوافقة مع ATS؟",
      answer: "صُمّمت القوالب بطباعة واضحة وعناوين أقسام واضحة وتخطيطات متوافقة مع ATS لتحسين قابلية التحليل.",
    },
    {
      question: "هل يمكنني كتابة سيرتي بأي لغة؟",
      answer: "نعم. يمكنك كتابة محتوى السيرة بأي لغة. الدعم الكامل للواجهة وتسميات المستند جاهز حالياً بالإنجليزية والفرنسية والعربية، مع التخطيط لإضافة لغات أخرى.",
    },
    {
      question: "ما صيغ التنزيل المتاحة؟",
      answer: "PDF و DOCX. PDF مثالي لمعظم الطلبات. DOCX متاح للمسؤولين عن التوظيف الذين يحتاجون ملفاً قابلاً للتعديل.",
    },
    {
      question: "هل أحتاج إلى إنشاء حساب؟",
      answer: "لا. لا تسجيل ولا تسجيل دخول ولا حاجة لبريد إلكتروني. افتح التطبيق وابدأ فوراً.",
    },
  ],
};

function faqSchemaFor(path) {
  const faq = ROUTE_FAQS[path];
  if (!faq) return "";
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  });
}

// NOTE: canonical + hreflang are emitted PER ROUTE by src/seo/RouteHead.jsx
// (via vite-react-ssg's <Head>), so each prerendered page gets its own correct
// canonical and hreflang only where a genuine translated equivalent exists.
// We no longer inject a blanket hreflang set here — that put the homepage's
// alternates onto every route.

const isAnalyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    // Bundle visualizer — only emitted when ANALYZE=true to avoid cluttering CI.
    isAnalyze && visualizer({
      filename: "dist/bundle-report.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    }),
  ].filter(Boolean),
  base: "/",
  build: {
    // Report compressed sizes in the build output.
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/src/i18n/namespaces/es/landing2.js") ||
            id.includes("/src/i18n/namespaces/de/landing2.js") ||
            id.includes("/src/i18n/atsResults/")
          ) {
            return;
          }
          if (id.includes("/src/i18n/")) return "i18n";
          if (!id.includes("node_modules")) return;
          // React and router: always needed, extract once so SSG + app share it.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/react-router/")
          ) {
            return "react-vendor";
          }
          // jsPDF, docx, html2canvas, dompurify: intentionally NOT assigned here.
          //
          // Assigning them to named chunks causes Rollup to place __vite__mapDeps
          // (the module-preload helper) inside the jspdf chunk and then add a
          // *static* import of that chunk from the app entry. This forces the
          // browser to download all 391 KB of jsPDF before the app can execute —
          // defeating the dynamic import() calls in the source entirely.
          //
          // Without a manualChunks assignment Rollup treats these as genuine lazy
          // chunks: they are downloaded only when the user first requests PDF or
          // DOCX export, saving ~480 KB gzip on initial load.
        },
      },
    },
  },
  ssgOptions: {
    onBeforePageRender(path, html) {
      const { lang = "en", dir } = ROUTE_LANG[path] ?? {};
      const htmlTag = dir
        ? `<html lang="${lang}" dir="${dir}">`
        : `<html lang="${lang}">`;

      // Per-route canonical + hreflang (genuine clusters only) + noindex for the
      // user-shared viewer. Build-time only — no client JS.
      const meta = ROUTE_META[path] || {};
      const tags = [`<link rel="canonical" href="${canonicalFor(path)}" />`];
      // Preload the Arabic woff2 only on RTL routes — English/French pages never
      // render Arabic body text, so preloading it there would waste a request.
      if (dir === "rtl") tags.push(`<link rel="preload" href="/fonts/ibm-plex-sans-arabic-400.woff2" as="font" type="font/woff2" crossorigin />`);
      if (path === "/r" || path.startsWith("/r/")) tags.push(`<meta name="robots" content="noindex,follow" />`);
      for (const a of hreflangFor(path)) {
        tags.push(`<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`);
      }
      const title = meta.title || "ApplyCraft";
      const description = meta.description || "ApplyCraft resume builder and cover letter maker.";
      const image = meta.image || "https://applycraft.io/og/home.png";
      const canonical = canonicalFor(path);
      const imageAlt = meta.imageAlt || "ApplyCraft resume builder and cover letter maker preview";
      const ogType = meta.ogType || "website";
      const ogLocale = meta.locale || "en_US";
      const metaTags = [
        `<title>${title}</title>`,
        `<meta name="description" content="${description}" />`,
        `<meta property="og:type" content="${ogType}" />`,
        `<meta property="og:site_name" content="ApplyCraft" />`,
        `<meta property="og:locale" content="${ogLocale}" />`,
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        `<meta property="og:image" content="${image}" />`,
        `<meta property="og:image:secure_url" content="${image}" />`,
        `<meta property="og:image:type" content="image/png" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${imageAlt}" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${description}" />`,
        `<meta name="twitter:image" content="${image}" />`,
        `<meta name="twitter:image:alt" content="${imageAlt}" />`,
      ];
      for (const locale of meta.alternateLocales || []) metaTags.push(`<meta property="og:locale:alternate" content="${locale}" />`);
      let nextHtml = html
        .replace(/<title>[\s\S]*?<\/title>/, metaTags[0])
        .replace(/<meta name="description" content="[^"]*"\s*\/?>/, metaTags[1])
        .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, metaTags[5])
        .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, metaTags[6])
        .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, metaTags[7])
        .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, metaTags[8])
        .replace(/<meta property="og:image:secure_url" content="[^"]*"\s*\/?>/, metaTags[9])
        .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/?>/, metaTags[13])
        .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, metaTags[14])
        .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, metaTags[15])
        .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, metaTags[16])
        .replace(/<meta name="twitter:image:alt" content="[^"]*"\s*\/?>/, metaTags[17]);
      const faqSchema = faqSchemaFor(path);
      if (faqSchema) {
        nextHtml = nextHtml.replace(
          /<!-- JSON-LD: FAQ[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/,
          `<script type="application/ld+json">${faqSchema}</script>`
        );
      }
      nextHtml = nextHtml
        .replace(/<meta property="og:type" content="[^"]*"\s*\/?>/g, "")
        .replace(/<meta property="og:site_name" content="[^"]*"\s*\/?>/g, "")
        .replace(/<meta property="og:locale" content="[^"]*"\s*\/?>/g, "")
        .replace(/<meta property="og:image:type" content="[^"]*"\s*\/?>/g, "")
        .replace(/<meta property="og:image:width" content="[^"]*"\s*\/?>/g, "")
        .replace(/<meta property="og:image:height" content="[^"]*"\s*\/?>/g, "");
      nextHtml = nextHtml.replace("</head>", `    ${metaTags.slice(2, 5).join("\n    ")}\n    ${metaTags.slice(10, 13).join("\n    ")}\n    ${metaTags.slice(18).join("\n    ")}\n  </head>`);
      return nextHtml
        .replace(/<html[^>]*>/, htmlTag)
        .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
    },
  },
});
