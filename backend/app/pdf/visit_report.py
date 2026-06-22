from __future__ import annotations

import base64
import io

from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

from ..schemas import DayEntry, VisitReportRequest
from .fonts import font, register_fonts
from .primitives import (
    draw_background,
    draw_blush_band,
    draw_checkbox,
    draw_heart,
    draw_heart_paw_icon,
    draw_paw_corners,
    draw_procedural_paw,
    draw_ribbon_footer,
    draw_rounded_card,
    draw_scattered_hearts,
    draw_sparkle,
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
    WHITE,
)

ACTIVITIES = ["Walk", "Play", "Feeding", "Brushing", "Bath", "Snuggles", "Outdoor"]

MOOD_LABELS: dict[str, str] = {
    "happy": "Happy",
    "playful": "Playful",
    "calm": "Calm",
    "tired": "Tired",
    "anxious": "Anxious",
}

FOOD_LABELS: dict[str, str] = {
    "well": "Ate Well",
    "some": "Ate Some",
    "skipped": "Skipped",
}

WATER_LABELS: dict[str, str] = {
    "well": "Drank Well",
    "little": "A Little",
    "not much": "Not Much",
}


# ── shared header ─────────────────────────────────────────────────────────────

def _draw_header(c: Canvas) -> None:
    title_font = font("Caveat-Bold")
    wordmark_font = font("Fredoka-Bold")
    subtitle_font = font("Quicksand-Italic")

    title_baseline = PAGE_HEIGHT - MARGIN - 50
    title_size = 72

    c.setFont(title_font, title_size)
    c.setFillColor(PINK_SOFT)
    c.drawString(MARGIN + 3, title_baseline - 3, "Visit Report")
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, title_baseline, "Visit Report")
    title_width = c.stringWidth("Visit Report", title_font, title_size)

    icon_size = 28
    icon_x = MARGIN + title_width + 10
    draw_heart_paw_icon(c, icon_x, title_baseline - 4, size=icon_size)

    draw_sparkle(c, icon_x + icon_size + 8, title_baseline + 28, size=5, color=PINK_DEEP, alpha=0.85)
    draw_sparkle(c, icon_x + icon_size + 22, title_baseline + 12, size=4, color=PINK_DEEPEST, alpha=0.75)

    right_edge = PAGE_WIDTH - MARGIN
    name_size = 40
    name_w = c.stringWidth(BUSINESS_NAME, wordmark_font, name_size)
    heart_gap, heart_size = 8, 12
    lockup_w = name_w + heart_gap + heart_size
    name_x = right_edge - lockup_w
    wordmark_baseline = PAGE_HEIGHT - MARGIN - 36

    c.setFont(wordmark_font, name_size)
    c.setFillColor(PINK_SOFT)
    c.drawString(name_x + 2, wordmark_baseline - 2, BUSINESS_NAME)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(name_x, wordmark_baseline, BUSINESS_NAME)

    heart_cx = name_x + name_w + heart_gap + heart_size / 2
    heart_cy = wordmark_baseline + name_size * 0.30
    draw_heart(c, heart_cx, heart_cy, size=heart_size, color=PINK_DEEPEST, alpha=1.0)

    subtitle_size = 11
    char_space = 1.4
    tag_w = c.stringWidth(BUSINESS_TAGLINE, subtitle_font, subtitle_size) + char_space * (len(BUSINESS_TAGLINE) - 1)
    subtitle_x = right_edge - tag_w
    subtitle_baseline = wordmark_baseline - 15
    text_obj = c.beginText(subtitle_x, subtitle_baseline)
    text_obj.setFont(subtitle_font, subtitle_size)
    text_obj.setCharSpace(char_space)
    text_obj.setFillColor(PINK_DEEP)
    text_obj.textOut(BUSINESS_TAGLINE)
    c.drawText(text_obj)
    # charSpace (Tc) persists across BT/ET blocks; reset it so subsequent text
    # isn't artificially widened, causing stringWidth-based wrap to fail.
    _reset = c.beginText(0, 0)
    _reset.setCharSpace(0)
    c.drawText(_reset)


