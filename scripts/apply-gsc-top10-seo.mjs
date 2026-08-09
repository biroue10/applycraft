import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const log = (message) => console.log(`[gsc-top10] ${message}`);

function filePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readRequired(relativePath) {
  const target = filePath(relativePath);
  if (!fs.existsSync(target)) throw new Error(`Required SEO page is missing: ${relativePath}`);
  return fs.readFileSync(target, "utf8");
}

function writeIfChanged(relativePath, before, after) {
  if (before === after) {
    log(`unchanged ${relativePath}`);
    return;
  }
  fs.writeFileSync(filePath(relativePath), after, "utf8");
  log(`updated ${relativePath}`);
}

function setTitle(html, title) {
  if (!/<title>[\s\S]*?<\/title>/i.test(html)) throw new Error("Missing <title>");
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setMetaName(html, name, content) {
  const re = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*\\/?>`, "i");
  if (!re.test(html)) throw new Error(`Missing meta[name=${name}]`);
  return html.replace(re, `<meta name="${name}" content="${content}">`);
}

function setMetaProperty(html, property, content, { required = false } = {}) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+property=["']${escaped}["']\\s+content=["'][^"']*["']\\s*\\/?>`, "i");
  if (!re.test(html)) {
    if (required) throw new Error(`Missing meta[property=${property}]`);
    return html;
  }
  return html.replace(re, `<meta property="${property}" content="${content}">`);
}

function setFirstH1(html, h1) {
  if (!/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i.test(html)) throw new Error("Missing H1");
  return html.replace(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i, `<h1>${h1}</h1>`);
}

function updateBlogPostingSchema(html, fields) {
  return html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (full, raw) => {
    try {
      const data = JSON.parse(raw);
      const entries = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
      let changed = false;
      for (const entry of entries) {
        const types = Array.isArray(entry?.["@type"]) ? entry["@type"] : [entry?.["@type"]];
        if (types.includes("BlogPosting") || types.includes("Article")) {
          Object.assign(entry, fields);
          changed = true;
        }
      }
      return changed
        ? `<script type="application/ld+json">${JSON.stringify(data)}</script>`
        : full;
    } catch {
      return full;
    }
  });
}

function addStyles(html) {
  if (html.includes('data-gsc-seo-style="top10"')) return html;
  const css = `<style data-gsc-seo-style="top10">
.gsc-answer,.gsc-evidence,.gsc-role-examples,.gsc-complete-example,.gsc-resources{margin:24px 0;padding:20px;border:1px solid var(--border,#20324e);border-radius:14px;background:rgba(99,102,241,.06)}
.gsc-answer h2,.gsc-evidence h2,.gsc-role-examples h2,.gsc-complete-example h2,.gsc-resources h2{margin-top:0}
.gsc-table-wrap{overflow-x:auto;margin:20px 0;-webkit-overflow-scrolling:touch}
.gsc-table{width:100%;min-width:720px;border-collapse:collapse}
.gsc-table caption{text-align:left;font-weight:700;margin-bottom:10px}
.gsc-table th,.gsc-table td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--border,#20324e)}
.gsc-example-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.gsc-example-card{padding:16px;border:1px solid var(--border,#20324e);border-radius:12px;background:rgba(255,255,255,.025)}
.gsc-example-card h3{margin-top:0}
.gsc-resources ul{margin-bottom:0}
[dir="rtl"] .gsc-table caption,[dir="rtl"] .gsc-table th,[dir="rtl"] .gsc-table td{text-align:right}
@media (max-width:768px){.gsc-answer,.gsc-evidence,.gsc-role-examples,.gsc-complete-example,.gsc-resources{padding:16px}.gsc-table th,.gsc-table td{padding:10px}}
</style>`;
  if (!/<\/head>/i.test(html)) throw new Error("Missing </head>");
  return html.replace(/<\/head>/i, `${css}</head>`);
}

