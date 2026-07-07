import { FOOTER_LINK_SECTIONS, localizedFooterHref } from "../src/footerLinks.js";
import en from "../src/i18n/namespaces/en/footer.js";
import fr from "../src/i18n/namespaces/fr/footer.js";
import ar from "../src/i18n/namespaces/ar/footer.js";
import { localizeRoute } from "../src/seo/localizedRoutes.js";
import { PRODUCT } from "../src/product.js";

const FOOTER_UI = { en, fr, ar };

function footerText(value) {
  return String(value || "")
    .replace("{tpl}", PRODUCT.resumeTemplateCount)
    .replace("{docs}", PRODUCT.localizedDocumentLanguageCount)
    .replace("{ui}", PRODUCT.interfaceLanguageCount);
}

export function footerHtml(lang = "en") {
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const homeHref = localizeRoute("/", lang);
  const linkHtml = FOOTER_LINK_SECTIONS.map((section) => `<div>
          <h2>${f[section.key]}</h2>
          ${section.links.map((link) => {
            const rel = link.external ? ` rel="noopener"` : "";
            const href = localizedFooterHref(link, lang);
            return `<a href="${href}"${rel}>${f[link.labelKey] || link.labelKey}</a>`;
          }).join("")}
        </div>`).join("\n        ");

  return `<footer class="site-footer" data-footer="unified">
  <div class="footer-shell">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="${homeHref}" class="footer-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="lazy" decoding="async"></a>
        <p>${footerText(f.brand)}</p>
        <a href="mailto:hello@applycraft.io">hello@applycraft.io</a>
      </div>
      <nav class="footer-grid" aria-label="Footer">
        ${linkHtml}
      </nav>
    </div>
    <div class="footer-bottom">
      <span>${footerText(f.copyrightLine || "© {year} ApplyCraft by Biroue Digital Ltd · applycraft.io")
        .replace("{year}", new Date().getFullYear())
        .replace("applycraft.io", `<a href="${homeHref}" class="footer-legal-link">applycraft.io</a>`)}</span>
      <span>${f.badge1} · ${f.badge2} · ${f.badge3}</span>
    </div>
  </div>
</footer>`;
}
