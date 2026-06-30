import React, { useEffect, useState } from "react";
import { decodeShare } from "./share.js";

// Public viewer for a shared resume / cover letter. Reads the encoded document
// from the URL fragment (SSR-safe: only on the client), renders it centered on
// a clean page with the ApplyCraft logo header + footer. Nothing is fetched.

const PAGE_BG = "#0D1424";
const PAPER = "#ffffff";
const INK = "#1a1a1a";
const MUTE = "#5b6678";
const ACCENT = "#6366F1";

const cleanLine = (s) => String(s || "").replace(/\*\*|__|\*|~~/g, "");

function Logo() {
  return (
    <a href="/" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.6px", textDecoration: "none",
      background: "linear-gradient(135deg,#818CF8,#3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      ApplyCraft
    </a>
  );
}

function ResumeView({ d }) {
  return (
    <article style={{ background: PAPER, color: INK, width: "100%", maxWidth: 800, margin: "0 auto",
      borderRadius: 10, boxShadow: "0 24px 70px rgba(0,0,0,0.45)", padding: "44px 48px", boxSizing: "border-box" }}>
      <header style={{ borderBottom: `2px solid ${ACCENT}`, paddingBottom: 14, marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px" }}>{d.name || "Resume"}</h1>
        {d.title && <div style={{ fontSize: 15, color: ACCENT, fontWeight: 700, marginTop: 4 }}>{d.title}</div>}
        {Array.isArray(d.contact) && d.contact.length > 0 && (
          <div style={{ fontSize: 12.5, color: MUTE, marginTop: 8 }}>{d.contact.filter(Boolean).join("   •   ")}</div>
        )}
      </header>
      {d.summary && <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#333", margin: "0 0 18px" }}>{cleanLine(d.summary)}</p>}
      {(d.sections || []).map((s, i) => (
        <section key={i} style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: ACCENT, margin: "0 0 8px" }}>{s.heading}</h2>
          {(s.items || []).map((it, j) => {
            const line = cleanLine(it);
            const bullet = /^\s*[•\-*]\s/.test(line);
            return (
              <div key={j} style={{ fontSize: 13, lineHeight: 1.6, color: "#333", marginBottom: 3,
                paddingLeft: bullet ? 14 : 0, position: "relative" }}>
                {bullet ? line.replace(/^\s*[•\-*]\s/, "• ") : line}
              </div>
            );
          })}
        </section>
      ))}
    </article>
  );
}

function CoverView({ d }) {
  const paras = String(d.body || "").split(/\n{2,}/).filter((p) => p.trim());
  return (
    <article style={{ background: PAPER, color: INK, width: "100%", maxWidth: 760, margin: "0 auto",
      borderRadius: 10, boxShadow: "0 24px 70px rgba(0,0,0,0.45)", padding: "48px 52px", boxSizing: "border-box", lineHeight: 1.7 }}>
      <header style={{ borderBottom: `2px solid ${ACCENT}`, paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{d.name || ""}</div>
        {d.jobTitle && <div style={{ fontSize: 13.5, color: ACCENT, fontWeight: 700 }}>{d.jobTitle}</div>}
        <div style={{ fontSize: 12, color: MUTE, marginTop: 6 }}>{[d.email, d.phone, d.location].filter(Boolean).join("   •   ")}</div>
      </header>
      {d.date && <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 10 }}>{d.date}</div>}
      {(d.recipientName || d.company) && (
        <div style={{ fontSize: 13, marginBottom: 14 }}>
          {d.recipientName && <div style={{ fontWeight: 700 }}>{d.recipientName}</div>}
          {d.recipientTitle && <div>{d.recipientTitle}</div>}
          {d.company && <div>{d.company}</div>}
          {d.companyAddress && <div style={{ color: MUTE }}>{d.companyAddress}</div>}
        </div>
      )}
      {d.subject && <div style={{ fontWeight: 700, marginBottom: 12 }}>Re: {d.subject}</div>}
      {d.opening && <p style={{ margin: "0 0 12px", fontSize: 13.5 }}>Dear {d.opening},</p>}
      {paras.map((p, i) => <p key={i} style={{ margin: "0 0 12px", fontSize: 13.5 }}>{cleanLine(p)}</p>)}
      {d.closing && <p style={{ margin: "0 0 16px", fontSize: 13.5 }}>{cleanLine(d.closing)}</p>}
      <p style={{ margin: 0, fontSize: 13.5 }}>{d.signoff || "Sincerely"},</p>
      <p style={{ margin: "2px 0 0", fontSize: 13.5, fontWeight: 700 }}>{d.name || ""}</p>
    </article>
  );
}

export default function SharedResume() {
  const [doc, setDoc] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const frag = window.location.hash.replace(/^#/, "");
    setDoc(frag ? decodeShare(frag) : null);
    setReady(true);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <header style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 880, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <Logo />
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
          background: "linear-gradient(135deg,#6366F1,#3B82F6)", borderRadius: 999, padding: "8px 16px" }}>
          Build your own — free
        </a>
      </header>

      <main style={{ flex: 1, padding: "12px 16px 48px" }}>
        {!ready ? (
          <div style={{ color: "#7186A6", textAlign: "center", padding: 60 }}>Loading…</div>
        ) : !doc ? (
          <div style={{ color: "#B6C2D6", textAlign: "center", padding: 60, maxWidth: 460, margin: "0 auto" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#EEF2FF", marginBottom: 8 }}>This shared link is empty or invalid.</div>
            <div style={{ fontSize: 14 }}>Ask the sender for a fresh link, or build your own resume for free.</div>
          </div>
        ) : doc.k === "cover" ? <CoverView d={doc.d || {}} /> : <ResumeView d={doc.d || {}} />}
      </main>

      <footer style={{ padding: "24px", borderTop: "1px solid #20324E", textAlign: "center" }}>
        <Logo />
        <div style={{ fontSize: 12.5, color: "#7186A6", marginTop: 8 }}>
          Free resume &amp; cover letter builder · <a href="/" style={{ color: "#818CF8", textDecoration: "none" }}>applycraft.io</a>
        </div>
      </footer>
    </div>
  );
}
