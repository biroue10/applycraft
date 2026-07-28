import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = process.env.APPLYCRAFT_GENERATED_OUTPUT_ROOT
  ? path.resolve(process.env.APPLYCRAFT_GENERATED_OUTPUT_ROOT)
  : root;
const publishedAt = "2026-07-29";
const enRoute = "/blog/multilingual-resume-template-design-study/";
const frRoute = "/fr/blog/etude-modeles-cv-multilingues/";
const download = "/downloads/ats-multilingual-resume-checklist.pdf";

const css = `<style>
.prose{max-width:820px;margin:auto;padding:48px 24px 100px}.back{display:inline-block;margin-bottom:28px;color:#a78bfa;font-weight:700;text-decoration:none}.meta{display:flex;gap:10px;flex-wrap:wrap;color:#8b9eb8;font-size:12px;text-transform:uppercase;letter-spacing:1px}.tag{padding:3px 10px;border-radius:999px;background:#1e293b;color:#c4b5fd}.prose h1{font-size:clamp(30px,5vw,46px);line-height:1.12;color:#eef2ff}.lead{font-size:18px!important}.prose h2{margin:44px 0 12px;color:#e4ebf5;font-size:24px}.prose h3{margin:28px 0 8px;color:#c0cadb}.prose p,.prose li{color:#a5b3c7;font-size:15.5px;line-height:1.85}.prose a{color:#c4b5fd}.study-note,.download-box{margin:28px 0;padding:22px;border:1px solid #334766;border-radius:14px;background:#101827}.study-note strong,.download-box strong{color:#eef2ff}.results{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:28px 0}.result{padding:18px;border:1px solid #334766;border-radius:12px;background:#101827}.result b{display:block;color:#c4b5fd;font-size:28px}.result span{color:#9fb0c7;font-size:13px}.prose table{width:100%;border-collapse:collapse;margin:24px 0;color:#a5b3c7}.prose th,.prose td{padding:11px 12px;border:1px solid #334766;text-align:left}.prose th{color:#eef2ff;background:#141f32}.download-button{display:inline-block;margin-top:12px;padding:12px 18px;border-radius:9px;background:linear-gradient(135deg,#9333ea,#2563eb);color:#fff!important;font-weight:800;text-decoration:none}.source-list{font-size:13px}.method-version{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:#c4b5fd}.cta{margin-top:48px;padding:24px;border:1px solid #334766;border-radius:14px;background:#101827}.cta a{font-weight:800}@media(max-width:680px){.prose{padding:38px 18px 80px}.results{grid-template-columns:1fr 1fr}.prose table{font-size:13px}.prose th,.prose td{padding:8px}}
</style>`;

