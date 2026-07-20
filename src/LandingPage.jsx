import React from "react";
import { useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./siteChrome.jsx";
import { localizeRoute } from "./seo/localizedRoutes.js";
import enLanding from "./i18n/namespaces/en/landing.js";
import frLanding from "./i18n/namespaces/fr/landing.js";
import arLanding from "./i18n/namespaces/ar/landing.js";

const LANDING_UI = { en: enLanding, fr: frLanding, ar: arLanding };

const COPY = {
  en: {
    eyebrow: "French, English, Arabic. No compromises.",
    title: "The resume builder that speaks your language — English, French and Arabic.",
    intro: "Build an ATS-friendly resume and matching cover letter in English, French or Arabic — with real right-to-left Arabic, not an afterthought. Free forever: no signup, no watermark, no paying to download. PDF and DOCX included.",
    primary: "Create my resume", secondary: "Check my existing resume",
    trust: ["Browser-first editing", "No signup", "No credit card", "PDF & DOCX"],
    preview: "Sample professional resume", profile: "Senior Product Manager", experience: "Experience",
    sectionTitle: "Everything needed for a stronger application",
    cards: [
      ["ATS-friendly resumes", "Clear, professional layouts designed for reliable parsing."],
      ["Matching cover letters", "Create a consistent resume and cover letter without a paywall."],
      ["Built for three languages", "A localized interface with genuine right-to-left Arabic support."],
    ],
    closing: "Start building for free", closingBody: "No account needed. Download as PDF or DOCX.",
  },
  fr: {
    eyebrow: "Français, anglais, arabe. Sans compromis.",
    title: "Le créateur de CV qui parle votre langue — français, anglais et arabe.",
    intro: "Créez un CV compatible ATS et une lettre de motivation en français, anglais ou arabe, avec un vrai support de l’arabe de droite à gauche. Gratuit, sans inscription, filigrane ni paiement au téléchargement.",
    primary: "Créer mon CV", secondary: "Vérifier mon CV",
    trust: ["Édition dans le navigateur", "Sans inscription", "Sans carte bancaire", "PDF et DOCX"],
    preview: "Exemple de CV professionnel", profile: "Responsable produit senior", experience: "Expérience",
    sectionTitle: "Tout le nécessaire pour une candidature plus forte",
    cards: [
      ["CV compatibles ATS", "Des mises en page claires et professionnelles, faciles à analyser."],
      ["Lettres assorties", "Créez un CV et une lettre cohérents sans barrière payante."],
      ["Conçu pour trois langues", "Une interface localisée avec un véritable support RTL en arabe."],
    ],
    closing: "Commencez gratuitement", closingBody: "Aucun compte requis. Téléchargez en PDF ou DOCX.",
  },
  ar: {
    eyebrow: "العربية والفرنسية والإنجليزية. بلا تنازلات.",
    title: "منشئ السيرة الذاتية الذي يتحدث لغتك — العربية والفرنسية والإنجليزية.",
    intro: "أنشئ سيرة ذاتية متوافقة مع أنظمة ATS وخطاب تقديم بالعربية أو الفرنسية أو الإنجليزية، مع دعم حقيقي للكتابة من اليمين إلى اليسار. مجاناً، بلا تسجيل أو علامة مائية.",
    primary: "أنشئ سيرتي الذاتية", secondary: "تحقق من سيرتي",
    trust: ["التحرير في المتصفح", "بدون تسجيل", "بدون بطاقة", "PDF وDOCX"],
    preview: "نموذج سيرة ذاتية احترافية", profile: "مديرة منتج رئيسية", experience: "الخبرة",
    sectionTitle: "كل ما تحتاجه لطلب توظيف أقوى",
    cards: [
      ["سيرة متوافقة مع ATS", "تصاميم واضحة واحترافية تسهّل قراءة البيانات."],
      ["خطابات تقديم متناسقة", "أنشئ سيرة وخطاباً متناسقين دون حواجز مدفوعة."],
      ["مصمم لثلاث لغات", "واجهة مترجمة ودعم حقيقي للعربية من اليمين إلى اليسار."],
    ],
    closing: "ابدأ مجاناً", closingBody: "لا حاجة إلى حساب. نزّل بصيغة PDF أو DOCX.",
  },
};

function languageFor(pathname) {
  if (pathname.startsWith("/fr")) return "fr";
  if (pathname.startsWith("/ar")) return "ar";
  return "en";
}

function ResumePreview({ copy, t }) {
  return (
    <div className="ac-lite-preview" aria-label={copy.preview}>
      <div className="ac-lite-preview-head"><span aria-hidden="true" /><div><strong>Sarah Amrani</strong><small>{copy.profile}</small></div></div>
      <div className="ac-lite-preview-body">
        <aside><b>{t("previewProfile")}</b><i /><i /><b>{t("previewSkills")}</b><em>{t("previewStrategy")}</em><em>{t("previewResearch")}</em></aside>
        <section><b>{copy.experience}</b><strong>Northstar AI</strong><i /><i /><i /><strong>BrightHire</strong><i /><i /></section>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { pathname } = useLocation();
  const lang = languageFor(pathname);
  const copy = COPY[lang];
  const t = (key) => LANDING_UI[lang]?.[key] || LANDING_UI.en[key] || key;
  const rtl = lang === "ar";
  const builder = localizeRoute("/resume-builder/", lang);
  const ats = localizeRoute("/ats-checker/", lang);

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="ac-lite-page">
      <style>{`
        .ac-lite-page{min-height:100vh;background:#06080f;color:#eef2ff;font-family:'IBM Plex Sans','IBM Plex Sans Arabic',system-ui,sans-serif}.ac-lite-main{overflow:hidden}.ac-lite-hero{max-width:1180px;margin:auto;padding:132px 24px 72px;display:grid;grid-template-columns:1.02fr .98fr;gap:52px;align-items:center}.ac-lite-copy{max-width:620px}.ac-lite-eyebrow{display:inline-block;color:#a5b4fc;background:#6366f118;border:1px solid #6366f144;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.ac-lite-copy h1{font-size:clamp(36px,5vw,58px);line-height:1.08;letter-spacing:-.04em;margin:24px 0 20px}.ac-lite-copy>p{color:#b6c2d6;font-size:18px;line-height:1.65;margin:0 0 30px}.ac-lite-actions{display:flex;gap:12px;flex-wrap:wrap}.ac-lite-actions a{padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:750}.ac-lite-primary{color:#fff;background:linear-gradient(135deg,#6366f1,#3b82f6)}.ac-lite-secondary{color:#dbe4f3;border:1px solid #344967}.ac-lite-trust{display:flex;gap:16px;flex-wrap:wrap;color:#8b9eb8;font-size:12px;margin-top:22px}.ac-lite-preview{background:#fff;color:#172033;border-radius:16px;overflow:hidden;box-shadow:0 28px 80px #0008;transform:rotate(1deg);max-width:410px;margin:auto}.ac-lite-preview-head{background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:24px;display:flex;gap:14px;align-items:center}.ac-lite-preview-head span{width:54px;height:54px;border-radius:50%;background:#dbeafe}.ac-lite-preview-head strong,.ac-lite-preview-head small{display:block}.ac-lite-preview-head strong{font-size:22px}.ac-lite-preview-body{display:grid;grid-template-columns:.8fr 1.2fr;min-height:330px}.ac-lite-preview-body aside,.ac-lite-preview-body section{padding:24px;display:flex;flex-direction:column;gap:11px}.ac-lite-preview-body aside{background:#f1f5f9}.ac-lite-preview-body b{color:#2563eb;text-transform:uppercase;font-size:11px;letter-spacing:.1em}.ac-lite-preview-body strong{font-size:12px}.ac-lite-preview-body i{display:block;height:7px;border-radius:5px;background:#dbe3ed}.ac-lite-preview-body em{font-style:normal;font-size:10px;background:#dbeafe;padding:4px 7px;border-radius:10px;width:max-content}.ac-lite-features{background:#0d1424;padding:72px 24px}.ac-lite-features h2,.ac-lite-closing h2{text-align:center;font-size:clamp(28px,4vw,40px);margin:0 0 38px}.ac-lite-grid{max-width:1000px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.ac-lite-card{background:#132036;border:1px solid #20324e;border-radius:12px;padding:26px}.ac-lite-card h3{margin:0 0 10px;font-size:18px}.ac-lite-card p{margin:0;color:#b6c2d6;line-height:1.65}.ac-lite-closing{text-align:center;padding:76px 24px}.ac-lite-closing h2{margin-bottom:10px}.ac-lite-closing p{color:#b6c2d6;margin:0 0 28px}@media(max-width:720px){.ac-lite-hero{grid-template-columns:1fr;padding:104px 20px 52px;gap:42px;text-align:center}.ac-lite-copy>p{font-size:16px}.ac-lite-actions,.ac-lite-trust{justify-content:center}.ac-lite-grid{grid-template-columns:1fr}.ac-lite-preview{max-width:350px}.ac-lite-preview-body{min-height:290px}}
      `}</style>
      <SiteHeader lang={lang} />
      <main id="main-content" tabIndex={-1} className="ac-lite-main">
        <section className="ac-lite-hero">
          <div className="ac-lite-copy">
            <span className="ac-lite-eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className="ac-lite-actions"><a className="ac-lite-primary" href={builder}>{copy.primary}</a><a className="ac-lite-secondary" href={ats}>{copy.secondary}</a></div>
            <div className="ac-lite-trust">{copy.trust.map((item) => <span key={item}>✓ {item}</span>)}</div>
          </div>
          <ResumePreview copy={copy} t={t} />
        </section>
        <section className="ac-lite-features"><h2>{copy.sectionTitle}</h2><div className="ac-lite-grid">{copy.cards.map(([title, body]) => <article className="ac-lite-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
        <section className="ac-lite-closing"><h2>{copy.closing}</h2><p>{copy.closingBody}</p><div className="ac-lite-actions" style={{justifyContent:"center"}}><a className="ac-lite-primary" href={builder}>{copy.primary}</a></div></section>
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
