import { blogArticles } from "./blog-articles.mjs";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidEditorialDate(value) {
  const match = ISO_DATE.exec(value || "");
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export function assertArticleDates(article) {
  if (!isValidEditorialDate(article.datePublished)) {
    throw new Error(`${article.route}: invalid or missing datePublished`);
  }
  if (article.dateModified && !isValidEditorialDate(article.dateModified)) {
    throw new Error(`${article.route}: invalid dateModified`);
  }
  if (article.dateModified && article.dateModified < article.datePublished) {
    throw new Error(`${article.route}: dateModified precedes datePublished`);
  }
  return article;
}

export function articleForRoute(route) {
  const article = blogArticles.find((entry) => entry.route === route && entry.status === "published");
  if (!article) throw new Error(`Published blog article is missing from registry: ${route}`);
  return assertArticleDates(article);
}

export function formatEditorialDate(value, locale) {
  if (!isValidEditorialDate(value)) throw new Error(`Cannot format invalid editorial date: ${value}`);
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const intlLocale = locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function editorialDateMarkup(article) {
  assertArticleDates(article);
  const labels = article.locale === "fr"
    ? { published: "Publié le", modified: "Mis à jour le", read: "min de lecture" }
    : article.locale === "ar"
      ? { published: "نُشر في", modified: "حُدِّث في", read: "دقائق قراءة" }
      : { published: "Published", modified: "Updated", read: "min read" };
  const published = `<span class="editorial-date editorial-date--published">${labels.published} <time datetime="${article.datePublished}">${formatEditorialDate(article.datePublished, article.locale)}</time></span>`;
  const modified = article.dateModified && article.dateModified > article.datePublished
    ? `<span class="editorial-date editorial-date--modified">${labels.modified} <time datetime="${article.dateModified}">${formatEditorialDate(article.dateModified, article.locale)}</time></span>`
    : "";
  return `${published}${modified}<span>· ${article.readMinutes} ${labels.read}</span>`;
}

export const publishedArticles = blogArticles
  .filter((article) => article.status === "published")
  .map(assertArticleDates);
