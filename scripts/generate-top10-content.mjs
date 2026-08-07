import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { headerHtml } from "./shared-header.mjs";
import { footerHtml } from "./shared-footer.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = "https://applycraft.io";
const updated = "2026-08-07";

const pages = [
  {
    slug: "teacher-resume-skills-achievements",
    title: "Teacher Resume Skills & Achievement Examples | ApplyCraft",
    description: "Choose teacher resume skills and prove them with classroom evidence. Includes achievement bullets and examples for elementary, ESL, online and new teachers.",
    h1: "Teacher Resume Skills and Achievements: How to Prove Them",
    category: "Teacher resumes",
    published: "2026-07-26",
    body: `
<div class="direct-answer"><h2>What skills should I put on a teacher resume?</h2><p>Include classroom management, differentiated instruction, lesson planning, curriculum development, student assessment, educational technology, communication, collaboration, behaviour management, parent communication, and student support when they reflect your real work. A skill list alone is weaker than a skill supported by evidence: connect each relevant strength to a lesson, routine, project, responsibility, or outcome you can explain.</p></div>
<div class="example"><p><strong>Weak:</strong> Classroom management</p><p><strong>Better example:</strong> Used structured classroom routines and differentiated activities to support a class of 28 students.</p><p>The stronger version identifies what the teacher did and the classroom context. Adapt every example to your actual experience; illustrative details are not claims about ApplyCraft users.</p></div>
<h2>Teacher resume skills and how to prove them</h2>
<p>Choose evidence a school can understand quickly. The final column helps you decide whether the proof belongs in experience, skills, projects, certification, or leadership.</p>
<div class="table-wrap"><table><caption>Teacher Resume Skills and How to Prove Them</caption><thead><tr><th scope="col">Skill</th><th scope="col">What evidence recruiters may look for</th><th scope="col">Example resume bullet</th><th scope="col">Best resume section</th></tr></thead><tbody>
${[
["Classroom management","Consistent routines, clear expectations, safe learning environment","Established predictable arrival and transition routines that protected lesson time.","Experience"],
["Lesson planning","Objectives, sequencing, accessible activities","Designed weekly lessons aligned with curriculum objectives and learner needs.","Experience"],
["Differentiated instruction","Adaptations for different readiness levels and learning needs","Adapted reading activities with scaffolded prompts and extension tasks.","Experience"],
["Curriculum development","Units, resources, standards alignment","Co-developed a six-week science unit with common assessments and resources.","Experience"],
["Student assessment","Formative checks, feedback, progress records","Used exit tickets and work samples to adjust the next lesson's support.","Experience"],
["Educational technology","Purposeful use of learning platforms and digital tools","Built accessible digital practice activities and monitored completion in the learning platform.","Skills + experience"],
["Parent communication","Clear, respectful updates and shared plans","Prepared concise family updates on progress, next steps, and available support.","Experience"],
["Collaboration","Co-planning, cross-functional support, shared resources","Co-planned lessons with grade-level colleagues and learning-support staff.","Experience"],
["Special education support","Accommodations, inclusive practice, plan implementation","Applied documented accommodations and coordinated classroom support with specialists.","Experience"],
["Data-informed teaching","Using assessment evidence to plan instruction","Grouped learners for targeted review after analysing formative assessment results.","Experience"],
["Student engagement","Relevant activities, participation strategies","Used discussion protocols and choice-based tasks to broaden participation.","Experience"],
["Remote teaching","Online facilitation, digital access, asynchronous resources","Created live and asynchronous lessons with clear instructions and accessible materials.","Experience"],
["Bilingual instruction","Teaching or supporting learning in two languages","Explained key concepts in English and French while maintaining subject vocabulary.","Languages + experience"],
["Mentoring","Supporting peers, trainees, or student teachers","Mentored a trainee teacher through weekly planning and reflective feedback.","Leadership"],
["Leadership","Department, committee, initiative, or programme responsibility","Coordinated the department resource bank and facilitated monthly planning sessions.","Leadership"]
].map(r=>`<tr>${r.map((c,i)=>`<${i===0?'th scope="row"':'td'}>${c}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}
</tbody></table></div>
<h2>Teacher resume bullet examples by role</h2>
<p>Use the role examples as patterns, not ready-made claims. Keep only language you can defend in an interview.</p>
${[
["Elementary teacher","Planned literacy, numeracy, and inquiry activities with varied levels of scaffolding and clear routines."],
["High-school teacher","Designed subject lessons aligned with course objectives and used formative checks to identify topics for review."],
["New teacher","Completed a supervised practicum planning lessons, supporting classroom routines, and reflecting on mentor feedback."],
["Substitute teacher","Maintained lesson continuity across grade levels by following teacher plans and documenting completed work and concerns."],
["Special education teacher","Coordinated accommodations with classroom staff and prepared accessible resources based on documented learner needs."],
["ESL teacher","Built speaking, reading, and vocabulary activities for learners at different language-proficiency levels."],
["Online teacher","Facilitated live lessons and produced asynchronous resources with captions, clear deadlines, and structured feedback."],
["Teaching assistant","Supported small-group practice, prepared learning materials, and shared observations with the classroom teacher."],
["Department lead","Facilitated common planning, organized shared resources, and supported consistent assessment practices across the department."]
].map(([role,bullet])=>`<h3>${role}</h3><p>${bullet}</p>`).join('')}
<h2>Before and after: turn responsibilities into evidence</h2>
<div class="example"><p><strong>Weak:</strong> Responsible for lesson planning.</p><p><strong>Stronger example:</strong> Designed weekly lessons aligned with curriculum objectives and adapted activities for students with different learning needs.</p><p>The revision adds the planning cadence, the standard used, and the adaptation. It stays credible without forcing a percentage.</p></div>
<div class="example"><p><strong>Weak:</strong> Good communication skills.</p><p><strong>Stronger example:</strong> Shared concise progress updates with families and coordinated next steps with learning-support colleagues.</p><p>This shows the audience, purpose, and collaborative action behind “communication.”</p></div>
<h2>Where teacher skills belong on a resume</h2><ul><li><strong>Summary:</strong> two or three strengths central to the target role.</li><li><strong>Experience:</strong> evidence-rich bullets showing how a skill was used.</li><li><strong>Skills:</strong> scannable methods, tools, languages, and specialist knowledge.</li><li><strong>Education and certifications:</strong> licences, endorsements, degrees, and relevant development.</li><li><strong>Leadership:</strong> mentoring, committees, department work, and initiatives.</li></ul>
<p>For the document as a whole, review the <a href="/examples/teacher-resume/">complete teacher resume example</a>. Then <a href="/resume/templates/">choose a resume template</a>, customize it in the <a href="/resume-builder/">Resume Builder</a>, review readability with the <a href="/ats-checker/">ATS Checker</a>, and prepare stories from your evidence in <a href="/interview-prep/">Interview Prep</a>.</p>
<h2>Frequently asked questions</h2><details><summary>How many teacher skills should I list?</summary><p>Prioritize a focused set that matches the role and can be supported by evidence. A short, relevant list plus strong experience bullets is usually clearer than a long inventory.</p></details><details><summary>Should teacher achievements always contain numbers?</summary><p>No. Numbers are useful when truthful and meaningful, but scope, method, audience, and improvement can also make a bullet specific.</p></details><details><summary>Can a new teacher use practicum examples?</summary><p>Yes. Label the placement accurately and describe lessons, classroom support, feedback, and responsibilities you genuinely completed.</p></details>
<h2>Related teacher resources</h2><div class="related"><a href="/examples/teacher-resume/">Complete teacher resume example</a><a href="/resume/templates/">Browse 60 resume templates</a><a href="/free-resume-builder/">Use the free resume builder</a><a href="/interview-prep/">Prepare teacher interview stories</a></div>`
  },
  {
    slug: "student-resume-summary-examples",
    title: "Student Resume Summary Examples for Every Stage | ApplyCraft",
    description: "Write a student resume summary with concise examples for high school, college, internships, IT, business, projects, volunteering, and career changes.",
    h1: "Student Resume Summary Examples for Every Stage",
    category: "Student resumes",
    published: "2026-08-01",
    body: `<div class="direct-answer"><h2>What is a good resume summary for a student?</h2><p>A good student resume summary is a short, specific introduction that connects your current education or status to the role you want. Include the target role, two or three relevant skills, evidence from a project, course, volunteering, or activity, and one meaningful differentiator such as a language or technical focus. Replace unsupported phrases like “hard-working student seeking opportunities” with details an employer can verify.</p></div>
<h2>A simple student summary formula</h2><ol><li>Name your current education or status.</li><li>State the role, internship, or field you are targeting.</li><li>Select the strongest relevant skills.</li><li>Add evidence from projects, volunteering, coursework, or activities.</li><li>Close with one useful differentiator.</li></ol>
<h2>12 student resume summary examples</h2>
${[
["High school student","High school student with experience organizing school events and tutoring younger pupils, seeking a part-time retail role where clear communication, reliability, and teamwork matter."],
["College student","Business diploma student with coursework in accounting and marketing and experience coordinating a student-club event, seeking an operations internship."],
["University student","Third-year economics student with research, spreadsheet, and presentation experience from applied coursework, seeking a summer analyst internship."],
["Internship candidate","Engineering student who built and documented two team design projects, seeking an internship focused on testing, problem-solving, and continuous learning."],
["IT student","IT student with hands-on troubleshooting from a home lab and student help desk volunteering, familiar with Windows, basic networking, and ticket documentation."],
["Customer service candidate","Student volunteer with experience welcoming event attendees, answering questions, and resolving registration issues, seeking a customer service role."],
["Business student","Business student with Excel, market-research, and group-presentation experience, interested in an entry-level sales or operations placement."],
["Computer science student","Computer science student with hands-on experience from Python and web-development projects, seeking an entry-level support or development role."],
["Student with volunteering","University student who coordinated volunteer schedules and community-event communications, offering dependable organization and collaborative problem-solving."],
["Student with academic projects","Data-focused student who cleaned, analysed, and presented a public dataset for a semester project, seeking an internship using Excel and introductory SQL."],
["Student changing field","Psychology student moving toward user research, combining interview-method coursework, qualitative analysis, and accessible report writing."],
["International student","Multilingual international student studying supply-chain management, with team-project experience across English and French and an interest in logistics operations."]
].map(([name,text])=>`<h3>${name}</h3><p>${text}</p>`).join('')}
<h2>Before and after</h2><div class="example"><p><strong>Weak:</strong> Motivated student looking for a job.</p><p><strong>Stronger:</strong> Computer science student with hands-on experience from Python and web-development projects, seeking an entry-level support or development role.</p><p>The second version identifies the field, evidence, tools, and target. It gives the reader a reason to continue without exaggerating experience.</p></div>
<h2>Adapt the summary to the vacancy</h2><p>Keep the facts stable but change the emphasis. A volunteering example may demonstrate service for a retail role, coordination for an operations role, or communication for an administrative role. Do not copy every phrase from the posting or claim skills you do not have.</p>
<p>If the rest of the document is still blank, follow the guide to <a href="/blog/student-resume-no-experience/">building your entire resume without work experience</a>. You can then use the <a href="/student-resume-builder/">Student Resume Builder</a>, compare <a href="/resume/templates/">resume designs</a>, check structure in the <a href="/ats-checker/">ATS Checker</a>, and align your application in the <a href="/cover-letter-builder/">Cover Letter Builder</a>.</p>
<h2>Frequently asked questions</h2><details><summary>How long should a student resume summary be?</summary><p>Usually two to four concise lines. Keep only details that help the reader understand your direction, evidence, and fit.</p></details><details><summary>Should I use a summary if I have no work experience?</summary><p>Yes, when it adds focus. Draw evidence from education, projects, volunteering, activities, or personal work rather than apologizing for missing employment.</p></details><details><summary>Is a summary different from a full no-experience resume?</summary><p>Yes. The summary is one short section; a no-experience resume also needs education, projects, activities, skills, and other evidence.</p></details>`
  },
  {
    slug: "student-resume-no-experience",
    title: "Student Resume With No Experience: Example | ApplyCraft",
    description: "Build a student resume with no experience using a complete fictional example, transferable-skills evidence table, projects, education, volunteering, and activities.",
    h1: "How to Write a Student Resume With No Experience",
    category: "Student resumes",
    published: "2026-07-26",
    body: `<div class="direct-answer"><h2>How do you write a student resume with no experience?</h2><p>Replace the missing employment section with evidence from education, relevant coursework, academic or personal projects, volunteering, student clubs, sports, certifications, and community involvement. Start with a focused summary, place the most relevant evidence near the top, and write bullets that explain what you made, organized, researched, supported, or learned.</p></div>
<h2>Complete fictional student resume example</h2><div class="example"><h3>Maya Hassan</h3><p>Casablanca, Morocco · maya.hassan@example.com · +212 600 000 000 · linkedin.com/in/maya-hassan-example</p><p><strong>Target role:</strong> Junior Administrative Assistant</p><h3>Summary</h3><p>Business administration student with Excel, research, and event-coordination experience from coursework and volunteering, seeking a junior administrative role. Comfortable organizing information in English and French and documenting clear next steps.</p><h3>Education</h3><p><strong>Diploma in Business Administration</strong>, Example Institute — Expected 2027</p><p>Relevant coursework: business communication, spreadsheets, introductory accounting, project management.</p><h3>Academic project</h3><p><strong>Community event budget and plan</strong></p><ul><li>Built an Excel budget and task tracker for a four-person semester project.</li><li>Researched three venue options and presented a documented recommendation.</li><li>Recorded meeting decisions and maintained the final project timeline.</li></ul><h3>Volunteering</h3><p><strong>Registration volunteer, Example Community Fair</strong></p><ul><li>Welcomed attendees, checked registrations, and directed questions to the correct team.</li><li>Updated the attendance sheet and flagged incomplete records for follow-up.</li></ul><h3>Extracurricular activity and leadership</h3><p><strong>Secretary, Campus Business Club</strong></p><ul><li>Prepared meeting agendas, captured action items, and coordinated reminders.</li><li>Helped organize a guest-speaker session and shared accessible event information.</li></ul><h3>Skills</h3><p>Excel · Google Workspace · Research · Written communication · Organization · English · French · Arabic</p><h3>Certification</h3><p>Introductory Spreadsheet Skills — Example Learning Provider, 2026</p></div><p>This resume is fictional. Replace every name, activity, and detail with your own truthful evidence.</p>
<h2>Student skills and where to find evidence</h2><div class="table-wrap"><table><caption>Student Skills and Where to Find Evidence</caption><thead><tr><th scope="col">Skill</th><th scope="col">Potential evidence source</th><th scope="col">Example bullet</th><th scope="col">Suitable role</th></tr></thead><tbody>
${[
["Communication","Presentations, volunteering","Presented a project recommendation and answered questions from classmates.","Sales, administration"],["Teamwork","Academic projects, sports","Coordinated assigned tasks and combined four contributions into one final report.","Operations, hospitality"],["Problem-solving","Coursework, personal projects","Diagnosed errors in a spreadsheet model and documented the corrected method.","IT, analysis"],["Leadership","Student clubs, sports","Organized weekly check-ins and tracked action items for a student committee.","Team support"],["Time management","Coursework, activities","Balanced assignment deadlines with two weekly club responsibilities.","Any entry-level role"],["Customer service","Community involvement, events","Welcomed visitors and resolved routine registration questions.","Retail, service"],["Research","Academic projects","Compared credible sources and summarized findings for a group presentation.","Research, marketing"],["Writing","Coursework, club communications","Drafted clear event instructions and proofread the final announcement.","Administration, content"],["Excel","Coursework, certifications","Built a budget tracker with formulas, validation, and clear labels.","Finance, operations"],["Technical troubleshooting","Home lab, personal projects","Configured a practice network and documented solutions to setup issues.","IT support"],["Languages","Study, community activities","Supported event communication in English and French.","Service, international roles"],["Organization","Clubs, volunteering","Maintained an attendance sheet and followed up on missing information.","Administration"],["Reliability","Sports, recurring volunteering","Completed scheduled setup duties and communicated availability in advance.","Retail, hospitality"]
].map(r=>`<tr>${r.map((c,i)=>`<${i===0?'th scope="row"':'td'}>${c}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>
<h2>Choose sections based on evidence, not convention</h2><p>Education can lead when coursework is the strongest match. Projects can lead for technical or creative roles. Volunteering can be treated like experience when you describe real responsibilities without presenting it as paid work. Certifications belong only when completed or clearly marked as in progress.</p>
<p>Need help with the opening paragraph? Use these <a href="/blog/student-resume-summary-examples/">student resume summary examples</a>. Then start in the <a href="/student-resume-builder/">Student Resume Builder</a>, select one of <a href="/resume/templates/">60 resume templates</a>, review the result with the <a href="/ats-checker/">ATS Checker</a>, and keep applications organized in the <a href="/job-tracker/">Job Tracker</a>. A tailored <a href="/cover-letter-builder/">cover letter</a> can explain why your projects fit the role, while <a href="/interview-prep/">Interview Prep</a> helps turn them into spoken examples.</p>
<h2>Frequently asked questions</h2><details><summary>What can replace work experience on a student resume?</summary><p>Relevant coursework, projects, volunteering, clubs, sports, certifications, community work, and personal projects can all provide evidence.</p></details><details><summary>Should I leave an empty experience section?</summary><p>No. Use section names that describe your real material, such as Projects, Leadership, Volunteering, or Relevant Experience.</p></details><details><summary>Can I use a template starter link?</summary><p>Yes. A starter can preselect a design while the clean public canonical remains the Student Resume Builder or Resume Builder URL.</p></details>`
  }
];

function schema(page, canonical) {
  const faqs = [...page.body.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(([,q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a.replace(/<[^>]+>/g,"")}}));
  return [
    {"@context":"https://schema.org","@type":"BlogPosting",headline:page.h1,description:page.description,datePublished:page.published,dateModified:updated,author:{"@type":"Organization",name:"ApplyCraft Editorial Team",url:`${SITE}/about/`},publisher:{"@type":"Organization",name:"ApplyCraft",url:`${SITE}/`},mainEntityOfPage:canonical},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:`${SITE}/`},{"@type":"ListItem",position:2,name:"Blog",item:`${SITE}/blog/`},{"@type":"ListItem",position:3,name:page.h1,item:canonical}]},
    {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs}
  ].map(value=>`<script type="application/ld+json">${JSON.stringify(value)}</script>`).join("\n");
}

for (const page of pages) {
  const route = `/blog/${page.slug}/`;
  const canonical = `${SITE}${route}`;
  const html = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title}</title><meta name="description" content="${page.description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="ApplyCraft"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/og/blog.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${page.title}"><meta name="twitter:description" content="${page.description}"><meta name="twitter:image" content="${SITE}/og/blog.png"><link rel="stylesheet" href="/_seo.css"><link rel="icon" href="/favicon.svg?v=2"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"><link rel="manifest" href="/site.webmanifest?v=2"><script src="/consent.js" defer></script>${schema(page,canonical)}</head><body>${headerHtml("en",route)}<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="bc-sep">›</span><a href="/blog/">Blog</a><span class="bc-sep">›</span><span class="bc-current">${page.category}</span></nav><main id="main-content" class="page"><article class="article"><header><p class="hero-eyebrow">${page.category}</p><h1>${page.h1}</h1><p class="article-meta">By ApplyCraft Editorial Team · Published <time datetime="${page.published}">${page.published}</time> · Updated <time datetime="${updated}">${updated}</time></p></header>${page.body}<aside class="editorial-note"><strong>Editorial note:</strong> Examples are illustrative and should be adapted to the candidate’s real experience. ApplyCraft does not guarantee ATS acceptance, interviews, or hiring outcomes.</aside><div class="cta-strip"><h2>Turn your evidence into a resume</h2><p>Choose a readable layout, customize every section, and export PDF or DOCX without mandatory signup or a watermark.</p><a class="btn-primary" href="/resume-builder/">Open ApplyCraft Resume Builder</a></div></article></main>${footerHtml("en")}</body></html>`;
  const dir = join(ROOT,"public","blog",page.slug);
  mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,"index.html"),html);
}
console.log(`✓ Generated ${pages.length} Top-10 opportunity articles`);
