import assert from "node:assert/strict";
import fs from "node:fs";

const values = new Map();
globalThis.localStorage = {
  getItem(key) { return values.get(key) ?? null; },
  setItem(key, value) { values.set(key, String(value)); },
  removeItem(key) { values.delete(key); },
};

const token = "a".repeat(48);
let currentUrl = `https://applycraft.io/resume-builder/?ui=en&ac_login=${token}`;
globalThis.window = {
  location: { get href() { return currentUrl; } },
  history: {
    replaceState(_state, _title, nextUrl) { currentUrl = String(nextUrl); },
  },
};

let verifyCalls = 0;
globalThis.fetch = async (url, init) => {
  assert.equal(url, "/api/auth/verify");
  assert.equal(JSON.parse(init.body).token, token);
  verifyCalls += 1;
  await new Promise((resolve) => setTimeout(resolve, 5));
  return new Response(JSON.stringify({
    session: "b".repeat(64),
    account: { email: "person@example.com", activePass: false, passExpires: null },
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};

const { consumeLoginFromUrl } = await import("../src/account.js");
const [first, second] = await Promise.all([
  consumeLoginFromUrl(),
  consumeLoginFromUrl(),
]);

assert.equal(verifyCalls, 1, "concurrent mounts must exchange a magic link only once");
assert.equal(first.email, "person@example.com");
assert.equal(second.email, "person@example.com");
assert.equal(new URL(currentUrl).searchParams.has("ac_login"), false);

const resumeGeneratorSource = fs.readFileSync(
  new URL("../src/ResumeGenerator.jsx", import.meta.url),
  "utf8",
);
assert.doesNotMatch(
  resumeGeneratorSource,
  /setCurrentUser\s*\(\s*savedAccount\s*\)/,
  "browser-state restoration must not overwrite the server-verified account",
);
assert.match(
  resumeGeneratorSource,
  /REQUIRE_RESUME_LOGIN\s*&&\s*appView\s*===\s*["']app["']\s*&&\s*navPage\s*===\s*["']resume["']/,
  "the complete resume workspace, including template previews, must require a verified session",
);
assert.doesNotMatch(
  resumeGeneratorSource,
  /REQUIRE_RESUME_LOGIN\s*&&\s*navPage\s*===\s*["']resume["']\s*&&\s*step\s*===\s*["']form["']/,
  "authentication must not be limited to the editor while leaving the template gallery public",
);
assert.equal(JSON.parse(values.get("ac_session")), "b".repeat(64));

console.log("Authentication client concurrency test passed.");
