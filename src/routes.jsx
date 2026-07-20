import React, { Suspense, lazy } from "react";
import ResumeGenerator from "./ResumeGenerator.jsx";

const SharedResume = lazy(() => import("./SharedResume.jsx"));
// Interview Prep ships as its own route chunk — kept OUT of the initial/homepage
// bundle (ResumeGenerator) so the streaming chat UI is downloaded only on visit.
const InterviewPrep = lazy(() => import("./interview/InterviewPrep.jsx"));

function SharedResumeRoute() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06080F" }} />}>
      <SharedResume />
    </Suspense>
  );
}

function InterviewPrepRoute() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06080F" }} />}>
      <InterviewPrep />
    </Suspense>
  );
}

// Canonical + hreflang are injected per route at BUILD TIME by the
// onBeforePageRender hook in vite.config.js (zero client JS), using the
// genuine-cluster map in src/seo/alternates.js.
export const routes = [
  { path: "/", element: <ResumeGenerator /> },
  { path: "/fr/", element: <ResumeGenerator /> },
  { path: "/ar/", element: <ResumeGenerator /> },
  { path: "/r", element: <SharedResumeRoute /> },
  { path: "/r/:shareId", element: <SharedResumeRoute /> },
  { path: "/resume-builder", element: <ResumeGenerator /> },
  { path: "/resume/templates", element: <ResumeGenerator /> },
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
  { path: "/interview-prep/", element: <InterviewPrepRoute /> },
  { path: "/fr/interview-prep/", element: <InterviewPrepRoute /> },
  { path: "/ar/interview-prep/", element: <InterviewPrepRoute /> },
];
