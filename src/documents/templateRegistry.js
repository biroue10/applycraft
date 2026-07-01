export const TEMPLATES = [
  { id: "blank",     name: "Blank",     tag: "No styling — plain text output",        accent: "#374151", font: "'Inter', system-ui, sans-serif", blank: true },
  { id: "classic",   name: "Classic",   tag: "Timeless, serif, single column",       accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif" },
  { id: "modern",    name: "Modern",    tag: "Clean sans-serif with sidebar",         accent: "#2563eb", font: "'Inter', system-ui, sans-serif" },
  { id: "minimal",   name: "Minimal",   tag: "Lots of whitespace, understated",       accent: "#0f766e", font: "'Inter', system-ui, sans-serif" },
  { id: "bold",      name: "Bold",      tag: "Strong header band, high contrast",     accent: "#b91c1c", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "elegant",   name: "Elegant",   tag: "Refined, thin rules, light weight",     accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif" },
  { id: "executive", name: "Executive", tag: "Split header, left-bar sections, gold", accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "creative",  name: "Creative",  tag: "Right colour panel, bold & expressive", accent: "#db2777", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "tech",      name: "Tech",      tag: "Dark terminal style, monospace, green", accent: "#10b981", font: "'Courier New', 'Courier', monospace" },
  { id: "sharp",    name: "Sharp",    tag: "Black & white corporate, no colour",   accent: "#111827", font: "'Inter', system-ui, sans-serif" },
  { id: "slate",    name: "Slate",    tag: "Dark navy sidebar, warm gold accent",  accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "prism",    name: "Prism",    tag: "Diagonal gradient header, vibrant",    accent: "#7c3aed", font: "'Inter', system-ui, sans-serif" },
  { id: "compact",  name: "Compact",  tag: "Two-column body, high density layout", accent: "#0369a1", font: "'Inter', system-ui, sans-serif" },
  { id: "horizon",  name: "Horizon",  tag: "Centered banner header, strong impact",  accent: "#e14d43", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "nordic",   name: "Nordic",   tag: "Scandinavian minimal, wide margins",     accent: "#2d5a27", font: "'Georgia', 'Times New Roman', serif" },
  { id: "dusk",     name: "Dusk",     tag: "Dark charcoal paper, amber accents",     accent: "#f59e0b", font: "'Inter', system-ui, sans-serif" },
  { id: "vertex",   name: "Vertex",   tag: "Reversed layout, right sidebar, cyan",   accent: "#06b6d4", font: "'Inter', system-ui, sans-serif" },
  { id: "academy",  name: "Academy",  tag: "Academic CV, double rule, serif",        accent: "#1e40af", font: "'Georgia', 'Times New Roman', serif" },
  { id: "spark",    name: "Spark",    tag: "Vibrant section bands, energetic",       accent: "#f97316", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "stone",    name: "Stone",    tag: "Warm gray header, understated serif",    accent: "#78716c", font: "'Georgia', 'Times New Roman', serif" },
  { id: "ivy",      name: "Ivy",      tag: "British CV style, double-rule header",   accent: "#166534", font: "'Georgia', 'Times New Roman', serif" },
  { id: "carbon",   name: "Carbon",   tag: "Charcoal sidebar, square monogram",      accent: "#6b7280", font: "'Inter', system-ui, sans-serif" },
  { id: "pulse",    name: "Pulse",    tag: "Gradient left bar, modern startup",      accent: "#8b5cf6", font: "'Inter', system-ui, sans-serif" },
  { id: "atlas",    name: "Atlas",    tag: "Executive sidebar with precise spacing", accent: "#1d4ed8", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "executive" },
  { id: "nova",     name: "Nova",     tag: "Clean startup layout with bright accents", accent: "#2563eb", font: "'Inter', system-ui, sans-serif", variant: "pulse" },
  { id: "ember",    name: "Ember",    tag: "Warm high-impact header for concise resumes", accent: "#dc2626", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "bold" },
  { id: "linear",   name: "Linear",   tag: "Precise one-column layout with crisp rules", accent: "#334155", font: "'Inter', system-ui, sans-serif", variant: "minimal" },
  { id: "folio",    name: "Folio",    tag: "Portfolio-forward layout for creative roles", accent: "#7c3aed", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "creative" },
  { id: "signal",   name: "Signal",   tag: "Technical two-column layout with clear signals", accent: "#0284c7", font: "'Inter', system-ui, sans-serif", variant: "compact" },
  { id: "orbit",    name: "Orbit",    tag: "Rounded modern structure with strong header", accent: "#4f46e5", font: "'Inter', system-ui, sans-serif", variant: "horizon" },
  { id: "mariner",  name: "Mariner",  tag: "Deep blue professional sidebar layout", accent: "#1e40af", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "slate" },
  { id: "summit",   name: "Summit",   tag: "Senior leadership layout with refined hierarchy", accent: "#0f766e", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "executive" },
  { id: "ledger",   name: "Ledger",   tag: "Conservative serif layout for finance and law", accent: "#334155", font: "'Georgia', 'Times New Roman', serif", variant: "classic" },
  { id: "craft",    name: "Craft",    tag: "Balanced designer resume with structured sidebar", accent: "#9333ea", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "elegant" },
  { id: "mono",     name: "Mono",     tag: "Monospace technical layout for engineering", accent: "#16a34a", font: "'Courier New', 'Courier', monospace", variant: "tech" },
  { id: "aurora",   name: "Aurora",   tag: "Vibrant gradient header for modern teams", accent: "#7c3aed", font: "'Inter', system-ui, sans-serif", variant: "prism" },
  { id: "canvas",   name: "Canvas",   tag: "Spacious editorial layout with subtle detail", accent: "#475569", font: "'Georgia', 'Times New Roman', serif", variant: "stone" },
  { id: "keystone", name: "Keystone", tag: "Formal CV structure for academic profiles", accent: "#1d4ed8", font: "'Georgia', 'Times New Roman', serif", variant: "academy" },
  { id: "blueprint", name: "Blueprint", tag: "Structured right-sidebar layout for builders", accent: "#0891b2", font: "'Inter', system-ui, sans-serif", variant: "vertex" },
  { id: "delta",    name: "Delta",    tag: "Sharp corporate layout with minimal color", accent: "#111827", font: "'Inter', system-ui, sans-serif", variant: "sharp" },
  { id: "terra",    name: "Terra",    tag: "Calm serif layout with grounded spacing", accent: "#166534", font: "'Georgia', 'Times New Roman', serif", variant: "nordic" },
  { id: "metro",    name: "Metro",    tag: "Compact city-style layout for fast scanning", accent: "#0369a1", font: "'Inter', system-ui, sans-serif", variant: "compact" },
  { id: "verve",    name: "Verve",    tag: "Energetic bands for sales and marketing", accent: "#f97316", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "spark" },
  { id: "consultant", name: "Consultant", tag: "Polished one-column format for client work", accent: "#1f2937", font: "'Inter', system-ui, sans-serif", variant: "minimal" },
  { id: "founder",  name: "Founder",  tag: "Bold leadership resume for operators", accent: "#4338ca", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "bold" },
  { id: "graduate", name: "Graduate", tag: "Clean academic-friendly layout for early careers", accent: "#2563eb", font: "'Inter', system-ui, sans-serif", variant: "academy" },
  { id: "clinical", name: "Clinical", tag: "Clear healthcare layout with standard headings", accent: "#0f766e", font: "'Inter', system-ui, sans-serif", variant: "classic" },
];

export const COVER_TEMPLATES = [
  { id: "blank",   name: "Blank",   tag: "Plain text, no styling",            accent: "#374151", font: "'Inter', system-ui, sans-serif", blank: true },
  { id: "classic", name: "Classic", tag: "Traditional block letter, serif",   accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif" },
  { id: "modern",  name: "Modern",  tag: "Left sidebar with your details",    accent: "#2563eb", font: "'Inter', system-ui, sans-serif" },
  { id: "minimal", name: "Minimal", tag: "Clean, precise, lots of whitespace",accent: "#0f766e", font: "'Inter', system-ui, sans-serif" },
  { id: "bold",    name: "Bold",    tag: "Full-bleed accent header",           accent: "#b91c1c", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "elegant", name: "Elegant", tag: "Soft sidebar, refined serif type",  accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif" },
  { id: "atlas",   name: "Atlas",   tag: "Polished blue sidebar for executive letters", accent: "#1d4ed8", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "modern" },
  { id: "nova",    name: "Nova",    tag: "Bright modern letter with clean hierarchy", accent: "#2563eb", font: "'Inter', system-ui, sans-serif", variant: "minimal" },
  { id: "ember",   name: "Ember",   tag: "Confident header style for concise pitches", accent: "#dc2626", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "bold" },
  { id: "slate",   name: "Slate",   tag: "Dark professional sidebar with restrained detail", accent: "#334155", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "modern" },
  { id: "folio",   name: "Folio",   tag: "Refined serif letter for creative applications", accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif", variant: "elegant" },
  { id: "linear",  name: "Linear",  tag: "Minimal one-column letter with precise spacing", accent: "#334155", font: "'Inter', system-ui, sans-serif", variant: "minimal" },
  { id: "summit",  name: "Summit",  tag: "Executive cover letter with calm blue accents", accent: "#1e40af", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "classic" },
  { id: "craft",   name: "Craft",   tag: "Soft editorial letter for design and brand roles", accent: "#9333ea", font: "'Georgia', 'Palatino Linotype', serif", variant: "elegant" },
  { id: "metro",   name: "Metro",   tag: "Compact modern letter for fast scanning", accent: "#0369a1", font: "'Inter', system-ui, sans-serif", variant: "modern" },
  { id: "ledger",  name: "Ledger",  tag: "Formal serif letter for conservative industries", accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif", variant: "classic" },
  { id: "pulse",   name: "Pulse",   tag: "Startup-ready letter with strong accent treatment", accent: "#8b5cf6", font: "'Inter', system-ui, sans-serif", variant: "bold" },
  { id: "clinical", name: "Clinical", tag: "Clear healthcare-friendly letter format", accent: "#0f766e", font: "'Inter', system-ui, sans-serif", variant: "minimal" },
];


export const RECOMMENDED_TEMPLATE_ID = "modern";
export const RESUME_TEMPLATE_COUNT = TEMPLATES.filter((template) => !template.blank).length;
export const COVER_TEMPLATE_COUNT = COVER_TEMPLATES.length;

export function getResumeTemplateById(id, fallback = "modern") {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES.find((template) => template.id === fallback) || TEMPLATES.find((template) => !template.blank) || TEMPLATES[0];
}

export function getCoverTemplateById(id, fallback = "modern") {
  return COVER_TEMPLATES.find((template) => template.id === id) || COVER_TEMPLATES.find((template) => template.id === fallback) || COVER_TEMPLATES.find((template) => !template.blank) || COVER_TEMPLATES[0];
}
