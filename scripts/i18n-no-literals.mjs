#!/usr/bin/env node
// i18n hardcoded-string guard.
//
// Fails when a user-facing English literal is hardcoded in JSX instead of
// coming from the i18n message files. Scans JSX text nodes and the string
// props that reach the screen or a screen reader (placeholder, title,
// aria-label, alt, aria-placeholder, aria-description, aria-valuetext).
//
// Non-translatable tokens (brand names, file formats, acronyms, symbols) are
// whitelisted explicitly below — never disable this ad hoc inline.
//
// Usage:
//   node scripts/i18n-no-literals.mjs           # scan, exit 1 on violations
//   node scripts/i18n-no-literals.mjs --list    # print every finding grouped
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

const traverse = _traverse.default || _traverse;
const ROOT = process.cwd();
const SRC = join(ROOT, "src");

// Files/dirs excluded: the message files themselves, and non-UI data/render
// modules where the "strings" are document content, not chrome.
const EXCLUDE_DIRS = [join(SRC, "i18n")];
const EXCLUDE_FILES = new Set([
  join(SRC, "documents", "DocumentPapers.jsx"), // PDF/DOCX/preview renderer — content, driven by localized data
]);

// Tokens that are legitimately not translated. Matched case-sensitively as the
// FULL trimmed literal (after stripping surrounding punctuation/whitespace).
const ALLOW_EXACT = new Set([
  "ApplyCraft", "Biroue Digital Ltd", "applycraft.io",
  "PDF", "DOCX", "ATS", "AI", "URL", "JSON", "PDF/DOCX", "HTML", "CSS", "RTL", "LTR",
  "EN", "FR", "AR", "ES", "DE", "en", "fr", "ar",
  "LinkedIn", "GitHub", "Google", "Cloudflare", "Anthropic", "Claude", "Lemon Squeezy",
  "×", "✓", "✔", "→", "←", "↑", "↓", "•", "·", "—", "–", "…", "+", "-", "/", "|", "@",
  "★", "☆", "%", "&", "#", "©", "®", "™", ":", ";", ",", ".", "?", "!",
  "A4", "US Letter", "px", "PWA",
  "KB", "MB", "GB", // data-size units, used as "{n} KB"
  "BD", // Biroue Digital brand initials (avatar monogram)
]);

// Illustrative EXAMPLE-DATA placeholders (the kind of value a user types in,
// not instructions). These stay in one language on purpose — localizing a fake
// company or sample name adds no value. Kept explicit and visible here rather
// than translated. Matched as the FULL trimmed literal.
const SAMPLE_PLACEHOLDERS = new Set([
  "https://…", "you@email.com", "you@example.com", "Jane Doe", "Jane Smith",
  "AWS Solutions Architect", "Amazon Web Services", "March 2024",
  "Portfolio website", "React, Node.js, PostgreSQL", "github.com/...",
  "Spanish", "Employee of the Year", "Red Cross", "Event Coordinator", "Jan 2022",
]);

// Landing-page demo components that render illustrative sample résumé CONTENT
// (fake names, bullet points, education). Their strings are sample data, not
// app chrome, so they are out of scope for interface translation.
const SKIP_COMPONENTS = new Set(["HeroResumePreview", "DemoEditor", "ResumeLivePreview"]);

// Literals matching these patterns are ignored (not human sentences).
const IGNORE_PATTERNS = [
  /^[\s\p{P}\p{S}]*$/u,            // whitespace / punctuation / symbols only
  /^[0-9\s.,:%+\-/()]+$/,          // numbers & numeric punctuation
  /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u, // emoji only
  /^#[0-9a-fA-F]{3,8}$/,           // hex colors
  /^\{[^}]*\}$/,                   // pure interpolation placeholder
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, // kebab tokens / ids (no spaces, lowercase)
  /^[a-z]+([A-Z][a-z]*)+$/,        // camelCase identifiers
];

// A literal must contain at least two consecutive ASCII letters to count as
// "English words" worth flagging.
const HAS_WORD = /[A-Za-z]{2,}/;

const files = [];
(function walk(dir) {
  if (EXCLUDE_DIRS.some((d) => dir === d || dir.startsWith(d + "/"))) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(jsx|js)$/.test(name) && !EXCLUDE_FILES.has(p)) files.push(p);
  }
})(SRC);

