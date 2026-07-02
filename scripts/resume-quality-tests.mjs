import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeResumeQuality, normalizeDateRange } from "../src/resumeQuality.js";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const papers = await readFile(new URL("../src/documents/DocumentPapers.jsx", import.meta.url), "utf8");
const common = await readFile(new URL("../src/i18n/namespaces/en/common.js", import.meta.url), "utf8");

const scenario = {
  name: "ISAAC BIROUE",
  title: "Senior Product Designer",
  contact: ["isaac@example.com", "+212 600 000 000", "Casablanca, Maroc", "linkedin.com/in/isaac", "isaac.dev"],
  summary: "",
  sections: [
    {
      key: "experience",
      heading: "Experience",
      items: [
        "SERVICE DESK ANALYST L2 Insight | 2020 2025",
        "Responding to escalated service requests",
        "IT Support — Nextlink | 2019 2024",
        "Linux, MDM, and endpoint support",
      ],
    },
    {
      key: "education",
      heading: "Education",
      items: ["Cesaup | 2024 2026", "Master in Computer Science", "Maroc", "lorem"],
    },
    {
      key: "certifications",
      heading: "Certifications",
      items: ["RHCSA Redhat", "RHCA Redhat", "RHCE Redhat"],
    },
    {
      key: "projects",
      heading: "Projects",
      items: ["Security Scanning:"],
    },
  ],
};

const warnings = analyzeResumeQuality(scenario, { email: "isaac@example.com" }, { lang: "en" });
const warningTypes = new Set(warnings.map((warning) => warning.type));

assert.equal(normalizeDateRange("2020 2025"), "2020 – 2025", "year ranges should use an en dash");
assert.equal(normalizeDateRange("Jan 2020 Dec 2025"), "Jan 2020 – Dec 2025", "month/year ranges should use an en dash");
assert.ok(warningTypes.has("placeholder"), "placeholder detection should catch lorem");
assert.ok(warningTypes.has("emptyBullet"), "empty colon bullet detection should catch Security Scanning:");
assert.ok(warningTypes.has("headlineMismatch"), "headline mismatch warning should compare title and experience content");
assert.ok(warnings.some((warning) => warning.type === "capitalization" && warning.detail === "Red Hat"), "Redhat capitalization warning should suggest Red Hat");
assert.ok(warnings.some((warning) => warning.type === "capitalization" && warning.detail === "CESA SUP"), "CESAUP capitalization warning should suggest CESA SUP");

assert.match(papers, /function ResumeSectionBody[\s\S]*structureSectionItems\(section, lang\)/, "preview renderer should use structured section entries");
assert.match(papers, /function inferCompactExperienceHeader[\s\S]*return \[match\[1\]\.trim\(\), match\[2\]\.trim\(\)\]/, "compact imported job headers should split title and company metadata");
assert.match(papers, /!isEducationTitle\(current\.title\) && isEducationTitle\(clean\)[\s\S]*current\.meta = \[current\.title, \.\.\.current\.meta\]/, "education degree following school/date should become the title");
assert.match(papers, /kind === "education"[\s\S]*return \{ title: meta\.shift\(\), meta: \[title/, "education school/date metadata should not become bullets");
assert.match(papers, /isPlaceholderOnly\(clean\)/, "placeholder-only details should be omitted from rendered section details");

const pdfBody = app.slice(app.indexOf("async function downloadPDF"), app.indexOf("async function downloadDOCX"));
const docxBody = app.slice(app.indexOf("async function downloadDOCX"), app.indexOf("const getTemplateMeta"));

assert.match(pdfBody, /structureSectionItems\(section, docLang\)/, "PDF export should render structured experience and education entries");
assert.doesNotMatch(pdfBody, /`- \$\{safe\(item\)\}`/, "PDF export must not prefix every section item with a bullet");
assert.match(pdfBody, /const contactItems = \(src\.contact \|\| \[\]\)\.filter\(Boolean\)/, "email should remain in the main PDF contact row");
assert.match(docxBody, /structureSectionItems\(section, docLang\)/, "DOCX export should render structured experience and education entries");

assert.match(app, /Review before download/, "export warnings modal should exist");
assert.match(app, /Download anyway/, "warnings modal should allow non-blocking download");
assert.match(app, /skipReview: true/, "warning downloads should be bypassable by the user");
assert.match(app, /onClick=\{\(\) => \{ setExportMenuOpen\(false\); downloadPDF\(\); \}\}/, "PDF download should remain a direct free action");
assert.match(app, /onClick=\{\(\) => \{ setExportMenuOpen\(false\); downloadDOCX\(\); \}\}/, "DOCX download should remain a direct free action");
assert.match(common, /"dlPdf": "Download PDF"/, "English PDF export label should still exist");
assert.match(common, /"dlDocx": "Download DOCX"/, "English DOCX export label should still exist");

console.log("Resume quality tests passed.");
