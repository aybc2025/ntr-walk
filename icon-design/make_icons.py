"""NTR Walk icons: a street running to the horizon (asphalt, sidewalks, the yellow
centre line) with a red record dot. Same palette as the app and the Narrow the Road site.
Drawn at 8x and downsampled with LANCZOS. Run: python icon-design/make_icons.py"""
from PIL import Image, ImageDraw
import os

ASPHALT = (30, 34, 39); ROAD = (78, 85, 92); WALK = (168, 162, 150)
LINE = (245, 197, 24); REC = (229, 72, 77); WHITE = (242, 241, 236)
S = 4096
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')


def scene(scale=1.0, bold=False):
    im = Image.new('RGB', (S, S), ASPHALT)
    d = ImageDraw.Draw(im)
    c = S / 2
    k = lambda v: c + (v - c) * scale  # shrink toward centre for the maskable safe zone
    hz = k(S * 0.40)                    # horizon
    bot = k(S * 0.92)
    vx = c
    half_top = S * 0.012 * scale
    # sidewalks
    d.polygon([(k(S * 0.06), bot), (vx - half_top * 3, hz), (vx + half_top * 3, hz), (k(S * 0.94), bot)], fill=WALK)
    # road
    d.polygon([(k(S * 0.20), bot), (vx - half_top, hz), (vx + half_top, hz), (k(S * 0.80), bot)], fill=ROAD)
    # centre line dashes, growing toward the viewer
    n = 4
    for i in range(n):
        t0 = (i + 0.35) / n
        t1 = (i + 0.8) / n
        y0 = hz + (bot - hz) * t0 ** 1.6
        y1 = hz + (bot - hz) * t1 ** 1.6
        w0 = S * (0.006 + 0.03 * t0 ** 1.6) * scale * (1.5 if bold else 1)
        w1 = S * (0.006 + 0.03 * t1 ** 1.6) * scale * (1.5 if bold else 1)
        d.polygon([(vx - w0, y0), (vx + w0, y0), (vx + w1, y1), (vx - w1, y1)], fill=LINE)
    # record dot with a ring
    r = S * 0.12 * scale
    cx, cy = k(S * 0.73), k(S * 0.22)
    d.ellipse([cx - r * 1.28, cy - r * 1.28, cx + r * 1.28, cy + r * 1.28], fill=ASPHALT)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=REC)
    return im


def save(im, size, name):
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)


os.makedirs(OUT, exist_ok=True)
full = scene(1.0)
save(full, 512, 'icon-512.png')
save(full, 192, 'icon-192.png')
save(full, 180, 'apple-touch-icon.png')
save(scene(1.0, bold=True), 32, 'favicon-32.png')
save(scene(0.72), 512, 'icon-512-maskable.png')  # content inside the ~72% safe zone
print('icons written to', os.path.abspath(OUT))
