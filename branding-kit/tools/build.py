#!/usr/bin/env python3
"""
Rebuilds every generated asset in branding-kit/ from source:

  logo/*.svg          the mark (a profile and its reflection) + wordmark (Fraunces outlines)
  logo/png/*          rasterised with resvg, favicon.ico via Pillow
  social/og-image.*   built here (all text is outlined, no fonts needed to render)
  colors/tokens.*     emitted from PALETTE so CSS/JSON/README never drift
  brand-sheet.html    palette + mono mark injected between markers

Run from anywhere:
  python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz pillow resvg-py
  .venv/bin/python branding-kit/tools/build.py
"""
from __future__ import annotations

import io
import json
import math
import re
from pathlib import Path

import resvg_py
import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image

KIT = Path(__file__).resolve().parent.parent
LOGO, PNG, FONTS, COLORS, SOCIAL = (KIT / p for p in ("logo", "logo/png", "fonts", "colors", "social"))
for d in (LOGO, PNG, COLORS, SOCIAL):
    d.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------------------------------- palette
# Single source of truth. Light, airy, four bright families over warm paper; ink stays plum-slate.
# `-deep` tones are the text colour on that family's `-soft` tint and on paper (checked below, AA).
PALETTE = {
    "light": {
        "paper": "#fcfaf6", "card": "#fffdfa", "mist": "#f4f1ea",
        "ink": "#46425c", "ink-soft": "#6f6b86",
        "dawn": "#f0916f", "dawn-deep": "#d4603a", "dawn-soft": "#fde6dc",
        "dawn-strong": "#b0472a", "dawn-stronger": "#9c3d23", "on-dawn": "#ffffff",
        "sky": "#6fa8e8", "sky-deep": "#3068a9", "sky-soft": "#e2eefb",
        "lav": "#a98be0", "lav-deep": "#6e50b3", "lav-soft": "#eee7fa",
        "mint": "#6ec9a5", "mint-deep": "#24765a", "mint-soft": "#e0f5ec",
        "alert": "#a94a40", "alert-soft": "#fdebe9", "alert-fg": "#ffffff",
        "dusk": "#575377",
    },
    # Night: same hues, inverted value. Only the tokens that change are listed.
    "dark": {
        "paper": "#1b1a24", "card": "#23222e", "mist": "#2b2a37",
        "ink": "#e8e5f0", "ink-soft": "#a49fb8",
        "dawn-soft": "#3d2a25", "sky-soft": "#1f2a3d", "lav-soft": "#2b2440", "mint-soft": "#1f3129",
        "dawn-strong": "#f3a58a", "dawn-stronger": "#f7b9a3", "on-dawn": "#1b1a24",
        "sky-deep": "#8fc0f2", "lav-deep": "#c2aaee", "mint-deep": "#86d6b6",
        "alert": "#f0a094", "alert-soft": "#3a2426", "alert-fg": "#1b1a24",
    },
}
L, D = PALETTE["light"], PALETTE["dark"]
N = {**L, **D}
REFLECTION = [L["dawn"], L["lav"], L["sky"], L["mint"]]   # the gradient the mirror gives back


def _lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = _lum(a), _lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


# Every pair that carries small text must clear AA in both themes; the build fails otherwise.
AA_PAIRS = [("ink", "paper"), ("ink-soft", "paper"), ("ink", "card"), ("on-dawn", "dawn-strong"), ("on-dawn", "dawn-stronger"),
            ("sky-deep", "paper"), ("sky-deep", "sky-soft"), ("lav-deep", "paper"), ("lav-deep", "lav-soft"),
            ("mint-deep", "paper"), ("mint-deep", "mint-soft"), ("dawn-strong", "dawn-soft"), ("dawn-strong", "paper"),
            ("alert", "alert-soft"), ("alert", "paper")]
CONTRAST = {f"{a} on {b}": (contrast(L[a], L[b]), contrast(N[a], N[b])) for a, b in AA_PAIRS}
for pair_name, (light, dark) in CONTRAST.items():
    assert min(light, dark) >= 4.5, f"{pair_name} fails AA: light {light:.2f}, night {dark:.2f}"

