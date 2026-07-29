import assert from "node:assert/strict";
import worker from "../worker.js";

function memoryKv() {
  const values = new Map();
  return {
    values,
    async get(key) { return values.get(key) ?? null; },
    async put(key, value) { values.set(key, value); },
    async delete(key) { values.delete(key); },
  };
}

const kv = memoryKv();
const env = {
  ALLOWED_ORIGINS: "https://applycraft.io",
  APP_ORIGIN: "https://applycraft.io",
  RESEND_API_KEY: "test-secret",
  MAIL_FROM: "ApplyCraft <hello@applycraft.io>",
  SHARES: kv,
};
const originalFetch = globalThis.fetch;
let emailedLink = "";
globalThis.fetch = async (url, init) => {
  if (String(url) === "https://api.resend.com/emails") {
    const body = JSON.parse(init.body);
    emailedLink = body.text.match(/https:\/\/applycraft\.io\/resume-builder\/\?[^\s]+/)?.[0] || "";
    return new Response(JSON.stringify({ id: "email-test" }), { status: 200 });
  }
  return originalFetch(url, init);
};

try {
  const headers = { Origin: "https://applycraft.io", "Content-Type": "application/json" };
  const request = new Request("https://applycraft.io/api/auth/request-link", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: "Person@Example.com",
      consent: true,
      lang: "en",
      returnTo: "/resume-builder/?ui=fr&docLang=fr",
    }),
  });
  const requested = await worker.fetch(request, env);
  assert.equal(requested.status, 200);
  assert.equal((await requested.json()).sent, true);
  assert.match(emailedLink, /^https:\/\/applycraft\.io\/resume-builder\/\?/);
  const loginToken = new URL(emailedLink).searchParams.get("ac_login");
  assert.match(loginToken, /^[a-f0-9]{48}$/);

  const verify = () => worker.fetch(new Request("https://applycraft.io/api/auth/verify", {
    method: "POST",
    headers,
    body: JSON.stringify({ token: loginToken }),
  }), env);
  const verified = await verify();
  assert.equal(verified.status, 200);
  const sessionData = await verified.json();
  assert.match(sessionData.session, /^[a-f0-9]{64}$/);
  assert.equal(sessionData.account.email, "person@example.com");
  assert.equal((await verify()).status, 401, "magic links must be one-time");

  const account = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Authorization: `Bearer ${sessionData.session}` },
  }), env);
  assert.equal(account.status, 200);
  assert.equal((await account.json()).account.email, "person@example.com");

  const forged = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Authorization: `Bearer ${"0".repeat(64)}` },
  }), env);
  assert.equal(forged.status, 401);

  const external = await worker.fetch(new Request("https://applycraft.io/api/auth/request-link", {
    method: "POST",
    headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    body: JSON.stringify({ email: "person@example.com" }),
  }), env);
  assert.equal(external.status, 403);

  console.log("Authentication tests passed.");
} finally {
  globalThis.fetch = originalFetch;
}
