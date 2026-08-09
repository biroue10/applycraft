import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { headerHtml } from "./shared-header.mjs";
import { footerHtml } from "./shared-footer.mjs";
import { articleForRoute, editorialDateMarkup } from "./article-dates.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://applycraft.io";
const IMAGE = "/blog/cv-francais-arabe-rtl.webp";

const articles = [
  {
    locale: "en",
    route: "/blog/bilingual-resume-template-arabic-english-french/",
    alternate: "/fr/blog/modele-cv-bilingue-francais-anglais-arabe/",
    title: "Bilingual Resume Template: Arabic, English and French",
    seoTitle: "Bilingual Resume: Arabic, English & French | ApplyCraft",
    description: "Create a bilingual Arabic, English or French resume with clear LTR and RTL layouts, translation rules, ATS guidance and a free template.",
    category: "Multilingual Resumes",
    lead: "A bilingual resume is not two documents squeezed onto one page. It is a controlled set of language versions that preserves the same facts while adapting direction, labels and market conventions.",
    imageAlt: "French and Arabic resume versions with left-to-right and right-to-left layouts",
    cta: "Create your multilingual resume free",
    ctaHref: "/resume-builder/?ui=en&docLang=en",
    back: "← All articles",
    faqHeading: "Frequently asked questions",
    sections: [
      ["Choose one bilingual resume strategy", "Use separate language versions for most applications. A side-by-side bilingual resume is useful only when the employer explicitly wants both languages in one document.", ["Separate English, French and Arabic files for ATS applications", "One bilingual PDF for portfolios, networking or bilingual client work", "A clear filename for each version, such as Maya-Benali-Resume-EN.pdf"]],
      ["Keep facts identical across every version", "Names, employers, dates, qualifications and metrics must remain consistent. Translate the explanation, not the evidence. Never upgrade a job title or invent a diploma equivalence to make a translation sound stronger."],
      ["Format English and French LTR versions", "English and French read from left to right. Use familiar headings, readable typography and a simple hierarchy. Adapt photo use, personal details and page length to the target market instead of copying one country’s conventions everywhere."],
      ["Build a true Arabic RTL resume", "Arabic requires more than right-aligned text. Document direction, columns, punctuation, dates and section order must work right to left, while email addresses, URLs, technologies and many numbers remain readable.", ["Use an embedded font that supports Arabic", "Mirror layout elements without reversing the meaning of the content", "Inspect mixed Arabic and Latin lines in the exported PDF", "Keep official software and certification names accurate"]],
      ["Protect ATS readability in every language", "Use selectable text, conventional section headings and a restrained layout. Match truthful keywords from the vacancy in the employer’s language. Avoid putting three languages in one ATS file unless the posting requests it."],
      ["Final bilingual resume checklist", "Compare every version line by line before sending.", ["Identical contact details, dates, metrics and employer names", "Natural professional translation reviewed in context", "Correct LTR or RTL direction and punctuation", "Working links and selectable PDF text", "A filename that identifies the language"]],
    ],
    faqs: [
      ["Should I put two languages on the same resume?", "Usually no. Separate versions are easier for recruiters and ATS software. Use a combined layout only when the audience expects it."],
      ["Can an ATS read an Arabic resume?", "Some systems can, but support varies. Use real Unicode text, a simple layout and the language requested in the vacancy."],
      ["Should company and software names be translated?", "Keep official company, product, software and certification names unchanged unless an official localized name exists."],
      ["How should language proficiency be shown?", "Use a precise level such as native, fluent, professional working proficiency or a recognized CEFR level when appropriate."],
    ],
  },
  {
    locale: "fr",
    route: "/fr/blog/modele-cv-bilingue-francais-anglais-arabe/",
    alternate: "/blog/bilingual-resume-template-arabic-english-french/",
    title: "Modèle de CV bilingue français, anglais et arabe",
    seoTitle: "CV bilingue français, anglais et arabe | ApplyCraft",
    description: "Créez un CV bilingue français, anglais ou arabe avec mises en page LTR et RTL, règles de traduction, conseils ATS et modèle gratuit.",
    category: "CV multilingue",
    lead: "Un CV bilingue efficace ne juxtapose pas deux traductions au hasard. Il conserve les mêmes faits tout en adaptant la langue, le sens de lecture, les libellés et les conventions du marché ciblé.",
    imageAlt: "Versions française et arabe d’un CV avec mises en page LTR et RTL",
    cta: "Créer gratuitement mon CV multilingue",
    ctaHref: "/resume-builder/?ui=fr&docLang=fr",
    back: "← Tous les articles",
    faqHeading: "Questions fréquentes",
    sections: [
      ["Choisir la bonne stratégie bilingue", "Pour une candidature en ligne, envoyez généralement une version distincte par langue. Un CV bilingue sur une seule page convient surtout au réseautage, aux portfolios et aux postes exigeant explicitement deux langues.", ["Un fichier français, un fichier anglais et un fichier arabe pour les ATS", "Un document combiné uniquement lorsque le recruteur le demande", "Un nom explicite comme Maya-Benali-CV-FR.pdf"]],
      ["Conserver exactement les mêmes informations", "Les employeurs, dates, diplômes, chiffres et résultats doivent être identiques dans chaque version. Traduisez l’explication sans embellir le poste ni inventer une équivalence de diplôme."],
      ["Structurer les versions française et anglaise", "Le français et l’anglais utilisent une lecture de gauche à droite. Gardez des rubriques standards, une typographie lisible et une hiérarchie simple. Adaptez toutefois la photo, les données personnelles et la longueur aux usages du pays."],
      ["Créer une véritable version arabe RTL", "Il ne suffit pas d’aligner le texte à droite. La direction du document, les colonnes, la ponctuation et l’ordre visuel doivent fonctionner de droite à gauche, tout en préservant la lisibilité des e-mails, URL, technologies et nombres.", ["Utiliser une police compatible avec l’arabe", "Inverser la mise en page sans modifier le sens du contenu", "Contrôler les lignes mêlant arabe et caractères latins", "Conserver les noms officiels des logiciels et certifications"]],
      ["Maintenir la compatibilité ATS", "Utilisez du texte sélectionnable, des rubriques conventionnelles et une mise en page sobre. Reprenez uniquement les mots-clés réels de l’offre, dans la langue employée par le recruteur. Évitez un fichier trilingue si l’annonce ne le demande pas."],
      ["Checklist avant l’envoi", "Comparez chaque version ligne par ligne.", ["Coordonnées, dates, chiffres et employeurs identiques", "Traduction professionnelle naturelle et contextualisée", "Direction LTR ou RTL et ponctuation correctes", "Liens fonctionnels et texte PDF sélectionnable", "Nom du fichier indiquant clairement la langue"]],
    ],
    faqs: [
      ["Faut-il mettre deux langues sur le même CV ?", "En général, non. Des versions séparées sont plus simples pour le recruteur et les ATS. Combinez-les seulement si le contexte l’exige."],
      ["Un ATS peut-il lire un CV en arabe ?", "Certains systèmes le peuvent, mais leur prise en charge varie. Utilisez du texte Unicode, une structure simple et la langue demandée dans l’offre."],
      ["Faut-il traduire les noms d’entreprises et de logiciels ?", "Conservez les noms officiels des entreprises, produits, logiciels et certifications, sauf s’il existe une appellation localisée officielle."],
      ["Comment indiquer son niveau de langue ?", "Utilisez un niveau précis : langue maternelle, courant, professionnel ou un niveau CECRL reconnu lorsque cela est pertinent."],
    ],
  },
];

