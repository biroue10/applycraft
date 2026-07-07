const atsResults = {
  "crossLangIssue": " (cross-language: {resumeLang} resume vs. {jobLang} job)",
  "scoreBands": {
    "strong": {
      "label": "Strong",
      "meaning": "Few readiness issues found. Still review and tailor to each role."
    },
    "needsWork": {
      "label": "Needs work",
      "meaning": "Several fixable issues. Address the flagged items."
    },
    "actionRequired": {
      "label": "Action required",
      "meaning": "Important elements are missing or weak. Fix critical items first."
    },
    "criticalIssues": {
      "label": "Critical issues",
      "meaning": "Key ATS sections appear missing. Fix critical items before applying."
    }
  },
  "issueText": {
    "NO_EMAIL": {
      "title": "No email address detected",
      "detail": "ATS systems extract your email for the candidate profile."
    },
    "NO_EXPERIENCE": {
      "title": "No work experience section detected",
      "detail": "Experience is heavily weighted. Use a clear Experience heading."
    },
    "NO_SKILLS": {
      "title": "No skills section detected",
      "detail": "Add a Skills or Technologies section for keyword matching."
    },
    "NO_PHONE": {
      "title": "No phone number detected",
      "detail": "Phone is extracted by ATS systems for your candidate profile."
    },
    "NO_LINKEDIN": {
      "title": "No LinkedIn URL",
      "detail": "LinkedIn can help profile completeness and recruiter review."
    },
    "NO_SUMMARY": {
      "title": "No professional summary detected",
      "detail": "A 2-4 sentence summary gives ATS immediate context."
    },
    "NO_NUMBERS": {
      "title": "No quantified achievements",
      "detail": "Add metrics such as %, revenue, time saved, or team size."
    },
    "NO_DATES": {
      "title": "No dates found in experience",
      "detail": "Include start and end years on each role."
    },
    "WEAK_BULLETS": {
      "title": "{count} passive bullet opener(s)",
      "detail": "Replace passive openers with verbs like Led, Built, or Reduced."
    },
    "LONG_LINES": {
      "title": "{count} line(s) over 180 characters",
      "detail": "Split long lines into focused bullets under 160 characters."
    },
    "TOO_SHORT": {
      "title": "Resume too short ({words} words)",
      "detail": "Add projects, technologies, and measurable outcomes."
    },
    "NO_EDUCATION": {
      "title": "Education section not detected",
      "detail": "Add at least one education entry."
    },
    "TOO_LONG": {
      "title": "Resume may be too long ({words} words)",
      "detail": "Condense to recent, relevant experience."
    },
    "KW_LOW": {
      "title": "Low keyword match: {pct}% vs. job description{cross}",
      "detail": "Only {pct}% of meaningful job keywords appear in your resume. Add relevant role terms naturally."
    },
    "KW_MED": {
      "title": "Keyword match: {pct}%{cross}",
      "detail": "You match {pct}% of this job's keywords. Add real role terms where they apply."
    }
  }
};

export default atsResults;
