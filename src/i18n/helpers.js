import { DEFAULT_LANGUAGE } from "./config.js";

const warnedMissing = new Set();

export function interpolate(value, values = {}) {
  if (typeof value !== "string") return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

export function plural(value, count, values = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const key = count === 1 ? "one" : "other";
  return interpolate(value[key] ?? value.other ?? value.one ?? "", { ...values, count });
}

export function createTranslator(resources, options = {}) {
  const fallbackLanguage = options.fallbackLanguage || DEFAULT_LANGUAGE;
  const dev = options.dev ?? Boolean(import.meta?.env?.DEV);

  return function translate({ language, namespace = "common", key, values = {}, count } = {}) {
    const lang = String(language || fallbackLanguage).toLowerCase().split("-")[0];
    const primary = resources?.[lang]?.[namespace];
    const fallback = resources?.[fallbackLanguage]?.[namespace];
    let value = primary?.[key];
    if (value === undefined) value = fallback?.[key];

    if (value === undefined) {
      const id = `${lang}.${namespace}.${key}`;
      if (dev && !warnedMissing.has(id)) {
        warnedMissing.add(id);
        console.warn(`[i18n] Missing translation key: ${id}`);
      }
      return key || "";
    }

    if (count !== undefined) return plural(value, count, values);
    return interpolate(value, values);
  };
}

export function namespace(resources, language, namespaceName, fallbackLanguage = DEFAULT_LANGUAGE) {
  const lang = String(language || fallbackLanguage).toLowerCase().split("-")[0];
  return resources?.[lang]?.[namespaceName] || resources?.[fallbackLanguage]?.[namespaceName] || {};
}