def _draw_footer(c: Canvas) -> None:
    ribbon_y = MARGIN + 30
    draw_ribbon_footer(c, ribbon_y, "WITH LOVE FROM BABA PET CARE")
    handle_font = font("Quicksand-Italic")
    handle_size = 11
    handle_w = c.stringWidth(SOCIAL_INSTAGRAM, handle_font, handle_size)
    handle_y = ribbon_y - 20
    c.setFont(handle_font, handle_size)
    c.setFillColor(PINK_DEEPEST)
    c.drawString((PAGE_WIDTH - handle_w) / 2, handle_y, SOCIAL_INSTAGRAM)


# ── pet + date strip ──────────────────────────────────────────────────────────

def _draw_pet_strip(c: Canvas, pet_name: str, date_str: str, day_label: str | None = None) -> float:
    """Draws the pet name + date card. Returns the y coordinate at the bottom of the card."""
    name_font = font("Caveat-Bold")
    name_size = 36
    date_font = font("Caveat-Bold")
    date_size = 18

    date_parts = [date_str]
    if day_label:
        date_parts.append(f"· {day_label}")
    date_text = "  ".join(date_parts)

    name_w = c.stringWidth(pet_name, name_font, name_size)
    date_w = c.stringWidth(date_text, date_font, date_size)
    inner_w = PAGE_WIDTH - 2 * MARGIN - 32  # 16pt padding each side
    # Multiply by 1.1 to guard against TTF font metric underestimation
    two_line = (name_w + 16 + date_w) * 1.1 > inner_w

    strip_top = PAGE_HEIGHT - MARGIN - 130
    strip_h = 68 if two_line else 52
    draw_rounded_card(c, MARGIN, strip_top - strip_h, PAGE_WIDTH - 2 * MARGIN, strip_h,
                      fill_color=BLUSH, fill_alpha=0.7, radius=14)

    if two_line:
        # Name on top line, date left-aligned below
        c.setFont(name_font, name_size)
        c.setFillColor(PINK_DEEPEST)
        c.drawString(MARGIN + 16, strip_top - strip_h + 30, pet_name)
        c.setFont(date_font, date_size)
        c.drawString(MARGIN + 16, strip_top - strip_h + 10, date_text)
    else:
        # Name left, date pinned to right edge via drawRightString to avoid font-metric drift
        c.setFont(name_font, name_size)
        c.setFillColor(PINK_DEEPEST)
        c.drawString(MARGIN + 16, strip_top - strip_h + 14, pet_name)
        c.setFont(date_font, date_size)
        c.drawRightString(PAGE_WIDTH - MARGIN - 16, strip_top - strip_h + 18, date_text)

    return strip_top - strip_h


# ── activities ────────────────────────────────────────────────────────────────

def _draw_activities(c: Canvas, checked: list[str], top_y: float) -> float:
    """Two-column checkbox grid. Returns y of the bottom of the section."""
    section_label_font = font("Quicksand-Bold")
    body_font = font("Fredoka-Bold")

    c.setFont(section_label_font, 11)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, top_y, "Activities")

    y = top_y - 20
    col_w = (PAGE_WIDTH - 2 * MARGIN) / 2
    checked_set = {a.lower() for a in checked}

    for i, activity in enumerate(ACTIVITIES):
        col = i % 2
        row = i // 2
        x = MARGIN + col * col_w
        item_y = y - row * 22

        is_checked = activity.lower() in checked_set
        draw_checkbox(c, x, item_y - 1, size=12, checked=is_checked)
        c.setFont(body_font, 13)
        c.setFillColor(PINK_DEEPEST if is_checked else INK)
        c.setFillAlpha(1.0 if is_checked else 0.4)
        c.drawString(x + 20, item_y, activity)
        c.setFillAlpha(1.0)

    rows = (len(ACTIVITIES) + 1) // 2
    return y - rows * 22 - 8


# ── care row ──────────────────────────────────────────────────────────────────