const esc = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function articleHtml(article) {
  const canonical = `${SITE}${article.route}`;
  const dates = articleForRoute(article.route);
  const alternateLocale = article.locale === "fr" ? "en" : "fr";
  const home = article.locale === "fr" ? "/fr/" : "/";
  const blog = article.locale === "fr" ? "/fr/blog/" : "/blog/";
  const body = article.sections.map(([heading, text, bullets]) => `
<h2>${esc(heading)}</h2><p>${esc(text)}</p>${bullets ? `<ul>${bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}`).join("");
  const faqBody = article.faqs.map(([question, answer]) => `<h3>${esc(question)}</h3><p>${esc(answer)}</p>`).join("");
  const faqSchema = article.faqs.map(([question, answer]) => ({
    "@type": "Question", name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  }));
  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: article.title, description: article.description,
    image: `${SITE}${IMAGE}`, datePublished: dates.datePublished, ...(dates.dateModified ? { dateModified: dates.dateModified } : {}),
    inLanguage: article.locale,
    author: { "@type": "Person", name: "Isaac Biroue", url: `${SITE}/about/` },
    publisher: { "@type": "Organization", name: "ApplyCraft", url: `${SITE}/` },
    mainEntityOfPage: canonical,
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: article.locale === "fr" ? "Accueil" : "Home", item: `${SITE}${home}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}${blog}` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };
  return `<!doctype html><html lang="${article.locale}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(article.seoTitle)}</title><meta name="description" content="${esc(article.description)}">
<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="${article.locale}" href="${canonical}">
<link rel="alternate" hreflang="${alternateLocale}" href="${SITE}${article.alternate}">
<link rel="alternate" hreflang="x-default" href="${SITE}${article.locale === "en" ? article.route : article.alternate}">
<meta property="og:type" content="article"><meta property="og:site_name" content="ApplyCraft">
<meta property="og:title" content="${esc(article.title)}"><meta property="og:description" content="${esc(article.description)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}${IMAGE}">
<meta property="og:image:width" content="1599"><meta property="og:image:height" content="900">
<meta property="article:published_time" content="${dates.datePublished}T00:00:00Z">${dates.dateModified ? `<meta property="article:modified_time" content="${dates.dateModified}T00:00:00Z">` : ""}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(article.title)}">
<meta name="twitter:description" content="${esc(article.description)}"><meta name="twitter:image" content="${SITE}${IMAGE}">
<link rel="icon" href="/favicon.ico?v=2"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="manifest" href="/site.webmanifest?v=2"><link rel="stylesheet" href="/_seo.css">
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchema })}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<style>.prose{max-width:780px;margin:auto;padding:48px 24px 100px}.back{display:inline-block;margin-bottom:28px;color:#818cf8;font-weight:700;text-decoration:none}.meta{display:flex;gap:10px;flex-wrap:wrap;color:#8b9eb8;font-size:12px;text-transform:uppercase;letter-spacing:1px}.tag{padding:3px 10px;border-radius:999px;background:#1e293b;color:#a5b4fc}.prose h1{font-size:clamp(30px,5vw,46px);line-height:1.12;color:#eef2ff}.lead{font-size:18px!important}.prose figure{margin:30px 0 44px}.prose img{display:block;width:100%;height:auto;border:1px solid #253753;border-radius:14px}.prose figcaption{margin-top:8px;color:#8b9eb8;font-size:12px}.prose h2{margin:44px 0 12px;color:#e4ebf5;font-size:24px}.prose h3{margin:28px 0 8px;color:#c0cadb}.prose p,.prose li{color:#94a3b8;font-size:15.5px;line-height:1.85}.prose a{color:#a5b4fc}.cta{margin-top:48px;padding:24px;border:1px solid #253753;border-radius:14px;background:#101827}.cta a{font-weight:800}@media(max-width:680px){.prose{padding:38px 18px 80px}}</style>
<script src="/consent.js" defer></script></head><body>${headerHtml(article.locale, article.route)}
<main id="main-content" tabindex="-1"><article class="prose"><a class="back" href="${blog}">${article.back}</a>
<div class="meta"><span class="tag">${esc(article.category)}</span>${editorialDateMarkup(dates)}</div>
<h1>${esc(article.title)}</h1><p class="lead">${esc(article.lead)}</p>
<figure><img src="${IMAGE}" width="1599" height="900" alt="${esc(article.imageAlt)}" decoding="async"><figcaption>${esc(article.imageAlt)}</figcaption></figure>
${body}<h2>${article.faqHeading}</h2>${faqBody}
<div class="cta"><a href="${article.ctaHref}">${esc(article.cta)} →</a></div>
</article></main>${footerHtml(article.locale)}</body></html>`;
}

for (const article of articles) {
  const directory = join(ROOT, "public", article.route.replace(/^\/|\/$/g, ""));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), articleHtml(article), "utf8");
  console.log(`✓ ${article.route}`);
}
