import React from "react";

const COLORS = {
  bg: "#06080F", surface: "#101522", surface2: "#151B2B", border: "#273149",
  text: "#F8FAFC", muted: "#A8B3C7", dim: "#7F8AA1", accent: "#818CF8", accent2: "#A5B4FC",
};

const ROUTES = {
  home: { en: "/", fr: "/fr/", ar: "/ar/" },
  resume: { en: "/resume-builder/", fr: "/resume-builder/?ui=fr&docLang=fr", ar: "/resume-builder/?ui=ar&docLang=ar" },
  templates: { en: "/resume/templates/", fr: "/resume/templates/?ui=fr&docLang=fr", ar: "/resume/templates/?ui=ar&docLang=ar" },
  cover: { en: "/cover-letter-builder/", fr: "/cover-letter/templates/?ui=fr&docLang=fr", ar: "/cover-letter/templates/?ui=ar&docLang=ar" },
  ats: { en: "/ats-checker/", fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  tracker: { en: "/job-tracker/", fr: "/job-tracker/?ui=fr&docLang=fr", ar: "/job-tracker/?ui=ar&docLang=ar" },
  interview: { en: "/interview-prep/", fr: "/fr/interview-prep/", ar: "/ar/interview-prep/" },
  pricing: { en: "/pricing/", fr: "/fr/pricing/", ar: "/pricing/" },
  examples: { en: "/examples/", fr: "/examples/french-cv-example/", ar: "/examples/" },
};

const FLAGS = { en: "🇬🇧", fr: "🇫🇷", ar: "🇲🇦" };
const LANGUAGE_NAMES = { en: "English", fr: "Français", ar: "العربية" };
const NAVBAR_LOGO = "/assets/brand/applycraft-logo-navbar.png?v=2";

function interpolate(value, values) {
  return String(value || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

function MarketingHeader({ lang, landing, footer }) {
  const nav = [
    ["resume", footer.resumeBuilder], ["cover", footer.coverLetter], ["ats", footer.atsChecker],
    ["tracker", footer.jobTracker], ["interview", footer.interviewPrep],
  ];
  return (
    <header className="lp-header ac-site-header"><div className="lp-header-inner">
      <a className="lp-logo" href={ROUTES.home[lang]} aria-label={footer.brandHome}>
        <img className="ac-brand-logo-img" src={NAVBAR_LOGO} alt="ApplyCraft" width="320" height="82" decoding="async" />
      </a>
      <nav className="lp-nav ac-site-nav-links" aria-label={footer.primaryTools}>
        {nav.map(([key, label]) => <a key={key} href={ROUTES[key][lang]}>{label}</a>)}
      </nav>
      <div className="lp-languages" aria-label={footer.primaryTools}>
        {Object.keys(FLAGS).map(code => (
          <a key={code} href={ROUTES.home[code]} hrefLang={code} lang={code}
            aria-current={code === lang ? "page" : undefined}
            aria-label={LANGUAGE_NAMES[code]} title={LANGUAGE_NAMES[code]}>{FLAGS[code]}</a>
        ))}
      </div>
      <a className="lp-header-cta" href={ROUTES.resume[lang]}>{landing.createResume}</a>
      <button className="lp-menu-button ac-site-mobile-menu-button" type="button" aria-expanded="false" aria-controls="lp-mobile-nav"
        aria-label={footer.openMenu} data-open-label={footer.openMenu} data-close-label={footer.closeMenu} data-lp-menu-toggle>
        ☰
      </button>
      <nav id="lp-mobile-nav" className="lp-mobile-nav" aria-label={footer.primaryTools} hidden>
        {nav.map(([key, label]) => <a key={key} href={ROUTES[key][lang]}>{label}</a>)}
      </nav></div>
    </header>
  );
}

function ResumeMockup({ copy }) {
  return (
    <div className="lp-mockup" aria-hidden="true">
      <div className="lp-paper">
        <div className="lp-paper-head"><span>{copy.initials}</span><div><b>{copy.name}</b><i>{copy.title}</i></div></div>
        <div className="lp-paper-rule" />
        <strong>{copy.experience}</strong>
        <div className="lp-paper-row"><b>{copy.role}</b><i>{copy.date}</i></div>
        <p>{copy.achievement}</p>
        <strong>{copy.skills}</strong>
        <div className="lp-chips">{copy.skillItems.map(skill => <span key={skill}>{skill}</span>)}</div>
      </div>
      <span className="lp-score">✓ {copy.ats}</span>
    </div>
  );
}

function Section({ eyebrow, title, children, className = "" }) {
  return <section className={`lp-section ${className}`}><div className="lp-wrap">
    {eyebrow && <p className="lp-eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>{children}
  </div></section>;
}

function MarketingFooter({ lang, footer }) {
  const legalHref = (path) => lang === "fr" ? `/fr${path}` : path;
  const links = [
    [ROUTES.resume[lang], footer.resumeBuilder], [ROUTES.templates[lang], footer.resumeTemplates],
    [ROUTES.cover[lang], footer.coverLetter], [ROUTES.ats[lang], footer.atsChecker],
    [ROUTES.tracker[lang], footer.jobTracker], [ROUTES.interview[lang], footer.interviewPrep],
    [ROUTES.pricing[lang], footer.pricing], [ROUTES.examples[lang], footer.examples],
    [legalHref("/privacy/"), footer.privacy], [legalHref("/terms/"), footer.terms], [legalHref("/cookies/"), footer.cookies],
    ["/accessibility/", footer.accessibility],
  ];
  return <footer className="lp-footer" data-footer="unified" aria-label={footer.footerRegion}><div className="lp-wrap">
    <a className="footer-logo" href={ROUTES.home[lang]} aria-label={footer.brandHome}><img src={NAVBAR_LOGO} alt="ApplyCraft" width="320" height="82" loading="lazy" decoding="async" /></a>
    <p>{footer.tagline}</p><nav>{links.map(([href, label]) => <a href={href} key={`${href}-${label}`}>{label}</a>)}</nav>
    <small>{footer.copyrightPrefix} {new Date().getUTCFullYear()} <a href={ROUTES.home[lang]}>applycraft.io</a>.</small>
  </div></footer>;
}

export default function LandingPage({ lang, landing, landing2, footer }) {
  const rtl = lang === "ar";
  const importHref = `${ROUTES.resume[lang]}${ROUTES.resume[lang].includes("?") ? "&" : "?"}importResume=1`;
  const steps = [[landing2.hiw.s1t, landing2.hiw.s1d], [landing2.hiw.s2t, landing2.hiw.s2d], [landing2.hiw.s3t, landing2.hiw.s3d]];
  return <div className="lp-page" dir={rtl ? "rtl" : "ltr"}>
    <style>{`
      .lp-page{min-height:100vh;background:${COLORS.bg};color:${COLORS.text};font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.55}.lp-page *{box-sizing:border-box}.lp-page a{color:inherit}.lp-wrap{width:min(1120px,calc(100% - 40px));margin:auto}.lp-header{height:64px;position:fixed;inset:0 0 auto;z-index:100;display:flex;align-items:center;gap:22px;padding:0 max(20px,calc((100vw - 1160px)/2));background:rgba(6,8,15,.95);border-bottom:1px solid ${COLORS.border}}.lp-logo{display:flex;margin-inline-end:auto}.lp-logo img{width:auto;height:30px}.lp-nav{display:flex;gap:20px}.lp-nav a,.lp-footer a{font-size:13px;text-decoration:none;color:${COLORS.muted}}.lp-nav a:hover,.lp-footer a:hover{color:${COLORS.text}}.lp-languages{display:flex;gap:5px}.lp-languages a{display:grid;place-items:center;width:30px;height:30px;text-decoration:none;border-radius:6px}.lp-languages a[aria-current=page]{background:${COLORS.surface2};outline:1px solid ${COLORS.border}}.lp-header-cta,.lp-primary{display:inline-flex;justify-content:center;align-items:center;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white!important;text-decoration:none;font-weight:750;border-radius:6px;padding:10px 18px}.lp-menu-button{display:none;background:none;border:1px solid ${COLORS.border};color:${COLORS.text};font-size:20px;border-radius:6px;width:40px;height:40px}.lp-mobile-nav[hidden]{display:none!important}.lp-mobile-nav{position:absolute;top:63px;inset-inline:0;background:${COLORS.surface};padding:16px 20px;display:flex;flex-direction:column;gap:14px;border-bottom:1px solid ${COLORS.border}}.lp-mobile-nav a{text-decoration:none}.lp-hero{padding:132px 0 72px;background:radial-gradient(ellipse 70% 55% at 50% 0%,rgba(99,102,241,.15),transparent 70%)}.lp-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}.lp-eyebrow{color:${COLORS.accent2};font-size:12px;font-weight:750;letter-spacing:1.8px;text-transform:uppercase}.lp-hero h1{font-size:clamp(38px,5vw,62px);line-height:1.06;letter-spacing:-1.2px;margin:18px 0 22px}.lp-lead{font-size:18px;color:${COLORS.muted};max-width:650px}.lp-actions{display:flex;gap:12px;flex-wrap:wrap;margin:30px 0 22px}.lp-primary{padding:14px 25px}.lp-secondary{padding:13px 24px;border:1px solid ${COLORS.border};border-radius:6px;text-decoration:none;color:${COLORS.muted}!important}.lp-trust{display:flex;gap:16px;flex-wrap:wrap;color:${COLORS.dim};font-size:12px}.lp-mockup{position:relative;padding:18px;background:linear-gradient(145deg,#171d30,#0c101c);border:1px solid ${COLORS.border};border-radius:18px}.lp-paper{background:#fff;color:#192235;min-height:390px;padding:30px;border-radius:5px;box-shadow:0 20px 55px rgba(0,0,0,.53)}.lp-paper-head{display:flex;align-items:center;gap:14px}.lp-paper-head span{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#4f46e5;color:#fff;font-weight:800}.lp-paper-head div{display:flex;flex-direction:column}.lp-paper-head i,.lp-paper-row i{font-size:11px;color:#64748b}.lp-paper-rule{height:2px;background:#4f46e5;margin:22px 0}.lp-paper strong{font-size:10px;letter-spacing:1.5px;color:#4f46e5}.lp-paper-row{display:flex;justify-content:space-between;margin-top:12px;font-size:12px}.lp-paper p{font-size:10px;color:#475569}.lp-chips{display:flex;gap:6px;margin-top:10px}.lp-chips span{font-size:9px;background:#eef2ff;padding:4px 7px;border-radius:12px}.lp-score{position:absolute;inset-inline-end:-12px;bottom:30px;background:#0f766e;color:#fff;padding:8px 13px;border-radius:8px;font-size:12px;font-weight:700}.lp-stats{display:grid;grid-template-columns:repeat(4,1fr);border-block:1px solid ${COLORS.border};background:#0b0f19}.lp-stat{text-align:center;padding:25px 10px}.lp-stat b{display:block;font-size:24px;color:${COLORS.accent2}}.lp-stat span{font-size:12px;color:${COLORS.dim}}.lp-section{padding:78px 0}.lp-section h2{font-size:clamp(28px,4vw,42px);line-height:1.15;margin:10px 0 32px}.lp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.lp-card{background:${COLORS.surface};border:1px solid ${COLORS.border};padding:24px;border-radius:10px}.lp-card h3{margin:0 0 8px;font-size:17px}.lp-card p{margin:0;color:${COLORS.muted};font-size:14px}.lp-alt{background:#0b0f19}.lp-privacy{max-width:760px;color:${COLORS.muted};font-size:17px}.lp-faq{max-width:820px}.lp-faq details{border-bottom:1px solid ${COLORS.border};padding:17px 0}.lp-faq summary{font-weight:700;cursor:pointer}.lp-faq details p{color:${COLORS.muted};margin-bottom:4px}.lp-final{text-align:center}.lp-final p{color:${COLORS.muted};margin-bottom:25px}.lp-footer{padding:48px 0;border-top:1px solid ${COLORS.border};color:${COLORS.dim}}.lp-footer img{width:auto;height:27px}.lp-footer nav{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}.lp-footer small{font-size:12px}@media(max-width:820px){.lp-header{height:60px;padding:0 16px;gap:10px}.lp-nav,.lp-header-cta{display:none}.lp-menu-button{display:block}.lp-logo img{height:25px}.lp-hero{padding:106px 0 52px}.lp-hero-grid{grid-template-columns:1fr;gap:38px}.lp-hero h1{font-size:38px}.lp-stats{grid-template-columns:repeat(2,1fr)}.lp-grid{grid-template-columns:1fr}.lp-section{padding:56px 0}.lp-mockup{max-width:520px;margin:auto}.lp-score{inset-inline-end:6px}.lp-languages a{width:27px}.lp-wrap{width:min(1120px,calc(100% - 32px))}}@media(prefers-reduced-motion:reduce){.lp-page *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
      .lp-header{display:block;padding:0}.lp-header-inner{height:64px;display:flex;align-items:center;gap:22px;padding:0 max(20px,calc((100vw - 1160px)/2))}
      @media(max-width:820px){.lp-header{padding:0}.lp-header-inner{height:60px;padding:0 16px;gap:10px}}
    `}</style>
    <MarketingHeader lang={lang} landing={landing} footer={footer} />
    <main id="main-content" tabIndex={-1}>
      <section className="lp-hero"><div className="lp-wrap lp-hero-grid"><div>
        <p className="lp-eyebrow">{landing.heroEyebrow}</p><h1>{landing.heroH1}</h1><p className="lp-lead">{landing.heroSub}</p>
        <div className="lp-actions"><a className="lp-primary" role="button" href={ROUTES.resume[lang]}>{landing.createResume}</a><a className="lp-secondary" href={ROUTES.ats[lang]}>{landing.checkResume}</a></div>
        <p><a className="lp-secondary" href={importHref}>{landing.uploadResume} · {landing.uploadHint}</a></p>
        <div className="lp-trust"><span>{landing.trustBrowser}</span><span>{landing.trustNoSignup}</span><span>{landing.trustNoCard}</span><span>{landing.trustFormats}</span></div>
      </div><ResumeMockup copy={landing.mockup} /></div></section>
      <div className="lp-stats lp-wrap">{[["60",landing.statTemplates],["6",landing.statCover],["3",landing.statDocLangs],["PDF · DOCX",landing.statFormats]].map(([n,label])=><div className="lp-stat" key={label}><b>{n}</b><span>{label}</span></div>)}</div>
      <Section eyebrow={landing2.hiw.eyebrow} title={landing2.hiw.title}><div className="lp-grid">{steps.map(([title, desc],i)=><article className="lp-card" key={title}><p className="lp-eyebrow">0{i+1}</p><h3>{title}</h3><p>{interpolate(desc,{n:60})}</p></article>)}</div></Section>
      <Section eyebrow={landing2.why.eyebrow} title={landing2.why.title} className="lp-alt"><div className="lp-grid">{landing2.why.items.map(item=><article className="lp-card" key={item.t}><h3>{item.t}</h3><p>{item.d}</p></article>)}</div></Section>
      <Section eyebrow={landing2.priv.eyebrow} title={landing2.priv.title}><p className="lp-privacy">{landing2.priv.desc}</p><div className="lp-grid">{landing2.priv.cards.slice(0,3).map(item=><article className="lp-card" key={item.t}><h3>{item.t}</h3><p>{item.b}</p></article>)}</div></Section>
      <Section eyebrow={landing2.faq.eyebrow} title={landing2.faq.title} className="lp-alt"><div className="lp-faq">{landing2.faq.items.map(item=><details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></Section>
      <Section title={landing2.final.title} className="lp-final"><p>{landing2.final.sub}</p><a className="lp-primary" href={ROUTES.resume[lang]}>{landing.createResume}</a></Section>
    </main>
    <MarketingFooter lang={lang} footer={footer} />
  </div>;
}
