import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = "/blog/how-to-list-online-courses-and-certificates-on-a-resume/";
const canonical = `https://applycraft.io${route}`;
const html = await readFile(new URL(`../dist${route}index.html`, import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

assert.equal((html.match(/<h1\b/gi) || []).length, 1, "article must contain exactly one H1");
assert.equal((html.match(/<title>/gi) || []).length, 1, "article must contain exactly one title element");
assert.match(html, /<title>Online Courses and Certificates on a Resume \| ApplyCraft<\/title>/);
assert.match(html, /<meta name="description" content="Learn how to list online courses, verified certificates, projects, licences and in-progress study on a resume with honest examples and section-by-section guidance\."\/>/);
assert.match(html, /<link rel="canonical" href="https:\/\/applycraft\.io\/blog\/how-to-list-online-courses-and-certificates-on-a-resume\/"\/>/);
assert.equal((html.match(new RegExp(`rel="canonical" href="${canonical.replaceAll("/", "\\/")}"`, "g")) || []).length, 1, "article must have one canonical");
assert.match(html, /"@type":"Article"/);
assert.match(html, /"@type":"FAQPage"/);
assert.match(html, /<meta property="og:url" content="https:\/\/applycraft\.io\/blog\/how-to-list-online-courses-and-certificates-on-a-resume\/"\/>/);
assert.match(html, /<link rel="alternate" hreflang="en"/);
assert.doesNotMatch(html, /hreflang="(?:fr|ar)"/);
assert.doesNotMatch(html, /dir="rtl"/);
assert.match(sitemap, new RegExp(`<loc>${canonical.replaceAll("/", "\\/")}<\\/loc>`));
assert.equal((sitemap.match(new RegExp(`<loc>${canonical.replaceAll("/", "\\/")}<\\/loc>`, "g")) || []).length, 1, "article must appear once in sitemap");

console.log("Online courses and certificates article tests passed.");
