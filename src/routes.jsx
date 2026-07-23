// vite-react-ssg resolves matched `route.lazy` modules before hydrating. Use it
// for standalone route chunks while the shared editor stays directly mounted
// so its server and client trees hydrate identically.
import React from "react";
import ResumeGenerator from "./ResumeGenerator.jsx";
const sharedResumeRoute = async () => ({ Component: (await import("./SharedResume.jsx")).default });
const interviewPrepRoute = async () => ({ Component: (await import("./interview/InterviewPrep.jsx")).default });

// Canonical + hreflang are injected per route at BUILD TIME by the
// onBeforePageRender hook in vite.config.js (zero client JS), using the
// genuine-cluster map in src/seo/alternates.js.
export const routes = [
  { path: "/", element: <ResumeGenerator /> },
  { path: "/fr/", element: <ResumeGenerator /> },
  { path: "/ar/", element: <ResumeGenerator /> },
  { path: "/r", lazy: sharedResumeRoute },
  { path: "/r/:shareId", lazy: sharedResumeRoute },
  { path: "/resume-builder", element: <ResumeGenerator /> },
  { path: "/resume/templates", element: <ResumeGenerator /> },
  { path: "/fr/modeles-cv/", element: <ResumeGenerator /> },
  { path: "/ar/resume-templates/", element: <ResumeGenerator /> },
  { path: "/resume/builder", element: <ResumeGenerator /> },
  { path: "/cover-letter/templates", element: <ResumeGenerator /> },
  { path: "/cover-letter/builder", element: <ResumeGenerator /> },
  { path: "/job-tracker", element: <ResumeGenerator /> },
  { path: "/app/ats-checker", element: <ResumeGenerator /> },
  { path: "/master-profile", element: <ResumeGenerator /> },
  { path: "/email-signature", element: <ResumeGenerator /> },
  { path: "/personal-website", element: <ResumeGenerator /> },
  // Public, locale-aware Interview Prep. Trailing-slash paths so vite-react-ssg
  // emits dist/interview-prep/index.html (etc.), served 0-hop at the canonical
  // slash URL by Cloudflare (html_handling: force-trailing-slash).
  { path: "/interview-prep/", lazy: interviewPrepRoute },
  { path: "/fr/interview-prep/", lazy: interviewPrepRoute },
  { path: "/ar/interview-prep/", lazy: interviewPrepRoute },
];
