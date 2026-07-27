import React, { useState } from "react";

export default function CustomResumeSectionUI(props) {
  return props.mode === "creator" ? <Creator {...props} /> : <Card {...props} />;
}

function Creator({ eui, theme, tokens, mobile, separated, onCreate }) {
  const [heading, setHeading] = useState("");
  const create = () => {
    const value = heading.trim();
    if (!value) return;
    onCreate(value);
    setHeading("");
  };
  return (
    <div style={{ marginTop: separated ? 18 : 4, paddingTop: separated ? 18 : 0,
      boxShadow: separated ? `inset 0 1px 0 ${tokens.rowDivider}` : "none" }}>
      <label htmlFor="custom-section-heading"
        style={{ display: "block", color: theme.text1, fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
        {eui.customSection}
      </label>
      <p style={{ margin: "0 0 10px", color: theme.text3, fontSize: 12, lineHeight: 1.45 }}>{eui.customSectionHint}</p>
      <div style={{ display: "flex", gap: 8, flexDirection: mobile ? "column" : "row" }}>
        <input id="custom-section-heading" value={heading} onChange={(event) => setHeading(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); create(); } }}
          placeholder={eui.customSectionPlaceholder} maxLength={120}
          style={{ flex: 1, minWidth: 0, background: theme.elevated, border: `1px solid ${theme.border}`,
            borderRadius: 9, padding: "10px 12px", color: theme.text1, fontFamily: "inherit", fontSize: 13 }} />
        <button type="button" disabled={!heading.trim()} onClick={create}
          style={{ border: "none", borderRadius: 9, padding: "10px 14px", background: theme.grad,
            color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 800,
            cursor: heading.trim() ? "pointer" : "not-allowed", opacity: heading.trim() ? 1 : 0.55 }}>
          {eui.createSection}
        </button>
      </div>
    </div>
  );
}

function Card({ section, eui, theme, tokens, rtl, collapsed, onToggle, onChange, onRemove }) {
  const filled = Boolean(String(section.content || "").trim());
  return (
    <section style={{ background: collapsed ? tokens.rowBg : tokens.expandedBg, borderRadius: 12,
      boxShadow: collapsed ? "none" : tokens.expandedShadow, marginTop: 10, overflow: "hidden" }}>
      <header role="button" tabIndex={0} aria-expanded={!collapsed} aria-label={collapsed ? eui.expand : eui.collapse}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggle(); }
        }}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 14px" }}>
        <span aria-hidden>📝</span>
        <h3 style={{ flex: 1, margin: 0, color: theme.text1, fontSize: 15.5, fontWeight: 800,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{section.heading}</h3>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%",
          background: filled ? "#4ade80" : "#fbbf24", opacity: filled ? 0.95 : 0.55 }} />
        <button type="button" onClick={(event) => {
          event.stopPropagation();
          onChange({ visible: section.visible === false });
        }} aria-label={section.visible === false ? eui.show : eui.hide}
          title={section.visible === false ? eui.show : eui.hide}
          style={{ border: "none", background: "transparent", color: theme.text2, cursor: "pointer", fontSize: 16, padding: 6 }}>
          {section.visible === false ? "◯" : "◉"}
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onRemove(); }}
          aria-label={eui.remove} title={eui.remove}
          style={{ border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 18, padding: 6 }}>×</button>
        <span aria-hidden style={{ color: theme.text2, fontSize: 22 }}>{collapsed ? "▸" : "▾"}</span>
      </header>
      {!collapsed && (
        <div style={{ padding: "4px 16px 16px", boxShadow: `inset 0 1px 0 ${tokens.rowDivider}` }}>
          <label htmlFor={`custom-heading-${section.id}`}
            style={{ display: "block", color: theme.text3, fontSize: 11, fontWeight: 700, margin: "10px 0 4px" }}>
            {eui.customSectionTitle}
          </label>
          <input id={`custom-heading-${section.id}`} value={section.heading}
            onChange={(event) => onChange({ heading: event.target.value.slice(0, 120) })} dir={rtl ? "rtl" : "ltr"}
            style={{ width: "100%", boxSizing: "border-box", background: theme.elevated,
              border: `1px solid ${theme.border}`, borderRadius: 8, padding: "9px 11px",
              color: theme.text1, fontFamily: "inherit", fontSize: 13 }} />
          <label htmlFor={`custom-content-${section.id}`}
            style={{ display: "block", color: theme.text3, fontSize: 11, fontWeight: 700, margin: "12px 0 4px" }}>
            {eui.customSectionContent}
          </label>
          <textarea id={`custom-content-${section.id}`} value={section.content}
            onChange={(event) => onChange({ content: event.target.value.slice(0, 12000) })}
            placeholder={eui.customSectionContentPlaceholder} rows={6} dir={rtl ? "rtl" : "ltr"}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 120,
              background: theme.elevated, border: `1px solid ${theme.border}`, borderRadius: 8,
              padding: "10px 11px", color: theme.text1, fontFamily: "inherit", fontSize: 13, lineHeight: 1.55 }} />
        </div>
      )}
    </section>
  );
}
