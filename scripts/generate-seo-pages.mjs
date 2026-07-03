import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "public");

const SITE = "https://applycraft.io";
const TODAY = "2026-06-27";
const CSS_PATH = "../_seo.css"; // relative from each subdir
const SOCIAL_IMAGE = `${SITE}/og.png`;
const SOCIAL_IMAGE_ALT = "ApplyCraft resume builder interface";

const RESUME_LOCALE_LINKS = [
  `<link rel="alternate" hreflang="en" href="${SITE}/"/>`,
  `<link rel="alternate" hreflang="ar" href="${SITE}/resume-in-arabic/"/>`,
  `<link rel="alternate" hreflang="fr" href="${SITE}/resume-in-french/"/>`,
  `<link rel="alternate" hreflang="x-default" href="${SITE}/"/>`,
].join("\n");

// ── Shared helpers ────────────────────────────────────────────────────────────
function nav() {
  return `<nav class="nav">
  <a href="/" class="nav-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="eager" decoding="async"></a>
  <a href="/" class="nav-cta">Build My Resume Free →</a>
</nav>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-shell">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="lazy" decoding="async"></a>
        <p>Free resume and cover letter builder with 46 templates, free PDF and DOCX exports, no watermark, no signup, browser-first editing, and production-ready English, French, and Arabic localization.</p>
        <a href="mailto:hello@applycraft.io">hello@applycraft.io</a>
      </div>
      <nav class="footer-grid" aria-label="Footer">
        <div>
          <h2>Product</h2>
          <a href="/">Resume Builder</a>
          <a href="/cover-letter-builder/">Cover Letter Builder</a>
          <a href="/ats-checker/">ATS Checker</a>
          <a href="/changelog/">Changelog</a>
          <a href="/roadmap/">Roadmap</a>
          <a href="/status/">Status</a>
        </div>
        <div>
          <h2>Company</h2>
          <a href="/about/">About &amp; Founder</a>
          <a href="/contact/">Contact</a>
          <a href="https://github.com/biroue10" rel="noopener">GitHub</a>
        </div>
        <div>
          <h2>Resources</h2>
          <a href="/help/">Help Center</a>
          <a href="/examples/">Resume Examples</a>
          <a href="/resume-builder/">Resume Guide</a>
          <a href="/ats-resume-builder/">ATS Guide</a>
          <a href="/free-resume-builder/">Free Resume Builder</a>
          <a href="/student-resume-builder/">Student Resume Builder</a>
          <a href="/canadian-resume-builder/">Canadian Resume Builder</a>
        </div>
        <div>
          <h2>Legal</h2>
          <a href="/privacy/">Privacy Policy</a>
          <a href="/privacy/#gdpr">GDPR</a>
          <a href="/privacy/#cookies">Cookies</a>
        </div>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>© 2026 ApplyCraft by Biroue Digital Ltd · applycraft.io</span>
      <span>Browser-first editing · Optional AI helpers · No account required</span>
    </div>
  </div>
</footer>`;
}

function ctaStrip(heading, sub) {
  return `<div class="cta-strip">
  <h2>${heading}</h2>
  <p>${sub}</p>
  <a href="/" class="btn-primary">Start Building — It's Free →</a>
</div>`;
}

function faqSchema(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  });
}

