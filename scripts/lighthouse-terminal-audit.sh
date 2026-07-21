#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIT_PHASE="${1:-after}"
AUDIT_DIR="$ROOT_DIR/.audit/lighthouse-$AUDIT_PHASE"
PORT="${LIGHTHOUSE_PORT:-4173}"
BASE_URL="http://127.0.0.1:$PORT"
RUNS="${LIGHTHOUSE_RUNS:-3}"

if [[ "$AUDIT_PHASE" != "before" && "$AUDIT_PHASE" != "after" ]]; then
  echo "Usage: $0 [before|after]" >&2
  exit 2
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to summarize Lighthouse JSON." >&2
  exit 2
fi

mkdir -p "$AUDIT_DIR"

CHROME_PATH="$(
  [[ -n "${CHROME_PATH:-}" ]] && printf '%s\n' "$CHROME_PATH" ||
  command -v google-chrome 2>/dev/null ||
  command -v google-chrome-stable 2>/dev/null ||
  command -v chromium 2>/dev/null ||
  command -v chromium-browser 2>/dev/null ||
  find "${HOME:-/nonexistent}/.cache/ms-playwright" -type f -path '*/chrome-linux*/chrome' -print -quit 2>/dev/null ||
  true
)"
if [[ -z "$CHROME_PATH" ]]; then
  echo "No Chromium executable found in PATH." >&2
  exit 2
fi

LIGHTHOUSE_BIN="${LIGHTHOUSE_BIN:-$(command -v lighthouse 2>/dev/null || true)}"
if [[ -z "$LIGHTHOUSE_BIN" ]]; then
  LIGHTHOUSE_BIN="$(find "${HOME:-/nonexistent}/.npm/_npx" -type f -path '*/node_modules/.bin/lighthouse' -print -quit 2>/dev/null || true)"
fi
if [[ -z "$LIGHTHOUSE_BIN" ]]; then
  echo "Lighthouse CLI is unavailable. Install it as a development tool or run through npx once, then retry." >&2
  exit 2
fi

PREVIEW_LOG="$AUDIT_DIR/preview.log"
npm run preview -- --host 127.0.0.1 --port "$PORT" >"$PREVIEW_LOG" 2>&1 &
PREVIEW_PID=$!
cleanup() { kill "$PREVIEW_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

ready=false
for _ in $(seq 1 30); do
  if curl -fsS "$BASE_URL/" >/dev/null; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  echo "Preview did not respond on $BASE_URL. See $PREVIEW_LOG" >&2
  exit 2
fi

run_lighthouse() {
  local route="$1"
  local output="$2"
  CHROME_PATH="$CHROME_PATH" "$LIGHTHOUSE_BIN" "$BASE_URL$route" \
    --quiet \
    --chrome-path="$CHROME_PATH" \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json \
    --output-path="$output"
}

for run in $(seq 1 "$RUNS"); do
  run_lighthouse "/" "$AUDIT_DIR/home-mobile-$run.json"
done

declare -A ROUTES=(
  [fr]="/fr/"
  [ar]="/ar/"
  [resume-builder]="/resume-builder/"
  [ats-checker]="/ats-checker/"
)
for name in fr ar resume-builder ats-checker; do
  run_lighthouse "${ROUTES[$name]}" "$AUDIT_DIR/$name-mobile-1.json"
done

jq -s '
  def median: sort | if length % 2 == 1 then .[length / 2 | floor]
    else (.[length / 2 - 1] + .[length / 2]) / 2 end;
  def values(id): map(.audits[id].numericValue // 0);
  def counts(id): map((.audits[id].details.items // []) | length);
  def savings(pattern): map([
    .audits | to_entries[]
    | select(.key | test(pattern; "i"))
    | (.value.details.overallSavingsBytes // 0)
  ] | add // 0);
  def findings(pattern): [
    .[0].audits | to_entries[]
    | select(.key | test(pattern; "i"))
    | {
        id: .key,
        score: .value.score,
        displayValue: (.value.displayValue // ""),
        itemCount: ((.value.details.items // []) | length)
      }
  ];
  {
    runs: length,
    performance: (map(.categories.performance.score * 100) | median),
    accessibility: (map(.categories.accessibility.score * 100) | median),
    bestPractices: (map(.categories["best-practices"].score * 100) | median),
    seo: (map(.categories.seo.score * 100) | median),
    fcpMs: (values("first-contentful-paint") | median),
    lcpMs: (values("largest-contentful-paint") | median),
    tbtMs: (values("total-blocking-time") | median),
    cls: (values("cumulative-layout-shift") | median),
    speedIndexMs: (values("speed-index") | median),
    totalBytes: (values("total-byte-weight") | median),
    requestCount: (counts("network-requests") | median),
    mainThreadMs: (values("mainthread-work-breakdown") | median),
    bootupMs: (values("bootup-time") | median),
    unusedJavaScriptBytes: (savings("unused-javascript") | median),
    domSize: (values("dom-size") | median),
    longTaskCount: (counts("long-tasks") | median),
    imageSavingsBytes: (savings("image-delivery|uses-responsive-images|uses-optimized-images") | median),
    diagnostics: findings("forced-reflow|non-composited|errors-in-console|inspector-issues|source-map")
  }
' "$AUDIT_DIR"/home-mobile-*.json | tee "$AUDIT_DIR/home-median.json"

if [[ -n "${LIGHTHOUSE_MIN_PERFORMANCE:-}" ]]; then
  score="$(jq -r '.performance' "$AUDIT_DIR/home-median.json")"
  awk -v score="$score" -v minimum="$LIGHTHOUSE_MIN_PERFORMANCE" \
    'BEGIN { exit !(score < minimum) }' && {
      echo "Median performance $score is below required $LIGHTHOUSE_MIN_PERFORMANCE." >&2
      exit 1
    }
fi
