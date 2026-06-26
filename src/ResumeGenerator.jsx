import React, { useState, useEffect, useRef } from "react";

// ── UI translation codes (languages with full UI translation) ──────
const UI_LANGS = new Set(["en", "fr", "es", "ar", "de"]);

// ── All world languages for the picker ────────────────────────────
const WORLD_LANGUAGES = [
  { code: "af", name: "Afrikaans",         flag: "🇿🇦", native: "Afrikaans" },
  { code: "sq", name: "Albanian",          flag: "🇦🇱", native: "Shqip" },
  { code: "am", name: "Amharic",           flag: "🇪🇹", native: "አማርኛ" },
  { code: "ar", name: "Arabic",            flag: "🇸🇦", native: "العربية", rtl: true },
  { code: "hy", name: "Armenian",          flag: "🇦🇲", native: "Հայերեն" },
  { code: "az", name: "Azerbaijani",       flag: "🇦🇿", native: "Azərbaycanca" },
  { code: "eu", name: "Basque",            flag: "🇪🇸", native: "Euskara" },
  { code: "be", name: "Belarusian",        flag: "🇧🇾", native: "Беларуская" },
  { code: "bn", name: "Bengali",           flag: "🇧🇩", native: "বাংলা" },
  { code: "bs", name: "Bosnian",           flag: "🇧🇦", native: "Bosanski" },
  { code: "bg", name: "Bulgarian",         flag: "🇧🇬", native: "Български" },
  { code: "ca", name: "Catalan",           flag: "🇪🇸", native: "Català" },
  { code: "zh", name: "Chinese",           flag: "🇨🇳", native: "中文" },
  { code: "hr", name: "Croatian",          flag: "🇭🇷", native: "Hrvatski" },
  { code: "cs", name: "Czech",             flag: "🇨🇿", native: "Čeština" },
  { code: "da", name: "Danish",            flag: "🇩🇰", native: "Dansk" },
  { code: "nl", name: "Dutch",             flag: "🇳🇱", native: "Nederlands" },
  { code: "en", name: "English",           flag: "🇬🇧", native: "English" },
  { code: "et", name: "Estonian",          flag: "🇪🇪", native: "Eesti" },
  { code: "tl", name: "Filipino",          flag: "🇵🇭", native: "Filipino" },
  { code: "fi", name: "Finnish",           flag: "🇫🇮", native: "Suomi" },
  { code: "fr", name: "French",            flag: "🇫🇷", native: "Français" },
  { code: "gl", name: "Galician",          flag: "🇪🇸", native: "Galego" },
  { code: "ka", name: "Georgian",          flag: "🇬🇪", native: "ქართული" },
  { code: "de", name: "German",            flag: "🇩🇪", native: "Deutsch" },
  { code: "el", name: "Greek",             flag: "🇬🇷", native: "Ελληνικά" },
  { code: "gu", name: "Gujarati",          flag: "🇮🇳", native: "ગુજરાતી" },
  { code: "ht", name: "Haitian Creole",    flag: "🇭🇹", native: "Kreyòl ayisyen" },
  { code: "ha", name: "Hausa",             flag: "🇳🇬", native: "Hausa" },
  { code: "he", name: "Hebrew",            flag: "🇮🇱", native: "עברית", rtl: true },
  { code: "hi", name: "Hindi",             flag: "🇮🇳", native: "हिंदी" },
  { code: "hu", name: "Hungarian",         flag: "🇭🇺", native: "Magyar" },
  { code: "is", name: "Icelandic",         flag: "🇮🇸", native: "Íslenska" },
  { code: "ig", name: "Igbo",              flag: "🇳🇬", native: "Igbo" },
  { code: "id", name: "Indonesian",        flag: "🇮🇩", native: "Bahasa Indonesia" },
  { code: "ga", name: "Irish",             flag: "🇮🇪", native: "Gaeilge" },
  { code: "it", name: "Italian",           flag: "🇮🇹", native: "Italiano" },
  { code: "ja", name: "Japanese",          flag: "🇯🇵", native: "日本語" },
  { code: "jv", name: "Javanese",          flag: "🇮🇩", native: "Basa Jawa" },
  { code: "kn", name: "Kannada",           flag: "🇮🇳", native: "ಕನ್ನಡ" },
  { code: "kk", name: "Kazakh",            flag: "🇰🇿", native: "Қазақша" },
  { code: "km", name: "Khmer",             flag: "🇰🇭", native: "ខ្មែរ" },
  { code: "rw", name: "Kinyarwanda",       flag: "🇷🇼", native: "Ikinyarwanda" },
  { code: "ko", name: "Korean",            flag: "🇰🇷", native: "한국어" },
  { code: "ku", name: "Kurdish",           flag: "🇮🇶", native: "Kurdî" },
  { code: "ky", name: "Kyrgyz",            flag: "🇰🇬", native: "Кыргызча" },
  { code: "lo", name: "Lao",               flag: "🇱🇦", native: "ລາວ" },
  { code: "lv", name: "Latvian",           flag: "🇱🇻", native: "Latviešu" },
  { code: "lt", name: "Lithuanian",        flag: "🇱🇹", native: "Lietuvių" },
  { code: "lb", name: "Luxembourgish",     flag: "🇱🇺", native: "Lëtzebuergesch" },
  { code: "mk", name: "Macedonian",        flag: "🇲🇰", native: "Македонски" },
  { code: "mg", name: "Malagasy",          flag: "🇲🇬", native: "Malagasy" },
  { code: "ms", name: "Malay",             flag: "🇲🇾", native: "Bahasa Melayu" },
  { code: "ml", name: "Malayalam",         flag: "🇮🇳", native: "മലയാളം" },
  { code: "mt", name: "Maltese",           flag: "🇲🇹", native: "Malti" },
  { code: "mi", name: "Maori",             flag: "🇳🇿", native: "Māori" },
  { code: "mr", name: "Marathi",           flag: "🇮🇳", native: "मराठी" },
  { code: "mn", name: "Mongolian",         flag: "🇲🇳", native: "Монгол" },
  { code: "my", name: "Myanmar (Burmese)", flag: "🇲🇲", native: "မြန်မာဘာသာ" },
  { code: "ne", name: "Nepali",            flag: "🇳🇵", native: "नेपाली" },
  { code: "no", name: "Norwegian",         flag: "🇳🇴", native: "Norsk" },
  { code: "ny", name: "Nyanja (Chichewa)", flag: "🇲🇼", native: "Nyanja" },
  { code: "or", name: "Odia",              flag: "🇮🇳", native: "ଓଡ଼ିଆ" },
  { code: "ps", name: "Pashto",            flag: "🇦🇫", native: "پښتو", rtl: true },
  { code: "fa", name: "Persian",           flag: "🇮🇷", native: "فارسی", rtl: true },
  { code: "pl", name: "Polish",            flag: "🇵🇱", native: "Polski" },
  { code: "pt", name: "Portuguese",        flag: "🇵🇹", native: "Português" },
  { code: "pa", name: "Punjabi",           flag: "🇮🇳", native: "ਪੰਜਾਬੀ" },
  { code: "ro", name: "Romanian",          flag: "🇷🇴", native: "Română" },
  { code: "ru", name: "Russian",           flag: "🇷🇺", native: "Русский" },
  { code: "sm", name: "Samoan",            flag: "🇼🇸", native: "Samoa" },
  { code: "sr", name: "Serbian",           flag: "🇷🇸", native: "Српски" },
  { code: "sn", name: "Shona",             flag: "🇿🇼", native: "chiShona" },
  { code: "sd", name: "Sindhi",            flag: "🇵🇰", native: "سنڌي", rtl: true },
  { code: "si", name: "Sinhala",           flag: "🇱🇰", native: "සිංහල" },
  { code: "sk", name: "Slovak",            flag: "🇸🇰", native: "Slovenčina" },
  { code: "sl", name: "Slovenian",         flag: "🇸🇮", native: "Slovenščina" },
  { code: "so", name: "Somali",            flag: "🇸🇴", native: "Soomaali" },
  { code: "st", name: "Sotho",             flag: "🇿🇦", native: "Sesotho" },
  { code: "es", name: "Spanish",           flag: "🇪🇸", native: "Español" },
  { code: "su", name: "Sundanese",         flag: "🇮🇩", native: "Basa Sunda" },
  { code: "sw", name: "Swahili",           flag: "🇰🇪", native: "Kiswahili" },
  { code: "sv", name: "Swedish",           flag: "🇸🇪", native: "Svenska" },
  { code: "tg", name: "Tajik",             flag: "🇹🇯", native: "Тоҷикӣ" },
  { code: "ta", name: "Tamil",             flag: "🇮🇳", native: "தமிழ்" },
  { code: "tt", name: "Tatar",             flag: "🇷🇺", native: "Татарча" },
  { code: "te", name: "Telugu",            flag: "🇮🇳", native: "తెలుగు" },
  { code: "th", name: "Thai",              flag: "🇹🇭", native: "ภาษาไทย" },
  { code: "tr", name: "Turkish",           flag: "🇹🇷", native: "Türkçe" },
  { code: "tk", name: "Turkmen",           flag: "🇹🇲", native: "Türkmençe" },
  { code: "uk", name: "Ukrainian",         flag: "🇺🇦", native: "Українська" },
  { code: "ur", name: "Urdu",              flag: "🇵🇰", native: "اردو", rtl: true },
  { code: "uz", name: "Uzbek",             flag: "🇺🇿", native: "O'zbek" },
  { code: "vi", name: "Vietnamese",        flag: "🇻🇳", native: "Tiếng Việt" },
  { code: "cy", name: "Welsh",             flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", native: "Cymraeg" },
  { code: "xh", name: "Xhosa",             flag: "🇿🇦", native: "isiXhosa" },
  { code: "yi", name: "Yiddish",           flag: "🇮🇱", native: "ייִדיש", rtl: true },
  { code: "yo", name: "Yoruba",            flag: "🇳🇬", native: "Yorùbá" },
  { code: "zu", name: "Zulu",              flag: "🇿🇦", native: "isiZulu" },
];

const UI = {
  en: { name: "Full name", title: "Professional title", email: "Email", phone: "Phone",
    location: "Location", summary: "About you", experience: "Experience", education: "Education",
    skills: "Skills (comma separated)", generate: "Generate resume", generating: "Generating…",
    heading: "Resume generator", sub: "Choose a language and template, add your details, get a polished resume.",
    copy: "Copy", copied: "Copied", chooseTpl: "Choose a template", back: "Back",
    dlPdf: "Download PDF", dlDocx: "Download DOCX",
    linkedin: "LinkedIn", website: "Website / Portfolio",
    certifications: "Certifications", languages: "Languages (comma separated)",
    projects: "Projects", volunteer: "Volunteer Work", awards: "Awards & Achievements",
    placeholderEx: "Role, company, dates, what you did — one per line", madeBy: "Built by",
    placeholderName: "e.g. Jane Doe", placeholderTitle: "e.g. Software Engineer",
    placeholderEmail: "you@example.com", placeholderPhone: "e.g. 712 345 678",
    placeholderLocation: "e.g. London, UK",
    placeholderSummary: "A short paragraph about your background and goals…",
    placeholderEducation: "Degree, institution, year — one per line",
    placeholderSkills: "JavaScript, React, Node.js, …",
    placeholderLinkedin: "https://linkedin.com/in/yourname",
    placeholderWebsite: "https://yourportfolio.com",
    placeholderCerts: "AWS Certified Developer, 2024 — one per line",
    placeholderLanguages: "English (Fluent), French (Intermediate)",
    placeholderProjects: "Project name — tech used — what it achieved, one per line",
    placeholderVolunteer: "Role, organisation, dates — one per line",
    placeholderAwards: "Award name, issuer, year — one per line",
    emailError: "Please enter a valid email address",
    phoneError: "Invalid number", phoneDigits: "digits required" },
  fr: { name: "Nom complet", title: "Titre professionnel", email: "E-mail", phone: "Téléphone",
    location: "Localisation", summary: "À propos de vous", experience: "Expérience", education: "Formation",
    skills: "Compétences (séparées par des virgules)", generate: "Générer le CV", generating: "Génération…",
    heading: "Générateur de CV", sub: "Choisissez une langue et un modèle, ajoutez vos infos, obtenez un CV soigné.",
    copy: "Copier", copied: "Copié", chooseTpl: "Choisissez un modèle", back: "Retour",
    dlPdf: "Télécharger PDF", dlDocx: "Télécharger DOCX",
    linkedin: "LinkedIn", website: "Site web / Portfolio",
    certifications: "Certifications", languages: "Langues (séparées par des virgules)",
    projects: "Projets", volunteer: "Bénévolat", awards: "Récompenses & Réalisations",
    placeholderEx: "Poste, entreprise, dates, missions — une par ligne", madeBy: "Créé par",
    placeholderName: "ex. Jean Dupont", placeholderTitle: "ex. Ingénieur logiciel",
    placeholderEmail: "vous@exemple.com", placeholderPhone: "ex. 06 12 34 56 78",
    placeholderLocation: "ex. Paris, France",
    placeholderSummary: "Un court paragraphe sur votre parcours et vos objectifs…",
    placeholderEducation: "Diplôme, établissement, année — un par ligne",
    placeholderSkills: "JavaScript, React, Node.js, …",
    placeholderLinkedin: "https://linkedin.com/in/votrenom",
    placeholderWebsite: "https://votresite.com",
    placeholderCerts: "Certification AWS, 2024 — une par ligne",
    placeholderLanguages: "Français (Natif), Anglais (Courant)",
    placeholderProjects: "Nom du projet — technologies — résultat, une par ligne",
    placeholderVolunteer: "Rôle, organisation, dates — une par ligne",
    placeholderAwards: "Nom du prix, organisme, année — une par ligne",
    emailError: "Veuillez saisir une adresse e-mail valide",
    phoneError: "Numéro invalide", phoneDigits: "chiffres requis" },
  es: { name: "Nombre completo", title: "Título profesional", email: "Correo", phone: "Teléfono",
    location: "Ubicación", summary: "Sobre ti", experience: "Experiencia", education: "Educación",
    skills: "Habilidades (separadas por comas)", generate: "Generar currículum", generating: "Generando…",
    heading: "Generador de currículums", sub: "Elige idioma y plantilla, añade tus datos y obtén un currículum pulido.",
    copy: "Copiar", copied: "Copiado", chooseTpl: "Elige una plantilla", back: "Volver",
    dlPdf: "Descargar PDF", dlDocx: "Descargar DOCX",
    linkedin: "LinkedIn", website: "Sitio web / Portafolio",
    certifications: "Certificaciones", languages: "Idiomas (separados por comas)",
    projects: "Proyectos", volunteer: "Voluntariado", awards: "Premios & Logros",
    placeholderEx: "Puesto, empresa, fechas, qué hiciste — uno por línea", madeBy: "Creado por",
    placeholderName: "ej. Juan García", placeholderTitle: "ej. Ingeniero de software",
    placeholderEmail: "tu@ejemplo.com", placeholderPhone: "ej. 612 345 678",
    placeholderLocation: "ej. Madrid, España",
    placeholderSummary: "Un breve párrafo sobre tu trayectoria y objetivos…",
    placeholderEducation: "Título, institución, año — uno por línea",
    placeholderSkills: "JavaScript, React, Node.js, …",
    placeholderLinkedin: "https://linkedin.com/in/tunombre",
    placeholderWebsite: "https://tuportafolio.com",
    placeholderCerts: "AWS Certified Developer, 2024 — uno por línea",
    placeholderLanguages: "Español (Nativo), Inglés (Avanzado)",
    placeholderProjects: "Nombre del proyecto — tecnologías — logro, uno por línea",
    placeholderVolunteer: "Rol, organización, fechas — uno por línea",
    placeholderAwards: "Premio, organización, año — uno por línea",
    emailError: "Introduce un correo electrónico válido",
    phoneError: "Número inválido", phoneDigits: "dígitos requeridos" },
  ar: { name: "الاسم الكامل", title: "المسمى الوظيفي", email: "البريد", phone: "الهاتف",
    location: "الموقع", summary: "نبذة عنك", experience: "الخبرة", education: "التعليم",
    skills: "المهارات (مفصولة بفواصل)", generate: "إنشاء السيرة الذاتية", generating: "جارٍ الإنشاء…",
    heading: "منشئ السيرة الذاتية", sub: "اختر لغة وقالباً، أضف بياناتك، واحصل على سيرة ذاتية متقنة.",
    copy: "نسخ", copied: "تم النسخ", chooseTpl: "اختر قالباً", back: "رجوع",
    dlPdf: "تحميل PDF", dlDocx: "تحميل DOCX",
    linkedin: "لينكدإن", website: "الموقع / المحفظة",
    certifications: "الشهادات", languages: "اللغات (مفصولة بفواصل)",
    projects: "المشاريع", volunteer: "العمل التطوعي", awards: "الجوائز والإنجازات",
    placeholderEx: "المنصب، الشركة، التواريخ، مهامك — واحدة في كل سطر", madeBy: "من إبداع",
    placeholderName: "مثال: أحمد محمد", placeholderTitle: "مثال: مهندس برمجيات",
    placeholderEmail: "you@example.com", placeholderPhone: "مثال: 06 12 34 56 78",
    placeholderLocation: "مثال: الرياض، السعودية",
    placeholderSummary: "فقرة قصيرة عن خلفيتك وأهدافك المهنية…",
    placeholderEducation: "الدرجة العلمية، المؤسسة، السنة — سطر لكل إدخال",
    placeholderSkills: "جافاسكريبت، رياكت، نود.جي إس، …",
    placeholderLinkedin: "https://linkedin.com/in/اسمك",
    placeholderWebsite: "https://موقعك.com",
    placeholderCerts: "شهادة AWS، 2024 — سطر لكل شهادة",
    placeholderLanguages: "العربية (الأم)، الإنجليزية (متقدم)",
    placeholderProjects: "اسم المشروع — التقنيات — النتيجة، سطر لكل مشروع",
    placeholderVolunteer: "الدور، المنظمة، التواريخ — سطر لكل إدخال",
    placeholderAwards: "اسم الجائزة، المانح، السنة — سطر لكل إدخال",
    emailError: "يرجى إدخال عنوان بريد إلكتروني صحيح",
    phoneError: "رقم غير صحيح", phoneDigits: "أرقام مطلوبة" },
  de: { name: "Vollständiger Name", title: "Berufsbezeichnung", email: "E-Mail", phone: "Telefon",
    location: "Standort", summary: "Über dich", experience: "Erfahrung", education: "Ausbildung",
    skills: "Fähigkeiten (durch Kommas getrennt)", generate: "Lebenslauf erstellen", generating: "Wird erstellt…",
    heading: "Lebenslauf-Generator", sub: "Sprache und Vorlage wählen, Daten eingeben, gepflegten Lebenslauf erhalten.",
    copy: "Kopieren", copied: "Kopiert", chooseTpl: "Vorlage wählen", back: "Zurück",
    dlPdf: "PDF herunterladen", dlDocx: "DOCX herunterladen",
    linkedin: "LinkedIn", website: "Website / Portfolio",
    certifications: "Zertifizierungen", languages: "Sprachen (durch Kommas getrennt)",
    projects: "Projekte", volunteer: "Ehrenamtliche Arbeit", awards: "Auszeichnungen & Leistungen",
    placeholderEx: "Position, Firma, Zeitraum, Aufgaben — eine pro Zeile", madeBy: "Erstellt von",
    placeholderName: "z.B. Hans Müller", placeholderTitle: "z.B. Softwareentwickler",
    placeholderEmail: "du@beispiel.de", placeholderPhone: "z.B. 170 1234567",
    placeholderLocation: "z.B. Berlin, Deutschland",
    placeholderSummary: "Ein kurzer Absatz über deinen Werdegang und deine Ziele…",
    placeholderEducation: "Abschluss, Einrichtung, Jahr — eine pro Zeile",
    placeholderSkills: "JavaScript, React, Node.js, …",
    placeholderLinkedin: "https://linkedin.com/in/deinname",
    placeholderWebsite: "https://deinewebsite.de",
    placeholderCerts: "AWS Certified Developer, 2024 — eine pro Zeile",
    placeholderLanguages: "Deutsch (Muttersprache), Englisch (Fließend)",
    placeholderProjects: "Projektname — Technologien — Ergebnis, eine pro Zeile",
    placeholderVolunteer: "Rolle, Organisation, Zeitraum — eine pro Zeile",
    placeholderAwards: "Auszeichnung, Aussteller, Jahr — eine pro Zeile",
    emailError: "Bitte eine gültige E-Mail-Adresse eingeben",
    phoneError: "Ungültige Nummer", phoneDigits: "Ziffern erforderlich" },
};

// ── Templates ─────────────────────────────────────────────────────
const TEMPLATES = [
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
];

// ── Sample data used in template thumbnail previews ───────────────
const SAMPLE_RESUME = {
  name: "Alexandra Johnson",
  title: "Senior Product Designer",
  contact: ["alex.johnson@email.com", "+1 (415) 555-0192", "San Francisco, CA", "linkedin.com/in/alexjohnson"],
  summary: "Creative product designer with 8+ years crafting intuitive digital experiences for SaaS and consumer apps. Passionate about human-centered design, design systems, and cross-functional collaboration. Proven track record of shipping products that delight users and drive measurable business results.",
  sections: [
    { heading: "Experience", items: [
      "Lead Product Designer — Stripe (2021–Present)",
      "Redesigned onboarding flow, reducing drop-off by 34% across 2M+ merchants",
      "Directed design of the Stripe Dashboard v3, increasing daily active usage by 28%",
      "Mentored a team of 5 junior designers and established quarterly design critiques",
      "Collaborated with PMs and engineers to build a reusable component library in Figma",
      "Senior UX Designer — Figma (2018–2021)",
      "Created the core design system adopted across 200+ engineers and 40 product squads",
      "Shipped 12 major features including multiplayer cursors and auto-layout",
      "Increased onboarding completion rate from 52% to 79% through iterative A/B testing",
      "UX Designer — Airbnb (2016–2018)",
      "Redesigned the host dashboard, cutting support tickets related to listings by 41%",
      "Led end-to-end research and design for the mobile booking confirmation flow",
    ]},
    { heading: "Education", items: [
      "B.S. Human-Computer Interaction — Stanford University, 2016",
      "Minor in Computer Science — GPA 3.9 / 4.0",
      "Dean's List — 6 consecutive semesters",
    ]},
    { heading: "Skills", items: [
      "Figma", "Prototyping", "User Research", "Usability Testing",
      "Design Systems", "Information Architecture", "React", "TypeScript", "CSS",
    ]},
    { heading: "Languages", items: ["English (native)", "French (professional)", "Spanish (conversational)"] },
    { heading: "Certifications", items: [
      "Google UX Design Professional Certificate — 2022",
      "AWS Certified Cloud Practitioner — 2023",
      "Nielsen Norman Group UX Certification — 2020",
    ]},
    { heading: "Projects", items: [
      "DesignMetrics.io — SaaS tool to track design KPIs, 1,200+ active users",
      "Open-source Figma plugin for accessibility auditing — 8,400 installs",
    ]},
  ],
};

// ── Cover letter templates ────────────────────────────────────────
const COVER_TEMPLATES = [
  { id: "blank",   name: "Blank",   tag: "Plain text, no styling",            accent: "#374151", font: "'Inter', system-ui, sans-serif", blank: true },
  { id: "classic", name: "Classic", tag: "Traditional block letter, serif",   accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif" },
  { id: "modern",  name: "Modern",  tag: "Left sidebar with your details",    accent: "#2563eb", font: "'Inter', system-ui, sans-serif" },
  { id: "minimal", name: "Minimal", tag: "Clean, precise, lots of whitespace",accent: "#0f766e", font: "'Inter', system-ui, sans-serif" },
  { id: "bold",    name: "Bold",    tag: "Full-bleed accent header",           accent: "#b91c1c", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "elegant", name: "Elegant", tag: "Soft sidebar, refined serif type",  accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif" },
];

const SAMPLE_COVER = {
  name: "Alexandra Johnson", jobTitle: "Senior Product Designer",
  email: "alex.johnson@email.com", phone: "+1 415 555 0192", location: "San Francisco, CA",
  date: "June 26, 2026",
  recipientName: "Mr. David Chen", recipientTitle: "Head of Design",
  company: "Stripe", companyAddress: "354 Oyster Point Blvd, South San Francisco, CA",
  subject: "Senior Product Designer Position",
  opening: "Mr. Chen",
  body: "I am writing to express my strong interest in the Senior Product Designer position at Stripe. With over eight years of experience crafting intuitive digital experiences for high-growth companies, I am confident in my ability to contribute meaningfully to your team.\n\nDuring my tenure at Figma, I led the redesign of the core editor interface, collaborating closely with engineering to ship 12 major features that improved user satisfaction by 40%.",
  closing: "I am excited about the opportunity to bring my passion for design systems and user-centred thinking to Stripe. Thank you for your time — I look forward to speaking with you.",
  signoff: "Sincerely",
};

// ── Author info (edit here to update the footer) ─────────────────
const AUTHOR = {
  name: "Isaac Biroue",
  email: "biroueisaac@gmail.com",
  github: "https://github.com/biroue10",
  linkedin: "", // paste your LinkedIn URL here, e.g. "https://linkedin.com/in/yourname"
};

const LANG_CODE = { en: "+1", fr: "+33", es: "+34", ar: "+212", de: "+49" };

// digits: [min, max] local digits the user types (with or without leading 0)
const COUNTRIES = [
  { flag: "🇩🇿", name: "Algeria",        code: "+213", digits: [9,  10] },
  { flag: "🇦🇷", name: "Argentina",      code: "+54",  digits: [10, 10] },
  { flag: "🇦🇺", name: "Australia",      code: "+61",  digits: [9,  10] },
  { flag: "🇦🇹", name: "Austria",        code: "+43",  digits: [7,  11] },
  { flag: "🇧🇪", name: "Belgium",        code: "+32",  digits: [9,   9] },
  { flag: "🇧🇷", name: "Brazil",         code: "+55",  digits: [10, 11] },
  { flag: "🇨🇲", name: "Cameroon",       code: "+237", digits: [9,   9] },
  { flag: "🇨🇦", name: "Canada",         code: "+1",   digits: [10, 10] },
  { flag: "🇨🇱", name: "Chile",          code: "+56",  digits: [9,   9] },
  { flag: "🇨🇳", name: "China",          code: "+86",  digits: [11, 11] },
  { flag: "🇨🇴", name: "Colombia",       code: "+57",  digits: [10, 10] },
  { flag: "🇨🇩", name: "Congo (DRC)",    code: "+243", digits: [9,  10] },
  { flag: "🇨🇮", name: "Côte d'Ivoire",  code: "+225", digits: [10, 10] },
  { flag: "🇩🇰", name: "Denmark",        code: "+45",  digits: [8,   8] },
  { flag: "🇪🇬", name: "Egypt",          code: "+20",  digits: [10, 11] },
  { flag: "🇫🇷", name: "France",         code: "+33",  digits: [9,  10] },
  { flag: "🇩🇪", name: "Germany",        code: "+49",  digits: [7,  11] },
  { flag: "🇬🇭", name: "Ghana",          code: "+233", digits: [9,  10] },
  { flag: "🇬🇷", name: "Greece",         code: "+30",  digits: [10, 10] },
  { flag: "🇮🇳", name: "India",          code: "+91",  digits: [10, 10] },
  { flag: "🇮🇩", name: "Indonesia",      code: "+62",  digits: [9,  12] },
  { flag: "🇮🇶", name: "Iraq",           code: "+964", digits: [10, 10] },
  { flag: "🇮🇪", name: "Ireland",        code: "+353", digits: [9,  10] },
  { flag: "🇮🇱", name: "Israel",         code: "+972", digits: [9,   9] },
  { flag: "🇮🇹", name: "Italy",          code: "+39",  digits: [9,  11] },
  { flag: "🇯🇵", name: "Japan",          code: "+81",  digits: [10, 11] },
  { flag: "🇯🇴", name: "Jordan",         code: "+962", digits: [9,  10] },
  { flag: "🇰🇪", name: "Kenya",          code: "+254", digits: [9,  10] },
  { flag: "🇰🇼", name: "Kuwait",         code: "+965", digits: [8,   8] },
  { flag: "🇱🇧", name: "Lebanon",        code: "+961", digits: [7,   8] },
  { flag: "🇱🇾", name: "Libya",          code: "+218", digits: [9,  10] },
  { flag: "🇲🇾", name: "Malaysia",       code: "+60",  digits: [9,  10] },
  { flag: "🇲🇦", name: "Morocco",        code: "+212", digits: [9,  10] },
  { flag: "🇲🇽", name: "Mexico",         code: "+52",  digits: [10, 10] },
  { flag: "🇳🇱", name: "Netherlands",    code: "+31",  digits: [9,  10] },
  { flag: "🇳🇬", name: "Nigeria",        code: "+234", digits: [10, 11] },
  { flag: "🇳🇴", name: "Norway",         code: "+47",  digits: [8,   8] },
  { flag: "🇵🇰", name: "Pakistan",       code: "+92",  digits: [10, 11] },
  { flag: "🇵🇱", name: "Poland",         code: "+48",  digits: [9,   9] },
  { flag: "🇵🇹", name: "Portugal",       code: "+351", digits: [9,   9] },
  { flag: "🇶🇦", name: "Qatar",          code: "+974", digits: [8,   8] },
  { flag: "🇷🇺", name: "Russia",         code: "+7",   digits: [10, 10] },
  { flag: "🇸🇦", name: "Saudi Arabia",   code: "+966", digits: [9,   9] },
  { flag: "🇸🇳", name: "Senegal",        code: "+221", digits: [9,   9] },
  { flag: "🇿🇦", name: "South Africa",   code: "+27",  digits: [9,  10] },
  { flag: "🇰🇷", name: "South Korea",    code: "+82",  digits: [9,  10] },
  { flag: "🇪🇸", name: "Spain",          code: "+34",  digits: [9,   9] },
  { flag: "🇸🇩", name: "Sudan",          code: "+249", digits: [9,   9] },
  { flag: "🇸🇪", name: "Sweden",         code: "+46",  digits: [9,   9] },
  { flag: "🇨🇭", name: "Switzerland",    code: "+41",  digits: [9,   9] },
  { flag: "🇸🇾", name: "Syria",          code: "+963", digits: [9,   9] },
  { flag: "🇹🇳", name: "Tunisia",        code: "+216", digits: [8,   8] },
  { flag: "🇹🇷", name: "Turkey",         code: "+90",  digits: [10, 10] },
  { flag: "🇦🇪", name: "UAE",            code: "+971", digits: [9,   9] },
  { flag: "🇬🇧", name: "United Kingdom", code: "+44",  digits: [10, 10] },
  { flag: "🇺🇸", name: "United States",  code: "+1",   digits: [10, 10] },
  { flag: "🇾🇪", name: "Yemen",          code: "+967", digits: [9,   9] },
];

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return mobile;
}

// Build resume data straight from the form so the preview updates as the user types.
function buildLiveData(form, t) {
  const lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const csv   = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const label = (key) => t[key].replace(/\s*\(.*\)/, "");
  const sections = [];
  if (form.experience.trim())    sections.push({ heading: t.experience,           items: lines(form.experience) });
  if (form.education.trim())     sections.push({ heading: t.education,            items: lines(form.education) });
  if (form.skills.trim())        sections.push({ heading: label("skills"),        items: csv(form.skills) });
  if (form.certifications.trim())sections.push({ heading: t.certifications,       items: lines(form.certifications) });
  if (form.projects.trim())      sections.push({ heading: t.projects,             items: lines(form.projects) });
  if (form.languages.trim())     sections.push({ heading: label("languages"),     items: csv(form.languages) });
  if (form.volunteer.trim())     sections.push({ heading: t.volunteer,            items: lines(form.volunteer) });
  if (form.awards.trim())        sections.push({ heading: t.awards,               items: lines(form.awards) });
  return {
    name: form.name || "—",
    title: form.title || "",
    contact: [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean),
    summary: form.summary || "",
    sections,
  };
}

export default function ResumeGenerator() {
  const [navPage, setNavPage] = useState("resume");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [step, setStep] = useState("templates");
  const [selectedLang, setSelectedLang] = useState(() => WORLD_LANGUAGES.find(l => l.code === "en"));
  const [tpl, setTpl] = useState(null);
  const [form, setForm] = useState({
    name: "", title: "", email: "", phone: "", location: "",
    linkedin: "", website: "",
    summary: "", experience: "", education: "", skills: "",
    certifications: "", languages: "", projects: "", volunteer: "", awards: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneCode, setPhoneCode] = useState(() => LANG_CODE[selectedLang?.code] || "+1");
  const [zoomed, setZoomed] = useState(false);
  const [aiPolished, setAiPolished] = useState(false);
  const [appView, setAppView] = useState("landing");
  const [coverStep, setCoverStep] = useState("templates");
  const [coverTpl, setCoverTpl] = useState(null);
  const [coverForm, setCoverForm] = useState({
    name: "", jobTitle: "", email: "", phone: "", location: "",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    recipientName: "", recipientTitle: "", company: "", companyAddress: "",
    subject: "", opening: "", body: "", closing: "", signoff: "Sincerely",
  });

  const lang = UI_LANGS.has(selectedLang.code) ? selectedLang.code : "en";
  const t = UI[lang];
  const rtl = selectedLang.rtl || false;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fullPhone = form.phone.trim() ? `${phoneCode} ${form.phone.trim()}` : "";
  const liveData = buildLiveData({ ...form, phone: fullPhone }, t);
  const isMobile = useIsMobile();
  const rPage  = { ...page,  padding: isMobile ? "8px 4px" : "16px 8px", overflowX: "hidden" };
  const rShell = { ...shell, padding: isMobile ? "16px 12px" : "28px 32px" };

  function validateEmail(val) {
    if (!val.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? "" : t.emailError;
  }
  function validatePhone(val, code = phoneCode) {
    if (!val.trim()) return "";
    const country = COUNTRIES.find(c => c.code === code);
    const [min, max] = country ? country.digits : [4, 15];
    const n = val.replace(/\D/g, "").length;
    if (n < min || n > max) {
      const range = min === max ? `${min}` : `${min}–${max}`;
      return `${t.phoneError} — ${range} ${t.phoneDigits}`;
    }
    return "";
  }
  function onEmailChange(e) {
    setForm({ ...form, email: e.target.value });
    if (emailError) setEmailError(validateEmail(e.target.value));
  }
  function onPhoneChange(e) {
    setForm({ ...form, phone: e.target.value });
    if (phoneError) setPhoneError(validatePhone(e.target.value));
  }

  async function generate() {
    const eErr = validateEmail(form.email);
    const pErr = validatePhone(form.phone);
    setEmailError(eErr); setPhoneError(pErr);
    if (eErr || pErr) return;
    setLoading(true); setResult(null); setAiPolished(false);
    const langName = selectedLang.name;
    const prompt = `You are an expert resume writer. Using the candidate details below, write a polished, ATS-friendly resume entirely in ${langName} (every word, including section headings, in ${langName}). Improve weak phrasing and use strong action verbs.

Return ONLY valid JSON, no markdown, in this exact shape:
{"name":"","title":"","contact":["email","phone","location"],"summary":"","sections":[{"heading":"","items":["bullet or line"]}]}

Use sections for Experience, Education, Skills (and any other relevant section). Each item is a single concise line.

Candidate details:
Name: ${form.name}
Title: ${form.title}
Email: ${form.email}
Phone: ${fullPhone}
Location: ${form.location}
LinkedIn: ${form.linkedin}
Website: ${form.website}
About: ${form.summary}
Experience: ${form.experience}
Education: ${form.education}
Skills: ${form.skills}
Certifications: ${form.certifications}
Projects: ${form.projects}
Languages: ${form.languages}
Volunteer: ${form.volunteer}
Awards: ${form.awards}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error("no-backend");
      const data = await res.json();
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setAiPolished(true);
    } catch {
      setResult(buildLiveData({ ...form, phone: fullPhone }, t));
    } finally {
      setLoading(false);
    }
  }

  function copyOut() {
    const src = result || liveData;
    if (!src) return;
    const flat = [src.name, src.title, (src.contact || []).join("  •  "), "",
      src.summary, "",
      ...(src.sections || []).flatMap((s) => [s.heading, ...s.items, ""])].join("\n");
    navigator.clipboard.writeText(flat);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadPDF() {
    const src = result || liveData;
    if (!src) return;
    const { jsPDF } = await import("jspdf");
    // jsPDF built-in fonts only cover Latin-1; normalise text to avoid garbled output
    const safe = (str = "") =>
      (str || "")
        .normalize("NFD")                        // decompose accents
        .replace(/[̀-ͯ]/g, "")         // strip combining marks
        .replace(/[^\x00-\xFF]/g, "")            // drop non-latin-1 glyphs
        .trim();

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 18;
    const colW = pageW - margin * 2;
    let y = margin;

    const hex2rgb = (h) => [
      parseInt(h.slice(1,3),16),
      parseInt(h.slice(3,5),16),
      parseInt(h.slice(5,7),16),
    ];
    const [ar, ag, ab] = hex2rgb(tpl.accent);

    const addPage = () => { doc.addPage(); y = margin; };
    const checkY = (need = 10) => { if (y + need > 280) addPage(); };

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.text(safe(src.name) || "Resume", margin, y);
    y += 9;

    // Title
    if (src.title) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(ar, ag, ab);
      doc.text(safe(src.title), margin, y);
      y += 7;
    }

    // Contact line — split long contact into two rows if needed
    const contactItems = (src.contact || []).filter(Boolean).map(safe).filter(Boolean);
    if (contactItems.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(90, 90, 90);
      const contactLine = contactItems.join("  |  ");
      const contactWrapped = doc.splitTextToSize(contactLine, colW);
      doc.text(contactWrapped, margin, y);
      y += contactWrapped.length * 4.5 + 2;
    }

    // Accent rule
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Summary
    if (src.summary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(55, 55, 55);
      const lines = doc.splitTextToSize(safe(src.summary), colW);
      checkY(lines.length * 5 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    }

    // Sections
    for (const section of (src.sections || [])) {
      checkY(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(ar, ag, ab);
      doc.text(safe(section.heading).toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(ar, ag, ab);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 55, 55);
      for (const item of section.items) {
        const lines = doc.splitTextToSize(`- ${safe(item)}`, colW - 3);
        checkY(lines.length * 5 + 2);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      }
      y += 4;
    }

    const fname = safe(src.name || "resume").replace(/\s+/g, "_").toLowerCase() || "resume";
    doc.save(`${fname}.pdf`);
  }

  async function downloadDOCX() {
    const src = result || liveData;
    if (!src) return;
    const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } = await import("docx");

    const accent = tpl.accent.replace("#", "").toUpperCase();
    const children = [];

    // Name
    children.push(new Paragraph({
      children: [new TextRun({ text: src.name || "", bold: true, size: 44, color: "111111" })],
      spacing: { after: 60 },
    }));

    // Title
    if (src.title) {
      children.push(new Paragraph({
        children: [new TextRun({ text: src.title, size: 26, color: accent })],
        spacing: { after: 60 },
      }));
    }

    // Contact
    const contact = (src.contact || []).filter(Boolean).join("   •   ");
    if (contact) {
      children.push(new Paragraph({
        children: [new TextRun({ text: contact, size: 20, color: "666666" })],
        spacing: { after: 120 },
      }));
    }

    // Divider
    children.push(new Paragraph({
      border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 8 } },
      spacing: { after: 160 },
    }));

    // Summary
    if (src.summary) {
      children.push(new Paragraph({
        children: [new TextRun({ text: src.summary, size: 21 })],
        spacing: { after: 240 },
      }));
    }

    // Sections
    for (const section of (src.sections || [])) {
      children.push(new Paragraph({
        children: [new TextRun({ text: section.heading.toUpperCase(), bold: true, size: 22, color: accent })],
        border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 4 } },
        spacing: { before: 240, after: 120 },
      }));
      for (const item of section.items) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `• ${item}`, size: 20 })],
          spacing: { after: 80 },
        }));
      }
    }

    const docFile = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(docFile);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(src.name || "resume").replace(/\s+/g, "_").toLowerCase()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const mainContent = step === "templates" ? (
    <div style={{ ...rShell }}>
      <h1 style={{ ...h1, fontSize: isMobile ? 22 : 30 }}>{t.heading}</h1>
      <p style={{ ...subtitle, fontSize: isMobile ? 13.5 : 15 }}>{t.chooseTpl}</p>
      <div style={{ ...tplGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, minmax(0, 1fr))" }}>
        {TEMPLATES.map((tp) => (
          <button key={tp.id} onClick={() => { setTpl(tp); setStep("form"); }}
            style={tplCard}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
            <ThumbPreview tp={tp} isMobile={isMobile} />
            <div style={{ padding: isMobile ? "8px 10px" : "10px 4px", textAlign: rtl ? "right" : "left",
              visibility: tp.blank ? "hidden" : "visible" }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: C.text1 }}>{tp.name}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: C.text2, marginTop: 2 }}>{tp.tag}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  const field = (key, multiline, ph) =>
    multiline ? (
      <textarea value={form[key]} onChange={set(key)} placeholder={ph || ""} rows={5}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
    ) : (
      <input value={form[key]} onChange={set(key)} placeholder={ph || ""} style={inputStyle} />
    );

  const formContent = tpl ? (
    <div style={rShell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setStep("templates")} style={backBtn}>← {t.back}</button>
        <div style={{ fontSize: 13.5, color: C.text2 }}>
          {t.chooseTpl}: <strong style={{ color: tpl.accent }}>{tpl.name}</strong>
        </div>
      </div>

      <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          <div>
            <label style={lbl}>{t.name}</label>{field("name", false, t.placeholderName)}
            <label style={lbl}>{t.title}</label>{field("title", false, t.placeholderTitle)}
            <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.email}</label>
                <input value={form.email} onChange={onEmailChange}
                  onBlur={() => setEmailError(validateEmail(form.email))}
                  placeholder={t.placeholderEmail}
                  style={{ ...inputStyle, ...(emailError ? { borderColor: "#f87171" } : {}) }} />
                {emailError && <p style={fieldErr}>{emailError}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.phone}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={phoneCode} onChange={(e) => {
                    const newCode = e.target.value;
                    setPhoneCode(newCode);
                    if (form.phone.trim()) setPhoneError(validatePhone(form.phone, newCode));
                  }} style={codeSelect}>
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input value={form.phone} onChange={onPhoneChange}
                    onBlur={() => setPhoneError(validatePhone(form.phone))}
                    placeholder={t.placeholderPhone}
                    style={{ ...inputStyle, flex: 1, ...(phoneError ? { borderColor: "#f87171" } : {}) }} />
                </div>
                {phoneError && <p style={fieldErr}>{phoneError}</p>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.linkedin}</label>
                {field("linkedin", false, t.placeholderLinkedin)}
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.website}</label>
                {field("website", false, t.placeholderWebsite)}
              </div>
            </div>
            <label style={lbl}>{t.location}</label>{field("location", false, t.placeholderLocation)}
            <label style={lbl}>{t.summary}</label>{field("summary", true, t.placeholderSummary)}
            <label style={lbl}>{t.experience}</label>{field("experience", true, t.placeholderEx)}
            <label style={lbl}>{t.education}</label>{field("education", true, t.placeholderEducation)}
            <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.skills}</label>
                {field("skills", false, t.placeholderSkills)}
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{t.languages}</label>
                {field("languages", false, t.placeholderLanguages)}
              </div>
            </div>
            <label style={lbl}>{t.certifications}</label>{field("certifications", true, t.placeholderCerts)}
            <label style={lbl}>{t.projects}</label>{field("projects", true, t.placeholderProjects)}
            <label style={lbl}>{t.volunteer}</label>{field("volunteer", true, t.placeholderVolunteer)}
            <label style={lbl}>{t.awards}</label>{field("awards", true, t.placeholderAwards)}
            <button onClick={generate} disabled={loading || !form.name} style={{ ...cta, background: C.grad, opacity: (loading || !form.name) ? 0.6 : 1 }}>
              {loading ? t.generating : t.generate}
            </button>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              marginTop: isMobile ? 24 : 0, flexWrap: "wrap" }}>
              <span style={{ ...badge, ...(aiPolished ? badgePolished : badgeLive),
                background: aiPolished ? `${tpl.accent}22` : C.elevated,
                color: aiPolished ? tpl.accent : C.text2 }}>
                {aiPolished ? "✦ AI-polished" : "● Live preview"}
              </span>
              {result && (
                <>
                  <button onClick={downloadPDF} style={{ ...dlBtn, borderColor: tpl.accent, color: tpl.accent }}>
                    ↓ {t.dlPdf}
                  </button>
                  <button onClick={downloadDOCX} style={{ ...dlBtn, borderColor: tpl.accent, color: tpl.accent }}>
                    ↓ {t.dlDocx}
                  </button>
                </>
              )}
            </div>
            <div
              onClick={() => setZoomed(z => !z)}
              title={zoomed ? undefined : "Click to enlarge"}
              style={{
                cursor: zoomed ? "zoom-out" : "zoom-in",
                ...(zoomed ? {
                  position: "fixed", inset: 0, zIndex: 9000,
                  background: "rgba(0,0,0,0.88)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "20px", overflowY: "auto",
                } : { position: "relative", overflowX: "auto" }),
              }}
            >
              {!zoomed && result && (
                <button onClick={(e) => { e.stopPropagation(); copyOut(); }} style={copyBtn}>
                  {copied ? t.copied : t.copy}
                </button>
              )}
              <div style={zoomed ? { width: "min(780px, 94vw)", maxHeight: "94vh", overflowY: "auto", borderRadius: 8 } : {}}>
                <ResumePaper tpl={tpl} result={result || liveData} rtl={rtl} placeholder={false} />
              </div>
              {zoomed && (
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
                  style={{ position: "fixed", top: 14, right: 14, zIndex: 9001,
                    width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`,
                    background: C.surface, color: C.text2, fontSize: 16,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "inherit" }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  ) : null;

  // ── Cover letter helpers ──────────────────────────────────────────
  const coverField = (key, multiline, ph) =>
    multiline ? (
      <textarea value={coverForm[key]} onChange={e => setCoverForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 90 }} />
    ) : (
      <input value={coverForm[key]} onChange={e => setCoverForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph} style={inputStyle} />
    );

  async function downloadCoverPDF() {
    if (!coverTpl) return;
    const { default: jsPDF } = await import("jspdf");
    const d = coverForm;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210; const margin = 20; const colW = pageW - 2 * margin;
    let y = margin;
    const safe = s => (s || "").replace(/[^\x00-\x7F]/g, c => c);
    const checkY = (h = 10) => { if (y + h > 277) { doc.addPage(); y = margin; } };
    const [ar, ag, ab] = [
      parseInt(coverTpl.accent.slice(1,3),16),
      parseInt(coverTpl.accent.slice(3,5),16),
      parseInt(coverTpl.accent.slice(5,7),16),
    ];
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(17,17,17);
    doc.text(safe(d.name), margin, y); y += 7;
    if (d.jobTitle) { doc.setFont("helvetica","italic"); doc.setFontSize(11); doc.setTextColor(ar,ag,ab); doc.text(safe(d.jobTitle), margin, y); y += 5; }
    const contact = [d.email, d.phone, d.location].filter(Boolean).join("   ·   ");
    if (contact) { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(120,120,120); doc.text(safe(contact), margin, y); y += 5; }
    doc.setDrawColor(ar,ag,ab); doc.setLineWidth(0.4); doc.line(margin, y, pageW-margin, y); y += 7;
    if (d.date) { doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(100,100,100); doc.text(safe(d.date), margin, y); y += 6; }
    if (d.recipientName) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(30,30,30); doc.text(safe(d.recipientName), margin, y); y += 5; }
    if (d.recipientTitle) { doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.text(safe(d.recipientTitle), margin, y); y += 5; }
    if (d.company) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(ar,ag,ab); doc.text(safe(d.company), margin, y); y += 5; }
    if (d.companyAddress) { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(120,120,120); doc.text(safe(d.companyAddress), margin, y); y += 6; }
    y += 2;
    if (d.subject) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(30,30,30); doc.text(`Re: ${safe(d.subject)}`, margin, y); y += 6; }
    if (d.opening) { doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(50,50,50); doc.text(`Dear ${safe(d.opening)},`, margin, y); y += 8; }
    for (const para of [d.body, d.closing].filter(Boolean)) {
      for (const block of para.split("\n\n").filter(Boolean)) {
        checkY(10); doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(55,55,55);
        const lines = doc.splitTextToSize(safe(block), colW);
        checkY(lines.length * 5 + 4); doc.text(lines, margin, y); y += lines.length * 5 + 5;
      }
    }
    y += 4;
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(50,50,50);
    doc.text(`${safe(d.signoff || "Sincerely")},`, margin, y); y += 14;
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(17,17,17);
    doc.text(safe(d.name), margin, y);
    doc.save(`${safe(d.name || "cover-letter").replace(/\s+/g,"_").toLowerCase()}-cover-letter.pdf`);
  }

  const coverTemplatesContent = (
    <div style={rShell}>
      <h1 style={{ ...h1, fontSize: isMobile ? 22 : 30 }}>Cover Letter Templates</h1>
      <p style={{ ...subtitle, fontSize: isMobile ? 13.5 : 15 }}>Choose a template to start writing your cover letter</p>
      <div style={{ ...tplGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, minmax(0, 1fr))" }}>
        {COVER_TEMPLATES.map((tp) => (
          <button key={tp.id} onClick={() => { setCoverTpl(tp); setCoverStep("form"); }}
            style={tplCard}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
            <CoverThumbPreview tp={tp} isMobile={isMobile} />
            <div style={{ padding: isMobile ? "8px 10px" : "10px 4px", visibility: tp.blank ? "hidden" : "visible" }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: C.text1 }}>{tp.name}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: C.text2, marginTop: 2 }}>{tp.tag}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const coverFormContent = coverTpl ? (
    <div style={rShell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setCoverStep("templates")} style={backBtn}>← Back</button>
        <div style={{ fontSize: 13.5, color: C.text2 }}>
          Template: <strong style={{ color: coverTpl.accent }}>{coverTpl.name}</strong>
        </div>
      </div>
      <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
        {/* Left: form */}
        <div>
          {/* Section heading helper */}
          {(() => {
            const sh = (label) => (
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                color: C.text2, marginTop: 22, marginBottom: 10, paddingBottom: 6,
                borderBottom: `1px solid ${C.border}` }}>{label}</div>
            );
            return (
              <>
                {sh("Your Details")}
                <label style={lbl}>Full Name *</label>{coverField("name", false, "Alexandra Johnson")}
                <label style={lbl}>Job Title</label>{coverField("jobTitle", false, "Senior Product Designer")}
                <label style={lbl}>Email</label>{coverField("email", false, "you@email.com")}
                <label style={lbl}>Phone</label>{coverField("phone", false, "+1 415 555 0000")}
                <label style={lbl}>Location</label>{coverField("location", false, "City, Country")}

                {sh("Recipient & Company")}
                <label style={lbl}>Date</label>{coverField("date", false, "June 26, 2026")}
                <label style={lbl}>Recipient Name</label>{coverField("recipientName", false, "Mr. David Chen")}
                <label style={lbl}>Recipient Title</label>{coverField("recipientTitle", false, "Head of Design")}
                <label style={lbl}>Company</label>{coverField("company", false, "Stripe")}
                <label style={lbl}>Company Address</label>{coverField("companyAddress", false, "123 Main St, City")}

                {sh("Letter Content")}
                <label style={lbl}>Subject / Re:</label>{coverField("subject", false, "Senior Product Designer Position")}
                <label style={lbl}>Salutation</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13.5, color: C.text2, whiteSpace: "nowrap" }}>Dear</span>
                  <input value={coverForm.opening} onChange={e => setCoverForm(f => ({ ...f, opening: e.target.value }))}
                    placeholder="Mr. Chen / Hiring Manager" style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ fontSize: 13.5, color: C.text2 }}>,</span>
                </div>
                <label style={lbl}>Opening &amp; Body Paragraphs</label>
                <textarea value={coverForm.body} onChange={e => setCoverForm(f => ({ ...f, body: e.target.value }))}
                  placeholder={"Write your paragraphs here.\n\nSeparate paragraphs with a blank line."}
                  rows={8} style={{ ...inputStyle, resize: "vertical", minHeight: 160 }} />
                <label style={lbl}>Closing Paragraph</label>
                <textarea value={coverForm.closing} onChange={e => setCoverForm(f => ({ ...f, closing: e.target.value }))}
                  placeholder="Thank you for your time and consideration. I look forward to speaking with you."
                  rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} />
                <label style={lbl}>Sign-off</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <input value={coverForm.signoff} onChange={e => setCoverForm(f => ({ ...f, signoff: e.target.value }))}
                    placeholder="Sincerely" style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ fontSize: 13.5, color: C.text2 }}>,</span>
                </div>
                <button onClick={downloadCoverPDF} disabled={!coverForm.name}
                  style={{ ...cta, background: C.grad, opacity: !coverForm.name ? 0.5 : 1 }}>
                  ↓ Download PDF
                </button>
              </>
            );
          })()}
        </div>
        {/* Right: live preview */}
        <div style={{ minWidth: 0, marginTop: isMobile ? 24 : 0 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...badge, ...badgeLive, background: C.elevated, color: C.text2 }}>● Live preview</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <CoverLetterPaper tpl={coverTpl} data={coverForm} />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ── Sidebar nav items ──────────────────────────────────────────────
  const NAV = [
    { id: "resume",    icon: "📄", label: "Resume" },
    { id: "cover",     icon: "✉️",  label: "Cover Letter" },
    { id: "tracker",   icon: "📋", label: "Job Tracker" },
    { id: "signature", icon: "✍️",  label: "Email Signature" },
    { id: "website",   icon: "🌐", label: "Personal Website" },
  ];

  const ComingSoon = ({ label }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 320, gap: 16, color: C.text3, padding: 40 }}>
      <span style={{ fontSize: 48 }}>🚧</span>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>{label}</div>
      <div style={{ fontSize: 14, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
        This feature is coming soon. Stay tuned for updates!
      </div>
    </div>
  );

  const PricingPage = () => (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      <h2 style={{ ...h1, fontSize: 26, marginBottom: 4 }}>Plans & Pricing</h2>
      <p style={{ ...subtitle, marginBottom: 32 }}>Choose the plan that fits your needs.</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
        {[
          { name: "Free", price: "$0", period: "forever", color: "#4b5563", features: [
            "1 Resume (live preview)", "5 templates", "PDF & DOCX download", "50+ languages",
          ], cta: "Get started", active: true },
          { name: "Pro", price: "$9", period: "/ month", color: "#2563eb", features: [
            "Unlimited resumes", "All 8 templates", "Cover letter builder", "Email signature", "AI polish (GPT-4)", "Priority support",
          ], cta: "Upgrade to Pro", badge: "Most popular" },
          { name: "Team", price: "$29", period: "/ month", color: "#7c3aed", features: [
            "Everything in Pro", "5 team seats", "Job tracker board", "Personal website builder", "Custom domain", "Dedicated support",
          ], cta: "Contact us" },
        ].map((plan) => (
          <div key={plan.name} style={{
            background: plan.badge
              ? `linear-gradient(160deg, ${plan.color}14 0%, ${C.surface} 50%)`
              : `linear-gradient(160deg, rgba(255,255,255,0.02) 0%, ${C.surface} 60%)`,
            border: `1.5px solid ${plan.badge ? plan.color + "88" : C.border}`,
            borderRadius: 18, padding: "28px 24px", position: "relative",
            display: "flex", flexDirection: "column", gap: 0,
            boxShadow: plan.badge ? `0 8px 32px ${plan.color}22` : "0 4px 16px rgba(0,0,0,0.3)" }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                background: plan.color, color: "#fff", fontSize: 11, fontWeight: 700,
                padding: "3px 14px", borderRadius: 999, whiteSpace: "nowrap",
                boxShadow: `0 4px 12px ${plan.color}55` }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: plan.color,
              textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.text1, lineHeight: 1,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
              {plan.price}<span style={{ fontSize: 14, fontWeight: 500, color: C.text2 }}>{plan.period}</span>
            </div>
            <div style={{ height: 1, background: C.border, margin: "20px 0" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontSize: 13.5, color: C.text1, display: "flex", gap: 8 }}>
                  <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{ marginTop: "auto", padding: "12px 0", width: "100%",
              background: plan.active ? "transparent" : plan.color,
              border: `1.5px solid ${plan.color}`, borderRadius: 10,
              color: plan.active ? plan.color : "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              boxShadow: plan.active ? "none" : `0 4px 16px ${plan.color}44` }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  let pageBody;
  if (navPage === "resume") pageBody = step === "form" ? (formContent || mainContent) : mainContent;
  else if (navPage === "cover") pageBody = coverStep === "form" ? (coverFormContent || coverTemplatesContent) : coverTemplatesContent;
  else if (navPage === "pricing") pageBody = <PricingPage />;
  else pageBody = <ComingSoon label={NAV.find(n => n.id === navPage)?.label || ""} />;

  // ── Landing page ──────────────────────────────────────────────────
  if (appView === "landing") {
    const enter = (page) => { setNavPage(page); setAppView("app"); };
    const features = [
      { icon: "📄", title: "9 Resume Templates", desc: "From classic serif to dark terminal — every style covered with FlowCV-quality designs." },
      { icon: "✉️", title: "6 Cover Letter Styles", desc: "Matching letter templates so your application looks cohesive from start to finish." },
      { icon: "🌍", title: "50+ Languages", desc: "Full RTL support for Arabic, Hebrew, and more. Create your CV in more than 50 languages." },
      { icon: "⚡", title: "Live Preview", desc: "Every keystroke updates the preview instantly. Download as PDF or DOCX when ready." },
    ];
    return (
      <div style={{ background: C.bg, color: C.text1, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0,
          zIndex: 100, background: C.bg + "ee", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px",
            background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ApplyCraft
          </div>
          <button onClick={() => enter("resume")}
            style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            Get Started — Free
          </button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${C.glow} 0%, transparent 70%)` }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", padding: "90px 24px 80px" }}>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: "2px",
              textTransform: "uppercase", color: C.accent2, background: `${C.accent}18`,
              border: `1px solid ${C.accent}44`, borderRadius: 999, padding: "4px 14px", marginBottom: 28 }}>
              Free · No sign-up required
            </div>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1,
              letterSpacing: "-2px", margin: "0 0 24px",
              background: "linear-gradient(135deg, #EEF2FF 0%, #94A3B8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create a professional,<br />ATS-friendly CV in 50+ languages.
            </h1>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: C.text2, maxWidth: 520,
              margin: "0 auto 44px", lineHeight: 1.65 }}>
              Build, translate, and tailor your CV for jobs worldwide using
              professional templates and AI-powered suggestions.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => enter("resume")}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 10,
                  padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
                Build My Resume →
              </button>
              <button onClick={() => enter("cover")}
                style={{ background: "transparent", color: C.text1, border: `1.5px solid ${C.borderHi}`,
                  borderRadius: 10, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Write Cover Letter
              </button>
            </div>
          </div>
        </div>

        {/* Template strip */}
        <div style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "2px", color: C.text3, marginBottom: 28 }}>9 professional templates</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {TEMPLATES.filter(t => !t.blank).slice(0, 8).map((tp) => (
                <button key={tp.id} onClick={() => enter("resume")}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                    overflow: "hidden", cursor: "pointer", padding: 0, transition: "border-color .2s, transform .15s",
                    fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = tp.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                  <ThumbPreview tp={tp} isMobile={true} />
                  <div style={{ padding: "8px 10px", textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{tp.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          background: C.surface, padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "2px", color: C.text3, marginBottom: 48 }}>Everything you need</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: C.elevated, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "24px 22px", flex: "1 1 220px", maxWidth: 280 }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1px",
              margin: "0 0 16px", color: C.text1 }}>Start building for free</h2>
            <p style={{ fontSize: 16, color: C.text2, margin: "0 0 36px" }}>
              No account needed. Download your resume in seconds.
            </p>
            <button onClick={() => enter("resume")}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 10,
                padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(99,102,241,0.35)" }}>
              Build My Resume — It's Free
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex",
            justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, background: C.grad,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ApplyCraft</div>
            <div style={{ fontSize: 12.5, color: C.text3 }}>© {new Date().getFullYear()} ApplyCraft · applycraft.io</div>
          </div>
        </div>
      </div>
    );
  }

  const sbW = sidebarOpen ? 224 : 56;

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ ...rPage, display: "flex", padding: 0, height: "100vh", overflow: "hidden" }}>

      {/* ── Sidebar (desktop) ── */}
      {!isMobile && (
        <aside style={{ width: sbW, flexShrink: 0,
          background: `linear-gradient(180deg, ${C.sidebar} 0%, rgba(6,8,15,0.96) 100%)`,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden",
          transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>

          {/* Logo + toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: sidebarOpen ? "20px 14px 20px 20px" : "20px 0",
            borderBottom: `1px solid ${C.border}`, minHeight: 64, transition: "padding .22s" }}>
            {sidebarOpen && (
              <button onClick={() => setAppView("landing")}
                style={{ overflow: "hidden", whiteSpace: "nowrap", background: "none",
                  border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px",
                  background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ApplyCraft
                </div>
                <div style={{ fontSize: 10.5, color: C.text3, marginTop: 1 }}>Career toolkit</div>
              </button>
            )}
            <button onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                background: C.surface, border: `1px solid ${C.border}`, color: C.text2,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, margin: sidebarOpen ? 0 : "0 auto", transition: "margin .22s",
                fontFamily: "inherit" }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Main nav */}
          <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  padding: sidebarOpen ? "9px 12px" : "9px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
                  fontSize: 15, fontWeight: navPage === item.id ? 700 : 500,
                  background: navPage === item.id ? `${C.accent}18` : "transparent",
                  color: navPage === item.id ? C.accent2 : C.text2,
                  transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxShadow: navPage === item.id ? `inset 2px 0 0 ${C.accent}` : "none" }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Pricing + upsell */}
          <div style={{ padding: "10px 8px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => setNavPage("pricing")}
              title={!sidebarOpen ? "Plans & Pricing" : undefined}
              style={{ display: "flex", alignItems: "center", gap: 10,
                padding: sidebarOpen ? "9px 12px" : "9px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                borderRadius: 9, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
                fontSize: 13.5, fontWeight: navPage === "pricing" ? 700 : 500,
                background: navPage === "pricing" ? `${C.blue}18` : "transparent",
                color: navPage === "pricing" ? "#93C5FD" : C.text2,
                transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>💎</span>
              {sidebarOpen && "Plans & Pricing"}
            </button>
            {sidebarOpen && (
              <div style={{ margin: "8px 4px 0", padding: "10px 12px",
                background: `${C.accent}0E`, border: `1px solid ${C.accent}30`,
                borderRadius: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.accent2, marginBottom: 4,
                  letterSpacing: "0.6px", textTransform: "uppercase" }}>Free Plan</div>
                <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
                  Upgrade to Pro for AI polish, cover letters & more.
                </div>
                <button onClick={() => setNavPage("pricing")} style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700,
                  color: C.accent2, background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "inherit" }}>
                  View plans →
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: isMobile ? "8px 4px" : "16px 12px" }}>

        {/* Persistent top bar: language picker */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center",
          marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
          <LanguageDropdown
            selected={selectedLang}
            onSelect={(l) => {
              setSelectedLang(l);
              setPhoneCode(LANG_CODE[l.code] || "+1");
            }}
          />
        </div>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto",
            padding: "4px 0 12px", borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, background: C.surface,
                border: `1px solid ${C.border}`, color: C.text2, cursor: "pointer",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit" }}>
              ☰
            </button>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                  borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 12,
                  background: navPage === item.id ? `${C.accent}18` : "transparent",
                  color: navPage === item.id ? C.accent2 : C.text2, fontFamily: "inherit" }}>
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => setNavPage("pricing")}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                borderRadius: 8, border: `1px solid ${C.accent}30`, cursor: "pointer", fontSize: 12,
                background: navPage === "pricing" ? `${C.blue}18` : "transparent",
                color: navPage === "pricing" ? "#93C5FD" : C.text2, fontFamily: "inherit" }}>
              💎 Pricing
            </button>
          </div>
        )}

        {/* Mobile sidebar drawer */}
        {isMobile && sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200 }} />
            <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 240, zIndex: 201,
              background: `linear-gradient(180deg, ${C.sidebar} 0%, rgba(6,8,15,0.98) 100%)`,
              borderRight: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column", padding: "0 0 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => { setAppView("landing"); setSidebarOpen(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px",
                    background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    ApplyCraft
                  </div>
                  <div style={{ fontSize: 10.5, color: C.text3, marginTop: 1 }}>Career toolkit</div>
                </button>
                <button onClick={() => setSidebarOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: 8, background: C.surface,
                    border: `1px solid ${C.border}`, color: C.text2, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontFamily: "inherit" }}>✕</button>
              </div>
              <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map((item) => (
                  <button key={item.id} onClick={() => { setNavPage(item.id); setSidebarOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                      fontSize: 14, fontWeight: navPage === item.id ? 700 : 500, fontFamily: "inherit",
                      background: navPage === item.id ? `${C.accent}18` : "transparent",
                      color: navPage === item.id ? C.accent2 : C.text2,
                      boxShadow: navPage === item.id ? `inset 2px 0 0 ${C.accent}` : "none" }}>
                    <span style={{ fontSize: 17 }}>{item.icon}</span>{item.label}
                  </button>
                ))}
              </nav>
              <div style={{ padding: "10px 8px", borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => { setNavPage("pricing"); setSidebarOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                    fontSize: 14, fontWeight: navPage === "pricing" ? 700 : 500, fontFamily: "inherit",
                    background: navPage === "pricing" ? `${C.blue}18` : "transparent",
                    color: navPage === "pricing" ? "#93C5FD" : C.text2 }}>
                  <span style={{ fontSize: 17 }}>💎</span>Plans & Pricing
                </button>
              </div>
            </aside>
          </>
        )}

        {pageBody}
      </div>
    </div>
  );
}

function LanguageDropdown({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = WORLD_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 500 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
        color: C.text1, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", transition: "border-color .15s",
      }}>
        <span style={{ fontSize: 17 }}>{selected.flag}</span>
        <span>{selected.name}</span>
        <span style={{ fontSize: 10, color: C.text3, marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          width: 290, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px ${C.accent}10`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Search box */}
          <div style={{ padding: "10px 10px 8px", borderBottom: `1px solid ${C.border}` }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px", background: C.elevated,
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text1, fontSize: 13, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Language list */}
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "20px 14px", color: C.text3, fontSize: 13, textAlign: "center" }}>
                No language found
              </div>
            )}
            {filtered.map(l => (
              <button key={l.code} onClick={() => { onSelect(l); setOpen(false); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 14px", border: "none", background: l.code === selected.code ? `${C.accent}14` : "transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  borderLeft: l.code === selected.code ? `2px solid ${C.accent}` : "2px solid transparent",
                  transition: "background .1s",
                }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{l.flag}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, display: "block" }}>{l.name}</span>
                  <span style={{ fontSize: 11.5, color: C.text3 }}>{l.native}</span>
                </span>
                {UI_LANGS.has(l.code) && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.accent2,
                    background: `${C.accent}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                    UI
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThumbPreview({ tp, isMobile }) {
  const OUTER = isMobile ? 10 : 20; // gap between card edge and paper
  const INNER_W = 700;
  const frameRef = useRef(null);
  const [scale, setScale] = useState(isMobile ? 0.30 : 0.42);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale((w - 2 * OUTER) / INNER_W);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [OUTER]);

  const H = Math.round(scale * 906);
  const frameBg = tp.id === "tech" ? "#0a0d14" : "#e8eaed";

  if (tp.blank) {
    return (
      <div ref={frameRef} style={{ height: H + 2 * OUTER, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 72, color: "#9ca3af", fontWeight: 300, lineHeight: 1 }}>+</div>
      </div>
    );
  }

  return (
    <div ref={frameRef} style={{ padding: OUTER, background: frameBg, overflow: "hidden" }}>
      {/* Paper with shadow — floats inside the frame, never touches the edges */}
      <div style={{ height: H, overflow: "hidden", position: "relative",
        boxShadow: "0 3px 14px rgba(0,0,0,0.22)",
        background: tp.id === "tech" ? "#0d1117" : "#fff" }}>
        <div style={{ width: INNER_W, transform: `scale(${scale})`, transformOrigin: "top left",
          position: "absolute", top: 0, left: 0, pointerEvents: "none", userSelect: "none" }}>
          <ResumePaper tpl={tp} result={SAMPLE_RESUME} rtl={false} placeholder={false} preview />
        </div>
      </div>
    </div>
  );
}

function ResumePaper({ tpl, result, rtl, placeholder = true, preview = false }) {
  const hasContent = result && (result.name !== "—" || result.summary || (result.sections && result.sections.length));
  const empty = placeholder && !hasContent;
  const data = result || { name: "—", title: "", contact: [], summary: "", sections: [] };
  const paper = { background: "#fff", color: "#1a1a1a",
    borderRadius: preview ? 0 : 8, minHeight: preview ? 0 : 420,
    maxHeight: preview ? 906 : undefined,
    padding: preview ? 12 : 0,
    fontFamily: tpl.font, overflow: "hidden",
    boxShadow: preview ? "none" : "0 8px 30px rgba(0,0,0,0.35)",
    width: "100%", boxSizing: "border-box" };

  if (empty) {
    return <div style={{ ...paper, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: 30, textAlign: "center" }}>
      {tpl.id === "blank"
        ? "Fill in the form — your plain-text resume will appear here."
        : <>Your resume will appear here in the <strong style={{ color: tpl.accent, margin: "0 4px" }}>{tpl.name}</strong> style.</>}
    </div>;
  }

  if (tpl.id === "blank") {
    return (
      <div style={{ ...paper, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: "#111", letterSpacing: "-0.3px" }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13.5, color: "#444", marginTop: 3 }}>{data.title}</div>}
            {data.contact.length > 0 && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.6 }}>
                {data.contact.join("   |   ")}
              </div>
            )}
          </div>
          <div style={{ height: 1, background: "#d1d5db", margin: "14px 0" }} />
          {data.summary && (
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#333", margin: "0 0 14px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                color: "#111", marginBottom: 5 }}>{s.heading}</div>
              {s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 13, lineHeight: 1.55, color: "#333", marginBottom: 3 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Whether a section belongs in a sidebar (skills, languages)
  const isSidebar = (s) => /skill|compét|habilidad|مهارات|fähig|^language|^langue|^idioma|^sprach/i.test(s.heading);

  // ── CLASSIC (Mercury Flow — centered serif, accent rule) ─────────
  if (tpl.id === "classic") {
    const SHead = ({ label }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 9px" }}>
        <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
          color: tpl.accent, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
      </div>
    );
    return (
      <div style={paper}>
        <div style={{ padding: "30px 34px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "0.5px",
              lineHeight: 1.15 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: tpl.accent, marginTop: 5, fontStyle: "italic" }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#777", marginTop: 8, lineHeight: 1.9 }}>{data.contact.join("  ·  ")}</div>
            <div style={{ height: 2, width: 44, background: tpl.accent, margin: "12px auto 0" }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", textAlign: "center",
              margin: "16px 0 0", fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i}>
              <SHead label={s.heading} />
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "3px 11px", borderRadius: 999,
                      border: `1px solid ${tpl.accent}77`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 14, position: "relative", textAlign: "left" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent }}>›</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── MODERN (Atlantic Blue — left accent sidebar) ─────────────────
  if (tpl.id === "modern") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "32%", background: tpl.accent, color: "#fff", padding: "28px 16px",
            flexShrink: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, opacity: 0.82, marginBottom: 7, wordBreak: "break-all",
                lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  opacity: 0.55, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 999,
                      background: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#555", margin: "0 0 18px",
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                    paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}28` }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── MINIMAL (Precision Line — left-aligned, thin rules) ──────────
  if (tpl.id === "minimal") {
    return (
      <div style={paper}>
        <div style={{ padding: "32px 36px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#111", letterSpacing: "-0.5px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#666", marginTop: 5 }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#999", marginTop: 8, lineHeight: 1.9 }}>
              {data.contact.join("   ·   ")}
            </div>
            <div style={{ height: 2, background: tpl.accent, width: 36, marginTop: 14 }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", margin: "0 0 22px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: "#aaa", whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 11px", borderRadius: 3,
                      background: "#f3f4f6", color: "#374151", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444",
                  marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── BOLD (full-bleed accent header, badge section headings) ──────
  if (tpl.id === "bold") {
    return (
      <div style={paper}>
        <div style={{ background: tpl.accent, padding: "26px 28px 22px" }}>
          <div style={{ fontSize: 27, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 5 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 10 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "22px 28px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
              borderLeft: `3px solid ${tpl.accent}`, paddingLeft: 12 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.5px", color: "#fff", background: tpl.accent,
                padding: "2px 10px", borderRadius: 3, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999,
                      border: `1px solid ${tpl.accent}99`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 13, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ELEGANT (soft left sidebar, serif, refined) ──────────────────
  if (tpl.id === "elegant") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "29%", background: tpl.accent + "0F", padding: "28px 16px",
            borderRight: `1px solid ${tpl.accent}22`, flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            <div style={{ fontSize: 11.5, color: tpl.accent, marginBottom: 16, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: tpl.accent + "55", marginBottom: 16 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#555", marginBottom: 8, lineHeight: 1.5,
                wordBreak: "break-all" }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent + "cc",
                      background: "#fff" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.72, color: "#555", margin: "0 0 18px",
                fontStyle: "italic" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333",
                    marginBottom: 7 }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── EXECUTIVE (split header, left-bar sections, gold rule) ───────
  if (tpl.id === "executive") {
    return (
      <div style={paper}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 27, fontWeight: 800, color: "#111", letterSpacing: "-0.5px",
                lineHeight: 1.1 }}>{data.name}</div>
              {data.title && <div style={{ fontSize: 11.5, color: tpl.accent, marginTop: 6, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.9px" }}>{data.title}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              {data.contact.map((c, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#666", marginBottom: 3, lineHeight: 1.5 }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 3, background: tpl.accent, marginBottom: 18 }} />
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#555", margin: "0 0 18px",
              fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 3, height: 13, background: tpl.accent, flexShrink: 0 }} />
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: "#1a1a1a" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 13 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3,
                      background: tpl.accent + "18", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 13 }}>· {it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── CREATIVE (left colour panel with profile initial) ────────────
  if (tpl.id === "creative") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "34%", background: tpl.accent, color: "#fff", padding: "28px 16px",
            flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, marginBottom: 14, flexShrink: 0 }}>
              {data.name.charAt(0)}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 3 }}>{data.name}</div>
            <div style={{ fontSize: 10.5, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{data.title}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, opacity: 0.8, marginBottom: 7, wordBreak: "break-all",
                lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
                  opacity: 0.55, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999,
                      background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 20px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, borderBottom: `2px solid ${tpl.accent}`,
                  paddingBottom: 5, marginBottom: 10 }}>{s.heading}</div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                    paddingLeft: 12, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>▸</span>{it}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── TECH (dark terminal) ─────────────────────────────────────────
  if (tpl.id === "tech") {
    return (
      <div style={{ ...paper, background: "#0d1117", color: "#e6edf3" }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: tpl.accent, letterSpacing: "-0.3px" }}>{data.name}</div>
            <div style={{ fontSize: 12, color: "#8b949e", marginTop: 3 }}>❯ {data.title}</div>
            <div style={{ fontSize: 11, color: "#6e7681", marginTop: 8, lineHeight: 1.9 }}>
              {data.contact.join("  ·  ")}
            </div>
            <div style={{ height: 1, background: tpl.accent + "44", marginTop: 14 }} />
          </div>
          {data.summary && (
            <div style={{ fontSize: 12, lineHeight: 1.65, marginBottom: 18, color: "#c9d1d9",
              borderLeft: `2px solid ${tpl.accent}`, paddingLeft: 10 }}>{data.summary}</div>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, color: tpl.accent, fontWeight: 700, marginBottom: 9,
                letterSpacing: "1px" }}>── {s.heading.toUpperCase()} ──</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}55`, color: tpl.accent + "cc" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, lineHeight: 1.55, color: "#c9d1d9", marginBottom: 5 }}>
                  <span style={{ color: tpl.accent }}>▸ </span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SHARP (black & white corporate, full-width black rules) ─────
  if (tpl.id === "sharp") {
    return (
      <div style={paper}>
        <div style={{ padding: "28px 36px" }}>
          <div style={{ paddingBottom: 14, marginBottom: 18, borderBottom: "2.5px solid #111" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "0.5px",
              textTransform: "uppercase", lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 11, color: "#555", marginTop: 5, letterSpacing: "1px",
              textTransform: "uppercase", fontWeight: 600 }}>{data.title}</div>}
            <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
              {data.contact.join("   |   ")}
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "2.5px", color: "#111", whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1.5, background: "#111" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 2,
                      border: "1px solid #555", color: "#333", fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#222", marginBottom: 5,
                  paddingLeft: 10, borderLeft: "2px solid #ddd" }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SLATE (dark navy sidebar, gold accent) ───────────────────────
  if (tpl.id === "slate") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "30%", background: "#0f172a", color: "#fff", padding: "28px 16px",
            flexShrink: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 11, color: tpl.accent, marginBottom: 18,
              fontWeight: 600, letterSpacing: "0.3px" }}>{data.title}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 7,
                wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {data.summary && (
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div style={{ width: 3, height: 13, background: tpl.accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: "#0f172a" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333",
                    marginBottom: 5, paddingLeft: 13 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PRISM (gradient header, accent line) ─────────────────────────
  if (tpl.id === "prism") {
    return (
      <div style={paper}>
        <div style={{ background: `linear-gradient(135deg, ${tpl.accent} 0%, #3B82F6 100%)`,
          padding: "26px 30px 22px" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginTop: 5 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 10 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${tpl.accent}, #3B82F6, transparent)` }} />
        <div style={{ padding: "20px 30px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 16px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${tpl.accent}55, transparent)` }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 12, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: tpl.accent, fontWeight: 700 }}>›</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── COMPACT (two-column body, high density) ──────────────────────
  if (tpl.id === "compact") {
    const expSection = data.sections.find(s => /exp|expér|work|employ/i.test(s.heading)) || data.sections[0];
    const restSections = data.sections.filter(s => s !== expSection);
    return (
      <div style={paper}>
        {/* Header */}
        <div style={{ padding: "20px 26px 16px", borderBottom: `3px solid ${tpl.accent}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
                lineHeight: 1.1 }}>{data.name}</div>
              {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 4,
                fontWeight: 600 }}>{data.title}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              {data.contact.map((c, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#666", lineHeight: 1.6 }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Two-column body */}
        <div style={{ display: "flex", padding: "16px 0" }}>
          {/* Left: experience */}
          <div style={{ width: "57%", padding: "0 20px 0 26px", borderRight: `1px solid #e5e7eb` }}>
            {data.summary && (
              <p style={{ fontSize: 12, lineHeight: 1.65, color: "#444", margin: "0 0 14px",
                paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>{data.summary}</p>
            )}
            {expSection && (
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {expSection.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {expSection.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12, lineHeight: 1.55, color: "#333",
                    marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}33` }}>{it}</div>
                ))}
              </div>
            )}
          </div>
          {/* Right: other sections */}
          <div style={{ flex: 1, padding: "0 20px 0 18px" }}>
            {restSections.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 7,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {s.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
                </div>
                {isSidebar(s) ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {s.items.map((it, j) => (
                      <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                        background: tpl.accent + "12", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                    ))}
                  </div>
                ) : s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 11.5, lineHeight: 1.55, color: "#444",
                    marginBottom: 4 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── FALLBACK (same as classic) ───────────────────────────────────
  return (
    <div style={paper}>
      <div style={{ padding: "28px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>{data.name}</div>
        {data.title && <div style={{ fontSize: 13, color: tpl.accent, marginTop: 4 }}>{data.title}</div>}
        <div style={{ fontSize: 11, color: "#777", marginTop: 7 }}>{data.contact.join("  ·  ")}</div>
        <div style={{ height: 2, width: 44, background: tpl.accent, margin: "12px auto 16px" }} />
        {data.summary && <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#555", margin: "0 0 14px" }}>{data.summary}</p>}
        {data.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 14, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px",
              color: tpl.accent, marginBottom: 7 }}>{s.heading}</div>
            {s.items.map((it, j) => (
              <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 4 }}>• {it}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageFooter({ t }) {
  const year = new Date().getFullYear();
  const dot = <span style={footerDot}>·</span>;
  return (
    <footer style={footerWrap}>
      <span>{t.madeBy} <strong style={{ color: C.text1 }}>{AUTHOR.name}</strong></span>
      {dot}
      <span>© {year}</span>
      {dot}
      <a href={`mailto:${AUTHOR.email}`} style={footerLink}>{AUTHOR.email}</a>
      {dot}
      <a href={AUTHOR.github} target="_blank" rel="noreferrer" style={footerLink}>GitHub</a>
      {AUTHOR.linkedin && <>{dot}<a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" style={footerLink}>LinkedIn</a></>}
    </footer>
  );
}

// ── Design tokens ─────────────────────────────────────────────────
// Midnight navy base (Linear/Vercel style) + indigo-blue gradient accent
const C = {
  bg:       "#06080F",   // deepest background
  sidebar:  "#080D18",   // sidebar background
  surface:  "#0D1424",   // shell / cards
  elevated: "#111D30",   // inputs, selects
  border:   "#1A2740",   // default border
  borderHi: "#253A58",   // stronger border
  text1:    "#EEF2FF",   // headings
  text2:    "#94A3B8",   // body / labels
  text3:    "#3D5170",   // muted / placeholder
  accent:   "#6366F1",   // indigo primary
  accent2:  "#818CF8",   // lighter indigo
  blue:     "#3B82F6",   // blue secondary
  grad:     "linear-gradient(135deg,#6366F1 0%,#3B82F6 100%)", // CTA gradient
  gradHov:  "linear-gradient(135deg,#5254CC 0%,#2563EB 100%)",
  glow:     "rgba(99,102,241,0.14)",  // indigo glow
  glowBlue: "rgba(59,130,246,0.10)", // blue glow
};

const page = {
  minHeight: "100vh",
  background: `radial-gradient(ellipse 70% 55% at 15% 0%, ${C.glow} 0%, transparent 65%),
               radial-gradient(ellipse 55% 45% at 85% 100%, ${C.glowBlue} 0%, transparent 60%),
               ${C.bg}`,
  padding: "16px 8px",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  color: C.text1,
};
const shell = {
  margin: "0 auto",
  background: `linear-gradient(160deg, rgba(99,102,241,0.04) 0%, transparent 40%), ${C.surface}`,
  borderRadius: 16,
  padding: "28px 32px",
  border: `1px solid ${C.border}`,
  boxShadow: `0 0 0 1px rgba(99,102,241,0.06), 0 24px 64px rgba(0,0,0,0.45)`,
};
const h1 = {
  fontSize: 30, fontWeight: 800, margin: "0 0 6px",
  color: C.text1, letterSpacing: "-0.6px",
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  background: `linear-gradient(135deg, ${C.text1} 40%, ${C.accent2} 100%)`,
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
};
const subtitle = {
  color: C.text2, fontSize: 15, margin: "0 0 24px", lineHeight: 1.65,
  fontFamily: "'Inter', sans-serif", fontWeight: 400,
};
const tplGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 };
const tplCard = {
  background: "transparent",
  border: "none",
  borderRadius: 4, overflow: "visible", cursor: "pointer", padding: 0, textAlign: "left",
  transition: "transform .15s",
  boxShadow: "none",
};
const splitGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 };
const lbl = {
  display: "block", fontSize: 11.5, fontWeight: 700, color: C.accent2,
  margin: "16px 0 7px", textTransform: "uppercase", letterSpacing: "0.7px",
};
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 14px",
  background: C.elevated, border: `1px solid ${C.border}`,
  borderRadius: 10, color: C.text1, fontSize: 14.5, outline: "none",
  transition: "border-color .15s, box-shadow .15s",
};
const chip = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
  background: C.elevated, border: `1px solid ${C.border}`,
  borderRadius: 999, color: C.text2, fontSize: 13.5, cursor: "pointer", fontWeight: 500,
};
const chipActive = { background: `${C.accent}22`, borderColor: C.accent, color: C.accent2 };
const cta = {
  marginTop: 26, width: "100%", padding: "15px", color: "#fff", border: "none",
  borderRadius: 11, fontSize: 16, fontWeight: 700, cursor: "pointer",
  background: C.grad, boxShadow: `0 4px 24px rgba(99,102,241,0.35)`,
  transition: "box-shadow .2s, opacity .15s",
};
const backBtn = {
  padding: "7px 14px", background: C.elevated, border: `1px solid ${C.border}`,
  borderRadius: 9, color: C.text2, fontSize: 13.5, cursor: "pointer",
  fontFamily: "inherit",
};
const copyBtn = {
  position: "absolute", top: 12, insetInlineEnd: 12, zIndex: 2, padding: "6px 12px",
  background: `${C.surface}cc`, backdropFilter: "blur(8px)",
  border: `1px solid ${C.border}`, borderRadius: 7, color: C.text2, fontSize: 12.5, cursor: "pointer",
  fontFamily: "inherit",
};
const badge = { fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.4px" };
const badgeLive  = { border: `1px solid ${C.border}`, color: C.text2, background: `${C.elevated}` };
const badgePolished = { border: `1px solid ${C.accent}44`, background: `${C.accent}14` };
const dlBtn = {
  padding: "5px 13px", background: `${C.accent}14`, border: `1px solid ${C.accent}44`,
  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
  color: C.accent2, transition: "background .15s", fontFamily: "inherit",
};
const fieldErr  = { color: "#f87171", fontSize: 11.5, margin: "4px 0 0", lineHeight: 1.4 };
const codeSelect = {
  boxSizing: "border-box", padding: "10px 8px", background: C.elevated,
  border: `1px solid ${C.border}`, borderRadius: 9, color: C.text1, fontSize: 14,
  outline: "none", cursor: "pointer", minWidth: 82, flexShrink: 0, fontFamily: "inherit",
};
const footerWrap = {
  marginTop: 40, paddingTop: 22, borderTop: `1px solid ${C.border}`,
  display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
  gap: "6px 4px", fontSize: 13, color: C.text3,
};
const footerDot  = { color: C.border, margin: "0 2px" };
const footerLink = { color: C.text2, textDecoration: "none", transition: "color .15s" };

// ── CoverLetterPaper ──────────────────────────────────────────────
function CoverLetterPaper({ tpl, data: d, preview = false }) {
  const paper = {
    background: "#fff", color: "#1a1a1a",
    borderRadius: preview ? 0 : 8, minHeight: preview ? 0 : 500,
    fontFamily: tpl.font, overflow: "hidden",
    boxShadow: preview ? "none" : "0 8px 30px rgba(0,0,0,0.35)",
    width: "100%", boxSizing: "border-box",
  };

  const Paras = ({ text, style = {} }) =>
    text ? text.split("\n\n").filter(Boolean).map((p, i) => (
      <p key={i} style={{ fontSize: 13, lineHeight: 1.78, color: "#333", margin: "0 0 14px", ...style }}>{p}</p>
    )) : null;

  if (tpl.blank) {
    return (
      <div style={paper}>
        <div style={{ padding: "40px 48px", fontSize: 13, lineHeight: 1.85, color: "#333" }}>
          <div style={{ marginBottom: 20 }}>
            {d.name && <div style={{ fontWeight: 600 }}>{d.name}</div>}
            {d.jobTitle && <div>{d.jobTitle}</div>}
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => <div key={i}>{c}</div>)}
          </div>
          {d.date && <div style={{ marginBottom: 20 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20 }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div>{d.company}</div>}
              {d.companyAddress && <div>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontWeight: 600, marginBottom: 16 }}>Re: {d.subject}</div>}
          {d.opening && <div style={{ marginBottom: 16 }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 32 }}>{d.signoff || "Sincerely"},</div>
          {!preview && <div style={{ marginTop: 40 }}>{d.name}</div>}
        </div>
      </div>
    );
  }

  if (tpl.id === "classic") {
    return (
      <div style={paper}>
        <div style={{ padding: "36px 40px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 3, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
              {[d.email, d.phone, d.location].filter(Boolean).join("  ·  ")}
            </div>
            <div style={{ height: 1, background: tpl.accent + "55", marginTop: 12 }} />
          </div>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20, fontSize: 12.5, lineHeight: 1.7, color: "#333" }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999", fontSize: 12 }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111", marginBottom: 16 }}>Re: {d.subject}</div>}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 16, color: "#333" }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "modern") {
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "32%", background: tpl.accent, color: "#fff", padding: "28px 16px", flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 18, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 14 }} />
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, opacity: 0.82, marginBottom: 7, wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
            {(d.recipientName || d.company) && (
              <div style={{ marginBottom: 20, fontSize: 12, lineHeight: 1.7,
                paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
                {d.recipientName && <div style={{ fontWeight: 600, color: "#111" }}>{d.recipientName}</div>}
                {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
                {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
                {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
              </div>
            )}
            {d.subject && <div style={{ fontSize: 12.5, fontWeight: 700, color: tpl.accent, marginBottom: 14 }}>Re: {d.subject}</div>}
            {d.opening && <div style={{ fontSize: 13, marginBottom: 14 }}>Dear {d.opening},</div>}
            <Paras text={d.body} style={{ fontSize: 12.5 }} />
            <Paras text={d.closing} style={{ fontSize: 12.5 }} />
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
              {!preview && <div style={{ fontSize: 13, fontWeight: 600, marginTop: 28, color: "#111" }}>{d.name}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "minimal") {
    return (
      <div style={paper}>
        <div style={{ padding: "36px 42px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>{d.jobTitle}</div>}
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
              {[d.email, d.phone, d.location].filter(Boolean).join("   ·   ")}
            </div>
            <div style={{ height: 2, background: tpl.accent, width: 36, marginTop: 14 }} />
          </div>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 20 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 22, fontSize: 12, lineHeight: 1.7, color: "#555" }}>
              {d.recipientName && <div style={{ fontWeight: 600, color: "#222" }}>{d.recipientName}</div>}
              {d.recipientTitle && <div>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500 }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999" }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 18,
            textTransform: "uppercase", letterSpacing: "1.5px" }}>{d.subject}</div>}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 16, color: "#444" }}>Dear {d.opening},</div>}
          <Paras text={d.body} style={{ color: "#444" }} />
          <Paras text={d.closing} style={{ color: "#444" }} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: "#555" }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "bold") {
    return (
      <div style={paper}>
        <div style={{ background: tpl.accent, padding: "24px 28px 20px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{d.name}</div>
          {d.jobTitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{d.jobTitle}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 9 }}>
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.68)" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {d.date && <div style={{ fontSize: 11.5, color: "#888", marginBottom: 18 }}>{d.date}</div>}
          {(d.recipientName || d.company) && (
            <div style={{ marginBottom: 20, fontSize: 12, lineHeight: 1.7,
              paddingBottom: 16, borderBottom: `2px solid ${tpl.accent}33` }}>
              {d.recipientName && <div style={{ fontWeight: 600 }}>{d.recipientName}</div>}
              {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
              {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
              {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
            </div>
          )}
          {d.subject && (
            <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: "#fff", background: tpl.accent,
              padding: "2px 10px", borderRadius: 3, marginBottom: 16 }}>{d.subject}</div>
          )}
          {d.opening && <div style={{ fontSize: 13, marginBottom: 14, display: "block" }}>Dear {d.opening},</div>}
          <Paras text={d.body} />
          <Paras text={d.closing} />
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
            {!preview && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 28 }}>{d.name}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "elegant") {
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "29%", background: tpl.accent + "0F", padding: "28px 16px",
            borderRight: `1px solid ${tpl.accent}22`, flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>{d.name}</div>
            {d.jobTitle && <div style={{ fontSize: 11, color: tpl.accent, marginBottom: 16, fontStyle: "italic" }}>{d.jobTitle}</div>}
            <div style={{ height: 1, background: tpl.accent + "55", marginBottom: 14 }} />
            {[d.email, d.phone, d.location].filter(Boolean).map((c, i) => (
              <div key={i} style={{ fontSize: 10.5, color: "#555", marginBottom: 8, wordBreak: "break-all" }}>{c}</div>
            ))}
            {d.date && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 5 }}>Date</div>
                <div style={{ fontSize: 11, color: "#555" }}>{d.date}</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: "28px 22px" }}>
            {(d.recipientName || d.company) && (
              <div style={{ marginBottom: 22, fontSize: 12, lineHeight: 1.7,
                paddingBottom: 16, borderBottom: `1px solid ${tpl.accent}33` }}>
                {d.recipientName && <div style={{ fontWeight: 600, color: "#111" }}>{d.recipientName}</div>}
                {d.recipientTitle && <div style={{ color: "#555" }}>{d.recipientTitle}</div>}
                {d.company && <div style={{ fontWeight: 500, color: tpl.accent }}>{d.company}</div>}
                {d.companyAddress && <div style={{ color: "#999", fontSize: 11.5 }}>{d.companyAddress}</div>}
              </div>
            )}
            {d.subject && <div style={{ fontSize: 12.5, fontWeight: 600, color: tpl.accent,
              fontStyle: "italic", marginBottom: 16 }}>Re: {d.subject}</div>}
            {d.opening && <div style={{ fontSize: 13, marginBottom: 16 }}>Dear {d.opening},</div>}
            <Paras text={d.body} />
            <Paras text={d.closing} />
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 13 }}>{d.signoff || "Sincerely"},</div>
              {!preview && <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 36 }}>{d.name}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CoverLetterPaper tpl={{ ...tpl, id: "classic" }} data={d} preview={preview} />;
}

// ── CoverThumbPreview ─────────────────────────────────────────────
function CoverThumbPreview({ tp, isMobile }) {
  const OUTER = isMobile ? 10 : 20;
  const INNER_W = 700;
  const frameRef = useRef(null);
  const [scale, setScale] = useState(isMobile ? 0.30 : 0.42);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale((w - 2 * OUTER) / INNER_W);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [OUTER]);

  const H = Math.round(scale * 906);
  const frameBg = "#c8ced8";

  if (tp.blank) {
    return (
      <div ref={frameRef} style={{ height: H + 2 * OUTER, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 72, color: "#9ca3af", fontWeight: 300, lineHeight: 1 }}>+</div>
      </div>
    );
  }

  return (
    <div ref={frameRef} style={{ padding: OUTER, background: frameBg, overflow: "hidden" }}>
      <div style={{ height: H, overflow: "hidden", position: "relative", background: "#fff",
        boxShadow: "0 3px 14px rgba(0,0,0,0.22)" }}>
        <div style={{ width: INNER_W, transform: `scale(${scale})`, transformOrigin: "top left",
          position: "absolute", top: 0, left: 0, pointerEvents: "none", userSelect: "none" }}>
          <CoverLetterPaper tpl={tp} data={SAMPLE_COVER} preview />
        </div>
      </div>
    </div>
  );
}
