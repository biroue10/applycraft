(function () {
  "use strict";
  var toggle = document.querySelector("[data-lp-menu-toggle]");
  var menu = document.getElementById("lp-mobile-nav");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? toggle.dataset.openLabel : toggle.dataset.closeLabel);
    toggle.textContent = open ? "☰" : "×";
    menu.hidden = open;
  });
}());
