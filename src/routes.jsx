import React, { Suspense, lazy } from "react";
import ResumeGenerator from "./ResumeGenerator.jsx";

const SharedResume = lazy(() => import("./SharedResume.jsx"));

function SharedResumeRoute() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06080F" }} />}>
      <SharedResume />
    </Suspense>
  );
}

// Canonical + hreflang are injected per route at BUILD TIME by the
// onBeforePageRender hook in vite.config.js (zero client JS), using the
// genuine-cluster map in src/seo/alternates.js.
export const routes = [
  { path: "/", element: <ResumeGenerator /> },
  { path: "/r", element: <SharedResumeRoute /> },
  { path: "/r/:shareId", element: <SharedResumeRoute /> },
  { path: "/resume/templates", element: <ResumeGenerator /> },
  { path: "/resume/builder", element: <ResumeGenerator /> },
  { path: "/cover-letter/templates", element: <ResumeGenerator /> },
  { path: "/cover-letter/builder", element: <ResumeGenerator /> },
  { path: "/job-tracker", element: <ResumeGenerator /> },
  { path: "/app/ats-checker", element: <ResumeGenerator /> },
  { path: "/master-profile", element: <ResumeGenerator /> },
  { path: "/email-signature", element: <ResumeGenerator /> },
  { path: "/personal-website", element: <ResumeGenerator /> },
];