const STRING_PROPS = new Set([
  "placeholder", "title", "alt",
  "aria-label", "aria-placeholder", "aria-description", "aria-valuetext", "aria-roledescription",
]);

function isIgnorable(raw) {
  const text = raw.trim();
  if (!text) return true;
  if (!HAS_WORD.test(text)) return true;
  if (ALLOW_EXACT.has(text)) return true;
  if (SAMPLE_PLACEHOLDERS.has(text)) return true;
  if (IGNORE_PATTERNS.some((re) => re.test(text))) return true;
  // Allow-list also covers a literal that is only allow-listed tokens + punctuation.
  const stripped = text.replace(/[\p{P}\p{S}\s]+/gu, " ").trim();
  if (stripped && stripped.split(/\s+/).every((w) => ALLOW_EXACT.has(w))) return true;
  return false;
}

// Name of the nearest enclosing React component (function declaration, or a
// function/arrow assigned to a Capitalized const), used to skip demo components.
function enclosingComponent(path) {
  let fn = path.getFunctionParent();
  while (fn) {
    const n = fn.node;
    if (n.type === "FunctionDeclaration" && n.id) return n.id.name;
    if ((n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression")
        && fn.parentPath && fn.parentPath.node.type === "VariableDeclarator"
        && fn.parentPath.node.id.type === "Identifier") {
      return fn.parentPath.node.id.name;
    }
    fn = fn.getFunctionParent();
  }
  return null;
}

const findings = [];

const PRODUCT_COPY_PATTERNS = [
  { re: /\b22 templates\b/i, reason: "stale resume template count" },
  { re: /\b22 modèles\b/i, reason: "stale French resume template count" },
  { re: /\b22 قالب/u, reason: "stale Arabic resume template count" },
  { re: /\b46 templates\b/i, reason: "hardcoded resume template count; use PRODUCT.resumeTemplateCount" },
  { re: /\b46 modèles\b/i, reason: "hardcoded French resume template count; use PRODUCT.resumeTemplateCount" },
  { re: /\b46 قالب/u, reason: "hardcoded Arabic resume template count; use PRODUCT.resumeTemplateCount" },
  { re: /50\+\s*languages/i, reason: "stale broad language claim" },
  { re: /99\s+languages/i, reason: "stale broad language claim" },
  { re: /\ball languages\b/i, reason: "overbroad language claim" },
  { re: /83%\s+of\s+hiring\s+managers/i, reason: "unsupported cover-letter statistic" },
  { re: /\bunder 5 minutes\b/i, reason: "overly precise time promise" },
  { re: /\bless than 5 minutes\b/i, reason: "overly precise time promise" },
  { re: /\ben moins de 5 minutes\b/i, reason: "overly precise time promise" },
  { re: /في أقل من 5 دقائق/u, reason: "overly precise time promise" },
];

const PRODUCT_COPY_FILES = files.concat(
  (function collect(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) out.push(...collect(p));
      else if (/\.(html|mjs|js|jsx)$/.test(name)) out.push(p);
    }
    return out;
  })(join(ROOT, "public")),
  (function collect(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) out.push(...collect(p));
      else if (/\.(mjs|js)$/.test(name)) out.push(p);
    }
    return out;
  })(join(ROOT, "scripts")),
);

for (const file of [...new Set(PRODUCT_COPY_FILES)]) {
  if (file.endsWith("i18n-no-literals.mjs")) continue;
  if (/-tests\.mjs$/.test(file) || file.endsWith("seo-audit.sh")) continue;
  const code = readFileSync(file, "utf8");
  for (const { re, reason } of PRODUCT_COPY_PATTERNS) {
    const match = code.match(re);
    if (match) {
      const line = code.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ file, line, kind: "product-copy", text: `${match[0]} (${reason})` });
    }
  }
  if (file.endsWith(join("public", "cover-letter-builder", "index.html")) && /Build My Resume Free/i.test(code)) {
    const index = code.search(/Build My Resume Free/i);
    const line = code.slice(0, index).split(/\r?\n/).length;
    findings.push({ file, line, kind: "product-copy", text: "Build My Resume Free (cover-letter page CTA must mention cover letters)" });
  }
}

