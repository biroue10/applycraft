import React, { useEffect, useMemo, useState } from "react";
import { decodeShare, normalizeSharedDocument } from "./share.js";
import { isRtlLang } from "./i18n/languages.js";
import { ResumePaper, CoverLetterPaper } from "./documents/DocumentPapers.jsx";
import { getResumeTemplateById, getCoverTemplateById } from "./documents/templateRegistry.js";

// Public viewer for a shared resume / cover letter. The encoded payload lives
// entirely in the URL fragment, so no resume content is uploaded to ApplyCraft.

const PAGE_BG = "#06080F";
const SURFACE = "#0D1424";
const BORDER  = "#20324E";
const TEXT1   = "#EEF2FF";
const TEXT2   = "#B6C2D6";
const TEXT3   = "#7186A6";
const GRAD    = "linear-gradient(135deg,#6366F1 0%,#3B82F6 100%)";
const EMAIL = "hello@applycraft.io";

function Logo({ size = 24 }) {
  return (
    <a href="/" style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.8px", textDecoration: "none",
      background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
      ApplyCraft
    </a>
  );
}

const NAV_LINKS = [
  { href: "/resume/templates", label: "Resume Builder" },
  { href: "/cover-letter/templates", label: "Cover Letter" },
  { href: "/ats-checker/", label: "ATS Checker" },
];

function SiteNav() {
  return (
    <nav className="ac-shared-site-nav" style={{ position: "sticky", top: 0, zIndex: 100, background: PAGE_BG + "cc",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <Logo size={24} />
        <nav aria-label="Primary tools" style={{ display: "flex", gap: 4 }} className="ac-shared-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ borderRadius: 8, padding: "9px 12px",
              color: TEXT2, textDecoration: "none", fontSize: 13.5, fontWeight: 650 }}>{l.label}</a>
          ))}
        </nav>
        <a href="/resume/templates" style={{ background: GRAD, color: "#fff", textDecoration: "none",
          borderRadius: 3, padding: "10px 20px", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          Create my resume
        </a>
      </div>
    </nav>
  );
}

