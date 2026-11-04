"""Build colourway lineup images (garments on a rail / table in front of the
factory floor) for every GoodBiz product line.

usage: python3 tools/lineup.py _ .   (needs pillow + numpy)
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

SCR, PRJ = sys.argv[1], sys.argv[2]
CUT = f"{PRJ}/tools/bases"
OUT = f"{PRJ}/src/assets/img/line"
os.makedirs(OUT, exist_ok=True)
W, H = 1200, 750
RAIL_Y, TABLE_Y = 64, 668


def trim(im):
    a = im.split()[-1].point(lambda v: 255 if v > 20 else 0)
    return im.crop(a.getbbox())


def load(path):
    return trim(Image.open(path).convert("RGBA"))


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255.0


def tint(im, color, mode="all", texture=None, sheen=False):
    """Recolour a garment while keeping its shading."""
    if color is None:
        return im
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3]
    L = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0)
    g = al > 0.1
    if mode == "light":
        mask = sat < 0.22
    elif mode == "dark":
        mask = L < 0.5
    elif mode == "midlight":
        mask = L > 0.2
    else:
        mask = np.ones_like(L, bool)
    sel = g & mask
    ref = np.percentile(L[sel], 96) if sel.any() else 1.0
    Ln = np.clip(L / max(ref, 0.05), 0, 1.12)
    c = hexrgb(color)
    lum_c = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
    gamma = 0.85 if lum_c > 0.5 else 1.05
    out = c[None, None, :] * (Ln ** gamma)[..., None]
    out += np.clip(Ln - 1, 0, None)[..., None] * 0.6          # keep highlights
    if texture == "slub":
        rng = np.random.default_rng(7)
        rows = rng.normal(1, 0.035, (rgb.shape[0], 1)).astype(np.float32)
        streak = Image.fromarray(np.uint8(np.clip(rows * 180, 0, 255).repeat(rgb.shape[1], 1)))
        streak = np.asarray(streak.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 180.0
        out *= streak[..., None]
    if sheen:
        yy, xx = np.mgrid[0:rgb.shape[0], 0:rgb.shape[1]]
        band = np.exp(-(((xx - yy * 0.55) - rgb.shape[1] * 0.35) / (rgb.shape[1] * 0.18)) ** 2)
        out = out + (1 - out) * band[..., None] * 0.12
    out = np.clip(out, 0, 1)
    m = Image.fromarray(np.uint8(mask * 255)).filter(ImageFilter.GaussianBlur(1.2))
    m = (np.asarray(m).astype(np.float32) / 255.0)[..., None]
    res = rgb * (1 - m) + out * m
    return Image.fromarray(np.uint8(np.dstack([res, al]) * 255), "RGBA")


def crop_top(im, frac):
    w, h = im.size
    return trim(im.crop((0, 0, w, int(h * frac))))


_bg = None


def backdrop():
    global _bg
    if _bg is None:
        src = Image.open(f"{PRJ}/src/assets/img/hero-factory.jpg").convert("RGB")
        sw, sh = src.size
        tw = int(sh * W / H)
        if tw <= sw:
            src = src.crop(((sw - tw) // 2, 0, (sw - tw) // 2 + tw, sh))
        src = src.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(9))
        src = ImageEnhance.Color(src).enhance(0.55)
        src = ImageEnhance.Brightness(src).enhance(1.05)
        paper = Image.new("RGB", (W, H), (241, 237, 228))
        bg = Image.blend(src, paper, 0.46)
        d = ImageDraw.Draw(bg, "RGBA")
        # display table
        d.rectangle([0, TABLE_Y, W, H], fill=(246, 243, 236, 245))
        d.rectangle([0, TABLE_Y, W, TABLE_Y + 2], fill=(22, 21, 15, 40))
        for i in range(26):
            d.rectangle([0, TABLE_Y + 2 + i, W, TABLE_Y + 3 + i], fill=(22, 21, 15, int(18 * (1 - i / 26))))
        _bg = bg
    return _bg.copy().convert("RGBA")


def draw_rail(canvas):
    d = ImageDraw.Draw(canvas, "RGBA")
    d.rectangle([28, RAIL_Y - 3, W - 28, RAIL_Y + 3], fill=(70, 68, 62, 255))
    d.line([30, RAIL_Y - 2, W - 30, RAIL_Y - 2], fill=(210, 208, 200, 255), width=1)
    for x in (28, W - 34):
        d.rectangle([x, 0, x + 6, RAIL_Y + 3], fill=(70, 68, 62, 255))


def shadow_of(im, blur=16, opacity=0.30):
    a = im.split()[-1].filter(ImageFilter.GaussianBlur(blur))
    a = a.point(lambda v: int(v * opacity))
    sh = Image.new("RGBA", im.size, (22, 21, 15, 0))
    sh.putalpha(a)
    return sh


def clip_hook(d, cx, top):
    d.line([cx, RAIL_Y + 2, cx, top - 6], fill=(70, 68, 62, 255), width=3)
    d.arc([cx - 9, RAIL_Y - 9, cx + 9, RAIL_Y + 9], 180, 360, fill=(70, 68, 62, 255), width=3)
    d.rectangle([cx - 34, top - 8, cx + 34, top + 4], fill=(48, 46, 42, 255))


def pile(items, name):
    canvas = backdrop()
    rows = [items[:3], items[3:]]
    w0 = 330
    y_base = TABLE_Y + 6
    for r, row in enumerate(rows):
        n = len(row)
        total = n * w0 * 0.94
        x0 = (W - total) / 2
        for i, im in enumerate(row):
            f = w0 / im.width
            im2 = im.resize((int(im.width * f), int(im.height * f)), Image.LANCZOS)
            x = int(x0 + i * w0 * 0.94)
            y = int(y_base - im2.height - r * im2.height * 0.62)
            canvas.alpha_composite(shadow_of(im2, 12, 0.32), (x + 8, y + 12))
            canvas.alpha_composite(im2, (x, y))
    canvas.convert("RGB").save(f"{OUT}/{name}.webp", "WEBP", quality=78, method=6)
    return f"{OUT}/{name}.webp"


def compose(items, kind, name, scale=1.0, gap=0.0):
    if kind == "pile":
        return pile(items, name)
    canvas = backdrop()
    if kind in ("hang", "clip"):
        draw_rail(canvas)
    n = len(items)
    margin = 64
    slot = (W - 2 * margin) / n
    top = RAIL_Y - 6 if kind == "hang" else RAIL_Y + 40
    max_h = (TABLE_Y - 12 - top) * scale if kind != "table" else (TABLE_Y - 110) * scale
    placed = []
    for i, im in enumerate(items):
        w, h = im.size
        f = min((slot * (1.08 - gap)) / w, max_h / h)
        im2 = im.resize((max(1, int(w * f)), max(1, int(h * f))), Image.LANCZOS)
        cx = margin + slot * (i + 0.5)
        x = int(cx - im2.width / 2)
        y = int(top) if kind != "table" else int(TABLE_Y + 8 - im2.height)
        placed.append((im2, x, y, cx))
    d = ImageDraw.Draw(canvas, "RGBA")
    for im2, x, y, cx in placed:                       # shadows first
        sh = shadow_of(im2)
        canvas.alpha_composite(sh, (x + 12, y + 16))
        if kind == "table":
            ew = int(im2.width * 0.85)
            e = Image.new("RGBA", (ew + 60, 60), (0, 0, 0, 0))
            ImageDraw.Draw(e).ellipse([30, 18, ew + 30, 42], fill=(22, 21, 15, 70))
            e = e.filter(ImageFilter.GaussianBlur(8))
            canvas.alpha_composite(e, (int(cx - ew / 2 - 30), y + im2.height - 30))
    for im2, x, y, cx in placed:
        if kind == "clip":
            clip_hook(d, cx, y)
        canvas.alpha_composite(im2, (x, y))
    canvas.convert("RGB").save(f"{OUT}/{name}.webp", "WEBP", quality=78, method=6)
    return f"{OUT}/{name}.webp"


# ------------------------------------------------------------- base garments
B = {
    "tee": load(f"{CUT}/men-tees.webp"),
    "tee_heather": load(f"{CUT}/shirtH2.png"),
    "polo": load(f"{CUT}/polo1.png"),
    "shirt_folded": load(f"{CUT}/men-shirts.webp"),
    "shirt_camp": load(f"{CUT}/polo2.png"),
    "jeans": load(f"{CUT}/men-bottoms.webp"),
    "jeans_dark": load(f"{CUT}/jeans-dark.webp"),
    "trousers": load(f"{CUT}/p2_1.png"),
    "onesie": load(f"{CUT}/kids-baby.webp"),
    "dress": load(f"{CUT}/kids-dresses.webp"),
    "jacket": load(f"{CUT}/jacketC.png"),
    "bomber": load(f"{CUT}/extra-bomber.webp"),
}
# clean the yellow background strip left on the polo's edge
pa = np.asarray(B["polo"]).copy()
rgb = pa[..., :3].astype(np.int16)
yellow = (rgb[..., 0] - rgb[..., 2] > 40) & (rgb[..., 1] - rgb[..., 2] > 15)
pa[yellow, 3] = 0
B["polo"] = trim(Image.fromarray(pa, "RGBA"))
B["shorts"] = crop_top(B["trousers"], 0.47)
cw, ch = B["shirt_camp"].size
B["shirt_camp"] = trim(B["shirt_camp"].crop((0, int(ch * 0.115), cw, ch)))
B["cutoffs"] = crop_top(B["jeans"], 0.45)


def T(base, colours, mode="all", **kw):
    return [tint(B[base], c, mode, **kw) for c in colours]


R = {
    # knits
    "mens-cotton-t-shirts":   ("hang", T("tee", [None, "#273450", "#A9A7A1", "#5F6439", "#6A2431"], "light")),
    "mens-polyester-t-shirts": ("hang", T("tee_heather", [None, "#B3262C", "#2B2B2E", "#1F7276"])),
    "mens-cotton-polo-shirts": ("hang", T("polo", [None, "#263352", "#24513D", "#93B7DC", "#6B2234"], "light")),
    "kids-cotton-t-shirts":   ("hang", T("tee", ["#F2C94C", "#86BEE8", None, "#EE8B7C", "#92D4BA"], "light"), 0.72),
    # woven
    "mens-cotton-formal-shirts": ("pile", T("shirt_folded", [None, "#F2F2F0", "#E7B9C3", "#C7BCE0", "#C8CBD0"])),
    "mens-cotton-handloom-shirts": ("clip", T("shirt_camp", ["#E9E0CB", "#34437A", "#A6563C", "#C79A35"], "light", texture="slub")),
    "mens-polyester-shirts":  ("clip", T("shirt_camp", [None, "#253152", "#45474C", "#9DBBDD"], "light")),
    "mens-silk-shirts":       ("clip", T("shirt_camp", ["#1F6B52", "#D9C29C", "#6E2235", "#1E2747"], "light", sheen=True)),
    "mens-cotton-trousers":   ("clip", T("trousers", ["#B39A6C", "#283350", "#5B5E37", "#CDBFA3"])),
    "mens-cotton-jeans":      ("clip", [B["jeans"], B["jeans_dark"], tint(B["jeans"], "#A9C1DC"), tint(B["jeans_dark"], "#2D2D33")]),
    "mens-polyester-trousers": ("clip", T("trousers", ["#3F4146", "#24252A", "#8A8C90", "#25304B"])),
    "mens-cotton-shorts":     ("clip", T("shorts", ["#B39A6C", "#283350", "#5B5E37", "#8DB3D6", "#CDBFA3"]), 0.62),
    "baby-cotton-garments":   ("clip", T("onesie", [None, "#BFD9EF", "#F4C9D2", "#F3E2A5", "#C3E6D5"], "light"), 0.6),
    "baby-synthetic-garments": ("clip", T("onesie", ["#B9A7DE", "#3E8E93", "#9EA3AA", "#C8463E"], "light"), 0.6),
    "baby-other-textile-garments": ("clip", T("onesie", ["#DCCFB8", "#A8B59A", "#C2876B", "#EEE6D6"], "light", texture="slub"), 0.6),
    "kids-cotton-shirts":     ("clip", T("shirt_camp", ["#9CC3E8", None, "#EE9A86", "#F1CF5E"], "light"), 0.72),
    "boys-cotton-trousers":   ("clip", T("trousers", ["#283350", "#B39A6C", "#5B5E37", "#8A8C90"]), 0.72),
    "girls-cotton-dresses":   ("hang", T("dress", [None, "#E9A9B8", "#A9C8E6", "#C5B4E3"]), 0.86),
    "kids-cotton-shorts":     ("clip", T("shorts", ["#C84B3F", "#8DB3D6", "#EFC64B", "#92D4BA"]) + [B["cutoffs"]], 0.5),
    # outerwear
    "mens-cotton-jackets":    ("clip", T("jacket", [None, "#B49B6B", "#2A3553", "#9C4F33"])),
    "mens-polyester-jackets": ("hang", T("bomber", [None, "#2A2A2E", "#26324F", "#565A35", "#234A3B"])),
}

only = set(sys.argv[3:])
for name, spec in R.items():
    if only and name not in only:
        continue
    kind, items = spec[0], spec[1]
    scale = spec[2] if len(spec) > 2 else 1.0
    p = compose(items, kind, name, scale)
    print(name, os.path.getsize(p) // 1024, "KB")
