import React from "react";
import { FOOTER_UI } from "./i18n/index.js";
import { PRODUCT } from "./product.js";

export const SITE_COLORS = {
  bg: "#06080F",
  surface: "#0D1424",
  border: "#20324E",
  text1: "#EEF2FF",
  text2: "#B6C2D6",
  text3: "#7186A6",
  grad: "linear-gradient(135deg,#6366F1 0%,#3B82F6 100%)",
};

const AUTHOR_EMAIL = "hello@applycraft.io";
const AUTHOR_GITHUB = "https://github.com/biroue10";

function Logo({ size = 21 }) {
  return (
    <a href="/" style={{
      fontSize: size,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      textDecoration: "none",
      background: SITE_COLORS.grad,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "inline-block",
      lineHeight: 1.1,
    }}>
      ApplyCraft
    </a>
  );
}

const NAV_LINKS = [
  { href: "/resume/templates", label: "Resume Builder" },
  { href: "/cover-letter/templates", label: "Cover Letter" },
  { href: "/ats-checker/", label: "ATS Checker" },
];

export function SiteHeader({ ctaHref = "/resume/templates", ctaLabel = "Create my resume" }) {
  return (
    <header className="ac-site-header" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: `linear-gradient(180deg, ${SITE_COLORS.bg}f7 0%, ${SITE_COLORS.bg}e8 100%)`,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: `1px solid ${SITE_COLORS.border}`,
    }}>
      <div style={{
        maxWidth: 1200,
        minHeight: 72,
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <Logo />
        <nav aria-label="Primary tools" className="ac-site-nav-links" style={{ display: "flex", gap: 4, marginInlineStart: 18 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} style={{
              borderRadius: 8,
              padding: "9px 12px",
              color: SITE_COLORS.text2,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 650,
            }}>
              {link.label}
            </a>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <a href={ctaHref} style={{
          background: SITE_COLORS.grad,
          color: "#fff",
          textDecoration: "none",
          borderRadius: 3,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
          boxShadow: "0 4px 24px rgba(99,102,241,0.28)",
        }}>
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}

function footerText(value) {
  return String(value || "")
    .replace("{docs}", PRODUCT.localizedDocumentLanguageCount)
    .replace("{ui}", PRODUCT.interfaceLanguageCount)
    .replace("{tpl}", PRODUCT.resumeTemplateCount);
}

export function SiteFooter({ lang = "en", className = "" }) {
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const col = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: SITE_COLORS.text3, marginBottom: 16 };
  const lk = { display: "block", fontSize: 13.5, color: SITE_COLORS.text2, textDecoration: "none", padding: "4px 0" };
  const badge = { fontSize: 12, color: SITE_COLORS.text3 };

  return (
    <footer className={className} style={{ padding: "56px 24px 32px", borderTop: `1px solid ${SITE_COLORS.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 280 }}>
            <Logo size={20} />
            <p style={{ fontSize: 13, color: SITE_COLORS.text3, lineHeight: 1.75, margin: "12px 0 16px" }}>
              {footerText(f.brand)}
            </p>
            <a href={`mailto:${AUTHOR_EMAIL}`} style={{ fontSize: 13, color: SITE_COLORS.text2, textDecoration: "none" }}>{AUTHOR_EMAIL}</a>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <div style={col}>{f.product}</div>
              <a href="/resume/templates" style={lk}>{f.resumeBuilder}</a>
              <a href="/cover-letter/templates" style={lk}>{f.coverLetter}</a>
              <a href="/ats-checker/" style={lk}>{f.atsChecker}</a>
              <a href="/pricing/" style={lk}>{f.pricing}</a>
              <a href="/changelog/" style={lk}>{f.changelog}</a>
              <a href="/roadmap/" style={lk}>{f.roadmap}</a>
              <a href="/status/" style={lk}>{f.status}</a>
            </div>
            <div>
              <div style={col}>{f.company}</div>
              <a href="/about/" style={lk}>{f.about}</a>
              <a href="/contact/" style={lk}>{f.contact}</a>
              <a href={AUTHOR_GITHUB} target="_blank" rel="noopener noreferrer" style={lk}>GitHub</a>
            </div>
            <div>
              <div style={col}>{f.resources}</div>
              <a href="/blog/" style={lk}>{f.blog}</a>
              <a href="/help/" style={lk}>{f.help}</a>
              <a href="/resume-builder/" style={lk}>{f.resumeGuide}</a>
              <a href="/ats-resume-builder/" style={lk}>{f.atsGuide}</a>
              <a href="/cover-letter-builder/" style={lk}>{f.coverGuide}</a>
              <a href="/free-resume-builder/" style={lk}>{f.freeBuilder}</a>
              <a href="/student-resume-builder/" style={lk}>{f.studentBuilder}</a>
              <a href="/canadian-resume-builder/" style={lk}>{f.canadianBuilder}</a>
            </div>
            <div>
              <div style={col}>{f.legal}</div>
              <a href="/terms/" style={lk}>{f.terms}</a>
              <a href="/privacy/" style={lk}>{f.privacy}</a>
              <a href="/cookies/" style={lk}>{f.cookies}</a>
              <a href="/refund-policy/" style={lk}>{f.refundPolicy}</a>
              <a href="/gdpr/" style={lk}>{f.gdpr}</a>
              <a href="/ai-disclosure/" style={lk}>{f.aiDisclosure}</a>
              <a href="/accessibility/" style={lk}>{f.accessibility}</a>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: `1px solid ${SITE_COLORS.border}`,
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <div style={{ fontSize: 12.5, color: SITE_COLORS.text3 }}>© {new Date().getFullYear()} ApplyCraft by Biroue Digital Ltd · applycraft.io</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={badge}>{f.badge1}</span>
            <span style={badge}>{f.badge2}</span>
            <span style={badge}>{f.badge3}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children, lang = "en" }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: SITE_COLORS.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <SiteHeader />
      {children}
      <SiteFooter lang={lang} className="ac-site-footer" />
    </div>
  );
}
