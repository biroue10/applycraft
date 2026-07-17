// Single source of truth for the ApplyCraft color tokens.
//
// Every surface that paints text — the app palette (`C` in ResumeGenerator), the
// site chrome palette (`SITE_COLORS`), the static-page stylesheet
// (public/_seo.css) and the input placeholder rule (index.html) — resolves its
// colors from here, so a contrast fix lands everywhere at once.
//
// WCAG 2.2 AA: every text token must reach 4.5:1 against every background token
// it can sit on, including the translucent `#ffffff0d` input fill that lightens
// `elevated` to roughly #1F2B40. scripts/contrast-tests.mjs enforces this.
export const COLORS = {
  // Backgrounds, darkest first.
  bg: "#06080F",
  sidebar: "#080D18",
  surface: "#0D1424",
  elevated: "#132036",

  border: "#20324E",
  borderHi: "#344967",

  // Text, most prominent first. `text3` is the muted/placeholder tone: it was
  // #7186A6, which fell to 4.40:1 on `elevated` and 3.83:1 inside inputs.
  text1: "#EEF2FF",
  text2: "#B6C2D6",
  text3: "#8B9EB8",

  accent: "#6366F1",
  accent2: "#818CF8",
  blue: "#3B82F6",

  // Semantic status tier. Promoted here (from the local `C` palette) so every
  // surface — app chrome, InterviewPrep, Job Tracker — resolves one value per
  // meaning instead of hardcoding near-duplicates. Each clears 4.5:1 on every
  // dark background token (bg/surface/elevated); danger #F87171 replaces the
  // Job Tracker's #EF4444, which measured 4.33:1 on `elevated` (failed AA).
  danger: "#F87171",
  success: "#4ADE80",
  warning: "#FBBF24",

  grad: "linear-gradient(135deg,#6366F1 0%,#3B82F6 100%)",

  // Muted ink for the light (paper) surfaces of the resume previews. #9CA3AF,
  // the old value, measured 2.53:1 on white.
  paperMuted: "#6B7280",
};

const channels = (hex) => {
  const h = String(hex).replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

function luminance(hex) {
  const [r, g, b] = channels(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** Flatten a translucent `fg` painted at `alpha` over an opaque `bg`. */
export function compositeOver(fg, alpha, bg) {
  const f = channels(fg);
  const b = channels(bg);
  return "#" + [0, 1, 2].map((i) => Math.round(f[i] * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}

/**
 * Darken `fg` toward black until it clears `min`:1 against `bg`.
 *
 * The preview chips paint the user's chosen accent as text on a 7%-accent tint
 * of the same accent. Several accents (amber, blue, pink) land just under 4.5:1
 * that way, and the accent is picked at runtime, so the readable ink has to be
 * derived rather than hand-paired.
 */
export function readableInk(fg, bg, min = 4.5) {
  if (contrastRatio(fg, bg) >= min) return fg;
  const base = channels(fg);
  // 2.5% steps: darken only as far as the threshold requires, so a template's
  // accent keeps its hue and reads as the same colour.
  for (let step = 1; step <= 32; step++) {
    const factor = 1 - step * 0.025;
    const ink = "#" + base.map((v) => Math.round(v * factor).toString(16).padStart(2, "0")).join("");
    if (contrastRatio(ink, bg) >= min) return ink;
  }
  return "#000000";
}

// Text tokens paired with every background they are allowed to render on.
// Consumed by the contrast guard; keep in sync when a token gains a new surface.
export const TEXT_ON_BACKGROUNDS = {
  text1: ["bg", "sidebar", "surface", "elevated"],
  text2: ["bg", "sidebar", "surface", "elevated"],
  text3: ["bg", "sidebar", "surface", "elevated"],
  accent2: ["bg", "sidebar", "surface", "elevated"],
};

// Inputs paint a translucent white fill over `surface`/`elevated`; placeholder
// text sits on the resulting composite, not on the raw token.
export const INPUT_FILL = { color: "#ffffff", alpha: 13 / 255 };

/** Readable text colour for an accent chip tinted at `alpha` over `surface`. */
export function chipInk(accent, surface, alpha = 0x12 / 255) {
  return readableInk(accent, compositeOver(accent, alpha, surface));
}

// Resume/cover templates paint their accent three ways on white paper: as text,
// as a ~9%-tinted chip carrying accent text, and as a block carrying white text.
// One normalization covers all three. The chip is the binding constraint (its
// background is a lightened accent, so it has the least headroom), and contrast
// is symmetric, so an accent readable on its own chip is also readable on white
// and safe under white text.
//
// 11 of the 32 shipped accents failed as text on white: amber #D97706 (3.19:1),
// emerald #10B981 (2.54:1), orange #F97316 (2.80:1), cyan #06B6D4 (2.43:1), ...
export const PAPER_BG = "#ffffff";
export const ACCENT_CHIP_ALPHA = 0x18 / 255;

export function accentOnPaper(accent, min = 4.5) {
  const base = channels(accent);
  for (let step = 0; step <= 32; step++) {
    const factor = 1 - step * 0.025;
    const ink = "#" + base.map((v) => Math.round(v * factor).toString(16).padStart(2, "0")).join("");
    if (contrastRatio(ink, compositeOver(ink, ACCENT_CHIP_ALPHA, PAPER_BG)) >= min) return ink;
  }
  return "#000000";
}

// Sidebar templates mute white text with `opacity` over an accent-filled block.
// On a vivid accent (white reads only ~5.2:1) any real muting drops below AA,
// while a dark accent has plenty of headroom. Raise the alpha only as far as the
// contrast requires, so dark sidebars keep the muting the designer chose.
export function mutedAlphaOnAccent(accent, desired, min = 4.5) {
  for (let alpha = desired; alpha < 1; alpha += 0.02) {
    if (contrastRatio(compositeOver(PAPER_BG, alpha, accent), accent) >= min) return Math.round(alpha * 100) / 100;
  }
  return 1;
}
