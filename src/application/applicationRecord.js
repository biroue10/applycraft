const VALID_STATUSES = new Set(["saved", "preparing", "applied", "interview", "offer", "rejected"]);

export const APPLICATION_RECORD_VERSION = 1;

const text = (value, max = 500) => String(value || "").trim().slice(0, max);

export function createApplicationRecord(input = {}) {
  const now = new Date().toISOString();
  return {
    schemaVersion: APPLICATION_RECORD_VERSION,
    id: text(input.id, 100) || `application-${Date.now()}`,
    companyName: text(input.companyName || input.company, 160),
    jobTitle: text(input.jobTitle || input.position, 160),
    jobUrl: text(input.jobUrl || input.link, 1000),
    jobDescription: text(input.jobDescription, 20000),
    location: text(input.location, 200),
    marketMode: text(input.marketMode, 60) || "international",
    applicationLanguage: text(input.applicationLanguage, 10) || "en",
    status: VALID_STATUSES.has(input.status || input.column) ? (input.status || input.column) : "saved",
    applicationDate: text(input.applicationDate, 30),
    followUpDate: text(input.followUpDate || input.reminder, 100),
    salary: text(input.salary, 200),
    recruiter: text(input.recruiter, 500),
    interviewDate: text(input.interviewDate, 100),
    resumeVersion: normalizeDocumentReference(input.resumeVersion, input.resume),
    coverLetterVersion: normalizeDocumentReference(input.coverLetterVersion, input.coverLetter),
    atsReview: normalizeActivityReference(input.atsReview),
    interviewPrep: normalizeActivityReference(input.interviewPrep),
    notes: text(input.notes, 5000),
    createdAt: text(input.createdAt, 40) || now,
    updatedAt: now,
  };
}

export function normalizeDocumentReference(reference, legacyName = "") {
  const source = reference && typeof reference === "object" ? reference : {};
  return {
    id: text(source.id, 100),
    name: text(source.name || legacyName, 200),
    templateName: text(source.templateName, 120),
    language: text(source.language, 10),
  };
}

export function normalizeActivityReference(reference) {
  const source = reference && typeof reference === "object" ? reference : {};
  return {
    id: text(source.id, 100),
    status: text(source.status, 80),
    updatedAt: text(source.updatedAt, 40),
  };
}

export function toTrackerCard(record = {}) {
  const normalized = createApplicationRecord(record);
  return {
    ...record,
    id: normalized.id,
    column: normalized.status,
    company: normalized.companyName,
    position: normalized.jobTitle,
    link: normalized.jobUrl,
    jobDescription: normalized.jobDescription,
    location: normalized.location,
    marketMode: normalized.marketMode,
    applicationLanguage: normalized.applicationLanguage,
    applicationDate: normalized.applicationDate,
    reminder: normalized.followUpDate,
    salary: normalized.salary,
    recruiter: normalized.recruiter,
    interviewDate: normalized.interviewDate,
    resume: normalized.resumeVersion.name,
    coverLetter: normalized.coverLetterVersion.name,
    resumeVersion: normalized.resumeVersion,
    coverLetterVersion: normalized.coverLetterVersion,
    atsReview: normalized.atsReview,
    interviewPrep: normalized.interviewPrep,
    notes: normalized.notes,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}

export function filterApplicationRecords(records, filters = {}) {
  return records.filter((record) => {
    const normalized = createApplicationRecord(record);
    return (!filters.status || normalized.status === filters.status)
      && (!filters.marketMode || normalized.marketMode === filters.marketMode)
      && (!filters.applicationLanguage || normalized.applicationLanguage === filters.applicationLanguage)
      && (!filters.resumeVersionId || normalized.resumeVersion.id === filters.resumeVersionId)
      && (!filters.followUpDue || (normalized.followUpDate && normalized.followUpDate <= filters.followUpDue));
  });
}

export function serializeApplicationRecords(records) {
  return JSON.stringify(records.map(createApplicationRecord));
}

export function parseApplicationRecords(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(toTrackerCard) : [];
  } catch {
    return [];
  }
}

export function createResumeTrackerDraft({ form = {}, template = {}, documentLanguage = "en", resumeId = "", untitled = "Resume" } = {}) {
  const draft = createApplicationRecord({ status: "preparing", jobTitle: form.title,
    applicationLanguage: documentLanguage, resumeVersion: { id: resumeId,
      name: form.title || form.name || untitled, templateName: template.name, language: documentLanguage } });
  return toTrackerCard({ ...draft, resume: `${template.name || "Resume"} · ${form.title || form.name || "Version"}` });
}
