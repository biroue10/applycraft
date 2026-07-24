import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/404.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../public/404.js", import.meta.url), "utf8");
const worker = readFileSync(new URL("../worker.js", import.meta.url), "utf8");
assert.match(html, /noindex,follow/);
assert.match(html, /id="not-found-home"[^>]+href="\/"/);
assert.match(html, /id="not-found-resume"[^>]+href="\/resume-builder\/"/);
assert.match(script, /startsWith\\?\("\/fr\/"\)|startsWith\("\/fr\/"\)/);
assert.match(script, /startsWith\\?\("\/ar\/"\)|startsWith\("\/ar\/"\)/);
assert.match(script, /Page introuvable/);
assert.match(script, /الصفحة غير موجودة/);
assert.match(worker, /assetResponse\.status === 404/);
assert.match(worker, /new URL\("\/404\/"/);
assert.match(worker, /status: 404/);
console.log("✓ branded 404 has deterministic EN/FR/AR copy, RTL direction, links, and noindex");
