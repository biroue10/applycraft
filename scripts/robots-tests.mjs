import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const ROBOTS = join(ROOT, "public", "robots.txt");
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!existsSync(ROBOTS)) {
  fail("public/robots.txt missing");
} else {
  const text = readFileSync(ROBOTS, "utf8");
  const blocks = text
    .split(/\n(?=User-agent:\s*)/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const userAgentBlocks = blocks.filter((block) => /^User-agent:/i.test(block));
  const wildcardBlocks = userAgentBlocks.filter((block) => /^User-agent:\s*\*/im.test(block));
  if (wildcardBlocks.length !== 1) fail(`expected exactly one User-agent: * block, found ${wildcardBlocks.length}`);
  if (wildcardBlocks.some((block) => /^Disallow:\s*\/\s*$/im.test(block))) fail("User-agent: * must not disallow /");
  if (!/Sitemap:\s*https:\/\/applycraft\.io\/sitemap\.xml/i.test(text)) fail("robots.txt must expose sitemap.xml");
  if (!/Content-Signal:\s*search=yes,ai-train=no,use=reference/i.test(text)) fail("robots.txt must keep Content-Signal search/AI-training preference");

  for (const bot of ["Googlebot", "Googlebot-Image", "Bingbot"]) {
    const block = userAgentBlocks.find((candidate) => new RegExp(`^User-agent:\\s*${bot}\\s*$`, "im").test(candidate));
    if (!block) fail(`${bot} block missing`);
    else {
      if (!/^Allow:\s*\/\s*$/im.test(block)) fail(`${bot} must explicitly allow /`);
      if (/^Disallow:\s*\/\s*$/im.test(block)) fail(`${bot} must not disallow /`);
    }
  }

  for (const bot of [
    "Amazonbot",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "ClaudeBot",
    "CloudflareBrowserRenderingCrawler",
    "Google-Extended",
    "GPTBot",
    "meta-externalagent",
  ]) {
    const block = userAgentBlocks.find((candidate) => new RegExp(`^User-agent:\\s*${bot}\\s*$`, "im").test(candidate));
    if (!block) fail(`${bot} block missing`);
    else if (!/^Disallow:\s*\/\s*$/im.test(block)) fail(`${bot} must disallow /`);
  }
}

if (failures.length) {
  console.error("Robots tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Robots tests passed.");
