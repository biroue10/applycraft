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
];

// ── Per-template thumbnail samples (6 visible slots on landing) ───
const THUMB_SAMPLES = {
  classic: {
    rtl: true,
    result: {
      name: "يوسف الأمين",
      title: "مهندس برمجيات أول",
      contact: ["youssef@example.com", "+212 661 234 567", "الدار البيضاء، المغرب"],
      summary: "مهندس برمجيات بخبرة تزيد عن عشر سنوات في تطوير تطبيقات الويب والأنظمة الموزعة. متخصص في هندسة الخدمات المصغرة وقواعد البيانات عالية الأداء.",
      sections: [
        { heading: "الخبرة المهنية", items: [
          "كبير مهندسي البرمجيات — مجموعة OCP (2020–الحاضر)",
          "قاد تطوير منصة إدارة البيانات الصناعية لأكثر من 3000 مستخدم",
          "بنى نظام مراقبة في الوقت الفعلي خفّض الأعطال بنسبة 60٪",
          "مهندس برمجيات — Inwi (2016–2020)",
          "بنى نظام الفوترة في الوقت الفعلي لأكثر من 10 ملايين مشترك",
        ]},
        { heading: "المهارات", items: ["Python", "Node.js", "React", "PostgreSQL", "Docker", "Kubernetes"] },
        { heading: "التعليم", items: ["ماجستير علوم الحاسوب — Université Mohammed V، الرباط — 2016"] },
        { heading: "اللغات", items: ["العربية (اللغة الأم)", "الفرنسية (طليق)", "الإنجليزية (محترف)"] },
      ],
    },
  },
  modern: {
    rtl: false,
    result: {
      name: "Léa Tremblay",
      title: "Responsable Marketing Digital",
      contact: ["lea.tremblay@example.com", "+33 6 12 34 56 78", "Paris, France", "linkedin.com/in/leatremblay"],
      summary: "Responsable marketing digital avec 7 ans d'expérience en acquisition client, stratégie de contenu et gestion de campagnes multicanal. Spécialisée dans les startups SaaS B2B.",
      sections: [
        { heading: "Expérience", items: [
          "Head of Marketing — Payfit (2021–présent)",
          "Augmenté le trafic organique de 180 % en 18 mois",
          "Géré un budget publicitaire annuel de 2 M€ sur Google, LinkedIn et Meta",
          "Marketing Manager — Doctolib (2017–2021)",
          "Lancé 4 nouveaux marchés européens en 2 ans",
          "Constitué l'équipe marketing de 2 à 14 personnes",
        ]},
        { heading: "Compétences", items: ["SEO/SEA", "Google Analytics", "HubSpot", "Salesforce", "Copywriting", "AB Testing"] },
        { heading: "Formation", items: ["Master Marketing Digital — ESCP Business School, Paris — 2017"] },
        { heading: "Langues", items: ["Français (langue maternelle)", "Anglais (TOEFL 110)", "Espagnol (intermédiaire)"] },
      ],
    },
  },
  minimal: {
    rtl: false,
    result: {
      name: "Sarah Okonkwo",
      title: "Software Engineer",
      contact: ["s.okonkwo@example.com", "+44 7700 900 142", "London, UK", "github.com/sokonkwo"],
      summary: "Full-stack engineer with 5 years building scalable web apps for fintech and e-commerce. Strong in React, Python, and cloud infrastructure.",
      sections: [
        { heading: "Experience", items: [
          "Software Engineer — Monzo Bank (2022–Present)",
          "Built real-time fraud detection pipeline processing 1M+ daily transactions",
          "Reduced API latency by 40% through Redis caching strategy",
          "Junior Engineer — Jumia (2019–2022)",
          "Developed seller portal used by 120,000 merchants across Africa",
        ]},
        { heading: "Skills", items: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "AWS", "Terraform"] },
        { heading: "Education", items: ["B.Sc. Computer Science — University of Lagos, 2019"] },
      ],
    },
  },
  bold: {
    rtl: false,
    result: {
      name: "Karim Benali",
      title: "Ingénieur Génie Civil | BTP",
      contact: ["k.benali@example.com", "+213 555 123 456", "Alger, Algérie"],
      summary: "Ingénieur génie civil avec 9 ans d'expérience en gestion de projets d'infrastructure à grande échelle. Expert en calculs de structures et coordination de chantiers.",
      sections: [
        { heading: "Expérience", items: [
          "Chef de Projet — Cosider Groupe (2018–présent)",
          "Supervisé la construction d'un complexe résidentiel de 450 logements (120 M€)",
          "Coordonné 60 sous-traitants sur un chantier de 4 ans",
          "Ingénieur Structures — Colas Algérie (2015–2018)",
          "Conçu les fondations de l'autoroute Est-Ouest, tronçon Sétif–Constantine",
        ]},
        { heading: "Compétences", items: ["AutoCAD", "Revit", "ETABS", "Béton précontraint", "Eurocodes", "MS Project"] },
        { heading: "Formation", items: ["Diplôme d'ingénieur — École Nationale Polytechnique, Alger — 2015"] },
      ],
    },
  },
  elegant: {
    rtl: false,
    result: {
      name: "María García López",
      title: "Diseñadora UX Senior",
      contact: ["maria.garcia@example.com", "+34 612 345 678", "Barcelona, España"],
      summary: "Diseñadora UX con 6 años de experiencia creando productos digitales centrados en el usuario para empresas de retail, banca y salud digital.",
      sections: [
        { heading: "Experiencia", items: [
          "UX Lead — Glovo (2021–actualidad)",
          "Rediseñó el flujo de checkout, aumentando la conversión un 22%",
          "Lideró equipo de 5 diseñadoras en 3 mercados simultáneos",
          "Diseñadora UX — CaixaBank (2018–2021)",
          "Dirigió el rediseño de la app móvil con 3M de usuarios activos",
        ]},
        { heading: "Habilidades", items: ["Figma", "Adobe XD", "Investigación de usuarios", "Sistemas de diseño", "HTML/CSS"] },
        { heading: "Formación", items: ["Máster en Diseño de Interacción — IED Barcelona — 2018"] },
        { heading: "Idiomas", items: ["Español (nativo)", "Catalán (nativo)", "Inglés (C1)", "Francés (B2)"] },
      ],
    },
  },
  executive: {
    rtl: false,
    result: {
      name: "David Chen",
      title: "Chief Financial Officer",
      contact: ["d.chen@example.com", "+65 9123 4567", "Singapore", "linkedin.com/in/davidchen-cfo"],
      summary: "CFO with 18 years leading finance at high-growth technology companies across APAC. Track record of IPO preparation, M&A, and scaling finance teams from 5 to 50+.",
      sections: [
        { heading: "Experience", items: [
          "CFO — Sea Limited (2019–Present)",
          "Managed $4.2B annual revenue across Shopee, Garena, and SeaMoney",
          "Led Singapore Exchange dual listing, raising $2.1B in 2021",
          "VP Finance — Grab (2015–2019)",
          "Built financial infrastructure supporting expansion to 8 countries",
        ]},
        { heading: "Skills", items: ["Financial Modeling", "M&A Integration", "Investor Relations", "FP&A", "IFRS", "Power BI"] },
        { heading: "Education", items: ["MBA — INSEAD (Fontainebleau) — 2007", "B.Com. Accounting — NUS Business School — 2003"] },
      ],
    },
  },
  creative: {
    rtl: true,
    result: {
      name: "نادية مالك",
      title: "مصممة تجربة مستخدم",
      contact: ["nadia@example.com", "+213 770 123 456", "الجزائر العاصمة"],
      summary: "مصممة تجربة مستخدم بخبرة 6 سنوات في تصميم واجهات المستخدم للتطبيقات المحمولة وتجارة التجزئة الرقمية. متخصصة في تصميم لغات العربية وتجربة المستخدم ثنائي الاتجاه.",
      sections: [
        { heading: "الخبرة", items: [
          "مصممة رئيسية — Yassir (2022–الحاضر)",
          "أعادت تصميم تطبيق المشاركة برمجيًا لزيادة التقييمات بنسبة 35٪",
          "مصممة UI/UX — Algérie Télécom (2018–2022)",
          "بنت نظام التصميم لتطبيق Idoom Fibre المستخدم من 2M مشترك",
        ]},
        { heading: "المهارات", items: ["Figma", "Illustrator", "UX Research", "تصميم RTL", "Prototyping"] },
        { heading: "التعليم", items: ["بكالوريوس إعلام آلي — ESI Alger — 2018"] },
      ],
    },
  },
  tech: {
    rtl: false,
    result: {
      name: "Ahmed El-Sayed",
      title: "DevOps Engineer",
      contact: ["ahmed@example.com", "+20 100 234 5678", "Cairo, Egypt", "github.com/aelsayed"],
      summary: "DevOps engineer with 7 years automating infrastructure and CI/CD pipelines for fintech and e-commerce platforms across the MENA region.",
      sections: [
        { heading: "Experience", items: [
          "Senior DevOps — Fawry (2021–Present)",
          "Reduced deployment time from 4h to 18min via GitHub Actions + Terraform",
          "Maintained 99.98% uptime for payment gateway processing $200M/month",
          "DevOps Engineer — Souq.com/Amazon (2017–2021)",
          "Migrated 140 microservices to Kubernetes on AWS EKS",
        ]},
        { heading: "Skills", items: ["Kubernetes", "Terraform", "AWS", "Docker", "GitHub Actions", "Prometheus", "Go", "Python"] },
        { heading: "Education", items: ["B.Sc. Computer Engineering — Cairo University — 2017"] },
      ],
    },
  },
  sharp: {
    rtl: false,
    result: {
      name: "Catherine Morrison",
      title: "Corporate Solicitor",
      contact: ["c.morrison@example.com", "+44 20 7946 0102", "London, UK"],
      summary: "Corporate solicitor with 9 years advising on M&A, private equity, and commercial contracts. Qualified in England & Wales. Experience across UK, France, and UAE jurisdictions.",
      sections: [
        { heading: "Experience", items: [
          "Senior Associate — Linklaters LLP (2019–Present)",
          "Led legal due diligence on £1.2B acquisition of Aviva's Italian subsidiary",
          "Drafted and negotiated 40+ SPAs in a single calendar year",
          "Associate — Clifford Chance (2015–2019)",
          "Advised GPs on fund formation for three private equity vehicles totalling £800M",
        ]},
        { heading: "Education", items: ["LPC — BPP University Law School — 2014", "LLB — University of Edinburgh — 2013"] },
        { heading: "Admissions", items: ["Solicitor of England & Wales — 2015", "DIFC registered legal practitioner — 2020"] },
      ],
    },
  },
  nordic: {
    rtl: false,
    result: {
      name: "Erik Lindström",
      title: "Arkitekt | MNAL",
      contact: ["erik@example.com", "+47 400 12 345", "Oslo, Norge"],
      summary: "Arkitekt med 11 års erfaring innen bærekraftig boligbygging og offentlige bygg. Spesialist på passivhus-standarder og BREEAM-sertifisering.",
      sections: [
        { heading: "Erfaring", items: [
          "Prosjektarkitekt — Snøhetta (2019–nå)",
          "Ledet designteam for nytt kulturhus i Bergen (NOK 420M)",
          "Arkitekt — Rambøll Norge (2013–2019)",
          "Tegnet 14 BREEAM Excellent-sertifiserte kontorbygg",
        ]},
        { heading: "Ferdigheter", items: ["Revit", "ArchiCAD", "Rhino", "BREEAM", "Passivhus", "BIM"] },
        { heading: "Utdanning", items: ["Master i arkitektur — NTNU, Trondheim — 2013"] },
        { heading: "Språk", items: ["Norsk (morsmål)", "Engelsk (flytende)", "Svensk (funksjonelt)"] },
      ],
    },
  },
  slate: {
    rtl: false,
    result: {
      name: "Chidinma Obi",
      title: "Finance Manager",
      contact: ["c.obi@example.com", "+33 6 78 90 12 34", "Paris, France"],
      summary: "Finance manager with 8 years in investment banking and corporate finance across West Africa and France. CFA Charterholder. Fluent in English, French, and Igbo.",
      sections: [
        { heading: "Experience", items: [
          "Finance Manager — Total Energies (2021–Present)",
          "Managed $320M annual capex budget across 6 African subsidiaries",
          "Led IFRS 16 transition project, restating 3 years of lease obligations",
          "Associate — BNP Paribas (2016–2021)",
          "Structured project finance deals totalling $1.8B in Sub-Saharan Africa",
        ]},
        { heading: "Skills", items: ["Financial Modeling", "IFRS", "Bloomberg", "SAP", "Power BI", "VBA"] },
        { heading: "Education", items: ["MSc Finance — HEC Paris — 2016", "BSc Economics — University of Lagos — 2014"] },
        { heading: "Certifications", items: ["CFA Charterholder — 2020"] },
      ],
    },
  },
  horizon: {
    rtl: false,
    result: {
      name: "Aïsha Diallo",
      title: "Directrice des Ressources Humaines",
      contact: ["a.diallo@example.com", "+221 77 123 45 67", "Dakar, Sénégal"],
      summary: "DRH avec 10 ans d'expérience dans les télécommunications et le secteur bancaire en Afrique subsaharienne. Spécialisée dans la transformation RH et la gestion des talents en contexte multiculturel.",
      sections: [
        { heading: "Expérience", items: [
          "DRH — Wave Mobile Money (2021–présent)",
          "Mis en place la politique RH pour 800 employés au Sénégal, Côte d'Ivoire et Mali",
          "Responsable RH — Société Générale Sénégal (2014–2021)",
          "Réduit le turnover de 28 % à 11 % en 3 ans via le programme de fidélisation",
        ]},
        { heading: "Compétences", items: ["SIRH (SAP HCM)", "Recrutement", "Formation", "Relations sociales", "Droit du travail OHADA"] },
        { heading: "Formation", items: ["Master RH — Université Paris-Dauphine — 2013"] },
        { heading: "Langues", items: ["Français (bilingue)", "Anglais (C1)", "Wolof (courant)"] },
      ],
    },
  },
  prism: {
    rtl: false,
    result: {
      name: "Priya Sharma",
      title: "Senior Product Manager",
      contact: ["priya.sharma@example.com", "+91 98765 43210", "Bangalore, India", "linkedin.com/in/priyasharma-pm"],
      summary: "Senior PM with 7 years building B2B SaaS products at scale. Led 0→1 launches for payments and analytics verticals, growing ARR from $2M to $28M in two product cycles.",
      sections: [
        { heading: "Experience", items: [
          "Senior Product Manager — Razorpay (2021–Present)",
          "Launched RazorpayX Payroll, onboarding 4,000+ businesses in year one",
          "Reduced payment failure rate by 22% through ML-driven retry logic",
          "Product Manager — Freshworks (2017–2021)",
          "Owned Freshdesk's Analytics module, adding $4.2M in net-new ARR",
        ]},
        { heading: "Skills", items: ["Product Strategy", "SQL", "Mixpanel", "JIRA", "A/B Testing", "Go-to-market"] },
        { heading: "Education", items: ["MBA — IIM Bangalore — 2017", "B.Tech CS — NIT Trichy — 2015"] },
      ],
    },
  },
};

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
  body: "I am writing to express my strong interest in the Senior Product Designer position at Stripe. With eight years of experience crafting intuitive digital experiences for high-growth SaaS companies, I am confident in my ability to contribute meaningfully to your team.\n\nAt Figma, I led the redesign of the core editor interface, shipping 12 major features that improved user satisfaction by 40%. I also established a company-wide design system adopted by 200+ engineers across 40 product squads. Prior to that, at Airbnb, I redesigned the host dashboard and reduced support tickets by 41% through research-driven iteration.\n\nStripe's commitment to making financial infrastructure simple and trustworthy resonates deeply with my design philosophy. I am excited by the challenge of bringing clarity to complex financial flows for millions of merchants worldwide.",
  closing: "Thank you sincerely for your time and consideration. I would welcome the opportunity to discuss how my background in design systems and cross-functional leadership can contribute to Stripe's mission.",
  signoff: "Sincerely",
};

const COVER_THUMB_SAMPLES = {
  classic: {
    name: "Léa Tremblay", jobTitle: "Responsable Marketing Digital",
    email: "lea.tremblay@example.com", phone: "+33 6 12 34 56 78", location: "Paris, France",
    date: "27 juin 2026",
    recipientName: "Mme Dubois", recipientTitle: "Directrice Marketing",
    company: "Payfit", companyAddress: "9 rue du Mail, 75002 Paris",
    subject: "Candidature — Responsable Marketing Digital",
    opening: "Madame Dubois",
    body: "Je me permets de vous adresser ma candidature pour le poste de Responsable Marketing Digital chez Payfit. Fort de sept années d'expérience en acquisition client et gestion de campagnes multicanal pour des startups SaaS B2B, je suis convaincu de pouvoir contribuer significativement à vos objectifs de croissance.\n\nAu cours de mon expérience chez Doctolib, j'ai lancé quatre nouveaux marchés européens en deux ans et constitué une équipe marketing de deux à quatorze personnes. J'ai également géré un budget publicitaire annuel de deux millions d'euros sur Google, LinkedIn et Meta, avec un ROAS moyen de 4,2.\n\nLa vision de Payfit, simplifier la gestion RH et paie pour les PME européennes, rejoint pleinement ma conviction que la technologie doit libérer les équipes des tâches administratives à faible valeur ajoutée.",
    closing: "Je serais ravi d'échanger avec vous sur la manière dont mon profil peut répondre aux enjeux de Payfit. Je reste disponible pour un entretien à votre convenance.",
    signoff: "Cordialement",
  },
  modern: {
    name: "Sarah Okonkwo", jobTitle: "Software Engineer",
    email: "s.okonkwo@example.com", phone: "+44 7700 900 142", location: "London, UK",
    date: "27 June 2026",
    recipientName: "Ms Adeyemi", recipientTitle: "Engineering Manager",
    company: "Monzo Bank", companyAddress: "Broadwalk House, 5 Appold St, London EC2A 2AG",
    subject: "Software Engineer — Backend (Payments)",
    opening: "Ms Adeyemi",
    body: "I am writing to apply for the Backend Software Engineer role in the Payments team at Monzo. With five years of full-stack experience in fintech and e-commerce, and a proven track record of building resilient systems at scale, I am excited by the opportunity to work on infrastructure that millions of people rely on every day.\n\nIn my current role at Jumia, I built and maintained the seller portal used by 120,000 merchants across six African markets. I reduced average page load time by 58% and introduced an event-driven architecture that improved reliability during peak sale periods.\n\nMonzo's commitment to radical transparency and genuine financial wellbeing for its customers is exactly the culture I want to contribute to.",
    closing: "I would welcome the chance to discuss how my background in distributed systems and payments aligns with the team's current priorities.",
    signoff: "Best regards",
  },
  minimal: {
    name: "Karim Benali", jobTitle: "Ingénieur Génie Civil",
    email: "k.benali@example.com", phone: "+213 555 123 456", location: "Alger, Algérie",
    date: "27 juin 2026",
    recipientName: "M. Amrani", recipientTitle: "Directeur Technique",
    company: "Cosider Groupe", companyAddress: "Route de Belouizdad, Alger",
    subject: "Chef de Projet BTP — Complexe Résidentiel Ouest",
    opening: "Monsieur Amrani",
    body: "Je vous soumets ma candidature pour le poste de Chef de Projet sur le chantier du complexe résidentiel Ouest. Ingénieur génie civil depuis neuf ans, j'ai coordonné des projets d'infrastructure à grande échelle impliquant des dizaines de corps de métier et des budgets dépassant les cent millions d'euros.\n\nMon expérience la plus récente chez Colas Algérie m'a permis de maîtriser les fondations sur sols complexes et les bétons à haute performance, compétences directement applicables aux contraintes géotechniques de ce projet.\n\nJe suis convaincu que mon profil et ma connaissance du contexte réglementaire algérien constituent un atout solide pour tenir les délais et garantir la qualité.",
    closing: "Je me tiens disponible pour toute discussion technique à votre convenance.",
    signoff: "Respectueusement",
  },
  bold: {
    name: "María García López", jobTitle: "Diseñadora UX Senior",
    email: "maria.garcia@example.com", phone: "+34 612 345 678", location: "Barcelona, España",
    date: "27 de junio de 2026",
    recipientName: "Sr. Martínez", recipientTitle: "Director de Producto",
    company: "Glovo", companyAddress: "Carrer de Pallars, 65, 08005 Barcelona",
    subject: "UX Lead — Experiencia del usuario en marketplace",
    opening: "Estimado Sr. Martínez",
    body: "Me dirijo a usted para expresar mi interés en el puesto de UX Lead en el equipo de marketplace de Glovo. A lo largo de seis años diseñando productos digitales para empresas de retail, banca y salud, he desarrollado una metodología de diseño centrada en el usuario que equilibra la velocidad de entrega con la profundidad de la investigación.\n\nEn CaixaBank, lideré el rediseño de la aplicación móvil utilizada por tres millones de usuarios activos, logrando un aumento del 18 % en la puntuación NPS en seis meses. Anteriormente, rediseñé el flujo de pago de un e-commerce de moda, incrementando la conversión en un 22 %.\n\nGlovo representa para mí el reto ideal: escalar la experiencia de usuario en múltiples mercados con contextos culturales y de conectividad muy distintos.",
    closing: "Quedo a su disposición para ampliar cualquier aspecto de mi candidatura en la entrevista que considere oportuno.",
    signoff: "Atentamente",
  },
  elegant: {
    name: "David Chen", jobTitle: "Chief Financial Officer",
    email: "d.chen@example.com", phone: "+65 9123 4567", location: "Singapore",
    date: "27 June 2026",
    recipientName: "Mr. Tan", recipientTitle: "Chairman",
    company: "Grab Holdings", companyAddress: "3 Media Close, Singapore 138498",
    subject: "CFO — Grab Holdings",
    opening: "Dear Mr. Tan",
    body: "I write to express my interest in the Chief Financial Officer position at Grab. Over eighteen years in technology-led finance across APAC, I have led functions through hypergrowth, dual listings, and complex multi-jurisdiction regulatory environments — precisely the terrain Grab navigates every quarter.\n\nAs CFO at Sea Limited, I oversaw $4.2 billion in annual revenue across three distinct verticals and led our Singapore Exchange dual listing in 2021, raising $2.1 billion. Prior to that, at Grab, I built the financial infrastructure that supported our expansion to eight countries in four years.\n\nI believe the next chapter for Grab requires a CFO who can navigate both capital markets and operational rigour simultaneously. That is the work I have spent two decades preparing to do.",
    closing: "I would welcome the opportunity to discuss how my experience aligns with Grab's priorities for the year ahead.",
    signoff: "Yours sincerely",
  },
};

