from __future__ import annotations

from datetime import date

from reportlab.pdfgen.canvas import Canvas

from .fonts import font
from .theme import (
    BLUSH,
    CREAM,
    INK,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    PAW_PATH,
    PINK_DEEP,
    PINK_DEEPEST,
    PINK_SOFT,
    SIGNATURE_PATH,
)


def format_age(birthday: date, today: date | None = None) -> str:
    """Render a pet age string from a birthday.

    Years are reported alone when months == 0; otherwise as "Ny Mmo".
    Under 1 year, returns "Nmo". Under 1 month, returns "<1mo".
    """
    if today is None:
        today = date.today()
    years = today.year - birthday.year
    months = today.month - birthday.month
    if today.day < birthday.day:
        months -= 1
    if months < 0:
        years -= 1
        months += 12
    if years < 0:
        return "<1mo"
    if years == 0:
        if months <= 0:
            return "<1mo"
        return f"{months}mo"
    if months == 0:
        return f"{years}y"
    return f"{years}y {months}mo"


def draw_heart(
    c: Canvas,
    cx: float,
    cy: float,
    size: float = 10,
    color=PINK_DEEPEST,
    alpha: float = 1.0,
) -> None:
    """Smooth filled heart centered at (cx, cy), drawn as 4 cubic Beziers."""
    c.saveState()
    c.setFillAlpha(alpha)
    c.setFillColor(color)

    s = size
    p = c.beginPath()
    # Top center dip
    p.moveTo(cx, cy + 0.25 * s)
    # Left lobe out to the leftmost point
    p.curveTo(
        cx - 0.15 * s, cy + 0.55 * s,
        cx - 0.55 * s, cy + 0.35 * s,
        cx - 0.50 * s, cy + 0.05 * s,
    )
    # Down the left side to the bottom point
    p.curveTo(
        cx - 0.50 * s, cy - 0.20 * s,
        cx - 0.10 * s, cy - 0.40 * s,
        cx, cy - 0.55 * s,
    )
    # Up the right side
    p.curveTo(
        cx + 0.10 * s, cy - 0.40 * s,
        cx + 0.50 * s, cy - 0.20 * s,
        cx + 0.50 * s, cy + 0.05 * s,
    )
    # Right lobe back to the top dip
    p.curveTo(
        cx + 0.55 * s, cy + 0.35 * s,
        cx + 0.15 * s, cy + 0.55 * s,
        cx, cy + 0.25 * s,
    )
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


def draw_sparkle(
    c: Canvas,
    cx: float,
    cy: float,
    size: float = 6,
    color=PINK_DEEPEST,
    alpha: float = 0.8,
) -> None:
    """Four-point sparkle/star centered at (cx, cy)."""
    c.saveState()
    c.setFillAlpha(alpha)
    c.setFillColor(color)
    waist = size * 0.22
    p = c.beginPath()
    p.moveTo(cx, cy + size)
    p.lineTo(cx + waist, cy + waist)
    p.lineTo(cx + size, cy)
    p.lineTo(cx + waist, cy - waist)
    p.lineTo(cx, cy - size)
    p.lineTo(cx - waist, cy - waist)
    p.lineTo(cx - size, cy)
    p.lineTo(cx - waist, cy + waist)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


def draw_procedural_paw(
    c: Canvas,
    x: float,
    y: float,
    size: float,
    color=PINK_DEEP,
    alpha: float = 0.28,
    rotation: float = 0,
) -> None:
    """Cute paw print drawn from ovals — 1 pad + 4 toes. (x, y) is bottom-left."""
    c.saveState()
    c.setFillColor(color)
    c.setFillAlpha(alpha)
    # Rotate around the paw's center
    c.translate(x + size / 2, y + size / 2)
    if rotation:
        c.rotate(rotation)
    c.translate(-size / 2, -size / 2)

    # Main pad: rounded shape (oval) near the bottom-center
    pad_w = size * 0.55
    pad_h = size * 0.42
    pad_x = (size - pad_w) / 2
    pad_y = size * 0.05
    c.ellipse(pad_x, pad_y, pad_x + pad_w, pad_y + pad_h, stroke=0, fill=1)

    # Toes — vertical ovals, four with clear gaps between them.
    # Each toe described as (center_x_frac, center_y_frac, half_width_frac, half_height_frac)
    toes = [
        # Outer-left (lower, slimmer)
        (0.13, 0.55, 0.09, 0.11),
        # Inner-left (higher)
        (0.36, 0.72, 0.10, 0.12),
        # Inner-right (higher) — clear gap from inner-left thanks to centers 0.36 vs 0.64
        (0.64, 0.72, 0.10, 0.12),
        # Outer-right (lower, slimmer)
        (0.87, 0.55, 0.09, 0.11),
    ]
    for cx_frac, cy_frac, hw_frac, hh_frac in toes:
        cx = cx_frac * size
        cy = cy_frac * size
        hw = hw_frac * size
        hh = hh_frac * size
        c.ellipse(cx - hw, cy - hh, cx + hw, cy + hh, stroke=0, fill=1)
    c.restoreState()


