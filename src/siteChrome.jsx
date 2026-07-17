import React, { useState } from "react";
import { FOOTER_LINK_SECTIONS, localizedFooterHref } from "./footerLinks.js";
import { FOOTER_UI, LANDING_UI } from "./i18n/index.js";
import { PRIMARY_NAV_ITEMS } from "./nav/navItems.js";
import { PRODUCT } from "./product.js";
import { localizeRoute } from "./seo/localizedRoutes.js";
import { COLORS } from "./theme/colors.js";

export const SITE_COLORS = { ...COLORS };

// Single source of truth for header height across every context (site navbar,
// resume/cover-letter builder, ATS checker). Headers set this FIXED height — never
// content-derived — so navigating between contexts never shifts the layout. Mobile
// (<=720px) uses the shorter value. The content offset below a fixed header must
// use the same token (see HEADER_OFFSET).
export const HEADER_HEIGHT = 64;         // desktop, px
export const HEADER_HEIGHT_MOBILE = 60;  // <=720px, px

const AUTHOR_EMAIL = "hello@applycraft.io";
// Single canonical brand logo, imported anywhere the mark is shown (navbar,
// footer, and — as the source image — the OG/favicon generators).
export const BRAND_LOGO_SRC = "/assets/brand/applycraft-logo-navbar.png";

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
  return localizeRoute("/", lang);
}

function defaultCtaHrefForLang(lang = "en") {
  if (lang === "fr" || lang === "ar") return localizeRoute("/free-resume-builder/", lang);
  return "/resume-builder/";
}

function localizeNavHref(href, lang = "en") {
  return localizeRoute(href, lang);
}

function Logo({ compact = false, lang = "en", linked = true }) {
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const style = {
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1,
    flexShrink: 0,
    overflow: "visible",
  };
  if (!linked) {
    return (
      <span aria-label={f.brandHome} style={style}>
        <BrandLogoImage compact={compact} />
      </span>
    );
  }
  return (
    <a href={homeHrefForLang(lang)} aria-label={f.brandHome} style={style}>
      <BrandLogoImage compact={compact} />
    </a>
  );
}

