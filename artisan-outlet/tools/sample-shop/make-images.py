"""Illustrations for the sample shop used in the Artisan Outlet manual (no real photos are available offline)."""
import math, random, os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)
S = 1200
random.seed(7)


def lin(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def backdrop(c1, c2):
    im = Image.new("RGB", (S, S), c1)
    d = ImageDraw.Draw(im)
    for y in range(S):
        d.line([(0, y), (S, y)], fill=lin(c1, c2, y / S))
    return im


def grain(im, amount=10):
    n = Image.effect_noise((S, S), amount).convert("RGB")
    return Image.blend(im, n, 0.06)


def shadow(im, box, blur=40, alpha=90):
    sh = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sh).ellipse(box, fill=alpha)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    dark = Image.new("RGB", (S, S), (40, 25, 15))
    return Image.composite(dark, im, sh)


def save(im, name):
    grain(im).save(os.path.join(OUT, name + ".jpg"), quality=88)
    print(name)


# ── Textiles: folded woven cloth with borders and motifs ────────────────────
def textile(name, base, border, motif, stripe=None, bg=((236, 226, 210), (214, 199, 176)), folds=4):
    im = backdrop(*bg)
    im = shadow(im, (170, 900, 1030, 1060))
    d = ImageDraw.Draw(im)
    x0, x1 = 170, 1030
    h = 150
    top = 930 - folds * h
    for i in range(folds):
        y = top + i * h
        shade = 1 - 0.07 * (folds - 1 - i)
        col = tuple(int(c * shade) for c in base)
        d.rectangle([x0, y, x1, y + h - 6], fill=col)
        # weave texture
        for k in range(x0, x1, 6):
            d.line([(k, y), (k, y + h - 6)], fill=tuple(min(255, int(c * 1.05)) for c in col), width=1)
        for k in range(y, y + h - 6, 7):
            d.line([(x0, k), (x1, k)], fill=tuple(int(c * 0.93) for c in col), width=1)
        if stripe:
            for k in range(x0 + 40, x1, 120):
                d.rectangle([k, y, k + 10, y + h - 6], fill=stripe)
        # border band with motifs on the front fold edge
        d.rectangle([x0, y + h - 46, x1, y + h - 8], fill=border)
        for k in range(x0 + 20, x1 - 20, 46):
            cx, cy = k + 12, y + h - 27
            d.polygon([(cx, cy - 13), (cx + 12, cy), (cx, cy + 13), (cx - 12, cy)], fill=motif)
            d.polygon([(cx, cy - 6), (cx + 6, cy), (cx, cy + 6), (cx - 6, cy)], fill=border)
        d.line([(x0, y + h - 6), (x1, y + h - 6)], fill=(60, 40, 25), width=3)
    # big motif on the top fold
    cx, cy = 600, top + 60
    for r in (70, 50, 28):
        d.ellipse([cx - r * 1.6, cy - r * 0.5, cx + r * 1.6, cy + r * 0.5], outline=motif, width=5)
    save(im, name)


# ── Basketry ────────────────────────────────────────────────────────────────
def basket(name, cane=(196, 150, 88), bg=((222, 233, 214), (190, 206, 180)), tall=False):
    im = backdrop(*bg)
    im = shadow(im, (230, 920, 970, 1080))
    d = ImageDraw.Draw(im)
    top_y, bot_y = (300, 980) if tall else (430, 980)
    tw, bw = (360, 260) if tall else (390, 300)
    rows = int((bot_y - top_y) / 22)
    for i in range(rows):
        t = i / rows
        y = top_y + i * 22
        w = tw + (bw - tw) * t
        col = lin(tuple(int(c * 1.08) for c in cane), tuple(int(c * 0.75) for c in cane), t * 0.8)
        for j in range(-int(w), int(w), 34):
            off = 17 if i % 2 else 0
            x = 600 + j + off
            if x + 30 > 600 + w:
                continue
            d.rounded_rectangle([x, y, x + 30, y + 19], radius=8, fill=col, outline=tuple(int(c * 0.6) for c in cane))
    d.ellipse([600 - tw - 10, top_y - 50, 600 + tw + 10, top_y + 40], outline=tuple(int(c * 0.55) for c in cane), width=26)
    d.ellipse([600 - tw + 30, top_y - 26, 600 + tw - 30, top_y + 18], fill=tuple(int(c * 0.45) for c in cane))
    save(im, name)


