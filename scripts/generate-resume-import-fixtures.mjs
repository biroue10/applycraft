import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { jsPDF } from "jspdf";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const fixtureDir = join(root, "tests/fixtures");
const sourcePath = join(fixtureDir, "french-import-resume.txt");
const docxPath = join(fixtureDir, "french-import-resume.docx");
const pdfPath = join(fixtureDir, "french-import-resume.pdf");

const text = await readFile(sourcePath, "utf8");
const lines = text.split(/\r?\n/);

function paragraphFor(line, index) {
  const trimmed = line.trim();
  if (!trimmed) return new Paragraph({ text: "" });
  const isName = index === 0;
  const isTitle = index === 1;
  const isSection = /^(Profil|Expérience|Formation|Langues|Compétences)$/.test(trimmed);
  const isBullet = /^•\s+/.test(trimmed);
  const isRoleTitle = /^(Ingénieur Logiciel Senior|Développeur Full Stack|Diplôme d'Ingénieur d'État en Informatique)$/.test(trimmed);
  const isMeta = /—/.test(trimmed);
  return new Paragraph({
    heading: isName ? HeadingLevel.TITLE : isSection ? HeadingLevel.HEADING_2 : undefined,
    bullet: isBullet ? { level: 0 } : undefined,
    spacing: { after: isSection ? 120 : 60 },
    alignment: isName || isTitle ? AlignmentType.CENTER : undefined,
    children: [
      new TextRun({
        text: isBullet ? trimmed.replace(/^•\s+/, "") : trimmed,
        bold: isName || isSection || isRoleTitle,
        italics: isMeta,
      }),
    ],
  });
}

await mkdir(fixtureDir, { recursive: true });

const doc = new Document({
  sections: [{ children: lines.map(paragraphFor) }],
});
await writeFile(docxPath, await Packer.toBuffer(doc));

const pdf = new jsPDF({ unit: "pt", format: "a4" });
pdf.setFont("helvetica", "normal");
let y = 48;
for (const line of lines) {
  if (!line.trim()) { y += 10; continue; }
  const isSection = /^(Profil|Expérience|Formation|Langues|Compétences)$/.test(line.trim());
  const isTitle = /^(Youssef El Amine|Ingénieur Logiciel Senior|Développeur Full Stack|Diplôme d'Ingénieur d'État en Informatique)$/.test(line.trim());
  pdf.setFont("helvetica", isSection || isTitle ? "bold" : "normal");
  pdf.setFontSize(isSection ? 13 : 10.5);
  const wrapped = pdf.splitTextToSize(line, 500);
  pdf.text(wrapped, 48, y);
  y += wrapped.length * 14 + (isSection ? 8 : 2);
}
await writeFile(pdfPath, Buffer.from(pdf.output("arraybuffer")));

console.log(`Generated ${docxPath}`);
console.log(`Generated ${pdfPath}`);
