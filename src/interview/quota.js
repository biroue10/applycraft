// Client-side session quota for interview simulations.
//
// This is UX ONLY — a friendly counter and an upsell hook. It is trivially
// bypassable (sessionStorage), so the REAL cost protection is the per-IP daily
// cap enforced in the Worker (checkInterviewQuota in worker.js). Never rely on
// this for billing/abuse control.
const STORAGE_KEY = "ac_interview_sims";
export const FREE_SIMULATIONS_PER_SESSION = 2;

function read() {
  if (typeof sessionStorage === "undefined") return 0;
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

export function simulationsUsed() {
  return read();
}

export function simulationsLeft() {
  return Math.max(0, FREE_SIMULATIONS_PER_SESSION - read());
}

export function canStartSimulation() {
  return simulationsLeft() > 0;
}

export function recordSimulationStart() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(read() + 1));
  } catch {
    // Session storage unavailable (private mode / disabled) — the server cap
    // still applies, so failing open here is acceptable.
  }
}

// Gating hook. A future payment integration (Lemon Squeezy / Paddle) can wrap
// this to grant unlimited access to entitled users without touching the UI.
export function useInterviewGate() {
  return {
    left: simulationsLeft(),
    canStart: canStartSimulation(),
    recordStart: recordSimulationStart,
  };
}
