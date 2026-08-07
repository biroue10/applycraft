# Priority internal-link audit

Audit generated from crawlable HTML on August 7, 2026. Counts include shared navigation/footer links; “unique sources” prevents repeated links on one page from inflating authority. Contextual anchors were reviewed separately.

| Target | Inbound links | Unique source pages | Outbound destinations | Orphan | Notable contextual anchors |
|---|---:|---:|---:|---|---|
| `/` | 363 | 76 | 9 | No | ApplyCraft; ApplyCraft.io; build or polish your resume |
| `/fr/` | 195 | 74 | 0* | No | outils de CV ApplyCraft; créer son CV avec ApplyCraft |
| `/resume/templates/` | 286 | 62 | 0* | No | resume templates; resume designs; choose a resume template; 60 resume templates |
| `/free-resume-builder/` | 72 | 64 | 38 | No | free resume builder guide; use the free resume builder |
| `/blog/teacher-resume-skills-achievements/` | 3 | 3 | 34 | No | skills to include on a teacher resume; teaching skills and achievements |
| `/blog/student-resume-summary-examples/` | 3 | 3 | 34 | No | student resume summary examples |
| `/blog/student-resume-no-experience/` | 4 | 4 | 34 | No | building your entire resume without work experience; writing a student resume with no formal job history |
| `/fr/blog/exemple-cv-maroc/` | 6 | 6 | 44 | No | guide du CV marocain; guide du CV au Maroc; exemple de CV marocain |

`*` The homepage and template gallery are Vite-prerendered application routes, so source `public/` HTML does not contain their hydrated/prerendered outbound graph. Built-output checks cover those links.

The priority articles are reachable from their locale blog index and reciprocal cluster pages. Shared links were not duplicated merely to inflate counts. Future additions should be contextual and should vary anchors naturally.
