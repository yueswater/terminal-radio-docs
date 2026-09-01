#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Exercise the real Hexo output. The website contract is its generated HTML,
# not any one source file or theme implementation detail.
make build >/dev/null

python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path


class Page(HTMLParser):
    def __init__(self, path: str) -> None:
        super().__init__()
        self.path = path
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
    page.feed(path.read_text(encoding="utf-8"))
    return page


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
    assert page.has("span", **{"class": "language-switch__label", "aria-hidden": "true"}), page.path
    assert page.has("button", **{"class": "sound-toggle", "type": "button"}), page.path
    assert page.has("script", src="/js/transition-sfx.js"), page.path

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

stylesheet = Path("public/css/custom.css").read_text(encoding="utf-8")
assert stylesheet.lstrip().startswith("/* terminal-radio website")
assert "@font-face" in stylesheet
assert "<!DOCTYPE html>" not in stylesheet
assert ".site-navbar.is-scrolled" in stylesheet
assert "clamp(32px, 4vw, 56px)" in stylesheet

for page in pages.values():
    assert "navbar.classList.toggle('is-scrolled'" in Path(page.path).read_text(encoding="utf-8")

assert pages["home"].title == "拾波 —— 臺灣廣播"
assert pages["home_en"].title == "Wavepick — Taiwan Radio"

# The copyright names its author and links to their site, in the footer's own
# colour rather than a link colour.
for page in pages.values():
    assert page.has(
        "a", href="https://yueswater.com", target="_blank", rel="noopener"
    ), page.path

assert pages["guide"].title == "使用教學 | 拾波 —— 臺灣廣播"
assert pages["guide_en"].title == "Guide | Wavepick — Taiwan Radio"
for page in pages.values():
    assert page.has("link", rel="icon", href="/images/favicon.svg"), page.path
    assert page.has("div", **{"class": "page-transition", "aria-hidden": "true"}), page.path
    html = Path(page.path).read_text(encoding="utf-8")
    assert "sessionStorage.setItem('wavepick-transition'" in html, page.path
    assert "function initToc()" in html, page.path

assert "@keyframes radio-scan" in stylesheet
assert "@keyframes tune-out" in stylesheet
assert "@keyframes tuning-wave" in stylesheet
assert ".md-text a:not(.headerlink)" in stylesheet
assert "color: #fff !important;" in stylesheet
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
