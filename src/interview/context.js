// Job context (title + company) handed from the Job Tracker to Interview Prep.
//
// It travels as query params on the localized /interview-prep/ route — the same
// mechanism the rest of the app already uses (?ui=, ?docLang=, ?starter=, see
// src/seo/localizedRoutes.js).
//
// Only the WRITE side lives here, because the Job Tracker ships in the initial
// bundle and this module is pulled in with it. The read side lives in the lazy
// interview route (InterviewPrep.jsx) so it stays out of the initial JS budget.
//
// Sanitizing here is UX/defence-in-depth only. These values are user-typed text
// that ends up in an LLM prompt, so the REAL boundary is the equivalent
// sanitizer in the Worker (sanitizeInterviewContextValue in worker.js) — a
// crafted URL or a hand-rolled fetch never passes through this code at all.
export const INTERVIEW_CONTEXT_MAX_CHARS = 120;

// Control chars (Cc) and the Unicode line/paragraph separators (Zl/Zp) collapse
// to a space: they are the only way a value could open a new line and
// impersonate a prompt section once the Worker embeds it in a labelled field.
const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]/gu;

export function sanitizeJobContextValue(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, INTERVIEW_CONTEXT_MAX_CHARS);
}

// Returns "?jobTitle=…&company=…", or "" when there is nothing to pass — so a
// context-less launch produces the plain generic route.
export function jobContextQuery({ jobTitle = "", company = "" } = {}) {
  const params = new URLSearchParams();
  const title = sanitizeJobContextValue(jobTitle);
  const org = sanitizeJobContextValue(company);
  if (title) params.set("jobTitle", title);
  if (org) params.set("company", org);
  const query = params.toString();
  return query ? `?${query}` : "";
}
