(function () {
  "use strict";
  function init(header) {
    var button = header.querySelector(".ac-static-menu-button");
    var menu = header.querySelector(".ac-static-mobile-menu");
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
    menu.addEventListener("click", function (event) { if (event.target.closest("a[href]")) close(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !menu.hidden) close(true); });
    document.addEventListener("click", function (event) { if (!menu.hidden && !header.contains(event.target)) close(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1320 && !menu.hidden) close(false); });
  }
  document.querySelectorAll('[data-site-header="applycraft"]').forEach(init);
}());
