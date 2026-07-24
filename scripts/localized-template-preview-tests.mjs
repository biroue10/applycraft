import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const expected = {
  en: ["Sarah Okonkwo", "David Chen", "Priya Sharma"],
  fr: ["Léa Tremblay", "Karim Benali", "Aïsha Diallo"],
  ar: ["يوسف الأمين", "نادية مالك", "أحمد السيد"],
};

for (const [locale, profiles] of Object.entries(expected)) {
  for (const profile of profiles) {
    assert(source.includes(profile), `${locale} localized template profile missing: ${profile}`);
  }
}
for (const id of ["classic", "modern", "minimal", "bold", "creative", "tech"]) {
  assert.match(source, new RegExp(`\\b${id}:\\s*\\{`), `template sample ${id} must exist`);
}
assert.match(source, /localizedThumbSample\(tp, lang\)\.result/,
  "gallery cards must inject profiles for the active locale");
assert.match(source, /tech:\s*"ar"/, "third Arabic sample must be registered RTL/Arabic");
assert.match(source, /tech:\s*\{\s*rtl:\s*true/, "Arabic technical profile must render RTL");

console.log("Localized template preview tests passed.");
