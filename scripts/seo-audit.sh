#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_URL="${SEO_AUDIT_SITE_URL:-https://applycraft.io}"
if [[ -f "$ROOT_DIR/dist/sitemap.xml" && "${SEO_AUDIT_SOURCE:-0}" != "1" ]]; then
  SITEMAP_PATH="$ROOT_DIR/dist/sitemap.xml"
else
  SITEMAP_PATH="$ROOT_DIR/public/sitemap.xml"
fi

cd "$ROOT_DIR"

for required in package.json index.html public public/robots.txt public/sitemap.xml public/og.png public/favicon.ico public/favicon.svg public/favicon-16x16.png public/favicon-32x32.png public/apple-touch-icon.png public/site.webmanifest; do
  if [[ ! -e "$required" ]]; then
    echo "SEO audit failed: missing required file: $required" >&2
    exit 1
  fi
done

node <<'NODE'
const fs = require("fs");
const path = require("path");

const SITE = "https://applycraft.io";
const HTTP_SITE = (process.env.SEO_AUDIT_SITE_URL || SITE).replace(/\/+$/, "");
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const USE_DIST = fs.existsSync(path.join(DIST, "index.html")) && process.env.SEO_AUDIT_SOURCE !== "1";
const HTML_ROOT = USE_DIST ? DIST : PUBLIC;
const HTTP_CANDIDATES_PATH = path.join(ROOT, ".seo-http-urls");
const errors = [];
const warnings = [];
const httpCandidates = new Set();

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) walk(filePath, files);
    else if (entry.endsWith(".html")) files.push(filePath);
  }
  return files;
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z_:.-]+)=["']([^"']*)["']/g)) out[match[1]] = match[2];
  return out;
}

function firstTag(html, regex) {
  return html.match(regex)?.[0] || "";
}

function meta(html, name) {
  return attrs(firstTag(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))).content || "";
}

function prop(html, name) {
  return attrs(firstTag(html, new RegExp(`<meta[^>]+property=["']${name}["'][^>]*>`, "i"))).content || "";
}

function link(html, rel) {
  return attrs(firstTag(html, new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, "i"))).href || "";
}

function title(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "";
}

function routeFor(filePath) {
  if (!USE_DIST && filePath === path.join(ROOT, "index.html")) return "/";
  if (filePath === path.join(HTML_ROOT, "404.html")) return "/404.html";
  const rel = path.relative(HTML_ROOT, filePath).replaceAll(path.sep, "/");
  if (rel === "index.html") return "/";
  if (path.basename(rel) === "index.html") {
    return `/${path.dirname(rel).replace(/^\.$/, "")}/`;
  }
  return `/${rel.replace(/\.html$/, "")}/`;
}

function isNoindex(html) {
  return /noindex/i.test(meta(html, "robots"));
}

