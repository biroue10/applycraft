import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const app = readFileSync(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");
assert.match(app, /id="field-email" type="email" autoComplete="email"/);
assert.match(app, /aria-invalid=\{emailError \? "true" : undefined\}/);
assert.match(app, /aria-describedby=\{emailError \? "field-email-error" : undefined\}/);
assert.match(app, /id="field-email-error" role="alert"/);
assert.match(app, /scrollToError\(firstErr\[1\]\)/);
console.log("✓ form validation exposes semantic types, ARIA relationships, alerts, and first-error focus");
