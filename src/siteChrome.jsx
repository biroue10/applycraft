import React, { useState } from "react";
import { FOOTER_LINK_SECTIONS, localizedFooterHref } from "./footerLinks.js";
import { FOOTER_UI, LANDING_UI } from "./i18n/index.js";
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
const BRAND_LOGO_SRC = "/assets/brand/applycraft-logo-navbar.png";

function BrandLogoImage({ compact = false, style = {} }) {
  return (
    <img
      className="ac-brand-logo-img"
      src={BRAND_LOGO_SRC}
      alt="ApplyCraft"
      width="1180"
      height="304"
      style={{
        display: "block",
        height: compact ? 28 : 30,
        width: "auto",
        maxWidth: compact ? 145 : 170,
        objectFit: "contain",
        background: "transparent",
        border: 0,
        boxShadow: "none",
        ...style,
      }}
    />
  );
}

function homeHrefForLang(lang = "en") {
  if (lang === "fr") return "/fr/";
  if (lang === "ar") return "/ar/";
  return "/";
}

function defaultCtaHrefForLang(lang = "en") {
  if (lang === "fr") return "/fr/creer-cv-gratuit/";
  if (lang === "ar") return "/ar/free-resume-builder/";
  return "/resume/templates/";
}

function localizeNavHref(href, lang = "en") {
  if (lang === "fr") {
    if (href === "/") return "/fr/";
    if (href === "/ats-checker/") return "/ats-checker-fr/";
  }
  if (lang === "ar") {
    if (href === "/") return "/ar/";
    if (href === "/ats-checker/") return "/ats-checker-ar/";
  }
  return href;
}

function Logo({ compact = false, lang = "en" }) {
  return (
    <a href={homeHrefForLang(lang)} aria-label="ApplyCraft home" style={{
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      lineHeight: 1,
      flexShrink: 0,
      overflow: "visible",
    }}>
      <BrandLogoImage compact={compact} />
    </a>
  );
}

const DEFAULT_NAV_LINKS = [
  { href: "/", footerKey: "resumeBuilder", fallback: "Resume Builder" },
  { href: "/resume/templates/", footerKey: "resumeTemplates", fallback: "Resume Templates" },
  { href: "/cover-letter/templates/", footerKey: "coverLetter", fallback: "Cover Letter" },
  { href: "/ats-checker/", footerKey: "atsChecker", fallback: "ATS Checker" },
];

function actionProps(item) {
  return item.onClick
    ? { as: "button", props: { type: "button", onClick: item.onClick } }
    : { as: "a", props: { href: item.href } };
}

