import assert from "node:assert/strict";
import { createApplicationRecord, createResumeTrackerDraft, filterApplicationRecords, parseApplicationRecords, serializeApplicationRecords } from "../src/application/applicationRecord.js";
import { constrainAiEvidence, createCareerEvidence, evidenceForRole } from "../src/master/careerEvidence.js";
import { MARKET_MODES, marketGuidance } from "../src/markets/marketModes.js";
import { DATA_ACTIVITIES, activityDisclosure } from "../src/privacy/dataActivities.js";
import { canShareApplicationPackage, createPrivateApplicationPackage, TRACKING_DISCLAIMER } from "../src/application/packageShare.js";

const record = createApplicationRecord({ company: " Example Ltd ", position: "Support Engineer", column: "applied",
  resumeVersion: { id: "r1", name: "Support v3", templateName: "Atlas", language: "fr", content: "must not persist" },
  coverLetterVersion: { id: "c1", name: "Example letter", language: "fr" }, marketMode: "canada", applicationLanguage: "fr" });
assert.equal(record.companyName, "Example Ltd");
assert.equal(record.resumeVersion.id, "r1");
assert.equal(record.resumeVersion.content, undefined, "document content must never be copied into tracker metadata");
assert.equal(record.status, "applied");
assert.equal(parseApplicationRecords(serializeApplicationRecords([record]))[0].resume, "Support v3");
assert.equal(filterApplicationRecords([record], { marketMode: "canada", applicationLanguage: "fr" }).length, 1);
assert.equal(filterApplicationRecords([record], { status: "offer" }).length, 0);
const resumeDraft = createResumeTrackerDraft({ form: { name: "Sam", title: "Engineer", summary: "must not persist" }, template: { name: "Atlas" }, documentLanguage: "ar", resumeId: "r2" });
assert.equal(resumeDraft.resumeVersion.templateName, "Atlas");
assert.equal(resumeDraft.resumeVersion.language, "ar");
assert.equal(resumeDraft.summary, undefined);

const evidence = createCareerEvidence({ title: "Support guides", action: "Created reusable guides", tools: ["Zendesk"],
  result: "Reduced repeated escalations", metric: "12%", relevantSkills: ["Support"] });
const constrained = constrainAiEvidence(evidence, { action: "Clarified wording", tools: ["Zendesk", "Salesforce"], metric: "50%", relevantSkills: ["Support", "Sales"] });
assert.equal(constrained.action, "Clarified wording");
assert.deepEqual(constrained.tools, ["Zendesk"], "AI must not invent tools");
assert.equal(constrained.metric, "", "AI must not invent or alter metrics");
assert.deepEqual(constrained.relevantSkills, ["Support"]);
assert.equal(evidenceForRole([evidence], ["Support"]).length, 1);
assert.equal(evidenceForRole([evidence], ["Accounting"]).length, 0);

assert.deepEqual(MARKET_MODES.map(({ id }) => id), ["canada", "morocco", "france", "united-kingdom", "gulf", "international"]);
assert.equal(marketGuidance("canada", "fr").label, "Canada");
assert.equal(marketGuidance("canada").employerInstructionsTakePriority, true);
assert.equal(DATA_ACTIVITIES.localTracker.trigger, "explicit-save");
assert.equal(activityDisclosure("ai").transmission, "selected-content");
assert.throws(() => activityDisclosure("unknown"));
const privatePackage = createPrivateApplicationPackage({ confirmed: true, resumeUrl: "https://applycraft.io/r/#private", portfolioUrl: "javascript:alert(1)" });
assert.equal(privatePackage.indexing, "noindex");
assert.equal(privatePackage.portfolioUrl, "");
assert.equal(canShareApplicationPackage(privatePackage), true);
assert.match(TRACKING_DISCLAIMER, /cannot prove/i);

console.log("Application workspace model tests passed.");
