#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../worker.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 8792;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const wrangler = join(ROOT, "node_modules/wrangler/bin/wrangler.js");
const sitemap = readFileSync(join(ROOT, "dist/sitemap.xml"), "utf8");

const canonicalRoutes = [
  "/resume-builder/", "/resume/templates/", "/cover-letter/templates/", "/job-tracker/",
  "/master-profile/", "/email-signature/", "/personal-website/", "/r/",
  "/cover-letter-builder/", "/ats-checker/", "/interview-prep/",
  "/fr/interview-prep/", "/ar/interview-prep/", "/fr/modeles-cv/",
  "/ar/resume-templates/", "/application-pack/", "/fr/application-pack/",
  "/ar/application-pack/",
];
const privateRoutes = new Set(["/master-profile/", "/email-signature/", "/personal-website/", "/r/"]);

function canonical(html) {
  return html.match(/rel="canonical" href="([^"]+)"/)?.[1] || "";
}

function startWrangler() {
  const child = spawn(process.execPath, [wrangler, "dev", "--local", "--port", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NO_COLOR: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Wrangler did not start:\n${output}`)), 30_000);
    const onData = (chunk) => {
      output += String(chunk);
      if (output.includes(`Ready on http://localhost:${PORT}`)) {
        clearTimeout(timeout);
        resolve(child);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("exit", (code) => reject(new Error(`Wrangler exited with ${code}:\n${output}`)));
  });
}

const server = await startWrangler();
try {
  for (const route of canonicalRoutes) {
    const query = "?template=elegant&ui=ar&docLang=ar&country=canada&test=1";
    const source = route.slice(0, -1);
    const redirect = await fetch(`${ORIGIN}${source}${query}`, { redirect: "manual" });
    assert.equal(redirect.status, 301, `${source} must permanently redirect at the Static Assets layer`);
    assert.equal(redirect.headers.get("location"), `${route}${query}`, `${source} must preserve the full query string`);

    const final = await fetch(new URL(redirect.headers.get("location"), ORIGIN), { redirect: "manual" });
    assert.equal(final.status, 200, `${route} must be the one-hop 200 destination`);
    const html = await final.text();
    assert.equal(canonical(html), `https://applycraft.io${route}`, `${route} must self-canonicalize without parameters`);
    if (privateRoutes.has(route)) {
      assert.match(html, /<meta name="robots" content="noindex, follow"/i, `${route} must remain noindex with parameters`);
      assert.ok(!sitemap.includes(`<loc>https://applycraft.io${route}</loc>`), `${route} must stay outside the sitemap`);
    }
  }

  const resumeHtml = await (await fetch(`${ORIGIN}/resume/templates/?ui=ar&country=canada`)).text();
  for (const href of [
    "https://applycraft.io/resume/templates/",
    "https://applycraft.io/fr/modeles-cv/",
    "https://applycraft.io/ar/resume-templates/",
  ]) assert.match(resumeHtml, new RegExp(`hreflang="[^"]+" href="${href.replaceAll("/", "\\/")}"`));

  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1]);
    assert.equal(url.search, "", `sitemap URL must not contain parameters: ${url}`);
    assert.ok(url.pathname === "/" || url.pathname.endsWith("/"), `sitemap URL must use the canonical slash: ${url}`);
    assert.ok(!privateRoutes.has(url.pathname), `sitemap must exclude noindex route: ${url}`);
  }

  const notFound = await fetch(`${ORIGIN}/asset-that-must-not-be-normalized.js`, { redirect: "manual" });
  assert.equal(notFound.status, 404, "extension-bearing unknown assets must not be redirected");

  const assetEnv = { ASSETS: { fetch: async () => new Response("ok") } };
  for (const route of canonicalRoutes) {
    const response = await worker.fetch(new Request(`https://applycraft.io${route.slice(0, -1)}?test=1`), assetEnv);
    assert.equal(response.status, 301, `${route} must also have Worker defense in depth`);
    assert.equal(response.headers.get("location"), `${route}?test=1`);
  }
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
}

console.log(`URL consolidation passed for ${canonicalRoutes.length} Static Assets and Worker routes.`);