function head({ lang, title, description, route, alternateRoute, imageAlt }) {
  const url = `https://applycraft.io${route}`;
  const alternate = `https://applycraft.io${alternateRoute}`;
  const headline = lang === "fr"
    ? "Étude de 60 modèles de CV multilingues"
    : "60 Resume Templates: Multilingual Design Study";
  const home = lang === "fr" ? "Accueil" : "Home";
  const datasetName = lang === "fr"
    ? "Audit de conception de 60 modèles de CV ApplyCraft"
    : "ApplyCraft audit of 60 resume template designs";
  const datasetDescription = lang === "fr"
    ? "Audit reproductible des métadonnées de 60 modèles actifs : familles typographiques, marchés déclarés, couleurs et localisation."
    : "Reproducible audit of 60 active template metadata records covering type families, declared markets, colors and localization.";
  return `<title>${title}</title><meta name="description" content="${description}">
<link rel="canonical" href="${url}"><link rel="alternate" hreflang="${lang}" href="${url}">
<link rel="alternate" hreflang="${lang === "fr" ? "en" : "fr"}" href="${alternate}">
<link rel="alternate" hreflang="x-default" href="https://applycraft.io${enRoute}">
<meta property="og:type" content="article"><meta property="og:site_name" content="ApplyCraft.io">
<meta property="og:title" content="${headline}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${url}"><meta property="og:image" content="https://applycraft.io/og/blog.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${imageAlt}">
<meta property="article:published_time" content="${publishedAt}T00:00:00+00:00">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${headline}">
<meta name="twitter:description" content="${description}"><meta name="twitter:image" content="https://applycraft.io/og/blog.png">
<link rel="icon" href="/favicon.ico?v=2"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="manifest" href="/site.webmanifest?v=2"><link rel="stylesheet" href="/_seo.css">
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline,
        description,
        image: "https://applycraft.io/og/blog.png",
        datePublished: publishedAt,
        dateModified: publishedAt,
        inLanguage: lang,
        author: { "@type": "Person", name: "Isaac Biroue", url: "https://applycraft.io/about/" },
        publisher: { "@type": "Organization", name: "ApplyCraft.io", url: "https://applycraft.io/" },
        mainEntityOfPage: url,
      },
      {
        "@type": "Dataset",
        name: datasetName,
        description: datasetDescription,
        creator: { "@type": "Organization", name: "ApplyCraft.io", url: "https://applycraft.io/" },
        datePublished: publishedAt,
        inLanguage: ["en", "fr"],
        measurementTechnique: "Deterministic audit of the public template registry metadata at publication time",
        variableMeasured: ["Font family category", "Declared target market", "Accent color", "Localization metadata", "Layout inheritance"],
        isBasedOn: "https://github.com/biroue10/applycraft/blob/main/src/documents/templateRegistry.js",
        distribution: {
          "@type": "DataDownload",
          encodingFormat: "application/pdf",
          contentUrl: `https://applycraft.io${download}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: home, item: `https://applycraft.io/${lang === "fr" ? "fr/" : ""}` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `https://applycraft.io/${lang === "fr" ? "fr/" : ""}blog/` },
          { "@type": "ListItem", position: 3, name: headline, item: url },
        ],
      },
    ],
  })}</script>
