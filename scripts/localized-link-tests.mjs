import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { LOCALIZED_ROUTES, normalizeRoutePath } from "../src/seo/localizedRoutes.js";
import { LOCALE_LINK_WHITELIST } from "./locale-link-policy.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC_DIR = join(ROOT, "public");
const SRC_DIR = join(ROOT, "src");
const SCRIPTS_DIR = join(ROOT, "scripts");

const STATIC_APP_ROUTES = new Set([
  "/",
  "/fr/",
  "/ar/",
  "/resume-builder/",
  "/resume/templates/",
  "/cover-letter/templates/",
  "/ats-checker/",
  "/ats-checker-fr/",
  "/ats-checker-ar/",
  "/pricing/",
  "/fr/pricing/",
  "/blog/",
  "/fr/blog/",
  "/help/",
  "/examples/",
  "/ats-resume-builder/",
  "/cover-letter-builder/",
  "/free-resume-builder/",
  "/fr/creer-cv-gratuit/",
  "/ar/free-resume-builder/",
  "/student-resume-builder/",
  "/fr/creer-cv-etudiant/",
  "/canadian-resume-builder/",
  "/resume-in-french/",
  "/resume-in-arabic/",
  "/terms/",
  "/fr/terms/",
  "/privacy/",
  "/fr/privacy/",
  "/cookies/",
  "/fr/cookies/",
  "/gdpr/",
  "/fr/gdpr/",
  "/refund-policy/",
  "/fr/refund-policy/",
  "/ai-disclosure/",
  "/fr/ai-disclosure/",
  "/accessibility/",
  "/about/",
  "/contact/",
  "/changelog/",
  "/roadmap/",
  "/status/",
]);

const ASSET_EXTENSIONS = new Set([
  ".css", ".js", ".mjs", ".json", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico",
  ".xml", ".txt", ".webmanifest", ".pdf", ".docx", ".woff", ".woff2",
]);

const OLD_CLAIM_PATTERNS = [
  /99 Document Languages/i,
  /99 document languages/i,
  /99 languages/i,
  /50\+ languages/i,
  /22 templates/i,
  /5 interface languages/i,
  /Translate instantly/i,
  /landed interviews/i,
  /thousands of job seekers/i,
  /6 Professional Templates/i,
  /6 professional templates/i,
  /\b46 templates\b/i,
  /\b46 modèles\b/i,
  /\b46 قالب/u,
  /83%\s+of\s+hiring\s+managers/i,
  /\bunder 5 minutes\b/i,
  /\bless than 5 minutes\b/i,
  /\ben moins de 5 minutes\b/i,
  /في أقل من 5 دقائق/u,
];

const FRENCH_VISIBLE_ENGLISH_PATTERNS = [
  /\bBuild My Resume\b/i,
  /\bOpen Resume Builder\b/i,
  /\bUse This Template\b/i,
  /\bStart Building\b/i,
  /\bHelp Center\b/i,
  /\bPrivacy Policy\b/i,
  /\bTerms of Service\b/i,
];

const failures = [];

function walk(dir, predicate = () => true) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlLang(file, html) {
  const lang = html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  if (lang) return lang.split("-")[0];
  const path = `/${relative(PUBLIC_DIR, file).replace(/\\/g, "/")}`;
  if (path.startsWith("/fr/")) return "fr";
  if (path.startsWith("/ar/")) return "ar";
  return "en";
}

function publicRouteExists(pathname) {
  if (STATIC_APP_ROUTES.has(pathname)) return true;
  if (pathname === "/") return existsSync(join(PUBLIC_DIR, "index.html"));
  const withoutSlash = pathname.endsWith("/") ? pathname.slice(1, -1) : pathname.slice(1);
  return existsSync(join(PUBLIC_DIR, withoutSlash, "index.html")) || existsSync(join(PUBLIC_DIR, `${withoutSlash}.html`));
}

function cleanInternalHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("https://applycraft.io/")) return "";
  const local = href.replace(/^https:\/\/applycraft\.io/i, "");
  if (!local.startsWith("/")) return "";
  return local.split("#")[0].split("?")[0] || "/";
}

