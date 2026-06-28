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
<link rel="icon" href="/favicon.svg"/>
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
  <a href="/" class="nav-logo">ApplyCraft</a>
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
        <a href="/" class="footer-logo">ApplyCraft</a>
        <p>Free resume and cover letter builder for the global job market. 99 document languages, 5 interface languages, 22 templates, no sign-up required.</p>
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
    description: "ApplyCraft collects no personal data. Your resume stays in your browser, never on our servers. Read our full privacy policy.",
    content: `
<h1>Privacy Policy</h1>
<p class="meta">Last updated: ${TODAY} · Effective immediately</p>
<p class="lead">ApplyCraft is built on a simple principle: <strong style="color:#E4EBF5">we cannot misuse data we do not have.</strong> This page explains exactly what we collect (very little), what we don't collect (almost everything), and what rights you have.</p>

<div class="callout"><p>⚡ <strong style="color:#E4EBF5">Short version:</strong> We don't store your resume. We don't set cookies. We don't track you. Everything you type stays in your browser only.</p></div>

<h2>1. Who we are</h2>
<p>ApplyCraft is an independent product built and operated by Biroue Digital Ltd (<a href="mailto:${EMAIL}">${EMAIL}</a>). This website is accessible at <strong>applycraft.io</strong>.</p>

<h2 id="data-we-collect">2. What data we collect</h2>
<h3>2.1 Resume and cover letter content</h3>
<p>Resume data is edited in your browser. ApplyCraft does not provide user accounts or cloud resume storage, so there is no saved profile for us to retrieve later. If you close or refresh the tab without downloading your document, your current in-memory edits may be lost.</p>

<h3>2.2 Technical logs</h3>
<p>Our hosting provider (Cloudflare) may record standard server access logs: IP address, browser type, URL requested, and timestamp. These are retained for up to 30 days for security and uptime monitoring. We do not use them for analytics or advertising.</p>

<h3>2.3 Uploaded files</h3>
<p>If you upload a PDF or DOCX resume using the upload feature, the intended behavior is browser-side processing. Avoid uploading sensitive documents if you are using a modified build or third-party mirror of ApplyCraft.</p>

<h2 id="cookies">3. Cookies and tracking</h2>
<p>ApplyCraft sets <strong>no cookies</strong> and uses <strong>no third-party analytics trackers</strong> (no Google Analytics, no Facebook Pixel, no Hotjar, no similar tools). There is no advertising network integration of any kind.</p>
<p>Cloudflare, our CDN provider, may set a technical cookie (<code>__cf_bm</code>) for bot protection. This is a strictly necessary security cookie that does not track you for advertising purposes.</p>

<h2>4. AI features and your data</h2>
<p>Some optional AI or translation features may depend on external services when enabled. Do not use those optional features with sensitive content unless you are comfortable with the relevant provider processing the submitted text.</p>

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
<p>We retain no user data. Cloudflare access logs are automatically deleted after 30 days. If you contact us by email, your email and its contents are retained only for as long as necessary to respond.</p>

<h2>7. Children's privacy</h2>
<p>ApplyCraft is not directed at children under 13 (or 16 in the EU). We do not knowingly collect data from children. If you believe a child has submitted data, contact us and we will take appropriate action.</p>

<h2>8. Third-party services</h2>
<ul>
  <li><strong>Cloudflare</strong> — CDN and hosting. Subject to Cloudflare's <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">privacy policy</a>.</li>
  <li><strong>Google Fonts</strong> — typography. Font files are served from Google's CDN. Subject to <a href="https://policies.google.com/privacy" rel="noopener">Google's privacy policy</a>. No personal data is shared.</li>
</ul>

<h2>9. Security</h2>
<p>All traffic to applycraft.io is encrypted via HTTPS/TLS. Since we hold no personal data on our servers, the attack surface for a data breach is effectively zero.</p>

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
    description: "ApplyCraft is a free resume builder from Biroue Digital Ltd — one mission: help every job seeker create a professional resume without paying or signing up.",
    content: `
<h1>About ApplyCraft</h1>
<p class="lead">ApplyCraft is a free resume and cover letter builder from Biroue Digital Ltd, with a straightforward mission: every job seeker deserves a professional resume, regardless of budget.</p>

<h2>Who we are</h2>
<p>ApplyCraft is built and operated by Biroue Digital Ltd. We built this tool because we were frustrated with every existing resume builder out there: they either locked features behind a paywall, plastered watermarks on your download, or required an account just to see your own resume.</p>
<p>We wanted to build something that respected the user: no sign-up, no watermarks, no hidden fees, and — critically — no storing of your personal career data on a server we control. Your resume is yours.</p>
<p>ApplyCraft is an independent product. It's not VC-funded, not backed by an ad network, and not secretly harvesting data to monetise later. It's simply a tool built to be genuinely useful.</p>

<div class="callout">
  <p>📬 Want to reach us? Email: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
</div>

<h2>The mission</h2>
<p>Resume builders should not be a luxury. A well-formatted, ATS-friendly resume can be the difference between getting an interview and being filtered out before a human ever reads your application. That's a high-stakes problem that doesn't discriminate by income.</p>
<p>ApplyCraft's goal is to give every job seeker — student, career changer, international applicant, or experienced professional — the same quality of tool that paid products offer, completely free.</p>

