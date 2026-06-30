// ──────────────────────────────────────────────────────────────────────────
// Cross-language skill/role synonym map for the ATS keyword engine.
// EXTEND ME for the francophone / MENA market.
//
// All tokens are written in their normalized form (lowercase, NO accents),
// because the engine normalizes before lookup ("compétences" → "competences").
// Each group lists equivalent terms across EN / FR / ES / AR / DE — a JD term
// matches the resume if ANY member of its group appears in the resume.
//
// Multi-word phrases (e.g. "customer service") are handled via PHRASES below:
// they are collapsed to a single underscore token before tokenizing.
// ──────────────────────────────────────────────────────────────────────────

// Multi-word phrases → single canonical token (normalized keys, no accents).
export const PHRASES = {
  "customer service": "customerservice",
  "service client": "customerservice",
  "servicio al cliente": "customerservice",
  "atencion al cliente": "customerservice",
  "kundendienst": "customerservice",
  "kundenservice": "customerservice",
  "project management": "projectmanagement",
  "gestion de projet": "projectmanagement",
  "gestion de proyectos": "projectmanagement",
  "projektmanagement": "projectmanagement",
  "technical support": "techsupport",
  "support technique": "techsupport",
  "soporte tecnico": "techsupport",
  "problem solving": "problemsolving",
  "resolution de problemes": "problemsolving",
  "data analysis": "dataanalysis",
  "analyse de donnees": "dataanalysis",
  "analisis de datos": "dataanalysis",
  "team work": "teamwork",
  "travail d equipe": "teamwork",
  "trabajo en equipo": "teamwork",
};

// Equivalence groups. First member is the canonical id.
export const SYNONYM_GROUPS = [
  ["troubleshooting", "troubleshoot", "depannage", "resolution de pannes", "solucion de problemas", "fehlerbehebung"],
  ["skills", "competences", "habilidades", "fahigkeiten", "kompetenzen", "maharat"],
  ["experience", "experiences", "experiencia", "erfahrung", "khibra"],
  ["software", "logiciel", "logiciels", "programa", "programas", "softwares"],
  ["hardware", "materiel", "equipement", "equipamiento", "hardwares"],
  ["network", "networks", "reseau", "reseaux", "red", "redes", "netzwerk", "netzwerke"],
  ["management", "gestion", "manage", "managing", "managed", "manager", "gerencia", "verwaltung"],
  ["development", "developpement", "developmentt", "desarrollo", "entwicklung", "developer", "developpeur"],
  ["database", "databases", "base de donnees", "bases de donnees", "base de datos", "datenbank"],
  ["security", "securite", "seguridad", "sicherheit"],
  ["maintenance", "entretien", "mantenimiento", "wartung"],
  ["installation", "installer", "install", "instalacion", "installations"],
  ["communication", "comunicacion", "kommunikation"],
  ["customerservice", "client", "clients", "clientele", "cliente", "kunden"],
  ["projectmanagement", "projet", "projets", "proyecto", "proyectos", "projekt"],
  ["techsupport", "helpdesk", "assistance", "soporte", "support"],
  ["problemsolving", "resolution", "resoudre"],
  ["dataanalysis", "donnees", "datos", "daten", "analytics", "analytique"],
  ["teamwork", "collaboration", "collaborer", "colaboracion", "zusammenarbeit"],
  ["leadership", "direction", "encadrement", "liderazgo", "fuhrung"],
  ["training", "formation", "formations", "capacitacion", "schulung"],
  ["sales", "ventes", "vente", "ventas", "vertrieb"],
  ["marketing", "mercadeo", "vermarktung"],
  ["accounting", "comptabilite", "contabilidad", "buchhaltung"],
  ["administration", "administratif", "administracion", "verwaltungs"],
  ["server", "servers", "serveur", "serveurs", "servidor", "servidores"],
  ["system", "systems", "systeme", "systemes", "sistema", "sistemas"],
  ["configuration", "configurer", "configuracion", "konfiguration"],
  ["deployment", "deploiement", "despliegue", "bereitstellung"],
  ["migration", "migrer", "migracion"],
  ["automation", "automatisation", "automatizacion", "automatisierung"],
  ["monitoring", "supervision", "surveillance", "monitoreo", "uberwachung"],
  ["documentation", "documenter", "documentacion", "dokumentation"],
];

// Language-agnostic tokens (tools, tech, platforms, certs, acronyms) that match
// literally across languages. Add product names as you encounter them.
export const TECH_TOKENS = new Set([
  "linux", "windows", "macos", "unix", "ubuntu", "debian", "centos", "redhat",
  "python", "java", "javascript", "typescript", "react", "vue", "angular", "node",
  "sql", "mysql", "postgresql", "postgres", "mongodb", "oracle", "redis", "nosql",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible", "jenkins",
  "git", "github", "gitlab", "bitbucket", "jira", "confluence", "servicenow", "tailscale",
  "vmware", "hyperv", "citrix", "active", "directory", "ldap", "dns", "dhcp", "tcp", "ip",
  "vpn", "firewall", "cisco", "fortinet", "office", "excel", "powerpoint", "outlook", "sharepoint",
  "salesforce", "sap", "tableau", "powerbi", "figma", "photoshop", "illustrator", "autocad",
  "html", "css", "php", "ruby", "golang", "rust", "swift", "kotlin", "csharp", "dotnet",
  "api", "rest", "graphql", "ci", "cd", "cicd", "agile", "scrum", "kanban", "devops", "itil",
  "ccna", "ccnp", "comptia", "pmp", "aws", "az", "saas", "paas", "iaas", "saas", "erp", "crm",
]);

// JD boilerplate / section headers that are NOT skills — never show as "missing".
export const BOILERPLATE = new Set([
  // EN
  "about", "responsibilities", "requirements", "qualifications", "overview", "summary",
  "benefits", "perks", "apply", "application", "candidate", "candidates", "position", "job",
  "description", "company", "mission", "vision", "values", "department", "location", "salary",
  "fulltime", "parttime", "contract", "permanent", "remote", "hybrid", "onsite",
  // FR
  "propos", "offre", "emploi", "poste", "profil", "mission", "missions", "candidat", "candidate",
  "description", "entreprise", "responsabilites", "exigences", "qualifications", "avantages",
  "recherche", "recherchons", "rejoignez", "afin", "salaire", "lieu", "contrat", "stage",
  // ES
  "acerca", "oferta", "empleo", "puesto", "perfil", "mision", "candidato", "responsabilidades",
  "requisitos", "beneficios", "buscamos", "empresa", "ubicacion", "salario", "contrato",
  // DE
  "uber", "stelle", "aufgaben", "anforderungen", "qualifikationen", "vorteile", "bewerbung",
  "unternehmen", "standort", "gehalt", "vertrag", "vollzeit", "teilzeit",
  // AR
  "حول", "عرض", "وظيفة", "المرشح", "المسؤوليات", "المتطلبات", "المؤهلات", "الشركة", "الراتب",
]);
