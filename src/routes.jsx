import React from "react";
import ResumeGenerator from "./ResumeGenerator.jsx";
import SharedResume from "./SharedResume.jsx";

export const routes = [
  { path: "/", element: <ResumeGenerator /> },
  { path: "/r", element: <SharedResume /> },
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
