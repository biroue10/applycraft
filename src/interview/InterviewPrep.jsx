import React, { useCallback, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell, SITE_COLORS, HEADER_HEIGHT } from "../siteChrome.jsx";
import { interviewCopy, fmt, INTERVIEW_LOCALES, INTERVIEW_LEVELS } from "./i18n.js";
import { streamRecruiterQuestion, requestFeedback, INTERVIEW_LIMITS } from "./interviewClient.js";
import { useInterviewGate, recordSimulationStart } from "./quota.js";
import { sanitizeJobContextValue } from "./context.js";

const C = SITE_COLORS;

// UI locale comes from the route path (/interview-prep/, /fr/…, /ar/…), resolved
// at render time so the prerendered HTML is correct per locale (RTL for Arabic).
function localeFromPath(pathname = "") {
  if (pathname.startsWith("/ar/")) return "ar";
  if (pathname.startsWith("/fr/")) return "fr";
  return "en";
}

const card = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: 24,
};

const primaryBtn = {
  background: C.grad,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 22px",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

const ghostBtn = {
  background: "transparent",
  color: C.text2,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 650,
  cursor: "pointer",
  fontFamily: "inherit",
};

const fieldLabel = { display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 8 };

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text1,
  fontSize: 14.5,
  fontFamily: "inherit",
  padding: "12px 14px",
};

// Read side of the Job Tracker hand-off (?jobTitle=&company=). It lives in this
// lazy route rather than in context.js so it never lands in the initial bundle —
// the tracker only needs the write side. Values are re-sanitized on the way in
// (they came from a URL) and again in the Worker, which is the real boundary.
function readJobContext(search = "") {
  let params;
  try {
    params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  } catch {
    return { jobTitle: "", company: "", interviewLanguage: "" };
  }
  return {
    jobTitle: sanitizeJobContextValue(params.get("jobTitle")),
    company: sanitizeJobContextValue(params.get("company")),
    interviewLanguage: ["en", "fr", "ar"].includes(params.get("interviewLanguage")) ? params.get("interviewLanguage") : "",
  };
}

// "Preparing for: {jobTitle} at {company}", degrading gracefully when the Job
// Tracker card only had one of the two filled in.
function contextHeadline(c, { jobTitle, company }) {
  if (jobTitle && company) return fmt(c.context.both, { jobTitle, company });
  if (jobTitle) return fmt(c.context.titleOnly, { jobTitle });
  return fmt(c.context.companyOnly, { company });
}

