# UX simplification changes

## Implemented

- Reframed the landing hero around the immediate task: creating a free resume.
- Kept resume analysis as the secondary hero action.
- Reduced the visible desktop navigation to Resume Builder, ATS Checker, and Resume Templates.
- Moved Cover Letter, Application Pack, Job Tracker, Interview Prep, and Pricing under “More”.
- Reordered the shared navigation source so React and generated static pages stay aligned.
- Sent example-page resume CTAs directly to `/resume-builder/`.
- Removed competing first-visit promotions for Application Pack and Master Profile from the homepage.
- Removed duplicate free-plan and feedback sections from the primary homepage journey.
- Kept advanced workflows available through their dedicated routes and the “More” menu.
- Kept template totals sourced from the template registry and refreshed generated static pages.
- Extracted the landing statistics strip from `ResumeGenerator.jsx` into `components/LandingStats.jsx`.
- Fixed Windows path handling in the shared static refresh and navbar test scripts.

## Validation

- Changed JSX files pass the syntax validation script.
- UX tests pass.
- Form accessibility/error tests pass.
- Multilingual i18n tests pass.
- The contrast suite reports 504 WCAG AA-compliant token pairs.

The full production build could not be completed in the Codex Windows sandbox because
esbuild attempted to scan a filesystem ancestor that the sandbox intentionally blocks.
This is an environment restriction rather than a reported JSX syntax error.
