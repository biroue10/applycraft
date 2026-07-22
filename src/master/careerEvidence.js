const value = (input, max = 1000) => String(input || "").trim().slice(0, max);
const list = (input, maxItems = 20) => Array.isArray(input)
  ? input.slice(0, maxItems).map((item) => value(item, 100)).filter(Boolean)
  : [];

export function createCareerEvidence(input = {}) {
  const now = new Date().toISOString();
  return {
    id: value(input.id, 100) || `evidence-${Date.now()}`,
    title: value(input.title, 200),
    problem: value(input.problem, 2000),
    action: value(input.action, 3000),
    tools: list(input.tools),
    result: value(input.result, 2000),
    metric: value(input.metric, 300),
    relevantSkills: list(input.relevantSkills),
    suitableRoles: list(input.suitableRoles),
    sourceExperienceId: value(input.sourceExperienceId, 100),
    createdAt: value(input.createdAt, 40) || now,
    updatedAt: now,
  };
}

export function evidenceForRole(items, roleSkills = []) {
  const terms = new Set(roleSkills.map((item) => value(item, 100).toLowerCase()).filter(Boolean));
  return items.map(createCareerEvidence).filter((item) => {
    if (!terms.size) return true;
    return [...item.relevantSkills, ...item.suitableRoles]
      .some((entry) => terms.has(entry.toLowerCase()));
  });
}

// AI output may improve wording, but these factual fields must only contain
// values already supplied by the user. Unknown facts are removed.
export function constrainAiEvidence(original, suggestion = {}) {
  const source = createCareerEvidence(original);
  const safe = createCareerEvidence({ ...source, title: suggestion.title || source.title,
    problem: suggestion.problem || source.problem, action: suggestion.action || source.action,
    result: suggestion.result || source.result });
  safe.tools = list(suggestion.tools).filter((tool) => source.tools.includes(tool));
  safe.metric = suggestion.metric === source.metric ? source.metric : "";
  safe.relevantSkills = list(suggestion.relevantSkills).filter((skill) => source.relevantSkills.includes(skill));
  safe.suitableRoles = list(suggestion.suitableRoles).filter((role) => source.suitableRoles.includes(role));
  safe.sourceExperienceId = source.sourceExperienceId;
  safe.createdAt = source.createdAt;
  return safe;
}
