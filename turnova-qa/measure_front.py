"""TURNOVA 시안 정면 비율 실측 (가이드 8장 기준 자동 판정).
사용: python3 turnova-qa/measure_front.py 이미지1.png [이미지2.png ...]
  (필요: pip install numpy pillow)
출력: 블록별 패널 폭 대비 %, 블록 간격, 기준 판정 + turnova-qa/out/thumbs.png (SNS 썸네일 160px 확인용)
판정 기준(가이드 8장): 워드마크 ≤62%, 심볼 ≤12%, 블록 간격 편차 ≤35%
"""
import sys, os
import numpy as np
from PIL import Image

WM_MAX, SYM_MAX, GAP_DEV = 62, 12, 0.35

def blocks(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    cop = (R > 150) & (R - B > 60) & (G < 200)   # 코퍼 잉크·포일
    blue = B > R + 50                             # 로열블루 패널
    rows = np.where(cop.sum(1) > 3)[0]
    if not len(rows): return []
    grp, s, p = [], rows[0], rows[0]
    for r in rows[1:]:
        if r - p > 6: grp.append((s, p)); s = r
        p = r
    grp.append((s, p))
    out = []
    for s, e in grp:
        bl = blue[s:e + 1].any(0)
        if bl.sum() < 100 or e - s < 10: continue          # 패널 밖·잡티 제외
        bc = np.where(bl)[0]
        # 블록 중심이 속한 연속 파란 구간 = 패널 (옆에 놓인 캡 등 제외)
        cols = np.where(cop[s:e + 1].any(0) & bl)[0]
        if not len(cols): continue
        cx = (cols.min() + cols.max()) // 2
        x0 = cx; x1 = cx
        while x0 > 0 and bl[x0 - 1:x0 + 1].any(): x0 -= 1
        while x1 < len(bl) - 1 and bl[x1:x1 + 2].any(): x1 += 1
        cols = cols[(cols >= x0) & (cols <= x1)]
        if not len(cols): continue
        fill = cop[s:e + 1, cols.min():cols.max() + 1].mean()
        if fill > 0.45: continue                             # 캡·밴드 등 금속 면은 제외 (글자는 듬성)
        pw = max(x1 - x0, 1)
        out.append(dict(y0=s, y1=e, h=e - s, w=(cols.max() - cols.min()) * 100 // pw, pw=pw))
    return out

def judge(bs):
    msg = []
    if not bs: return ['코퍼 텍스트 블록 미검출 — 수동 확인']
    big = [b for b in bs if b['h'] > 40]
    wm = next((b for b in bs if b['w'] >= 30), None)          # 첫 넓은 블록 = 워드마크
    if wm:
        msg.append(f"워드마크 {wm['w']}% {'OK' if wm['w'] <= WM_MAX else f'반려(>{WM_MAX}%)'}")
        after = [b for b in bs if b['y0'] > wm['y1'] and b['h'] > wm['h'] * 0.8]
        if after:
            sy = after[0]
            msg.append(f"심볼 {sy['w']}% {'OK' if sy['w'] <= SYM_MAX else f'반려(>{SYM_MAX}%)'}")
            g1 = sy['y0'] - wm['y1']
            nxt = [b for b in bs if b['y0'] > sy['y1']]
            if nxt:
                g2 = nxt[0]['y0'] - sy['y1']
                dev = abs(g1 - g2) / max(g1, g2)
                msg.append(f"간격 워드마크↔심볼 {g1}px / 심볼↔제품명 {g2}px {'OK' if dev <= GAP_DEV else '수정(간격 불균형)'}")
    return msg

def main(paths):
    os.makedirs(os.path.join(os.path.dirname(__file__), 'out'), exist_ok=True)
    thumbs = []
    for p in paths:
        im = Image.open(p).convert('RGB'); a = np.asarray(im).astype(int)
        bs = blocks(a)
        print(f"\n■ {p}")
        print('  블록: ' + ' | '.join(f"y{b['y0']}(h{b['h']}) {b['w']}%" for b in bs[:8]))
        for m in judge(bs): print('  → ' + m)
        t = im.copy(); t.thumbnail((160, 160)); thumbs.append(t)
    if thumbs:
        sheet = Image.new('RGB', (170 * len(thumbs), 170), 'white')
        for i, t in enumerate(thumbs): sheet.paste(t, (170 * i + 5, 5))
        out = os.path.join(os.path.dirname(__file__), 'out', 'thumbs.png'); sheet.save(out)
        print(f"\nSNS 썸네일 시트: {out} (160px에서 워드마크가 읽히는지 육안 확인)")

if __name__ == '__main__':
    main(sys.argv[1:])
