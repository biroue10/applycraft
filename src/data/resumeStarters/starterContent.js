import { STARTER_METADATA } from "./index.js";

const bullet = (description) => description;

function entry(fields) {
  return { visible: true, ...fields };
}

function form({ name, title, email, phone = "", location, linkedin = "", website = "", summary, experience = [], education = [], skills = [], certifications = [], projects = [], languages = [] }) {
  return {
    name,
    title,
    email,
    phone,
    location,
    linkedin,
    website,
    summary,
    experienceEntries: experience.map(entry),
    educationEntries: education.map(entry),
    skillsEntries: skills.map((name) => entry({ name })),
    certificationsEntries: certifications.map((name) => entry({ name })),
    projectsEntries: projects.map(entry),
    languagesEntries: languages.map((name) => entry({ name })),
    sectionTitles: {},
  };
}

const DATA_BY_ID = {
  "sales-representative": form({
    name: "James Carter",
    title: "Sales Representative | B2B SaaS",
    email: "james.carter@email.com",
    location: "Denver, CO",
    linkedin: "linkedin.com/in/jamescarter",
    summary: "Quota-beating B2B sales representative with 5 years of SaaS experience, strong outbound prospecting skills, and a track record of growing territory pipeline.",
    experience: [
      { title: "Sales Representative", company: "CloudWorks SaaS", startDate: "2021", endDate: "Present", description: bullet("• Achieved 128% of annual quota ($1.9M) and ranked top 5 of 40 reps two years running.\n• Grew territory pipeline by 60% through targeted outbound campaigns and closed 3 of the team's 5 largest deals.") },
      { title: "Sales Development Representative", company: "Summit Software", startDate: "2019", endDate: "2021", description: bullet("• Booked 40+ qualified meetings per month and sourced $700K in influenced pipeline.\n• Built a cold-email sequence adopted team-wide that lifted reply rates from 4% to 11%.") },
    ],
    education: [{ title: "Colorado State University", subtitle: "B.A. Business & Communications", endDate: "2019" }],
    skills: ["B2B Sales", "Pipeline Management", "Prospecting", "Salesforce", "HubSpot", "Negotiation", "Forecasting", "Solution Selling"],
  }),
  "it-support-technician": form({
    name: "Daniel Park",
    title: "IT Support Technician | CompTIA A+ | ITIL Foundation",
    email: "daniel.park@email.com",
    location: "Dallas, TX",
    linkedin: "linkedin.com/in/danielpark",
    summary: "IT support technician experienced in L1/L2 troubleshooting, Microsoft 365 administration, ticket triage, and end-user support for distributed teams.",
    experience: [
      { title: "IT Support Technician", company: "FinanceCo Group", startDate: "Jan 2023", endDate: "Present", description: bullet("• Provide L1/L2 technical support to 280 employees and resolve 98% of tickets within SLA.\n• Built an onboarding checklist that cut new employee setup time from 4 hours to 90 minutes.") },
      { title: "IT Help Desk Agent", company: "TechStart Ltd", startDate: "Aug 2021", endDate: "Dec 2022", description: bullet("• Managed 60+ daily tickets via ServiceNow while maintaining a 96% CSAT score.\n• Deployed 45 workstations during an office relocation with zero downtime.") },
    ],
    education: [{ title: "Dallas Community College", subtitle: "A.Sc. Computer Information Systems", endDate: "2021" }],
    skills: ["CompTIA A+", "Windows 10/11", "Active Directory", "Microsoft 365", "ITIL Foundation", "ServiceNow", "TCP/IP", "Remote Support"],
    certifications: ["CompTIA A+", "ITIL Foundation"],
  }),
  "customer-service": form({
    name: "Elena Rodriguez",
    title: "Customer Service Team Lead",
    email: "elena.rodriguez@email.com",
    location: "Houston, TX",
    summary: "Customer service team lead with strong CSAT performance, CRM fluency, bilingual communication skills, and experience coaching high-volume support teams.",
    experience: [
      { title: "Customer Service Team Lead", company: "TeleServ Inc.", startDate: "Mar 2022", endDate: "Present", description: bullet("• Lead a team of 12 agents supporting 1,200+ customers daily.\n• Improved team CSAT from 88% to 96% in 6 months through coaching and quality reviews.") },
      { title: "Senior Customer Service Agent", company: "EcommerceXL", startDate: "2019", endDate: "2022", description: bullet("• Handled 90+ contacts/day via phone, email, and chat.\n• Ranked #1 in team for upsell conversion with zero escalations in 18 months.") },
    ],
    education: [{ title: "University of Houston", subtitle: "B.A. Psychology", endDate: "2019" }],
    skills: ["Zendesk", "Salesforce CRM", "Live Chat", "Conflict Resolution", "Team Leadership", "KPI Reporting", "Spanish", "English"],
    languages: ["Spanish (Native)", "English (Fluent)"],
  }),
  "project-manager": form({
    name: "Elena Rossi",
    title: "Senior Project Manager | PMP",
    email: "elena.rossi@email.com",
    location: "Chicago, IL",
    summary: "PMP-certified project manager with experience delivering enterprise technology programs on time, under budget, and across cross-functional teams.",
    experience: [
      { title: "Senior Project Manager", company: "Meridian Solutions", startDate: "2020", endDate: "Present", description: bullet("• Delivered a $4.2M ERP rollout across 5 departments on time and 8% under budget.\n• Managed a cross-functional team of 18 and reduced project risk incidents by 40%.") },
      { title: "Project Manager", company: "Apex Digital", startDate: "2016", endDate: "2020", description: bullet("• Ran 12 concurrent client projects with a 96% on-time delivery rate.\n• Introduced Agile ceremonies that improved sprint predictability and lifted client CSAT from 4.1 to 4.7/5.") },
    ],
    education: [{ title: "DePaul University", subtitle: "B.B.A. Business Administration", endDate: "2016" }],
    skills: ["Agile", "Scrum", "Stakeholder Management", "Budgeting", "Risk Management", "Jira", "MS Project"],
    certifications: ["PMP", "Certified Scrum Master"],
  }),
  "data-analyst": form({
    name: "Priya Sharma",
    title: "Data Analyst",
    email: "priya.sharma@email.com",
    location: "Austin, TX",
    summary: "Data analyst skilled in SQL, Python, BI dashboards, and translating messy datasets into decisions that improve conversion and operating efficiency.",
    experience: [
      { title: "Data Analyst", company: "Retail Insights Co.", startDate: "2021", endDate: "Present", description: bullet("• Built a Tableau revenue dashboard adopted by 120+ stakeholders, saving ~15 hours/week.\n• Ran an A/B test that lifted checkout conversion by 11%.") },
      { title: "Junior Data Analyst", company: "Bright Metrics", startDate: "2019", endDate: "2021", description: bullet("• Wrote SQL pipelines feeding weekly KPI reports for marketing and ops.\n• Consolidated 3 fragmented data sources, improving reporting accuracy and cutting query time by 60%.") },
    ],
    education: [{ title: "University of Texas at Austin", subtitle: "B.S. Economics & Statistics", endDate: "2019" }],
    skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "A/B Testing", "Data Cleaning", "Google Analytics"],
  }),
  "teacher": form({
    name: "Rachel Bennett",
    title: "Elementary School Teacher | State Certified (K-6)",
    email: "rachel.bennett@email.com",
    location: "Columbus, OH",
    summary: "Certified elementary teacher with experience improving reading proficiency, differentiating instruction, and collaborating across grade-level teams.",
    experience: [
      { title: "3rd Grade Teacher", company: "Maple Grove Elementary", startDate: "2019", endDate: "Present", description: bullet("• Teach a class of 26 across all core subjects and raised class reading proficiency by 18 percentage points.\n• Led a grade-level team adopting a new math curriculum.") },
      { title: "Long-Term Substitute Teacher", company: "Columbus City Schools", startDate: "2018", endDate: "2019", description: bullet("• Covered K-5 classrooms and maintained continuity of instruction.\n• Introduced a behavior-management system later adopted by two other teachers.") },
    ],
    education: [{ title: "Ohio State University", subtitle: "B.S. Elementary Education", endDate: "2018" }],
    skills: ["Curriculum Design", "Differentiated Instruction", "Classroom Management", "Google Classroom", "IEP Support", "SEL"],
    certifications: ["State Teaching Certification (K-6)"],
  }),
  "software-engineer": form({
    name: "Marcus Chen",
    title: "Senior Software Engineer",
    email: "marcus.chen@email.com",
    location: "Seattle, WA",
    website: "github.com/marcuschen",
    summary: "Senior software engineer with experience building low-latency services, React applications, and cloud-native systems used by thousands of daily users.",
    experience: [
      { title: "Senior Software Engineer", company: "Northwind Cloud", startDate: "2021", endDate: "Present", description: bullet("• Led redesign of a payments service handling $40M/month, cutting p99 latency from 800ms to 180ms.\n• Mentored 4 engineers and reduced PR cycle time by 35%.") },
      { title: "Software Engineer", company: "BrightApps Inc.", startDate: "2018", endDate: "2021", description: bullet("• Built a React/Node analytics dashboard used by 25k daily users.\n• Migrated a monolith to 6 microservices, improving deploy frequency from weekly to 20+ times per day.") },
    ],
    education: [{ title: "University of Washington", subtitle: "B.Sc. Computer Science", endDate: "2018" }],
    skills: ["TypeScript", "React", "Node.js", "Python", "Go", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
  }),
  "accountant": form({
    name: "David Okafor",
    title: "Senior Accountant | CPA",
    email: "david.okafor@email.com",
    location: "Houston, TX",
    summary: "CPA accountant experienced in month-end close, financial reporting, reconciliations, and audit-ready accounting operations.",
    experience: [
      { title: "Senior Accountant", company: "Lone Star Manufacturing", startDate: "2020", endDate: "Present", description: bullet("• Own month-end close for a $90M business unit, reducing close time from 9 to 5 days.\n• Identified $310K in annual savings through vendor reconciliation.") },
      { title: "Staff Accountant", company: "Gulf Coast Advisors", startDate: "2017", endDate: "2020", description: bullet("• Managed AP/AR for 40+ clients and prepared monthly financial statements.\n• Supported external audits with zero material findings across three consecutive years.") },
    ],
    education: [{ title: "University of Houston", subtitle: "B.B.A. Accounting", endDate: "2017" }],
    skills: ["GAAP", "Month-End Close", "Financial Reporting", "QuickBooks", "SAP", "Advanced Excel", "Audit Support"],
    certifications: ["CPA"],
  }),
  "administrative-assistant": form({
    name: "Maria Gomez",
    title: "Administrative Assistant",
    email: "maria.gomez@email.com",
    location: "Phoenix, AZ",
    summary: "Administrative assistant with experience supporting directors, improving scheduling systems, and keeping office operations organized and responsive.",
    experience: [
      { title: "Administrative Assistant", company: "Desert Ridge Group", startDate: "2021", endDate: "Present", description: bullet("• Support 3 directors with calendars, travel, and expenses.\n• Built a shared scheduling system that reduced meeting setup time by 30%.") },
      { title: "Office Assistant", company: "Sunrise Realty", startDate: "2018", endDate: "2021", description: bullet("• Managed front-desk operations and 80+ daily calls.\n• Reorganized digital filing for 1,200+ client records, cutting retrieval time from minutes to seconds.") },
    ],
    education: [{ title: "Phoenix College", subtitle: "A.A. Business Administration", endDate: "2018" }],
    skills: ["Calendar Management", "Microsoft 365", "Google Workspace", "Travel Coordination", "Data Entry", "Expense Reports"],
  }),
  "entry-level": form({
    name: "Jamie Kim",
    title: "Business Administration Graduate | Marketing Coordinator",
    email: "jamie.kim@email.com",
    location: "Atlanta, GA",
    summary: "Recent business administration graduate with internship experience in social media, market research, and project coordination.",
    experience: [
      { title: "Marketing Intern", company: "LocalBrand Agency", startDate: "Jan 2025", endDate: "May 2025", description: bullet("• Assisted with social media scheduling for 4 client accounts with 12k combined followers.\n• Created 20+ Canva graphics per month and wrote weekly blog content.") },
      { title: "Volunteer Event Coordinator", company: "Campus Business Society", startDate: "2023", endDate: "2024", description: bullet("• Coordinated 6 student networking events and managed attendee communications.") },
    ],
    education: [{ title: "Georgia State University", subtitle: "B.B.A. Business Administration", endDate: "2025" }],
    skills: ["Microsoft Excel", "Canva", "Google Analytics", "Social Media", "Content Writing", "Market Research", "HubSpot Academy"],
  }),
  "registered-nurse": form({
    name: "Aisha Johnson",
    title: "Registered Nurse, BSN, RN | BLS & ACLS Certified",
    email: "aisha.johnson@email.com",
    location: "Atlanta, GA",
    summary: "Registered nurse with medical-surgical and telemetry experience, strong medication accuracy, and a commitment to patient education and safety.",
    experience: [
      { title: "Registered Nurse - Medical/Surgical", company: "Grady Memorial Hospital", startDate: "2020", endDate: "Present", description: bullet("• Provide direct care for up to 6 acute patients per shift on a 32-bed unit.\n• Maintained 98% medication-administration accuracy and precepted 7 new-grad nurses.") },
      { title: "Staff Nurse - Telemetry", company: "Piedmont Health", startDate: "2018", endDate: "2020", description: bullet("• Monitored cardiac patients and responded to rapid-response events.\n• Contributed to an initiative that cut unit fall rates by 22%.") },
    ],
    education: [{ title: "Emory University", subtitle: "Bachelor of Science in Nursing", endDate: "2018" }],
    skills: ["Acute Care", "Patient Assessment", "IV Therapy", "Epic", "Medication Administration", "BLS", "ACLS"],
    certifications: ["RN License", "BLS", "ACLS"],
  }),
  "help-desk-analyst": form({
    name: "Sophia Williams",
    title: "Help Desk Analyst | ITIL Foundation | Microsoft 365",
    email: "sophia.williams@email.com",
    location: "Denver, CO",
    summary: "Help desk analyst with ITIL experience, high-volume ticket handling, Microsoft 365 administration, and strong CSAT outcomes.",
    experience: [
      { title: "Help Desk Analyst", company: "InsuranceGroup", startDate: "Jun 2022", endDate: "Present", description: bullet("• Handle 75 tickets/day via phone, email, and chat with 99% SLA compliance.\n• Authored 18 knowledge base articles reducing repeat tickets by 22%.") },
      { title: "Junior Help Desk Technician", company: "City Council IT Dept.", startDate: "2020", endDate: "2022", description: bullet("• Provided L1 support to 400+ municipal employees.\n• Completed Windows 10 migration for 120 workstations over 3 months with no critical incidents.") },
    ],
    education: [{ title: "University of Colorado", subtitle: "B.Sc. Information Systems", endDate: "2020" }],
    skills: ["ITIL Foundation", "ServiceNow", "Jira Service Management", "Microsoft 365 Admin", "Azure AD", "Incident Management"],
    certifications: ["ITIL Foundation"],
  }),
  "linux-administrator": form({
    name: "Marcus Johnson",
    title: "Linux Administrator | RHCSA | AWS Certified SysOps",
    email: "marcus.johnson@email.com",
    location: "Portland, OR",
    website: "github.com/marcus-linux",
    summary: "Linux administrator experienced with RHEL, Ubuntu, automation, containers, AWS, monitoring, and high-availability production infrastructure.",
    experience: [
      { title: "Linux Administrator", company: "StreamingMedia Corp", startDate: "Feb 2021", endDate: "Present", description: bullet("• Administer 400+ RHEL and Ubuntu servers across AWS and on-premises.\n• Implemented Ansible automation reducing patching time from 3 days to 4 hours and maintained 99.95% uptime.") },
      { title: "Junior Linux Administrator", company: "HostingProviderX", startDate: "2018", endDate: "2021", description: bullet("• Managed shared and dedicated Linux hosting for 2,000+ client websites.\n• Resolved 200+ hosting-related incidents/month with average 22-minute resolution time.") },
    ],
    education: [{ title: "Oregon State University", subtitle: "B.Sc. Network Engineering", endDate: "2018" }],
    skills: ["RHEL", "Ubuntu", "Bash", "Python", "Ansible", "Docker", "Kubernetes", "AWS", "Terraform", "Prometheus"],
    certifications: ["RHCSA", "AWS Certified SysOps Administrator"],
  }),
  "linux-system-administrator": form({
    name: "Alex Morgan",
    title: "Linux System Administrator",
    email: "alex.morgan@email.com",
    location: "Austin, TX",
    summary: "Linux system administrator focused on server reliability, shell automation, monitoring, and secure production operations.",
    experience: [
      { title: "Linux System Administrator", company: "CloudHost Systems", startDate: "2020", endDate: "Present", description: bullet("• Manage 250+ Linux servers and automated patching with Ansible.\n• Improved monitoring coverage and reduced critical incident response time by 35%.") },
      { title: "Systems Support Specialist", company: "MetroTech", startDate: "2017", endDate: "2020", description: bullet("• Supported Linux and Windows environments for internal engineering teams.\n• Wrote Bash scripts that removed 10 hours/week of manual checks.") },
    ],
    education: [{ title: "UT Austin", subtitle: "B.Sc. Computer Engineering", endDate: "2016" }],
    skills: ["Linux", "Bash", "Ansible", "Nagios", "Prometheus", "Networking", "SSH", "Security Hardening"],
  }),
  "student": form({
    name: "Maya Patel",
    title: "Computer Science Student | Software Engineering Intern",
    email: "maya.patel@email.com",
    location: "Toronto, ON",
    summary: "Computer science student seeking software engineering internships, with strong project work, teamwork, and classroom experience in data structures.",
    experience: [
      { title: "Software Engineering Intern", company: "Campus Innovation Lab", startDate: "May 2025", endDate: "Aug 2025", description: bullet("• Built React components for a student services dashboard used by 3,000 students.\n• Wrote unit tests that raised coverage for the dashboard package from 62% to 81%.") },
      { title: "Peer Tutor", company: "University Learning Centre", startDate: "2024", endDate: "2025", description: bullet("• Tutored 20+ students in introductory programming and data structures.") },
    ],
    education: [{ title: "University of Toronto", subtitle: "B.Sc. Computer Science", endDate: "Expected 2027" }],
    skills: ["JavaScript", "React", "Python", "Java", "Git", "Data Structures", "Teamwork"],
    projects: [{ title: "Course Planner App", subtitle: "React, Node.js", description: "Built a planner that helps students compare schedules and prerequisite paths." }],
  }),
  "canadian": form({
    name: "Sarah Thompson",
    title: "Operations Coordinator",
    email: "sarah.thompson@email.com",
    location: "Toronto, ON",
    linkedin: "linkedin.com/in/sarahthompson",
    summary: "Operations coordinator with Canadian-format resume structure, measurable process improvements, and experience supporting cross-functional teams.",
    experience: [
      { title: "Operations Coordinator", company: "Maple Logistics", startDate: "2021", endDate: "Present", description: bullet("• Coordinated daily logistics across 3 warehouse teams and improved on-time dispatch from 91% to 97%.\n• Built Excel reporting used by managers to identify recurring bottlenecks.") },
      { title: "Administrative Assistant", company: "Northstar Retail", startDate: "2018", endDate: "2021", description: bullet("• Supported scheduling, purchasing, and vendor communications for a 40-person office.") },
    ],
    education: [{ title: "George Brown College", subtitle: "Business Administration Diploma", endDate: "2018" }],
    skills: ["Operations", "Excel", "Scheduling", "Vendor Coordination", "Reporting", "Process Improvement"],
  }),
  "french-cv": form({
    name: "Léa Tremblay",
    title: "Responsable Marketing Digital",
    email: "lea.tremblay@email.com",
    location: "Paris, France",
    summary: "Responsable marketing digital avec 7 ans d'expérience en acquisition, campagnes multicanales et management d'équipe dans des environnements SaaS.",
    experience: [
      { title: "Responsable Marketing Digital", company: "Payfit", startDate: "2021", endDate: "Présent", description: bullet("• Pilotage d'un budget annuel de 2 M€ sur Google, LinkedIn et Meta avec un ROAS moyen de 4,2.\n• Lancement de 4 marchés européens et croissance de l'équipe marketing de 2 à 14 personnes.") },
      { title: "Chargée d'acquisition", company: "Doctolib", startDate: "2018", endDate: "2021", description: bullet("• Optimisation des campagnes d'acquisition et amélioration du coût par lead de 28%.") },
    ],
    education: [{ title: "Université Paris-Dauphine", subtitle: "Master Marketing Digital", endDate: "2018" }],
    skills: ["SEO", "SEA", "CRM", "Google Ads", "LinkedIn Ads", "Analyse de données", "Management"],
    languages: ["Français (natif)", "Anglais (courant)", "Espagnol (intermédiaire)"],
  }),
  "arabic-resume": form({
    name: "كريم بنعلي",
    title: "مهندس مدني",
    email: "karim.benali@email.com",
    location: "الدار البيضاء، المغرب",
    summary: "مهندس مدني بخبرة في إدارة مشاريع البناء، متابعة الجودة، وتنسيق فرق العمل في مواقع إنشائية متعددة.",
    experience: [
      { title: "مهندس مشروع", company: "شركة أطلس للبناء", startDate: "2021", endDate: "الحاضر", description: bullet("• إدارة تنفيذ مشروع سكني يضم 120 وحدة مع الالتزام بالجدول الزمني ومعايير السلامة.\n• تنسيق عمل 5 مقاولين فرعيين وخفض ملاحظات الجودة بنسبة 30%.") },
      { title: "مهندس موقع", company: "مجموعة العمران", startDate: "2018", endDate: "2021", description: bullet("• متابعة الأعمال اليومية وإعداد تقارير تقدم أسبوعية للإدارة والاستشاريين.") },
    ],
    education: [{ title: "المدرسة الحسنية للأشغال العمومية", subtitle: "دبلوم مهندس مدني", endDate: "2018" }],
    skills: ["إدارة المشاريع", "مراقبة الجودة", "AutoCAD", "السلامة", "إدارة المقاولين", "التقارير الفنية"],
    languages: ["العربية (اللغة الأم)", "الفرنسية (طليق)", "الإنجليزية (جيد)"],
  }),
  "uk-cv": form({
    name: "James Whitfield",
    title: "Operations Manager",
    email: "james.whitfield@email.co.uk",
    location: "Manchester, UK",
    linkedin: "linkedin.com/in/jameswhitfield",
    summary: "Operations manager with experience leading production teams, improving OEE, managing budgets, and delivering continuous improvement in UK manufacturing environments.",
    experience: [
      { title: "Operations Manager", company: "Northern Manufacturing Ltd", startDate: "Sep 2020", endDate: "Present", description: bullet("• Responsible for a £4.2M annual production budget and a team of 38 operatives.\n• Reduced waste by 18% and improved OEE from 72% to 84% through Lean Six Sigma initiatives.") },
      { title: "Production Supervisor", company: "UK Industrial Group", startDate: "2016", endDate: "2020", description: bullet("• Supervised day and night shifts of 15 operatives across two production lines.\n• Achieved 99.1% on-time delivery against a KPI target of 97%.") },
    ],
    education: [{ title: "University of Manchester", subtitle: "B.Eng. Mechanical Engineering (2:1)", endDate: "2016" }],
    skills: ["Operations Management", "P&L Accountability", "Lean Six Sigma", "Supplier Management", "SAP ERP", "Team Leadership", "Budget Planning"],
  }),
};

DATA_BY_ID["it-support"] = DATA_BY_ID["it-support-technician"];

export function getResumeStarter(starterId) {
  const meta = STARTER_METADATA.find((item) => item.id === starterId);
  const data = DATA_BY_ID[starterId];
  if (!meta || !data) return null;
  return {
    ...meta,
    data: JSON.parse(JSON.stringify(data)),
  };
}
