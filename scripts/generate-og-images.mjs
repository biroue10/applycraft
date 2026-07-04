import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public/og/", import.meta.url);
mkdirSync(ROOT, { recursive: true });

const images = [
  ["home", "ApplyCraft", "Resume Builder & Cover Letter Maker", "Fast, ATS-friendly documents"],
  ["home-fr", "ApplyCraft", "Créateur de CV et lettre de motivation", "Rapide, compatible ATS"],
  ["home-ar", "ApplyCraft", "منشئ سيرة ذاتية وخطاب تقديم", "سريع ومتوافق مع ATS"],
  ["free-resume-builder", "Free Resume Builder", "No sign-up. No hidden fees.", "PDF & DOCX downloads"],
  ["free-resume-builder-fr", "Créer un CV gratuit", "Sans inscription ni frais cachés", "Export PDF et DOCX"],
  ["free-resume-builder-ar", "منشئ سيرة ذاتية مجاني", "بدون تسجيل أو رسوم مخفية", "تنزيل PDF و DOCX"],
  ["canadian-resume-builder", "Canadian Resume Builder", "Format & templates for Canada", "No photo. ATS-friendly."],
  ["student-resume-builder", "Student Resume Builder", "First job & internship templates", "No experience needed"],
  ["ats-checker", "ATS Checker", "Scan and improve your resume", "Keyword and formatting guidance"],
];

function esc(text) {
  return String(text).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function svg([id, eyebrow, title, subtitle]) {
  const isArabic = /[\u0600-\u06FF]/.test(`${title}${subtitle}`);
  const dir = isArabic ? "rtl" : "ltr";
  const anchor = isArabic ? "middle" : "start";
  const x = isArabic ? 600 : 96;
  const titleSize = isArabic ? 46 : 58;
  const subtitleSize = isArabic ? 28 : 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050816"/><stop offset="0.55" stop-color="#0D1424"/><stop offset="1" stop-color="#132036"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#2563EB"/><stop offset="1" stop-color="#2DD4BF"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="90" r="220" fill="#2563EB" opacity="0.16"/>
  <circle cx="180" cy="560" r="230" fill="#2DD4BF" opacity="0.10"/>
  <rect x="72" y="72" width="1056" height="486" rx="28" fill="#0D1424" stroke="#20324E" stroke-width="2"/>
  <text x="${x}" y="158" direction="${dir}" text-anchor="${anchor}" fill="#93C5FD" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="800" letter-spacing="1.5">${esc(eyebrow)}</text>
  <text x="${x}" y="286" direction="${dir}" text-anchor="${anchor}" fill="#F8FAFC" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="900">${esc(title)}</text>
  <text x="${x}" y="360" direction="${dir}" text-anchor="${anchor}" fill="#B6C2D6" font-family="Inter, Arial, sans-serif" font-size="${subtitleSize}" font-weight="650">${esc(subtitle)}</text>
  <rect x="${isArabic ? 766 : 96}" y="424" width="338" height="58" rx="8" fill="url(#accent)"/>
  <text x="${isArabic ? 935 : 265}" y="462" text-anchor="middle" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">applycraft.io</text>
</svg>`;
}

for (const image of images) {
  const id = image[0];
  const svgPath = join(ROOT.pathname, `${id}.svg`);
  writeFileSync(svgPath, svg(image), "utf8");
}

const svgFiles = readdirSync(ROOT.pathname)
  .filter((file) => file.endsWith(".svg"))
  .sort();

for (const file of svgFiles) {
  const svgPath = join(ROOT.pathname, file);
  const pngPath = join(ROOT.pathname, file.replace(/\.svg$/, ".png"));

  try {
    await sharp(svgPath, { density: 150 })
      .resize(1200, 630, { fit: "fill" })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(pngPath);
    console.log(`✓ Generated public/og/${file.replace(/\.svg$/, ".png")}`);
  } catch (error) {
    console.error(`Failed to generate public/og/${file.replace(/\.svg$/, ".png")} from public/og/${file}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  throw new Error("One or more OG image files failed to generate.");
}