# --------------------------------------------------------------------------- mark
# "You arrive as a line; the mirror gives you back in colour."
# A right-facing profile drawn to classic proportions (hairline→brow, brow→nose base, nose base→chin in thirds),
# closed eye, mirrored across x = 32; the reflection is stroked with the REFLECTION gradient.
# GAP_SHIFT pulls each face away from the glass so nose-to-nose is 12 units: a reflection, not a kiss.
FOREHEAD = "M 16.5 9 C 21 11.5, 23.6 17, 24 22"
BROW_TO_CHIN = ("C 24.1 23.4, 23.4 24.4, 23.6 25.4 C 25.6 27.8, 28.6 30.4, 29.4 32.6 C 29.9 33.9, 29.1 34.8, 27.8 35 "
                "C 26.9 35.2, 26.1 35.3, 25.3 35.6 C 25.5 36.8, 26.4 37.5, 26.6 38.6 C 26.3 39.3, 25.9 39.6, 25.9 39.9 "
                "C 26.8 40.5, 27 41.7, 26.2 42.8 C 25.7 43.6, 26.2 44.6, 26.8 45.6 C 27.2 47.2, 25.9 48.9, 23.8 49.8")
NECK = "C 22.6 50.3, 21.8 50.6, 21.2 51 L 19.8 58"
EDGE = f"{FOREHEAD} {BROW_TO_CHIN} {NECK}"
EYE = "M 19 27.4 Q 20.8 28.9, 22.6 27.2"
FIT = "translate(32 32) scale(0.9) translate(-32 -32)"
MIRROR = "matrix(-1 0 0 1 64 0)"
GAP_SHIFT = 3.5
BACK = f"translate(-{GAP_SHIFT} 0)"
STROKE = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'
MARK_BOX = (13.5, 9.9, 50.5, 56.8)   # content bounds after FIT and GAP_SHIFT, including stroke


def gradient(uid, stops, y0=8, y1=58, opacity=1.0):
    n = max(len(stops) - 1, 1)
    inner = "".join(f'<stop offset="{i / n:.3f}" stop-color="{c}" stop-opacity="{opacity}"/>' for i, c in enumerate(stops))
    return f'<linearGradient id="{uid}" gradientUnits="userSpaceOnUse" x1="0" y1="{y0}" x2="0" y2="{y1}">{inner}</linearGradient>'


def mark_body(uid, ink, *, eye=True, w=2.8, axis=True, stops=REFLECTION, refl=None, refl_w=None, refl_opacity=1.0, blur=0.0):
    """Inner markup of the mark. `refl` (a colour) replaces the gradient; `uid` keeps ids unique when inlined together."""
    refl_w = refl_w or w
    defs, filt = [], ""
    if refl is None:
        defs.append(gradient(f"{uid}-g", stops))
        refl = f"url(#{uid}-g)"
    if blur:
        defs.append(f'<filter id="{uid}-b" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="{blur}"/></filter>')
        filt = f' filter="url(#{uid}-b)"'
    person = f'<path d="{EDGE}" stroke="{ink}" stroke-width="{w}" {STROKE}/>'
    if eye:
        person += f'<path d="{EYE}" stroke="{ink}" stroke-width="{w * 0.8:.2f}" {STROKE}/>'
    line = f'<path d="M 32 6 V 58" stroke="{ink}" stroke-width="{max(1.2, w * 0.43):.2f}" stroke-linecap="round" opacity="0.28"/>' if axis else ""
    reflection = f'<path d="{EDGE}" stroke="{refl}" stroke-width="{refl_w}" {STROKE}/>'
    if eye:
        reflection += f'<path d="{EYE}" stroke="{refl}" stroke-width="{refl_w * 0.8:.2f}" {STROKE}/>'
    return (f'<defs>{"".join(defs)}</defs><g transform="{FIT}"><g transform="{BACK}">{person}</g>{line}'
            f'<g transform="{MIRROR} {BACK}" opacity="{refl_opacity}"{filt}>{reflection}</g></g>')


