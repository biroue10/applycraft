import React from "react";
import { applicationPackCopy } from "../application/applicationPackCopy.js";
import { COLORS as C } from "../theme/colors.js";

export default function ApplicationPackSection({ locale = "en", mobile = false }) {
  const copy = applicationPackCopy(locale);
  return <section aria-labelledby="application-pack-title" style={{ padding: mobile ? "56px 16px" : "80px 24px", background: C.surface }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ maxWidth: 760, margin: "0 auto 38px", textAlign: "center" }}><p style={{ color: C.accent2 }}>{copy.eyebrow}</p><h2 id="application-pack-title" style={{ color: C.text1 }}>{copy.title}</h2><p style={{ color: C.text2, lineHeight: 1.7 }}>{copy.description}</p></header>
      <ol style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(7,minmax(0,1fr))", gap: 10 }}>{copy.steps.map((title, index) => <li key={title} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 10, background: C.elevated }}><b style={{ color: C.accent2 }}>{index + 1}</b><h3 style={{ color: C.text1, fontSize: 13.5 }}>{title}</h3></li>)}</ol>
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 30 }}><a href={locale === "en" ? "/application-pack/" : `/${locale}/application-pack/`} style={{ padding: "12px 24px", color: "white", background: C.grad, borderRadius: 6, fontWeight: 700, textDecoration: "none" }}>{copy.cta}</a><span style={{ color: C.text3, fontSize: 12.5, maxWidth: 470 }}>{copy.privacy}</span></div>
    </div>
  </section>;
}
