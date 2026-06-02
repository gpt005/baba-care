from __future__ import annotations

import io
from decimal import Decimal

from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Table, TableStyle

from ..schemas import InvoiceRequest
from .fonts import font, register_fonts
from .primitives import (
    draw_background,
    draw_blush_band,
    draw_checkbox,
    draw_dotted_line,
    draw_heart,
    draw_heart_paw_icon,
    draw_label_underline,
    draw_paw_corners,
    draw_ribbon_footer,
    draw_scattered_hearts,
    draw_signature,
    draw_sparkle,
    draw_total_badge,
    draw_value_only_underline,

)
from .theme import (
    BLUSH,
    BUSINESS_NAME,
    BUSINESS_TAGLINE,
    CREAM,
    INK,
    MARGIN,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    PINK_DEEP,
    PINK_DEEPEST,
    PINK_SOFT,
    SOCIAL_INSTAGRAM,
    SOCIAL_PHONE,
    WHITE,
)


CONTACT_LINE_HEIGHT = 14


def _fmt_money(value: Decimal) -> str:
    return f"${value:,.2f}"


def _fmt_signed_money(value: Decimal) -> str:
    if value > 0:
        return f"-${value:,.2f}"
    return _fmt_money(value)


def _fmt_qty(qty: Decimal) -> str:
    s = format(qty.normalize(), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return s or "0"


def _split_contact_lines(contact_info: str) -> list[str]:
    return [line.strip() for line in contact_info.splitlines() if line.strip()] or [""]


def _draw_header(c: Canvas) -> None:
    title_font = font("Caveat-Bold")
    wordmark_font = font("Fredoka-Bold")
    subtitle_font = font("Quicksand-Italic")

    title_baseline = PAGE_HEIGHT - MARGIN - 50
    title_size = 76

    # Soft drop-shadow for "Invoice"
    c.setFont(title_font, title_size)
    c.setFillColor(PINK_SOFT)
    c.drawString(MARGIN + 3, title_baseline - 3, "Invoice")
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, title_baseline, "Invoice")
    title_width = c.stringWidth("Invoice", title_font, title_size)

    # Heart-with-paw icon next to the title
    icon_size = 32
    icon_x = MARGIN + title_width + 12
    draw_heart_paw_icon(
        c,
        icon_x,
        title_baseline - 6,
        size=icon_size,
    )

    # Sparkles flanking the title
    draw_sparkle(c, icon_x + icon_size + 8, title_baseline + 32, size=5, color=PINK_DEEP, alpha=0.85)
    draw_sparkle(c, icon_x + icon_size + 22, title_baseline + 14, size=4, color=PINK_DEEPEST, alpha=0.75)

    # "baba" wordmark, top-right — script with drop shadow + heart accent
    right_edge = PAGE_WIDTH - MARGIN
    name_size = 42
    name_w = c.stringWidth(BUSINESS_NAME, wordmark_font, name_size)

    # Reserve space for a small trailing heart so the whole lockup is right-aligned
    heart_gap = 8
    heart_size = 13
    lockup_w = name_w + heart_gap + heart_size
    name_x = right_edge - lockup_w
    wordmark_baseline = PAGE_HEIGHT - MARGIN - 38

    # Drop shadow
    c.setFont(wordmark_font, name_size)
    c.setFillColor(PINK_SOFT)
    c.drawString(name_x + 2, wordmark_baseline - 2, BUSINESS_NAME)
    # Foreground
    c.setFillColor(PINK_DEEPEST)
    c.drawString(name_x, wordmark_baseline, BUSINESS_NAME)

    # Heart immediately after "baba"
    heart_cx = name_x + name_w + heart_gap + heart_size / 2
    heart_cy = wordmark_baseline + name_size * 0.30
    draw_heart(c, heart_cx, heart_cy, size=heart_size, color=PINK_DEEPEST, alpha=1.0)

    # "pet care" subtitle — italic with letter-spacing (via a TextObject)
    subtitle = BUSINESS_TAGLINE
    subtitle_size = 12
    char_space = 1.4
    tag_w_with_tracking = c.stringWidth(subtitle, subtitle_font, subtitle_size) + char_space * (len(subtitle) - 1)
    subtitle_x = right_edge - tag_w_with_tracking
    subtitle_baseline = wordmark_baseline - 16
    text_obj = c.beginText(subtitle_x, subtitle_baseline)
    text_obj.setFont(subtitle_font, subtitle_size)
    text_obj.setCharSpace(char_space)
    text_obj.setFillColor(PINK_DEEP)
    text_obj.textOut(subtitle)
    c.drawText(text_obj)

    # Dotted underline beneath "pet care"
    draw_dotted_line(
        c,
        subtitle_x - 4,
        subtitle_baseline - 5,
        right_edge,
        color=PINK_DEEP,
        line_width=0.7,
        dash=(1.4, 2.0),
    )

    # Sparkles around the wordmark
    draw_sparkle(c, name_x - 10, wordmark_baseline + 26, size=4, color=PINK_DEEPEST, alpha=0.85)
    draw_sparkle(c, name_x - 2, wordmark_baseline + 6, size=3, color=PINK_DEEP, alpha=0.7)
    draw_sparkle(c, right_edge + 4, wordmark_baseline - 4, size=3.5, color=PINK_DEEPEST, alpha=0.8)


