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
  { id: "classic",   name: "Classic",   tag: "Timeless, serif, single column",       accent: "#1f2937", font: "'Georgia', 'Times New Roman', serif" },
  { id: "modern",    name: "Modern",    tag: "Clean sans-serif with sidebar",         accent: "#2563eb", font: "'Inter', system-ui, sans-serif" },
  { id: "minimal",   name: "Minimal",   tag: "Lots of whitespace, understated",       accent: "#0f766e", font: "'Inter', system-ui, sans-serif" },
  { id: "bold",      name: "Bold",      tag: "Strong header band, high contrast",     accent: "#b91c1c", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "elegant",   name: "Elegant",   tag: "Refined, thin rules, light weight",     accent: "#7c3aed", font: "'Georgia', 'Palatino Linotype', serif" },
  { id: "executive", name: "Executive", tag: "Split header, left-bar sections, gold", accent: "#d97706", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "creative",  name: "Creative",  tag: "Right colour panel, bold & expressive", accent: "#db2777", font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: "tech",      name: "Tech",      tag: "Dark terminal style, monospace, green", accent: "#10b981", font: "'Courier New', 'Courier', monospace" },
];

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
      <div style={{ ...tplGrid, gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {TEMPLATES.map((tp) => (
          <button key={tp.id} onClick={() => { setTpl(tp); setStep("form"); }} style={tplCard}>
            <ThumbPreview tp={tp} />
            <div style={{ padding: isMobile ? "8px 10px" : "12px 14px", textAlign: rtl ? "right" : "left" }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, color: "#f5f8fc" }}>{tp.name}</div>
              <div style={{ fontSize: isMobile ? 11 : 12.5, color: "#8a98a8", marginTop: 2 }}>{tp.tag}</div>
            </div>
          </button>
        ))}
      </div>
      <PageFooter t={t} />
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
        <div style={{ fontSize: 13.5, color: "#8a98a8" }}>
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
            <button onClick={generate} disabled={loading || !form.name} style={{ ...cta, background: tpl.accent }}>
              {loading ? t.generating : t.generate}
            </button>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              marginTop: isMobile ? 24 : 0, flexWrap: "wrap" }}>
              <span style={{ ...badge, ...(aiPolished ? badgePolished : badgeLive),
                background: aiPolished ? `${tpl.accent}22` : "#1f2937",
                color: aiPolished ? tpl.accent : "#9fb0c2" }}>
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
                    width: 34, height: 34, borderRadius: "50%", border: "1px solid #555",
                    background: "#1a1a1a", color: "#ccc", fontSize: 16,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        <PageFooter t={t} />
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
      justifyContent: "center", minHeight: 320, gap: 16, color: "#5a6880", padding: 40 }}>
      <span style={{ fontSize: 48 }}>🚧</span>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#9fb0c2" }}>{label}</div>
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
            "1 Resume (live preview)", "5 templates", "PDF & DOCX download", "All languages",
          ], cta: "Get started", active: true },
          { name: "Pro", price: "$9", period: "/ month", color: "#2563eb", features: [
            "Unlimited resumes", "All 8 templates", "Cover letter builder", "Email signature", "AI polish (GPT-4)", "Priority support",
          ], cta: "Upgrade to Pro", badge: "Most popular" },
          { name: "Team", price: "$29", period: "/ month", color: "#7c3aed", features: [
            "Everything in Pro", "5 team seats", "Job tracker board", "Personal website builder", "Custom domain", "Dedicated support",
          ], cta: "Contact us" },
        ].map((plan) => (
          <div key={plan.name} style={{ background: plan.badge ? `${plan.color}11` : "#161c24",
            border: `1.5px solid ${plan.badge ? plan.color : "#232c38"}`,
            borderRadius: 16, padding: "28px 24px", position: "relative",
            display: "flex", flexDirection: "column", gap: 0 }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                background: plan.color, color: "#fff", fontSize: 11, fontWeight: 700,
                padding: "3px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: plan.color,
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: "#f5f8fc", lineHeight: 1 }}>
              {plan.price}<span style={{ fontSize: 15, fontWeight: 500, color: "#8a98a8" }}>{plan.period}</span>
            </div>
            <div style={{ height: 1, background: "#232c38", margin: "20px 0" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontSize: 13.5, color: "#cdd8e4", display: "flex", gap: 8 }}>
                  <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{ marginTop: "auto", padding: "11px 0", width: "100%",
              background: plan.active ? "transparent" : plan.color,
              border: `1.5px solid ${plan.color}`, borderRadius: 9,
              color: plan.active ? plan.color : "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  let pageBody;
  if (navPage === "resume") pageBody = step === "form" ? (formContent || mainContent) : mainContent;
  else if (navPage === "pricing") pageBody = <PricingPage />;
  else pageBody = <ComingSoon label={NAV.find(n => n.id === navPage)?.label || ""} />;

  const sbW = sidebarOpen ? 224 : 56;

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ ...rPage, display: "flex", padding: 0, minHeight: "100vh" }}>

      {/* ── Sidebar (desktop) ── */}
      {!isMobile && (
        <aside style={{ width: sbW, flexShrink: 0, background: "#0d1117",
          borderRight: "1px solid #1e2733", display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden",
          transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>

          {/* Logo + toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: sidebarOpen ? "20px 14px 20px 20px" : "20px 0", borderBottom: "1px solid #1e2733",
            minHeight: 64, transition: "padding .22s" }}>
            {sidebarOpen && (
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#f5f8fc", letterSpacing: "-0.5px" }}>Resumely</div>
                <div style={{ fontSize: 10.5, color: "#5a6880", marginTop: 1 }}>Career toolkit</div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 7,
                background: "#161c24", border: "1px solid #1e2733", color: "#6b7fa3",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, margin: sidebarOpen ? 0 : "0 auto", transition: "margin .22s" }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Main nav */}
          <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  padding: sidebarOpen ? "9px 12px" : "9px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%",
                  fontSize: 13.5, fontWeight: navPage === item.id ? 700 : 500,
                  background: navPage === item.id ? "#1e2d3d" : "transparent",
                  color: navPage === item.id ? "#e7ecf2" : "#6b7fa3",
                  transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap",
                  overflow: "hidden" }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Pricing + upsell */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid #1e2733" }}>
            <button onClick={() => setNavPage("pricing")}
              title={!sidebarOpen ? "Plans & Pricing" : undefined}
              style={{ display: "flex", alignItems: "center", gap: 10,
                padding: sidebarOpen ? "9px 12px" : "9px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                borderRadius: 9, border: "none", cursor: "pointer", width: "100%",
                fontSize: 13.5, fontWeight: navPage === "pricing" ? 700 : 500,
                background: navPage === "pricing" ? "#2563eb22" : "transparent",
                color: navPage === "pricing" ? "#60a5fa" : "#6b7fa3",
                transition: "background .15s, color .15s, padding .22s", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>💎</span>
              {sidebarOpen && "Plans & Pricing"}
            </button>
            {sidebarOpen && (
              <div style={{ margin: "10px 4px 0", padding: "10px 12px", background: "#2563eb18",
                border: "1px solid #2563eb44", borderRadius: 9 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>FREE PLAN</div>
                <div style={{ fontSize: 11, color: "#5a6880", lineHeight: 1.5 }}>Upgrade to Pro for AI polish, cover letters & more.</div>
                <button onClick={() => setNavPage("pricing")} style={{ marginTop: 8, fontSize: 11, fontWeight: 700,
                  color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
            padding: "4px 0 12px", borderBottom: "1px solid #1e2733", marginBottom: 12 }}>
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, background: "#161c24",
                border: "1px solid #2a3441", color: "#9fb0c2", cursor: "pointer",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ☰
            </button>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setNavPage(item.id)}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                  borderRadius: 8, border: "1px solid #2a3441", cursor: "pointer", fontSize: 12,
                  background: navPage === item.id ? "#1e2d3d" : "transparent",
                  color: navPage === item.id ? "#e7ecf2" : "#6b7fa3" }}>
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => setNavPage("pricing")}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                borderRadius: 8, border: "1px solid #2563eb44", cursor: "pointer", fontSize: 12,
                background: navPage === "pricing" ? "#2563eb22" : "transparent",
                color: navPage === "pricing" ? "#60a5fa" : "#6b7fa3" }}>
              💎 Pricing
            </button>
          </div>
        )}

        {/* Mobile sidebar drawer */}
        {isMobile && sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200 }} />
            <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 224, zIndex: 201,
              background: "#0d1117", borderRight: "1px solid #1e2733",
              display: "flex", flexDirection: "column", padding: "0 0 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 16px", borderBottom: "1px solid #1e2733" }}>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#f5f8fc" }}>Resumely</div>
                  <div style={{ fontSize: 10.5, color: "#5a6880", marginTop: 1 }}>Career toolkit</div>
                </div>
                <button onClick={() => setSidebarOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: 7, background: "#161c24",
                    border: "1px solid #1e2733", color: "#6b7fa3", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
              </div>
              <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map((item) => (
                  <button key={item.id} onClick={() => { setNavPage(item.id); setSidebarOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                      fontSize: 14, fontWeight: navPage === item.id ? 700 : 500,
                      background: navPage === item.id ? "#1e2d3d" : "transparent",
                      color: navPage === item.id ? "#e7ecf2" : "#6b7fa3" }}>
                    <span style={{ fontSize: 17 }}>{item.icon}</span>{item.label}
                  </button>
                ))}
              </nav>
              <div style={{ padding: "12px 8px", borderTop: "1px solid #1e2733" }}>
                <button onClick={() => { setNavPage("pricing"); setSidebarOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                    fontSize: 14, fontWeight: navPage === "pricing" ? 700 : 500,
                    background: navPage === "pricing" ? "#2563eb22" : "transparent",
                    color: navPage === "pricing" ? "#60a5fa" : "#6b7fa3" }}>
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
        background: "#161c24", border: "1px solid #2a3441", borderRadius: 9,
        color: "#e7ecf2", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", transition: "border-color .15s",
      }}>
        <span style={{ fontSize: 17 }}>{selected.flag}</span>
        <span>{selected.name}</span>
        <span style={{ fontSize: 10, color: "#6b7fa3", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          width: 280, background: "#161c24", border: "1px solid #2a3441",
          borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Search box */}
          <div style={{ padding: "10px 10px 6px", borderBottom: "1px solid #1e2733" }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px", background: "#0f1419",
                border: "1px solid #2a3441", borderRadius: 8,
                color: "#e7ecf2", fontSize: 13, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Language list */}
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "20px 14px", color: "#5a6880", fontSize: 13, textAlign: "center" }}>
                No language found
              </div>
            )}
            {filtered.map(l => (
              <button key={l.code} onClick={() => { onSelect(l); setOpen(false); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 14px", border: "none", background: l.code === selected.code ? "#1e2d3d" : "transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  borderLeft: l.code === selected.code ? "2px solid #2563eb" : "2px solid transparent",
                  transition: "background .1s",
                }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{l.flag}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#e7ecf2", display: "block" }}>{l.name}</span>
                  <span style={{ fontSize: 11.5, color: "#5a6880" }}>{l.native}</span>
                </span>
                {UI_LANGS.has(l.code) && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb",
                    background: "#2563eb18", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
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

function ThumbPreview({ tp }) {
  const bar = (w, c = "#cbd5e1") => ({ height: 4, borderRadius: 2, background: c, width: w });
  if (tp.id === "modern" || tp.id === "elegant") {
    return (
      <div style={{ height: 120, background: "#fff", display: "flex", padding: 10, gap: 8 }}>
        <div style={{ width: "32%", background: tp.id === "elegant" ? "#f3f0fb" : tp.accent, borderRadius: 4, padding: 8 }}>
          <div style={{ ...bar("70%", tp.id === "elegant" ? "#c4b5fd" : "rgba(255,255,255,0.8)"), marginBottom: 6 }} />
          <div style={{ ...bar("90%", tp.id === "elegant" ? "#ddd6fe" : "rgba(255,255,255,0.5)"), marginBottom: 4 }} />
          <div style={bar("60%", tp.id === "elegant" ? "#ddd6fe" : "rgba(255,255,255,0.5)")} />
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ ...bar("55%", tp.accent), height: 6, marginBottom: 8 }} />
          <div style={{ ...bar("100%"), marginBottom: 4 }} />
          <div style={{ ...bar("85%"), marginBottom: 4 }} />
          <div style={{ ...bar("92%") }} />
        </div>
      </div>
    );
  }
  if (tp.id === "bold") {
    return (
      <div style={{ height: 120, background: "#fff" }}>
        <div style={{ background: tp.accent, padding: "10px 12px" }}>
          <div style={{ ...bar("50%", "rgba(255,255,255,0.95)"), height: 7, marginBottom: 5 }} />
          <div style={bar("30%", "rgba(255,255,255,0.6)")} />
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ ...bar("100%"), marginBottom: 5 }} />
          <div style={{ ...bar("88%"), marginBottom: 5 }} />
          <div style={bar("94%")} />
        </div>
      </div>
    );
  }
  if (tp.id === "executive") {
    return (
      <div style={{ height: 120, background: "#fff", padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ ...bar("80px", "#1a1a1a"), height: 6, marginBottom: 4 }} />
            <div style={{ ...bar("55px", tp.accent), height: 3 }} />
          </div>
          <div>
            <div style={{ ...bar("45px"), marginBottom: 3 }} />
            <div style={{ ...bar("38px"), marginBottom: 3 }} />
            <div style={bar("42px")} />
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(to right, ${tp.accent}, ${tp.accent}33)`, marginBottom: 8 }} />
        <div style={{ ...bar("100%"), marginBottom: 4 }} />
        <div style={{ ...bar("88%"), marginBottom: 4 }} />
        <div style={bar("94%")} />
      </div>
    );
  }
  if (tp.id === "creative") {
    return (
      <div style={{ height: 120, background: "#fff", display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "12px 10px" }}>
          <div style={{ ...bar("100%"), marginBottom: 4 }} />
          <div style={{ ...bar("88%"), marginBottom: 4 }} />
          <div style={{ ...bar("95%"), marginBottom: 4 }} />
          <div style={bar("80%")} />
        </div>
        <div style={{ width: "36%", background: tp.accent, padding: "12px 10px" }}>
          <div style={{ ...bar("80%", "rgba(255,255,255,0.9)"), height: 5, marginBottom: 5 }} />
          <div style={{ ...bar("60%", "rgba(255,255,255,0.6)"), marginBottom: 4 }} />
          <div style={{ ...bar("70%", "rgba(255,255,255,0.45)"), marginBottom: 4 }} />
          <div style={bar("50%", "rgba(255,255,255,0.45)")} />
        </div>
      </div>
    );
  }
  if (tp.id === "tech") {
    return (
      <div style={{ height: 120, background: "#0d1117", padding: 12 }}>
        <div style={{ ...bar("65%", tp.accent), height: 5, marginBottom: 4 }} />
        <div style={{ ...bar("42%", "#8b949e"), height: 3, marginBottom: 10 }} />
        <div style={{ ...bar("100%", "#30363d"), marginBottom: 4 }} />
        <div style={{ ...bar("88%", "#30363d"), marginBottom: 4 }} />
        <div style={{ ...bar("94%", "#30363d"), marginBottom: 4 }} />
        <div style={bar("75%", "#30363d")} />
      </div>
    );
  }
  return (
    <div style={{ height: 120, background: "#fff", padding: 14, textAlign: "center" }}>
      <div style={{ ...bar("50%", tp.accent), height: 7, margin: "0 auto 6px" }} />
      <div style={{ ...bar("34%"), margin: "0 auto 12px" }} />
      <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 10px" }} />
      <div style={{ ...bar("100%"), marginBottom: 5 }} />
      <div style={{ ...bar("90%"), marginBottom: 5 }} />
      <div style={bar("96%")} />
    </div>
  );
}

function ResumePaper({ tpl, result, rtl, placeholder = true }) {
  const hasContent = result && (result.name !== "—" || result.summary || (result.sections && result.sections.length));
  const empty = placeholder && !hasContent;
  const data = result || { name: "—", title: "", contact: [], summary: "", sections: [] };
  const paper = { background: "#fff", color: "#1a1a1a", borderRadius: 8, minHeight: 420,
    fontFamily: tpl.font, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    width: "100%", boxSizing: "border-box" };

  if (empty) {
    return <div style={{ ...paper, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: 30, textAlign: "center" }}>
      Your resume will appear here in the <strong style={{ color: tpl.accent, margin: "0 4px" }}>{tpl.name}</strong> style.
    </div>;
  }

  const Section = ({ s }) => (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1px",
        color: tpl.accent, margin: "0 0 7px", fontWeight: 700,
        borderBottom: tpl.id === "minimal" ? "none" : `1px solid ${tpl.accent}33`, paddingBottom: 3 }}>
        {s.heading}
      </h3>
      {s.items.map((it, i) => (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4, color: "#333" }}>
          {tpl.id === "minimal" ? it : `• ${it}`}
        </div>
      ))}
    </div>
  );

  if (tpl.id === "modern" || tpl.id === "elegant") {
    const sideBg = tpl.id === "elegant" ? "#f5f2fc" : tpl.accent;
    const sideTextMain = tpl.id === "elegant" ? "#4c1d95" : "#fff";
    const sideTextSub = tpl.id === "elegant" ? "#6d28d9" : "rgba(255,255,255,0.85)";
    const skills = data.sections.find((s) => /skill|compét|habilidad|مهارات|fähig/i.test(s.heading));
    const rest = data.sections.filter((s) => s !== skills);
    return (
      <div style={paper}>
        <div style={{ display: "flex" }}>
          <div style={{ width: "34%", background: sideBg, color: sideTextMain, padding: "22px 16px" }}>
            <div style={{ fontWeight: 800, fontSize: 19, lineHeight: 1.15 }}>{data.name}</div>
            <div style={{ color: sideTextSub, fontSize: 13, marginTop: 4, marginBottom: 16 }}>{data.title}</div>
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 11.5, color: sideTextSub, marginBottom: 5, wordBreak: "break-word" }}>{c}</div>
            ))}
            {skills && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 700 }}>{skills.heading}</div>
                {skills.items.map((it, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: sideTextSub, marginBottom: 4 }}>{it}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: "22px 20px" }}>
            {data.summary && <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 0, marginBottom: 16, color: "#444" }}>{data.summary}</p>}
            {rest.map((s, i) => <Section key={i} s={s} />)}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "bold") {
    return (
      <div style={paper}>
        <div style={{ background: tpl.accent, color: "#fff", padding: "22px 24px" }}>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{data.name}</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 3 }}>{data.title}</div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 8 }}>{data.contact.join("   •   ")}</div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {data.summary && <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 0, marginBottom: 16, color: "#444" }}>{data.summary}</p>}
          {data.sections.map((s, i) => <Section key={i} s={s} />)}
        </div>
      </div>
    );
  }

  if (tpl.id === "executive") {
    return (
      <div style={paper}>
        <div style={{ padding: "26px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 24, color: "#1a1a1a" }}>{data.name}</div>
              <div style={{ fontSize: 13.5, color: tpl.accent, marginTop: 3, fontStyle: "italic" }}>{data.title}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {data.contact.map((c, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#555", marginBottom: 3 }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(to right, ${tpl.accent}, ${tpl.accent}22)`, marginBottom: 18 }} />
          {data.summary && <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18, color: "#444", fontStyle: "italic" }}>{data.summary}</p>}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: "1.5px", color: tpl.accent,
                margin: "0 0 7px", fontWeight: 700, borderLeft: `3px solid ${tpl.accent}`, paddingLeft: 8 }}>
                {s.heading}
              </h3>
              {s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4, color: "#333" }}>• {it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tpl.id === "creative") {
    return (
      <div style={paper}>
        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <div style={{ width: "34%", background: tpl.accent, color: "#fff", padding: "22px 16px" }}>
            <div style={{ fontWeight: 800, fontSize: 19, lineHeight: 1.2 }}>{data.name}</div>
            <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 4, marginBottom: 16 }}>{data.title}</div>
            {data.contact.map((c, i) => (
              <div key={i} style={{ fontSize: 11.5, opacity: 0.8, marginBottom: 5, wordBreak: "break-word" }}>{c}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "22px 20px" }}>
            {data.summary && <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 0, marginBottom: 16, color: "#444" }}>{data.summary}</p>}
            {data.sections.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", color: tpl.accent,
                  margin: "0 0 7px", fontWeight: 700, borderBottom: `2px solid ${tpl.accent}`, paddingBottom: 3 }}>
                  {s.heading}
                </h3>
                {s.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4, color: "#333" }}>• {it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tpl.id === "tech") {
    return (
      <div style={{ ...paper, background: "#0d1117", color: "#e6edf3", fontFamily: tpl.font }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: tpl.accent }}>{data.name}</div>
            <div style={{ fontSize: 13, color: "#8b949e", marginTop: 3 }}>$ {data.title}</div>
            <div style={{ fontSize: 11.5, color: "#8b949e", marginTop: 6 }}>{data.contact.join("  |  ")}</div>
          </div>
          {data.summary && (
            <p style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 16, color: "#c9d1d9",
              borderLeft: `2px solid ${tpl.accent}`, paddingLeft: 10, margin: "0 0 16px" }}>
              {data.summary}
            </p>
          )}
          {data.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, color: tpl.accent, margin: "0 0 7px", fontWeight: 700 }}>
                // {s.heading.toUpperCase()}
              </h3>
              {s.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 4, color: "#c9d1d9" }}>
                  &gt; {it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={paper}>
      <div style={{ padding: "26px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 24, color: "#1a1a1a", letterSpacing: tpl.id === "classic" ? "0.5px" : "0" }}>{data.name}</div>
          <div style={{ fontSize: 14, color: tpl.accent, marginTop: 3 }}>{data.title}</div>
          <div style={{ fontSize: 11.5, color: "#666", marginTop: 7 }}>{data.contact.join("   •   ")}</div>
          {tpl.id === "classic" && <div style={{ height: 2, background: tpl.accent, width: 60, margin: "12px auto 0" }} />}
        </div>
        {data.summary && <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18, color: "#444", textAlign: "center" }}>{data.summary}</p>}
        {data.sections.map((s, i) => <Section key={i} s={s} />)}
      </div>
    </div>
  );
}