export function SiteHeader({
  lang = "en",
  navItems,
  onLogoClick,
  ctaHref,
  ctaLabel,
  onCtaClick,
  renderLanguageSelector,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}) {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const l = LANDING_UI[lang] || LANDING_UI.en;
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const items = (navItems || DEFAULT_NAV_LINKS).map((item) => ({
    ...item,
    href: item.href ? localizeNavHref(item.href, lang) : item.href,
    label: item.label || (item.footerKey ? f[item.footerKey] : "") || (item.labelKey ? l[item.labelKey] : "") || item.fallback || item.id || "",
  }));
  const LogoTag = onLogoClick ? "button" : "a";
  const cta = ctaLabel || l.createResume || "Create my resume";
  const resolvedCtaHref = ctaHref || defaultCtaHrefForLang(lang);
  const controlledMobileMenu = typeof onMobileMenuToggle === "function";
  const menuOpen = controlledMobileMenu ? mobileMenuOpen : internalMenuOpen;
  const toggleMobileMenu = controlledMobileMenu
    ? onMobileMenuToggle
    : () => setInternalMenuOpen((open) => !open);
  const closeMobileMenu = () => {
    if (!controlledMobileMenu) setInternalMenuOpen(false);
  };
  return (
    <>
    <style suppressHydrationWarning>{`
      .ac-site-header a:hover,
      .ac-site-header button:hover {
        color: ${SITE_COLORS.text1};
      }
      .ac-site-header a:focus-visible,
      .ac-site-header button:focus-visible,
      .ac-site-footer a:focus-visible {
        outline: 2px solid #818CF8;
        outline-offset: 3px;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
      }
      @media (max-width: 720px) {
        .ac-site-header > div {
          height: 60px !important;
          padding: 0 16px !important;
        }
        .ac-nav-logo {
          max-width: 145px !important;
        }
        .ac-brand-logo-img { height: 28px !important; max-width: 145px !important; }
        .ac-site-nav-links {
          display: none !important;
        }
        .ac-nav-cta {
          padding: 8px 14px !important;
          font-size: 13px !important;
        }
        .ac-site-mobile-menu-button {
          display: inline-flex !important;
        }
        .ac-site-header-language {
          display: none !important;
        }
        .ac-site-mobile-menu {
          display: flex !important;
        }
      }
      @media (max-width: 480px) {
        .ac-nav-logo {
          max-width: 125px !important;
        }
        .ac-brand-logo-img { height: 24px !important; max-width: 125px !important; }
        .ac-nav-cta {
          padding: 7px 10px !important;
          font-size: 12.5px !important;
        }
        .ac-site-mobile-menu-button {
          width: 36px !important;
          height: 36px !important;
          margin-inline-start: 6px !important;
        }
      }
    `}</style>
    <header className="ac-site-header" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: `${SITE_COLORS.bg}cc`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}>
      <div style={{
        width: "100%",
        height: 76,
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <LogoTag
          {...(onLogoClick ? { type: "button", onClick: onLogoClick } : { href: homeHrefForLang(lang) })}
          className="ac-nav-logo"
          aria-label="ApplyCraft home"
          style={{
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            fontFamily: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "flex-start",
            lineHeight: 1,
            background: "transparent",
            overflow: "visible",
          }}>
          <BrandLogoImage style={{ height: 30, maxWidth: 170 }} />
        </LogoTag>
        <nav aria-label="Primary tools" className="ac-site-nav-links" style={{ display: "flex", gap: 4, marginInlineStart: 18 }}>
          {items.map((item) => {
            const action = actionProps(item);
            const Tag = action.as;
            return (
            <Tag key={item.href || item.id || item.label} {...action.props} style={{
              border: "none",
              borderRadius: 8,
              padding: "9px 12px",
              background: "transparent",
              color: SITE_COLORS.text2,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 650,
              fontFamily: "inherit",
              cursor: "pointer",
            }}>
              {item.label}
            </Tag>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {renderLanguageSelector && (
          <div className="ac-site-header-language" style={{ flexShrink: 0, marginInlineEnd: 10 }}>
            {renderLanguageSelector()}
          </div>
        )}
        {onCtaClick ? (
          <button className="ac-nav-cta" type="button" onClick={onCtaClick} style={{
            background: SITE_COLORS.grad,
            color: "#fff",
            border: "none",
            borderRadius: 3,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "inherit",
          }}>
            {cta}
          </button>
        ) : (
        <a className="ac-nav-cta" href={resolvedCtaHref} style={{
          background: SITE_COLORS.grad,
          color: "#fff",
          textDecoration: "none",
          borderRadius: 3,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {cta}
        </a>
        )}
        <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}
            onClick={toggleMobileMenu}
            className="ac-site-mobile-menu-button"
            style={{ marginInlineStart: 8, width: 40, height: 40, borderRadius: 10, border: `1px solid ${SITE_COLORS.border}`,
              background: SITE_COLORS.surface, color: SITE_COLORS.text1, cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          display: "none", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
      </div>
      {menuOpen && (
        <nav aria-label="Menu" className="ac-site-mobile-menu" style={{ boxShadow: `inset 0 1px 0 ${SITE_COLORS.border}`, background: `${SITE_COLORS.bg}f5`,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          padding: "8px 12px 14px", display: "none", flexDirection: "column", gap: 2 }}>
          {items.map((item) => {
            return (
              <button key={item.href || item.id || item.label} type="button"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.href) window.location.href = item.href;
                  closeMobileMenu();
                }}
                style={{ textAlign: "start", border: "none", background: "transparent",
                  color: SITE_COLORS.text1, padding: "12px 10px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", borderRadius: 8 }}>
                {item.label}
              </button>
            );
          })}
          {renderLanguageSelector && (
            <div style={{ padding: "8px 10px 10px" }}>
              {renderLanguageSelector()}
            </div>
          )}
        </nav>
      )}
    </header>
    </>
  );
}

function footerText(value) {
  return String(value || "")
    .replace("{docs}", PRODUCT.localizedDocumentLanguageCount)
    .replace("{ui}", PRODUCT.interfaceLanguageCount)
    .replace("{tpl}", PRODUCT.resumeTemplateCount);
}

export function SiteFooter({ lang = "en", className = "ac-site-footer" }) {
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const col = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: SITE_COLORS.text3, marginBottom: 16 };
  const lk = { display: "block", fontSize: 13.5, color: SITE_COLORS.text2, textDecoration: "none", padding: "4px 0" };
  const badge = { fontSize: 12, color: SITE_COLORS.text3 };

  return (
    <footer className={className} style={{ padding: "56px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 280 }}>
            <Logo lang={lang} />
            <p style={{ fontSize: 13, color: SITE_COLORS.text3, lineHeight: 1.75, margin: "12px 0 16px" }}>
              {footerText(f.brand)}
            </p>
            <a href={`mailto:${AUTHOR_EMAIL}`} style={{ fontSize: 13, color: SITE_COLORS.text2, textDecoration: "none" }}>{AUTHOR_EMAIL}</a>
          </div>
          <nav aria-label="Footer" style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {FOOTER_LINK_SECTIONS.map((section) => (
              <div key={section.key}>
                <div style={col}>{f[section.key]}</div>
                {section.links.map((link) => (
                  <a
                    key={`${link.href}-${link.labelKey}`}
                    href={localizedFooterHref(link, lang)}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    style={lk}
                  >
                    {f[link.labelKey] || link.labelKey}
                  </a>
                ))}
              </div>
            ))}
          </nav>
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
      <SiteHeader lang={lang} />
      {children}
      <SiteFooter lang={lang} className="ac-site-footer" />
    </div>
  );
}
