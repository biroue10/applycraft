import assert from "node:assert/strict";
import fs from "node:fs";
import { encodeShare, decodeShare, normalizeSharedDocument } from "../src/share.js";
import { getResumeTemplateById, getCoverTemplateById } from "../src/documents/templateRegistry.js";
import { isRtlLang } from "../src/i18n/languages.js";

function roundTrip(payload) {
  return normalizeSharedDocument(decodeShare(encodeShare(payload)));
}

const arabicModernResume = {
  v: 2,
  k: "resume",
  t: "modern",
  l: "ar",
  p: "a4",
  c: { accent: "#2563eb" },
  d: {
    name: "Gladys Mouna",
    title: "Systems Administrator",
    contact: [
      "gladys.mouna@gmail.com",
      "+33 773406333",
      "https://www.linkedin.com/in/isaac-biroue",
    ],
    summary: "Experienced administrator for Microsoft 365 and Active Directory.",
    sections: [
      {
        key: "experience",
        heading: "الخبرة العملية",
        isCustom: false,
        items: ["Managed Microsoft 365, Active Directory, React, PHP and HTML systems."],
      },
      {
        key: "projects",
        heading: "مسيرتي المهنية",
        isCustom: true,
        items: ["Built bilingual documentation for support teams."],
      },
    ],
  },
};

const decoded = roundTrip(arabicModernResume);
assert.equal(decoded.v, 2, "v2 payload should round-trip");
assert.equal(decoded.k, "resume", "resume kind should be preserved");
assert.equal(decoded.t, "modern", "template id should be preserved");
assert.equal(decoded.l, "ar", "Arabic document language should be preserved");
assert.equal(decoded.p, "a4", "page size should be preserved");
assert.deepEqual(decoded.c, { accent: "#2563eb" }, "customization should be preserved");
assert.equal(decoded.d.sections[1].heading, "مسيرتي المهنية", "custom section heading should remain unchanged");
assert.equal(isRtlLang(decoded.l), true, "Arabic shared document should resolve as RTL");
assert.equal(getResumeTemplateById(decoded.t).id, "modern", "Modern resume template should resolve");

const cover = roundTrip({
  v: 2,
  k: "cover",
  t: "classic",
  l: "fr",
  p: "letter",
  c: {},
  d: { name: "Alex Martin", body: "Bonjour,\n\nMerci." },
});
assert.equal(cover.k, "cover", "cover kind should be preserved");
assert.equal(cover.l, "fr", "cover language should be preserved");
assert.equal(cover.p, "letter", "letter page size should be preserved");
assert.equal(getCoverTemplateById(cover.t).id, "classic", "Classic cover template should resolve");

const oldLink = normalizeSharedDocument({ k: "resume", t: "modern", d: { name: "Old Link" } });
assert.equal(oldLink.v, 1, "missing version should default to v1");
assert.equal(oldLink.l, "en", "old links without language should default to English");
assert.equal(oldLink.p, "a4", "old links without page size should default to A4");

const oldRtlFallback = normalizeSharedDocument({
  k: "resume",
  t: "modern",
  d: { name: "سارة محمد", sections: [{ heading: "الخبرة العملية", items: ["إدارة فرق الدعم الفني"] }] },
});
assert.equal(oldRtlFallback.l, "ar", "old links with strong RTL content should infer Arabic as fallback");

assert.equal(normalizeSharedDocument({ k: "unknown", d: {} }), null, "invalid shared kind should fail safely");
assert.equal(getResumeTemplateById("missing-template").id, "modern", "invalid resume template should fall back safely");

const sharedSource = fs.readFileSync("src/SharedResume.jsx", "utf8");
assert.ok(sharedSource.includes("ResumePaper"), "shared viewer should import/use ResumePaper");
assert.ok(sharedSource.includes("CoverLetterPaper"), "shared viewer should import/use CoverLetterPaper");
assert.ok(!/function\s+ResumeView\b/.test(sharedSource), "generic ResumeView renderer should be removed");
assert.ok(!/function\s+CoverView\b/.test(sharedSource), "generic CoverView renderer should be removed");
assert.ok(/lang=\{doc\.l\}/.test(sharedSource), "shared document article should receive document language");
assert.ok(/dir=\{resolved\.rtl \? "rtl" : "ltr"\}/.test(sharedSource), "shared document article should receive document direction");
assert.ok(/@media print/.test(sharedSource), "shared viewer should include print styles");

const generatorSource = fs.readFileSync("src/ResumeGenerator.jsx", "utf8");
assert.ok(/v:\s*2,\s*k:\s*"resume"/.test(generatorSource), "resume share payload should use schema v2");
assert.ok(/v:\s*2,\s*k:\s*"cover"/.test(generatorSource), "cover share payload should use schema v2");
assert.ok(/l:\s*docLang/.test(generatorSource), "share payloads should include document language");
assert.ok(/isCustom: Boolean\(form\.sectionTitles\?\.\[key\]\)/.test(generatorSource), "live sections should preserve custom-label metadata");

console.log("share tests passed");