function PageFooter({ t }) {
  const year = new Date().getFullYear();
  const dot = <span style={footerDot}>·</span>;
  return (
    <footer style={footerWrap}>
      <span>{t.madeBy} <strong style={{ color: "#e7ecf2" }}>{AUTHOR.name}</strong></span>
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

const page = { minHeight: "100vh", background: "#0f1419", padding: "16px 8px",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#e7ecf2" };
const shell = { margin: "0 auto", background: "#161c24", borderRadius: 14, padding: "28px 32px", border: "1px solid #232c38" };
const h1 = { fontSize: 30, fontWeight: 800, margin: "0 0 6px", color: "#f5f8fc", letterSpacing: "-0.5px",
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" };
const subtitle = { color: "#8a98a8", fontSize: 15, margin: "0 0 22px", lineHeight: 1.6,
  fontFamily: "'Inter', sans-serif", fontWeight: 400 };
const tplGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 };
const tplCard = { background: "#0f1419", border: "1px solid #2a3441", borderRadius: 12, overflow: "hidden",
  cursor: "pointer", padding: 0, textAlign: "left" };
const splitGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 };
const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#9fb0c2",
  margin: "16px 0 7px", textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", background: "#0f1419",
  border: "1px solid #2a3441", borderRadius: 10, color: "#e7ecf2", fontSize: 15, outline: "none" };
const chip = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "#0f1419",
  border: "1px solid #2a3441", borderRadius: 999, color: "#9fb0c2", fontSize: 13.5, cursor: "pointer", fontWeight: 500 };
