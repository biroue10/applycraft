import assert from "node:assert/strict";
import { linkifyText, normalizeLinkHref } from "../src/utils/linkify.js";

const hrefs = (text) => linkifyText(text).filter((part) => part.type === "link").map((part) => part.href);

assert.equal(normalizeLinkHref("https://applycraft.io"), "https://applycraft.io/");
assert.equal(normalizeLinkHref("http://applycraft.io"), "http://applycraft.io/");
assert.equal(normalizeLinkHref("www.applycraft.io"), "https://www.applycraft.io/");
assert.equal(normalizeLinkHref("applycraft.io"), "https://applycraft.io/");
assert.equal(normalizeLinkHref("linkedin.com/in/example"), "https://linkedin.com/in/example");
assert.equal(normalizeLinkHref("hello@example.com"), "mailto:hello@example.com");
assert.equal(normalizeLinkHref("mailto:hello@example.com"), "mailto:hello@example.com");
assert.equal(normalizeLinkHref("+212600000000"), "tel:+212600000000");
assert.equal(normalizeLinkHref("+1 416 000 0000"), "tel:+14160000000");
assert.equal(normalizeLinkHref("javascript:alert(1)"), "");
assert.equal(normalizeLinkHref("data:text/html,hi"), "");
assert.equal(normalizeLinkHref("vbscript:msgbox(1)"), "");
assert.equal(normalizeLinkHref("file:///etc/passwd"), "");

assert.deepEqual(hrefs("No links here."), []);
assert.deepEqual(
  hrefs("Portfolio: www.applycraft.io and hello@applycraft.io"),
  ["https://www.applycraft.io/", "mailto:hello@applycraft.io"],
);
assert.deepEqual(
  hrefs("رابط LinkedIn: https://www.linkedin.com/in/isaac-biroue ورقم +212 600 000 000"),
  ["https://www.linkedin.com/in/isaac-biroue", "tel:+212600000000"],
);

const unsafe = linkifyText("javascript:alert(1) https://applycraft.io");
assert.equal(unsafe.filter((part) => part.type === "link").length, 1);
assert.equal(unsafe.find((part) => part.type === "link").href, "https://applycraft.io/");

console.log("linkify tests passed");
