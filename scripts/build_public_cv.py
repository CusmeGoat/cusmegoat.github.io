"""Genera tres diseños del mismo CV público para el portafolio.

Requiere reportlab y pypdf. Ningún PDF incluye teléfono, segundo correo,
nombres de sistemas internos ni enlaces a repositorios privados.
"""

from __future__ import annotations

from dataclasses import dataclass
from html import escape
from pathlib import Path
from shutil import copyfile
from tempfile import TemporaryDirectory

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PHOTO = PUBLIC / "jose-carlos-cusme.png"
PAGE_W, PAGE_H = A4


CV = {
    "name": "José Carlos Cusme Montenegro",
    "role": "Ingeniero en Sistemas de Información | Full Stack y DevOps",
    "location": "Guayaquil, Ecuador",
    "email": "cusmegoat2003@hotmail.com",
    "portfolio": "cusmegoat.github.io",
    "linkedin": "linkedin.com/in/jose-carlos-cusme-montenegro-a87b432b0",
    "github": "github.com/CusmeGoat",
    "summary": (
        "Ingeniero en Sistemas de Información con experiencia en desarrollo full stack y "
        "DevOps. Desarrollo soluciones empresariales con Java, Spring Boot, Angular, APIs REST, "
        "Oracle y MongoDB. También participo en automatización CI/CD, contenedores, "
        "OpenShift 4, pruebas y despliegues en distintos ambientes."
    ),
    "experience": [
        {
            "role": "Desarrollador full stack / Ingeniero de proyectos",
            "org": "HITSS Ecuador",
            "period": "Ene 2026 - actualidad",
            "bullets": [
                "Implementé cargas masivas de clientes desde Excel a Oracle, con consultas paginadas, búsqueda, exportación y bitácora.",
                "Contribuí a un motor de decisión crediticia: validaciones, reglas y mensajes de diagnóstico para analistas con Java, MongoDB y Angular.",
                "Desarrollé flujos de registro, consulta, edición y aprobación en portales de gestión; integré Angular, APIs REST y Oracle.",
                "Configuré pipelines Jenkins/GitLab, Dockerfiles y manifiestos OpenShift 4; apoyé pruebas, análisis de logs y despliegues.",
            ],
        },
        {
            "role": "Pasante desarrollador",
            "org": "HITSS Ecuador",
            "period": "Jul 2025 - dic 2025",
            "bullets": [
                "Apoyé desarrollo, pruebas y documentación técnica de soluciones empresariales.",
                "Trabajé con frontend, backend, PL/SQL y servicios REST; usé Postman, Jenkins, SonarQube y OpenShift 4.",
            ],
        },
        {
            "role": "Asistente en desarrollo y soporte técnico",
            "org": "ARCSA | Prácticas preprofesionales",
            "period": "Ene 2025 - mar 2025",
            "bullets": [
                "Atendí incidencias, instalé software y apoyé el mantenimiento de equipos.",
                "Configuré herramientas de correo, realicé respaldos y apoyé actividades de desarrollo.",
            ],
        },
    ],
    "projects": [
        {
            "name": "AgroCommunity",
            "meta": "Proyecto de tesis | 2026",
            "bullets": [
                "Desarrollé una aplicación móvil para una asociación agrícola de Daule: comunicación, acceso remoto a documentos y consulta de información.",
                "Integré React Native/TypeScript, API Node.js/Express, PostgreSQL/pgvector y un servicio Python/FastAPI que indexa PDF y recupera fragmentos con sus fuentes.",
            ],
        },
        {
            "name": "Automatización de solicitudes operativas",
            "meta": "Proyecto de automatización | 2026",
            "bullets": [
                "Desarrollé una herramienta con Python, Playwright y MCP para automatizar solicitudes, validar datos y evitar duplicados.",
            ],
        },
    ],
    "skills": [
        ("Backend", "Java, Spring Boot, Node.js/Express, Python/FastAPI, .NET y APIs REST"),
        ("Frontend y móvil", "Angular, TypeScript, JavaScript, React Native, Flutter, HTML5 y CSS3"),
        ("Datos", "Oracle SQL/PLSQL, MongoDB, PostgreSQL, pgvector, MySQL y Power BI"),
        ("DevOps", "Jenkins, GitLab CI/CD, Docker, Kubernetes, OpenShift 4 y SonarQube"),
        ("Herramientas", "Git, GitHub, Postman, Playwright, MCP y Linux"),
    ],
    "education": "Ingeniería en Sistemas de Información | Universidad de Guayaquil | Título obtenido",
    "training": [
        "AWS Cloud Practitioner Essentials | AWS Skill Builder | 2026",
        "Jenkins: Beginner to Pro, CI/CD Pipelines & Automation | Udemy | 2026",
        "OpenShift 4.20 and Docker: From Zero to Production | Udemy | 2026",
        "Oracle PL/SQL avanzado | Udemy | 2026",
        "MCP: Conecta LLMs y Agentes de IA con Apps Externas | Udemy | 2026",
        "Power BI intermedio | HITSS Ecuador | 2026",
    ],
    "languages": "Español nativo | Inglés B1",
}


