#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Exercise the real Hexo output. The website contract is its generated HTML,
# not any one source file or theme implementation detail.
make build >/dev/null

python3 - <<'PY'
import json
import hashlib
import re
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path


class Page(HTMLParser):
    def __init__(self, path: str) -> None:
        super().__init__()
        self.path = path
        self.source = ""
        self.tags: list[tuple[str, dict[str, str]]] = []
        self.text: list[str] = []
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        values = {key: value or "" for key, value in attrs}
        self.tags.append((tag, values))
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        self.text.append(data)
        if self._in_title:
            self.title += data

    def has(self, tag: str, **attrs: str) -> bool:
        return any(
            found_tag == tag and all(found_attrs.get(key) == value for key, value in attrs.items())
            for found_tag, found_attrs in self.tags
        )

    @property
    def content(self) -> str:
        return " ".join(" ".join(self.text).split())


def load(relative: str) -> Page:
    path = Path("public", relative, "index.html") if relative else Path("public/index.html")
    page = Page(str(path))
    page.source = path.read_text(encoding="utf-8")
    page.feed(page.source)
    return page


# Every palette the radio ships has to reach the picker, so the expectation is
# read from the vendored copy of the app's own theme file rather than listed.
PALETTES = {
    line.split("name:", 1)[1].strip()
    for line in Path("source/_data/themes.yml").read_text(encoding="utf-8").splitlines()
    if line.lstrip().startswith("- name:")
}
assert len(PALETTES) > 1, "no palettes found in source/_data/themes.yml"

stylesheet = Path("public/css/custom.css").read_text(encoding="utf-8")
custom_css_version = hashlib.sha256(Path("source/css/custom.css").read_bytes()).hexdigest()[:12]

pages = {
    "home": load(""),
    "guide": load("docs"),
    "about": load("about"),
    "license": load("license"),
    "home_en": load("en"),
    "guide_en": load("en/docs"),
    "about_en": load("en/about"),
    "license_en": load("en/license"),
}

for name, page in pages.items():
    assert page.has("nav", **{"aria-label": "主要導覽" if not name.endswith("_en") else "Primary navigation"}), page.path
    assert page.has("footer", **{"class": "site-footer"}), page.path
    # The three navbar controls are drawn, not written.
    assert page.has("a", **{"class": "navbar-tool language-switch"}), page.path
    assert page.has("button", **{"class": "navbar-tool sound-toggle", "type": "button"}), page.path
    assert page.has("button", **{"class": "navbar-tool palette-toggle", "aria-controls": "palette-sheet"}), page.path

    # Every palette the radio ships is offered, the default is marked, and the
    # stored choice is applied before the first paint rather than after it.
    offered = {
        attrs["data-palette"]
        for tag, attrs in page.tags
        if attrs.get("class") == "palette-option"
    }
    assert offered == PALETTES, (page.path, sorted(PALETTES - offered), sorted(offered - PALETTES))
    assert page.has("div", **{"class": "palette-sheet", "id": "palette-sheet"}), page.path
    assert page.has("div", **{"class": "site-toast", "role": "status", "aria-live": "polite"}), page.path
    # Both overlays set display in the stylesheet, which outweighs the browser's
    # own handling of hidden; a closed one that still fills the window swallows
    # every scroll on the page beneath it.
    for overlay in ("palette-sheet", "site-toast"):
        assert f".{overlay}[hidden] {{\n  display: none;\n}}" in stylesheet, overlay
    assert "wavepick-palette" in page.source.split("</head>")[0], page.path
    assert page.has("script", src="/js/transition-sfx.js"), page.path
    assert page.has("script", src="/js/pixel-burst.js"), page.path
    assert page.has(
        "link", rel="stylesheet", href=f"/css/custom.css?v={custom_css_version}"
    ), page.path

assert pages["home"].has("section", **{"class": "site-hero"})
assert pages["home"].has("div", **{"class": "hero-airwaves", "aria-hidden": "true"})
assert pages["home"].has("img", **{"class": "hero-logo", "src": "/images/logo.svg"})
assert pages["home"].has("a", **{"class": "hero-cta", "href": "/docs/"})
assert pages["home_en"].has("a", **{"class": "hero-cta", "href": "/en/docs/"})
assert "拾波 —— 臺灣廣播，盡在終端" in pages["home"].content
assert "Wavepick — Terminal Radio for Taiwan" in pages["home_en"].content
assert "在終端機裡聽臺灣廣播" not in pages["home"].content
assert "Taiwanese radio in your terminal" not in pages["home_en"].content