def favicon_body(uid, ink, refl):
    """16–32 px cut: no eye, heavier line, flat reflection colour. A gradient and an eye are noise at that size."""
    return mark_body(uid, ink, eye=False, w=5.6, refl=refl, axis=True)


def svg(view, body, title, w=None, h=None):
    size = f' width="{w:g}" height="{h:g}"' if w else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"{size} role="img" aria-labelledby="t">\n'
            f'  <title id="t">{title}</title>\n  {body}\n</svg>\n')


# --------------------------------------------------------------------------- wordmark
FRAUNCES = FONTS / "Fraunces[SOFT,WONK,opsz,wght].ttf"
FRAUNCES_IT = FONTS / "Fraunces-Italic[SOFT,WONK,opsz,wght].ttf"
SIZE = 100.0  # wordmark em size in SVG units

_font_cache: dict[tuple, tuple] = {}


def instance(path: Path, axes: dict):
    key = (str(path), tuple(sorted(axes.items())))
    if key not in _font_cache:
        tt = instantiateVariableFont(TTFont(path), axes, inplace=False)
        buf = io.BytesIO()
        tt.save(buf)
        font = hb.Font(hb.Face(buf.getvalue()))
        upem = tt["head"].unitsPerEm
        font.scale = (upem, upem)
        _font_cache[key] = (tt, font, upem)
    return _font_cache[key]


def outline(path: Path, text: str, axes: dict, size=SIZE):
    """Shape `text` with HarfBuzz (kerning, ligatures) and return (svg path d, advance, bbox)."""
    tt, font, upem = instance(path, axes)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True, "calt": True})
    glyphs, order = tt.getGlyphSet(), tt.getGlyphOrder()
    s = size / upem
    x = 0.0
    d, bounds = [], [math.inf, math.inf, -math.inf, -math.inf]
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        g = glyphs[order[info.codepoint]]
        tf = (s, 0, 0, -s, (x + pos.x_offset) * s, -pos.y_offset * s)
        sp = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
        bp = BoundsPen(glyphs)
        g.draw(TransformPen(sp, tf))
        g.draw(TransformPen(bp, tf))
        if bp.bounds:
            d.append(sp.getCommands())
            bounds = [min(bounds[0], bp.bounds[0]), min(bounds[1], bp.bounds[1]),
                      max(bounds[2], bp.bounds[2]), max(bounds[3], bp.bounds[3])]
        x += pos.x_advance
    return " ".join(d), x * s, bounds


ROMAN = {"wght": 450, "opsz": 48, "SOFT": 60, "WONK": 0}
ITALIC = {"wght": 400, "opsz": 48, "SOFT": 60, "WONK": 0}

mindful_d, mindful_adv, mb = outline(FRAUNCES, "Mindful", ROMAN)
space_adv = outline(FRAUNCES, " ", ROMAN)[1]
companion_d, companion_adv, cb = outline(FRAUNCES_IT, "Companion", ITALIC)
cap_height = instance(FRAUNCES, ROMAN)[0]["OS/2"].sCapHeight / instance(FRAUNCES, ROMAN)[2] * SIZE

COMP_X = mindful_adv + space_adv
WORD_W = COMP_X + companion_adv
WORD_TOP, WORD_BOTTOM = min(mb[1], cb[1]), max(mb[3], cb[3])


def wordmark_body(ink, companion):
    return (f'<path d="{mindful_d}" fill="{ink}"/>'
            f'<path transform="translate({COMP_X:.2f} 0)" d="{companion_d}" fill="{companion}"/>')


def framed(body, x0, y0, x1, y1, pad, title):
    w, h = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad
    return svg(f"{x0 - pad:.2f} {y0 - pad:.2f} {w:.2f} {h:.2f}", body, title, w, h)


# The mark is tall: 1.45 × cap height, standing on the baseline beside the wordmark.
MX0, MY0, MX1, MY1 = MARK_BOX
MARK_H = cap_height * 1.45
MARK_SCALE = MARK_H / (MY1 - MY0)
MARK_W = (MX1 - MX0) * MARK_SCALE
LOCKUP_GAP = SIZE * 0.22


