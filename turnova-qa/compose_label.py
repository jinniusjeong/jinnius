"""TURNOVA 정면 라벨을 정확한 비율(가이드 8장)로 무지 용기 사진에 합성.
AI 이미지 생성기가 비율을 지키지 못해(v9~v11 심볼 22~40%) 도입. 라벨은 코드로 그리고, 용기·조명만 AI 사진을 쓴다.
사용: python3 turnova-qa/compose_label.py <무지이미지> <SKU키> <출력.png>
필요: pip install numpy pillow cairosvg ; apt fonts-montserrat
"""
import sys, io, re, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cairosvg

ROOT = __file__.rsplit('/turnova-qa/', 1)[0]
SYM = open(ROOT + '/turnova-brand-assets/turnova-symbol-8-copper.svg').read()
LOGO = ROOT + '/turnova-brand-assets/turnova-logo.png'
F = '/usr/share/fonts/truetype/montserrat/Montserrat-%s.ttf'

# 가이드 8장 비율 (패널 폭 W 대비)
WM = 0.55        # 워드마크 폭 (슬림 용기 권장 55%, 상한 62%)
SY = 0.11        # 심볼 폭 (10~12%)
FOIL_MIN_MM = 0.15
INK_MIN_MM = 1.2   # 잉크 최소 대문자 높이
VOL_MIN_MM = 1.6   # 용량 표기 최소 높이 (US FPLA 소형 PDP 1/16 inch)

# SKU별: 라벨 영역(y0,y1), 패널 폭 기준행, 실제 정면 폭 mm(가정), 원통 여부, 문구
SKUS = {
 'tube':    dict(zone=(330, 1880), mm=50, cyl=False, name=['THE PEELING BALM CREAM'], vol='80 mL / 2.7 fl oz', benefit=True),
 'ampoule': dict(zone=(720, 2170), mm=22, cyl=True,  name=['THE AMPOULE'],             vol='30 mL / 1.0 fl oz', benefit=True),
 'serum':   dict(zone=(850, 2060), mm=36, cyl=True,  name=['THE SERUM'],               vol='30 mL / 1.0 fl oz', benefit=True),
 'jar':     dict(zone=(760, 1450), mm=60, cyl=True, wm=0.48, sy=0.10, g=0.55, name=['THE CREAM'], vol='30 mL / 1.0 fl oz', benefit=False),  # 낮고 넓은 정면: 높이 기준으로 축소
 'stick':   dict(zone=(770, 1600), mm=40, cyl=True, wm=0.49,  name=['THE PEELING BALM', 'STICK'], vol='15 g / 0.53 oz', benefit=False),
}

def blue_mask(a):
    return (a[..., 2] > a[..., 0] + 50) & (a[..., 2] > 90)

def panel_at(m, y, cx=None):
    xs = np.where(m[y])[0]
    runs, s, p = [], xs[0], xs[0]
    for x in xs[1:]:
        if x - p > 3: runs.append((s, p)); s = x
        p = x
    runs.append((s, p))
    runs = [r for r in runs if r[1] - r[0] > 30]
    if cx is None: return max(runs, key=lambda r: r[1] - r[0])
    return min(runs, key=lambda r: abs((r[0] + r[1]) / 2 - cx))

def text_img(txt, font, size, track):
    f = ImageFont.truetype(F % font, size)
    w = sum(f.getlength(c) for c in txt) + track * size * (len(txt) - 1)
    asc, desc = f.getmetrics()
    im = Image.new('L', (int(w) + 4, asc + desc + 4), 0); d = ImageDraw.Draw(im); x = 2
    for c in txt:
        d.text((x, 2), c, font=f, fill=255); x += f.getlength(c) + track * size
    return im.crop(im.getbbox())

def fit(txt, font, track, cap_px, max_w, min_px=0):
    size = max(6, math.ceil(max(cap_px, min_px) / 0.70))
    im = text_img(txt, font, size, track)
    while im.width > max_w and size > 6:
        size -= 1; im = text_img(txt, font, size, track)
    im.ok = size * 0.70 >= min_px * 0.97
    return im

