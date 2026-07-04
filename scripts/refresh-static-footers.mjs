import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { footerHtml } from "./shared-footer.mjs";

const ROOT = new URL("../public/", import.meta.url).pathname;

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

let updated = 0;

for (const file of walk(ROOT)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('<footer class="site-footer"')) continue;

  const lang = html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1]?.slice(0, 2) || "en";
  const next = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footerHtml(lang));
  if (next === html) continue;
  writeFileSync(file, next, "utf8");
  updated += 1;
}

console.log(`✓ Refreshed shared footer in ${updated} static HTML files`);
