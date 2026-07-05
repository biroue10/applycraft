import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
const common = await readFile(new URL("../src/i18n/namespaces/en/common.js", import.meta.url), "utf8");
const cover = await readFile(new URL("../src/i18n/namespaces/en/cover.js", import.meta.url), "utf8");

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `missing marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker after: ${start}`);
  return source.slice(startIndex, endIndex);
}

const exportBodies = {
  resumePdf: between(app, "async function downloadPDF()", "async function downloadDOCX()"),
  resumeDocx: between(app, "async function downloadDOCX()", "const getTemplateMeta"),
  coverPdf: between(app, "async function downloadCoverPDF()", "async function downloadCoverDOCX()"),
  coverDocx: between(app, "async function downloadCoverDOCX()", "const getCoverTemplateMeta"),
};

const forbiddenExportGates = [
  "currentUser",
  "setAuthModal",
  "authModal",
  "setAuthModalTab",
  "setUpsell",
  "startCheckout",
  "hasPass",
  "subModalOpen",
  "ACCOUNTS_ENABLED",
  "PAYMENTS_ENABLED",
  "ACTIVE_SEARCH_PASS",
];

for (const [name, body] of Object.entries(exportBodies)) {
  for (const forbidden of forbiddenExportGates) {
    assert.doesNotMatch(
      body,
      new RegExp(`\\b${forbidden}\\b`),
      `${name} must not require account, payment, pass, or upsell gates`,
    );
  }
}

assert.match(common, /"dlPdf": "Download PDF"/, "PDF export label should remain a direct download action");
assert.match(common, /"dlDocx": "Download DOCX"/, "DOCX export label should remain a direct download action");
assert.match(cover, /PDF or DOCX/, "cover-letter copy should mention both free export formats");
assert.doesNotMatch(cover, /unlock cover letter export/i, "cover-letter copy must not imply a locked export");

assert.match(app, /onClick=\{\(\) => \{ setActiveToolbarPanel\(null\); downloadCoverPDF\(\); \}\}/, "cover letter PDF export button should call the export directly");
assert.match(app, /onClick=\{\(\) => \{ setActiveToolbarPanel\(null\); downloadCoverDOCX\(\); \}\}/, "cover letter DOCX export button should call the export directly");
assert.match(exportBodies.coverDocx, /document_type: "cover"/, "cover DOCX analytics should stay document-type only");
assert.match(exportBodies.coverDocx, /ExternalHyperlink/, "cover DOCX export should preserve supported hyperlinks");

const forbiddenCopy = [
  /Sign up to download/i,
  /Create an account to export/i,
  /Log in to download/i,
  /Account required to export/i,
  /Create an account to download/i,
  /Subscribe to download/i,
];
for (const pattern of forbiddenCopy) {
  assert.doesNotMatch(app, pattern, `forbidden export-gating copy found: ${pattern}`);
  assert.doesNotMatch(common, pattern, `forbidden export-gating copy found: ${pattern}`);
  assert.doesNotMatch(cover, pattern, `forbidden export-gating copy found: ${pattern}`);
}

console.log("Free export tests passed.");
