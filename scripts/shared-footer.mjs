import { FOOTER_LINK_SECTIONS } from "../src/footerLinks.js";
import en from "../src/i18n/namespaces/en/footer.js";
import fr from "../src/i18n/namespaces/fr/footer.js";
import ar from "../src/i18n/namespaces/ar/footer.js";

const FOOTER_UI = { en, fr, ar };

function footerText(value) {
  return String(value || "")
    .replace("{tpl}", "46")
    .replace("{docs}", "3")
    .replace("{ui}", "3");
}

export function footerHtml(lang = "en") {
  const f = FOOTER_UI[lang] || FOOTER_UI.en;
  const linkHtml = FOOTER_LINK_SECTIONS.map((section) => `<div>
          <h2>${f[section.key]}</h2>
          ${section.links.map((link) => {
            const rel = link.external ? ` rel="noopener"` : "";
            const href = link.labelKey === "blog" && (lang === "fr" || lang === "ar") ? "/fr/blog/" : link.href;
            return `<a href="${href}"${rel}>${f[link.labelKey] || link.labelKey}</a>`;
          }).join("")}
        </div>`).join("\n        ");

  return `<footer class="site-footer">
  <div class="footer-shell">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="ApplyCraft home"><img src="/assets/brand/applycraft-logo-navbar.png" alt="ApplyCraft" class="brand-logo-img" loading="lazy" decoding="async"></a>
        <p>${footerText(f.brand)}</p>
        <a href="mailto:hello@applycraft.io">hello@applycraft.io</a>
      </div>
      <nav class="footer-grid" aria-label="Footer">
        ${linkHtml}
      </nav>
    </div>
    <div class="footer-bottom">
      <span>© 2026 ApplyCraft by Biroue Digital Ltd · applycraft.io</span>
      <span>${f.badge1} · ${f.badge2} · ${f.badge3}</span>
    </div>
  </div>
</footer>`;
}
