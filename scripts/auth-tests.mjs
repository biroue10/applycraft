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
let emailedHtml = "";
globalThis.fetch = async (url, init) => {
  if (String(url) === "https://api.resend.com/emails") {
    const body = JSON.parse(init.body);
    emailedLink = body.text.match(/https:\/\/applycraft\.io\/api\/auth\/callback\?[^\s]+/)?.[0] || "";
    emailedHtml = body.html || "";
    return new Response(JSON.stringify({ id: "email-test" }), { status: 200 });
  }
  return originalFetch(url, init);
};

try {
  const headers = { Origin: "https://applycraft.io", "Content-Type": "application/json" };
  const anonymous = await worker.fetch(new Request("https://applycraft.io/api/account"), env);
  assert.equal(anonymous.status, 200, "a visitor with no credentials must not generate an expected 401");
  assert.deepEqual(await anonymous.json(), { ok: true, account: null });

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
  assert.match(emailedLink, /^https:\/\/applycraft\.io\/api\/auth\/callback\?/);
  assert.match(emailedHtml, /Apply<span style="color:#5570ff;">Craft<\/span>/);
  assert.match(emailedHtml, /Sign in to ApplyCraft/);
  assert.match(emailedHtml, /android-chrome-192x192\.png/);
  assert.ok(emailedHtml.includes(emailedLink), "HTML email must contain the secure callback link");
  const loginToken = new URL(emailedLink).searchParams.get("token");
  assert.match(loginToken, /^[a-f0-9]{48}$/);

  const callback = await worker.fetch(new Request(emailedLink), env);
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get("Location"), "https://applycraft.io/resume-builder/?ui=fr&docLang=fr");
  assert.match(callback.headers.get("Set-Cookie") || "", /^ac_session=[a-f0-9]{64};/);
  const cookieSession = (callback.headers.get("Set-Cookie") || "").match(/^ac_session=([a-f0-9]{64});/)?.[1];

  const verify = () => worker.fetch(new Request("https://applycraft.io/api/auth/verify", {
    method: "POST",
    headers,
    body: JSON.stringify({ token: loginToken }),
  }), env);
  const verified = await verify();
  assert.equal(verified.status, 200);
  const sessionData = await verified.json();
  assert.match(sessionData.session, /^[a-f0-9]{64}$/);
  assert.equal(sessionData.session, cookieSession);
  assert.equal(sessionData.account.email, "person@example.com");
  const retried = await verify();
  assert.equal(retried.status, 200, "email scanners must not consume the recipient's login");
  const retriedData = await retried.json();
  assert.equal(retriedData.session, sessionData.session, "the safe retry window must reuse the same session");

  const account = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Cookie: `ac_session=${cookieSession}` },
  }), env);
  assert.equal(account.status, 200);
  assert.equal((await account.json()).account.email, "person@example.com");

  const signedOut = await worker.fetch(new Request("https://applycraft.io/api/auth/logout", {
    method: "POST",
    headers: { ...headers, Cookie: `ac_session=${cookieSession}` },
    body: JSON.stringify({}),
  }), env);
  assert.equal(signedOut.status, 200);
  assert.match(signedOut.headers.get("Set-Cookie") || "", /^ac_session=;.*Max-Age=0/);
  assert.equal(kv.values.has(`session:${cookieSession}`), false, "sign-out must invalidate the server session");
  const accountAfterSignOut = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Cookie: `ac_session=${cookieSession}` },
  }), env);
  assert.equal(accountAfterSignOut.status, 401);

  const forged = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Authorization: `Bearer ${"0".repeat(64)}` },
  }), env);
  assert.equal(forged.status, 401);

  const malformedCookie = await worker.fetch(new Request("https://applycraft.io/api/account", {
    headers: { Cookie: "ac_session=not-a-valid-session" },
  }), env);
  assert.equal(malformedCookie.status, 401, "explicit malformed credentials must not be treated as anonymous");

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