assert "安裝" in pages["guide"].content and "更新" in pages["guide"].content
assert "Installation" in pages["guide_en"].content and "Updating" in pages["guide_en"].content
assert "關於拾波" in pages["about"].content and "MIT" in pages["license"].content
assert "About Wavepick" in pages["about_en"].content and "MIT" in pages["license_en"].content
assert pages["guide"].has("widget", id="data-toc")
assert pages["guide_en"].has("widget", id="data-toc")
for page in (pages["guide"], pages["guide_en"]):
    assert not page.has("a", **{"class": "cap-action"}), page.path
    assert page.has("a", **{"class": "top", "data-scroll-top": ""}), page.path

logo = Path("public/images/logo.svg").read_text(encoding="utf-8")
assert "<title id=\"title\">Wavepick</title>" in logo
assert "WAVEPICK word mark" in logo

assert stylesheet.lstrip().startswith("/* Wavepick website")
assert "@font-face" in stylesheet
assert "<!DOCTYPE html>" not in stylesheet
assert ".site-navbar.is-scrolled" in stylesheet

# The pixel faces have one weight; bold has to be drawn rather than asked for.
assert "text-shadow: 1px 0 0 currentColor;" in stylesheet
assert "font-weight: bold" not in stylesheet
assert "clamp(32px, 4vw, 56px)" in stylesheet

for page in pages.values():
    assert "navbar.classList.toggle('is-scrolled'" in Path(page.path).read_text(encoding="utf-8")

assert pages["home"].title == "拾波 —— 臺灣廣播"
assert pages["home_en"].title == "Wavepick — Taiwan Radio"

# The copyright names its owner and links to their site, in the footer's own
# colour rather than a link colour. The year is stamped at build time, so it is
# checked against the clock rather than against a number written here.
# Every footer link leads somewhere off the page and carries its own mark.
for name, page in pages.items():
    body = Path(page.path).read_text(encoding="utf-8")
    links = re.search(r'<span class="site-footer__links">.*?</span>\s*</div>', body, re.S)
    assert links, page.path
    assert links.group(0).count("<svg") == 3, page.path
    assert "mailto:contact@yueswater.com" in links.group(0), page.path
    label = "Contact Us" if name.endswith("_en") else "聯絡我們"
    assert label in links.group(0), (page.path, label)
    assert 'class="site-footer__contact"' in links.group(0), page.path
    for mark in ("mail", "github", "python", "antenna"):
        assert Path(f"public/images/icons/{mark}.svg").exists(), mark

owner = {"zh-TW": "岳氏礦泉水", "en": "Yueswater"}
built = str(datetime.now().year)
for name, page in pages.items():
    assert page.has(
        "a", href="https://yueswater.com", target="_blank", rel="noopener"
    ), page.path
    said = f'{built} {owner["en" if name.endswith("_en") else "zh-TW"]}'
    assert said in page.content, (page.path, said)

# What a search engine and a chat app are shown. Each page says what it is in
# its own words, points at its translation, and shares one raster preview:
# social platforms do not render SVG.
for name, page in pages.items():
    english = name.endswith("_en")
    body = Path(page.path).read_text(encoding="utf-8")
    for tag in ("og:title", "og:description", "og:url", "og:image", "og:site_name",
                "twitter:card", "og:locale"):
        assert tag in body, f"{page.path} is missing {tag}"
    card = "og-en.png" if english else "og.png"
    assert f'content="https://wavepick.yueswater.com/images/{card}"' in body, page.path
    assert 'content="summary_large_image"' in body, page.path
    assert '<link rel="canonical"' in body, page.path
    assert 'hreflang="x-default"' in body, page.path
    assert 'hreflang="zh-Hant"' in body and 'hreflang="en"' in body, page.path
    assert f'content="{"en_US" if english else "zh_TW"}"' in body, page.path
    # The description belongs to the page, not scraped off its buttons.
    assert "開始使用" not in body.split("</head>")[0], page.path
    assert body.count('<meta name="description"') == 1, page.path