def lockup_horizontal(uid, ink, companion, title, **mark_kw):
    word_x = MARK_W + LOCKUP_GAP
    body = (f'<g transform="translate({-MX0 * MARK_SCALE:.2f} {-MY1 * MARK_SCALE:.2f}) scale({MARK_SCALE:.4f})">'
            f'{mark_body(uid, ink, **mark_kw)}</g>'
            f'<g transform="translate({word_x:.2f} 0)">{wordmark_body(ink, companion)}</g>')
    return framed(body, 0, min(-MARK_H, WORD_TOP), word_x + WORD_W, WORD_BOTTOM, SIZE * 0.2, title)


def lockup_stacked(uid, ink, companion, title, **mark_kw):
    scale = MARK_SCALE * 1.35
    mw, mh = (MX1 - MX0) * scale, (MY1 - MY0) * scale
    gap = SIZE * 0.3
    mark_x = (WORD_W - mw) / 2 - MX0 * scale
    mark_y = -cap_height - gap - MY1 * scale
    body = (f'<g transform="translate({mark_x:.2f} {mark_y:.2f}) scale({scale:.4f})">{mark_body(uid, ink, **mark_kw)}</g>'
            f'{wordmark_body(ink, companion)}')
    return framed(body, 0, -cap_height - gap - mh, WORD_W, WORD_BOTTOM, SIZE * 0.24, title)


# --------------------------------------------------------------------------- write SVGs
CUR = "currentColor"
WPAD = SIZE * 0.12
COMPANION_L, COMPANION_D = L["lav-deep"], D["lav-deep"]
T = "Mindful Companion"
files = {
    "mark.svg": svg("0 0 64 64", mark_body("mc", L["ink"]), T + " mark"),
    "mark-dark.svg": svg("0 0 64 64", mark_body("mc-d", D["ink"]), T + " mark"),
    "mark-soft.svg": svg("0 0 64 64", mark_body("mc-s", L["ink"], refl_w=3.2, blur=0.7), T + " mark, soft reflection"),
    "mark-mono.svg": svg("0 0 64 64", mark_body("mc-m", CUR, refl=CUR, refl_opacity=0.45), T + " mark"),
    "mark-favicon.svg": svg("0 0 64 64", favicon_body("mc-f", L["ink"], L["lav"]), T + " mark, small sizes"),
    "wordmark.svg": framed(wordmark_body(L["ink"], COMPANION_L), 0, WORD_TOP, WORD_W, WORD_BOTTOM, WPAD, T),
    "wordmark-dark.svg": framed(wordmark_body(D["ink"], COMPANION_D), 0, WORD_TOP, WORD_W, WORD_BOTTOM, WPAD, T),
    "wordmark-mono.svg": framed(wordmark_body(CUR, CUR), 0, WORD_TOP, WORD_W, WORD_BOTTOM, WPAD, T),
    "lockup.svg": lockup_horizontal("lk", L["ink"], COMPANION_L, T),
    "lockup-dark.svg": lockup_horizontal("lk-d", D["ink"], COMPANION_D, T),
    "lockup-mono.svg": lockup_horizontal("lk-m", CUR, CUR, T, refl=CUR, refl_opacity=0.45),
    "lockup-stacked.svg": lockup_stacked("st", L["ink"], COMPANION_L, T),
    "lockup-stacked-dark.svg": lockup_stacked("st-d", D["ink"], COMPANION_D, T),
}
for name, content in files.items():
    (LOGO / name).write_text(content)
print(f"wrote {len(files)} svgs")