function insertAfterLead(html, marker, block) {
  if (html.includes(marker)) return html;
  const re = /<p\s+class=["']lead["'][^>]*>[\s\S]*?<\/p>/i;
  if (!re.test(html)) throw new Error(`Missing lead paragraph for ${marker}`);
  return html.replace(re, (match) => `${match}\n${block}`);
}

function insertBeforeFaqOrMainEnd(html, marker, block) {
  if (html.includes(marker)) return html;
  const faq = /<h2[^>]*>Frequently asked questions<\/h2>/i;
  if (faq.test(html)) return html.replace(faq, `${block}\n$&`);
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${block}\n</main>`);
  throw new Error(`Could not find insertion point for ${marker}`);
}

function insertBeforeMainEnd(html, marker, block) {
  if (html.includes(marker)) return html;
  if (!/<\/main>/i.test(html)) throw new Error(`Missing </main> for ${marker}`);
  return html.replace(/<\/main>/i, `${block}\n</main>`);
}

function updateRegistryEntry(source, slug, title, description) {
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\{[^{}]*slug:\"${escapedSlug}\"[^{}]*\\}`, "m");
  if (!re.test(source)) throw new Error(`Blog registry entry not found: ${slug}`);
  return source.replace(re, (entry) => entry
    .replace(/title:\"[^\"]*\"/, `title:\"${title}\"`)
    .replace(/description:\"[^\"]*\"/, `description:\"${description}\"`));
}

const teacherDirect = `<section class="gsc-answer" data-gsc-seo="teacher-direct-answer">
<h2>What skills should a teacher put on a resume?</h2>
<p>A strong teacher resume usually combines classroom management, lesson planning, differentiated instruction, assessment, curriculum knowledge, communication, collaboration and educational technology. The strongest version does not stop at a list: it connects each skill to evidence from your real teaching, placements, projects or student-support work. Tailor that evidence to the responsibilities and terminology in the job posting.</p>
</section>`;

const teacherEvidence = `<section class="gsc-evidence" data-gsc-seo="teacher-skills-evidence">
<h2>Teacher resume skills and how to prove them</h2>
<p>Use this table as a drafting guide. The bullets are illustrative, so replace details with evidence that is true for your own experience.</p>
<div class="gsc-table-wrap"><table class="gsc-table">
<caption>Teacher skills, evidence and example resume bullets</caption>
<thead><tr><th scope="col">Skill</th><th scope="col">Evidence to include</th><th scope="col">Example resume bullet</th><th scope="col">Best section</th></tr></thead>
<tbody>
<tr><td>Classroom management</td><td>Routines, behaviour support, group size, learning environment</td><td>Used structured classroom routines and differentiated activities to support a class of 28 students.</td><td>Experience</td></tr>
<tr><td>Lesson planning</td><td>Curriculum objectives, units, sequencing, adaptations</td><td>Designed weekly lessons aligned with curriculum objectives and adapted activities for different learning needs.</td><td>Experience</td></tr>
<tr><td>Differentiated instruction</td><td>Scaffolds, grouping, accommodations, varied learning needs</td><td>Adapted reading activities with small-group instruction and scaffolded materials for mixed proficiency levels.</td><td>Experience</td></tr>
<tr><td>Curriculum development</td><td>Units, resources, standards alignment, cross-curricular planning</td><td>Co-developed a term unit linking writing, research and presentation skills across three assessed projects.</td><td>Experience / Projects</td></tr>
<tr><td>Student assessment</td><td>Formative checks, rubrics, feedback, progress tracking</td><td>Used weekly formative assessments to identify learning gaps and adjust follow-up instruction.</td><td>Experience</td></tr>
<tr><td>Educational technology</td><td>LMS tools, digital assessment, virtual learning, accessibility</td><td>Built reusable digital lesson resources and quizzes to support in-class and remote learning.</td><td>Experience / Skills</td></tr>
<tr><td>Parent communication</td><td>Progress updates, conferences, difficult conversations, follow-up</td><td>Maintained clear family communication through scheduled progress updates and documented follow-up.</td><td>Experience</td></tr>
<tr><td>Collaboration</td><td>Co-planning, multidisciplinary teams, teaching assistants</td><td>Co-planned lessons with grade-level colleagues and coordinated classroom support with teaching assistants.</td><td>Experience</td></tr>
<tr><td>Special education support</td><td>Accommodations, individual plans, specialist collaboration</td><td>Applied documented accommodations and collaborated with support staff to improve access to classroom tasks.</td><td>Experience</td></tr>
<tr><td>Data-informed instruction</td><td>Assessment trends, intervention groups, reteaching decisions</td><td>Reviewed assessment results to form targeted support groups and plan reteaching activities.</td><td>Experience</td></tr>
<tr><td>Student engagement</td><td>Discussion, project-based learning, participation strategies</td><td>Used structured discussion and project-based activities to increase participation across mixed-ability groups.</td><td>Experience</td></tr>
<tr><td>Mentoring and leadership</td><td>New-teacher support, clubs, committees, curriculum leadership</td><td>Mentored a trainee teacher through lesson planning, observation feedback and classroom routines.</td><td>Leadership / Experience</td></tr>
</tbody></table></div>
</section>
<section class="gsc-role-examples" data-gsc-seo="teacher-role-examples">
<h2>Teacher achievement examples by role</h2>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Elementary teacher</h3><p>Planned literacy and numeracy lessons for a mixed-ability class and used small-group follow-up based on weekly assessment evidence.</p></article>
<article class="gsc-example-card"><h3>High-school teacher</h3><p>Designed standards-aligned units with clear assessment criteria and provided targeted feedback before major assignments.</p></article>
<article class="gsc-example-card"><h3>New teacher</h3><p>Completed supervised teaching placements covering lesson planning, classroom routines, assessment and family communication.</p></article>
<article class="gsc-example-card"><h3>Substitute teacher</h3><p>Maintained classroom routines across multiple year groups while adapting quickly to teacher plans and school procedures.</p></article>
<article class="gsc-example-card"><h3>Special education teacher</h3><p>Coordinated classroom accommodations with support staff and adapted tasks to documented learner needs.</p></article>
<article class="gsc-example-card"><h3>ESL teacher</h3><p>Used scaffolded speaking, reading and vocabulary activities for learners at different proficiency levels.</p></article>
<article class="gsc-example-card"><h3>Online teacher</h3><p>Structured synchronous lessons with digital checks for understanding and clear asynchronous follow-up activities.</p></article>
<article class="gsc-example-card"><h3>Teaching assistant</h3><p>Supported individual and small-group activities, documented observations and reinforced teacher-led classroom routines.</p></article>
<article class="gsc-example-card"><h3>Department lead</h3><p>Coordinated shared planning, moderation and resource development while supporting colleagues with curriculum implementation.</p></article>
</div></section>
<section class="gsc-resources" data-gsc-seo="teacher-resources"><h2>Put the evidence into context</h2><ul>
<li>See a <a href="/examples/teacher-resume/">complete teacher resume example</a>.</li>
<li><a href="/resume/templates/">Browse resume templates</a> before choosing a layout.</li>
<li><a href="/resume-builder/">Build your teacher resume</a> with your own evidence.</li>
<li><a href="/ats-checker/">Check ATS readability</a> against the role you are targeting.</li>
<li><a href="/interview-prep/">Prepare for a teaching interview</a> after tailoring the application.</li>
<li>Create a matching <a href="/cover-letter-builder/">cover letter</a>.</li>
</ul></section>`;

const studentSummaryDirect = `<section class="gsc-answer" data-gsc-seo="student-summary-direct-answer">
<h2>What is a good resume summary for a student?</h2>
<p>A good student resume summary combines your current education or status, the role you are targeting, two or three relevant skills, and one source of evidence such as a project, coursework, volunteering or a student activity. Keep it concise and truthful. Specific evidence is more credible than generic phrases such as “hard-working student” when those phrases are not supported by examples.</p>
</section>`;

const studentSummaryExtra = `<section class="gsc-role-examples" data-gsc-seo="student-summary-before-after">
<h2>Turn a generic student summary into a credible one</h2>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Too generic</h3><p>Motivated student looking for a job and ready to learn new skills.</p></article>
<article class="gsc-example-card"><h3>Evidence-based</h3><p>Computer science student with hands-on experience from Python and web-development projects, seeking an entry-level support or development role where troubleshooting and clear documentation matter.</p></article>
</div>
<p>The second version is stronger because it identifies the candidate, shows where the evidence comes from and names the kind of value relevant to the target role.</p>
</section>
<section class="gsc-resources" data-gsc-seo="student-summary-resources"><h2>Continue building the student resume</h2><ul>
<li>Use the complete guide to <a href="/blog/student-resume-no-experience/">build a student resume without work experience</a>.</li>
<li><a href="/student-resume-builder/">Build your student resume</a> with projects, education and volunteering.</li>
<li><a href="/resume/templates/">Choose a resume template</a> that keeps the content easy to scan.</li>
<li>Create a matching <a href="/cover-letter-builder/">cover letter</a> when the application asks for one.</li>
</ul></section>`;

const studentNoExperienceDirect = `<section class="gsc-answer" data-gsc-seo="student-no-experience-direct-answer">
<h2>What should a student put on a resume with no experience?</h2>
<p>If you do not have formal work history, build the resume around evidence you do have: education, relevant coursework, academic or personal projects, volunteering, clubs, leadership, certifications, languages and transferable skills. The goal is not to disguise the lack of employment. It is to show how your real activities demonstrate useful skills for the role you want.</p>
</section>`;

const studentNoExperienceExtra = `<section class="gsc-complete-example" data-gsc-seo="student-complete-example">
<h2>Complete student resume example with no work experience</h2>
<p><strong>Illustrative example:</strong> replace every detail with information that is true for you.</p>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Maya Patel</h3><p>Toronto, ON · maya.patel@example.com · 555-0100</p><p><strong>Target:</strong> Entry-Level IT Support Assistant</p></article>
<article class="gsc-example-card"><h3>Summary</h3><p>Computer systems student with hands-on Windows, Linux and networking practice from coursework and a home lab. Comfortable documenting troubleshooting steps and explaining technical issues clearly.</p></article>
<article class="gsc-example-card"><h3>Education</h3><p>Diploma in Computer Systems Technology — expected 2027. Relevant coursework: networking fundamentals, operating systems, technical support and scripting.</p></article>
<article class="gsc-example-card"><h3>Project</h3><p><strong>Home-lab support project:</strong> configured user accounts, shared folders and basic network services across Windows and Linux virtual machines; documented setup and recovery steps.</p></article>
<article class="gsc-example-card"><h3>Volunteering</h3><p>Helped a community group organize event registrations, answer participant questions and maintain accurate spreadsheet records.</p></article>
<article class="gsc-example-card"><h3>Skills</h3><p>Windows · Linux · basic networking · Microsoft 365 · troubleshooting · documentation · customer communication</p></article>
</div></section>
<section class="gsc-evidence" data-gsc-seo="student-skills-evidence"><h2>Transferable student skills and where to find evidence</h2>
<div class="gsc-table-wrap"><table class="gsc-table"><caption>Student skills, evidence sources and resume examples</caption><thead><tr><th scope="col">Skill</th><th scope="col">Potential evidence</th><th scope="col">Example bullet</th><th scope="col">Suitable roles</th></tr></thead><tbody>
<tr><td>Communication</td><td>Presentations, volunteering, clubs</td><td>Presented project findings to a five-person class team and answered follow-up questions.</td><td>Service, admin, internships</td></tr>
<tr><td>Teamwork</td><td>Group projects, sports, student societies</td><td>Coordinated task ownership and deadlines for a four-person semester project.</td><td>Most entry-level roles</td></tr>
<tr><td>Time management</td><td>Coursework, activities, volunteering</td><td>Balanced weekly volunteer shifts with a full academic timetable and project deadlines.</td><td>Retail, admin, internships</td></tr>
<tr><td>Customer service</td><td>Events, clubs, community volunteering</td><td>Answered participant questions and directed attendees during community events.</td><td>Retail, hospitality, support</td></tr>
<tr><td>Research</td><td>Assignments, capstone projects</td><td>Compared five sources and summarized findings into a structured research report.</td><td>Analyst, academic, office roles</td></tr>
<tr><td>Writing</td><td>Reports, newsletters, project documentation</td><td>Produced clear project documentation covering setup, testing and known limitations.</td><td>Admin, support, communications</td></tr>
<tr><td>Excel / data organization</td><td>Coursework, club records</td><td>Maintained a spreadsheet of registrations and checked entries for missing information.</td><td>Admin, finance, operations</td></tr>
<tr><td>Technical troubleshooting</td><td>Labs, personal projects, peer support</td><td>Diagnosed basic Windows and network issues in a virtual home-lab environment.</td><td>IT support, technical internships</td></tr>
<tr><td>Leadership</td><td>Clubs, sports, project teams</td><td>Led weekly project check-ins and tracked actions until final submission.</td><td>Team-based entry roles</td></tr>
<tr><td>Problem-solving</td><td>Projects, competitions, labs</td><td>Tested alternative approaches after an initial project method failed to meet requirements.</td><td>Technical, operations, service</td></tr>
<tr><td>Languages</td><td>Real language proficiency</td><td>List only languages and proficiency levels you can genuinely use.</td><td>Customer-facing, international roles</td></tr>
<tr><td>Reliability</td><td>Volunteering, attendance, recurring responsibilities</td><td>Completed scheduled volunteer responsibilities across a full academic term.</td><td>Most entry-level roles</td></tr>
</tbody></table></div></section>
<section class="gsc-resources" data-gsc-seo="student-no-experience-resources"><h2>Build the rest of the application</h2><ul>
<li>See more <a href="/blog/student-resume-summary-examples/">student resume summary examples</a>.</li>
<li><a href="/student-resume-builder/">Build your student resume</a>.</li>
<li><a href="/resume/templates/">Browse resume templates</a>.</li>
<li>Create a matching <a href="/cover-letter-builder/">cover letter</a>.</li>
<li><a href="/ats-checker/">Check ATS readability</a> before submitting.</li>
<li>Organize applications with the <a href="/job-tracker/">Job Tracker</a> and practise with <a href="/interview-prep/">Interview Prep</a>.</li>
</ul></section>`;

function patchArticle(relativePath, { title, description, h1, direct, extra, schemaHeadline }) {
  const before = readRequired(relativePath);
  let html = before;
  html = setTitle(html, `${title} | ApplyCraft`);
  html = setMetaName(html, "description", description);
  html = setMetaProperty(html, "og:title", schemaHeadline || title);
  html = setMetaProperty(html, "og:description", description);
  html = setFirstH1(html, h1);
  html = updateBlogPostingSchema(html, { headline: h1, description });
  html = addStyles(html);
  html = insertAfterLead(html, direct.match(/data-gsc-seo="[^"]+"/)[0], direct);
  html = insertBeforeFaqOrMainEnd(html, extra.match(/data-gsc-seo="[^"]+"/)[0], extra);
  writeIfChanged(relativePath, before, html);
}

patchArticle("public/blog/teacher-resume-skills-achievements/index.html", {
  title: "Teacher Resume Skills & Achievements",
  description: "Learn the best teacher resume skills, how to prove them with evidence, and achievement examples for new, primary, secondary and special education teachers.",
  h1: "Teacher Resume Skills and Achievements: Examples That Show Your Impact",
  direct: teacherDirect,
  extra: teacherEvidence,
  schemaHeadline: "Teacher Resume Skills and Achievement Examples",
});

patchArticle("public/blog/student-resume-summary-examples/index.html", {
  title: "Student Resume Summary Examples",
  description: "See 25 student resume summary examples and learn a simple formula for writing a credible profile using projects, education, volunteering and transferable skills.",
  h1: "Student Resume Summary Examples: 25 Strong Profiles",
  direct: studentSummaryDirect,
  extra: studentSummaryExtra,
});

patchArticle("public/blog/student-resume-no-experience/index.html", {
  title: "Student Resume With No Experience",
  description: "Create a strong student resume without work experience using education, projects, volunteering, transferable skills and practical resume examples.",
  h1: "How to Write a Student Resume With No Experience",
  direct: studentNoExperienceDirect,
  extra: studentNoExperienceExtra,
});

const teacherExamplePath = "public/examples/teacher-resume/index.html";
{
  const before = readRequired(teacherExamplePath);
  let html = addStyles(before);
  html = insertBeforeMainEnd(html, 'data-gsc-seo="teacher-example-backlink"', `<section class="gsc-resources" data-gsc-seo="teacher-example-backlink"><h2>Strengthen the skills and achievement section</h2><p>Use the <a href="/blog/teacher-resume-skills-achievements/">teacher resume skills and achievements guide</a> to turn teaching responsibilities into evidence-based bullets before customizing this example.</p></section>`);
  writeIfChanged(teacherExamplePath, before, html);
}

const studentBuilderPath = "public/student-resume-builder/index.html";
{
  const before = readRequired(studentBuilderPath);
  let html = addStyles(before);
  html = insertBeforeMainEnd(html, 'data-gsc-seo="student-builder-guides"', `<section class="gsc-resources" data-gsc-seo="student-builder-guides"><h2>Student resume writing guides</h2><ul><li><a href="/blog/student-resume-no-experience/">Build a complete student resume with no work experience</a>.</li><li>Compare <a href="/blog/student-resume-summary-examples/">student resume summary examples</a> before writing your profile.</li><li><a href="/resume/templates/">Browse resume templates</a> when you are ready to choose a layout.</li></ul></section>`);
  writeIfChanged(studentBuilderPath, before, html);
}

const freeBuilderPath = "public/free-resume-builder/index.html";
{
  const before = readRequired(freeBuilderPath);
  let html = addStyles(before);
  html = insertBeforeMainEnd(html, 'data-gsc-seo="free-builder-resources"', `<section class="gsc-resources" data-gsc-seo="free-builder-resources"><h2>Start with the right resume guidance</h2><ul><li><a href="/resume/templates/">Browse 60 resume templates</a> and choose a layout that fits your content.</li><li>If you are just starting out, use the guide to <a href="/blog/student-resume-no-experience/">write a student resume with no work experience</a>.</li><li>Teachers can use the <a href="/blog/teacher-resume-skills-achievements/">teacher resume skills and achievements guide</a> to turn responsibilities into evidence.</li><li>Return to <a href="/">ApplyCraft</a> to explore the complete application workflow.</li></ul></section>`);
  writeIfChanged(freeBuilderPath, before, html);
}

const cvMarocPath = "public/fr/blog/exemple-cv-maroc/index.html";
{
  const before = readRequired(cvMarocPath);
  let html = addStyles(before);
  html = insertBeforeMainEnd(html, 'data-gsc-seo="cv-maroc-cluster"', `<section class="gsc-resources" data-gsc-seo="cv-maroc-cluster"><h2>Ressources CV utiles pour les candidats francophones</h2><ul><li>Découvrir <a href="/fr/">ApplyCraft en français</a>.</li><li><a href="/fr/creer-cv-gratuit/">Créer un CV gratuitement</a> et personnaliser son contenu.</li><li>Préparer une <a href="/fr/blog/lettre-de-motivation-maroc/">lettre de motivation adaptée au Maroc</a>.</li><li>Voir comment <a href="/fr/blog/cv-canadien-maroc/">adapter un CV marocain pour une candidature au Canada</a>.</li><li>Consulter des <a href="/fr/blog/cv-etudiant-sans-experience-exemples/">exemples de CV étudiant sans expérience</a>.</li></ul></section>`);
  writeIfChanged(cvMarocPath, before, html);
}

const registryPath = "scripts/blog-articles.mjs";
{
  const before = readRequired(registryPath);
  let source = before;
  source = updateRegistryEntry(source, "teacher-resume-skills-achievements", "Teacher Resume Skills & Achievements", "Learn the best teacher resume skills, how to prove them with evidence, and achievement examples for new, primary, secondary and special education teachers.");
  source = updateRegistryEntry(source, "student-resume-summary-examples", "Student Resume Summary Examples", "See 25 student resume summary examples and learn a simple formula using projects, education, volunteering and transferable skills.");
  source = updateRegistryEntry(source, "student-resume-no-experience", "Student Resume With No Experience", "Create a strong student resume without work experience using education, projects, volunteering, transferable skills and practical examples.");
  writeIfChanged(registryPath, before, source);
}

log("GSC Top-10 strengthening pass complete");
