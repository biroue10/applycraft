#!/usr/bin/env node
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "playwright";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const DIST = join(ROOT, "dist");
const ORIGIN = "http://applycraft.local";
const ROUTES = ["/", "/fr/", "/ar/", "/resume-builder/", "/ats-checker/", "/job-tracker/", "/interview-prep/"];
const MIME = {
  ".avif": "image/avif", ".css": "text/css", ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon", ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".mjs": "text/javascript; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml",
};

if (!existsSync(join(DIST, "index.html"))) {
  console.error("dist/index.html is missing; run npm run build first.");
  process.exit(2);
}

function distFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidate = normalize(join(DIST, clean));
  if (candidate !== DIST && !candidate.startsWith(`${DIST}${sep}`)) return null;
  const choices = pathname === "/" ? [join(DIST, "index.html")] : [
    candidate,
    join(candidate, "index.html"),
    `${candidate.replace(/\/$/, "")}.html`,
  ];
  return choices.find((file) => existsSync(file) && statSync(file).isFile()) || null;
}

const browser = await chromium.launch({ headless: true });
let failed = false;
try {
  for (const pathname of ROUTES) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.route(`${ORIGIN}/**`, async (route) => {
      const url = new URL(route.request().url());
      const file = distFile(url.pathname);
      if (!file) return route.fulfill({ status: 404, body: "Not found" });
      return route.fulfill({
        status: 200,
        contentType: MIME[extname(file).toLowerCase()] || "application/octet-stream",
        body: readFileSync(file),
      });
    });
    const response = await page.goto(`${ORIGIN}${pathname}`, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main#main-content").length,
      nodes: document.getElementsByTagName("*").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    const ok = response?.status() === 200 && result.title && result.h1 === 1 && result.main === 1 && result.overflow <= 1 && errors.length === 0;
    if (!ok) failed = true;
    console.log(JSON.stringify({ path: pathname, status: response?.status(), ...result, consoleErrors: errors, ok }));
    await context.close();
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
