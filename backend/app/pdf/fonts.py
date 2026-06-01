from __future__ import annotations

import logging

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from .theme import FONT_DIR


log = logging.getLogger(__name__)

# logical_name -> (candidate_filenames_in_priority_order, fallback_built_in_font)
_FONT_MAP: dict[str, tuple[tuple[str, ...], str]] = {
    "Caveat-Bold": (("Caveat-Bold.ttf", "Caveat-Regular.ttf"), "Times-BoldItalic"),
    "Fredoka-Bold": (("Fredoka-Bold.ttf",), "Times-BoldItalic"),
    "Quicksand": (("Quicksand-Regular.ttf",), "Helvetica"),
    "Quicksand-Bold": (("Quicksand-Bold.ttf",), "Helvetica-Bold"),
    "Quicksand-Italic": (("Quicksand-Italic.ttf",), "Helvetica-Oblique"),
    "Signature": (("Signature.ttf", "Caveat-Regular.ttf"), "Times-BoldItalic"),
}

_resolved: dict[str, str] = {}


def register_fonts() -> dict[str, str]:
    if _resolved:
        return _resolved
    log.info("Font resolution starting. FONT_DIR=%s exists=%s", FONT_DIR, FONT_DIR.is_dir())
    for logical, (candidates, fallback) in _FONT_MAP.items():
        resolved_name = fallback
        for filename in candidates:
            path = FONT_DIR / filename
            if not path.is_file():
                continue
            try:
                # Reuse if another logical name already registered the same file
                registered = f"{logical}__{filename}"
                pdfmetrics.registerFont(TTFont(registered, str(path)))
                resolved_name = registered
                log.info("Registered %s from %s as %s", logical, path, registered)
                break
            except Exception:
                log.exception("Failed to register %s from %s; trying next candidate.", logical, path)
        if resolved_name == fallback:
            log.info("Logical font %s resolved to built-in fallback %s", logical, fallback)
        _resolved[logical] = resolved_name
    return _resolved


def font(logical: str) -> str:
    return register_fonts().get(logical, "Helvetica")
