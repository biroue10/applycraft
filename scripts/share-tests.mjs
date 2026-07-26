import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildPrivateShareUrl,
  decodeShare,
  encodeShare,
  normalizeSharedDocument,
} from "../src/share.js";
import { isResumeDataEmpty, normalizeResumeData } from "../src/resumeData.js";
import { getCoverTemplateById, getResumeTemplateById } from "../src/documents/templateRegistry.js";
import { isRtlLang } from "../src/i18n/languages.js";
import worker from "../worker.js";

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

const privateUrl = buildPrivateShareUrl(arabicModernResume, "https://applycraft.io");
assert.match(privateUrl, /^https:\/\/applycraft\.io\/r#/, "private offline links should use the legacy hash route");
assert.ok(privateUrl.length > "https://applycraft.io/r#".length, "private offline links should include an encoded payload");

class MemoryKv {
  constructor() {
    this.values = new Map();
  }

  async get(key) {
    return this.values.get(key) || null;
  }

  async put(key, value) {
    this.values.set(key, value);
  }

  async delete(key) {
    this.values.delete(key);
  }
}

const shareKv = new MemoryKv();
const shareEnv = {
  SHARES: shareKv,
  APP_ORIGIN: "https://applycraft.io",
  ALLOWED_ORIGINS: "https://applycraft.io",
  ENABLE_DEV_ORIGINS: "false",
};
const createResponse = await worker.fetch(new Request("https://applycraft.io/api/share", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://applycraft.io",
  },
  body: JSON.stringify({ payload: arabicModernResume, expiresInDays: 30 }),
}), shareEnv);
assert.equal(createResponse.status, 201, "short-link API should create a stored share");
const createdShare = await createResponse.json();
assert.match(createdShare.url, /^https:\/\/applycraft\.io\/r\/[A-Za-z0-9_-]{10}$/, "short-link API should return a compact viewer URL");
const readResponse = await worker.fetch(new Request(`https://applycraft.io/api/share/${createdShare.shareId}`), shareEnv);
assert.equal(readResponse.status, 200, "stored short link should be readable");
const readShare = await readResponse.json();
assert.equal(readShare.payload.d.name, arabicModernResume.d.name, "stored short link should preserve document data");

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
assert.deepEqual(oldLink.d.contact, [], "old links missing contact should normalize contact to an empty array");
assert.deepEqual(oldLink.d.sections, [], "old links missing sections should normalize sections to an empty array");

const emptyResume = normalizeResumeData({});
assert.deepEqual(emptyResume.contact, [], "empty resume contact should default to []");
assert.deepEqual(emptyResume.sections, [], "empty resume sections should default to []");
assert.deepEqual(emptyResume.skills, [], "empty resume skills should default to []");
assert.deepEqual(emptyResume.languages, [], "empty resume languages should default to []");
assert.deepEqual(emptyResume.certifications, [], "empty resume certifications should default to []");
assert.deepEqual(emptyResume.projects, [], "empty resume projects should default to []");
assert.deepEqual(emptyResume.education, [], "empty resume education should default to []");
assert.deepEqual(emptyResume.experience, [], "empty resume experience should default to []");
assert.equal(isResumeDataEmpty(emptyResume), true, "empty resume should be detected");
assert.equal(isResumeDataEmpty({ name: "Isaac Biroue" }), false, "partial resume with a name should not be empty");
assert.deepEqual(normalizeResumeData({ sections: [{ heading: "Experience" }] }).sections[0].items, [], "missing section items should default to []");
assert.deepEqual(normalizeResumeData({ name: "Isaac", contact: undefined }).contact, [], "missing contact should default to []");

const oldRtlFallback = normalizeSharedDocument({
  k: "resume",
  t: "modern",
  d: { name: "سارة محمد", sections: [{ heading: "الخبرة العملية", items: ["إدارة فرق الدعم الفني"] }] },
});
assert.equal(oldRtlFallback.l, "ar", "old links with strong RTL content should infer Arabic as fallback");