_PILL_ICON_SIZE = 13  # visual bounding size for all care icons
_PILL_PAD_H = 16      # horizontal padding — increase for longer-looking pills
_PILL_PAD_V = 7
_PILL_LABEL_SIZE = 10
_PILL_VALUE_SIZE = 13
_PILL_GAP = 7         # gap between label and value text


def _pill_width(c: Canvas, label: str, value: str, icon: str = "") -> float:
    """Returns the width a pill would be drawn at, without drawing it."""
    icon_slot = (_PILL_ICON_SIZE + 5) if icon else 0
    label_w = c.stringWidth(label, font("Quicksand-Bold"), _PILL_LABEL_SIZE)
    value_w = c.stringWidth(value, font("Fredoka-Bold"),   _PILL_VALUE_SIZE)
    return icon_slot + label_w + _PILL_GAP + value_w + 2 * _PILL_PAD_H


def _draw_pill(c: Canvas, cx: float, cy: float, label: str, value: str, icon: str = "") -> None:
    """Draws a labeled pill with an optional leading icon."""
    label_font = font("Quicksand-Bold")
    value_font = font("Fredoka-Bold")

    icon_slot = (_PILL_ICON_SIZE + 5) if icon else 0

    label_w = c.stringWidth(label, label_font, _PILL_LABEL_SIZE)
    value_w = c.stringWidth(value, value_font, _PILL_VALUE_SIZE)
    pill_w = icon_slot + label_w + _PILL_GAP + value_w + 2 * _PILL_PAD_H
    pill_h = _PILL_VALUE_SIZE + 2 * _PILL_PAD_V

    x = cx - pill_w / 2
    y = cy - pill_h / 2

    c.saveState()
    c.setFillColor(BLUSH)
    c.setFillAlpha(0.9)
    c.setStrokeColor(PINK_DEEP)
    c.setLineWidth(0.8)
    c.roundRect(x, y, pill_w, pill_h, radius=pill_h / 2, fill=1, stroke=1)
    c.restoreState()

    if icon:
        icon_cx = x + _PILL_PAD_H + _PILL_ICON_SIZE / 2
        icon_cy = y + pill_h / 2
        s = _PILL_ICON_SIZE
        if icon == "heart":
            draw_heart(c, icon_cx, icon_cy, size=s, color=PINK_DEEPEST, alpha=0.85)
        elif icon == "sparkle":
            draw_sparkle(c, icon_cx, icon_cy, size=s / 2, color=PINK_DEEP, alpha=0.9)
        elif icon == "paw":
            draw_procedural_paw(c, icon_cx - s / 2, icon_cy - s / 2, s,
                                color=PINK_DEEPEST, alpha=0.8)

    text_x = x + _PILL_PAD_H + icon_slot
    text_baseline = y + _PILL_PAD_V
    c.setFont(label_font, _PILL_LABEL_SIZE)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(text_x, text_baseline + (_PILL_VALUE_SIZE - _PILL_LABEL_SIZE) / 2 + 1, label)
    c.setFont(value_font, _PILL_VALUE_SIZE)
    c.setFillColor(INK)
    c.drawString(text_x + label_w + _PILL_GAP, text_baseline, value)


def _draw_care_row(
    c: Canvas,
    food_level: str,
    water_level: str,
    pee_count: int,
    poop_count: int,
    top_y: float,
) -> float:
    """Draws the food / water / bathroom care row. Returns bottom y."""
    c.setFont(font("Quicksand-Bold"), 11)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, top_y, "Care")

    pills = [
        ("Food",  FOOD_LABELS.get(food_level, food_level),   "heart"),
        ("Water", WATER_LABELS.get(water_level, water_level), "sparkle"),
        ("Pee",   str(pee_count),                             "paw"),
        ("Poop",  str(poop_count),                            "paw"),
    ]
    pill_gap = 10
    widths = [_pill_width(c, label, value, icon) for label, value, icon in pills]
    total_w = sum(widths) + pill_gap * (len(pills) - 1)
    x = (PAGE_WIDTH - total_w) / 2
    pill_y = top_y - 22
    pill_h = _PILL_VALUE_SIZE + 2 * _PILL_PAD_V

    for (label, value, icon), pw in zip(pills, widths):
        _draw_pill(c, x + pw / 2, pill_y, label, value, icon)
        x += pw + pill_gap

    return pill_y - pill_h / 2 - 10


