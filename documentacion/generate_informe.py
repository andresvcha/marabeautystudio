#!/usr/bin/env python3
"""Generador del Informe de Despliegue Web - Mara Beauty Studio (v2)"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)

OUTPUT_PATH = "/Users/andres/Documents/Mara Beauty Studio/Informe_Despliegue_Mara_Beauty_Studio.pdf"

# ── Colores ──────────────────────────────────────────────────────────────────
ROSE_DARK   = colors.HexColor("#c2185b")
ROSE_MED    = colors.HexColor("#e91e8c")
ROSE_LIGHT  = colors.HexColor("#fce4ec")
ROSE_SOFT   = colors.HexColor("#fdf0f5")
GREY_BG     = colors.HexColor("#f5f5f5")
GREY_CODE   = colors.HexColor("#eeeeee")
GREY_BORDER = colors.HexColor("#cccccc")
BLUE_LINK   = colors.HexColor("#1565c0")
WHITE       = colors.white
BLACK       = colors.black
DARK_GREY   = colors.HexColor("#333333")

PAGE_W, PAGE_H = A4
MARGIN = 2.5 * cm

# ── Estilos ───────────────────────────────────────────────────────────────────
def make_styles():
    s = {}

    s['cover_title'] = ParagraphStyle(
        'cover_title', fontName='Helvetica-Bold', fontSize=26,
        textColor=WHITE, alignment=TA_CENTER, spaceAfter=10, leading=32)

    s['toc_title'] = ParagraphStyle(
        'toc_title', fontName='Helvetica-Bold', fontSize=18,
        textColor=ROSE_DARK, spaceAfter=16, alignment=TA_CENTER)

    s['toc_sub'] = ParagraphStyle(
        'toc_sub', fontName='Helvetica', fontSize=9,
        textColor=colors.HexColor("#555555"), spaceAfter=2,
        leftIndent=20, leading=14)

    s['section_title'] = ParagraphStyle(
        'section_title', fontName='Helvetica-Bold', fontSize=18,
        textColor=ROSE_DARK, spaceAfter=12, spaceBefore=4,
        borderPad=4, leading=22)

    s['subsection_title'] = ParagraphStyle(
        'subsection_title', fontName='Helvetica-Bold', fontSize=13,
        textColor=ROSE_DARK, spaceAfter=8, spaceBefore=10, leading=18)

    s['body'] = ParagraphStyle(
        'body', fontName='Helvetica', fontSize=10,
        textColor=DARK_GREY, spaceAfter=6, leading=16,
        alignment=TA_JUSTIFY)

    s['body_bullet'] = ParagraphStyle(
        'body_bullet', fontName='Helvetica', fontSize=10,
        textColor=DARK_GREY, spaceAfter=4, leftIndent=16,
        bulletIndent=4, leading=15, alignment=TA_LEFT)

    s['code'] = ParagraphStyle(
        'code', fontName='Courier', fontSize=8.5,
        textColor=colors.HexColor("#212121"), spaceAfter=2,
        leading=13, leftIndent=8, backColor=GREY_CODE)

    s['code_label'] = ParagraphStyle(
        'code_label', fontName='Courier-Bold', fontSize=8,
        textColor=colors.HexColor("#880e4f"), spaceAfter=0, leading=12)

    s['link'] = ParagraphStyle(
        'link', fontName='Helvetica', fontSize=10,
        textColor=BLUE_LINK, spaceAfter=4, leading=14)

    s['caption'] = ParagraphStyle(
        'caption', fontName='Helvetica-Oblique', fontSize=8,
        textColor=colors.HexColor("#666666"), alignment=TA_CENTER,
        spaceAfter=6, leading=11)

    s['note'] = ParagraphStyle(
        'note', fontName='Helvetica-Oblique', fontSize=9,
        textColor=colors.HexColor("#4a148c"), spaceAfter=6,
        leftIndent=10, leading=14, backColor=colors.HexColor("#f3e5f5"))

    return s

ST = make_styles()


# ── Helper builders ───────────────────────────────────────────────────────────
def section_header(title):
    items = []
    items.append(Spacer(1, 0.3*cm))
    items.append(Paragraph(title, ST['section_title']))
    items.append(HRFlowable(width="100%", thickness=2, color=ROSE_DARK, spaceAfter=8))
    return items


def subsection(title):
    return Paragraph(title, ST['subsection_title'])


def body(text):
    return Paragraph(text, ST['body'])


def bullet(text):
    return Paragraph(f"• {text}", ST['body_bullet'])


def code_block(lines, label=None):
    items = []
    if label:
        items.append(Paragraph(label, ST['code_label']))
    data = [[Paragraph(line, ST['code'])] for line in lines]
    t = Table(data, colWidths=[PAGE_W - 2*MARGIN - 0.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREY_CODE),
        ('BOX', (0,0), (-1,-1), 0.5, GREY_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    items.append(t)
    return items


def link(url, label=None):
    display = label or url
    return Paragraph(f'<link href="{url}"><font color="#1565c0">{display}</font></link>', ST['link'])


def note(text):
    return Paragraph(f"<b>Nota:</b> {text}", ST['note'])


def std_table(headers, rows, col_widths=None):
    available = PAGE_W - 2*MARGIN
    n = len(headers)
    if col_widths is None:
        col_widths = [available / n] * n

    header_cells = [Paragraph(f"<b>{h}</b>", ParagraphStyle(
        'th', fontName='Helvetica-Bold', fontSize=9,
        textColor=WHITE, alignment=TA_CENTER, leading=13)) for h in headers]

    table_data = [header_cells]
    for row in rows:
        styled_row = []
        for cell in row:
            if isinstance(cell, str):
                styled_row.append(Paragraph(cell, ParagraphStyle(
                    'td', fontName='Helvetica', fontSize=9,
                    textColor=DARK_GREY, leading=13, alignment=TA_LEFT)))
            else:
                styled_row.append(cell)
        table_data.append(styled_row)

    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ROSE_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, ROSE_LIGHT]),
        ('BOX', (0,0), (-1,-1), 0.5, GREY_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, GREY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


# ── COVER PAGE ────────────────────────────────────────────────────────────────
def build_cover():
    elems = []
    elems.append(Spacer(1, 1.5*cm))

    elems.append(HRFlowable(width="80%", thickness=2, color=ROSE_LIGHT,
                             hAlign='CENTER', spaceAfter=20))

    elems.append(Paragraph("✦ MARA BEAUTY STUDIO ✦", ParagraphStyle(
        'brand', fontName='Helvetica-Bold', fontSize=13,
        textColor=ROSE_DARK, alignment=TA_CENTER, spaceAfter=6, leading=18)))

    elems.append(HRFlowable(width="80%", thickness=1, color=ROSE_MED,
                             hAlign='CENTER', spaceAfter=30))

    title_data = [[
        Paragraph(
            "INFORME DE DESPLIEGUE WEB<br/>Mara Beauty Studio",
            ParagraphStyle('ctitle', fontName='Helvetica-Bold', fontSize=22,
                           textColor=WHITE, alignment=TA_CENTER, leading=30)
        )
    ]]
    title_box = Table(title_data, colWidths=[PAGE_W - 2*MARGIN])
    title_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ROSE_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 22),
        ('BOTTOMPADDING', (0,0), (-1,-1), 22),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
        ('BOX', (0,0), (-1,-1), 2, ROSE_MED),
    ]))
    elems.append(title_box)
    elems.append(Spacer(1, 0.5*cm))

    sub_data = [[
        Paragraph(
            "Configuracion de Hosting Gratuito y Dominio Personalizado<br/>"
            "<font size=10>Plataformas: GitHub · Netlify · Render.com · Freenom</font>",
            ParagraphStyle('csubt', fontName='Helvetica', fontSize=13,
                           textColor=ROSE_DARK, alignment=TA_CENTER, leading=20)
        )
    ]]
    sub_box = Table(sub_data, colWidths=[PAGE_W - 2*MARGIN])
    sub_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ROSE_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('BOX', (0,0), (-1,-1), 1, ROSE_DARK),
    ]))
    elems.append(sub_box)
    elems.append(Spacer(1, 1.5*cm))

    info_data = [
        ["Proyecto:", "Mara Beauty Studio — Gestion de Citas"],
        ["Materia:", "Tecnologias Web / Despliegue de Aplicaciones"],
        ["Autor:", "Andres Velandia"],
        ["Fecha:", "Mayo 2026"],
        ["Version:", "1.0"],
    ]
    info_table = Table(info_data, colWidths=[4*cm, PAGE_W - 2*MARGIN - 4*cm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), ROSE_DARK),
        ('TEXTCOLOR', (1,0), (1,-1), DARK_GREY),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [WHITE, ROSE_LIGHT]),
        ('BOX', (0,0), (-1,-1), 0.5, GREY_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, GREY_BORDER),
    ]))
    elems.append(info_table)
    elems.append(Spacer(1, 1*cm))
    elems.append(HRFlowable(width="80%", thickness=1, color=ROSE_MED,
                             hAlign='CENTER', spaceAfter=10))
    elems.append(Paragraph("✦ ✦ ✦", ParagraphStyle(
        'deco', fontName='Helvetica', fontSize=14,
        textColor=ROSE_DARK, alignment=TA_CENTER)))

    elems.append(PageBreak())
    return elems


# ── TABLE OF CONTENTS ─────────────────────────────────────────────────────────
def build_toc():
    elems = []
    elems.append(Spacer(1, 0.5*cm))
    elems.append(Paragraph("TABLA DE CONTENIDOS", ST['toc_title']))
    elems.append(HRFlowable(width="100%", thickness=2, color=ROSE_DARK, spaceAfter=16))

    toc_items = [
        ("1.", "Introduccion", []),
        ("2.", "Descripcion del Proyecto", [
            "2.1 Arquitectura del Sistema",
            "2.2 Estructura de Archivos",
            "2.3 Modelo de Datos y API",
        ]),
        ("3.", "Seleccion de Plataformas", [
            "3.1 Plataformas Seleccionadas y Justificacion",
            "3.2 Arquitectura de Despliegue",
        ]),
        ("4.", "Preparacion del Repositorio en GitHub", [
            "4.1 Creacion de Cuenta y Repositorio",
            "4.2 Configuracion del .gitignore",
            "4.3 Subida del Codigo",
        ]),
        ("5.", "Despliegue del Frontend en Netlify", [
            "5.1 Creacion de Cuenta",
            "5.2 Metodo 1: Drag & Drop",
            "5.3 Metodo 2: Despliegue desde GitHub",
            "5.4 Archivo netlify.toml",
            "5.5 Variables de Entorno y Dominio Personalizado",
        ]),
        ("6.", "Despliegue del Backend en Render.com", [
            "6.1 Creacion de Cuenta",
            "6.2 Creacion de la Base de Datos PostgreSQL",
            "6.3 Creacion del Web Service",
            "6.4 Variables de Entorno y Verificacion",
        ]),
        ("7.", "Configuracion del Dominio en Freenom", [
            "7.1 Registro del Dominio Gratuito",
            "7.2 Configuracion DNS",
            "7.3 SSL/HTTPS Automatico",
        ]),
        ("8.", "Configuracion del Frontend para Produccion", []),
        ("9.", "Verificacion del Despliegue", []),
    ]

    for num, title, subs in toc_items:
        row_data = [[
            Paragraph(f"<b>{num}</b>", ParagraphStyle(
                'tocn', fontName='Helvetica-Bold', fontSize=10,
                textColor=ROSE_DARK, alignment=TA_CENTER, leading=15)),
            Paragraph(f"<b>{title}</b>", ParagraphStyle(
                'toct', fontName='Helvetica-Bold', fontSize=10,
                textColor=DARK_GREY, leading=15)),
        ]]
        row = Table(row_data, colWidths=[1.2*cm, PAGE_W - 2*MARGIN - 1.2*cm])
        row.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('LINEBELOW', (0,0), (-1,-1), 0.25, GREY_BORDER),
        ]))
        elems.append(row)
        for sub in subs:
            elems.append(Paragraph(f"     >  {sub}", ST['toc_sub']))

    elems.append(PageBreak())
    return elems


# ── SECTION 1: INTRODUCCIÓN ───────────────────────────────────────────────────
def build_intro():
    elems = []
    elems += section_header("1. INTRODUCCION")

    elems.append(body(
        "El presente informe documenta el proceso completo de despliegue de la aplicacion web "
        "<b>Mara Beauty Studio</b> en plataformas de hosting y dominio gratuitas disponibles en internet. "
        "El objetivo es hacer accesible la aplicacion a traves de una direccion web publica, utilizando "
        "exclusivamente servicios gratuitos, lo que permite demostrar la viabilidad de publicar proyectos "
        "web profesionales sin costo inicial."
    ))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("1.1 Objetivo del Informe"))
    elems.append(body("Documentar de manera detallada, con comandos reales, el proceso de:"))
    for item in [
        "Seleccion justificada de plataformas gratuitas de hosting y dominio.",
        "Preparacion del codigo fuente de Mara Beauty Studio para produccion.",
        "Despliegue del frontend estatico en Netlify.",
        "Despliegue del backend Node.js y la base de datos PostgreSQL en Render.com.",
        "Obtencion y configuracion de un dominio personalizado gratuito mediante Freenom.",
        "Verificacion del funcionamiento completo de la aplicacion en produccion.",
    ]:
        elems.append(bullet(item))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("1.2 Descripcion del Proyecto"))
    elems.append(body(
        "<b>Mara Beauty Studio</b> es una aplicacion web completa de gestion de citas para un salon de "
        "belleza. Permite a los clientes visualizar los horarios disponibles y reservar citas en linea, "
        "mientras que el administrador del salon puede crear, gestionar y eliminar los slots de atencion "
        "desde un panel de control protegido con autenticacion JWT. El sistema tambien envia correos "
        "electronicos de confirmacion y cancelacion a los clientes mediante Nodemailer."
    ))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("1.3 Alcance del Despliegue"))
    elems.append(body(
        "El despliegue comprende tanto la capa frontend (archivos estaticos HTML/CSS/JS) como la capa "
        "backend (servidor Node.js + API REST) y la base de datos relacional (PostgreSQL). Ambas capas "
        "quedaran conectadas y accesibles publicamente a traves de un dominio personalizado gratuito."
    ))
    elems.append(note(
        "Este informe fue elaborado con fines academicos y utiliza planes gratuitos de cada plataforma. "
        "Para un ambiente de produccion empresarial se recomienda migrar a planes pagos con SLA garantizado."
    ))

    elems.append(PageBreak())
    return elems


# ── SECTION 2: DESCRIPCIÓN DEL PROYECTO ──────────────────────────────────────
def build_descripcion():
    elems = []
    elems += section_header("2. DESCRIPCION DEL PROYECTO")

    elems.append(subsection("2.1 Arquitectura del Sistema"))
    elems.append(body(
        "Mara Beauty Studio sigue una arquitectura <b>cliente-servidor desacoplada</b>. "
        "El frontend es un sitio web estatico que se comunica con el backend a traves de una API REST. "
        "La base de datos es administrada exclusivamente por el backend mediante el ORM Prisma."
    ))
    elems.append(Spacer(1, 0.3*cm))

    arch_lines = [
        "+-----------------------------------------------------------------+",
        "|           ARQUITECTURA MARA BEAUTY STUDIO                      |",
        "+----------------+------------------------+------------------------+",
        "|   CLIENTE      |     FRONTEND           |      BACKEND           |",
        "|  (Browser)     |  HTML + CSS + JS       |  Node.js + Express     |",
        "|                |  Netlify CDN           |  Render.com            |",
        "|  index.html    |  (Estatico)            |  API REST /api/*       |",
        "|  admin.html    |                        |                        |",
        "|  dashboard     |  api.js -> fetch() --> |  /auth/login           |",
        "|  .html         |  auth.js JWT       <-- |  /appointments CRUD    |",
        "|                |  calendar.js           |  Nodemailer emails     |",
        "|                |                        |                        |",
        "|                |                        |  Prisma ORM            |",
        "|                |                        |       |                |",
        "|                |                        |       v                |",
        "|                |                        |  PostgreSQL DB         |",
        "|                |                        |  Render.com Free       |",
        "+----------------+------------------------+------------------------+",
    ]
    elems += code_block(arch_lines, "Figura 1 - Diagrama de Arquitectura del Sistema")
    elems.append(Spacer(1, 0.4*cm))

    elems.append(subsection("2.2 Estructura de Archivos del Proyecto"))
    elems.append(body("A continuacion se describe cada archivo del proyecto y su funcion dentro del sistema:"))
    elems.append(Spacer(1, 0.2*cm))

    headers = ["Archivo / Directorio", "Capa", "Descripcion"]
    rows = [
        ["frontend/index.html", "Frontend", "Vista principal del cliente: muestra el calendario semanal con slots disponibles y permite reservar citas"],
        ["frontend/admin.html", "Frontend", "Pagina de login del administrador con formulario de autenticacion JWT"],
        ["frontend/dashboard.html", "Frontend", "Panel de control del admin: crear slots de atencion, ver y eliminar citas existentes"],
        ["frontend/simulador-correo.html", "Frontend", "Vista de prueba que simula los correos de confirmacion y cancelacion"],
        ["frontend/css/style.css", "Frontend", "Hoja de estilos global: paleta de colores rosada, fuente Poppins, diseno responsive"],
        ["frontend/js/api.js", "Frontend", "Modulo central de comunicacion: define BASE_URL y funciones fetch() para todos los endpoints"],
        ["frontend/js/auth.js", "Frontend", "Manejo de autenticacion: almacena/lee el JWT en localStorage, protege rutas admin"],
        ["frontend/js/calendar.js", "Frontend", "Logica del calendario: navegacion por semanas, renderizado de slots, seleccion de citas"],
        ["frontend/js/client.js", "Frontend", "Orquesta las interacciones del cliente: reservar y cancelar citas, mostrar modales"],
        ["frontend/js/dashboard.js", "Frontend", "Logica del dashboard admin: crear slots, listar y eliminar appointments via API"],
        ["frontend/js/ui.js", "Frontend", "Manipulacion del DOM: mostrar alertas, abrir/cerrar modales, actualizar vistas"],
        ["frontend/js/utils.js", "Frontend", "Utilidades: formateo de fechas en espanol (Bogota), validaciones de formularios"],
        ["backend/server.js", "Backend", "Punto de entrada del servidor: carga dotenv, instancia Express y arranca en PORT"],
        ["backend/src/app.js", "Backend", "Configura middlewares (CORS, JSON parser), monta rutas /api/auth y /api/appointments"],
        ["backend/prisma/schema.prisma", "Backend/DB", "Esquema Prisma: define modelos User, Client y Appointment con sus relaciones"],
        ["backend/prisma/seed.js", "Backend/DB", "Script de seed: crea el usuario administrador inicial con contrasena hasheada en bcrypt"],
        ["backend/package.json", "Backend", "Manifiesto del proyecto: dependencias, scripts npm (start, dev, db:migrate, db:seed)"],
    ]
    col_widths = [5.5*cm, 2.2*cm, 8.8*cm]
    elems.append(std_table(headers, rows, col_widths))
    elems.append(Paragraph("Tabla 1 - Estructura de archivos del proyecto Mara Beauty Studio", ST['caption']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("2.3 Modelo de Datos y Endpoints de la API"))
    elems.append(body("El backend expone los siguientes endpoints REST:"))

    api_headers = ["Metodo", "Ruta", "Auth", "Descripcion"]
    api_rows = [
        ["POST", "/api/auth/login", "No", "Login administrador. Retorna JWT token de acceso"],
        ["GET", "/api/appointments?week=X&year=Y", "No", "Lista todas las citas de la semana indicada"],
        ["POST", "/api/appointments", "JWT", "Crea uno o varios slots de atencion (solo admin)"],
        ["DELETE", "/api/appointments/:id", "JWT", "Elimina un slot (disponible o reservado) solo admin"],
        ["POST", "/api/appointments/:id/book", "No", "Reserva una cita: recibe nombre y email del cliente"],
        ["POST", "/api/appointments/:id/cancel", "No", "Cancela una cita reservada y libera el slot"],
    ]
    elems.append(std_table(api_headers, api_rows, [1.8*cm, 6.5*cm, 1.5*cm, 6.7*cm]))
    elems.append(Paragraph("Tabla 2 - Endpoints de la API REST de Mara Beauty Studio", ST['caption']))

    elems.append(PageBreak())
    return elems


# ── SECTION 3: SELECCIÓN DE PLATAFORMAS (sin tabla comparativa) ───────────────
def build_plataformas():
    elems = []
    elems += section_header("3. SELECCION DE PLATAFORMAS")

    elems.append(subsection("3.1 Plataformas Seleccionadas y Justificacion"))

    # Netlify box
    netlify_data = [[
        Paragraph("<b>NETLIFY</b> - Hosting del Frontend", ParagraphStyle(
            'pbox_t', fontName='Helvetica-Bold', fontSize=11,
            textColor=WHITE, leading=16)),
        Paragraph(
            "Seleccionado para alojar los archivos estaticos del frontend (HTML, CSS, JS). "
            "Ofrece despliegue continuo desde GitHub, CDN global para carga rapida, "
            "certificado SSL/HTTPS automatico gratuito via Let's Encrypt y soporte para "
            "dominios personalizados sin costo adicional. El plan Starter gratuito incluye "
            "100 GB de bandwidth mensual, suficiente para el volumen de un salon de belleza.",
            ParagraphStyle('pbox_b', fontName='Helvetica', fontSize=9,
                           textColor=DARK_GREY, leading=14)),
    ]]
    netlify_box = Table(netlify_data, colWidths=[4.5*cm, PAGE_W - 2*MARGIN - 4.5*cm])
    netlify_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), ROSE_DARK),
        ('BACKGROUND', (1,0), (1,-1), ROSE_SOFT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, ROSE_DARK),
    ]))
    elems.append(netlify_box)
    elems.append(Spacer(1, 0.3*cm))

    # Render.com box
    render_data = [[
        Paragraph("<b>RENDER.COM</b> - Backend + Base de Datos", ParagraphStyle(
            'pbox_t2', fontName='Helvetica-Bold', fontSize=11,
            textColor=WHITE, leading=16)),
        Paragraph(
            "Seleccionado para alojar el servidor Node.js/Express y la base de datos PostgreSQL. "
            "Render ofrece un Web Service gratuito para aplicaciones Node.js con despliegue "
            "automatico desde GitHub y una instancia de PostgreSQL en el plan Free. Soporta "
            "variables de entorno, comandos de build personalizados (incluyendo migraciones "
            "Prisma) y proporciona una URL publica bajo el subdominio .onrender.com.",
            ParagraphStyle('pbox_b2', fontName='Helvetica', fontSize=9,
                           textColor=DARK_GREY, leading=14)),
    ]]
    render_box = Table(render_data, colWidths=[4.5*cm, PAGE_W - 2*MARGIN - 4.5*cm])
    render_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#1565c0")),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#e3f2fd")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#1565c0")),
    ]))
    elems.append(render_box)
    elems.append(Spacer(1, 0.3*cm))

    # Freenom box
    freenom_data = [[
        Paragraph("<b>FREENOM</b> - Dominio Personalizado Gratuito", ParagraphStyle(
            'pbox_t3', fontName='Helvetica-Bold', fontSize=11,
            textColor=WHITE, leading=16)),
        Paragraph(
            "Seleccionado para obtener un dominio personalizado gratuito. Freenom ofrece "
            "dominios con extensiones .tk, .ml, .ga, .cf y .gq sin costo durante los "
            "primeros 12 meses. Los registros DNS de Freenom se configuran para apuntar "
            "al CDN de Netlify, donde el frontend es servido. El dominio seleccionado es: "
            "<b>mara-beauty-studio.tk</b>",
            ParagraphStyle('pbox_b3', fontName='Helvetica', fontSize=9,
                           textColor=DARK_GREY, leading=14)),
    ]]
    freenom_box = Table(freenom_data, colWidths=[4.5*cm, PAGE_W - 2*MARGIN - 4.5*cm])
    freenom_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#2e7d32")),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#e8f5e9")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#2e7d32")),
    ]))
    elems.append(freenom_box)
    elems.append(Spacer(1, 0.4*cm))

    elems.append(subsection("3.2 Diagrama de Arquitectura de Despliegue"))
    elems.append(body(
        "El siguiente diagrama muestra el flujo completo desde que el usuario accede al dominio "
        "hasta que la informacion es procesada por la base de datos en produccion:"
    ))
    elems.append(Spacer(1, 0.2*cm))

    arch_deploy = [
        "  +---------------+   DNS lookup     +----------------------+",
        "  |   USUARIO     | ---------------> |  FREENOM DNS         |",
        "  |  (Browser)    |                  |  mara-beauty-        |",
        "  |               | <--------------- |  studio.tk           |",
        "  +---------------+  IP de Netlify   +----------------------+",
        "         |",
        "         | HTTPS Request",
        "         v",
        "  +----------------------------------+",
        "  |        NETLIFY CDN               |",
        "  |   (Frontend Estatico)            |",
        "  |  index.html / admin.html         |",
        "  |  dashboard.html / style.css      |",
        "  |  js/api.js -> BASE_URL=Render    |",
        "  +----------------------------------+",
        "         |",
        "         | fetch() API calls (HTTPS)",
        "         v",
        "  +----------------------------------+",
        "  |      RENDER.COM                  |",
        "  |  Web Service (Node.js)           |",
        "  |  mara-beauty-api.onrender.com    |",
        "  |  Express + Prisma ORM            |",
        "  |  JWT Auth + Nodemailer           |",
        "  +----------------------------------+",
        "         |",
        "         | Prisma queries",
        "         v",
        "  +----------------------------------+",
        "  |  RENDER.COM - PostgreSQL DB      |",
        "  |  marabeauty-db (Free tier)       |",
        "  |  Tablas: User, Client,           |",
        "  |  Appointment                     |",
        "  +----------------------------------+",
    ]
    elems += code_block(arch_deploy, "Figura 2 - Flujo de Arquitectura de Despliegue")
    elems.append(Paragraph("Fuente: Elaboracion propia basada en la documentacion de Netlify y Render.com", ST['caption']))

    elems.append(PageBreak())
    return elems


# ── SECTION 4: GITHUB ─────────────────────────────────────────────────────────
def build_github():
    elems = []
    elems += section_header("4. PASO A PASO: REPOSITORIO EN GITHUB")

    elems.append(body(
        "GitHub actua como el repositorio central del codigo fuente. Tanto Netlify como Render.com "
        "se conectan a el para obtener el codigo y desplegar automaticamente cada vez que se realice "
        "un push a la rama principal."
    ))
    elems.append(link("https://github.com", "Acceder a GitHub: https://github.com"))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("4.1 Crear Cuenta y Repositorio en GitHub"))
    steps = [
        ("Paso 1 - Registro:", "Ingresar a https://github.com/signup y crear una cuenta gratuita con email, usuario y contrasena."),
        ("Paso 2 - Nuevo repositorio:", "Hacer clic en el boton verde 'New' en la pagina principal o ir a https://github.com/new"),
        ("Paso 3 - Configuracion:", "Asignar nombre: mara-beauty-studio, seleccionar visibilidad Public, marcar 'Add a README file' y hacer clic en 'Create repository'."),
        ("Paso 4 - URL del repositorio:", "Se genera automaticamente la URL: https://github.com/[usuario]/mara-beauty-studio"),
    ]
    for bold_part, rest in steps:
        elems.append(Paragraph(f"<b>{bold_part}</b> {rest}", ST['body_bullet']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("4.2 Configuracion del Archivo .gitignore"))
    elems.append(body(
        "Antes de subir el codigo, se debe crear un archivo <b>.gitignore</b> en la raiz del proyecto "
        "para excluir archivos sensibles y directorios innecesarios:"
    ))
    gitignore_lines = [
        "# Dependencias",
        "node_modules/",
        "",
        "# Variables de entorno (NUNCA subir al repositorio)",
        ".env",
        ".env.local",
        ".env.production",
        "",
        "# Base de datos local SQLite de Prisma",
        "prisma/dev.db",
        "prisma/dev.db-journal",
        "",
        "# Archivos del sistema operativo",
        ".DS_Store",
        "Thumbs.db",
        "",
        "# Logs",
        "*.log",
        "npm-debug.log*",
    ]
    elems += code_block(gitignore_lines, "Archivo: .gitignore")
    elems.append(Spacer(1, 0.3*cm))
    elems.append(note(
        "El archivo .env contiene el JWT_SECRET y DATABASE_URL con credenciales reales. "
        "Jamas debe subirse al repositorio publico. Las variables se configuran directamente "
        "en los paneles de Netlify y Render.com."
    ))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("4.3 Subida del Codigo a GitHub"))
    elems.append(body("Ejecutar los siguientes comandos en la terminal desde la raiz del proyecto:"))
    git_commands = [
        "# 1. Inicializar git en el directorio del proyecto",
        "git init",
        "",
        "# 2. Agregar todos los archivos al staging (excepto los del .gitignore)",
        "git add .",
        "",
        "# 3. Crear el primer commit",
        'git commit -m "Initial commit - Mara Beauty Studio"',
        "",
        "# 4. Renombrar la rama principal a 'main'",
        "git branch -M main",
        "",
        "# 5. Conectar con el repositorio remoto en GitHub",
        "git remote add origin https://github.com/[usuario]/mara-beauty-studio.git",
        "",
        "# 6. Subir el codigo a GitHub",
        "git push -u origin main",
    ]
    elems += code_block(git_commands, "Terminal - Comandos Git para subir el proyecto")
    elems.append(Spacer(1, 0.2*cm))
    elems.append(body(
        "Tras ejecutar estos comandos, el codigo de Mara Beauty Studio queda disponible en GitHub "
        "y listo para ser enlazado con Netlify y Render.com en los siguientes pasos."
    ))

    elems.append(PageBreak())
    return elems


# ── SECTION 5: NETLIFY ────────────────────────────────────────────────────────
def build_netlify():
    elems = []
    elems += section_header("5. PASO A PASO: DESPLIEGUE DEL FRONTEND EN NETLIFY")

    elems.append(body(
        "Netlify es una plataforma de hosting especializada en sitios web estaticos con CDN global. "
        "Es ideal para el frontend de Mara Beauty Studio porque los archivos HTML, CSS y JS no "
        "requieren servidor propio para ser servidos."
    ))
    elems.append(link("https://www.netlify.com", "Acceder a Netlify: https://www.netlify.com"))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("5.1 Crear Cuenta en Netlify"))
    for item in [
        "Ingresar a https://app.netlify.com/signup",
        "Seleccionar 'Sign up with GitHub' para vincular directamente la cuenta de GitHub",
        "Autorizar a Netlify el acceso a los repositorios",
        "El plan Starter (gratuito) se activa automaticamente al registrarse",
    ]:
        elems.append(bullet(item))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("5.2 Metodo 1: Despliegue por Arrastre (Drag & Drop)"))
    elems.append(body("Este metodo es el mas rapido y no requiere configuracion adicional:"))
    for i, step in enumerate([
        "Abrir en el navegador: https://app.netlify.com/drop",
        "En el explorador de archivos del computador, abrir la carpeta del proyecto.",
        "Seleccionar la carpeta 'frontend/' completa (que contiene index.html, admin.html, css/ y js/).",
        "Arrastrar la carpeta 'frontend/' y soltarla en el area de arrastre de Netlify.",
        "Netlify procesa los archivos en segundos y genera una URL automatica como: https://amazing-name-123456.netlify.app",
        "El sitio ya es accesible publicamente desde esa URL.",
    ], 1):
        elems.append(Paragraph(f"<b>Paso {i}.</b> {step}", ST['body_bullet']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("5.3 Metodo 2: Despliegue Continuo desde GitHub (Recomendado)"))
    elems.append(body(
        "Este metodo configura el despliegue automatico: cada vez que se haga push al repositorio, "
        "Netlify redesplegara el sitio automaticamente:"
    ))
    for i, step in enumerate([
        "En el dashboard de Netlify, hacer clic en 'Add new site' -> 'Import an existing project'.",
        "Seleccionar 'Deploy with GitHub'.",
        "Buscar y seleccionar el repositorio 'mara-beauty-studio'.",
        "En 'Build settings' configurar: Branch to deploy: main | Base directory: frontend | Build command: (dejar vacio para sitio estatico) | Publish directory: frontend",
        "Hacer clic en 'Deploy site'. Netlify clona el repositorio y despliega los archivos.",
        "En aproximadamente 30-60 segundos, el sitio queda publicado con una URL .netlify.app",
    ], 1):
        elems.append(Paragraph(f"<b>Paso {i}.</b> {step}", ST['body_bullet']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("5.4 Archivo de Configuracion netlify.toml"))
    elems.append(body(
        "Para optimizar el despliegue, se crea el archivo <b>netlify.toml</b> en la raiz del proyecto:"
    ))
    netlify_toml = [
        "[build]",
        '  publish = "frontend"',
        "",
        "# Redirigir todas las rutas al index.html",
        "[[redirects]]",
        '  from = "/*"',
        '  to = "/index.html"',
        "  status = 200",
        "",
        "# Headers de seguridad",
        "[[headers]]",
        '  for = "/*"',
        "  [headers.values]",
        '    X-Frame-Options = "DENY"',
        '    X-Content-Type-Options = "nosniff"',
        '    Referrer-Policy = "strict-origin-when-cross-origin"',
    ]
    elems += code_block(netlify_toml, "Archivo: netlify.toml")

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("5.5 Variables de Entorno y Dominio Personalizado"))
    elems.append(body("Configurar variable de entorno en Netlify:"))
    for item in [
        "Ir a: Site settings -> Environment variables -> Add a variable",
        "Key: API_BASE_URL | Value: https://mara-beauty-api.onrender.com",
        "Hacer clic en 'Save' y redesplegar el sitio",
    ]:
        elems.append(bullet(item))
    elems.append(Spacer(1, 0.2*cm))
    elems.append(body("Configurar dominio personalizado (una vez obtenido en Freenom - ver Seccion 7):"))
    for item in [
        "Site settings -> Domain management -> Add a domain alias",
        "Ingresar: mara-beauty-studio.tk -> Verify",
        "SSL/HTTPS se provisiona automaticamente (Let's Encrypt) en 5-10 minutos",
    ]:
        elems.append(bullet(item))

    elems.append(Spacer(1, 0.2*cm))
    env_info = [
        ["Elemento", "Valor"],
        ["URL Netlify (automatica)", "https://mara-beauty-studio.netlify.app"],
        ["URL con dominio personalizado", "https://mara-beauty-studio.tk"],
        ["SSL/HTTPS", "Automatico via Let's Encrypt (gratuito)"],
        ["CDN", "Global (USA, Europa, Asia)"],
        ["Bandwidth gratuito", "100 GB / mes"],
        ["Tiempo de build (estatico)", "< 30 segundos"],
    ]
    t = Table(env_info, colWidths=[6*cm, PAGE_W - 2*MARGIN - 6*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ROSE_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, ROSE_LIGHT]),
        ('BOX', (0,0), (-1,-1), 0.5, GREY_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, GREY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    elems.append(t)
    elems.append(Paragraph("Tabla 3 - Resumen de configuracion Netlify para Mara Beauty Studio", ST['caption']))

    elems.append(PageBreak())
    return elems


# ── SECTION 6: RENDER.COM ─────────────────────────────────────────────────────
def build_render():
    elems = []
    elems += section_header("6. PASO A PASO: DESPLIEGUE DEL BACKEND EN RENDER.COM")

    elems.append(body(
        "Render.com es la plataforma seleccionada para alojar el servidor Node.js/Express de Mara "
        "Beauty Studio y la base de datos PostgreSQL. Su plan gratuito incluye un Web Service para "
        "aplicaciones Node.js y una base de datos PostgreSQL, ambos necesarios para el backend."
    ))
    elems.append(link("https://render.com", "Acceder a Render.com: https://render.com"))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("6.1 Crear Cuenta en Render.com"))
    for item in [
        "Ingresar a https://dashboard.render.com/register",
        "Registrarse con GitHub (recomendado, ya que simplifica la conexion con el repositorio)",
        "Confirmar el correo electronico",
        "El plan Free se activa automaticamente",
    ]:
        elems.append(bullet(item))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("6.2 Crear la Base de Datos PostgreSQL"))
    elems.append(body(
        "El primer recurso a crear es la base de datos, ya que se necesita su URL de conexion "
        "para configurar el Web Service:"
    ))
    for i, step in enumerate([
        "En el dashboard de Render, hacer clic en 'New +' -> 'PostgreSQL'.",
        "Configurar: Name: marabeauty-db | Database: marabeauty | User: marabeauty_user | Region: Oregon (US West) | Plan: Free.",
        "Hacer clic en 'Create Database'. El proceso tarda 1-2 minutos.",
        "Una vez creada, Render muestra las credenciales. Copiar la 'Internal Database URL' (formato: postgresql://user:pass@host/db)",
        "Anotar tambien la 'External Database URL' (para conectarse desde herramientas locales como DBeaver).",
    ], 1):
        elems.append(Paragraph(f"<b>Paso {i}.</b> {step}", ST['body_bullet']))

    elems.append(Spacer(1, 0.2*cm))
    elems += code_block([
        "# Formato de la Internal Database URL que proporciona Render:",
        "postgresql://marabeauty_user:AbCdEfGhIjKl@dpg-xxxxx-a/marabeauty",
        "",
        "# Esta URL se usara como valor de DATABASE_URL en las variables de entorno",
    ], "Ejemplo de Database URL generada por Render.com")

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("6.3 Crear el Web Service (Backend Node.js)"))
    for i, step in enumerate([
        "En el dashboard de Render, hacer clic en 'New +' -> 'Web Service'.",
        "Seleccionar 'Build and deploy from a Git repository' -> conectar con GitHub -> buscar 'mara-beauty-studio'.",
        "Configurar los parametros del servicio:",
    ], 1):
        elems.append(Paragraph(f"<b>Paso {i}.</b> {step}", ST['body_bullet']))

    config_render = [
        ["Parametro", "Valor"],
        ["Name", "mara-beauty-api"],
        ["Root Directory", "backend"],
        ["Environment", "Node"],
        ["Region", "Oregon (US West)"],
        ["Branch", "main"],
        ["Build Command", "npm install && npx prisma generate && npx prisma migrate deploy"],
        ["Start Command", "npm start"],
        ["Plan", "Free"],
    ]
    t = Table(config_render, colWidths=[5*cm, PAGE_W - 2*MARGIN - 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1565c0")),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,1), (1,-1), 'Courier'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, colors.HexColor("#e3f2fd")]),
        ('BOX', (0,0), (-1,-1), 0.5, GREY_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, GREY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    elems.append(t)
    elems.append(Paragraph("Tabla 4 - Configuracion del Web Service en Render.com", ST['caption']))
    elems.append(Spacer(1, 0.2*cm))
    elems.append(Paragraph("<b>Paso 4.</b> Hacer clic en 'Create Web Service'. Render clona el repositorio y ejecuta el Build Command.", ST['body_bullet']))
    elems.append(Paragraph("<b>Paso 5.</b> Una vez completado el deploy, se genera la URL del API: https://mara-beauty-api.onrender.com", ST['body_bullet']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("6.4 Variables de Entorno y Verificacion del API"))
    elems.append(body(
        "Las variables de entorno reemplazan el archivo .env local. Se configuran en: "
        "Dashboard -> mara-beauty-api -> Environment -> Environment Variables:"
    ))
    env_vars = [
        ["Variable", "Valor / Descripcion"],
        ["DATABASE_URL", "postgresql://... (Internal DB URL del paso 6.2)"],
        ["JWT_SECRET", "Cadena aleatoria segura (ej: openssl rand -base64 32)"],
        ["EMAIL_USER", "correo@gmail.com (cuenta de envio Nodemailer)"],
        ["EMAIL_PASS", "Contrasena de aplicacion de Gmail"],
        ["NODE_ENV", "production"],
        ["PORT", "10000"],
    ]
    elems.append(std_table(["Variable", "Valor / Descripcion"], env_vars[1:],
                           [4.5*cm, PAGE_W - 2*MARGIN - 4.5*cm]))
    elems.append(Paragraph("Tabla 5 - Variables de entorno configuradas en Render.com", ST['caption']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(body("Ejecutar seed inicial desde Render Shell y verificar el API:"))
    verify_lines = [
        "# Desde Render Dashboard -> mara-beauty-api -> Shell:",
        "node prisma/seed.js",
        "",
        "# Test: verificar que el servidor responde",
        "GET https://mara-beauty-api.onrender.com/api/appointments",
        "# Respuesta esperada: [] (array vacio de citas)",
        "",
        "# Test: verificar login admin",
        "POST https://mara-beauty-api.onrender.com/api/auth/login",
        '# Body: { "username": "admin", "password": "admin123" }',
        '# Respuesta esperada: { "token": "eyJhbG..." }',
    ]
    elems += code_block(verify_lines, "Verificacion de endpoints")
    elems.append(note(
        "En el plan gratuito de Render, el Web Service entra en modo 'sleep' despues de 15 minutos "
        "de inactividad. La primera request despues del sleep puede tardar 20-30 segundos en responder "
        "mientras el servicio se reactiva (cold start). Esto es normal en el plan Free."
    ))

    elems.append(PageBreak())
    return elems


# ── SECTION 7: FREENOM ────────────────────────────────────────────────────────
def build_freenom():
    elems = []
    elems += section_header("7. PASO A PASO: DOMINIO GRATUITO EN FREENOM")

    elems.append(body(
        "Freenom es un proveedor de dominios que ofrece extensiones gratuitas: .tk, .ml, .ga, .cf y .gq. "
        "El dominio seleccionado para Mara Beauty Studio es <b>mara-beauty-studio.tk</b>. "
        "Los dominios .tk son propiedad de Tokelau (territorio de Nueva Zelanda) y se ofrecen "
        "gratuitamente como parte de un acuerdo de ingresos compartidos."
    ))
    elems.append(link("https://www.freenom.com", "Acceder a Freenom: https://www.freenom.com"))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("7.1 Registro del Dominio Gratuito"))
    for i, step in enumerate([
        "Ingresar a https://www.freenom.com/es/index.html",
        "En el campo de busqueda, escribir 'mara-beauty-studio' y presionar 'Check Availability'.",
        "Freenom muestra las extensiones disponibles. Seleccionar '.tk' (gratuita por 12 meses) haciendo clic en 'Get it now!'.",
        "Hacer clic en 'Checkout'. En la pagina de orden, cambiar el periodo a '12 Months @ FREE' y hacer clic en 'Continue'.",
        "Si no se tiene cuenta, seleccionar 'I don't have an account' y registrarse con email.",
        "Completar la informacion de contacto (nombre, direccion). Hacer clic en 'Complete Order'.",
        "Revisar el correo electronico: Freenom enviara un email de verificacion. Hacer clic en el enlace para activar la cuenta.",
        "Ingresar al panel de Freenom con las credenciales creadas. En 'My Domains' aparecera el dominio mara-beauty-studio.tk.",
    ], 1):
        elems.append(Paragraph(f"<b>Paso {i}.</b> {step}", ST['body_bullet']))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("7.2 Configuracion de los Registros DNS"))
    elems.append(body(
        "Los registros DNS indican a los navegadores a que servidor deben dirigirse cuando alguien "
        "escribe mara-beauty-studio.tk en la barra de direcciones:"
    ))
    for item in [
        "En el panel de Freenom, ir a: Services -> My Domains -> Manage Domain.",
        "Hacer clic en la pestana 'Manage Freenom DNS'.",
        "Agregar los siguientes registros DNS:",
    ]:
        elems.append(bullet(item))

    dns_headers = ["Tipo", "Name (Host)", "Target (Valor)", "TTL", "Proposito"]
    dns_rows = [
        ["A", "@", "104.198.14.52", "3600", "Apunta el dominio raiz a la IP de Netlify"],
        ["CNAME", "www", "mara-beauty-studio.netlify.app", "3600", "Redirige www al subdominio de Netlify"],
    ]
    elems.append(std_table(dns_headers, dns_rows, [1.5*cm, 2*cm, 5.5*cm, 1.5*cm, 5.5*cm]))
    elems.append(Paragraph("Tabla 6 - Registros DNS a configurar en Freenom para apuntar a Netlify", ST['caption']))

    elems.append(Spacer(1, 0.2*cm))
    elems.append(body("Despues de guardar los registros DNS, ir al panel de Netlify:"))
    for item in [
        "En Netlify: Site settings -> Domain management -> Add a domain alias",
        "Escribir: mara-beauty-studio.tk y hacer clic en 'Add domain alias'",
        "Hacer clic en 'Provision certificate' para activar HTTPS/SSL automatico",
    ]:
        elems.append(bullet(item))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("7.3 SSL/HTTPS Automatico con Let's Encrypt"))
    elems.append(body(
        "Netlify se asocia con <b>Let's Encrypt</b> para emitir certificados SSL/TLS gratuitos de manera "
        "automatica. Una vez que los DNS propagan correctamente, Netlify detecta el dominio y emite "
        "el certificado en 5-15 minutos. El resultado es que el sitio queda accesible mediante HTTPS "
        "con el candado de seguridad visible en el navegador."
    ))
    elems.append(note(
        "La propagacion DNS puede tomar entre 1 y 48 horas. Para verificar la propagacion se puede "
        "usar: https://www.whatsmydns.net"
    ))

    elems.append(PageBreak())
    return elems


# ── SECTION 8: PRODUCCIÓN ─────────────────────────────────────────────────────
def build_produccion():
    elems = []
    elems += section_header("8. CONFIGURACION DEL FRONTEND PARA PRODUCCION")

    elems.append(body(
        "Antes de hacer el despliegue final, se realizan ajustes en el codigo del frontend para que "
        "apunte al backend en produccion (Render.com) en lugar de localhost."
    ))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("8.1 Actualizar la URL del API en api.js"))
    elems.append(body(
        "El archivo <b>frontend/js/api.js</b> contiene la URL base para todas las llamadas al API. "
        "Se debe cambiar de localhost a la URL de Render:"
    ))
    api_before = [
        "// ANTES (desarrollo local)",
        "const BASE_URL = 'http://localhost:3000';",
    ]
    api_after = [
        "// DESPUES (produccion en Render.com)",
        "const BASE_URL = 'https://mara-beauty-api.onrender.com';",
    ]
    elems += code_block(api_before, "frontend/js/api.js - ANTES (local)")
    elems.append(Spacer(1, 0.1*cm))
    elems += code_block(api_after, "frontend/js/api.js - DESPUES (produccion)")

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("8.2 Configurar CORS en el Backend"))
    elems.append(body(
        "El backend debe permitir peticiones HTTP desde el dominio de Netlify. Se configura CORS en "
        "<b>backend/src/app.js</b>:"
    ))
    cors_code = [
        "const corsOptions = {",
        "  origin: [",
        "    'https://mara-beauty-studio.netlify.app',",
        "    'https://mara-beauty-studio.tk',",
        "    'https://www.mara-beauty-studio.tk',",
        "    // Mantener localhost para desarrollo local:",
        "    'http://localhost:5500',",
        "    'http://127.0.0.1:5500',",
        "  ],",
        "  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],",
        "  allowedHeaders: ['Content-Type', 'Authorization'],",
        "};",
        "",
        "app.use(cors(corsOptions));",
    ]
    elems += code_block(cors_code, "backend/src/app.js - Configuracion CORS para produccion")

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("8.3 Commit y Push de los Cambios"))
    push_cmds = [
        "# Guardar los cambios",
        "git add frontend/js/api.js backend/src/app.js",
        'git commit -m "config: update API URL and CORS for production"',
        "git push origin main",
        "",
        "# Al hacer push:",
        "# - Netlify detecta el cambio y redespliega el frontend automaticamente",
        "# - Render.com detecta el cambio y redespliega el backend automaticamente",
    ]
    elems += code_block(push_cmds, "Terminal - Push para redespliegue automatico")

    elems.append(PageBreak())
    return elems


# ── SECTION 9: VERIFICACIÓN ────────────────────────────────────────────────────
def build_verificacion():
    elems = []
    elems += section_header("9. VERIFICACION DEL DESPLIEGUE")

    elems.append(body(
        "Una vez completados todos los pasos anteriores, se realiza una verificacion integral del "
        "sistema para confirmar que todos los componentes funcionan correctamente en produccion."
    ))
    elems.append(Spacer(1, 0.3*cm))

    elems.append(subsection("9.1 Lista de Verificacion"))
    checks = [
        ("Frontend accesible en URL de Netlify",
         "https://mara-beauty-studio.netlify.app carga la pagina principal del cliente"),
        ("Dominio personalizado activo",
         "https://mara-beauty-studio.tk redirige correctamente al frontend"),
        ("SSL/HTTPS activo",
         "Candado de seguridad verde visible en la barra del navegador"),
        ("API responde correctamente",
         "GET https://mara-beauty-api.onrender.com/api/appointments retorna JSON"),
        ("Calendario muestra citas disponibles",
         "La vista del cliente muestra el calendario semanal con slots"),
        ("Flujo de reserva de cita funciona",
         "Cliente puede seleccionar slot, ingresar datos y confirmar la reserva"),
        ("Panel de administrador accesible",
         "https://mara-beauty-studio.tk/admin.html muestra el formulario de login"),
        ("Login JWT del administrador funciona",
         "Admin puede ingresar con credenciales y acceder al dashboard"),
        ("Dashboard admin funciona",
         "Admin puede crear y eliminar slots de atencion desde dashboard.html"),
        ("Emails de confirmacion se envian",
         "Al reservar una cita, el cliente recibe un correo de confirmacion via Nodemailer"),
    ]

    for title, desc in checks:
        row_data = [[
            Paragraph("OK", ParagraphStyle('ck', fontName='Helvetica-Bold',
                       fontSize=9, textColor=colors.HexColor("#2e7d32"),
                       alignment=TA_CENTER, leading=14)),
            Paragraph(f"<b>{title}</b><br/><font size=9 color='#555555'>{desc}</font>",
                      ParagraphStyle('ckd', fontName='Helvetica', fontSize=10,
                                     textColor=DARK_GREY, leading=15)),
        ]]
        row = Table(row_data, colWidths=[1.2*cm, PAGE_W - 2*MARGIN - 1.2*cm])
        row.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('LINEBELOW', (0,0), (-1,-1), 0.25, colors.HexColor("#c8e6c9")),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f8e9")),
        ]))
        elems.append(row)
        elems.append(Spacer(1, 0.1*cm))

    elems.append(Spacer(1, 0.3*cm))
    elems.append(subsection("9.2 URLs Finales del Sistema en Produccion"))
    urls_data = [
        ["Componente", "URL de Produccion", "Descripcion"],
        ["Frontend (cliente)", "https://mara-beauty-studio.tk", "Pagina principal - reservar citas"],
        ["Frontend (Netlify)", "https://mara-beauty-studio.netlify.app", "URL alternativa de Netlify"],
        ["Admin Login", "https://mara-beauty-studio.tk/admin.html", "Acceso panel administrador"],
        ["Dashboard Admin", "https://mara-beauty-studio.tk/dashboard.html", "Gestion de slots y citas"],
        ["API REST", "https://mara-beauty-api.onrender.com", "Base URL del backend"],
        ["API Appointments", "https://mara-beauty-api.onrender.com/api/appointments", "Endpoint principal de citas"],
        ["API Login", "https://mara-beauty-api.onrender.com/api/auth/login", "Endpoint de autenticacion"],
    ]
    elems.append(std_table(["Componente", "URL de Produccion", "Descripcion"],
                           urls_data[1:], [3.5*cm, 6.5*cm, 6.5*cm]))
    elems.append(Paragraph("Tabla 7 - URLs definitivas del sistema Mara Beauty Studio en produccion", ST['caption']))

    return elems


# ── MAIN BUILD ────────────────────────────────────────────────────────────────
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title="Informe de Despliegue Web — Mara Beauty Studio",
        author="Andres Velandia",
        subject="Configuracion de Hosting Gratuito y Dominio Personalizado",
    )

    story = []
    story += build_cover()
    story += build_toc()
    story += build_intro()
    story += build_descripcion()
    story += build_plataformas()
    story += build_github()
    story += build_netlify()
    story += build_render()
    story += build_freenom()
    story += build_produccion()
    story += build_verificacion()

    doc.build(story)
    print(f"PDF generado exitosamente: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
