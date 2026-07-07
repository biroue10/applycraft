const atsResults = {
  "crossLangIssue": " (multilingue : CV {resumeLang} contre offre {jobLang})",
  "scoreBands": {
    "strong": {
      "label": "Solide",
      "meaning": "Peu de problèmes détectés. Relisez et adaptez à chaque poste."
    },
    "needsWork": {
      "label": "À améliorer",
      "meaning": "Plusieurs problèmes corrigeables. Traitez les points signalés."
    },
    "actionRequired": {
      "label": "Action requise",
      "meaning": "Des éléments importants manquent ou sont faibles. Corrigez d'abord les points critiques."
    },
    "criticalIssues": {
      "label": "Problèmes critiques",
      "meaning": "Des sections clés semblent manquer. Corrigez les points critiques avant de postuler."
    }
  },
  "issueText": {
    "NO_EMAIL": {
      "title": "Aucune adresse e-mail détectée",
      "detail": "Les ATS extraient votre e-mail pour le profil candidat."
    },
    "NO_EXPERIENCE": {
      "title": "Aucune section expérience professionnelle détectée",
      "detail": "L'expérience compte beaucoup. Utilisez un intitulé clair."
    },
    "NO_SKILLS": {
      "title": "Aucune section compétences détectée",
      "detail": "Ajoutez une section Compétences ou Technologies."
    },
    "NO_PHONE": {
      "title": "Aucun numéro de téléphone détecté",
      "detail": "Le téléphone complète votre profil candidat."
    },
    "NO_LINKEDIN": {
      "title": "Aucun profil LinkedIn",
      "detail": "LinkedIn peut aider la complétude du profil et la vérification."
    },
    "NO_SUMMARY": {
      "title": "Aucun résumé professionnel détecté",
      "detail": "Un résumé de 2 à 4 phrases donne un contexte immédiat."
    },
    "NO_NUMBERS": {
      "title": "Aucune réalisation chiffrée",
      "detail": "Ajoutez des métriques : %, revenu, temps gagné ou taille d'équipe."
    },
    "NO_DATES": {
      "title": "Aucune date trouvée dans l'expérience",
      "detail": "Ajoutez les années de début et de fin à chaque poste."
    },
    "WEAK_BULLETS": {
      "title": "{count} point(s) avec une formulation passive",
      "detail": "Remplacez les formulations passives par Piloté, Développé ou Réduit."
    },
    "LONG_LINES": {
      "title": "{count} ligne(s) de plus de 180 caractères",
      "detail": "Divisez les lignes longues en puces ciblées de moins de 160 caractères."
    },
    "TOO_SHORT": {
      "title": "CV trop court ({words} mots)",
      "detail": "Ajoutez projets, technologies et résultats mesurables."
    },
    "NO_EDUCATION": {
      "title": "Section formation non détectée",
      "detail": "Ajoutez au moins une entrée de formation."
    },
    "TOO_LONG": {
      "title": "CV peut-être trop long ({words} mots)",
      "detail": "Concentrez-vous sur l'expérience récente et pertinente."
    },
    "KW_LOW": {
      "title": "Correspondance de mots-clés faible : {pct} % avec l'offre{cross}",
      "detail": "Seuls {pct} % des mots-clés significatifs apparaissent dans votre CV. Ajoutez les termes pertinents naturellement."
    },
    "KW_MED": {
      "title": "Correspondance de mots-clés : {pct} %{cross}",
      "detail": "Votre CV reprend {pct} % des mots-clés. Ajoutez les termes du poste lorsqu'ils s'appliquent."
    }
  }
};

export default atsResults;
