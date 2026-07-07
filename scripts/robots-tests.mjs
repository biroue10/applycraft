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
  if (!text.endsWith("\n")) fail("robots.txt must end with a newline");
  const directiveRe = /\b(?:User-agent|Allow|Disallow|Sitemap|Content-Signal):/gi;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (/^\s*#/.test(line)) continue;
    const directives = line.match(directiveRe) || [];
    if (directives.length > 1) fail(`line ${index + 1} contains multiple robots directives; keep each directive on its own line`);
    if (directives.length === 1 && !new RegExp(`^\\s*${directives[0].replace(":", "\\:")}`, "i").test(line)) {
      fail(`line ${index + 1} has a robots directive after other text; keep directives at the start of a line`);
    }
  }
  const cloudflareManagedAgents = [
    "Amazonbot",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "ClaudeBot",
    "CloudflareBrowserRenderingCrawler",
    "Google-Extended",
    "GPTBot",
    "meta-externalagent",
  ];
  const blocks = text
    .split(/\n(?=User-agent:\s*)/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const userAgentBlocks = blocks.filter((block) => /^User-agent:/i.test(block));
  const agents = userAgentBlocks
    .map((block) => block.match(/^User-agent:\s*(.+?)\s*$/im)?.[1]?.trim())
    .filter(Boolean);

  for (const agent of new Set(agents)) {
    const count = agents.filter((candidate) => candidate.toLowerCase() === agent.toLowerCase()).length;
    if (count > 1) fail(`duplicate User-agent block: ${agent} (${count})`);
  }

  const wildcardBlocks = userAgentBlocks.filter((block) => /^User-agent:\s*\*/im.test(block));
  if (wildcardBlocks.length > 1) fail(`expected at most one User-agent: * block, found ${wildcardBlocks.length}`);
  if (wildcardBlocks.some((block) => /^Disallow:\s*\/\s*$/im.test(block))) fail("User-agent: * must not disallow /");
  if (!/Sitemap:\s*https:\/\/applycraft\.io\/sitemap\.xml/i.test(text)) fail("robots.txt must expose sitemap.xml");
  if (/BEGIN Cloudflare Managed content/i.test(text) || /Content-Signal:/i.test(text)) {
    fail("Cloudflare Managed Content Signals are injected in production and must not be duplicated in public/robots.txt");
  }

  for (const bot of ["Googlebot", "Googlebot-Image", "Bingbot"]) {
    const block = userAgentBlocks.find((candidate) => new RegExp(`^User-agent:\\s*${bot}\\s*$`, "im").test(candidate));
    if (!block) fail(`${bot} block missing`);
    else {
      if (!/^Allow:\s*\/\s*$/im.test(block)) fail(`${bot} must explicitly allow /`);
      if (/^Disallow:\s*\/\s*$/im.test(block)) fail(`${bot} must not disallow /`);
    }
  }

  for (const bot of cloudflareManagedAgents) {
    const block = userAgentBlocks.find((candidate) => new RegExp(`^User-agent:\\s*${bot}\\s*$`, "im").test(candidate));
    if (block) fail(`${bot} is managed by Cloudflare and must not be repeated in public/robots.txt`);
  }
}

if (failures.length) {
  console.error("Robots tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Robots tests passed.");