# ── mood badge ────────────────────────────────────────────────────────────────

def _draw_mood(c: Canvas, mood: str, top_y: float) -> float:
    """Centered mood badge with hearts and sparkles. Returns bottom y."""
    section_label_font = font("Quicksand-Bold")
    name_font = font("Caveat-Bold")

    c.setFont(section_label_font, 11)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, top_y, "Mood")

    label = MOOD_LABELS.get(mood, mood.capitalize())
    badge_w, badge_h = 220, 54
    badge_x = (PAGE_WIDTH - badge_w) / 2
    badge_y = top_y - badge_h - 8

    # Soft blush halo behind badge
    c.saveState()
    c.setFillColor(PINK_SOFT)
    c.setFillAlpha(0.35)
    c.roundRect(badge_x - 6, badge_y - 4, badge_w + 12, badge_h + 8, radius=(badge_h + 8) / 2, fill=1, stroke=0)
    c.restoreState()

    # Main badge
    c.saveState()
    c.setFillColor(PINK_DEEPEST)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, radius=badge_h / 2, fill=1, stroke=0)
    c.restoreState()

    # Mood text
    text_size = 30
    c.setFont(name_font, text_size)
    c.setFillColor(CREAM)
    lw = c.stringWidth(label, name_font, text_size)
    c.drawString((PAGE_WIDTH - lw) / 2, badge_y + (badge_h - text_size) / 2 + 6, label)

    # Hearts pinned to badge ends (won't overlap text)
    heart_y = badge_y + badge_h / 2 + 2
    draw_heart(c, badge_x + 22, heart_y, size=9, color=CREAM, alpha=0.55)
    draw_heart(c, badge_x + badge_w - 22, heart_y, size=9, color=CREAM, alpha=0.55)

    # Sparkles outside
    draw_sparkle(c, badge_x - 16, badge_y + badge_h * 0.7, size=5, color=PINK_DEEP, alpha=0.8)
    draw_sparkle(c, badge_x - 8,  badge_y + badge_h * 0.25, size=3, color=PINK_DEEPEST, alpha=0.65)
    draw_sparkle(c, badge_x + badge_w + 16, badge_y + badge_h * 0.7, size=5, color=PINK_DEEP, alpha=0.8)
    draw_sparkle(c, badge_x + badge_w + 8,  badge_y + badge_h * 0.25, size=3, color=PINK_DEEPEST, alpha=0.65)

    return badge_y - 14


# ── photo strip ───────────────────────────────────────────────────────────────

_FOOTER_SAFE_Y = MARGIN + 70  # nothing should be drawn below this line


