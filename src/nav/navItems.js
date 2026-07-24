// Single source of truth for the primary navbar: item order + i18n label keys.
//
// Both the marketing header and the in-app tool header are the SAME component
// (<SiteHeader> in src/siteChrome.jsx) rendering this array, so the labels, the
// order and the height can never drift apart again.
//
// Labels resolve against the shared `footer` i18n namespace, which is translated
// in every locale — never hardcode an English label here. Hrefs are localized at
// render time through localizeRoute() (src/seo/localizedRoutes.js).
// `alwaysLink` keeps primary destinations as canonical anchor navigations.
// Public/static and SSG workspace routes are not all owned by one client router;
// native navigation therefore preserves correct metadata and browser history.
export const PRIMARY_NAV_ITEMS = [
  { id: "resume", href: "/resume-builder/", labelKey: "resumeBuilder", activeRoutes: ["/resume-builder/", "/free-resume-builder/"], alwaysLink: true },
  { id: "cover", href: "/cover-letter-builder/", labelKey: "coverLetter", activeRoutes: ["/cover-letter-builder/", "/cover-letter/templates/"], alwaysLink: true },
  { id: "ats", href: "/ats-checker/", labelKey: "atsChecker", activeRoutes: ["/ats-checker/", "/ats-checker-fr/", "/ats-checker-ar/", "/ats-resume-builder/", "/resume-checker/"], alwaysLink: true },
  { id: "application-pack", href: "/application-pack/", labelKey: "applicationPack", activeRoutes: ["/application-pack/"], alwaysLink: true },
  { id: "tracker", href: "/job-tracker/", labelKey: "jobTracker", activeRoutes: ["/job-tracker/"], alwaysLink: true },
  { id: "interview", href: "/interview-prep/", labelKey: "interviewPrep", activeRoutes: ["/interview-prep/"], alwaysLink: true },
  { id: "templates", href: "/resume/templates/", labelKey: "resumeTemplates", activeRoutes: ["/resume/templates/", "/examples/"], alwaysLink: true },
  { id: "pricing", href: "/pricing/", labelKey: "pricing", activeRoutes: ["/pricing/"], alwaysLink: true },
];

export function normalizeNavPath(value = "/") {
  let path = String(value || "/").split(/[?#]/, 1)[0].replace(/\/{2,}/g, "/");
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
