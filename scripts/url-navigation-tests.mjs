import assert from "node:assert/strict";
import {
  buildInternalUrl,
  localizeRoute,
  normalizeInternalUrl,
  ROUTE_CAPABILITIES,
} from "../src/seo/localizedRoutes.js";

const frenchCover = "/cover-letter/templates/?ui=fr&docLang=fr";
assert.equal(buildInternalUrl("/cover-letter/templates/", {
  interfaceLanguage: "fr",
  documentLanguage: "fr",
  preserveDocumentLanguage: true,
}), frenchCover);

let repeated = frenchCover;
for (let iteration = 0; iteration < 100; iteration += 1) {
  repeated = buildInternalUrl(repeated);
}
assert.equal(repeated, frenchCover, "URL building is idempotent after 100 applications");

assert.equal(
  normalizeInternalUrl("/cover-letter/templates/?ui=fr&docLang=fr?ui=fr&docLang=fr?ui=fr&docLang=fr"),
  frenchCover,
  "historical repeated-question-mark URLs recover their first valid locale values",
);
assert.equal(
  buildInternalUrl("/ats-checker/?ui=fr&docLang=fr&campaign=bad", {
    interfaceLanguage: "fr",
    documentLanguage: "fr",
    preserveDocumentLanguage: true,
  }),
  "/ats-checker/",
  "marketing destinations do not inherit workspace state",
);
assert.equal(
  buildInternalUrl("/resume/templates/?country=canada&ignored=yes#models", {
    interfaceLanguage: "fr",
    documentLanguage: "fr",
    preserveDocumentLanguage: true,
  }),
  "/resume/templates/?ui=fr&docLang=fr&country=canada#models",
  "allowed route state and hashes are retained deterministically",
);
assert.equal(localizeRoute("/pricing/?ui=fr", "fr"), "/fr/pricing/", "localized routes do not duplicate ui state");
assert.equal(localizeRoute("/resume/templates/?country=canada", "fr"), "/fr/modeles-cv/?country=canada", "localized templates retain supported filters");
assert.equal(
  buildInternalUrl("/", { currentHref: "/?ac_checkout=success", preserveAllowedParams: ["ac_checkout"] }),
  "/?ac_checkout=success",
  "checkout completion survives route synchronization until its owner consumes it",
);
assert.equal(normalizeInternalUrl("/pricing/?ui=xx&docLang=<script>"), "/pricing/", "unsupported values are rejected");
assert.equal(normalizeInternalUrl("/pricing/?utm_source=newsletter"), "/pricing/?utm_source=newsletter", "safe current-page attribution is not discarded");
assert.throws(() => buildInternalUrl("https://evil.example/ats-checker/"), /same-origin/, "external origins are rejected");
assert.throws(() => buildInternalUrl("javascript:alert(1)"), /same-origin/, "unsafe protocols are rejected");

for (const value of [
  frenchCover,
  repeated,
  buildInternalUrl("https://applycraft.io/resume-builder/?ui=ar&docLang=ar"),
]) {
  assert.ok((value.match(/\?/g) || []).length <= 1, `${value}: at most one question mark`);
  const parsed = new URL(value, "https://applycraft.io");
  assert.ok(parsed.searchParams.getAll("ui").length <= 1, `${value}: ui is unique`);
  assert.ok(parsed.searchParams.getAll("docLang").length <= 1, `${value}: docLang is unique`);
}

assert.equal(ROUTE_CAPABILITIES["/ats-checker/"], undefined, "ATS has no workspace query capability");
console.log("URL navigation tests passed (idempotency, ownership, normalization, and origin safety).");