def _draw_photos(c: Canvas, photos: list[str], top_y: float, bottom_y: float | None = None) -> float:
    """Embeds up to 3 base64-encoded photos filling available space. Returns bottom y."""
    if not photos:
        return top_y

    if bottom_y is None:
        bottom_y = _FOOTER_SAFE_Y

    label_h = 14
    available_h = top_y - label_h - bottom_y
    if available_h < 40:
        return top_y

    section_label_font = font("Quicksand-Bold")
    c.setFont(section_label_font, 11)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, top_y, "Photos")

    usable = PAGE_WIDTH - 2 * MARGIN
    n = min(len(photos), 3)
    gap = 8
    photo_w = (usable - gap * (n - 1)) / n
    # Fill available height; preserveAspectRatio=True handles natural scaling
    photo_h = min(photo_w * 0.75, available_h)
    strip_y = top_y - photo_h - label_h

    for i, b64str in enumerate(photos[:3]):
        x = MARGIN + i * (photo_w + gap)
        try:
            img_bytes = base64.b64decode(b64str)
            img_reader = ImageReader(io.BytesIO(img_bytes))
            # Rounded mask effect via clipping
            c.saveState()
            p = c.beginPath()
            r = 8
            p.moveTo(x + r, strip_y)
            p.lineTo(x + photo_w - r, strip_y)
            p.curveTo(x + photo_w, strip_y, x + photo_w, strip_y, x + photo_w, strip_y + r)
            p.lineTo(x + photo_w, strip_y + photo_h - r)
            p.curveTo(x + photo_w, strip_y + photo_h, x + photo_w, strip_y + photo_h,
                      x + photo_w - r, strip_y + photo_h)
            p.lineTo(x + r, strip_y + photo_h)
            p.curveTo(x, strip_y + photo_h, x, strip_y + photo_h, x, strip_y + photo_h - r)
            p.lineTo(x, strip_y + r)
            p.curveTo(x, strip_y, x, strip_y, x + r, strip_y)
            p.close()
            c.clipPath(p, stroke=0, fill=0)
            c.drawImage(img_reader, x, strip_y, width=photo_w, height=photo_h,
                        preserveAspectRatio=True, anchor="c")
            c.restoreState()
            # Border
            c.saveState()
            c.setStrokeColor(PINK_SOFT)
            c.setLineWidth(0.8)
            c.roundRect(x, strip_y, photo_w, photo_h, radius=r, fill=0, stroke=1)
            c.restoreState()
        except Exception:
            # If image fails, draw placeholder box
            c.saveState()
            c.setFillColor(BLUSH)
            c.setFillAlpha(0.5)
            c.roundRect(x, strip_y, photo_w, photo_h, radius=8, fill=1, stroke=0)
            c.restoreState()

    return strip_y - 12


# ── notes box ─────────────────────────────────────────────────────────────────

_NOTES_FONT_SIZE = 11
_NOTES_LINE_HEIGHT = 16
_NOTES_INNER_PAD_H = 20
# Small buffer for minor TTF metric imprecision; canvas clipping is the hard backstop.
_WRAP_SAFETY = 8


def _wrap_notes(c: Canvas, notes: str) -> list[str]:
    """Word-wrap notes text, returning one string per line."""
    body_font = font("Quicksand")
    max_w = PAGE_WIDTH - 2 * MARGIN - 2 * _NOTES_INNER_PAD_H - _WRAP_SAFETY
    # Set font on canvas first — some ReportLab builds need this for accurate TTF measurement
    c.setFont(body_font, _NOTES_FONT_SIZE)
    lines: list[str] = []
    current: list[str] = []
    for word in notes.split():
        trial = " ".join(current + [word])
        if c.stringWidth(trial, body_font, _NOTES_FONT_SIZE) <= max_w:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def _notes_total_height(c: Canvas, notes: str) -> float:
    """Returns the total vertical space _draw_notes would consume (label + box + gap)."""
    if not notes.strip():
        return 0
    n = len(_wrap_notes(c, notes))
    # 10 (label-to-box gap) + 14 (box top pad) + n*line_height + 8 (box bottom pad) + 8 (return gap)
    return 10 + 14 + n * _NOTES_LINE_HEIGHT + 8 + 8


def _draw_notes(c: Canvas, notes: str, top_y: float, max_available_h: float | None = None) -> float:
    """Rounded notes card that grows to fit text. Returns bottom y."""
    if not notes.strip():
        return top_y

    section_label_font = font("Quicksand-Bold")
    body_font = font("Quicksand")
    font_size = _NOTES_FONT_SIZE
    line_height = _NOTES_LINE_HEIGHT
    text_x = MARGIN + _NOTES_INNER_PAD_H

    lines = _wrap_notes(c, notes)

    # Box: 14pt from label baseline to box top, 8pt below last text baseline
    box_top = top_y - 10
    first_text_y = box_top - 14
    last_text_y = first_text_y - (len(lines) - 1) * line_height
    box_h = box_top - (last_text_y - 8)
    if max_available_h is not None:
        box_h = min(box_h, max_available_h)
    box_y = box_top - box_h

    c.setFont(section_label_font, font_size)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(MARGIN, top_y, "Notes")

    draw_rounded_card(c, MARGIN, box_y, PAGE_WIDTH - 2 * MARGIN, box_h,
                      fill_color=BLUSH, fill_alpha=0.45, radius=12)

    # Clip to box so any font-metric slip can't bleed past the right edge
    c.saveState()
    clip = c.beginPath()
    clip.rect(MARGIN + 2, box_y, PAGE_WIDTH - 2 * MARGIN - 4, box_h)
    c.clipPath(clip, stroke=0, fill=0)

    c.setFont(body_font, font_size)
    c.setFillColor(INK)
    text_y = first_text_y
    for line_text in lines:
        if text_y < box_y + 8:
            break
        c.drawString(text_x, text_y, line_text)
        text_y -= line_height

    c.restoreState()
    return box_y - 8


