import React, { useEffect, useRef, useState } from "react";
import { FOOTER_LINK_SECTIONS, localizedFooterHref } from "./footerLinks.js";
import { FOOTER_UI, LANDING_UI } from "./i18n/index.js";
import { INTERFACE_LANGUAGES, interfaceLanguageByCode } from "./i18n/languages.js";
import { LANGUAGE_SWITCHER_COPY, NAV_CTA } from "./nav/navCopy.js";
import { PRIMARY_NAV_ITEMS } from "./nav/navItems.js";
import { PRODUCT } from "./product.js";
import { localizedLanguageHref, localizeRoute } from "./seo/localizedRoutes.js";
import { COLORS } from "./theme/colors.js";

export const SITE_COLORS = COLORS;

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
      width="320"
      height="82"
      decoding="async"
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

export function LanguageSwitcher({ lang = "en", currentPath = "/", onLanguageSelect, id = "ac-language-menu" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const current = interfaceLanguageByCode(lang);
  const copy = LANGUAGE_SWITCHER_COPY[lang] || LANGUAGE_SWITCHER_COPY.en;

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="ac-language-switcher" onKeyDown={(event) => {
      if (event.key !== "Escape" || !open) return;
      setOpen(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    }}>
      <button ref={triggerRef} className="ac-language-trigger" type="button"
        aria-label={`${copy.choose}: ${current.native}`} aria-haspopup="menu"
        aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <img src={current.flagSrc} alt="" aria-hidden="true" width="20" height="14" />
        <strong>{current.displayCode}</strong>
        <span className="ac-language-trigger-label">{current.native}</span>
        <span className="ac-language-chevron" aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>
      <div id={id} className="ac-language-menu" role="menu" aria-label={copy.menu} hidden={!open}>
        {INTERFACE_LANGUAGES.map((code) => {
          const language = interfaceLanguageByCode(code);
          return (
            <a key={code} href={localizedLanguageHref(currentPath, code)} hrefLang={code} lang={code}
              role="menuitem" aria-current={code === current.code ? "page" : undefined}
              onClick={() => { onLanguageSelect?.(language); setOpen(false); }}>
              <img src={language.flagSrc} alt="" aria-hidden="true" width="20" height="14" />
              <span>{language.native}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// The one global navbar. Route-specific chrome belongs below this component.
export function SiteHeader({
  lang = "en",
  navItems,
  activeId,
  onNavigate,
  onLogoClick,
  ctaHref,
  onCtaClick,
  currentPath,
  onLanguageSelect,
  keepLanguageOnMobile = true,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}) {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const l = LANDING_UI[lang] || LANDING_UI.en;
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const items = (navItems || PRIMARY_NAV_ITEMS).map((item) => ({
    ...item,
    href: item.href ? localizeNavHref(item.href, lang) : item.href,
    label: item.label || (item.labelKey ? f[item.labelKey] || l[item.labelKey] : "") || item.id || "",
  }));
  const cta = NAV_CTA[lang] || NAV_CTA.en;
  const resolvedCtaHref = ctaHref || defaultCtaHrefForLang(lang);
  const resolvedCurrentPath = currentPath || (typeof window !== "undefined" ? window.location.pathname : homeHrefForLang(lang));
  const controlledMobileMenu = typeof onMobileMenuToggle === "function";
  const menuOpen = controlledMobileMenu ? mobileMenuOpen : internalMenuOpen;
  const toggleMobileMenu = controlledMobileMenu
    ? onMobileMenuToggle
    : () => setInternalMenuOpen((open) => !open);
  const moreLabel = lang === "fr" ? "Plus" : lang === "ar" ? "المزيد" : "More";
  const priorityItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (moreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
      if (menuOpen && headerRef.current && !headerRef.current.contains(event.target)) {
        toggleMobileMenu();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [menuOpen, moreMenuOpen, toggleMobileMenu]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => mobileMenuRef.current?.querySelector("a, button")?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMobileMenu = () => {
    if (!menuOpen) return;
    toggleMobileMenu();
  };
  return (
    <>
    <header ref={headerRef} data-site-header="applycraft" className="ac-global-header"
      dir={interfaceLanguageByCode(lang).dir} onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      if (moreMenuOpen) {
        setMoreMenuOpen(false);
      } else if (menuOpen) {
        closeMobileMenu();
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    }}>
      {/* Height is the token — never derived from content — so switching between
          the marketing site and the app produces zero layout shift. */}
      <div className="ac-global-header__inner">
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
        <nav aria-label={f.primaryTools} className="ac-global-header__nav">
          {priorityItems.map((item) => {
            const action = actionProps(item, onNavigate);
            const Tag = action.as;
            const active = !!activeId && item.id === activeId;
            return (
            <Tag key={item.href || item.id || item.label} {...action.props}
              className="ac-nav-link"
              data-nav-id={item.id}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Tag>
            );
          })}
          {secondaryItems.map((item) => {
            const action = actionProps(item, onNavigate);
            const Tag = action.as;
            const active = !!activeId && item.id === activeId;
            return (
              <Tag key={item.href || item.id || item.label} {...action.props}
                className="ac-nav-link ac-site-nav-secondary"
                data-nav-id={item.id}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Tag>
            );
          })}
          <div ref={moreMenuRef} className="ac-site-more">
            <button type="button" aria-expanded={moreMenuOpen} aria-controls="ac-more-menu"
              onClick={() => setMoreMenuOpen((open) => !open)}
              style={{ border: "none", borderRadius: 8, padding: "9px 10px", background: "transparent",
                color: SITE_COLORS.text2, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              {moreLabel} <span aria-hidden="true">▾</span>
            </button>
            {moreMenuOpen && (
              <div id="ac-more-menu" className="ac-site-more-menu">
                {secondaryItems.map((item) => {
                  const action = actionProps(item, onNavigate);
                  const Tag = action.as;
                  return (
                    <Tag key={item.href || item.id} {...action.props}
                      className="ac-nav-link"
                      data-nav-id={item.id}
                      aria-current={activeId && item.id === activeId ? "page" : undefined}
                      onClick={action.props.onClick ? (event) => {
                        action.props.onClick(event);
                        if (!shouldUseNativeNavigation(event)) setMoreMenuOpen(false);
                      } : () => setMoreMenuOpen(false)}
                      style={{ display: "block", padding: "10px 12px", borderRadius: 7, color: SITE_COLORS.text1,
                        textDecoration: "none", whiteSpace: "nowrap", fontSize: 14, fontWeight: 650 }}>
                      {item.label}
                    </Tag>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
        <div className="ac-global-header__actions">
        <div className={`ac-global-header__language${keepLanguageOnMobile ? " ac-keep-mobile" : ""}`}>
          <LanguageSwitcher lang={lang} currentPath={resolvedCurrentPath} onLanguageSelect={onLanguageSelect} />
        </div>
        <a className="ac-nav-cta" href={resolvedCtaHref} onClick={onCtaClick ? (event) => {
          if (shouldUseNativeNavigation(event)) return;
          event.preventDefault();
          onCtaClick();
        } : undefined} style={{
            background: SITE_COLORS.grad,
            color: "#fff",
            border: "none",
            textDecoration: "none",
            borderRadius: 6,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "inherit",
          }}>
          {cta}
        </a>
        <button ref={menuButtonRef} type="button" aria-label={menuOpen ? f.closeMenu : f.openMenu} aria-expanded={menuOpen} aria-controls="m"
            onClick={toggleMobileMenu}
            className="ac-global-header__menu-button"
            style={{ width: 40, height: 40, borderRadius: 9, border: `1px solid ${SITE_COLORS.border}`,
              background: SITE_COLORS.surface, color: SITE_COLORS.text1, cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          display: "none", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav ref={mobileMenuRef} id="m" aria-label={f.menu} className="ac-global-header__mobile-menu">
          <a className="ac-mobile-menu-cta" href={resolvedCtaHref}
              onClick={onCtaClick ? (event) => {
                if (shouldUseNativeNavigation(event)) return;
                event.preventDefault();
                onCtaClick();
                closeMobileMenu();
              } : () => closeMobileMenu()}
          >
              {cta}
          </a>
          {items.map((item) => {
            const action = actionProps(item, onNavigate);
            const Tag = action.as;
            return (
              <Tag key={item.href || item.id || item.label} {...action.props}
                className="ac-nav-link"
                data-nav-id={item.id}
                aria-current={activeId && item.id === activeId ? "page" : undefined}
                onClick={item.onClick ? () => { item.onClick(); toggleMobileMenu(); } : action.props.onClick ? (event) => {
                  action.props.onClick(event);
                  if (!shouldUseNativeNavigation(event)) toggleMobileMenu();
                } : () => closeMobileMenu()}
              >
                {item.label}
              </Tag>
            );
          })}
        </nav>
      )}
    </header>
    </>
  );
}

export function WorkspaceStatusBar({ children }) {
  if (!children) return null;
  return (
    <div className="ac-workspace-status-bar">
      <div className="ac-workspace-status-bar__inner" role="status">
        {children}
      </div>
    </div>
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
            {" · "}
            {/* Handled by the delegated listener in public/consent.js */}
            <button
              type="button"
              data-ac-cookie-prefs
              className="ac-footer-legal-link"
              style={{ ...legalLink, background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
            >
              {f.cookiePrefs}
            </button>
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

export function AppShell({ children, lang = "en", activeId, currentPath }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: SITE_COLORS.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
    }}>
      <SiteHeader lang={lang} activeId={activeId} currentPath={currentPath} />
      {children}
      <SiteFooter lang={lang} className="ac-site-footer" />
    </div>
  );
}