sitemap = Path("public/sitemap.xml").read_text(encoding="utf-8")
assert sitemap.count("<loc>") == len(pages), sitemap.count("<loc>")
assert sitemap.count("xhtml:link") == len(pages) * 2
robots = Path("public/robots.txt").read_text(encoding="utf-8")
assert "Sitemap: https://wavepick.yueswater.com/sitemap.xml" in robots
assert "Disallow: /" not in robots

# Sharing sits at the end of the piece it shares, and every page shares itself
# rather than the home page. The landing pages have no article to have read, so
# they carry no share row.
for name, page in pages.items():
    body = Path(page.path).read_text(encoding="utf-8")
    if name in ("home", "home_en"):
        assert 'class="page-share"' not in body, page.path
        continue
    assert 'class="page-share"' in body, page.path
    # Inside the article, before it closes, not down in the site footer.
    assert body.index('class="page-share"') < body.index("</article>"), page.path
    assert body.index("</article>") < body.index('class="site-footer"'), page.path
    assert "twitter.com/intent/tweet" in body, page.path
    assert "social-plugins.line.me" in body, page.path
    assert "data-share-copy" in body, page.path
    own = "https://wavepick.yueswater.com" + "/" + page.path[len("public/"):].replace(
        "index.html", ""
    )
    assert f'data-share-copy="{own}"' in body, (page.path, own)
    # Inlined so they take the palette's colours and cost no second request.
    assert body.count('class="page-share__link"') == 3, page.path
    assert 'aria-hidden="true" focusable="false"' in body, page.path

for card in ("og.png", "og-en.png"):
    preview = Path("public/images") / card
    assert preview.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n", card

assert pages["guide"].title == "使用教學 | 拾波 —— 臺灣廣播"
assert pages["guide_en"].title == "Guide | Wavepick — Taiwan Radio"
for page in pages.values():
    assert page.has(
        "link",
        id="site-favicon",
        rel="icon",
        href="/images/favicons/sonic.svg",
    ), page.path
    assert page.has("span", **{"class": "site-brand__mark", "aria-hidden": "true"}), page.path
    assert page.has("div", **{"class": "page-transition", "aria-hidden": "true"}), page.path
    html = Path(page.path).read_text(encoding="utf-8")
    head = html.split("</head>")[0]
    assert "paletteMarks" in head and "site-favicon" in head, page.path
    assert "updatePaletteBrand(slug);" in html, page.path
    assert "favicon.href = paletteMarks[slug] || paletteMarks[paletteFallback]" in html, page.path
    assert "sessionStorage.setItem('wavepick-transition'" in html, page.path
    assert "function initToc()" in html, page.path

# Every theme gets the same pixel mark recoloured from its own primary/accent
# pair. Two literal palettes guard both dark and light generation paths.
for palette in PALETTES:
    mark = Path("public/images/favicons") / f"{palette}.svg"
    svg = mark.read_text(encoding="utf-8")
    assert svg.lstrip().startswith("<svg"), mark
    assert 'mask="url(#screen)"' in svg, mark
    assert "#ff4d6d" not in svg and "#ff9f1c" not in svg, mark

sonic_mark = Path("public/images/favicons/sonic.svg").read_text(encoding="utf-8")
assert "#3fb950" in sonic_mark and "#d29922" in sonic_mark
paper_mark = Path("public/images/favicons/paper.svg").read_text(encoding="utf-8")
assert "#1f6feb" in paper_mark and "#bf8700" in paper_mark

assert ".site-brand__mark" in stylesheet
assert "linear-gradient(90deg, var(--radio-green), var(--radio-amber))" in stylesheet
assert "mask: url('/images/favicon.svg') center / contain no-repeat;" in stylesheet

# The licence heading is broadcast: a tuning scale with a mast at each end.
for page in (pages["license"], pages["license_en"]):
    body = Path(page.path).read_text(encoding="utf-8")
    assert 'class="page-banner__dial"' in body, page.path
    assert body.count('class="page-banner__mast"') == 2, page.path
    assert "page-banner__book" not in body, page.path

# Gabl's pixel cursors ship as real image assets at both densities. The plain
# declaration is the compatibility path; image-set keeps them crisp on Retina.
cursor_sizes = {
    "pointer.png": (22, 22),
    "pointer@2x.png": (44, 44),
    "link.png": (22, 22),
    "link@2x.png": (44, 44),
    "grab.png": (22, 22),
    "grab@2x.png": (44, 44),
}
for name, expected_size in cursor_sizes.items():
    cursor = Path("public/images/cursors") / name
    data = cursor.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", cursor
    assert tuple(int.from_bytes(data[offset:offset + 4], "big") for offset in (16, 20)) == expected_size, cursor