# --------------------------------------------------------------------------- tokens
css = ["/* Mindful Companion design tokens — generated by tools/build.py. Light first, night below. */", ":root {"]
css += [f"  --color-{k}: {v};" for k, v in L.items()]
css += ["", f"  --gradient-reflection: linear-gradient(180deg, {', '.join(REFLECTION)});",
        f"  --gradient-wash: linear-gradient(135deg, {L['dawn-soft']}, {L['lav-soft']}, {L['sky-soft']}, {L['mint-soft']});", "",
        '  --font-display: "Fraunces", Georgia, "Times New Roman", serif;',
        '  --font-sans: "Nunito Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;', "",
        "  --radius-card: 1.5rem;   /* 24px — cards, modals */",
        "  --radius-field: 1rem;    /* 16px — inputs, wells */",
        "  --radius-pill: 9999px;   /* buttons, chips, nav */", "",
        "  --shadow-soft: 0 6px 24px rgb(70 66 92 / 0.08);",
        "  --shadow-lift: 0 12px 36px rgb(70 66 92 / 0.14);", "",
        "  --ease-gentle: cubic-bezier(0.22, 1, 0.36, 1);",
        "  --duration-quick: 200ms;",
        "  --duration-enter: 400ms;", "}", "",
        "@media (prefers-color-scheme: dark) {", "  :root {"]
css += [f"    --color-{k}: {v};" for k, v in D.items()]
css += [f"    --gradient-wash: linear-gradient(135deg, {D['dawn-soft']}, {D['lav-soft']}, {D['sky-soft']}, {D['mint-soft']});",
        "    --shadow-soft: 0 6px 24px rgb(0 0 0 / 0.35);", "    --shadow-lift: 0 12px 36px rgb(0 0 0 / 0.5);", "  }", "}", ""]
(COLORS / "tokens.css").write_text("\n".join(css))
(COLORS / "tokens.json").write_text(json.dumps({
    "color": {"light": L, "dark": N},
    "gradient": {"reflection": REFLECTION},
    "font": {"display": "Fraunces", "sans": "Nunito Sans"},
    "radius": {"card": "24px", "field": "16px", "pill": "9999px"},
    "logo": {"line": L["ink"], "line-dark": D["ink"], "reflection": REFLECTION, "wordmark": L["ink"], "companion": COMPANION_L},
    "contrast": {k: [round(a, 2), round(b, 2)] for k, (a, b) in CONTRAST.items()},
}, indent=2) + "\n")
print("wrote colors/tokens.css, colors/tokens.json")


# --------------------------------------------------------------------------- social image
def og_svg():
    tag_d, _, _ = outline(FRAUNCES_IT, "A quiet space to journal and feel heard.",
                          {"wght": 300, "opsz": 36, "SOFT": 60, "WONK": 0}, size=44)
    lock = lockup_horizontal("og", L["ink"], COMPANION_L, "")
    lock_body = lock.split("</title>\n")[1].rsplit("</svg>", 1)[0]
    lx, ly, lw, lh = map(float, lock.split('viewBox="')[1].split('"')[0].split())
    scale = 720 / lw

    def cloud(cx, cy, rx, ry, o):
        return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#fff" opacity="{o}" filter="url(#blur)"/>'

    return svg("0 0 1200 630", "".join([
        "<defs>",
        '<linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">'
        + "".join(f'<stop offset="{i / 3:.2f}" stop-color="{c}"/>' for i, c in enumerate((L["dawn-soft"], L["lav-soft"], L["sky-soft"], L["mint-soft"])))
        + "</linearGradient>",
        '<filter id="blur" x="-50%" y="-120%" width="200%" height="340%"><feGaussianBlur stdDeviation="16"/></filter>',
        f'<linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">'
        + "".join(f'<stop offset="{i / 3:.2f}" stop-color="{c}"/>' for i, c in enumerate(REFLECTION)) + "</linearGradient>",
        "</defs>",
        '<rect width="1200" height="630" fill="url(#wash)"/>',
        cloud(250, 110, 170, 40, 0.7), cloud(330, 140, 130, 36, 0.6),
        cloud(960, 330, 190, 46, 0.55), cloud(180, 560, 210, 50, 0.6), cloud(1000, 590, 170, 40, 0.55),
        f'<g transform="translate({100 - lx * scale:.2f} {300 - (ly + lh) * scale:.2f}) scale({scale:.4f})">{lock_body}</g>',
        f'<path transform="translate(104 380)" d="{tag_d}" fill="{L["ink-soft"]}"/>',
        '<rect x="104" y="422" width="140" height="4" rx="2" fill="url(#rule)"/>',
    ]), "Mindful Companion — A quiet space to journal and feel heard.")