const chipActive = { background: "#2563eb", borderColor: "#2563eb", color: "#fff" };
const cta = { marginTop: 26, width: "100%", padding: "15px", color: "#fff", border: "none",
  borderRadius: 11, fontSize: 16, fontWeight: 700, cursor: "pointer" };
const backBtn = { padding: "7px 14px", background: "#0f1419", border: "1px solid #2a3441", borderRadius: 8,
  color: "#cdd8e4", fontSize: 13.5, cursor: "pointer" };
const copyBtn = { position: "absolute", top: 12, insetInlineEnd: 12, zIndex: 2, padding: "6px 12px",
  background: "#232c38", border: "1px solid #2a3441", borderRadius: 7, color: "#cdd8e4", fontSize: 12.5, cursor: "pointer" };
const badge = { fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.3px" };
const badgeLive = { border: "1px solid #2a3441" };
const badgePolished = { border: "1px solid transparent" };
const dlBtn = { padding: "4px 12px", background: "transparent", border: "1px solid", borderRadius: 7,
  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity .15s", opacity: 0.85 };
const fieldErr  = { color: "#f87171", fontSize: 11.5, margin: "4px 0 0", lineHeight: 1.4 };
const codeSelect = { boxSizing: "border-box", padding: "10px 8px", background: "#0f1419",
  border: "1px solid #2a3441", borderRadius: 9, color: "#e7ecf2", fontSize: 14, outline: "none",
  cursor: "pointer", minWidth: 82, flexShrink: 0 };
const footerWrap = { marginTop: 36, paddingTop: 20, borderTop: "1px solid #232c38",
  display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
  gap: "6px 4px", fontSize: 13, color: "#5a6880" };
const footerDot = { color: "#2a3441", margin: "0 2px" };
const footerLink = { color: "#6b7fa3", textDecoration: "none" };