assert "url('/images/cursors/pointer.png') 0 0, auto" in stylesheet
assert "url('/images/cursors/link.png') 0 0, pointer" in stylesheet
assert "url('/images/cursors/pointer@2x.png') 2x" in stylesheet
assert "url('/images/cursors/link@2x.png') 2x" in stylesheet
assert "url('/images/cursors/grab.png') 10 11, grabbing" in stylesheet
assert "url('/images/cursors/grab@2x.png') 2x" in stylesheet
assert "body:active,\nbody:active * {" in stylesheet
assert "data:image/png;base64" not in stylesheet
assert ".site-hero.is-tuning .hero-signal::after" in stylesheet

for name, page in pages.items():
    html = Path(page.path).read_text(encoding="utf-8")
    assert "message === ctx.copycode.toast" in html, page.path
    expected = "Code copied" if name.endswith("_en") else "複製成功"
    assert f"showToast({json.dumps(expected, ensure_ascii=False)})" in html, (page.path, expected)

# Wavepick notifications belong at the lower edge and enter upward. A positive
# initial Y offset is what makes the settled position feel like a rise instead
# of another navbar dropdown.
assert "bottom: 18px;" in stylesheet
assert "transform: translateY(6px);" in stylesheet
assert "bottom: calc(12px + env(safe-area-inset-bottom));" in stylesheet
assert "top: calc(var(--navbar-height) + 10px);" not in stylesheet
assert "top: calc(var(--navbar-height) + 8px);" not in stylesheet

# Markdown ## anchors stay as bare pixel marks in every palette and interaction
# state. Stellar's default paints them as a rounded theme-colour lozenge.
assert ".md-text h2 > a.headerlink:first-child" in stylesheet
assert "background: none !important;" in stylesheet

cursor_source = "https://gabl18.itch.io/simple-pixel-cursors"
for page in (pages["license"], pages["license_en"]):
    assert page.has("a", href=cursor_source), page.path
    assert "Simple Pixel Cursors" in page.content, page.path
    assert "Gabl" in page.content, page.path
    assert "CC0 1.0 Universal" in page.content, page.path

assert "@keyframes radio-scan" in stylesheet
assert "@keyframes tune-out" in stylesheet
assert "@keyframes tuning-wave" in stylesheet
assert ".md-text a:not(.headerlink)" in stylesheet
# No colour may be written by hand any more: the palettes supply them all.
assert "color: var(--foreground-strong) !important;" in stylesheet
# A mask is a stencil, not a colour: its black is opacity, and it never reaches
# the screen. Everything else has to come from the palette.
painted = re.sub(r"\bmask(-image)?:[^;]*;", "", stylesheet)
assert not re.search(r"#[0-9a-fA-F]{3,6}\b|rgba\(\s*\d", painted), "hardcoded colour in custom.css"
assert ".site-navbar.is-scrolled" in stylesheet and "backdrop-filter: none;" in stylesheet
# A closed sheet must not stay laid over the page; the display rule above it
# would otherwise beat the browser's own handling of the hidden attribute.
assert ".palette-sheet[hidden] {\n  display: none;\n}" in stylesheet
assert "background-image: linear-gradient(var(--radio-green), var(--radio-green)) !important;" in stylesheet
assert "#data-toc a.toc-link.is-reading" in stylesheet
assert "overflow: visible !important;" in stylesheet

for page in (pages["guide"], pages["guide_en"]):
    html = Path(page.path).read_text(encoding="utf-8")
    assert "getComputedStyle(document.body).overflowY" in html, page.path
    assert "classList.toggle('is-reading'" in html, page.path
    assert "const getScrollContainer = () =>" in html, page.path
    assert "animateScrollTo(top, 440, 14)" in html, page.path
    assert "document.addEventListener('scroll', scheduleUpdate, { capture: true" in html, page.path

assert "正在調頻" in pages["guide"].content
assert "搜尋訊號" in pages["guide"].content
assert "TUNING WAVE" in pages["guide_en"].content
assert "SEARCHING SIGNAL" in pages["guide_en"].content
assert "FM 104.9" not in pages["guide"].content

print(f"site contract: {len(pages)} pages passed")
PY

node tests/sfx.test.js
node tests/pixel-burst.test.js
