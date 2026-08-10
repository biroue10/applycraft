#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const cases = [
  ["French blog index", "dist/fr/blog/index.html", "Conseils CV et candidature | ApplyCraft"],
  ["Resume templates", "dist/resume/templates.html", "60 ATS-Friendly Resume Templates | ApplyCraft"],
];
const danglingStopWord = /\b(?:and|or|the|a|an|to|for|with|of|et|ou|le|la|les|de|des|du|pour|avec)\s*(?:\|\s*ApplyCraft)?$/i;

for (const [label, relative, expected] of cases) {
  const html = readFileSync(join(ROOT, relative), "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  assert.equal(title, expected, `${label}: unexpected title`);
  assert.ok(title.length <= 60, `${label}: title exceeds the 60-character quality limit (${title.length})`);
  assert.doesNotMatch(title, danglingStopWord, `${label}: title ends on a dangling stop-word`);
}

console.log("Focused SEO title quality tests passed.");
