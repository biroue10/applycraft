# Multilingual route and control strategy

ApplyCraft uses stable product IDs and the `LOCALIZED_ROUTES` registry in
`src/seo/localizedRoutes.js`. English is the unprefixed default. Existing real
French and Arabic pages use `/fr/` and `/ar/`; shared workspaces keep one
query-free canonical URL and may carry one validated `ui` value. Query variants
are UI state, are not sitemap entries, and are not hreflang targets.

| Product intent | Canonical | Current French | Current Arabic | Notes |
| --- | --- | --- | --- | --- |
| Resume builder | `/resume-builder/` | shared route, `ui=fr` | shared route, `ui=ar` | `docLang` belongs to the document |
| Cover-letter builder | `/cover-letter-builder/` | shared route, `ui=fr` | shared route, `ui=ar` | primary navigation always opens the builder |
| Cover-letter gallery | `/cover-letter/templates/` | shared gallery | shared gallery | browsing intent; never substituted for builder navigation |
| ATS checker | `/ats-checker/` | `/ats-checker-fr/` | `/ats-checker-ar/` | indexed legacy localized routes retained |
| Job tracker | `/job-tracker/` | shared route, `ui=fr` | shared route, `ui=ar` | one canonical; no `docLang` |
| Interview prep | `/interview-prep/` | `/fr/interview-prep/` | `/ar/interview-prep/` | real localized routes |
| Resume templates | `/resume/templates/` | `/fr/modeles-cv/` | `/ar/resume-templates/` | real localized galleries |
| Pricing | `/pricing/` | `/fr/pricing/` | English fallback until an Arabic pricing page exists | commercial terms stay identical |

`/cover-letter/` is a permanent convenience redirect to the builder. Redirects
and query-language variants stay out of sitemap and IndexNow.

## Future normalization (not performed here)

Indexed legacy URLs such as `/ats-checker-fr/` should only move to a `/fr/...`
convention in a dedicated SEO migration with one-hop permanent redirects,
reciprocal hreflang, updated sitemap/IndexNow submissions, and backlink
monitoring. Shared query-localized workspaces should only gain prefixed URLs
when genuinely localized prerendered pages exist. No plausible-looking route is
created merely from a translated label.

## Language controls

The global header owns interface language. Builder document language, interview
language, and template preview language are scoped controls and must never
change the global page direction. Resume content is not persisted unless the
user explicitly chooses a storage feature.
