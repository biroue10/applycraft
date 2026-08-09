# Editorial article dates

ApplyCraft treats article dates as editorial facts, not deployment metadata. The authoritative source is `scripts/blog-articles.mjs`.

## Creating an article

- Set `datePublished` to the real publication date in ISO `YYYY-MM-DD` format.
- Omit `dateModified` when the article has not received a meaningful editorial revision.
- Add the article to the registry before generating its page. Visible dates, Open Graph metadata, JSON-LD, blog indexes, and article sitemap `<lastmod>` values are derived from that registry.

## Substantively updating an article

Update `dateModified` manually to the date the revised editorial content is published. A substantive update includes:

- new sections;
- significant examples;
- important factual corrections;
- material guidance updates; or
- major table or checklist additions.

The modified date must be valid ISO `YYYY-MM-DD` and must not precede `datePublished`.

Do not change `dateModified` for:

- a deployment or rebuild;
- a dependency upgrade;
- whitespace or formatting only;
- a CSS-only adjustment;
- a header, footer, or global navigation change;
- unrelated infrastructure work; or
- a typo with no material effect on the guidance.

Build time, deployment time, filesystem modification time, and Git commit time must never be inferred as editorial article dates. Run `npm run test:article-dates` after editing article metadata.
