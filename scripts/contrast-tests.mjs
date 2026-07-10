#!/usr/bin/env node
/**
 * WCAG 2.2 AA contrast guard for the design tokens.
 *
 * Lighthouse/axe only measure the elements that happen to be on the page it
 * audited. This checks the tokens themselves, so a muted-text colour can never
 * ship below 4.5:1 on any background it is allowed to sit on — including the
 * translucent white fill that inputs paint over `elevated`, where placeholder
 * text lives (that pair used to measure 1.56:1).
 *
 * It also pins the CSS copies of the muted token (index.html, public/_seo.css)
 * to the JS source in src/theme/colors.js so the three cannot drift apart.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COLORS, TEXT_ON_BACKGROUNDS, INPUT_FILL, readableInk } from "../src/theme/colors.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AA_NORMAL = 4.5;

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex) {
  const [r, g, b] = channels(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function composite(fg, alpha, bg) {
  const f = channels(fg);
  const b = channels(bg);
  return "#" + [0, 1, 2].map((i) => Math.round(f[i] * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}

const failures = [];
const checked = [];

function assertContrast(fgName, fg, bgName, bg) {
  const r = ratio(fg, bg);
  checked.push({ pair: `${fgName} on ${bgName}`, r });
  if (r < AA_NORMAL) {
    failures.push(`${fgName} (${fg}) on ${bgName} (${bg}): ${r.toFixed(2)}:1 — needs ${AA_NORMAL}:1`);
  }
}

for (const [fgName, backgrounds] of Object.entries(TEXT_ON_BACKGROUNDS)) {
  for (const bgName of backgrounds) {
    assertContrast(fgName, COLORS[fgName], bgName, COLORS[bgName]);
  }
}

// Placeholder / muted text inside inputs, which fill with translucent white.
for (const bgName of ["surface", "elevated"]) {
  const filled = composite(INPUT_FILL.color, INPUT_FILL.alpha, COLORS[bgName]);
  assertContrast("text3 (placeholder)", COLORS.text3, `input fill over ${bgName}`, filled);
}

// Light (paper) surfaces of the resume previews.
assertContrast("paperMuted", COLORS.paperMuted, "paper white", "#FFFFFF");

// Preview skill chips paint the accent as text on a 7% tint of the same accent
// over the template sidebar. readableInk() must rescue every accent we ship.
const CHIP_ACCENTS = ["#2563eb", "#0f766e", "#7c3aed", "#d97706", "#db2777", "#111827"];
const CHIP_SURFACES = ["#f5f8fc", "#eff6ff", "#ffffff"];
for (const accent of CHIP_ACCENTS) {
  for (const surface of CHIP_SURFACES) {
    const chipBg = composite(accent, 0x12 / 255, surface);
    assertContrast(`chip ink for ${accent}`, readableInk(accent, chipBg), `chip tint on ${surface}`, chipBg);
  }
}

// The CSS copies of the muted token must match the JS source.
const cssSources = [
  { file: "index.html", re: /--color-text-muted:\s*(#[0-9A-Fa-f]{6})/ },
  { file: "public/_seo.css", re: /--color-text-muted:\s*(#[0-9A-Fa-f]{6})/ },
];
for (const { file, re } of cssSources) {
  const match = readFileSync(join(ROOT, file), "utf8").match(re);
  if (!match) failures.push(`${file}: --color-text-muted is not defined`);
  else if (match[1].toUpperCase() !== COLORS.text3.toUpperCase()) {
    failures.push(`${file}: --color-text-muted is ${match[1]}, expected ${COLORS.text3} (src/theme/colors.js)`);
  }
}

// These files must not re-hardcode a grey that failed. (DocumentPapers keeps
// #9CA3AF for a dark-sidebar template and an aria-hidden separator, where it
// passes; those are document rendering, not chrome.)
const legacy = ["#7186A6", "#2D4060", "#9CA3AF"];
for (const file of ["index.html", "public/_seo.css", "src/siteChrome.jsx", "src/ResumeGenerator.jsx"]) {
  const code = readFileSync(join(ROOT, file), "utf8");
  for (const hex of legacy) {
    if (code.toUpperCase().includes(hex)) failures.push(`${file}: reintroduces the failing colour ${hex}`);
  }
}

if (failures.length) {
  console.error("✗ contrast guard: WCAG AA failures\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

for (const { pair, r } of checked) console.log(`  ok  ${pair.padEnd(34)} ${r.toFixed(2)}:1`);
console.log(`\n✓ contrast guard: ${checked.length} token pairs meet WCAG AA (${AA_NORMAL}:1).`);
