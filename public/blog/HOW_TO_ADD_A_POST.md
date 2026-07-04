# How to add a new blog post

The blog is plain static HTML (same pattern as the rest of the site). Adding a post
is three small steps — no build tooling or React needed.

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

## 2. Add a card to the blog index

Open `public/blog/index.html`. Inside the `<!-- POST CARDS -->` block, copy the
existing `<a class="post-card">…</a>` and paste your new one **at the top** (newest first):

```html
<a class="post-card" href="/blog/your-new-post-slug/">
  <div class="post-meta">
    <span class="tag">Cover Letters</span>
    <span>July 10, 2026</span>
    <span>· 5 min read</span>
  </div>
  <h2>Your post title</h2>
  <p>One- or two-sentence summary that makes someone want to click.</p>
  <span class="read-more">Read article →</span>
</a>
```

## 3. Add both/new URLs to the sitemap

Open `public/sitemap.xml` and add (keep it alphabetical-ish, near the other `/blog/` lines):

```xml
<url>
  <loc>https://applycraft.io/blog/your-new-post-slug/</loc>
  <lastmod>2026-07-10</lastmod>
</url>
```

## 4. Deploy

Commit + push (the auto-deploy hook handles the rest), or run the normal build/deploy.
That's it — the post is live and indexed.

### Tips
- Good post length for SEO: 700–1500 words, with `<h2>` subheadings.
- Always end with the `.cta-box` linking to `/resume/templates` — it converts readers.
- Reuse the `tag` values so topics stay consistent (e.g. ATS, Cover Letters, Job Search, Interviews).
