import assert from "node:assert/strict";
import { RESUME_DRAFT_KEY, createResumeDraftEnvelope, readResumeDraft, writeResumeDraft, clearResumeDraft } from "../src/resumeDraft.js";

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
const envelope = createResumeDraftEnvelope({
  data: { name: "ليلى", summary: "مهندسة برمجيات", experienceEntries: [{ id: "1", title: "مطوّرة", visible: true }] },
  interfaceLanguage: "ar", documentLanguage: "ar", templateId: "modern",
});
assert.equal(envelope.version, 1);
assert.equal(writeResumeDraft(envelope, storage), true);
assert.equal(readResumeDraft(storage).data.summary, "مهندسة برمجيات");
values.set("unrelated", "keep");
assert.equal(clearResumeDraft(storage), true);
assert.equal(values.has(RESUME_DRAFT_KEY), false);
assert.equal(values.get("unrelated"), "keep");
values.set(RESUME_DRAFT_KEY, '{"version":1,"data":{"__proto__":{"polluted":true},"name":"Safe"}}');
assert.equal(readResumeDraft(storage).data.name, "Safe");
assert.equal({}.polluted, undefined);
console.log("✓ resume draft schema, Unicode restore, validation, and scoped clearing passed");
