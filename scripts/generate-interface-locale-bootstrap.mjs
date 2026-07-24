import { writeFile } from "node:fs/promises";
import { FOOTER_UI } from "../src/i18n/index.js";
import { INTERFACE_LANGUAGE_METADATA } from "../src/i18n/languages.js";
import { NAV_CTA, LANGUAGE_SWITCHER_COPY } from "../src/nav/navCopy.js";
import { PRIMARY_NAV_ITEMS } from "../src/nav/navItems.js";

const locales = ["en", "fr", "ar"];
const copy = Object.fromEntries(locales.map((locale) => [
  locale,
  {
    nav: Object.fromEntries(PRIMARY_NAV_ITEMS.map(({ id, labelKey }) => [id, FOOTER_UI[locale][labelKey]])),
    cta: NAV_CTA[locale],
    choose: LANGUAGE_SWITCHER_COPY[locale].choose,
    meta: INTERFACE_LANGUAGE_METADATA[locale],
  },
]));

const source = `(function () {
  "use strict";
  var supported = ${JSON.stringify(locales)};
  var copy = ${JSON.stringify(copy)};
  var params = new URL(window.location.href).searchParams;
  var requested = String(params.get("ui") || "").toLowerCase().split("-")[0];
  var stored = "";
  try { stored = String(localStorage.getItem("ac_interface_language") || "").toLowerCase().split("-")[0]; } catch (_) {}
  var locale = supported.indexOf(requested) >= 0 ? requested : (supported.indexOf(stored) >= 0 ? stored : "en");
  if (locale === "en") return;
  var current = copy[locale];
  document.documentElement.lang = locale;
  document.documentElement.dir = current.meta.dir;
  document.documentElement.dataset.acInterfaceLanguage = locale;
  var root = document.getElementById("root");
  if (!root) return;
  root.querySelectorAll("[data-nav-id]").forEach(function (link) {
    var label = current.nav[link.getAttribute("data-nav-id")];
    if (label) link.textContent = label;
  });
  root.querySelectorAll(".ac-nav-cta").forEach(function (link) { link.textContent = current.cta; });
  root.querySelectorAll(".ac-language-trigger").forEach(function (trigger) {
    var image = trigger.querySelector("img");
    var code = trigger.querySelector("strong");
    var label = trigger.querySelector(".ac-language-trigger-label");
    if (image) image.src = current.meta.flagSrc;
    if (code) code.textContent = current.meta.displayCode;
    if (label) label.textContent = current.meta.native;
    trigger.setAttribute("aria-label", current.choose + ": " + current.meta.native);
  });
}());
`;

await writeFile(new URL("../public/interface-locale-bootstrap.js", import.meta.url), source);
