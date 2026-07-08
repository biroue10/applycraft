// ──────────────────────────────────────────────────────────────────────────
// ATS engine + scoring tests (Phase 3). Pure, SSR-safe — no browser needed.
// Run: npm run test:ats
// Covers tokenization/keyword matching for supported interface languages plus the
// centralized, documented scoring rules.
// ──────────────────────────────────────────────────────────────────────────
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { analyzeKeywords, detectLanguage } = await import(path.join(root, "src/ats/engine.js"));
const { scoreFromIssues, scoreBand, READINESS_EXPLAINER, SCORE_WEIGHTS } =
  await import(path.join(root, "src/ats/scoring.js"));
const { extractDocxText } = await import(path.join(root, "src/ats/docxText.js"));
const { textItemsToLines } = await import(path.join(root, "src/ats/pdfText.js"));
const { default: atsEn } = await import(path.join(root, "src/i18n/atsResults/en.js"));
const { default: atsFr } = await import(path.join(root, "src/i18n/atsResults/fr.js"));
const { default: atsAr } = await import(path.join(root, "src/i18n/atsResults/ar.js"));
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

let failures = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  ok  ${name}`); }
  catch (e) { failures++; console.error(`  FAIL ${name}\n       ${e.message}`); }
};
const checkAsync = async (name, fn) => {
  try { await fn(); console.log(`  ok  ${name}`); }
  catch (e) { failures++; console.error(`  FAIL ${name}\n       ${e.message}`); }
};

// ── Language detection ──────────────────────────────────────────────────────
check("detects English", () => assert.equal(detectLanguage("experience managing a team and shipping software"), "en"));
check("detects French", () => assert.equal(detectLanguage("expérience dans la gestion d'une équipe et le développement"), "fr"));
check("detects Spanish", () => assert.equal(detectLanguage("experiencia en la gestión de un equipo y el desarrollo de software"), "es"));
check("detects German", () => assert.equal(detectLanguage("Erfahrung in der Leitung eines Teams und der Entwicklung von Software"), "de"));
check("detects Arabic", () => assert.equal(detectLanguage("خبرة في إدارة فريق وتطوير البرمجيات"), "ar"));

// ── English keyword matching ────────────────────────────────────────────────
check("EN: matches present, flags missing", () => {
  const r = analyzeKeywords("Built data pipelines with Python and SQL", "We need Python, SQL and AWS experience");
  assert.ok(r.present.includes("python") && r.present.includes("sql"), "python+sql present");
  assert.ok(r.missing.includes("aws"), "aws missing");
  assert.ok(r.pct > 0 && r.pct <= 100);
});

// ── French: accented words are handled (folded for matching, not dropped) ────
check("FR: accented words match across spellings", () => {
  const r = analyzeKeywords("Développeur logiciel expérimenté dans la méthode agile", "Recherche développeur dans une équipe agile");
  // "Développeur" (accented) must fold and match "développeur", surfacing as
  // the diacritic-folded token "developpeur" — the accented word is not dropped.
  assert.ok(r.present.includes("developpeur"), `expected 'developpeur' in present, got ${JSON.stringify(r.present)}`);
  assert.ok(r.present.includes("agile"), `expected 'agile' in present, got ${JSON.stringify(r.present)}`);
});

// ── Spanish & German smoke matching ─────────────────────────────────────────
check("ES: matches keywords", () => {
  const r = analyzeKeywords("Gestión de proyectos y desarrollo de software", "Buscamos gestión de proyectos y desarrollo");
  assert.ok(r.present.length >= 1, JSON.stringify(r.present));
});
check("DE: matches keywords", () => {
  const r = analyzeKeywords("Projektmanagement und Softwareentwicklung", "Wir suchen Projektmanagement und Entwicklung");
  assert.ok(r.total >= 1);
});

// ── Arabic (RTL, non-Latin): analyzed, not discarded ────────────────────────
check("AR: non-Latin tokens are analyzed and matched", () => {
  const resume = "مهندس برمجيات لديه خبرة في تطوير البرمجيات وإدارة المشاريع";
  const jd = "مطلوب مهندس برمجيات لديه خبرة في تطوير وإدارة المشاريع";
  const r = analyzeKeywords(resume, jd);
  assert.equal(r.langResume, "ar");
  assert.equal(r.langJd, "ar");
  assert.ok(r.total >= 1, "Arabic JD produced keywords");
  assert.ok(r.present.length >= 1, `Arabic matches found, got ${JSON.stringify(r.present)}`);
});

// ── No partial-word matching ────────────────────────────────────────────────
check("does not match partial words (java ≠ javascript)", () => {
  const r = analyzeKeywords("Expert in JavaScript", "Java required");
  assert.ok(r.missing.includes("java"), `java should be missing, got ${JSON.stringify(r)}`);
  assert.ok(!r.present.includes("java"));
});

// ── Repeated keywords do not inflate ────────────────────────────────────────
check("repeated JD keywords are de-duplicated", () => {
  const r = analyzeKeywords("Python developer", "python python python developer");
  assert.equal(r.total, 2, `expected 2 unique keywords (python, developer), got ${r.total}`);
  assert.equal(r.pct, 100, "both unique keywords present → 100%");
});

// ── Empty / safe inputs ─────────────────────────────────────────────────────
check("empty JD is safe", () => {
  const r = analyzeKeywords("Some resume text", "");
  assert.equal(r.pct, 0);
  assert.equal(r.total, 0);
});

// ── Centralized scoring ─────────────────────────────────────────────────────
check("scoreFromIssues uses documented weights", () => {
  assert.equal(scoreFromIssues([]), 100);
  assert.equal(scoreFromIssues([{ level: "critical" }, { level: "warning" }]),
    100 - SCORE_WEIGHTS.critical - SCORE_WEIGHTS.warning);
  assert.equal(scoreFromIssues(Array(10).fill({ level: "critical" })), 0, "never below 0");
});
check("scoreBand labels are honest (no guarantee wording)", () => {
  assert.equal(scoreBand(90).label, "Strong");
  assert.equal(scoreBand(70).label, "Needs work");
  assert.equal(scoreBand(50).label, "Action required");
  assert.equal(scoreBand(10).label, "Critical issues");
});
check("readiness explainer names no specific ATS as reproduced + no guarantee", () => {
  for (const v of ["Workday", "Greenhouse", "Taleo", "Lever"]) assert.ok(READINESS_EXPLAINER.includes(v));
  assert.ok(/does not guarantee/i.test(READINESS_EXPLAINER));
});

const issueCodes = [
  "NO_EMAIL", "NO_EXPERIENCE", "NO_SKILLS", "NO_PHONE", "NO_LINKEDIN",
  "NO_SUMMARY", "NO_NUMBERS", "NO_DATES", "WEAK_BULLETS", "LONG_LINES",
  "TOO_SHORT", "NO_EDUCATION", "TOO_LONG", "KW_LOW", "KW_MED",
];
const scoreBandCodes = ["strong", "needsWork", "actionRequired", "criticalIssues"];
const forbiddenLocalizedAtsEnglish = [
  /Needs work/i,
  /Several fixable issues/i,
  /Low keyword match/i,
  /Only \{pct\}% of the meaningful keywords/i,
  /Education section not detected/i,
  /Some ATS systems require/i,
  /Action required/i,
  /Critical issues/i,
];

check("ATS result translations cover every issue code and score band", () => {
  for (const [lang, messages] of Object.entries({ en: atsEn, fr: atsFr, ar: atsAr })) {
    for (const code of scoreBandCodes) {
      assert.ok(messages.scoreBands?.[code]?.label, `${lang} missing score band label ${code}`);
      assert.ok(messages.scoreBands?.[code]?.meaning, `${lang} missing score band meaning ${code}`);
    }
    for (const code of issueCodes) {
      assert.ok(messages.issueText?.[code]?.title, `${lang} missing issue title ${code}`);
      assert.ok(messages.issueText?.[code]?.detail, `${lang} missing issue detail ${code}`);
    }
  }
});

check("French and Arabic ATS result translations do not fallback to English result copy", () => {
  for (const [lang, messages] of Object.entries({ fr: atsFr, ar: atsAr })) {
    const serialized = JSON.stringify({
      scoreBands: messages.scoreBands,
      issueText: messages.issueText,
    });
    for (const re of forbiddenLocalizedAtsEnglish) {
      assert.ok(!re.test(serialized), `${lang} contains English fallback result copy matching ${re}`);
    }
  }
});

function fixtureFile(name, type) {
  const buffer = readFileSync(path.join(root, "tests/fixtures", name));
  return {
    name,
    type,
    arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  };
}

async function extractFixtureResumeText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.name.endsWith(".docx")) return extractDocxText(buffer);
  if (file.name.endsWith(".pdf")) {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, isEvalSupported: false }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(textItemsToLines(content.items).join("\n"));
    }
    await doc.destroy();
    return pages.join("\n");
  }
  return buffer.toString("utf8");
}

function atsDom(locale) {
  const dom = new JSDOM(`<!doctype html>
    <textarea id="resume-text"></textarea>
    <textarea id="jd-text"></textarea>
    <button id="import-btn"></button>
    <input id="resume-import" type="file">
    <p id="import-status"></p>
    <button id="check-btn"></button>
    <div id="results"></div>
    <path id="gauge-arc"></path>
    <div id="score-num"></div>
    <div id="score-label"></div>
    <div id="summary-pills"></div>
    <div id="kw-section"></div>
    <div id="kw-pct"></div>
    <div id="kw-present-count"></div>
    <div id="kw-missing-count"></div>
    <div id="kw-fill"></div>
    <div id="kw-present-tags"></div>
    <div id="kw-missing-tags"></div>
    <div id="issues-list"></div>
    <div id="all-clear"></div>`, {
    url: "https://applycraft.io/ats-checker/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  dom.window.LOCALE = locale;
  dom.window.ApplyCraftATSImport = { extractResumeText: extractFixtureResumeText };
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.console = console;
  dom.window.eval(readFileSync(path.join(root, "public/ats-engine.js"), "utf8"));
  return dom;
}

const pageLocales = {
  en: {
    emptyAlert: "Paste first", analysing: "Analysing", recheck: "Re-check",
    scoreLabels: { 80: "Strong", 60: "Needs work", 40: "Action required", 0: "Critical issues" },
    pills: { critical: "Critical", warning: "Warning", info: "Info", allGood: "All good" },
    badgeLabels: { critical: "critical", warning: "warning", info: "info" },
    matchedKw: "Matched keywords", noMissingKw: "No missing", allClear: "All clear",
    reading: "Reading file...", uploadBtn: "Upload PDF/DOCX",
    importSuccess: "Resume text imported. Analysis updated.",
    importNoReadable: "No readable text.", importError: "Could not read.",
  },
  fr: {
    emptyAlert: "Collez d'abord", analysing: "Analyse", recheck: "Relancer",
    scoreLabels: { 80: "Fort", 60: "À améliorer", 40: "Action", 0: "Critique" },
    pills: { critical: "Critique", warning: "Avertissement", info: "Info", allGood: "Aucun problème" },
    badgeLabels: { critical: "Critique", warning: "Avertissement", info: "Info" },
    matchedKw: "Mots-clés", noMissingKw: "Aucun", allClear: "Tout est bon",
    reading: "Lecture...", uploadBtn: "Importer PDF/DOCX",
    importSuccess: "Texte du CV importé. Analyse mise à jour.",
    importNoReadable: "Aucun texte lisible.", importError: "Impossible de lire.",
  },
  ar: {
    emptyAlert: "الصق أولاً", analysing: "تحليل", recheck: "إعادة",
    scoreLabels: { 80: "قوي", 60: "تحسين", 40: "إجراء", 0: "حرج" },
    pills: { critical: "حرج", warning: "تحذير", info: "معلومة", allGood: "سليم" },
    badgeLabels: { critical: "حرج", warning: "تحذير", info: "معلومة" },
    matchedKw: "كلمات", noMissingKw: "لا يوجد", allClear: "سليم",
    reading: "قراءة...", uploadBtn: "رفع PDF/DOCX",
    importSuccess: "تم استيراد نص السيرة الذاتية وتحديث التحليل.",
    importNoReadable: "لا يوجد نص.", importError: "تعذرت القراءة.",
  },
};
for (const locale of Object.values(pageLocales)) {
  locale.issues = {
    noEmail: { title: "email", detail: "email" },
    noExperience: { title: "experience", detail: "experience" },
    noSkills: { title: "skills", detail: "skills" },
    noPhone: { title: "phone", detail: "phone" },
    noLinkedin: { title: "linkedin", detail: "linkedin" },
    noSummary: { title: "summary", detail: "summary" },
    noNumbers: { title: "numbers", detail: "numbers" },
    noDates: { title: "dates", detail: "dates" },
    noEducation: { title: "education", detail: "education" },
    weakBullets: () => ({ title: "weak", detail: "weak" }),
    longLines: () => ({ title: "long", detail: "long" }),
    tooShort: () => ({ title: "short", detail: "short" }),
    tooLong: () => ({ title: "long resume", detail: "long resume" }),
    kwLow: () => ({ title: "kw low", detail: "kw low" }),
    kwMed: () => ({ title: "kw med", detail: "kw med" }),
  };
}

for (const [lang, locale] of Object.entries(pageLocales)) {
  for (const [label, file] of [
    ["PDF", fixtureFile("french-import-resume.pdf", "application/pdf")],
    ["DOCX", fixtureFile("french-import-resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")],
  ]) {
    await checkAsync(`static ATS ${lang} imports ${label} into textarea`, async () => {
      const dom = atsDom(locale);
      await dom.window.importResumeFile(file, locale);
      await new Promise((resolve) => setTimeout(resolve, 380));
      const text = dom.window.document.getElementById("resume-text").value;
      assert.ok(text.length > 80, `expected imported text, got ${text.length} chars`);
      assert.match(text, /Camille|Expérience|Compétences/i);
      assert.equal(dom.window.document.getElementById("import-status").dataset.kind, "success");
      assert.notEqual(dom.window.document.getElementById("score-num").textContent, "");
      dom.window.close();
    });
  }
}

for (const [lang, locale] of Object.entries(pageLocales)) {
  await checkAsync(`static ATS ${lang} auto-runs readiness score after resume paste without job description`, async () => {
    const dom = atsDom(locale);
    const resume = dom.window.document.getElementById("resume-text");
    const jd = dom.window.document.getElementById("jd-text");
    resume.value = `Alex Martin
