# Priority internal-link audit

The reproducible audit is now `npm run audit:internal-links`. It crawls built canonical HTML, separates contextual links from shared header/navigation/footer links, reports anchor diversity, calculates click depth from `/`, and fails on priority orphans. Run it after `npm run build`; do not optimize toward an arbitrary link count.

| Target | Total inbound | Unique sources | Contextual | Shared nav/footer | Anchor diversity | Click depth | Orphan |
|---|---:|---:|---:|---:|---:|---:|---|
| `/` | 416 | 91 | 52 | 364 | 15 | 0 | No |
| `/fr/` | 217 | 86 | 32 | 185 | 12 | 1 | No |
| `/resume/templates/` | 314 | 77 | 40 | 274 | 16 | 1 | No |
| `/free-resume-builder/` | 82 | 74 | 7 | 75 | 7 | 1 | No |
| `/blog/teacher-resume-skills-achievements/` | 5 | 5 | 5 | 0 | 5 | 2 | No |
| `/blog/student-resume-summary-examples/` | 4 | 4 | 4 | 0 | 3 | 2 | No |
| `/blog/student-resume-no-experience/` | 5 | 5 | 5 | 0 | 5 | 2 | No |
| `/fr/blog/exemple-cv-maroc/` | 6 | 6 | 6 | 0 | 5 | 3 | No |
| `/fr/blog/cv-canadien-maroc/` | 9 | 7 | 9 | 0 | 6 | 3 | No |

These August 9 figures come from 111 canonical pages in `dist`. Teacher authority changed from 3 links/3 unique sources before reinforcement to 5/5 after it; the added sources are the ATS resources and role-example hubs. The hub card text varies from the existing Teacher Example and Free Builder anchors.

The priority articles are reachable from their locale blog index and reciprocal cluster pages. Shared links were not duplicated merely to inflate counts. Future additions should be contextual and should vary anchors naturally.