# ── single-visit page ─────────────────────────────────────────────────────────

def _draw_single_page(c: Canvas, data: VisitReportRequest) -> None:
    draw_background(c)
    draw_blush_band(c)
    draw_paw_corners(c)
    draw_scattered_hearts(c, [
        (MARGIN + 60, PAGE_HEIGHT - MARGIN - 85, 5),
        (PAGE_WIDTH - MARGIN - 80, PAGE_HEIGHT * 0.60, 5),
        (PAGE_WIDTH * 0.18, PAGE_HEIGHT * 0.32, 4),
        (PAGE_WIDTH - MARGIN - 25, PAGE_HEIGHT * 0.38, 4),
        (MARGIN + 25, PAGE_HEIGHT * 0.14, 5),
    ])

    _draw_header(c)

    y = _draw_pet_strip(c, data.pet_name, data.service_date or "", None)
    y -= 18

    y = _draw_activities(c, data.activities, y)
    y -= 14

    y = _draw_care_row(c, data.food_level or "well", data.water_level or "well",
                       data.pee_count, data.poop_count, y)
    y -= 14

    y = _draw_mood(c, data.mood or "happy", y)
    y -= 14

    notes_max = y - _FOOTER_SAFE_Y - 10
    if notes_max > 30:
        _draw_notes(c, data.notes, y, max_available_h=notes_max)

    _draw_footer(c)


# ── multi-day pages ───────────────────────────────────────────────────────────

def _draw_day_card(c: Canvas, day: DayEntry, card_x: float, card_y: float, card_w: float) -> None:
    """Draws a compact day card at the given position."""
    bold_font = font("Quicksand-Bold")
    body_font = font("Quicksand")
    card_h = 120

    draw_rounded_card(c, card_x, card_y - card_h, card_w, card_h,
                      fill_color=BLUSH, fill_alpha=0.55, radius=12)

    # Day header
    date_label = day.day_label or day.date
    c.setFont(bold_font, 12)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(card_x + 10, card_y - 18, date_label)

    # Date (if day_label was set)
    if day.day_label:
        c.setFont(body_font, 9)
        c.setFillColor(INK)
        c.drawString(card_x + 10, card_y - 30, day.date)

    # Activities in a compact row
    checked_set = {a.lower() for a in day.activities}
    act_x = card_x + 10
    act_y = card_y - 46
    for act in ACTIVITIES:
        label = act
        is_checked = act.lower() in checked_set
        c.setFont(body_font, 8)
        c.setFillColor(PINK_DEEPEST if is_checked else INK)
        c.setFillAlpha(1.0 if is_checked else 0.35)
        text_w = c.stringWidth(label, body_font, 8)
        if act_x + text_w + 4 > card_x + card_w - 10:
            act_x = card_x + 10
            act_y -= 12
        c.drawString(act_x, act_y, label)
        act_x += text_w + 10
    c.setFillAlpha(1.0)

    # Care summary row
    care_y = card_y - 72
    items = [
        f"Food: {FOOD_LABELS.get(day.food_level, day.food_level)}",
        f"Water: {WATER_LABELS.get(day.water_level, day.water_level)}",
        f"Pee: {day.pee_count}",
        f"Poop: {day.poop_count}",
    ]
    c.setFont(body_font, 9)
    c.setFillColor(INK)
    item_x = card_x + 10
    for item in items:
        c.drawString(item_x, care_y, item)
        item_x += c.stringWidth(item, body_font, 9) + 14

    # Mood
    mood_label = MOOD_LABELS.get(day.mood, day.mood.capitalize())
    c.setFont(bold_font, 10)
    c.setFillColor(PINK_DEEPEST)
    c.drawString(card_x + 10, care_y - 14, f"Mood: {mood_label}")

    # Notes — word-wrapped, clamped to card bottom
    if day.notes.strip():
        c.setFont(body_font, 9)
        c.setFillColor(INK)
        max_w = card_w - 20 - _WRAP_SAFETY
        note_bottom = card_y - card_h + 6
        text_y = care_y - 26
        line_h = 11
        words = day.notes.split()
        line: list[str] = []
        for word in words:
            trial = " ".join(line + [word])
            if c.stringWidth(trial, body_font, 9) <= max_w:
                line.append(word)
            else:
                if line:
                    if text_y < note_bottom:
                        break
                    c.drawString(card_x + 10, text_y, " ".join(line))
                    text_y -= line_h
                line = [word]
        if line and text_y >= note_bottom:
            c.drawString(card_x + 10, text_y, " ".join(line))