const ATS_RESULT_LITERAL_PATTERNS = [
  { re: /Needs work/i, reason: "ATS score tier must come from ats.scoreBands" },
  { re: /Several fixable issues/i, reason: "ATS score summary must come from ats.scoreBands" },
  { re: /Action required/i, reason: "ATS score tier must come from ats.scoreBands" },
  { re: /Critical issues/i, reason: "ATS score tier must come from ats.scoreBands" },
  { re: /Low keyword match/i, reason: "ATS issue title must come from ats.issueText" },
  { re: /Only .*meaningful keywords/i, reason: "ATS issue detail must come from ats.issueText" },
  { re: /Education section not detected/i, reason: "ATS issue title must come from ats.issueText" },
  { re: /Some ATS systems require at least one education entry/i, reason: "ATS issue detail must come from ats.issueText" },
];

const atsRendererFile = join(SRC, "ResumeGenerator.jsx");
if (files.includes(atsRendererFile)) {
  const code = readFileSync(atsRendererFile, "utf8");
  const guardedBlocks = [
    ["const scoreRawResume", "  // Form completion tracker"],
    ["const band = result ? scoreBand", "          {/* Fix CTA */}"],
  ];
  for (const [startNeedle, endNeedle] of guardedBlocks) {
    const start = code.indexOf(startNeedle);
    const end = start >= 0 ? code.indexOf(endNeedle, start) : -1;
    if (start < 0 || end < 0) continue;
    const block = code.slice(start, end);
    for (const { re, reason } of ATS_RESULT_LITERAL_PATTERNS) {
      const match = block.match(re);
      if (match) {
        const line = code.slice(0, start + match.index).split(/\r?\n/).length;
        findings.push({ file: atsRendererFile, line, kind: "ats-result-copy", text: `${match[0]} (${reason})` });
      }
    }
  }
}