def _draw_meta_grid(c: Canvas, data: InvoiceRequest) -> float:
    """Renders the Client / Contact / Fur-baby / Breed / Sterilization / Service-dates block.

    Returns the Y of the lowest row drawn (so callers can place the table below it).
    """
    body_font = font("Quicksand")
    bold_font = font("Quicksand-Bold")

    left_x = MARGIN
    right_x = PAGE_WIDTH / 2 + 6
    line_w_left = (PAGE_WIDTH / 2) - MARGIN - 86
    line_w_right = (PAGE_WIDTH / 2) - MARGIN - 110

    y = PAGE_HEIGHT - MARGIN - 150

    contact_lines = _split_contact_lines(data.contact_info)
    contact_first = contact_lines[0]
    contact_extra = contact_lines[1:]

    # Row 1: Client (left)  |  Contact Info (right, first line)
    draw_label_underline(
        c, left_x, y, "Client:", data.client, line_width=line_w_left, underline_shift=-6
    )
    draw_label_underline(
        c, right_x, y, "Contact Info:", contact_first, line_width=line_w_right
    )

    # Subsequent contact_info lines stack below, aligned with first value
    label_w = c.stringWidth("Contact Info:", bold_font, 11)
    value_x = right_x + label_w + 20

    extra_y = y
    for line in contact_extra:
        extra_y -= CONTACT_LINE_HEIGHT
        draw_value_only_underline(
            c, value_x, extra_y, line,
            line_width=line_w_right,
            value_font=body_font,
            value_size=11,
        )

    # Account for stacked contact lines when laying out the rows below
    block_bottom = min(y, extra_y) - 22

    # Row 2: Fur-baby (left)  |  Breed (age) (right)
    y = block_bottom
    pet_label = f"{data.pet_name} ({data.pet_sex.value})"
    breed_label = f"{data.breed} ({data.age_category.value})"
    draw_label_underline(
        c, left_x, y, "Fur-baby:", pet_label, line_width=line_w_left, underline_shift=-6
    )
    draw_label_underline(
        c, right_x, y, "Breed (age): ", breed_label, line_width=line_w_right
    )

    # Row 3: Sterilization (single checkbox + label)
    y -= 28
    c.setFont(bold_font, 11)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(left_x, y, "Sterilization:")
    box_x = left_x + c.stringWidth("Sterilization:", bold_font, 11) + 24
    draw_checkbox(c, box_x, y - 1, size=12, checked=data.sterilization)
    c.setFont(body_font, 11)
    c.setFillColor(INK)
    c.drawString(box_x + 20, y, "Fixed")

    # Row 4: Service dates (full width)
    y -= 28
    service_text = data.service_date
    if data.service_time_range:
        service_text = f"{service_text} ({data.service_time_range})"
    draw_label_underline(
        c, left_x, y, "Service dates: ", service_text,
        line_width=PAGE_WIDTH - 2 * MARGIN - 130,
        underline_shift=-6,
    )

    return y


