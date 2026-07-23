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
  const links = PRIMARY_NAV_ITEMS.map((item) => {
    const current = item.id === active ? ' aria-current="page" data-nav-active="true"' : "";
    return `<a class="ac-nav-link" data-nav-id="${item.id}" href="${localizeRoute(item.href, locale)}"${current}>${f[item.labelKey] || item.id}</a>`;
  }).join("");
  const currentLanguage = interfaceLanguageByCode(locale);
  const languages = INTERFACE_LANGUAGES.map((code) => {
    const language = interfaceLanguageByCode(code);
    return `<a href="${localizedLanguageHref(route, code)}" lang="${code}" role="menuitem"${code === locale ? ' aria-current="page"' : ""}><img src="${language.flagSrc}" alt="" aria-hidden="true" width="20" height="14"><span>${language.native}</span>${code === locale ? '<span class="ac-language-current" aria-hidden="true">✓</span>' : ""}</a>`;
  }).join("");
  const ctaHref = locale === "en" ? "/resume-builder/" : localizeRoute("/free-resume-builder/", locale);
  const cta = locale === "fr" ? "Créer mon CV" : locale === "ar" ? "إنشاء سيرتي الذاتية" : "Create Resume";
  const skip = locale === "fr" ? "Aller au contenu principal" : locale === "ar" ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content";
  return `<a class="ac-skip-link" href="#main-content">${skip}</a><header class="ac-static-site-header" data-site-header="applycraft">
  <div class="ac-static-header-row">
    <a class="ac-static-logo" href="${home}" aria-label="${f.brandHome}"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" width="320" height="82"></a>
    <nav class="ac-static-desktop-nav" aria-label="${f.primaryTools}">${links}</nav>
    <div class="ac-static-header-actions">
      <div class="ac-static-language ac-language-switcher"><button class="ac-language-trigger" type="button" aria-label="${f.primaryTools}: ${currentLanguage.native}" aria-haspopup="menu" aria-expanded="false" aria-controls="ac-static-language-menu"><img src="${currentLanguage.flagSrc}" alt="" aria-hidden="true" width="20" height="14"><strong>${currentLanguage.displayCode}</strong><span class="ac-language-trigger-label">${currentLanguage.native}</span><span class="ac-language-chevron" aria-hidden="true">▼</span></button><div id="ac-static-language-menu" class="ac-language-menu" role="menu" hidden>${languages}</div></div>
      <a class="ac-static-cta" href="${ctaHref}">${cta}</a>
      <button class="ac-static-menu-button" type="button" aria-expanded="false" aria-controls="ac-static-mobile-menu" aria-label="${f.openMenu}">☰</button>
    </div>
  </div>
  <nav id="ac-static-mobile-menu" class="ac-static-mobile-menu" aria-label="${f.menu}" hidden>${links}</nav>
</header><script src="/site-header.js" defer></script>`;
}
