"""OG-карточки Aromé 1200x630 (30.10.2026): слева панель с логотипом, рубрикой и заголовком страницы, справа фото страницы.
Основные страницы — тёмная тёплая панель, статьи блога — светлая. Шрифты — те же, что на сайте (src/assets/fonts).
Запуск из папки сайта: node tools/og-list.js > og.json && python tools/og.py og.json  (или python tools/og.py — список соберёт сам).
Только свои фото и заголовки страниц, никаких цифр, которых нет на самих страницах."""
import json, math, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'src', 'assets', 'img')
FONTS = os.path.join(ROOT, 'src', 'assets', 'fonts')
W, H = 1200, 630
PANEL = 640                      # ширина панели с текстом, фото занимает остаток
PAD = 64
STYLES = {
    'main': dict(bg=(42, 37, 34), ink=(244, 243, 239), mute=(185, 175, 164), line=(92, 82, 74)),
    'blog': dict(bg=(244, 243, 239), ink=(17, 22, 24), mute=(91, 100, 104), line=(201, 197, 187)),
}

# Шрифты на сайте разбиты на кириллицу и латиницу: каждый символ рисуем тем файлом, где он есть
def is_cyr(ch):
    return 0x0400 <= ord(ch) <= 0x052F or ch == '№'

_cache = {}
def font(name, size, weight=None):
    key = (name, size, weight)
    if key not in _cache:
        pair = []
        for sub in ('cyrillic', 'latin'):
            f = ImageFont.truetype(os.path.join(FONTS, f'{name}-{sub}.woff2'), size)
            if weight:
                f.set_variation_by_axes([weight])
            pair.append(f)
        _cache[key] = pair
    return _cache[key]

def text_w(s, fonts):
    return sum(fonts[0 if is_cyr(c) else 1].getlength(c) for c in s)

def draw_text(d, xy, s, fonts, fill, spacing=0):
    x, y = xy
    for c in s:
        f = fonts[0 if is_cyr(c) else 1]
        d.text((x, y), c, font=f, fill=fill)
        x += f.getlength(c) + spacing
    return x

def cover(path, w, h, fx=0.5):
    im = Image.open(path)
    if im.mode == 'RGBA':                     # вырезанный аппарат — на тёплый тёмный фон
        bg = Image.new('RGB', im.size, (30, 26, 24))
        bg.paste(im, mask=im.split()[3])
        im = bg
    im = im.convert('RGB')
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    left = round((im.width - w) * fx)
    top = round((im.height - h) / 2)
    return im.crop((left, top, left + w, top + h))

def words(h1):
    """'Ароматизация <em>для бизнеса</em>' -> [('Ароматизация', False), ('для', True), ('бизнеса', True)]"""
    out = []
    for i, part in enumerate(re.split(r'</?em>', h1.replace('&nbsp;', ' '))):
        out += [(w, i % 2 == 1) for w in part.split()]
    return out

def layout(ws, size, width):
    reg, em = font('inter-tight-normal-100-900', size, 500), font('playfair-display-italic-400', round(size * 1.06))
    space = text_w(' ', reg)
    lines, cur, cw = [], [], 0
    for w, it in ws:
        ww = text_w(w, em if it else reg)
        if cur and cw + space + ww > width:
            lines.append(cur); cur, cw = [], 0
        cur.append((w, it, ww)); cw += (space if len(cur) > 1 else 0) + ww
    if cur:
        lines.append(cur)
    return lines, reg, em, space

