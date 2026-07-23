(function () {
  "use strict";
  function init(header) {
    var button = header.querySelector(".ac-static-menu-button");
    var menu = header.querySelector(".ac-static-mobile-menu");
    var languageRoot = header.querySelector(".ac-static-language");
    var languageButton = languageRoot && languageRoot.querySelector(".ac-language-trigger");
    var languageMenu = languageRoot && languageRoot.querySelector(".ac-language-menu");
    if (!button || !menu) return;
    var cta = header.querySelector(".ac-static-cta");
    if (cta) {
      var mobileCta = cta.cloneNode(true);
      mobileCta.className = "ac-static-mobile-cta";
      menu.insertBefore(mobileCta, menu.firstChild);
    }
    var open = function () { menu.hidden = false; button.setAttribute("aria-expanded", "true"); button.textContent = "✕"; };
    var close = function (focus) { menu.hidden = true; button.setAttribute("aria-expanded", "false"); button.textContent = "☰"; if (focus) button.focus(); };
    button.addEventListener("click", function () { menu.hidden ? open() : close(false); });
    if (languageButton && languageMenu) {
      var closeLanguage = function (focus) {
        languageMenu.hidden = true;
        languageButton.setAttribute("aria-expanded", "false");
        languageButton.querySelector(".ac-language-chevron").textContent = "▼";
        if (focus) languageButton.focus();
      };
      languageButton.addEventListener("click", function () {
        var willOpen = languageMenu.hidden;
        languageMenu.hidden = !willOpen;
        languageButton.setAttribute("aria-expanded", String(willOpen));
        languageButton.querySelector(".ac-language-chevron").textContent = willOpen ? "▲" : "▼";
      });
      languageMenu.addEventListener("click", function (event) { if (event.target.closest("a[href]")) closeLanguage(false); });
      document.addEventListener("click", function (event) { if (!languageMenu.hidden && !languageRoot.contains(event.target)) closeLanguage(false); });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !languageMenu.hidden) closeLanguage(true); });
    }
    menu.addEventListener("click", function (event) { if (event.target.closest("a[href]")) close(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !menu.hidden) close(true); });
    document.addEventListener("click", function (event) { if (!menu.hidden && !header.contains(event.target)) close(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1320 && !menu.hidden) close(false); });
  }
  document.querySelectorAll('[data-site-header="applycraft"]').forEach(init);
}());