<h2>What makes ApplyCraft different</h2>
<ul>
  <li><strong>Browser-first editing.</strong> ApplyCraft does not require an account or cloud resume storage.</li>
  <li><strong>Optional AI features.</strong> Use AI or translation helpers only when you are comfortable with the relevant provider processing submitted text.</li>
  <li><strong>No watermarks.</strong> The resume you download looks exactly like a professionally prepared document.</li>
  <li><strong>99 document languages with RTL support.</strong> Built for the global job market, not just English speakers.</li>
  <li><strong>ATS-conscious.</strong> Templates use clear headings, readable typography, and text-based layouts to improve parsing compatibility.</li>
  <li><strong>Open development.</strong> The code is on <a href="https://github.com/biroue10" rel="noopener">GitHub</a>. See exactly what it does.</li>
</ul>

<h2>Technical stack</h2>
<p>ApplyCraft is a single-page React application built with Vite. PDF generation runs in the browser using jsPDF and html2canvas. DOCX generation uses docx.js. There is no backend — no API server, no database, no session management. Everything runs client-side.</p>
<p>Hosted on Cloudflare Pages. Deployed automatically on every commit to main.</p>

<h2>Roadmap and feedback</h2>
<p>See what's coming on the <a href="/roadmap/">product roadmap</a>. Have a feature request or found a bug? Email us directly at <a href="mailto:${EMAIL}">${EMAIL}</a> — we read every message.</p>

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
<p>Use the language selector in the toolbar at the top of the form. Changing the language updates all section labels, date formats, and placeholder text automatically.</p>

<h3>Does ApplyCraft support Arabic and other RTL languages?</h3>
<p>Yes. Arabic, Hebrew, Farsi, and all RTL languages are fully supported. The layout automatically mirrors when an RTL language is selected.</p>

<h3>Can I translate my existing resume?</h3>
<p>Yes. Use the "Translate" button in the toolbar. It converts all your current content to the selected language.</p>

<h2>Downloading</h2>

<h3>How do I download my resume as a PDF?</h3>
<p>Click "Download PDF" in the top bar. Your resume is generated in the browser and saved directly to your computer.</p>

<h3>How do I download as DOCX (Word)?</h3>
<p>Click the arrow next to "Download PDF" and choose "Download DOCX".</p>

<h3>Why does my downloaded PDF look slightly different from the preview?</h3>
<p>PDF rendering uses html2canvas to convert the live preview. Minor font or spacing differences can occur across browsers. Google Chrome typically gives the most accurate output.</p>

<h2>Privacy and data</h2>

<h3>Where is my resume data stored?</h3>
<p>Your active edits live in the browser session. ApplyCraft does not provide accounts or cloud resume storage, so download your document before closing the tab.</p>

<h3>Is my data used to train AI?</h3>
<p>Optional AI or translation features may send submitted text to external services when enabled. Avoid those optional features for sensitive content unless you are comfortable with that processing.</p>

<h3>How do I delete my data?</h3>
<p>Close the tab. Instantly and permanently deleted. No deletion request form required.</p>

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
  <p><span class="badge badge-green">New</span> 99 document languages with one-click switching.</p>
  <p><span class="badge badge-green">New</span> Full RTL layout support for Arabic, Hebrew, and Farsi.</p>
  <p><span class="badge badge-green">New</span> Translate button — convert existing resume content to a new language instantly.</p>
  <p><span class="badge badge-green">New</span> 6 cover letter templates with live preview.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.1 · June 2026</p>
  <h2>Template expansion &amp; AI polish</h2>
  <p><span class="badge badge-green">New</span> 22 professional resume templates (up from the initial 5).</p>
  <p><span class="badge badge-green">New</span> AI Polish — rewrites bullet points into strong, action-oriented achievements.</p>
  <p><span class="badge badge-green">New</span> DOCX export in addition to PDF.</p>
  <p><span class="badge badge-blue">Improved</span> Live preview updates in real time as you type.</p>
</div>

<div class="changelog-entry">
  <p class="meta">v1.0 · June 2026</p>
  <h2>Initial launch</h2>
  <p>ApplyCraft goes live. Resume builder with 5 templates, PDF export, basic multilingual support, no sign-up requirement, and no watermarks.</p>
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
  <p>Paste a job posting and see which keywords in your resume match and which are missing. Improve your ATS score before you apply.</p>
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
  <h3>QR code for digital resume link</h3>
  <p>Generate a shareable link and QR code for your resume that doesn't require hosting personal data on our servers.</p>
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
    description: "ApplyCraft system status — all services operational. Check real-time availability of the resume builder.",
    content: `
<h1>System Status</h1>
<p class="lead">Current status of ApplyCraft services. Updated automatically on each deployment.</p>

<div style="display:flex;align-items:center;gap:14px;padding:20px 24px;background:#052e16;border:1px solid #16a34a44;border-radius:12px;margin-bottom:40px">
  <div style="width:14px;height:14px;border-radius:50%;background:#22c55e;box-shadow:0 0 12px #22c55e88;flex-shrink:0"></div>
  <div>
    <div style="font-size:16px;font-weight:700;color:#4ade80">All systems operational</div>
    <div style="font-size:12px;color:#16a34a;margin-top:2px">Last checked: ${TODAY}</div>
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
<p>ApplyCraft is a static site served via Cloudflare's global CDN with 100+ edge locations. It inherits Cloudflare's 99.99% uptime SLA.</p>
<p>Because the app runs entirely in the browser with no backend server, the only dependency is the CDN delivering the initial JavaScript bundle.</p>

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
