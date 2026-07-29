// Single source of truth for the primary navbar: item order + i18n label keys.
//
// Both the marketing header and the in-app tool header are the SAME component
// (<SiteHeader> in src/siteChrome.jsx) rendering this array, so the labels, the
// order and the height can never drift apart again.
//
// Labels resolve against the shared `footer` i18n namespace, which is translated
// in every locale — never hardcode an English label here. Hrefs are localized at
// render time through localizeRoute() (src/seo/localizedRoutes.js).
// Hrefs remain real anchors for public/static pages and modified clicks. Inside
// the React application, SiteHeader intercepts normal clicks so moving between
// tools does not tear down and recreate the navbar.
export const PRIMARY_NAV_ITEMS = [
  { id: "resume", href: "/resume-builder/", labelKey: "resumeBuilder", activeRoutes: ["/resume-builder/", "/free-resume-builder/"] },
  { id: "ats", href: "/ats-checker/", labelKey: "atsChecker", alwaysLink: true, activeRoutes: ["/ats-checker/", "/ats-checker-fr/", "/ats-checker-ar/", "/ats-resume-builder/", "/resume-checker/"] },
  { id: "templates", href: "/resume/templates/", labelKey: "resumeTemplates", activeRoutes: ["/resume/templates/", "/examples/"] },
  { id: "cover", href: "/cover-letter-builder/", labelKey: "coverLetter", activeRoutes: ["/cover-letter-builder/", "/cover-letter/templates/"] },
  { id: "application-pack", href: "/application-pack/", labelKey: "applicationPack", activeRoutes: ["/application-pack/"] },
  { id: "tracker", href: "/job-tracker/", labelKey: "jobTracker", activeRoutes: ["/job-tracker/"] },
  { id: "interview", href: "/interview-prep/", labelKey: "interviewPrep", activeRoutes: ["/interview-prep/"] },
  { id: "pricing", href: "/pricing/", labelKey: "pricing", activeRoutes: ["/pricing/"] },
];

export function normalizeNavPath(value = "/") {
  let path;
  try {
    path = new URL(String(value || "/"), "https://a").pathname;
  } catch {
    path = "/";
  }
  path = path.replace(/\/{2,}/g, "/");
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/^\/(?:fr|ar)(?=\/)/, "") || "/";
  return path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
}

export function activeNavIdForPath(value = "/") {
  const path = normalizeNavPath(value);
  const matches = [];
  for (const item of PRIMARY_NAV_ITEMS) {
    for (const route of item.activeRoutes || []) {
      const normalizedRoute = normalizeNavPath(route);
      if (path === normalizedRoute || path.startsWith(normalizedRoute)) {
        matches.push({ id: item.id, length: normalizedRoute.length });
      }
    }
  }
  return matches.sort((a, b) => b.length - a.length)[0]?.id || "";
}

export function primaryNavLabelKey(id) {
  return PRIMARY_NAV_ITEMS.find((item) => item.id === id)?.labelKey || "";
}
