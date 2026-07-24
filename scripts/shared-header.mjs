import { activeNavIdForPath, PRIMARY_NAV_ITEMS } from "../src/nav/navItems.js";
import { localizedLanguageHref, localizeRoute } from "../src/seo/localizedRoutes.js";
import { INTERFACE_LANGUAGES, interfaceLanguageByCode } from "../src/i18n/languages.js";
import en from "../src/i18n/namespaces/en/footer.js";
import fr from "../src/i18n/namespaces/fr/footer.js";
import ar from "../src/i18n/namespaces/ar/footer.js";

const COPY = { en, fr, ar };
export function headerHtml(lang = "en", route = "/") {
  const locale = COPY[lang] ? lang : "en";
  const f = COPY[locale];
  const home = localizeRoute("/", locale);
  const active = activeNavIdForPath(route);
  const links = PRIMARY_NAV_ITEMS.map((item, index) => {
    const current = item.id === active ? ' aria-current="page" data-nav-active="true"' : "";
    const secondary = index >= 4 ? " ac-site-nav-secondary" : "";
    return `<a class="ac-nav-link${secondary}" data-nav-id="${item.id}" href="${localizeRoute(item.href, locale)}"${current}>${f[item.labelKey] || item.id}</a>`;
  }).join("");
  const secondaryLinks = PRIMARY_NAV_ITEMS.slice(4).map((item) => {
    const current = item.id === active ? ' aria-current="page" data-nav-active="true"' : "";
    return `<a class="ac-nav-link" data-nav-id="${item.id}" href="${localizeRoute(item.href, locale)}"${current}>${f[item.labelKey] || item.id}</a>`;
  }).join("");
  const moreLabel = locale === "fr" ? "Plus" : locale === "ar" ? "المزيد" : "More";
  const currentLanguage = interfaceLanguageByCode(locale);
  const languages = INTERFACE_LANGUAGES.map((code) => {
    const language = interfaceLanguageByCode(code);
    return `<a href="${localizedLanguageHref(route, code)}" lang="${code}" role="menuitem"${code === locale ? ' aria-current="page"' : ""}><img src="${language.flagSrc}" alt="" aria-hidden="true" width="20" height="14"><span>${language.native}</span>${code === locale ? '<span class="ac-language-current" aria-hidden="true">✓</span>' : ""}</a>`;
  }).join("");
  const ctaHref = locale === "en" ? "/resume-builder/" : localizeRoute("/free-resume-builder/", locale);
  const cta = locale === "fr" ? "Créer mon CV" : locale === "ar" ? "إنشاء سيرتي الذاتية" : "Create Resume";
  const skip = locale === "fr" ? "Aller au contenu principal" : locale === "ar" ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content";
  return `<a class="ac-skip-link" href="#main-content">${skip}</a><header class="ac-global-header" data-site-header="applycraft" dir="${currentLanguage.dir}">
  <div class="ac-global-header__inner">
    <a class="ac-nav-logo" href="${home}" aria-label="${f.brandHome}"><img class="ac-brand-logo-img" src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" width="320" height="82"></a>
    <nav class="ac-global-header__nav" aria-label="${f.primaryTools}">${links}<div class="ac-site-more"><button type="button" aria-expanded="false" aria-controls="ac-global-more-menu">${moreLabel} <span aria-hidden="true">▾</span></button><div id="ac-global-more-menu" class="ac-site-more-menu" hidden>${secondaryLinks}</div></div></nav>
    <div class="ac-global-header__actions">
      <div class="ac-global-header__language ac-language-switcher"><button class="ac-language-trigger" type="button" aria-label="${f.chooseLanguage}: ${currentLanguage.native}" aria-haspopup="menu" aria-expanded="false" aria-controls="ac-global-language-menu"><img src="${currentLanguage.flagSrc}" alt="" aria-hidden="true" width="20" height="14"><strong>${currentLanguage.displayCode}</strong><span class="ac-language-trigger-label">${currentLanguage.native}</span><span class="ac-language-chevron" aria-hidden="true">▼</span></button><div id="ac-global-language-menu" class="ac-language-menu" role="menu" aria-label="${f.languageMenu}" hidden>${languages}</div></div>
      <a class="ac-nav-cta" href="${ctaHref}">${cta}</a>
      <button class="ac-global-header__menu-button" type="button" aria-expanded="false" aria-controls="ac-global-mobile-menu" aria-label="${f.openMenu}">☰</button>
    </div>
  </div>
  <nav id="ac-global-mobile-menu" class="ac-global-header__mobile-menu" aria-label="${f.menu}" hidden>${PRIMARY_NAV_ITEMS.map((item) => {
    const current = item.id === active ? ' aria-current="page" data-nav-active="true"' : "";
    return `<a class="ac-nav-link" data-nav-id="${item.id}" href="${localizeRoute(item.href, locale)}"${current}>${f[item.labelKey] || item.id}</a>`;
  }).join("")}</nav>
</header><script src="/site-header.js" defer></script>`;
}
