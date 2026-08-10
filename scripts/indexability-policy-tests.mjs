#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../worker.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");

function assetFile(pathname) {
  if (pathname === "/") return join(DIST, "index.html");
  const flat = join(DIST, `${pathname.replace(/^\//, "").replace(/\/$/, "")}.html`);
  try { readFileSync(flat); return flat; } catch { /* use directory output */ }
  return join(DIST, pathname.replace(/^\//, ""), "index.html");
}

const env = {
  ASSETS: {
    async fetch(request) {
      const file = assetFile(new URL(request.url).pathname);
      return new Response(readFileSync(file), { status: 200, headers: { "Content-Type": "text/html" } });
    },
  },
};

const redirects = new Map([
  ["/app/ats-checker/", "/ats-checker/"],
  ["/cover-letter/builder/", "/cover-letter-builder/"],
  ["/resume/builder/", "/resume-builder/"],
]);
for (const [source, target] of redirects) {
  const response = await worker.fetch(new Request(`https://applycraft.io${source}?ui=fr`), env);
  assert.equal(response.status, 301, `${source} must be a permanent one-hop redirect`);
  assert.equal(response.headers.get("Location"), `${target}?ui=fr`, `${source} must preserve query parameters`);
  assert.ok(!sitemap.includes(`<loc>https://applycraft.io${source}</loc>`), `${source} must remain outside the sitemap`);
}

for (const route of ["/master-profile/", "/email-signature/", "/personal-website/", "/r/"]) {
  const response = await worker.fetch(new Request(`https://applycraft.io${route}`), env);
  const html = await response.text();
  assert.equal(response.status, 200, `${route} must remain a usable application route`);
  assert.match(html, /<meta name="robots" content="noindex, follow"\s*\/?>/i, `${route} must be noindex, follow`);
  assert.equal((html.match(/<meta name="robots"/gi) || []).length, 1, `${route} must have one unambiguous robots meta`);
  assert.ok(!sitemap.includes(`<loc>https://applycraft.io${route}</loc>`), `${route} must remain outside the sitemap`);
}

const shared = await worker.fetch(new Request("https://applycraft.io/r/?s=Abcd2345"), env);
assert.equal(shared.headers.get("X-Robots-Tag"), "noindex, follow", "/r/ must carry defense-in-depth X-Robots-Tag");

for (const route of ["/resume-builder/", "/ats-checker/", "/cover-letter-builder/"]) {
  const response = await worker.fetch(new Request(`https://applycraft.io${route}`), env);
  const html = await response.text();
  assert.equal(response.status, 200, `${route} must remain a public landing page`);
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, `${route} must remain indexable`);
  assert.ok(sitemap.includes(`<loc>https://applycraft.io${route}</loc>`), `${route} must remain in the sitemap`);
}

for (const route of ["/master-profile/", "/email-signature/", "/personal-website/", "/r/"]) {
  assert.doesNotMatch(robots, new RegExp(`Disallow:\\s*${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"), `${route} must stay crawlable so noindex can be observed`);
}

console.log("Production-equivalent indexability policy passed.");
