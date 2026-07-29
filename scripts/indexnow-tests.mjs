import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  TransientIndexNowError,
  fetchWithRetry,
  readRawSitemapUrls,
  readSitemapUrls,
} from "./submit-indexnow.mjs";
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

const realSitemapPath = join(fileURLToPath(new URL("..", import.meta.url)), "public", "sitemap.xml");
const sitemapUrls = [...new Set(readRawSitemapUrls(realSitemapPath))].sort();
const indexNowUrls = readSitemapUrls(realSitemapPath);
const indexNowOnly = indexNowUrls.filter((url) => !sitemapUrls.includes(url));
const sitemapOnly = sitemapUrls.filter((url) => !indexNowUrls.includes(url));

assert(indexNowOnly.length === 0, `IndexNow has URLs absent from sitemap:\n${indexNowOnly.join("\n")}`);
assert(sitemapOnly.length === 0, `sitemap has URLs not submitted to IndexNow:\n${sitemapOnly.join("\n")}`);

let networkAttempts = 0;
const recoveredResponse = await fetchWithRetry(
  "https://api.indexnow.org/indexnow",
  {},
  {
    attempts: 3,
    baseDelayMs: 0,
    waitImpl: async () => {},
    fetchImpl: async () => {
      networkAttempts += 1;
      if (networkAttempts < 3) throw new TypeError("fetch failed");
      return new Response("", { status: 200 });
    },
  },
);
assert(recoveredResponse.ok, "transient network failure should recover");
assert(networkAttempts === 3, `expected 3 network attempts, got ${networkAttempts}`);

let permanentAttempts = 0;
const permanentResponse = await fetchWithRetry(
  "https://api.indexnow.org/indexnow",
  {},
  {
    attempts: 4,
    baseDelayMs: 0,
    waitImpl: async () => {},
    fetchImpl: async () => {
      permanentAttempts += 1;
      return new Response("bad request", { status: 400 });
    },
  },
);
assert(permanentResponse.status === 400, "permanent HTTP response should be returned to the caller");
assert(permanentAttempts === 1, `HTTP 400 must not be retried; got ${permanentAttempts} attempts`);

let unavailableError;
try {
  await fetchWithRetry(
    "https://api.indexnow.org/indexnow",
    {},
    {
      attempts: 2,
      baseDelayMs: 0,
      waitImpl: async () => {},
      fetchImpl: async () => new Response("unavailable", { status: 503 }),
    },
  );
} catch (error) {
  unavailableError = error;
}
assert(unavailableError instanceof TransientIndexNowError, "HTTP 503 exhaustion must be classified as transient");

console.log(`IndexNow tests passed (${submitted.length} clean URLs from ${sampleUrls.length} candidates; ${indexNowUrls.length} real sitemap URLs).`);