export function shouldUseNativeNavigation(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

// Page destinations always render as anchors. When the SPA can handle a normal
// left-click in place, retain that behavior without taking away the real href
// needed by crawlers, no-JS visitors, and open/copy-link browser actions.
function actionProps(item, onNavigate) {
  if (item.onClick) return { as: "button", props: { type: "button", onClick: item.onClick } };
  const props = { href: item.href };
  if (onNavigate && !item.alwaysLink) {
    props.onClick = (event) => {
      if (shouldUseNativeNavigation(event)) return;
      event.preventDefault();
      onNavigate(item);
    };
  }
  return { as: "a", props };
}

// The ONE navbar. `variant="app"` swaps the marketing chrome (fixed position, CTA)
// for the in-app chrome (sticky position, save-state slot) without forking the
// component: same height token, same logo, same items, same order, same labels.
export function SiteHeader({
  lang = "en",
  navItems,
  activeId,
  onNavigate,
  onLogoClick,
  ctaHref,
  ctaLabel,
  onCtaClick,
  showCta = true,
  renderLanguageSelector,
  keepLanguageOnMobile = false,
  endSlot = null,
  variant = "site",
  headerStyle,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}) {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isApp = variant === "app";
  const l = LANDING_UI[lang] || LANDING_UI.en;
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const items = (navItems || PRIMARY_NAV_ITEMS).map((item) => ({
    ...item,
    href: item.href ? localizeNavHref(item.href, lang) : item.href,
    label: item.label || (item.labelKey ? f[item.labelKey] || l[item.labelKey] : "") || item.id || "",
  }));
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
      .ac-footer-legal-link:hover {
        color: ${SITE_COLORS.text2};
        text-decoration: underline;
      }
      @media (max-width: 720px) {
        .ac-site-header > div {
          height: ${HEADER_HEIGHT_MOBILE}px !important;
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
        .ac-site-header-language.ac-keep-mobile {
          display: block !important;
        }
        .ac-site-header-status {
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
      position: isApp ? "sticky" : "fixed",
      top: 0,
      ...(isApp ? {} : { left: 0, right: 0 }),
      zIndex: isApp ? 50 : 100,
      background: isApp
        ? `linear-gradient(180deg, ${SITE_COLORS.bg}f7 0%, ${SITE_COLORS.bg}e8 100%)`
        : `${SITE_COLORS.bg}cc`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      ...headerStyle,
    }}>
      {/* Height is the token — never derived from content — so switching between
          the marketing site and the app produces zero layout shift. */}
      <div className={isApp ? "ac-app-header" : undefined} style={{
        width: "100%",
        height: HEADER_HEIGHT,
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}>
        <a
          href={homeHrefForLang(lang)}
          onClick={onLogoClick ? (event) => {
            if (shouldUseNativeNavigation(event)) return;
            event.preventDefault();
            onLogoClick();
          } : undefined}
          className="ac-nav-logo"
          aria-label={f.brandHome}
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
        </a>
        <nav aria-label={f.primaryTools} className="ac-site-nav-links" style={{ display: "flex", gap: 4, marginInlineStart: 18 }}>
          {items.map((item) => {
            const action = actionProps(item, onNavigate);
            const Tag = action.as;
            const active = !!activeId && item.id === activeId;
            return (
            <Tag key={item.href || item.id || item.label} {...action.props}
              aria-current={active ? "page" : undefined}
              style={{
              border: "none",
              borderRadius: 8,
              padding: "9px 12px",
              background: active ? `${SITE_COLORS.accent}18` : "transparent",
              color: active ? SITE_COLORS.accent2 : SITE_COLORS.text2,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: active ? 800 : 650,
              fontFamily: "inherit",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              {item.label}
            </Tag>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {endSlot && (
          <div className="ac-site-header-status" style={{ flexShrink: 0, marginInlineEnd: 12 }}>
            {endSlot}
          </div>
        )}
        {renderLanguageSelector && (
          <div className={`ac-site-header-language${keepLanguageOnMobile ? " ac-keep-mobile" : ""}`} style={{ flexShrink: 0, marginInlineEnd: 10 }}>
            {renderLanguageSelector()}
          </div>
        )}
        {!showCta ? null : (
        <a className="ac-nav-cta" href={resolvedCtaHref} onClick={onCtaClick ? (event) => {
          if (shouldUseNativeNavigation(event)) return;
          event.preventDefault();
          onCtaClick();
        } : undefined} style={{
            background: SITE_COLORS.grad,
            color: "#fff",
            border: "none",
            textDecoration: "none",
            borderRadius: 3,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "inherit",
          }}>
          {cta}
        </a>
        )}
        <button type="button" aria-label={menuOpen ? f.closeMenu : f.openMenu} aria-expanded={menuOpen}
            onClick={toggleMobileMenu}
            className="ac-site-mobile-menu-button"
            style={{ marginInlineStart: 8, width: 40, height: 40, borderRadius: 10, border: `1px solid ${SITE_COLORS.border}`,
              background: SITE_COLORS.surface, color: SITE_COLORS.text1, cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          display: "none", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
      </div>
      {menuOpen && (
        <nav aria-label={f.menu} className="ac-site-mobile-menu" style={{ boxShadow: `inset 0 1px 0 ${SITE_COLORS.border}`, background: `${SITE_COLORS.bg}f5`,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          padding: "8px 12px 14px", display: "none", flexDirection: "column", gap: 2 }}>
          {items.map((item) => {
            const action = actionProps(item, onNavigate);
            const Tag = action.as;
            return (
              <Tag key={item.href || item.id || item.label} {...action.props}
                aria-current={activeId && item.id === activeId ? "page" : undefined}
                onClick={item.onClick ? () => { item.onClick(); closeMobileMenu(); } : action.props.onClick ? (event) => {
                  action.props.onClick(event);
                  if (!shouldUseNativeNavigation(event)) closeMobileMenu();
                } : undefined}
                style={{ textAlign: "start", border: "none", background: "transparent",
                  color: SITE_COLORS.text1, padding: "12px 10px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", borderRadius: 8, textDecoration: "none" }}>
                {item.label}
              </Tag>
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
  const homeHref = homeHrefForLang(lang);
  const col = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: SITE_COLORS.text3, marginBottom: 16 };
  const lk = { display: "block", fontSize: 13.5, color: SITE_COLORS.text2, textDecoration: "none", padding: "4px 0" };
  const badge = { fontSize: 12, color: SITE_COLORS.text3 };
  const legalLink = { color: "inherit", textDecoration: "none" };

  return (
    <footer className={className} data-footer="unified" style={{ padding: "56px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 280 }}>
            <a href={homeHref} className="footer-logo" aria-label={f.brandHome} style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 1,
              flexShrink: 0,
              overflow: "visible",
            }}>
              <BrandLogoImage />
            </a>
            {f.tagline ? (
              <p style={{ fontSize: 13.5, fontWeight: 700, color: SITE_COLORS.text2, lineHeight: 1.6, margin: "12px 0 8px" }}>
                {footerText(f.tagline)}
              </p>
            ) : null}
            <p style={{ fontSize: 13, color: SITE_COLORS.text3, lineHeight: 1.75, margin: "0 0 16px" }}>
              {footerText(f.brand)}
            </p>
            <a href={`mailto:${AUTHOR_EMAIL}`} style={{ fontSize: 13, color: SITE_COLORS.text2, textDecoration: "none" }}>{AUTHOR_EMAIL}</a>
          </div>
          <nav aria-label={f.footerRegion} style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
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
          <div style={{ fontSize: 12.5, color: SITE_COLORS.text3 }}>
            {footerText((f.copyrightPrefix || "© {year} ApplyCraft by Biroue Digital Ltd").replace("{year}", new Date().getFullYear()))}
            {" · "}
            <a className="ac-footer-legal-link" href={homeHref} style={legalLink}>applycraft.io</a>
          </div>
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

export function AppShell({ children, lang = "en", activeId }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: SITE_COLORS.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif",
    }}>
      <SiteHeader lang={lang} activeId={activeId} />
      {children}
      <SiteFooter lang={lang} className="ac-site-footer" />
    </div>
  );
}