// Title-case a URL slug for use as a breadcrumb label, preserving known acronyms.
const BREADCRUMB_ACRONYMS = { it: "IT", uk: "UK", us: "US", cv: "CV", ats: "ATS", pdf: "PDF", docx: "DOCX" };
function prettifySlug(slug) {
  return slug
    .split("-")
    .map(w => BREADCRUMB_ACRONYMS[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Build a BreadcrumbList from a canonical path, e.g. "/examples/uk-cv-format/"
// → Home › Examples › UK CV Format. Any intermediate segments become their own crumb.
function breadcrumbSchema(canonicalPath) {
  const segments = canonicalPath.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", item: `${SITE}/` }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ name: prettifySlug(seg), item: `${SITE}${acc}/` });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  });
}

function faqHtml(items) {
  return `<section class="faq page">
  <h2>Frequently Asked Questions</h2>
  ${items.map(({ q, a }) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n  ")}
</section>`;
}

function page({ slug, title, description, eyebrow, h1, sub, keywords, resumeCard, features, faqs, canonicalPath, _cssPath }) {
  const canonical = `${SITE}${canonicalPath}`;
  const cssRel = _cssPath || CSS_PATH;
  const htmlAttrs = canonicalPath === "/resume-in-arabic/"
    ? `lang="ar" dir="rtl"`
    : canonicalPath === "/resume-in-french/"
      ? `lang="fr"`
      : `lang="en"`;
  const ogLocale = canonicalPath === "/resume-in-arabic/"
    ? "ar_AR"
    : canonicalPath === "/resume-in-french/"
      ? "fr_FR"
      : "en_US";
  const alternateLinks = canonicalPath === "/resume-in-arabic/" || canonicalPath === "/resume-in-french/"
    ? `\n${RESUME_LOCALE_LINKS}`
    : "";
  return `<!doctype html>
<html ${htmlAttrs}>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${canonical}"/>${alternateLinks}
<meta property="og:type" content="website"/>
<meta property="og:locale" content="${ogLocale}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${SOCIAL_IMAGE}"/>
<meta property="og:image:secure_url" content="${SOCIAL_IMAGE}"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${SOCIAL_IMAGE_ALT}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${SOCIAL_IMAGE}"/>
<meta name="twitter:image:alt" content="${SOCIAL_IMAGE_ALT}"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="icon" href="/favicon.png" type="image/png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link rel="manifest" href="/site.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'"/>
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></noscript>
<link rel="stylesheet" href="${cssRel}"/>
<script type="application/ld+json">${faqSchema(faqs)}</script>
<script type="application/ld+json">${breadcrumbSchema(canonicalPath)}</script>
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    publisher: { "@type": "Organization", name: "ApplyCraft", url: SITE },
  })}</script>
</head>
<body>
${nav()}
<main>
  <div class="page">
    <div class="hero">
      <div class="hero-eyebrow">${eyebrow}</div>
      <h1>${h1}</h1>
      <p>${sub}</p>
      <div class="hero-btns">
        <a href="/" class="btn-primary">Build My Resume Free →</a>
        <a href="/resume-builder/" class="btn-secondary">See Templates</a>
      </div>
      <div class="trust">
        <span>🔒 Browser-first editing</span>
        <span>⚡ No sign-up needed</span>
        <span>💳 Free to use</span>
        <span>📄 PDF &amp; DOCX export</span>
      </div>
    </div>
  </div>

  <div class="page">
    <div class="preview-wrap">
      <h2>Resume example — edit it in one click</h2>
      ${resumeCard}
      <div style="text-align:center;margin-top:24px">
        <a href="/" class="btn-primary">Use This Template Free →</a>
      </div>
    </div>
  </div>

  <div class="page">
    <section class="section">
      <h2>${features.heading}</h2>
      <p>${features.intro}</p>
      <div class="grid-2">
        ${features.items.map(f => `<div class="card"><div class="card-icon">${f.icon}</div><h3>${f.title}</h3><p>${f.body}</p></div>`).join("\n        ")}
      </div>
    </section>
  </div>

  ${faqHtml(faqs)}

  <div class="page">
    ${ctaStrip(features.ctaHeading || "Ready to land your next job?", features.ctaSub || "Create a professional resume in minutes — free, no sign-up required.")}
  </div>
</main>
${footer()}
</body>
</html>`;
}

// ── Resume card templates ──────────────────────────────────────────────────────
function inlineList(items) {
  return `<span class="inline-list">${items.map((item, index) => `${index > 0 ? '<span class="inline-separator" aria-hidden="true"> · </span>' : ''}<span class="inline-list-item">${item}</span>`).join("")}</span>`;
}

function rcGeneric({ name, title, email, city, skills, jobs, edu }) {
  return `<div class="resume-card">
  <div class="rc-header">
    <div class="rc-name">${name}</div>
    <div class="rc-title">${title}</div>
    <div class="rc-contact">
      <bdi dir="auto">${email}</bdi><span class="contact-separator" aria-hidden="true"> · </span><bdi dir="auto">${city}</bdi>
    </div>
  </div>
  <div class="rc-body">
    <div class="rc-side">
      <div class="rc-section-title" style="margin-top:0">Skills</div>
      <div class="rc-skills">${skills.map(s => `<span class="rc-skill">${s}</span>`).join("\n        ")}</div>
    </div>
    <div class="rc-main">
      ${jobs.map(j => `<div class="rc-item">
        <div class="rc-item-title">${j.role}</div>
        <div class="rc-item-sub">${j.company}</div>
        <div class="rc-item-date">${j.date}</div>
        <div class="rc-item-desc">${j.desc}</div>
      </div>`).join("")}
      <div class="rc-section-title" style="margin-top:16px">Education</div>
      ${edu.map(e => `<div class="rc-item">
        <div class="rc-item-title">${e.degree}</div>
        <div class="rc-item-sub">${e.school}</div>
        <div class="rc-item-date">${e.date}</div>
      </div>`).join("")}
    </div>
  </div>
</div>`;
}

// ── Page definitions ──────────────────────────────────────────────────────────
const PAGES = [
  {
    slug: "resume-builder",
    canonicalPath: "/resume-builder/",
    title: "Free Online Resume Builder — ApplyCraft",
    description: "Build a professional resume online in minutes. Choose from 46 templates, get live preview, and download as PDF or DOCX. Free, no sign-up.",
    eyebrow: "Resume Builder",
    h1: "Free Online Resume Builder",
    sub: "46 professional templates, live preview, AI polish, and instant PDF or DOCX download. Build your resume in minutes — no sign-up required.",
    keywords: "resume builder, online resume builder, free resume builder, professional resume, cv builder",
    resumeCard: rcGeneric({
      name: "Alex Morgan", title: "Senior Software Engineer",
      email: "alex.morgan@email.com", city: "San Francisco, CA",
      skills: ["Python", "React", "Node.js", "AWS", "Docker", "SQL", "Git", "Agile"],
      jobs: [
        { role: "Senior Software Engineer", company: "TechCorp Inc.", date: "Jan 2022 – Present",
          desc: "Led a team of 5 engineers to rebuild the core API platform, reducing latency by 40% and improving uptime to 99.9%." },
        { role: "Software Engineer", company: "StartupXYZ", date: "Jun 2019 – Dec 2021",
          desc: "Developed and maintained React front-end features serving 200k monthly active users." },
      ],
      edu: [{ degree: "B.Sc. Computer Science", school: "UC Berkeley", date: "2015 – 2019" }],
    }),
    features: {
      heading: "Why use ApplyCraft for your resume?",
      intro: "ApplyCraft combines polished templates, live editing, and practical export options in a browser-first resume builder.",
      ctaHeading: "Ready to build your resume?",
      ctaSub: "Create a polished resume without signup, watermark, or download paywall.",
      items: [
        { icon: "🎨", title: "46 Professional Templates", body: "From minimalist to creative, find the perfect template for your industry and seniority level." },
        { icon: "⚡", title: "Live Preview", body: "See exactly how your resume looks as you type. No more guessing — what you see is what you get." },
        { icon: "🤖", title: "AI-Powered Polish", body: "Our AI rewrites weak bullet points into strong action-oriented achievements recruiters love." },
        { icon: "📄", title: "PDF & DOCX Export", body: "Download your finished resume as a perfectly formatted PDF or editable DOCX file instantly." },
        { icon: "🌍", title: "Multilingual Documents", body: "Write resume content in any language, with fully localized interface and document labels currently available in English, French, and Arabic." },
        { icon: "🔒", title: "Browser-First Editing", body: "Most editing and export work happens in your browser, so you can build documents without creating an account." },
      ],
    },
    faqs: [
      { q: "Is ApplyCraft really free?", a: "Yes. The current core builder, templates, live preview, and PDF or DOCX downloads are available without a paid tier, account, or credit card." },
      { q: "Can I download my resume as a PDF?", a: "Yes. Click 'Download PDF' at any time. Your resume is rendered pixel-perfectly and saved as a high-quality PDF file." },
      { q: "How long does it take to build a resume?", a: "Most users complete a polished resume in 10–15 minutes. The live preview and AI suggestions speed up the writing process significantly." },
      { q: "Does ApplyCraft work on mobile?", a: "Yes. The form and preview adapt to mobile screens, though the two-column layout is optimised for desktop use." },
    ],
  },

  {
    slug: "free-resume-builder",
    canonicalPath: "/free-resume-builder/",
    title: "Free Resume Builder — No Sign-Up, No Hidden Fees | ApplyCraft",
    description: "Create a professional resume for free. No account needed, no watermarks, no paywalls. Download PDF or DOCX instantly with ApplyCraft.",
    eyebrow: "Free Builder",
    h1: "Free Resume Builder — No Sign-Up Required",
    sub: "Build your resume without signing up. Create a polished document and download it as PDF or DOCX in minutes.",
    keywords: "free resume builder, resume builder no sign up, free cv maker, free resume download, no watermark resume builder",
    resumeCard: rcGeneric({
      name: "Jordan Lee", title: "Marketing Manager",
      email: "jordan.lee@email.com", city: "New York, NY",
      skills: ["SEO", "Google Ads", "Content Strategy", "HubSpot", "Analytics", "Copywriting", "A/B Testing"],
      jobs: [
        { role: "Marketing Manager", company: "BrandCo", date: "Mar 2021 – Present",
          desc: "Grew organic traffic by 120% in 12 months through data-driven SEO strategy and content calendar optimisation." },
        { role: "Digital Marketing Specialist", company: "Agency Plus", date: "2018 – 2021",
          desc: "Managed $500k annual paid media budget across Google and Meta, achieving 3.2× average ROAS." },
      ],
      edu: [{ degree: "B.A. Communications", school: "NYU", date: "2014 – 2018" }],
    }),
    features: {
      heading: "Genuinely free — here's what you get",
      intro: "ApplyCraft keeps the core resume-building workflow available without an account, credit card, watermark, or paid tier.",
      ctaHeading: "Start your free resume now",
      ctaSub: "No credit card. No account. No watermark. Download as PDF or DOCX in minutes.",
      items: [
        { icon: "🚫", title: "No Watermarks", body: "Your downloaded resume has no ApplyCraft branding, so the document is ready to send to employers." },
        { icon: "🔓", title: "No Account Needed", body: "Skip the sign-up form. Open the builder, fill in your details, and download. That's it." },
        { icon: "💰", title: "No Paywalls", body: "The core builder, templates, language options, and downloads are available without a Pro plan." },
        { icon: "📦", title: "Unlimited Downloads", body: "Download as many versions as you want. Tailor your resume for different roles at no cost." },
        { icon: "🎯", title: "ATS-Conscious Designs", body: "Templates use clear headings, readable typography, and text-based layouts to improve parsing compatibility." },
        { icon: "✨", title: "Writing Help", body: "Use built-in prompts and optional polish features to improve bullet points and phrasing." },
      ],
    },
    faqs: [
      { q: "Why is ApplyCraft free?", a: "ApplyCraft is built as a free resume-building tool. If pricing or premium features are introduced later, the free workflow should remain clear before you invest time in a document." },
      { q: "Is there a free trial or do I need a credit card?", a: "No trial, no credit card. The tool is free with no time limits. Just open it and start building." },
      { q: "Are the downloaded resumes watermark-free?", a: "Yes. Downloaded PDFs and DOCX files contain no ApplyCraft branding whatsoever." },
      { q: "Can I create multiple resumes for free?", a: "Yes. Create as many versions as you need. Tailor each one to a specific job role, all for free." },
    ],
  },

  {
    slug: "ats-resume-builder",
    canonicalPath: "/ats-resume-builder/",
    title: "ATS Resume Builder — ATS-Conscious Resume Templates | ApplyCraft",
    description: "Build an ATS-conscious resume with clear formatting, keyword guidance, 46 templates, and free PDF/DOCX export. No signup or watermark.",
    eyebrow: "ATS Optimised",
    h1: "ATS Resume Builder for Cleaner Parsing",
    sub: "ApplyCraft templates are designed with clear headings, readable typography, and ATS-conscious layouts to improve parsing compatibility.",
    keywords: "ATS resume builder, ATS friendly resume, applicant tracking system resume, ATS optimized cv, beat ATS",
    resumeCard: rcGeneric({
      name: "Sam Rivera", title: "Product Manager",
      email: "sam.rivera@email.com", city: "Austin, TX",
      skills: ["Roadmap Planning", "Agile / Scrum", "Jira", "Stakeholder Management", "SQL", "User Research", "OKRs"],
      jobs: [
        { role: "Senior Product Manager", company: "SaaSify", date: "2021 – Present",
          desc: "Defined and shipped 3 major product releases increasing ARR by $2.4M. Coordinated cross-functional teams of 12 engineers and 3 designers." },
        { role: "Product Manager", company: "Fintech Hub", date: "2018 – 2021",
          desc: "Launched mobile payments feature adopted by 80k users in the first quarter, reducing churn by 18%." },
      ],
      edu: [{ degree: "MBA, Strategy & Innovation", school: "UT Austin", date: "2016 – 2018" }],
    }),
    features: {
      heading: "What makes a resume ATS-friendly?",
      intro: "Applicant Tracking Systems scan your resume for keywords, structure, and file format before a human ever reads it. ApplyCraft is built with this in mind.",
      ctaHeading: "Build your ATS-ready resume now",
      ctaSub: "Pass the bots and land more interviews with a resume designed for ATS from the ground up.",
      items: [
        { icon: "📐", title: "Clean, Parseable Structure", body: "Standard section headings (Experience, Education, Skills) that every ATS recognises and correctly parses." },
        { icon: "🔤", title: "Standard Fonts & Sizing", body: "We use system-safe fonts and avoid tables, columns, and graphics that confuse ATS parsers." },
        { icon: "🏷️", title: "Keyword Placement Tips", body: "Use role-specific wording from the job description naturally in your skills and experience sections." },
        { icon: "📋", title: "No Headers/Footers", body: "Contact info in the main body — not in headers or footers that ATS systems often strip." },
        { icon: "📎", title: "Clean PDF & DOCX Output", body: "Our exports use text-based (not image-based) rendering, so ATS can extract every word." },
        { icon: "✅", title: "ATS-Conscious Layouts", body: "Templates avoid common parsing problems such as image-only text, unusual section labels, and overly decorative layouts." },
      ],
    },
    faqs: [
      { q: "What is an ATS and why does it matter?", a: "An Applicant Tracking System (ATS) is software many employers use to collect, parse, and search resumes. If your resume is hard to parse, important details may be missed." },
      { q: "Which resume formats are ATS-friendly?", a: "Single-column layouts with standard headings, no graphics, no tables, and clean fonts perform best. ApplyCraft's ATS-optimised templates follow all of these rules." },
      { q: "Should I use a DOCX or PDF for ATS?", a: "Both work with modern ATS systems. ApplyCraft exports both formats. When in doubt, submit DOCX — it's the format ATS systems were originally designed for." },
      { q: "How do I add keywords to my resume for ATS?", a: "Mirror relevant language from the job description, but only when it honestly reflects your experience. Add those terms naturally in skills, tools, and achievement bullets." },
    ],
  },

  {
    slug: "cover-letter-builder",
    canonicalPath: "/cover-letter-builder/",
    title: "Free Cover Letter Builder — Professional Templates | ApplyCraft",
    description: "Write a compelling cover letter in minutes with 6 professional templates. Personalise for any role, download as PDF or DOCX. Free, no sign-up.",
    eyebrow: "Cover Letter Builder",
    h1: "Free Cover Letter Builder",
    sub: "18 professionally designed cover letter styles. Personalise your letter for any role in minutes and download as PDF or DOCX — completely free.",
    keywords: "cover letter builder, free cover letter, cover letter template, professional cover letter, cover letter maker",
    resumeCard: `<div class="resume-card">
  <div class="rc-header">
    <div class="rc-name">Sarah Chen</div>
    <div class="rc-title">UX Designer</div>
    <div class="rc-contact"><span>sarah.chen@email.com</span><span class="contact-separator" aria-hidden="true"> · </span><span>London, UK</span></div>
  </div>
  <div style="padding:24px 32px;background:#fff;color:#333;line-height:1.7;font-size:13px">
    <p style="margin-bottom:10px;color:#888;font-size:11.5px">14 June 2026</p>
    <p style="margin-bottom:10px"><strong>Hiring Manager</strong><br/>Acme Design Studio<br/>London, UK</p>
    <p style="margin-bottom:10px"><strong>Re: Senior UX Designer — Job Ref #4421</strong></p>
    <p style="margin-bottom:10px">Dear Hiring Manager,</p>
    <p style="margin-bottom:10px">I am writing to express my strong interest in the Senior UX Designer role at Acme Design Studio. With seven years of experience creating user-centred digital products — and a portfolio that includes redesigning the onboarding flow for a SaaS platform used by 500,000 users — I am confident I can make an immediate impact on your team.</p>
    <p style="margin-bottom:10px">During my time at DigitalFirst, I led end-to-end UX for three flagship products, reducing user drop-off by 34% and earning a 4.7/5 satisfaction score in post-launch surveys. I am particularly drawn to Acme's commitment to accessibility and inclusive design, values I have embedded in every project I have delivered.</p>
    <p style="margin-bottom:0">I would love the opportunity to discuss how my background aligns with your goals. I look forward to hearing from you.</p>
    <p style="margin-top:16px">Sincerely,<br/><strong>Sarah Chen</strong></p>
  </div>
</div>`,
    features: {
      heading: "What makes a great cover letter?",
      intro: "A cover letter is your first impression. ApplyCraft's builder guides you through writing a compelling, personalised letter that complements your resume.",
      ctaHeading: "Write your cover letter now",
      ctaSub: "18 styles, live preview, PDF & DOCX export — all free.",
      items: [
        { icon: "✍️", title: "6 Professional Templates", body: "From formal to modern, choose a layout that matches the tone of the company you're applying to." },
        { icon: "🔄", title: "Match Your Resume Style", body: "Cover letter templates are designed to complement your resume so both documents look like a cohesive package." },
        { icon: "⚡", title: "Live Preview", body: "See your cover letter update in real-time as you type. Adjust tone and length on the fly." },
        { icon: "🌍", title: "Multilingual Documents", body: "Write cover letters in any language, with fully localized English, French, and Arabic document labels where supported." },
        { icon: "📄", title: "PDF & DOCX Download", body: "Export your finished cover letter as a polished PDF or editable DOCX with one click." },
        { icon: "🎯", title: "Role-Specific Guidance", body: "Built-in prompts remind you to mention the company name, role title, and key achievements." },
      ],
    },
    faqs: [
      { q: "Do I need a cover letter in 2026?", a: "Yes — 83% of hiring managers say a strong cover letter influences their decision to interview a candidate. It's your chance to explain your motivation and stand out from applicants with similar CVs." },
      { q: "How long should a cover letter be?", a: "Three to four short paragraphs — roughly 250–400 words. Hiring managers spend less than 30 seconds on a first read, so be concise and compelling." },
      { q: "Should my cover letter match my resume design?", a: "Yes. A consistent look signals attention to detail and professionalism. ApplyCraft's cover letter templates are designed to pair visually with the resume templates." },
      { q: "Can I use the same cover letter for multiple jobs?", a: "Only if you personalise the key details — the company name, role title, and one specific reason why you want to work there. Generic letters are easy for recruiters to spot." },
    ],
  },

  {
    slug: "resume-checker",
    canonicalPath: "/resume-checker/",
    title: "Free Resume Checker & Reviewer — AI Feedback | ApplyCraft",
    description: "Get instant AI feedback on your resume. Check ATS compatibility, keyword coverage, and formatting. Fix issues and download a polished resume free.",
    eyebrow: "Resume Checker",
    h1: "Free AI Resume Checker & Reviewer",
    sub: "Upload or paste your resume and get instant AI feedback on ATS compatibility, keyword gaps, formatting issues, and weak phrasing — then fix everything in one place.",
    keywords: "resume checker, resume reviewer, ATS resume checker, resume score, AI resume feedback, resume analysis",
    resumeCard: rcGeneric({
      name: "Chris Patel", title: "Data Analyst",
      email: "chris.patel@email.com", city: "Chicago, IL",
      skills: ["Python", "SQL", "Tableau", "Excel", "Power BI", "Pandas", "Statistics", "A/B Testing"],
      jobs: [
        { role: "Senior Data Analyst", company: "RetailGroup", date: "2020 – Present",
          desc: "Built an automated reporting pipeline that saved 12 hours of manual work per week and surfaced insights that drove a 9% uplift in revenue." },
        { role: "Data Analyst", company: "InsuranceCo", date: "2017 – 2020",
          desc: "Analysed customer churn patterns using cohort analysis, informing a retention campaign that reduced churn by 22%." },
      ],
      edu: [{ degree: "B.Sc. Statistics", school: "University of Illinois", date: "2013 – 2017" }],
    }),
    features: {
      heading: "What does the AI resume checker look for?",
      intro: "Our AI evaluates your resume across the same criteria that ATS systems and professional recruiters use.",
      ctaHeading: "Check and improve your resume now",
      ctaSub: "Identify weaknesses, fix them instantly, and download a stronger resume — all free.",
      items: [
        { icon: "🤖", title: "ATS Compatibility", body: "Checks for tables, graphics, and non-standard fonts that cause ATS parsers to misread your resume." },
        { icon: "🏷️", title: "Keyword Coverage", body: "Compares your resume against common requirements for your target role and flags missing keywords." },
        { icon: "📊", title: "Impact Score", body: "Rates each bullet point for use of action verbs, quantified results, and specificity — then suggests improvements." },
        { icon: "📋", title: "Section Completeness", body: "Checks that all essential sections (contact info, summary, experience, education, skills) are present and complete." },
        { icon: "✍️", title: "Weak Phrasing Detector", body: "Identifies passive language, clichés ('team player', 'results-driven'), and vague statements and rewrites them." },
        { icon: "📏", title: "Length & Formatting", body: "Flags resumes that are too long, too short, or have inconsistent formatting that looks unprofessional." },
      ],
    },
    faqs: [
      { q: "How do I check my resume for free?", a: "Open ApplyCraft, paste your resume content into the form fields, and use the AI Polish feature to get instant suggestions. The live preview shows you exactly how recruiters will see your document." },
      { q: "What is a good resume score?", a: "A strong resume should include quantified achievements in every experience bullet, relevant keywords from the job posting, and clean formatting with no ATS-breaking elements." },
      { q: "Can the AI rewrite my resume for me?", a: "Yes. The AI Polish feature rewrites your entire resume using strong action verbs and improved phrasing, tailored to your target role and language." },
      { q: "How often should I update my resume?", a: "Update it every 3–6 months, or immediately after a major achievement. Keep it tailored to the specific role you're applying for." },
    ],
  },

  {
    slug: "resume-in-french",
    canonicalPath: "/resume-in-french/",
    title: "CV en Français — Créez votre CV en ligne gratuitement | ApplyCraft",
    description: "Créez un CV professionnel en français avec 46 modèles. Prévisualisation en direct, export PDF et DOCX. Gratuit, sans inscription.",
    eyebrow: "CV en Français",
    h1: "Créez votre CV en Français",
    sub: "46 modèles professionnels, prévisualisation en direct, et export PDF ou DOCX — entièrement gratuit. Rédigez votre CV en français en quelques minutes.",
    keywords: "cv en français, faire son cv en français, modèle cv français, créer cv gratuit, cv professionnel français",
    resumeCard: `<div class="resume-card">
  <div class="rc-header" style="border-color:#6366F1">
    <div class="rc-name">Marie Dupont</div>
    <div class="rc-title">Responsable Marketing Digital</div>
    <div class="rc-contact"><span>marie.dupont@email.fr</span><span class="contact-separator" aria-hidden="true"> · </span><span>Paris, France</span></div>
  </div>
  <div class="rc-body">
    <div class="rc-side">
      <div class="rc-section-title" style="margin-top:0">Compétences</div>
      <div class="rc-skills">
        <span class="rc-skill">SEO/SEM</span>
        <span class="rc-skill">Google Analytics</span>
        <span class="rc-skill">HubSpot</span>
        <span class="rc-skill">Réseaux sociaux</span>
        <span class="rc-skill">Rédaction web</span>
        <span class="rc-skill">E-mailing</span>
      </div>
      <div class="rc-section-title" style="margin-top:16px">Langues</div>
      <div class="rc-item-desc">${inlineList(["Français (natif)", "Anglais (courant)", "Espagnol (intermédiaire)"])}</div>
    </div>
    <div class="rc-main">
      <div class="rc-section-title" style="margin-top:0">Expérience professionnelle</div>
      <div class="rc-item">
        <div class="rc-item-title">Responsable Marketing Digital</div>
        <div class="rc-item-sub">Agence WebBoost, Paris</div>
        <div class="rc-item-date">Janvier 2022 – Présent</div>
        <div class="rc-item-desc">Développement et exécution de la stratégie digitale. Augmentation du trafic organique de 85 % en 12 mois.</div>
      </div>
      <div class="rc-item">
        <div class="rc-item-title">Chargée de Communication</div>
        <div class="rc-item-sub">StartupFR, Lyon</div>
        <div class="rc-item-date">2019 – 2021</div>
        <div class="rc-item-desc">Gestion des réseaux sociaux et campagnes e-mailing pour une base de 50 000 abonnés.</div>
      </div>
      <div class="rc-section-title" style="margin-top:12px">Formation</div>
      <div class="rc-item">
        <div class="rc-item-title">Master Marketing Digital</div>
        <div class="rc-item-sub">Université Paris-Dauphine</div>
        <div class="rc-item-date">2017 – 2019</div>
      </div>
    </div>
  </div>
</div>`,
    features: {
      heading: "Pourquoi utiliser ApplyCraft pour votre CV en français ?",
      intro: "ApplyCraft prend en charge le français nativement : libellés de sections, mise en page et export PDF — tout est adapté au marché de l'emploi francophone.",
      ctaHeading: "Créez votre CV en français maintenant",
      ctaSub: "Gratuit, sans inscription, avec une interface et des libellés complets en français, anglais et arabe.",
      items: [
        { icon: "🇫🇷", title: "Interface en français", body: "L'interface, les libellés de sections (Expérience, Formation, Compétences) et les suggestions sont entièrement en français." },
        { icon: "📋", title: "Formats adaptés au marché français", body: "Nos modèles respectent les conventions du CV français : pas de photo obligatoire, format chronologique inversé, longueur d'une page." },
        { icon: "🤖", title: "IA de rédaction en français", body: "L'IA d'ApplyCraft rédige et améliore votre CV directement en français — des formulations percutantes et professionnelles." },
        { icon: "📄", title: "Export PDF et DOCX", body: "Téléchargez votre CV en PDF pour l'envoyer ou en DOCX pour continuer à l'éditer dans Word ou LibreOffice." },
        { icon: "🌍", title: "Idéal pour les candidatures internationales", body: "Rédigez votre CV en français pour le marché français, puis basculez en anglais pour les entreprises internationales." },
        { icon: "⚡", title: "Rapide et gratuit", body: "Créez un CV professionnel en 10 minutes, sans inscription et sans frais cachés." },
      ],
    },
    faqs: [
      { q: "Comment faire un bon CV en français ?", a: "Un bon CV français comprend : un en-tête avec vos coordonnées, un titre de poste, une accroche (optionnelle), l'expérience professionnelle en ordre chronologique inversé, la formation, et les compétences. Limitez-vous à une page pour moins de 10 ans d'expérience." },
      { q: "Faut-il mettre une photo sur un CV français ?", a: "La photo est facultative en France mais couramment utilisée. ApplyCraft vous permet d'en ajouter une si vous le souhaitez, ou de l'omettre selon le contexte." },
      { q: "Quelle longueur pour un CV en France ?", a: "Une page pour les profils juniors et intermédiaires. Deux pages sont acceptables pour plus de 15 ans d'expérience. Les recruteurs français lisent en moyenne un CV en 30 secondes." },
      { q: "Peut-on créer un CV bilingue avec ApplyCraft ?", a: "Oui. Vous pouvez créer deux versions de votre CV (une en français, une en anglais) et les télécharger séparément pour des candidatures différentes." },
    ],
  },

  {
    slug: "resume-in-arabic",
    canonicalPath: "/resume-in-arabic/",
    title: "إنشاء سيرة ذاتية بالعربية — مجاناً | ApplyCraft",
    description: "أنشئ سيرة ذاتية احترافية باللغة العربية مع دعم الكتابة من اليمين إلى اليسار. 46 قالباً مجانياً، تصدير PDF و DOCX.",
    eyebrow: "السيرة الذاتية بالعربية",
    h1: "أنشئ سيرتك الذاتية بالعربية",
    sub: "46 قالباً احترافياً مع دعم إنتاجي للعربية والكتابة من اليمين إلى اليسار. تنزيل PDF أو DOCX مجاناً — دون تسجيل.",
    keywords: "سيرة ذاتية بالعربية, نموذج سيرة ذاتية عربي, cv بالعربي, سيرة ذاتية مجانية, انشاء سيرة ذاتية",
    resumeCard: `<div class="resume-card" dir="rtl" style="text-align:right">
  <div class="rc-header" style="border-color:#6366F1">
    <div class="rc-name">أحمد محمد الرشيد</div>
    <div class="rc-title">مهندس برمجيات أول</div>
    <div class="rc-contact" style="justify-content:flex-end"><span>ahmed.alrashid@email.com</span><span class="contact-separator" aria-hidden="true"> · </span><span>دبي، الإمارات</span></div>
  </div>
  <div class="rc-body" style="direction:rtl">
    <div class="rc-main" style="border-right:none;border-left:1px solid #eee">
      <div class="rc-section-title" style="margin-top:0">الخبرة المهنية</div>
      <div class="rc-item">
        <div class="rc-item-title">مهندس برمجيات أول</div>
        <div class="rc-item-sub">شركة تك بلس، دبي</div>
        <div class="rc-item-date">2021 – حتى الآن</div>
        <div class="rc-item-desc">قيادة فريق من 6 مطورين لبناء منصة SaaS خدمت أكثر من 100,000 مستخدم.</div>
      </div>
      <div class="rc-item">
        <div class="rc-item-title">مطور ويب</div>
        <div class="rc-item-sub">شركة ديجيتال عرب، الرياض</div>
        <div class="rc-item-date">2018 – 2021</div>
        <div class="rc-item-desc">تطوير تطبيقات React.js وتحسين أداء المنصة بنسبة 45%.</div>
      </div>
      <div class="rc-section-title" style="margin-top:12px">التعليم</div>
      <div class="rc-item">
        <div class="rc-item-title">بكالوريوس علوم الحاسوب</div>
        <div class="rc-item-sub">جامعة الملك عبدالله</div>
        <div class="rc-item-date">2014 – 2018</div>
      </div>
    </div>
    <div class="rc-side" style="border-right:none;border-left:1px solid #eee">
      <div class="rc-section-title" style="margin-top:0">المهارات</div>
      <div class="rc-skills" style="justify-content:flex-end">
        <span class="rc-skill">Python</span>
        <span class="rc-skill">React</span>
        <span class="rc-skill">Node.js</span>
        <span class="rc-skill">AWS</span>
        <span class="rc-skill">SQL</span>
        <span class="rc-skill">Docker</span>
      </div>
      <div class="rc-section-title" style="margin-top:16px">اللغات</div>
      <div class="rc-item-desc">العربية (لغة أم)<br/>الإنجليزية (متقدم)</div>
    </div>
  </div>
</div>`,
    features: {
      heading: "لماذا ApplyCraft لإنشاء السيرة الذاتية بالعربية؟",
      intro: "يدعم ApplyCraft اللغة العربية بشكل كامل مع الكتابة من اليمين إلى اليسار، مما يجعله الأداة المثالية للباحثين عن عمل في العالم العربي.",
      ctaHeading: "أنشئ سيرتك الذاتية بالعربية الآن",
      ctaSub: "مجاني تماماً — دون تسجيل، دون علامات مائية، تنزيل فوري.",
      items: [
        { icon: "🔄", title: "دعم الكتابة من اليمين إلى اليسار", body: "الواجهة والقوالب والتصدير تدعم RTL بشكل كامل للغة العربية والفارسية والعبرية." },
        { icon: "📋", title: "قوالب ملائمة لسوق العمل العربي", body: "قوالب مصممة لتناسب متطلبات سوق العمل في دول الخليج ومنطقة MENA." },
        { icon: "🤖", title: "تحسين ذكي باللغة العربية", body: "تُعيد الذكاء الاصطناعي كتابة سيرتك بعبارات احترافية ومؤثرة باللغة العربية." },
        { icon: "📄", title: "تصدير PDF و DOCX", body: "نزّل سيرتك كملف PDF عالي الجودة أو DOCX قابل للتعديل في Word." },
        { icon: "🌍", title: "مثالي للتقديم الدولي", body: "أنشئ نسخة عربية للسوق المحلي ونسخة إنجليزية للشركات الدولية." },
        { icon: "⚡", title: "سريع ومجاني", body: "أنشئ سيرة ذاتية احترافية في أقل من 15 دقيقة، مجاناً تماماً." },
      ],
    },
    faqs: [
      { q: "كيف أنشئ سيرة ذاتية بالعربية مجاناً؟", a: "افتح ApplyCraft، اختر اللغة العربية من قائمة اللغات، ثم أدخل بياناتك. ستُعرض السيرة الذاتية بتنسيق RTL كامل. نزّلها كـ PDF أو DOCX مجاناً." },
      { q: "ما الفرق بين السيرة الذاتية العربية والأجنبية؟", a: "السيرة الذاتية العربية تُكتب من اليمين إلى اليسار وقد تتضمن صورة شخصية وتاريخ الميلاد حسب متطلبات بعض أصحاب العمل في المنطقة." },
      { q: "هل يدعم ApplyCraft اللهجات العربية المختلفة؟", a: "يدعم ApplyCraft اللغة العربية الفصحى المستخدمة في البيئات المهنية في جميع الدول العربية." },
      { q: "هل يمكنني إنشاء سيرة ذاتية بالعربية والإنجليزية معاً؟", a: "يمكنك إنشاء نسختين منفصلتين — واحدة بالعربية وأخرى بالإنجليزية — وتنزيلهما للتقديم على الفرص المختلفة." },
    ],
  },

  {
    slug: "canadian-resume-builder",
    canonicalPath: "/canadian-resume-builder/",
    title: "Canadian Resume Builder — Format & Templates | ApplyCraft",
    description: "Build a resume in the Canadian format. No photo, no age, reverse-chronological. ATS-friendly templates designed for the Canadian job market. Free.",
    eyebrow: "Canadian Resume",
    h1: "Canadian Resume Builder — Formats & Templates",
    sub: "The Canadian resume has specific conventions that differ from UK CVs and American resumes. ApplyCraft's templates are tailored for the Canadian job market.",
    keywords: "canadian resume builder, canadian resume format, canadian cv template, resume canada, job application canada",
    resumeCard: rcGeneric({
      name: "Emily Tremblay", title: "Financial Analyst",
      email: "emily.tremblay@email.ca", city: "Toronto, ON",
      skills: ["Financial Modelling", "Excel", "SQL", "Bloomberg", "IFRS", "Variance Analysis", "Power BI"],
      jobs: [
        { role: "Financial Analyst", company: "RBC Capital Markets", date: "May 2021 – Present",
          desc: "Developed financial models for M&A transactions totalling $1.2B in deal value. Prepared board-level presentations for 3 completed acquisitions." },
        { role: "Junior Analyst", company: "CIBC", date: "2018 – 2021",
          desc: "Supported portfolio analysis and monthly reporting for an investment portfolio of $450M. Reduced report preparation time by 35% through Excel automation." },
      ],
      edu: [{ degree: "B.Com. Finance", school: "University of Toronto", date: "2014 – 2018" }],
    }),
    features: {
      heading: "What makes a Canadian resume different?",
      intro: "Canadian employers have specific expectations for resume format that differ from US, UK, and international norms. Here's what you need to know.",
      ctaHeading: "Build your Canadian resume now",
      ctaSub: "ATS-optimised templates tailored to Canadian employers. Free, no sign-up.",
      items: [
        { icon: "🚫", title: "No Photo Required", body: "Unlike many European and Asian countries, Canadian resumes do not include a photo. Adding one can actually hurt your application." },
        { icon: "📅", title: "No Age or Marital Status", body: "Canadian human rights law prohibits discrimination based on age, sex, or marital status. Do not include these on your resume." },
        { icon: "📋", title: "Reverse-Chronological Format", body: "Most Canadian employers prefer a clear chronological format with your most recent position listed first." },
        { icon: "📏", title: "One to Two Pages", body: "Canadian resumes are typically 1–2 pages. Junior candidates should aim for one page; senior professionals may use two." },
        { icon: "🏷️", title: "Include a Professional Summary", body: "A 2–3 sentence professional summary at the top is standard in Canada and helps recruiters quickly assess fit." },
        { icon: "📊", title: "Quantify Achievements", body: "Canadian employers respond strongly to data-driven bullet points. Always quantify your impact (%, $, time saved)." },
      ],
    },
    faqs: [
      { q: "What is the standard Canadian resume format?", a: "A standard Canadian resume includes: contact information (name, phone, email, city/province — no full address), a professional summary, work experience in reverse-chronological order, education, and skills. No photo, no age, no SIN number." },
      { q: "Should I include my full address on a Canadian resume?", a: "No. In Canada it's standard to include only your city and province (e.g., Toronto, ON). A full street address is considered outdated and may raise privacy concerns." },
      { q: "Is a one-page resume standard in Canada?", a: "For candidates with fewer than 10 years of experience, a one-page resume is ideal. Two pages are acceptable for senior professionals. Never go beyond two pages." },
      { q: "Do Canadian employers expect a cover letter?", a: "Yes. Canadian employers typically expect a tailored cover letter alongside your resume. Our free cover letter builder can help you write one in minutes." },
    ],
  },

  {
    slug: "student-resume-builder",
    canonicalPath: "/student-resume-builder/",
    title: "Student Resume Builder — First Job & Internship Templates | ApplyCraft",
    description: "Build a student resume with no experience. Highlight education, projects, and transferable skills. Free templates designed for students and graduates.",
    eyebrow: "Student & Graduate",
    h1: "Student Resume Builder — No Experience Needed",
    sub: "Landing your first job or internship is tough. ApplyCraft's student templates help you showcase education, projects, and transferable skills even without work experience.",
    keywords: "student resume builder, graduate resume, resume no experience, first job resume, internship resume, entry level resume",
    resumeCard: rcGeneric({
      name: "Tyler Brooks", title: "Computer Science Graduate | Seeking Software Developer Role",
      email: "tyler.brooks@email.com", city: "Boston, MA",
      skills: ["Python", "Java", "React", "SQL", "Git", "Figma", "Machine Learning", "REST APIs"],
      jobs: [
        { role: "Software Developer Intern", company: "LocalTech Inc.", date: "Summer 2025",
          desc: "Built a React dashboard reducing manual reporting by 4 hours/week. Merged 12 PRs with 0 production bugs over a 12-week placement." },
        { role: "Teaching Assistant — Data Structures", company: "Boston University", date: "Sep 2024 – May 2025",
          desc: "Facilitated lab sessions for 60 students and graded weekly assignments, improving average class score by 8%." },
      ],
      edu: [{ degree: "B.Sc. Computer Science (GPA 3.8 / 4.0)", school: "Boston University", date: "2021 – 2025" }],
    }),
    features: {
      heading: "How to build a student resume with no experience",
      intro: "Every professional started somewhere. Here's how to create a compelling student resume that gets you interviews even without a long work history.",
      ctaHeading: "Build your student resume — free",
      ctaSub: "Templates designed for students, graduates, and first-time job seekers.",
      items: [
        { icon: "🎓", title: "Lead with Education", body: "As a student, your degree, GPA, and relevant coursework are your strongest assets. Put them at the top." },
        { icon: "💼", title: "Include Internships & Part-Time Work", body: "Any paid work — even part-time retail or hospitality — demonstrates reliability, teamwork, and responsibility." },
        { icon: "🏆", title: "Highlight Projects & Hackathons", body: "Personal projects, GitHub repos, hackathon wins, and capstone projects show practical skills employers care about." },
        { icon: "🤝", title: "Volunteer & Extracurricular Activity", body: "Club leadership, volunteering, and societies demonstrate soft skills and initiative that work experience alone can't show." },
        { icon: "📊", title: "Quantify What You Can", body: "Even student roles have numbers: club members managed, events organised, dollars raised, students tutored." },
        { icon: "🎯", title: "Tailor to Every Application", body: "Reorder your skills and tweak your summary for each role. A tailored application outperforms a generic one every time." },
      ],
    },
    faqs: [
      { q: "How do I make a resume with no work experience?", a: "Focus on education, GPA (if above 3.5), relevant coursework, personal or academic projects, internships, volunteer work, and extracurricular activities. Use action verbs and quantify wherever possible." },
      { q: "Should I include my GPA on my resume?", a: "Include your GPA if it is 3.5/4.0 or above. If it is lower, you can omit it — no recruiter will penalise you for not including it." },
      { q: "How long should a student resume be?", a: "One page, always. Even if you have limited content, forcing a one-page resume keeps you focused on your strongest points." },
      { q: "Can I use a student resume for an internship application?", a: "Yes — internship applications and student job applications use the same resume format. Lead with education, highlight relevant projects and skills, and include any previous work experience." },
    ],
  },

  {
    slug: "customer-service-resume",
    canonicalPath: "/customer-service-resume/",
    title: "Customer Service Resume — Templates & Examples | ApplyCraft",
    description: "Build a professional customer service resume. Templates for call centre agents, support specialists, and retail staff. Free, ATS-friendly, download PDF.",
    eyebrow: "Customer Service",
    h1: "Customer Service Resume — Templates & Examples",
    sub: "Dedicated templates for customer service roles: call centre agents, support specialists, retail assistants, and team leads. Highlight your customer satisfaction scores and soft skills.",
    keywords: "customer service resume, call center resume, customer support resume, retail resume, customer service cv template",
    resumeCard: rcGeneric({
      name: "Maria Santos", title: "Senior Customer Service Representative",
      email: "maria.santos@email.com", city: "Miami, FL",
      skills: ["Zendesk", "Salesforce", "Live Chat", "Conflict Resolution", "Upselling", "CRM", "Spanish (Fluent)", "Active Listening"],
      jobs: [
        { role: "Senior Customer Service Rep.", company: "TelecomPlus", date: "Mar 2021 – Present",
          desc: "Maintained 97% CSAT score across 80+ daily interactions. Resolved billing disputes averaging $320 in customer credit, retaining 92% of at-risk accounts." },
        { role: "Customer Service Agent", company: "RetailChain", date: "2018 – 2021",
          desc: "Handled 100+ customer contacts daily via phone, email, and live chat. Achieved #1 ranking in team for first-call resolution for 6 consecutive months." },
      ],
      edu: [{ degree: "A.A. Business Administration", school: "Miami Dade College", date: "2016 – 2018" }],
    }),
    features: {
      heading: "What recruiters look for in a customer service resume",
      intro: "Customer service hiring managers want to see measurable results, specific tools, and evidence of empathy and communication skills.",
      ctaHeading: "Build your customer service resume free",
      ctaSub: "ATS-friendly templates for every customer service role. Download as PDF in minutes.",
      items: [
        { icon: "📊", title: "Quantify Your CSAT & KPIs", body: "Include your customer satisfaction score (CSAT), NPS, first-call resolution rate, average handle time, and upselling metrics." },
        { icon: "🛠️", title: "List Your Tools", body: "Employers want to see experience with Zendesk, Salesforce, Freshdesk, Intercom, or any CRM and ticketing system you've used." },
        { icon: "🤝", title: "Highlight Soft Skills with Evidence", body: "Don't just list 'good communicator' — describe a situation where your communication resolved a difficult issue." },
        { icon: "📞", title: "Specify Your Channel Experience", body: "Phone, email, live chat, social media support — specify which channels you've worked in and your volume per channel." },
        { icon: "🌍", title: "Languages Are a Major Advantage", body: "Bilingual and multilingual customer service agents are in high demand. Always list your language skills and proficiency level." },
        { icon: "🏆", title: "Awards & Recognition", body: "Agent of the month, top CSAT award, peer recognition — include any formal or informal recognition you've received." },
      ],
    },
    faqs: [
      { q: "What skills should I put on a customer service resume?", a: "Include both hard skills (CRM tools, ticketing systems, typing speed, languages) and soft skills demonstrated with examples (conflict resolution, empathy, patience, active listening)." },
      { q: "How do I write a customer service resume with no experience?", a: "Focus on transferable skills from school, volunteer work, or personal projects. Retail, food service, or any public-facing role counts as customer service experience." },
      { q: "What is a good CSAT score to put on a resume?", a: "Any score above 90% is worth mentioning. If your score is 95%+, lead with it. If you don't have a formal CSAT score, mention your average rating or any customer compliments you've received." },
      { q: "Should I include a cover letter for a customer service job?", a: "Yes. A short, warm cover letter that demonstrates your communication skills directly supports your customer service candidacy. Keep it to 3 paragraphs." },
    ],
  },

  {
    slug: "it-support-resume",
    canonicalPath: "/it-support-resume/",
    title: "IT Support Resume — Templates & Examples | ApplyCraft",
    description: "Build an IT support resume that highlights your technical skills and certifications. Templates for help desk, IT technician, and support analyst roles. Free.",
    eyebrow: "IT Support",
    h1: "IT Support Resume — Templates & Examples",
    sub: "Purpose-built templates for IT support roles: help desk technicians, desktop support analysts, IT support specialists, and junior sysadmins.",
    keywords: "IT support resume, help desk resume, IT technician resume, desktop support resume, technical support resume, IT cv template",
    resumeCard: rcGeneric({
      name: "Liam O'Brien", title: "IT Support Specialist | CompTIA A+ Certified",
      email: "liam.obrien@email.com", city: "Seattle, WA",
      skills: ["Windows 10/11", "Active Directory", "Microsoft 365", "CompTIA A+", "ITIL Foundation", "Intune/Endpoint Manager", "PowerShell", "Ticketing (ServiceNow)"],
      jobs: [
        { role: "IT Support Specialist", company: "HealthTech Corp", date: "Apr 2022 – Present",
          desc: "Resolved 95% of L1/L2 tickets within SLA. Reduced average ticket resolution time by 28% by creating a self-service knowledge base used by 200+ employees." },
        { role: "Help Desk Technician", company: "ManagedIT Ltd", date: "2019 – 2022",
          desc: "Supported 350 end users across 3 sites. Imaged and deployed 120 workstations in a single Windows 11 migration project completed 2 weeks ahead of schedule." },
      ],
      edu: [{ degree: "A.Sc. Information Technology", school: "Seattle Central College", date: "2017 – 2019" }],
    }),
    features: {
      heading: "What to include on an IT support resume",
      intro: "IT support hiring managers want to see specific technical skills, certifications, SLA metrics, and evidence of problem-solving under pressure.",
      ctaHeading: "Build your IT support resume free",
      ctaSub: "Templates built for IT support professionals at every level.",
      items: [
        { icon: "🏅", title: "Lead with Certifications", body: "CompTIA A+, Network+, Security+, ITIL Foundation, Microsoft 365 Fundamentals — list certifications prominently in your header or a dedicated section." },
        { icon: "📊", title: "SLA Metrics & Ticket Volume", body: "Include your first-call resolution rate, average handle time, ticket volume, and SLA compliance percentage." },
        { icon: "🛠️", title: "List All Tools & Systems", body: "Active Directory, Azure AD, Intune, ServiceNow, Jira, Zendesk, SCCM — list every tool you've used professionally." },
        { icon: "💻", title: "OS & Platform Experience", body: "Specify your experience with Windows, macOS, and Linux. Include version numbers where relevant (e.g., Windows 11, Ubuntu 22.04)." },
        { icon: "📝", title: "Documentation & Knowledge Base", body: "Creating SOPs and knowledge base articles shows senior-level thinking even at junior roles. Include any KB contributions." },
        { icon: "🔒", title: "Security Awareness", body: "Basic security knowledge (MFA setup, phishing response, endpoint encryption) is increasingly expected in IT support roles." },
      ],
    },
    faqs: [
      { q: "What certifications should I list on an IT support resume?", a: "CompTIA A+ is the industry standard entry-level cert. Also list CompTIA Network+, Security+, ITIL Foundation, Microsoft 365 Fundamentals, and any vendor-specific certs (Cisco, Microsoft, AWS)." },
      { q: "How do I write an IT support resume with no experience?", a: "Highlight your home lab projects, self-study certifications, coursework, and any volunteer IT work. Certifications like CompTIA A+ signal technical competence even without formal experience." },
      { q: "What is L1 and L2 support and should I put it on my resume?", a: "L1 (first-line) support handles password resets and basic troubleshooting. L2 support handles more complex software and hardware issues. Specifying your tier level tells employers exactly where you fit in their support structure." },
      { q: "How long should an IT support resume be?", a: "One page for entry-level and junior roles. Two pages are acceptable for senior support or team lead positions with 5+ years of experience." },
    ],
  },

  {
    slug: "linux-system-administrator-resume",
    canonicalPath: "/linux-system-administrator-resume/",
    title: "Linux System Administrator Resume — Templates | ApplyCraft",
    description: "Build a Linux sysadmin resume that showcases your skills in shell scripting, server management, and DevOps tools. ATS-friendly templates. Free.",
    eyebrow: "Linux / Sysadmin",
    h1: "Linux System Administrator Resume",
    sub: "Templates built for Linux engineers, system administrators, and DevOps professionals. Highlight your infrastructure, scripting, and automation expertise.",
    keywords: "linux system administrator resume, linux sysadmin resume, linux admin cv, devops resume, system administrator resume template",
    resumeCard: rcGeneric({
      name: "Priya Nair", title: "Senior Linux Systems Administrator",
      email: "priya.nair@email.com", city: "Austin, TX",
      skills: ["RHEL / CentOS", "Ubuntu", "Bash / Python", "Ansible", "Docker", "Kubernetes", "Terraform", "AWS EC2/S3/RDS", "Nagios / Prometheus", "Git / Jenkins"],
      jobs: [
        { role: "Senior Linux Systems Administrator", company: "CloudSys Inc.", date: "2020 – Present",
          desc: "Managed 600+ Linux servers across 3 AWS regions with 99.97% uptime. Automated patching and configuration with Ansible playbooks, reducing manual effort by 70%." },
        { role: "Linux Systems Administrator", company: "DataCenter Pro", date: "2016 – 2020",
          desc: "Deployed and maintained RHEL and Ubuntu environments for 40+ enterprise clients. Implemented centralised logging with ELK stack, cutting incident diagnosis time by 50%." },
      ],
      edu: [{ degree: "B.Sc. Computer Engineering", school: "UT Austin", date: "2012 – 2016" }],
    }),
    features: {
      heading: "What Linux admins should include on their resume",
      intro: "Linux sysadmin roles are highly technical. Hiring managers look for specific distros, tools, automation experience, and uptime/reliability metrics.",
      ctaHeading: "Build your Linux sysadmin resume free",
      ctaSub: "Technical templates built for Linux engineers and DevOps professionals.",
      items: [
        { icon: "🐧", title: "Specify Your Linux Distributions", body: "List the distributions you've worked with professionally: RHEL, CentOS, Ubuntu, Debian, Amazon Linux, Arch. Include version numbers." },
        { icon: "📜", title: "Highlight Scripting & Automation", body: "Bash, Python, Perl — show specific scripts you've written. Mention tools like Ansible, Puppet, Chef, or Terraform for infrastructure automation." },
        { icon: "📊", title: "Uptime & Reliability Metrics", body: "99.9%, 99.99% uptime figures are gold. Also include number of servers managed, users supported, and incident response times." },
        { icon: "🐳", title: "Container & Cloud Skills", body: "Docker, Kubernetes, Helm, and cloud platforms (AWS, GCP, Azure) are increasingly expected even for traditional sysadmin roles." },
        { icon: "🔒", title: "Security & Hardening Experience", body: "SELinux, iptables, SSH hardening, CIS benchmarks, vulnerability scanning — security skills are a major differentiator." },
        { icon: "🏅", title: "Certifications Matter", body: "RHCSA, RHCE, Linux+, LFCS, AWS Solutions Architect, CKA — any Linux-related certification significantly strengthens your application." },
      ],
    },
    faqs: [
      { q: "What skills should a Linux system administrator list on their resume?", a: "Core OS skills (RHEL, Ubuntu, Debian), shell scripting (Bash, Python), configuration management (Ansible, Puppet, Chef), monitoring (Nagios, Prometheus, Grafana), networking (DNS, DHCP, TCP/IP), and cloud platforms (AWS, GCP, Azure)." },
      { q: "What certifications help a Linux admin's resume?", a: "RHCSA and RHCE are the gold standard for Red Hat environments. Linux Foundation Certified System Administrator (LFCS) and CompTIA Linux+ are vendor-neutral options. For cloud-focused roles, AWS Solutions Architect or Google Cloud Professional is highly valued." },
      { q: "How should I describe automation experience on a Linux resume?", a: "Be specific: name the tool (Ansible), what you automated (OS patching, user provisioning), the scale (300 servers), and the impact (saved 20 hours/week). Generic statements like 'experience with automation' are too vague." },
      { q: "Should I include a GitHub link on my Linux admin resume?", a: "Yes. A GitHub profile with public repos showing your scripts, Ansible playbooks, or Terraform configurations is a powerful addition to any technical resume." },
    ],
  },
];

// ── Example pages ─────────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    slug: "it-support-technician-resume",
    canonicalPath: "/examples/it-support-technician-resume/",
    title: "IT Support Technician Resume Example — Free Template | ApplyCraft",
    description: "Download a free IT Support Technician resume example. ATS-friendly template with pre-filled skills, certifications, and experience sections. Edit in one click.",
    eyebrow: "Resume Example",
    h1: "IT Support Technician Resume Example",
    sub: "A professionally written, ATS-optimised resume example for IT Support Technicians. Edit every line and download as PDF or DOCX — free.",
    keywords: "IT support technician resume example, IT technician resume sample, help desk resume example, IT support cv example",
    resumeCard: rcGeneric({
      name: "Daniel Park", title: "IT Support Technician | CompTIA A+ | ITIL Foundation",
      email: "daniel.park@email.com", city: "Dallas, TX",
      skills: ["CompTIA A+", "Windows 10/11", "Active Directory", "Microsoft 365", "ITIL Foundation", "ServiceNow", "TCP/IP", "Hardware Troubleshooting", "Remote Support"],
      jobs: [
        { role: "IT Support Technician", company: "FinanceCo Group", date: "Jan 2023 – Present",
          desc: "Provide L1/L2 technical support to 280 employees. Resolved 98% of tickets within SLA. Built an onboarding checklist that cut new employee setup time from 4 hours to 90 minutes." },
        { role: "IT Help Desk Agent", company: "TechStart Ltd", date: "Aug 2021 – Dec 2022",
          desc: "Managed 60+ daily tickets via ServiceNow. Maintained 96% CSAT score. Deployed 45 workstations during an office relocation with zero downtime." },
      ],
      edu: [{ degree: "A.Sc. Computer Information Systems", school: "Dallas Community College", date: "2019 – 2021" }],
    }),
    features: {
      heading: "How to write an IT Support Technician resume",
      intro: "An effective IT Support Technician resume leads with certifications, quantifies SLA metrics, and lists every tool and OS you've worked with.",
      ctaHeading: "Use this IT Support Technician template free",
      ctaSub: "Edit every section and download as PDF or DOCX instantly.",
      items: [
        { icon: "🏅", title: "Certifications in the Header", body: "Put CompTIA A+, ITIL, or Microsoft certs directly after your name in the header so they're seen immediately." },
        { icon: "📊", title: "SLA & CSAT Metrics", body: "First-call resolution %, average handle time, CSAT score, ticket volume — these numbers tell the story of your performance." },
        { icon: "🛠️", title: "Technical Skills Section", body: "List operating systems, ticketing tools, remote desktop software, networking basics, and security tools." },
        { icon: "💡", title: "Problem-Solving Examples", body: "Describe specific issues you resolved — the more concrete and unusual, the more memorable your resume." },
        { icon: "📝", title: "Documentation Contributions", body: "If you wrote KB articles or SOPs, mention them. It shows initiative beyond ticket resolution." },
        { icon: "🎓", title: "Include Ongoing Learning", body: "Self-study, online courses (Udemy, Coursera, Microsoft Learn), and lab work show ambition and continuous improvement." },
      ],
    },
    faqs: [
      { q: "What should an IT Support Technician resume include?", a: "Contact info, professional summary, technical skills, work experience with SLA metrics, education, and certifications. List every tool and OS you've used professionally." },
      { q: "How do I get an IT support job with no experience?", a: "Obtain a CompTIA A+ certification, build a home lab, and apply for internships, apprenticeships, or junior help desk roles. Include any volunteer IT work and personal projects." },
      { q: "What is a CompTIA A+ certification and is it worth getting?", a: "CompTIA A+ is the most widely recognised entry-level IT certification. It validates hardware, software, and troubleshooting knowledge and is required or preferred by many employers. It is worth getting for anyone starting in IT support." },
      { q: "How much do IT Support Technicians earn?", a: "In the US, IT Support Technicians earn $40,000–$65,000 per year on average. Certifications, specialisations, and location significantly affect salary." },
    ],
  },
  {
    slug: "help-desk-analyst-resume",
    canonicalPath: "/examples/help-desk-analyst-resume/",
    title: "Help Desk Analyst Resume Example — Free Template | ApplyCraft",
    description: "Free Help Desk Analyst resume example with ATS-friendly formatting. Highlights ticketing systems, SLA metrics, and technical skills. Edit and download free.",
    eyebrow: "Resume Example",
    h1: "Help Desk Analyst Resume Example",
    sub: "A complete, ATS-optimised Help Desk Analyst resume example. Edit every section and export as PDF or DOCX — free, no sign-up required.",
    keywords: "help desk analyst resume example, help desk resume sample, IT help desk cv, service desk analyst resume",
    resumeCard: rcGeneric({
      name: "Sophia Williams", title: "Help Desk Analyst | ITIL Foundation | Microsoft 365",
      email: "sophia.williams@email.com", city: "Denver, CO",
      skills: ["ITIL Foundation", "ServiceNow", "Jira Service Management", "Microsoft 365 Admin", "Azure AD", "Windows 10/11", "Remote Desktop", "Incident Management", "CSAT Optimisation"],
      jobs: [
        { role: "Help Desk Analyst", company: "InsuranceGroup", date: "Jun 2022 – Present",
          desc: "Handle 75 tickets/day via phone, email, and chat. Achieved 99% SLA compliance and 4.9/5 CSAT. Authored 18 knowledge base articles reducing repeat tickets by 22%." },
        { role: "Junior Help Desk Technician", company: "City Council IT Dept.", date: "2020 – 2022",
          desc: "Provided L1 support to 400+ municipal employees. Completed Windows 10 migration for 120 workstations over 3 months with no critical incidents." },
      ],
      edu: [{ degree: "B.Sc. Information Systems", school: "University of Colorado", date: "2016 – 2020" }],
    }),
    features: {
      heading: "Help Desk Analyst resume tips",
      intro: "Hiring managers for Help Desk Analyst roles want to see measurable performance, a broad toolset, and clear communication skills.",
      ctaHeading: "Use this Help Desk Analyst template free",
      ctaSub: "Edit, download as PDF or DOCX, and apply today.",
      items: [
        { icon: "📊", title: "Ticket Volume & SLA Compliance", body: "State your average daily/weekly ticket volume and your SLA compliance rate. These are the primary KPIs for help desk roles." },
        { icon: "🛠️", title: "ITSM Tool Proficiency", body: "ServiceNow, Jira Service Management, Freshservice, Zendesk — hiring managers filter by specific tools, so list them all." },
        { icon: "🔄", title: "Incident & Change Management", body: "Experience with the ITIL incident, change, and problem management processes is valued at mid and senior help desk levels." },
        { icon: "📞", title: "Multi-Channel Support", body: "Phone, email, chat, self-service portal — specify the channels you've handled and your relative volume on each." },
        { icon: "📝", title: "Knowledge Base Contributions", body: "Creating and maintaining KB articles directly reduces ticket volume. Quantify your contribution (articles written, views, ticket deflection)." },
        { icon: "🎓", title: "ITIL Certification", body: "ITIL 4 Foundation is the most relevant certification for help desk analysts. It demonstrates understanding of ITSM best practices." },
      ],
    },
    faqs: [
      { q: "What is the difference between a Help Desk Analyst and an IT Support Technician?", a: "A Help Desk Analyst typically works in a structured ITIL environment with formal SLAs, ticket management, and reporting responsibilities. An IT Support Technician often has a broader, more hands-on role including hardware repair and on-site support." },
      { q: "What ITIL skills should I list on a Help Desk resume?", a: "Incident management, problem management, change management, and service request fulfilment are the core ITIL processes relevant to help desk roles." },
      { q: "How do I write a Help Desk resume objective?", a: "Write a 2–3 sentence summary that includes your years of experience, your top tools (e.g., ServiceNow), your strongest metric (e.g., 98% SLA compliance), and the type of role you're seeking." },
      { q: "Is an ITIL certification worth getting for help desk roles?", a: "Yes. ITIL 4 Foundation is quick to obtain (a few days of study), widely recognised, and expected by many enterprise employers. It demonstrates commitment to professional ITSM standards." },
    ],
  },
  {
    slug: "customer-service-resume",
    canonicalPath: "/examples/customer-service-resume/",
    title: "Customer Service Resume Example — Free Template | ApplyCraft",
    description: "Free customer service resume example with CSAT metrics, CRM skills, and ATS-friendly formatting. Download as PDF or DOCX instantly.",
    eyebrow: "Resume Example",
    h1: "Customer Service Resume Example",
    sub: "A professionally written customer service resume example — complete with CSAT scores, CRM tools, and a skills section tailored for service roles. Edit and download free.",
    keywords: "customer service resume example, customer service cv sample, call center resume example, customer support resume template",
    resumeCard: rcGeneric({
      name: "Elena Rodriguez", title: "Customer Service Team Lead",
      email: "elena.rodriguez@email.com", city: "Houston, TX",
      skills: ["Zendesk", "Salesforce CRM", "Live Chat", "Conflict Resolution", "Team Leadership", "KPI Reporting", "Spanish (Native)", "English (Fluent)", "Upselling / Retention"],
      jobs: [
        { role: "Customer Service Team Lead", company: "TeleServ Inc.", date: "Mar 2022 – Present",
          desc: "Lead a team of 12 agents supporting 1,200+ customers daily. Improved team CSAT from 88% to 96% in 6 months through coaching and quality reviews." },
        { role: "Senior Customer Service Agent", company: "EcommerceXL", date: "2019 – 2022",
          desc: "Handled 90+ contacts/day via phone, email, and chat. Ranked #1 in team for upsell conversion (14% conversion rate vs. 6% team average). Zero escalations in 18 months." },
      ],
      edu: [{ degree: "B.A. Psychology", school: "University of Houston", date: "2015 – 2019" }],
    }),
    features: {
      heading: "Customer service resume writing tips",
      intro: "The best customer service resumes combine measurable performance data with clear evidence of interpersonal and problem-solving skills.",
      ctaHeading: "Use this customer service resume template free",
      ctaSub: "ATS-friendly, professional, and completely free to download.",
      items: [
        { icon: "📊", title: "CSAT & NPS Are Your Numbers", body: "Customer satisfaction score, net promoter score, and first contact resolution rate are the metrics hiring managers look for." },
        { icon: "🌍", title: "Languages Are a Superpower", body: "Bilingual and multilingual agents are in extremely high demand. Lead with your languages if you speak more than one." },
        { icon: "🛠️", title: "CRM & Support Tool Skills", body: "Zendesk, Salesforce Service Cloud, Freshdesk, Intercom — list the platforms you've used and your proficiency level." },
        { icon: "🏆", title: "Awards & Rankings", body: "Agent of the month, top CSAT, top conversion — any formal recognition belongs in your experience or a separate Achievements section." },
        { icon: "🤝", title: "Leadership Experience", body: "Mentored new agents? Led team meetings? Handled escalations? These demonstrate readiness for team lead and supervisory roles." },
        { icon: "📞", title: "Contact Volume & Channels", body: "Specify how many contacts you handled per day/week and through which channels (phone, email, chat, social media)." },
      ],
    },
    faqs: [
      { q: "What skills are most important on a customer service resume?", a: "CRM tools (Zendesk, Salesforce), communication channels (phone, chat, email), CSAT/NPS metrics, conflict resolution, active listening, and any second language you speak." },
      { q: "How do I write a customer service resume summary?", a: "Include your years of experience, your top metric (e.g., 96% CSAT), your strongest skill or specialisation (bilingual, retention, upselling), and the type of role you're targeting." },
      { q: "Should I tailor my customer service resume for each job?", a: "Yes. Mirror the language in the job posting — if they say 'client experience specialist', use that exact phrase rather than 'customer service agent'." },
      { q: "What is the average salary for customer service roles?", a: "In the US, customer service representatives earn $35,000–$55,000 on average. Team leads and managers can earn $50,000–$80,000. Bilingual agents typically earn 10–20% more." },
    ],
  },
  {
    slug: "linux-administrator-resume",
    canonicalPath: "/examples/linux-administrator-resume/",
    title: "Linux Administrator Resume Example — Free Template | ApplyCraft",
    description: "Free Linux Administrator resume example with shell scripting, Ansible, Docker, and AWS skills. ATS-friendly template. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Linux Administrator Resume Example",
    sub: "A complete Linux Administrator resume with real-world infrastructure skills, automation examples, and certification highlights. Edit everything and download free.",
    keywords: "linux administrator resume example, linux sysadmin resume sample, linux admin cv example, RHEL resume, linux engineer resume",
    resumeCard: rcGeneric({
      name: "Marcus Johnson", title: "Linux Administrator | RHCSA | AWS Certified SysOps",
      email: "marcus.johnson@email.com", city: "Portland, OR",
      skills: ["RHEL 8/9", "Ubuntu 22.04 LTS", "Bash Scripting", "Python", "Ansible", "Docker / Podman", "Kubernetes (K3s)", "AWS (EC2, S3, IAM)", "Terraform", "Prometheus / Grafana", "Git / GitLab CI"],
      jobs: [
        { role: "Linux Administrator", company: "StreamingMedia Corp", date: "Feb 2021 – Present",
          desc: "Administer 400+ RHEL and Ubuntu servers across AWS and on-premises. Implemented Ansible automation reducing patching time from 3 days to 4 hours. Maintained 99.95% uptime across production infrastructure." },
        { role: "Junior Linux Administrator", company: "HostingProviderX", date: "2018 – 2021",
          desc: "Managed shared and dedicated Linux hosting environments for 2,000+ client websites. Responded to and resolved 200+ hosting-related incidents/month with average 22-minute resolution time." },
      ],
      edu: [{ degree: "B.Sc. Network Engineering", school: "Oregon State University", date: "2014 – 2018" }],
    }),
    features: {
      heading: "Linux Administrator resume tips",
      intro: "Linux administrator hiring managers are highly technical. Your resume needs to be specific, metric-driven, and demonstrate both breadth and depth of Linux expertise.",
      ctaHeading: "Use this Linux Administrator template free",
      ctaSub: "Download as PDF or DOCX and apply for your next Linux role today.",
      items: [
        { icon: "🐧", title: "List Distros and Versions", body: "RHEL 8/9, Ubuntu 22.04 LTS, Debian 12 — specificity matters. Vague 'Linux experience' is less credible than named versions." },
        { icon: "📜", title: "Showcase Automation Projects", body: "Name the Ansible playbooks, Bash scripts, or Terraform configs you've built. Include the scale (servers affected) and impact (hours saved)." },
        { icon: "📊", title: "Uptime Percentage Front and Centre", body: "99.9%, 99.95%, 99.99% — uptime is the primary KPI for Linux admins. If you've maintained high availability, lead with it." },
        { icon: "🔒", title: "Security Hardening Experience", body: "CIS benchmark compliance, SELinux policy management, vulnerability scanning (Nessus, OpenVAS), and patch management experience are highly valued." },
        { icon: "🐳", title: "Container & Orchestration Skills", body: "Docker, Podman, Kubernetes, and Helm are increasingly expected in Linux admin roles. Even basic containerisation experience is valuable." },
        { icon: "🏅", title: "RHCSA / RHCE Certification", body: "Red Hat certifications are the most respected Linux credentials. If you have RHCSA or RHCE, put it directly after your name." },
      ],
    },
    faqs: [
      { q: "What should I put in a Linux admin skills section?", a: "Distributions (RHEL, Ubuntu, Debian), scripting languages (Bash, Python), automation tools (Ansible, Terraform, Puppet), containers (Docker, Kubernetes), monitoring (Prometheus, Nagios, Grafana), cloud platforms, and security tools." },
      { q: "Is RHCSA worth listing on a Linux admin resume?", a: "Absolutely. RHCSA is the most recognised Linux certification and is required or strongly preferred by many enterprise employers, particularly in regulated industries (finance, healthcare, government)." },
      { q: "How do I show DevOps experience on a Linux admin resume?", a: "List CI/CD tools (Jenkins, GitLab CI, GitHub Actions), IaC tools (Terraform, Ansible), container platforms (Docker, Kubernetes), and any DevOps metrics (deployment frequency, change failure rate, MTTR)." },
      { q: "What is the salary for a Linux administrator?", a: "In the US, Linux administrators earn $75,000–$130,000 on average. Senior admins and DevOps engineers with cloud certifications can earn $130,000–$180,000+." },
    ],
  },
  {
    slug: "entry-level-resume",
    canonicalPath: "/examples/entry-level-resume/",
    title: "Entry-Level Resume Example With No Experience | ApplyCraft",
    description: "Free entry-level resume example for candidates with no work experience. Highlights education, projects, and transferable skills. Edit and download as PDF.",
    eyebrow: "Resume Example",
    h1: "Entry-Level Resume Example — No Experience",
    sub: "A complete entry-level resume example that shows how to highlight education, projects, volunteer work, and transferable skills when you have little or no work experience.",
    keywords: "entry level resume example, resume no experience, first resume, graduate resume example, student resume no experience",
    resumeCard: rcGeneric({
      name: "Jamie Kim", title: "Business Administration Graduate | Seeking Marketing Coordinator Role",
      email: "jamie.kim@email.com", city: "Atlanta, GA",
      skills: ["Microsoft Excel", "Canva", "Google Analytics (beginner)", "Social Media Management", "Content Writing", "Market Research", "HubSpot Academy (certified)", "Project Coordination"],
      jobs: [
        { role: "Marketing Intern (part-time)", company: "LocalBrand Agency", date: "Jan – May 2025",
          desc: "Assisted with social media scheduling for 4 client accounts (combined 12k followers). Created 20+ Canva graphics per month and wrote weekly blog content. Email open rate improved 8% during campaign." },
        { role: "Campus Brand Ambassador", company: "SpotifyU Programme", date: "Sep 2023 – Dec 2024",
          desc: "Promoted Spotify Student plans on campus through events and social media. Recruited 140 new subscribers over two semesters, exceeding target by 40%." },
      ],
      edu: [{ degree: "B.B.A. Marketing (GPA 3.7 / 4.0)", school: "Georgia State University", date: "2021 – 2025" }],
    }),
    features: {
      heading: "How to write an entry-level resume with no experience",
      intro: "Everyone starts somewhere. An entry-level resume is about transferable skills, academic achievements, and potential — not just work history.",
      ctaHeading: "Build your entry-level resume free",
      ctaSub: "Templates designed for students, graduates, and career changers.",
      items: [
        { icon: "🎓", title: "Education Goes at the Top", body: "For entry-level candidates, education is your primary credential. Include your GPA if above 3.5, relevant coursework, and any academic awards." },
        { icon: "🏆", title: "Internships Count as Experience", body: "Any internship — paid or unpaid — goes in your Experience section. Treat it like a real job and quantify your contributions." },
        { icon: "🧪", title: "Academic & Personal Projects", body: "Class projects, capstone work, personal apps, websites, blogs, or research papers all demonstrate practical skills." },
        { icon: "🤝", title: "Volunteer Work & Leadership", body: "Club president, event organiser, volunteer coordinator — these roles show leadership, initiative, and soft skills." },
        { icon: "📊", title: "Quantify Everything You Can", body: "Even small numbers matter: events attended, volunteers coordinated, posts published, donations raised. Numbers make accomplishments real." },
        { icon: "🎯", title: "A Tailored Skills Section", body: "Align your skills directly with the job posting. Use the exact keywords they use — ATS systems and hiring managers both respond to it." },
      ],
    },
    faqs: [
      { q: "How do I write a resume when I have no work experience?", a: "Include your education, GPA (if strong), relevant coursework, internships, part-time work, volunteer experience, extracurricular activities, and personal or academic projects. Use action verbs and quantify wherever possible." },
      { q: "Should I include part-time jobs like retail or food service on my resume?", a: "Yes, absolutely. Any paid work demonstrates reliability, time management, and customer or teamwork skills. These are valuable transferable skills employers look for." },
      { q: "What is a good objective statement for an entry-level resume?", a: "Replace an objective with a professional summary: 2 sentences describing your degree, top skills, and the type of role you're seeking. Example: 'Business Administration graduate with a 3.7 GPA and hands-on marketing internship experience. Seeking a Marketing Coordinator role where I can apply data-driven content strategy skills.'" },
      { q: "How long should an entry-level resume be?", a: "One page, always. Focus on quality over quantity — your three best experiences in detail beat a long list of thin bullet points." },
    ],
  },
  {
    slug: "french-cv-example",
    canonicalPath: "/examples/french-cv-example/",
    title: "French CV Example — Modèle de CV Français | ApplyCraft",
    description: "Téléchargez un exemple de CV français professionnel. Format chronologique inversé, mise en page épurée. Modifiez et exportez en PDF gratuitement.",
    eyebrow: "Exemple de CV",
    h1: "Exemple de CV Français — Modèle Complet",
    sub: "Un exemple complet de CV en français avec le bon format, la bonne structure et les bons intitulés de section pour le marché de l'emploi francophone.",
    keywords: "exemple cv français, modèle cv français, cv professionnel français, exemple de curriculum vitae, cv en français gratuit",
    resumeCard: `<div class="resume-card">
  <div class="rc-header" style="border-color:#6366F1">
    <div class="rc-name">Thomas Lecomte</div>
    <div class="rc-title">Ingénieur Logiciel Senior</div>
    <div class="rc-contact"><span>thomas.lecomte@email.fr</span><span class="contact-separator" aria-hidden="true"> · </span><span>+33 6 12 34 56 78</span><span class="contact-separator" aria-hidden="true"> · </span><span>Lyon, France</span></div>
  </div>
  <div class="rc-body">
    <div class="rc-side">
      <div class="rc-section-title" style="margin-top:0">Compétences Techniques</div>
      <div class="rc-skills">
        <span class="rc-skill">Python</span>
        <span class="rc-skill">React</span>
        <span class="rc-skill">PostgreSQL</span>
        <span class="rc-skill">Docker</span>
        <span class="rc-skill">AWS</span>
        <span class="rc-skill">CI/CD</span>
      </div>
      <div class="rc-section-title" style="margin-top:16px">Langues</div>
      <div class="rc-item-desc">${inlineList(["Français (langue maternelle)", "Anglais (C1 — TOEIC 960)", "Espagnol (B1)"])}</div>
      <div class="rc-section-title" style="margin-top:16px">Centres d'intérêt</div>
      <div class="rc-item-desc">Développement open-source (200+ commits GitHub)<br/>Running (Marathon de Lyon 2024)</div>
    </div>
    <div class="rc-main">
      <div class="rc-section-title" style="margin-top:0">Expérience Professionnelle</div>
      <div class="rc-item">
        <div class="rc-item-title">Ingénieur Logiciel Senior</div>
        <div class="rc-item-sub">Sopra Steria, Lyon</div>
        <div class="rc-item-date">Septembre 2021 – Présent</div>
        <div class="rc-item-desc">Conception et développement d'une API RESTful traitant 5 millions de requêtes/jour. Réduction du temps de réponse de 40 % grâce à l'optimisation des requêtes PostgreSQL.</div>
      </div>
      <div class="rc-item">
        <div class="rc-item-title">Développeur Full-Stack</div>
        <div class="rc-item-sub">Startup GreenTech, Paris</div>
        <div class="rc-item-date">2018 – 2021</div>
        <div class="rc-item-desc">Développement de l'interface React et du back-end Node.js pour une plateforme SaaS avec 8 000 utilisateurs actifs.</div>
      </div>
      <div class="rc-section-title" style="margin-top:12px">Formation</div>
      <div class="rc-item">
        <div class="rc-item-title">Diplôme d'Ingénieur — Informatique</div>
        <div class="rc-item-sub">INSA Lyon</div>
        <div class="rc-item-date">2013 – 2018</div>
      </div>
    </div>
  </div>
</div>`,
    features: {
      heading: "Structure d'un CV français professionnel",
      intro: "Le CV français a des conventions précises qui diffèrent des formats anglo-saxons. Voici ce qu'il faut inclure et éviter.",
      ctaHeading: "Créer votre CV en français maintenant",
      ctaSub: "Modifiez cet exemple et téléchargez votre CV en PDF — gratuitement.",
      items: [
        { icon: "📋", title: "En-tête avec coordonnées complètes", body: "Nom, prénom, téléphone, e-mail, ville (adresse complète facultative). LinkedIn est apprécié dans les secteurs tech et finance." },
        { icon: "📅", title: "Ordre chronologique inversé", body: "Commencez par votre expérience la plus récente. C'est le format standard pour les recruteurs français." },
        { icon: "📸", title: "Photo : facultative mais courante", body: "La photo est facultative en France mais souvent incluse. Elle doit être professionnelle — pas une photo de profil de réseau social." },
        { icon: "🎯", title: "Accroche personnalisée", body: "2 à 3 phrases en début de CV présentant votre profil, vos compétences clés et votre objectif. De plus en plus attendue par les recruteurs français." },
        { icon: "🏆", title: "Centres d'intérêt — oui ou non ?", body: "Les centres d'intérêt sont courants sur les CV français, surtout pour les profils juniors. Choisissez-en 2 à 3 qui reflètent des compétences transférables." },
        { icon: "📏", title: "Une page pour les profils juniors", body: "Moins de 10 ans d'expérience = une page maximum. Les recruteurs passent en moyenne 30 secondes sur chaque CV." },
      ],
    },
    faqs: [
      { q: "Quelle est la structure idéale d'un CV français ?", a: "En-tête (coordonnées + titre de poste), accroche optionnelle, expériences professionnelles (chronologie inversée), formation, compétences, langues, et centres d'intérêt. Une page pour les juniors, deux pages maximum pour les seniors." },
      { q: "Doit-on mettre son âge sur un CV français ?", a: "Non. La date de naissance n'est plus requise sur les CV français. L'inclure peut exposer à la discrimination par l'âge. Indiquez uniquement votre niveau d'expérience via les dates de vos postes." },
      { q: "Faut-il mettre sa photo sur un CV français ?", a: "C'est facultatif et à la discrétion du candidat. Dans les secteurs tech, la photo est de moins en moins attendue. Dans les secteurs commerce et relation client, elle reste courante." },
      { q: "Comment rédiger une bonne accroche de CV en français ?", a: "2 à 3 phrases maximum décrivant votre profil (e.g. 'Ingénieur logiciel avec 7 ans d'expérience en développement Python et React'), votre valeur ajoutée principale, et votre objectif professionnel." },
    ],
  },
  {
    slug: "canadian-resume-format",
    canonicalPath: "/examples/canadian-resume-format/",
    title: "Canadian Resume Format — Example & Template | ApplyCraft",
    description: "Download a complete Canadian resume example. No photo, no age, reverse-chronological format with professional summary. ATS-friendly, free to download.",
    eyebrow: "Resume Example",
    h1: "Canadian Resume Format — Complete Example",
    sub: "A full Canadian resume example following all Canadian formatting conventions: no photo, no age, reverse-chronological order, professional summary, and quantified achievements.",
    keywords: "canadian resume format, canadian resume example, resume format canada, canadian cv template, how to write a canadian resume",
    resumeCard: rcGeneric({
      name: "Olivia MacDonald", title: "Project Manager | PMP Certified",
      email: "olivia.macdonald@email.ca", city: "Vancouver, BC",
      skills: ["PMP Certified", "Agile / Scrum", "MS Project", "Risk Management", "Stakeholder Engagement", "Budget Management", "Jira", "Confluence"],
      jobs: [
        { role: "Senior Project Manager", company: "BC Infrastructure Corp", date: "Apr 2021 – Present",
          desc: "Delivered 4 infrastructure projects totalling $18M on time and within budget. Led cross-functional teams of up to 22 members across technical and non-technical disciplines." },
        { role: "Project Manager", company: "Telus Business Solutions", date: "2017 – 2021",
          desc: "Managed 9 concurrent IT implementation projects for enterprise clients. Reduced scope creep incidents by 30% through enhanced change-control processes." },
      ],
      edu: [{ degree: "B.B.A. Operations Management", school: "Simon Fraser University", date: "2013 – 2017" }],
    }),
    features: {
      heading: "Canadian resume format — key rules",
      intro: "The Canadian resume format follows specific conventions that differ from UK CVs and US resumes. Here's a quick reference.",
      ctaHeading: "Build your Canadian resume free",
      ctaSub: "Templates tailored to Canadian employer expectations. No sign-up required.",
      items: [
        { icon: "📸", title: "No Photo", body: "Never include a photo on a Canadian resume. Canadian human rights law prohibits hiring decisions based on physical appearance." },
        { icon: "🚫", title: "No Age, Race, or Marital Status", body: "These are protected characteristics. Do not include date of birth, SIN, ethnicity, or marital status." },
        { icon: "🏙️", title: "City and Province Only", body: "Do not include a full street address. City and province is standard: 'Vancouver, BC' or 'Toronto, ON'." },
        { icon: "📋", title: "Professional Summary at the Top", body: "A 2–3 sentence professional summary is standard in Canada. It helps recruiters quickly assess your fit without reading the whole document." },
        { icon: "📏", title: "1–2 Pages", body: "One page for under 10 years of experience. Two pages for senior professionals. Three pages is too long for any Canadian application." },
        { icon: "📊", title: "Quantified Bullets Required", body: "Canadian employers strongly favour data-driven bullet points. Every achievement should include a number: %, $, time, volume, or headcount." },
      ],
    },
    faqs: [
      { q: "What is the standard Canadian resume format?", a: "Header (name, phone, email, city/province, LinkedIn), professional summary, work experience in reverse-chronological order, education, skills, and optional certifications. No photo, no age, no full address." },
      { q: "How is a Canadian resume different from a UK CV?", a: "Canadian resumes are typically 1–2 pages (UK CVs can be longer for senior roles), don't include a photo (UK CVs sometimes do), and place more emphasis on quantified achievements over responsibilities." },
      { q: "Should I include a LinkedIn URL on a Canadian resume?", a: "Yes. Including a professional LinkedIn URL is standard and expected in Canada, particularly in corporate, technology, and finance sectors." },
      { q: "Do I need to include references on a Canadian resume?", a: "No. 'References available upon request' is considered outdated. Never use space on your resume for references — they'll ask for them separately if needed." },
    ],
  },
  {
    slug: "uk-cv-format",
    canonicalPath: "/examples/uk-cv-format/",
    title: "UK CV Format — Example & Template | ApplyCraft",
    description: "Download a professional UK CV example. Reverse-chronological, 2-page format with personal statement. ATS-friendly British CV template. Free, no sign-up.",
    eyebrow: "UK CV Example",
    h1: "UK CV Format — Example & Template",
    sub: "A complete British CV example following UK employer expectations: personal statement, reverse-chronological experience, references available on request, and tailored language.",
    keywords: "UK cv format, british cv template, uk cv example, how to write a cv uk, cv format united kingdom, curriculum vitae uk",
    resumeCard: rcGeneric({
      name: "James Whitfield", title: "Operations Manager",
      email: "james.whitfield@email.co.uk", city: "Manchester, UK",
      skills: ["Operations Management", "P&L Accountability", "Lean / Six Sigma (Green Belt)", "Supplier Management", "SAP ERP", "Team Leadership", "Budget Planning", "Continuous Improvement"],
      jobs: [
        { role: "Operations Manager", company: "Northern Manufacturing Ltd", date: "Sep 2020 – Present",
          desc: "Responsible for a £4.2M annual production budget and a team of 38 operatives. Reduced waste by 18% and improved OEE from 72% to 84% through Lean Six Sigma initiatives." },
        { role: "Production Supervisor", company: "UK Industrial Group", date: "2016 – 2020",
          desc: "Supervised day and night shifts of 15 operatives across two production lines. Achieved 99.1% on-time delivery against a KPI target of 97%." },
      ],
      edu: [{ degree: "B.Eng. Mechanical Engineering (2:1)", school: "University of Manchester", date: "2012 – 2016" }],
    }),
    features: {
      heading: "UK CV format — what British employers expect",
      intro: "The British CV has specific conventions that differ from American resumes and other international formats. Here's what UK hiring managers look for.",
      ctaHeading: "Build your UK CV free",
      ctaSub: "British-format templates, PDF & DOCX export, and multilingual writing support. Free.",
      items: [
        { icon: "📄", title: "Two Pages is Standard", body: "Unlike in the US where one page is preferred, UK CVs are typically 2 pages for anyone with more than 3 years of experience." },
        { icon: "👤", title: "Personal Statement at the Top", body: "A 3–4 sentence personal statement (sometimes called a professional profile) is standard at the top of a UK CV." },
        { icon: "📸", title: "No Photo Required", body: "UK CVs do not typically include a photo. Including one can expose you to appearance-based discrimination and is generally discouraged." },
        { icon: "🏠", title: "Address is Optional", body: "A full postal address used to be standard but is now optional. Including your town or city is sufficient." },
        { icon: "🎓", title: "A-Levels and GCSEs for Graduates", body: "UK graduates typically include A-level subjects and grades, and sometimes GCSE results in English and Maths." },
        { icon: "📋", title: "Hobbies & Interests Section", body: "A brief hobbies section is more common in UK CVs than in US resumes. Keep it to 2–3 lines and link interests to professional skills where possible." },
      ],
    },
    faqs: [
      { q: "What is the standard UK CV format?", a: "Personal statement, work experience in reverse-chronological order, education (including A-levels and GCSEs for graduates), skills, and optionally hobbies/interests. No photo, no nationality, no NI number. Typically 2 pages." },
      { q: "Should I include a personal statement on a UK CV?", a: "Yes. A 3–4 sentence personal statement at the top of your CV is standard practice in the UK. It should summarise your experience, key skills, and career objective." },
      { q: "What is the difference between a CV and a resume in the UK?", a: "In the UK, 'CV' and 'resume' are used interchangeably, but 'CV' is the dominant term. UK CVs are typically 2 pages versus the US preference for 1 page, and include a personal statement and sometimes hobbies." },
      { q: "Should I include references on a UK CV?", a: "Modern UK CVs include the phrase 'References available on request' at the bottom or simply omit the references section entirely. Do not include actual reference details unless specifically asked." },
    ],
  },
  {
    slug: "software-engineer-resume",
    canonicalPath: "/examples/software-engineer-resume/",
    title: "Software Engineer Resume Example — Free Template | ApplyCraft",
    description: "Free software engineer resume example with an ATS-friendly layout, quantified impact, and a modern tech stack. Edit every line and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Software Engineer Resume Example",
    sub: "A professionally written, ATS-optimised software engineer resume example with quantified achievements and a clear tech stack. Edit and download free — no sign-up.",
    keywords: "software engineer resume example, software developer resume sample, programmer resume template, full stack engineer cv example",
    resumeCard: rcGeneric({
      name: "Marcus Chen", title: "Senior Software Engineer",
      email: "marcus.chen@email.com", city: "Seattle, WA",
      skills: ["TypeScript", "React", "Node.js", "Python", "Go", "PostgreSQL", "AWS", "Docker", "Kubernetes", "CI/CD", "GraphQL", "System Design"],
      jobs: [
        { role: "Senior Software Engineer", company: "Northwind Cloud", date: "2021 – Present",
          desc: "Led the redesign of a payments service handling $40M/month, cutting p99 latency from 800ms to 180ms. Mentored 4 engineers and introduced a code-review SLA that reduced PR cycle time by 35%." },
        { role: "Software Engineer", company: "BrightApps Inc.", date: "2018 – 2021",
          desc: "Built a React/Node analytics dashboard used by 25k daily users. Migrated a monolith to 6 microservices, improving deploy frequency from weekly to 20+ times per day." },
      ],
      edu: [{ degree: "B.Sc. Computer Science", school: "University of Washington", date: "2014 – 2018" }],
    }),
    features: {
      heading: "How to write a software engineer resume",
      intro: "Strong software engineer resumes pair a focused tech stack with quantified, outcome-driven bullet points — not a list of every task you performed.",
      ctaHeading: "Use this software engineer template free",
      ctaSub: "Edit every section and download as PDF or DOCX instantly.",
      items: [
        { icon: "📊", title: "Quantify Your Impact", body: "Lead bullets with results: latency reduced, users served, revenue affected, deploy frequency. Numbers separate strong resumes from generic ones." },
        { icon: "🧰", title: "A Focused Tech Stack", body: "List languages, frameworks, databases, and cloud tools you can speak to in an interview — not everything you've ever touched once." },
        { icon: "🏗️", title: "Show System-Level Work", body: "Architecture decisions, scaling, migrations, and reliability work signal seniority more than feature counts." },
        { icon: "🔗", title: "Link GitHub & Portfolio", body: "A GitHub profile or portfolio with real, readable projects is powerful evidence — include the URL in your header." },
        { icon: "🤝", title: "Mention Collaboration", body: "Code review, mentoring, cross-team work, and on-call show you operate well inside an engineering organisation." },
        { icon: "✅", title: "Keep It ATS-Readable", body: "Use a single-column, standard-heading layout so applicant tracking systems parse your skills and titles correctly." },
      ],
    },
    faqs: [
      { q: "What should a software engineer resume include?", a: "A short summary, a focused technical skills section, work experience with quantified achievements, education, and links to your GitHub or portfolio. Keep it to one page early-career and up to two pages for senior roles." },
      { q: "How do I make a software engineer resume ATS-friendly?", a: "Use a single-column layout, standard section headings (Experience, Skills, Education), real text rather than images, and include the exact technologies named in the job description." },
      { q: "Should I list every programming language I know?", a: "No. List the languages and tools you're confident discussing in an interview, and group them logically. A focused stack reads as stronger than an exhaustive, shallow list." },
      { q: "How long should a software engineer resume be?", a: "One page for students and engineers with under ~7 years of experience; two pages is acceptable for senior and staff-level engineers with significant relevant history." },
    ],
  },
  {
    slug: "project-manager-resume",
    canonicalPath: "/examples/project-manager-resume/",
    title: "Project Manager Resume Example — Free Template | ApplyCraft",
    description: "Free project manager resume example with quantified delivery metrics, methodologies, and ATS-friendly formatting. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Project Manager Resume Example",
    sub: "An ATS-optimised project manager resume example showcasing budgets, timelines, and delivery outcomes. Edit every line and export as PDF or DOCX — free.",
    keywords: "project manager resume example, project management resume sample, PMP resume template, IT project manager cv example",
    resumeCard: rcGeneric({
      name: "Elena Rossi", title: "Senior Project Manager | PMP | Certified Scrum Master",
      email: "elena.rossi@email.com", city: "Chicago, IL",
      skills: ["Agile / Scrum", "Waterfall", "Stakeholder Management", "Budgeting", "Risk Management", "Jira", "MS Project", "Confluence", "Roadmapping", "Vendor Management"],
      jobs: [
        { role: "Senior Project Manager", company: "Meridian Solutions", date: "2020 – Present",
          desc: "Delivered a $4.2M ERP rollout across 5 departments on time and 8% under budget. Managed a cross-functional team of 18 and reduced project risk incidents by 40% with a new escalation framework." },
        { role: "Project Manager", company: "Apex Digital", date: "2016 – 2020",
          desc: "Ran 12 concurrent client projects with a 96% on-time delivery rate. Introduced Agile ceremonies that improved sprint predictability and lifted client CSAT from 4.1 to 4.7/5." },
      ],
      edu: [{ degree: "B.B.A. Business Administration", school: "DePaul University", date: "2012 – 2016" }],
    }),
    features: {
      heading: "How to write a project manager resume",
      intro: "Project manager resumes win on outcomes — budgets met, timelines hit, risks managed — backed by recognised methodologies and certifications.",
      ctaHeading: "Use this project manager template free",
      ctaSub: "Edit, then download as PDF or DOCX and apply today.",
      items: [
        { icon: "💰", title: "Lead With Budgets & Timelines", body: "State project size ($, headcount, scope) and outcome (on time, under budget). These are the first things hiring managers scan for." },
        { icon: "🏅", title: "Certifications Up Front", body: "PMP, PRINCE2, Certified Scrum Master, or PMI-ACP belong near your name — they're frequent filtering criteria." },
        { icon: "🔁", title: "Name Your Methodologies", body: "Agile, Scrum, Kanban, Waterfall, SAFe — specify what you've actually run, not just buzzwords." },
        { icon: "👥", title: "Show Stakeholder Scope", body: "Team size, departments, vendors, and executive stakeholders demonstrate the complexity you can handle." },
        { icon: "⚠️", title: "Risk & Change Management", body: "Concrete examples of risks identified and mitigated show you deliver under pressure, not just in ideal conditions." },
        { icon: "🛠️", title: "List Your Tools", body: "Jira, MS Project, Asana, Confluence, Smartsheet — tool proficiency is often an explicit requirement." },
      ],
    },
    faqs: [
      { q: "What should a project manager resume include?", a: "A results-focused summary, key methodologies and certifications, work experience quantified by budget, team size and delivery metrics, plus tools and education. Always tie achievements to business outcomes." },
      { q: "Do I need a PMP certification on my project manager resume?", a: "It's not mandatory, but PMP (or PRINCE2/CSM depending on region and industry) is widely requested and helps your resume pass both ATS keyword filters and recruiter screening." },
      { q: "How do I show project results without breaking confidentiality?", a: "Use relative figures and ranges — 'reduced cycle time by 30%' or 'managed a ~$4M budget' — rather than naming confidential clients or exact internal numbers." },
      { q: "Should a project manager resume be one or two pages?", a: "One page is ideal for under ~10 years of experience. Senior PMs with extensive, relevant delivery history can use two pages, keeping the most impressive projects on page one." },
    ],
  },
  {
    slug: "registered-nurse-resume",
    canonicalPath: "/examples/registered-nurse-resume/",
    title: "Registered Nurse Resume Example — Free Template | ApplyCraft",
    description: "Free registered nurse (RN) resume example with licences, certifications, and clinical skills in an ATS-friendly layout. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Registered Nurse Resume Example",
    sub: "A complete, ATS-optimised registered nurse resume example with licences, certifications, and clinical specialties. Edit every section and download free.",
    keywords: "registered nurse resume example, RN resume sample, nursing resume template, new grad nurse resume example",
    resumeCard: rcGeneric({
      name: "Aisha Johnson", title: "Registered Nurse, BSN, RN | BLS & ACLS Certified",
      email: "aisha.johnson@email.com", city: "Atlanta, GA",
      skills: ["Acute & Critical Care", "Patient Assessment", "IV Therapy", "EHR (Epic)", "Medication Administration", "BLS", "ACLS", "Care Planning", "Patient Education", "Wound Care"],
      jobs: [
        { role: "Registered Nurse — Medical/Surgical", company: "Grady Memorial Hospital", date: "2020 – Present",
          desc: "Provide direct care for up to 6 acute patients per shift on a 32-bed unit. Maintained a 98% medication-administration accuracy rate and precepted 7 new-grad nurses through onboarding." },
        { role: "Staff Nurse — Telemetry", company: "Piedmont Health", date: "2018 – 2020",
          desc: "Monitored cardiac patients and responded to rapid-response events. Contributed to a fall-prevention initiative that cut unit fall rates by 22% over 12 months." },
      ],
      edu: [{ degree: "Bachelor of Science in Nursing (BSN)", school: "Emory University", date: "2014 – 2018" }],
    }),
    features: {
      heading: "How to write a registered nurse resume",
      intro: "Nursing resumes are screened for licences, certifications, and clinical specialties first — make them impossible to miss, then back them with measurable patient-care outcomes.",
      ctaHeading: "Use this registered nurse template free",
      ctaSub: "Edit your licences and experience, then download as PDF or DOCX.",
      items: [
        { icon: "🪪", title: "Licences & Credentials First", body: "Place your RN licence, state, and certifications (BLS, ACLS, PALS) in the header so they're seen immediately by recruiters and ATS." },
        { icon: "🏥", title: "Specify Your Specialty & Setting", body: "Med/Surg, ICU, ER, telemetry, oncology — and the unit size, patient ratio, and acuity you handled." },
        { icon: "📊", title: "Quantify Patient Care", body: "Patient load per shift, medication accuracy, satisfaction (HCAHPS), and improvement initiatives turn duties into achievements." },
        { icon: "💻", title: "List EHR Systems", body: "Epic, Cerner, Meditech — electronic health record proficiency is a common explicit requirement." },
        { icon: "🎓", title: "Education & Continuing Ed", body: "Your BSN/ADN, plus any continuing education or specialty courses, signal commitment to clinical excellence." },
        { icon: "✅", title: "Keep Formatting ATS-Safe", body: "Hospitals rely heavily on ATS. Use clear headings and avoid tables or graphics that can scramble your credentials." },
      ],
    },
    faqs: [
      { q: "What should a registered nurse resume include?", a: "Your RN licence and state, certifications (BLS, ACLS, PALS), a clinical summary, specialties and care settings, quantified patient-care achievements, EHR systems, and your nursing degree." },
      { q: "How do I write a new-grad nursing resume with little experience?", a: "Lead with your BSN/ADN, licence, and certifications, then highlight clinical rotations, preceptorships, capstone projects, and any patient-facing or healthcare support roles. Include relevant skills and EHR exposure." },
      { q: "Should I list my nursing licence number on my resume?", a: "List the licence type, state, and that it is active — but you generally do not need to publish the full licence number on a resume. Provide it through the employer's secure verification process if requested." },
      { q: "How long should a registered nurse resume be?", a: "One page for new grads and early-career nurses; two pages is acceptable for experienced RNs with multiple specialties, certifications, and significant clinical history." },
    ],
  },
  {
    slug: "accountant-resume",
    canonicalPath: "/examples/accountant-resume/",
    title: "Accountant Resume Example — Free Template | ApplyCraft",
    description: "Free accountant resume example with GAAP, software skills, and quantified financial impact in an ATS-friendly layout. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Accountant Resume Example",
    sub: "An ATS-optimised accountant resume example with certifications, accounting software, and measurable financial results. Edit every line and download free.",
    keywords: "accountant resume example, accounting resume sample, CPA resume template, staff accountant cv example",
    resumeCard: rcGeneric({
      name: "David Okafor", title: "Senior Accountant | CPA",
      email: "david.okafor@email.com", city: "Houston, TX",
      skills: ["GAAP", "Month-End Close", "Financial Reporting", "Accounts Payable/Receivable", "Reconciliations", "QuickBooks", "SAP", "Excel (Advanced)", "Audit Support", "Tax Preparation"],
      jobs: [
        { role: "Senior Accountant", company: "Lone Star Manufacturing", date: "2020 – Present",
          desc: "Own the month-end close for a $90M business unit, reducing close time from 9 to 5 days. Identified $310K in annual savings through vendor reconciliation and corrected a recurring accrual error." },
        { role: "Staff Accountant", company: "Gulf Coast Advisors", date: "2017 – 2020",
          desc: "Managed AP/AR for 40+ clients and prepared monthly financial statements. Supported external audits with zero material findings across three consecutive years." },
      ],
      edu: [{ degree: "B.B.A. Accounting", school: "University of Houston", date: "2013 – 2017" }],
    }),
    features: {
      heading: "How to write an accountant resume",
      intro: "Accounting resumes are judged on accuracy, software fluency, and certifications — then on the financial impact you can prove with numbers.",
      ctaHeading: "Use this accountant template free",
      ctaSub: "Edit your experience and download as PDF or DOCX instantly.",
      items: [
        { icon: "🏅", title: "Highlight Certifications", body: "CPA, CMA, ACCA, or CPA-in-progress belong near your name — they're primary screening criteria for accounting roles." },
        { icon: "💻", title: "Name Your Software", body: "QuickBooks, SAP, Oracle, NetSuite, Xero, and advanced Excel — list the exact systems, since job posts filter on them." },
        { icon: "📊", title: "Quantify Financial Impact", body: "Savings identified, close time reduced, error rates lowered, budgets managed — numbers prove competence in this field." },
        { icon: "📚", title: "Show GAAP / Regulatory Knowledge", body: "GAAP, IFRS, SOX, or tax-code familiarity signals you can operate within the standards your employer must follow." },
        { icon: "🔍", title: "Emphasise Accuracy & Audits", body: "Clean audits, reconciliations, and accuracy rates reassure employers that you protect financial integrity." },
        { icon: "✅", title: "Keep It Clean & ATS-Safe", body: "A precise, single-column layout reflects the attention to detail employers expect — and parses correctly in ATS." },
      ],
    },
    faqs: [
      { q: "What should an accountant resume include?", a: "A concise summary, certifications (e.g. CPA), accounting software, core competencies (GAAP, close, reconciliations), work experience with quantified financial impact, and your accounting degree." },
      { q: "Do I need a CPA to put on my accountant resume?", a: "No — many roles don't require it. But if you have a CPA, CMA, or are a candidate, list it prominently, as it strongly improves both ATS matching and recruiter interest." },
      { q: "What are good metrics to include on an accounting resume?", a: "Month-end close time reduced, cost savings identified, budget size managed, number of accounts or clients handled, audit results, and error-reduction percentages." },
      { q: "How long should an accountant resume be?", a: "One page for junior and mid-level accountants; two pages is acceptable for senior accountants, controllers, or candidates with extensive, relevant experience." },
    ],
  },
  {
    slug: "data-analyst-resume",
    canonicalPath: "/examples/data-analyst-resume/",
    title: "Data Analyst Resume Example — Free Template | ApplyCraft",
    description: "Free data analyst resume example with SQL, Python, BI tools, and quantified business impact in an ATS-friendly layout. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Data Analyst Resume Example",
    sub: "An ATS-optimised data analyst resume example with SQL, visualisation tools, and measurable insights. Edit every section and download free — no sign-up.",
    keywords: "data analyst resume example, data analytics resume sample, SQL analyst resume template, business analyst cv example",
    resumeCard: rcGeneric({
      name: "Priya Sharma", title: "Data Analyst",
      email: "priya.sharma@email.com", city: "Austin, TX",
      skills: ["SQL", "Python (pandas)", "Excel", "Tableau", "Power BI", "Statistics", "A/B Testing", "Data Cleaning", "dbt", "Google Analytics"],
      jobs: [
        { role: "Data Analyst", company: "Retail Insights Co.", date: "2021 – Present",
          desc: "Built a Tableau revenue dashboard adopted by 120+ stakeholders, replacing manual reports and saving ~15 hours/week. Ran an A/B test that lifted checkout conversion by 11%." },
        { role: "Junior Data Analyst", company: "Bright Metrics", date: "2019 – 2021",
          desc: "Wrote SQL pipelines feeding weekly KPI reports for marketing and ops. Cleaned and consolidated 3 fragmented data sources, improving reporting accuracy and cutting query time by 60%." },
      ],
      edu: [{ degree: "B.S. Economics & Statistics", school: "University of Texas at Austin", date: "2015 – 2019" }],
    }),
    features: {
      heading: "How to write a data analyst resume",
      intro: "Data analyst resumes need to prove two things fast: the tools you can use, and the business decisions your analysis actually changed.",
      ctaHeading: "Use this data analyst template free",
      ctaSub: "Edit, then download as PDF or DOCX and start applying.",
      items: [
        { icon: "🧮", title: "Lead With Tools", body: "SQL, Python or R, Excel, and a BI tool (Tableau, Power BI, Looker). These keywords are non-negotiable for ATS matching." },
        { icon: "📈", title: "Tie Analysis to Outcomes", body: "Don't just say 'built dashboards' — say what decision it drove and the result: conversion lifted, hours saved, cost reduced." },
        { icon: "🔬", title: "Show Statistical Rigour", body: "A/B testing, forecasting, segmentation, and significance testing distinguish analysts from report builders." },
        { icon: "🧹", title: "Mention Data Engineering Basics", body: "ETL, data cleaning, dbt, and pipeline work show you can handle messy real-world data, not just tidy datasets." },
        { icon: "🗂️", title: "Add a Projects Section", body: "Portfolio projects, Kaggle work, or a GitHub link give early-career analysts concrete proof of skills." },
        { icon: "✅", title: "Keep It ATS-Readable", body: "Use a single-column layout and standard headings so your skills and tools are parsed correctly." },
      ],
    },
    faqs: [
      { q: "What should a data analyst resume include?", a: "A summary, a tools-focused skills section (SQL, Python/R, Excel, BI tools), work experience that links analysis to business outcomes, a projects section, and your education." },
      { q: "What skills do employers look for on a data analyst resume?", a: "SQL is essential; then Python or R, Excel, a visualisation tool (Tableau, Power BI, Looker), statistics, A/B testing, and data-cleaning experience. Match the specific tools named in the job posting." },
      { q: "How do I write a data analyst resume with no experience?", a: "Highlight relevant coursework, certifications, and 2–3 portfolio projects with real datasets. Show the question you asked, your method, the tools used, and the insight — and link your GitHub or dashboards." },
      { q: "How long should a data analyst resume be?", a: "One page is standard for junior and mid-level analysts. Only extend to two pages if you have substantial, directly relevant experience to show." },
    ],
  },
  {
    slug: "sales-representative-resume",
    canonicalPath: "/examples/sales-representative-resume/",
    title: "Sales Representative Resume Example — Free Template | ApplyCraft",
    description: "Free sales representative resume example with quota attainment, CRM skills, and quantified revenue in an ATS-friendly layout. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Sales Representative Resume Example",
    sub: "An ATS-optimised sales representative resume example built around quota attainment and revenue growth. Edit every line and download free — no sign-up.",
    keywords: "sales representative resume example, sales resume sample, account executive resume template, B2B sales cv example",
    resumeCard: rcGeneric({
      name: "James Carter", title: "Sales Representative | B2B SaaS",
      email: "james.carter@email.com", city: "Denver, CO",
      skills: ["B2B Sales", "Pipeline Management", "Prospecting", "Salesforce", "HubSpot", "Negotiation", "Account Management", "Cold Outreach", "Forecasting", "Solution Selling"],
      jobs: [
        { role: "Sales Representative", company: "CloudWorks SaaS", date: "2021 – Present",
          desc: "Achieved 128% of annual quota ($1.9M) and ranked top 5 of 40 reps two years running. Grew territory pipeline by 60% through targeted outbound and closed 3 of the team's 5 largest deals." },
        { role: "Sales Development Representative", company: "Summit Software", date: "2019 – 2021",
          desc: "Booked 40+ qualified meetings per month and sourced $700K in influenced pipeline. Built a cold-email sequence adopted team-wide that lifted reply rates from 4% to 11%." },
      ],
      edu: [{ degree: "B.A. Business & Communications", school: "Colorado State University", date: "2015 – 2019" }],
    }),
    features: {
      heading: "How to write a sales representative resume",
      intro: "Sales resumes live and die on numbers. Quota attainment, revenue, and ranking matter more than responsibilities — lead with them.",
      ctaHeading: "Use this sales representative template free",
      ctaSub: "Edit your numbers and download as PDF or DOCX instantly.",
      items: [
        { icon: "🎯", title: "Lead With Quota Attainment", body: "'128% of quota' or 'top 5% of reps' in your summary and bullets immediately signals you can sell." },
        { icon: "💵", title: "Quantify Revenue & Pipeline", body: "Deal sizes, revenue closed, pipeline generated, and territory growth are the metrics hiring managers scan for first." },
        { icon: "🛠️", title: "List Your CRM & Tools", body: "Salesforce, HubSpot, Outreach, Salesloft, Gong — CRM and sales-engagement tools are common explicit requirements." },
        { icon: "🏆", title: "Show Rankings & Awards", body: "President's Club, top-rep rankings, and stretch-goal achievements are credible, comparable proof points." },
        { icon: "🔁", title: "Describe Your Sales Motion", body: "Inbound vs. outbound, deal cycle length, average deal size, and the industries you sold into add useful context." },
        { icon: "✅", title: "Keep It ATS-Readable", body: "A clean single-column layout ensures your metrics and tools are parsed correctly by applicant tracking systems." },
      ],
    },
    faqs: [
      { q: "What should a sales representative resume include?", a: "A metrics-driven summary, quota attainment and revenue figures, CRM and sales tools, your sales motion (inbound/outbound, deal size, cycle), awards or rankings, and education." },
      { q: "How do I show sales numbers without revealing confidential data?", a: "Use percentages and ranges — 'achieved 128% of quota', 'grew pipeline ~60%' — rather than disclosing exact internal revenue or named client figures." },
      { q: "What if I'm changing into sales from another field?", a: "Translate transferable wins into sales language: targets met, people persuaded, relationships built, and any revenue or growth you influenced. Highlight communication, resilience, and CRM familiarity." },
      { q: "How long should a sales resume be?", a: "One page is ideal and reflects the concise, results-focused style sales leaders expect. Two pages only if you have extensive, directly relevant selling history." },
    ],
  },
  {
    slug: "administrative-assistant-resume",
    canonicalPath: "/examples/administrative-assistant-resume/",
    title: "Administrative Assistant Resume Example — Free Template | ApplyCraft",
    description: "Free administrative assistant resume example with office software, organisation skills, and ATS-friendly formatting. Edit and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Administrative Assistant Resume Example",
    sub: "A complete, ATS-optimised administrative assistant resume example with software skills and measurable efficiency wins. Edit every line and download free.",
    keywords: "administrative assistant resume example, admin assistant resume sample, office assistant resume template, executive assistant cv example",
    resumeCard: rcGeneric({
      name: "Maria Gomez", title: "Administrative Assistant",
      email: "maria.gomez@email.com", city: "Phoenix, AZ",
      skills: ["Calendar Management", "Microsoft 365", "Google Workspace", "Travel Coordination", "Data Entry", "Expense Reports", "Customer Service", "Scheduling", "Minute-Taking", "Vendor Liaison"],
      jobs: [
        { role: "Administrative Assistant", company: "Desert Ridge Group", date: "2021 – Present",
          desc: "Support 3 directors with calendars, travel, and expenses. Built a shared scheduling system that cut double-bookings to zero and reduced meeting setup time by 30%." },
        { role: "Office Assistant", company: "Sunrise Realty", date: "2018 – 2021",
          desc: "Managed front-desk operations and 80+ daily calls. Reorganised digital filing for 1,200+ client records, cutting document retrieval time from minutes to seconds." },
      ],
      edu: [{ degree: "A.A. Business Administration", school: "Phoenix College", date: "2016 – 2018" }],
    }),
    features: {
      heading: "How to write an administrative assistant resume",
      intro: "Strong admin resumes prove reliability and software fluency, then back them with concrete examples of how you made an office run more smoothly.",
      ctaHeading: "Use this administrative assistant template free",
      ctaSub: "Edit your experience and download as PDF or DOCX instantly.",
      items: [
        { icon: "🗓️", title: "Highlight Organisation Wins", body: "Calendar systems, scheduling, and process improvements with a result (time saved, errors removed) turn duties into achievements." },
        { icon: "💻", title: "List Office Software", body: "Microsoft 365, Google Workspace, Outlook, and any scheduling or expense tools — these are frequent ATS keywords." },
        { icon: "🤝", title: "Show Communication Skills", body: "Reception, vendor liaison, and executive support demonstrate professionalism and discretion." },
        { icon: "📊", title: "Quantify Where You Can", body: "Calls handled per day, executives supported, records managed, and cost or time savings make your impact concrete." },
        { icon: "🔒", title: "Mention Confidentiality", body: "Handling sensitive scheduling, finances, or HR information shows you can be trusted with discretion." },
        { icon: "✅", title: "Keep It Clean & ATS-Safe", body: "An orderly, single-column layout mirrors the organisation employers expect — and parses well in ATS." },
      ],
    },
    faqs: [
      { q: "What should an administrative assistant resume include?", a: "A brief summary, office software skills, core competencies (scheduling, travel, expenses, communication), work experience with quantified efficiency wins, and education or relevant certifications." },
      { q: "How do I write an admin assistant resume with no experience?", a: "Emphasise transferable skills from school, volunteering, or other jobs — organisation, communication, software, and customer service. Highlight any responsibility for scheduling, records, or coordination." },
      { q: "What's the difference between an administrative assistant and an executive assistant resume?", a: "An executive assistant resume emphasises supporting senior leaders, confidentiality, complex calendar and travel management, and higher autonomy. An administrative assistant resume covers broader general office support." },
      { q: "How long should an administrative assistant resume be?", a: "One page is standard and preferred for most administrative roles. Only extend to two pages with extensive, directly relevant experience." },
    ],
  },
  {
    slug: "teacher-resume",
    canonicalPath: "/examples/teacher-resume/",
    title: "Teacher Resume Example — Free Template | ApplyCraft",
    description: "Free teacher resume example with certifications, classroom achievements, and ATS-friendly formatting. Edit every line and download as PDF or DOCX.",
    eyebrow: "Resume Example",
    h1: "Teacher Resume Example",
    sub: "An ATS-optimised teacher resume example with licensure, grade levels, and measurable student outcomes. Edit every section and download free — no sign-up.",
    keywords: "teacher resume example, teaching resume sample, elementary teacher resume template, educator cv example",
    resumeCard: rcGeneric({
      name: "Rachel Bennett", title: "Elementary School Teacher | State Certified (K–6)",
      email: "rachel.bennett@email.com", city: "Columbus, OH",
      skills: ["Curriculum Design", "Differentiated Instruction", "Classroom Management", "Google Classroom", "IEP Support", "Assessment & Data", "Parent Communication", "Project-Based Learning", "SEL"],
      jobs: [
        { role: "3rd Grade Teacher", company: "Maple Grove Elementary", date: "2019 – Present",
          desc: "Teach a class of 26 across all core subjects. Raised class reading proficiency by 18 percentage points in one year and led a grade-level team adopting a new math curriculum." },
        { role: "Long-Term Substitute Teacher", company: "Columbus City Schools", date: "2018 – 2019",
          desc: "Covered K–5 classrooms and maintained continuity of instruction. Introduced a behaviour-management system later adopted by two other teachers." },
      ],
      edu: [{ degree: "B.S. Elementary Education", school: "Ohio State University", date: "2014 – 2018" }],
    }),
    features: {
      heading: "How to write a teacher resume",
      intro: "Teaching resumes are screened for certification, grade levels, and subjects first — then for evidence that your students actually learned and grew.",
      ctaHeading: "Use this teacher template free",
      ctaSub: "Edit your certifications and experience, then download as PDF or DOCX.",
      items: [
        { icon: "🪪", title: "Certification & Licensure First", body: "State teaching licence, grade band (K–6, 7–12), and subject endorsements belong near your name — they're primary screening criteria." },
        { icon: "📈", title: "Show Student Outcomes", body: "Proficiency gains, test-score growth, and graduation or pass rates are the strongest evidence of effective teaching." },
        { icon: "🧩", title: "Highlight Instructional Strategies", body: "Differentiated instruction, project-based learning, SEL, and IEP support show range and adaptability." },
        { icon: "💻", title: "List EdTech Tools", body: "Google Classroom, Canvas, Seesaw, and assessment platforms are increasingly expected — name the ones you use." },
        { icon: "🤝", title: "Include Collaboration & Leadership", body: "Grade-level teams, curriculum committees, mentoring, and clubs demonstrate contribution beyond your own classroom." },
        { icon: "✅", title: "Keep It ATS-Safe", body: "District hiring systems use ATS. Use clear headings and avoid graphics so your certifications and subjects parse correctly." },
      ],
    },
    faqs: [
      { q: "What should a teacher resume include?", a: "A summary, your teaching certification and grade levels/subjects, classroom experience with measurable student outcomes, instructional strategies, EdTech tools, education, and any leadership or committee work." },
      { q: "How do I write a teacher resume for a first teaching job?", a: "Lead with your degree and certification, then highlight student teaching, practicums, and long-term subbing. Describe lessons you planned, strategies you used, and any measurable progress your students made." },
      { q: "Should I include test scores or student data on my teaching resume?", a: "Yes, when you can frame it as your contribution — e.g. 'raised class reading proficiency by 18 points' — using aggregate, non-identifying figures rather than individual student data." },
      { q: "How long should a teacher resume be?", a: "One page for new and early-career teachers; two pages is acceptable for experienced educators with extensive relevant teaching, leadership, and professional development." },
    ],
  },
];

// ── Generate all pages ────────────────────────────────────────────────────────
for (const p of PAGES) {
  const dir = join(ROOT, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(p), "utf8");
  console.log(`✓ /public/${p.slug}/index.html`);
}

for (const p of EXAMPLES) {
  const dir = join(ROOT, "examples", p.slug);
  mkdirSync(dir, { recursive: true });
  const cssPathForExamples = "../../_seo.css";
  writeFileSync(join(dir, "index.html"), page({ ...p, _cssPath: cssPathForExamples }), "utf8");
  console.log(`✓ /public/examples/${p.slug}/index.html`);
}

console.log(`\n✅ Generated ${PAGES.length + EXAMPLES.length} SEO pages`);
