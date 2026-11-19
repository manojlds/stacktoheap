"""Helpers for step diagrams: white background, rounded boxes with a bold title and a grey subtitle, a beige
panel for a store, and numbered step labels in the accent colour beside the arrows.

A post's file builds each diagram as a string of these helpers' output and calls write(). See AGENTS.md.
Coordinates are in pixels on the canvas given to write(); there is no layout engine, so render and look.
"""
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
IMAGES = ROOT / "public" / "images"
INK, GREY, ACC, RED, BEIGE, LINE = "#1f1f1e", "#6b6a66", "#0e7c86", "#c2473b", "#f1eee7", "#dcd9d0"
FONT = 'font-family="Noto Sans, DejaVu Sans, sans-serif"'

def svg(w, h, title, desc, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="t d" {FONT}>'
            f'<title id="t">{title}</title><desc id="d">{desc}</desc>'
            '<defs>' + ''.join(
                f'<marker id="a{n}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.2" markerHeight="5.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{c}"/></marker>'
                for n, c in (("k", INK), ("c", ACC), ("r", RED), ("g", GREY))) + '</defs>'
            f'<rect width="{w}" height="{h}" fill="#ffffff"/>' + body + '</svg>')

def t(x, y, s, size=22, fill=INK, weight=400, anchor="middle", mono=False):
    fam = ' font-family="DejaVu Sans Mono, monospace"' if mono else ''
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"{fam}>{s}</text>'

def box(x, y, w, h, title, sub, stroke=INK, fill="#ffffff", tcol=None, dash=False, sw=4):
    d = ' stroke-dasharray="12 9"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'
            + t(x + w / 2, y + h / 2 - 4, title, 26, tcol or (ACC if stroke == ACC else INK), 700)
            + t(x + w / 2, y + h / 2 + 26, sub, 19, GREY))

def panel(x, y, w, h, title, sub, fill=BEIGE, stroke="none", tcol=ACC, dash=False):
    d = ' stroke-dasharray="12 9"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="{fill}" stroke="{stroke}" stroke-width="4"{d}/>'
            + f'<text x="{x+28}" y="{y+46}" font-size="27" font-weight="700" fill="{tcol}">{title}<tspan dx="16" font-size="20" font-weight="400" fill="{GREY}">{sub}</tspan></text>')

def arrow(d, col="c", dash=False, w=5):
    c = {"c": ACC, "k": INK, "r": RED, "g": GREY}[col]
    ds = ' stroke-dasharray="10 9"' if dash else ''
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"{ds} marker-end="url(#a{col})"/>'

def step(x, y, lines, anchor="middle", col=ACC):
    return ''.join(t(x, y + i * 27, s, 21, col, 700, anchor) for i, s in enumerate(lines))

def row(x, y, w, a, b, kind):
    if kind == "pending":
        r = f'<rect x="{x}" y="{y}" width="{w}" height="46" rx="10" fill="#fff" stroke="{ACC}" stroke-width="3"/>'
        return r + t(x + 18, y + 30, a, 19, INK, 400, "start", True) + t(x + w - 18, y + 30, b, 19, ACC, 700, "end")
    if kind == "dropped":
        r = f'<rect x="{x}" y="{y}" width="{w}" height="46" rx="10" fill="none" stroke="#9c9a92" stroke-width="2.5" stroke-dasharray="9 7"/>'
        return r + t(x + 18, y + 30, a, 19, "#8b8982", 400, "start", True) + t(x + w - 18, y + 30, b, 19, "#8b8982", 400, "end")
    r = f'<rect x="{x}" y="{y}" width="{w}" height="46" rx="10" fill="#fff" stroke="{LINE}" stroke-width="3"/>'
    return r + t(x + 18, y + 30, a, 19, INK, 400, "start", True) + t(x + w - 18, y + 30, b, 19, GREY, 400, "end")

def chip(x, y, name, sub, stroke=LINE, col=INK, dash=False, w=118):
    d = ' stroke-dasharray="8 7"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="92" rx="12" fill="#fff" stroke="{stroke}" stroke-width="3"{d}/>'
            + t(x + w / 2, y + 42, name, 26, col, 700, "middle", True) + t(x + w / 2, y + 70, sub, 16, GREY))


def write(name, w, h, title, desc, body):
    """Write public/images/<name>.svg and render <name>.png beside it with sharp (already a dependency of Astro)."""
    svg_path = IMAGES / f"{name}.svg"
    svg_path.write_text(svg(w, h, title, desc, body))
    png_path = svg_path.with_suffix(".png")
    js = 'require("sharp")(process.argv[1], { density: 72 }).png().toFile(process.argv[2])'
    subprocess.run(["node", "-e", js, str(svg_path), str(png_path)], cwd=ROOT, check=True)
    print(f"wrote {svg_path.relative_to(ROOT)} and {png_path.name}")
