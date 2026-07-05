import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseResume } from "../src/ats/parseResume.js";
import { extractDocxText } from "../src/ats/docxText.js";
import { textItemsToLines } from "../src/ats/pdfText.js";
import { detectImportedResumeLanguage } from "../src/importLanguage.js";
import { formatPhoneForResume } from "../src/utils/phone.js";
import { postProcessTranslatedResume } from "../src/translation.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const fixtureDir = join(root, "tests/fixtures");
const text = await readFile(join(fixtureDir, "french-import-resume.txt"), "utf8");

for (const name of ["french-import-resume.docx", "french-import-resume.pdf"]) {
  const info = await stat(join(fixtureDir, name));
  assert.ok(info.size > 500, `${name} fixture should exist and be non-empty`);
}

const parsed = parseResume(text);
const docxText = extractDocxText(await readFile(join(fixtureDir, "french-import-resume.docx")));
const parsedDocx = parseResume(docxText);
const pdfBytes = await readFile(join(fixtureDir, "french-import-resume.pdf"));
const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(pdfBytes), useSystemFonts: true, isEvalSupported: false }).promise;
const pdfPages = [];
for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
  const page = await pdfDoc.getPage(pageNumber);
  const content = await page.getTextContent();
  pdfPages.push(textItemsToLines(content.items).join("\n"));
}
await pdfDoc.destroy();
const parsedPdf = parseResume(pdfPages.join("\n"));

assert.equal(parsed.name, "Youssef El Amine");
assert.equal(parsed.title, "Ingénieur Logiciel Senior");
assert.equal(parsed.phone, "+212 6 61 23 45 67");
assert.equal(formatPhoneForResume(parsed.phone, "+1", "+1"), "+212 6 61 23 45 67", "international phones must not receive phantom +1");
assert.equal(parsed.website, "", "import must not inject applycraft.io or any placeholder website");
assert.equal(detectImportedResumeLanguage(parsedDocx), "fr", "imported French resume should set document language from content");

assert.equal(parsed.experience.length, 2, "French fixture should produce exactly 2 experience entries");
assert.equal(parsed.experience[0].title, "Ingénieur Logiciel Senior");
assert.equal(parsed.experience[0].company, "Groupe OCP");
assert.equal(parsed.experience[0].location, "Casablanca");
assert.equal(parsed.experience[0].startDate, "Mars 2022");
assert.equal(parsed.experience[0].endDate, "Present");
assert.equal(parsed.experience[0].bullets.length, 3);
assert.match(parsed.experience[0].bullets[1], /temps de traitement des demandes de 40 %/, "wrapped PDF regression bullet should exist in source expectation");
assert.equal(parsed.experience[1].title, "Développeur Full Stack");
assert.equal(parsed.experience[1].company, "Inwi");
assert.equal(parsed.experience[1].location, "Casablanca");
assert.equal(parsed.experience[1].startDate, "Janvier 2019");
assert.equal(parsed.experience[1].endDate, "Février 2022");
assert.equal(parsed.experience[1].bullets.length, 2);

assert.equal(parsed.education.length, 1, "French fixture should produce exactly 1 education entry");
assert.equal(parsed.education[0].degree, "Diplôme d'Ingénieur d'État en Informatique");
assert.equal(parsed.education[0].school, "ENSIAS");
assert.equal(parsed.education[0].location, "Rabat");
assert.equal(parsed.education[0].startDate, "2018");
assert.equal(parsed.education[0].description, "", "education date should not be duplicated as a bullet");

assert.deepEqual(parsed.languages, ["Arabe", "Français", "Anglais"]);
assert.equal(parsed.skills.length, 10);
assert.equal(parsedDocx.experience.length, 2, "generated DOCX fixture should produce exactly 2 experience entries");
assert.equal(parsedDocx.experience[1].title, "Développeur Full Stack", "DOCX second role title must not become a bullet");
assert.equal(parsedDocx.education.length, 1, "generated DOCX fixture should produce exactly 1 education entry");
assert.equal(parsedDocx.phone, "+212 6 61 23 45 67");
assert.equal(parsedPdf.experience.length, 2, "generated PDF fixture should produce exactly 2 experience entries");
assert.deepEqual(
  parsedPdf.experience.map((entry) => entry.bullets),
  parsedDocx.experience.map((entry) => entry.bullets),
  "PDF wrapped bullets should merge to match DOCX import bullets exactly"
);
assert.equal(parsedPdf.education.length, 1, "generated PDF fixture should produce exactly 1 education entry");

const appSource = await readFile(join(root, "src/ResumeGenerator.jsx"), "utf8");
const importHandler = appSource.slice(appSource.indexOf("onImprove={async"), appSource.indexOf("startResume(\"resume_upload\")"));
assert.match(importHandler, /hydrateFromParsed\(parsed\)/, "import should hydrate parsed content directly");
assert.doesNotMatch(importHandler, /translateCV|translateDocumentContent|setTranslationConfirm|callAi/, "import must not trigger or queue AI translation");
assert.match(appSource, /setDocumentLanguage\(detectedDocumentLanguage\)/, "import should set document language from detected content");
assert.doesNotMatch(appSource, /hydrateFromParsed[\s\S]{0,1400}setDocumentLanguagePreference/, "import hydration must not apply persisted document-language preference");

const arabic = postProcessTranslatedResume({
  title: "Full Stack مهندس",
  experience: "مهندس برمجيات\nGroupe OCP — Casablanca · Mars 2022 – حتى الآن\nInwi — Casablanca · Janvier 2019 – Février 2022",
}, "ar");
assert.equal(arabic.title, "مهندس Full Stack");
assert.match(arabic.experience, /مارس 2022/);
assert.match(arabic.experience, /يناير 2019/);
assert.match(arabic.experience, /فبراير 2022/);
assert.doesNotMatch(arabic.experience, /Mars|Janvier|Février/);

console.log("Resume import parser tests passed.");
