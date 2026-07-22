export const MARKET_MODES = Object.freeze([
  { id: "canada", labels: { en: "Canada", fr: "Canada", ar: "كندا" }, pageSize: "Letter", terminology: "resume", photo: "usually-omit", address: "city-region", length: "one-or-two", fileNote: "follow-posting" },
  { id: "morocco", labels: { en: "Morocco", fr: "Maroc", ar: "المغرب" }, pageSize: "A4", terminology: "cv", photo: "posting-dependent", address: "city", length: "one-or-two", fileNote: "follow-posting" },
  { id: "france", labels: { en: "France", fr: "France", ar: "فرنسا" }, pageSize: "A4", terminology: "cv", photo: "optional", address: "city", length: "one-or-two", fileNote: "follow-posting" },
  { id: "united-kingdom", labels: { en: "United Kingdom", fr: "Royaume-Uni", ar: "المملكة المتحدة" }, pageSize: "A4", terminology: "cv", photo: "usually-omit", address: "city-region", length: "one-or-two", fileNote: "follow-posting" },
  { id: "gulf", labels: { en: "Gulf countries", fr: "Pays du Golfe", ar: "دول الخليج" }, pageSize: "A4", terminology: "cv", photo: "posting-dependent", address: "city-country", length: "one-or-two", fileNote: "follow-posting" },
  { id: "international", labels: { en: "International remote", fr: "International à distance", ar: "عمل دولي عن بُعد" }, pageSize: "A4", terminology: "resume-or-cv", photo: "posting-dependent", address: "country-timezone", length: "relevance-led", fileNote: "follow-posting" },
]);

export function marketMode(id) {
  return MARKET_MODES.find((item) => item.id === id) || MARKET_MODES[MARKET_MODES.length - 1];
}

export function marketGuidance(id, locale = "en") {
  const mode = marketMode(id);
  return { ...mode, label: mode.labels[locale] || mode.labels.en,
    advisory: true, employerInstructionsTakePriority: true };
}
