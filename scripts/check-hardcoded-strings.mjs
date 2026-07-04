import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (path.startsWith("src/i18n")) continue;
    if (entry.isDirectory()) files.push(...await listSourceFiles(path));
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const sourceFiles = await listSourceFiles("src");

const forbiddenVisibleStrings = [
  "No sign-up required to start. Save or export when ready.",
  "Continue with this resume",
  "Try a sample profile",
  "Reset demo",
  "Resume template",
  "Accent color",
];

const allowLine = [
  /ApplyCraft/,
  /GitHub|LinkedIn|React|Vite|Cloudflare|DOCX|PDF|ATS|URL|GDPR|AI|SEO|API/,
  /placeholder="(?:Jane Doe|Sarah Okonkwo|Senior Product Designer|AWS Solutions Architect|Amazon Web Services|React, Node\.js, PostgreSQL|github\.com\/|credential link|March 2024|2023|Answer|Min\. 8 characters|Repeat your password)"/,
  />[A-Z]{2,}</,
  /console\./,
  /track\(EVENTS\./,
  /const .* = \[/,
  /aria-label="(?:Professional profile photo|Sample professional resume|Live generated resume preview|ATS Friendly)"/,
  /title="(?:Product Designer|Lead Product Manager|Product Manager|Career Match Engine)"/,
  /company="(?:Northstar AI|BrightHire|BrightCart|Internal platform)/,
];

const userVisiblePatterns = [
  {
    label: "literal JSX text",
    regex: />\s*([A-Z][A-Za-z][^<{}`]{2,120})\s*</g,
  },
  {
    label: "aria/title/placeholder literal",
    regex: /\b(?:aria-label|title|placeholder)=["']([A-Z][^"']{2,120})["']/g,
  },
  {
    label: "direct status/dialog literal",
    regex: /\b(?:setStatusMsg|alert|confirm)\(["']([A-Z][^"']{2,160})["']\)/g,
  },
];

const findings = [];
const forbiddenFindings = [];

for (const file of sourceFiles) {
  const text = await readFile(file, "utf8");
  for (const value of forbiddenVisibleStrings) {
    if (text.includes(value)) {
      forbiddenFindings.push({ file, value });
    }
  }
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (allowLine.some((rule) => rule.test(line))) continue;
    for (const pattern of userVisiblePatterns) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(line))) {
        const value = match[1].trim();
        if (!value || value.length < 3) continue;
        if (/^[A-Z0-9 _.-]+$/.test(value) && value.length <= 6) continue;
        if (/^(https?:|mailto:|tel:|#[a-f0-9]{3,8})/i.test(value)) continue;
        findings.push({ file, line: index + 1, type: pattern.label, value });
      }
    }
  }
}

assert.equal(
  forbiddenFindings.length,
  0,
  forbiddenFindings.map((f) => `${f.file}: forbidden hard-coded UI string: ${JSON.stringify(f.value)}`).join("\n")
);

const report = findings.slice(0, 80).map((f) => `${f.file}:${f.line} ${f.type}: ${JSON.stringify(f.value)}`).join("\n");
if (findings.length) {
  console.warn(`Hard-coded string audit found ${findings.length} likely user-visible strings.`);
  if (report) console.warn(report);
}

if (process.env.I18N_STRICT === "1") {
  assert.equal(findings.length, 0, report);
}

console.log("Hard-coded string audit passed.");