export default function InterviewPrep() {
  const location = useLocation();
  const uiLang = localeFromPath(location.pathname);
  const c = interviewCopy(uiLang);
  const gate = useInterviewGate();

  // Optional job context handed over by the Job Tracker (?jobTitle=&company=).
  // Already sanitized + length-capped; rendered as text, never as HTML. Absent →
  // every branch below falls back to the generic simulator.
  const jobContext = useMemo(() => readJobContext(location.search), [location.search]);
  const hasContext = !!(jobContext.jobTitle || jobContext.company);

  const [phase, setPhase] = useState("setup"); // setup | chat | feedback
  const [jobOffer, setJobOffer] = useState("");
  const [level, setLevel] = useState("junior");
  const [ivLang, setIvLang] = useState(jobContext.interviewLanguage || uiLang);
  const [messages, setMessages] = useState([]); // { role: "assistant" | "user", content }
  const [streamingText, setStreamingText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [meta, setMeta] = useState({ turn: 1, maxTurns: INTERVIEW_LIMITS.maxTurns });
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [gateBlocked, setGateBlocked] = useState(false);

  const abortRef = useRef(null);
  const ivDir = ivLang === "ar" ? "rtl" : "ltr";
  const errorText = error ? (c.errors[error] || c.errors.generic) : "";

  const jobOfferError = useMemo(() => {
    if (!jobOffer.trim()) return "required";
    if (jobOffer.length > INTERVIEW_LIMITS.maxJobOfferChars) return "long";
    return "";
  }, [jobOffer]);

  const runNextQuestion = useCallback(async (history) => {
    setError("");
    setStreaming(true);
    setStreamingText("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await streamRecruiterQuestion({
        jobOffer,
        locale: ivLang,
        level,
        history,
        jobTitle: jobContext.jobTitle,
        company: jobContext.company,
        signal: controller.signal,
        onMeta: (m) => setMeta(m),
        onDelta: (t) => setStreamingText((prev) => prev + t),
      });
      if (result.done && !result.text) {
        // Hard cap reached — auto-offer feedback.
        await generateFeedback(history);
        return;
      }
      if (result.text) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
      }
    } catch (err) {
      if (err?.code !== "aborted") setError(err?.code === "rate_limited" ? "rate_limited" : err?.code || "generic");
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  }, [jobOffer, ivLang, level, jobContext]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateFeedback = useCallback(async (history) => {
    if (!history.length) return;
    setError("");
    setLoadingFeedback(true);
    setPhase("feedback");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const fb = await requestFeedback({
        jobOffer,
        locale: ivLang,
        level,
        history,
        jobTitle: jobContext.jobTitle,
        company: jobContext.company,
        signal: controller.signal,
      });
      setFeedback(fb);
    } catch (err) {
      if (err?.code !== "aborted") setError(err?.code === "rate_limited" ? "rate_limited" : err?.code || "generic");
    } finally {
      setLoadingFeedback(false);
    }
  }, [jobOffer, ivLang, level, jobContext]);

  const startSimulation = useCallback(() => {
    if (jobOfferError) return;
    if (!gate.canStart) {
      setGateBlocked(true);
      return;
    }
    recordSimulationStart();
    setMessages([]);
    setFeedback(null);
    setPhase("chat");
    runNextQuestion([]);
  }, [jobOfferError, gate, runNextQuestion]);

  const submitAnswer = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed || streaming) return;
    const history = [...messages, { role: "user", content: trimmed.slice(0, INTERVIEW_LIMITS.maxAnswerChars) }];
    setMessages(history);
    setAnswer("");
    runNextQuestion(history);
  }, [answer, streaming, messages, runNextQuestion]);

  const finishNow = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    generateFeedback(messages);
  }, [messages, generateFeedback]);

  const restart = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setPhase("setup");
    setMessages([]);
    setFeedback(null);
    setStreamingText("");
    setStreaming(false);
    setAnswer("");
    setError("");
    setGateBlocked(false);
  }, []);

  const askedCount = messages.filter((m) => m.role === "assistant").length;
  const displayTurn = Math.min(streaming ? askedCount + 1 : Math.max(askedCount, 1), INTERVIEW_LIMITS.maxTurns);

  return (
    <AppShell lang={uiLang} activeId="interview" currentPath={location.pathname}>
      <style suppressHydrationWarning>{`
        .ac-iv-main { flex: 1; padding: calc(${HEADER_HEIGHT}px + 2rem) 1rem 4rem; }
        .ac-iv-wrap { max-width: 760px; margin: 0 auto; width: 100%; }
        .ac-iv-msg { border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; font-size: 14.5px; line-height: 1.6; }
        .ac-iv-msg-r { background: ${C.elevated}; border: 1px solid ${C.border}; color: ${C.text1}; }
        .ac-iv-msg-u { background: rgba(99,102,241,0.12); border: 1px solid ${C.borderHi}; color: ${C.text1}; }
        .ac-iv-role { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${C.text3}; margin-bottom: 6px; }
        .ac-iv-chip { display:inline-block; font-size:12px; font-weight:700; color:${C.accent2}; background:${C.accent}18; border-radius:999px; padding:4px 12px; }
        @media (max-width: 720px) { .ac-iv-main { padding: calc(60px + 1.25rem) 0.85rem 3rem; } }
      `}</style>

      <main id="main-content" tabIndex={-1} className="ac-iv-main">
        <div className="ac-iv-wrap">
          <header style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text1, margin: "0 0 10px" }}>{c.heading}</h1>
            <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.6, margin: 0 }}>{c.subheading}</p>

            {/* Launched from a Job Tracker card at the "Interview" stage. The values
                are plain text (sanitized on read, re-sanitized in the Worker) and are
                rendered as text by React — never as markup. */}
            {hasContext ? (
              <div dir={ivDir} style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12,
                background: `${C.accent}12`, border: `1px solid ${C.borderHi}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
                  color: C.text3, marginBottom: 4 }}>{c.context.badge}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>
                  {contextHeadline(c, jobContext)}
                </div>
              </div>
            ) : null}
          </header>

          {errorText ? (
            <div role="alert" style={{ ...card, padding: "14px 16px", borderColor: C.borderHi, marginBottom: 16, color: C.text1, fontSize: 14 }}>
              {errorText}
            </div>
          ) : null}

          {phase === "setup" ? (
            <SetupScreen
              c={c}
              card={card}
              jobOffer={jobOffer}
              setJobOffer={setJobOffer}
              jobOfferError={jobOfferError}
              level={level}
              setLevel={setLevel}
              ivLang={ivLang}
              setIvLang={setIvLang}
              onStart={startSimulation}
              gate={gate}
              gateBlocked={gateBlocked}
            />
          ) : null}

          {phase === "chat" ? (
            <section aria-label={c.heading}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="ac-iv-chip">{fmt(c.chat.counter, { n: displayTurn, max: INTERVIEW_LIMITS.maxTurns })}</span>
                <button type="button" style={ghostBtn} onClick={restart}>{c.chat.restart}</button>
              </div>

              <div dir={ivDir}>
                {messages.map((m, i) => (
                  <div key={i} className={`ac-iv-msg ${m.role === "assistant" ? "ac-iv-msg-r" : "ac-iv-msg-u"}`}>
                    <div className="ac-iv-role">{m.role === "assistant" ? c.chat.recruiter : c.chat.you}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  </div>
                ))}
                {streaming ? (
                  <div className="ac-iv-msg ac-iv-msg-r" aria-live="polite">
                    <div className="ac-iv-role">{c.chat.recruiter}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{streamingText || <span style={{ color: C.text3 }}>{c.chat.thinking}</span>}</div>
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: 16 }}>
                <label htmlFor="ac-iv-answer" style={fieldLabel}>{c.chat.you}</label>
                <textarea
                  id="ac-iv-answer"
                  dir={ivDir}
                  value={answer}
                  maxLength={INTERVIEW_LIMITS.maxAnswerChars}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={c.chat.answerPlaceholder}
                  rows={4}
                  disabled={streaming || loadingFeedback}
                  style={{ ...inputBase, resize: "vertical", minHeight: 96 }}
                />
                <div style={{ fontSize: 12, color: C.text3, marginTop: 6, textAlign: ivDir === "rtl" ? "left" : "right" }}>
                  {fmt(c.chat.answerHint, { count: answer.length, max: INTERVIEW_LIMITS.maxAnswerChars })}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                  <button type="button" style={{ ...primaryBtn, opacity: !answer.trim() || streaming ? 0.55 : 1 }}
                    disabled={!answer.trim() || streaming || loadingFeedback} onClick={submitAnswer}>
                    {c.chat.send}
                  </button>
                  <button type="button" style={ghostBtn} disabled={!askedCount || loadingFeedback} onClick={finishNow}>
                    {c.chat.finish}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {phase === "feedback" ? (
            <FeedbackScreen c={c} card={card} ivDir={ivDir} feedback={feedback} loading={loadingFeedback} onRestart={restart} />
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}

function SetupScreen({ c, card, jobOffer, setJobOffer, jobOfferError, level, setLevel, ivLang, setIvLang, onStart, gate, gateBlocked }) {
  const selectStyle = {
    ...inputBase,
    backgroundColor: C.elevated,
    color: C.text1,
    borderColor: C.borderHi,
    colorScheme: "dark",
    appearance: "auto",
    cursor: "pointer",
  };
  return (
    <form
      style={card}
      onSubmit={(e) => { e.preventDefault(); onStart(); }}
    >
      <style>{`
        .ac-interview-select {
          color-scheme: dark;
        }
        .ac-interview-select option {
          background-color: ${C.elevated};
          color: ${C.text1};
        }
        .ac-interview-select option:hover,
        .ac-interview-select option:checked {
          background-color: ${C.borderHi};
          color: ${C.text1};
        }
        .ac-interview-select option:disabled {
          background-color: ${C.elevated};
          color: ${C.text3};
        }
        .ac-interview-select:focus-visible {
          border-color: ${C.accent2};
          outline: 3px solid ${C.accent2};
          outline-offset: 2px;
        }
      `}</style>
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="ac-iv-offer" style={fieldLabel}>{c.setup.jobOfferLabel}</label>
        <textarea
          id="ac-iv-offer"
          value={jobOffer}
          maxLength={INTERVIEW_LIMITS.maxJobOfferChars}
          onChange={(e) => setJobOffer(e.target.value)}
          placeholder={c.setup.jobOfferPlaceholder}
          rows={8}
          style={{ ...inputBase, resize: "vertical", minHeight: 160 }}
        />
        <div style={{ fontSize: 12, color: jobOfferError === "long" ? C.danger : C.text3, marginTop: 6 }}>
          {fmt(c.setup.jobOfferHint, { count: jobOffer.length, max: INTERVIEW_LIMITS.maxJobOfferChars })}
        </div>
        {jobOfferError === "long" ? (
          <div role="alert" style={{ fontSize: 12.5, color: C.danger, marginTop: 6 }}>
            {fmt(c.validation.jobOfferTooLong, { max: INTERVIEW_LIMITS.maxJobOfferChars })}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="ac-iv-lang" style={fieldLabel}>{c.setup.languageLabel}</label>
          <select className="ac-interview-select" id="ac-iv-lang" value={ivLang} onChange={(e) => setIvLang(e.target.value)} style={selectStyle}>
            {INTERVIEW_LOCALES.map((code) => (
              <option key={code} value={code}>{c.languages[code]}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="ac-iv-level" style={fieldLabel}>{c.setup.levelLabel}</label>
          <select className="ac-interview-select" id="ac-iv-level" value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            {INTERVIEW_LEVELS.map((code) => (
              <option key={code} value={code}>{c.levels[code]}</option>
            ))}
          </select>
        </div>
      </div>

      {gateBlocked || !gate.canStart ? (
        <div role="status" style={{ background: C.elevated, border: `1px solid ${C.borderHi}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 6 }}>{c.quota.reachedTitle}</div>
          <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>{c.quota.reachedBody}</div>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 18 }}>{fmt(c.quota.left, { n: gate.left })}</div>
      )}

      <button type="submit" style={{ ...primaryBtn, opacity: jobOfferError || !gate.canStart ? 0.55 : 1 }}
        disabled={!!jobOfferError || !gate.canStart}
        aria-disabled={!!jobOfferError || !gate.canStart}>
        {c.setup.startBtn}
      </button>

      <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, margin: "18px 0 0" }}>{c.setup.privacyNotice}</p>
    </form>
  );
}