def register_fonts() -> tuple[str, str]:
    candidates = [
        (Path("C:/Windows/Fonts/segoeui.ttf"), Path("C:/Windows/Fonts/segoeuib.ttf")),
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")),
        (
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("CVRegular", str(regular)))
            pdfmetrics.registerFont(TTFont("CVBold", str(bold)))
            pdfmetrics.registerFontFamily("CVRegular", normal="CVRegular", bold="CVBold")
            return "CVRegular", "CVBold"
    raise FileNotFoundError("Se necesita Segoe UI, Arial o DejaVu Sans para generar el CV.")


FONT, BOLD = register_fonts()


@dataclass(frozen=True)
class Palette:
    ink: colors.Color
    accent: colors.Color
    muted: colors.Color
    line: colors.Color


ATS = Palette(
    colors.HexColor("#182D43"), colors.HexColor("#165A9D"),
    colors.HexColor("#53677B"), colors.HexColor("#C9D5E2"),
)
MODERN = Palette(
    colors.HexColor("#102A46"), colors.HexColor("#087AB8"),
    colors.HexColor("#50647A"), colors.HexColor("#CBD8E5"),
)
EDITORIAL = Palette(
    colors.HexColor("#1E2F42"), colors.HexColor("#A46A32"),
    colors.HexColor("#5E6D7B"), colors.HexColor("#D7D3CC"),
)


class Flow:
    def __init__(
        self, sheet: canvas.Canvas, x: float, width: float, top: float,
        palette: Palette, body_size: float = 9.0, leading: float = 13.0,
        bottom: float = 52,
    ) -> None:
        self.sheet, self.x, self.width, self.y = sheet, x, width, top
        self.palette, self.body_size, self.leading = palette, body_size, leading
        self.bottom = bottom

    def _paragraph(self, markup: str, x: float, width: float, size: float,
                   leading: float, color: colors.Color, gap: float) -> None:
        style = ParagraphStyle(
            "line", fontName=FONT, fontSize=size, leading=leading,
            textColor=color, spaceBefore=0, spaceAfter=0,
        )
        item = Paragraph(markup, style)
        _, height = item.wrap(width, PAGE_H)
        if self.y - height - gap < self.bottom:
            raise ValueError(f"El contenido del CV excede la página: y={self.y:.1f}, alto={height:.1f}")
        item.drawOn(self.sheet, x, self.y - height)
        self.y -= height + gap

    def paragraph(self, text: str, gap: float = 7, size: float | None = None) -> None:
        self._paragraph(escape(text), self.x, self.width, size or self.body_size,
                        self.leading, self.palette.ink, gap)

    def heading(self, title: str) -> None:
        self.y -= 8
        if self.y - 22 < self.bottom:
            raise ValueError(f"La sección {title} excede la página")
        self.sheet.setFillColor(self.palette.accent)
        self.sheet.setFont(BOLD, 9.8)
        self.sheet.drawString(self.x, self.y, title.upper())
        self.sheet.setStrokeColor(self.palette.line)
        self.sheet.setLineWidth(.75)
        self.sheet.line(self.x, self.y - 6, self.x + self.width, self.y - 6)
        self.y -= 25

    def title(self, label: str, meta: str) -> None:
        self._paragraph(f"<b>{escape(label)}</b>", self.x, self.width, 11,
                        14.6, self.palette.ink, 1)
        self._paragraph(escape(meta), self.x, self.width, 8.6,
                        11.5, self.palette.muted, 6)

    def bullet(self, text: str) -> None:
        self.sheet.setFillColor(self.palette.accent)
        self.sheet.circle(self.x + 3, self.y - 6.5, 1.7, fill=1, stroke=0)
        self._paragraph(escape(text), self.x + 13, self.width - 13,
                        self.body_size, self.leading, self.palette.ink, 5)

    def item(self, label: str, value: str) -> None:
        self._paragraph(f"<b>{escape(label)}:</b> {escape(value)}", self.x,
                        self.width, self.body_size - .2, self.leading,
                        self.palette.ink, 5)

    def gap(self, points: float) -> None:
        self.y -= points


def page_one(flow: Flow) -> None:
    flow.heading("Perfil profesional")
    flow.paragraph(CV["summary"], gap=9)
    flow.heading("Experiencia profesional")
    for job in CV["experience"]:
        flow.title(job["role"], f"{job['org']} | {job['period']}")
        for point in job["bullets"]:
            flow.bullet(point)
        flow.gap(8)


def page_two(flow: Flow) -> None:
    flow.heading("Proyectos")
    for project in CV["projects"]:
        flow.title(project["name"], project["meta"])
        for point in project["bullets"]:
            flow.bullet(point)
        flow.gap(7)
    flow.heading("Conocimientos técnicos")
    for label, value in CV["skills"]:
        flow.item(label, value)
    flow.heading("Formación académica")
    flow.paragraph(CV["education"], gap=4)
    flow.heading("Formación complementaria - cursos")
    for item in CV["training"]:
        flow.bullet(item)
    flow.heading("Idiomas")
    flow.paragraph(CV["languages"], gap=0)


def setup_sheet(path: Path, title: str) -> canvas.Canvas:
    sheet = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    sheet.setTitle(title)
    sheet.setAuthor(CV["name"])
    sheet.setSubject("Currículum público - Full Stack y DevOps")
    return sheet


def footer(sheet: canvas.Canvas, x: float, width: float, page: int,
           palette: Palette, light: bool = False) -> None:
    sheet.setStrokeColor(palette.line)
    sheet.setLineWidth(.6)
    sheet.line(x, 39, x + width, 39)
    sheet.setFillColor(colors.HexColor("#D7EAF8") if light else palette.muted)
    sheet.setFont(FONT, 7.6)
    sheet.drawString(x, 26, "José Carlos Cusme Montenegro  |  cusmegoat.github.io")
    sheet.drawRightString(x + width, 26, f"{page:02d} / 02")


def contact_line(sheet: canvas.Canvas, x: float, y: float, width: float,
                 palette: Palette, size: float = 8.0) -> float:
    rows = [
        f"{escape(CV['location'])}  |  <link href='mailto:{CV['email']}'>{escape(CV['email'])}</link>",
        f"<link href='https://{CV['portfolio']}/'>{escape(CV['portfolio'])}</link>  |  "
        f"<link href='https://{CV['github']}'>{escape(CV['github'])}</link>",
        f"<link href='https://www.{CV['linkedin']}/'>{escape(CV['linkedin'])}</link>",
    ]
    for row in rows:
        style = ParagraphStyle("contact", fontName=FONT, fontSize=size,
                               leading=size + 3.5, textColor=palette.muted)
        item = Paragraph(row, style)
        _, height = item.wrap(width, PAGE_H)
        item.drawOn(sheet, x, y - height)
        y -= height + 2
    return y


def build_ats(path: Path) -> None:
    sheet = setup_sheet(path, "CV José Carlos Cusme - Sobrio ATS")
    x, width = 47, PAGE_W - 94
    sheet.setFillColor(ATS.accent)
    sheet.rect(x, PAGE_H - 43, 46, 3, fill=1, stroke=0)
    sheet.setFont(BOLD, 21.5)
    sheet.setFillColor(ATS.ink)
    sheet.drawString(x, PAGE_H - 79, CV["name"])
    sheet.setFont(FONT, 10.2)
    sheet.setFillColor(ATS.accent)
    sheet.drawString(x, PAGE_H - 98, CV["role"])
    top = contact_line(sheet, x, PAGE_H - 108, width, ATS)
    page_one(Flow(sheet, x, width, top - 7, ATS, body_size=9.6, leading=14.0))
    footer(sheet, x, width, 1, ATS)
    sheet.showPage()

    sheet.setFillColor(ATS.ink)
    sheet.setFont(BOLD, 12)
    sheet.drawString(x, PAGE_H - 48, CV["name"])
    sheet.setFillColor(ATS.accent)
    sheet.setFont(BOLD, 8)
    sheet.drawRightString(x + width, PAGE_H - 47, "FULL STACK  /  DEVOPS")
    page_two(Flow(sheet, x, width, PAGE_H - 64, ATS,
                  body_size=9.5, leading=13.8))
    footer(sheet, x, width, 2, ATS)
    sheet.save()


def modern_sidebar(sheet: canvas.Canvas, page: int) -> None:
    navy = colors.HexColor("#0A2542")
    cyan = colors.HexColor("#83D8FF")
    soft = colors.HexColor("#D5E6F5")
    sheet.setFillColor(navy)
    sheet.rect(0, 0, 178, PAGE_H, fill=1, stroke=0)
    sheet.setFillColor(colors.HexColor("#154B79"))
    sheet.rect(0, PAGE_H - 9, 178, 9, fill=1, stroke=0)
    if page == 1:
        image = ImageReader(str(PHOTO))
        sheet.drawImage(image, 35, PAGE_H - 220, width=108, height=162,
                        preserveAspectRatio=True, mask="auto")
        top = PAGE_H - 246
    else:
        sheet.setFont(BOLD, 24)
        sheet.setFillColor(cyan)
        sheet.drawString(34, PAGE_H - 92, "JC")
        top = PAGE_H - 138
    sheet.setFont(BOLD, 8.3)
    sheet.setFillColor(cyan)
    sheet.drawString(28, top, "CONTACTO")
    top -= 21
    sidebar_contacts = [
        (CV["location"], None),
        (CV["email"], f"mailto:{CV['email']}"),
        (CV["portfolio"], f"https://{CV['portfolio']}/"),
        ("LinkedIn / José Carlos Cusme", f"https://www.{CV['linkedin']}/"),
        ("GitHub / CusmeGoat", f"https://{CV['github']}"),
    ]
    for value, href in sidebar_contacts:
        style = ParagraphStyle("side", fontName=FONT, fontSize=7.8,
                               leading=11.2, textColor=soft)
        markup = f'<link href="{href}" color="#D5E6F5">{escape(value)}</link>' if href else escape(value)
        item = Paragraph(markup, style)
        _, height = item.wrap(126, PAGE_H)
        item.drawOn(sheet, 28, top - height)
        top -= height + 10
    top -= 21
    sheet.setFont(BOLD, 8.3)
    sheet.setFillColor(cyan)
    sheet.drawString(28, top, "ENFOQUE")
    top -= 20
    for value in ["Desarrollo Full Stack", "Datos e integración",
                  "CI/CD y contenedores", "OpenShift 4"]:
        sheet.setFillColor(soft)
        sheet.setFont(FONT, 8.3)
        sheet.drawString(28, top, value)
        top -= 20
    sheet.setStrokeColor(colors.HexColor("#416786"))
    sheet.line(28, top - 6, 150, top - 6)
    top -= 33
    sheet.setFont(BOLD, 8.3)
    sheet.setFillColor(cyan)
    sheet.drawString(28, top, "IDIOMAS")
    sheet.setFillColor(soft)
    sheet.setFont(FONT, 8.2)
    sheet.drawString(28, top - 20, "Español nativo")
    sheet.drawString(28, top - 38, "Inglés B1")
    sheet.setFillColor(colors.HexColor("#6D9BBD"))
    sheet.setFont(FONT, 7.2)
    sheet.drawString(28, 31, f"CV PÚBLICO  /  {page:02d}")


def build_modern(path: Path) -> None:
    sheet = setup_sheet(path, "CV José Carlos Cusme - Moderno")
    x, width = 204, PAGE_W - 239
    modern_sidebar(sheet, 1)
    sheet.setFillColor(MODERN.ink)
    sheet.setFont(BOLD, 21)
    sheet.drawString(x, PAGE_H - 62, "JOSÉ CARLOS")
    sheet.drawString(x, PAGE_H - 88, "CUSME MONTENEGRO")
    sheet.setFillColor(MODERN.accent)
    sheet.setFont(FONT, 9.2)
    sheet.drawString(x, PAGE_H - 110, "FULL STACK  /  DEVOPS")
    sheet.setStrokeColor(MODERN.line)
    sheet.line(x, PAGE_H - 122, x + width, PAGE_H - 122)
    page_one(Flow(sheet, x, width, PAGE_H - 134, MODERN,
                  body_size=8.8, leading=12.7))
    footer(sheet, x, width, 1, MODERN)
    sheet.showPage()

    modern_sidebar(sheet, 2)
    sheet.setFillColor(MODERN.ink)
    sheet.setFont(BOLD, 16)
    sheet.drawString(x, PAGE_H - 60, "PROYECTOS Y FORMACIÓN")
    sheet.setStrokeColor(MODERN.line)
    sheet.line(x, PAGE_H - 71, x + width, PAGE_H - 71)
    page_two(Flow(sheet, x, width, PAGE_H - 84, MODERN,
                  body_size=8.8, leading=12.6))
    footer(sheet, x, width, 2, MODERN)
    sheet.save()


def editorial_header(sheet: canvas.Canvas, page: int) -> float:
    x, width = 49, PAGE_W - 98
    paper = colors.HexColor("#FAF9F6")
    sheet.setFillColor(paper)
    sheet.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    sheet.setFillColor(EDITORIAL.accent)
    sheet.rect(0, 0, 8, PAGE_H, fill=1, stroke=0)
    if page == 1:
        sheet.setFillColor(EDITORIAL.accent)
        sheet.setFont(BOLD, 8)
        sheet.drawString(x, PAGE_H - 45, "CURRÍCULUM VITAE   /   2026")
        sheet.setFillColor(EDITORIAL.ink)
        sheet.setFont(BOLD, 27)
        sheet.drawString(x, PAGE_H - 83, "José Carlos")
        sheet.drawString(x, PAGE_H - 115, "Cusme Montenegro")
        sheet.setFillColor(EDITORIAL.accent)
        sheet.setFont(FONT, 10)
        sheet.drawString(x, PAGE_H - 137, CV["role"])
        sheet.setStrokeColor(EDITORIAL.accent)
        sheet.setLineWidth(1.4)
        sheet.line(x, PAGE_H - 149, x + width, PAGE_H - 149)
        return contact_line(sheet, x, PAGE_H - 158, width, EDITORIAL, 7.7) - 3
    sheet.setFillColor(EDITORIAL.ink)
    sheet.setFont(BOLD, 14)
    sheet.drawString(x, PAGE_H - 52, CV["name"])
    sheet.setFillColor(EDITORIAL.accent)
    sheet.setFont(BOLD, 8)
    sheet.drawRightString(x + width, PAGE_H - 51, "PORTAFOLIO DE TRABAJO")
    sheet.setStrokeColor(EDITORIAL.accent)
    sheet.line(x, PAGE_H - 64, x + width, PAGE_H - 64)
    return PAGE_H - 77


def build_editorial(path: Path) -> None:
    sheet = setup_sheet(path, "CV José Carlos Cusme - Editorial")
    x, width = 49, PAGE_W - 98
    top = editorial_header(sheet, 1)
    page_one(Flow(sheet, x, width, top, EDITORIAL,
                  body_size=9.4, leading=13.7))
    footer(sheet, x, width, 1, EDITORIAL)
    sheet.showPage()

    top = editorial_header(sheet, 2)
    page_two(Flow(sheet, x, width, top, EDITORIAL,
                  body_size=9.4, leading=13.7))
    footer(sheet, x, width, 2, EDITORIAL)
    sheet.save()


def validate(path: Path) -> None:
    reader = PdfReader(str(path))
    if len(reader.pages) != 2:
        raise ValueError(f"{path.name}: se esperaban dos páginas")
    content = " ".join(page.extract_text() or "" for page in reader.pages).lower()
    expected = ["jose carlos", "cusme montenegro", "hitss ecuador", "arcsa",
                "agrocommunity", "jenkins", "openshift 4", "universidad de guayaquil",
                "cusmegoat2003@hotmail.com", "cusmegoat.github.io"]
    # La extracción de algunos lectores descompone la É acentuada; normalizamos para la comprobación.
    normalized = content.replace("é", "e").replace("á", "a").replace("í", "i")
    if missing := [token for token in expected if token not in normalized]:
        raise ValueError(f"{path.name}: faltan datos: {missing}")
    forbidden = ["kratoscusmerk3@gmail.com", "+593", "portal das",
                 "motor masivo", "motor corporativo", "listas no contactables"]
    if leaked := [token for token in forbidden if token in normalized]:
        raise ValueError(f"{path.name}: contiene información privada: {leaked}")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    temp_root = ROOT / "tmp"
    temp_root.mkdir(exist_ok=True)
    variants = {
        "cv-jose-carlos-cusme-ats.pdf": build_ats,
        "cv-jose-carlos-cusme-moderno.pdf": build_modern,
        "cv-jose-carlos-cusme-editorial.pdf": build_editorial,
    }
    with TemporaryDirectory(prefix="pdfs-", dir=temp_root) as temp:
        outputs = []
        for name, builder in variants.items():
            path = Path(temp) / name
            builder(path)
            validate(path)
            outputs.append((path, PUBLIC / name))
        for source, destination in outputs:
            copyfile(source, destination)
            print(destination)
    # Conserva los enlaces antiguos apuntando ahora al diseño moderno.
    copyfile(PUBLIC / "cv-jose-carlos-cusme-moderno.pdf",
             PUBLIC / "cv-jose-carlos-cusme-montenegro.pdf")


if __name__ == "__main__":
    main()
