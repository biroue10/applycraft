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
<p>Prioritize lesson planning, classroom management, differentiated instruction, student assessment, curriculum knowledge, communication, inclusion and educational technology. Add only the skills that match your real experience and the vacancy. Then prove the most important ones in your summary and experience with the teaching context, method and observable result.</p>
<p><strong>Useful starting selection:</strong> lesson planning · classroom management · formative assessment · differentiated instruction · curriculum development · family engagement · educational technology · collaboration.</p>
<nav class="gsc-jump-links" aria-label="Teacher resume skills guide"><strong>In this guide:</strong> <a href="#best-teacher-skills">best skills</a> · <a href="#teacher-contexts">skills by teaching context</a> · <a href="#new-teacher-skills">new teachers</a> · <a href="#achievement-examples">achievement examples</a> · <a href="#teacher-resume-resources">next steps</a></nav>
</section>`;

const teacherEvidence = `<section class="gsc-evidence" data-gsc-seo="teacher-skills-evidence">
<h2 id="best-teacher-skills">Best teacher resume skills and what they show</h2>
<p>Use these categories as a decision guide, not a list to copy in full. The right mix depends on the grade level, subject, learner needs and responsibilities in the posting.</p>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Instruction and lesson planning</h3><p>Show how you sequence learning objectives, select teaching methods and prepare resources for a specific subject or grade level.</p></article>
<article class="gsc-example-card"><h3>Classroom routines and behaviour support</h3><p>Name the routines, restorative practices, behaviour supports or transition strategies you used to protect a safe learning environment.</p></article>
<article class="gsc-example-card"><h3>Student assessment</h3><p>Include formative checks, rubric design, feedback, progress monitoring and how assessment evidence changed your next lesson.</p></article>
<article class="gsc-example-card"><h3>Differentiated instruction</h3><p>Describe grouping, scaffolds, extension tasks or adapted materials used for learners with different readiness levels and needs.</p></article>
<article class="gsc-example-card"><h3>Curriculum development</h3><p>Identify the standards, programme or subject framework you translated into units, resources and assessments.</p></article>
<article class="gsc-example-card"><h3>Educational technology</h3><p>List relevant learning platforms, digital assessment tools or accessibility features and explain how they supported teaching.</p></article>
<article class="gsc-example-card"><h3>Communication</h3><p>Demonstrate clear explanations, feedback, reporting and professional communication with students, families and colleagues.</p></article>
<article class="gsc-example-card"><h3>Parent and family engagement</h3><p>Show how you shared progress, prepared conferences, handled difficult conversations or improved participation in school activities.</p></article>
<article class="gsc-example-card"><h3>Inclusion and accessibility</h3><p>Reference accommodations, accessible materials, individual learning plans or collaboration with specialists where these were part of your role.</p></article>
<article class="gsc-example-card"><h3>Student welfare and safeguarding</h3><p>Where the vacancy uses safeguarding terminology, mention relevant training and experience following reporting, supervision and student-welfare procedures without disclosing confidential cases.</p></article>
<article class="gsc-example-card"><h3>Collaboration</h3><p>Give evidence of co-planning, moderation, multidisciplinary teamwork or effective coordination with teaching assistants.</p></article>
<article class="gsc-example-card"><h3>Leadership and mentoring</h3><p>Show responsibility for a subject, programme, committee, club, trainee teacher or shared professional-development activity.</p></article>
<article class="gsc-example-card"><h3>Data-informed instruction</h3><p>Explain how you reviewed assessment or attendance patterns and used them to plan intervention, grouping or reteaching.</p></article>
<article class="gsc-example-card"><h3>Conflict resolution</h3><p>Describe a calm, policy-aligned approach to restoring communication and resolving recurring classroom or team issues.</p></article>
<article class="gsc-example-card"><h3>Time management</h3><p>Prove this through coordinated planning, timely feedback, reporting cycles or efficient resource systems rather than listing the phrase alone.</p></article>
</div>
</section>
<section class="gsc-role-examples" data-gsc-seo="teacher-role-examples">
<h2 id="teacher-contexts">Teacher skills by teaching context</h2>
<p>Different teaching roles require different evidence. Keep the core skills that fit the vacancy, then make the context visible. Titles also vary by education system: use the wording in the local posting when it truthfully describes your role.</p>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Elementary or primary teacher</h3><p>Prioritize foundational literacy or numeracy, predictable routines, multisensory activities, progress monitoring and family communication. Example: “Used weekly reading checks to form flexible groups and plan targeted phonics follow-up.”</p></article>
<article class="gsc-example-card"><h3>Secondary or high-school teacher</h3><p>Lead with subject expertise, curriculum sequencing, examination or project preparation, disciplinary literacy and actionable feedback. Mention laboratory safety or specialist equipment when relevant.</p></article>
<article class="gsc-example-card"><h3>Special education or SEN teacher</h3><p>Use the locally accurate title—such as special education or special educational needs (SEN)—and focus on documented accommodations, individual plans, assistive technology, progress records and multidisciplinary collaboration. Protect student confidentiality.</p></article>
<article class="gsc-example-card"><h3>ESL, EFL or multilingual learner teacher</h3><p>These terms describe different settings and learner groups, so do not swap them casually. Use the term that matches your role, then name proficiency levels, language objectives, scaffolds and formative language assessment.</p></article>
<article class="gsc-example-card"><h3>Substitute teacher</h3><p>Emphasize rapid adaptation, continuity of instruction, classroom routines, accurate handover notes and consistent application of school procedures across different groups.</p></article>
<article class="gsc-example-card"><h3>New teacher with limited experience</h3><p>Use supervised placements, lesson observations, curriculum projects and tutoring to prove planning, reflection and learner support. Label each context honestly.</p></article>
</div></section>
<section class="gsc-evidence" data-gsc-seo="teacher-new-experience">
<h2 id="new-teacher-skills">How to show teaching skills with limited experience</h2>
<p>Paid classroom ownership is not the only valid source of evidence. Student teaching, practicums, tutoring, volunteer teaching, youth programmes and curriculum projects can demonstrate relevant skills when the label and scope are accurate.</p>
<ul>
<li><strong>Student teaching or practicum:</strong> state the grade, subject, placement length and teaching responsibilities you completed under supervision.</li>
<li><strong>Tutoring:</strong> explain the learner group, topic, materials you prepared and how you monitored understanding.</li>
<li><strong>Curriculum projects:</strong> describe the standards, unit plan, assessment or accessible resource you created, even if it was not deployed in a paid role.</li>
<li><strong>Certifications and educational technology:</strong> name current credentials and tools you have genuinely practised, not software you have only heard of.</li>
<li><strong>Transferable experience:</strong> coaching, facilitation, youth work and customer-facing roles can support communication and organization, but should not be presented as classroom teaching.</li>
</ul>
<p>If your broader challenge is building a first resume, the guide to a <a href="/blog/student-resume-no-experience/">resume with limited formal experience</a> offers additional ways to find truthful evidence.</p>
</section>
<section class="gsc-evidence" data-gsc-seo="teacher-achievement-examples">
<h2 id="achievement-examples">Teacher achievement examples without invented numbers</h2>
<p>These examples demonstrate structure, not claims to copy. Replace the context, method and result with facts you can verify. A useful outcome does not need a percentage.</p>
<div class="gsc-example-grid">
<article class="gsc-example-card"><h3>Classroom management</h3><p><strong>Weak:</strong> Good classroom management skills.</p><p><strong>Improved:</strong> Introduced consistent classroom routines and restorative behaviour practices, reducing repeated disruptions and increasing usable lesson time.</p></article>
<article class="gsc-example-card"><h3>Assessment and feedback</h3><p>Used exit tickets and weekly work reviews to identify common misconceptions, then planned small-group reteaching before the next unit.</p></article>
<article class="gsc-example-card"><h3>Family engagement</h3><p>Introduced scheduled progress updates and accessible conference notes, helping families participate more consistently in follow-up plans.</p></article>
<article class="gsc-example-card"><h3>Curriculum adoption</h3><p>Co-developed standards-aligned unit resources and supported colleagues during implementation through shared planning and moderation.</p></article>
<article class="gsc-example-card"><h3>Grading workflow</h3><p>Created a common rubric and feedback bank that shortened grading turnaround while preserving individualized next steps.</p></article>
<article class="gsc-example-card"><h3>Student participation</h3><p>Added structured discussion roles and multiple response formats, increasing participation among learners who rarely contributed in whole-class discussion.</p></article>
<article class="gsc-example-card"><h3>Attendance support</h3><p>Reviewed attendance patterns with the support team and coordinated timely family follow-up for students with repeated absences.</p></article>
<article class="gsc-example-card"><h3>Teacher mentoring</h3><p>Mentored a new colleague through co-planning, lesson observation and feedback focused on routines and checks for understanding.</p></article>
</div>
</section>
<section class="gsc-resources" data-gsc-seo="teacher-resources"><h2 id="teacher-resume-resources">Use the skills in a complete teacher resume</h2><p>Once you have selected and evidenced the right skills:</p><ul>
<li>See how they fit into a <a href="/examples/teacher-resume/">complete teacher resume example</a>.</li>
<li><a href="/resume-builder/">Create your teacher resume</a> using your own experience and evidence.</li>
<li>Choose from exactly <a href="/resume/templates/">60 resume templates</a> with a layout suited to your content.</li>
<li>Use the <a href="/ats-checker/">ATS checker</a> to review structure and job-description alignment; its feedback does not predict hiring decisions.</li>
</ul><p>For a repeatable vacancy review, follow the guide to <a href="/blog/tailor-resume-to-job-description-ats-keywords/">tailoring a resume to a job description</a>.</p></section>`;

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

function patchArticle(relativePath, { title, description, h1, direct, extra, schemaHeadline, syncTwitter = false }) {
  const before = readRequired(relativePath);
  let html = before;
  html = setTitle(html, `${title} | ApplyCraft`);
  html = setMetaName(html, "description", description);
  html = setMetaProperty(html, "og:title", schemaHeadline || title);
  html = setMetaProperty(html, "og:description", description);
  if (syncTwitter) {
    html = setMetaName(html, "twitter:title", schemaHeadline || title);
    html = setMetaName(html, "twitter:description", description);
  }
  html = setFirstH1(html, h1);
  html = updateBlogPostingSchema(html, { headline: h1, description });
  html = addStyles(html);
  html = insertAfterLead(html, direct.match(/data-gsc-seo="[^"]+"/)[0], direct);
  html = insertBeforeFaqOrMainEnd(html, extra.match(/data-gsc-seo="[^"]+"/)[0], extra);
  writeIfChanged(relativePath, before, html);
}

patchArticle("public/blog/teacher-resume-skills-achievements/index.html", {
  title: "Teacher Resume Skills: Examples & Achievements",
  description: "Choose teacher resume skills, learn how to present them with evidence, and adapt achievement examples to your experience and teaching context.",
  h1: "Teacher Resume Skills: How to List Them With Examples",
  direct: teacherDirect,
  extra: teacherEvidence,
  schemaHeadline: "Teacher Resume Skills: How to List Them With Examples",
  syncTwitter: true,
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
  source = updateRegistryEntry(source, "teacher-resume-skills-achievements", "Teacher Resume Skills: Examples & Achievements", "Choose teacher resume skills, learn how to present them with evidence, and adapt achievement examples to your experience and teaching context.");
  source = updateRegistryEntry(source, "student-resume-summary-examples", "Student Resume Summary Examples", "See 25 student resume summary examples and learn a simple formula using projects, education, volunteering and transferable skills.");
  source = updateRegistryEntry(source, "student-resume-no-experience", "Student Resume With No Experience", "Create a strong student resume without work experience using education, projects, volunteering, transferable skills and practical examples.");
  writeIfChanged(registryPath, before, source);
}

log("GSC Top-10 strengthening pass complete");
