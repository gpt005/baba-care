from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch


PAGE_SIZE = letter
PAGE_WIDTH, PAGE_HEIGHT = PAGE_SIZE
MARGIN = 0.5 * inch

CREAM = HexColor("#FBF6EE")
BLUSH = HexColor("#FCEAEF")
PINK_SOFT = HexColor("#F8C8D3")
PINK_DEEP = HexColor("#E89BAA")
PINK_DEEPEST = HexColor("#D97E91")
PINK_DARK = HexColor("#B7556A")
INK = HexColor("#2B2A28")
WHITE = HexColor("#FFFFFF")

ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "assets"
FONT_DIR = ASSETS_DIR / "fonts"
SIGNATURE_PATH = ASSETS_DIR / "signature.png"
PAW_PATH = ASSETS_DIR / "paw.png"

BUSINESS_NAME = "baba"
BUSINESS_TAGLINE = "pet care"
SOCIAL_INSTAGRAM = "Instagram: @baba.mypetcare"
SOCIAL_PHONE = "(415)-335-2462"
PREPARED_BY_NAME = "Wutt Hmone Kyi"