assert.equal(normalizeSharedDocument({ k: "unknown", d: {} }), null, "invalid shared kind should fail safely");
assert.equal(getResumeTemplateById("missing-template").id, "modern", "invalid resume template should fall back safely");

const sharedSource = fs.readFileSync("src/SharedResume.jsx", "utf8");
const documentPapersSource = fs.readFileSync("src/documents/DocumentPapers.jsx", "utf8");
assert.ok(sharedSource.includes("ResumePaper"), "shared viewer should import/use ResumePaper");
assert.ok(sharedSource.includes("CoverLetterPaper"), "shared viewer should import/use CoverLetterPaper");
assert.ok(documentPapersSource.includes("LinkifiedText"), "shared document renderer should linkify resume and cover-letter text");
assert.ok(/لغة\|لغات\|اللغات/.test(documentPapersSource), "Arabic language sections should render as compact tag/sidebar sections");
assert.ok(documentPapersSource.includes("function ContactLink"), "contact items should render through dedicated contact links");
assert.ok(/<LinkifiedText text=\{bullet\}/.test(documentPapersSource), "resume bullets should render with linkified text");
assert.ok(/<LinkifiedText text=\{p\}/.test(documentPapersSource), "cover-letter paragraphs should render with linkified text");
assert.ok(!/function\s+ResumeView\b/.test(sharedSource), "generic ResumeView renderer should be removed");
assert.ok(!/function\s+CoverView\b/.test(sharedSource), "generic CoverView renderer should be removed");
assert.ok(/lang=\{doc\.l\}/.test(sharedSource), "shared document article should receive document language");
assert.ok(/dir=\{resolved\.rtl \? "rtl" : "ltr"\}/.test(sharedSource), "shared document article should receive document direction");
assert.ok(/@media print/.test(sharedSource), "shared viewer should include print styles");
assert.ok(sharedSource.includes("SharedDocumentErrorBoundary"), "shared viewer should wrap documents in an error boundary");
assert.ok(sharedSource.includes("This shared résumé could not be displayed."), "shared viewer should include friendly English render fallback");
assert.ok(sharedSource.includes("Ce CV partagé n’a pas pu être affiché."), "shared viewer should include friendly French render fallback");
assert.ok(sharedSource.includes("تعذر عرض السيرة الذاتية المشتركة."), "shared viewer should include friendly Arabic render fallback");

const generatorSource = fs.readFileSync("src/ResumeGenerator.jsx", "utf8");
const enStatusSource = fs.readFileSync("src/i18n/namespaces/en/status.js", "utf8");
assert.ok(/v:\s*2,\s*k:\s*"resume"/.test(generatorSource), "resume share payload should use schema v2");
assert.ok(/v:\s*2,\s*k:\s*"cover"/.test(generatorSource), "cover share payload should use schema v2");
assert.ok(/l:\s*docLang/.test(generatorSource), "share payloads should include document language");
assert.ok(/isCustom: Boolean\(form\.sectionTitles\?\.\[key\]\)/.test(generatorSource), "live sections should preserve custom-label metadata");
assert.ok(generatorSource.includes("shareCreate"), "share UI should read short-link labels from translations");
assert.ok(generatorSource.includes("shareCreateOffline"), "share UI should preserve the private offline-link option");
assert.ok(generatorSource.includes("shareEmptyResume"), "share UI should warn before sharing an empty resume");
assert.ok(generatorSource.includes("downloadEmptyResume"), "export UI should warn before downloading an empty resume");
assert.ok(generatorSource.includes("isResumeDataEmpty"), "resume share/export flow should check empty resume data");
assert.ok(generatorSource.includes("shareStored"), "share UI should explain short-link storage");
assert.ok(generatorSource.includes("shareOfflineStored"), "share UI should explain why offline links can be long");
assert.ok(enStatusSource.includes("Create short link"), "share UI should label short links clearly");
assert.ok(enStatusSource.includes("Create private offline link"), "share UI should retain private offline links");
assert.ok(generatorSource.includes("createShortShareLink"), "default share menu should call the storage-backed short-link API");

console.log("share tests passed");