function visibleH1Count(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

function imageExists(imageUrl) {
  if (!imageUrl.startsWith(SITE + "/")) return false;
  const assetPath = imageUrl.replace(SITE + "/", "");
  return fs.existsSync(path.join(HTML_ROOT, assetPath)) || fs.existsSync(path.join(PUBLIC, assetPath));
}

function publicAssetPathFromHref(href, route = "/") {
  if (!href) return "";
  try {
    const url = new URL(href, `${SITE}${route}`);
    if (url.origin !== SITE) return "";
    return url.pathname.replace(/^\/+/, "");
  } catch {
    return href.split("#")[0].split("?")[0].replace(/^\/+/, "");
  }
}

function publicAssetExists(href, route = "/") {
  const assetPath = publicAssetPathFromHref(href, route);
  if (!assetPath) return false;
  return fs.existsSync(path.join(HTML_ROOT, assetPath)) || fs.existsSync(path.join(PUBLIC, assetPath));
}

function headLinkTags(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || html;
  return [...head.matchAll(/<link\b[^>]*>/gi)].map((match) => ({ tag: match[0], attrs: attrs(match[0]) }));
}

function relTokens(linkAttrs) {
  return String(linkAttrs.rel || "").toLowerCase().split(/\s+/).filter(Boolean);
}

function auditIconHead(page) {
  const label = `${page.route} (${path.relative(ROOT, page.filePath)})`;
  const links = headLinkTags(page.html);
  const iconLinks = links.filter((item) => relTokens(item.attrs).includes("icon"));
  const appleLinks = links.filter((item) => relTokens(item.attrs).includes("apple-touch-icon"));
  const manifestLinks = links.filter((item) => relTokens(item.attrs).includes("manifest"));

  if (!iconLinks.length) errors.push(`${label}: missing rel=icon link`);
  if (!appleLinks.length) errors.push(`${label}: missing rel=apple-touch-icon link`);
  if (!manifestLinks.length) errors.push(`${label}: missing rel=manifest link`);

  for (const item of [...iconLinks, ...appleLinks, ...manifestLinks]) {
    if (!item.attrs.href) {
      errors.push(`${label}: icon/manifest link missing href: ${item.tag}`);
    } else if (!publicAssetExists(item.attrs.href, page.route)) {
      errors.push(`${label}: icon/manifest link does not resolve to an existing public file: ${item.attrs.href}`);
    }
  }
}

function auditManifestIcons() {
  const manifestPath = path.join(PUBLIC, "site.webmanifest");
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`public/site.webmanifest: invalid JSON: ${error.message}`);
    return;
  }

  if (!Array.isArray(manifest.icons) || !manifest.icons.length) {
    errors.push("public/site.webmanifest: missing icons array");
    return;
  }

  for (const icon of manifest.icons) {
    if (!icon.src) {
      errors.push("public/site.webmanifest: manifest icon missing src");
    } else if (!publicAssetExists(icon.src)) {
      errors.push(`public/site.webmanifest: manifest icon src does not resolve to an existing public file: ${icon.src}`);
    }
    if (!icon.sizes) errors.push(`public/site.webmanifest: manifest icon missing sizes for ${icon.src || "(missing src)"}`);
    if (!icon.type) errors.push(`public/site.webmanifest: manifest icon missing type for ${icon.src || "(missing src)"}`);
  }
}