function hrefLocale(href) {
  const local = href.replace(/^https:\/\/applycraft\.io/i, "");
  const [pathname, query = ""] = local.split("#")[0].split("?");
  const params = new URLSearchParams(query);
  const ui = params.get("ui") || params.get("docLang");
  if (ui === "fr" || ui === "ar") return ui;
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
  if (pathname === "/ats-checker-fr/") return "fr";
  if (pathname === "/ats-checker-ar/") return "ar";
  return "en";
}

function isEditorActionHref(href) {
  return href.startsWith("/resume-builder/?") || href.startsWith("https://applycraft.io/resume-builder/?");
}

function isLanguageSwitchAnchor(text, href) {
  const combined = `${text} ${href}`;
  return /English|Anglais|Français|French|العربية|Arabic|Arabe|الفرنسية|الإنجليزية/i.test(combined);
}

function checkLocalizedHref(file, lang, href, text) {
  if (lang !== "fr" && lang !== "ar") return;
  if (isEditorActionHref(href)) return;
  const clean = cleanInternalHref(href);
  if (!clean || isLanguageSwitchAnchor(text, href)) return;
  const path = normalizeRoutePath(clean);
  if (hrefLocale(href) === lang) return;
  if (LOCALE_LINK_WHITELIST[lang]?.[path]) return;

  for (const [canonical, routes] of Object.entries(LOCALIZED_ROUTES)) {
    const english = normalizeRoutePath(routes.en || canonical);
    const localized = routes[lang] ? normalizeRoutePath(routes[lang]) : "";
    if (!localized || localized === english) continue;
    if (path === english) {
      failures.push(`${rel(file)} links to English route ${path} instead of ${localized}`);
    }
  }
}

function checkBrokenHref(file, href) {
  const clean = cleanInternalHref(href);
  if (!clean) return;
  if (ASSET_EXTENSIONS.has(extname(clean.split("#")[0].split("?")[0]))) return;
  const path = normalizeRoutePath(clean);
  if (!publicRouteExists(path)) {
    failures.push(`${rel(file)} has broken internal link ${href}`);
  }
}

function checkHtmlFile(file) {
  const html = readFileSync(file, "utf8");
  const lang = htmlLang(file, html);
  const visible = stripTags(html);

  for (const pattern of OLD_CLAIM_PATTERNS) {
    if (pattern.test(html)) failures.push(`${rel(file)} contains stale product claim: ${pattern}`);
  }

  for (const line of html.split(/\r?\n/)) {
    if (/guarantee|guaranteed/i.test(line) && !/does not guarantee|do not guarantee|no guarantee|no guarantees|universal guarantee|not as a guarantee|not a guarantee|aucune garantie|لا يضمن|\?/i.test(line)) {
      failures.push(`${rel(file)} contains overly absolute guarantee wording`);
      break;
    }
  }

  if (lang === "fr") {
    for (const pattern of FRENCH_VISIBLE_ENGLISH_PATTERNS) {
      if (pattern.test(visible)) failures.push(`${rel(file)} has visible English UI text on a French page: ${pattern}`);
    }
  }

  const anchorRe = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRe.exec(html))) {
    const href = match[1];
    const text = stripTags(match[2]);
    checkLocalizedHref(file, lang, href, text);
    checkBrokenHref(file, href);
  }
}

function checkSourceClaims(file) {
  const text = readFileSync(file, "utf8");
  for (const pattern of OLD_CLAIM_PATTERNS) {
    if (pattern.test(text)) failures.push(`${rel(file)} contains stale product claim source: ${pattern}`);
  }
}

const htmlFiles = walk(PUBLIC_DIR, (file) => file.endsWith(".html"));
for (const file of htmlFiles) checkHtmlFile(file);

const sourceFiles = [
  ...walk(SRC_DIR, (file) => /\.(js|jsx|mjs)$/.test(file)),
  ...walk(SCRIPTS_DIR, (file) => /^generate-.*\.mjs$/.test(file)),
].filter((file) => !file.endsWith("localized-link-tests.mjs"));
for (const file of sourceFiles) checkSourceClaims(file);

if (failures.length) {
  console.error("Localized link/product-claim checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Localized link tests passed (${htmlFiles.length} HTML files scanned).`);
