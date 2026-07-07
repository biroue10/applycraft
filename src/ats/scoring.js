// ──────────────────────────────────────────────────────────────────────────
// ApplyCraft ATS Readiness Score — centralized, documented scoring rules.
//
// IMPORTANT, READ FIRST:
// This score is an ApplyCraft HEURISTIC. It rewards resume structure, content,
// formatting, and keyword practices that commonly help a resume be parsed and
// ranked. It does NOT reproduce the private algorithms of Workday, Greenhouse,
// Taleo, Lever, or any specific applicant tracking system, and it does NOT
// guarantee that a candidate will get an interview. Every ATS differs.
//
// The score starts at 100 and subtracts a fixed number of points per issue,
// by severity. Keeping the weights here (one place) means the standalone ATS
// checker, the live in-builder score, and the static SEO page can never drift.
// ──────────────────────────────────────────────────────────────────────────

// Points deducted per issue, by severity. Documented so the UI can show the
// exact cost of each issue ("why points were deducted").
export const SCORE_WEIGHTS = { critical: 20, warning: 8, info: 3 };

// Compute the 0–100 readiness score from a list of { level } issues.
export function scoreFromIssues(issues) {
  const sum = (issues || []).reduce((n, i) => n + (SCORE_WEIGHTS[i.level] || 0), 0);
  return Math.max(0, 100 - sum);
}

// Points an individual issue costs (for an inline "−N" indicator).
export const issueCost = (issue) => SCORE_WEIGHTS[issue?.level] || 0;

// Readiness bands. `meaning` is descriptive guidance, NOT a promise of outcomes
// and NOT presented as a universal industry threshold.
export const SCORE_BANDS = [
  { min: 80, code: "strong",         label: "Strong",          color: "#4ade80", meaning: "Few readiness issues found by our checks. Still review by hand and tailor to each role." },
  { min: 60, code: "needsWork",      label: "Needs work",      color: "#fbbf24", meaning: "Several fixable issues. Address the flagged items to improve parse-ability." },
  { min: 40, code: "actionRequired", label: "Action required", color: "#fb923c", meaning: "Important elements are missing or weak. Work through the critical issues first." },
  { min: 0,  code: "criticalIssues", label: "Critical issues", color: "#f87171", meaning: "Key sections an ATS relies on appear to be missing. Fix the critical issues before applying." },
];

export function scoreBand(score) {
  return SCORE_BANDS.find((b) => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

// Keyword-match guidance bands (used only when a job description is provided).
// Framed as "stronger / weaker match", never as a guarantee or a fixed rule.
export const KEYWORD_BANDS = [
  { min: 45, tone: "ok",       note: "Reasonable overlap with this job description." },
  { min: 30, tone: "warning",  note: "Some overlap — add more of the role's genuine keywords." },
  { min: 0,  tone: "critical", note: "Low overlap — your resume is missing many of this role's keywords." },
];

export function keywordBand(pct) {
  return KEYWORD_BANDS.find((b) => pct >= b.min) || KEYWORD_BANDS[KEYWORD_BANDS.length - 1];
}

// Short, honest explanation shown next to the score in the UI.
export const READINESS_EXPLAINER =
  "The ApplyCraft ATS Readiness Score is our own heuristic. It reflects common resume " +
  "structure, content, formatting, and keyword practices. It does not reproduce the private " +
  "algorithms of Workday, Greenhouse, Taleo, Lever, or any specific applicant tracking system, " +
  "and it does not guarantee an interview.";
