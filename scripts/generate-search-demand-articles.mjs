import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { headerHtml } from "./shared-header.mjs";
import { footerHtml } from "./shared-footer.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://applycraft.io";
const DATE = "2026-07-26";

const articles = [
  {
    locale: "en", slug: "linux-system-administrator-resume-skills-ats",
    title: "Linux System Administrator Resume: Skills and ATS Keywords",
    description: "Build a Linux system administrator resume with the right skills, measurable bullet points, certifications and truthful ATS keywords.",
    category: "Linux Careers", lead: "A Linux resume should prove that you can keep systems reliable, secure, observable and repeatable—not merely list commands you have used.",
    primary: "/linux-system-administrator-resume/", cta: "Open the Linux system administrator resume example",
    sections: [
      ["Start with the evidence employers screen for", "State your environment before your tool list: distributions, server count, cloud footprint, availability target, user base and support model. This context tells a recruiter whether your experience matches the scale of the vacancy.", ["Linux distributions and versions you administered", "Number of production servers, clusters or regions", "Availability, incident response and recovery objectives", "Automation coverage and hours of manual work removed"]],
      ["Organize technical skills for both ATS and people", "Group related skills instead of publishing an unfiltered keyword wall. Mirror terminology from the vacancy only when it accurately describes your experience.", ["Linux: RHEL, Ubuntu, Debian, systemd, package management", "Automation: Bash, Python, Ansible, Terraform", "Cloud and containers: AWS, Azure, Docker, Kubernetes", "Security and reliability: IAM, SELinux, patching, backups, Prometheus"]],
      ["Turn responsibilities into achievement bullets", "Use action + scope + technical method + result. For example: “Automated patching for 180 Linux servers with Ansible, cutting maintenance effort by 65% while sustaining 99.95% availability.” Keep every metric defensible in an interview.", ["Weak: Responsible for Linux servers", "Better: Administered 240 RHEL and Ubuntu systems across production and staging", "Strongest: Add the improvement in uptime, recovery time, deployment time or security posture"]],
      ["Choose keywords without gaming the ATS", "Prioritize repeated hard skills, certifications and responsibilities from the job description. Do not add Kubernetes, Terraform or a certification simply because it appears in the posting. A truthful near-match is safer than a fabricated exact match."]
    ],
    faqs: [["How long should a Linux administrator resume be?", "Use one page early in your career and up to two pages when you have substantial relevant infrastructure experience."], ["Should I include a GitHub profile?", "Yes, when it contains sanitized scripts, playbooks or infrastructure examples that do not expose employer secrets."], ["Which certifications matter?", "RHCSA, RHCE, LFCS, Linux+ and relevant cloud certifications can strengthen a resume when the target role values them."]]
  },
  {
    locale: "en", slug: "teacher-resume-skills-achievements",
    title: "Teacher Resume Skills and Achievements: 25 Examples",
    description: "Choose teacher resume skills and write measurable classroom achievements with examples for experienced and first-time educators.",
    category: "Education", lead: "A teacher resume becomes credible when it connects instructional choices to student progress, inclusion, engagement and classroom operations.",
    primary: "/examples/teacher-resume/", cta: "Use the free teacher resume example",
    sections: [
      ["Skills schools actually look for", "Lead with licensure, grade bands and subjects, then show instructional and collaboration skills relevant to the vacancy.", ["Curriculum planning and differentiated instruction", "Classroom management and safeguarding", "Assessment, progress monitoring and data use", "IEP support, family communication and multidisciplinary collaboration", "Google Classroom, Canvas, Seesaw or the platforms named by the school"]],
      ["Achievement examples to adapt truthfully", "Your bullets should describe your contribution without claiming that one teacher caused every result.", ["Raised reading benchmark attainment from 68% to 84% through weekly small-group instruction", "Designed a project-based science unit for 120 learners and increased completion by 18%", "Coordinated learning plans with families and specialists for 14 students", "Reduced missing assignments by introducing a weekly progress dashboard"]],
      ["What a first-time teacher can show", "Student teaching, practicum placements, tutoring, coaching and youth programs all provide evidence. Include class size, lesson scope, feedback from mentors and learning resources you created."],
      ["ATS terms for teaching vacancies", "Use the exact grade, subject, curriculum and certification terminology from the role when it applies to you. Keep section headings conventional so district systems can identify education, certification and experience."]
    ],
    faqs: [["Should teachers include student results?", "Yes, use aggregate and non-identifying results and explain your contribution."], ["Is a two-page teacher resume acceptable?", "Yes for experienced educators with relevant leadership and professional development; new teachers usually benefit from one page."], ["Should I list every classroom tool?", "List tools used in practice and prioritize those requested by the school."]]
  },
  {
    locale: "en", slug: "accountant-resume-skills-achievements",
    title: "Accountant Resume Guide: Skills and Achievement Examples",
    description: "Write an accountant resume with relevant software, certifications, financial controls and measurable achievement examples.",
    category: "Accounting", lead: "Accounting employers screen for accuracy, standards, systems and trust. Your resume should make each of those qualities visible through evidence.",
    primary: "/examples/accountant-resume/", cta: "Customize the accountant resume example",
    sections: [
      ["Build a precise accountant summary", "Name your level, accounting environment, strongest systems and one relevant result. Avoid unsupported claims such as “detail-oriented expert.”"],
      ["Skills and keywords to organize", "Separate standards, processes and software so recruiters can scan them quickly.", ["GAAP, IFRS, SOX and internal controls", "Month-end close, reconciliations, AP/AR and financial reporting", "QuickBooks, SAP, Oracle, NetSuite, Xero and advanced Excel", "Audit support, tax preparation and variance analysis"]],
      ["Achievement examples", "Use money, time, volume, accuracy and audit outcomes where appropriate.", ["Reduced month-end close from nine to five days by standardizing reconciliations", "Identified $310K in annual savings through vendor and accrual review", "Prepared reporting for a $90M business unit with no material audit findings", "Automated a recurring Excel report and saved 12 hours each month"]],
      ["Tailor the resume by accounting role", "A staff accountant should emphasize close and reconciliations; an AP specialist should show invoice volume and controls; a senior accountant should demonstrate ownership, review and process improvement."]
    ],
    faqs: [["Do I need a CPA?", "No. List CPA, CMA, ACCA or candidacy prominently when you have it, but many roles accept relevant education and experience."], ["What metrics work on an accounting resume?", "Close time, portfolio size, transaction volume, savings, error reduction and audit outcomes are useful when accurate."], ["How long should it be?", "One page is common for junior and mid-level candidates; two pages can suit senior profiles."]]
  },
  {
    locale: "en", slug: "it-support-resume-skills-ats-keywords",
    title: "IT Support Resume: Skills, Bullet Points and ATS Keywords",
    description: "Create an IT support resume with technical skills, ticket and SLA metrics, certifications, bullet examples and accurate ATS keywords.",
    category: "IT Careers", lead: "An IT support resume should demonstrate troubleshooting depth, service quality and communication—not just a list of hardware and software.",
    primary: "/examples/it-support-technician-resume/", cta: "Open the IT support technician resume example",
    sections: [
      ["Show the support environment", "State the support tier, user population, ticket volume, channels, operating systems and service targets you handled."],
      ["Technical skills to prioritize", "Group tools by function and keep only skills you can discuss.", ["Active Directory, Entra ID and Microsoft 365", "Windows, macOS, Linux and mobile device support", "ServiceNow, Jira Service Management, Zendesk or Freshservice", "TCP/IP, DNS, DHCP, VPN and endpoint security", "Remote support, imaging, Intune, SCCM and asset management"]],
      ["Bullet-point examples", "Combine issue, action and result.", ["Resolved 35–45 weekly tickets while maintaining 96% SLA compliance", "Improved first-contact resolution from 62% to 78% by publishing 24 knowledge articles", "Reduced laptop provisioning from two days to four hours with standardized Intune profiles"]],
      ["ATS keywords and certifications", "Use terminology from the role such as L1, L2, ITIL, Microsoft 365 or CompTIA only when it matches your background. Certifications support evidence; they do not replace hands-on examples."]
    ],
    faqs: [["How do I write an IT support resume without experience?", "Use labs, certifications, volunteer support and projects, and describe the problems you solved."], ["Should I list ticket metrics?", "Yes, when available: ticket volume, resolution rate, SLA compliance and satisfaction make service quality concrete."], ["What format is safest?", "A clear one-column structure with standard headings is generally easy for ATS software to parse."]]
  },
  {
    locale: "en", slug: "student-resume-no-experience",
    title: "Student Resume With No Experience: Examples and Template",
    description: "Build a student resume without formal experience using coursework, projects, volunteering, skills and honest achievement examples.",
    category: "Students", lead: "No formal job history does not mean no evidence. A student resume can prove initiative, reliability and practical skills through projects, coursework and community work.",
    primary: "/student-resume-builder/", cta: "Build a student resume free",
    sections: [
      ["Choose evidence before choosing sections", "List projects, coursework, clubs, volunteering, caregiving, sport, freelance tasks and informal work. Select the evidence most relevant to the target role."],
      ["A practical section order", "Lead with contact information and a target-specific summary, followed by education, relevant projects, skills and experience or activities.", ["Education with relevant modules", "Two or three projects with outcomes", "Skills demonstrated by evidence", "Volunteer, club or part-time responsibilities"]],
      ["Turn school activities into bullets", "Describe the situation, your action and the result.", ["Coordinated a five-person project team and delivered the presentation two days early", "Analyzed 2,000 survey responses in Excel and summarized three actionable findings", "Managed weekly communications for a 120-member student association"]],
      ["Avoid common beginner mistakes", "Do not fill space with generic adjectives, unrelated course lists or fabricated employment. Keep the document focused on the role and usually to one page."]
    ],
    faqs: [["What should a student put in a resume summary?", "Name the course or target, one or two relevant strengths and the type of opportunity sought."], ["Can school projects count as experience?", "Yes. Label them accurately as projects and explain your contribution and result."], ["Should a student resume be one page?", "Usually yes, unless substantial directly relevant experience justifies more."]]
  },
  {
    locale: "en", slug: "career-change-resume-summary-examples",
    title: "Career Change Resume Summary: 20 Examples by Industry",
    description: "Write a confident career-change resume summary with a practical formula and examples for technology, operations, education and other fields.",
    category: "Career Change", lead: "The summary should connect your proven past to the target role in three or four lines. It should explain the transition without apologizing for it.",
    primary: "/blog/career-change-resume/", cta: "Read the complete career-change resume guide",
    sections: [
      ["Use a four-part summary formula", "Combine your professional foundation, target direction, transferable evidence and proof of commitment.", ["Foundation: years or depth of relevant professional experience", "Direction: the role or field you are moving toward", "Transferable proof: one relevant result or strength", "Commitment: training, certification or project evidence"]],
      ["Example: operations to project management", "Operations coordinator with six years of experience aligning vendors, budgets and deadlines, transitioning into project management. Delivered 18 cross-functional launches on schedule and recently completed CAPM training."],
      ["Example: teaching to learning design", "Secondary teacher with eight years of experience designing measurable learning programs, moving into instructional design. Built blended modules for 300 learners and completed an Articulate Storyline portfolio."],
      ["Example: customer service to IT support", "Customer support specialist transitioning into IT support after completing CompTIA A+ training and a Windows/Active Directory home lab. Known for structured troubleshooting and a 94% customer-satisfaction score."],
      ["What to remove", "Avoid vague passion statements, negative explanations about the old field and unsupported claims. The rest of the resume must substantiate every promise in the summary."]
    ],
    faqs: [["Should I mention the career change directly?", "Yes. A concise, forward-looking explanation reduces ambiguity and lets you frame the value of your past experience."], ["Can I use the target job title?", "Use it when your summary clearly presents it as your target and your evidence supports the transition."], ["How long should the summary be?", "Usually three or four concise lines."]]
  },
  {
    locale: "fr", slug: "cv-francais-candidat-etranger",
    title: "Comment rédiger un CV en français comme candidat étranger",
    description: "Adaptez votre CV au marché francophone : vocabulaire, diplômes, expériences étrangères, format, exemples et conseils ATS.",
    category: "CV en français", lead: "Un bon CV en français ne consiste pas à traduire chaque mot. Il faut rendre votre parcours compréhensible, conserver les faits et adapter les conventions au marché ciblé.",
    primary: "/examples/french-cv-example/", cta: "Consulter l’exemple de CV en français",
    sections: [
      ["Clarifier les intitulés sans modifier la réalité", "Conservez l’intitulé officiel lorsque cela compte, puis ajoutez entre parenthèses un équivalent français compréhensible. Expliquez brièvement une entreprise inconnue par son secteur, sa taille ou son marché."],
      ["Présenter les diplômes étrangers", "Indiquez le nom original du diplôme, l’établissement, le pays et, si elle est officielle, l’équivalence obtenue. N’inventez jamais une équivalence française."],
      ["Choisir un vocabulaire professionnel naturel", "Employez des verbes d’action et des résultats précis.", ["Piloté, coordonné, analysé, déployé, réduit, augmenté", "Volume de clients, budget, délais, qualité ou économies", "Technologies et certifications demandées dans l’offre"]],
      ["Adapter le format au pays visé", "La France, la Belgique, la Suisse, le Québec et les marchés francophones africains n’ont pas toujours les mêmes usages. Vérifiez notamment la photo, la longueur, les informations personnelles et la langue demandée."],
      ["Relire la version finale", "Vérifiez les accents, les dates, les espaces, la cohérence des temps et les mots-clés exacts de l’offre. Une relecture humaine reste utile même après un contrôle automatisé."]
    ],
    faqs: [["Faut-il traduire le nom de son diplôme ?", "Non. Gardez le nom officiel et ajoutez une explication ou une équivalence uniquement si elle est reconnue."], ["Un CV français doit-il contenir une photo ?", "Cela dépend du marché et du poste. Elle n’est généralement pas obligatoire."], ["Peut-on conserver les noms de logiciels en anglais ?", "Oui. Les noms de produits, technologies et certifications ne doivent pas être traduits."]]
  },
  {
    locale: "fr", slug: "cv-gratuit-sans-inscription",
    title: "CV gratuit sans inscription : créer et télécharger sans payer",
    description: "Découvrez comment créer un CV gratuit sans inscription, vérifier les limites du service et télécharger un PDF ou DOCX sans frais cachés.",
    category: "Créateur de CV", lead: "« Gratuit » peut désigner un simple aperçu gratuit, un essai limité ou un téléchargement réellement gratuit. Vérifiez les conditions avant de saisir toutes vos données.",
    primary: "/fr/creer-cv-gratuit/", cta: "Créer un CV gratuitement",
    sections: [
      ["Les cinq vérifications à faire", "Avant de commencer, contrôlez ce qui est inclus.", ["Téléchargement PDF réellement gratuit", "Absence de filigrane", "Compte obligatoire ou non", "Modèles et couleurs accessibles sans paiement", "Conservation et suppression des données"]],
      ["Créer le contenu avant la mise en page", "Préparez l’intitulé visé, les coordonnées, les expériences, la formation, les compétences et trois à cinq réalisations chiffrées. Vous pourrez alors comparer les modèles sans perdre le fond."],
      ["Télécharger et contrôler le fichier", "Ouvrez le PDF téléchargé, vérifiez les liens, les sauts de page, les caractères accentués et le nom du fichier. Importez ensuite le texte dans un vérificateur ATS pour détecter les problèmes évidents."],
      ["Protéger ses données", "Évitez les informations sensibles inutiles. Un service sans compte peut stocker le brouillon dans le navigateur; un lien court facultatif peut nécessiter une copie temporaire côté serveur. Lisez la politique de confidentialité du service utilisé."]
    ],
    faqs: [["Peut-on créer un CV sans adresse e-mail ?", "Un outil peut ne pas exiger de compte, mais votre CV devrait généralement contenir une adresse professionnelle pour les recruteurs."], ["Un PDF gratuit contient-il forcément un filigrane ?", "Non. Vérifiez la politique du service avant de commencer."], ["Faut-il créer un compte pour utiliser ApplyCraft ?", "Le parcours principal de création et d’export ne nécessite pas de compte."]]
  },
  {
    locale: "fr", slug: "cv-enseignant-competences-realisations",
    title: "CV d’enseignant : compétences et exemples de réalisations",
    description: "Rédigez un CV d’enseignant avec compétences pédagogiques, résultats mesurables, outils numériques et exemples adaptés aux débutants.",
    category: "Éducation", lead: "Le CV d’un enseignant doit présenter les niveaux, les matières et les certifications, puis montrer l’effet concret des méthodes pédagogiques.",
    primary: "/examples/teacher-resume/", cta: "Voir le modèle de CV enseignant",
    sections: [
      ["Compétences à sélectionner", "Privilégiez celles qui correspondent au poste.", ["Conception de séquences et différenciation pédagogique", "Gestion de classe et inclusion", "Évaluation et suivi de la progression", "Communication avec les familles", "Google Classroom, Moodle, Canvas ou outils demandés"]],
      ["Exemples de réalisations", "Utilisez uniquement des données agrégées et vérifiables.", ["Fait progresser le taux de maîtrise en lecture de 68 % à 84 %", "Conçu un projet scientifique suivi par 120 élèves avec 18 % de travaux rendus supplémentaires", "Coordonné les plans d’accompagnement de 14 élèves avec les familles et spécialistes"]],
      ["CV d’un enseignant débutant", "Décrivez les stages, remplacements, cours particuliers, animations et projets universitaires. Précisez le niveau, le nombre d’élèves et les supports créés."],
      ["Compatibilité ATS", "Placez clairement diplômes, certifications, matières, niveaux et expériences sous des titres standards. Reprenez les termes de l’annonce seulement lorsqu’ils correspondent à votre parcours."]
    ],
    faqs: [["Le CV enseignant peut-il faire deux pages ?", "Oui pour un profil expérimenté; une page suffit souvent en début de carrière."], ["Faut-il indiquer les résultats des élèves ?", "Oui sous forme agrégée, sans donnée permettant d’identifier un élève."], ["Où placer les certifications ?", "Près de l’en-tête ou dans une section clairement visible."]]
  },
  {
    locale: "fr", slug: "cv-administrateur-systeme-linux",
    title: "CV administrateur système Linux : compétences et missions",
    description: "Structurez un CV d’administrateur Linux avec compétences, automatisation, sécurité, disponibilité et exemples de missions chiffrées.",
    category: "Carrières IT", lead: "Le recruteur doit comprendre la taille de votre infrastructure, vos responsabilités et les améliorations obtenues grâce à vos actions.",
    primary: "/linux-system-administrator-resume/", cta: "Ouvrir l’exemple de CV administrateur Linux",
    sections: [
      ["Donner le contexte technique", "Indiquez les distributions, le nombre de serveurs, les environnements, le cloud, les utilisateurs et les exigences de disponibilité."],
      ["Regrouper les compétences", "Organisez-les par familles.", ["Linux : RHEL, Ubuntu, Debian, systemd", "Automatisation : Bash, Python, Ansible, Terraform", "Cloud et conteneurs : AWS, Azure, Docker, Kubernetes", "Sécurité et fiabilité : IAM, SELinux, supervision, sauvegardes"]],
      ["Rédiger des missions chiffrées", "Exemple : « Automatisé les correctifs mensuels de 180 serveurs avec Ansible, réduisant le temps de maintenance de 65 % tout en maintenant 99,95 % de disponibilité. »"],
      ["Adapter les mots-clés", "Reprenez les technologies demandées uniquement si vous les maîtrisez réellement. Les métriques et les exemples concrets ont davantage de valeur qu’une longue liste de mots-clés."]
    ],
    faqs: [["Quelles certifications citer ?", "RHCSA, RHCE, LFCS, Linux+ et les certifications cloud pertinentes."], ["Faut-il ajouter GitHub ?", "Oui si les dépôts montrent des scripts ou playbooks nettoyés de toute donnée confidentielle."], ["Une page suffit-elle ?", "Oui en début de carrière; deux pages sont acceptables pour un profil expérimenté."]]
  },
  {
    locale: "fr", slug: "cv-comptable-missions-realisations",
    title: "CV comptable : missions et réalisations chiffrées",
    description: "Améliorez votre CV comptable avec logiciels, normes, missions et exemples de réalisations mesurables pour chaque niveau.",
    category: "Comptabilité", lead: "Un CV comptable convaincant associe rigueur, outils, normes et résultats observables plutôt que de répéter une fiche de poste.",
    primary: "/examples/accountant-resume/", cta: "Voir l’exemple de CV comptable",
    sections: [
      ["Compétences à rendre visibles", "Classez les normes, processus et logiciels.", ["IFRS, normes locales, contrôle interne", "Clôture, rapprochements, AP/AR et reporting", "SAP, Oracle, Sage, QuickBooks et Excel avancé", "Audit, fiscalité et analyse des écarts"]],
      ["Transformer les missions en réalisations", "Ajoutez une portée et un résultat.", ["Réduit la clôture mensuelle de neuf à cinq jours", "Identifié 310 000 € d’économies annuelles après revue des fournisseurs", "Automatisé un reporting et économisé 12 heures par mois", "Préparé trois audits sans anomalie significative"]],
      ["Adapter selon le poste", "Un comptable junior mettra l’accent sur la fiabilité et les volumes; un senior montrera la supervision, les contrôles et l’amélioration des processus."],
      ["Vérifier les mots-clés", "Conservez les appellations exactes des logiciels et normes. N’ajoutez aucune certification non obtenue."]
    ],
    faqs: [["Quels chiffres utiliser ?", "Délais de clôture, volumes, budgets, économies, réduction d’erreurs et résultats d’audit."], ["Faut-il être expert-comptable ?", "Non. Mentionnez clairement les certifications ou études réellement obtenues ou en cours."], ["Quelle longueur choisir ?", "Une page pour de nombreux profils juniors; jusqu’à deux pages pour une expérience senior pertinente."]]
  },
  {
    locale: "fr", slug: "cv-etudiant-sans-experience-exemples",
    title: "CV étudiant sans expérience : exemples et modèle gratuit",
    description: "Créez un CV étudiant sans expérience professionnelle avec projets, études, bénévolat, compétences et exemples de formulations.",
    category: "Étudiants", lead: "Les projets, études, activités et responsabilités personnelles peuvent prouver vos compétences si vous les présentez avec précision et honnêteté.",
    primary: "/fr/creer-cv-etudiant/", cta: "Créer un CV étudiant",
    sections: [
      ["Faire l’inventaire des preuves", "Notez les projets scolaires, associations, bénévolat, sport, tutorat, responsabilités familiales et petits travaux. Gardez ce qui sert le poste visé."],
      ["Choisir un ordre simple", "Présentez les coordonnées, un objectif ciblé, la formation, les projets, les compétences puis les expériences et activités."],
      ["Exemples de formulations", "Décrivez votre action et son résultat.", ["Coordonné un groupe de cinq étudiants et livré le projet deux jours avant l’échéance", "Analysé 2 000 réponses dans Excel et présenté trois recommandations", "Géré la communication hebdomadaire d’une association de 120 membres"]],
      ["Éviter le remplissage", "Supprimez les qualités génériques sans preuve, les cours sans rapport et toute expérience inventée. Une page ciblée est généralement suffisante."]
    ],
    faqs: [["Les projets scolaires comptent-ils ?", "Oui, s’ils sont présentés comme projets et si votre contribution est claire."], ["Que mettre dans l’accroche ?", "Votre formation, l’objectif recherché et une ou deux forces pertinentes."], ["Le CV doit-il faire une page ?", "Oui dans la majorité des cas pour un étudiant."]]
  }
];