def draw_dotted_line(
    c: Canvas,
    x1: float,
    y: float,
    x2: float,
    color=PINK_DEEP,
    line_width: float = 0.7,
    dash: tuple[float, float] = (1.2, 2.0),
) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(line_width)
    c.setDash(dash[0], dash[1])
    c.line(x1, y, x2, y)
    c.setDash()  # reset
    c.restoreState()


def draw_label_underline(
    c: Canvas,
    x: float,
    y: float,
    label: str,
    value: str,
    line_width: float,
    label_font: str | None = None,
    label_size: float = 11,
    value_font: str | None = None,
    value_size: float = 11,
    label_color=PINK_DEEPEST,
    value_color=INK,
    label_gap: float = 20,
    underline_shift: float = 0,
) -> float:
    label_font = label_font or font("Quicksand-Bold")
    value_font = value_font or font("Quicksand")

    c.setFont(label_font, label_size)
    c.setFillColor(label_color)
    c.drawString(x, y, label)
    label_w = c.stringWidth(label, label_font, label_size)

    value_x = x + label_w + label_gap
    c.setFont(value_font, value_size)
    c.setFillColor(value_color)
    c.drawString(value_x, y, value)

    underline_start = value_x + underline_shift
    underline_end = value_x + line_width + underline_shift
    draw_dotted_line(c, underline_start, y - 2.5, underline_end, color=PINK_DEEP)
    return underline_end


def draw_value_only_underline(
    c: Canvas,
    x: float,
    y: float,
    value: str,
    line_width: float,
    value_font: str | None = None,
    value_size: float = 11,
    value_color=INK,
) -> None:
    """Renders a value (no label) with a dotted underline beneath it.

    Useful for stacking additional contact_info lines under the label-row above.
    """
    value_font = value_font or font("Quicksand")
    c.setFont(value_font, value_size)
    c.setFillColor(value_color)
    c.drawString(x, y, value)
    draw_dotted_line(c, x, y - 2.5, x + line_width, color=PINK_DEEP)


def draw_checkbox(c: Canvas, x: float, y: float, size: float = 11, checked: bool = False) -> None:
    """Rounded pink checkbox with a chunky ✓ when checked."""
    c.setStrokeColor(PINK_DEEPEST)
    c.setLineWidth(1.2)
    c.setFillColor(CREAM)
    c.roundRect(x, y, size, size, radius=2.2, fill=1, stroke=1)
    if checked:
        c.saveState()
        c.setStrokeColor(PINK_DEEPEST)
        c.setLineWidth(2.0)
        c.setLineCap(1)   # round end caps
        c.setLineJoin(1)  # round joins at vertices
        p = c.beginPath()
        p.moveTo(x + 0.18 * size, y + 0.55 * size)
        p.lineTo(x + 0.42 * size, y + 0.22 * size)
        p.lineTo(x + 0.92 * size, y + 0.92 * size)
        c.drawPath(p, stroke=1, fill=0)
        c.restoreState()


def draw_paw_corners(c: Canvas) -> None:
    """Faded pink paws at the 4 corners + scattered small accents.

    Uses the PNG at PAW_PATH if present; otherwise draws procedural paws.
    """
    big = 1.05 * 72  # ~1.05"
    placements_big = [
        (-big * 0.05, PAGE_HEIGHT - big * 1.05, -18),     # top-left
        (PAGE_WIDTH - big * 0.95, PAGE_HEIGHT - big * 0.85, 22),  # top-right
        (-big * 0.05, big * 0.05, -28),                   # bottom-left
        (PAGE_WIDTH - big * 0.95, -big * 0.05, 32),       # bottom-right
    ]

    if PAW_PATH.is_file():
        for x, y, rot in placements_big:
            c.saveState()
            c.setFillAlpha(0.22)
            c.translate(x + big / 2, y + big / 2)
            c.rotate(rot)
            c.translate(-big / 2, -big / 2)
            c.drawImage(
                str(PAW_PATH),
                0,
                0,
                width=big,
                height=big,
                mask="auto",
                preserveAspectRatio=True,
            )
            c.restoreState()
    else:
        for x, y, rot in placements_big:
            draw_procedural_paw(c, x, y, big, color=PINK_DEEP, alpha=0.20, rotation=rot)

    # Small accent paws scattered along edges (always procedural so they layer over PNGs too)
    small = 0.45 * 72
    accents = [
        (PAGE_WIDTH * 0.36, PAGE_HEIGHT - 1.1 * 72, 15),
        (PAGE_WIDTH * 0.06, PAGE_HEIGHT * 0.55, -25),
        (PAGE_WIDTH - 0.7 * 72, PAGE_HEIGHT * 0.42, 12),
        (PAGE_WIDTH * 0.78, PAGE_HEIGHT * 0.18, -20),
    ]
    for x, y, rot in accents:
        draw_procedural_paw(c, x, y, small, color=PINK_SOFT, alpha=0.45, rotation=rot)


