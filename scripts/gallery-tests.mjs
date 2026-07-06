// ──────────────────────────────────────────────────────────────────────────
// Template-gallery invariants (Phase 9). Guards the non-cropping, mobile-first,
// keyboard-accessible preview behavior so it can't silently regress.
// Run: npm run test:gallery
// ──────────────────────────────────────────────────────────────────────────
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(path.join(root, "src/ResumeGenerator.jsx"), "utf8");
const registry = readFileSync(path.join(root, "src/documents/templateRegistry.js"), "utf8");
const { TEMPLATES, RESUME_TEMPLATE_COUNT, templateCountries } = await import(path.join(root, "src/documents/templateRegistry.js"));

let failures = 0;
const check = (name, cond) => { if (cond) console.log(`  ok  ${name}`); else { failures++; console.error(`  FAIL ${name}`); } };

// Non-cropping, consistent-dimension previews: A4 aspect-ratio frame + a single
// uniform scale factor (object-fit: contain equivalent), never a crop/stretch.
check("thumbnail uses A4 aspect-ratio frame (consistent height, no crop)",
  src.includes('aspectRatio: "210 / 297"'));
check("thumbnail scales with a single uniform min() factor (contain, not stretch)",
  /Math\.min\(\s*frameWidth\s*\/\s*DOCUMENT_PREVIEW_WIDTH\s*,\s*frameHeight\s*\/\s*DOCUMENT_PREVIEW_PAGE_HEIGHT\s*\)/.test(src));
check("thumbnail lazily measures via ResizeObserver (reserved space, no CLS)",
  src.includes("ResizeObserver") && src.includes("DocumentThumbnailPreview"));

// Mobile does NOT rely on hover: explicit Preview + Use buttons render for isMobile.
check("mobile gallery shows explicit Preview + Use buttons (no hover reliance)",
  /isMobile\s*&&\s*\(/.test(src) && src.includes("{bu.preview}") && src.includes("{bu.useTemplate}"));

// Preview is a real, keyboard-accessible dialog with a Use action.
check("template preview is an accessible dialog (role=dialog, aria-modal, Escape)",
  src.includes('role="dialog" aria-modal="true"') && /key === "Escape"/.test(src));
check('preview dialog has a "Use this template" action',
  src.includes("Use this template"));

const resumeTemplates = TEMPLATES.filter((template) => !template.blank);
const newTemplateIds = ["toronto", "montreal", "vancouver", "maple", "global", "meridian", "atlas-pro", "passport", "casablanca", "paris", "medina", "dubai", "riyad", "khaleej"];
const canadaIds = ["toronto", "montreal", "vancouver", "maple"];
check("template registry defines market tags for every resume template",
  resumeTemplates.length === RESUME_TEMPLATE_COUNT
    && resumeTemplates.every((template) => templateCountries(template).length > 0)
    && registry.includes("TEMPLATE_COUNTRIES")
    && registry.includes("templateCountries"));
check("country-specific expansion adds at least 60 resume templates",
  RESUME_TEMPLATE_COUNT >= 60 && newTemplateIds.every((id) => resumeTemplates.some((template) => template.id === id)));
check("Canada templates are tagged Canada and avoid photo variants",
  canadaIds.every((id) => {
    const template = resumeTemplates.find((candidate) => candidate.id === id);
    return template && templateCountries(template).includes("canada") && !["modern", "elegant", "creative", "slate", "vertex", "carbon"].includes(template.variant || template.id);
  }));
check("gallery supports shareable country filter URL state",
  src.includes('initialSearchParams.get("country")') && src.includes('current.searchParams.set("country", tplCountry)'));
check("country filter participates in template filtering",
  src.includes('tplCountry !== "all"') && src.includes("meta.countries.includes(tplCountry)"));

console.log("");
if (failures) { console.error(`Gallery invariants: ${failures} failed.`); process.exit(1); }
console.log("Gallery invariants: all passed.");
