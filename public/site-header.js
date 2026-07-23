(function () {
  "use strict";
  function init(header) {
    var button = header.querySelector(".ac-global-header__menu-button");
    var menu = header.querySelector(".ac-global-header__mobile-menu");
    var languageRoot = header.querySelector(".ac-global-header__language");
    var languageButton = languageRoot && languageRoot.querySelector(".ac-language-trigger");
    var languageMenu = languageRoot && languageRoot.querySelector(".ac-language-menu");
    var moreRoot = header.querySelector(".ac-site-more");
    var moreButton = moreRoot && moreRoot.querySelector(":scope > button");
    var moreMenu = moreRoot && moreRoot.querySelector(".ac-site-more-menu");
    if (!button || !menu) return;
    var cta = header.querySelector(".ac-nav-cta");
    if (cta) {
      var mobileCta = cta.cloneNode(true);
      mobileCta.className = "ac-mobile-menu-cta";
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
    if (moreButton && moreMenu) {
      var closeMore = function (focus) {
        moreMenu.hidden = true;
        moreButton.setAttribute("aria-expanded", "false");
        if (focus) moreButton.focus();
      };
      moreButton.addEventListener("click", function () {
        var willOpen = moreMenu.hidden;
        moreMenu.hidden = !willOpen;
        moreButton.setAttribute("aria-expanded", String(willOpen));
      });
      moreMenu.addEventListener("click", function (event) { if (event.target.closest("a[href]")) closeMore(false); });
      document.addEventListener("click", function (event) { if (!moreMenu.hidden && !moreRoot.contains(event.target)) closeMore(false); });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !moreMenu.hidden) closeMore(true); });
    }
    menu.addEventListener("click", function (event) { if (event.target.closest("a[href]")) close(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !menu.hidden) close(true); });
    document.addEventListener("click", function (event) { if (!menu.hidden && !header.contains(event.target)) close(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1120 && !menu.hidden) close(false); });
  }
  document.querySelectorAll('[data-site-header="applycraft"]').forEach(init);
}());
