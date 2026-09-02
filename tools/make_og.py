"""Draw the social preview cards, one per language.

Kept out of scripts/, which Hexo loads as JavaScript.

Social platforms do not render SVG, so these are PNGs. They are drawn from the
same block font, the same text faces and the same palette the site uses, rather
than traced from the logo file, so a card shared in a chat cannot drift away
from the thing it is advertising.

The site ships its faces as woff2, which Pillow cannot read, so they are
unpacked to TrueType in a temporary directory on the way past.
"""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / "terminal-radio"))
from terminal_radio.constants.logo import render_mark  # noqa: E402

WIDTH, HEIGHT = 1200, 630
BACKGROUND = "#0d1117"
FOREGROUND = "#e6edf3"
MUTED = "#8b949e"

# The spectrum the word mark is drawn in, sampled across its width.
SPECTRUM = (
    (0.00, (0xFF, 0x4D, 0x6D)),
    (0.18, (0xFF, 0x9F, 0x1C)),
    (0.36, (0xFF, 0xD6, 0x0A)),
    (0.54, (0x2E, 0xC4, 0xB6)),
    (0.70, (0x00, 0xB4, 0xD8)),
    (0.86, (0x43, 0x61, 0xEE)),
    (1.00, (0xB5, 0x17, 0x9E)),
)

CARDS = {
    "og.png": {
        "chinese": True,
        # The word mark is the Latin one, so the Chinese name is said here or
        # a reader of the Chinese site never sees what the thing is called.
        "tagline": "拾波 · 終端機裡的臺灣廣播",
        "footnote": "FM · AM · 44 個電台 · 開源",
    },
    "og-en.png": {
        "chinese": False,
        "tagline": "Taiwanese radio, in your terminal",
        "footnote": "FM · AM · 44 stations · open source",
    },
}


def sample(position: float) -> tuple[int, int, int]:
    """Return the spectrum colour at a fraction of the way across."""
    for (left, low), (right, high) in zip(SPECTRUM, SPECTRUM[1:]):
        if position <= right:
            span = right - left or 1
            ratio = (position - left) / span
            return tuple(
                round(low[channel] + (high[channel] - low[channel]) * ratio)
                for channel in range(3)
            )
    return SPECTRUM[-1][1]


def truetype(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Load one of the site's web faces at a usable size."""
    unpacked = Path(tempfile.gettempdir()) / name.replace(".woff2", ".ttf")
    if not unpacked.exists():
        face = TTFont(ROOT / "source" / "fonts" / name)
        face.flavor = None
        face.save(unpacked)
    return ImageFont.truetype(str(unpacked), size)


def draw_card(tagline: str, footnote: str, chinese: bool) -> Image.Image:
    """Return one finished card."""
    rows = render_mark()
    columns = len(rows[0])
    cell = 13
    mark_width, mark_height = columns * cell, len(rows) * cell

    tagline_font = truetype(
        "Cubic_11.woff2" if chinese else "DepartureMono-Regular.woff2",
        44 if chinese else 38,
    )
    footnote_font = truetype(
        "Cubic_11.woff2" if chinese else "DepartureMono-Regular.woff2",
        30 if chinese else 26,
    )

    card = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(card)

    def measure(text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
        box = draw.textbbox((0, 0), text, font=font)
        return box[2] - box[0], box[3] - box[1]

    _, tagline_height = measure(tagline, tagline_font)
    _, footnote_height = measure(footnote, footnote_font)

    # The three blocks are measured together and placed as one, so the card is
    # balanced rather than sitting in its top half.
    gap_after_mark, gap_after_tagline = 64, 34
    block = (
        mark_height
        + gap_after_mark
        + tagline_height
        + gap_after_tagline
        + footnote_height
    )
    top = (HEIGHT - block) // 2
    left = (WIDTH - mark_width) // 2

    for y, row in enumerate(rows):
        for x, character in enumerate(row):
            if character == " ":
                continue
            colour = sample(x / max(columns - 1, 1))
            corner = (left + x * cell, top + y * cell)
            draw.rectangle(
                [corner, (corner[0] + cell - 1, corner[1] + cell - 1)], fill=colour
            )

    def centre(text: str, font: ImageFont.FreeTypeFont, y: int, fill: str) -> None:
        box = draw.textbbox((0, 0), text, font=font)
        draw.text(
            ((WIDTH - (box[2] - box[0])) // 2 - box[0], y - box[1]),
            text,
            font=font,
            fill=fill,
        )

    tagline_top = top + mark_height + gap_after_mark
    centre(tagline, tagline_font, tagline_top, FOREGROUND)
    centre(
        footnote,
        footnote_font,
        tagline_top + tagline_height + gap_after_tagline,
        MUTED,
    )
    return card


def main() -> int:
    target = ROOT / "source" / "images"
    target.mkdir(parents=True, exist_ok=True)
    for name, card in CARDS.items():
        image = draw_card(card["tagline"], card["footnote"], card["chinese"])
        path = target / name
        image.save(path, "PNG", optimize=True)
        print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