// ── Author info (edit here to update the footer) ─────────────────
const AUTHOR = {
  name: "Isaac Biroue",
  email: "hello@applycraft.io",
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
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
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
    photo: form.photo || null,
  };
}

const defaultMaster = {
  name: "", email: "", phone: "", location: "", linkedin: "", website: "",
  headline: "", summary: "",
  jobs: [], education: [], skills: [], certifications: [],
  projects: [], languages: [], achievements: [], volunteer: [],
};

export default function ResumeGenerator() {
  const [navPage, setNavPage] = useState("resume");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sideSearch, setSideSearch] = useState("");
  const [tplSearch, setTplSearch] = useState("");
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
  const [nameError, setNameError] = useState("");
  const [shakeField, setShakeField] = useState("");
  const [phoneCode, setPhoneCode] = useState(() => LANG_CODE[selectedLang?.code] || "+1");
  const [zoomed, setZoomed] = useState(false);
  const [aiPolished, setAiPolished] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [authModal, setAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };
  const [uploadedResume, setUploadedResume] = useState(null);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [appView, setAppView] = useState("landing");
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachBullet, setCoachBullet] = useState("");
  const [coachBulletIdx, setCoachBulletIdx] = useState(0);
  const [coachAnswers, setCoachAnswers] = useState({});
  const [coachResult, setCoachResult] = useState("");
  const [atsOpen, setAtsOpen] = useState(false);
  const [master, setMaster] = useState(() => { try { return JSON.parse(localStorage.getItem("ac_master") || "null") || {...defaultMaster}; } catch { return {...defaultMaster}; } });
  const [masterTab, setMasterTab] = useState("personal");
  const [masterOpen, setMasterOpen] = useState({});
  const [tailorOpen, setTailorOpen] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdKws, setJdKws] = useState(null);
  const [tailorSel, setTailorSel] = useState(null);
  const [skillDraft, setSkillDraft] = useState("");
  useEffect(() => { localStorage.setItem("ac_master", JSON.stringify(master)); }, [master]);
  const [trackerCards, setTrackerCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ac_tracker") || "[]"); } catch { return []; }
  });
  const [trackerModal, setTrackerModal] = useState({ open: false, card: null });
  const [trackerDragId, setTrackerDragId] = useState(null);
  const [trackerDragOver, setTrackerDragOver] = useState(null);
  useEffect(() => { localStorage.setItem("ac_tracker", JSON.stringify(trackerCards)); }, [trackerCards]);
  const [atsText, setAtsText] = useState("");
  const [atsJd, setAtsJd] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [atsFromChecker, setAtsFromChecker] = useState(() => {
    try { return localStorage.getItem("ac_ats_text") || ""; } catch { return ""; }
  });
  const [demoName, setDemoName] = useState("");
  const [demoTitle, setDemoTitle] = useState("");
  const [demoExp, setDemoExp] = useState("");
  const [demoTplIdx, setDemoTplIdx] = useState(0);
  const [demoLang, setDemoLang] = useState("en");
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
  const liveData = buildLiveData({ ...form, phone: fullPhone, photo: photoUrl }, t);
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
  function onNameChange(e) {
    setForm({ ...form, name: e.target.value });
    if (nameError && e.target.value.trim()) setNameError("");
  }
  function onEmailChange(e) {
    setForm({ ...form, email: e.target.value });
    if (emailError) setEmailError(validateEmail(e.target.value));
  }
  function onPhoneChange(e) {
    setForm({ ...form, phone: e.target.value });
    if (phoneError) setPhoneError(validatePhone(e.target.value));
  }

  async function translateCV() {
    if (!form.name || translating) return;
    const langCode = selectedLang?.code || "en";
    if (langCode === "en") return;
    setTranslating(true);
    try {
      const tx = async (text) => {
        if (!text?.trim()) return text;
        const r = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|${langCode}`
        );
        const d = await r.json();
        return d.responseData?.translatedText || text;
      };
      const fields = ["jobTitle", "summary", "experience", "education", "skills",
        "certifications", "projects", "volunteer", "awards"];
      const translated = { ...form };
      for (const key of fields) {
        if (form[key]?.trim()) translated[key] = await tx(form[key]);
      }
      setForm(translated);
    } catch {
      // silently fail — user keeps original
    } finally {
      setTranslating(false);
    }
  }

  function scrollToError(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus();
      // apply shake to the nearest wrapper (the input itself or its parent)
      const target = el.closest("[data-field-wrap]") || el;
      target.classList.remove("ac-shake");
      void target.offsetWidth; // reflow to restart animation
      target.classList.add("ac-shake");
      setTimeout(() => target.classList.remove("ac-shake"), 450);
    }, 280);
  }

  async function generate() {
    const nErr = !form.name.trim() ? "Full name is required." : "";
    const eErr = validateEmail(form.email);
    const pErr = validatePhone(form.phone);
    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (nErr || eErr || pErr) {
      if (nErr)      scrollToError("field-name");
      else if (eErr) scrollToError("field-email");
      else           scrollToError("field-phone");
      return;
    }
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
      const res = await fetch("/api/ai", {
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
      setResult(buildLiveData({ ...form, phone: fullPhone, photo: photoUrl }, t));
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
      <PageHeader
        eyebrow="Resume Builder"
        icon="📄"
        title={t.heading}
        sub={t.chooseTpl}
        pill={`${TEMPLATES.length - 1} templates`}
        isMobile={isMobile}
      />
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

  const field = (key, multiline, ph, id) =>
    multiline ? (
      <textarea id={id || `field-${key}`} value={form[key]} onChange={set(key)} placeholder={ph || ""} rows={5}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
    ) : (
      <input id={id || `field-${key}`} value={form[key]} onChange={set(key)} placeholder={ph || ""} style={inputStyle} />
    );

  // ── Achievement coach helpers ──────────────────────────────────────────────
  const WEAK_OPENERS = /^(responsible for|helped?( to)?|assisted?( with)?|worked on|was part of|involved in|supported?|participated in|contributed to|did |handled |performed |undertook |was involved)/i;
  const isWeakBullet = (line) => {
    const trimmed = line.trim();
    if (trimmed.length < 10) return false;
    const hasNumber = /\d/.test(trimmed);
    if (WEAK_OPENERS.test(trimmed)) return true;
    if (!hasNumber && trimmed.length < 60 && /^(managed|led|ran|ran|overseen?|oversaw)/i.test(trimmed)) return true;
    return false;
  };
  const detectCoachContext = (line) => {
    const l = line.toLowerCase();
    if (/customer|client|support|help.?desk|ticket|complaint|satisfaction/.test(l)) return "customer";
    if (/sales|revenue|quota|deal|pipeline|prospect|clos|upsell|convert/.test(l)) return "sales";
    if (/code|software|develop|engineer|build|deploy|api|database|backend|frontend|bug|feature|ci.?cd/.test(l)) return "tech";
    if (/manag|lead|team|supervis|report|hir|train|mentor|coach|staff/.test(l)) return "management";
    if (/market|campaign|seo|content|social|email|analytic|brand|copywrite|advertis/.test(l)) return "marketing";
    if (/account|financ|budget|invoic|reconcil|forecast|audit|tax|bookkeep/.test(l)) return "finance";
    return "general";
  };
  const COACH_QUESTIONS = {
    customer: [
      { id: "volume",  label: "How many customers or requests per day/week?", ph: "e.g. 40+ daily, 200/week" },
      { id: "channel", label: "Via phone, email, live chat, or in-person?",   ph: "e.g. phone and email" },
      { id: "issue",   label: "What type of issues did you solve?",            ph: "e.g. billing, technical, returns" },
      { id: "metric",  label: "Any satisfaction score or resolution rate?",    ph: "e.g. 96% CSAT, 92% first-call resolution" },
    ],
    sales: [
      { id: "volume",  label: "Revenue generated or quota achieved?",          ph: "e.g. $1.2M ARR, 120% of quota" },
      { id: "channel", label: "How? (calls, demos, partnerships…)",            ph: "e.g. cold outreach and product demos" },
      { id: "metric",  label: "Deals closed or conversion rate?",              ph: "e.g. 24 enterprise deals, 18% conversion" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. grew territory 40%, opened new market" },
    ],
    tech: [
      { id: "action",  label: "What exactly did you build or fix?",            ph: "e.g. REST API, CI/CD pipeline, dashboard" },
      { id: "scale",   label: "Scale or size? (users, requests, servers…)",    ph: "e.g. 500k users, 10M req/day, 200 servers" },
      { id: "metric",  label: "Performance gain or time saved?",               ph: "e.g. 40% faster, reduced errors by 70%" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. unblocked 3 teams, saved $50k/year" },
    ],
    management: [
      { id: "volume",  label: "How many people did you lead?",                 ph: "e.g. 8 engineers, cross-functional team of 12" },
      { id: "action",  label: "Main focus? (delivery, hiring, strategy…)",     ph: "e.g. delivery and roadmap planning" },
      { id: "metric",  label: "Key result or outcome?",                        ph: "e.g. shipped 3 major releases, reduced churn 20%" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. scaled team 2×, hit $2M ARR milestone" },
    ],
    marketing: [
      { id: "channel", label: "Which channels? (SEO, paid, email, social…)",   ph: "e.g. SEO and Google Ads" },
      { id: "metric",  label: "Key metric achieved?",                          ph: "e.g. 120% traffic growth, 3.2× ROAS" },
      { id: "volume",  label: "Budget managed or audience size?",              ph: "e.g. $500k budget, 50k email list" },
      { id: "impact",  label: "Business impact?",                              ph: "e.g. generated 400 leads, +18% revenue" },
    ],
    finance: [
      { id: "action",  label: "What exactly did you manage or produce?",       ph: "e.g. monthly close, budget variance reports" },
      { id: "volume",  label: "Portfolio or budget size?",                     ph: "e.g. $4M budget, 200-account portfolio" },
      { id: "metric",  label: "Accuracy, time saved, or error reduction?",     ph: "e.g. <0.5% variance, 2-day faster close" },
      { id: "impact",  label: "Business or audit impact?",                     ph: "e.g. zero audit findings, saved $80k" },
    ],
    general: [
      { id: "action",  label: "What specific action did you take?",            ph: "e.g. led, built, redesigned, launched" },
      { id: "volume",  label: "Any numbers? (quantity, frequency, scale)",     ph: "e.g. 20/week, team of 5, $100k budget" },
      { id: "method",  label: "How did you do it?",                            ph: "e.g. automation, cross-team collaboration" },
      { id: "metric",  label: "Measurable result?",                            ph: "e.g. 30% faster, saved 10 hours/week" },
      { id: "impact",  label: "Why did it matter to the business?",            ph: "e.g. enabled growth, reduced costs" },
    ],
  };

  const buildStrongBullet = (original, answers, ctx) => {
    const a = answers;
    const clean = original.trim()
      .replace(/^responsible for /i, "")
      .replace(/^helped? (to )?/i, "")
      .replace(/^assisted? (with )?/i, "")
      .replace(/^was part of /i, "")
      .replace(/^involved in /i, "")
      .replace(/^supported? /i, "")
      .replace(/^participated in /i, "")
      .replace(/^contributed to /i, "");

    const parts = [];
    if (ctx === "customer") {
      const vol = a.volume ? `${a.volume}` : "";
      const ch  = a.channel ? ` via ${a.channel}` : "";
      const iss = a.issue ? ` ${a.issue.toLowerCase()} enquiries` : " customer requests";
      const met = a.metric ? `, maintaining ${a.metric}` : "";
      parts.push(`Resolved ${vol}${iss}${ch}${met}.`);
      if (a.metric && !parts[0].includes(a.metric)) parts[0] = parts[0].replace(".", `, achieving ${a.metric}.`);
    } else if (ctx === "sales") {
      const vol = a.volume ? `${a.volume} in revenue` : "revenue targets";
      const ch  = a.channel ? ` through ${a.channel.toLowerCase()}` : "";
      const met = a.metric ? `, closing ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Generated ${vol}${ch}${met}${imp}.`);
    } else if (ctx === "tech") {
      const act = a.action ? a.action : clean;
      const sc  = a.scale ? ` serving ${a.scale}` : "";
      const met = a.metric ? `, improving performance by ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Built and shipped ${act}${sc}${met}${imp}.`);
    } else if (ctx === "management") {
      const vol = a.volume ? `a ${a.volume}` : "a cross-functional team";
      const act = a.action ? ` focused on ${a.action.toLowerCase()}` : "";
      const met = a.metric ? `, delivering ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Led ${vol}${act}${met}${imp}.`);
    } else if (ctx === "marketing") {
      const ch  = a.channel ? `${a.channel} campaigns` : "marketing campaigns";
      const vol = a.volume ? ` managing ${a.volume}` : "";
      const met = a.metric ? `, achieving ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Executed ${ch}${vol}${met}${imp}.`);
    } else if (ctx === "finance") {
      const act = a.action ? a.action : clean;
      const vol = a.volume ? ` for ${a.volume}` : "";
      const met = a.metric ? ` with ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`Managed ${act}${vol}${met}${imp}.`);
    } else {
      const act = a.action ? a.action : clean;
      const vol = a.volume ? ` (${a.volume})` : "";
      const meth = a.method ? ` via ${a.method.toLowerCase()}` : "";
      const met = a.metric ? `, resulting in ${a.metric}` : "";
      const imp = a.impact ? ` — ${a.impact.toLowerCase()}` : "";
      parts.push(`${act.charAt(0).toUpperCase() + act.slice(1)}${vol}${meth}${met}${imp}.`);
    }
    return parts[0].replace(/\s{2,}/g, " ").replace(/\.\./g, ".").replace(/,\s*\./g, ".").trim();
  };

  const weakBullets = form.experience.split("\n").filter(l => isWeakBullet(l));

  const openCoach = (idx = 0) => {
    const weak = weakBullets[idx];
    if (!weak) return;
    setCoachBullet(weak);
    setCoachBulletIdx(idx);
    setCoachAnswers({});
    setCoachResult("");
    setCoachOpen(true);
  };

  const applyCoachResult = () => {
    if (!coachResult) return;
    const updated = form.experience.split("\n").map(l =>
      l.trim() === coachBullet.trim() ? coachResult : l
    ).join("\n");
    setForm({ ...form, experience: updated });
    const remaining = updated.split("\n").filter(l => isWeakBullet(l));
    if (remaining.length > 0) {
      setCoachBullet(remaining[0]);
      setCoachBulletIdx(0);
      setCoachAnswers({});
      setCoachResult("");
    } else {
      setCoachOpen(false);
      setCoachBullet("");
      setCoachResult("");
      setCoachAnswers({});
    }
  };

  // ── ATS checker ───────────────────────────────────────────────────────────
  const computeATSIssues = () => {
    const issues = [];
    const expRaw  = form.experience.trim();
    const expLines = expRaw ? expRaw.split("\n").filter(l => l.trim().length > 5) : [];

    // ── CRITICAL ──
    if (!form.email.trim()) issues.push({
      level: "critical", icon: "✉️", title: "No email address",
      detail: "ATS systems extract email from your resume to create your candidate profile. Without it, your application cannot be processed.",
      fix: "Add email",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-email")?.focus(), 80); }
    });
    if (!form.title.trim()) issues.push({
      level: "critical", icon: "💼", title: "No job title",
      detail: "Your current or target job title is used for keyword matching and candidate ranking. Leaving it blank lowers your ATS score.",
      fix: "Add title",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-title")?.focus(), 80); }
    });
    if (!expRaw) issues.push({
      level: "critical", icon: "📋", title: "Experience section is empty",
      detail: "Work experience is the most heavily weighted section in ATS ranking. An empty section will result in a very low match score.",
      fix: "Add experience",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-experience")?.focus(), 80); }
    });
    if (!form.skills.trim()) issues.push({
      level: "critical", icon: "⚡", title: "No skills listed",
      detail: "ATS systems scan your skills section for exact keyword matches against the job description. This section has the highest keyword density impact.",
      fix: "Add skills",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-skills")?.focus(), 80); }
    });

    // ── WARNING ──
    if (!form.summary.trim()) issues.push({
      level: "warning", icon: "📝", title: "No professional summary",
      detail: "A 2–4 sentence summary at the top increases keyword density and gives ATS systems immediate context about your profile before parsing experience.",
      fix: "Add summary",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-summary")?.focus(), 80); }
    });

    const hasNumbers = expLines.some(l => /\d/.test(l));
    if (expRaw && !hasNumbers) issues.push({
      level: "warning", icon: "🔢", title: "No quantified achievements",
      detail: "Bullets without numbers (%, $, team size, time saved) score lower in ATS ranking and are less compelling to recruiters. Add at least one metric per role.",
      fix: "Open Achievement Coach",
      fixFn: () => { setAtsOpen(false); openCoach(0); }
    });

    const weakLines = expLines.filter(l => isWeakBullet(l));
    if (weakLines.length > 0) issues.push({
      level: "warning", icon: "✍️",
      title: `${weakLines.length} passive bullet ${weakLines.length === 1 ? "opener" : "openers"}`,
      detail: `Phrases like "Responsible for", "Helped", or "Assisted" are passive, keyword-poor, and score lower than active-verb equivalents ("Led", "Built", "Reduced"). They also signal weak impact to human reviewers.`,
      fix: "Fix with Achievement Coach",
      fixFn: () => { setAtsOpen(false); openCoach(0); }
    });

    const longLines = expLines.filter(l => l.trim().length > 160);
    if (longLines.length > 0) issues.push({
      level: "warning", icon: "📏",
      title: `${longLines.length} line${longLines.length > 1 ? "s" : ""} over 160 characters`,
      detail: "Very long single lines are often truncated or misread by ATS parsers. Each bullet point should be one clear, focused sentence — aim for 80–140 characters.",
      fix: "Auto-split at sentence boundaries",
      fixFn: () => {
        const fixed = form.experience.split("\n").map(l => {
          if (l.trim().length > 160) {
            const mid = Math.floor(l.length / 2);
            const idx = l.indexOf(". ", mid);
            if (idx > 0) return l.slice(0, idx + 1) + "\n" + l.slice(idx + 2).trim();
          }
          return l;
        }).join("\n");
        setForm(f => ({ ...f, experience: fixed }));
      }
    });

    const hasDates = expLines.some(l => /\b(19|20)\d{2}\b/.test(l));
    if (expRaw && !hasDates) issues.push({
      level: "warning", icon: "📅", title: "No dates found in experience",
      detail: "ATS systems calculate tenure and employment gaps from year ranges. Include start and end years on each role line (e.g. Jan 2021 – Mar 2024).",
      fix: null
    });

    if (!form.linkedin.trim()) issues.push({
      level: "warning", icon: "🔗", title: "No LinkedIn URL",
      detail: "Many ATS systems auto-link your LinkedIn profile and score completeness partly on its presence. It also helps recruiters verify your background.",
      fix: "Add LinkedIn",
      fixFn: () => { setAtsOpen(false); setTimeout(() => document.getElementById("field-linkedin")?.focus(), 80); }
    });

    // ── INFO ──
    if (!form.education.trim()) issues.push({
      level: "info", icon: "🎓", title: "Education section empty",
      detail: "Some ATS systems require at least one education entry to process an application. Add your highest qualification at a minimum.",
      fix: null
    });
    if (!form.phone.trim()) issues.push({
      level: "info", icon: "📞", title: "No phone number",
      detail: "Phone number is extracted by ATS systems for your candidate profile. Its absence may reduce completeness scoring.",
      fix: null
    });

    const summaryLen = (form.summary.match(/[.!?]/g) || []).length;
    if (summaryLen > 5) issues.push({
      level: "info", icon: "📄", title: "Professional summary may be too long",
      detail: `Your summary appears to have ${summaryLen} sentences. ATS systems prefer concise summaries of 2–4 sentences that are dense with relevant keywords.`,
      fix: null
    });

    return issues;
  };

  // ── ATS text scorer (for standalone ATS page — works on raw pasted text) ──
  const ATS_STOP = new Set(["and","or","the","a","an","in","on","to","for","of","with","at","by","from","as","is","are","was","were","be","been","have","has","had","do","does","did","will","would","can","could","should","may","might","must","shall","not","but","if","then","than","that","this","these","those","it","its","we","our","you","your","they","their","he","she","him","her","i","me","my","us","any","all","more","most","some","such","own","same","other","also","just","into","over","after","before","during","through","between","each","only","very","too","so","up","out","about","no","new","need","work","experience","years","year","role","team","company","skills","ability","strong","proven","excellent","good","great","well","using","use","used","including","include","within","across","multiple","various","key","core","day","days","time","high","low","able","ensure","provide","making","make","take","help","both","per","etc"]);
  const atsTokenize = s => s.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !ATS_STOP.has(w) && isNaN(w));
  const WEAK_ATS = /^(responsible for|helped?( to)?|assisted?( with)?|worked on|was part of|involved in|supported?|participated in|contributed to|did |handled |performed |undertook |was involved)/i;

  const scoreRawResume = (text, jdText) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const issues = [];
    const hasEmail    = /\b[\w.+%-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text);
    const hasPhone    = /(\+?\d[\d\s\-().]{6,14}\d)/.test(text);
    const hasLinkedin = /linkedin\.com/i.test(text);
    const hasExperience = /\b(experience|work history|employment)\b/i.test(text) || /\b(20\d{2}|19[89]\d)\b/.test(text);
    const hasEducation  = /\b(education|degree|university|college|bachelor|master|phd|mba|diploma)\b/i.test(text);
    const hasSkills     = /\b(skills|technologies|tools|expertise|proficient|competencies)\b/i.test(text);
    const hasSummary    = /\b(summary|profile|objective|about me|professional)\b/i.test(text);
    const hasDates      = /\b(20\d{2}|19[89]\d)\b/.test(text);
    const bulletLines   = lines.filter(l => l.length > 15 && l.length < 220);
    const hasNumbers    = bulletLines.some(l => /\d/.test(l));
    const weakLines     = lines.filter(l => { const t = l.trim(); return t.length > 10 && WEAK_ATS.test(t); });
    const longLines     = lines.filter(l => l.length > 180);
    const wordCount     = text.split(/\s+/).filter(Boolean).length;

    if (!hasEmail)      issues.push({ level:"critical", icon:"✉️", title:"No email address detected", detail:"ATS systems extract your email to create your candidate profile. Without it, your application cannot be processed." });
    if (!hasExperience) issues.push({ level:"critical", icon:"📋", title:"No work experience section detected", detail:"Work experience is the most heavily weighted section in ATS ranking. Ensure your experience is clearly labeled." });
    if (!hasSkills)     issues.push({ level:"critical", icon:"⚡", title:"No skills section detected", detail:"ATS systems scan skills for exact keyword matches against the job description. Add a Skills or Technologies section." });
    if (!hasPhone)      issues.push({ level:"warning",  icon:"📞", title:"No phone number detected", detail:"Phone is extracted by ATS systems for your candidate profile." });
    if (!hasLinkedin)   issues.push({ level:"warning",  icon:"🔗", title:"No LinkedIn URL", detail:"Many ATS systems score completeness partly on LinkedIn presence." });
    if (!hasSummary)    issues.push({ level:"warning",  icon:"📝", title:"No professional summary detected", detail:"A 2–4 sentence summary increases keyword density and gives ATS immediate context before parsing experience." });
    if (hasExperience && !hasNumbers) issues.push({ level:"warning", icon:"🔢", title:"No quantified achievements", detail:"Bullets without numbers (%, $, team size) score lower. Add at least one metric per role." });
    if (hasExperience && !hasDates)   issues.push({ level:"warning", icon:"📅", title:"No dates found in experience", detail:"ATS systems calculate tenure from year ranges. Include start/end years on each role." });
    if (weakLines.length > 0) issues.push({ level:"warning", icon:"✍️", title:`${weakLines.length} passive bullet opener${weakLines.length > 1 ? "s" : ""}`, detail:`Phrases like "Responsible for" or "Helped" are passive. Use "Led", "Built", "Reduced" instead.` });
    if (longLines.length > 0) issues.push({ level:"warning", icon:"📏", title:`${longLines.length} line${longLines.length > 1 ? "s" : ""} over 180 characters`, detail:"Very long lines are truncated or misread by ATS parsers. Split into focused bullets under 160 characters." });
    if (wordCount < 200) issues.push({ level:"warning", icon:"📄", title:`Resume too short (${wordCount} words)`, detail:"A strong resume has 350–800 words. Add detail: specific projects, technologies, and measurable outcomes." });
    if (!hasEducation)  issues.push({ level:"info", icon:"🎓", title:"Education section not detected", detail:"Some ATS systems require at least one education entry to complete parsing." });
    if (wordCount > 1200) issues.push({ level:"info", icon:"📏", title:`Resume may be too long (${wordCount} words)`, detail:"Most ATS systems prefer resumes under 2 pages (~800 words). Condense to recent, relevant experience." });

    let kwGap = null;
    if (jdText && jdText.trim().length > 30) {
      const jdWords = new Set(atsTokenize(jdText));
      const cvWords = new Set(atsTokenize(text));
      if (jdWords.size > 3) {
        const present = [...jdWords].filter(w => cvWords.has(w));
        const missing = [...jdWords].filter(w => !cvWords.has(w));
        const pct = Math.round((present.length / jdWords.size) * 100);
        kwGap = { present: present.slice(0, 20), missing: missing.slice(0, 20), pct, total: jdWords.size };
        if (pct < 30) issues.unshift({ level:"critical", icon:"🎯", title:`Low keyword match: ${pct}% vs. job description`, detail:`Only ${pct}% of the JD's keywords appear in your resume. Target 40%+ for strong ATS ranking.` });
        else if (pct < 45) issues.unshift({ level:"warning", icon:"🎯", title:`Keyword match: ${pct}%`, detail:`You match ${pct}% of the JD's keywords. Strong candidates typically hit 45–70% for targeted roles.` });
      }
    }

    const score = Math.max(0, 100
      - issues.filter(i => i.level === "critical").length * 20
      - issues.filter(i => i.level === "warning").length * 8
      - issues.filter(i => i.level === "info").length * 3);
    return { score, issues, kwGap, wordCount };
  };

  // Form completion tracker
  const trackFields = ["name","title","email","phone","location","linkedin","website","summary","experience","education","skills","languages","certifications","projects","volunteer","awards"];
  const filledCount = trackFields.filter(k => form[k]?.trim()).length + (photoUrl ? 1 : 0);
  const totalCount  = trackFields.length + 1;
  const completion  = Math.round(filledCount / totalCount * 100);

  const formContent = tpl ? (
    <div style={{ ...rShell, display: "flex", flexDirection: "column", height: "100%",
      boxSizing: "border-box" }}>

      {/* ── Form header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setStep("templates")} style={backBtn}>← {t.back}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: tpl.accent, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: C.text2 }}>
            Template: <strong style={{ color: C.text1 }}>{tpl.name}</strong>
          </span>
          <button onClick={() => setStep("templates")} style={{ marginLeft: 4, fontSize: 11.5,
            color: C.accent2, background: "none", border: "none", cursor: "pointer",
            padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>
            Change
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* ATS score chip */}
          {(() => {
            const issues = computeATSIssues();
            const score = Math.max(0, 100
              - issues.filter(i => i.level === "critical").length * 20
              - issues.filter(i => i.level === "warning").length * 8
              - issues.filter(i => i.level === "info").length * 3);
            const color = score >= 90 ? "#4ade80" : score >= 70 ? "#fbbf24" : score >= 50 ? "#fb923c" : "#f87171";
            return (
              <button onClick={() => setAtsOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                  background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999,
                  cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: "0.5px" }}>ATS</span>
                <span style={{ fontSize: 12, fontWeight: 800, color }}>{score}</span>
              </button>
            );
          })()}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: C.elevated,
              border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completion}%`,
                background: completion >= 80 ? "#4ade80" : completion >= 40 ? C.grad : `${tpl.accent}`,
                borderRadius: 999, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, whiteSpace: "nowrap",
              minWidth: 36 }}>{completion}%</span>
          </div>
        </div>
      </div>

      {/* Uploaded resume reference banner */}
      {uploadedResume && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 8,
          marginBottom: 14 }}>
          <span style={{ fontSize: 15 }}>📂</span>
          <span style={{ fontSize: 12.5, color: C.text2, flex: 1 }}>
            Reference: <strong style={{ color: C.text1 }}>{uploadedResume.name}</strong>
          </span>
          <button onClick={() => setUploadedResume(null)}
            style={{ fontSize: 11, color: C.text3, background: "none", border: "none",
              cursor: "pointer", padding: 0, fontFamily: "inherit" }}>✕</button>
        </div>
      )}

      <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16, flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          ...(isMobile ? { padding: "16px 12px" } : { overflowY: "auto", height: "100%",
          padding: "20px 20px 32px", scrollbarWidth: "thin" }) }}>

          {/* ── SECTION: Personal Info ── */}
          <SectionHeader icon="👤" title="Personal Info" filled={!!(form.name && form.email)} />

          {/* Photo upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
            padding: "14px 16px", background: C.elevated, border: `1px solid ${C.border}`,
            borderRadius: 10 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              overflow: "hidden", background: C.surface, border: `2px dashed ${photoUrl ? tpl.accent : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 0.2s" }}>
              {photoUrl
                ? <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22, opacity: 0.3 }}>👤</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text1, marginBottom: 4 }}>
                Profile Photo <span style={{ color: C.text3, fontWeight: 400 }}>(optional)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <label htmlFor="photo-upload"
                  style={{ cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.accent2,
                    padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.accent}44`,
                    background: `${C.accent}10`, display: "inline-block" }}>
                  {photoUrl ? "Change" : "Upload"}
                </label>
                <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload} style={{ display: "none" }} />
                {photoUrl && (
                  <button onClick={() => setPhotoUrl(null)}
                    style={{ fontSize: 12, color: "#f87171", background: "none", border: "none",
                      cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    Remove
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 5 }}>
                Appears in sidebar templates
              </div>
            </div>
          </div>

          <div data-field-wrap="">
            <label style={lbl}>{t.name} <span style={{ color: "#f87171" }}>*</span></label>
            <IconInput icon="✏️">
              <input id="field-name" value={form.name} onChange={onNameChange}
                placeholder={t.placeholderName}
                style={{ ...inputStyle, ...(nameError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
            </IconInput>
            {nameError && <p style={fieldErr}>{nameError}</p>}
          </div>
          <label style={lbl}>{t.title}</label>
          <IconInput icon="💼">{field("title", false, t.placeholderTitle)}</IconInput>

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex: 1 }} data-field-wrap="">
              <label style={lbl}>{t.email}</label>
              <IconInput icon="✉️">
                <input id="field-email" value={form.email} onChange={onEmailChange}
                  onBlur={() => setEmailError(validateEmail(form.email))}
                  placeholder={t.placeholderEmail}
                  style={{ ...inputStyle, ...(emailError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
              </IconInput>
              {emailError && <p style={fieldErr}>{emailError}</p>}
            </div>
            <div style={{ flex: 1 }} data-field-wrap="">
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
                <input id="field-phone" value={form.phone} onChange={onPhoneChange}
                  onBlur={() => setPhoneError(validatePhone(form.phone))}
                  placeholder={t.placeholderPhone}
                  style={{ ...inputStyle, flex: 1, ...(phoneError ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}) }} />
              </div>
              {phoneError && <p style={fieldErr}>{phoneError}</p>}
            </div>
          </div>

          <label style={lbl}>{t.location}</label>
          <IconInput icon="📍">{field("location", false, t.placeholderLocation)}</IconInput>

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row", marginTop: 0 }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>{t.linkedin}</label>
              <IconInput icon="🔗">{field("linkedin", false, t.placeholderLinkedin)}</IconInput>
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>{t.website}</label>
              <IconInput icon="🌐">{field("website", false, t.placeholderWebsite)}</IconInput>
            </div>
          </div>

          {/* ── SECTION: Professional ── */}
          <SectionHeader icon="📝" title="Professional" filled={!!(form.summary && form.experience)} />

          <label style={lbl}>{t.summary}</label>
          {field("summary", true, t.placeholderSummary)}
          <Hint text="2–4 sentences. Who you are, your years of experience, and your biggest strength." />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>{t.experience}</label>
            {weakBullets.length > 0 && !coachOpen && (
              <button onClick={() => openCoach(0)}
                style={{ fontSize: 11.5, fontWeight: 700, color: C.accent2,
                  background: `${C.accent}14`, border: `1px solid ${C.accent}33`,
                  borderRadius: 999, padding: "3px 12px", cursor: "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                ✦ Coach me · {weakBullets.length} weak {weakBullets.length === 1 ? "bullet" : "bullets"}
              </button>
            )}
          </div>
          {field("experience", true, t.placeholderEx)}
          <Hint text="One role per line. Format: Job Title — Company | Start – End" />

          {/* ── Achievement Coach Panel ── */}
          {coachOpen && (() => {
            const ctx = detectCoachContext(coachBullet);
            const questions = COACH_QUESTIONS[ctx] || COACH_QUESTIONS.general;
            return (
              <div style={{ background: C.elevated, border: `1.5px solid ${C.accent}44`,
                borderRadius: 12, padding: "18px 20px", marginTop: 8 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.accent2,
                        textTransform: "uppercase", letterSpacing: "1px" }}>
                        ✦ Achievement Coach
                      </div>
                      {weakBullets.length > 1 && (
                        <span style={{ fontSize: 10.5, color: C.text3 }}>
                          {coachBulletIdx + 1} / {weakBullets.length}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.text3, marginBottom: 10 }}>
                      Weak bullet detected — let's make it measurable:
                    </div>
                    <div style={{ fontSize: 12.5, color: C.text2, background: C.bg,
                      border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px",
                      fontStyle: "italic" }}>
                      "{coachBullet.trim()}"
                    </div>
                  </div>
                  <button onClick={() => setCoachOpen(false)}
                    style={{ background: "none", border: "none", color: C.text3,
                      cursor: "pointer", fontSize: 16, padding: "0 0 0 12px", lineHeight: 1 }}>✕</button>
                </div>

                {/* ATRNI framework label */}
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {["Action", "Task", "Result", "Number", "Impact"].map((f, i) => (
                    <span key={f} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 999, background: `${C.accent}${["22","1a","14","0e","08"][i]}`,
                      border: `1px solid ${C.accent}33`, color: C.accent2, letterSpacing: "0.5px" }}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {questions.map(q => (
                    <div key={q.id}>
                      <label style={{ ...lbl, marginBottom: 4, fontSize: 12, color: C.text2 }}>{q.label}</label>
                      <input
                        value={coachAnswers[q.id] || ""}
                        onChange={e => setCoachAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder={q.ph}
                        style={{ ...inputStyle, fontSize: 12.5, padding: "7px 10px" }} />
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <button
                  onClick={() => {
                    const bullet = buildStrongBullet(coachBullet, coachAnswers, ctx);
                    setCoachResult(bullet);
                  }}
                  style={{ width: "100%", padding: "9px 0", background: C.grad, color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", marginBottom: coachResult ? 12 : 0 }}>
                  ✦ Generate strong bullet
                </button>

                {/* Result */}
                {coachResult && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text3,
                      textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                      Suggested bullet:
                    </div>
                    <div style={{ background: `${C.accent}0a`, border: `1px solid ${C.accent}30`,
                      borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                      <textarea
                        value={coachResult}
                        onChange={e => setCoachResult(e.target.value)}
                        rows={2}
                        style={{ ...inputStyle, fontSize: 13, background: "transparent",
                          border: "none", padding: 0, resize: "vertical", boxShadow: "none",
                          outline: "none", color: C.text1, width: "100%", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={applyCoachResult}
                        style={{ flex: 1, padding: "8px 0", background: C.grad, color: "#fff",
                          border: "none", borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit" }}>
                        ✓ Replace in my resume
                      </button>
                      <button onClick={() => { setCoachResult(""); setCoachAnswers({}); }}
                        style={{ padding: "8px 14px", background: "transparent",
                          border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12,
                          color: C.text2, cursor: "pointer", fontFamily: "inherit" }}>
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <label style={lbl}>{t.education}</label>
          {field("education", true, t.placeholderEducation)}
          <Hint text="One entry per line. Format: Degree — Institution | Year" />

          {/* ── SECTION: Skills ── */}
          <SectionHeader icon="⚡" title="Skills & Languages" filled={!!form.skills} />

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>{t.skills}</label>
              {field("skills", false, t.placeholderSkills)}
              <Hint text="Comma-separated: React, Node.js, SQL…" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>{t.languages}</label>
              {field("languages", false, t.placeholderLanguages)}
              <Hint text="English (Fluent), French (B2)…" />
            </div>
          </div>

          {/* ── SECTION: Additional ── */}
          <SectionHeader icon="➕" title="Additional (optional)" filled={!!(form.certifications || form.projects || form.volunteer || form.awards)} />

          <label style={lbl}>{t.certifications}</label>{field("certifications", true, t.placeholderCerts)}
          <label style={lbl}>{t.projects}</label>{field("projects", true, t.placeholderProjects)}
          <label style={lbl}>{t.volunteer}</label>{field("volunteer", true, t.placeholderVolunteer)}
          <label style={lbl}>{t.awards}</label>{field("awards", true, t.placeholderAwards)}

          {/* ── ATS Checker Panel ── */}
          {atsOpen && (() => {
            const issues = computeATSIssues();
            const criticals = issues.filter(i => i.level === "critical");
            const warnings  = issues.filter(i => i.level === "warning");
            const infos     = issues.filter(i => i.level === "info");
            const score = Math.max(0, 100 - criticals.length * 20 - warnings.length * 8 - infos.length * 3);
            const scoreColor = score >= 90 ? "#4ade80" : score >= 70 ? "#fbbf24" : score >= 50 ? "#fb923c" : "#f87171";
            const scoreLabel = score >= 90 ? "ATS Ready" : score >= 70 ? "Good" : score >= 50 ? "Needs attention" : "Action required";
            const LEVEL_META = {
              critical: { label: "Critical", color: "#f87171", bg: "#f8717110" },
              warning:  { label: "Warning",  color: "#fbbf24", bg: "#fbbf2410" },
              info:     { label: "Info",     color: "#60a5fa", bg: "#60a5fa10" },
            };
            return (
              <div style={{ background: C.elevated, border: `1.5px solid ${scoreColor}44`,
                borderRadius: 12, padding: "18px 20px", marginTop: 20, marginBottom: 4 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{scoreLabel}</div>
                        <div style={{ fontSize: 10.5, color: C.text3 }}>ATS Compatibility Score</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.text3, maxWidth: 360, lineHeight: 1.5 }}>
                      Designed to improve readability and parsing across common applicant-tracking systems. Scores reflect form completeness and content quality — not a guarantee of ATS passage.
                    </div>
                  </div>
                  <button onClick={() => setAtsOpen(false)}
                    style={{ background: "none", border: "none", color: C.text3,
                      cursor: "pointer", fontSize: 16, padding: "0 0 0 12px", lineHeight: 1 }}>✕</button>
                </div>

                {/* Score bar */}
                <div style={{ height: 6, borderRadius: 999, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${score}%`, background: scoreColor,
                    borderRadius: 999, transition: "width 0.5s ease" }} />
                </div>

                {issues.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#4ade80", fontSize: 14, fontWeight: 700 }}>
                    ✓ No issues detected — your resume is well-structured for ATS parsing.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {issues.map((issue, idx) => {
                      const meta = LEVEL_META[issue.level];
                      return (
                        <div key={idx} style={{ background: meta.bg, border: `1px solid ${meta.color}28`,
                          borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{issue.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: meta.color,
                                  textTransform: "uppercase", letterSpacing: "0.8px",
                                  background: `${meta.color}20`, borderRadius: 999, padding: "1px 6px" }}>
                                  {meta.label}
                                </span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text1 }}>{issue.title}</span>
                              </div>
                              <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.55, margin: "0 0 6px" }}>
                                {issue.detail}
                              </p>
                              {issue.fix && issue.fixFn && (
                                <button onClick={issue.fixFn}
                                  style={{ fontSize: 11.5, fontWeight: 700, color: meta.color,
                                    background: `${meta.color}18`, border: `1px solid ${meta.color}33`,
                                    borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                                    fontFamily: "inherit" }}>
                                  → {issue.fix}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary counts */}
                {issues.length > 0 && (
                  <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 12,
                    borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
                    {criticals.length > 0 && <span style={{ fontSize: 11.5, color: "#f87171", fontWeight: 700 }}>● {criticals.length} critical</span>}
                    {warnings.length  > 0 && <span style={{ fontSize: 11.5, color: "#fbbf24", fontWeight: 700 }}>● {warnings.length} warnings</span>}
                    {infos.length     > 0 && <span style={{ fontSize: 11.5, color: "#60a5fa", fontWeight: 700 }}>● {infos.length} info</span>}
                    <span style={{ fontSize: 11.5, color: C.text3, marginLeft: "auto" }}>
                      Fix all issues to reach 100
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Actions ── */}
          <div style={{ marginTop: 28, padding: "18px 20px", background: C.elevated,
            border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: `0 -4px 24px rgba(0,0,0,0.22)` }}>
            {selectedLang?.code && selectedLang.code !== "en" && (
              <button onClick={translateCV} disabled={translating || !form.name}
                style={{ ...cta, marginTop: 0, marginBottom: 10, background: "transparent",
                  border: `1.5px solid ${C.borderHi}`, color: C.text1,
                  opacity: (translating || !form.name) ? 0.5 : 1 }}>
                {translating ? "⏳ Translating…" : `🌍 Translate to ${selectedLang.name}`}
              </button>
            )}
            <button onClick={generate} disabled={loading}
              style={{ ...cta, marginTop: 0, background: C.grad,
                opacity: loading ? 0.6 : 1,
                boxShadow: `0 6px 28px rgba(99,102,241,0.45)` }}>
              {loading ? t.generating : "✨ " + t.generate}
            </button>
            {result && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={downloadPDF}
                  style={{ ...dlBtn, flex: 1, justifyContent: "center", display: "flex",
                    alignItems: "center", gap: 5, padding: "10px 8px", fontSize: 13,
                    borderColor: tpl.accent, color: tpl.accent }}>
                  ↓ PDF
                </button>
                <button onClick={downloadDOCX}
                  style={{ ...dlBtn, flex: 1, justifyContent: "center", display: "flex",
                    alignItems: "center", gap: 5, padding: "10px 8px", fontSize: 13,
                    borderColor: tpl.accent, color: tpl.accent }}>
                  ↓ DOCX
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── Preview column ── */}
        <div style={{ minWidth: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          ...(isMobile ? { padding: "16px 12px", marginTop: 16 } : { overflowY: "auto", height: "100%",
          padding: "20px 20px 32px", scrollbarWidth: "thin" }) }}>
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
      <PageHeader
        eyebrow="Cover Letter"
        icon="✉️"
        title="Cover Letter Templates"
        sub="Choose a template to start writing your cover letter."
        pill={`${COVER_TEMPLATES.length - 1} templates`}
        isMobile={isMobile}
      />
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
      <div style={{ ...splitGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "stretch" }}>
        {/* Left: form */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: isMobile ? "16px 12px" : "20px 20px 32px" }}>
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
        <div style={{ minWidth: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: isMobile ? "16px 12px" : "20px 20px 32px", marginTop: isMobile ? 16 : 0 }}>
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
    { id: "master",    icon: "⭐", label: "Master Profile" },
    { id: "cover",     icon: "✉️",  label: "Cover Letter" },
    { id: "tracker",   icon: "📋", label: "Job Tracker" },
    { id: "ats",       icon: "🎯", label: "ATS Checker" },
    { id: "signature", icon: "✍️",  label: "Email Signature", soon: true },
    { id: "website",   icon: "🌐", label: "Personal Website", soon: true },
    { id: "about",     icon: "ℹ️",  label: "About" },
  ];

  const COMING_SOON_COPY = {
    signature: {
      title: "Email Signature",
      sub: "Professional, multilingual email signatures — matching your resume style.",
      cta: "Want it the moment it launches?",
    },
    website: {
      title: "Personal Website",
      sub: "Turn your resume into a shareable personal site in one click.",
      cta: "Want early access?",
    },
  };

  const ComingSoon = ({ id, label }) => {
    const copy = COMING_SOON_COPY[id] || { title: label, sub: "This feature is on its way.", cta: "Stay tuned:" };
    return (
      <div style={{ padding: isMobile ? 20 : 40, maxWidth: 560 }}>
        <PageHeader eyebrow="Coming Soon" icon="🚧" title={copy.title} sub={copy.sub} isMobile={isMobile} />
        <div style={{ marginTop: 8, fontSize: 14.5, color: C.text2 }}>
          {copy.cta}{" "}
          <a href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent(copy.title + " — early access")}`}
            style={{ color: C.accent2, fontWeight: 600, textDecoration: "none" }}>
            {AUTHOR.email} →
          </a>
        </div>
      </div>
    );
  };


  const ATSPage = () => {
    const [localText, setLocalText] = useState(atsText || atsFromChecker || "");
    const [localJd, setLocalJd] = useState(atsJd || "");
    const [result, setResult] = useState(atsResult);
    const [running, setRunning] = useState(false);

    const check = () => {
      if (localText.trim().length < 40) return;
      setRunning(true);
      setTimeout(() => {
        const r = scoreRawResume(localText, localJd);
        setResult(r);
        setAtsResult(r);
        setAtsText(localText);
        setAtsJd(localJd);
        if (atsFromChecker) {
          try { localStorage.removeItem("ac_ats_text"); } catch {}
          setAtsFromChecker("");
        }
        setRunning(false);
      }, 150);
    };

    const importToBuilder = () => {
      if (!localText.trim()) return;
      setForm(f => ({ ...f, experience: localText }));
      setNavPage("resume");
      setStep("templates");
    };

    const scoreColor = !result ? C.accent2
      : result.score >= 80 ? "#4ade80"
      : result.score >= 60 ? "#fbbf24"
      : result.score >= 40 ? "#fb923c" : "#f87171";

    const scoreLabel = !result ? "" : result.score >= 80 ? "ATS Ready" : result.score >= 60 ? "Needs Work" : result.score >= 40 ? "Action Required" : "Critical Issues";

    const IssueRow = ({ issue }) => {
      const bColor = issue.level === "critical" ? "#f87171" : issue.level === "warning" ? "#fbbf24" : "#60a5fa";
      const bBg    = issue.level === "critical" ? "#450a0a44" : issue.level === "warning" ? "#431407aa" : "#1e3a5f44";
      return (
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{issue.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 4,
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {issue.title}
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                background: bBg, color: bColor, border: `1px solid ${bColor}22`,
                textTransform: "uppercase", letterSpacing: ".8px", flexShrink: 0 }}>
                {issue.level}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>{issue.detail}</div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: isMobile ? 16 : 32, maxWidth: 900 }}>
        <PageHeader eyebrow="Free Tool" icon="🎯" title="ATS Resume Checker"
          sub="Paste your resume and get an instant ATS score, keyword gap analysis, and a prioritized fix list. Nothing is uploaded — runs entirely in your browser."
          isMobile={isMobile} />

        {atsFromChecker && (
          <div style={{ background: `${C.accent}14`, border: `1.5px solid ${C.accent}40`,
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 13.5, color: C.text1, flex: 1 }}>Resume text detected from the ATS Checker page.</span>
            <button onClick={() => { setLocalText(atsFromChecker); setTimeout(check, 50); }}
              style={{ fontSize: 12.5, fontWeight: 700, color: C.accent2, background: "none",
                border: `1px solid ${C.accent}40`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              Load & check →
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 8 }}>Your resume</div>
            <textarea value={localText} onChange={e => setLocalText(e.target.value)}
              placeholder={"Paste your full resume here...\n\nJane Smith\njane@email.com | +1 555 000 0000\n\nEXPERIENCE\nSenior Engineer — Acme (2021–Present)\n• Led migration cutting deploy time 60%\n\nSKILLS\nPython, React, AWS"}
              style={{ width: "100%", height: 240, resize: "vertical", background: C.elevated,
                border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text1,
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, lineHeight: 1.6,
                padding: "12px 14px", outline: "none", fontWeight: 400 }} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 8 }}>Job description <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></div>
            <textarea value={localJd} onChange={e => setLocalJd(e.target.value)}
              placeholder={"Paste the job description here to get a keyword gap analysis.\n\nWith it, you'll see:\n  • Which keywords you match ✓\n  • Which are missing ✗\n  • Your keyword match %\n\nWithout it, you still get a full ATS readiness score."}
              style={{ width: "100%", height: 240, resize: "vertical", background: C.elevated,
                border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text1,
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, lineHeight: 1.6,
                padding: "12px 14px", outline: "none", fontWeight: 400 }} />
          </div>
        </div>

        <button onClick={check} disabled={running || localText.trim().length < 40}
          style={{ width: "100%", padding: "14px", background: C.grad, border: "none",
            borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", opacity: (running || localText.trim().length < 40) ? 0.5 : 1,
            marginBottom: 32 }}>
          {running ? "Analysing…" : "Check My Resume →"}
        </button>

        {result && (<>
          {/* Score */}
          <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, letterSpacing: "-2px", lineHeight: 1 }}>
              {result.score}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: scoreColor, marginTop: 6 }}>{scoreLabel}</div>
            <div style={{ fontSize: 12.5, color: C.text3, marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
              ATS Readiness Score — reflects structure, completeness, and content quality.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
              {result.issues.filter(i => i.level === "critical").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#450a0a44", color: "#f87171", border: "1px solid #7f1d1d44" }}>
                  {result.issues.filter(i => i.level === "critical").length} Critical
                </span>
              )}
              {result.issues.filter(i => i.level === "warning").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#43140744", color: "#fbbf24", border: "1px solid #92400e44" }}>
                  {result.issues.filter(i => i.level === "warning").length} Warning
                </span>
              )}
              {result.issues.filter(i => i.level === "info").length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#1e3a5f44", color: "#60a5fa", border: "1px solid #1d4ed844" }}>
                  {result.issues.filter(i => i.level === "info").length} Info
                </span>
              )}
              {result.issues.length === 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "#14532d44", color: "#4ade80", border: "1px solid #16a34a44" }}>All clear</span>
              )}
            </div>
          </div>

          {/* Keyword gap */}
          {result.kwGap && (
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>Keyword Match</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.text1 }}>{result.kwGap.pct}%</span>
                  <span style={{ fontSize: 13, color: C.text2, marginLeft: 8 }}>keyword match with JD</span>
                </div>
                <div style={{ fontSize: 12, color: C.text3 }}>
                  {result.kwGap.present.length} matched · {result.kwGap.missing.length} missing
                </div>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ height: "100%", width: `${result.kwGap.pct}%`, background: C.grad, borderRadius: 999, transition: "width .6s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Matched</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {result.kwGap.present.map(w => (
                  <span key={w} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#14532d44", color: "#4ade80", border: "1px solid #16a34a44" }}>✓ {w}</span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Missing</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.kwGap.missing.length > 0
                  ? result.kwGap.missing.map(w => <span key={w} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#450a0a44", color: "#f87171", border: "1px solid #7f1d1d44" }}>✗ {w}</span>)
                  : <span style={{ fontSize: 13, color: "#4ade80" }}>✓ No significant missing keywords!</span>
                }
              </div>
            </div>
          )}

          {/* Issues */}
          {result.issues.length === 0
            ? <div style={{ background: "#14532d22", border: "1px solid #16a34a44", borderRadius: 12, padding: "20px 24px", color: "#4ade80", fontWeight: 600, textAlign: "center", marginBottom: 24 }}>
                ✓ No significant issues — your resume is well-structured for ATS parsing.
              </div>
            : <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>Issues</div>
                {result.issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
              </>
          }

          {/* Fix CTA */}
          <div style={{ background: `${C.accent}0E`, border: `1.5px solid ${C.accent}28`, borderRadius: 14, padding: "24px", textAlign: "center", marginTop: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text1, marginBottom: 8 }}>Fix these issues in the builder</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 20, lineHeight: 1.6 }}>
              ApplyCraft shows your live ATS score as you type. Pick a template, fill in the gaps, and export a polished PDF or DOCX — free, no account needed.
            </div>
            <button onClick={importToBuilder}
              style={{ padding: "12px 28px", background: C.grad, border: "none", borderRadius: 9,
                color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 20px ${C.accent}44` }}>
              Open in Resume Builder →
            </button>
          </div>
        </>)}
      </div>
    );
  };

  const AboutPage = () => (
    <div style={{ padding: isMobile ? 20 : 40, maxWidth: 720 }}>
      <PageHeader
        eyebrow="About"
        icon="✦"
        title="About ApplyCraft"
        sub="A free, browser-first tool for building professional resumes and cover letters — no account required and no paywall for the core builder."
        isMobile={isMobile}
      />

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 36 }} />

      {/* Mission */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>Mission</div>
        <p style={{ fontSize: 14.5, color: C.text1, lineHeight: 1.8, margin: 0 }}>
          Getting a job is hard enough without fighting the tools meant to help you. ApplyCraft
          gives every job seeker — regardless of budget or background — free access to polished,
          ATS-friendly documents in 50+ languages. No account, no paywall, no catch.
        </p>
      </div>

      {/* What you can do */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 16 }}>What you can do</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[
            ["📄", "Build a resume", "Choose from 22 professional templates with live preview."],
            ["✉️", "Write a cover letter", "6 matching cover letter styles with full customisation."],
            ["🌍", "50+ languages", "Full RTL support for Arabic, Hebrew and more."],
            ["⬇️", "PDF & DOCX export", "Download in the format any employer expects."],
            ["🔒", "Browser-first", "Build and export without creating an account or cloud profile."],
            ["✦", "AI suggestions", "Optional AI polish to sharpen your wording instantly."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: C.elevated, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 36 }} />

      {/* Built by */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>Built by</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%",
            background: C.grad, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            IB
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>Isaac Biroue</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 3 }}>
              Developer & designer — building tools that make job seekers' lives easier.
            </div>
            {AUTHOR.github && (
              <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: C.accent2, textDecoration: "none", marginTop: 4, display: "inline-block" }}>
                GitHub →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stack */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: C.accent2, marginBottom: 12 }}>Tech stack</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["React 18", "Vite 6", "jsPDF", "docx.js", "Cloudflare Pages"].map(t => (
            <span key={t} style={{ fontSize: 12.5, padding: "4px 12px", borderRadius: 999,
              background: C.elevated, border: `1px solid ${C.border}`, color: C.text2 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 28 }} />

      {/* Footer links */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <button onClick={() => setAppView("landing")}
          style={{ fontSize: 13.5, color: C.accent2, background: "none", border: "none",
            cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
          ← Back to landing page
        </button>
        {AUTHOR.github && (
          <a href={`${AUTHOR.github}/applycraft`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13.5, color: C.text2, textDecoration: "none" }}>
            View source on GitHub
          </a>
        )}
      </div>
    </div>
  );

  // ── Job Tracker ─────────────────────────────────────────────────────
  const TRACKER_COLS = [
    { id: "saved",      label: "Saved",      icon: "🔖", color: "#64748B" },
    { id: "preparing",  label: "Preparing",  icon: "✏️",  color: "#6366F1" },
    { id: "applied",    label: "Applied",    icon: "📤", color: "#3B82F6" },
    { id: "interview",  label: "Interview",  icon: "🎤", color: "#F59E0B" },
    { id: "offer",      label: "Offer",      icon: "🎉", color: "#10B981" },
    { id: "rejected",   label: "Rejected",   icon: "✕",  color: "#EF4444" },
  ];

  const newCard = (col) => ({
    id: `tc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    column: col,
    company: "", position: "", jobDescription: "", salary: "", link: "",
    resume: "", coverLetter: "", interviewDate: "", notes: "",
    recruiter: "", reminder: "",
    createdAt: Date.now(),
  });

  const saveCard = (card) => {
    setTrackerCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      return exists ? prev.map(c => c.id === card.id ? card : c) : [...prev, card];
    });
    setTrackerModal({ open: false, card: null });
  };

  const deleteCard = (id) => {
    setTrackerCards(prev => prev.filter(c => c.id !== id));
    setTrackerModal({ open: false, card: null });
  };

  const moveCard = (id, toCol) => {
    setTrackerCards(prev => prev.map(c => c.id === id ? { ...c, column: toCol } : c));
  };

  const trackerContent = (() => {
    const col = TRACKER_COLS.find(c => c.id === (trackerModal.card?.column || "saved"));
    const editCard = trackerModal.card;

    return (
      <div style={{ padding: isMobile ? "16px 8px" : "24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800,
              color: C.text1, letterSpacing: "-0.5px" }}>Job Tracker</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.text2 }}>
              {trackerCards.length} application{trackerCards.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          {/* Stats chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Applied", count: trackerCards.filter(c => ["applied","interview","offer"].includes(c.column)).length, color: "#3B82F6" },
              { label: "Interviews", count: trackerCards.filter(c => c.column === "interview").length, color: "#F59E0B" },
              { label: "Offers", count: trackerCards.filter(c => c.column === "offer").length, color: "#10B981" },
            ].map(s => (
              <div key={s.label} style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`,
                borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: s.color }}>
                {s.count} {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban board */}
        <div style={{ overflowX: "auto", margin: isMobile ? "0 -8px" : "0 -20px" }}>
        <div style={{ display: "flex", gap: 14, padding: isMobile ? "0 8px 16px" : "0 20px 16px",
          alignItems: "flex-start", minHeight: 400, minWidth: "max-content" }}>
          {TRACKER_COLS.map(tcol => {
            const cards = trackerCards.filter(c => c.column === tcol.id);
            const isDragTarget = trackerDragOver === tcol.id;
            return (
              <div key={tcol.id}
                onDragOver={e => { e.preventDefault(); setTrackerDragOver(tcol.id); }}
                onDragLeave={() => setTrackerDragOver(null)}
                onDrop={e => {
                  e.preventDefault();
                  if (trackerDragId) moveCard(trackerDragId, tcol.id);
                  setTrackerDragId(null); setTrackerDragOver(null);
                }}
                style={{ flex: "0 0 220px", background: isDragTarget ? `${tcol.color}18` : C.surface,
                  border: `1.5px solid ${isDragTarget ? tcol.color : C.border}`,
                  borderRadius: 12, padding: "12px 10px", minHeight: 160,
                  transition: "border-color 0.15s, background 0.15s" }}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{tcol.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tcol.color,
                      textTransform: "uppercase", letterSpacing: "0.8px" }}>{tcol.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text3,
                      background: C.elevated, borderRadius: 999, padding: "1px 8px",
                      border: `1px solid ${C.border}` }}>{cards.length}</span>
                    <button onClick={() => setTrackerModal({ open: true, card: { ...newCard(tcol.id) } })}
                      style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                        width: 22, height: 22, cursor: "pointer", color: C.text3, fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1, padding: 0, fontFamily: "inherit" }}>+</button>
                  </div>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cards.map(card => (
                    <div key={card.id}
                      draggable
                      onDragStart={() => setTrackerDragId(card.id)}
                      onDragEnd={() => { setTrackerDragId(null); setTrackerDragOver(null); }}
                      onClick={() => setTrackerModal({ open: true, card: { ...card } })}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9,
                        padding: "10px 12px", cursor: "grab", transition: "transform 0.1s, box-shadow 0.1s",
                        opacity: trackerDragId === card.id ? 0.45 : 1,
                        borderLeft: `3px solid ${tcol.color}` }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px #0006"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginBottom: 3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {card.company || <span style={{ color: C.text3 }}>Company</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.text2, marginBottom: 6,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {card.position || <span style={{ color: C.text3 }}>Position</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {card.salary && (
                          <span style={{ fontSize: 10, color: "#10B981", background: "#10B98114",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{card.salary}</span>
                        )}
                        {card.interviewDate && (
                          <span style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B14",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>📅 {card.interviewDate}</span>
                        )}
                        {card.reminder && (
                          <span style={{ fontSize: 10, color: "#6366F1", background: "#6366F114",
                            padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>⏰</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 8px", color: C.text3, fontSize: 12 }}>
                    Drop cards here
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>

        {/* Add first application CTA */}
        {trackerCards.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 32, padding: "28px 24px",
            background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 8 }}>
              Start tracking your applications
            </div>
            <div style={{ fontSize: 13, color: C.text2, marginBottom: 20 }}>
              Click + in any column, or drag cards between stages as you progress.
            </div>
            <button onClick={() => setTrackerModal({ open: true, card: { ...newCard("saved") } })}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Add first application
            </button>
          </div>
        )}

        {/* ── Detail Modal ── */}
        {trackerModal.open && editCard && (() => {
          const tcol = TRACKER_COLS.find(c => c.id === editCard.column) || TRACKER_COLS[0];
          const isNew = !trackerCards.find(c => c.id === editCard.id);
          const setField = (k) => (e) => setTrackerModal(m => ({ ...m, card: { ...m.card, [k]: e.target.value } }));
          const mInput = { width: "100%", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: C.text1,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

          return (
            <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
              onClick={e => { if (e.target === e.currentTarget) setTrackerModal({ open: false, card: null }); }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18,
                width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", padding: 0 }}>

                {/* Modal header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
                  background: `${tcol.color}10`, borderRadius: "18px 18px 0 0", position: "sticky", top: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{tcol.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.text1 }}>
                        {isNew ? "New Application" : (editCard.company || "Application")}
                      </div>
                      <div style={{ fontSize: 12, color: tcol.color, fontWeight: 600 }}>{tcol.label}</div>
                    </div>
                  </div>
                  <button onClick={() => setTrackerModal({ open: false, card: null })}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                      width: 32, height: 32, cursor: "pointer", color: C.text2, fontSize: 16,
                      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* Move to column */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1px", color: C.text3, display: "block", marginBottom: 8 }}>Stage</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {TRACKER_COLS.map(tc => (
                        <button key={tc.id}
                          onClick={() => setTrackerModal(m => ({ ...m, card: { ...m.card, column: tc.id } }))}
                          style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${editCard.column === tc.id ? tc.color : C.border}`,
                            background: editCard.column === tc.id ? `${tc.color}20` : "transparent",
                            color: editCard.column === tc.id ? tc.color : C.text2,
                            cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s" }}>
                          {tc.icon} {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core fields */}
                  {[
                    { k: "company",   label: "Company *",       ph: "e.g. Stripe" },
                    { k: "position",  label: "Position *",      ph: "e.g. Senior Engineer" },
                    { k: "salary",    label: "Salary / Range",  ph: "e.g. $120k–$140k" },
                    { k: "link",      label: "Job listing URL", ph: "https://..." },
                    { k: "recruiter", label: "Recruiter contact", ph: "Name · email · LinkedIn" },
                    { k: "resume",    label: "Resume used",     ph: "e.g. Atlas template — tech variant" },
                    { k: "coverLetter", label: "Cover letter used", ph: "e.g. Modern template" },
                    { k: "interviewDate", label: "Interview date", ph: "e.g. 2026-07-15 at 14:00" },
                    { k: "reminder",  label: "Follow-up reminder", ph: "e.g. Follow up if no reply by July 10" },
                  ].map(({ k, label, ph }) => (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                        display: "block", marginBottom: 5 }}>{label}</label>
                      <input value={editCard[k] || ""} onChange={setField(k)}
                        placeholder={ph} style={mInput}
                        onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                    </div>
                  ))}

                  {/* Job description */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                      display: "block", marginBottom: 5 }}>Job description / key requirements</label>
                    <textarea value={editCard.jobDescription || ""} onChange={setField("jobDescription")}
                      placeholder="Paste the job description or key points to tailor your resume..."
                      rows={4} style={{ ...mInput, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: C.text2,
                      display: "block", marginBottom: 5 }}>Notes</label>
                    <textarea value={editCard.notes || ""} onChange={setField("notes")}
                      placeholder="Interview feedback, impressions, to-dos..."
                      rows={3} style={{ ...mInput, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = tcol.color; e.target.style.boxShadow = `0 0 0 3px ${tcol.color}22`; }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveCard(editCard)}
                        style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                          padding: "10px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        {isNew ? "Add application" : "Save changes"}
                      </button>
                      <button onClick={() => setTrackerModal({ open: false, card: null })}
                        style={{ background: "transparent", color: C.text2, border: `1px solid ${C.border}`,
                          borderRadius: 8, padding: "10px 16px", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                        Cancel
                      </button>
                    </div>
                    {!isNew && (
                      <button onClick={() => deleteCard(editCard.id)}
                        style={{ background: "transparent", color: "#EF4444", border: "1px solid #EF444430",
                          borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  })();

  // ── Master Profile ──────────────────────────────────────────────────
  const masterContent = (() => {
    const uid = () => `m${Date.now()}${Math.random().toString(36).slice(2,5)}`;
    const upM = (k, v) => setMaster(m => ({...m, [k]: v}));
    const mField = (k) => (e) => upM(k, e.target.value);

    // Job helpers
    const addJob = () => { const id = uid(); setMaster(m => ({...m, jobs: [...m.jobs, {id, company:"", title:"", startDate:"", endDate:"", current:false, location:"", bullets:[""]}]})); setMasterOpen(o => ({...o, [id]: true})); };
    const upJob = (id, ch) => upM("jobs", master.jobs.map(j => j.id===id ? {...j,...ch} : j));
    const delJob = (id) => upM("jobs", master.jobs.filter(j => j.id!==id));
    const upJobBullet = (jid, bi, v) => upJob(jid, {bullets: master.jobs.find(j=>j.id===jid).bullets.map((b,i) => i===bi ? v : b)});
    const addJobBullet = (jid) => upJob(jid, {bullets: [...(master.jobs.find(j=>j.id===jid)?.bullets||[]), ""]});
    const delJobBullet = (jid, bi) => upJob(jid, {bullets: master.jobs.find(j=>j.id===jid).bullets.filter((_,i) => i!==bi)});

    // Education helpers
    const addEdu = () => { const id = uid(); setMaster(m => ({...m, education: [...m.education, {id, school:"", degree:"", field:"", startDate:"", endDate:"", gpa:""}]})); setMasterOpen(o => ({...o, [id]: true})); };
    const upEdu = (id, ch) => upM("education", master.education.map(e => e.id===id ? {...e,...ch} : e));
    const delEdu = (id) => upM("education", master.education.filter(e => e.id!==id));

    // Skills helpers
    const addSkill = (name) => { if (!name.trim() || master.skills.find(s => s.name.toLowerCase()===name.trim().toLowerCase())) return; upM("skills", [...master.skills, {id: uid(), name: name.trim()}]); setSkillDraft(""); };
    const delSkill = (id) => upM("skills", master.skills.filter(s => s.id!==id));

    // Other sections helpers
    const addCert = () => upM("certifications", [...master.certifications, {id:uid(), name:"", issuer:"", date:"", url:""}]);
    const upCert = (id, ch) => upM("certifications", master.certifications.map(c => c.id===id ? {...c,...ch} : c));
    const delCert = (id) => upM("certifications", master.certifications.filter(c => c.id!==id));

    const addProject = () => upM("projects", [...master.projects, {id:uid(), name:"", tech:"", url:"", description:""}]);
    const upProject = (id, ch) => upM("projects", master.projects.map(p => p.id===id ? {...p,...ch} : p));
    const delProject = (id) => upM("projects", master.projects.filter(p => p.id!==id));

    const addLang = () => upM("languages", [...master.languages, {id:uid(), name:"", level:""}]);
    const upLang = (id, ch) => upM("languages", master.languages.map(l => l.id===id ? {...l,...ch} : l));
    const delLang = (id) => upM("languages", master.languages.filter(l => l.id!==id));

    const addAch = () => upM("achievements", [...master.achievements, {id:uid(), title:"", description:"", date:""}]);
    const upAch = (id, ch) => upM("achievements", master.achievements.map(a => a.id===id ? {...a,...ch} : a));
    const delAch = (id) => upM("achievements", master.achievements.filter(a => a.id!==id));

    const addVol = () => upM("volunteer", [...master.volunteer, {id:uid(), org:"", role:"", startDate:"", endDate:"", description:""}]);
    const upVol = (id, ch) => upM("volunteer", master.volunteer.map(v => v.id===id ? {...v,...ch} : v));
    const delVol = (id) => upM("volunteer", master.volunteer.filter(v => v.id!==id));

    const toggleOpen = (id) => setMasterOpen(o => ({...o, [id]: !o[id]}));

    // Keyword analysis
    const STOP = new Set(["and","or","the","a","an","in","of","to","for","with","on","at","by","from","as","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","can","this","that","their","they","we","you","i","it","its","our","your","which","who","what","when","where","how","not","but","if","than","then","so","yet","both","also","just","more","most","very","too","about","into","each","many","all","any","some","such","no","only","same","other","per","via","able","using"]);
    const getKws = (jd) => new Set(jd.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w)));
    const scoreText = (text, kws) => { if (!kws || !kws.size) return 0; const words = text.toLowerCase().split(/\W+/); return Math.min(100, Math.round((words.filter(w => kws.has(w)).length / kws.size) * 300)); };
    const badge = (score) => score >= 40 ? {label:"Strong match", color:"#10B981"} : score >= 15 ? {label:"Relevant", color:"#F59E0B"} : {label:"Low match", color:"#64748B"};

    const analyzeJD = () => {
      const kws = getKws(jdText);
      setJdKws(kws);
      setTailorSel({
        jobs: Object.fromEntries(master.jobs.map(j => [j.id, true])),
        education: Object.fromEntries(master.education.map(e => [e.id, true])),
        skills: Object.fromEntries(master.skills.map(s => [s.id, true])),
        certifications: Object.fromEntries(master.certifications.map(c => [c.id, true])),
        projects: Object.fromEntries(master.projects.map(p => [p.id, true])),
        languages: Object.fromEntries(master.languages.map(l => [l.id, true])),
        achievements: Object.fromEntries(master.achievements.map(a => [a.id, true])),
      });
    };
    const toggleSel = (group, id) => setTailorSel(s => ({...s, [group]: {...s[group], [id]: !s[group]?.[id]}}));

    const generateTailored = () => {
      const s = tailorSel || {};
      const selJobs = master.jobs.filter(j => s.jobs?.[j.id] !== false);
      const experience = selJobs.map(j => [`${j.title}${j.company ? ` | ${j.company}` : ""}${j.location ? ` | ${j.location}` : ""}${j.startDate ? ` | ${j.startDate} – ${j.current ? "Present" : j.endDate||""}` : ""}`, ...j.bullets.filter(Boolean).map(b => `• ${b}`)].join("\n")).join("\n\n");
      const education = master.education.filter(e => s.education?.[e.id] !== false).map(e => `${e.degree}${e.field ? ` in ${e.field}` : ""} — ${e.school}${e.endDate ? ` (${e.endDate})` : ""}${e.gpa ? ` · GPA ${e.gpa}` : ""}`).join("\n");
      const skills = master.skills.filter(sk => s.skills?.[sk.id] !== false).map(sk => sk.name).join(", ");
      const certifications = master.certifications.filter(c => s.certifications?.[c.id] !== false).map(c => `${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}`).join("\n");
      const projects = master.projects.filter(p => s.projects?.[p.id] !== false).map(p => `${p.name}${p.tech ? ` | ${p.tech}` : ""}${p.url ? ` | ${p.url}` : ""}${p.description ? `\n${p.description}` : ""}`).join("\n\n");
      const languages = master.languages.filter(l => s.languages?.[l.id] !== false).map(l => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ");
      const achievements = master.achievements.filter(a => s.achievements?.[a.id] !== false).map(a => `${a.title}${a.date ? ` (${a.date})` : ""}${a.description ? ` — ${a.description}` : ""}`).join("\n");
      setForm(f => ({...f, name: master.name||f.name, title: master.headline||f.title, email: master.email||f.email, phone: master.phone||f.phone, location: master.location||f.location, linkedin: master.linkedin||f.linkedin, website: master.website||f.website, summary: master.summary||f.summary, experience: experience||f.experience, education: education||f.education, skills: skills||f.skills, certifications: certifications||f.certifications, projects: projects||f.projects, languages: languages||f.languages, achievements: achievements||f.achievements}));
      setTailorOpen(false); setJdKws(null); setTailorSel(null);
      setNavPage("resume");
      if (tpl) setStep("form"); // stay on form if template already picked
    };

    // Shared styles
    const mi = {width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", fontSize:13.5, color:C.text1, fontFamily:"inherit", outline:"none", boxSizing:"border-box"};
    const lb = {fontSize:12, fontWeight:600, color:C.text2, display:"block", marginBottom:5};
    const g2 = {display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14};

    const totalItems = master.jobs.length + master.education.length + master.skills.length + master.certifications.length + master.projects.length + master.languages.length + master.achievements.length + master.volunteer.length;

    const TABS = [
      {id:"personal", label:"Personal"},
      {id:"experience", label:"Experience", count:master.jobs.length},
      {id:"education", label:"Education", count:master.education.length},
      {id:"skills", label:"Skills", count:master.skills.length},
      {id:"more", label:"More", count:master.certifications.length+master.projects.length+master.languages.length+master.achievements.length+master.volunteer.length},
    ];

    // Inline selectable item row for tailor panel (avoid nested component)
    const renderSelRow = (item, group, scoreText_val, labelText) => {
      const checked = tailorSel?.[group]?.[item.id] !== false;
      const bd = badge(scoreText_val);
      return (
        <label key={item.id} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, marginBottom:4, cursor:"pointer", background: checked ? `${bd.color}10` : C.surface, border:`1px solid ${checked ? bd.color+"40" : C.border}`, transition:"all 0.12s"}}>
          <input type="checkbox" checked={checked} onChange={() => toggleSel(group, item.id)} style={{accentColor:bd.color, flexShrink:0}} />
          <div style={{flex:1, minWidth:0, fontSize:13, fontWeight:600, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{labelText}</div>
          <span style={{fontSize:10.5, fontWeight:700, color:bd.color, background:`${bd.color}18`, padding:"2px 8px", borderRadius:999, whiteSpace:"nowrap", flexShrink:0}}>{bd.label} · {scoreText_val}%</span>
        </label>
      );
    };

    return (
      <div style={{padding: isMobile ? "16px 12px" : "24px 28px", maxWidth:860, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16, flexWrap:"wrap"}}>
          <div>
            <h2 style={{margin:"0 0 4px", fontSize: isMobile ? 20 : 26, fontWeight:800, color:C.text1, letterSpacing:"-0.5px"}}>Master Profile</h2>
            <p style={{margin:0, fontSize:13.5, color:C.text2}}>{totalItems > 0 ? `${totalItems} career items · generates any tailored resume in seconds` : "Build your complete career profile once. Generate any tailored resume from it."}</p>
          </div>
          <button onClick={() => setTailorOpen(o => !o)} disabled={totalItems === 0}
            style={{background:C.grad, color:"#fff", border:"none", borderRadius:9, padding:"10px 20px", fontSize:14, fontWeight:700, cursor: totalItems===0 ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity: totalItems===0 ? 0.45 : 1}}>
            ✨ Tailor for a Job →
          </button>
        </div>

        {/* Tailor Panel */}
        {tailorOpen && (
          <div style={{background:`${C.accent}08`, border:`1.5px solid ${C.accent}40`, borderRadius:14, padding:"20px 22px", marginBottom:24}}>
            <div style={{fontSize:15, fontWeight:800, color:C.text1, marginBottom:4}}>Tailor for a Specific Job</div>
            <div style={{fontSize:13, color:C.text2, marginBottom:14}}>Paste the job description — we'll score your profile against it and let you select exactly what to include.</div>
            <textarea value={jdText} onChange={e => { setJdText(e.target.value); setJdKws(null); setTailorSel(null); }}
              placeholder="Paste the full job description here..." rows={6}
              style={{...mi, resize:"vertical", lineHeight:1.6, marginBottom:12}} />
            <div style={{display:"flex", gap:10, alignItems:"center", marginBottom: jdKws ? 20 : 0}}>
              <button onClick={analyzeJD} disabled={!jdText.trim()}
                style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13.5, fontWeight:700, cursor: jdText.trim() ? "pointer" : "not-allowed", fontFamily:"inherit", opacity: jdText.trim() ? 1 : 0.5}}>
                Analyze →
              </button>
              {jdKws && <span style={{fontSize:12.5, color:C.text2}}>{jdKws.size} keywords extracted</span>}
            </div>

            {tailorSel && jdKws && (
              <div style={{borderTop:`1px solid ${C.border}`, paddingTop:20}}>
                <div style={{fontSize:14, fontWeight:700, color:C.text1, marginBottom:14}}>Select what to include in your tailored resume:</div>
                {master.jobs.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, marginBottom:8}}>Work Experience</div>{master.jobs.map(j => renderSelRow(j, "jobs", scoreText(j.title+" "+j.company+" "+j.bullets.join(" "), jdKws), `${j.title}${j.company ? " · "+j.company : ""}${j.startDate ? " ("+j.startDate+" – "+(j.current?"Present":j.endDate||"?")+")" : ""}`))}</>)}
                {master.education.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>Education</div>{master.education.map(e => renderSelRow(e, "education", scoreText(e.degree+" "+e.field+" "+e.school, jdKws), `${e.degree}${e.field ? " in "+e.field : ""} — ${e.school}`))}</>)}
                {master.skills.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>Skills</div><div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:4}}>{master.skills.map(sk => { const sc = scoreText(sk.name, jdKws); const bd = badge(sc); const checked = tailorSel.skills?.[sk.id] !== false; return (<button key={sk.id} onClick={() => toggleSel("skills", sk.id)} style={{padding:"5px 12px", borderRadius:999, fontSize:12.5, fontWeight:600, border:`1.5px solid ${checked ? bd.color : C.border}`, background: checked ? `${bd.color}18` : "transparent", color: checked ? bd.color : C.text3, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s"}}>{sk.name}</button>); })}</div></>)}
                {master.projects.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>Projects</div>{master.projects.map(p => renderSelRow(p, "projects", scoreText(p.name+" "+p.tech+" "+p.description, jdKws), `${p.name}${p.tech ? " · "+p.tech : ""}`))}</>)}
                {master.certifications.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>Certifications</div>{master.certifications.map(c => renderSelRow(c, "certifications", scoreText(c.name+" "+c.issuer, jdKws), `${c.name}${c.issuer ? " · "+c.issuer : ""}`))}</>)}
                {master.languages.length > 0 && (<><div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:C.text3, margin:"14px 0 8px"}}>Languages</div>{master.languages.map(l => renderSelRow(l, "languages", scoreText(l.name, jdKws), `${l.name}${l.level ? " ("+l.level+")" : ""}`))}</>)}
                <div style={{display:"flex", gap:10, marginTop:20, flexWrap:"wrap"}}>
                  <button onClick={generateTailored}
                    style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>
                    Generate Tailored Resume →
                  </button>
                  <button onClick={() => { setTailorOpen(false); setJdKws(null); setTailorSel(null); setJdText(""); }}
                    style={{background:"transparent", color:C.text2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 16px", fontSize:13.5, cursor:"pointer", fontFamily:"inherit"}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex", gap:0, marginBottom:24, borderBottom:`1px solid ${C.border}`, overflowX:"auto"}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMasterTab(tab.id)}
              style={{padding:"9px 16px", fontSize:13, fontWeight: masterTab===tab.id ? 700 : 500, color: masterTab===tab.id ? C.accent2 : C.text2, background:"none", border:"none", borderBottom:`2px solid ${masterTab===tab.id ? C.accent : "transparent"}`, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", marginBottom:-1, transition:"color 0.15s"}}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{marginLeft:6, fontSize:10.5, fontWeight:700, color: masterTab===tab.id ? C.accent : C.text3, background: masterTab===tab.id ? `${C.accent}18` : C.elevated, padding:"1px 6px", borderRadius:999, border:`1px solid ${C.border}`}}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Personal tab */}
        {masterTab === "personal" && (
          <div>
            <div style={g2}>
              {[["name","Full name","Alexandra Johnson"],["headline","Professional headline","Senior Product Designer"],["email","Email","alex@email.com"],["phone","Phone","+1 415 555 0000"],["location","Location","San Francisco, CA"],["linkedin","LinkedIn","linkedin.com/in/alexj"],["website","Website / Portfolio","alexj.design"]].map(([k,label,ph]) => (
                <div key={k}>
                  <label style={lb}>{label}</label>
                  <input value={master[k]||""} onChange={mField(k)} placeholder={ph} style={mi} />
                </div>
              ))}
            </div>
            <div style={{marginTop:14}}>
              <label style={lb}>Professional summary</label>
              <textarea value={master.summary||""} onChange={mField("summary")} placeholder="Write a 2–3 sentence summary of your career, skills, and goals..." rows={4} style={{...mi, resize:"vertical", lineHeight:1.6}} />
            </div>
          </div>
        )}

        {/* Experience tab */}
        {masterTab === "experience" && (
          <div>
            {master.jobs.length === 0 && <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>No work experience added yet.</div>}
            {master.jobs.map(job => (
              <div key={job.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, marginBottom:10, overflow:"hidden"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", userSelect:"none"}} onClick={() => toggleOpen(job.id)}>
                  <span style={{color:C.text3, fontSize:12, display:"inline-block", transform: masterOpen[job.id] ? "rotate(90deg)" : "none", transition:"transform 0.15s"}}>▶</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:700, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{job.title||"Untitled role"}{job.company ? ` · ${job.company}` : ""}</div>
                    {(job.startDate||job.endDate||job.current) && <div style={{fontSize:11.5, color:C.text3, marginTop:1}}>{job.startDate} – {job.current ? "Present" : job.endDate}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); delJob(job.id); }} style={{background:"none", border:"none", color:"#EF4444", cursor:"pointer", fontSize:13, padding:"4px 6px", borderRadius:6, fontFamily:"inherit", opacity:0.7}}>✕</button>
                </div>
                {masterOpen[job.id] && (
                  <div style={{padding:"0 14px 16px", borderTop:`1px solid ${C.border}`}}>
                    <div style={{...g2, marginTop:14}}>
                      {[["title","Job title","Software Engineer"],["company","Company","Stripe"],["startDate","Start date","Jan 2022"],["location","Location","Remote"]].map(([k,label,ph]) => (
                        <div key={k}><label style={lb}>{label}</label><input value={job[k]||""} onChange={e => upJob(job.id, {[k]:e.target.value})} placeholder={ph} style={mi} /></div>
                      ))}
                      <div>
                        <label style={lb}>End date</label>
                        <input value={job.endDate||""} onChange={e => upJob(job.id, {endDate:e.target.value})} placeholder="Present" disabled={job.current} style={{...mi, opacity: job.current ? 0.45 : 1}} />
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:8, paddingTop:22}}>
                        <input type="checkbox" id={`cur_${job.id}`} checked={!!job.current} onChange={e => upJob(job.id, {current:e.target.checked, endDate:""})} style={{accentColor:C.accent}} />
                        <label htmlFor={`cur_${job.id}`} style={{fontSize:13, color:C.text2, cursor:"pointer"}}>Currently working here</label>
                      </div>
                    </div>
                    <div style={{marginTop:16}}>
                      <label style={lb}>Achievements & responsibilities</label>
                      {job.bullets.map((b, bi) => (
                        <div key={bi} style={{display:"flex", gap:8, marginBottom:6, alignItems:"center"}}>
                          <span style={{color:C.text3, fontSize:16, flexShrink:0, lineHeight:"38px"}}>•</span>
                          <input value={b} onChange={e => upJobBullet(job.id, bi, e.target.value)} placeholder="Led migration of 3 services, reducing infra costs by 40%..." style={{...mi, flex:1}} />
                          <button onClick={() => delJobBullet(job.id, bi)} style={{background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:14, padding:"4px 6px", flexShrink:0, fontFamily:"inherit"}}>✕</button>
                        </div>
                      ))}
                      <button onClick={() => addJobBullet(job.id)} style={{marginTop:4, background:"none", border:`1px dashed ${C.border}`, borderRadius:7, padding:"6px 12px", fontSize:12.5, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add bullet</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addJob} style={{width:"100%", background:C.surface, border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"11px", fontSize:13.5, color:C.text2, cursor:"pointer", fontFamily:"inherit", marginTop:4}}>+ Add work experience</button>
          </div>
        )}

        {/* Education tab */}
        {masterTab === "education" && (
          <div>
            {master.education.length === 0 && <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>No education added yet.</div>}
            {master.education.map(edu => (
              <div key={edu.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:11, marginBottom:10, overflow:"hidden"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", userSelect:"none"}} onClick={() => toggleOpen(edu.id)}>
                  <span style={{color:C.text3, fontSize:12, display:"inline-block", transform: masterOpen[edu.id] ? "rotate(90deg)" : "none", transition:"transform 0.15s"}}>▶</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:700, color:C.text1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{edu.degree||"Degree"}{edu.field ? ` in ${edu.field}` : ""}{edu.school ? ` · ${edu.school}` : ""}</div>
                    {edu.endDate && <div style={{fontSize:11.5, color:C.text3, marginTop:1}}>{edu.endDate}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); delEdu(edu.id); }} style={{background:"none", border:"none", color:"#EF4444", cursor:"pointer", fontSize:13, padding:"4px 6px", borderRadius:6, fontFamily:"inherit", opacity:0.7}}>✕</button>
                </div>
                {masterOpen[edu.id] && (
                  <div style={{padding:"0 14px 16px", borderTop:`1px solid ${C.border}`}}>
                    <div style={{...g2, marginTop:14}}>
                      {[["school","School / University","MIT"],["degree","Degree","B.Sc."],["field","Field of study","Computer Science"],["endDate","Graduation year","2024"],["gpa","GPA (optional)","3.8 / 4.0"]].map(([k,label,ph]) => (
                        <div key={k}><label style={lb}>{label}</label><input value={edu[k]||""} onChange={e => upEdu(edu.id, {[k]:e.target.value})} placeholder={ph} style={mi} /></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addEdu} style={{width:"100%", background:C.surface, border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"11px", fontSize:13.5, color:C.text2, cursor:"pointer", fontFamily:"inherit", marginTop:4}}>+ Add education</button>
          </div>
        )}

        {/* Skills tab */}
        {masterTab === "skills" && (
          <div>
            <div style={{marginBottom:20}}>
              <label style={lb}>Add a skill</label>
              <div style={{display:"flex", gap:8}}>
                <input value={skillDraft} onChange={e => setSkillDraft(e.target.value)} onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); addSkill(skillDraft); } }} placeholder="e.g. React, Python, Project Management..." style={{...mi, flex:1}} />
                <button onClick={() => addSkill(skillDraft)} disabled={!skillDraft.trim()} style={{background:C.grad, color:"#fff", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13.5, fontWeight:700, cursor: skillDraft.trim() ? "pointer" : "not-allowed", fontFamily:"inherit", flexShrink:0, opacity: skillDraft.trim() ? 1 : 0.5}}>Add</button>
              </div>
              <div style={{fontSize:11.5, color:C.text3, marginTop:5}}>Press Enter to add quickly</div>
            </div>
            {master.skills.length > 0 ? (
              <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
                {master.skills.map(s => (
                  <div key={s.id} style={{display:"flex", alignItems:"center", gap:5, background:`${C.accent}14`, border:`1px solid ${C.accent}30`, borderRadius:999, padding:"5px 10px 5px 14px", fontSize:13, color:C.accent2, fontWeight:600}}>
                    {s.name}
                    <button onClick={() => delSkill(s.id)} style={{background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:12, padding:0, lineHeight:1, fontFamily:"inherit"}}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:"center", padding:"32px 24px", color:C.text3, fontSize:13}}>No skills yet. Type a skill and press Enter.</div>
            )}
            {master.skills.length > 0 && <div style={{marginTop:12, fontSize:12.5, color:C.text3}}>{master.skills.length} skill{master.skills.length!==1?"s":""}</div>}
          </div>
        )}

        {/* More tab */}
        {masterTab === "more" && (
          <div>
            {/* Certifications */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>Certifications</span>
                <button onClick={addCert} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add</button>
              </div>
              {master.certifications.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>None added.</div>}
              {master.certifications.map(c => (
                <div key={c.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>Certification name</label><input value={c.name||""} onChange={e => upCert(c.id, {name:e.target.value})} placeholder="AWS Solutions Architect" style={mi} /></div>
                    <div><label style={lb}>Issuing organization</label><input value={c.issuer||""} onChange={e => upCert(c.id, {issuer:e.target.value})} placeholder="Amazon Web Services" style={mi} /></div>
                    <div><label style={lb}>Date</label><input value={c.date||""} onChange={e => upCert(c.id, {date:e.target.value})} placeholder="March 2024" style={mi} /></div>
                    <div><label style={lb}>URL (optional)</label><input value={c.url||""} onChange={e => upCert(c.id, {url:e.target.value})} placeholder="credential link..." style={mi} /></div>
                  </div>
                  <button onClick={() => delCert(c.id)} style={{fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>Remove</button>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>Projects</span>
                <button onClick={addProject} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add</button>
              </div>
              {master.projects.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>None added.</div>}
              {master.projects.map(p => (
                <div key={p.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>Project name</label><input value={p.name||""} onChange={e => upProject(p.id, {name:e.target.value})} placeholder="Portfolio website" style={mi} /></div>
                    <div><label style={lb}>Tech stack</label><input value={p.tech||""} onChange={e => upProject(p.id, {tech:e.target.value})} placeholder="React, Node.js, PostgreSQL" style={mi} /></div>
                  </div>
                  <div style={{marginBottom:10}}><label style={lb}>Description</label><textarea value={p.description||""} onChange={e => upProject(p.id, {description:e.target.value})} placeholder="What did you build and what was the impact?" rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <div style={{marginBottom:8}}><label style={lb}>URL (optional)</label><input value={p.url||""} onChange={e => upProject(p.id, {url:e.target.value})} placeholder="github.com/..." style={mi} /></div>
                  <button onClick={() => delProject(p.id)} style={{fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>Remove</button>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>Languages</span>
                <button onClick={addLang} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add</button>
              </div>
              {master.languages.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>None added.</div>}
              {master.languages.map(l => (
                <div key={l.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:8}}>
                    <div><label style={lb}>Language</label><input value={l.name||""} onChange={e => upLang(l.id, {name:e.target.value})} placeholder="Spanish" style={mi} /></div>
                    <div><label style={lb}>Proficiency</label>
                      <select value={l.level||""} onChange={e => upLang(l.id, {level:e.target.value})} style={{...mi, cursor:"pointer"}}>
                        <option value="">Select level...</option>
                        {["Native","Fluent","Advanced","Intermediate","Basic"].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => delLang(l.id)} style={{fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>Remove</button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>Awards & Achievements</span>
                <button onClick={addAch} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add</button>
              </div>
              {master.achievements.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>None added.</div>}
              {master.achievements.map(a => (
                <div key={a.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>Award / Achievement</label><input value={a.title||""} onChange={e => upAch(a.id, {title:e.target.value})} placeholder="Employee of the Year" style={mi} /></div>
                    <div><label style={lb}>Date (optional)</label><input value={a.date||""} onChange={e => upAch(a.id, {date:e.target.value})} placeholder="2023" style={mi} /></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={lb}>Description (optional)</label><textarea value={a.description||""} onChange={e => upAch(a.id, {description:e.target.value})} placeholder="Brief description..." rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <button onClick={() => delAch(a.id)} style={{fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>Remove</button>
                </div>
              ))}
            </div>

            {/* Volunteer */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:"0.8px"}}>Volunteer Experience</span>
                <button onClick={addVol} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:C.text2, cursor:"pointer", fontFamily:"inherit"}}>+ Add</button>
              </div>
              {master.volunteer.length === 0 && <div style={{fontSize:12.5, color:C.text3}}>None added.</div>}
              {master.volunteer.map(v => (
                <div key={v.id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 14px", marginBottom:8}}>
                  <div style={{...g2, marginBottom:10}}>
                    <div><label style={lb}>Organization</label><input value={v.org||""} onChange={e => upVol(v.id, {org:e.target.value})} placeholder="Red Cross" style={mi} /></div>
                    <div><label style={lb}>Role</label><input value={v.role||""} onChange={e => upVol(v.id, {role:e.target.value})} placeholder="Event Coordinator" style={mi} /></div>
                    <div><label style={lb}>Start date</label><input value={v.startDate||""} onChange={e => upVol(v.id, {startDate:e.target.value})} placeholder="Jan 2022" style={mi} /></div>
                    <div><label style={lb}>End date</label><input value={v.endDate||""} onChange={e => upVol(v.id, {endDate:e.target.value})} placeholder="Present" style={mi} /></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={lb}>Description</label><textarea value={v.description||""} onChange={e => upVol(v.id, {description:e.target.value})} placeholder="What did you do and what was the impact?" rows={2} style={{...mi, resize:"none", lineHeight:1.6}} /></div>
                  <button onClick={() => delVol(v.id)} style={{fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit"}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })();

  let pageBody;
  if (navPage === "resume") pageBody = step === "form" ? (formContent || mainContent) : mainContent;
  else if (navPage === "cover") pageBody = coverStep === "form" ? (coverFormContent || coverTemplatesContent) : coverTemplatesContent;
  else if (navPage === "master") pageBody = masterContent;
  else if (navPage === "tracker") pageBody = trackerContent;
  else if (navPage === "ats") pageBody = <ATSPage />;
  else if (navPage === "about") pageBody = <AboutPage />;
  else pageBody = <ComingSoon id={navPage} label={NAV.find(n => n.id === navPage)?.label || ""} />;

  // Two-column independent scroll: only on desktop, resume form view
  const isFormView = !isMobile && navPage === "resume" && step === "form" && !!tpl;

  // ── Landing page ──────────────────────────────────────────────────
  if (appView === "landing") {
    const enter = (page) => { setNavPage(page); setAppView("app"); };
    return (
      <div style={{ background: C.bg, color: C.text1, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${C.border}`, position: "fixed", top: 0,
          left: 0, right: 0, zIndex: 100, background: C.bg + "ee", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 76,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setAppView("landing")}
            style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
              fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", fontFamily: "inherit" }}>
            ApplyCraft
          </button>

          {/* Nav search */}
          <div style={{ flex: 1, maxWidth: 340, margin: "0 24px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: C.text3, fontSize: 14, pointerEvents: "none" }}>🔍</span>
              <input
                value={tplSearch}
                onChange={e => setTplSearch(e.target.value)}
                placeholder="Search 22 templates..."
                style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "8px 32px 8px 38px", fontSize: 13, color: C.text1,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s" }}
                onFocus={e => { e.target.style.borderColor = C.accent; }}
                onBlur={e => { e.target.style.borderColor = C.border; }}
              />
              {tplSearch && (
                <button onClick={() => setTplSearch("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: C.text3, cursor: "pointer",
                    fontSize: 14, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>✕</button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {currentUser ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                    cursor: "pointer", fontFamily: "inherit", color: C.text1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.grad,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{currentUser.name}</span>
                  <span style={{ fontSize: 10, color: C.text3 }}>▾</span>
                </button>
                {userMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 180,
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 9999 }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{currentUser.name}</div>
                      <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{currentUser.email}</div>
                    </div>
                    <button onClick={() => { setCurrentUser(null); setUserMenuOpen(false); }}
                      style={{ display: "block", width: "100%", padding: "11px 16px", textAlign: "left",
                        background: "none", border: "none", color: "#f87171", fontSize: 13.5,
                        fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => { setAuthModalTab("login"); setAuthModal(true); }}
                style={{ padding: "9px 20px", background: "transparent", border: `1px solid ${C.border}`,
                  borderRadius: 3, color: C.text1, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}>
                Sign In
              </button>
            )}
            <button onClick={() => enter("resume")}
              style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Get Started — Free
            </button>
          </div>
          </div>
        </nav>
        <AuthModal open={authModal} initialTab={authModalTab} onClose={() => setAuthModal(false)}
          onLogin={user => { setCurrentUser(user); setAuthModal(false); }} />

        {/* Hero */}
        <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${C.glow} 0%, transparent 70%)` }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", padding: "166px 24px 80px" }}>
            <div style={{ animation: "acFadeUp 0.6s ease 0.05s both", display: "inline-block",
              fontSize: 12, fontWeight: 600, letterSpacing: "2px",
              textTransform: "uppercase", color: C.accent2, background: `${C.accent}18`,
              border: `1px solid ${C.accent}44`, borderRadius: 999, padding: "4px 14px", marginBottom: 28 }}>
              Free · No sign-up required
            </div>
            <h1 style={{ animation: "acFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both",
              fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1,
              letterSpacing: "-2px", margin: "0 0 24px",
              background: "linear-gradient(135deg, #EEF2FF 0%, #94A3B8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              The CV builder that actually<br />works in Arabic, French, and 50+ languages.
            </h1>
            <p style={{ animation: "acFadeUp 0.65s ease 0.34s both",
              fontSize: "clamp(16px, 2vw, 20px)", color: C.text2, maxWidth: 520,
              margin: "0 auto 44px", lineHeight: 1.65 }}>
              ATS-conscious templates, live preview, PDF & DOCX export. Build for free
              with no sign-up, no watermark, and no credit card required.
            </p>
            <div style={{ animation: "acFadeUp 0.65s ease 0.5s both",
              display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => enter("resume")}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  animation: "acPulse 2.8s ease-in-out 1.4s infinite",
                  transition: "opacity 0.2s" }}>
                Build My Resume →
              </button>
              <button onClick={() => enter("cover")}
                style={{ background: "transparent", color: C.text1, border: `1.5px solid ${C.borderHi}`,
                  borderRadius: 3, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.borderHi}18`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                Write Cover Letter
              </button>
              <button onClick={() => enter("ats")}
                style={{ background: "transparent", color: C.text2, border: `1.5px solid ${C.border}`,
                  borderRadius: 3, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent2; e.currentTarget.style.color = C.accent2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
                🎯 Check ATS Score
              </button>
            </div>
            {/* Trust row */}
            <div style={{ animation: "acFadeUp 0.5s ease 0.65s both",
              display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              {["🔒 Browser-first editing", "⚡ No sign-up", "💳 No credit card", "📄 PDF & DOCX"].map(t => (
                <span key={t} style={{ fontSize: 12.5, color: C.text3, display: "flex", alignItems: "center", gap: 5 }}>{t}</span>
              ))}
            </div>

            {/* Upload existing resume */}
            <div style={{ animation: "acFadeUp 0.5s ease 0.8s both", marginTop: 40, maxWidth: 420, margin: "40px auto 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: "1px",
                  textTransform: "uppercase", whiteSpace: "nowrap" }}>or improve an existing one</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <label
                htmlFor="landing-resume-upload"
                onDragOver={e => { e.preventDefault(); setUploadDragOver(true); }}
                onDragLeave={() => setUploadDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setUploadDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".docx"))) {
                    setUploadedResume(file);
                    enter("resume");
                  }
                }}
                style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  border: `2px dashed ${uploadDragOver ? C.accent : C.border}`,
                  borderRadius: 12, padding: "18px 24px",
                  background: uploadDragOver ? `${C.accent}08` : C.surface,
                  transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={e => { if (!uploadDragOver) e.currentTarget.style.borderColor = C.borderHi; }}
                onMouseLeave={e => { if (!uploadDragOver) e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: `${C.accent}14`, border: `1px solid ${C.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  📂
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 3 }}>
                    Upload your resume
                  </div>
                  <div style={{ fontSize: 12, color: C.text3 }}>
                    PDF or DOCX · drag & drop or click
                  </div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 18, color: C.text3 }}>↑</div>
                <input id="landing-resume-upload" type="file" accept=".pdf,.docx"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { setUploadedResume(file); enter("resume"); }
                  }} />
              </label>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          background: C.surface, padding: "28px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto",
            display: "flex", justifyContent: "space-around", alignItems: "center",
            flexWrap: "wrap", gap: "16px 32px" }}>
            {[
              { n: "22", label: "Templates" },
              { n: "6", label: "Cover letter styles" },
              { n: "50+", label: "Languages" },
              { n: "2", label: "Export formats" },
              { n: "∞", label: "Free downloads" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, lineHeight: 1,
                  background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.n}</div>
                <div style={{ fontSize: 11.5, color: C.text3, marginTop: 5, textTransform: "uppercase",
                  letterSpacing: "0.8px", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Demo ── */}
        {(() => {
          const DEMO_TPLS = [
            { name: "Atlas",  accent: "#6366F1", side: "#f8f8fd" },
            { name: "Pulse",  accent: "#2563EB", side: "#eff6ff" },
            { name: "Nova",   accent: "#7C3AED", side: "#f5f3ff" },
            { name: "Slate",  accent: "#334155", side: "#f8fafc" },
            { name: "Ember",  accent: "#DC2626", side: "#fef2f2" },
          ];
          const DEMO_LANGS = {
            en: { exp: "Experience", skills: "Skills", contact: "Contact" },
            fr: { exp: "Expérience", skills: "Compétences", contact: "Contact" },
            ar: { exp: "الخبرة", skills: "المهارات", contact: "التواصل" },
            de: { exp: "Erfahrung", skills: "Fähigkeiten", contact: "Kontakt" },
            es: { exp: "Experiencia", skills: "Habilidades", contact: "Contacto" },
          };
          const tpl = DEMO_TPLS[demoTplIdx];
          const lang = DEMO_LANGS[demoLang] || DEMO_LANGS.en;
          const isRTL = demoLang === "ar";

          const enterWithDemo = () => {
            if (demoName || demoTitle || demoExp) {
              setForm(f => ({
                ...f,
                name: demoName || f.name,
                title: demoTitle || f.title,
                experience: demoExp || f.experience,
              }));
            }
            enter("resume");
          };

          const inputS = {
            width: "100%", background: "#ffffff0d", border: "1px solid #ffffff1a",
            borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text1,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
          };

          return (
            <div style={{ padding: "72px 24px 80px", background: `${C.accent}06`, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <FadeIn style={{ textAlign: "center", marginBottom: 48 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>Live demo</p>
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800,
                    letterSpacing: "-0.8px", color: C.text1, margin: "0 0 12px" }}>
                    Try it right now — no account needed
                  </h2>
                  <p style={{ fontSize: 15, color: C.text2, margin: 0 }}>
                    Type 3 fields. See your resume appear instantly. Download when ready.
                  </p>
                </FadeIn>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32, alignItems: "start" }}>
                  {/* Left: Mini form */}
                  <FadeIn delay={80}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "1.5px", color: C.text3, marginBottom: 20 }}>Your info</div>

                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: "block", marginBottom: 6 }}>Full name</label>
                      <input
                        value={demoName}
                        onChange={e => setDemoName(e.target.value)}
                        placeholder="e.g. Sarah Okonkwo"
                        style={inputS}
                        onFocus={e => { e.target.style.borderColor = tpl.accent; e.target.style.boxShadow = `0 0 0 3px ${tpl.accent}22`; }}
                        onBlur={e => { e.target.style.borderColor = "#ffffff1a"; e.target.style.boxShadow = "none"; }}
                      />

                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: "block", margin: "16px 0 6px" }}>Job title</label>
                      <input
                        value={demoTitle}
                        onChange={e => setDemoTitle(e.target.value)}
                        placeholder="e.g. Senior Product Designer"
                        style={inputS}
                        onFocus={e => { e.target.style.borderColor = tpl.accent; e.target.style.boxShadow = `0 0 0 3px ${tpl.accent}22`; }}
                        onBlur={e => { e.target.style.borderColor = "#ffffff1a"; e.target.style.boxShadow = "none"; }}
                      />

                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: "block", margin: "16px 0 6px" }}>One achievement</label>
                      <textarea
                        value={demoExp}
                        onChange={e => setDemoExp(e.target.value)}
                        placeholder="e.g. Redesigned checkout flow → 23% conversion lift"
                        rows={3}
                        style={{ ...inputS, resize: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                        onFocus={e => { e.target.style.borderColor = tpl.accent; e.target.style.boxShadow = `0 0 0 3px ${tpl.accent}22`; }}
                        onBlur={e => { e.target.style.borderColor = "#ffffff1a"; e.target.style.boxShadow = "none"; }}
                      />

                      {/* Template picker */}
                      <div style={{ marginTop: 22, marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "1.2px", color: C.text3, marginBottom: 12 }}>Template style</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {DEMO_TPLS.map((t, i) => (
                            <button key={t.name} onClick={() => setDemoTplIdx(i)}
                              style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 12px", borderRadius: 999, border: `2px solid ${i === demoTplIdx ? t.accent : C.border}`,
                                background: i === demoTplIdx ? `${t.accent}18` : "transparent",
                                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                              }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: i === demoTplIdx ? t.accent : C.text2 }}>{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language picker */}
                      <div style={{ marginTop: 18, marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "1.2px", color: C.text3, marginBottom: 12 }}>Language</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {[["en","English"],["fr","Français"],["ar","العربية"],["de","Deutsch"],["es","Español"]].map(([code, label]) => (
                            <button key={code} onClick={() => setDemoLang(code)}
                              style={{
                                padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${code === demoLang ? tpl.accent : C.border}`,
                                background: code === demoLang ? `${tpl.accent}18` : "transparent",
                                fontSize: 12.5, fontWeight: code === demoLang ? 700 : 500,
                                color: code === demoLang ? tpl.accent : C.text2,
                                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                              }}>{label}</button>
                          ))}
                        </div>
                      </div>

                      <button onClick={enterWithDemo}
                        style={{ width: "100%", background: `linear-gradient(135deg, ${tpl.accent}, ${tpl.accent}bb)`,
                          color: "#fff", border: "none", borderRadius: 10, padding: "14px 0",
                          fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          transition: "opacity 0.2s", letterSpacing: "-0.2px" }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                        Build my full resume →
                      </button>
                      <div style={{ textAlign: "center", fontSize: 11.5, color: C.text3, marginTop: 10 }}>
                        No sign-up · No credit card · Free builder
                      </div>
                    </div>
                  </FadeIn>

                  {/* Right: Live preview */}
                  <FadeIn delay={160}>
                    <div style={{ position: "sticky", top: 96 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "1.5px", color: C.text3, marginBottom: 14, textAlign: "center" }}>
                        Live preview
                      </div>
                      {/* Resume paper */}
                      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden",
                        boxShadow: "0 24px 64px #00000055", fontFamily: "'Segoe UI', Arial, sans-serif",
                        fontSize: 13, color: "#111", direction: isRTL ? "rtl" : "ltr" }}>
                        {/* Header */}
                        <div style={{ padding: "24px 28px 18px", borderBottom: `3px solid ${tpl.accent}` }}>
                          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", color: "#111", marginBottom: 4 }}>
                            {demoName || <span style={{ color: "#ccc" }}>Your Name</span>}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: tpl.accent,
                            textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
                            {demoTitle || <span style={{ color: "#ddd" }}>Job Title</span>}
                          </div>
                          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#777", flexWrap: "wrap" }}>
                            <span>you@email.com</span>
                            <span style={{ color: tpl.accent }}>·</span>
                            <span>linkedin.com/in/yourname</span>
                          </div>
                        </div>
                        {/* Body */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", minHeight: 280 }}>
                          {/* Sidebar */}
                          <div style={{ background: tpl.side, padding: "18px 16px", borderRight: "1px solid #eee" }}>
                            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "1.5px",
                              textTransform: "uppercase", color: tpl.accent, marginBottom: 8 }}>{lang.skills}</div>
                            {["Communication","Collaboration","Problem Solving"].map(s => (
                              <div key={s} style={{ fontSize: 11, color: "#555", marginBottom: 5,
                                display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: tpl.accent, flexShrink: 0 }} />
                                {s}
                              </div>
                            ))}
                          </div>
                          {/* Main */}
                          <div style={{ padding: "18px 20px" }}>
                            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "1.5px",
                              textTransform: "uppercase", color: tpl.accent, marginBottom: 8,
                              paddingBottom: 4, borderBottom: `1.5px solid ${tpl.accent}22` }}>{lang.exp}</div>
                            {demoExp ? (
                              demoExp.split("\n").filter(Boolean).map((line, i) => (
                                <div key={i} style={{ fontSize: 11.5, color: "#444", lineHeight: 1.6, marginBottom: 5,
                                  display: "flex", gap: 6 }}>
                                  <span style={{ color: tpl.accent, flexShrink: 0, marginTop: 1 }}>▸</span>
                                  <span>{line}</span>
                                </div>
                              ))
                            ) : (
                              <>
                                {["Leading cross-functional teams to deliver product goals","Collaborating with stakeholders on quarterly planning"].map((ph, i) => (
                                  <div key={i} style={{ fontSize: 11.5, color: "#ccc", lineHeight: 1.6, marginBottom: 5,
                                    display: "flex", gap: 6 }}>
                                    <span style={{ color: "#ddd", flexShrink: 0 }}>▸</span>
                                    <span>{ph}</span>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Feature callouts below preview */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                        {[
                          ["📊", "ATS score in real-time"],
                          ["🌍", "50+ languages"],
                          ["✨", "Achievement coaching"],
                          ["📄", "PDF & DOCX export"],
                        ].map(([icon, label]) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8,
                            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                            padding: "8px 12px", fontSize: 12, color: C.text2 }}>
                            <span>{icon}</span>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                </div>

                {/* Before / After bullets */}
                <FadeIn delay={200} style={{ marginTop: 60 }}>
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: "2px", color: C.accent2, marginBottom: 10 }}>Achievement coaching</p>
                    <h3 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 800,
                      letterSpacing: "-0.5px", color: C.text1, margin: 0 }}>
                      From weak to powerful in one click
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    {[
                      {
                        before: "Responsible for helping customers with their issues and making sure they were satisfied with the outcome",
                        after: "Resolved 40+ billing enquiries per day via phone and email, maintaining 96% CSAT across 6 months",
                        role: "Customer Support",
                      },
                      {
                        before: "Assisted with social media and helped grow the company's online presence",
                        after: "Grew Instagram following by 40% in 3 months by posting 5×/week and running 3 targeted ad campaigns",
                        role: "Marketing",
                      },
                    ].map(({ before, after, role }) => (
                      <div key={role} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                          fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "1px" }}>{role}</div>
                        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171",
                              background: "#f871711a", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.5px" }}>BEFORE</span>
                          </div>
                          <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.6, fontStyle: "italic" }}>"{before}"</div>
                        </div>
                        <div style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80",
                              background: "#4ade801a", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.5px" }}>AFTER</span>
                          </div>
                          <div style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, fontWeight: 500 }}>"{after}"</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", marginTop: 24 }}>
                    <button onClick={() => enter("resume")}
                      style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 8,
                        padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit" }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                      Try the achievement coach →
                    </button>
                  </div>
                </FadeIn>
              </div>
            </div>
          );
        })()}

        {/* Master Profile teaser */}
        <FadeIn>
          <div style={{ padding: "72px 24px 80px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 860, margin: "0 auto", display: "flex",
              flexDirection: isMobile ? "column" : "row", gap: isMobile ? 32 : 64,
              alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>Master Profile</p>
                <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 800,
                  letterSpacing: "-0.8px", color: C.text1, margin: "0 0 16px", lineHeight: 1.2 }}>
                  Build once.<br />Tailor for everything.
                </h2>
                <p style={{ fontSize: 16, color: C.text2, lineHeight: 1.75, margin: "0 0 28px" }}>
                  Create your complete career profile a single time — every job, every skill,
                  every achievement. Paste a job description and get a perfectly tailored
                  resume in seconds. No retyping, ever.
                </p>
                <button onClick={() => enter("master")}
                  style={{ padding: "12px 28px", background: C.grad, border: "none", borderRadius: 10,
                    color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accent}44` }}>
                  Build my Master Profile →
                </button>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 12,
                width: isMobile ? "100%" : 280 }}>
                {[
                  { icon: "📋", step: "1", text: "Fill your complete career history once" },
                  { icon: "📋", step: "2", text: "Paste any job description" },
                  { icon: "⭐", step: "3", text: "AI scores and selects relevant items" },
                  { icon: "📄", step: "4", text: "One-click tailored resume, ready to send" },
                ].map(({ icon, step, text }) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 16px", background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.grad,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {step}
                    </div>
                    <div style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.5 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* How it works */}
        <div style={{ padding: "72px 24px 80px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>How it works</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: "0 0 52px" }}>
                A polished CV in three steps
              </h2>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
              {[
                { n: "1", title: "Pick a template", desc: "Choose from 22 professional designs — from minimal to bold. Every template is ATS-safe." },
                { n: "2", title: "Fill in your details", desc: "Type directly into the live form. The preview updates in real time as you write." },
                { n: "3", title: "Download & apply", desc: "Export as PDF or DOCX in your chosen language. Ready to send in under 5 minutes." },
              ].map((s, i) => (
                <FadeIn key={s.n} delay={i * 120} style={{ textAlign: "center", padding: "0 28px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.grad,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 auto 18px" }}>{s.n}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.7 }}>{s.desc}</div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={400} style={{ textAlign: "center", marginTop: 44 }}>
              <button onClick={() => enter("resume")}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "13px 30px", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                  transition: "opacity 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
                Start now — it's free
              </button>
            </FadeIn>
          </div>
        </div>

        {/* Template strip */}
        <div style={{ padding: "0 24px 100px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.text3, marginBottom: 40 }}>22 professional templates</p>
            </FadeIn>
            {(() => {
              const q = tplSearch.trim().toLowerCase();
              const all = TEMPLATES.filter(t => !t.blank).filter(t =>
                !q || t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q)
              );
              const visible = all.slice(0, 6);
              if (visible.length === 0) return (
                <div style={{ textAlign: "center", padding: "60px 0", color: C.text3 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text2 }}>No templates match "{tplSearch}"</div>
                  <button onClick={() => setTplSearch("")}
                    style={{ marginTop: 12, fontSize: 13, color: C.accent2, background: "none",
                      border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    Clear search
                  </button>
                </div>
              );
              return (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 32 }}>
              {visible.map((tp, i) => (
                <FadeIn key={tp.id} delay={i * 60}>
                  <button onClick={() => enter("resume")}
                    style={{ background: "transparent", border: "none", borderRadius: 0,
                      overflow: "visible", cursor: "pointer", padding: 0, width: "100%",
                      transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
                      fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-7px) scale(1.015)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                    <div style={{ borderRadius: 0, overflow: "hidden",
                      boxShadow: "0 4px 22px rgba(0,0,0,0.38)",
                      transition: "box-shadow 0.22s ease" }}>
                      <ThumbPreview tp={tp} isMobile={false} />
                    </div>
                    <div style={{ padding: "10px 4px 0" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{tp.name}</div>
                      <div style={{ fontSize: 11.5, color: C.text2, marginTop: 2 }}>{tp.tag}</div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={420} style={{ textAlign: "center", marginTop: 48 }}>
              <button onClick={() => enter("resume")}
                style={{ background: "transparent", border: `1.5px solid ${C.borderHi}`,
                  borderRadius: 3, padding: "13px 36px", fontSize: 14.5, fontWeight: 600,
                  color: C.text1, cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.borderHi}18`; e.currentTarget.style.borderColor = C.accent2; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.borderHi; }}>
                Browse all 22 templates →
              </button>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 10 }}>
                {all.length > 6 ? `Showing 6 of ${all.length} templates` : `${all.length} template${all.length !== 1 ? "s" : ""} found`}
              </div>
            </FadeIn>
              </>);
            })()}
          </div>
        </div>

        {/* Free pledge */}
        <FadeIn>
          <div style={{ margin: "0 24px 80px", borderRadius: 4,
            background: `linear-gradient(135deg, ${C.accent}14 0%, ${C.accent2}08 100%)`,
            border: `1px solid ${C.accent}30`, padding: "56px 40px", textAlign: "center" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2.5px", color: C.accent2, marginBottom: 16 }}>Our commitment</div>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
                letterSpacing: "-1px", color: C.text1, margin: "0 0 16px", lineHeight: 1.15 }}>
                Free means <span style={{ background: C.grad,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually free.</span>
              </h2>
              <p style={{ fontSize: 16, color: C.text2, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 520 }}>
                No paid tier. No "Pro" upsell. No watermarks. No account required for the core builder.
                Templates, language options, previews, and PDF or DOCX downloads are available without a credit card.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {["✓ No watermarks", "✓ No account", "✓ No credit card", "✓ Browser-first editing", "✓ PDF & DOCX downloads"].map(t => (
                  <span key={t} style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 16px",
                    borderRadius: 999, border: `1.5px solid ${C.accent}44`,
                    color: C.accent2, background: `${C.accent}12` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Multilingual superpowers */}
        <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          background: C.surface, padding: "72px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>Multilingual superpowers</p>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1px",
                color: C.text1, margin: "0 0 16px" }}>Built for the global job market</h2>
              <p style={{ fontSize: 15.5, color: C.text2, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                The only resume builder designed from the ground up for multilingual job seekers and international careers.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {[
                { icon: "🌍", title: "Create a CV in 50+ languages", desc: "Switch the full interface and document language with one click. Every label, date format, and section adapts automatically." },
                { icon: "↔️", title: "Full right-to-left support", desc: "Arabic, Hebrew, Farsi and other RTL languages render with correct alignment, mirroring, and typography." },
                { icon: "🖋️", title: "Formatting survives translation", desc: "Your layout, template, and design stay pixel-perfect after translation. Only the words change." },
                { icon: "📝", title: "Multilingual cover letters", desc: "Generate a matching cover letter in any language with the same formatting as your resume." },
                { icon: "🔄", title: "Translate an existing CV", desc: "Paste your CV and translate all content to a new language instantly — no rebuilding from scratch." },
              ].map((f, i) => (
                <FadeIn key={f.title} delay={i * 55}>
                  <div style={{ background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: 3, padding: "22px 20px",
                    transition: "border-color 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}66`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 6 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Trust section */}
        <div style={{ padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>Privacy &amp; trust</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: "0 0 14px" }}>
                Your resume data stays yours. Always.
              </h2>
              <p style={{ fontSize: 15, color: C.text2, maxWidth: 520, margin: "0 auto" }}>
                Resume data is personal. ApplyCraft is designed around browser-first editing and export, without requiring an account or cloud resume storage.
              </p>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
              {[
                { icon: "🔒", title: "No account required", body: "ApplyCraft does not require an email, password, or account profile to use the core resume builder." },
                { icon: "🤖", title: "Optional AI helpers", body: "Use AI or translation helpers only when you are comfortable with the relevant provider processing submitted text." },
                { icon: "🇪🇺", title: "Privacy-conscious design", body: "The builder is designed to reduce the amount of personal data handled by the service." },
                { icon: "🗑️", title: "Clear your session", body: "Because no account profile is required, you can close the browser tab when you are done and start fresh later." },
                { icon: "📍", title: "Browser-side export", body: "The standard PDF and DOCX export flow runs in the browser using JavaScript." },
                { icon: "🔓", title: "No account profile", body: "No email, password, or personal dashboard is required before creating and downloading a resume." },
              ].map((f, i) => (
                <FadeIn key={f.title} delay={i * 60}>
                  <div style={{ background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: "22px 20px",
                    transition: "border-color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}55`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 6 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{f.body}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn style={{ textAlign: "center" }}>
              <a href="/privacy/" style={{ fontSize: 13.5, color: C.accent2, textDecoration: "none",
                borderBottom: `1px solid ${C.accent}44`, paddingBottom: 2 }}>
                Read our full Privacy Policy →
              </a>
            </FadeIn>
          </div>
        </div>

        {/* Early adopter CTA — replaces fake testimonials */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "72px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <FadeIn>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800,
                letterSpacing: "-0.6px", color: C.text1, margin: "0 0 14px" }}>
                We're just getting started
              </h2>
              <p style={{ fontSize: 15.5, color: C.text2, lineHeight: 1.7, margin: "0 0 12px" }}>
                ApplyCraft is a new, independent tool built by one person who got tired of resume builders
                that paywalled basic features, added watermarks, and stored personal data without consent.
              </p>
              <p style={{ fontSize: 14.5, color: C.text3, lineHeight: 1.7, margin: "0 0 32px" }}>
                No fake reviews. No VC spin. If you use ApplyCraft and it helps you land an interview,
                we'd genuinely love to hear about it — your feedback shapes what gets built next.
              </p>
              <a href="mailto:hello@applycraft.io?subject=ApplyCraft feedback"
                style={{ display: "inline-flex", alignItems: "center", gap: 8,
                  background: C.grad, color: "#fff", borderRadius: 8,
                  padding: "12px 28px", fontSize: 14.5, fontWeight: 700,
                  textDecoration: "none" }}>
                Share your experience →
              </a>
            </FadeIn>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: "80px 24px 80px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <FadeIn style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>FAQ</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800,
                letterSpacing: "-0.8px", color: C.text1, margin: 0 }}>Common questions</h2>
            </FadeIn>
            {[
              { q: "Is ApplyCraft really free?",
                a: "Yes. The core builder, templates, language options, previews, and PDF or DOCX downloads are available without a paid tier, account, or credit card." },
              { q: "Do you store or sell my data?",
                a: "ApplyCraft does not require an account profile to build a resume. Standard editing and export are browser-first; optional AI and translation helpers may process the text you choose to submit." },
              { q: "Are the templates ATS-compatible?",
                a: "The templates are designed with readable typography, clear section headings, and ATS-conscious layouts to improve parsing compatibility." },
              { q: "Can I really use 50+ languages?",
                a: "Yes. Type directly in any language, switch document labels and date formats, and use the Translate button to convert an existing CV to a different language without rebuilding from scratch. RTL languages like Arabic are fully supported." },
              { q: "What download formats are available?",
                a: "PDF and DOCX. PDF is ideal for most applications. DOCX is available for recruiters or employers who need an editable file." },
              { q: "Do I need to create an account?",
                a: "No. There is no sign-up, no login, no email address required. Open the app and start building immediately." },
            ].map((item, i) => <FAQItem key={i} item={item} C={C} />)}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <FadeIn>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1px",
                margin: "0 0 16px", color: C.text1 }}>Start building for free</h2>
              <p style={{ fontSize: 16, color: C.text2, margin: "0 0 36px" }}>
                No account needed. Download your resume in seconds.
              </p>
            </FadeIn>
            <FadeIn delay={120}>
              <button onClick={() => enter("resume")}
                style={{ background: C.grad, color: "#fff", border: "none", borderRadius: 3,
                  padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
                  transition: "opacity 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
                Build My Resume — It's Free
              </button>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "56px 24px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
              {/* Brand */}
              <div style={{ maxWidth: 280 }}>
                <button onClick={() => setAppView("landing")}
                  style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    fontSize: 20, fontWeight: 800, border: "none", cursor: "pointer", padding: 0,
                    fontFamily: "inherit", display: "block", marginBottom: 12, letterSpacing: "-0.5px" }}>ApplyCraft</button>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.75, margin: "0 0 16px" }}>
                  Free resume and cover letter builder for the global job market. 50+ languages, 22 templates, no sign-up required.
                </p>
                <a href={`mailto:${AUTHOR.email}`}
                  style={{ fontSize: 13, color: C.text2, textDecoration: "none" }}>
                  {AUTHOR.email}
                </a>
              </div>
              {/* Links */}
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: C.text3, marginBottom: 16 }}>Product</div>
                  {[
                    ["Resume Builder", () => enter("resume")],
                    ["Cover Letter", () => enter("cover")],
                  ].map(([label, fn]) => (
                    <button key={label} onClick={fn}
                      style={{ display: "block", fontSize: 13.5, color: C.text2, background: "none",
                        border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "inherit",
                        textAlign: "left" }}>{label}</button>
                  ))}
                  <a href="/ats-checker/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>ATS Checker</a>
                  <a href="/changelog/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Changelog</a>
                  <a href="/roadmap/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Roadmap</a>
                  <a href="/status/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Status</a>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: C.text3, marginBottom: 16 }}>Company</div>
                  <a href="/about/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>About &amp; Founder</a>
                  <a href="/contact/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Contact</a>
                  {AUTHOR.github && (
                    <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>GitHub</a>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: C.text3, marginBottom: 16 }}>Resources</div>
                  <a href="/help/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Help Center</a>
                  <a href="/resume-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Resume Guide</a>
                  <a href="/ats-resume-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>ATS Guide</a>
                  <a href="/cover-letter-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Cover Letter Guide</a>
                  <a href="/free-resume-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Free Resume Builder</a>
                  <a href="/student-resume-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Student Resume Builder</a>
                  <a href="/canadian-resume-builder/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Canadian Resume Builder</a>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", color: C.text3, marginBottom: 16 }}>Legal</div>
                  <a href="/privacy/" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Privacy Policy</a>
                  <a href="/privacy/#gdpr" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>GDPR</a>
                  <a href="/privacy/#cookies" style={{ display: "block", fontSize: 13.5, color: C.text2, textDecoration: "none", padding: "4px 0" }}>Cookies</a>
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 12.5, color: C.text3 }}>© {new Date().getFullYear()} ApplyCraft by Isaac Biroue · applycraft.io</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.text3 }}>🔒 No account required</span>
                <span style={{ fontSize: 12, color: C.text3 }}>🤖 Optional AI helpers</span>
                <span style={{ fontSize: 12, color: C.text3 }}>🌐 Browser-first editing</span>
              </div>
            </div>
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
                <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px",
                  background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ApplyCraft
                </div>
                <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Career toolkit</div>
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

          {/* Sidebar search */}
          {sidebarOpen && (
            <div style={{ padding: "10px 12px 4px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: C.text3, fontSize: 13, pointerEvents: "none" }}>🔍</span>
                <input
                  value={sideSearch}
                  onChange={e => setSideSearch(e.target.value)}
                  placeholder="Search features..."
                  style={{ width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 28px 7px 32px", fontSize: 13.5, color: C.text1,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = C.accent; }}
                  onBlur={e => { e.target.style.borderColor = C.border; }}
                />
                {sideSearch && (
                  <button onClick={() => setSideSearch("")}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: C.text3, cursor: "pointer",
                      fontSize: 13, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>✕</button>
                )}
              </div>
            </div>
          )}

          {/* Main nav */}
          <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {(sideSearch ? NAV.filter(n => n.label.toLowerCase().includes(sideSearch.toLowerCase())) : NAV).map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  padding: sidebarOpen ? "9px 12px" : "9px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
                  fontSize: 15.5, fontWeight: navPage === item.id ? 700 : 500,
                  background: navPage === item.id ? `${C.accent}18` : "transparent",
                  color: navPage === item.id ? C.accent2 : C.text2,
                  transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxShadow: navPage === item.id ? `inset 2px 0 0 ${C.accent}` : "none" }}>
                <span style={{ fontSize: 19, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{item.label}</span>}
                {sidebarOpen && item.soon && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent2, background: `${C.accent}20`, borderRadius: 999, padding: "2px 6px", flexShrink: 0 }}>SOON</span>}
              </button>
            ))}
          </nav>

          {/* Free badge */}
          {sidebarOpen && (
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ padding: "10px 12px", background: `${C.accent}0E`,
                border: `1px solid ${C.accent}30`, borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.accent2, marginBottom: 4,
                  letterSpacing: "0.4px" }}>100% FREE</div>
                <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.55 }}>
                  Templates, language options, and downloads are available without an account.
                </div>
                {AUTHOR.github && (
                  <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 700,
                      color: C.accent2, textDecoration: "none" }}>
                    ⭐ Star on GitHub →
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: isFormView ? "hidden" : "auto",
        padding: isMobile ? "8px 4px" : "16px 24px",
        ...(isFormView ? { display: "flex", flexDirection: "column" } : {}) }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%",
          ...(isFormView ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } : {}) }}>

        {/* Persistent top bar: language picker + auth */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center",
          marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
          <LanguageDropdown
            selected={selectedLang}
            onSelect={(l) => {
              setSelectedLang(l);
              setPhoneCode(LANG_CODE[l.code] || "+1");
            }}
          />
          {currentUser ? (
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 11px",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
                  cursor: "pointer", fontFamily: "inherit", color: C.text1 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</span>
                <span style={{ fontSize: 9, color: C.text3 }}>▾</span>
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 180,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 9999 }}>
                  <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{currentUser.name}</div>
                    <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>{currentUser.email}</div>
                  </div>
                  <button onClick={() => { setCurrentUser(null); setUserMenuOpen(false); }}
                    style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left",
                      background: "none", border: "none", color: "#f87171", fontSize: 13,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => { setAuthModalTab("login"); setAuthModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
                color: C.text1, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", transition: "border-color 0.15s" }}>
              Sign In
            </button>
          )}
        </div>
        <AuthModal open={authModal} initialTab={authModalTab} onClose={() => setAuthModal(false)}
          onLogin={user => { setCurrentUser(user); setAuthModal(false); }} />

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
                {item.icon} {item.label}{item.soon && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent2, background: `${C.accent}20`, borderRadius: 999, padding: "1px 5px", marginLeft: 2 }}>SOON</span>}
              </button>
            ))}
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
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    {item.label}
                    {item.soon && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent2, background: `${C.accent}20`, borderRadius: 999, padding: "2px 6px", marginLeft: "auto", flexShrink: 0 }}>SOON</span>}
                  </button>
                ))}
              </nav>
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: "10px 12px", background: `${C.accent}0E`, border: `1px solid ${C.accent}30`, borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.accent2, marginBottom: 4 }}>100% FREE</div>
                  <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.55 }}>Templates, language options, and downloads are available without an account.</div>
                  {AUTHOR.github && (
                    <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 7, fontSize: 12, fontWeight: 700, color: C.accent2, textDecoration: "none" }}>
                      ⭐ Star on GitHub →
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}

        {isFormView
          ? <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{pageBody}</div>
          : (navPage === "tracker" || navPage === "master" || navPage === "ats")
            ? <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{pageBody}</div>
            : pageBody}
        </div>
      </div>
    </div>
  );
}

