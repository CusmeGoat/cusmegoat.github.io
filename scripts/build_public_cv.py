"""Genera la versión pública del CV para el portafolio.

Requiere reportlab: python -m pip install reportlab
"""

from __future__ import annotations

from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "cv-jose-carlos-cusme-montenegro.pdf"
INK = colors.HexColor("#172B32")
MUTED = colors.HexColor("#536970")
ACCENT = colors.HexColor("#087D67")
LINE = colors.HexColor("#DCE7E5")


def register_fonts() -> tuple[str, str]:
    candidates = [
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")),
        (
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("PortfolioSans", str(regular)))
            pdfmetrics.registerFont(TTFont("PortfolioSans-Bold", str(bold)))
            pdfmetrics.registerFontFamily(
                "PortfolioSans",
                normal="PortfolioSans",
                bold="PortfolioSans-Bold",
            )
            return "PortfolioSans", "PortfolioSans-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()
STYLES = {
    "name": ParagraphStyle(
        "name", fontName=FONT_BOLD, fontSize=21, leading=25, textColor=INK, spaceAfter=5
    ),
    "role": ParagraphStyle(
        "role", fontName=FONT, fontSize=10.5, leading=15, textColor=ACCENT, spaceAfter=7
    ),
    "contact": ParagraphStyle(
        "contact", fontName=FONT, fontSize=8.7, leading=13.5, textColor=MUTED
    ),
    "section": ParagraphStyle(
        "section",
        fontName=FONT_BOLD,
        fontSize=9,
        leading=13,
        textColor=ACCENT,
        spaceBefore=12,
        spaceAfter=6,
    ),
    "job": ParagraphStyle(
        "job", fontName=FONT_BOLD, fontSize=10.5, leading=15, textColor=INK, spaceAfter=2
    ),
    "meta": ParagraphStyle(
        "meta", fontName=FONT, fontSize=8.7, leading=13, textColor=MUTED, spaceAfter=5
    ),
    "body": ParagraphStyle(
        "body", fontName=FONT, fontSize=9, leading=14.2, textColor=INK, spaceAfter=6
    ),
    "bullet": ParagraphStyle(
        "bullet",
        fontName=FONT,
        fontSize=8.8,
        leading=13.2,
        textColor=INK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2,
    ),
    "small": ParagraphStyle(
        "small", fontName=FONT, fontSize=8.5, leading=13, textColor=INK, spaceAfter=4
    ),
}


def paragraph(text: str, style: str = "body") -> Paragraph:
    return Paragraph(escape(text), STYLES[style])


story = [
    paragraph("JOSÉ CARLOS CUSME MONTENEGRO", "name"),
    paragraph("Ingeniero en Sistemas de Información  |  Full Stack y DevOps", "role"),
    paragraph("Guayaquil, Ecuador  ·  cusmegoat2003@hotmail.com", "contact"),
    Paragraph(
        '<link href="https://github.com/CusmeGoat" color="#536970">github.com/CusmeGoat</link>'
        '  ·  '
        '<link href="https://www.linkedin.com/in/jose-carlos-cusme-montenegro-a87b432b0/" color="#536970">'
        'linkedin.com/in/jose-carlos-cusme-montenegro-a87b432b0</link>',
        STYLES["contact"],
    ),
    Spacer(1, 12),
    HRFlowable(width="100%", thickness=1, color=LINE),
    paragraph("PERFIL PROFESIONAL", "section"),
    paragraph(
        "Ingeniero en Sistemas de Información con experiencia en desarrollo full stack y prácticas DevOps. "
        "Desarrollo y mantengo soluciones empresariales con Java, Spring Boot, Angular, APIs REST, Oracle SQL/PLSQL y MongoDB. "
        "También participo en pipelines CI/CD, contenedores, despliegues en OpenShift y soporte a pruebas en distintos ambientes."
    ),
    paragraph("EXPERIENCIA PROFESIONAL", "section"),
]


def add_job(title: str, organization: str, period: str, bullets: list[str]) -> None:
    content = [
        paragraph(title, "job"),
        paragraph(f"{organization}  |  {period}", "meta"),
    ]
    content.extend(paragraph(f"• {item}", "bullet") for item in bullets)
    content.append(Spacer(1, 4))
    story.append(KeepTogether(content))


add_job(
    "Desarrollador full stack / Ingeniero de proyectos",
    "HITSS Ecuador",
    "Enero de 2026 - actualidad",
    [
        "Desarrollo de flujos de registro, consulta, edición y validación con Angular, Java y Spring Boot.",
        "Integración de APIs REST y trabajo con Oracle SQL/PLSQL y MongoDB para procesos empresariales.",
        "Configuración de pipelines CI/CD con Jenkins y GitLab, Dockerfiles y manifiestos Kubernetes/OpenShift 4.",
        "Apoyo a pruebas, análisis de logs, preparación de scripts SQL y despliegues en distintos ambientes.",
    ],
)
add_job(
    "Pasante desarrollador",
    "HITSS Ecuador",
    "Julio de 2025 - diciembre de 2025",
    [
        "Apoyo en desarrollo, pruebas y documentación técnica de soluciones empresariales.",
        "Trabajo con frontend, backend, PL/SQL, servicios REST, Postman, Jenkins, SonarQube y OpenShift 4.",
    ],
)
add_job(
    "Asistente en desarrollo y soporte técnico",
    "ARCSA",
    "Enero de 2025 - marzo de 2025 | Prácticas preprofesionales",
    [
        "Atención de incidencias, instalación de software y mantenimiento de equipos.",
        "Apoyo en configuración de herramientas de correo, respaldo de información y actividades de desarrollo.",
    ],
)

story.extend(
    [
        paragraph("FORMACIÓN ACADÉMICA", "section"),
        paragraph("Ingeniería en Sistemas de Información", "job"),
        paragraph("Universidad de Guayaquil · Facultad de Ingeniería Industrial · Título obtenido", "meta"),
        paragraph("CONOCIMIENTOS TÉCNICOS", "section"),
        paragraph("Desarrollo: Java, Spring Boot, Angular, TypeScript, JavaScript, APIs REST, Node.js/Express, React Native y Python/FastAPI.", "small"),
        paragraph("Datos: Oracle SQL/PLSQL, MongoDB, PostgreSQL y pgvector.", "small"),
        paragraph("DevOps: Jenkins, GitLab CI/CD, Docker, Kubernetes/OpenShift 4, manifiestos de despliegue y gestión de recursos.", "small"),
        paragraph("Otros lenguajes y herramientas: C#, Dart, Git, GitHub, Postman, SonarQube y Playwright.", "small"),
        paragraph("FORMACIÓN COMPLEMENTARIA", "section"),
        paragraph("Cursos de OpenShift y Docker, Jenkins y pipelines CI/CD, Oracle PL/SQL y fundamentos de AWS.", "small"),
        paragraph("IDIOMAS", "section"),
        paragraph("Español nativo · Inglés B1", "small"),
    ]
)


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(42, 39, letter[0] - 42, 39)
    canvas.setFillColor(MUTED)
    canvas.setFont(FONT, 7.5)
    canvas.drawString(42, 27, "José Carlos Cusme Montenegro · CV público")
    canvas.drawRightString(letter[0] - 42, 27, f"{doc.page}")
    canvas.restoreState()


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=42,
        leftMargin=42,
        topMargin=32,
        bottomMargin=44,
        title="CV público - José Carlos Cusme Montenegro",
        author="José Carlos Cusme Montenegro",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
