import React from "react";
const LABEL = { en: "Track this application", fr: "Suivre cette candidature", ar: "تتبّع طلب التوظيف هذا" };
export default function TrackApplicationAction({ locale = "en", form, template, documentLanguage, resumeId, untitled, onOpen }) {
  const track = async () => {
    const { createResumeTrackerDraft } = await import("../application/applicationRecord.js");
    onOpen(createResumeTrackerDraft({ form, template, documentLanguage, resumeId, untitled }));
  };
  return <button type="button" onClick={track} style={{ marginInlineStart: 8 }}>{LABEL[locale] || LABEL.en}</button>;
}
