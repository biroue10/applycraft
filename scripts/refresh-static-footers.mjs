import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { footerHtml } from "./shared-footer.mjs";
import { localizeRoute } from "../src/seo/localizedRoutes.js";

const ROOT = new URL("../public/", import.meta.url).pathname;

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function localizeInternalAnchors(html, lang) {
  if (lang !== "fr" && lang !== "ar") return html;
  return html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, href, after, label) => {
    if (!href.startsWith("/") && !href.startsWith("https://applycraft.io/")) return full;
    if (/English|Anglais|Français|French|العربية|Arabic|Arabe|الفرنسية|الإنجليزية/i.test(`${href} ${label}`)) return full;
    const local = href.replace(/^https:\/\/applycraft\.io/i, "");
    const localized = localizeRoute(local, lang);
    if (localized === local) return full;
    return `<a${before}href="${localized}"${after}>${label}</a>`;
  });
}

let updated = 0;

for (const file of walk(ROOT)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('<footer class="site-footer"')) continue;

  const lang = html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1]?.slice(0, 2) || "en";
  const homeHref = localizeRoute("/", lang);
  const next = html
    // Match the footer open tag with any extra attributes (e.g. role="contentinfo"),
    // otherwise pages whose footer tag isn't exactly `<footer class="site-footer">`
    // are silently skipped and keep a stale/minimal hand-written footer.
    .replace(/<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/, footerHtml(lang))
    .replace(/<a href="\/" class="nav-logo"/, `<a href="${homeHref}" class="nav-logo"`);
  const localized = localizeInternalAnchors(next, lang);
  if (localized === html) continue;
  writeFileSync(file, localized, "utf8");
  updated += 1;
}

console.log(`✓ Refreshed shared footer in ${updated} static HTML files`);