# ── Pottery ─────────────────────────────────────────────────────────────────
def pot(name, clay=(176, 88, 50), bg=((240, 226, 205), (220, 196, 165))):
    im = backdrop(*bg)
    im = shadow(im, (300, 960, 900, 1090))
    d = ImageDraw.Draw(im)
    pts = []
    for y in range(330, 1010, 4):
        t = (y - 330) / 680
        r = 120 + 230 * math.sin(math.pi * min(1, t * 1.15)) ** 0.8 if t > 0.12 else 135 - t * 80
        pts.append((y, r))
    for y, r in pts:
        for x in range(int(600 - r), int(600 + r), 3):
            u = (x - 600) / max(r, 1)
            light = 0.55 + 0.6 * max(0, math.cos((u + 0.35) * 1.4))
            d.line([(x, y), (x + 3, y + 4)], fill=tuple(min(255, int(c * light)) for c in clay))
    d.ellipse([460, 300, 740, 360], fill=tuple(int(c * 0.5) for c in clay), outline=tuple(int(c * 1.1) for c in clay), width=10)
    for y in (560, 600):
        d.arc([260, y - 40, 940, y + 40], 10, 170, fill=(245, 230, 205), width=6)
    for k in range(330, 870, 60):
        d.ellipse([k, 660, k + 18, 678], fill=(245, 230, 205))
    save(im, name)


def horse(name, clay=(181, 92, 52), bg=((236, 222, 202), (214, 190, 160))):
    im = backdrop(*bg)
    im = shadow(im, (300, 960, 920, 1080))
    d = ImageDraw.Draw(im)
    body = tuple(int(c * 1.0) for c in clay)
    dark = tuple(int(c * 0.7) for c in clay)
    d.rounded_rectangle([360, 560, 860, 760], radius=100, fill=body)
    for x in (400, 480, 740, 820):
        d.rounded_rectangle([x, 720, x + 46, 1000], radius=20, fill=dark)
    d.polygon([(780, 600), (880, 330), (960, 330), (900, 640)], fill=body)
    d.ellipse([860, 280, 1000, 380], fill=body)
    d.polygon([(900, 270), (920, 210), (945, 280)], fill=dark)
    d.ellipse([930, 310, 948, 328], fill=(40, 25, 15))
    d.polygon([(370, 600), (270, 760), (300, 770), (390, 650)], fill=dark)
    for x in range(420, 840, 40):
        d.ellipse([x, 640, x + 16, 656], fill=(245, 228, 200))
    d.line([(820, 420), (930, 360)], fill=(245, 228, 200), width=8)
    save(im, name)


# ── Bell metal ──────────────────────────────────────────────────────────────
def bowl(name, metal=(201, 160, 72), bg=((60, 52, 46), (34, 30, 27))):
    im = backdrop(*bg)
    im = shadow(im, (260, 900, 940, 1050), alpha=140)
    d = ImageDraw.Draw(im)
    for y in range(520, 940, 2):
        t = (y - 520) / 420
        r = 360 * math.sqrt(max(0, 1 - t * t * 0.92))
        for x in range(int(600 - r), int(600 + r), 3):
            u = (x - 600) / max(r, 1)
            light = 0.45 + 0.85 * max(0, math.cos((u + 0.3) * 1.6)) ** 2
            d.line([(x, y), (x + 3, y)], fill=tuple(min(255, int(c * light)) for c in metal))
    d.ellipse([240, 470, 960, 580], fill=tuple(int(c * 0.55) for c in metal), outline=tuple(min(255, int(c * 1.35)) for c in metal), width=14)
    d.rounded_rectangle([470, 930, 730, 975], radius=18, fill=tuple(int(c * 0.8) for c in metal))
    for k in range(5):
        d.arc([280 + k * 6, 600 + k * 40, 920 - k * 6, 700 + k * 40], 15, 165, fill=tuple(min(255, int(c * 1.25)) for c in metal), width=2)
    save(im, name)


