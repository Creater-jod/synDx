"""
build_syndx_full_report.py
==========================
Generates the complete, professional project report for Project SynDx (SynDx-S)
following the exact PSG Polytechnic College formatting rules from FINAL COPY @B4.pdf
using the comprehensive clinical project content from SYNDEX_Project_Report.docx.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner cell margins in twips (20 twips = 1 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    """Set cell background color."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_border(cell, **kwargs):
    """
    Set cell borders.
    kwargs can contain top, bottom, left, right, etc.
    values like: {"sz": 4, "val": "single", "color": "D3D3D3"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        edge_data = kwargs.get(border_name)
        if edge_data:
            b = OxmlElement(f'w:{border_name}')
            b.set(qn('w:val'), edge_data.get('val', 'single'))
            b.set(qn('w:sz'), str(edge_data.get('sz', 4)))
            b.set(qn('w:space'), '0')
            b.set(qn('w:color'), edge_data.get('color', 'D3D3D3'))
            tcBorders.append(b)
    tcPr.append(tcBorders)

def add_page_number(run):
    """Inserts a dynamic PAGE number field in a run."""
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def set_section_margins(section):
    """Enforces standard 1.25 in left (binding), 1.0 in right/top/bottom."""
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1.0)
    section.page_width = Inches(8.27)  # A4 width
    section.page_height = Inches(11.69) # A4 height

def format_header(section, header_title, is_roman=False, start_num=None):
    """Formats running header and page numbering."""
    section.header.is_linked_to_previous = False
    
    # Page numbering type
    pgNumType = OxmlElement('w:pgNumType')
    if is_roman:
        pgNumType.set(qn('w:fmt'), 'lowerRoman')
    else:
        pgNumType.set(qn('w:fmt'), 'decimal')
    if start_num is not None:
        pgNumType.set(qn('w:start'), str(start_num))
    section._sectPr.append(pgNumType)

    # Header paragraph
    hp = section.header.paragraphs[0]
    hp.text = ""
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    # Title on left
    r_title = hp.add_run(header_title)
    r_title.font.name = "Arial"
    r_title.font.size = Pt(11)
    r_title.font.color.rgb = RGBColor(90, 100, 115)
    
    # Right-aligned tab & page number
    hp.paragraph_format.tab_stops.add_tab_stop(Inches(6.02)) # 8.27 - 1.25 - 1.0 = 6.02 in
    r_tab = hp.add_run("\t")
    r_pg = hp.add_run()
    r_pg.font.name = "Arial"
    r_pg.font.size = Pt(11)
    r_pg.font.color.rgb = RGBColor(90, 100, 115)
    add_page_number(r_pg)

print("[*] Helper functions loaded.")
