import React from "react";
import { COLORS as C } from "../theme/colors.js";

const COPY = {
  en: { storeDevice: "Store tracker metadata on this device", storeDeviceHelp: "Optional. Document content is not saved.", exportData: "Export data", importData: "Import tracker data", deleteData: "Delete local data" },
  fr: { storeDevice: "Stocker les métadonnées sur cet appareil", storeDeviceHelp: "Facultatif. Le contenu des documents n’est pas enregistré.", exportData: "Exporter les données", importData: "Importer les données de suivi", deleteData: "Effacer les données locales" },
  ar: { storeDevice: "حفظ بيانات التتبع الوصفية على هذا الجهاز", storeDeviceHelp: "اختياري. لا يتم حفظ محتوى المستندات.", exportData: "تصدير البيانات", importData: "استيراد بيانات التتبع", deleteData: "حذف البيانات المحلية" },
};
export default function TrackerPrivacyControls({ locale = "en", enabled, setEnabled, cards, replace, clear }) {
  const copy = COPY[locale] || COPY.en;
  const button = { background: C.elevated, color: C.text1, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", font: "inherit" };
  const download = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "applycraft-application-tracker.json";
    anchor.click();
    URL.revokeObjectURL(href);
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    const { parseApplicationRecords } = await import("../application/applicationRecord.js");
    replace(parseApplicationRecords(await file.text()));
    event.target.value = "";
  };
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18, padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
    <label style={{ display: "flex", alignItems: "center", gap: 9, color: C.text2, fontSize: 12.5, cursor: "pointer" }}><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /><span><strong style={{ color: C.text1 }}>{copy.storeDevice}</strong><br />{copy.storeDeviceHelp}</span></label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><label style={button}>{copy.importData}<input className="sr-only" type="file" accept="application/json,.json" onChange={upload} /></label><button style={button} type="button" onClick={download} disabled={!cards.length}>{copy.exportData}</button><button style={{ ...button, color: C.danger }} type="button" onClick={clear} disabled={!cards.length}>{copy.deleteData}</button></div>
  </div>;
}
