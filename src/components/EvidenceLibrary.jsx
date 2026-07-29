import React, { useState } from "react";
import { createCareerEvidence } from "../master/careerEvidence.js";
import { COLORS as C } from "../theme/colors.js";
import { getAtsAiCopy } from "./atsAiCopy.js";

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

const safeText = (value, max = 700) => typeof value === "string" ? value.trim().slice(0, max) : "";
const safeLevel = (value) => ["high", "medium", "low"].includes(value) ? value : "medium";
const safeList = (value, max, mapper) => Array.isArray(value) ? value.slice(0, max).map(mapper).filter(Boolean) : [];

export function parseAtsAiPlan(raw) {
  const cleaned = String(raw || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let data;
  try { data = JSON.parse(cleaned); } catch { throw new Error("INVALID_ATS_AI_RESPONSE"); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("INVALID_ATS_AI_RESPONSE");
  return {
    summary: safeText(data.summary, 900),
    priorities: safeList(data.priorities, 5, (item) => {
      const title = safeText(item?.title, 180);
      return title ? { title, reason: safeText(item?.reason, 360), level: safeLevel(item?.level) } : null;
    }),
    keywords: safeList(data.keywords, 8, (item) => {
      const term = safeText(item?.term, 80);
      return term ? { term, reason: safeText(item?.reason, 240), level: safeLevel(item?.level) } : null;
    }),
    rewrites: safeList(data.rewrites, 3, (item) => {
      const original = safeText(item?.original, 700);
      const suggested = safeText(item?.suggested, 700);
      return original && suggested ? { original, suggested, reason: safeText(item?.reason, 300) } : null;
    }),
    phrases: safeList(data.phrases, 5, (item) => safeText(item, 180)),
  };
}

export function addConfirmedKeywords(text, terms) {
  const source = String(text || "");
  const sourceLower = source.toLocaleLowerCase();
  const unique = [...new Set((terms || []).map((term) => safeText(term, 80)).filter((term) => term && !sourceLower.includes(term.toLocaleLowerCase())))];
  if (!unique.length) return String(text || "");
  return `${source.trimEnd()}\n\nSKILLS\n${unique.join(", ")}`;
}

export function AtsAiAssistant({ plan, locale = "en", currentScore, potentialScore, onApplyRewrite, onApplyKeywords, onRecheck, onOpenBuilder }) {
  const copy = getAtsAiCopy(locale);
  const [keywordStates, setKeywordStates] = useState(() => Object.fromEntries(plan.keywords.map((item) => [item.term, "relevant"])));
  const [rewriteStates, setRewriteStates] = useState({});
  const [drafts, setDrafts] = useState(() => Object.fromEntries(plan.rewrites.map((item, index) => [index, item.suggested])));
  const [notice, setNotice] = useState("");
  const panel = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 };
  const button = { border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 11px", color: C.text2, background: C.elevated, font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" };
  const levelColor = { high: "#f87171", medium: "#fbbf24", low: "#60a5fa" };
  const confirmed = plan.keywords.filter((item) => keywordStates[item.term] === "have").map((item) => item.term);
  const applyKeywords = () => {
    if (!confirmed.length) return;
    onApplyKeywords(confirmed);
    setNotice(copy.keywordsApplied);
  };
  const applyRewrite = (item, index) => {
    const applied = onApplyRewrite(item.original, drafts[index]);
    setRewriteStates((current) => ({ ...current, [index]: applied ? "applied" : "missing" }));
  };
  return <section aria-labelledby="ats-ai-plan-title" style={{ marginTop: 18, display: "grid", gap: 14 }}>
    <div style={{ ...panel, background: `${C.accent}0D`, borderColor: `${C.accent}45` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px" }}>
          <h2 id="ats-ai-plan-title" style={{ color: C.text1, fontSize: 18, margin: "0 0 6px" }}>{copy.aiPlanTitle}</h2>
          <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{plan.summary || copy.aiPlanFallbackSummary}</p>
        </div>
        <div style={{ textAlign: "center", minWidth: 116 }}>
          <div style={{ color: C.text3, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{copy.potentialScore}</div>
          <div style={{ color: C.accent2, fontSize: 28, fontWeight: 900 }}>{currentScore} → {potentialScore}</div>
          <div style={{ color: C.text3, fontSize: 10 }}>{copy.potentialScoreHint}</div>
        </div>
      </div>
    </div>

    {plan.priorities.length > 0 && <div style={panel}>
      <h3 style={{ color: C.text1, fontSize: 15, margin: "0 0 12px" }}>{copy.priorityTitle}</h3>
      <ol style={{ margin: 0, paddingInlineStart: 22 }}>
        {plan.priorities.map((item, index) => <li key={`${item.title}-${index}`} style={{ color: C.text2, marginBottom: 10, paddingInlineStart: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ color: C.text1 }}>{item.title}</strong>
            <span style={{ color: levelColor[item.level], fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{copy[`priority${item.level[0].toUpperCase()}${item.level.slice(1)}`]}</span>
          </div>
          {item.reason && <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>{item.reason}</div>}
        </li>)}
      </ol>
    </div>}

    {plan.keywords.length > 0 && <div style={panel}>
      <h3 style={{ color: C.text1, fontSize: 15, margin: "0 0 4px" }}>{copy.keywordTriageTitle}</h3>
      <p style={{ color: C.text3, fontSize: 12, margin: "0 0 12px" }}>{copy.keywordTriageHint}</p>
      <div style={{ display: "grid", gap: 9 }}>
        {plan.keywords.map((item) => <div key={item.term} style={{ borderTop: `1px solid ${C.border}`, paddingTop: 9 }}>
          <div style={{ color: C.text1, fontWeight: 800, fontSize: 13 }}>{item.term}</div>
          {item.reason && <div style={{ color: C.text3, fontSize: 11.5, margin: "2px 0 7px" }}>{item.reason}</div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["relevant", copy.keywordRelevant], ["have", copy.keywordHave], ["ignore", copy.keywordIgnore]].map(([value, label]) =>
              <button key={value} type="button" onClick={() => setKeywordStates((current) => ({ ...current, [item.term]: value }))}
                aria-pressed={keywordStates[item.term] === value}
                style={{ ...button, color: keywordStates[item.term] === value ? "#fff" : C.text2, background: keywordStates[item.term] === value ? C.accent : C.elevated }}>{label}</button>)}
          </div>
        </div>)}
      </div>
      <button type="button" onClick={applyKeywords} disabled={!confirmed.length}
        style={{ ...button, marginTop: 12, color: "#fff", background: C.grad, border: "none", opacity: confirmed.length ? 1 : 0.5 }}>{copy.applyConfirmedKeywords}</button>
      {notice && <div role="status" style={{ color: "#4ade80", fontSize: 12, marginTop: 8 }}>{notice}</div>}
    </div>}

    {plan.rewrites.length > 0 && <div style={panel}>
      <h3 style={{ color: C.text1, fontSize: 15, margin: "0 0 4px" }}>{copy.rewriteTitle}</h3>
      <p style={{ color: C.text3, fontSize: 12, margin: "0 0 12px" }}>{copy.rewriteHint}</p>
      <div style={{ display: "grid", gap: 12 }}>
        {plan.rewrites.map((item, index) => <article key={`${item.original}-${index}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
          <div style={{ color: C.text3, fontSize: 10.5, fontWeight: 800, textTransform: "uppercase" }}>{copy.currentVersion}</div>
          <p style={{ color: C.text2, fontSize: 12.5, lineHeight: 1.5, margin: "4px 0 10px" }}>{item.original}</p>
          <label style={{ display: "block", color: C.text3, fontSize: 10.5, fontWeight: 800, textTransform: "uppercase" }}>
            {copy.suggestedVersion}
            <textarea value={drafts[index]} onChange={(event) => setDrafts((current) => ({ ...current, [index]: event.target.value }))}
              style={{ width: "100%", minHeight: 72, boxSizing: "border-box", marginTop: 5, resize: "vertical", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, background: C.elevated, color: C.text1, font: "inherit", fontSize: 12.5, lineHeight: 1.5 }} />
          </label>
          {item.reason && <p style={{ color: C.text3, fontSize: 11.5, margin: "7px 0" }}>{item.reason}</p>}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => applyRewrite(item, index)} style={{ ...button, color: "#fff", background: C.accent, border: "none" }}>{copy.acceptRewrite}</button>
            <button type="button" onClick={() => setRewriteStates((current) => ({ ...current, [index]: "ignored" }))} style={button}>{copy.ignoreRewrite}</button>
            {rewriteStates[index] && <span role="status" style={{ color: rewriteStates[index] === "missing" ? "#fbbf24" : "#4ade80", fontSize: 11.5 }}>
              {rewriteStates[index] === "applied" ? copy.applied : rewriteStates[index] === "ignored" ? copy.ignored : copy.originalNotFound}
            </span>}
          </div>
        </article>)}
      </div>
    </div>}

    {plan.phrases.length > 0 && <div style={panel}>
      <h3 style={{ color: C.text1, fontSize: 15, margin: "0 0 10px" }}>{copy.phrasesTitle}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{plan.phrases.map((phrase) => <span key={phrase} style={{ color: C.text2, border: `1px solid ${C.border}`, borderRadius: 999, padding: "5px 10px", fontSize: 12 }}>{phrase}</span>)}</div>
    </div>}

    <div style={{ position: "sticky", bottom: 10, zIndex: 2, display: "flex", gap: 8, flexWrap: "wrap", padding: 10, borderRadius: 12, background: `${C.surface}F2`, border: `1px solid ${C.border}`, boxShadow: "0 12px 32px #0008" }}>
      <button type="button" onClick={onRecheck} style={{ ...button, flex: "1 1 170px" }}>{copy.recheckAfterChanges}</button>
      <button type="button" onClick={onOpenBuilder} style={{ ...button, flex: "1 1 210px", color: "#fff", background: C.grad, border: "none" }}>{copy.continueInBuilder}</button>
    </div>
  </section>;
}
