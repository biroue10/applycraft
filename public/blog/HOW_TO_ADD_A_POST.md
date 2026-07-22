# How to add a new blog post

The articles are plain static HTML, while the English and French indexes are generated
from one registry. This keeps published routes and visible cards aligned without adding
client-side JavaScript.

## 1. Create the post file

Copy the existing post folder and rename it to your new URL slug:

```
public/blog/how-to-write-an-ats-friendly-resume/   ← copy this whole folder
public/blog/your-new-post-slug/                     ← to this
```

The slug becomes the URL: `https://applycraft.io/blog/your-new-post-slug/`.
Use lowercase words separated by hyphens.

Then open the new `index.html` and edit:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">` and every `og:`/`twitter:` URL → your new slug
- The JSON-LD blocks:
  - `Article` / `BlogPosting`: `headline`, `description`, `datePublished`, `dateModified`, `mainEntityOfPage`
  - `Person` author: `name`, `url` or `sameAs` when available
  - `BreadcrumbList`: Home → Blog → Post title
- The visible `<h1>`, the `.lead`, the `.post-meta` (tag / date / read time), and the body

Keep the `<nav>`, `<footer>`, and the `.cta-box` — just replace the article content.

## 2. Register the article

Add one entry to `scripts/blog-articles.mjs`. Set `locale`, `route`, metadata and
`status: "published"`. The build sorts published cards newest first and writes the
appropriate `/blog/` or `/fr/blog/` index.

```html
{
  locale: "en",
  slug: "your-new-post-slug",
  route: "/blog/your-new-post-slug/",
  title: "Your post title",
  category: "Job Search",
  publishedAt: "2026-07-10",
  readMinutes: 8,
  description: "A useful summary.",
  status: "published",
}
```

Run `node scripts/generate-blog-indexes.mjs` if you need to refresh the checked-in
indexes before the next build. Do not edit the generated card block manually.

## 3. Generate the sitemap

Run `npm run seo:sitemap`. The generator discovers the article canonical and uses its
publication or modification date. IndexNow consumes the same sitemap URL list.

## 4. Deploy

Commit + push (the auto-deploy hook handles the rest), or run the normal build/deploy.
That's it — the post is live and indexed.

### Tips
- Choose length based on search intent and usefulness, with a logical heading hierarchy.
- Use contextual CTAs that match the article rather than a mandatory destination.
- Reuse the `tag` values so topics stay consistent (e.g. ATS, Cover Letters, Job Search, Interviews).
