export const HOST = "applycraft.io";
export const SITE = `https://${HOST}`;

export const INDEXABLE_APP_PATHS = [
  "/",
  "/fr/",
  "/ar/",
  "/resume-builder/",
  "/resume/templates/",
  "/cover-letter/templates/",
];

export const REDIRECTED_CANONICAL_PATHS = new Map([
  ["/app/ats-checker/", "/ats-checker/"],
  ["/cover-letter/builder/", "/cover-letter-builder/"],
]);

const PRIVATE_PREFIXES = [
  "/app/",
  "/admin/",
  "/api/",
  "/functions/",
];

const NON_INDEXABLE_PATHS = new Set([
  "/cover-letter/builder/",
  "/email-signature/",
  "/job-tracker/",
  "/master-profile/",
  "/personal-website/",
  "/resume/builder/",
  "/r/",
]);

export function normalizePublicPath(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function isIndexablePublicUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== HOST) return false;
  if (parsed.search || parsed.hash) return false;

  const pathname = normalizePublicPath(parsed.pathname);
  if (pathname !== parsed.pathname) return false;
  if (REDIRECTED_CANONICAL_PATHS.has(pathname)) return false;
  if (NON_INDEXABLE_PATHS.has(pathname)) return false;
  if (PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;
  if (/localhost|127\.0\.0\.1|staging|preview|test/i.test(value)) return false;

  return true;
}
