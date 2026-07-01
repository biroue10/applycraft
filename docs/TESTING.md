# Testing

All suites are plain Node scripts (no framework) except the browser E2E suite,
which uses Playwright. Run against a fresh build where noted.

| Command | What it checks | Runs where |
|---|---|---|
| `npm run build` | Production SSG build finishes | anywhere |
| `npm run test:product` | Template/language counts consistent across code, static HTML, README | anywhere |
| `npm run test:ats` | ATS tokenization + scoring for en/fr/es/ar/de | anywhere |
| `npm run test:pdf` | jsPDF export → pdfjs extraction: text layer, reading order, accents | anywhere |
| `npm run test:gallery` | Template-gallery invariants (no crop, mobile buttons, a11y preview) | anywhere |
| `npm run test:seo:hreflang` | Per-page canonical + reciprocal hreflang clusters (needs `dist/`) | after build |
| `npm run test:e2e:static` | Broken links, empty pages, missing canonical, sitemap URLs, JSON-LD (needs `dist/`) | after build |
| `npm run test:a11y` | axe-core WCAG 2.2 AA on prerendered HTML | after build |
| `npm run test:security` | Worker input limits, validation, rate limiting, safe errors | anywhere |
| `npm run test:ux` | UX heuristics | anywhere |
| `npm run validate:performance` | Initial-JS budget, lazy-only libs, image sizes (needs `dist/`) | after build |
| `npm run test:e2e` | **Playwright** browser flows (homepage, resume, ATS, RTL, French, legal, mobile, keyboard, no console errors, no overflow) | CI / local with browsers |

## Running the Playwright E2E suite
Browsers must be installed first (not committed; downloaded on demand):

```bash
npm ci
npm run build
npx playwright install --with-deps    # one-time; downloads browser binaries
npm run test:e2e                        # starts `vite preview` and runs tests/e2e
```

To run against a deployed URL instead of the local preview:

```bash
E2E_BASE_URL=https://applycraft.io npm run test:e2e
```

The Playwright suite (`tests/e2e/smoke.spec.js`) runs on desktop Chromium and a
mobile Safari (iPhone 13) profile. It intentionally lives outside the pure-Node
suites because it needs a real browser; route/link/canonical/hreflang/sitemap
integrity is already covered browser-free by `test:e2e:static` and
`test:seo:hreflang`, which run in any environment.
