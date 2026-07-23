import { activeNavIdForPath, PRIMARY_NAV_ITEMS } from "../src/nav/navItems.js";
import { localizedLanguageHref, localizeRoute } from "../src/seo/localizedRoutes.js";
import en from "../src/i18n/namespaces/en/footer.js";
import fr from "../src/i18n/namespaces/fr/footer.js";
import ar from "../src/i18n/namespaces/ar/footer.js";

const COPY = { en, fr, ar };
const FLAGS = { en: "🇬🇧", fr: "🇫🇷", ar: "🇲🇦" };
const NAMES = { en: "English", fr: "Français", ar: "العربية" };

export function headerHtml(lang = "en", route = "/") {
  const locale = COPY[lang] ? lang : "en";
  const f = COPY[locale];
  const home = localizeRoute("/", locale);
  const active = activeNavIdForPath(route);
  const links = PRIMARY_NAV_ITEMS.map((item) => {
    const current = item.id === active ? ' aria-current="page" data-nav-active="true"' : "";
    return `<a class="ac-nav-link" data-nav-id="${item.id}" href="${localizeRoute(item.href, locale)}"${current}>${f[item.labelKey] || item.id}</a>`;
  }).join("");
  const languages = ["en", "fr", "ar"].map((code) => `<a href="${localizedLanguageHref(route, code)}" lang="${code}"${code === locale ? ' aria-current="page"' : ""}><span aria-hidden="true">${FLAGS[code]}</span> ${NAMES[code]}</a>`).join("");
  const ctaHref = locale === "en" ? "/resume-builder/" : localizeRoute("/free-resume-builder/", locale);
  const cta = locale === "fr" ? "Créer mon CV" : locale === "ar" ? "إنشاء سيرتي الذاتية" : "Create Resume";
  const skip = locale === "fr" ? "Aller au contenu principal" : locale === "ar" ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content";
  return `<a class="ac-skip-link" href="#main-content">${skip}</a><header class="ac-static-site-header" data-site-header="applycraft">
  <div class="ac-static-header-row">
    <a class="ac-static-logo" href="${home}" aria-label="${f.brandHome}"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" width="320" height="82"></a>
    <nav class="ac-static-desktop-nav" aria-label="${f.primaryTools}">${links}</nav>
    <div class="ac-static-header-actions">
      <details class="ac-static-language"><summary aria-label="${f.primaryTools}: ${NAMES[locale]}"><span aria-hidden="true">${FLAGS[locale]}</span><span class="ac-static-language-code">${locale.toUpperCase()}</span><span class="ac-static-language-name">${NAMES[locale]}</span><span aria-hidden="true">▼</span></summary><div>${languages}</div></details>
      <a class="ac-static-cta" href="${ctaHref}">${cta}</a>
      <button class="ac-static-menu-button" type="button" aria-expanded="false" aria-controls="ac-static-mobile-menu" aria-label="${f.openMenu}">☰</button>
    </div>
  </div>
  <nav id="ac-static-mobile-menu" class="ac-static-mobile-menu" aria-label="${f.menu}" hidden>${links}<div class="ac-static-mobile-languages">${languages}</div></nav>
</header><script src="/site-header.js" defer></script>`;
}
