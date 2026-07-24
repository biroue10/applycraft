import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const app = readFileSync(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
for (const token of ["field-summary-guidance", "summaryCounter", "summaryGuidance", "summaryTooLong"]) assert.ok(app.includes(token));
assert.match(app, /Array\.from\(form\.summary\)\.length/);
assert.doesNotMatch(app, /id="field-summary"[^>]+maxLength=/);
console.log("✓ summary guidance uses Unicode-aware soft thresholds and an associated counter");