def draw_signature(c: Canvas, x: float, y: float, width: float = 1.7 * 72) -> None:
    """Renders the signature image if present; otherwise a handwritten-font placeholder."""
    if SIGNATURE_PATH.is_file():
        c.drawImage(
            str(SIGNATURE_PATH),
            x,
            y,
            width=width,
            preserveAspectRatio=True,
            mask="auto",
        )
        return
    c.setFont(font("Signature"), 26)
    c.setFillColor(INK)
    c.drawString(x + 6, y + 4, "Wutt Hmone Kyi")


def draw_heart_paw_icon(c: Canvas, x: float, y: float, size: float = 20) -> None:
    """Heart with a tiny paw silhouette tucked into its corner."""
    cx = x + size / 2
    cy = y + size / 2
    draw_heart(c, cx, cy, size=size, color=PINK_DEEPEST, alpha=1.0)
    # Tiny paw nestled in the upper-right of the heart, in soft pink
    paw_size = size * 0.45
    draw_procedural_paw(
        c,
        x + size * 0.45,
        y + size * 0.42,
        paw_size,
        color=CREAM,
        alpha=0.95,
        rotation=15,
    )


def draw_background(c: Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)


def draw_blush_band(c: Canvas) -> None:
    """Very faint pink rounded panel in the upper page area for a tinted header feel."""
    c.saveState()
    c.setFillColor(BLUSH)
    c.setFillAlpha(0.55)
    band_h = 1.3 * 72
    c.roundRect(
        0.25 * 72,
        PAGE_HEIGHT - band_h - 0.25 * 72,
        PAGE_WIDTH - 0.5 * 72,
        band_h,
        radius=18,
        fill=1,
        stroke=0,
    )
    c.restoreState()


def draw_rounded_card(
    c: Canvas,
    x: float,
    y: float,
    width: float,
    height: float,
    fill_color=BLUSH,
    fill_alpha: float = 0.6,
    radius: float = 12,
    stroke_color=PINK_SOFT,
    stroke_width: float = 0.8,
) -> None:
    """Soft rounded card background. Stroked for definition."""
    c.saveState()
    c.setFillColor(fill_color)
    c.setFillAlpha(fill_alpha)
    c.setStrokeColor(stroke_color)
    c.setLineWidth(stroke_width)
    c.roundRect(x, y, width, height, radius=radius, fill=1, stroke=1)
    c.restoreState()


def draw_total_badge(
    c: Canvas,
    cx: float,
    cy: float,
    width: float,
    height: float,
    label: str,
    value: str,
) -> None:
    """Pill-shaped Total badge centered at (cx, cy)."""
    c.saveState()
    radius = height / 2
    x = cx - width / 2
    y = cy - height / 2
    c.setFillColor(PINK_DEEPEST)
    c.roundRect(x, y, width, height, radius=radius, fill=1, stroke=0)

    label_font = font("Quicksand-Bold")
    label_size = 11
    value_font = font("Quicksand-Bold")
    value_size = 13

    label_w = c.stringWidth(label, label_font, label_size)
    value_w = c.stringWidth(value, value_font, value_size)
    gap = 10
    block_w = label_w + gap + value_w
    text_x = cx - block_w / 2
    text_y = cy - 4

    c.setFillColor(CREAM)
    c.setFont(label_font, label_size)
    c.drawString(text_x, text_y, label)
    c.setFont(value_font, value_size)
    c.drawString(text_x + label_w + gap, text_y, value)
    c.restoreState()


def draw_ribbon_footer(c: Canvas, y: float, text: str, height: float = 34) -> None:
    """Clean pink banner with a subtle cream inner border."""
    c.saveState()

    # Main ribbon body
    c.setFillColor(PINK_DEEP)
    c.rect(0, y, PAGE_WIDTH, height, fill=1, stroke=0)

    # Subtle inner cream stroke for definition
    inset = 4
    c.setStrokeColor(CREAM)
    c.setStrokeAlpha(0.55)
    c.setLineWidth(0.7)
    c.line(inset, y + height - inset, PAGE_WIDTH - inset, y + height - inset)
    c.line(inset, y + inset, PAGE_WIDTH - inset, y + inset)
    c.setStrokeAlpha(1.0)

    # Ribbon text — properly vertically centered using cap-height math
    label_font = font("Quicksand-Bold")
    text_size = 14
    text_w = c.stringWidth(text, label_font, text_size)
    cap_height = text_size * 0.72
    text_baseline_y = y + (height - cap_height) / 2
    c.setFillColor(CREAM)
    c.setFont(label_font, text_size)
    c.drawString((PAGE_WIDTH - text_w) / 2, text_baseline_y, text)

    c.restoreState()


def draw_scattered_hearts(c: Canvas, seed_points: list[tuple[float, float, float]]) -> None:
    """Scatter tiny pale hearts. Each seed_point: (x, y, size)."""
    for x, y, size in seed_points:
        draw_heart(c, x, y, size=size, color=PINK_DEEP, alpha=0.35)
