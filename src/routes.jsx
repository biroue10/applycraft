import React, { Suspense, lazy } from "react";
import LandingPage from "./LandingPage.jsx";

const ResumeGenerator = lazy(() => import("./ResumeGenerator.jsx"));
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

function ResumeGeneratorRoute() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06080F" }} />}>
      <ResumeGenerator />
    </Suspense>
  );
}

// Canonical + hreflang are injected per route at BUILD TIME by the
// onBeforePageRender hook in vite.config.js (zero client JS), using the
// genuine-cluster map in src/seo/alternates.js.
export const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/fr/", element: <LandingPage /> },
  { path: "/ar/", element: <LandingPage /> },
  { path: "/r", element: <SharedResumeRoute /> },
  { path: "/r/:shareId", element: <SharedResumeRoute /> },
  { path: "/resume-builder", element: <ResumeGeneratorRoute /> },
  { path: "/resume/templates", element: <ResumeGeneratorRoute /> },
  { path: "/resume/builder", element: <ResumeGeneratorRoute /> },
  { path: "/cover-letter/templates", element: <ResumeGeneratorRoute /> },
  { path: "/cover-letter/builder", element: <ResumeGeneratorRoute /> },
  { path: "/job-tracker", element: <ResumeGeneratorRoute /> },
  { path: "/app/ats-checker", element: <ResumeGeneratorRoute /> },
  { path: "/master-profile", element: <ResumeGeneratorRoute /> },
  { path: "/email-signature", element: <ResumeGeneratorRoute /> },
  { path: "/personal-website", element: <ResumeGeneratorRoute /> },
  // Public, locale-aware Interview Prep. Trailing-slash paths so vite-react-ssg
  // emits dist/interview-prep/index.html (etc.), served 0-hop at the canonical
  // slash URL by Cloudflare (html_handling: force-trailing-slash).
  { path: "/interview-prep/", element: <InterviewPrepRoute /> },
  { path: "/fr/interview-prep/", element: <InterviewPrepRoute /> },
  { path: "/ar/interview-prep/", element: <InterviewPrepRoute /> },
];