function SiteFooter() {
  const col = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: TEXT3, marginBottom: 16 };
  const lk = { display: "block", fontSize: 13.5, color: TEXT2, textDecoration: "none", padding: "4px 0" };
  return (
    <div className="ac-shared-site-footer" style={{ padding: "56px 24px 32px", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 280 }}>
            <Logo size={20} />
            <p style={{ fontSize: 13, color: TEXT3, lineHeight: 1.75, margin: "12px 0 16px" }}>
              Free resume and cover letter builder for the global job market. No sign-up required.
            </p>
            <a href={`mailto:${EMAIL}`} style={{ fontSize: 13, color: TEXT2, textDecoration: "none" }}>{EMAIL}</a>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <div style={col}>Product</div>
              <a href="/resume/templates" style={lk}>Resume Builder</a>
              <a href="/cover-letter/templates" style={lk}>Cover Letter</a>
              <a href="/ats-checker/" style={lk}>ATS Checker</a>
              <a href="/changelog/" style={lk}>Changelog</a>
              <a href="/roadmap/" style={lk}>Roadmap</a>
              <a href="/status/" style={lk}>Status</a>
            </div>
            <div>
              <div style={col}>Company</div>
              <a href="/about/" style={lk}>About &amp; Founder</a>
              <a href="/contact/" style={lk}>Contact</a>
              <a href="https://github.com/biroue10" target="_blank" rel="noopener noreferrer" style={lk}>GitHub</a>
            </div>
            <div>
              <div style={col}>Resources</div>
              <a href="/blog/" style={lk}>Blog</a>
              <a href="/help/" style={lk}>Help Center</a>
              <a href="/resume-builder/" style={lk}>Resume Guide</a>
              <a href="/ats-resume-builder/" style={lk}>ATS Guide</a>
              <a href="/cover-letter-builder/" style={lk}>Cover Letter Guide</a>
              <a href="/free-resume-builder/" style={lk}>Free Resume Builder</a>
              <a href="/student-resume-builder/" style={lk}>Student Resume Builder</a>
              <a href="/canadian-resume-builder/" style={lk}>Canadian Resume Builder</a>
            </div>
            <div>
              <div style={col}>Legal</div>
              <a href="/privacy/" style={lk}>Privacy Policy</a>
              <a href="/privacy/#gdpr" style={lk}>GDPR</a>
              <a href="/privacy/#cookies" style={lk}>Cookies</a>
              <a href="/accessibility/" style={lk}>Accessibility</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: TEXT3 }}>© {new Date().getFullYear()} ApplyCraft by Biroue Digital Ltd · applycraft.io</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: TEXT3 }}>No account required</span>
            <span style={{ fontSize: 12, color: TEXT3 }}>Optional AI helpers</span>
            <span style={{ fontSize: 12, color: TEXT3 }}>Browser-first editing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SharedStyles({ pageSize }) {
  const size = pageSize === "letter" ? "Letter" : "A4";
  return (
    <style>{`
      .ac-shared-document-wrap {
        width: min(100%, 860px);
        margin: 0 auto;
        overflow-wrap: anywhere;
      }
      .ac-shared-document-wrap bdi,
      .ac-shared-document-wrap a {
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      @media (max-width: 720px) {
        .ac-shared-nav-links { display: none !important; }
        .ac-shared-main { padding: 20px 10px 36px !important; }
        .ac-shared-document-wrap { width: 100%; }
      }
      @media print {
        @page { size: ${size}; margin: 14mm; }
        html, body, #root {
          background: #fff !important;
        }
        .ac-shared-site-nav,
        .ac-shared-site-footer {
          display: none !important;
        }
        .ac-shared-main {
          padding: 0 !important;
          background: #fff !important;
        }
        .ac-shared-document-wrap {
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
        }
        .ac-shared-document-wrap > article > div {
          box-shadow: none !important;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `}</style>
  );
}

export default function SharedResume() {
  const [doc, setDoc] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const frag = window.location.hash.replace(/^#/, "");
    setDoc(frag ? normalizeSharedDocument(decodeShare(frag)) : null);
    setReady(true);
  }, []);

  const resolved = useMemo(() => {
    if (!doc) return null;
    const rtl = isRtlLang(doc.l);
    const template = doc.k === "cover" ? getCoverTemplateById(doc.t) : getResumeTemplateById(doc.t);
    return { rtl, template };
  }, [doc]);

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <SiteNav />
      <SharedStyles pageSize={doc?.p || "a4"} />

      <main className="ac-shared-main" style={{ flex: 1, padding: "32px 16px 56px" }}>
        {!ready ? (
          <div style={{ color: TEXT3, textAlign: "center", padding: 60 }}>Loading...</div>
        ) : !doc || !resolved ? (
          <div style={{ color: TEXT2, textAlign: "center", padding: 60, maxWidth: 460, margin: "0 auto" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT1, marginBottom: 8 }}>This shared link is empty or invalid.</div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>Ask the sender for a fresh link, or build your own resume for free.</div>
            <a href="/resume/templates" style={{ background: GRAD, color: "#fff", textDecoration: "none",
              borderRadius: 3, padding: "11px 22px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
              Build my resume - free
            </a>
          </div>
        ) : (
          <div className="ac-shared-document-wrap">
            <article lang={doc.l} dir={resolved.rtl ? "rtl" : "ltr"} data-share-kind={doc.k} data-template-id={resolved.template.id}>
              {doc.k === "cover" ? (
                <CoverLetterPaper tpl={resolved.template} data={doc.d || {}} rtl={resolved.rtl} lang={doc.l} preview={false} />
              ) : (
                <ResumePaper tpl={resolved.template} result={doc.d || {}} rtl={resolved.rtl} lang={doc.l} placeholder={false} preview={false} />
              )}
            </article>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
