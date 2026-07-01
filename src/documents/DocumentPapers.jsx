import React from "react";

function ContactLine({ items, separator = " · ", style }) {
  const values = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!values.length) return null;
  return (
    <span style={style}>
      {values.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span aria-hidden="true">{separator}</span>}
          <bdi dir="auto" style={{ unicodeBidi: "isolate", overflowWrap: "anywhere" }}>{item}</bdi>
        </React.Fragment>
      ))}
    </span>
  );
}

function BidiText({ children, style }) {
  return <span dir="auto" style={{ unicodeBidi: "plaintext", overflowWrap: "anywhere", ...style }}>{children}</span>;
}

export function ResumePaper({ tpl: rawTpl, result, rtl, lang = "en", placeholder = true, preview = false }) {
  const tpl = rawTpl.variant ? { ...rawTpl, id: rawTpl.variant } : rawTpl;
  const hasContent = result && (result.name !== "—" || result.summary || (result.sections && result.sections.length));
  const empty = placeholder && !hasContent;
  const data = result || { name: "—", title: "", contact: [], summary: "", sections: [] };
  const paper = { background: "#fff", color: "#1a1a1a",
    borderRadius: 0, minHeight: preview ? "100%" : 900,
    height: preview ? "100%" : undefined,
    maxHeight: undefined,
    padding: preview ? 12 : 0,
    fontFamily: rtl ? "'Noto Sans Arabic', 'Tahoma', 'Arial', sans-serif" : tpl.font,
    direction: rtl ? "rtl" : "ltr",
    textAlign: rtl ? "right" : "left",
    unicodeBidi: "plaintext",
    overflow: preview ? "visible" : "hidden",
    boxShadow: preview ? "0 2px 12px rgba(0,0,0,0.12)" : "0 4px 16px rgba(0,0,0,0.18)",
    width: "100%", boxSizing: "border-box" };

  if (empty) {
    return <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={{ ...paper, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: 30, textAlign: "center" }}>
      {tpl.id === "blank"
        ? "Fill in the form — your plain-text resume will appear here."
        : <>Your resume will appear here in the <strong style={{ color: tpl.accent, margin: "0 4px" }}>{tpl.name}</strong> style.</>}
    </div>;
  }

  if (tpl.id === "blank") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={{ ...paper, fontFamily: rtl ? "'Noto Sans Arabic', 'Tahoma', 'Arial', sans-serif" : "'Inter', system-ui, sans-serif" }}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: "#111", letterSpacing: "-0.3px" }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13.5, color: "#444", marginTop: 3 }}>{data.title}</div>}
            {data.contact.length > 0 && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.6 }}>
                <ContactLine items={data.contact} separator="   |   " />
              </div>
            )}
          </div>
          <div style={{ height: 1, background: "#d1d5db", margin: "14px 0" }} />
          {data.summary && (
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#333", margin: "0 0 14px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                color: "#111", marginBottom: 5 }}>{s.heading}</div>
              {s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 13, lineHeight: 1.55, color: "#333", marginBottom: 3 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Whether a section belongs in a sidebar (skills, languages)
  const isSidebar = (s) => /skill|compét|habilidad|مهارات|fähig|^language|^langue|^idioma|^sprach/i.test(s.heading);

  // ── CLASSIC (Mercury Flow — centered serif, accent rule) ─────────
  if (tpl.id === "classic") {
    const SHead = ({ label }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 9px" }}>
        <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
          color: tpl.accent, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
      </div>
    );
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "30px 34px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "0.5px",
              lineHeight: 1.15 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: tpl.accent, marginTop: 5, fontStyle: "italic" }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#777", marginTop: 8, lineHeight: 1.9 }}><ContactLine items={data.contact} separator="  ·  " /></div>
            <div style={{ height: 2, width: 44, background: tpl.accent, margin: "12px auto 0" }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", textAlign: "center",
              margin: "16px 0 0", fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i}>
              <SHead label={s.heading} />
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "3px 11px", borderRadius: 999,
                      border: `1px solid ${tpl.accent}77`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 14, position: "relative", textAlign: "left" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent }}>›</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── MODERN (Atlantic Blue — left accent sidebar) ─────────────────
  if (tpl.id === "modern") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "32%", background: tpl.accent, color: "#fff", padding: "28px 16px",
            flexShrink: 0 }}>
            {data.photo && (
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, opacity: 0.82, marginBottom: 7, wordBreak: "break-all",
                lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  opacity: 0.55, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 999,
                      background: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#555", margin: "0 0 18px",
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                    paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}28` }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── MINIMAL (Precision Line — left-aligned, thin rules) ──────────
  if (tpl.id === "minimal") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "32px 36px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#111", letterSpacing: "-0.5px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#666", marginTop: 5 }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#999", marginTop: 8, lineHeight: 1.9 }}>
              <ContactLine items={data.contact} separator="   ·   " />
            </div>
            <div style={{ height: 2, background: tpl.accent, width: 36, marginTop: 14 }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", margin: "0 0 22px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: "#aaa", whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 11px", borderRadius: 3,
                      background: "#f3f4f6", color: "#374151", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444",
                  marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── BOLD (full-bleed accent header, badge section headings) ──────
  if (tpl.id === "bold") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ background: tpl.accent, padding: "26px 28px 22px" }}>
          <div style={{ fontSize: 27, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 5 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 10 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "22px 28px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
              borderLeft: `3px solid ${tpl.accent}`, paddingLeft: 12 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.5px", color: "#fff", background: tpl.accent,
                padding: "2px 10px", borderRadius: 3, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999,
                      border: `1px solid ${tpl.accent}99`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 13, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ELEGANT (soft left sidebar, serif, refined) ──────────────────
  if (tpl.id === "elegant") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "29%", background: tpl.accent + "0F", padding: "28px 16px",
            borderRight: `1px solid ${tpl.accent}22`, flexShrink: 0 }}>
            {data.photo && (
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: `2px solid ${tpl.accent}55` }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            <div style={{ fontSize: 11.5, color: tpl.accent, marginBottom: 16, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: tpl.accent + "55", marginBottom: 16 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#555", marginBottom: 8, lineHeight: 1.5,
                wordBreak: "break-all" }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent + "cc",
                      background: "#fff" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", margin: "0 0 18px",
                fontStyle: "italic" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333",
                    marginBottom: 7 }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── EXECUTIVE (split header, left-bar sections, gold rule) ───────
  if (tpl.id === "executive") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 27, fontWeight: 800, color: "#111", letterSpacing: "-0.5px",
                lineHeight: 1.1 }}>{data.name}</div>
              {data.title && <div style={{ fontSize: 11.5, color: tpl.accent, marginTop: 6, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.9px" }}>{data.title}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              {data.contact.map((c, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#666", marginBottom: 3, lineHeight: 1.5 }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 3, background: tpl.accent, marginBottom: 18 }} />
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#555", margin: "0 0 18px",
              fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 3, height: 13, background: tpl.accent, flexShrink: 0 }} />
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: "#1a1a1a" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 13 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3,
                      background: tpl.accent + "18", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 13 }}>· {it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── CREATIVE (left colour panel with profile initial) ────────────
  if (tpl.id === "creative") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "34%", background: tpl.accent, color: "#fff", padding: "28px 16px",
            flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", overflow: "hidden",
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, marginBottom: 14, flexShrink: 0 }}>
              {data.photo
                ? <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : data.name.charAt(0)
              }
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 3 }}>{data.name}</div>
            <div style={{ fontSize: 10.5, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, opacity: 0.8, marginBottom: 7, wordBreak: "break-all",
                lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  opacity: 0.55, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999,
                      background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 20px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, borderBottom: `2px solid ${tpl.accent}`,
                  paddingBottom: 5, marginBottom: 10 }}>{s.heading}</div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                    paddingLeft: 12, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>▸</span>{it}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── TECH (dark terminal) ─────────────────────────────────────────
  if (tpl.id === "tech") {
    return (
      <div style={{ ...paper, background: "#0d1117", color: "#e6edf3" }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: tpl.accent, letterSpacing: "-0.3px" }}>{data.name}</div>
            <div style={{ fontSize: 12, color: "#8b949e", marginTop: 3 }}>❯ {data.title}</div>
            <div style={{ fontSize: 11, color: "#6e7681", marginTop: 8, lineHeight: 1.9 }}>
              <ContactLine items={data.contact} separator="  ·  " />
            </div>
            <div style={{ height: 1, background: tpl.accent + "44", marginTop: 14 }} />
          </div>
          {data.summary && (
            <div style={{ fontSize: 12, lineHeight: 1.65, marginBottom: 18, color: "#c9d1d9",
              borderLeft: `2px solid ${tpl.accent}`, paddingLeft: 10 }}>{data.summary}</div>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, color: tpl.accent, fontWeight: 700, marginBottom: 9,
                letterSpacing: "1px" }}>── {s.heading.toUpperCase()} ──</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}55`, color: tpl.accent + "cc" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, lineHeight: 1.55, color: "#c9d1d9", marginBottom: 5 }}>
                  <span style={{ color: tpl.accent }}>▸ </span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SHARP (black & white corporate, full-width black rules) ─────
  if (tpl.id === "sharp") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "28px 36px" }}>
          <div style={{ paddingBottom: 14, marginBottom: 18, borderBottom: "2.5px solid #111" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "0.5px",
              textTransform: "uppercase", lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 11, color: "#555", marginTop: 5, letterSpacing: "1px",
              textTransform: "uppercase", fontWeight: 600 }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
              <ContactLine items={data.contact} separator="   |   " />
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "2.5px", color: "#111", whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1.5, background: "#111" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 2,
                      border: "1px solid #555", color: "#333", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#222", marginBottom: 5,
                  paddingLeft: 10, borderLeft: "2px solid #ddd" }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SLATE (dark navy sidebar, gold accent) ───────────────────────
  if (tpl.id === "slate") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "30%", background: "#0f172a", color: "#fff", padding: "28px 16px",
            flexShrink: 0 }}>
            {data.photo && (
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: `2px solid ${tpl.accent}88` }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 11, color: tpl.accent, marginBottom: 18,
              fontWeight: 600, letterSpacing: "0.3px" }}>{data.title}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 7,
                wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div style={{ width: 3, height: 13, background: tpl.accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: "#0f172a" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333",
                    marginBottom: 5, paddingLeft: 13 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PRISM (gradient header, accent line) ─────────────────────────
  if (tpl.id === "prism") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ background: `linear-gradient(135deg, ${tpl.accent} 0%, #3B82F6 100%)`,
          padding: "26px 30px 22px" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginTop: 5 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 10 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${tpl.accent}, #3B82F6, transparent)` }} />
        <div style={{ padding: "20px 30px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 16px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${tpl.accent}55, transparent)` }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 12, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>›</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── COMPACT (two-column body, high density) ──────────────────────
  if (tpl.id === "compact") {
    const expSection = data.sections.find(s => /exp|expér|work|employ/i.test(s.heading)) || data.sections[0];
    const restSections = data.sections.filter(s => s !== expSection);
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        {/* Header */}
        <div style={{ padding: "20px 26px 16px", borderBottom: `3px solid ${tpl.accent}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
                lineHeight: 1.1 }}>{data.name}</div>
              {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 4,
                fontWeight: 600 }}>{data.title}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              {data.contact.map((c, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#666", lineHeight: 1.6 }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Two-column body */}
        <div style={{ display: "flex", padding: "16px 0" }}>
          {/* Left: experience */}
          <div style={{ width: "57%", padding: "0 20px 0 26px", borderRight: `1px solid #e5e7eb` }}>
            {data.summary && (
              <p style={{ fontSize: 12, lineHeight: 1.65, color: "#444", margin: "0 0 14px",
                paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>{data.summary}</p>
            )}
            {expSection && (
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {expSection.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {expSection.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12, lineHeight: 1.55, color: "#333",
                    marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}33` }}>{it}</div>
                ))}
              </div>
            )}
          </div>
          {/* Right: other sections */}
          <div style={{ flex: 1, padding: "0 20px 0 18px" }}>
            {restSections.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 7,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {s.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {isSidebar(s) ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {s.items.map((it, j) => (
                      <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                        background: tpl.accent + "12", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                    ))}
                  </div>
                ) : s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 11.5, lineHeight: 1.55, color: "#444",
                    marginBottom: 4 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── HORIZON (centered banner header) ─────────────────────────────
  if (tpl.id === "horizon") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ background: tpl.accent, padding: "30px 32px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "1px",
            textTransform: "uppercase", lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 6,
            letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500 }}>{data.title}</div>}
        </div>
        <div style={{ background: "#fafafa", borderBottom: "1px solid #eee", padding: "9px 32px",
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 18px" }}>
          {data.contact.map((c, i) => (
            <span key={i} style={{ fontSize: 10.5, color: "#555" }}>{c}</span>
          ))}
        </div>
        <div style={{ padding: "20px 32px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#444", margin: "0 0 18px",
              textAlign: "center", borderBottom: `1px solid ${tpl.accent}33`, paddingBottom: 16 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
                  color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 12 }}>
                  <span style={{ color: tpl.accent, marginRight: 5 }}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── NORDIC (Scandinavian minimal) ────────────────────────────────
  if (tpl.id === "nordic") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "36px 44px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 32, fontWeight: 300, color: "#111", letterSpacing: "-0.5px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#666", marginTop: 6,
              fontStyle: "italic", fontWeight: 400 }}>{data.title}</div>}
            <div style={{ height: 1, background: tpl.accent, width: "100%", marginTop: 18 }} />
            <div style={{ fontSize: 10.5, color: "#888", marginTop: 10, lineHeight: 2 }}>
              <ContactLine items={data.contact} separator="   ·   " />
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.85, color: "#444", margin: "0 0 26px",
              borderLeft: `3px solid ${tpl.accent}`, paddingLeft: 14 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "3px", color: tpl.accent, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px" }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 12, color: "#555" }}>— {it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.75, color: "#333", marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── DUSK (dark warm charcoal, amber) ─────────────────────────────
  if (tpl.id === "dusk") {
    return (
      <div style={{ ...paper, background: "#1a1a1a", color: "#f0ece3" }}>
        <div style={{ padding: "28px 30px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f0ece3", letterSpacing: "-0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5,
              fontWeight: 600, letterSpacing: "0.5px" }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#7a6e5f", marginTop: 8, lineHeight: 1.9 }}>
              <ContactLine items={data.contact} separator="   ·   " />
            </div>
            <div style={{ height: 1, background: tpl.accent + "55", marginTop: 16 }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12, lineHeight: 1.7, color: "#c4b89a", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 17 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent + "cc" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: "#d4c9b5", marginBottom: 5,
                  paddingLeft: 12 }}>
                  <span style={{ color: tpl.accent }}>▸ </span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── VERTEX (right sidebar, reversed) ─────────────────────────────
  if (tpl.id === "vertex") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ flex: 1, padding: "28px 20px 28px 28px" }}>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              {data.photo && (
                <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden",
                  border: `2px solid ${tpl.accent}55`, flexShrink: 0 }}>
                  <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
                  lineHeight: 1.1 }}>{data.name}</div>
                {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5,
                  fontWeight: 600 }}>{data.title}</div>}
              </div>
            </div>
            {data.summary && (
              <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", margin: "0 0 18px",
                paddingBottom: 14, borderBottom: `1px solid ${tpl.accent}22` }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {s.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: "#333", marginBottom: 4,
                    paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}44` }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ width: "30%", background: tpl.accent + "0f",
            borderLeft: `1px solid ${tpl.accent}22`, padding: "28px 14px", flexShrink: 0 }}>
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: "#555", marginBottom: 8,
                lineHeight: 1.5, wordBreak: "break-all" }}>{c}</div>
            ))}
            <div style={{ height: 1, background: tpl.accent + "44", margin: "14px 0" }} />
            {sideS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 8 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      background: tpl.accent + "18", color: tpl.accent }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMY (academic/scholarly) ─────────────────────────────────
  if (tpl.id === "academy") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "32px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: "0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12.5, color: "#444", marginTop: 5 }}>{data.title}</div>}
            <div style={{ height: 2, background: tpl.accent, margin: "12px auto 3px", width: "60%" }} />
            <div style={{ height: 1, background: tpl.accent + "55", margin: "0 auto 12px", width: "60%" }} />
            <div style={{ fontSize: 10.5, color: "#666", lineHeight: 1.9 }}><ContactLine items={data.contact} separator="   ·   " /></div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12, lineHeight: 1.8, color: "#444", margin: "0 0 20px",
              fontStyle: "italic", textAlign: "center" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                borderBottom: `1px solid ${tpl.accent}44`, paddingBottom: 5 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}66`, color: "#333" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 5, color: tpl.accent }}>·</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SPARK (vibrant section header bands) ─────────────────────────
  if (tpl.id === "spark") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "26px 28px 20px" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: tpl.accent, marginTop: 5, fontWeight: 600 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", marginTop: 8 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "#666" }}>{c}</span>
            ))}
          </div>
        </div>
        {data.summary && (
          <div style={{ margin: "0 28px 18px", fontSize: 12.5, lineHeight: 1.65, color: "#444",
            background: tpl.accent + "0c", borderRadius: 6, padding: "10px 14px",
            borderLeft: `3px solid ${tpl.accent}` }}>{data.summary}</div>
        )}
        {data.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 0 }}>
            <div style={{ background: tpl.accent + "16", padding: "6px 28px",
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: tpl.accent,
              borderLeft: `3px solid ${tpl.accent}` }}>{s.heading}</div>
            <div style={{ padding: "10px 28px 14px" }}>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 12px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 600 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 4 }}>
                  <span style={{ color: tpl.accent, marginRight: 6, fontWeight: 700 }}>›</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── STONE (warm gray header, understated serif) ───────────────────
  if (tpl.id === "stone") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ background: "#f6f4ef", borderBottom: "1px solid #e8e3da", padding: "28px 32px" }}>
          <div style={{ fontSize: 27, fontWeight: 700, color: "#2c2520", letterSpacing: "0.2px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: tpl.accent, marginTop: 5,
            fontStyle: "italic" }}>{data.title}</div>}
          <div style={{ fontSize: 10.5, color: "#7a6e65", marginTop: 10, lineHeight: 1.9 }}>
            <ContactLine items={data.contact} separator="   ·   " />
          </div>
        </div>
        <div style={{ padding: "22px 32px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "#4a4039", margin: "0 0 20px",
              fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#d4cfc7" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 3,
                      background: "#f6f4ef", border: "1px solid #d4cfc7", color: "#4a4039" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.7, color: "#3d3530", marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── IVY (British CV style, double rule) ──────────────────────────
  if (tpl.id === "ivy") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "30px 38px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111", lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#444", marginTop: 4,
              fontStyle: "italic" }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#666", marginTop: 8, lineHeight: 1.9 }}>
              <ContactLine items={data.contact} separator="   ·   " />
            </div>
          </div>
          <div style={{ height: 2, background: tpl.accent, marginBottom: 2 }} />
          <div style={{ height: 1, background: tpl.accent + "66", marginBottom: 18 }} />
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "#444", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tpl.accent,
                borderBottom: `1px solid ${tpl.accent}44`, paddingBottom: 5, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11.5, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}55`, color: "#333" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 2, top: 6, width: 5, height: 5,
                    background: tpl.accent, borderRadius: "50%",
                    display: "inline-block" }} />{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── CARBON (charcoal sidebar, square monogram) ────────────────────
  if (tpl.id === "carbon") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "31%", background: "#1e1e1e", color: "#e4e4e4",
            padding: "28px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 54, height: 54, background: tpl.accent + "44",
              border: `2px solid ${tpl.accent}`, borderRadius: 4, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-1px" }}>
              {data.photo
                ? <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : data.name.split(" ").map(w => w[0]).slice(0, 2).join("")
              }
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 3 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 10.5, color: tpl.accent, marginBottom: 18 }}>{data.title}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: "#9ca3af", marginBottom: 8,
                wordBreak: "break-all", lineHeight: 1.5 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 2,
                      background: "rgba(255,255,255,0.08)", color: "#d1d5db" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ width: 8, height: 8, background: tpl.accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "2px", color: "#1e1e1e" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333",
                    marginBottom: 5, paddingLeft: 16 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PULSE (gradient left bar, square bullets) ─────────────────────
  if (tpl.id === "pulse") {
    return (
      <div style={{ ...paper, display: "flex" }}>
        <div style={{ width: 5, background: `linear-gradient(180deg, ${tpl.accent} 0%, #3b82f6 100%)`,
          flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "28px 26px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 27, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5, fontWeight: 600 }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#777", marginTop: 8, lineHeight: 1.9 }}>
              <ContactLine items={data.contact} separator="   ·   " />
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
              borderLeft: `3px solid ${tpl.accent}55`, paddingLeft: 12 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: `linear-gradient(90deg, ${tpl.accent}, #3b82f6)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${tpl.accent}44, transparent)` }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: tpl.accent, flexShrink: 0,
                    marginTop: 5, borderRadius: 1 }} />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── FALLBACK (same as classic) ───────────────────────────────────
  return (
    <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
      <div style={{ padding: "28px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>{data.name}</div>
        {data.title && <div style={{ fontSize: 13, color: tpl.accent, marginTop: 4 }}>{data.title}</div>}
        <div style={{ fontSize: 11, color: "#777", marginTop: 7 }}><ContactLine items={data.contact} separator="  ·  " /></div>
        <div style={{ height: 2, width: 44, background: tpl.accent, margin: "12px auto 16px" }} />
        {data.summary && <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#555", margin: "0 0 14px" }}>{data.summary}</p>}
        {data.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 14, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
              color: tpl.accent, marginBottom: 7 }}>{s.heading}</div>
            {s.items.map((it, j) => (
              <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 4 }}>• {it}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoverLetterPaper({ tpl: rawTpl, data: d, rtl = false, lang = "en", preview = false }) {
  const tpl = rawTpl.variant ? { ...rawTpl, id: rawTpl.variant } : rawTpl;
  const paper = {
    background: "#fff", color: "#1a1a1a",
    borderRadius: 0, minHeight: preview ? "100%" : 900,
    height: preview ? "100%" : undefined,
    maxHeight: undefined,
    padding: preview ? 12 : 0,
    fontFamily: rtl ? "'Noto Sans Arabic', 'Tahoma', 'Arial', sans-serif" : tpl.font,
    direction: rtl ? "rtl" : "ltr",
    textAlign: rtl ? "right" : "left",
    unicodeBidi: "plaintext",
    overflow: preview ? "visible" : "hidden",
    boxShadow: preview ? "0 2px 12px rgba(0,0,0,0.12)" : "0 4px 16px rgba(0,0,0,0.18)",
    width: "100%", boxSizing: "border-box",
  };

  const Paras = ({ text, style = {} }) =>
    text ? text.split("\n\n").filter(Boolean).map((p, i) => (
      <p key={i} style={{ fontSize: 13, lineHeight: 1.78, color: "#333", margin: "0 0 14px", ...style }}>{p}</p>
    )) : null;

  if (tpl.blank) {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "40px 48px", fontSize: 13, lineHeight: 1.85, color: "#333" }}>
          <div style={{ marginBottom: 20 }}>
            {d.name && <div style={{ fontWeight: 600 }}>{d.name}</div>}
            {d.jobTitle && <div>{d.jobTitle}</div>}
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => <div key={i}>{c}</div>)}
          </div>
          {d.date && <div style={{ marginBottom: 20 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20 }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div>{d.company}</div>}
              {d.companyAddress && <div>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontWeight: 600, marginBottom: 16 }}>Re: {d.subject}</div>}
          {d.opening && <div style={{ marginBottom: 16 }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 32 }}>{d.signoff || "Sincerely"},</div>
          {!preview && <div style={{ marginTop: 40 }}>{d.name}</div>}
        </div>
      </div>
    );
  }

  if (tpl.id === "classic") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "36px 40px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 3, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
              {[d.email, d.phone, d.location].filter(Boolean).join("  ·  ")}
            </div>
            <div style={{ height: 1, background: tpl.accent + "55", marginTop: 12 }} />
          </div>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20, fontSize: 12.5, lineHeight: 1.7, color: "#333" }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999", fontSize: 12 }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111", marginBottom: 16 }}>Re: {d.subject}</div>}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 16, color: "#333" }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "modern") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "32%", background: tpl.accent, color: "#fff", padding: "28px 16px", flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, opacity: 0.82, marginBottom: 7, wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
            {(d.recipientName || d.company) && (
              <div style={{ marginBottom: 20, fontSize: 12, lineHeight: 1.7,
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
                {d.recipientName && <div style={{ fontWeight: 600, color: "#111" }}>{d.recipientName}</div>}
                {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
                {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
                {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
              </div>
            )}
            {d.subject && <div style={{ fontSize: 12.5, fontWeight: 700, color: tpl.accent, marginBottom: 14 }}>Re: {d.subject}</div>}
            {d.opening && <div style={{ fontSize: 13, marginBottom: 14 }}>Dear {d.opening},</div>}
            <Paras text={d.body} style={{ fontSize: 12.5 }} />
            <Paras text={d.closing} style={{ fontSize: 12.5 }} />
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
              {!preview && <div style={{ fontSize: 13, fontWeight: 600, marginTop: 28, color: "#111" }}>{d.name}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "minimal") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ padding: "36px 42px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>{d.jobTitle}</div>}
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
              {[d.email, d.phone, d.location].filter(Boolean).join("   ·   ")}
            </div>
            <div style={{ height: 2, background: tpl.accent, width: 36, marginTop: 14 }} />
          </div>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 20 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 22, fontSize: 12, lineHeight: 1.7, color: "#555" }}>
              {d.recipientName && <div style={{ fontWeight: 600, color: "#222" }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500 }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999" }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 18,
            textTransform: "uppercase", letterSpacing: "1.5px" }}>{d.subject}</div>}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 16, color: "#444" }}>Dear {d.opening},</div>}
          <Paras text={d.body} style={{ color: "#444" }} />
          <Paras text={d.closing} style={{ color: "#444" }} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: "#555" }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "bold") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ background: tpl.accent, padding: "24px 28px 20px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{d.name}</div>
          {d.jobTitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{d.jobTitle}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 9 }}>
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20, fontSize: 12, lineHeight: 1.7,
              paddingBottom: 16, borderBottom: `2px solid ${tpl.accent}33` }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && (
            <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: "#fff", background: tpl.accent,
              padding: "2px 10px", borderRadius: 3, marginBottom: 16 }}>{d.subject}</div>
          )}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 14, display: "block" }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 28 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "elegant") {
    return (
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "29%", background: tpl.accent + "0F", padding: "28px 16px",
            borderRight: `1px solid ${tpl.accent}22`, flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 11, color: tpl.accent, marginBottom: 16, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ height: 1, background: tpl.accent + "55", marginBottom: 14 }} />
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#555", marginBottom: 8, wordBreak: "break-all" }}>{c}</div>
            ))}
            {d.date && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 5 }}>Date</div>
                <div style={{ fontSize: 11, color: "#555" }}>{d.date}</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {(d.recipientName || d.company) && (
              <div style={{ marginBottom: 22, fontSize: 12, lineHeight: 1.7,
                paddingBottom: 16, borderBottom: `1px solid ${tpl.accent}33` }}>
                {d.recipientName && <div style={{ fontWeight: 600, color: "#111" }}>{d.recipientName}</div>}
                {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
                {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
                {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
              </div>
            )}
            {d.subject && <div style={{ fontSize: 12.5, fontWeight: 600, color: tpl.accent,
              fontStyle: "italic", marginBottom: 16 }}>Re: {d.subject}</div>}
            {d.opening && <div style={{ fontSize: 13, marginBottom: 16 }}>Dear {d.opening},</div>}
            <Paras text={d.body} />
            <Paras text={d.closing} />
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
              {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CoverLetterPaper tpl={{ ...tpl, id: "classic" }} data={d} preview={preview} />;
}
