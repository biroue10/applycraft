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
    category: "Linux Careers", lead: "A Linux resume should prove that you can keep systems reliable, secure, observable and repeatableÔÇönot merely list commands you have used.",
    primary: "/linux-system-administrator-resume/", cta: "Open the Linux system administrator resume example",
    sections: [
      ["Start with the evidence employers screen for", "State your environment before your tool list: distributions, server count, cloud footprint, availability target, user base and support model. This context tells a recruiter whether your experience matches the scale of the vacancy.", ["Linux distributions and versions you administered", "Number of production servers, clusters or regions", "Availability, incident response and recovery objectives", "Automation coverage and hours of manual work removed"]],
      ["Organize technical skills for both ATS and people", "Group related skills instead of publishing an unfiltered keyword wall. Mirror terminology from the vacancy only when it accurately describes your experience.", ["Linux: RHEL, Ubuntu, Debian, systemd, package management", "Automation: Bash, Python, Ansible, Terraform", "Cloud and containers: AWS, Azure, Docker, Kubernetes", "Security and reliability: IAM, SELinux, patching, backups, Prometheus"]],
      ["Turn responsibilities into achievement bullets", "Use action + scope + technical method + result. For example: ÔÇ£Automated patching for 180 Linux servers with Ansible, cutting maintenance effort by 65% while sustaining 99.95% availability.ÔÇØ Keep every metric defensible in an interview.", ["Weak: Responsible for Linux servers", "Better: Administered 240 RHEL and Ubuntu systems across production and staging", "Strongest: Add the improvement in uptime, recovery time, deployment time or security posture"]],
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
      ["Build a precise accountant summary", "Name your level, accounting environment, strongest systems and one relevant result. Avoid unsupported claims such as ÔÇ£detail-oriented expert.ÔÇØ"],
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
    category: "IT Careers", lead: "An IT support resume should demonstrate troubleshooting depth, service quality and communicationÔÇönot just a list of hardware and software.",
    primary: "/examples/it-support-technician-resume/", cta: "Open the IT support technician resume example",
    sections: [
      ["Show the support environment", "State the support tier, user population, ticket volume, channels, operating systems and service targets you handled."],
      ["Technical skills to prioritize", "Group tools by function and keep only skills you can discuss.", ["Active Directory, Entra ID and Microsoft 365", "Windows, macOS, Linux and mobile device support", "ServiceNow, Jira Service Management, Zendesk or Freshservice", "TCP/IP, DNS, DHCP, VPN and endpoint security", "Remote support, imaging, Intune, SCCM and asset management"]],
      ["Bullet-point examples", "Combine issue, action and result.", ["Resolved 35ÔÇô45 weekly tickets while maintaining 96% SLA compliance", "Improved first-contact resolution from 62% to 78% by publishing 24 knowledge articles", "Reduced laptop provisioning from two days to four hours with standardized Intune profiles"]],
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
      ["Complete student resume example", "Maya Chen ÔÇö Business Administration student | Toronto, ON. Summary: Second-year business student with Excel analysis, event coordination and customer-facing volunteer experience seeking a summer operations internship. Education: BBA, expected 2028; coursework in statistics, accounting and operations. Project: analyzed 2,000 survey responses and presented three recommendations. Volunteer Experience: coordinated weekly check-in for 35 food-bank clients. Skills: Excel, Google Slides, data entry, English and French."],
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
    title: "Comment r├®diger un CV en fran├ºais comme candidat ├®tranger",
    description: "Adaptez votre CV au march├® francophone : vocabulaire, dipl├┤mes, exp├®riences ├®trang├¿res, format, exemples et conseils ATS.",
    category: "CV en fran├ºais", lead: "Un bon CV en fran├ºais ne consiste pas ├á traduire chaque mot. Il faut rendre votre parcours compr├®hensible, conserver les faits et adapter les conventions au march├® cibl├®.",
    primary: "/examples/french-cv-example/", cta: "Consulter lÔÇÖexemple de CV en fran├ºais",
    sections: [
      ["Clarifier les intitul├®s sans modifier la r├®alit├®", "Conservez lÔÇÖintitul├® officiel lorsque cela compte, puis ajoutez entre parenth├¿ses un ├®quivalent fran├ºais compr├®hensible. Expliquez bri├¿vement une entreprise inconnue par son secteur, sa taille ou son march├®."],
      ["Pr├®senter les dipl├┤mes ├®trangers", "Indiquez le nom original du dipl├┤me, lÔÇÖ├®tablissement, le pays et, si elle est officielle, lÔÇÖ├®quivalence obtenue. NÔÇÖinventez jamais une ├®quivalence fran├ºaise."],
      ["Choisir un vocabulaire professionnel naturel", "Employez des verbes dÔÇÖaction et des r├®sultats pr├®cis.", ["Pilot├®, coordonn├®, analys├®, d├®ploy├®, r├®duit, augment├®", "Volume de clients, budget, d├®lais, qualit├® ou ├®conomies", "Technologies et certifications demand├®es dans lÔÇÖoffre"]],
      ["Adapter le format au pays vis├®", "La France, la Belgique, la Suisse, le Qu├®bec et les march├®s francophones africains nÔÇÖont pas toujours les m├¬mes usages. V├®rifiez notamment la photo, la longueur, les informations personnelles et la langue demand├®e."],
      ["Relire la version finale", "V├®rifiez les accents, les dates, les espaces, la coh├®rence des temps et les mots-cl├®s exacts de lÔÇÖoffre. Une relecture humaine reste utile m├¬me apr├¿s un contr├┤le automatis├®."]
    ],
    faqs: [["Faut-il traduire le nom de son dipl├┤me ?", "Non. Gardez le nom officiel et ajoutez une explication ou une ├®quivalence uniquement si elle est reconnue."], ["Un CV fran├ºais doit-il contenir une photo ?", "Cela d├®pend du march├® et du poste. Elle nÔÇÖest g├®n├®ralement pas obligatoire."], ["Peut-on conserver les noms de logiciels en anglais ?", "Oui. Les noms de produits, technologies et certifications ne doivent pas ├¬tre traduits."]]
  },
  {
    locale: "fr", slug: "cv-gratuit-sans-inscription",
    title: "CV gratuit en ligne : cr├®er et t├®l├®charger sans payer",
    description: "D├®couvrez comment cr├®er un CV gratuit en ligne, v├®rifier les limites du service et t├®l├®charger un PDF ou DOCX sans frais cach├®s.",
    category: "Cr├®ateur de CV", lead: "┬½ Gratuit ┬╗ peut d├®signer un simple aper├ºu gratuit, un essai limit├® ou un t├®l├®chargement r├®ellement gratuit. V├®rifiez les conditions avant de saisir toutes vos donn├®es.",
    primary: "/fr/creer-cv-gratuit/", cta: "Cr├®er un CV gratuitement",
    sections: [
      ["Les cinq v├®rifications ├á faire", "Avant de commencer, contr├┤lez ce qui est inclus.", ["T├®l├®chargement PDF r├®ellement gratuit", "Absence de filigrane", "Compte obligatoire ou non", "Mod├¿les et couleurs accessibles sans paiement", "Conservation et suppression des donn├®es"]],
      ["Cr├®er le contenu avant la mise en page", "Pr├®parez lÔÇÖintitul├® vis├®, les coordonn├®es, les exp├®riences, la formation, les comp├®tences et trois ├á cinq r├®alisations chiffr├®es. Vous pourrez alors comparer les mod├¿les sans perdre le fond."],
      ["T├®l├®charger et contr├┤ler le fichier", "Ouvrez le PDF t├®l├®charg├®, v├®rifiez les liens, les sauts de page, les caract├¿res accentu├®s et le nom du fichier. Importez ensuite le texte dans un v├®rificateur ATS pour d├®tecter les probl├¿mes ├®vidents."],
      ["Prot├®ger ses donn├®es", "├ëvitez les informations sensibles inutiles. Un service sans compte peut stocker le brouillon dans le navigateur; un lien court facultatif peut n├®cessiter une copie temporaire c├┤t├® serveur. Lisez la politique de confidentialit├® du service utilis├®."]
    ],
    faqs: [["Peut-on cr├®er un CV sans mot de passe ?", "Oui. ApplyCraft utilise un lien de connexion unique envoy├® par e-mail : aucun mot de passe n'est n├®cessaire."], ["Un PDF gratuit contient-il forc├®ment un filigrane ?", "Non. V├®rifiez la politique du service avant de commencer."], ["Faut-il cr├®er un compte pour utiliser ApplyCraft ?", "Un lien s├®curis├® envoy├® par e-mail est requis pour acc├®der au cr├®ateur. Aucun mot de passe ni carte bancaire n'est demand├®."]]
  },
  {
    locale: "fr", slug: "cv-enseignant-competences-realisations",
    title: "CV dÔÇÖenseignant : comp├®tences et exemples de r├®alisations",
    description: "R├®digez un CV dÔÇÖenseignant avec comp├®tences p├®dagogiques, r├®sultats mesurables, outils num├®riques et exemples adapt├®s aux d├®butants.",
    category: "├ëducation", lead: "Le CV dÔÇÖun enseignant doit pr├®senter les niveaux, les mati├¿res et les certifications, puis montrer lÔÇÖeffet concret des m├®thodes p├®dagogiques.",
    primary: "/examples/teacher-resume/", cta: "Voir le mod├¿le de CV enseignant",
    sections: [
      ["Comp├®tences ├á s├®lectionner", "Privil├®giez celles qui correspondent au poste.", ["Conception de s├®quences et diff├®renciation p├®dagogique", "Gestion de classe et inclusion", "├ëvaluation et suivi de la progression", "Communication avec les familles", "Google Classroom, Moodle, Canvas ou outils demand├®s"]],
      ["Exemples de r├®alisations", "Utilisez uniquement des donn├®es agr├®g├®es et v├®rifiables.", ["Fait progresser le taux de ma├«trise en lecture de 68 % ├á 84 %", "Con├ºu un projet scientifique suivi par 120 ├®l├¿ves avec 18 % de travaux rendus suppl├®mentaires", "Coordonn├® les plans dÔÇÖaccompagnement de 14 ├®l├¿ves avec les familles et sp├®cialistes"]],
      ["CV dÔÇÖun enseignant d├®butant", "D├®crivez les stages, remplacements, cours particuliers, animations et projets universitaires. Pr├®cisez le niveau, le nombre dÔÇÖ├®l├¿ves et les supports cr├®├®s."],
      ["Compatibilit├® ATS", "Placez clairement dipl├┤mes, certifications, mati├¿res, niveaux et exp├®riences sous des titres standards. Reprenez les termes de lÔÇÖannonce seulement lorsquÔÇÖils correspondent ├á votre parcours."]
    ],
    faqs: [["Le CV enseignant peut-il faire deux pages ?", "Oui pour un profil exp├®riment├®; une page suffit souvent en d├®but de carri├¿re."], ["Faut-il indiquer les r├®sultats des ├®l├¿ves ?", "Oui sous forme agr├®g├®e, sans donn├®e permettant dÔÇÖidentifier un ├®l├¿ve."], ["O├╣ placer les certifications ?", "Pr├¿s de lÔÇÖen-t├¬te ou dans une section clairement visible."]]
  },
  {
    locale: "fr", slug: "cv-administrateur-systeme-linux",
    title: "CV administrateur syst├¿me Linux : comp├®tences et missions",
    description: "Structurez un CV dÔÇÖadministrateur Linux avec comp├®tences, automatisation, s├®curit├®, disponibilit├® et exemples de missions chiffr├®es.",
    category: "Carri├¿res IT", lead: "Le recruteur doit comprendre la taille de votre infrastructure, vos responsabilit├®s et les am├®liorations obtenues gr├óce ├á vos actions.",
    primary: "/linux-system-administrator-resume/", cta: "Ouvrir lÔÇÖexemple de CV administrateur Linux",
    sections: [
      ["Donner le contexte technique", "Indiquez les distributions, le nombre de serveurs, les environnements, le cloud, les utilisateurs et les exigences de disponibilit├®."],
      ["Regrouper les comp├®tences", "Organisez-les par familles.", ["Linux : RHEL, Ubuntu, Debian, systemd", "Automatisation : Bash, Python, Ansible, Terraform", "Cloud et conteneurs : AWS, Azure, Docker, Kubernetes", "S├®curit├® et fiabilit├® : IAM, SELinux, supervision, sauvegardes"]],
      ["R├®diger des missions chiffr├®es", "Exemple : ┬½ Automatis├® les correctifs mensuels de 180 serveurs avec Ansible, r├®duisant le temps de maintenance de 65 % tout en maintenant 99,95 % de disponibilit├®. ┬╗"],
      ["Adapter les mots-cl├®s", "Reprenez les technologies demand├®es uniquement si vous les ma├«trisez r├®ellement. Les m├®triques et les exemples concrets ont davantage de valeur quÔÇÖune longue liste de mots-cl├®s."]
    ],
    faqs: [["Quelles certifications citer ?", "RHCSA, RHCE, LFCS, Linux+ et les certifications cloud pertinentes."], ["Faut-il ajouter GitHub ?", "Oui si les d├®p├┤ts montrent des scripts ou playbooks nettoy├®s de toute donn├®e confidentielle."], ["Une page suffit-elle ?", "Oui en d├®but de carri├¿re; deux pages sont acceptables pour un profil exp├®riment├®."]]
  },
  {
    locale: "fr", slug: "cv-comptable-missions-realisations",
    title: "CV comptable : missions et r├®alisations chiffr├®es",
    description: "Am├®liorez votre CV comptable avec logiciels, normes, missions et exemples de r├®alisations mesurables pour chaque niveau.",
    category: "Comptabilit├®", lead: "Un CV comptable convaincant associe rigueur, outils, normes et r├®sultats observables plut├┤t que de r├®p├®ter une fiche de poste.",
    primary: "/examples/accountant-resume/", cta: "Voir lÔÇÖexemple de CV comptable",
    sections: [
      ["Comp├®tences ├á rendre visibles", "Classez les normes, processus et logiciels.", ["IFRS, normes locales, contr├┤le interne", "Cl├┤ture, rapprochements, AP/AR et reporting", "SAP, Oracle, Sage, QuickBooks et Excel avanc├®", "Audit, fiscalit├® et analyse des ├®carts"]],
      ["Transformer les missions en r├®alisations", "Ajoutez une port├®e et un r├®sultat.", ["R├®duit la cl├┤ture mensuelle de neuf ├á cinq jours", "Identifi├® 310 000 Ôé¼ dÔÇÖ├®conomies annuelles apr├¿s revue des fournisseurs", "Automatis├® un reporting et ├®conomis├® 12 heures par mois", "Pr├®par├® trois audits sans anomalie significative"]],
      ["Adapter selon le poste", "Un comptable junior mettra lÔÇÖaccent sur la fiabilit├® et les volumes; un senior montrera la supervision, les contr├┤les et lÔÇÖam├®lioration des processus."],
      ["V├®rifier les mots-cl├®s", "Conservez les appellations exactes des logiciels et normes. NÔÇÖajoutez aucune certification non obtenue."]
    ],
    faqs: [["Quels chiffres utiliser ?", "D├®lais de cl├┤ture, volumes, budgets, ├®conomies, r├®duction dÔÇÖerreurs et r├®sultats dÔÇÖaudit."], ["Faut-il ├¬tre expert-comptable ?", "Non. Mentionnez clairement les certifications ou ├®tudes r├®ellement obtenues ou en cours."], ["Quelle longueur choisir ?", "Une page pour de nombreux profils juniors; jusquÔÇÖ├á deux pages pour une exp├®rience senior pertinente."]]
  },
  {
    locale: "fr", slug: "cv-etudiant-sans-experience-exemples",
    title: "CV ├®tudiant sans exp├®rience : exemples et mod├¿le gratuit",
    description: "Cr├®ez un CV ├®tudiant sans exp├®rience professionnelle avec projets, ├®tudes, b├®n├®volat, comp├®tences et exemples de formulations.",
    category: "├ëtudiants", lead: "Les projets, ├®tudes, activit├®s et responsabilit├®s personnelles peuvent prouver vos comp├®tences si vous les pr├®sentez avec pr├®cision et honn├¬tet├®.",
    primary: "/fr/creer-cv-etudiant/", cta: "Cr├®er un CV ├®tudiant",
    sections: [
      ["Faire lÔÇÖinventaire des preuves", "Notez les projets scolaires, associations, b├®n├®volat, sport, tutorat, responsabilit├®s familiales et petits travaux. Gardez ce qui sert le poste vis├®."],
      ["Choisir un ordre simple", "Pr├®sentez les coordonn├®es, un objectif cibl├®, la formation, les projets, les comp├®tences puis les exp├®riences et activit├®s."],
      ["Exemples de formulations", "D├®crivez votre action et son r├®sultat.", ["Coordonn├® un groupe de cinq ├®tudiants et livr├® le projet deux jours avant lÔÇÖ├®ch├®ance", "Analys├® 2 000 r├®ponses dans Excel et pr├®sent├® trois recommandations", "G├®r├® la communication hebdomadaire dÔÇÖune association de 120 membres"]],
      ["├ëviter le remplissage", "Supprimez les qualit├®s g├®n├®riques sans preuve, les cours sans rapport et toute exp├®rience invent├®e. Une page cibl├®e est g├®n├®ralement suffisante."]
    ],
    faqs: [["Les projets scolaires comptent-ils ?", "Oui, sÔÇÖils sont pr├®sent├®s comme projets et si votre contribution est claire."], ["Que mettre dans lÔÇÖaccroche ?", "Votre formation, lÔÇÖobjectif recherch├® et une ou deux forces pertinentes."], ["Le CV doit-il faire une page ?", "Oui dans la majorit├® des cas pour un ├®tudiant."]]
  },
  {
    locale: "fr", slug: "exemples-profil-cv-etudiant-sans-experience",
    title: "25 exemples de profil pour un CV ├®tudiant sans exp├®rience",
    description: "Adaptez 25 exemples dÔÇÖaccroche de CV ├®tudiant pour un stage, un premier emploi, une alternance ou un job ├®tudiant sans inventer dÔÇÖexp├®rience.",
    category: "├ëtudiants", readMinutes: 14,
    lead: "Une bonne accroche relie rapidement votre formation, votre objectif et une preuve concr├¿te de vos comp├®tences.",
    primary: "/fr/creer-cv-etudiant/", cta: "Cr├®er votre CV ├®tudiant",
    sections: [
      ["Une formule simple en quatre ├®l├®ments", "Indiquez votre situation actuelle, le poste vis├®, la comp├®tence la plus utile et une preuve. Adaptez chaque exemple ├á votre parcours et ├á lÔÇÖoffre."],
      ["Exemples pour lyc├®ens et premiers jobs", "Utilisez uniquement les activit├®s r├®ellement men├®es.", ["Lyc├®en s├®rieux recherchant un poste en vente, avec exp├®rience de lÔÇÖaccueil lors dÔÇÖ├®v├®nements scolaires", "├ëtudiante bilingue visant un poste de service client apr├¿s des s├®ances r├®guli├¿res de tutorat", "Lyc├®en organis├® recherchant un emploi administratif, ├á lÔÇÖaise avec Excel gr├óce ├á des projets scolaires", "├ëtudiant sportif visant un emploi ├á temps partiel, habitu├® ├á concilier entra├«nements et d├®lais", "Jeune candidat recherchant un poste en restauration, reconnu pour sa ponctualit├® et son calme en ├®quipe"]],
      ["Exemples pour stages et alternances", "Mettez en avant la formation, les outils et le r├®sultat dÔÇÖun projet pertinent.", ["├ëtudiant en informatique recherchant un stage apr├¿s la cr├®ation et le test de trois applications React", "├ëtudiante en commerce avec exp├®rience dÔÇÖExcel et dÔÇÖanalyse issue dÔÇÖune ├®tude de 1 200 r├®ponses", "├ëtudiant en g├®nie m├®canique visant une alternance, avec pratique de la CAO en projet dÔÇÖ├®quipe", "├ëtudiante en communication recherchant un stage apr├¿s la planification dÔÇÖune campagne associative", "├ëtudiant en finance visant un stage dÔÇÖanalyste, avec projets en valorisation et mod├®lisation Excel"]],
      ["Exemples pour jeunes dipl├┤m├®s", "Reliez le dipl├┤me ├á un besoin concret du poste.", ["Jeune dipl├┤m├® en marketing visant un poste de coordinateur, avec portfolio en contenu et analyse dÔÇÖaudience", "Dipl├┤m├®e en psychologie recherchant un poste dÔÇÖassistante de recherche apr├¿s nettoyage de donn├®es dÔÇÖenqu├¬te", "Dipl├┤m├® en informatique visant le support IT, form├® au diagnostic Windows et r├®seau", "Jeune dipl├┤m├®e en ├®ducation avec 80 heures de stage supervis├® en classe", "Dipl├┤m├® en data visant un premier poste apr├¿s un projet SQL et tableau de bord"]],
      ["Exemples fond├®s sur le b├®n├®volat et les projets", "Une preuve informelle reste utile si son contexte est pr├®sent├® honn├¬tement.", ["Coordinateur b├®n├®vole visant un poste administratif apr├¿s la planification de 24 volontaires", "Tr├®sori├¿re associative recherchant un stage comptable apr├¿s suivi dÔÇÖun budget mensuel", "Mentor ├®tudiant visant un poste orient├® relations humaines apr├¿s accompagnement de 12 ├®tudiants", "├ëtudiante freelance visant un stage cr├®atif apr├¿s livraison de cinq projets clients", "B├®n├®vole communautaire recherchant un poste dÔÇÖaccueil avec pratique du fran├ºais et de lÔÇÖanglais"]],
      ["Cinq versions tr├¿s courtes", "Ces accroches conviennent lorsque le reste du CV fournit d├®j├á les d├®tails.", ["├ëtudiant en ├®conomie visant un stage dÔÇÖanalyste avec pratique de la recherche et dÔÇÖExcel", "Jeune dipl├┤m├®e visant la relation client avec communication bilingue et r├®solution structur├®e de probl├¿mes", "├ëtudiant en cybers├®curit├® visant un stage apr├¿s des laboratoires Linux et r├®seau", "├ëtudiante en sciences environnementales avec exp├®rience de terrain et r├®daction de rapports", "├ëtudiant recherchant un job de week-end, ponctuel et habitu├® au travail dÔÇÖ├®quipe"]],
      ["Personnaliser lÔÇÖaccroche en cinq minutes", "Rep├®rez lÔÇÖintitul├®, deux comp├®tences r├®p├®t├®es et le r├®sultat attendu. Conservez seulement les affirmations prouv├®es dans le CV."],
      ["Erreurs ├á ├®viter", "NÔÇÖ├®crivez pas un objectif centr├® uniquement sur vos besoins, une liste dÔÇÖadjectifs, une exp├®rience invent├®e ou un paragraphe de plus de quatre lignes."]
    ],
    faqs: [["Une accroche est-elle obligatoire ?", "Non, mais elle aide lorsque votre objectif et vos preuves doivent ├¬tre clarifi├®s rapidement."], ["Faut-il dire que lÔÇÖon nÔÇÖa aucune exp├®rience ?", "Non. Pr├®sentez honn├¬tement vos projets, ├®tudes, activit├®s et responsabilit├®s."], ["Peut-on mentionner ses notes ?", "Oui lorsquÔÇÖelles sont bonnes et pertinentes."], ["Faut-il changer lÔÇÖaccroche ├á chaque candidature ?", "Adaptez-la pour chaque famille de postes et chaque besoin distinct."]],
    related: [["Guide complet du CV ├®tudiant", "/fr/blog/cv-etudiant-sans-experience-exemples/"], ["Cr├®ateur de CV ├®tudiant", "/fr/creer-cv-etudiant/"], ["V├®rificateur ATS", "/ats-checker-fr/"]]
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
  const back = article.locale === "fr" ? "ÔåÉ Tous les articles" : "ÔåÉ All articles";
  const faqHeading = article.locale === "fr" ? "Questions fr├®quentes" : "Frequently asked questions";
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
<div class="cta"><a href="${article.primary}">${esc(article.cta)} ÔåÆ</a></div>
</article></main>${footerHtml(article.locale)}</body></html>`;
}

for (const article of articles) {
  const relative = routeFor(article).replace(/^\/|\/$/g, "");
  const directory = join(ROOT, "public", relative);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), articleHtml(article), "utf8");
  console.log(`Ô£ô ${routeFor(article)}`);
}
