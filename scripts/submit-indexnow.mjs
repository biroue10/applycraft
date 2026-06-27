import fs from "node:fs";

const HOST = "applycraft.io";
const KEY = "91a714f93cc24a8c95f1efe0d9e9a914";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const SITEMAP_PATH = "public/sitemap.xml";

function readSitemapUrls() {
  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const canonicalUrls = urls.filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === HOST;
    } catch {
      return false;
    }
  });

  return [...new Set(canonicalUrls)].sort();
}

async function main() {
  const urlList = readSitemapUrls();

  if (urlList.length === 0) {
    throw new Error(`No canonical URLs found in ${SITEMAP_PATH}`);
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow submission failed: HTTP ${response.status} ${body}`.trim());
  }

  console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
