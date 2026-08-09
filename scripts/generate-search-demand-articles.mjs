import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { headerHtml } from "./shared-header.mjs";
import { footerHtml } from "./shared-footer.mjs";
import { articleForRoute, editorialDateMarkup } from "./article-dates.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://applycraft.io";

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
    title: "Teacher Resume Skills: 30 Examples and Achievements",
    description: "Choose from 30 teacher resume skills and measurable achievement examples for new, primary, secondary and special education teachers.",
    category: "Education", lead: "A strong teacher resume does more than list classroom duties. It connects your teaching skills to student progress, inclusion, engagement and a well-run learning environment.",
    updatedAt: "2026-08-03", readMinutes: 16,
    directAnswer: "The best teacher resume skills combine instruction, classroom management, assessment, inclusion, communication and education technology. Select 8 to 12 skills that match the vacancy, then prove the most important ones with a measurable classroom achievement.",
    primary: "/examples/teacher-resume/", cta: "Use the free teacher resume example",
    sections: [
      ["30 teacher resume skills schools look for", "Use this list as a menu, not a keyword dump. Choose skills you have actually used and prioritize the language in the job description.", ["Instruction: curriculum planning, lesson planning, differentiated instruction, project-based learning, literacy instruction, numeracy instruction", "Classroom: classroom management, safeguarding, restorative practices, student engagement, behavior support, learning routines", "Assessment: formative assessment, summative assessment, progress monitoring, data-informed instruction, feedback, rubric design", "Inclusion: IEP implementation, accommodations, universal design for learning, English learner support, special education collaboration, culturally responsive teaching", "Collaboration: family communication, parent conferences, multidisciplinary teamwork, mentoring, conflict resolution, curriculum coordination"]],
      ["Teacher achievement examples with measurable results", "Adapt these examples to your own evidence. Never invent a percentage, class size or outcome you could not explain in an interview.", ["Raised reading benchmark attainment from 68% to 84% through twice-weekly small-group instruction", "Designed a project-based science unit for 120 learners and increased assignment completion by 18%", "Reduced missing assignments by 27% after introducing a weekly progress dashboard", "Coordinated IEP accommodations with families and specialists for 14 students", "Improved average unit assessment scores by 11 points using targeted reteaching", "Created 36 standards-aligned lesson plans adopted by three colleagues", "Mentored four trainee teachers and delivered six classroom-management workshops", "Secured $4,500 in grants for laboratory equipment", "Led an after-school tutoring program serving 42 students", "Cut preparation time by five hours weekly through a shared resource library"]],
      ["Teacher resume examples by role", "A primary teacher can highlight literacy, routines and family communication; a secondary teacher should foreground subject expertise and assessment; a special education teacher should show accommodations, IEP collaboration and student independence.", ["New teacher: practicum scope, lesson design, mentor feedback and tutoring", "Primary teacher: phonics, foundational numeracy, positive routines and parent communication", "Secondary teacher: subject curriculum, examination preparation, laboratory or project work", "Special education teacher: IEP implementation, assistive technology and behavior support"]],
      ["Copyable teacher resume summary template", "[Licensed/certified] [subject or grade] teacher with [X years / practicum experience] supporting [learner group]. Skilled in [two vacancy-relevant skills], with evidence of [measurable result]. Seeking to contribute [specific value] at [school type]."],
      ["What a first-time teacher can show", "Student teaching, practicum placements, tutoring, coaching and youth programs all provide evidence. Include grade level, class size, lesson scope, mentor feedback and resources you created."],
      ["Make the resume ATS-friendly", "Use conventional headings such as Teaching Experience, Education, Certifications and Skills. Include exact grade, subject, curriculum and license terms only when they apply to you."]
    ],
    related: [["Teacher resume example", "/examples/teacher-resume/"], ["Free ATS resume checker", "/ats-checker/"], ["Resume templates", "/resume/templates/"], ["Student resume with no experience", "/blog/student-resume-no-experience/"]],
    faqs: [["What are the best skills to put on a teacher resume?", "Choose instructional, classroom-management, assessment, inclusion, communication and technology skills that match the vacancy."], ["How many skills should a teacher resume include?", "Eight to twelve targeted skills are usually easier to scan than a generic list."], ["Should teachers include student results?", "Yes, use aggregate and non-identifying results and explain your contribution."], ["Is a two-page teacher resume acceptable?", "Yes for experienced educators; new teachers usually benefit from one page."], ["What should a first-year teacher put on a resume?", "Include student teaching, practicums, tutoring, certifications, grade levels, class sizes and resources you created."], ["Should I list every classroom tool?", "No. List tools you have used and prioritize those requested by the school."]]
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
    title: "Student Resume Without Experience: 15 Examples",
    description: "Create a student resume with no experience using 15 summary examples, projects, coursework, volunteering, skills and a copyable template.",
    category: "Students", lead: "No formal job history does not mean you have nothing to offer. Your studies, projects, volunteering and responsibilities can prove the same skills employers want to see.",
    updatedAt: "2026-08-03", readMinutes: 17,
    directAnswer: "A student resume with no experience should lead with a targeted summary and education, then use projects, relevant coursework, volunteering, activities and skills as evidence. Keep it to one page, describe what you did, and add a result, scale or tool whenever it is truthful.",
    primary: "/student-resume-builder/", cta: "Build a student resume free",
    sections: [
      ["Best resume format for a student with no experience", "Use a simple layout that an ATS can parse and put your strongest evidence near the top.", ["Name, professional email, city and relevant portfolio or LinkedIn link", "Two- or three-line target-specific summary", "Education with expected graduation date and relevant coursework", "Two or three projects with actions, tools and outcomes", "Volunteering, clubs, sports, caregiving, freelance or informal work", "A short skills section supported by evidence"]],
      ["15 student resume summary examples", "Use these as patterns and replace every detail with your own.", ["Business student with Excel and market-research project experience seeking a summer operations internship", "Computer science student who built three responsive web projects using JavaScript and React", "High school student with strong attendance, peer-tutoring experience and weekend volunteer service", "Biology undergraduate experienced in laboratory documentation, data entry and safe sample handling", "Marketing student who grew a club newsletter audience by 28%", "Engineering student with CAD coursework and a five-person design project", "Economics student who analyzed 2,000 survey responses and presented three recommendations", "Education student with 120 hours of classroom observation and tutoring", "Hospitality student recognized for reliable event support and guest communication", "Accounting student skilled in Excel, reconciliations and a simulated close project", "Graphic design student with a six-project portfolio", "Psychology student trained in research ethics, literature reviews and SPSS", "International student fluent in English and French with cross-cultural teamwork experience", "Career-starting graduate combining customer service volunteering with Google Workspace skills", "Student athlete balancing 15 weekly training hours with coursework and team leadership"]],
      ["Turn projects, coursework and activities into experience", "Describe the challenge, your action, the tool or skill used and the outcome.", ["Coordinated a five-person capstone team and delivered the presentation two days early", "Analyzed 2,000 survey responses in Excel and summarized three findings", "Built a responsive portfolio and improved Lighthouse accessibility from 82 to 98", "Managed weekly communications for a 120-member student association", "Tutored six students in algebra and prepared personalized practice materials", "Organized a food drive that collected 480 items from 70 donors"]],
      ["Skills to include on a first resume", "Prioritize skills in the vacancy that your projects or activities demonstrate.", ["Digital: Excel, Google Workspace, Canva, coding or role-specific software", "Communication: presentations, writing, customer service and languages", "Organization: scheduling, documentation, event support and deadlines", "Analysis: research, data cleaning, problem solving and reporting", "Teamwork: collaboration, peer support, leadership and conflict resolution"]],
      ["Complete student resume example", "Maya Chen — Business Administration student | Toronto, ON. Summary: Second-year business student with Excel analysis, event coordination and customer-facing volunteer experience seeking a summer operations internship. Education: BBA, expected 2028; coursework in statistics, accounting and operations. Project: analyzed 2,000 survey responses and presented three recommendations. Volunteer Experience: coordinated weekly check-in for 35 food-bank clients. Skills: Excel, Google Slides, data entry, English and French."],
      ["High school vs. university student resumes", "A high school resume can emphasize attendance, coursework, clubs, sports and volunteering. A university resume should prioritize degree-specific projects, relevant modules, research, societies, internships and technical tools."],
      ["Avoid common beginner mistakes", "Do not use generic adjectives, unrelated course lists, sensitive personal details or fabricated work. Use a professional email, check dates and spelling, and export a clean PDF."]
    ],
    related: [["Free student resume builder", "/student-resume-builder/"], ["Entry-level resume example", "/examples/entry-level-resume/"], ["Resume templates", "/resume/templates/"], ["Free ATS resume checker", "/ats-checker/"], ["ATS-friendly resume guide", "/blog/how-to-write-an-ats-friendly-resume/"]],
    faqs: [["What should a student put on a resume with no experience?", "Use education, coursework, projects, volunteering, clubs, sports, caregiving, informal work and supported skills."], ["What should a student put in a resume summary?", "Name your current course or stage, relevant strengths, one piece of evidence and the opportunity you want."], ["Can school projects count as experience?", "Yes. Label them as projects and explain your contribution, tools and result."], ["What skills look good on a student resume?", "Choose job-relevant digital, communication, organization, analysis and teamwork skills you can prove."], ["Should a student resume be one page?", "Usually yes, unless substantial directly relevant experience justifies more."], ["Do I need references on a student resume?", "Usually not. Provide references later if an employer requests them."]]
  },
  {
    locale: "en", slug: "student-resume-summary-examples",
    title: "25 Resume Summary Examples for Students With No Experience",
    description: "Use 25 adaptable student resume summary examples for internships, first jobs, university roles and career starts without inventing experience.",
    category: "Students", readMinutes: 14,
    lead: "A strong student summary does not hide limited experience. It quickly connects your studies, target role, relevant evidence and practical strengths.",
    primary: "/student-resume-builder/", cta: "Build your student resume",
    sections: [
      ["A four-part formula that stays credible", "Write two or three sentences covering your current status, target, strongest relevant capability and one proof point. Tailor the nouns and evidence to the vacancy rather than copying an example word for word."],
      ["Examples for high-school students", "Adapt these patterns to your actual activities.", ["High-school student seeking a retail role, with experience organizing school events and handling cash during fundraisers", "Reliable student pursuing a first hospitality role after coordinating weekly club meetings for 35 members", "Bilingual student interested in customer service, recognized for clear communication in peer-tutoring sessions", "Detail-focused student seeking an office placement, experienced in Excel through budgeting and survey projects", "Student athlete pursuing a part-time role, balancing training, study deadlines and team responsibilities"]],
      ["Examples for college and university students", "Lead with the course, tools and project outcome that best matches the opportunity.", ["Computer science student seeking a software internship after building and testing three React applications", "Business student with Excel and presentation experience from a market-analysis project covering 1,200 responses", "Mechanical engineering student seeking a placement, with CAD and team-design experience from a semester capstone", "Psychology student pursuing a research assistant role after cleaning survey data and reviewing academic literature", "Communications student seeking a social media internship, having planned a four-week campaign for a student society"]],
      ["Examples for internships and first professional roles", "Show readiness with evidence, not inflated job titles.", ["Entry-level data candidate with SQL coursework and a dashboard project translating raw data into recommendations", "Aspiring IT support technician with CompTIA training and hands-on Windows, networking and troubleshooting labs", "Recent finance graduate seeking an analyst role, experienced in valuation, reporting and advanced Excel projects", "Education student pursuing a classroom assistant role after 80 hours of supervised school placement", "Marketing graduate seeking a coordinator role with portfolio evidence in content planning, analytics and audience research"]],
      ["Examples using volunteering, projects and transferable skills", "Informal evidence is valuable when it is labelled honestly.", ["Volunteer coordinator seeking an administrative role after scheduling 24 volunteers and maintaining attendance records", "Student freelancer pursuing a design internship, having delivered five client briefs on time", "Community volunteer seeking a support role with experience explaining services in English and French", "Club treasurer pursuing an accounting internship after tracking a budget and reconciling monthly expenses", "Peer mentor seeking a people-focused role after supporting 12 first-year students through weekly check-ins"]],
      ["Five concise alternatives", "These work when the rest of the resume provides enough detail.", ["Economics student seeking a summer analyst internship, with research, Excel and presentation experience", "Recent graduate targeting customer success roles, bringing bilingual communication and structured problem-solving", "First-year student seeking weekend retail work, known for punctuality and calm teamwork", "Cybersecurity student pursuing an entry-level placement after completing network and Linux labs", "Environmental science graduate seeking project support work, with field research and report-writing experience"]],
      ["Tailor the summary in five minutes", "Underline the target title, two repeated skills and the employer's main outcome. Keep only claims you can prove elsewhere in the resume, then read the summary aloud to remove filler."],
      ["Mistakes that weaken student summaries", "Avoid objectives focused only on what you want, lists of unsupported adjectives, invented experience, third-person writing and summaries longer than four lines."]
    ],
    faqs: [["Do students need a resume summary?", "It is optional, but useful when it immediately clarifies your target and strongest evidence."], ["Can I say I have no experience?", "Do not lead with a deficit. Present projects, study, volunteering and responsibilities accurately instead."], ["Should I mention grades?", "Include strong and relevant grades when they help, especially early in your studies."], ["How often should I change the summary?", "Tailor it for each distinct role family and update the proof point when the vacancy changes."]],
    related: [["Complete student resume guide", "/blog/student-resume-no-experience/"], ["Student resume builder", "/student-resume-builder/"], ["ATS checker", "/ats-checker/"]]
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
    title: "CV gratuit en ligne : créer et télécharger sans payer",
    description: "Découvrez comment créer un CV gratuit en ligne, vérifier les limites du service et télécharger un PDF ou DOCX sans frais cachés.",
    category: "Créateur de CV", lead: "« Gratuit » peut désigner un simple aperçu gratuit, un essai limité ou un téléchargement réellement gratuit. Vérifiez les conditions avant de saisir toutes vos données.",
    primary: "/fr/creer-cv-gratuit/", cta: "Créer un CV gratuitement",
    sections: [
      ["Les cinq vérifications à faire", "Avant de commencer, contrôlez ce qui est inclus.", ["Téléchargement PDF réellement gratuit", "Absence de filigrane", "Compte obligatoire ou non", "Modèles et couleurs accessibles sans paiement", "Conservation et suppression des données"]],
      ["Créer le contenu avant la mise en page", "Préparez l’intitulé visé, les coordonnées, les expériences, la formation, les compétences et trois à cinq réalisations chiffrées. Vous pourrez alors comparer les modèles sans perdre le fond."],
      ["Télécharger et contrôler le fichier", "Ouvrez le PDF téléchargé, vérifiez les liens, les sauts de page, les caractères accentués et le nom du fichier. Importez ensuite le texte dans un vérificateur ATS pour détecter les problèmes évidents."],
      ["Protéger ses données", "Évitez les informations sensibles inutiles. Un service sans compte peut stocker le brouillon dans le navigateur; un lien court facultatif peut nécessiter une copie temporaire côté serveur. Lisez la politique de confidentialité du service utilisé."]
    ],
    faqs: [["Peut-on créer un CV sans mot de passe ?", "Oui. ApplyCraft utilise un lien de connexion unique envoyé par e-mail : aucun mot de passe n'est nécessaire."], ["Un PDF gratuit contient-il forcément un filigrane ?", "Non. Vérifiez la politique du service avant de commencer."], ["Faut-il créer un compte pour utiliser ApplyCraft ?", "Un lien sécurisé envoyé par e-mail est requis pour accéder au créateur. Aucun mot de passe ni carte bancaire n'est demandé."]]
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
  },
  {
    locale: "fr", slug: "exemples-profil-cv-etudiant-sans-experience",
    title: "25 exemples de profil pour un CV étudiant sans expérience",
    description: "Adaptez 25 exemples d’accroche de CV étudiant pour un stage, un premier emploi, une alternance ou un job étudiant sans inventer d’expérience.",
    category: "Étudiants", readMinutes: 14,
    lead: "Une bonne accroche relie rapidement votre formation, votre objectif et une preuve concrète de vos compétences.",
    primary: "/fr/creer-cv-etudiant/", cta: "Créer votre CV étudiant",
    sections: [
      ["Une formule simple en quatre éléments", "Indiquez votre situation actuelle, le poste visé, la compétence la plus utile et une preuve. Adaptez chaque exemple à votre parcours et à l’offre."],
      ["Exemples pour lycéens et premiers jobs", "Utilisez uniquement les activités réellement menées.", ["Lycéen sérieux recherchant un poste en vente, avec expérience de l’accueil lors d’événements scolaires", "Étudiante bilingue visant un poste de service client après des séances régulières de tutorat", "Lycéen organisé recherchant un emploi administratif, à l’aise avec Excel grâce à des projets scolaires", "Étudiant sportif visant un emploi à temps partiel, habitué à concilier entraînements et délais", "Jeune candidat recherchant un poste en restauration, reconnu pour sa ponctualité et son calme en équipe"]],
      ["Exemples pour stages et alternances", "Mettez en avant la formation, les outils et le résultat d’un projet pertinent.", ["Étudiant en informatique recherchant un stage après la création et le test de trois applications React", "Étudiante en commerce avec expérience d’Excel et d’analyse issue d’une étude de 1 200 réponses", "Étudiant en génie mécanique visant une alternance, avec pratique de la CAO en projet d’équipe", "Étudiante en communication recherchant un stage après la planification d’une campagne associative", "Étudiant en finance visant un stage d’analyste, avec projets en valorisation et modélisation Excel"]],
      ["Exemples pour jeunes diplômés", "Reliez le diplôme à un besoin concret du poste.", ["Jeune diplômé en marketing visant un poste de coordinateur, avec portfolio en contenu et analyse d’audience", "Diplômée en psychologie recherchant un poste d’assistante de recherche après nettoyage de données d’enquête", "Diplômé en informatique visant le support IT, formé au diagnostic Windows et réseau", "Jeune diplômée en éducation avec 80 heures de stage supervisé en classe", "Diplômé en data visant un premier poste après un projet SQL et tableau de bord"]],
      ["Exemples fondés sur le bénévolat et les projets", "Une preuve informelle reste utile si son contexte est présenté honnêtement.", ["Coordinateur bénévole visant un poste administratif après la planification de 24 volontaires", "Trésorière associative recherchant un stage comptable après suivi d’un budget mensuel", "Mentor étudiant visant un poste orienté relations humaines après accompagnement de 12 étudiants", "Étudiante freelance visant un stage créatif après livraison de cinq projets clients", "Bénévole communautaire recherchant un poste d’accueil avec pratique du français et de l’anglais"]],
      ["Cinq versions très courtes", "Ces accroches conviennent lorsque le reste du CV fournit déjà les détails.", ["Étudiant en économie visant un stage d’analyste avec pratique de la recherche et d’Excel", "Jeune diplômée visant la relation client avec communication bilingue et résolution structurée de problèmes", "Étudiant en cybersécurité visant un stage après des laboratoires Linux et réseau", "Étudiante en sciences environnementales avec expérience de terrain et rédaction de rapports", "Étudiant recherchant un job de week-end, ponctuel et habitué au travail d’équipe"]],
      ["Personnaliser l’accroche en cinq minutes", "Repérez l’intitulé, deux compétences répétées et le résultat attendu. Conservez seulement les affirmations prouvées dans le CV."],
      ["Erreurs à éviter", "N’écrivez pas un objectif centré uniquement sur vos besoins, une liste d’adjectifs, une expérience inventée ou un paragraphe de plus de quatre lignes."]
    ],
    faqs: [["Une accroche est-elle obligatoire ?", "Non, mais elle aide lorsque votre objectif et vos preuves doivent être clarifiés rapidement."], ["Faut-il dire que l’on n’a aucune expérience ?", "Non. Présentez honnêtement vos projets, études, activités et responsabilités."], ["Peut-on mentionner ses notes ?", "Oui lorsqu’elles sont bonnes et pertinentes."], ["Faut-il changer l’accroche à chaque candidature ?", "Adaptez-la pour chaque famille de postes et chaque besoin distinct."]],
    related: [["Guide complet du CV étudiant", "/fr/blog/cv-etudiant-sans-experience-exemples/"], ["Créateur de CV étudiant", "/fr/creer-cv-etudiant/"], ["Vérificateur ATS", "/ats-checker-fr/"]]
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
  ["student-resume-summary-examples", "/fr/blog/exemples-profil-cv-etudiant-sans-experience/"],
  ["exemples-profil-cv-etudiant-sans-experience", "/blog/student-resume-summary-examples/"],
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
  const dates = articleForRoute(route);
  const datePublished = dates.datePublished;
  const readMinutes = article.readMinutes || 10;
  const body = article.sections.map(([heading, text, bullets]) => `<h2>${esc(heading)}</h2>
    <p>${esc(text)}</p>${bullets ? `<ul>${bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}`).join("\n");
  const faqBody = article.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("\n");
  const relatedBody = article.related?.length
    ? `<h2>${article.locale === "fr" ? "Ressources utiles" : "Related resources"}</h2><ul>${article.related.map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>`
    : "";
  const back = article.locale === "fr" ? "← Tous les articles" : "← All articles";
  const faqHeading = article.locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";
  const read = article.locale === "fr" ? `${readMinutes} min de lecture` : `${readMinutes} min read`;
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
<meta property="article:published_time" content="${datePublished}T00:00:00Z"/>${dates.dateModified ? `<meta property="article:modified_time" content="${dates.dateModified}T00:00:00Z"/>` : ""}
<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(article.title)}"/>
<meta name="twitter:description" content="${esc(article.description)}"/><meta name="twitter:image" content="${SITE}/og/blog.png"/>
<link rel="icon" href="/favicon.ico?v=2" sizes="any"/><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"/><link rel="manifest" href="/site.webmanifest?v=2"/><link rel="stylesheet" href="/_seo.css"/>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"Article", headline:article.title, description:article.description, image:`${SITE}/og/blog.png`, datePublished, ...(dates.dateModified ? { dateModified: dates.dateModified } : {}), inLanguage:article.locale, author:{"@type":"Person",name:"Isaac Biroue",url:`${SITE}/about/`}, publisher:{"@type":"Organization",name:"ApplyCraft",url:`${SITE}/`}, mainEntityOfPage:canonical })}</script>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"FAQPage", mainEntity:faq })}</script>
<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{"@type":"ListItem",position:1,name:article.locale === "fr" ? "Accueil" : "Home",item:`${SITE}${article.locale === "fr" ? "/fr/" : "/"}`},{"@type":"ListItem",position:2,name:"Blog",item:`${SITE}${article.locale === "fr" ? "/fr/blog/" : "/blog/"}`},{"@type":"ListItem",position:3,name:article.title,item:canonical}] })}</script>
<style>.prose{max-width:760px;margin:0 auto;padding:48px 24px 100px}.prose .back{display:inline-block;font-size:13px;font-weight:700;color:#818cf8;text-decoration:none;margin-bottom:28px}.post-meta{font-size:12px;color:#8b9eb8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:14px;display:flex;gap:10px;flex-wrap:wrap}.tag{background:#1e293b;color:#818cf8;border-radius:999px;padding:3px 10px}.prose h1{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1px;margin:0 0 20px;line-height:1.15;color:#eef2ff}.lead{font-size:17px!important;margin-bottom:38px!important}.prose h2{font-size:23px;color:#e4ebf5;margin:44px 0 14px}.prose h3{font-size:17px;color:#c0cadb;margin:28px 0 8px}.prose p,.prose li{font-size:15px;color:#94a3b8;line-height:1.85}.prose ul{padding-left:22px}.prose a{color:#818cf8}.cta{margin-top:46px;padding:24px;border:1px solid #253753;border-radius:14px;background:#101827}.cta a{font-weight:800}@media(max-width:680px){.prose{padding:38px 18px 80px}}</style>
<script src="/consent.js" defer></script></head><body>
${headerHtml(article.locale, route)}
<main id="main-content" tabindex="-1"><article class="prose">
<a class="back" href="${article.locale === "fr" ? "/fr/blog/" : "/blog/"}">${back}</a>
<div class="post-meta"><span class="tag">${esc(article.category)}</span>${editorialDateMarkup(dates)}</div>
<h1>${esc(article.title)}</h1><p class="lead">${esc(article.lead)}</p>
${body}
<h2>${faqHeading}</h2>${faqBody}${relatedBody}
<div class="cta"><a href="${article.primary}">${esc(article.cta)} →</a></div>
</article></main>${footerHtml(article.locale)}</body></html>`;
}

for (const article of articles) {
  const relative = routeFor(article).replace(/^\/|\/$/g, "");
  const directory = join(ROOT, "public", relative);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), articleHtml(article), "utf8");
  console.log(`Ô£ô ${routeFor(article)}`);
}
