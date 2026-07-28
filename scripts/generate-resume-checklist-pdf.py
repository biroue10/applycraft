import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = Path(os.environ.get("APPLYCRAFT_GENERATED_OUTPUT_ROOT", ROOT))
OUTPUT = OUTPUT_ROOT / "public" / "downloads" / "ats-multilingual-resume-checklist.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

PURPLE = colors.HexColor("#7C3AED")
BLUE = colors.HexColor("#2563EB")
INK = colors.HexColor("#101827")
MUTED = colors.HexColor("#475569")
LINE = colors.HexColor("#CBD5E1")
PALE = colors.HexColor("#F5F3FF")


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFont("Arial", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm, "ApplyCraft.io - Free ATS & multilingual resume checklist")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=19 * mm,
    title="ATS & Multilingual Resume Checklist",
    author="Isaac Biroue - ApplyCraft.io",
    subject="A practical English and French resume checklist",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="checklist", frames=[frame], onPage=footer)])

styles = getSampleStyleSheet()
title = ParagraphStyle("title", fontName="Arial-Bold", fontSize=23, leading=27, textColor=INK, spaceAfter=7)
subtitle = ParagraphStyle("subtitle", fontName="Arial", fontSize=10.5, leading=15, textColor=MUTED, spaceAfter=12)
section = ParagraphStyle("section", fontName="Arial-Bold", fontSize=13, leading=16, textColor=BLUE, spaceBefore=8, spaceAfter=5)
item = ParagraphStyle("item", fontName="Arial", fontSize=9.2, leading=12.5, textColor=INK, leftIndent=0)
note = ParagraphStyle("note", fontName="Arial", fontSize=8.4, leading=12, textColor=MUTED)
small_bold = ParagraphStyle("smallbold", fontName="Arial-Bold", fontSize=9, leading=12, textColor=INK)


def checkbox_rows(items):
    rows = []
    for text in items:
        rows.append(["☐", Paragraph(text, item)])
    table = Table(rows, colWidths=[8 * mm, 164 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Arial"),
                ("FONTSIZE", (0, 0), (0, -1), 12),
                ("TEXTCOLOR", (0, 0), (0, -1), PURPLE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )
    return table


def header(label, heading, intro):
    return [
        Table(
            [[Paragraph(label, small_bold)]],
            colWidths=[52 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), PALE),
                    ("BOX", (0, 0), (-1, -1), 0.7, PURPLE),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            ),
        ),
        Spacer(1, 5 * mm),
        Paragraph(heading, title),
        Paragraph(intro, subtitle),
    ]


def add_section(story, heading, items):
    story.append(Paragraph(heading, section))
    story.append(checkbox_rows(items))


story = []
story += header(
    "ENGLISH CHECKLIST",
    "ATS & Multilingual Resume Checklist",
    "Use this page before every application. It improves consistency and reduces avoidable parsing errors, but no checklist can guarantee an interview or an ATS result.",
)
add_section(
    story,
    "1. Target and evidence",
    [
        "The target role is clear in the headline or summary.",
        "Every important claim is supported by a real example, result or measurable scope.",
        "Keywords taken from the vacancy are truthful and used in natural context.",
        "Job titles, employers, dates, qualifications and metrics are internally consistent.",
    ],
)
add_section(
    story,
    "2. Structure and ATS readability",
    [
        "Contact details appear as selectable text, not only inside an image.",
        "Standard headings identify experience, education and skills.",
        "Dates follow one consistent format and roles are ordered logically.",
        "Tables, icons and columns do not hide essential information from the reading order.",
        "The exported PDF text can be selected and copied in the expected sequence.",
    ],
)
add_section(
    story,
    "3. Language and market",
    [
        "The resume uses the language requested in the vacancy.",
        "Separate language files preserve the same facts, dates and numbers.",
        "Official company, product, certification and software names remain accurate.",
        "Photo, personal-data, length and spelling conventions fit the target market.",
        "Arabic versions use real Unicode text, a suitable font and correct RTL direction.",
    ],
)
add_section(
    story,
    "4. Final file check",
    [
        "Links open correctly and the email address and phone number are current.",
        "The file name includes the candidate name, target role or language.",
        "The PDF opens on another device and no text is clipped, overlapped or missing.",
        "A human has reviewed spelling, tone and the relevance of the first half-page.",
    ],
)
story.append(Spacer(1, 4 * mm))
story.append(Paragraph("<b>Final decision:</b> ☐ Ready to submit &nbsp;&nbsp; ☐ Needs revision", note))
story.append(PageBreak())

story += header(
    "CHECKLIST FRANÇAISE",
    "Checklist CV ATS et multilingue",
    "Utilisez cette page avant chaque candidature. Elle améliore la cohérence et réduit les erreurs d'analyse évitables, mais aucune checklist ne peut garantir un entretien ou un résultat ATS.",
)
add_section(
    story,
    "1. Cible et preuves",
    [
        "Le métier visé est clair dans le titre ou l'accroche.",
        "Chaque affirmation importante repose sur un exemple, un résultat ou une portée mesurable.",
        "Les mots-clés repris de l'offre sont exacts et intégrés naturellement.",
        "Les postes, employeurs, dates, diplômes et chiffres sont cohérents.",
    ],
)
add_section(
    story,
    "2. Structure et lecture ATS",
    [
        "Les coordonnées sont du texte sélectionnable et ne figurent pas uniquement dans une image.",
        "Des titres standards identifient l'expérience, la formation et les compétences.",
        "Les dates suivent un format cohérent et les postes sont ordonnés logiquement.",
        "Les tableaux, icônes et colonnes ne masquent aucune information essentielle.",
        "Le texte du PDF exporté se copie dans l'ordre de lecture attendu.",
    ],
)
add_section(
    story,
    "3. Langue et marché",
    [
        "Le CV utilise la langue demandée dans l'offre.",
        "Les différentes versions conservent les mêmes faits, dates et chiffres.",
        "Les noms officiels des entreprises, produits, certifications et logiciels restent exacts.",
        "La photo, les données personnelles, la longueur et l'orthographe conviennent au marché.",
        "La version arabe utilise du texte Unicode, une police adaptée et une vraie direction RTL.",
    ],
)
add_section(
    story,
    "4. Contrôle du fichier",
    [
        "Les liens fonctionnent et l'adresse e-mail ainsi que le téléphone sont à jour.",
        "Le nom du fichier indique le candidat, le métier ou la langue.",
        "Le PDF s'ouvre sur un autre appareil sans texte coupé, superposé ou manquant.",
        "Une personne a relu l'orthographe, le ton et la pertinence de la première demi-page.",
    ],
)
story.append(Spacer(1, 4 * mm))
story.append(Paragraph("<b>Décision finale :</b> ☐ Prêt à envoyer &nbsp;&nbsp; ☐ À corriger", note))

doc.build(story)
print(f"Generated {OUTPUT}")
