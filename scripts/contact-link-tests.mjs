import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getContactHref, normalizeContactItems } from "../src/utils/contactLinks.js";

const contactItems = [
  { type: "email", value: "biroueisaac@gmail.com" },
  { type: "phone", value: "+33 773406333" },
  { type: "location", value: "maroc" },
  { type: "linkedin", value: "https://www.linkedin.com/in/isaac-biroue" },
  { type: "website", value: "applycraft.io" },
];

assert.deepEqual(contactItems.map(getContactHref), [
  "mailto:biroueisaac@gmail.com",
  "tel:+33773406333",
  "",
  "https://www.linkedin.com/in/isaac-biroue",
  "https://applycraft.io",
]);

assert.deepEqual(
  normalizeContactItems([
    "biroueisaac@gmail.com",
    "+33 773406333",
    "maroc",
    "https://www.linkedin.com/in/isaac-biroue",
    "applycraft.io",
  ]).map((item) => [item.type, item.value, getContactHref(item)]),
  [
    ["email", "biroueisaac@gmail.com", "mailto:biroueisaac@gmail.com"],
    ["phone", "+33 773406333", "tel:+33773406333"],
    ["location", "maroc", ""],
    ["linkedin", "https://www.linkedin.com/in/isaac-biroue", "https://www.linkedin.com/in/isaac-biroue"],
    ["website", "applycraft.io", "https://applycraft.io"],
  ],
);

for (const unsafe of [
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  "blob:https://applycraft.io/123",
]) {
  assert.equal(getContactHref({ type: "website", value: unsafe }), "", `${unsafe} should not be clickable`);
}

assert.equal(getContactHref({ type: "location", value: "Bengerir" }), "", "plain locations should not be clickable");
assert.equal(getContactHref({ type: "website", value: "www.applycraft.io" }), "https://www.applycraft.io");
assert.equal(getContactHref({ type: "linkedin", value: "linkedin.com/in/isaac-biroue" }), "https://linkedin.com/in/isaac-biroue");

const papers = await readFile(new URL("../src/documents/DocumentPapers.jsx", import.meta.url), "utf8");
const app = await readFile(new URL("../src/ResumeGenerator.jsx", import.meta.url), "utf8");

assert.match(papers, /function ContactLink\(\{ item/, "document renderer should use a dedicated ContactLink component");
assert.match(papers, /className="contact-separator"[\s\S]*aria-hidden="true"/, "contact separators should be plain non-link elements");
assert.doesNotMatch(papers, /<a[^>]*>\s*\{values\.map/, "contact rows must not wrap all values in one anchor");
assert.doesNotMatch(app, /textWithLink\(safe\(contact\)/, "PDF export must not link the entire contact string");
assert.match(app, /drawPdfContactItems\(doc, src\.contact/, "resume PDF export should draw contact items independently");
assert.match(app, /drawPdfContactItems\(doc, \[d\.email, d\.phone, d\.location\]/, "cover PDF export should draw contact items independently");

console.log("contact link tests passed");