// ── AuthModal ─────────────────────────────────────────────────────
function AuthModal({ open, initialTab = "login", onClose, onLogin }) {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [captchaQ, setCaptchaQ] = useState({ a: 3, b: 7 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setForm({ name: "", email: "", password: "", confirm: "" });
      setErrors({});
      setCaptchaInput("");
      setSignupDone(false);
      setShowPw(false);
      setShowCf(false);
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
    }
  }, [open]);

  useEffect(() => {
    if (tab === "signup") {
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
      setCaptchaInput("");
      setErrors(e => ({ ...e, captcha: "" }));
    }
  }, [tab]);

  if (!open) return null;

  const setF = (k) => (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: "" }));
  };

  function pwStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  }
  const strength = pwStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#f87171", "#fbbf24", "#34d399", "#4ade80"][strength];

  async function handleLogin(e) {
    e.preventDefault();
    const er = {};
    if (!form.email.trim()) er.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "Enter a valid email address.";
    if (!form.password) er.password = "Password is required.";
    if (Object.keys(er).length) { setErrors(er); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onLogin({ email: form.email, name: form.email.split("@")[0] });
  }

  async function handleSignup(e) {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = "Full name is required.";
    if (!form.email.trim()) er.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "Enter a valid email address.";
    if (!form.password) er.password = "Password is required.";
    else if (form.password.length < 8) er.password = "Must be at least 8 characters.";
    if (form.confirm !== form.password) er.confirm = "Passwords don't match.";
    if (!captchaInput.trim()) er.captcha = "Please complete the security check.";
    else if (parseInt(captchaInput, 10) !== captchaQ.a + captchaQ.b) {
      er.captcha = "Incorrect answer — try again.";
      setCaptchaQ({ a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) });
      setCaptchaInput("");
    }
    if (Object.keys(er).length) { setErrors(er); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSignupDone(true);
    setTimeout(() => {
      setSignupDone(false);
      setTab("login");
      setForm(f => ({ ...f, password: "", confirm: "" }));
    }, 2000);
  }

  const minp = (extra = {}) => ({
    width: "100%", boxSizing: "border-box", padding: "11px 14px",
    background: C.elevated, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text1, fontSize: 14, outline: "none",
    fontFamily: "inherit", transition: "border-color .15s, box-shadow .15s",
    ...extra,
  });
  const mlbl = {
    display: "block", fontSize: 11.5, fontWeight: 700, color: C.accent2,
    margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.7px",
  };
  const merr = { color: "#f87171", fontSize: 11.5, margin: "5px 0 0", lineHeight: 1.4 };

  const SocialBtn = ({ icon, label }) => (
    <button type="button" title="Coming soon — social login will be available soon"
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 14px", background: C.elevated, border: `1px solid ${C.border}`,
        borderRadius: 8, color: C.text2, fontSize: 13.5, fontWeight: 500, cursor: "not-allowed",
        fontFamily: "inherit", opacity: 0.6 }}>
      <span style={{ width: 22, height: 22, borderRadius: 4, background: C.surface,
        border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center",
        justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{icon}</span>
      {label}
      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: C.text3,
        background: C.surface, padding: "2px 7px", borderRadius: 999,
        border: `1px solid ${C.border}`, letterSpacing: "0.3px" }}>Soon</span>
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{ width: "100%", maxWidth: 430, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        animation: "acFadeUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}>

        {/* ── Header ── */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px",
            background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ApplyCraft
          </div>
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`,
              background: C.elevated, color: C.text2, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontFamily: "inherit" }}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: "16px 28px 0" }}>
          <div style={{ display: "flex", background: C.elevated, borderRadius: 8,
            padding: 3, border: `1px solid ${C.border}` }}>
            {[["login", "Log In"], ["signup", "Create Account"]].map(([id, label]) => (
              <button key={id} type="button" onClick={() => { setTab(id); setErrors({}); }}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 6, border: "none",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                  background: tab === id ? C.surface : "transparent",
                  color: tab === id ? C.text1 : C.text3,
                  boxShadow: tab === id ? "0 2px 8px rgba(0,0,0,0.35)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 28px 28px", overflowY: "auto", maxHeight: "70vh" }}>

          {/* Success state */}
          {signupDone && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>
                Account created!
              </div>
              <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>
                Welcome to ApplyCraft. Redirecting you to log in…
              </div>
            </div>
          )}

          {!signupDone && (<>

            {/* Social buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              <SocialBtn icon="G" label="Continue with Google" />
              <SocialBtn icon="f" label="Continue with Facebook" />
              <SocialBtn icon="in" label="Continue with LinkedIn" />
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 600, letterSpacing: "0.5px" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* ── Login form ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} noValidate>
                <div style={{ marginBottom: 14 }}>
                  <label style={mlbl}>Email address</label>
                  <input type="email" autoComplete="email" value={form.email} onChange={setF("email")}
                    placeholder="you@example.com"
                    style={{ ...minp(), ...(errors.email ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.email ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.email && <p style={merr}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={mlbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw ? "text" : "password"} autoComplete="current-password"
                      value={form.password} onChange={setF("password")} placeholder="••••••••"
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.password ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.password ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: C.text3,
                        fontSize: 16, padding: 0, lineHeight: 1 }}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                  {errors.password && <p style={merr}>{errors.password}</p>}
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", background: C.grad, border: "none",
                    borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                    transition: "opacity 0.15s" }}>
                  {loading ? "Signing in…" : "Log In"}
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: C.text3, margin: "16px 0 0" }}>
                  No account yet?{" "}
                  <button type="button" onClick={() => { setTab("signup"); setErrors({}); }}
                    style={{ color: C.accent2, background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
                    Create one free →
                  </button>
                </p>
              </form>
            )}

            {/* ── Sign up form ── */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} noValidate>
                <div style={{ marginBottom: 14 }}>
                  <label style={mlbl}>Full Name</label>
                  <input autoComplete="name" value={form.name} onChange={setF("name")}
                    placeholder="Jane Doe"
                    style={{ ...minp(), ...(errors.name ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.name ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.name && <p style={merr}>{errors.name}</p>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={mlbl}>Email address</label>
                  <input type="email" autoComplete="email" value={form.email} onChange={setF("email")}
                    placeholder="you@example.com"
                    style={{ ...minp(), ...(errors.email ? { borderColor: "#f87171" } : {}) }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                    onBlur={e => { e.target.style.borderColor = errors.email ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  {errors.email && <p style={merr}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={mlbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw ? "text" : "password"} autoComplete="new-password"
                      value={form.password} onChange={setF("password")} placeholder="Min. 8 characters"
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.password ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.password ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: C.text3, fontSize: 16, padding: 0, lineHeight: 1 }}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                  {form.password.length > 0 && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 7 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 999,
                          background: i <= strength ? strengthColor : C.elevated,
                          transition: "background 0.22s" }} />
                      ))}
                      <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor,
                        marginLeft: 6, flexShrink: 0, minWidth: 36 }}>{strengthLabel}</span>
                    </div>
                  )}
                  {errors.password && <p style={merr}>{errors.password}</p>}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={mlbl}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showCf ? "text" : "password"} autoComplete="new-password"
                      value={form.confirm} onChange={setF("confirm")} placeholder="Repeat your password"
                      style={{ ...minp({ paddingRight: 42 }), ...(errors.confirm ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.confirm ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowCf(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: C.text3, fontSize: 16, padding: 0, lineHeight: 1 }}>{showCf ? "🙈" : "👁"}</button>
                  </div>
                  {errors.confirm && <p style={merr}>{errors.confirm}</p>}
                </div>

                {/* CAPTCHA */}
                <div style={{ marginBottom: 22, padding: "14px 16px",
                  background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent2,
                    textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🔒</span> Security Check
                  </div>
                  <div style={{ fontSize: 12.5, color: C.text2, marginBottom: 10 }}>
                    Solve this to verify you're human:
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700,
                      color: C.text1, background: C.surface, padding: "8px 18px",
                      borderRadius: 8, border: `1px solid ${C.border}`,
                      letterSpacing: "2px", flexShrink: 0 }}>
                      {captchaQ.a} + {captchaQ.b} = ?
                    </div>
                    <input type="number" inputMode="numeric" value={captchaInput}
                      onChange={e => { setCaptchaInput(e.target.value); if (errors.captcha) setErrors(er => ({ ...er, captcha: "" })); }}
                      placeholder="Answer"
                      style={{ ...minp({ width: 100, flexShrink: 0 }), ...(errors.captcha ? { borderColor: "#f87171" } : {}) }}
                      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; }}
                      onBlur={e => { e.target.style.borderColor = errors.captcha ? "#f87171" : C.border; e.target.style.boxShadow = "none"; }} />
                  </div>
                  {errors.captcha && <p style={{ ...merr, marginTop: 8 }}>{errors.captcha}</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", background: C.grad, border: "none",
                    borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                    transition: "opacity 0.15s" }}>
                  {loading ? "Creating account…" : "Create Account — Free"}
                </button>
                <p style={{ textAlign: "center", fontSize: 12.5, color: C.text3, margin: "14px 0 0", lineHeight: 1.5 }}>
                  By creating an account you agree to our{" "}
                  <span style={{ color: C.text2, textDecoration: "underline", cursor: "pointer" }}>Terms</span>
                  {" "}and{" "}
                  <span style={{ color: C.text2, textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
                </p>
                <p style={{ textAlign: "center", fontSize: 13, color: C.text3, margin: "10px 0 0" }}>
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setTab("login"); setErrors({}); }}
                    style={{ color: C.accent2, background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
                    Log in →
                  </button>
                </p>
              </form>
            )}

          </>)}
        </div>
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

function FadeIn({ children, delay = 0, style = {}, as: Tag = "div" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(22px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      willChange: "opacity, transform",
      ...style
    }}>{children}</Tag>
  );
}

function FAQItem({ item, C }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn>
      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ width: "100%", display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "20px 0", background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            fontSize: 15, fontWeight: 600, color: C.text1 }}>
          <span>{item.q}</span>
          <span style={{ fontSize: 22, color: C.accent2, flexShrink: 0, marginLeft: 16,
            display: "inline-block",
            transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
            transform: open ? "rotate(45deg)" : "none" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 220 : 0, overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: C.text2, lineHeight: 1.8 }}>
            {item.a}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

function PageHeader({ eyebrow, icon, title, sub, pill, isMobile }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
        background: `${C.accent}12`, border: `1px solid ${C.accent}28`,
        borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
        {icon && <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>}
        <span style={{ fontSize: 10.5, fontWeight: 800, color: C.accent2,
          textTransform: "uppercase", letterSpacing: "1.4px" }}>{eyebrow}</span>
        {pill && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3,
            background: C.elevated, borderRadius: 999, padding: "1px 8px",
            border: `1px solid ${C.border}`, marginLeft: 2 }}>{pill}</span>
        )}
      </div>
      <h1 style={{ ...h1, fontSize: isMobile ? 22 : 32, margin: "0 0 10px",
        lineHeight: 1.15 }}>{title}</h1>
      {sub && (
        <p style={{ ...subtitle, margin: 0, maxWidth: 520, fontSize: isMobile ? 13.5 : 15 }}>{sub}</p>
      )}
      <div style={{ marginTop: 18, height: 2, width: 48,
        background: `linear-gradient(90deg, ${C.accent}, ${C.blue})`,
        borderRadius: 999 }} />
    </div>
  );
}

function SectionHeader({ icon, title, filled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px",
      paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase",
        letterSpacing: "1px", color: C.text2, flex: 1 }}>{title}</span>
      {filled && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80",
        background: "rgba(74,222,128,0.12)", padding: "2px 8px", borderRadius: 999 }}>✓ Filled</span>}
    </div>
  );
}

function Hint({ text }) {
  return (
    <div style={{ fontSize: 11.5, color: C.text3, marginTop: 6, lineHeight: 1.6, fontStyle: "italic" }}>{text}</div>
  );
}

function IconInput({ icon, children }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        fontSize: 14, opacity: 0.45, pointerEvents: "none", lineHeight: 1 }}>{icon}</span>
      {React.cloneElement(children, {
        style: { ...children.props.style, paddingLeft: 34 }
      })}
    </div>
  );
}

function ThumbPreview({ tp, isMobile }) {
  const INNER_W = 700;
  const frameRef = useRef(null);
  const [scale, setScale] = useState(isMobile ? 0.30 : 0.42);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / INNER_W);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  const H = Math.round(scale * 906);

  if (tp.blank) {
    return (
      <div ref={frameRef} style={{ height: H, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={Math.round(H * 0.52)} height={Math.round(H * 0.52)} viewBox="0 0 100 100"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="8" x2="50" y2="92" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="50" x2="92" y2="50" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div ref={frameRef} style={{ overflow: "hidden" }}>
      <div style={{ height: H, overflow: "hidden", position: "relative",
        background: tp.id === "tech" ? "#0d1117" : tp.id === "dusk" ? "#1a1a1a" : "#fff" }}>
        <div style={{ width: INNER_W, transform: `scale(${scale})`, transformOrigin: "top left",
          position: "absolute", top: 0, left: 0, pointerEvents: "none", userSelect: "none" }}>
          <ResumePaper tpl={tp}
            result={THUMB_SAMPLES[tp.id]?.result || SAMPLE_RESUME}
            rtl={THUMB_SAMPLES[tp.id]?.rtl || false}
            placeholder={false} preview />
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
            {data.photo && (
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
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
            {data.photo && (
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: `2px solid ${tpl.accent}55` }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
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
            <div style={{ width: 54, height: 54, borderRadius: "50%", overflow: "hidden",
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, marginBottom: 14, flexShrink: 0 }}>
              {data.photo
                ? <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : data.name.charAt(0)
              }
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
            {data.photo && (
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
                margin: "0 auto 14px", border: `2px solid ${tpl.accent}88` }}>
                <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
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

  // ── HORIZON (centered banner header) ─────────────────────────────
  if (tpl.id === "horizon") {
    return (
      <div style={paper}>
        <div style={{ background: tpl.accent, padding: "30px 32px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "1px",
            textTransform: "uppercase", lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 6,
            letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500 }}>{data.title}</div>}
        </div>
        <div style={{ background: "#fafafa", borderBottom: "1px solid #eee", padding: "9px 32px",
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 18px" }}>
          {data.contact.map((c, i) => (
            <span key={i} style={{ fontSize: 10.5, color: "#555" }}>{c}</span>
          ))}
        </div>
        <div style={{ padding: "20px 32px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#444", margin: "0 0 18px",
              textAlign: "center", borderBottom: `1px solid ${tpl.accent}33`, paddingBottom: 16 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
                  color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: tpl.accent + "44" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  paddingLeft: 12 }}>
                  <span style={{ color: tpl.accent, marginRight: 5 }}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── NORDIC (Scandinavian minimal) ────────────────────────────────
  if (tpl.id === "nordic") {
    return (
      <div style={paper}>
        <div style={{ padding: "36px 44px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 32, fontWeight: 300, color: "#111", letterSpacing: "-0.5px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#666", marginTop: 6,
              fontStyle: "italic", fontWeight: 400 }}>{data.title}</div>}
            <div style={{ height: 1, background: tpl.accent, width: "100%", marginTop: 18 }} />
            <div style={{ fontSize: 10.5, color: "#888", marginTop: 10, lineHeight: 2 }}>
              {data.contact.join("   ·   ")}
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.85, color: "#444", margin: "0 0 26px",
              borderLeft: `3px solid ${tpl.accent}`, paddingLeft: 14 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "3px", color: tpl.accent, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px" }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 12, color: "#555" }}>— {it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.75, color: "#333", marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── DUSK (dark warm charcoal, amber) ─────────────────────────────
  if (tpl.id === "dusk") {
    return (
      <div style={{ ...paper, background: "#1a1a1a", color: "#f0ece3" }}>
        <div style={{ padding: "28px 30px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f0ece3", letterSpacing: "-0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5,
              fontWeight: 600, letterSpacing: "0.5px" }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#7a6e5f", marginTop: 8, lineHeight: 1.9 }}>
              {data.contact.join("   ·   ")}
            </div>
            <div style={{ height: 1, background: tpl.accent + "55", marginTop: 16 }} />
          </div>
          {data.summary && (
            <p style={{ fontSize: 12, lineHeight: 1.7, color: "#c4b89a", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 17 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 3,
                      border: `1px solid ${tpl.accent}66`, color: tpl.accent + "cc" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: "#d4c9b5", marginBottom: 5,
                  paddingLeft: 12 }}>
                  <span style={{ color: tpl.accent }}>▸ </span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── VERTEX (right sidebar, reversed) ─────────────────────────────
  if (tpl.id === "vertex") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ flex: 1, padding: "28px 20px 28px 28px" }}>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              {data.photo && (
                <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden",
                  border: `2px solid ${tpl.accent}55`, flexShrink: 0 }}>
                  <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
                  lineHeight: 1.1 }}>{data.name}</div>
                {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5,
                  fontWeight: 600 }}>{data.title}</div>}
              </div>
            </div>
            {data.summary && (
              <p style={{ fontSize: 12, lineHeight: 1.7, color: "#555", margin: "0 0 18px",
                paddingBottom: 14, borderBottom: `1px solid ${tpl.accent}22` }}>{data.summary}</p>
            )}
            {mainS.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {s.heading}
                  <div style={{ flex: 1, height: 1, background: tpl.accent + "33" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: "#333", marginBottom: 4,
                    paddingLeft: 10, borderLeft: `2px solid ${tpl.accent}44` }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ width: "30%", background: tpl.accent + "0f",
            borderLeft: `1px solid ${tpl.accent}22`, padding: "28px 14px", flexShrink: 0 }}>
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: "#555", marginBottom: 8,
                lineHeight: 1.5, wordBreak: "break-all" }}>{c}</div>
            ))}
            <div style={{ height: 1, background: tpl.accent + "44", margin: "14px 0" }} />
            {sideS.map((s, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 8 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3,
                      background: tpl.accent + "18", color: tpl.accent }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMY (academic/scholarly) ─────────────────────────────────
  if (tpl.id === "academy") {
    return (
      <div style={paper}>
        <div style={{ padding: "32px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: "0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12.5, color: "#444", marginTop: 5 }}>{data.title}</div>}
            <div style={{ height: 2, background: tpl.accent, margin: "12px auto 3px", width: "60%" }} />
            <div style={{ height: 1, background: tpl.accent + "55", margin: "0 auto 12px", width: "60%" }} />
            <div style={{ fontSize: 10.5, color: "#666", lineHeight: 1.9 }}>{data.contact.join("   ·   ")}</div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12, lineHeight: 1.8, color: "#444", margin: "0 0 20px",
              fontStyle: "italic", textAlign: "center" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2px", color: tpl.accent, marginBottom: 8,
                borderBottom: `1px solid ${tpl.accent}44`, paddingBottom: 5 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}66`, color: "#333" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 5, color: tpl.accent }}>·</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SPARK (vibrant section header bands) ─────────────────────────
  if (tpl.id === "spark") {
    return (
      <div style={paper}>
        <div style={{ padding: "26px 28px 20px" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: tpl.accent, marginTop: 5, fontWeight: 600 }}>{data.title}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", marginTop: 8 }}>
            {data.contact.map((c, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "#666" }}>{c}</span>
            ))}
          </div>
        </div>
        {data.summary && (
          <div style={{ margin: "0 28px 18px", fontSize: 12.5, lineHeight: 1.65, color: "#444",
            background: tpl.accent + "0c", borderRadius: 6, padding: "10px 14px",
            borderLeft: `3px solid ${tpl.accent}` }}>{data.summary}</div>
        )}
        {data.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 0 }}>
            <div style={{ background: tpl.accent + "16", padding: "6px 28px",
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: tpl.accent,
              borderLeft: `3px solid ${tpl.accent}` }}>{s.heading}</div>
            <div style={{ padding: "10px 28px 14px" }}>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "3px 12px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 600 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 4 }}>
                  <span style={{ color: tpl.accent, marginRight: 6, fontWeight: 700 }}>›</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── STONE (warm gray header, understated serif) ───────────────────
  if (tpl.id === "stone") {
    return (
      <div style={paper}>
        <div style={{ background: "#f6f4ef", borderBottom: "1px solid #e8e3da", padding: "28px 32px" }}>
          <div style={{ fontSize: 27, fontWeight: 700, color: "#2c2520", letterSpacing: "0.2px",
            lineHeight: 1.1 }}>{data.name}</div>
          {data.title && <div style={{ fontSize: 12.5, color: tpl.accent, marginTop: 5,
            fontStyle: "italic" }}>{data.title}</div>}
          <div style={{ fontSize: 10.5, color: "#7a6e65", marginTop: 10, lineHeight: 1.9 }}>
            {data.contact.join("   ·   ")}
          </div>
        </div>
        <div style={{ padding: "22px 32px" }}>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "#4a4039", margin: "0 0 20px",
              fontStyle: "italic" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "2.5px", color: tpl.accent, whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1, background: "#d4cfc7" }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 3,
                      background: "#f6f4ef", border: "1px solid #d4cfc7", color: "#4a4039" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.7, color: "#3d3530", marginBottom: 5 }}>{it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── IVY (British CV style, double rule) ──────────────────────────
  if (tpl.id === "ivy") {
    return (
      <div style={paper}>
        <div style={{ padding: "30px 38px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111", lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 13, color: "#444", marginTop: 4,
              fontStyle: "italic" }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#666", marginTop: 8, lineHeight: 1.9 }}>
              {data.contact.join("   ·   ")}
            </div>
          </div>
          <div style={{ height: 2, background: tpl.accent, marginBottom: 2 }} />
          <div style={{ height: 1, background: tpl.accent + "66", marginBottom: 18 }} />
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "#444", margin: "0 0 18px" }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tpl.accent,
                borderBottom: `1px solid ${tpl.accent}44`, paddingBottom: 5, marginBottom: 10 }}>{s.heading}</div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11.5, padding: "2px 10px", borderRadius: 2,
                      border: `1px solid ${tpl.accent}55`, color: "#333" }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "#333", marginBottom: 5,
                  paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 2, top: 6, width: 5, height: 5,
                    background: tpl.accent, borderRadius: "50%",
                    display: "inline-block" }} />{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── CARBON (charcoal sidebar, square monogram) ────────────────────
  if (tpl.id === "carbon") {
    const sideS = data.sections.filter(isSidebar);
    const mainS = data.sections.filter(s => !isSidebar(s));
    return (
      <div style={paper}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <div style={{ width: "31%", background: "#1e1e1e", color: "#e4e4e4",
            padding: "28px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 54, height: 54, background: tpl.accent + "44",
              border: `2px solid ${tpl.accent}`, borderRadius: 4, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-1px" }}>
              {data.photo
                ? <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : data.name.split(" ").map(w => w[0]).slice(0, 2).join("")
              }
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 3 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 10.5, color: tpl.accent, marginBottom: 18 }}>{data.title}</div>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 14 }} />
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: "#9ca3af", marginBottom: 8,
                wordBreak: "break-all", lineHeight: 1.5 }}>{c}</div>
            ))}
            {sideS.map((s, i) => (
              <div key={i} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px", color: tpl.accent, marginBottom: 9 }}>{s.heading}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 2,
                      background: "rgba(255,255,255,0.08)", color: "#d1d5db" }}>{it}</span>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div style={{ width: 8, height: 8, background: tpl.accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "2px", color: "#1e1e1e" }}>{s.heading}</div>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333",
                    marginBottom: 5, paddingLeft: 16 }}>· {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PULSE (gradient left bar, square bullets) ─────────────────────
  if (tpl.id === "pulse") {
    return (
      <div style={{ ...paper, display: "flex" }}>
        <div style={{ width: 5, background: `linear-gradient(180deg, ${tpl.accent} 0%, #3b82f6 100%)`,
          flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "28px 26px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 27, fontWeight: 800, color: "#111", letterSpacing: "-0.3px",
              lineHeight: 1.1 }}>{data.name}</div>
            {data.title && <div style={{ fontSize: 12, color: tpl.accent, marginTop: 5, fontWeight: 600 }}>{data.title}</div>}
            <div style={{ fontSize: 10.5, color: "#777", marginTop: 8, lineHeight: 1.9 }}>
              {data.contact.join("   ·   ")}
            </div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#444", margin: "0 0 18px",
              borderLeft: `3px solid ${tpl.accent}55`, paddingLeft: 12 }}>{data.summary}</p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: `linear-gradient(90deg, ${tpl.accent}, #3b82f6)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  whiteSpace: "nowrap" }}>{s.heading}</div>
                <div style={{ flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${tpl.accent}44, transparent)` }} />
              </div>
              {isSidebar(s) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {s.items.map((it, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 999,
                      background: tpl.accent + "15", color: tpl.accent, fontWeight: 500 }}>{it}</span>
                  ))}
                </div>
              ) : s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333", marginBottom: 5,
                  display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: tpl.accent, flexShrink: 0,
                    marginTop: 5, borderRadius: 1 }} />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          ))}
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
const tplGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 };
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
    maxHeight: preview ? 906 : undefined,
    padding: preview ? 12 : 0,
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
  const INNER_W = 700;
  const frameRef = useRef(null);
  const [scale, setScale] = useState(isMobile ? 0.30 : 0.42);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / INNER_W);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  const H = Math.round(scale * 906);

  if (tp.blank) {
    return (
      <div ref={frameRef} style={{ height: H, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={Math.round(H * 0.52)} height={Math.round(H * 0.52)} viewBox="0 0 100 100"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="8" x2="50" y2="92" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="50" x2="92" y2="50" stroke="#c0c4cc" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div ref={frameRef} style={{ overflow: "hidden" }}>
      <div style={{ height: H, overflow: "hidden", position: "relative", background: "#fff" }}>
        <div style={{ width: INNER_W, transform: `scale(${scale})`, transformOrigin: "top left",
          position: "absolute", top: 0, left: 0, pointerEvents: "none", userSelect: "none" }}>
          <CoverLetterPaper tpl={tp} data={COVER_THUMB_SAMPLES[tp.id] || SAMPLE_COVER} preview />
        </div>
      </div>
    </div>
  );
}