const htmlFiles = USE_DIST ? walk(HTML_ROOT) : [path.join(ROOT, "index.html"), ...walk(PUBLIC)];
const pages = [];
const routeMap = new Map();
const titleMap = new Map();
const descriptionMap = new Map();
const canonicalMap = new Map();
const APP_SHELL_ROUTES = new Set([
  "/app/ats-checker/",
  "/cover-letter/builder/",
  "/cover-letter/templates/",
  "/email-signature/",
  "/job-tracker/",
  "/master-profile/",
  "/personal-website/",
  "/r/",
  "/resume/builder/",
  "/resume/templates/",
]);
const LOCALIZED_ROUTE_MAP = {
  "/": { fr: "/fr/", ar: "/ar/" },
  "/resume-builder/": { fr: "/resume-builder/", ar: "/resume-builder/" },
  "/resume/templates/": { fr: "/resume/templates/", ar: "/resume/templates/" },
  "/cover-letter/templates/": { fr: "/cover-letter/templates/", ar: "/cover-letter/templates/" },
  "/cover-letter-builder/": { fr: "/cover-letter/templates/", ar: "/cover-letter/templates/" },
  "/free-resume-builder/": { fr: "/fr/creer-cv-gratuit/", ar: "/ar/free-resume-builder/" },
  "/student-resume-builder/": { fr: "/fr/creer-cv-etudiant/" },
  "/canadian-resume-builder/": { fr: "/fr/creer-cv-canadien/" },
  "/ats-checker/": { fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  "/ats-resume-builder/": { fr: "/ats-checker-fr/", ar: "/ats-checker-ar/" },
  "/pricing/": { fr: "/fr/pricing/" },
  "/blog/": { fr: "/fr/blog/" },
  "/examples/": { fr: "/examples/french-cv-example/" },
  "/terms/": { fr: "/fr/terms/" },
  "/privacy/": { fr: "/fr/privacy/" },
  "/cookies/": { fr: "/fr/cookies/" },
  "/gdpr/": { fr: "/fr/gdpr/" },
  "/refund-policy/": { fr: "/fr/refund-policy/" },
  "/ai-disclosure/": { fr: "/fr/ai-disclosure/" },
};
const LOCALE_LINK_WHITELIST = {
  fr: new Set(["/about/", "/contact/", "/help/", "/changelog/", "/roadmap/", "/status/", "/accessibility/"]),
  ar: new Set(["/blog/", "/about/", "/contact/", "/help/", "/changelog/", "/roadmap/", "/status/", "/accessibility/", "/pricing/", "/examples/", "/ats-resume-builder/", "/cover-letter-builder/", "/student-resume-builder/", "/canadian-resume-builder/", "/terms/", "/privacy/", "/cookies/", "/gdpr/", "/refund-policy/", "/ai-disclosure/"]),
};
const EXPECTED_IMPORTANT_TITLES = new Map([
  // Repositioned to lead with the multilingual differentiator (FR/EN/AR + RTL)
  // while keeping the primary keyword ("Resume Builder" / "منشئ سيرة ذاتية").
  // These are pinned so an accidental edit cannot quietly undo the positioning.
  ["/", "Free Resume Builder in English, French, Arabic | ApplyCraft"],
  ["/ar/", "منشئ سيرة ذاتية مجاني بالعربية والفرنسية | ApplyCraft"],
  ["/ar/free-resume-builder/", "منشئ سيرة ذاتية مجاني بدون تسجيل | ApplyCraft"],
  ["/ar/interview-prep/", "تحضير مقابلة بالذكاء الاصطناعي | ApplyCraft"],
  ["/ats-checker/", "Free ATS Resume Checker | ApplyCraft"],
  ["/ats-resume-builder/", "ATS Resume Builder | ApplyCraft"],
  ["/cover-letter-builder/", "Free Cover Letter Builder | ApplyCraft"],
  ["/examples/administrative-assistant-resume/", "Administrative Assistant Resume | ApplyCraft"],
  ["/examples/help-desk-analyst-resume/", "Help Desk Analyst Resume | ApplyCraft"],
  ["/examples/it-support-technician-resume/", "IT Support Resume | ApplyCraft"],
  ["/examples/linux-administrator-resume/", "Linux Administrator Resume | ApplyCraft"],
  ["/examples/sales-representative-resume/", "Sales Representative Resume | ApplyCraft"],
  ["/examples/software-engineer-resume/", "Software Engineer Resume | ApplyCraft"],
  ["/fr/blog/exemple-cv-maroc/", "Exemple de CV Maroc 2026 | ApplyCraft"],
  ["/fr/creer-cv-canadien/", "Créateur de CV canadien | ApplyCraft"],
  ["/fr/creer-cv-gratuit/", "Créer un CV gratuit | ApplyCraft"],
  ["/fr/interview-prep/", "Préparation entretien IA | ApplyCraft"],
  ["/free-resume-builder/", "Free Resume Builder | ApplyCraft"],
  ["/resume-in-french/", "CV en français gratuit | ApplyCraft"],
  ["/student-resume-builder/", "Student Resume Builder | ApplyCraft"],
]);

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  routeMap.set(route, filePath);

  const page = {
    filePath,
    route,
    html,
    title: title(html),
    description: meta(html, "description"),
    canonical: link(html, "canonical"),
    robots: meta(html, "robots"),
    h1: visibleH1Count(html),
    ogTitle: prop(html, "og:title"),
    ogDescription: prop(html, "og:description"),
    ogUrl: prop(html, "og:url"),
    ogImage: prop(html, "og:image"),
    twitterCard: meta(html, "twitter:card"),
    twitterTitle: meta(html, "twitter:title"),
    twitterDescription: meta(html, "twitter:description"),
    twitterImage: meta(html, "twitter:image"),
    noindex: isNoindex(html),
  };
  page.appShell = USE_DIST && APP_SHELL_ROUTES.has(route);
  pages.push(page);

  if (!page.appShell) {
    if (page.title) titleMap.set(page.title, [...(titleMap.get(page.title) || []), route]);
    if (page.description) descriptionMap.set(page.description, [...(descriptionMap.get(page.description) || []), route]);
    if (page.canonical) canonicalMap.set(page.canonical, [...(canonicalMap.get(page.canonical) || []), route]);
  }
}

