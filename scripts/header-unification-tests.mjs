import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith(".html") ? [path] : [];
  });
}

const obsolete = /ac-static-site-header|ac-static-header-row|ac-static-desktop-nav|ac-site-header\b|ac-workspace-status(?!-bar)/;
const publicHtml = htmlFiles(join(root, "public"));
const headerPages = publicHtml.filter((file) => readFileSync(file, "utf8").includes('data-site-header="applycraft"'));

assert.ok(headerPages.length >= 80, "expected the shared build-time header on public pages");
for (const file of headerPages) {
  const html = readFileSync(file, "utf8");
  assert.equal((html.match(/data-site-header="applycraft"/g) || []).length, 1, `${file}: exactly one global header`);
  assert.match(html, /<header class="ac-global-header" data-site-header="applycraft">/, `${file}: canonical outer header`);
  assert.match(html, /class="ac-global-header__inner"/, `${file}: canonical inner container`);
  assert.match(html, /class="ac-global-header__actions"/, `${file}: canonical action group`);
  assert.match(html, /class="ac-global-header__language ac-language-switcher"/, `${file}: shared language selector`);
  assert.match(html, /class="ac-nav-cta"/, `${file}: shared resume CTA`);
  assert.doesNotMatch(html, obsolete, `${file}: obsolete header/status markup`);
}

const chrome = read("src/siteChrome.jsx");
const app = read("src/ResumeGenerator.jsx");
const appCss = read("public/app-navbar.css");
const seoCss = read("public/_seo.css");
const generator = read("scripts/shared-header.mjs");

assert.match(chrome, /className="ac-global-header"/, "React header uses canonical outer class");
assert.match(generator, /class="ac-global-header"/, "static renderer uses canonical outer class");
assert.equal((app.match(/<AppToolHeader \/>/g) || []).length, 1, "workspace emits one global header");
assert.match(app, /<WorkspaceStatusBar>/, "workspace uses shared status component");
assert.ok(app.indexOf("<WorkspaceStatusBar>") > app.indexOf("<SharedSiteHeader"), "status follows the global header");
assert.doesNotMatch(`${chrome}\n${app}\n${appCss}\n${seoCss}`, obsolete, "obsolete selector families are removed");

for (const token of [
  "--ac-header-height",
  "--ac-header-background",
  "--ac-header-border",
  "--ac-header-z-index",
  "--ac-header-inline-padding",
]) {
  assert.match(appCss, new RegExp(token), `app CSS defines ${token}`);
  assert.match(seoCss, new RegExp(token), `static CSS defines ${token}`);
}
for (const rule of [
  "background:var(--ac-header-background)",
  "border-bottom:1px solid var(--ac-header-border)",
  "height:var(--ac-header-height)",
]) {
  assert.ok(appCss.includes(rule), `app header uses ${rule}`);
  assert.ok(seoCss.includes(rule), `static header uses ${rule}`);
}

const publicStatus = headerPages.filter((file) => readFileSync(file, "utf8").includes("ac-workspace-status-bar"));
assert.deepEqual(publicStatus, [], "public/static routes do not emit workspace status");
assert.match(appCss, /\.ac-workspace-status-bar__inner\{[^}]*justify-content:flex-end/, "status is consistently inline-end aligned");
assert.match(appCss, /\.ac-global-header\{[^}]*width:100%/, "global header is edge-to-edge");

console.log(`✓ Header unification: ${headerPages.length} static pages + React workspace use one canonical global header`);
