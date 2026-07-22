import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CSS_FILE = join(ROOT, "public/scrollbars.css");
const css = readFileSync(CSS_FILE, "utf8");
const failures = [];
const fail = (message) => failures.push(message);

const requiredTokens = [
  "--scrollbar-size", "--scrollbar-track", "--scrollbar-thumb",
  "--scrollbar-thumb-hover", "--scrollbar-thumb-active", "--scrollbar-thumb-border",
];
for (const token of requiredTokens) if (!css.includes(`${token}:`)) fail(`missing shared token ${token}`);

function luminance(hex) {
  const channels = hex.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
const shell = readFileSync(join(ROOT, "index.html"), "utf8");
const color = (token) => shell.match(new RegExp(`${token}:\\s*(#[\\da-f]{6})`, "i"))?.[1];
const track = color("--color-bg-page");
for (const token of ["--color-accent-primary", "--color-accent-secondary", "--color-text-secondary"]) {
  const value = color(token);
  if (!track || !value) fail(`could not resolve contrast tokens for ${token}`);
  else {
    const ratio = (Math.max(luminance(track), luminance(value)) + 0.05) / (Math.min(luminance(track), luminance(value)) + 0.05);
    if (ratio < 3) fail(`${token} scrollbar state has only ${ratio.toFixed(2)}:1 contrast against the track`);
  }
}

const requiredRules = [
  /html\s*\{[^}]*scrollbar-gutter\s*:\s*stable/i,
  /\*\s*\{[^}]*scrollbar-width\s*:\s*thin[^}]*scrollbar-color\s*:/i,
  /\*::\-webkit-scrollbar\s*\{[^}]*width\s*:\s*var\(--scrollbar-size\)[^}]*height\s*:\s*var\(--scrollbar-size\)/i,
  /\*::\-webkit-scrollbar-track\s*\{[^}]*var\(--scrollbar-track\)/i,
  /\*::\-webkit-scrollbar-thumb\s*\{[^}]*var\(--scrollbar-thumb\)[^}]*border-radius/i,
  /\*::\-webkit-scrollbar-thumb:hover\s*\{[^}]*var\(--scrollbar-thumb-hover\)/i,
  /\*::\-webkit-scrollbar-thumb:active\s*\{[^}]*var\(--scrollbar-thumb-active\)/i,
  /\*::\-webkit-scrollbar-corner\s*\{[^}]*var\(--scrollbar-track\)/i,
];
requiredRules.forEach((rule, index) => { if (!rule.test(css)) fail(`missing shared scrollbar rule ${index + 1}`); });

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (["node_modules", "dist", ".git", ".audit", "website-audit-20260712-135837"].includes(name)) return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = walk(ROOT).filter((file) => /\.(?:css|jsx?|tsx?|html)$/.test(file));
for (const file of sources) {
  const text = readFileSync(file, "utf8");
  const name = relative(ROOT, file);
  if (file !== CSS_FILE && /::\-webkit-scrollbar(?:-track|-thumb|-corner)?\b/.test(text)) fail(`${name} duplicates the global WebKit scrollbar implementation`);
  if (/scrollbar-width\s*:\s*none|::\-webkit-scrollbar\s*\{[^}]*display\s*:\s*none|::\-webkit-scrollbar\s*\{[^}]*width\s*:\s*0/i.test(text)) fail(`${name} hides an essential scrollbar`);
  if (/::\-webkit-scrollbar(?:-track|-thumb)?\s*\{[^}]*(?:#fff(?:fff)?\b|white\b)/i.test(text)) fail(`${name} contains a light/white scrollbar override`);
}

const webkitImplementations = (css.match(/\*::\-webkit-scrollbar\s*\{/g) || []).length;
if (webkitImplementations !== 1) fail(`expected one global WebKit scrollbar root rule, found ${webkitImplementations}`);
if (!readFileSync(join(ROOT, "public/_seo.css"), "utf8").includes("@import url('/scrollbars.css')")) fail("static-page stylesheet does not import the shared scrollbar CSS");
if (!readFileSync(join(ROOT, "index.html"), "utf8").includes('href="/scrollbars.css"')) fail("React shell does not link the shared scrollbar CSS");

if (failures.length) {
  console.error("Scrollbar tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Scrollbar tests passed (${sources.length} source files checked; one visible token-based implementation).`);