// ── Locale-aware letter defaults ────────────────────────────────────────────
// The cover-letter date and default sign-off must derive from the document
// language via src/i18n/letterDefaults.js — never a hardcoded en-US date format
// or an English "Sincerely" fallback, which would ship English defaults inside a
// French or Arabic letter (the same class of leak as the ATS strings above, which
// live in JS config outside the JSX-literal scan).
const LETTER_DEFAULTS_SOURCE = join(SRC, "i18n", "letterDefaults.js");
const LOCALE_DEFAULT_PATTERNS = [
  { re: /toLocaleDateString\(\s*["']en-US["']/, reason: "hardcoded en-US letter date; use formatLetterDate(date, docLang)" },
  { re: /Intl\.DateTimeFormat\(\s*["']en-US["']/, reason: "hardcoded en-US letter date; use formatLetterDate(date, docLang)" },
  { re: /(?:\|\||\?\?)\s*["']Sincerely["']/, reason: "English sign-off fallback; use defaultCoverSignoff(docLang)" },
];
// Scan the letter renderers (builder + document papers), excluding the single
// source of truth where "en-US"/"Sincerely" legitimately live.
const LETTER_DEFAULT_SCAN_FILES = [...new Set([...files, join(SRC, "documents", "DocumentPapers.jsx")])]
  .filter((f) => f !== LETTER_DEFAULTS_SOURCE);
for (const file of LETTER_DEFAULT_SCAN_FILES) {
  const code = readFileSync(file, "utf8");
  for (const { re, reason } of LOCALE_DEFAULT_PATTERNS) {
    const match = code.match(re);
    if (match) {
      const line = code.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ file, line, kind: "locale-default", text: `${match[0]} (${reason})` });
    }
  }
}
// The cover-form default initializer must build its date/sign-off from the
// helpers — catch a bare English "Sincerely" or any inline date formatting that
// would bypass the document locale (the global patterns above miss a `signoff:
// "Sincerely"` with no ||/?? and a locale-less toLocaleDateString()).
if (files.includes(atsRendererFile)) {
  const code = readFileSync(atsRendererFile, "utf8");
  const start = code.indexOf("const [coverForm, setCoverForm] = useState(() => {");
  const end = start >= 0 ? code.indexOf("\n  });", start) : -1;
  if (start >= 0 && end >= 0) {
    const block = code.slice(start, end);
    const startLine = code.slice(0, start).split(/\r?\n/).length;
    if (/["']Sincerely["']/.test(block)) {
      findings.push({ file: atsRendererFile, line: startLine, kind: "locale-default", text: 'coverForm default sign-off must use defaultCoverSignoff(docLang), not "Sincerely"' });
    }
    if (/toLocaleDateString\(|Intl\.DateTimeFormat\(/.test(block)) {
      findings.push({ file: atsRendererFile, line: startLine, kind: "locale-default", text: "coverForm default date must use formatLetterDate(new Date(), docLang)" });
    }
  }
}

for (const file of files) {
  const code = readFileSync(file, "utf8");
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "importAssertions", "topLevelAwait"],
    });
  } catch (e) {
    console.error(`Parse error in ${relative(ROOT, file)}: ${e.message}`);
    process.exitCode = 1;
    continue;
  }

  traverse(ast, {
    JSXText(path) {
      const raw = path.node.value;
      if (isIgnorable(raw)) return;
      if (SKIP_COMPONENTS.has(enclosingComponent(path))) return;
      findings.push({ file, line: path.node.loc.start.line, kind: "jsx-text", text: raw.trim() });
    },
    JSXAttribute(path) {
      const name = path.node.name && path.node.name.name;
      if (!STRING_PROPS.has(name)) return;
      const v = path.node.value;
      if (!v) return;
      let text = null;
      if (v.type === "StringLiteral") text = v.value;
      else if (v.type === "JSXExpressionContainer" && v.expression.type === "StringLiteral") text = v.expression.value;
      if (text == null || isIgnorable(text)) return;
      if (SKIP_COMPONENTS.has(enclosingComponent(path))) return;
      findings.push({ file, line: path.node.loc.start.line, kind: `prop:${name}`, text });
    },
    // Rendered string literals inside JSX expression containers:
    //   {"literal"}, {cond ? "a" : "b"}, {cond && "a"}
    // (only when the container is a child of a JSX element/fragment, i.e. shown on screen).
    JSXExpressionContainer(path) {
      const parentType = path.parent && path.parent.type;
      if (parentType !== "JSXElement" && parentType !== "JSXFragment") return;
      const literals = [];
      const collect = (node) => {
        if (!node) return;
        if (node.type === "StringLiteral") literals.push(node);
        else if (node.type === "ConditionalExpression") { collect(node.consequent); collect(node.alternate); }
        else if (node.type === "LogicalExpression") {
          collect(node.left);
          // `translationLookup || "fallback"` / `?? "fallback"` is a legitimate
          // defensive default, not a hardcoded UI string — don't flag a terminal
          // string on the right of ||/??. Still recurse into non-string RHS.
          const isFallback = (node.operator === "||" || node.operator === "??");
          if (!(isFallback && node.right.type === "StringLiteral")) collect(node.right);
        }
      };
      collect(path.node.expression);
      if (literals.length && SKIP_COMPONENTS.has(enclosingComponent(path))) return;
      for (const lit of literals) {
        if (isIgnorable(lit.value)) continue;
        findings.push({ file, line: (lit.loc || path.node.loc).start.line, kind: "jsx-expr", text: lit.value });
      }
    },
  });
}

const listMode = process.argv.includes("--list");

if (listMode) {
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  for (const [file, items] of byFile) {
    console.log(`\n${relative(ROOT, file)}  (${items.length})`);
    for (const it of items.sort((a, b) => a.line - b.line)) {
      console.log(`  ${String(it.line).padStart(5)}  [${it.kind}]  ${JSON.stringify(it.text)}`);
    }
  }
  console.log(`\nTotal: ${findings.length} hardcoded user-facing literal(s) in ${byFile.size} file(s).`);
} else {
  if (findings.length) {
    console.error(`\n✖ i18n guard: ${findings.length} hardcoded user-facing string(s) found.`);
    console.error(`  Move them into src/i18n/namespaces/{en,fr,ar}/*.js, or add a genuine`);
    console.error(`  non-translatable token to ALLOW_EXACT in scripts/i18n-no-literals.mjs.\n`);
    for (const f of findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
      console.error(`  ${relative(ROOT, f.file)}:${f.line}  [${f.kind}]  ${JSON.stringify(f.text)}`);
    }
    process.exit(1);
  }
  console.log("✓ i18n guard: no hardcoded user-facing strings.");
}