def trx(cap_px, max_w, min_px):
    base = fit('TRX-8', 'Regular', 0.06, cap_px, max_w, min_px)
    tm = text_img('TM', 'Medium', max(6, int(base.height * 0.42 / 0.70)), 0.02)
    im = Image.new('L', (base.width + tm.width + int(base.height * 0.12), base.height), 0)
    im.paste(base, (0, 0)); im.paste(tm, (base.width + int(base.height * 0.12), 0)); im.ok = base.ok
    return im

def symbol(px, mm_per_px):
    stroke = max(9, FOIL_MIN_MM / mm_per_px / (px * 0.88) * 880)   # 최소 0.15 mm 선 굵기 보정
    svg = re.sub(r'stroke-width="[\d.]+"', f'stroke-width="{stroke:.1f}"', SYM)
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=px * 4, output_height=px * 4)
    im = Image.open(io.BytesIO(png)).convert('RGBA').split()[3]
    return im.resize((px, px), Image.LANCZOS)

def main(src, key, out):
    cfg = SKUS[key]
    base = Image.open(src).convert('RGB'); a = np.asarray(base).astype(float)
    m = blue_mask(a.astype(int)); y0, y1 = cfg['zone']
    x0, x1 = panel_at(m, (y0 + y1) // 2); cx = (x0 + x1) / 2
    W = x1 - x0; mmpp = cfg['mm'] / W
    # --- 요소 생성 (흑백 마스크) ---
    logo = Image.open(LOGO).convert('L'); logo = Image.eval(logo, lambda v: 255 - v); logo = logo.crop(logo.getbbox())
    wm_w = int(W * cfg.get('wm', WM)); wm = logo.resize((wm_w, int(logo.height * wm_w / logo.width)), Image.LANCZOS)
    sy = symbol(int(W * cfg.get('sy', SY)), mmpp)
    capH = wm.height                                   # 워드마크 대문자 높이
    ink_min = INK_MIN_MM / mmpp
    name_min = VOL_MIN_MM / mmpp                       # 위계: 제품명 ≥ 용량 (법정 최소 높이 이상)
    names = [fit(n, 'SemiBold', 0.16 if fit(n, 'SemiBold', 0.16, capH * 0.36, W * 0.74, name_min).ok else 0.07, capH * 0.36, W * 0.74, name_min) for n in cfg['name']]
    tx = trx(capH * 0.30, W * 0.6, ink_min)
    ben = [fit(t, 'Medium', 0.10, capH * 0.20, W * 0.78, ink_min) for t in ['OVERNIGHT RESURFACING', 'SMOOTHER-LOOKING SKIN']] if cfg['benefit'] else []  # 2줄 조판 시 가운뎃점 생략
    notes = []
    if ben and not all(b.ok for b in ben):
        ben = []; notes.append(f'효능 줄 생략(정면 폭에서 {INK_MIN_MM} mm 미달 → 후면 이동)')
    vol = fit(cfg['vol'], 'Light', 0.04, capH * 0.26, W * 0.7, VOL_MIN_MM / mmpp)
    if not vol.ok:                                       # 좁은 용기: 용량 2줄로 (법정 최소 높이 유지)
        parts = [fit(t, 'Light', 0.04, capH * 0.26, W * 0.7, VOL_MIN_MM / mmpp) for t in cfg['vol'].split(' / ')]
        gap = int(parts[0].height * 0.45); im = Image.new('L', (max(p.width for p in parts), sum(p.height for p in parts) + gap), 0)
        im.paste(parts[0], ((im.width - parts[0].width) // 2, 0)); im.paste(parts[1], ((im.width - parts[1].width) // 2, parts[0].height + gap))
        im.ok = all(p.ok for p in parts); vol = im; notes.append('용량 2줄')
    for n, lab in zip(names + [tx, vol], cfg['name'] + ['TRX-8', '용량']):
        if not n.ok: notes.append(f'{lab} 최소 높이 미달')
    # --- 세로 배치: 워드마크↔심볼 = 심볼↔제품명 = G (간격 균등) ---
    G = int(capH * 1.1 * cfg.get('g', 1) / 0.55 * 0.55) if 'g' not in cfg else int(capH * cfg['g'])
    stack = [('foil', wm), ('gap', G), ('foil', sy), ('gap', G)]
    for i, n in enumerate(names): stack += [('ink', n), ('gap', int(capH * 0.18))]
    stack += [('gap', int(capH * 0.30)), ('ink', tx)]
    if ben: stack += [('gap', int(capH * 0.75)), ('ink', ben[0]), ('gap', int(capH * 0.12)), ('ink', ben[1])]
    total = sum(v if t == 'gap' else v.height for t, v in stack)
    zone = y1 - y0
    top = y0 + int((zone - total) * 0.40)               # 광학 중심: 기하 중심보다 위
    L_foil = Image.new('L', base.size, 0); L_ink = Image.new('L', base.size, 0)
    y = top
    for t, v in stack:
        if t == 'gap': y += v; continue
        xx, _ = panel_at(m, min(y + v.height // 2, base.height - 1), cx)
        px0, px1 = panel_at(m, min(y + v.height // 2, base.height - 1), cx); c = (px0 + px1) / 2
        (L_foil if t == 'foil' else L_ink).paste(v, (int(c - v.width / 2), y), v); y += v.height
    vy = y1 - vol.height
    L_ink.paste(vol, (int(cx - vol.width / 2), vy), vol)
    lf = np.asarray(L_foil).astype(float) / 255; li = np.asarray(L_ink).astype(float) / 255
    # --- 원통 압축 (가장자리로 갈수록 좁아짐) ---
    if cfg['cyl']:
        R = W / 2; xs = np.arange(base.width) - cx
        d = np.clip(xs / R, -1, 1); src_x = cx + R * np.arcsin(d) * 0.92
        idx = np.clip(src_x.round().astype(int), 0, base.width - 1)
        inside = np.abs(xs) < R * 0.98
        lf = np.where(inside[None, :], lf[:, idx], 0); li = np.where(inside[None, :], li[:, idx], 0)
    # --- 재질: 바디 음영을 따라가는 코퍼 ---
    lum = a.mean(2); body_lum = np.median(lum[m]); shade = np.clip(lum / body_lum, 0.55, 1.35)[..., None]
    ink = np.array([226, 160, 116]) * np.clip(shade, 0.85, 1.2) ** 0.6                      # 무광 코퍼 잉크
    yy = np.linspace(0, 1, base.height)[:, None, None]
    xxn = ((np.arange(base.width) - cx) / (W / 2))[None, :, None]
    shine = np.exp(-((xxn + 0.22) ** 2) / 0.03) + 0.55 * np.exp(-((xxn - 0.35) ** 2) / 0.02)                  # 유광 포일 하이라이트 띠
    foil = np.array([150, 78, 44]) + (np.array([255, 226, 196]) - np.array([150, 78, 44])) * np.clip(shine * 1.0 + 0.35 * (shade - 0.6), 0, 1)
    out_a = a * (1 - li[..., None]) + ink * li[..., None]
    out_a = out_a * (1 - lf[..., None]) + foil * lf[..., None]
    Image.fromarray(np.clip(out_a, 0, 255).astype(np.uint8)).save(out)
    print(f'{key}: 패널 {W}px ≈{cfg["mm"]}mm, 워드마크 {WM:.0%}, 심볼 {SY:.0%} ({SY*cfg["mm"]:.1f} mm), 간격 G={G}px {" / ".join(notes)} → {out}')

if __name__ == '__main__':
    main(*sys.argv[1:4])
