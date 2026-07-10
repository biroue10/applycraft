// Single source of truth for the primary navbar: item order + i18n label keys.
//
// Both the marketing header and the in-app tool header are the SAME component
// (<SiteHeader> in src/siteChrome.jsx) rendering this array, so the labels, the
// order and the height can never drift apart again.
//
// Labels resolve against the shared `footer` i18n namespace, which is translated
// in every locale — never hardcode an English label here. Hrefs are localized at
// render time through localizeRoute() (src/seo/localizedRoutes.js).
export const PRIMARY_NAV_ITEMS = [
  { id: "resume", href: "/resume/templates/", labelKey: "resumeBuilder" },
  { id: "cover", href: "/cover-letter/templates/", labelKey: "coverLetter" },
  { id: "ats", href: "/ats-checker/", labelKey: "atsChecker" },
  { id: "tracker", href: "/job-tracker/", labelKey: "jobTracker" },
];

export function primaryNavLabelKey(id) {
  return PRIMARY_NAV_ITEMS.find((item) => item.id === id)?.labelKey || "";
}