function FeedbackScreen({ c, card, ivDir, feedback, loading, onRestart }) {
  if (loading && !feedback) {
    return <div style={{ ...card, textAlign: "center", color: C.text2 }}>{c.feedback.generating}</div>;
  }
  if (!feedback) {
    return (
      <div style={card}>
        <button type="button" style={ghostBtn} onClick={onRestart}>{c.feedback.startOver}</button>
      </div>
    );
  }
  const list = (title, items) => items.length ? (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text1, margin: "0 0 10px" }}>{title}</h2>
      <ul style={{ margin: 0, paddingInlineStart: 20, color: C.text2, fontSize: 14, lineHeight: 1.7 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  ) : null;

  return (
    <div dir={ivDir}>
      <div style={{ ...card, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, margin: "0 0 4px" }}>{c.feedback.heading}</h2>
          {feedback.summary ? <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 460 }}>{feedback.summary}</p> : null}
        </div>
        {feedback.score != null ? (
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.text3 }}>{c.feedback.score}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.accent2 }}>{fmt(c.feedback.scoreOutOf, { score: feedback.score })}</div>
          </div>
        ) : null}
      </div>

      <div style={card}>
        {list(c.feedback.strengths, feedback.strengths)}
        {list(c.feedback.improvements, feedback.improvements)}
        {feedback.rephrasings.length ? (
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text1, margin: "0 0 10px" }}>{c.feedback.rephrasings}</h2>
            {feedback.rephrasings.map((r, i) => (
              <div key={i} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                {r.question ? <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 6 }}><strong>{c.feedback.questionLabel}:</strong> {r.question}</div> : null}
                <div style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.6 }}><strong>{c.feedback.suggestionLabel}:</strong> {r.suggestion}</div>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ marginTop: 12 }}>
          <button type="button" style={primaryBtn} onClick={onRestart}>{c.feedback.startOver}</button>
        </div>
      </div>
    </div>
  );
}
