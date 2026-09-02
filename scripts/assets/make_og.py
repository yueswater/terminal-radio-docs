"""Draw the social preview card.

Social platforms do not render SVG, so the card is a PNG. It is drawn from the
same block font and the same palette the terminal interface uses, rather than
traced from the logo file, so the card cannot drift away from the program.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "terminal-radio"))
from terminal_radio.constants.logo import render_mark  # noqa: E402

WIDTH, HEIGHT = 1200, 630
BACKGROUND = "#0d1117"
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


def main() -> int:
    rows = render_mark()
    columns = len(rows[0])
    cell = 13
    mark_width, mark_height = columns * cell, len(rows) * cell
    left = (WIDTH - mark_width) // 2
    top = 210

    card = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(card)

    for y, row in enumerate(rows):
        for x, character in enumerate(row):
            if character == " ":
                continue
            colour = sample(x / max(columns - 1, 1))
            box = (left + x * cell, top + y * cell)
            draw.rectangle([box, (box[0] + cell - 1, box[1] + cell - 1)], fill=colour)

    menlo = "/System/Library/Fonts/Menlo.ttc"
    tagline = ImageFont.truetype(menlo, 30)
    footnote = ImageFont.truetype(menlo, 22)

    def centre(text: str, font: ImageFont.FreeTypeFont, y: int, fill: str) -> None:
        box = draw.textbbox((0, 0), text, font=font)
        draw.text(((WIDTH - (box[2] - box[0])) // 2, y), text, font=font, fill=fill)

    centre("Taiwanese radio, in your terminal", tagline, top + mark_height + 60, "#e6edf3")
    centre("FM . AM . 44 stations . mpv", footnote, top + mark_height + 115, MUTED)

    target = Path(__file__).resolve().parents[2] / "source" / "images" / "og.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    card.save(target, "PNG", optimize=True)
    print(f"{target.relative_to(target.parents[2])}  {target.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
