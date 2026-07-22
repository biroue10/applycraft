import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { footerHtml } from "./shared-footer.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const ORIGIN = "https://applycraft.io";
const hubs = [
  { slug: "international-job-applications", title: "International Job Application Resources", description: "Practical resume, CV and cover-letter guidance for candidates applying across countries and languages.", intro: "International applications are easier to manage when your core career evidence stays consistent while format, terminology and language adapt to the target market. These resources explain the differences without presenting country guidance as an absolute rule.", groups: [
    ["Country and language guides", [["Canadian resume example", "/examples/canadian-resume-format/"], ["Canadian resume checklist", "/blog/canadian-resume-format-checklist/"], ["Canadian resume builder", "/canadian-resume-builder/"], ["Resume in French", "/resume-in-french/"], ["Resume in Arabic", "/resume-in-arabic/"], ["CV Canada from Morocco", "/fr/blog/cv-canadien-maroc/"]]],
    ["Build the application", [["Resume templates", "/resume/templates/"], ["Cover-letter builder", "/cover-letter-builder/"], ["Application Pack", "/application-pack/"]]],
  ]},
  { slug: "ats-resume-resources", title: "ATS Resume Resources", description: "Understand ATS-conscious formatting, keyword evidence, file choices and what automated checkers can and cannot tell you.", intro: "An ATS review can identify readability and matching issues, but it cannot reproduce every employer system or guarantee an outcome. Use these resources to make truthful qualifications easier to extract and verify.", groups: [
    ["Check and build", [["ATS checker", "/ats-checker/"], ["ATS resume builder", "/ats-resume-builder/"], ["Resume builder", "/resume-builder/"]]],
    ["Learn the limits", [["How to write an ATS-friendly resume", "/blog/how-to-write-an-ats-friendly-resume/"], ["What a free ATS checker checks and misses", "/blog/free-ats-resume-checker-what-it-checks-and-misses/"], ["Canadian ATS checklist", "/blog/canadian-resume-format-checklist/"]]],
  ]},
  { slug: "job-application-workflow", title: "Job Application Workflow", description: "Connect job requirements, document versions, follow-ups and interview preparation in one clear workflow.", intro: "A strong application is more than a single resume. Keep the role context, exact resume and cover-letter versions, ATS review, follow-up and interview preparation connected while retaining control of what is stored.", groups: [
    ["Create and review", [["Application Pack", "/application-pack/"], ["Master Profile", "/master-profile"], ["Resume builder", "/resume-builder/"], ["Cover-letter builder", "/cover-letter-builder/"], ["ATS checker", "/ats-checker/"]]],
    ["Track and prepare", [["Job Tracker", "/job-tracker/"], ["Interview Prep", "/interview-prep/"], ["Privacy disclosure", "/privacy/"]]],
  ]},
  { slug: "resume-examples-by-role", title: "Resume Examples by Role", description: "Role-specific resume examples with practical evidence and skills for common career paths.", intro: "Use role examples as a structure reference, then replace every detail with your own truthful experience. The strongest version reflects the target posting and shows evidence rather than copying generic responsibilities.", groups: [
    ["Technology and data", [["IT support technician", "/examples/it-support-technician-resume/"], ["Data analyst", "/examples/data-analyst-resume/"], ["Linux system administrator", "/linux-system-administrator-resume/"]]],
    ["Business and service", [["Project manager", "/examples/project-manager-resume/"], ["Customer service", "/examples/customer-service-resume/"], ["Administrative assistant", "/examples/administrative-assistant-resume/"], ["All examples", "/examples/"]]],
  ]},
];

for (const hub of hubs) {
  const canonical = `${ORIGIN}/${hub.slug}/`;
  const groups = hub.groups.map(([heading, links]) => `<section><h2>${heading}</h2><div class="cards">${links.map(([label, href]) => `<a href="${href}"><h3>${label}</h3><p>Open this focused ApplyCraft resource and continue with the relevant tool or guidance.</p></a>`).join("")}</div></section>`).join("");
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: hub.title, description: hub.description, url: canonical, breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ApplyCraft", item: `${ORIGIN}/` }, { "@type": "ListItem", position: 2, name: hub.title, item: canonical }] } });
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${hub.title} | ApplyCraft</title><meta name="description" content="${hub.description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="ApplyCraft.io"><meta property="og:title" content="${hub.title}"><meta property="og:description" content="${hub.description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${ORIGIN}/og/home.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${hub.title}"><meta name="twitter:description" content="${hub.description}"><meta name="twitter:image" content="${ORIGIN}/og/home.png"><link rel="stylesheet" href="/_seo.css"><link rel="icon" href="/favicon.ico?v=2"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"><link rel="manifest" href="/site.webmanifest?v=2"><script type="application/ld+json">${schema}</script><script src="/consent.js" defer></script><style>.hub{max-width:1040px;margin:auto;padding:96px 24px}.hub>header{max-width:760px;margin-bottom:48px}.hub h1{font-size:clamp(34px,6vw,60px);color:#eef2ff}.hub p{color:#aab7ca;line-height:1.75}.hub section{margin-top:44px}.hub h2,.hub h3{color:#e4ebf5}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}.cards a{padding:20px;background:#0d1117;border:1px solid #24324a;border-radius:12px;text-decoration:none}.cards a:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}</style></head><body><main class="hub"><header><p>ApplyCraft resource hub</p><h1>${hub.title}</h1><p>${hub.intro}</p></header>${groups}</main>${footerHtml("en")}</body></html>`;
  const dir = join(ROOT, "public", hub.slug);
  mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, "index.html"), html);
  console.log(`✓ /${hub.slug}/`);
}
