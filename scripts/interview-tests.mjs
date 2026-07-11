import assert from "node:assert/strict";
import { __securityTest } from "../worker.js";

const {
  validateInterviewRequest,
  parseInterviewFeedback,
  buildInterviewMessages,
  countAssistantTurns,
  INTERVIEW_MAX_JOB_OFFER_CHARS,
  INTERVIEW_MAX_ANSWER_CHARS,
  INTERVIEW_MAX_HISTORY,
} = __securityTest;

let failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  fail ${name}`);
    console.error(`       ${error.message}`);
  }
}

const okBody = { jobOffer: "We are hiring a backend engineer.", locale: "en", level: "junior" };

test("accepts a valid interview request", () => {
  const result = validateInterviewRequest({ ...okBody });
  assert.ok(result.value, "expected value");
  assert.equal(result.value.locale, "en");
  assert.deepEqual(result.value.history, []);
});

test("rejects a missing / empty job offer", () => {
  assert.ok(validateInterviewRequest({ locale: "en", level: "junior" }).error);
  assert.ok(validateInterviewRequest({ ...okBody, jobOffer: "   " }).error);
});

test("rejects an oversized job offer (>6000 chars)", () => {
  const big = validateInterviewRequest({ ...okBody, jobOffer: "x".repeat(INTERVIEW_MAX_JOB_OFFER_CHARS + 1) });
  assert.ok(big.error);
  assert.equal(big.error[0], "bad_request");
  assert.equal(big.error[2], 413);
});

test("rejects an invalid locale", () => {
  const bad = validateInterviewRequest({ ...okBody, locale: "de" });
  assert.ok(bad.error);
  assert.equal(bad.error[0], "bad_request");
});

test("rejects an invalid level", () => {
  assert.ok(validateInterviewRequest({ ...okBody, level: "expert" }).error);
});

test("rejects unknown fields", () => {
  assert.ok(validateInterviewRequest({ ...okBody, evil: 1 }).error);
});

test("rejects prototype-pollution keys", () => {
  const bad = JSON.parse('{"jobOffer":"x","locale":"en","level":"junior","__proto__":{"x":1}}');
  assert.ok(validateInterviewRequest(bad).error);
});

test("rejects an over-cap history", () => {
  const history = Array.from({ length: INTERVIEW_MAX_HISTORY + 1 }, (_, i) => ({
    role: i % 2 === 0 ? "assistant" : "user",
    content: "hi",
  }));
  const bad = validateInterviewRequest({ ...okBody, history });
  assert.ok(bad.error);
  assert.equal(bad.error[0], "bad_request");
});

test("rejects an oversized history answer (>2000 chars)", () => {
  const bad = validateInterviewRequest({
    ...okBody,
    history: [{ role: "assistant", content: "Q1?" }, { role: "user", content: "x".repeat(INTERVIEW_MAX_ANSWER_CHARS + 1) }],
  });
  assert.ok(bad.error);
});

test("rejects an invalid history role", () => {
  assert.ok(validateInterviewRequest({ ...okBody, history: [{ role: "system", content: "hi" }] }).error);
});

test("feedback endpoint requires a transcript", () => {
  assert.ok(validateInterviewRequest({ ...okBody }, { requireHistory: true }).error);
  const ok = validateInterviewRequest(
    { ...okBody, history: [{ role: "assistant", content: "Q1?" }, { role: "user", content: "A1" }] },
    { requireHistory: true }
  );
  assert.ok(ok.value);
});

test("messages start with a user turn and alternate", () => {
  const messages = buildInterviewMessages({
    jobOffer: "job",
    locale: "en",
    level: "junior",
    history: [{ role: "assistant", content: "Q1?" }, { role: "user", content: "A1" }],
  });
  assert.equal(messages[0].role, "user");
  for (let i = 1; i < messages.length; i += 1) {
    assert.notEqual(messages[i].role, messages[i - 1].role, "roles must alternate");
  }
  assert.equal(messages[messages.length - 1].role, "user");
});

test("counts recruiter (assistant) turns", () => {
  assert.equal(countAssistantTurns([{ role: "assistant", content: "a" }, { role: "user", content: "b" }, { role: "assistant", content: "c" }]), 2);
});

test("parses clean feedback JSON", () => {
  const raw = JSON.stringify({
    strengths: ["Clear communication"],
    improvements: ["Add metrics"],
    rephrasings: [{ question: "Tell me about yourself", suggestion: "I am a backend engineer with 2 years..." }],
    score: 74,
    summary: "Solid overall.",
  });
  const fb = parseInterviewFeedback(raw);
  assert.equal(fb.score, 74);
  assert.equal(fb.strengths.length, 1);
  assert.equal(fb.rephrasings.length, 1);
});

test("parses feedback wrapped in markdown fences / prose (fallback)", () => {
  const raw = "Here is your feedback:\n```json\n" + JSON.stringify({ strengths: ["x"], improvements: [], rephrasings: [], score: 50, summary: "ok" }) + "\n```";
  const fb = parseInterviewFeedback(raw);
  assert.ok(fb, "fallback should recover JSON");
  assert.equal(fb.score, 50);
});

test("clamps out-of-range score and oversized arrays", () => {
  const fb = parseInterviewFeedback(JSON.stringify({
    strengths: Array.from({ length: 20 }, (_, i) => `s${i}`),
    improvements: [],
    rephrasings: [],
    score: 250,
    summary: "",
  }));
  assert.equal(fb.score, 100);
  assert.ok(fb.strengths.length <= 4);
});

test("returns null on unrecoverable feedback", () => {
  assert.equal(parseInterviewFeedback("not json at all"), null);
});

if (failed) {
  console.error(`\n✗ interview guard: ${failed} test(s) failed.`);
  process.exit(1);
}
console.log("\n✓ interview guard: all interview API validation tests passed.");