def _build_services_table(data: InvoiceRequest) -> tuple[Table, int]:
    body_font = font("Quicksand")
    bold_font = font("Quicksand-Bold")

    header = ["Service", "Qty", "Unit Price", "Amount"]
    rows: list[list[str]] = [header]
    for line in data.services:
        rows.append(
            [
                line.service,
                _fmt_qty(line.qty),
                _fmt_money(line.unit_price),
                _fmt_money(line.amount),
            ]
        )

    body_end_row = len(rows) - 1

    rows.append(["", "", "Subtotal", _fmt_money(data.subtotal)])
    subtotal_row = len(rows) - 1

    discount_pct = int((data.discount * 100).to_integral_value())
    discount_label = "Discount"
    if data.discount > 0:
        discount_label = f"Discount ({discount_pct}%)"
    rows.append(["", "", discount_label, _fmt_signed_money(data.discount_amount)])

    rows.append(["", "", "Tip", _fmt_money(data.tip) if data.tip > 0 else "-"])

    # Total row left blank — drawn as a pill badge outside the table for emphasis
    rows.append(["", "", "", ""])
    total_row = len(rows) - 1

    col_widths = [3.4 * inch, 0.8 * inch, 1.3 * inch, 1.3 * inch]
    t = Table(rows, colWidths=col_widths)
    style = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), PINK_DEEP),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), bold_font),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTNAME", (0, 1), (-1, body_end_row), body_font),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("TEXTCOLOR", (0, 1), (-1, -1), INK),
            ("LINEBELOW", (0, 0), (-1, body_end_row), 0.5, PINK_SOFT),
            ("BACKGROUND", (0, 1), (-1, body_end_row), CREAM),
            ("BACKGROUND", (2, subtotal_row), (-1, total_row - 1), BLUSH),
            ("FONTNAME", (2, subtotal_row), (2, -1), bold_font),
            ("TEXTCOLOR", (2, subtotal_row), (2, -1), PINK_DEEPEST),
            ("FONTNAME", (3, subtotal_row), (3, -1), bold_font),
            ("TEXTCOLOR", (3, subtotal_row), (3, -1), INK),
            # Total row left empty for the overlaid badge
            ("BACKGROUND", (0, total_row), (-1, total_row), CREAM),
            ("MINROWHEIGHT", (0, total_row), (-1, total_row), 32),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            # Beveled / rounded outer corners
            ("ROUNDEDCORNERS", [10, 10, 10, 10]),
            ("BOX", (0, 0), (-1, -1), 0.6, PINK_DEEP),
        ]
    )
    t.setStyle(style)
    return t, total_row


def _draw_services_section(c: Canvas, data: InvoiceRequest, top_y: float) -> float:
    """Draws a beveled, rounded-corner services table with an overlaid Total badge."""
    table, total_row = _build_services_table(data)
    available_w = PAGE_WIDTH - 2 * MARGIN
    table_w, table_h = table.wrapOn(c, available_w, PAGE_HEIGHT)
    table_x = MARGIN + (available_w - table_w) / 2
    table_y = top_y - table_h

    table.drawOn(c, table_x, table_y)

    # Bevel: subtle white highlight along the top edge + soft pink shadow on the bottom edge.
    radius = 10
    c.saveState()
    c.setLineWidth(1.0)
    c.setStrokeColor(WHITE)
    c.setStrokeAlpha(0.55)
    # Top highlight inset slightly under the rounded corners
    c.line(table_x + radius + 2, table_y + table_h - 1.2,
           table_x + table_w - radius - 2, table_y + table_h - 1.2)
    c.setStrokeColor(PINK_DEEPEST)
    c.setStrokeAlpha(0.25)
    c.line(table_x + radius + 2, table_y + 1.2,
           table_x + table_w - radius - 2, table_y + 1.2)
    c.restoreState()

    # Overlay Total pill badge on the total row
    col_widths = [3.4 * inch, 0.8 * inch, 1.3 * inch, 1.3 * inch]
    badge_right = table_x + sum(col_widths)
    badge_left = table_x + col_widths[0] + col_widths[1]
    badge_cx = (badge_left + badge_right) / 2

    # Row heights: total row is last, with MINROWHEIGHT=32
    row_heights = table._rowHeights  # noqa: SLF001 - ReportLab Table internals
    total_row_h = row_heights[total_row]
    total_row_y = table_y + sum(row_heights[total_row + 1:])
    badge_cy = total_row_y + total_row_h / 2

    badge_w = col_widths[2] + col_widths[3] - 12
    badge_h = total_row_h - 6
    draw_total_badge(
        c,
        cx=badge_cx,
        cy=badge_cy,
        width=badge_w,
        height=badge_h,
        label="Total",
        value=_fmt_money(data.total),
    )

    return table_y


