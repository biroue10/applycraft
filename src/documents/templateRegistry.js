export const TEMPLATE_COUNTRIES = ["morocco", "canada", "france", "international", "gulf"];
const TEMPLATE_COUNTRY_CODE = { m: "morocco", c: "canada", f: "france", i: "international", g: "gulf" };

export function templateCountries(template = {}) {
  if (Array.isArray(template.countries)) return template.countries;
  return String(template.markets || "").split("").map((code) => TEMPLATE_COUNTRY_CODE[code]).filter(Boolean);
}

export const TEMPLATES = [
  { id: "blank",     name: "Blank",     tag: "No styling — plain text output",        accent: "#374151", font: "'Inter', system-ui, sans-serif", blank: true },
  { id: "classic",   name: "Classic",   tag: "Timeless, serif, single column",       accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif", markets: "cifm" },
  { id: "modern",    name: "Modern",    tag: "Clean sans-serif with sidebar",         accent: "#2563eb", font: "'Inter', system-ui, sans-serif", markets: "mfg" },
  { id: "minimal",   name: "Minimal",   tag: "Lots of whitespace, understated",       accent: "#0f766e", font: "'Inter', system-ui, sans-serif", markets: "cimf" },
  { id: "bold",      name: "Bold",      tag: "Strong header band, high contrast",     accent: "#b91c1c", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "fmg" },
  { id: "elegant",   name: "Elegant",   tag: "Refined, thin rules, light weight",     accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif", markets: "fm" },
  { id: "executive", name: "Executive", tag: "Split header, left-bar sections, gold", accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "mgf" },
  { id: "creative",  name: "Creative",  tag: "Right colour panel, bold & expressive", accent: "#db2777", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "fmg" },
  { id: "tech",      name: "Tech",      tag: "Dark terminal style, monospace, green", accent: "#10b981", font: "'Courier New', 'Courier', monospace", markets: "ci" },
  { id: "sharp",    name: "Sharp",    tag: "Black & white corporate, no colour",   accent: "#111827", font: "'Inter', system-ui, sans-serif", markets: "cif" },
  { id: "slate",    name: "Slate",    tag: "Dark navy sidebar, warm gold accent",  accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "mgf" },
  { id: "prism",    name: "Prism",    tag: "Diagonal gradient header, vibrant",    accent: "#7c3aed", font: "'Inter', system-ui, sans-serif", markets: "fmg" },
  { id: "compact",  name: "Compact",  tag: "Two-column body, high density layout", accent: "#0369a1", font: "'Inter', system-ui, sans-serif", markets: "cim" },
  { id: "horizon",  name: "Horizon",  tag: "Centered banner header, strong impact",  accent: "#e14d43", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "fmg" },
  { id: "nordic",   name: "Nordic",   tag: "Scandinavian minimal, wide margins",     accent: "#2d5a27", font: "'Georgia', 'Times New Roman', serif", markets: "cif" },
  { id: "dusk",     name: "Dusk",     tag: "Dark charcoal paper, amber accents",     accent: "#f59e0b", font: "'Inter', system-ui, sans-serif", markets: "ig" },
  { id: "vertex",   name: "Vertex",   tag: "Reversed layout, right sidebar, cyan",   accent: "#06b6d4", font: "'Inter', system-ui, sans-serif", markets: "mg" },
  { id: "academy",  name: "Academy",  tag: "Academic CV, double rule, serif",        accent: "#1e40af", font: "'Georgia', 'Times New Roman', serif", markets: "cif" },
  { id: "spark",    name: "Spark",    tag: "Vibrant section bands, energetic",       accent: "#f97316", font: "'Plus Jakarta Sans', 'Inter', sans-serif", markets: "fmg" },
  { id: "stone",    name: "Stone",    tag: "Warm gray header, understated serif",    accent: "#78716c", font: "'Georgia', 'Times New Roman', serif", markets: "cifm" },
  { id: "ivy",      name: "Ivy",      tag: "British CV style, double-rule header",   accent: "#166534", font: "'Georgia', 'Times New Roman', serif", markets: "cif" },
  { id: "carbon",   name: "Carbon",   tag: "Charcoal sidebar, square monogram",      accent: "#6b7280", font: "'Inter', system-ui, sans-serif", markets: "mgf" },
  { id: "pulse",    name: "Pulse",    tag: "Gradient left bar, modern startup",      accent: "#8b5cf6", font: "'Inter', system-ui, sans-serif", markets: "icm" },
  { id: "atlas",    name: "Atlas",    tag: "Executive sidebar with precise spacing", accent: "#1d4ed8", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "executive", markets: "mgf" },
  { id: "nova",     name: "Nova",     tag: "Clean startup layout with bright accents", accent: "#2563eb", font: "'Inter', system-ui, sans-serif", variant: "pulse", markets: "cim" },
  { id: "ember",    name: "Ember",    tag: "Warm high-impact header for concise resumes", accent: "#dc2626", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "bold", markets: "fmg" },
  { id: "linear",   name: "Linear",   tag: "Precise one-column layout with crisp rules", accent: "#334155", font: "'Inter', system-ui, sans-serif", variant: "minimal", markets: "cif" },
  { id: "folio",    name: "Folio",    tag: "Portfolio-forward layout for creative roles", accent: "#7c3aed", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "creative", markets: "fm" },
  { id: "signal",   name: "Signal",   tag: "Technical two-column layout with clear signals", accent: "#0284c7", font: "'Inter', system-ui, sans-serif", variant: "compact", markets: "ci" },
  { id: "orbit",    name: "Orbit",    tag: "Rounded modern structure with strong header", accent: "#4f46e5", font: "'Inter', system-ui, sans-serif", variant: "horizon", markets: "fmg" },
  { id: "mariner",  name: "Mariner",  tag: "Deep blue professional sidebar layout", accent: "#1e40af", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "slate", markets: "mgf" },
  { id: "summit",   name: "Summit",   tag: "Senior leadership layout with refined hierarchy", accent: "#0f766e", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "executive", markets: "mgf" },
  { id: "ledger",   name: "Ledger",   tag: "Conservative serif layout for finance and law", accent: "#334155", font: "'Georgia', 'Times New Roman', serif", variant: "classic", markets: "cif" },
  { id: "craft",    name: "Craft",    tag: "Balanced designer resume with structured sidebar", accent: "#9333ea", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "elegant", markets: "fm" },
  { id: "mono",     name: "Mono",     tag: "Monospace technical layout for engineering", accent: "#16a34a", font: "'Courier New', 'Courier', monospace", variant: "tech", markets: "ci" },
  { id: "aurora",   name: "Aurora",   tag: "Vibrant gradient header for modern teams", accent: "#7c3aed", font: "'Inter', system-ui, sans-serif", variant: "prism", markets: "fmg" },
  { id: "canvas",   name: "Canvas",   tag: "Spacious editorial layout with subtle detail", accent: "#475569", font: "'Georgia', 'Times New Roman', serif", variant: "stone", markets: "cifm" },
  { id: "keystone", name: "Keystone", tag: "Formal CV structure for academic profiles", accent: "#1d4ed8", font: "'Georgia', 'Times New Roman', serif", variant: "academy", markets: "cif" },
  { id: "blueprint", name: "Blueprint", tag: "Structured right-sidebar layout for builders", accent: "#0891b2", font: "'Inter', system-ui, sans-serif", variant: "vertex", markets: "mg" },
  { id: "delta",    name: "Delta",    tag: "Sharp corporate layout with minimal color", accent: "#111827", font: "'Inter', system-ui, sans-serif", variant: "sharp", markets: "cif" },
  { id: "terra",    name: "Terra",    tag: "Calm serif layout with grounded spacing", accent: "#166534", font: "'Georgia', 'Times New Roman', serif", variant: "nordic", markets: "cif" },
  { id: "metro",    name: "Metro",    tag: "Compact city-style layout for fast scanning", accent: "#0369a1", font: "'Inter', system-ui, sans-serif", variant: "compact", markets: "cim" },
  { id: "verve",    name: "Verve",    tag: "Energetic bands for sales and marketing", accent: "#f97316", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "spark", markets: "fmg" },
  { id: "consultant", name: "Consultant", tag: "Polished one-column format for client work", accent: "#1f2937", font: "'Inter', system-ui, sans-serif", variant: "minimal", markets: "cif" },
  { id: "founder",  name: "Founder",  tag: "Bold leadership resume for operators", accent: "#4338ca", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "bold", markets: "fmg" },
  { id: "graduate", name: "Graduate", tag: "Clean academic-friendly layout for early careers", accent: "#2563eb", font: "'Inter', system-ui, sans-serif", variant: "academy", markets: "cifm" },
  { id: "clinical", name: "Clinical", tag: "Clear healthcare layout with standard headings", accent: "#0f766e", font: "'Inter', system-ui, sans-serif", variant: "classic", markets: "cif" },
  { id: "toronto", name: "Toronto", tag: "Canadian ATS single-column, achievement-first", accent: "#1d4ed8", font: "'Inter', system-ui, sans-serif", variant: "minimal", markets: "ci", filters: ["ats", "one", "modern", "recommended"],
    gallery: {
      en: { description: "Clean single-column Canadian resume with bold headers, whitespace, and achievement-led bullets.", bestFor: "Best for Canadian private-sector, public-sector, and professional applications where no photo is expected.", attributes: ["Canada", "No photo", "ATS-safe"], layout: "One-column" },
      fr: { description: "CV canadien en une colonne, avec titres nets, espace généreux et réalisations mesurables.", bestFor: "Idéal pour les candidatures canadiennes privées, publiques et professionnelles sans photo.", attributes: ["Canada", "Sans photo", "Compatible ATS"], layout: "Une colonne" },
      ar: { description: "سيرة ذاتية كندية بعمود واحد، عناوين واضحة، ومساحة مريحة للإنجازات القابلة للقياس.", bestFor: "مناسبة للتقديم في كندا حيث لا تُستخدم الصورة عادة.", attributes: ["كندا", "بدون صورة", "مناسبة للـ ATS"], layout: "عمود واحد" },
    } },
  { id: "montreal", name: "Montréal", tag: "French-friendly Canadian layout with subtle two-tone hierarchy", accent: "#0f766e", font: "'Georgia', 'Times New Roman', serif", variant: "stone", markets: "cf", filters: ["ats", "one", "traditional"],
    gallery: {
      en: { description: "Elegant Canadian layout with bilingual-friendly spacing and a restrained two-tone accent.", bestFor: "Best for Montréal, Québec, education, finance, and French-English applications.", attributes: ["Canada", "No photo", "FR/EN"], layout: "One-column" },
      fr: { description: "Mise en page canadienne élégante, adaptée au français et à l'anglais avec accent discret.", bestFor: "Idéal pour Montréal, le Québec, l'éducation, la finance et les candidatures bilingues.", attributes: ["Canada", "Sans photo", "FR/EN"], layout: "Une colonne" },
      ar: { description: "تصميم كندي أنيق يدعم السير ثنائية اللغة مع تباين لوني هادئ.", bestFor: "مناسب لمونتريال وكيبيك والطلبات الفرنسية/الإنجليزية.", attributes: ["كندا", "بدون صورة", "فرنسي/إنجليزي"], layout: "عمود واحد" },
    } },
  { id: "vancouver", name: "Vancouver", tag: "Canadian modern skills sidebar, ATS-readable DOM order", accent: "#0284c7", font: "'Inter', system-ui, sans-serif", variant: "compact", markets: "ci", filters: ["ats", "two", "modern"],
    gallery: {
      en: { description: "Modern Canadian resume with a parseable skills sidebar and clear accomplishment rhythm.", bestFor: "Best for Canadian tech, operations, product, and startup roles that need fast scanning.", attributes: ["Canada", "No photo", "Skills sidebar"], layout: "Two-column" },
      fr: { description: "CV canadien moderne avec barre de compétences lisible par ATS et réalisations bien structurées.", bestFor: "Idéal pour la tech, les opérations, le produit et les startups au Canada.", attributes: ["Canada", "Sans photo", "Compétences"], layout: "Deux colonnes" },
      ar: { description: "تصميم كندي حديث مع عمود مهارات قابل للقراءة آلياً وتسلسل واضح للإنجازات.", bestFor: "مناسب لأدوار التقنية والعمليات والمنتج في كندا.", attributes: ["كندا", "بدون صورة", "المهارات"], layout: "عمودان" },
    } },
  { id: "maple", name: "Maple", tag: "Conservative Canadian serif for government and corporate roles", accent: "#334155", font: "'Georgia', 'Times New Roman', serif", variant: "classic", markets: "cif", filters: ["ats", "one", "traditional"],
    gallery: {
      en: { description: "Classic Canadian resume with serif typography, calm spacing, and a formal hiring tone.", bestFor: "Best for Canadian government, corporate, finance, legal, and regulated industries.", attributes: ["Canada", "No photo", "Conservative"], layout: "One-column" },
      fr: { description: "CV canadien classique avec typographie serif, espacement sobre et ton professionnel.", bestFor: "Idéal pour le secteur public canadien, la finance, le juridique et les industries réglementées.", attributes: ["Canada", "Sans photo", "Classique"], layout: "Une colonne" },
      ar: { description: "سيرة كندية كلاسيكية بخط رسمي ومسافات هادئة لمظهر مهني محافظ.", bestFor: "مناسبة للقطاع الحكومي والشركات والتمويل والقانون في كندا.", attributes: ["كندا", "بدون صورة", "رسمي"], layout: "عمود واحد" },
    } },
  { id: "global", name: "Global", tag: "Ultra-clean international ATS layout with zero decoration", accent: "#111827", font: "'Inter', system-ui, sans-serif", variant: "minimal", markets: "ci", filters: ["ats", "one", "traditional"],
    gallery: {
      en: { description: "Ultra-clean international format with standard headings, no decoration, and maximum parseability.", bestFor: "Best for ATS portals, multinational employers, and applications where conventions are unknown.", attributes: ["International", "No photo", "ATS-first"], layout: "One-column" },
      fr: { description: "Format international très sobre, titres standards, sans décoration et facile à analyser.", bestFor: "Idéal pour ATS, multinationales et candidatures où les conventions ne sont pas claires.", attributes: ["International", "Sans photo", "ATS"], layout: "Une colonne" },
      ar: { description: "تنسيق دولي شديد الوضوح بعناوين قياسية ومن دون زخرفة لسهولة القراءة الآلية.", bestFor: "مناسب لأنظمة ATS والشركات متعددة الجنسيات.", attributes: ["دولي", "بدون صورة", "ATS أولاً"], layout: "عمود واحد" },
    } },
  { id: "meridian", name: "Meridian", tag: "International single-column with thin rule separators", accent: "#475569", font: "'Inter', system-ui, sans-serif", variant: "sharp", markets: "ci", filters: ["ats", "one", "traditional"],
    gallery: {
      en: { description: "Precise international layout with thin separators and a disciplined one-page rhythm.", bestFor: "Best for consultants, analysts, operations, and global corporate applications.", attributes: ["International", "No photo", "Rules"], layout: "One-column" },
      fr: { description: "Mise en page internationale précise avec séparateurs fins et rythme compact.", bestFor: "Idéal pour conseil, analyse, opérations et candidatures corporate internationales.", attributes: ["International", "Sans photo", "Règles fines"], layout: "Une colonne" },
      ar: { description: "تصميم دولي دقيق بفواصل رفيعة وإيقاع منظم مناسب لصفحة واحدة.", bestFor: "مناسب للاستشارات والتحليل والعمليات والشركات الدولية.", attributes: ["دولي", "بدون صورة", "فواصل"], layout: "عمود واحد" },
    } },
  { id: "atlas-pro", name: "Atlas Pro", tag: "Decluttered executive layout for ATS-first international resumes", accent: "#1d4ed8", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "executive", markets: "ci", filters: ["ats", "two", "traditional"],
    gallery: {
      en: { description: "A cleaner Atlas variant with stronger hierarchy and less visual noise for international parsing.", bestFor: "Best for senior professionals who need polish without sacrificing ATS readability.", attributes: ["International", "No photo", "Executive"], layout: "Two-column" },
      fr: { description: "Variante Atlas plus épurée, avec hiérarchie forte et moins d'éléments visuels.", bestFor: "Idéal pour profils seniors qui veulent rester élégants et lisibles par ATS.", attributes: ["International", "Sans photo", "Executive"], layout: "Deux colonnes" },
      ar: { description: "نسخة أطلس أكثر بساطة بهيكل أوضح وتفاصيل أقل لتحسين القراءة الآلية.", bestFor: "مناسبة للمديرين والخبراء مع الحفاظ على قابلية ATS.", attributes: ["دولي", "بدون صورة", "تنفيذي"], layout: "عمودان" },
    } },
  { id: "passport", name: "Passport", tag: "Compact international one-page format", accent: "#0f766e", font: "'Inter', system-ui, sans-serif", variant: "compact", markets: "ci", filters: ["ats", "compact", "two"],
    gallery: {
      en: { description: "Compact international resume built to keep experience, education, and skills on one page.", bestFor: "Best for relocation, remote roles, early careers, and concise international applications.", attributes: ["International", "No photo", "Compact"], layout: "Two-column" },
      fr: { description: "CV international compact pour garder expérience, formation et compétences sur une page.", bestFor: "Idéal pour mobilité internationale, remote, débuts de carrière et candidatures courtes.", attributes: ["International", "Sans photo", "Compact"], layout: "Deux colonnes" },
      ar: { description: "سيرة دولية مدمجة تجمع الخبرة والتعليم والمهارات في صفحة واحدة.", bestFor: "مناسبة للتنقل والعمل عن بُعد وبدايات المسار المهني.", attributes: ["دولي", "بدون صورة", "مختصر"], layout: "عمودان" },
    } },
  { id: "casablanca", name: "Casablanca", tag: "Modern Morocco-ready layout with optional photo and FR/AR support", accent: "#0f766e", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "modern", markets: "mfg", filters: ["two", "modern", "rtl"],
    gallery: {
      en: { description: "Modern Moroccan CV with optional photo, strong contact header, and French/Arabic-ready sections.", bestFor: "Best for Morocco, French-speaking private sector roles, and bilingual profiles.", attributes: ["Morocco", "Photo optional", "FR/AR"], layout: "Two-column" },
      fr: { description: "CV marocain moderne avec photo optionnelle, en-tête clair et sections prêtes FR/AR.", bestFor: "Idéal pour le Maroc, le secteur privé francophone et les profils bilingues.", attributes: ["Maroc", "Photo optionnelle", "FR/AR"], layout: "Deux colonnes" },
      ar: { description: "تصميم مغربي حديث مع صورة اختيارية وترويسة واضحة ودعم فرنسي/عربي.", bestFor: "مناسب للمغرب والقطاع الخاص والملفات ثنائية اللغة.", attributes: ["المغرب", "صورة اختيارية", "فرنسي/عربي"], layout: "عمودان" },
    } },
  { id: "paris", name: "Paris", tag: "Classic French chronological CV with refined spacing", accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif", variant: "elegant", markets: "fm", filters: ["one", "traditional"],
    gallery: {
      en: { description: "Classic French chronological CV with refined typography and optional photo behavior.", bestFor: "Best for France, francophone employers, education, culture, and formal applications.", attributes: ["France", "Photo optional", "Chronological"], layout: "One-column" },
      fr: { description: "CV français chronologique classique, avec typographie raffinée et présentation soignée.", bestFor: "Idéal pour la France, les employeurs francophones, l'éducation, la culture et les candidatures formelles.", attributes: ["France", "Photo optionnelle", "Chronologique"], layout: "Une colonne" },
      ar: { description: "سيرة فرنسية كلاسيكية بتسلسل زمني وخط أنيق وعرض رسمي.", bestFor: "مناسبة لفرنسا وأصحاب العمل الفرنكوفونيين والقطاعات الرسمية.", attributes: ["فرنسا", "صورة اختيارية", "زمني"], layout: "عمود واحد" },
    } },
  { id: "medina", name: "Médina", tag: "Bilingual FR/AR layout with strong RTL support", accent: "#0891b2", font: "'Inter', system-ui, sans-serif", variant: "vertex", markets: "mfg", filters: ["two", "modern", "rtl"],
    gallery: {
      en: { description: "Bilingual-friendly Moroccan and French layout with strong RTL mirroring for Arabic resumes.", bestFor: "Best for Morocco, Gulf-facing profiles, and candidates switching between French and Arabic.", attributes: ["Morocco", "RTL-ready", "Photo optional"], layout: "Two-column" },
      fr: { description: "Mise en page Maroc/France bilingue, avec miroir RTL solide pour les versions arabes.", bestFor: "Idéal pour le Maroc, les candidatures vers le Golfe et les profils FR/AR.", attributes: ["Maroc", "RTL", "Photo optionnelle"], layout: "Deux colonnes" },
      ar: { description: "تصميم مغربي/فرنسي ثنائي اللغة مع دعم قوي للاتجاه من اليمين إلى اليسار.", bestFor: "مناسب للمغرب والخليج والملفات التي تنتقل بين الفرنسية والعربية.", attributes: ["المغرب", "RTL", "صورة اختيارية"], layout: "عمودان" },
    } },
  { id: "dubai", name: "Dubaï", tag: "Contemporary Gulf corporate layout with optional photo", accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif", variant: "slate", markets: "mg", filters: ["two", "modern", "rtl"],
    gallery: {
      en: { description: "Contemporary Gulf corporate resume with optional photo, premium sidebar, and Arabic support.", bestFor: "Best for UAE, Saudi, Qatar, corporate, hospitality, aviation, and client-facing roles.", attributes: ["Gulf", "Photo optional", "RTL-ready"], layout: "Two-column" },
      fr: { description: "CV corporate pour le Golfe avec photo optionnelle, sidebar premium et support arabe.", bestFor: "Idéal pour EAU, Arabie saoudite, Qatar, hôtellerie, aviation et postes client.", attributes: ["Golfe", "Photo optionnelle", "RTL"], layout: "Deux colonnes" },
      ar: { description: "سيرة خليجية عصرية للشركات مع صورة اختيارية وعمود جانبي أنيق ودعم عربي.", bestFor: "مناسبة للإمارات والسعودية وقطر والضيافة والطيران والأدوار أمام العملاء.", attributes: ["الخليج", "صورة اختيارية", "RTL"], layout: "عمودان" },
    } },
  { id: "riyad", name: "Riyad", tag: "Formal Gulf layout with traditional hierarchy and optional photo", accent: "#92400e", font: "'Georgia', 'Times New Roman', serif", variant: "modern", markets: "mg", filters: ["two", "traditional", "rtl"],
    gallery: {
      en: { description: "Formal Gulf resume with traditional hierarchy, optional photo, and measured serif typography.", bestFor: "Best for Saudi and Gulf corporate, government-adjacent, finance, and formal roles.", attributes: ["Gulf", "Photo optional", "Formal"], layout: "Two-column" },
      fr: { description: "CV formel pour le Golfe avec hiérarchie traditionnelle, photo optionnelle et serif sobre.", bestFor: "Idéal pour Arabie saoudite, Golfe, finance, groupes formels et secteurs institutionnels.", attributes: ["Golfe", "Photo optionnelle", "Formel"], layout: "Deux colonnes" },
      ar: { description: "سيرة خليجية رسمية بهيكل تقليدي وصورة اختيارية وخط محافظ.", bestFor: "مناسبة للسعودية والخليج والتمويل والأدوار الرسمية.", attributes: ["الخليج", "صورة اختيارية", "رسمي"], layout: "عمودان" },
    } },
  { id: "khaleej", name: "Khaleej", tag: "Modern bilingual Gulf layout for Arabic and English", accent: "#06b6d4", font: "'Inter', system-ui, sans-serif", variant: "vertex", markets: "mg", filters: ["two", "modern", "rtl"],
    gallery: {
      en: { description: "Modern bilingual Gulf resume with strong RTL behavior and a structured profile sidebar.", bestFor: "Best for Arabic/English Gulf applications, technology, operations, and regional mobility.", attributes: ["Gulf", "Photo optional", "AR/EN"], layout: "Two-column" },
      fr: { description: "CV bilingue moderne pour le Golfe, avec RTL robuste et sidebar structurée.", bestFor: "Idéal pour candidatures arabe/anglais dans le Golfe, tech, opérations et mobilité régionale.", attributes: ["Golfe", "Photo optionnelle", "AR/EN"], layout: "Deux colonnes" },
      ar: { description: "سيرة خليجية حديثة ثنائية اللغة مع دعم RTL قوي وعمود معلومات منظم.", bestFor: "مناسبة للتقديم العربي/الإنجليزي في الخليج والتقنية والعمليات.", attributes: ["الخليج", "صورة اختيارية", "عربي/إنجليزي"], layout: "عمودان" },
    } },
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
export const ACTUAL_RESUME_TEMPLATE_COUNT = TEMPLATES.filter((template) => !template.blank).length;
export const RESUME_TEMPLATE_COUNT = 46;
export const COVER_TEMPLATE_COUNT = COVER_TEMPLATES.length;

export function getResumeTemplateById(id, fallback = "modern") {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES.find((template) => template.id === fallback) || TEMPLATES.find((template) => !template.blank) || TEMPLATES[0];
}

export function getCoverTemplateById(id, fallback = "modern") {
  return COVER_TEMPLATES.find((template) => template.id === id) || COVER_TEMPLATES.find((template) => template.id === fallback) || COVER_TEMPLATES.find((template) => !template.blank) || COVER_TEMPLATES[0];
}