# ── Japi hat ────────────────────────────────────────────────────────────────
def japi(name, bg=((214, 228, 222), (178, 200, 190))):
    im = backdrop(*bg)
    im = shadow(im, (200, 820, 1000, 990))
    d = ImageDraw.Draw(im)
    d.ellipse([140, 450, 1060, 900], fill=(170, 120, 60))
    for r in range(440, 40, -26):
        d.ellipse([600 - r, 675 - r * 0.49, 600 + r, 675 + r * 0.49], outline=(205, 158, 90), width=9)
    d.polygon([(600, 330), (360, 620), (840, 620)], fill=(188, 138, 72))
    for k in range(9):
        d.line([(600, 330), (360 + k * 60, 620)], fill=(150, 100, 48), width=4)
    d.ellipse([300, 560, 900, 690], outline=(200, 40, 40), width=22)
    for k in range(0, 360, 30):
        a = math.radians(k)
        x, y = 600 + 300 * math.cos(a), 625 + 65 * math.sin(a)
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(235, 200, 60))
    save(im, name)


# ── Water hyacinth mat ──────────────────────────────────────────────────────
def mat(name, bg=((232, 222, 200), (206, 190, 160))):
    im = backdrop(*bg)
    im = shadow(im, (150, 880, 1050, 1060))
    d = ImageDraw.Draw(im)
    poly = [(250, 330), (1000, 380), (950, 960), (180, 910)]
    d.polygon(poly, fill=(160, 130, 80))
    for i in range(0, 30):
        t = i / 30
        a = lin(poly[0], poly[3], t)
        b = lin(poly[1], poly[2], t)
        d.line([a, b], fill=(196, 166, 108) if i % 2 else (140, 112, 66), width=12)
    for i in range(0, 34):
        t = i / 34
        a = lin(poly[0], poly[1], t)
        b = lin(poly[3], poly[2], t)
        d.line([a, b], fill=(120, 94, 54), width=3)
    d.polygon(poly, outline=(96, 70, 38), width=14)
    save(im, name)


# ── Artisan portraits (illustrated) ─────────────────────────────────────────
def portrait(name, bg, skin, hair, cloth, accent, woman=True):
    im = backdrop(bg, tuple(int(c * 0.82) for c in bg))
    d = ImageDraw.Draw(im)
    # shoulders and garment
    d.rounded_rectangle([230, 760, 970, 1300], radius=260, fill=cloth)
    if woman:
        d.polygon([(330, 800), (520, 760), (760, 1300), (520, 1300)], fill=accent)
        d.line([(340, 810), (560, 1300)], fill=tuple(min(255, int(c * 1.3)) for c in accent), width=14)
    else:
        d.polygon([(520, 770), (600, 900), (680, 770)], fill=accent)
    d.rectangle([540, 640, 660, 800], fill=tuple(int(c * 0.9) for c in skin))
    # head
    d.ellipse([420, 300, 780, 720], fill=skin)
    d.chord([405, 270, 795, 640], 180, 360, fill=hair)
    if woman:
        d.ellipse([560, 230, 690, 330], fill=hair)
        d.rectangle([405, 430, 450, 640], fill=hair)
        d.rectangle([750, 430, 795, 640], fill=hair)
        d.ellipse([592, 400, 608, 416], fill=(180, 30, 40))
    else:
        d.rectangle([405, 430, 432, 520], fill=hair)
        d.rectangle([768, 430, 795, 520], fill=hair)
    # gentle face: eyes and smile
    for x in (535, 665):
        d.ellipse([x - 14, 488, x + 14, 502], fill=(50, 35, 28))
    d.arc([555, 560, 645, 620], 20, 160, fill=(120, 60, 50), width=6)
    save(im, name)