OG = og_svg()
(SOCIAL / "og-image.svg").write_text(OG)


# --------------------------------------------------------------------------- PNGs
def png(svg_text: str, out: Path, width: int, height: int | None = None):
    out.write_bytes(bytes(resvg_py.svg_to_bytes(svg_string=svg_text, width=width, height=height)))


def framed_mark(size: int, inset: float, bg: str, ink: str):
    """Mark centred on a solid square — iOS flattens transparency to black, avatars need a ground."""
    inner = size * (1 - 2 * inset)
    off = (size - inner) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}"><rect width="{size}" height="{size}" fill="{bg}"/>'
            f'<svg x="{off:.1f}" y="{off:.1f}" width="{inner:.1f}" height="{inner:.1f}" viewBox="0 0 64 64">'
            f'{mark_body("f", ink)}</svg></svg>')


for s in (16, 32):
    png(files["mark-favicon.svg"], PNG / f"mark-{s}.png", s, s)
for s in (48, 192, 512):
    png(files["mark.svg"], PNG / f"mark-{s}.png", s, s)
png(framed_mark(180, 0.10, L["paper"], L["ink"]), PNG / "apple-touch-icon-180.png", 180, 180)
png(framed_mark(1024, 0.16, L["paper"], L["ink"]), PNG / "avatar-1024.png", 1024, 1024)
png(framed_mark(1024, 0.16, D["paper"], D["ink"]), PNG / "avatar-dark-1024.png", 1024, 1024)

Image.open(PNG / "mark-48.png").save(
    PNG / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=[Image.open(PNG / "mark-16.png"), Image.open(PNG / "mark-32.png")])

for name, out, w in (("lockup.svg", "lockup-1200.png", 1200), ("lockup-dark.svg", "lockup-dark-1200.png", 1200),
                     ("lockup-stacked.svg", "lockup-stacked-800.png", 800), ("lockup-stacked-dark.svg", "lockup-stacked-dark-800.png", 800)):
    png(files[name], PNG / out, w)

png(OG, SOCIAL / "og-image.png", 1200, 630)

alpha = Image.open(PNG / "mark-512.png").getchannel("A").getextrema()
assert alpha[0] == 0, f"mark-512.png is not transparent: alpha range {alpha}"
print("wrote pngs + social/og-image.{svg,png}; transparency ok")

# --------------------------------------------------------------------------- brand sheet
# Inject palette, mono mark and contrast table into brand-sheet.html between markers so the sheet never drifts.
sheet = KIT / "brand-sheet.html"
if sheet.exists():
    html = sheet.read_text()

    def between(text, start, end, body):
        return re.sub(re.escape(start) + r".*?" + re.escape(end), lambda m: f"{start}{body}{end}", text, flags=re.S)

    html = between(html, "/* night:start */", "/* night:end */", "\n" + "\n".join(f"    --color-{k}: {v};" for k, v in D.items()) + "\n    ")
    html = between(html, "/* day:start */", "/* day:end */", "\n" + "\n".join(f"    --color-{k}: {v};" for k, v in L.items()) + "\n    ")
    html = between(html, "/*palette:start*/", "/*palette:end*/", json.dumps({"light": L, "dark": D, "reflection": REFLECTION}))
    html = between(html, "<!-- mono:start -->", "<!-- mono:end -->",
                   f'<svg viewBox="0 0 64 64" role="img" aria-label="Mark, single colour">{mark_body("sheet-mono", CUR, refl=CUR, refl_opacity=0.45)}</svg>')
    sheet.write_text(html)
    print("injected palette + mono mark into brand-sheet.html")

print("contrast (light / night):")
for k, (a, b) in CONTRAST.items():
    print(f"  {k:28} {a:5.2f}  {b:5.2f}")
