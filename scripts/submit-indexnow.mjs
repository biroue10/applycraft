import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { HOST, isIndexablePublicUrl } from "./seo-url-policy.mjs";

const KEY = "91a714f93cc24a8c95f1efe0d9e9a914";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const SITEMAP_PATH = "public/sitemap.xml";

function appendSummary(markdown) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  try {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`, "utf8");
  } catch {
    // Summary output must not hide the real submission error.
  }
}

export function readSitemapUrls(sitemapPath = SITEMAP_PATH) {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const canonicalUrls = urls.filter((url) => isIndexablePublicUrl(url));

  return [...new Set(canonicalUrls)].sort();
}

export function readRawSitemapUrls(sitemapPath = SITEMAP_PATH) {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

async function main() {
  const urlList = readSitemapUrls();

  if (urlList.length === 0) {
    throw new Error(`No canonical URLs found in ${SITEMAP_PATH}`);
  }

  if (process.argv.includes("--dry-run")) {
    console.log(urlList.join("\n"));
    console.error(`IndexNow dry run: ${urlList.length} canonical sitemap URLs.`);
    return;
  }

  const keyResponse = await fetch(KEY_LOCATION);
  const keyBody = keyResponse.ok ? (await keyResponse.text()).trim() : "";
  if (!keyResponse.ok || keyBody !== KEY) {
    appendSummary(`### IndexNow key check failed\n\n- URL: ${KEY_LOCATION}\n- Status: ${keyResponse.status}\n- Body matched: ${keyBody === KEY}`);
    throw new Error(`IndexNow key file check failed at ${KEY_LOCATION}: HTTP ${keyResponse.status}`);
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
    appendSummary(`### IndexNow submission failed\n\n- Endpoint: ${ENDPOINT}\n- Status: ${response.status}\n- URLs: ${urlList.length}\n\n\`\`\`\n${body.slice(0, 2000)}\n\`\`\``);
    throw new Error(`IndexNow submission failed: HTTP ${response.status} ${body}`.trim());
  }

  console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
  appendSummary(`### IndexNow submission\n\nSubmitted ${urlList.length} URLs to \`${ENDPOINT}\`.\n\nKey file verified: ${KEY_LOCATION}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    appendSummary(`### IndexNow error\n\n\`\`\`\n${error.stack || error.message}\n\`\`\``);
    process.exit(1);
  });
}
