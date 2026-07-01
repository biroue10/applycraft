# Security notes & required configuration

## Response headers (`public/_headers`)
Applied to all responses: a restrictive CSP (`default-src 'self'`, `object-src
'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`),
HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, a locked-down
`Permissions-Policy`, `Cross-Origin-Opener-Policy` and
`Cross-Origin-Resource-Policy: same-origin`.

### `script-src 'unsafe-inline'` — why it's still there, how to remove it
Every prerendered/static page embeds inline `<script type="application/ld+json">`
structured data, and a couple of static tools use small inline scripts. On
static hosting a global `_headers` CSP cannot carry a per-request nonce, so
`'unsafe-inline'` is currently required for those inline blocks.

To drop it, use **one** of:
1. **Nonce injection via a Cloudflare Transform Rule / Worker** that adds a
   `nonce-<random>` to every `<script>` and to `script-src` per response
   (dynamic — the only way to use nonces with otherwise-static pages).
2. **Hashes**: add a build step that sha256-hashes every inline `<script>` in
   `dist/` and writes them into `script-src`; then remove `'unsafe-inline'`
   (browsers ignore `'unsafe-inline'` once hashes/nonces are present).

Externalizing app JS has already been done where practical (e.g. `/status.js`),
which shrinks the inline-script surface even while JSON-LD keeps `'unsafe-inline'`.

## AI Worker (`worker.js`)
Already in place: JSON-only content type; body size cap (`MAX_BODY_BYTES` 16 KB);
strict payload validation (allow-listed keys, per-action text length caps);
origin allow-list (`ALLOWED_ORIGINS`); response size caps; safe error envelopes;
per-minute + per-hour + global-hourly budgets; `Retry-After` on 429; API key read
from `env.ANTHROPIC_API_KEY` (never shipped to the client); logs record only
action name, status, duration, and a coarse size bucket — **never** resume/cover
text, job descriptions, emails, tokens, addresses, or payment data.

### Rate limiting — centralized store (required for production)
The in-memory `Map` limiter is only a per-isolate guard. `checkRateLimitKV()`
uses a **KV namespace** when bound, so limits are shared across isolates, and
falls back to the in-memory limiter (and on any KV error) so the endpoint never
goes down.

**To enable (Cloudflare dashboard / wrangler):**
1. Create a KV namespace, e.g. `applycraft-rate-limit`.
2. Bind it to the Worker as `RATE_LIMIT_KV`
   (`wrangler.json` → `kv_namespaces: [{ "binding": "RATE_LIMIT_KV", "id": "<id>" }]`
   or Workers → Settings → Variables → KV Namespace Bindings).
3. Redeploy. No code change needed — the Worker auto-detects the binding.

**Stronger options (optional):**
- **Durable Object** for atomic, strongly-consistent counters (KV is eventually
  consistent, so bursts can slightly overshoot).
- **Cloudflare Rate Limiting Rules** (dashboard, no code): add a rule on the
  `/api/*` path, e.g. 8 req/min per IP → block/challenge.

### Environment variables the Worker expects
- `ANTHROPIC_API_KEY` (required for AI features; absent → AI returns 503).
- `ALLOWED_ORIGINS` (comma-separated; production origins).
- `RATE_LIMIT_KV` (KV binding; optional but recommended in production).
- `ENVIRONMENT` / `ENABLE_DEV_ORIGINS` (dev-only origin allowances).

Protected endpoints (AI, and any future account/sync/payment handlers ported
into the Worker) should all route through `checkRateLimitKV` + `validatePayload`
+ `readLimitedBody`.
