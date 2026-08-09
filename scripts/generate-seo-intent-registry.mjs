import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const SITE = "https://applycraft.io";
const walk = (dir, files = []) => { for (const name of readdirSync(dir)) { const path = join(dir, name); statSync(path).isDirectory() ? walk(path, files) : name === "index.html" && files.push(path); } return files; };
const overlays = {
  "/": ["ApplyCraft", "Discover the complete browser-first resume and job-application workflow", "/resume-builder/"],
  "/fr/": ["ApplyCraft", "Découvrir le parcours ApplyCraft en français", "/fr/creer-cv-gratuit/"],
  "/resume/templates/": ["resume templates", "Browse and select resume designs for different roles, languages and experience levels", "/resume-builder/"],
  "/resume-builder/": ["resume builder", "Create and export a resume", "/resume/templates/"],
  "/free-resume-builder/": ["free resume builder", "Create a no-signup, no-watermark resume", "/resume-builder/"],
  "/ats-resume-builder/": ["ATS resume builder", "Build an ATS-conscious resume", "/ats-checker/"],
  "/ats-checker/": ["ATS checker", "Review an existing resume", "/resume-checker/"],
  "/canadian-resume-builder/": ["Canadian resume builder", "Create a resume for Canadian applications", "/examples/canadian-resume-format/"],
  "/blog/canadian-resume-format-checklist/": ["canadian resume format checklist", "Verify every section before submission", "/examples/canadian-resume-format/"],
  "/blog/canadian-resume-for-immigrants/": ["Canadian resume for immigrants", "Adapt international experience for Canada", "/blog/canadian-resume-format-checklist/"],
  "/blog/how-applycraft-works/": ["how ApplyCraft works", "Understand the complete ApplyCraft product workflow and its differentiators", "/application-pack/"],
  "/blog/teacher-resume-skills-achievements/": ["teacher resume skills", "Learn which teacher skills belong on a resume and prove them through achievements", "/examples/teacher-resume/"],
  "/examples/teacher-resume/": ["teacher resume example", "See a complete teacher resume example", "/blog/teacher-resume-skills-achievements/"],
  "/blog/student-resume-summary-examples/": ["student resume summary", "Write the resume summary or profile section specifically", "/blog/student-resume-no-experience/"],
  "/blog/student-resume-no-experience/": ["student resume no experience", "Build an entire student resume without formal employment history", "/student-resume-builder/"],
  "/student-resume-builder/": ["student resume builder", "Use a guided builder for a student resume", "/blog/student-resume-no-experience/"],
  "/fr/blog/exemple-cv-maroc/": ["exemple CV Maroc", "Comprendre et créer un CV adapté aux candidats du Maroc", "/fr/creer-cv-gratuit/"],
  "/fr/blog/cv-canadien-maroc/": ["CV canadien Maroc", "Adapter un CV aux attentes canadiennes depuis le Maroc", "/fr/creer-cv-canadien/"],
  "/fr/blog/comment-fonctionne-applycraft/": ["comment fonctionne ApplyCraft", "Comprendre le fonctionnement complet d’ApplyCraft et ses différences", "/fr/application-pack/"],
  "/examples/canadian-resume-format/": ["Canadian resume example", "See and edit a complete example", "/canadian-resume-builder/"],
};
const priorityDetails = {
  "/": { routeId:"homepage", secondaryQueries:["ApplyCraft resume tools","resume and cover letter tools"], parentCluster:"product", preferredInternalAnchors:["ApplyCraft","ApplyCraft resume tools","ApplyCraft.io"], relatedPages:["/free-resume-builder/","/resume/templates/"], competingPages:["/free-resume-builder/"], differentiation:"Full ApplyCraft workflow discovery, not only the free resume builder", primaryCta:"/resume-builder/" },
  "/fr/": { routeId:"homepage-fr", secondaryQueries:["outils CV ApplyCraft","créateur CV ApplyCraft"], parentCluster:"product-fr", preferredInternalAnchors:["ApplyCraft","outils de CV ApplyCraft","créer son CV avec ApplyCraft"], relatedPages:["/fr/blog/exemple-cv-maroc/","/fr/modeles-cv/"], competingPages:["/fr/creer-cv-gratuit/"], differentiation:"Découverte du parcours produit complet en français", primaryCta:"/fr/creer-cv-gratuit/" },
  "/resume/templates/": { routeId:"resume-templates", secondaryQueries:["free resume templates","resume designs","PDF resume templates","DOCX resume templates"], parentCluster:"resume-building", preferredInternalAnchors:["resume templates","browse resume designs","choose a resume template","60 resume templates"], relatedPages:["/resume-builder/","/free-resume-builder/"], competingPages:["/resume-builder/"], differentiation:"Browse and select designs rather than edit a resume", primaryCta:"/resume-builder/" },
  "/free-resume-builder/": { routeId:"free-resume-builder", secondaryQueries:["resume builder free","no signup resume builder","no watermark resume builder"], parentCluster:"resume-building", preferredInternalAnchors:["free resume builder","build a resume free","no-signup resume builder"], relatedPages:["/resume/templates/","/resume-builder/"], competingPages:["/"], differentiation:"Free-builder access, privacy and export details rather than full product discovery", primaryCta:"/resume-builder/" },
  "/blog/teacher-resume-skills-achievements/": { routeId:"teacher-skills", secondaryQueries:["teacher skills resume","skills for teacher resume","teacher resume achievements","teaching skills for resume","teacher resume bullet points","teacher accomplishments resume"], parentCluster:"teacher-resume", preferredInternalAnchors:["teacher resume skills","skills to include on a teacher resume","teaching skills and achievements","teacher resume achievement examples"], relatedPages:["/examples/teacher-resume/","/resume/templates/","/resume-builder/","/ats-checker/","/interview-prep/"], competingPages:["/examples/teacher-resume/"], differentiation:"Skills and evidence; the example page owns complete-resume intent", primaryCta:"/resume-builder/" },
  "/examples/teacher-resume/": { routeId:"teacher-example", secondaryQueries:["teaching resume sample","elementary teacher resume example"], parentCluster:"teacher-resume", preferredInternalAnchors:["teacher resume example","complete teacher resume","teacher resume sample"], relatedPages:["/blog/teacher-resume-skills-achievements/","/resume-builder/"], competingPages:["/blog/teacher-resume-skills-achievements/"], differentiation:"Complete document example, not a teacher-skills guide", primaryCta:"/resume-builder/?starter=teacher" },
  "/blog/student-resume-summary-examples/": { routeId:"student-summary", secondaryQueries:["student resume summary examples","resume summary examples for students","college student resume summary","student profile resume examples"], parentCluster:"student-resume", preferredInternalAnchors:["student resume summary examples","write a student resume summary","student profile examples"], relatedPages:["/blog/student-resume-no-experience/","/student-resume-builder/"], competingPages:["/blog/student-resume-no-experience/"], differentiation:"Only the summary/profile section, not the entire resume", primaryCta:"/student-resume-builder/" },
  "/blog/student-resume-no-experience/": { routeId:"student-no-experience", secondaryQueries:["resume for students with no experience","resume for student with no experience","student resumes with no work experience","first resume student","high school resume no experience"], parentCluster:"student-resume", preferredInternalAnchors:["student resume with no experience","build a resume without work experience","first student resume"], relatedPages:["/blog/student-resume-summary-examples/","/student-resume-builder/","/resume/templates/"], competingPages:["/blog/student-resume-summary-examples/"], differentiation:"Complete resume structure and evidence; summary page owns summary intent", primaryCta:"/student-resume-builder/" },
  "/fr/blog/exemple-cv-maroc/": { routeId:"cv-maroc", secondaryQueries:["modèle CV Maroc","CV étudiant Maroc","structure CV Maroc"], parentCluster:"fr-morocco", preferredInternalAnchors:["exemple de CV Maroc","guide du CV marocain","CV adapté au Maroc"], relatedPages:["/fr/","/fr/blog/cv-sans-experience/","/fr/blog/lettre-de-motivation-maroc/","/fr/blog/cv-canadien-maroc/"], competingPages:[], differentiation:"CV for Morocco; Canada and no-experience guides keep their own market and life-stage intents", primaryCta:"/fr/creer-cv-gratuit/" },
  "/fr/blog/cv-canadien-maroc/": { routeId:"cv-canadien-maroc", secondaryQueries:["CV canadien depuis le Maroc","format CV Canada Maroc","candidature Canada depuis le Maroc"], parentCluster:"fr-morocco", preferredInternalAnchors:["CV canadien depuis le Maroc","guide du CV canadien pour les candidats du Maroc","adapter son CV au Canada depuis le Maroc"], relatedPages:["/fr/blog/exemple-cv-maroc/","/fr/blog/checklist-cv-canadien/","/fr/creer-cv-canadien/"], competingPages:["/fr/blog/exemple-cv-maroc/","/fr/blog/checklist-cv-canadien/"], differentiation:"Canadian-market expectations for candidates connected to Morocco; the general Morocco page owns domestic CV intent and the checklist owns final verification", primaryCta:"/fr/creer-cv-canadien/" }
};
const pages = walk(PUBLIC).map((file) => {
  const html = readFileSync(file, "utf8");
  if (/noindex/i.test(html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "")) return null;
  const route = `/${relative(PUBLIC, file).replace(/index\.html$/, "")}`.replace(/\/+/g, "/");
  const title = html.match(/<title>([^<]+)/i)?.[1]?.replace(/\s*\|\s*ApplyCraft.*$/i, "").trim() || route;
  const overlay = overlays[route] || [title.toLowerCase(), `Serve the specific informational or product intent expressed by ${title}`, ""];
  const details = priorityDetails[route] || {};
  return { routeId:details.routeId || route.replace(/^\/|\/$/g,"").replaceAll("/","-") || "homepage", route, locale: route.startsWith("/fr/") ? "fr" : route.startsWith("/ar/") ? "ar" : "en", primaryKeyword: overlay[0], secondaryKeywords: details.secondaryQueries || [], searchIntent: overlay[1], canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || "", parentCluster:details.parentCluster || (route.includes("ats") ? "ats" : route.includes("example") ? "resume-examples" : ""), preferredInternalAnchors:details.preferredInternalAnchors || [], relatedPages:details.relatedPages || [], competingPages:details.competingPages || (overlay[2] ? [overlay[2]] : []), differentiation:details.differentiation || overlay[1], primaryCta:details.primaryCta || overlay[2] };
}).filter(Boolean);
for (const [route, details] of Object.entries(priorityDetails)) {
  if (pages.some((page) => page.route === route)) continue;
  const overlay = overlays[route];
  if (!overlay) continue;
  pages.push({
    routeId: details.routeId,
    route,
    locale: route.startsWith("/fr/") ? "fr" : route.startsWith("/ar/") ? "ar" : "en",
    primaryKeyword: overlay[0],
    secondaryKeywords: details.secondaryQueries || [],
    searchIntent: overlay[1],
    canonical: `${SITE}${route}`,
    parentCluster: details.parentCluster,
    preferredInternalAnchors: details.preferredInternalAnchors || [],
    relatedPages: details.relatedPages || [],
    competingPages: details.competingPages || [],
    differentiation: details.differentiation,
    primaryCta: details.primaryCta,
  });
}
pages.sort((a, b) => a.route.localeCompare(b.route));
writeFileSync(join(PUBLIC, "seo-intent-registry.json"), `${JSON.stringify({ schemaVersion: 1, pages }, null, 2)}\n`);
console.log(`✓ SEO intent registry: ${pages.length} public pages`);