for (const page of pages) {
  const label = `${page.route} (${path.relative(ROOT, page.filePath)})`;
  const expectedTitle = EXPECTED_IMPORTANT_TITLES.get(page.route);
  const decodedPageTitle = page.title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
  if (expectedTitle && decodedPageTitle !== expectedTitle) {
    errors.push(`${label}: important title regression; expected ${JSON.stringify(expectedTitle)}, found ${JSON.stringify(decodedPageTitle)}`);
  }
  auditIconHead(page);
  if (!page.title) errors.push(`${label}: missing <title>`);
  if (page.title && !page.appShell) {
    const titleLen = [...page.title].length;
    if (titleLen > 60) warnings.push(`${label}: <title> is ${titleLen} chars (> 60, may be truncated in search results): ${JSON.stringify(page.title)}`);
  }
  if (!page.description) errors.push(`${label}: missing meta description`);
  if (!page.canonical) errors.push(`${label}: missing canonical URL`);
  if (!page.appShell && page.h1 !== 1) errors.push(`${label}: expected exactly one H1, found ${page.h1}`);
  if (page.canonical && !page.canonical.startsWith(SITE + "/")) errors.push(`${label}: canonical must use ${SITE}`);
  if (!page.ogTitle) errors.push(`${label}: missing og:title`);
  if (!page.ogDescription) errors.push(`${label}: missing og:description`);
  if (!page.ogUrl) errors.push(`${label}: missing og:url`);
  if (page.ogUrl && page.canonical && page.ogUrl !== page.canonical) errors.push(`${label}: og:url must match canonical URL`);
  if (page.ogImage && !imageExists(page.ogImage)) errors.push(`${label}: og:image does not map to an existing public file: ${page.ogImage}`);
  if (!page.ogImage) errors.push(`${label}: missing og:image`);
  if (!page.twitterCard) errors.push(`${label}: missing twitter:card`);
  if (!page.twitterTitle) errors.push(`${label}: missing twitter:title`);
  if (!page.twitterDescription) errors.push(`${label}: missing twitter:description`);
  if (!page.twitterImage) errors.push(`${label}: missing twitter:image`);
  if (page.twitterImage && !imageExists(page.twitterImage)) errors.push(`${label}: twitter:image does not map to an existing public file: ${page.twitterImage}`);
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.test|\.local/i.test(page.html)) errors.push(`${label}: development URL detected`);
  if (/<meta[^>]+name=["']keywords["']/i.test(page.html)) errors.push(`${label}: obsolete meta keywords tag found`);
  if (/\b(?:22|46) templates\b|\b(?:22|46) modèles\b|\b(?:22|46) قالب/u.test(page.html)) errors.push(`${label}: stale resume template count detected`);
  if (/50\+\s*languages|99\s+languages|\ball languages\b/i.test(page.html)) errors.push(`${label}: stale or overbroad language claim detected`);
  if (/83%\s+of\s+hiring\s+managers/i.test(page.html)) errors.push(`${label}: unsupported cover-letter statistic detected`);
  if (/\bunder 5 minutes\b|\bless than 5 minutes\b|\ben moins de 5 minutes\b|في أقل من 5 دقائق/iu.test(page.html)) errors.push(`${label}: overly precise time-to-finish promise detected`);
  if (page.route === "/cover-letter-builder/" && /Build My Resume Free/i.test(page.html)) errors.push(`${label}: cover-letter CTA says resume`);
  if (page.route === "/fr/blog/exemple-cv-maroc/") {
    if (!/<section[^>]+aria-labelledby=["']structure-cv-maroc["'][\s\S]*?<div class=["']cv-structure-example["'][\s\S]*?<h3>Nom Prénom<\/h3>[\s\S]*?<h4>Expérience professionnelle<\/h4>[\s\S]*?<ul>[\s\S]*?<li>Réalisation mesurable<\/li>/i.test(page.html)) {
      errors.push(`${label}: Morocco CV structure example must be semantic and formatted`);
    }
  }

  const jsonLdBlocks = [...page.html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLdTypes = [];
  for (let i = 0; i < jsonLdBlocks.length; i += 1) {
    try {
      const parsed = JSON.parse(jsonLdBlocks[i][1].trim());
      const type = parsed?.["@type"];
      if (Array.isArray(type)) jsonLdTypes.push(...type);
      else if (type) jsonLdTypes.push(type);
    } catch (error) {
      errors.push(`${label}: invalid JSON-LD block ${i + 1}: ${error.message}`);
    }
  }
  const hasSchemaType = (types) => types.some((type) => jsonLdTypes.includes(type));
  if (["/", "/fr/", "/ar/"].includes(page.route) && !hasSchemaType(["Organization", "WebApplication", "SoftwareApplication", "FAQPage"])) {
    errors.push(`${label}: homepage must include Organization/WebApplication/FAQ JSON-LD`);
  }
  if (page.route === "/cover-letter-builder/" && !hasSchemaType(["FAQPage", "BreadcrumbList", "WebPage"])) errors.push(`${label}: cover-letter page missing expected JSON-LD`);
  if (page.route === "/ats-checker/" && !hasSchemaType(["SoftwareApplication", "FAQPage"])) errors.push(`${label}: ATS checker page missing expected JSON-LD`);
  if (page.route === "/fr/blog/exemple-cv-maroc/" && !hasSchemaType(["Article", "FAQPage", "BreadcrumbList"])) errors.push(`${label}: Morocco CV article missing expected JSON-LD`);
  if (page.route === "/fr/creer-cv-etudiant/" && !hasSchemaType(["FAQPage", "BreadcrumbList", "WebPage"])) errors.push(`${label}: French student CV page missing expected JSON-LD`);
}

auditManifestIcons();

function duplicateRows(map, label) {
  for (const [value, routes] of map.entries()) {
    const localeBuckets = new Set(routes.map((route) => route.startsWith("/fr/") ? "fr" : route.startsWith("/ar/") ? "ar" : "en"));
    if (label === "title" && localeBuckets.size === routes.length && localeBuckets.size > 1) continue;
    if (routes.length > 1) errors.push(`duplicate ${label}: ${JSON.stringify(value)} on ${routes.join(", ")}`);
  }
}

duplicateRows(titleMap, "title");
duplicateRows(descriptionMap, "description");
duplicateRows(canonicalMap, "canonical");

const sitemap = fs.readFileSync(path.join(HTML_ROOT, "sitemap.xml"), "utf8");
if (!sitemap.includes("<urlset") || !sitemap.includes("</urlset>")) errors.push("public/sitemap.xml does not look like valid sitemap XML");

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set();
for (const loc of sitemapUrls) {
  if (sitemapSet.has(loc)) errors.push(`duplicate sitemap URL: ${loc}`);
  sitemapSet.add(loc);
  if (!loc.startsWith(SITE + "/")) errors.push(`sitemap URL must use ${SITE}: ${loc}`);
  try {
    addHttpCandidate(new URL(loc).pathname);
  } catch {}
}
const sitemapPathSet = new Set(
  sitemapUrls
    .filter((loc) => loc.startsWith(SITE + "/"))
    .map((loc) => new URL(loc).pathname)
);

for (const page of pages) {
  if (page.appShell) continue;
  if (page.noindex && sitemapSet.has(page.canonical)) errors.push(`${page.route}: noindex page included in sitemap`);
  if (!page.noindex && page.route !== "/404.html" && !sitemapSet.has(page.canonical)) errors.push(`${page.route}: indexable page missing from sitemap`);
}

for (const loc of sitemapUrls) {
  const page = pages.find((candidate) => candidate.canonical === loc);
  if (!page) errors.push(`sitemap URL is not represented by a local canonical page: ${loc}`);
}

function addHttpCandidate(pathname, search = "") {
  if (!pathname || !pathname.startsWith("/")) return;
  if (pathname === "/") {
    httpCandidates.add(`${HTTP_SITE}/`);
    return;
  }
  if (/\.[a-z0-9]+$/i.test(pathname)) return;

  const cleanSearch = search && search !== "?" ? search : "";
  const addPath = (candidatePath) => httpCandidates.add(`${HTTP_SITE}${candidatePath}${cleanSearch}`);
  addPath(pathname);
  if (pathname.endsWith("/")) addPath(pathname.slice(0, -1));
  else addPath(`${pathname}/`);
}

function pageLocale(page) {
  const lang = page.html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase().split("-")[0];
  if (lang === "fr" || lang === "ar") return lang;
  if (page.route.startsWith("/fr/")) return "fr";
  if (page.route.startsWith("/ar/")) return "ar";
  return "en";
}

function linkLocale(pathname, search = "") {
  const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const ui = params.get("ui") || params.get("docLang");
  if (ui === "fr" || ui === "ar") return ui;
  if (pathname === "/fr/" || pathname.startsWith("/fr/")) return "fr";
  if (pathname === "/ar/" || pathname.startsWith("/ar/")) return "ar";
  if (pathname === "/ats-checker-fr/") return "fr";
  if (pathname === "/ats-checker-ar/") return "ar";
  return "en";
}

function normalizePagePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function visibleText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function footerLabel(html) {
  return decodeHtml(visibleText(html)).replace(/\s+/g, " ").trim();
}

function normalizedFooterHref(href, route) {
  const decoded = decodeHtml(href);
  if (decoded.startsWith("mailto:") || decoded.startsWith("tel:") || decoded.startsWith("#")) return decoded;
  try {
    const url = new URL(decoded, `${SITE}${route}`);
    if (url.origin === SITE) {
      const pathname = normalizePagePath(url.pathname);
      return `${pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch {
    return decoded;
  }
}

function auditFooterLinks(page) {
  const footer = page.html.match(/<footer\b[^>]*\bdata-footer=["']unified["'][\s\S]*?<\/footer>/i)?.[0];
  if (!footer) return;
  const label = `${page.route} (${path.relative(ROOT, page.filePath)})`;
  const pageLang = pageLocale(page);
  const expectedHomeHref = pageLang === "fr" ? "/fr/" : pageLang === "ar" ? "/ar/" : "/";
  const anchors = [...footer.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const pairs = anchors
    .map((match) => ({
      tag: match[0],
      href: normalizedFooterHref(match[1], page.route),
      label: footerLabel(match[2]) || "(empty footer link)",
    }));
  const domainLink = pairs.find((pair) => pair.label === "applycraft.io");
  if (!domainLink) {
    errors.push(`${label}: footer bottom must link visible text "applycraft.io"`);
  } else if (domainLink.href !== expectedHomeHref) {
    errors.push(`${label}: footer applycraft.io link must point to ${expectedHomeHref}, found ${domainLink.href}`);
  }
  const logoLink = pairs.find((pair) => /\bclass=["'][^"']*\bfooter-logo\b/i.test(pair.tag));
  if (!logoLink) {
    errors.push(`${label}: footer logo must be wrapped in a home link`);
  } else if (logoLink.href !== expectedHomeHref) {
    errors.push(`${label}: footer logo link must point to ${expectedHomeHref}, found ${logoLink.href}`);
  }
  const hrefLabels = new Map();
  const labelHrefs = new Map();
  for (const pair of pairs) {
    if (/\bclass=["'][^"']*\bfooter-logo\b/i.test(pair.tag)) continue;
    if (/\bclass=["'][^"']*\b(?:footer-legal-link|ac-footer-legal-link)\b/i.test(pair.tag)) continue;
    if (!hrefLabels.has(pair.href)) hrefLabels.set(pair.href, new Set());
    hrefLabels.get(pair.href).add(pair.label);
    if (!labelHrefs.has(pair.label)) labelHrefs.set(pair.label, new Set());
    labelHrefs.get(pair.label).add(pair.href);
  }
  for (const [href, labels] of hrefLabels.entries()) {
    if (labels.size > 1) errors.push(`${label}: footer duplicate href ${href} with labels: ${[...labels].join(" | ")}`);
  }
  for (const [text, hrefs] of labelHrefs.entries()) {
    if (hrefs.size > 1) errors.push(`${label}: footer duplicate label "${text}" with hrefs: ${[...hrefs].join(" | ")}`);
  }
}

function isLanguageSwitchLink(href, text) {
  return /English|Anglais|Français|French|العربية|Arabic|Arabe|الفرنسية|الإنجليزية/i.test(`${href} ${text}`);
}

for (const page of pages) {
  auditFooterLinks(page);
  const pageLang = pageLocale(page);
  const anchorLinks = [...page.html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => [match[1], visibleText(match[2]), true]);
  const links = [...page.html.matchAll(/href=["']([^"']+)["']/g)].map((match) => [match[1], "", false]);
  for (const item of anchorLinks) links.push(item);
  for (const [href, text, isAnchor] of links) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (/^https?:\/\//.test(href) && !href.startsWith(SITE + "/")) continue;

    let resolved = null;
    try {
      resolved = new URL(href, `${SITE}${page.route}`);
    } catch {}
    let pathname = resolved ? resolved.pathname : href.split("#")[0].split("?")[0];
    const search = resolved ? resolved.search : "";
    if (!pathname || pathname === "/") continue;
    const normalizedPath = normalizePagePath(pathname);
    if (isAnchor && (pageLang === "fr" || pageLang === "ar") && !isLanguageSwitchLink(href, text) && linkLocale(normalizedPath, search) !== pageLang && !LOCALE_LINK_WHITELIST[pageLang]?.has(normalizedPath)) {
      for (const [englishPath, locales] of Object.entries(LOCALIZED_ROUTE_MAP)) {
        if (normalizedPath === englishPath && locales[pageLang]) {
          errors.push(`${page.route}: ${pageLang} page links to non-localized internal URL ${href}; expected ${locales[pageLang]} or whitelisted`);
          break;
        }
      }
    }
    if (resolved && resolved.origin === SITE) addHttpCandidate(pathname, search);
    if (!/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith("/") && sitemapPathSet.has(`${pathname}/`)) {
      errors.push(`${page.route}: internal href points to a sitemap page without trailing slash: ${href}`);
    }
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      const assetPath = pathname.startsWith("/")
        ? path.join(HTML_ROOT, pathname.replace(/^\//, ""))
        : path.resolve(path.dirname(page.filePath), pathname);
      if (!fs.existsSync(assetPath) && !fs.existsSync(path.join(PUBLIC, pathname.replace(/^\//, ""))) && !fs.existsSync(path.join(ROOT, pathname.replace(/^\//, "")))) {
        errors.push(`${page.route}: broken internal asset link ${href}`);
      }
      continue;
    }
    if (!pathname.endsWith("/")) pathname += "/";
    if (!routeMap.has(pathname)) errors.push(`${page.route}: broken internal page link ${href}`);
  }
}

for (const page of pages.filter((candidate) => candidate.html.includes("hreflang="))) {
  const alternateTags = [...page.html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)].map((match) => attrs(match[0]));
  for (const alt of alternateTags) {
    if (!alt.hreflang || !alt.href) errors.push(`${page.route}: incomplete hreflang tag`);
    if (alt.href && !sitemapSet.has(alt.href)) errors.push(`${page.route}: hreflang target is not in sitemap: ${alt.href}`);
  }
}

if (warnings.length) {
  console.log("SEO audit warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error("SEO audit failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

fs.writeFileSync(HTTP_CANDIDATES_PATH, `${[...httpCandidates].sort().join("\n")}\n`, "utf8");
console.log(`Local SEO checks passed: ${pages.length} HTML files, ${sitemapUrls.length} sitemap URLs`);
NODE

if [[ "${SEO_AUDIT_SKIP_HTTP:-0}" != "1" ]]; then
  if ! command -v curl >/dev/null 2>&1; then
    echo "SEO audit failed: curl is required for sitemap HTTP checks" >&2
    exit 1
  fi

  resolve_location() {
    node -e 'console.log(new URL(process.argv[2], process.argv[1]).toString())' "$1" "$2"
  }

  check_http_url() {
    local original_url="$1"
    local current_url="$original_url"
    local hops=0
    local seen="|$original_url|"
    local response status location

    while true; do
      response="$(curl -sSI --max-redirs 0 --max-time 20 "$current_url")" || {
        echo "SEO audit failed: HTTP URL request failed: $current_url" >&2
        exit 1
      }
      status="$(printf '%s\n' "$response" | awk 'BEGIN{code=""} /^HTTP\//{code=$2} END{print code}')"
      if [[ -z "$status" ]]; then
        echo "SEO audit failed: HTTP URL returned no HTTP status: $current_url" >&2
        exit 1
      fi

      if [[ "$status" =~ ^30[0-9]$ ]]; then
        location="$(printf '%s\n' "$response" | awk 'BEGIN{IGNORECASE=1} /^location:[[:space:]]*/{sub(/^[Ll]ocation:[[:space:]]*/, ""); sub(/\r$/, ""); print; exit}')"
        if [[ -z "$location" ]]; then
          echo "SEO audit failed: redirect without Location for HTTP URL: $current_url ($status)" >&2
          exit 1
        fi
        hops=$((hops + 1))
        if (( hops > 5 )); then
          echo "SEO audit failed: redirect chain exceeded 5 hops for HTTP URL: $original_url" >&2
          exit 1
        fi
        if (( hops > 1 )); then
          echo "SEO audit failed: redirect chain exceeded 1 hop for HTTP URL: $original_url" >&2
          exit 1
        fi
        current_url="$(resolve_location "$current_url" "$location")"
        if [[ "$seen" == *"|$current_url|"* ]]; then
          echo "SEO audit failed: redirect loop for HTTP URL: $original_url -> $current_url" >&2
          exit 1
        fi
        seen="${seen}${current_url}|"
        continue
      fi

      if [[ "$status" != "200" ]]; then
        echo "SEO audit failed: HTTP URL did not resolve to 200: $original_url (final $status at $current_url)" >&2
        exit 1
      fi
      break
    done
  }

  check_sitemap_url_zero_redirect() {
    local url="$1"
    local response status location
    response="$(curl -sSI --max-redirs 0 --max-time 20 "$url")" || {
      echo "SEO audit failed: sitemap URL request failed: $url" >&2
      exit 1
    }
    status="$(printf '%s\n' "$response" | awk 'BEGIN{code=""} /^HTTP\//{code=$2} END{print code}')"
    if [[ -z "$status" ]]; then
      echo "SEO audit failed: sitemap URL returned no HTTP status: $url" >&2
      exit 1
    fi
    if [[ "$status" =~ ^30[0-9]$ ]]; then
      location="$(printf '%s\n' "$response" | awk 'BEGIN{IGNORECASE=1} /^location:[[:space:]]*/{sub(/^[Ll]ocation:[[:space:]]*/, ""); sub(/\r$/, ""); print; exit}')"
      echo "SEO audit failed: sitemap URL must return 200 with zero redirects: $url ($status -> ${location:-no Location})" >&2
      exit 1
    fi
    if [[ "$status" != "200" ]]; then
      echo "SEO audit failed: sitemap URL did not resolve to direct 200: $url ($status)" >&2
      exit 1
    fi
  }

  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    check_sitemap_url_zero_redirect "$url"
  done < <(node -e 'const fs=require("fs"); const xml=fs.readFileSync(process.argv[1],"utf8"); for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) console.log(m[1]);' "$SITEMAP_PATH")

  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    check_http_url "$url"
  done < "$ROOT_DIR/.seo-http-urls"

  echo "HTTP redirect checks passed against $SITE_URL ($(grep -c . "$ROOT_DIR/.seo-http-urls") URLs; sitemap URLs are 0-hop)"
fi

# Dead internal-link check: every internal href in the build must resolve to a
# built page or static asset (or a known redirect source). Only runs against dist.
if [[ -f "$ROOT_DIR/dist/index.html" ]]; then
  node "$ROOT_DIR/scripts/dead-links.mjs"
fi

# Unified-footer check: every built page must carry the shared footer marker
# (builder workspace views exempt). Only runs against dist.
if [[ -f "$ROOT_DIR/dist/index.html" ]]; then
  node "$ROOT_DIR/scripts/footer-guard.mjs"
fi

echo "SEO audit passed"