def _draw_cover_page(c: Canvas, data: VisitReportRequest) -> None:
    draw_background(c)
    draw_blush_band(c)
    draw_paw_corners(c)
    draw_scattered_hearts(c, [
        (MARGIN + 60, PAGE_HEIGHT - MARGIN - 85, 5),
        (PAGE_WIDTH - MARGIN - 80, PAGE_HEIGHT * 0.55, 5),
        (MARGIN + 25, PAGE_HEIGHT * 0.14, 5),
    ])

    _draw_header(c)

    # Stay summary strip
    dates = [d.date for d in data.days if d.date]
    date_range = f"{dates[0]} – {dates[-1]}" if len(dates) > 1 else (dates[0] if dates else "")
    y = _draw_pet_strip(c, data.pet_name, date_range, f"{len(data.days)}-day stay")
    y -= 24

    # Photos fill all available space above the footer
    notes_h_reserve = _notes_total_height(c, data.overall_notes or "")
    y = _draw_photos(c, data.photos, y, bottom_y=_FOOTER_SAFE_Y + notes_h_reserve)
    y -= 16

    # Overall notes
    notes_max = y - _FOOTER_SAFE_Y - 10
    if notes_max > 30:
        _draw_notes(c, data.overall_notes, y, max_available_h=notes_max)

    _draw_footer(c)


def _draw_days_pages(c: Canvas, days: list[DayEntry]) -> None:
    """Draws day cards, 5 per page in a 1-column layout."""
    CARDS_PER_PAGE = 5
    CARD_H = 120
    CARD_GAP = 10
    card_w = PAGE_WIDTH - 2 * MARGIN

    for page_start in range(0, len(days), CARDS_PER_PAGE):
        c.showPage()
        draw_background(c)
        draw_paw_corners(c)

        page_days = days[page_start:page_start + CARDS_PER_PAGE]

        for slot, day in enumerate(page_days):
            card_top = PAGE_HEIGHT - MARGIN - 20 - slot * (CARD_H + CARD_GAP)
            _draw_day_card(c, day, MARGIN, card_top, card_w)

        # Small footer on day pages
        c.setFont(font("Quicksand-Italic"), 9)
        c.setFillColor(PINK_DEEP)
        footer_text = SOCIAL_INSTAGRAM
        fw = c.stringWidth(footer_text, font("Quicksand-Italic"), 9)
        c.drawString((PAGE_WIDTH - fw) / 2, MARGIN + 8, footer_text)


# ── public entry point ────────────────────────────────────────────────────────

def build_visit_report_pdf(data: VisitReportRequest) -> bytes:
    register_fonts()

    buf = io.BytesIO()
    c = Canvas(buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    c.setTitle(f"Visit Report – {data.pet_name}")
    c.setAuthor("baba pet care")

    if data.mode == "single":
        _draw_single_page(c, data)
    else:
        _draw_cover_page(c, data)
        _draw_days_pages(c, data.days)

    c.showPage()
    c.save()
    return buf.getvalue()
