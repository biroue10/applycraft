import React, { useState } from "react";
import { createCareerEvidence } from "../master/careerEvidence.js";
import { COLORS as C } from "../theme/colors.js";

const COPY = {
  en: { title: "Achievement / Evidence Library", intro: "Save truthful examples once, then select the most relevant evidence for each application.", notice: "AI selects and improves your real evidence—it does not invent your experience.", add: "Add evidence", evidenceTitle: "Evidence title", problem: "Problem or context", action: "Action you took *", tools: "Tools (comma-separated)", result: "Result", metric: "Metric (only when truthful)", skills: "Relevant skills", roles: "Suitable roles", remove: "Remove" },
  fr: { title: "Bibliothèque de réalisations et de preuves", intro: "Conservez des exemples réels, puis sélectionnez les preuves pertinentes pour chaque candidature.", notice: "L’IA sélectionne et améliore vos preuves réelles ; elle n’invente pas votre expérience.", add: "Ajouter une preuve", evidenceTitle: "Titre de la preuve", problem: "Problème ou contexte", action: "Action réalisée *", tools: "Outils (séparés par des virgules)", result: "Résultat", metric: "Mesure (uniquement si exacte)", skills: "Compétences pertinentes", roles: "Postes adaptés", remove: "Supprimer" },
  ar: { title: "مكتبة الإنجازات والأدلة", intro: "احفظ أمثلة حقيقية مرة واحدة، ثم اختر الأدلة الأنسب لكل طلب.", notice: "يختار الذكاء الاصطناعي أدلتك الحقيقية ويحسّنها، ولا يخترع خبرتك.", add: "إضافة دليل", evidenceTitle: "عنوان الدليل", problem: "المشكلة أو السياق", action: "الإجراء الذي اتخذته *", tools: "الأدوات (مفصولة بفواصل)", result: "النتيجة", metric: "المقياس (إذا كان دقيقًا فقط)", skills: "المهارات ذات الصلة", roles: "الأدوار المناسبة", remove: "حذف" },
};
const EMPTY = { title: "", problem: "", action: "", tools: "", result: "", metric: "", relevantSkills: "", suitableRoles: "" };
const split = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function EvidenceLibrary({ locale = "en", items = [], onChange }) {
  const copy = COPY[locale] || COPY.en;
  const [draft, setDraft] = useState(EMPTY);
  const input = { width: "100%", boxSizing: "border-box", background: C.surface, color: C.text1, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px" };
  const add = () => {
    if (!draft.action.trim()) return;
    onChange([...items, createCareerEvidence({ ...draft, tools: split(draft.tools), relevantSkills: split(draft.relevantSkills), suitableRoles: split(draft.suitableRoles) })]);
    setDraft(EMPTY);
  };
  return <section aria-labelledby="evidence-library-title" style={{ marginBottom: 28, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
    <h3 id="evidence-library-title" style={{ color: C.text1 }}>{copy.title}</h3><p style={{ color: C.text2 }}>{copy.intro}</p><p role="note" style={{ color: C.accent2 }}>{copy.notice}</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 9 }}>{[["title","evidenceTitle"],["problem","problem"],["action","action"],["tools","tools"],["result","result"],["metric","metric"],["relevantSkills","skills"],["suitableRoles","roles"]].map(([key,label]) => <label key={key} style={{ color: C.text2, fontSize: 12 }}>{copy[label]}<input value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} style={input} /></label>)}</div>
    <button type="button" onClick={add} disabled={!draft.action.trim()} style={{ marginTop: 10 }}>{copy.add}</button>
    <ul style={{ padding: 0, listStyle: "none" }}>{items.map((item) => <li key={item.id} style={{ padding: 10, border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 8, color: C.text2 }}><strong style={{ color: C.text1 }}>{item.title || item.action}</strong>{item.result && <p>{item.result}{item.metric && ` · ${item.metric}`}</p>}<button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}>{copy.remove}</button></li>)}</ul>
  </section>;
}
