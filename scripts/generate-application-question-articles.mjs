import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { headerHtml } from "./shared-header.mjs";
import { footerHtml } from "./shared-footer.mjs";

const ROOT = process.env.APPLYCRAFT_OUTPUT_ROOT || fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://applycraft.io";
const DATE = "2026-07-31";

const articles = [
  {
    locale: "en",
    route: "/blog/how-to-answer-job-application-questions/",
    alternate: "/fr/blog/repondre-questions-candidature-emploi/",
    seoTitle: "Job Application Questions: 20 Answers | ApplyCraft",
    title: "How to Answer Job Application Questions: 20 Examples",
    description: "Answer 20 common job application questions with concise sample answers, practical formulas, ATS guidance and an honest final checklist.",
    category: "Job Applications",
    read: "18 min read",
    back: "← All articles",
    lead: "Written application questions often decide whether a recruiter opens your resume. The strongest answers are specific, consistent with your documents and short enough to scan—without sounding copied or exaggerated.",
    quickTitle: "Quick answer: use evidence, not adjectives",
    quick: "For most application questions, use this five-part pattern: answer the question directly, name the relevant skill or requirement, give one concrete example, state the result, and connect it to the role. A useful answer is usually 40–120 words unless the form gives a different limit.",
    body: `
<h2>Application questions are not interview questions</h2>
<p>Application questions appear before an interview and are usually read quickly or stored in recruiting software. They may confirm eligibility, collect comparable information, or help a recruiter decide whom to contact. Interview answers can be conversational and exploratory; written answers must stand alone.</p>
<p>Use this guide for screening forms and written questionnaires. For spoken preparation, see the separate guide to <a href="/blog/common-interview-questions/">common interview questions</a> and practise in the <a href="/interview-prep/">interview preparation workspace</a>.</p>

<h2>A reliable five-step answer formula</h2>
<ol>
  <li><strong>Answer first:</strong> give a clear yes, no, number, date or position.</li>
  <li><strong>Match the requirement:</strong> name the relevant skill, responsibility or constraint.</li>
  <li><strong>Prove it:</strong> add one real example with scope, action and context.</li>
  <li><strong>Show the result:</strong> use a defensible metric or observable outcome.</li>
  <li><strong>Connect:</strong> explain briefly why this evidence matters for the vacancy.</li>
</ol>
<div class="callout"><p><strong>Example:</strong> “Yes. I have three years of B2B customer-support experience across email and live chat. In my current role I handle 35–45 weekly requests and maintained 96% SLA compliance last quarter. That combination of volume, written communication and service discipline matches this role’s core requirements.”</p></div>

<h2>20 common job application questions with sample answers</h2>
<p>The examples below are models, not scripts. Replace every fact, employer, metric and motivation with your own truthful information.</p>

<h3>1. Why do you want this job?</h3>
<p><strong>Formula:</strong> role responsibility + evidence you enjoy that work + reason this opportunity fits.</p>
<p><strong>Sample answer:</strong> “I am applying because the role combines customer problem-solving with process improvement. In my current support position, I resolve complex account issues and created a knowledge-base workflow that reduced repeat questions by 18%. I would like to bring that practical service experience to a team where improving the customer journey is an explicit responsibility.”</p>

<h3>2. Why do you want to work for our company?</h3>
<p><strong>Sample answer:</strong> “Your public commitment to accessible financial services is the part of the company’s work that interests me most. I have supported customers who needed clear explanations of unfamiliar products, and I value the emphasis your careers page places on plain language. I would contribute relevant support experience while learning in a regulated environment.”</p>
<p>Reference a verifiable product, mission, market or way of working. Avoid praise that could describe any employer.</p>

<h3>3. What interests you about this role?</h3>
<p><strong>Sample answer:</strong> “The mix of SQL analysis, stakeholder communication and recurring reporting fits my strongest experience. I currently maintain three operational dashboards and present weekly findings to non-technical managers. The role would let me use those skills on a larger dataset while taking more ownership of analysis quality.”</p>

<h3>4. What makes you qualified?</h3>
<p><strong>Sample answer:</strong> “I meet the role’s three central requirements: two years of account coordination, advanced Excel use and client-facing communication. I manage a portfolio of 42 business accounts, automated a monthly reconciliation report and regularly lead review calls. I would bring both operational accuracy and direct customer experience.”</p>

<h3>5. Describe your relevant experience</h3>
<p><strong>Sample answer:</strong> “Over the past four years I have progressed from service-desk analyst to L2 support specialist. I troubleshoot Microsoft 365, identity and endpoint issues for 600 users, document recurring fixes and escalate infrastructure incidents. Last year I improved first-contact resolution from 64% to 76% by creating 28 internal guides.”</p>
<p>Keep dates, job titles and scope consistent with your <a href="/resume-builder/">resume</a>. A contradiction between the form and uploaded file creates avoidable doubt.</p>

<h3>6. What is your greatest professional achievement?</h3>
<p><strong>Sample answer:</strong> “Our month-end reporting regularly arrived two days late. I mapped the handoffs, standardized four source files and introduced validation checks in Excel. The team reduced preparation time by 30% and delivered on schedule for six consecutive months. I led the redesign and trained five colleagues.”</p>

<h3>7. Tell us about a challenge you solved</h3>
<p><strong>Sample answer:</strong> “A supplier delay threatened a client launch. I separated critical from non-critical items, confirmed alternatives with engineering and created a daily decision log for the client. We launched the core service on time and completed the remaining work five days later without exceeding budget.”</p>

<h3>8. What are your strengths?</h3>
<p><strong>Sample answer:</strong> “My strongest relevant skill is turning ambiguous requests into a clear plan. For a recent onboarding project, I converted feedback from six teams into owners, deadlines and acceptance criteria. The project launched on schedule with no critical support issues in its first month.”</p>

<h3>9. What is a development area or weakness?</h3>
<p><strong>Sample answer:</strong> “Earlier in my career I spent too long perfecting internal reports. I now agree the decision and audience first, time-box analysis and ask for feedback on an early version. This has made my work faster without reducing accuracy.”</p>
<p>Choose a real, manageable limitation and show the system you use to improve it. Do not disguise a strength as a weakness.</p>

<h3>10. Why are you leaving your current job?</h3>
<p><strong>Sample answer:</strong> “I have learned a great deal in my current role and am leaving on good terms. The team is small, so there is limited scope to own larger implementation projects. I am now looking for a role where project delivery is a central responsibility and where I can build on the coordination experience I already have.”</p>

<h3>11. Why is there a gap in your employment?</h3>
<p><strong>Sample answer:</strong> “From March to October 2025 I took planned family leave. During that period I completed an online data-visualization course and one volunteer reporting project. I am now available for full-time work and have refreshed the technical skills required for this role.”</p>
<p>You do not need to disclose private medical or family details. State the period simply, add relevant activity if useful, and focus on present readiness.</p>

<h3>12. When can you start?</h3>
<p><strong>Sample answer:</strong> “My contractual notice period is four weeks. I could therefore start four weeks after accepting a written offer. I am happy to discuss the exact date with the hiring team.”</p>

<h3>13. What are your salary expectations?</h3>
<p><strong>Sample answer:</strong> “Based on the responsibilities and the published market range, I would expect a base salary between £42,000 and £47,000. I am open to discussing the complete package, role scope and progression.”</p>
<p>Research the market, use one currency and period, and provide a range only if the form requires it. Do not invent a current salary.</p>

<h3>14. Are you authorized to work in this country?</h3>
<p><strong>Sample answer:</strong> “Yes. I am authorized to work in Canada without employer sponsorship.”</p>
<p>Eligibility questions should be answered precisely. If sponsorship is required, say so: “I would require employer sponsorship to work in the United Kingdom.” Never select an inaccurate answer merely to pass a filter.</p>

<h3>15. Are you willing to relocate or travel?</h3>
<p><strong>Sample answer:</strong> “I am based in Rabat and can travel up to 25% with reasonable notice. I would consider relocation to Casablanca for the right long-term opportunity.”</p>

<h3>16. What schedule can you work?</h3>
<p><strong>Sample answer:</strong> “I am available Monday to Friday and can cover the published 10:00–18:00 schedule. I can also join the rotating Saturday shift twice per month with advance notice.”</p>

<h3>17. Do you have the required licence, certification or qualification?</h3>
<p><strong>Sample answer:</strong> “Yes. I hold an active PRINCE2 Practitioner certification, renewed in May 2026. I have applied the framework to two cross-functional implementation projects.”</p>
<p>If you are still studying, give the exact status and expected date rather than claiming completion.</p>

<h3>18. Are you comfortable with a background check?</h3>
<p><strong>Sample answer:</strong> “Yes, I am willing to complete the checks legally required for this role. I would be happy to review the scope and consent process with the employer.”</p>

<h3>19. Is there anything else you would like us to know?</h3>
<p><strong>Sample answer:</strong> “One additional point relevant to the role is that I work professionally in English and French and have supported customers across both languages. I have included the relevant service metrics in my resume and would be pleased to explain the examples in an interview.”</p>
<p>Use this field only for material information not covered elsewhere. Do not repeat your entire cover letter.</p>

<h3>20. Do you require any accommodation?</h3>
<p><strong>Sample answer:</strong> “I would like to discuss a reasonable accommodation for the interview process. Please contact me by email so we can agree the appropriate arrangement.”</p>
<p>You can request an accommodation without providing unnecessary medical detail. Follow the employer’s stated process where one exists.</p>

<h2>How to answer when the form has a character limit</h2>
<table>
  <thead><tr><th>Limit</th><th>Best structure</th><th>What to remove first</th></tr></thead>
  <tbody>
    <tr><td>150 characters</td><td>Direct answer + one proof point</td><td>Introductions and repeated context</td></tr>
    <tr><td>300–500 characters</td><td>Answer + example + result</td><td>Secondary examples</td></tr>
    <tr><td>100–150 words</td><td>Short context + action + result + fit</td><td>Background already visible in the resume</td></tr>
    <tr><td>No stated limit</td><td>Usually 80–150 words</td><td>Anything that does not answer the question</td></tr>
  </tbody>
</table>

<h2>Keep your answers consistent with the ATS application</h2>
<p>An online form may store your answers beside parsed resume data. Review how an <a href="/blog/ats-online-application/">ATS online application works</a>, then check the same job title, dates, employer names, work authorization and availability appear consistently. Use the employer’s terminology naturally, but never add a skill you do not possess.</p>
<p>Before submitting, compare the vacancy with your resume using the <a href="/ats-checker/">free ATS checker</a> and follow the <a href="/blog/tailor-resume-to-job-description-ats-keywords/">ATS keyword tailoring guide</a>. Your answers, <a href="/cover-letter-builder/">cover letter</a> and resume should reinforce the same candidacy rather than repeat identical paragraphs. The guide to <a href="/blog/resume-and-cover-letter-match/">matching a resume and cover letter</a> shows how.</p>

<h2>Final job application answer checklist</h2>
<ul>
  <li>Every question receives a direct answer in its first sentence.</li>
  <li>Examples are true, recent and relevant to the target role.</li>
  <li>Metrics can be explained and defended in an interview.</li>
  <li>Dates, titles and eligibility details match the resume.</li>
  <li>Company research is specific and verifiable.</li>
  <li>No confidential employer, customer or personal data is exposed.</li>
  <li>Spelling, currency, date format and language are consistent.</li>
  <li>The final application is saved in the <a href="/job-tracker/">job tracker</a> with the vacancy and follow-up date.</li>
</ul>`,
    faqTitle: "Frequently asked questions",
    faqs: [
      ["How long should a job application answer be?", "Follow the stated limit. Without one, 40–120 words is usually enough for a focused screening answer, while complex competency questions may need up to 150 words."],
      ["Can I use the same answers for every application?", "Reuse your factual evidence, not an identical response. Adapt the motivation, priorities and terminology to the actual role and employer."],
      ["Should I use AI to write application answers?", "AI can help organize or edit your own facts, but review every sentence. Never submit invented experience, metrics, qualifications or company research."],
      ["Do ATS systems read application answers?", "Many recruiting systems store form answers and may use employer-configured eligibility questions, filters or searches. Workflows differ, so answer every field accurately."],
      ["What if I do not meet every requirement?", "Prioritize essential requirements and explain adjacent experience honestly. Do not claim a licence, authorization or skill you do not have."],
      ["Should application answers repeat my cover letter?", "No. Keep screening answers question-specific. The cover letter should connect your overall motivation and strongest evidence into a coherent narrative."]
    ],
    ctaTitle: "Prepare one consistent application",
    ctaText: "Build the resume, tailor truthful keywords, track the vacancy and prepare for the interview in one browser-first workspace.",
    cta: "Create your resume",
    ctaHref: "/resume-builder/"
  },
  {
    locale: "fr",
    route: "/fr/blog/repondre-questions-candidature-emploi/",
    alternate: "/blog/how-to-answer-job-application-questions/",
    seoTitle: "Questions de candidature : 20 réponses | ApplyCraft",
    title: "Questions de candidature : 20 exemples de réponses",
    description: "Répondez à 20 questions de candidature avec exemples, méthode concise, conseils ATS et checklist honnête avant l’envoi.",
    category: "Candidature",
    read: "18 min de lecture",
    back: "← Tous les articles",
    lead: "Les questions écrites d’un formulaire peuvent décider si le recruteur ouvre votre CV. Une bonne réponse est précise, cohérente avec vos documents et facile à parcourir, sans formule générique ni exagération.",
    quickTitle: "Réponse rapide : apportez des preuves",
    quick: "Pour la plupart des questions, suivez cinq étapes : répondez directement, nommez la compétence ou la condition concernée, donnez un exemple réel, indiquez le résultat, puis reliez cette preuve au poste. Sans limite imposée, 40 à 120 mots suffisent généralement.",
    body: `
<h2>Question de candidature ou question d’entretien ?</h2>
<p>Les questions de candidature apparaissent avant l’entretien. Elles servent à confirmer l’éligibilité, comparer des profils ou aider le recruteur à choisir les personnes à contacter. Une réponse d’entretien peut être développée oralement ; une réponse écrite doit être compréhensible seule.</p>
<p>Ce guide concerne les formulaires et questionnaires écrits. Pour l’oral, consultez les <a href="/fr/blog/questions-entretien-embauche/">questions fréquentes en entretien</a> et entraînez-vous dans l’outil de <a href="/fr/interview-prep/">préparation aux entretiens</a>.</p>

<h2>La méthode en cinq étapes</h2>
<ol>
  <li><strong>Réponse directe :</strong> commencez par un oui, un non, une date, un chiffre ou une position claire.</li>
  <li><strong>Critère :</strong> nommez la compétence ou la condition visée.</li>
  <li><strong>Preuve :</strong> donnez un exemple réel avec contexte et périmètre.</li>
  <li><strong>Résultat :</strong> ajoutez un chiffre défendable ou un effet observable.</li>
  <li><strong>Lien :</strong> expliquez en une phrase la pertinence pour le poste.</li>
</ol>
<div class="callout"><p><strong>Exemple :</strong> « Oui. J’ai trois ans d’expérience en support client B2B par e-mail et chat. Dans mon poste actuel, je traite 35 à 45 demandes par semaine avec 96 % de respect des SLA. Ce volume, cette communication écrite et cette rigueur correspondent aux exigences centrales du poste. »</p></div>

<h2>20 questions de candidature avec réponses</h2>
<p>Ces formulations sont des modèles. Remplacez chaque expérience, chiffre, entreprise et motivation par vos propres faits.</p>

<h3>1. Pourquoi souhaitez-vous ce poste ?</h3>
<p><strong>Exemple :</strong> « Ce poste m’intéresse parce qu’il associe résolution de problèmes clients et amélioration des processus. Dans mon rôle actuel, j’ai créé un circuit de base de connaissances qui a réduit de 18 % les questions répétitives. Je souhaite mettre cette expérience au service d’une équipe où l’amélioration du parcours client constitue une responsabilité explicite. »</p>

<h3>2. Pourquoi notre entreprise ?</h3>
<p><strong>Exemple :</strong> « Votre engagement public en faveur de services financiers accessibles m’intéresse particulièrement. J’accompagne déjà des clients qui ont besoin d’explications claires sur des produits nouveaux. L’importance accordée au langage simple sur votre site carrière correspond donc à mon expérience et à ma façon de travailler. »</p>

<h3>3. Qu’est-ce qui vous intéresse dans cette fonction ?</h3>
<p><strong>Exemple :</strong> « La combinaison de l’analyse SQL, de la communication avec les équipes et du reporting correspond à mes points forts. Je maintiens trois tableaux de bord opérationnels et présente les résultats chaque semaine à des responsables non techniques. »</p>

<h3>4. Pourquoi êtes-vous qualifié(e) ?</h3>
<p><strong>Exemple :</strong> « Je réponds aux trois exigences principales : deux ans de coordination de comptes, un niveau avancé sur Excel et une expérience client. Je gère 42 comptes professionnels, j’ai automatisé un rapport mensuel et j’anime régulièrement les revues de performance. »</p>

<h3>5. Décrivez votre expérience pertinente</h3>
<p><strong>Exemple :</strong> « En quatre ans, je suis passé d’analyste service desk à spécialiste support L2. Je résous les incidents Microsoft 365, identité et poste de travail de 600 utilisateurs. L’an dernier, 28 guides internes que j’ai rédigés ont fait progresser la résolution au premier contact de 64 % à 76 %. »</p>
<p>Les dates, intitulés et périmètres doivent correspondre à votre <a href="/fr/creer-cv-gratuit/">CV</a>.</p>

<h3>6. Quelle est votre plus grande réussite ?</h3>
<p><strong>Exemple :</strong> « Notre reporting mensuel accusait régulièrement deux jours de retard. J’ai cartographié les dépendances, normalisé quatre fichiers sources et ajouté des contrôles Excel. Le temps de préparation a baissé de 30 % et l’équipe a respecté le délai pendant six mois consécutifs. »</p>

<h3>7. Parlez d’un problème que vous avez résolu</h3>
<p><strong>Exemple :</strong> « Un retard fournisseur menaçait le lancement d’un client. J’ai distingué les éléments critiques, validé des alternatives avec l’ingénierie et créé un journal de décision quotidien. Le service principal a été lancé à temps et le solde livré cinq jours plus tard sans dépassement budgétaire. »</p>

<h3>8. Quels sont vos points forts ?</h3>
<p><strong>Exemple :</strong> « Mon point fort le plus pertinent est de transformer une demande ambiguë en plan clair. Pour un projet d’intégration, j’ai converti les retours de six équipes en responsables, échéances et critères d’acceptation. Le lancement a eu lieu dans les délais, sans incident critique le premier mois. »</p>

<h3>9. Quel est votre axe d’amélioration ?</h3>
<p><strong>Exemple :</strong> « Au début de ma carrière, je consacrais trop de temps à perfectionner les rapports internes. Je définis maintenant la décision et le public visés, je limite le temps d’analyse et je sollicite un avis sur une première version. »</p>

<h3>10. Pourquoi quittez-vous votre emploi ?</h3>
<p><strong>Exemple :</strong> « J’ai beaucoup appris dans mon poste actuel et je pars en bons termes. L’équipe étant petite, les possibilités de piloter des projets d’implémentation plus importants sont limitées. Je recherche maintenant une fonction où la livraison de projets constitue une responsabilité centrale. »</p>

<h3>11. Comment expliquez-vous cette période sans emploi ?</h3>
<p><strong>Exemple :</strong> « De mars à octobre 2025, j’ai pris un congé familial planifié. J’ai suivi une formation en visualisation de données et réalisé un projet bénévole de reporting. Je suis aujourd’hui disponible à temps plein. »</p>
<p>Vous n’êtes pas tenu de révéler des informations médicales ou familiales privées.</p>

<h3>12. Quand pouvez-vous commencer ?</h3>
<p><strong>Exemple :</strong> « Mon préavis contractuel est de quatre semaines. Je pourrais donc commencer quatre semaines après l’acceptation d’une offre écrite. Je reste disponible pour convenir de la date exacte. »</p>

<h3>13. Quelles sont vos prétentions salariales ?</h3>
<p><strong>Exemple :</strong> « Au regard des responsabilités et des données de marché publiées, j’envisage un salaire brut annuel compris entre 42 000 € et 47 000 €. Je suis disposé à discuter du package global, du périmètre et des perspectives. »</p>

<h3>14. Êtes-vous autorisé(e) à travailler dans ce pays ?</h3>
<p><strong>Exemple :</strong> « Oui. Je suis autorisé à travailler en France sans parrainage de l’employeur. »</p>
<p>Si un visa est nécessaire, indiquez-le clairement. Ne choisissez jamais une réponse inexacte pour franchir un filtre.</p>

<h3>15. Acceptez-vous la mobilité ou les déplacements ?</h3>
<p><strong>Exemple :</strong> « Je réside à Rabat et peux effectuer jusqu’à 25 % de déplacements avec un préavis raisonnable. J’envisagerais une mobilité à Casablanca pour une opportunité durable. »</p>

<h3>16. Quelles sont vos disponibilités horaires ?</h3>
<p><strong>Exemple :</strong> « Je suis disponible du lundi au vendredi sur l’horaire publié de 10 h à 18 h. Je peux également participer à la rotation du samedi deux fois par mois avec préavis. »</p>

<h3>17. Possédez-vous le diplôme, permis ou certificat requis ?</h3>
<p><strong>Exemple :</strong> « Oui. Je possède une certification PRINCE2 Practitioner active, renouvelée en mai 2026, et j’ai appliqué ce cadre à deux projets d’implémentation transverses. »</p>

<h3>18. Acceptez-vous une vérification des antécédents ?</h3>
<p><strong>Exemple :</strong> « Oui, j’accepte les contrôles légalement requis pour cette fonction. Je souhaite simplement prendre connaissance de leur périmètre et de la procédure de consentement. »</p>

<h3>19. Souhaitez-vous ajouter une information ?</h3>
<p><strong>Exemple :</strong> « Un élément complémentaire pertinent est que je travaille professionnellement en français et en anglais et que j’ai accompagné des clients dans les deux langues. Les indicateurs correspondants figurent dans mon CV. »</p>

<h3>20. Avez-vous besoin d’un aménagement ?</h3>
<p><strong>Exemple :</strong> « Je souhaite discuter d’un aménagement raisonnable pour le processus d’entretien. Merci de me contacter par e-mail afin que nous convenions de la modalité appropriée. »</p>

<h2>Répondre avec une limite de caractères</h2>
<table>
  <thead><tr><th>Limite</th><th>Structure recommandée</th><th>À supprimer d’abord</th></tr></thead>
  <tbody>
    <tr><td>150 caractères</td><td>Réponse directe + une preuve</td><td>Introduction et contexte répété</td></tr>
    <tr><td>300 à 500 caractères</td><td>Réponse + exemple + résultat</td><td>Exemples secondaires</td></tr>
    <tr><td>100 à 150 mots</td><td>Contexte bref + action + résultat + lien</td><td>Parcours déjà visible dans le CV</td></tr>
    <tr><td>Aucune limite</td><td>Généralement 80 à 150 mots</td><td>Tout ce qui ne répond pas à la question</td></tr>
  </tbody>
</table>

<h2>Assurer la cohérence avec l’ATS</h2>
<p>Un logiciel de recrutement peut stocker les réponses à côté des données extraites du CV. Découvrez le fonctionnement d’une <a href="/fr/blog/candidature-en-ligne-ats/">candidature en ligne traitée par un ATS</a>, puis vérifiez la cohérence des dates, employeurs, intitulés, autorisations et disponibilités.</p>
<p>Comparez ensuite l’offre et le document avec le <a href="/ats-checker-fr/">vérificateur ATS gratuit</a> et le guide pour <a href="/fr/blog/adapter-cv-offre-emploi-mots-cles-ats/">adapter son CV aux mots-clés de l’offre</a>. La <a href="/cover-letter-builder/?ui=fr&docLang=fr">lettre de motivation</a> doit compléter vos réponses au lieu de reproduire les mêmes paragraphes.</p>

<h2>Checklist finale</h2>
<ul>
  <li>La première phrase répond directement à chaque question.</li>
  <li>Les exemples sont réels, récents et pertinents.</li>
  <li>Chaque chiffre peut être expliqué en entretien.</li>
  <li>Les dates, titres et conditions d’éligibilité correspondent au CV.</li>
  <li>Les informations sur l’entreprise sont précises et vérifiables.</li>
  <li>Aucune donnée confidentielle d’un employeur ou d’un client n’est exposée.</li>
  <li>Orthographe, devise, format des dates et langue sont homogènes.</li>
  <li>La candidature et la relance sont enregistrées dans le <a href="/job-tracker/?ui=fr&docLang=fr">suivi des candidatures</a>.</li>
</ul>`,
    faqTitle: "Questions fréquentes",
    faqs: [
      ["Quelle longueur pour une réponse de candidature ?", "Respectez la limite affichée. Sans consigne, 40 à 120 mots suffisent généralement ; une question de compétence complexe peut nécessiter jusqu’à 150 mots."],
      ["Peut-on réutiliser les mêmes réponses ?", "Réutilisez vos preuves factuelles, pas une réponse identique. Adaptez la motivation, les priorités et le vocabulaire au poste réel."],
      ["Peut-on utiliser l’IA pour répondre ?", "L’IA peut structurer ou corriger vos propres faits, mais relisez tout. Ne soumettez jamais une expérience, un chiffre, un diplôme ou une recherche inventés."],
      ["Les ATS lisent-ils les réponses du formulaire ?", "De nombreux logiciels les stockent et peuvent appliquer des questions d’éligibilité, filtres ou recherches configurés par l’employeur. Les pratiques varient."],
      ["Que faire si je ne remplis pas tous les critères ?", "Concentrez-vous sur les exigences essentielles et expliquez honnêtement une expérience proche. N’inventez jamais une autorisation, un permis ou une compétence."],
      ["Faut-il répéter la lettre de motivation ?", "Non. Les réponses doivent traiter chaque question. La lettre relie votre motivation et vos meilleures preuves dans un récit cohérent."]
    ],
    ctaTitle: "Préparez une candidature cohérente",
    ctaText: "Créez le CV, adaptez les mots-clés avec honnêteté, suivez l’offre et préparez l’entretien dans un même espace.",
    cta: "Créer mon CV",
    ctaHref: "/fr/creer-cv-gratuit/"
  }
];