def _draw_payment(c: Canvas, data: InvoiceRequest, y: float) -> None:
    line_w = (PAGE_WIDTH - 2 * MARGIN) / 2 - 130
    draw_label_underline(
        c, MARGIN, y, "Payment Method: ", data.payment_method, line_width=line_w, underline_shift=-6
    )
    draw_label_underline(
        c,
        PAGE_WIDTH / 2 + 6,
        y,
        "Payment Date: ",
        data.payment_date,
        line_width=line_w,
    )


def _draw_prepared_by_block(c: Canvas, y: float) -> None:
    sig_w = 2.5 * inch
    sig_x = PAGE_WIDTH * 0.55
    draw_signature(c, sig_x, y - 4, width=sig_w)
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    c.line(sig_x, y, sig_x + sig_w, y)
    label_font = font("Quicksand-Bold")
    c.setFont(label_font, 10)
    c.setFillColor(PINK_DEEPEST)
    label = "PREPARED BY"
    lw = c.stringWidth(label, label_font, 10)
    c.drawString(sig_x + (sig_w - lw) / 2, y - 14, label)


def _draw_footer(c: Canvas) -> None:
    ribbon_y = MARGIN + 36
    draw_ribbon_footer(c, ribbon_y, "THANK YOU FOR YOUR SUPPORT!")

    # Social handle in italic with small heart accents on either side
    handle_font = font("Quicksand-Italic")
    handle_size = 12
    handle_w = c.stringWidth(SOCIAL_INSTAGRAM, handle_font, handle_size)
    handle_baseline = ribbon_y - 22
    handle_x = (PAGE_WIDTH - handle_w) / 2
    c.setFont(handle_font, handle_size)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(handle_x, handle_baseline, SOCIAL_INSTAGRAM)

    # Phone below, italic, in soft ink
    phone_font = font("Quicksand-Italic")
    phone_size = 10
    phone_w = c.stringWidth(SOCIAL_PHONE, phone_font, phone_size)
    phone_baseline = handle_baseline - 16
    c.setFont(phone_font, phone_size)
    c.setFillColor(INK)
    c.drawString((PAGE_WIDTH - phone_w) / 2, phone_baseline, SOCIAL_PHONE)


def _scattered_hearts() -> list[tuple[float, float, float]]:
    """Hand-tuned ambient heart positions, kept clear of text zones."""
    return [
        (MARGIN + 70, PAGE_HEIGHT - MARGIN - 90, 5),
        (PAGE_WIDTH - MARGIN - 90, PAGE_HEIGHT * 0.62, 6),
        (PAGE_WIDTH * 0.18, PAGE_HEIGHT * 0.34, 5),
        (PAGE_WIDTH - MARGIN - 30, PAGE_HEIGHT * 0.40, 4),
        (MARGIN + 30, PAGE_HEIGHT * 0.16, 5),
    ]


def build_invoice_pdf(data: InvoiceRequest) -> bytes:
    register_fonts()

    buf = io.BytesIO()
    c = Canvas(buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    c.setTitle(f"Invoice – {data.client}")
    c.setAuthor("baba pet care")

    draw_background(c)
    draw_blush_band(c)
    draw_paw_corners(c)
    draw_scattered_hearts(c, _scattered_hearts())

    _draw_header(c)
    meta_bottom_y = _draw_meta_grid(c, data)

    table_top_y = meta_bottom_y - 20
    table_bottom_y = _draw_services_section(c, data, table_top_y)

    payment_y = max(table_bottom_y - 36, MARGIN + 150)
    _draw_payment(c, data, payment_y)

    sig_y = payment_y - 56
    _draw_prepared_by_block(c, sig_y)

    _draw_footer(c)

    # One last heart by the title for extra cuteness
    draw_heart(c, MARGIN + 200, PAGE_HEIGHT - MARGIN - 18, size=6, color=PINK_DEEP, alpha=0.7)

    c.showPage()
    c.save()
    return buf.getvalue()
