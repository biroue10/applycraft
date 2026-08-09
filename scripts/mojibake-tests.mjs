import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const ROOTS = ["scripts", "public", "src"];
const EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".html"]);

// Known UTF-8 mojibake signatures.
// Written with Unicode escapes so this test does not contain the bad
// sequences it is designed to detect.
const MOJIBAKE =
  /(?:\u251c|\u00d4\u00c7|\u00d4\u00e9|\u00d4\u00e5|\u252c(?:\u00bd|\u00bb|\u00ab|\u00b7)|\u00c3[\u0080-\u00ff]|\u00c2[\u0080-\u00ff]|\u00e2(?:\u20ac|\u2020|\u0153)|\u00f0\u0178|[\u00d8\u00d9][\u0080-\u00ff\u2010-\u203f]|\ufffd)/u;

function collectFiles(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(path, output);
    } else if (EXTENSIONS.has(extname(entry.name))) {
      output.push(path);
    }
  }

  return output;
}

const failures = [];

for (const root of ROOTS) {
  for (const path of collectFiles(root)) {
    const text = readFileSync(path, "utf8");

    text.split(/\r?\n/).forEach((line, index) => {
      if (MOJIBAKE.test(line)) {
        failures.push(`${path}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (failures.length) {
  console.error("Mojibake/encoding corruption detected:");
  for (const failure of failures.slice(0, 100)) {
    console.error(`- ${failure}`);
  }

  if (failures.length > 100) {
    console.error(`... ${failures.length - 100} additional occurrence(s)`);
  }

  process.exit(1);
}

console.log("✓ Encoding guard: no known mojibake sequences found.");