textile("muga-mekhela", base=(214, 170, 82), border=(150, 30, 40), motif=(245, 215, 120))
textile("eri-stole", base=(232, 216, 188), border=(110, 70, 40), motif=(170, 120, 70), stripe=(205, 180, 140), folds=3)
textile("gamosa", base=(246, 244, 238), border=(178, 26, 38), motif=(178, 26, 38), bg=((228, 232, 224), (196, 204, 190)), folds=3)
textile("phanek", base=(120, 30, 48), border=(30, 30, 60), motif=(232, 196, 90), stripe=(70, 20, 40))
basket("cane-basket")
basket("bamboo-tray", cane=(214, 176, 112), tall=False, bg=((236, 226, 206), (210, 194, 168)))
japi("japi")
mat("hyacinth-mat")
pot("terracotta-pot")
horse("terracotta-horse")
bowl("kahi-bowl")
bowl("bota-tray", metal=(190, 150, 70), bg=((70, 58, 50), (40, 34, 30)))
portrait("artisan-rupa", (225, 206, 180), (196, 150, 112), (40, 30, 26), (214, 170, 82), (150, 30, 40), True)
portrait("artisan-hemanta", (214, 196, 170), (178, 128, 92), (30, 26, 24), (240, 236, 226), (176, 88, 50), False)
portrait("artisan-dipali", (206, 222, 200), (188, 140, 104), (36, 28, 24), (60, 110, 80), (220, 180, 90), True)
portrait("artisan-bikash", (196, 190, 176), (170, 122, 88), (24, 22, 20), (70, 60, 52), (201, 160, 72), False)
# a couple of process / workshop pictures
textile("process-loom", base=(214, 170, 82), border=(150, 30, 40), motif=(245, 215, 120), bg=((120, 96, 70), (80, 62, 46)), folds=2)
pot("process-firing", clay=(150, 70, 40), bg=((90, 60, 40), (50, 34, 24)))


# ── Proof photos the artisan "takes" in phase 5 ──────────────────────────────
def parcel(name):
    im = Image.new("RGB", (1200, 1600), (196, 184, 166)); d = ImageDraw.Draw(im)
    for y in range(1600): d.line([(0, y), (1200, y)], fill=(200 - y // 40, 188 - y // 45, 170 - y // 50))
    d.polygon([(250, 700), (700, 560), (1000, 700), (550, 860)], fill=(200, 156, 98))
    d.polygon([(250, 700), (550, 860), (550, 1300), (250, 1130)], fill=(172, 128, 74))
    d.polygon([(550, 860), (1000, 700), (1000, 1130), (550, 1300)], fill=(150, 108, 60))
    for a, b2 in [((400, 780), (850, 620)), ((400, 780), (400, 1215)), ((700, 780), (700, 1220))]: d.line([a, b2], fill=(230, 220, 190), width=10)
    d.rectangle([620, 900, 900, 1040], fill=(250, 248, 240))
    for i in range(5): d.line([(640, 925 + i * 24), (870 - random.randint(0, 80), 925 + i * 24)], fill=(90, 90, 90), width=5)
    im.save(os.path.join(OUT, name + ".jpg"), quality=85); print(name)


def docket(name):
    im = Image.new("RGB", (1200, 1600), (120, 110, 100)); d = ImageDraw.Draw(im)
    d.rectangle([220, 200, 980, 1400], fill=(246, 244, 236)); d.rectangle([220, 200, 980, 330], fill=(200, 40, 40))
    d.text((260, 240), "INDIA POST  SPEED POST", fill=(255, 255, 255))
    for i in range(30):
        y = 380 + i * 32; d.line([(260, y), (260 + random.randint(250, 680), y)], fill=(80, 80, 80), width=6)
    for i in range(60):
        x = 300 + i * 10; d.rectangle([x, 1250, x + random.choice([3, 5, 7]), 1350], fill=(20, 20, 20))
    im.save(os.path.join(OUT, name + ".jpg"), quality=85); print(name)


def site_icon(name):
    im = Image.new("RGB", (512, 512), (138, 75, 31)); d = ImageDraw.Draw(im)
    d.ellipse([86, 86, 426, 426], outline=(251, 247, 242), width=22)
    for r in range(60, 160, 28): d.arc([256 - r, 256 - r, 256 + r, 256 + r], 200, 340, fill=(251, 247, 242), width=14)
    d.polygon([(256, 300), (196, 380), (316, 380)], fill=(251, 247, 242))
    im.save(os.path.join(OUT, name + ".png")); print(name)


parcel("parcel")
docket("docket")
site_icon("site-icon")
