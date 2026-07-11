// Client for the Interview Prep Worker endpoints. Kept in the lazy interview
// chunk. Mirrors the server-side limits in worker.js — keep the two in sync.
export const INTERVIEW_LIMITS = {
  maxJobOfferChars: 6000,
  maxAnswerChars: 2000,
  maxTurns: 8,
};

function errorFromResponse(response) {
  return response
    .json()
    .then((body) => body?.error?.code || "generic")
    .catch(() => "generic");
}

// Streams the recruiter's next question. Calls onDelta(text) per chunk, onMeta
// with { turn, maxTurns }. Resolves with { text, done } or throws { code }.
export async function streamRecruiterQuestion({ jobOffer, locale, level, history, onDelta, onMeta, signal }) {
  let response;
  try {
    response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobOffer, locale, level, history }),
      signal,
    });
  } catch (err) {
    throw { code: err?.name === "AbortError" ? "aborted" : "generic" };
  }

  if (!response.ok) {
    throw { code: await errorFromResponse(response) };
  }

  // The turn-cap path returns plain JSON { done: true } instead of a stream.
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => ({}));
    return { text: "", done: !!body.done };
  }

  if (!response.body) throw { code: "generic" };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let done = false;
  let streamError = null;

  while (true) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let evt;
      try { evt = JSON.parse(payload); } catch { continue; }
      if (evt.meta && onMeta) onMeta(evt.meta);
      if (typeof evt.text === "string") {
        text += evt.text;
        if (onDelta) onDelta(evt.text);
      }
      if (evt.done) done = true;
      if (evt.error) streamError = evt.error;
    }
  }

  if (streamError && !text) throw { code: streamError === "timeout" ? "timeout" : "upstream_failed" };
  return { text: text.trim(), done };
}

// Requests structured feedback. Resolves with the feedback object or throws { code }.
export async function requestFeedback({ jobOffer, locale, level, history, signal }) {
  let response;
  try {
    response = await fetch("/api/interview/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobOffer, locale, level, history }),
      signal,
    });
  } catch (err) {
    throw { code: err?.name === "AbortError" ? "aborted" : "generic" };
  }
  if (!response.ok) throw { code: await errorFromResponse(response) };
  const body = await response.json().catch(() => null);
  if (!body?.ok || !body.feedback) throw { code: "upstream_failed" };
  return body.feedback;
}
