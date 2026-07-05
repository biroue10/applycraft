import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseResume } from "../src/ats/parseResume.js";
import { extractDocxText } from "../src/ats/docxText.js";
import { formatPhoneForResume } from "../src/utils/phone.js";
import { postProcessTranslatedResume } from "../src/translation.js";

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

assert.equal(parsed.name, "Youssef El Amine");
assert.equal(parsed.title, "Ingénieur Logiciel Senior");
assert.equal(parsed.phone, "+212 6 61 23 45 67");
assert.equal(formatPhoneForResume(parsed.phone, "+1", "+1"), "+212 6 61 23 45 67", "international phones must not receive phantom +1");
assert.equal(parsed.website, "", "import must not inject applycraft.io or any placeholder website");

assert.equal(parsed.experience.length, 2, "French fixture should produce exactly 2 experience entries");
assert.equal(parsed.experience[0].title, "Ingénieur Logiciel Senior");
assert.equal(parsed.experience[0].company, "Groupe OCP");
assert.equal(parsed.experience[0].location, "Casablanca");
assert.equal(parsed.experience[0].startDate, "Mars 2022");
assert.equal(parsed.experience[0].endDate, "Present");
assert.equal(parsed.experience[0].bullets.length, 3);
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