const pairs = new Map([
  ["linux-system-administrator-resume-skills-ats", "/fr/blog/cv-administrateur-systeme-linux/"],
  ["cv-administrateur-systeme-linux", "/blog/linux-system-administrator-resume-skills-ats/"],
  ["teacher-resume-skills-achievements", "/fr/blog/cv-enseignant-competences-realisations/"],
  ["cv-enseignant-competences-realisations", "/blog/teacher-resume-skills-achievements/"],
  ["accountant-resume-skills-achievements", "/fr/blog/cv-comptable-missions-realisations/"],
  ["cv-comptable-missions-realisations", "/blog/accountant-resume-skills-achievements/"],
  ["student-resume-no-experience", "/fr/blog/cv-etudiant-sans-experience-exemples/"],
  ["cv-etudiant-sans-experience-exemples", "/blog/student-resume-no-experience/"],
]);

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const routeFor = (article) => `${article.locale === "fr" ? "/fr" : ""}/blog/${article.slug}/`;

function articleHtml(article) {
  const route = routeFor(article);
  const canonical = `${SITE}${route}`;
  const titleBase = article.title.length > 47
    ? article.title.slice(0, 47).replace(/\s+\S*$/, "")
    : article.title;
  const other = pairs.get(article.slug);
  const otherLocale = article.locale === "fr" ? "en" : "fr";
  const faq = article.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
  const body = article.sections.map(([heading, text, bullets]) => `<h2>${esc(heading)}</h2>
    <p>${esc(text)}</p>${bullets ? `<ul>${bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}`).join("\n");
  const faqBody = article.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("\n");
  const back = article.locale === "fr" ? "← Tous les articles" : "← All articles";
  const faqHeading = article.locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";
  const read = article.locale === "fr" ? "10 min de lecture" : "10 min read";
  const hreflang = other
    ? `<link rel="alternate" hreflang="${otherLocale}" href="${SITE}${other}"/>`
    : "";
  return `<!doctype html>
<html lang="${article.locale}"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(titleBase)} | ApplyCraft</title>
<meta name="description" content="${esc(article.description)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="${article.locale}" href="${canonical}"/>${hreflang}
<link rel="alternate" hreflang="x-default" href="${article.locale === "en" ? canonical : (other ? `${SITE}${other}` : canonical)}"/>
<meta property="og:type" content="article"/><meta property="og:site_name" content="ApplyCraft"/>
<meta property="og:title" content="${esc(article.title)}"/><meta property="og:description" content="${esc(article.description)}"/>
<meta property="og:url" content="${canonical}"/><meta property="og:image" content="${SITE}/og/blog.png"/>
<meta property="article:published_time" content="${DATE}T00:00:00+00:00"/><meta property="article:modified_time" content="${DATE}T00:00:00+00:00"/>
<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(article.title)}"/>
<meta name="twitter:description" content="${esc(article.description)}"/><meta name="twitter:image" content="${SITE}/og/blog.png"/>
<link rel="icon" href="/favicon.ico?v=2" sizes="any"/><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"/><link rel="manifest" href="/site.webmanifest?v=2"/><link rel="stylesheet" href="/_seo.css"/>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"Article", headline:article.title, description:article.description, datePublished:DATE, dateModified:DATE, inLanguage:article.locale, author:{"@type":"Person",name:"Isaac Biroue",url:`${SITE}/about/`}, publisher:{"@type":"Organization",name:"ApplyCraft",url:`${SITE}/`}, mainEntityOfPage:canonical })}</script>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"FAQPage", mainEntity:faq })}</script>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{"@type":"ListItem",position:1,name:article.locale === "fr" ? "Accueil" : "Home",item:`${SITE}${article.locale === "fr" ? "/fr/" : "/"}`},{"@type":"ListItem",position:2,name:"Blog",item:`${SITE}${article.locale === "fr" ? "/fr/blog/" : "/blog/"}`},{"@type":"ListItem",position:3,name:article.title,item:canonical}] })}</script>
<style>.prose{max-width:760px;margin:0 auto;padding:48px 24px 100px}.prose .back{display:inline-block;font-size:13px;font-weight:700;color:#818cf8;text-decoration:none;margin-bottom:28px}.post-meta{font-size:12px;color:#8b9eb8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:14px;display:flex;gap:10px;flex-wrap:wrap}.tag{background:#1e293b;color:#818cf8;border-radius:999px;padding:3px 10px}.prose h1{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1px;margin:0 0 20px;line-height:1.15;color:#eef2ff}.lead{font-size:17px!important;margin-bottom:38px!important}.prose h2{font-size:23px;color:#e4ebf5;margin:44px 0 14px}.prose h3{font-size:17px;color:#c0cadb;margin:28px 0 8px}.prose p,.prose li{font-size:15px;color:#94a3b8;line-height:1.85}.prose ul{padding-left:22px}.prose a{color:#818cf8}.cta{margin-top:46px;padding:24px;border:1px solid #253753;border-radius:14px;background:#101827}.cta a{font-weight:800}@media(max-width:680px){.prose{padding:38px 18px 80px}}</style>
<script src="/consent.js" defer></script></head><body>
${headerHtml(article.locale, route)}
<main id="main-content" tabindex="-1"><article class="prose">
<a class="back" href="${article.locale === "fr" ? "/fr/blog/" : "/blog/"}">${back}</a>
<div class="post-meta"><span class="tag">${esc(article.category)}</span><span>${DATE}</span><span>· ${read}</span></div>
<h1>${esc(article.title)}</h1><p class="lead">${esc(article.lead)}</p>
${body}
<h2>${faqHeading}</h2>${faqBody}
<div class="cta"><a href="${article.primary}">${esc(article.cta)} →</a></div>
</article></main>${footerHtml(article.locale)}</body></html>`;
}

for (const article of articles) {
  const relative = routeFor(article).replace(/^\/|\/$/g, "");
  const directory = join(ROOT, "public", relative);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), articleHtml(article), "utf8");
  console.log(`✓ ${routeFor(article)}`);
}
