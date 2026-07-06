import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readSitemapUrls } from "./submit-indexnow.mjs";
import { isIndexablePublicUrl } from "./seo-url-policy.mjs";

const sampleUrls = [
  "https://applycraft.io/",
  "https://applycraft.io/ats-checker/",
  "https://applycraft.io/ats-checker/",
  "https://applycraft.io/fr/blog/exemple-cv-maroc/",
  "https://applycraft.io/app/ats-checker/",
  "https://applycraft.io/cover-letter/builder/",
  "https://applycraft.io/email-signature/",
  "https://applycraft.io/r#abc123",
  "https://applycraft.io/resume-builder/?starter=student",
  "https://staging.applycraft.io/ats-checker/",
  "http://applycraft.io/ats-checker/",
  "https://applycraft.io/ats-checker",
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sampleUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

const dir = mkdtempSync(join(tmpdir(), "applycraft-indexnow-"));
const sitemapPath = join(dir, "sitemap.xml");
writeFileSync(sitemapPath, xml, "utf8");

const submitted = readSitemapUrls(sitemapPath);
const expected = [
  "https://applycraft.io/",
  "https://applycraft.io/ats-checker/",
  "https://applycraft.io/fr/blog/exemple-cv-maroc/",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(JSON.stringify(submitted) === JSON.stringify(expected), `unexpected IndexNow URL list:\n${JSON.stringify(submitted, null, 2)}`);
assert(isIndexablePublicUrl("https://applycraft.io/cover-letter/templates/"), "canonical cover-letter templates route should be indexable");
assert(!isIndexablePublicUrl("https://applycraft.io/cover-letter/builder/"), "cover-letter builder app route must be excluded");
assert(!isIndexablePublicUrl("https://applycraft.io/app/ats-checker/"), "/app route must be excluded");
assert(!isIndexablePublicUrl("https://applycraft.io/resume-builder/?starter=student"), "query URLs must be excluded");
assert(!isIndexablePublicUrl("https://applycraft.io/r#abc123"), "hash URLs must be excluded");
assert(!isIndexablePublicUrl("https://applycraft.io/ats-checker"), "slashless page URLs must be excluded");

console.log(`IndexNow tests passed (${submitted.length} clean URLs from ${sampleUrls.length} candidates).`);