alex@example.com
+1 555 123 4567

Experience
Developer at Acme 2021 - 2024
Responsible for web apps

Skills
JavaScript, React`;
    jd.value = "";
    resume.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 780));
    assert.notEqual(dom.window.document.getElementById("score-num").textContent, "");
    assert.equal(dom.window.document.getElementById("results").style.display, "block");
    assert.equal(dom.window.document.getElementById("kw-section").style.display, "none");
    assert.notEqual(dom.window.document.getElementById("score-label").textContent, "");
    dom.window.close();
  });

  await checkAsync(`static ATS ${lang} auto-adds keyword analysis after job description paste`, async () => {
    const dom = atsDom(locale);
    const resume = dom.window.document.getElementById("resume-text");
    const jd = dom.window.document.getElementById("jd-text");
    resume.value = `Alex Martin
alex@example.com
+1 555 123 4567

Experience
Developer at Acme 2021 - 2024
Responsible for web apps

Skills
JavaScript, React`;
    resume.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 780));
    jd.value = "Python SQL AWS Kubernetes analytics cloud security data pipelines stakeholder management";
    jd.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 780));
    assert.equal(dom.window.document.getElementById("kw-section").style.display, "block");
    assert.notEqual(dom.window.document.getElementById("kw-pct").textContent, "");
    dom.window.close();
  });
}

await checkAsync("static ATS import shows paste-manually message when no text is readable", async () => {
  const dom = atsDom(pageLocales.fr);
  dom.window.ApplyCraftATSImport = { extractResumeText: async () => "" };
  await dom.window.importResumeFile(fixtureFile("french-import-resume.pdf", "application/pdf"), pageLocales.fr);
  const status = dom.window.document.getElementById("import-status");
  assert.equal(status.dataset.kind, "error");
  assert.equal(status.textContent, pageLocales.fr.importNoReadable);
  assert.equal(dom.window.document.getElementById("resume-text").value, "");
  dom.window.close();
});

check("static ATS pages expose localized import controls", () => {
  const pages = [
    ["public/ats-checker/index.html", /Upload PDF\/DOCX/, /Resume text imported/],
    ["public/ats-checker-fr/index.html", /Importer PDF\/DOCX/, /Texte du CV importé/],
    ["public/ats-checker-ar/index.html", /رفع PDF\/DOCX/, /تم استيراد نص السيرة الذاتية/],
  ];
  for (const [file, button, success] of pages) {
    const html = readFileSync(path.join(root, file), "utf8");
    assert.match(html, /id="resume-import"/);
    assert.match(html, /id="import-btn"/);
    assert.match(html, /id="import-status"/);
    assert.match(html, button);
    assert.match(html, success);
  }
});

check("static ATS engine emits structured issue codes before localization", () => {
  const source = readFileSync(path.join(root, "public/ats-engine.js"), "utf8");
  assert.match(source, /code:'NO_EMAIL'/);
  assert.match(source, /code:'KW_LOW'/);
  assert.doesNotMatch(source, /\.\.\.locale\.issues\./);
});

console.log("");
if (failures) { console.error(`ATS tests: ${failures} failed.`); process.exit(1); }
console.log("ATS tests: all passed.");
