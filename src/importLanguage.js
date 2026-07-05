const FR_STOPWORDS = new Set("avec dans des les une un et ou pour par sur au aux du de la le en à l d est sont été cette ce ces qui que nous vous leur leurs votre vos plus comme".split(/\s+/));
const EN_STOPWORDS = new Set("with in the and or for by on to of a an is are was were this that these those your you we our their from as".split(/\s+/));

function stripAccents(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function detectImportedTextLanguage(text) {
  const raw = String(text || "");
  if (!raw.trim()) return "en";
  const arabic = (raw.match(/[\u0600-\u06FF]/g) || []).length;
  const letters = (raw.match(/[A-Za-zÀ-ɏ\u0600-\u06FF]/g) || []).length || 1;
  if (arabic / letters > 0.2) return "ar";

  const words = stripAccents(raw.toLowerCase()).split(/[^a-z]+/).filter((word) => word.length > 1);
  let fr = 0;
  let en = 0;
  for (const word of words) {
    if (FR_STOPWORDS.has(word)) fr += 1;
    if (EN_STOPWORDS.has(word)) en += 1;
  }
  return fr > en ? "fr" : "en";
}

export function textFromParsedResume(parsed = {}) {
  const chunks = [
    parsed.name,
    parsed.title,
    parsed.location,
    parsed.summary,
    ...(parsed.experience || []).flatMap((entry) => [
      entry.title,
      entry.company,
      entry.location,
      entry.startDate,
      entry.endDate,
      ...(entry.bullets || []),
    ]),
    ...(parsed.education || []).flatMap((entry) => [
      entry.degree,
      entry.school,
      entry.location,
      entry.startDate,
      entry.endDate,
      entry.description,
    ]),
    ...(parsed.skills || []),
    ...(parsed.languages || []),
  ];
  return chunks.filter(Boolean).join("\n");
}

export function detectImportedResumeLanguage(parsedOrText) {
  const text = typeof parsedOrText === "string" ? parsedOrText : textFromParsedResume(parsedOrText);
  const detected = detectImportedTextLanguage(text);
  return ["ar", "fr", "en"].includes(detected) ? detected : "en";
}
