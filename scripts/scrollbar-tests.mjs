import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(join(ROOT, "public/scrollbars.css"), "utf8");
const shell = readFileSync(join(ROOT, "index.html"), "utf8");
const staticCss = readFileSync(join(ROOT, "public/_seo.css"), "utf8");
const failures = [];

const requireRule = (pattern, message) => {
  if (!pattern.test(css)) failures.push(message);
};

requireRule(/html\s*\{[^}]*scrollbar-gutter\s*:\s*auto/i, "the page must not reserve a scrollbar gutter");
requireRule(/\*\s*\{[^}]*-ms-overflow-style\s*:\s*none[^}]*scrollbar-width\s*:\s*none/i, "Firefox and legacy Microsoft scrollbars must be hidden globally");
requireRule(/\*::\-webkit-scrollbar\s*\{[^}]*display\s*:\s*none[^}]*width\s*:\s*0[^}]*height\s*:\s*0/i, "Chromium, Safari, and Edge scrollbars must be hidden globally");

if (!staticCss.includes("@import url('/scrollbars.css')")) failures.push("static pages do not import the global scrollbar stylesheet");
if (!/html\s*\{\s*scrollbar-gutter\s*:\s*auto\s*;\s*\}/i.test(shell)
  || !/\*::\-webkit-scrollbar\s*\{[^}]*display\s*:\s*none/i.test(shell)) {
  failures.push("the React shell must inline the critical global scrollbar rules");
}

if (failures.length) {
  console.error("Scrollbar tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Scrollbar tests passed (all native scrollbars are globally invisible while scrolling remains enabled).");