${css}`;
}

const enArticle = `<article class="prose"><a class="back" href="/blog/">← All articles</a>
<div class="meta"><span class="tag">Original Research</span><span>${publishedAt}</span><span>· 11 min read</span></div>
<h1>60 Resume Templates: Multilingual Design Study</h1>
<p class="lead">We audited the complete set of 60 active resume templates in ApplyCraft's public template registry to measure design diversity, declared market coverage and the depth of multilingual presentation metadata.</p>
<div class="study-note"><strong>What this study does - and does not - measure.</strong><p>This is an internal, reproducible design-inventory audit. It does not claim that one layout wins more interviews, and it does not represent employer or applicant behavior. Results describe the template metadata as it existed on July 29, 2026.</p></div>
<h2>Key findings</h2>
<div class="results"><div class="result"><b>60</b><span>active templates audited</span></div><div class="result"><b>73.3%</b><span>use sans-serif typography</span></div><div class="result"><b>31</b><span>distinct accent colors</span></div><div class="result"><b>58.3%</b><span>declare three target markets</span></div><div class="result"><b>14</b><span>have rich EN/FR/AR gallery metadata</span></div><div class="result"><b>5</b><span>market groupings represented</span></div></div>
<h2>Methodology</h2>
<p>We evaluated every non-blank record in the public <a href="https://github.com/biroue10/applycraft/blob/main/src/documents/templateRegistry.js" rel="noopener">ApplyCraft template registry</a>. A deterministic script counted values already declared in source metadata. We excluded the blank, unstyled output and included 60 active designs.</p>
<ul><li><strong>Typography:</strong> classified from the declared font stack as sans-serif, serif or monospace.</li><li><strong>Market coverage:</strong> counted from declared Morocco, Canada, France, international and Gulf tags. Counts overlap because one template can target several markets.</li><li><strong>Color diversity:</strong> counted from unique declared hexadecimal accent colors.</li><li><strong>Localization depth:</strong> required dedicated English, French and Arabic gallery descriptions.</li><li><strong>Layout lineage:</strong> distinguished base layouts from designs that explicitly inherit a variant.</li></ul>
<p class="method-version">Corpus: templateRegistry.js · 2026-07-29 · blank template excluded</p>
<h2>Typography favors scanning, but not uniformity</h2>
<table><thead><tr><th>Typography category</th><th>Templates</th><th>Share</th></tr></thead><tbody><tr><td>Sans-serif</td><td>44</td><td>73.3%</td></tr><tr><td>Serif</td><td>14</td><td>23.3%</td></tr><tr><td>Monospace</td><td>2</td><td>3.3%</td></tr></tbody></table>
<p>The inventory strongly favors sans-serif type, which supports compact interfaces and multilingual font fallback. Serif designs remain available for academic, legal, finance and formal applications. The two monospace designs serve a narrower technical aesthetic; this is a design choice, not evidence of ATS performance.</p>
<h2>Declared market coverage is intentionally overlapping</h2>
<table><thead><tr><th>Declared market</th><th>Templates</th><th>Share of corpus</th></tr></thead><tbody><tr><td>France</td><td>41</td><td>68.3%</td></tr><tr><td>Morocco</td><td>37</td><td>61.7%</td></tr><tr><td>Canada</td><td>31</td><td>51.7%</td></tr><tr><td>International</td><td>31</td><td>51.7%</td></tr><tr><td>Gulf</td><td>25</td><td>41.7%</td></tr></tbody></table>
<p>These percentages must not be added together. Twenty templates declare two markets, 35 declare three, and five declare four. The overlap reflects candidates who apply across borders or languages, but a market tag alone does not guarantee that every convention is appropriate for every employer.</p>
<h2>Color variety is high; structural variety is more concentrated</h2>
<p>The 60 templates use 31 distinct accent colors. Underneath that visual variety, 22 records are base layouts and 38 explicitly reuse a layout variant. Reusing a tested information hierarchy can improve consistency, while color, typography and spacing create visual differentiation. It also means template count should never be treated as 60 entirely unrelated document structures.</p>
<h2>Rich multilingual metadata is the clearest improvement area</h2>
<p>Fourteen templates include dedicated English, French and Arabic gallery descriptions, intended use and layout labels. The application can render documents in these languages beyond those 14 records, but the audit measures only explicit presentation metadata. Expanding this layer would help candidates choose designs based on market and direction rather than appearance alone.</p>
<h2>What candidates should do with these findings</h2>
<ul><li>Choose structure for the target role and market before choosing color.</li><li>Use the language requested by the vacancy and create separate versions when needed.</li><li>Check whether photo, personal-data and length conventions fit the destination.</li><li>Export the document, select its text and inspect the reading order.</li><li>Test content quality separately; a clean template cannot repair weak evidence.</li></ul>
<div class="download-box"><strong>Free downloadable resource</strong><p>Use the two-page English/French ATS and multilingual resume checklist before every application.</p><a class="download-button" href="${download}" download>Download the PDF checklist</a></div>
<h2>Limitations and update policy</h2>
<p>This audit studies ApplyCraft's own inventory, so it should be read as transparent product research rather than an industry-wide benchmark. It does not test third-party ATS systems, recruiter preferences or hiring outcomes. Because the registry can change, the publication date and source link are provided for reproducibility. Material changes to the corpus should trigger a revised edition.</p>
<h2>How to cite this study</h2>
<p>Biroue, Isaac. “60 Resume Templates: Multilingual Design Study.” ApplyCraft.io, July 29, 2026. ${`https://applycraft.io${enRoute}`}</p>
<p class="source-list"><strong>Primary source:</strong> public template registry. <strong>Author:</strong> Isaac Biroue. <strong>Publisher:</strong> ApplyCraft.io / Biroue Digital Ltd.</p>
<div class="cta"><a href="/resume/templates/">Explore the audited resume templates →</a></div>
</article>`;

const frArticle = `<article class="prose"><a class="back" href="/fr/blog/">← Tous les articles</a>
<div class="meta"><span class="tag">Étude originale</span><span>${publishedAt}</span><span>· 11 min de lecture</span></div>
<h1>Étude de 60 modèles de CV multilingues</h1>
<p class="lead">Nous avons audité les 60 modèles de CV actifs du registre public ApplyCraft afin de mesurer la diversité graphique, les marchés déclarés et la profondeur des métadonnées multilingues.</p>
<div class="study-note"><strong>Ce que cette étude mesure - et ne mesure pas.</strong><p>Il s'agit d'un audit interne et reproductible de l'inventaire graphique. Il ne prétend pas qu'une mise en page obtient davantage d'entretiens et ne représente pas le comportement des recruteurs ou des candidats. Les résultats décrivent les métadonnées au 29 juillet 2026.</p></div>
<h2>Résultats principaux</h2>
<div class="results"><div class="result"><b>60</b><span>modèles actifs audités</span></div><div class="result"><b>73,3 %</b><span>utilisent une police sans-serif</span></div><div class="result"><b>31</b><span>couleurs d'accent distinctes</span></div><div class="result"><b>58,3 %</b><span>déclarent trois marchés</span></div><div class="result"><b>14</b><span>ont des métadonnées EN/FR/AR riches</span></div><div class="result"><b>5</b><span>groupes de marchés représentés</span></div></div>
<h2>Méthodologie</h2>
<p>Nous avons analysé chaque entrée non vide du <a href="https://github.com/biroue10/applycraft/blob/main/src/documents/templateRegistry.js" rel="noopener">registre public de modèles ApplyCraft</a>. Un script déterministe a compté les valeurs déclarées dans le code source. Le modèle vide, sans style, a été exclu ; le corpus contient donc 60 modèles actifs.</p>
<ul><li><strong>Typographie :</strong> classification de la pile de polices en sans-serif, serif ou monospace.</li><li><strong>Marchés :</strong> comptage des étiquettes Maroc, Canada, France, international et Golfe. Les valeurs se chevauchent.</li><li><strong>Couleurs :</strong> nombre de couleurs d'accent hexadécimales distinctes.</li><li><strong>Localisation :</strong> présence de descriptions dédiées en anglais, français et arabe.</li><li><strong>Structure :</strong> distinction entre mises en page de base et variantes explicitement héritées.</li></ul>
<p class="method-version">Corpus : templateRegistry.js · 2026-07-29 · modèle vide exclu</p>
<h2>La typographie privilégie la lecture rapide</h2>
<table><thead><tr><th>Catégorie typographique</th><th>Modèles</th><th>Part</th></tr></thead><tbody><tr><td>Sans-serif</td><td>44</td><td>73,3 %</td></tr><tr><td>Serif</td><td>14</td><td>23,3 %</td></tr><tr><td>Monospace</td><td>2</td><td>3,3 %</td></tr></tbody></table>
<p>Les polices sans-serif dominent et facilitent les interfaces compactes ainsi que le repli vers des polices multilingues. Les modèles serif restent utiles pour les candidatures académiques, juridiques, financières ou formelles. Les deux modèles monospace correspondent à une esthétique technique ; ce choix ne constitue pas une preuve de performance ATS.</p>
<h2>La couverture des marchés se chevauche</h2>
<table><thead><tr><th>Marché déclaré</th><th>Modèles</th><th>Part du corpus</th></tr></thead><tbody><tr><td>France</td><td>41</td><td>68,3 %</td></tr><tr><td>Maroc</td><td>37</td><td>61,7 %</td></tr><tr><td>Canada</td><td>31</td><td>51,7 %</td></tr><tr><td>International</td><td>31</td><td>51,7 %</td></tr><tr><td>Golfe</td><td>25</td><td>41,7 %</td></tr></tbody></table>
<p>Ces pourcentages ne doivent pas être additionnés. Vingt modèles déclarent deux marchés, 35 en déclarent trois et cinq en déclarent quatre. Ce chevauchement correspond aux parcours internationaux, mais une étiquette de marché ne garantit pas que toutes les conventions conviennent à chaque employeur.</p>
<h2>La variété des couleurs dépasse celle des structures</h2>
<p>Les 60 modèles utilisent 31 couleurs d'accent distinctes. Sous cette diversité visuelle, 22 entrées sont des mises en page de base et 38 réutilisent explicitement une variante. La réutilisation d'une hiérarchie éprouvée améliore la cohérence, tandis que la couleur, la police et l'espacement différencient le rendu. Il ne faut donc pas interpréter les 60 modèles comme 60 structures entièrement indépendantes.</p>
<h2>La localisation détaillée reste le principal axe de progrès</h2>
<p>Quatorze modèles disposent de descriptions, usages conseillés et libellés dédiés en anglais, français et arabe. L'application peut produire des documents dans ces langues au-delà de ces 14 entrées, mais l'audit ne compte que les métadonnées de présentation explicites. Enrichir cette couche aiderait à choisir selon le marché et le sens de lecture, plutôt que selon l'apparence seule.</p>
<h2>Comment utiliser ces résultats</h2>
<ul><li>Choisir la structure selon le métier et le marché avant de choisir la couleur.</li><li>Employer la langue demandée dans l'offre et créer des versions séparées si nécessaire.</li><li>Vérifier les conventions relatives à la photo, aux données personnelles et à la longueur.</li><li>Exporter le document, sélectionner son texte et contrôler l'ordre de lecture.</li><li>Évaluer le contenu séparément : un bon modèle ne corrige pas des preuves insuffisantes.</li></ul>
<div class="download-box"><strong>Ressource gratuite à télécharger</strong><p>Utilisez la checklist bilingue de deux pages pour contrôler la compatibilité ATS et les versions multilingues avant chaque candidature.</p><a class="download-button" href="${download}" download>Télécharger la checklist PDF</a></div>
<h2>Limites et politique de mise à jour</h2>
<p>Cet audit porte sur l'inventaire d'ApplyCraft. Il s'agit donc d'une recherche produit transparente et non d'une référence couvrant toute l'industrie. Il ne teste ni les ATS tiers, ni les préférences des recruteurs, ni les résultats d'embauche. La date et la source sont publiées afin de permettre la reproduction. Une modification importante du corpus devra entraîner une nouvelle édition.</p>
<h2>Comment citer cette étude</h2>
<p>Biroue, Isaac. « Étude de 60 modèles de CV multilingues ». ApplyCraft.io, 29 juillet 2026. ${`https://applycraft.io${frRoute}`}</p>
<p class="source-list"><strong>Source primaire :</strong> registre public des modèles. <strong>Auteur :</strong> Isaac Biroue. <strong>Éditeur :</strong> ApplyCraft.io / Biroue Digital Ltd.</p>
<div class="cta"><a href="/fr/modeles-cv/">Découvrir les modèles audités →</a></div>
</article>`;

function generate({ source, output, lang, title, description, route, alternateRoute, imageAlt, article }) {
  let html = fs.readFileSync(path.join(root, source), "utf8");
  html = html.replace(/<title>[\s\S]*?<script src="\/consent\.js" defer><\/script>/, `${head({ lang, title, description, route, alternateRoute, imageAlt })}\n<script src="/consent.js" defer></script>`);
  html = html.replace(/<article class="prose">[\s\S]*?<\/article>/, article);
  const target = path.join(outputRoot, output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

generate({
  source: "public/blog/bilingual-resume-template-arabic-english-french/index.html",
  output: `public${enRoute}index.html`,
  lang: "en",
  title: "60 Resume Templates: Multilingual Design Study",
  description: "Original audit of 60 resume templates: typography, market coverage, colors, multilingual metadata, methodology and a free ATS checklist.",
  route: enRoute,
  alternateRoute: frRoute,
  imageAlt: "ApplyCraft multilingual resume template design study",
  article: enArticle,
});

generate({
  source: "public/fr/blog/modele-cv-bilingue-francais-anglais-arabe/index.html",
  output: `public${frRoute}index.html`,
  lang: "fr",
  title: "Étude de 60 modèles de CV multilingues",
  description: "Audit original de 60 modèles de CV : typographies, marchés, couleurs, métadonnées multilingues, méthodologie et checklist ATS gratuite.",
  route: frRoute,
  alternateRoute: enRoute,
  imageAlt: "Étude ApplyCraft sur la conception de modèles de CV multilingues",
  article: frArticle,
});

console.log(`Generated ${enRoute} and ${frRoute}`);
