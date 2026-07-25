import { localizeRoute } from "./seo/localizedRoutes.js";

export const FOOTER_LINK_SECTIONS = [
  {
    key: "product",
    links: [
      { href: "/", labelKey: "resumeBuilder" },
      { href: "/resume/templates/", labelKey: "resumeTemplates" },
      { href: "/cover-letter-builder/", labelKey: "coverLetter" },
      { href: "/ats-checker/", labelKey: "atsChecker" },
      { href: "/application-pack/", labelKey: "applicationPack" },
      { href: "/job-tracker/", labelKey: "jobTracker" },
      { href: "/interview-prep/", labelKey: "interviewPrep" },
      { href: "/pricing/", labelKey: "pricing" },
      { href: "/changelog/", labelKey: "changelog" },
      { href: "/roadmap/", labelKey: "roadmap" },
      { href: "/status/", labelKey: "status" },
    ],
  },
  {
    key: "resources",
    links: [
      { href: "/blog/", labelKey: "blog" },
      { href: "/help/", labelKey: "help" },
      { href: "/examples/", labelKey: "examples" },
      { href: "/free-resume-builder/", labelKey: "freeBuilder" },
      { href: "/student-resume-builder/", labelKey: "studentBuilder" },
      { href: "/canadian-resume-builder/", labelKey: "canadianBuilder" },
    ],
  },
  {
    key: "company",
    links: [
      { href: "/about/", labelKey: "about" },
      { href: "/contact/", labelKey: "contact" },
      { href: "https://github.com/biroue10", labelKey: "github", external: true },
    ],
  },
  {
    key: "legal",
    links: [
      { href: "/terms/", labelKey: "terms" },
      { href: "/privacy/", labelKey: "privacy" },
      { href: "/cookies/", labelKey: "cookies" },
      { href: "/gdpr/", labelKey: "gdpr" },
      { href: "/refund-policy/", labelKey: "refundPolicy" },
      { href: "/ai-disclosure/", labelKey: "aiDisclosure" },
      { href: "/accessibility/", labelKey: "accessibility" },
    ],
  },
];

export function localizedFooterHref(link, lang = "en") {
  if (!link || link.external) return link?.href || "";
  // Until an Arabic blog index exists, keep the Arabic footer's Blog resource
  // link on the English blog. The language switcher may still return Arabic
  // readers to /ar/, but footer links must not collapse two labels onto /ar/.
  if (lang === "ar" && link.href === "/blog/") return "/blog/";
  return localizeRoute(link.href, lang);
}
