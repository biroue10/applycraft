import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const SITEMAP = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const failures = [];
const fail = (message) => failures.push(message);

const REQUIRED_ROUTES = [
  "/", "/fr/", "/ar/", "/resume-builder/", "/cover-letter-builder/",
  "/ats-checker/", "/job-tracker/", "/interview-prep/", "/resume/templates/",
  "/cover-letter/templates/", "/pricing/", "/fr/pricing/", "/examples/",
  "/blog/", "/fr/blog/", "/about/", "/contact/", "/help/", "/privacy/", "/terms/",
];

const sitemapRoutes = [...SITEMAP.matchAll(/<loc>https:\/\/applycraft\.io([^<]*)<\/loc>/g)]
  .map((match) => match[1] || "/");
const routes = [...new Set([...sitemapRoutes, ...REQUIRED_ROUTES])];

function builtFile(route) {
  if (route === "/") return join(DIST, "index.html");
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [join(DIST, clean, "index.html"), join(DIST, `${clean}.html`)];
  return candidates.find(existsSync);
}

const workspaceWithoutFooter = new Set([
  "/resume-builder/", "/resume/templates/", "/cover-letter/templates/",
  "/job-tracker/", "/interview-prep/", "/fr/interview-prep/", "/ar/interview-prep/",
]);

for (const route of routes) {
  const file = builtFile(route);
  if (!file) {
    fail(`${route}: generated HTML is missing`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const headers = html.match(/data-site-header="applycraft"/g) || [];
  if (headers.length !== 1) fail(`${route}: expected exactly one global navbar, found ${headers.length}`);

  const locale = html.match(/<html[^>]+lang="(en|fr|ar)(?:-[^"]+)?"/i)?.[1]?.toLowerCase() || "en";
  const home = locale === "en" ? "/" : `/${locale}/`;
  if (!new RegExp(`<a[^>]+href="${home.replaceAll("/", "\\/")}"[^>]*[\\s\\S]{0,300}(?:ApplyCraft|applycraft-logo)`, "i").test(html)) {
    fail(`${route}: localized ApplyCraft home link is missing`);
  }
  if (!/<nav[^>]+aria-label=/i.test(html)) fail(`${route}: accessible navigation landmark is missing`);
  for (const href of ["/resume-builder/", "/cover-letter-builder/", "/ats-checker/", "/job-tracker/", "/interview-prep/", "/resume/templates/", "/pricing/"]) {
    if (!html.includes(`href="${href}"`) && locale === "en") fail(`${route}: required main link is missing: ${href}`);
  }
  if (!workspaceWithoutFooter.has(route) && !/<footer\b/i.test(html)) fail(`${route}: site footer is missing`);
}

if (failures.length) {
  console.error("Navbar integrity tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Navbar integrity tests passed (${routes.length} public routes; exactly one global navbar each).`);
