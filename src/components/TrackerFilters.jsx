import React from "react";
import { COLORS as C } from "../theme/colors.js";
const COPY = {
  en: { label: "Filter applications", role: "Role or company", country: "Country / market", language: "Language", resume: "Resume version", follow: "Follow-ups due", all: "All", due: "Due now", en: "English", fr: "French", ar: "Arabic" },
  fr: { label: "Filtrer les candidatures", role: "Poste ou entreprise", country: "Pays / marché", language: "Langue", resume: "Version du CV", follow: "Relances dues", all: "Tous", due: "À relancer", en: "Anglais", fr: "Français", ar: "Arabe" },
  ar: { label: "تصفية الطلبات", role: "الدور أو الشركة", country: "البلد / السوق", language: "اللغة", resume: "إصدار السيرة", follow: "المتابعات المستحقة", all: "الكل", due: "مستحقة الآن", en: "الإنجليزية", fr: "الفرنسية", ar: "العربية" },
};
export default function TrackerFilters({ locale = "en", value, onChange, cards }) {
  const t = COPY[locale] || COPY.en;
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value });
  const select = { background: C.surface, color: C.text1, border: `1px solid ${C.border}`, borderRadius: 7, padding: 8, colorScheme: "dark" };
  const markets = [...new Set(cards.map((card) => card.marketMode).filter(Boolean))];
  const resumes = [...new Set(cards.map((card) => card.resumeVersion?.name || card.resume).filter(Boolean))];
  return <fieldset style={{ border: 0, padding: 0, margin: "0 0 18px" }}><legend style={{ color: C.text2, fontSize: 12, marginBottom: 8 }}>{t.label}</legend><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <input aria-label={t.role} placeholder={t.role} value={value.query} onChange={set("query")} style={select} />
    <select aria-label={t.country} value={value.market} onChange={set("market")} style={select}><option value="">{t.country}: {t.all}</option>{markets.map((item) => <option key={item}>{item}</option>)}</select>
    <select aria-label={t.language} value={value.language} onChange={set("language")} style={select}><option value="">{t.language}: {t.all}</option><option value="en">{t.en}</option><option value="fr">{t.fr}</option><option value="ar">{t.ar}</option></select>
    <select aria-label={t.resume} value={value.resume} onChange={set("resume")} style={select}><option value="">{t.resume}: {t.all}</option>{resumes.map((item) => <option key={item}>{item}</option>)}</select>
    <label style={{ color: C.text2, fontSize: 12 }}><input type="checkbox" checked={value.followUpDue} onChange={(event) => onChange({ ...value, followUpDue: event.target.checked })} /> {t.due}</label>
  </div></fieldset>;
}
