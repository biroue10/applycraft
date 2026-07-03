import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "public");

const SITE = "https://applycraft.io";
const EMAIL = "hello@applycraft.io";
const TODAY = "2026-06-27";
const SOCIAL_IMAGE = `${SITE}/og.png`;
const SOCIAL_IMAGE_ALT = "ApplyCraft resume builder interface";

function shell(title, description, canonicalPath, content, extraHead = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} | ApplyCraft</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${SITE}${canonicalPath}"/>
<meta property="og:title" content="${title} | ApplyCraft"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${SITE}${canonicalPath}"/>
<meta property="og:image" content="${SOCIAL_IMAGE}"/>
<meta property="og:image:secure_url" content="${SOCIAL_IMAGE}"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${SOCIAL_IMAGE_ALT}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title} | ApplyCraft"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${SOCIAL_IMAGE}"/>
<meta name="twitter:image:alt" content="${SOCIAL_IMAGE_ALT}"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="icon" href="/favicon.png" type="image/png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link rel="manifest" href="/site.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../_seo.css"/>
${extraHead}
<style>
  .prose{max-width:720px;margin:0 auto;padding:64px 24px 100px}
  .prose h1{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1px;margin:0 0 16px;
    background:linear-gradient(135deg,#EEF2FF 0%,#94A3B8 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .prose .lead{font-size:17px;color:#94A3B8;margin:0 0 48px;line-height:1.7}
  .prose h2{font-size:20px;font-weight:700;color:#E4EBF5;margin:40px 0 12px}
  .prose h3{font-size:16px;font-weight:700;color:#C0CADB;margin:28px 0 8px}
  .prose p{font-size:14.5px;color:#64748B;line-height:1.8;margin:0 0 16px}
  .prose ul{padding-left:20px;margin:0 0 16px}
  .prose li{font-size:14.5px;color:#64748B;line-height:1.8;margin-bottom:6px}
  .prose a{color:#818CF8}
  .prose .meta{font-size:12px;color:#334155;margin-bottom:40px}
  .prose hr{border:none;border-top:1px solid #1A2740;margin:40px 0}
  .prose .callout{background:#0D1117;border:1px solid #1A2740;border-left:3px solid #6366F1;
    border-radius:8px;padding:18px 20px;margin:24px 0}
  .prose .callout p{margin:0;font-size:14px}
  .badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;
    text-transform:uppercase;letter-spacing:1px}
  .badge-green{background:#14532d44;color:#4ade80;border:1px solid #16a34a44}
  .badge-blue{background:#1e3a5f44;color:#60a5fa;border:1px solid #2563eb44}
  .badge-yellow{background:#713f1244;color:#fbbf24;border:1px solid #d9770644}
  .changelog-entry{border-left:2px solid #1A2740;padding-left:24px;margin-bottom:40px}
  .changelog-entry:hover{border-left-color:#6366F1}
  .status-row{display:flex;align-items:center;justify-content:space-between;
    padding:14px 20px;border:1px solid #1A2740;border-radius:10px;margin-bottom:10px;
    background:#0D1117}
  .status-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;
    box-shadow:0 0 8px #22c55e88;flex-shrink:0}
  .roadmap-item{background:#0D1117;border:1px solid #1A2740;border-radius:10px;
    padding:20px;margin-bottom:12px}
  .roadmap-item h3{margin:0 0 6px;font-size:15px;color:#E4EBF5;font-weight:700}
  .roadmap-item p{margin:0;font-size:13px;color:#64748B}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="eager" decoding="async"></a>
  <a href="/" class="nav-cta">Build My Resume Free →</a>
</nav>
<main>
<div class="prose">
${content}
</div>
</main>
<footer class="site-footer">
  <div class="footer-shell">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="lazy" decoding="async"></a>
        <p>Free resume and cover letter builder with 46 templates, free PDF and DOCX exports, no watermark, no signup, browser-first editing, and production-ready English, French, and Arabic localization.</p>
        <a href="mailto:${EMAIL}">${EMAIL}</a>
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
</footer>
</body>
</html>`;
}

// ── Pages ──────────────────────────────────────────────────────────────────────

const PAGES = {
  "privacy": {
    path: "/privacy/",
    title: "Privacy Policy",
    description: "How ApplyCraft handles data: browser-first resume editing, optional account sync, cookieless analytics, optional AI helpers, private offline sharing, and payments explained.",
    content: `
<h1>Privacy Policy</h1>
<p class="meta">Last updated: ${TODAY} · Effective immediately</p>
<p class="lead">ApplyCraft is designed to handle as little of your data as possible. The free builder is browser-first by default, while optional online features process selected data only when you choose to use them.</p>

<div class="callout"><p>⚡ <strong style="color:#E4EBF5">Short version:</strong> Free builder data is stored in your browser by default. If you use optional features such as cloud sync, accounts, AI helpers, or private offline sharing, selected data may be stored or processed so those features can work. ApplyCraft does not send résumé content to analytics.</p></div>

<h2>1. Who we are</h2>
<p>ApplyCraft is an independent product built and operated by Biroue Digital Ltd (<a href="mailto:${EMAIL}">${EMAIL}</a>). This website is accessible at <strong>applycraft.io</strong>.</p>

<h2 id="data-we-collect">2. What data we collect</h2>
<h3>2.1 Resume and cover letter content</h3>
<p>By default, resume and cover-letter data is edited and stored only in your own browser. ApplyCraft does not require an account, and user-written content is not sent to or stored on our servers unless you explicitly use an optional online feature below.</p>

<h3 id="optional-account">2.4 Optional account and Master Profile sync</h3>
<p>You may optionally provide an email address to save your <strong>Master Profile</strong> and sync it across your devices. This is entirely optional — the resume builder, all templates, and PDF/DOCX export work fully without it.</p>
<ul>
  <li>Sign-in is passwordless: we email you a one-time link. We store your email address and, with your explicit consent, your Master Profile content so it can be synced.</li>
  <li>Master Profile cloud sync is a paid feature (see section 4a). The free builder never requires an account.</li>
  <li>You can delete all of this at any time using <strong>"Delete my saved data"</strong> in the app, or by emailing us. Deletion removes your account, stored Master Profile, and session.</li>
</ul>

<h3>2.2 Technical logs</h3>
<p>Our hosting provider (Cloudflare) may record standard server access logs: IP address, browser type, URL requested, and timestamp. These are retained for up to 30 days for security and uptime monitoring. We do not use them for analytics or advertising.</p>

<h3>2.3 Uploaded files</h3>
<p>If you upload a PDF or DOCX resume using the upload feature, the intended behavior is browser-side processing. Avoid uploading sensitive documents if you are using a modified build or third-party mirror of ApplyCraft.</p>

<h3>2.4 Private offline share links</h3>
<p>Private offline share links store the document data inside the URL fragment. Anyone with the full link can view the document, so only share it with people you trust. These links do not require server-side document storage, but they can be long.</p>

<h2 id="cookies">3. Cookies and tracking</h2>
<p>ApplyCraft sets <strong>no advertising cookies</strong> and uses <strong>no cross-site tracking</strong> (no Google Analytics, no Facebook Pixel, no Hotjar, no ad networks). We use privacy-friendly, <strong>cookieless</strong> product analytics (Plausible) that counts anonymous, aggregated usage events (such as "a resume was started or exported"). These events contain no personal data — no names, emails, or resume content.</p>
<p>Cloudflare, our CDN provider, may set a technical cookie (<code>__cf_bm</code>) for bot protection. This is a strictly necessary security cookie that does not track you for advertising purposes.</p>

<h2>4. AI features and your data</h2>
<p>Some optional AI helpers — such as achievement coaching or AI tailoring to a job description — depend on external AI providers when you choose to use them. User-written résumé or cover-letter content is not translated, uploaded, or processed by AI unless you explicitly choose an AI-powered action. Do not use optional AI helpers with sensitive content unless you are comfortable with the relevant provider processing the submitted text. The core builder and export do not use AI.</p>

<h2 id="payments">4a. Payments (optional paid pass)</h2>
<p>Power-ups (AI tailoring and Master Profile cloud sync) are available via an optional one-time "Active Search Pass." Payments are processed by <strong>Lemon Squeezy</strong>, which acts as the merchant of record and handles billing and applicable taxes. We do not receive or store your full card details; we record only whether your pass is active and when it expires. Lemon Squeezy's handling of payment data is governed by its own privacy policy.</p>

<h2 id="gdpr">5. GDPR and your rights</h2>
<p>ApplyCraft is designed to minimize account-based storage of resume content. For privacy-related requests or questions about data handled by the site, contact us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<p>If you are a resident of the European Union, the United Kingdom, or another jurisdiction with data protection laws, you have the following rights:</p>
<ul>
  <li><strong>Right of access</strong> — you can ask what personal information is associated with support requests or other direct contact.</li>
  <li><strong>Right to erasure</strong> — you can request deletion of personal information retained through direct contact.</li>
  <li><strong>Right to data portability</strong> — download your resume as PDF or DOCX at any time.</li>
  <li><strong>Right to object</strong> — we do not process your data for profiling, advertising, or automated decision-making.</li>
</ul>
<p>For any privacy-related request, contact us at <a href="mailto:${EMAIL}">${EMAIL}</a>. We respond within 72 hours.</p>

<h2>6. Data retention</h2>
<p>For the free, no-account builder we do not store your active résumé content on our servers by default. If you opt into Master Profile sync, we retain your email and stored Master Profile until you delete them via "Delete my saved data" or by contacting us. Cloudflare access logs are automatically deleted after 30 days. If you contact us by email, your email and its contents are retained only for as long as necessary to respond.</p>

<h2>7. Children's privacy</h2>
<p>ApplyCraft is not directed at children under 13 (or 16 in the EU). We do not knowingly collect data from children. If you believe a child has submitted data, contact us and we will take appropriate action.</p>

<h2>8. Third-party services</h2>
<ul>
  <li><strong>Cloudflare</strong> — CDN and hosting. Subject to Cloudflare's <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">privacy policy</a>.</li>
  <li><strong>Google Fonts</strong> — typography. Font files are served from Google's CDN. Subject to <a href="https://policies.google.com/privacy" rel="noopener">Google's privacy policy</a>. No personal data is shared.</li>
  <li><strong>Plausible Analytics</strong> — cookieless, privacy-friendly product analytics. No personal data, no cross-site tracking. Subject to <a href="https://plausible.io/privacy" rel="noopener">Plausible's privacy policy</a>.</li>
  <li><strong>Lemon Squeezy</strong> — payment processing and merchant of record for the optional paid pass. Subject to <a href="https://www.lemonsqueezy.com/privacy" rel="noopener">Lemon Squeezy's privacy policy</a>.</li>
</ul>

<h2>9. Security</h2>
<p>All traffic to applycraft.io is encrypted via HTTPS/TLS. The free builder holds no personal data on our servers. For opted-in accounts we store only your email and Master Profile content, which you can delete at any time, keeping our data footprint minimal.</p>

<h2>10. Changes to this policy</h2>
<p>We may update this policy. The "Last updated" date at the top will reflect any changes. Continued use of ApplyCraft after changes constitutes acceptance of the updated policy.</p>

<h2>11. Contact</h2>
<p>Privacy questions, concerns, or GDPR requests: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<p>We typically respond within 72 hours.</p>
`,
  },

  "about": {
    path: "/about/",
    title: "About ApplyCraft",
    description: "Learn why ApplyCraft stands out: a browser-first resume builder with no sign-up, no watermarks, ATS-conscious templates, multilingual support, and privacy-respecting design.",
    content: `
<h1>About ApplyCraft</h1>
<p class="lead">ApplyCraft is a resume and cover letter builder for people who need a polished document quickly, without surrendering their career data, fighting a paywall, or learning a complicated design tool.</p>

<h2>Who we are</h2>
<p>ApplyCraft is built and operated by Biroue Digital Ltd. We created it after seeing the same pattern across too many resume builders: users spend time entering personal details, then discover that downloading, removing a watermark, or using a useful template requires payment or an account.</p>
<p>ApplyCraft takes the opposite approach. The core builder is fast, useful, and available before you create an account. Your resume should feel like your document from the first minute, not a file being held hostage until checkout.</p>
<p>ApplyCraft is independent. It is not built around advertising profiles, hidden resume databases, or forced cloud storage. The product is designed around a simple standard: help job seekers create better applications with less friction.</p>

<div class="callout">
  <p>📬 Want to reach us? Email: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
</div>

<h2>The mission</h2>
<p>A strong resume should not be a luxury purchase. For many roles, your document has to satisfy two audiences at once: automated screening software and the human recruiter who reads the shortlist. Bad formatting, unclear sections, weak phrasing, or the wrong language can cost an interview before your experience is properly considered.</p>
<p>ApplyCraft exists to make that first step fairer. Students, career changers, international applicants, and experienced professionals should all have access to clean templates, practical writing support, and export formats that are ready to send.</p>

<h2>Why ApplyCraft stands out</h2>
<ul>
  <li><strong>No sign-up wall.</strong> You can start building, previewing, and exporting without handing over an email address first.</li>
  <li><strong>No watermarked downloads.</strong> Your resume exports as a professional document, not an advertisement for the tool that made it.</li>
  <li><strong>Browser-first by design.</strong> The main resume workflow runs in your browser, reducing unnecessary server storage of personal career information.</li>
  <li><strong>ATS-conscious templates.</strong> Layouts use readable typography, clear section labels, and text-based structure so applicant tracking systems can parse the document more reliably.</li>
  <li><strong>Global by default.</strong> ApplyCraft lets candidates write in any language, with production-ready English, French, and Arabic document labels, right-to-left layouts, and separate interface/document language choices.</li>
  <li><strong>Resume and cover letter together.</strong> You can build matching application documents instead of piecing together separate files from different tools.</li>
  <li><strong>Optional AI helpers.</strong> Writing and tailoring helpers are available when useful, but the core builder does not depend on AI or force it into the workflow.</li>
  <li><strong>Practical exports.</strong> Download PDF or DOCX files you can submit directly, share with recruiters, or keep as your own editable records.</li>
</ul>

<h2>Built for real job searches</h2>
<p>ApplyCraft is not trying to be a generic document editor. It is focused on the specific work of building applications: structuring experience, highlighting measurable achievements, matching a resume and cover letter visually, and keeping the final file clean enough for both software screening and human review.</p>
<p>That focus is what makes the product different. Instead of giving you a blank page and dozens of decorative choices, ApplyCraft gives you guided sections, proven resume patterns, and export-ready templates that keep momentum on the job search itself.</p>

<h2>Technical stack</h2>
<p>ApplyCraft is a React application built with Vite. PDF generation runs in the browser using jsPDF and html2canvas. DOCX generation uses docx.js. The free builder is intentionally lightweight so the product stays fast, accessible, and easy to use from a modern browser.</p>
<p>The site is hosted on Cloudflare Pages and deployed automatically from the production codebase.</p>

<h2>Roadmap and feedback</h2>
<p>See what's coming on the <a href="/roadmap/">product roadmap</a>. Have a feature request, found a bug, or want to explain what would make ApplyCraft more useful for your job search? Email us directly at <a href="mailto:${EMAIL}">${EMAIL}</a> — we read every message.</p>

<p style="margin-top:40px;font-size:13px;color:#475569">Biroue Digital Ltd · <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="https://github.com/biroue10" rel="noopener">GitHub</a></p>
`,
  },

  "help": {
    path: "/help/",
    title: "Help Center",
    description: "Answers to common questions about ApplyCraft — how to build a resume, download as PDF, use templates, and more.",
    content: `
<h1>Help Center</h1>
<p class="lead">Find answers to common questions below. If you don't see what you need, email <a href="mailto:${EMAIL}">${EMAIL}</a> and we'll reply within 24 hours.</p>

<h2>Getting started</h2>

<h3>How do I start building my resume?</h3>
<p>Click "Build My Resume" on the homepage. You'll be taken to the template selector — pick a template and you're in the editor. No account or sign-up required.</p>

<h3>Do I need to create an account?</h3>
<p>No. Open the app, build your resume, and download it. The core builder does not require an email, password, or account profile.</p>

<h3>Is ApplyCraft really free?</h3>
<p>The current builder is free to use and does not require a credit card. If pricing changes in the future, the free workflow should remain clear before you invest time in a document.</p>

<h2>Templates</h2>

<h3>How do I change my template?</h3>
<p>Click "Templates" in the left sidebar. Choose a new template and your current data will transfer automatically.</p>

<h3>Are the templates ATS-friendly?</h3>
<p>The templates are designed with clean, text-based layouts that improve parsing compatibility: clear section labels, readable typography, and no image-only resume text.</p>

<h3>Can I preview a template before using it?</h3>
<p>Yes. On the template selection screen, hovering over a template shows a live preview of the layout.</p>

<h2>Editing your resume</h2>

<h3>How do I add more work experience or education entries?</h3>
<p>Click the "+ Add" button at the bottom of the Experience or Education section. You can add as many entries as needed.</p>

<h3>How do I reorder sections or entries?</h3>
<p>Click and drag the handle icon (⋮⋮) on the left of any entry to reorder it.</p>

<h3>Can I add a photo to my resume?</h3>
<p>Yes — click the photo upload area in the header section. Note: photos are not recommended for US, Canadian, or UK resumes due to anti-discrimination hiring practices.</p>

<h2>Languages</h2>

<h3>How do I change the resume language?</h3>
<p>Use the document language selector in the builder. Changing document language localizes standard section labels, date formats, document direction, and export metadata. It does not translate your written résumé or cover-letter content.</p>

<h3>Does ApplyCraft support Arabic and other RTL languages?</h3>
<p>Arabic is production-ready for interface text, document labels, and RTL-aware layouts. Other RTL languages use the same direction-aware rendering where available, but English, French, and Arabic are the currently production-ready localized languages.</p>

<h3>Does changing document language translate my existing resume?</h3>
<p>Changing document language does not automatically translate your professional summary, experience descriptions, job titles, skills, education details, or cover-letter paragraphs. User-written content is not translated, uploaded, or processed by AI unless you explicitly choose an AI-powered action.</p>

<h2>Downloading</h2>

<h3>How do I download my resume as a PDF?</h3>
<p>Click "Download PDF" in the top bar. Your resume is generated in the browser and saved directly to your computer.</p>

<h3>How do I download as DOCX (Word)?</h3>
<p>Click the arrow next to "Download PDF" and choose "Download DOCX".</p>

<h3>Why does my downloaded PDF look slightly different from the preview?</h3>
<p>PDF rendering uses html2canvas to convert the live preview. Minor font or spacing differences can occur across browsers. Google Chrome typically gives the most accurate output.</p>

<h2>Privacy and data</h2>

<h3>Where is my resume data stored?</h3>
<p>Free builder data is stored in your browser by default. If you use optional features such as cloud sync, accounts, AI helpers, or private offline sharing, selected data may be stored or processed so those features can work. ApplyCraft does not send résumé content to analytics.</p>

<h3>Is my data used to train AI?</h3>
<p>User-written résumé or cover-letter content is not translated, uploaded, or processed by AI unless you explicitly choose an AI-powered action. Avoid optional AI helpers for sensitive content unless you are comfortable with that processing.</p>

<h3>How do I delete my data?</h3>
<p>Use the local data controls in the app or clear this site's browser storage. Closing a tab does not always remove local drafts stored by your browser.</p>

<h3>How do private offline share links work?</h3>
<p>Private offline share links store the document data inside the URL fragment. Anyone with the full link can view the document, so only share it with people you trust. These links do not require server-side document storage, but they can be long.</p>

<h2>Still need help?</h2>
<p>Email <a href="mailto:${EMAIL}">${EMAIL}</a> — we read and respond to every message, usually within 24 hours.</p>
`,
  },

  "changelog": {
    path: "/changelog/",
    title: "Changelog",
    description: "ApplyCraft product changelog — every update, new feature, and fix in one place.",
    content: `
<h1>Changelog</h1>
<p class="lead">Every update to ApplyCraft, newest first. No marketing fluff — just what changed and why.</p>

<div class="changelog-entry">
  <p class="meta">v1.5 · June 2026</p>
  <h2>Trust, SEO &amp; privacy improvements</h2>
  <p><span class="badge badge-green">New</span> Privacy Trust section on the landing page — 6 explicit privacy commitments with plain-language explanations.</p>
  <p><span class="badge badge-green">New</span> Testimonials section — real user feedback from job seekers in multiple countries and industries.</p>
  <p><span class="badge badge-green">New</span> 20 SEO landing pages — dedicated pages for /resume-builder, /ats-resume-builder, /cover-letter-builder, /resume-in-french, /resume-in-arabic, /canadian-resume-builder, /student-resume-builder, and 8 role-specific example pages.</p>
  <p><span class="badge badge-green">New</span> Company pages — Privacy Policy, About, Help Center, Changelog, Roadmap, Status, and Contact.</p>
  <p><span class="badge badge-green">New</span> Expanded footer with links to all company and resource pages.</p>
  <p><span class="badge badge-green">New</span> Full sitemap.xml with all 20+ URLs.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.4 · June 2026</p>
  <h2>Upload, separate cards &amp; layout polish</h2>
  <p><span class="badge badge-green">New</span> Resume upload on landing page — drag &amp; drop or click to upload a PDF or DOCX as a reference.</p>
  <p><span class="badge badge-blue">Improved</span> Form and preview now display as two separate, visually distinct cards with a 16px gap.</p>
  <p><span class="badge badge-blue">Improved</span> Form and preview columns are now equal height using CSS grid stretch.</p>
  <p><span class="badge badge-blue">Improved</span> Reference banner in the form header shows the uploaded resume filename.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.3 · June 2026</p>
  <h2>Cloudflare deployment &amp; production stability</h2>
  <p><span class="badge badge-green">New</span> wrangler.json — static assets deployment to Cloudflare Workers, bypassing Vite version auto-detection.</p>
  <p><span class="badge badge-yellow">Fixed</span> Black page on production: resolved Temporal Dead Zone (TDZ) crash caused by Rollup's production evaluation order. PageHeader, SectionHeader, Hint, and IconInput moved before mainContent.</p>
  <p><span class="badge badge-blue">Improved</span> applycraft.io custom domain now live and serving the app.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.2 · June 2026</p>
  <h2>Multilingual &amp; RTL</h2>
  <p><span class="badge badge-green">New</span> Separate interface and document languages, with localized English, French, and Arabic labels.</p>
  <p><span class="badge badge-green">New</span> Full RTL layout support for Arabic, Hebrew, and Farsi.</p>
  <p><span class="badge badge-green">New</span> Document language controls localize labels, date formatting, and direction without automatically translating user-written content.</p>
  <p><span class="badge badge-green">New</span> 18 cover letter styles with live preview.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.1 · June 2026</p>
  <h2>Template expansion &amp; AI polish</h2>
  <p><span class="badge badge-green">New</span> Expanded professional resume template library.</p>
  <p><span class="badge badge-green">New</span> AI Polish — rewrites bullet points into strong, action-oriented achievements.</p>
  <p><span class="badge badge-green">New</span> DOCX export in addition to PDF.</p>
  <p><span class="badge badge-blue">Improved</span> Live preview updates in real time as you type.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.0 · June 2026</p>
  <h2>Initial launch</h2>
  <p>ApplyCraft goes live with PDF export, basic multilingual support, no sign-up requirement, and no watermarks.</p>
</div>
`,
  },

  "roadmap": {
    path: "/roadmap/",
    title: "Product Roadmap",
    description: "What's coming to ApplyCraft — upcoming features, improvements, and ideas in progress.",
    content: `
<h1>Product Roadmap</h1>
<p class="lead">What we're working on, what's coming soon, and what's planned further out. Updated as things move.</p>

<div class="callout">
  <p>💡 Have a feature request? Email <a href="mailto:${EMAIL}">${EMAIL}</a> — feature requests from users directly influence this roadmap.</p>
</div>

<h2>🚀 Shipping soon</h2>

<div class="roadmap-item">
  <h3>AI resume parsing from uploaded file</h3>
  <p>Upload your existing PDF or DOCX and have ApplyCraft automatically pre-fill the form with your work history, skills, and education — all locally in the browser.</p>
</div>

<div class="roadmap-item">
  <h3>Job description keyword matching</h3>
  <p>Paste a job posting and see which keywords in your resume match and which are missing. Use the result as a tailoring signal, not as a guarantee of ATS success or interviews.</p>
</div>

<div class="roadmap-item">
  <h3>Resume saving to browser storage</h3>
  <p>Opt-in local persistence using localStorage — save multiple resume versions in your browser without any server involved.</p>
</div>

<h2>📋 In progress</h2>

<div class="roadmap-item">
  <h3>Grammar &amp; spelling check (multilingual)</h3>
  <p>Real-time spell checking in the resume form, supporting French, Arabic, Spanish, German, and English.</p>
</div>

<div class="roadmap-item">
  <h3>Country-specific resume format guidance</h3>
  <p>Tips and auto-adjustments for resume conventions in Germany, France, Canada, UK, UAE, and other markets.</p>
</div>

<div class="roadmap-item">
  <h3>Multi-language PDF export</h3>
  <p>Download the same resume as two separate PDFs (e.g., English + French) with a single click.</p>
</div>

<h2>🔭 Planned</h2>

<div class="roadmap-item">
  <h3>LinkedIn profile import</h3>
  <p>Import your LinkedIn data export (JSON) and auto-populate the resume form.</p>
</div>

<div class="roadmap-item">
  <h3>Short public share links</h3>
  <p>Short public links are planned for later. They will require storing a copy of the shared document and will include a clear privacy notice before creation.</p>
</div>

<div class="roadmap-item">
  <h3>Private offline share links</h3>
  <p>Current: private offline share links are available using URL fragments. They do not require server-side document storage, but the links can be long.</p>
</div>

<div class="roadmap-item">
  <h3>Cover letter AI generation</h3>
  <p>Generate a role-specific cover letter based on your resume content and a pasted job description.</p>
</div>

<div class="roadmap-item">
  <h3>Mobile app (PWA)</h3>
  <p>Progressive Web App installation on iOS and Android for offline resume editing.</p>
</div>

<h2>✅ Recently shipped</h2>
<p>See the <a href="/changelog/">full changelog</a> for everything that's already live.</p>

<hr/>
<p style="font-size:13px;color:#475569">Last updated: ${TODAY} · Questions? <a href="mailto:${EMAIL}">${EMAIL}</a></p>
`,
  },

  "status": {
    path: "/status/",
    title: "System Status",
    description: "ApplyCraft system status — manually maintained service status for the resume builder.",
    content: `
<h1>System Status</h1>
<p class="lead">Current status of ApplyCraft services. This status page is currently updated from manually maintained status data. Automated monitoring is planned.</p>

<div style="display:flex;align-items:center;gap:14px;padding:20px 24px;background:#052e16;border:1px solid #16a34a44;border-radius:12px;margin-bottom:40px">
  <div style="width:14px;height:14px;border-radius:50%;background:#22c55e;box-shadow:0 0 12px #22c55e88;flex-shrink:0"></div>
  <div>
    <div style="font-size:16px;font-weight:700;color:#4ade80">All systems operational</div>
    <div style="font-size:12px;color:#16a34a;margin-top:2px">Manual status update: ${TODAY}</div>
  </div>
</div>

<h2>Services</h2>

<div class="status-row">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="status-dot"></div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#E4EBF5">applycraft.io — Resume Builder</div>
      <div style="font-size:12px;color:#475569">Main application</div>
    </div>
  </div>
  <span class="badge badge-green">Operational</span>
</div>

<div class="status-row">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="status-dot"></div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#E4EBF5">PDF Export</div>
      <div style="font-size:12px;color:#475569">Browser-side PDF generation</div>
    </div>
  </div>
  <span class="badge badge-green">Operational</span>
</div>

<div class="status-row">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="status-dot"></div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#E4EBF5">DOCX Export</div>
      <div style="font-size:12px;color:#475569">Browser-side DOCX generation</div>
    </div>
  </div>
  <span class="badge badge-green">Operational</span>
</div>

<div class="status-row">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="status-dot"></div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#E4EBF5">CDN &amp; Static Assets</div>
      <div style="font-size:12px;color:#475569">Cloudflare Pages</div>
    </div>
  </div>
  <span class="badge badge-green">Operational</span>
</div>

<div class="status-row">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="status-dot"></div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#E4EBF5">Google Fonts</div>
      <div style="font-size:12px;color:#475569">Typography CDN</div>
    </div>
  </div>
  <span class="badge badge-green">Operational</span>
</div>

<h2 style="margin-top:48px">Uptime</h2>
<p>ApplyCraft is served through Cloudflare infrastructure, but this page is not connected to automated uptime monitoring yet.</p>
<p>The free builder is browser-first, so core editing and export continue locally after the app has loaded. Network access is still required to load the site and optional online features.</p>

<h2>Incident history</h2>
<p style="color:#475569;font-size:14px">No incidents in the last 90 days.</p>

<hr/>
<p style="font-size:13px;color:#475569">Issues? Email <a href="mailto:${EMAIL}">${EMAIL}</a></p>
`,
  },

  "contact": {
    path: "/contact/",
    title: "Contact",
    description: "Contact ApplyCraft — bug reports, feature requests, privacy questions, and press inquiries.",
    content: `
<h1>Contact</h1>
<p class="lead">ApplyCraft is built and maintained by Biroue Digital Ltd. We read every message and reply to almost all of them, usually within 24 hours.</p>

<div class="callout">
  <p>📬 Email: <a href="mailto:${EMAIL}" style="font-size:16px;font-weight:700">${EMAIL}</a></p>
</div>

<h2>When to reach out</h2>

<h3>Bug reports</h3>
<p>Found something broken? Please include your browser name and version, operating system, and a description of what happened vs. what you expected. Screenshots are very helpful.</p>

<h3>Feature requests</h3>
<p>Have an idea for something that would make ApplyCraft more useful? We want to hear it. Feature requests from users directly influence the <a href="/roadmap/">product roadmap</a>.</p>

<h3>Privacy questions</h3>
<p>Privacy concerns, GDPR requests, or data questions — see the <a href="/privacy/">Privacy Policy</a> first. If you still have questions, email us directly.</p>

<h3>Resume advice</h3>
<p>We're a software team, not professional career coaches — but we're happy to point you to the right resource for your situation.</p>

<h3>Press &amp; partnerships</h3>
<p>Writing about ApplyCraft or interested in a partnership? Get in touch with the subject line "Press" or "Partnership".</p>

<h2>Response time</h2>
<p>We aim to respond within 24 hours on weekdays. Complex technical issues or feature requests may take a little longer to investigate properly.</p>

<h2>GitHub</h2>
<p>For technical issues or to see the source code, visit <a href="https://github.com/biroue10" rel="noopener">github.com/biroue10</a>.</p>

<hr/>
<p style="font-size:13px;color:#475569">Biroue Digital Ltd · <a href="mailto:${EMAIL}">${EMAIL}</a></p>
`,
  },
};

// ── Generate ───────────────────────────────────────────────────────────────────
for (const [slug, p] of Object.entries(PAGES)) {
  const dir = join(ROOT, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), shell(p.title, p.description, p.path, p.content), "utf8");
  console.log(`✓ /public/${slug}/index.html`);
}

console.log(`\n✅ Generated ${Object.keys(PAGES).length} company pages`);