const esc = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function jsonLd(article) {
  const canonical = `${SITE}${article.route}`;
  const faq = article.faqs.map(([name, text]) => ({
    "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text }
  }));
  return [
    { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: DATE, dateModified: DATE, inLanguage: article.locale, author: { "@type": "Person", name: "Isaac Biroue", url: `${SITE}/about/` }, publisher: { "@type": "Organization", name: "ApplyCraft", url: `${SITE}/`, logo: { "@type": "ImageObject", url: `${SITE}/assets/brand/applycraft-logo-navbar.png` } }, image: `${SITE}/og/blog.png`, mainEntityOfPage: canonical },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: article.locale === "fr" ? "Accueil" : "Home", item: article.locale === "fr" ? `${SITE}/fr/` : `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: article.locale === "fr" ? `${SITE}/fr/blog/` : `${SITE}/blog/` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical }
    ] }
  ].map((data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`).join("\n");
}

function render(article) {
  const canonical = `${SITE}${article.route}`;
  const alternateLocale = article.locale === "fr" ? "en" : "fr";
  const metaLocale = article.locale === "fr" ? "fr_FR" : "en_US";
  const otherMetaLocale = article.locale === "fr" ? "en_US" : "fr_FR";
  const faqs = article.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("\n");
  return `<!doctype html>
<html lang="${article.locale}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(article.seoTitle)}</title>
<meta name="description" content="${esc(article.description)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="${article.locale}" href="${canonical}"/>
<link rel="alternate" hreflang="${alternateLocale}" href="${SITE}${article.alternate}"/>
<link rel="alternate" hreflang="x-default" href="${SITE}/blog/how-to-answer-job-application-questions/"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="ApplyCraft"/>
<meta property="og:locale" content="${metaLocale}"/>
<meta property="og:locale:alternate" content="${otherMetaLocale}"/>
<meta property="og:title" content="${esc(article.title)}"/>
<meta property="og:description" content="${esc(article.description)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:image" content="${SITE}/og/blog.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${esc(article.title)}"/>
<meta property="article:published_time" content="${DATE}T00:00:00+00:00"/>
<meta property="article:modified_time" content="${DATE}T00:00:00+00:00"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(article.title)}"/>
<meta name="twitter:description" content="${esc(article.description)}"/>
<meta name="twitter:image" content="${SITE}/og/blog.png"/>
<link rel="icon" href="/favicon.ico?v=2" sizes="any"/>
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"/>
<link rel="manifest" href="/site.webmanifest?v=2"/>
<link rel="preload" href="/fonts/ibm-plex-sans-latin.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="stylesheet" href="/_seo.css"/>
${jsonLd(article)}
<style>
.prose{max-width:780px;margin:0 auto;padding:48px 24px 100px}.prose .back{display:inline-block;font-size:13px;font-weight:700;color:#a78bfa;text-decoration:none;margin-bottom:28px}.post-meta{font-size:12px;color:#8b9eb8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:14px;display:flex;gap:10px;flex-wrap:wrap}.tag{background:#1e293b;color:#a78bfa;border-radius:999px;padding:3px 10px}.prose h1{font-size:clamp(30px,5vw,46px);font-weight:800;letter-spacing:-1.2px;margin:0 0 20px;line-height:1.12;color:#eef2ff}.lead{font-size:18px;color:#a9b8cd;margin:0 0 34px;line-height:1.75}.prose h2{font-size:25px;color:#e4ebf5;margin:48px 0 16px}.prose h3{font-size:18px;color:#d1d9e6;margin:32px 0 10px}.prose p,.prose li{font-size:15.5px;color:#9fb0c7;line-height:1.85}.prose p{margin:0 0 16px}.prose ul,.prose ol{padding-left:24px;margin:0 0 20px}.prose li{margin-bottom:8px}.prose strong{color:#d6deea}.prose a{color:#a78bfa;text-underline-offset:3px}.callout{background:#101827;border:1px solid #26354e;border-left:4px solid #8b5cf6;border-radius:10px;padding:20px 22px;margin:28px 0}.callout p{margin:0;color:#c3cede}.prose table{width:100%;border-collapse:collapse;margin:24px 0 32px;background:#0d1420;border:1px solid #26354e}.prose th,.prose td{padding:12px 14px;border:1px solid #26354e;text-align:left;color:#a9b8cd;vertical-align:top}.prose th{color:#eef2ff;background:#151f31}.faq{margin-top:52px}.faq details{border:1px solid #26354e;border-radius:9px;margin:10px 0;background:#0d1420}.faq summary{cursor:pointer;padding:15px 18px;color:#e4ebf5;font-weight:700}.faq details p{padding:0 18px 16px;margin:0}.cta-box{text-align:center;background:linear-gradient(145deg,rgba(126,34,206,.2),rgba(37,99,235,.16));border:1px solid #4c3d8f;border-radius:16px;padding:36px 24px;margin:48px 0 0}.cta-box h2{margin:0 0 8px}.cta-box p{margin:0 0 20px}.cta-btn{display:inline-block;background:linear-gradient(135deg,#9333ea,#2563eb);color:#fff!important;text-decoration:none;border-radius:8px;padding:13px 28px;font-weight:800}@media(max-width:640px){.prose{padding:32px 18px 72px}.prose table{font-size:13px}.prose th,.prose td{padding:9px}}
</style>
<script src="/consent.js" defer></script>
</head>
<body>
${headerHtml(article.locale, article.route)}
<main id="main-content" tabindex="-1"><article class="prose">
<a href="${article.locale === "fr" ? "/fr/blog/" : "/blog/"}" class="back">${article.back}</a>
<div class="post-meta"><span class="tag">${esc(article.category)}</span><span>${DATE}</span><span>· ${article.read}</span></div>
<h1>${esc(article.title)}</h1>
<p class="lead">${esc(article.lead)}</p>
<div class="callout"><p><strong>${esc(article.quickTitle)}</strong><br/>${esc(article.quick)}</p></div>
${article.body}
<section class="faq"><h2>${esc(article.faqTitle)}</h2>${faqs}</section>
<section class="cta-box"><h2>${esc(article.ctaTitle)}</h2><p>${esc(article.ctaText)}</p><a class="cta-btn" href="${article.ctaHref}">${esc(article.cta)}</a></section>
</article></main>
${footerHtml(article.locale)}
</body></html>`;
}

for (const article of articles) {
  const output = join(ROOT, "public", article.route.replace(/^\/|\/$/g, ""), "index.html");
  mkdirSync(join(output, ".."), { recursive: true });
  writeFileSync(output, render(article), "utf8");
}

console.log(`Generated ${articles.length} application-question articles.`);