def contain(path, w, h, bg, pad=48):
    """Вырезанный предмет (аппарат) целиком на однотонном фоне"""
    im = Image.open(path).convert('RGBA')
    k = min((w - pad * 2) / im.width, (h - pad * 2) / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    out = Image.new('RGB', (w, h), bg)
    out.paste(im, ((w - im.width) // 2, (h - im.height) // 2), im)
    return out

def logo_mark(d, fill):
    """AROMÉ разреженным Tenor Sans, как в шапке сайта. Акцент над E — короткий штрих с наклоном 42°, как .logo-e::after в style.css
    (своё É у Tenor Sans выглядит как гравис)"""
    size = 34
    logo = font('tenor-sans-normal-400', size)
    x0, y0 = PAD, PAD - 6
    x_e = draw_text(d, (x0, y0), 'AROM', logo, fill, spacing=size * 0.12)
    draw_text(d, (x_e, y0), 'E', logo, fill)
    e = logo[1].getbbox('E')
    cx, cy = x_e + (e[0] + e[2]) / 2 + size * 0.05, y0 + e[1] - size * 0.16
    hw, hh = size * 0.035, size * 0.09
    ca, sa = math.cos(math.radians(42)), math.sin(math.radians(42))
    pts = [(cx + px * ca - py * sa, cy + px * sa + py * ca) for px, py in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]
    d.polygon(pts, fill=fill)

def card(c):
    st = STYLES[c.get('style', 'main')]
    im = Image.new('RGB', (W, H), st['bg'])
    src = os.path.join(IMG, find(c['photo']))
    photo = contain(src, W - PANEL, H, (234, 232, 226)) if c.get('fit') == 'contain' else cover(src, W - PANEL, H, c.get('fx', 0.5))
    im.paste(photo, (PANEL, 0))
    d = ImageDraw.Draw(im)

    logo_mark(d, st['ink'])

    # заголовок: самый крупный кегль, при котором влезает в 4 строки (статьи — в 5) и в высоту между логотипом и линией
    ws, width = words(c['h1']), PANEL - PAD * 2
    max_lines = 5 if c.get('style') == 'blog' else 4
    y0, y1 = 140, H - PAD - 64           # от рубрики до низа заголовка; линия внизу — на H - PAD - 30
    for size in range(60, 33, -2):
        lines, reg, em, space = layout(ws, size, width)
        lh = round(size * 1.12)
        if len(lines) <= max_lines and 54 + lh * len(lines) <= y1 - y0 \
                and all(sum(x[2] for x in l) + space * (len(l) - 1) <= width for l in lines):
            break
    kick = font('inter-tight-normal-100-900', 19, 500)
    # рубрика + заголовок — по центру между логотипом и линией внизу
    block = 54 + lh * len(lines)
    top = y0 + (y1 - y0 - block) // 2 + 54

    draw_text(d, (PAD, top - 54), c['kicker'].upper(), kick, st['mute'], spacing=19 * 0.1)
    y = top
    for l in lines:
        x = PAD
        for w, it, ww in l:
            f = em if it else reg
            draw_text(d, (x, y + (-round(size * 0.04) if it else 0)), w, f, st['ink'])
            x += ww + space
        y += lh

    # низ: адрес сайта, у статей — ещё время чтения
    foot = font('inter-tight-normal-100-900', 19, 400)
    d.line((PAD, H - PAD - 30, PANEL - PAD, H - PAD - 30), fill=st['line'], width=1)
    draw_text(d, (PAD, H - PAD - 12), 'arome-marketing.kz', foot, st['mute'])
    if c.get('foot'):
        draw_text(d, (PANEL - PAD - text_w(c['foot'], foot), H - PAD - 12), c['foot'], foot, st['mute'])

    out = os.path.join(IMG, c['file'] + '.jpg')
    im.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    return out

def find(slot):
    for ext in ('webp', 'jpg', 'png'):
        if os.path.exists(os.path.join(IMG, f'{slot}.{ext}')):
            return f'{slot}.{ext}'
    raise SystemExit(f'нет фото {slot}')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        items = json.load(open(sys.argv[1], encoding='utf-8'))
    else:
        items = json.loads(subprocess.check_output(['node', os.path.join(ROOT, 'tools', 'og-list.js')], cwd=ROOT).decode('utf-8'))
    only = sys.argv[2:]                       # python tools/og.py og.json og-ceny — одна карточка
    for c in items:
        if not only or c['file'] in only:
            print(os.path.relpath(card(c), ROOT), os.path.getsize(os.path.join(IMG, c['file'] + '.jpg')) // 1024, 'КБ')
