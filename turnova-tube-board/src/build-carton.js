// Builds carton.html (단상자 시안 + 규칙): head.html tokens + defs.html gradients/symbol + carton-data.js.
// node build-carton.js        → 아티팩트용 (대표 레퍼런스 사진 포함)
// node build-carton.js --repo → 저장소용 (타사 사진 제외)
const fs = require('fs');
require('./combos.js');
const T = globalThis.TNC, C = require('./carton-data.js');
const REPO = process.argv.includes('--repo');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f = n => (+n).toFixed(1);
const BLUE = '#1D2795', BLUE_D = '#151D78', CU = '#E3A27A', CU_D = '#C98757', WHITE = '#F4EEE8';
const MONT = "font-family=\"Montserrat, 'Helvetica Neue', Arial, sans-serif\"", SANS = "font-family=\"'IBM Plex Sans KR', sans-serif\"";

// ---------- panels (x, y, w, h in px; k = px per mm) ----------
function front(x, y, w, h, s, k) {
  const low = h < w * 1.05;
  const wmW = w * (low ? 0.6 : 0.87), wmFs = wmW / 5.3, wmTop = y + h * (low ? 0.12 : 0.13);
  const wmBase = wmTop + wmFs * 0.72;
  let o = `<text x="${f(x + w / 2)}" y="${f(wmBase)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(wmFs)}" textLength="${f(wmW)}" lengthAdjust="spacingAndGlyphs" fill="url(#foil)">TURNOVA</text>`;
  const nameFs = Math.max(wmFs / 1.618, 2.6 * k) * (low ? 0.8 : 1), krFs = Math.max(nameFs * 0.62, 1.9 * k), idFs = Math.max(nameFs / 1.9, 1.7 * k), cdFs = idFs;
  const volFs = 4.6 * k * (low ? 0.8 : 1);
  const lines = low ? [s.L1 + ' ' + s.L2] : [s.L1, s.L2];
  const fits = (t, fs, r) => t.length * 0.58 * fs <= w * r;
  const volLines = fits(s.vol, volFs, 0.88) ? [s.vol] : s.vol.split(' | ');
  const volBase = y + h * (low ? 0.92 : 0.9);
  const volTop = volBase - (volLines.length - 1) * volFs * 1.12 - volFs * 0.72;
  const blockH = lines.length * nameFs * 1.18 + krFs * 1.5 + (low ? 0 : idFs * 1.5) + cdFs * 1.6;
  const nameTop = low ? volTop - blockH - 1 * k : Math.min(y + h * 0.5, volTop - blockH - 4 * k);
  const gap = nameTop - wmBase, symS = Math.max(0, Math.min(wmW * (low ? 0.16 : 0.236), gap * 0.6));
  const symC = wmBase + gap * (low ? 0.5 : 0.382);
  o += `<use href="#tn8" x="${f(x + w / 2 - symS / 2)}" y="${f(symC - symS / 2)}" width="${f(symS)}" height="${f(symS)}" style="color:${CU}"/>`;
  const fit = (t, fs, r) => fits(t, fs, r) ? '' : `textLength="${f(w * r)}" lengthAdjust="spacingAndGlyphs"`;
  let ty = nameTop + nameFs * 0.8;
  lines.forEach(t => { o += `<text x="${f(x + w / 2)}" y="${f(ty)}" text-anchor="middle" ${MONT} font-weight="600" font-size="${f(nameFs)}" letter-spacing="${f(nameFs * 0.06)}" ${fit(t, nameFs * 1.1, 0.86)} fill="${CU}">${t}</text>`; ty += nameFs * 1.18; });
  o += `<text x="${f(x + w / 2)}" y="${f(ty + krFs * 0.2)}" text-anchor="middle" ${SANS} font-weight="500" font-size="${f(krFs)}" ${s.kr.length * krFs > w * 0.86 ? `textLength="${f(w * 0.86)}" lengthAdjust="spacingAndGlyphs"` : ''} fill="${CU}">${s.kr}</text>`;
  ty += krFs * 1.5;
  if (!low) { o += `<text x="${f(x + w / 2)}" y="${f(ty + idFs * 0.2)}" text-anchor="middle" ${MONT} font-style="italic" font-weight="500" font-size="${f(idFs)}" ${fit(s.claim, idFs, 0.86)} fill="${CU}" opacity=".9">${s.claim}</text>`; ty += idFs * 1.5; }
  o += `<text x="${f(x + w / 2)}" y="${f(ty + cdFs * 0.2)}" text-anchor="middle" ${MONT} font-weight="600" font-size="${f(cdFs)}" letter-spacing="${f(cdFs * 0.08)}" fill="url(#foil)">with TERN-8™</text>`;
  volLines.forEach((t, i) => { o += `<text x="${f(x + w / 2)}" y="${f(volBase - (volLines.length - 1 - i) * volFs * 1.12)}" text-anchor="middle" ${MONT} font-weight="400" font-size="${f(volFs)}" ${fit(t, volFs, 0.9)} fill="${CU}">${t}</text>`; });
  return o;
}
function productArt(s) {
  // returns [inner svg, viewBox] drawn with the board's own renderers (combos.js)
  const p = s.product;
  if (p.kind === 'tube') {
    const sh = T.SHAPES[p.o.shape], o = Object.assign({ name: s.L1 + '|' + s.L2, vol: s.vol }, p.o), hgt = sh.bodyH + 40 + 14 + 18;
    return [T.tube(0, 0, o), `${f(-sh.w / 2 - 14)} ${f(-hgt - 6)} ${f(sh.w + 28)} ${f(hgt + 22)}`];
  }
  if (p.kind === 'bottle') return [T.bottle(0, 0, p.o, s.L1 + '|' + s.L2, s.vol), '-70 -262 140 284'];
  return [T.jar(0, 0, p.o, 1), '-80 -108 160 124'];
}
function left(x, y, w, h, s, k) {
  const zone = h * 0.28, artH = h - zone - 6 * k;
  const [inner, vb] = productArt(s);
  let o = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h - zone)}" fill="url(#cartonPhoto)"/>`;
  o += `<svg x="${f(x + w * 0.08)}" y="${f(y + 4 * k)}" width="${f(w * 0.84)}" height="${f(artH)}" viewBox="${vb}" preserveAspectRatio="xMidYMax meet">${inner}</svg>`;
  o += `<rect x="${f(x + 3 * k)}" y="${f(y + h - zone + 2 * k)}" width="${f(w - 6 * k)}" height="${f(zone - 5 * k)}" fill="none" stroke="${CU}" stroke-dasharray="3 3" opacity=".7"/>`;
  o += `<text x="${f(x + w / 2)}" y="${f(y + h - zone / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(Math.min(2.6 * k, w / 9))}" fill="${WHITE}" opacity=".8">스티커 존</text>`;
  return o;
}
function bars(x, y, w, n, lh, k, op) { let o = ''; for (let i = 0; i < n; i++) o += `<rect x="${f(x)}" y="${f(y + i * lh)}" width="${f(w * (i === n - 1 ? 0.55 : (0.86 + ((i * 37) % 13) / 100)))}" height="${f(lh * 0.42)}" rx="1" fill="${WHITE}" opacity="${op || 0.55}"/>`; return o; }
function back(x, y, w, h, s, k) {
  const m = 3 * k, iw = w - 2 * m, hf = Math.max(2.1 * k, 4.4), lh = Math.max(1.35 * k, 3);
  let o = '', cy = y + m + hf;
  const head = t => { o += `<text x="${f(x + m)}" y="${f(cy)}" ${SANS} font-weight="600" font-size="${f(hf)}" fill="${WHITE}">${t}</text>`; cy += hf * 0.6; };
  const avail = h - 2 * m - 18 * k;
  const nKr = Math.max(3, Math.round(avail * 0.34 / lh)), nEn = Math.max(3, Math.round(avail * 0.3 / lh)), nUse = Math.max(2, Math.round(avail * 0.12 / lh));
  head('전성분'); o += bars(x + m, cy, iw, nKr, lh, k); cy += nKr * lh + hf * 1.2;
  head('INGREDIENTS'); o += bars(x + m, cy, iw, nEn, lh, k); cy += nEn * lh + hf * 1.2;
  head('사용법 · 주의사항'); o += bars(x + m, cy, iw, nUse, lh, k, 0.4); cy += nUse * lh + hf * 0.8;
  const by = y + h - m - 12 * k, sz = Math.min(10 * k, iw / 4.2);
  o += `<rect x="${f(x + m)}" y="${f(by)}" width="${f(sz)}" height="${f(sz)}" fill="${WHITE}"/><text x="${f(x + m + sz / 2)}" y="${f(by + sz / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(sz * 0.26)}" fill="${BLUE}">QR</text>`;
  o += `<rect x="${f(x + m + sz * 1.25)}" y="${f(by)}" width="${f(sz)}" height="${f(sz)}" rx="${f(sz / 2)}" fill="none" stroke="${WHITE}"/><text x="${f(x + m + sz * 1.75)}" y="${f(by + sz / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(sz * 0.3)}" fill="${WHITE}">12M</text>`;
  o += `<rect x="${f(x + m + sz * 2.5)}" y="${f(by)}" width="${f(sz)}" height="${f(sz)}" fill="none" stroke="${WHITE}" stroke-dasharray="2 2"/><text x="${f(x + m + sz * 3)}" y="${f(by + sz / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(sz * 0.22)}" fill="${WHITE}">분리배출</text>`;
  o += `<text x="${f(x + m)}" y="${f(y + h - m)}" ${SANS} font-size="${f(Math.max(1.6 * k, 3.4))}" fill="${WHITE}" opacity=".8">책임판매업자 · Made in Korea</text>`;
  return o;
}
function right(x, y, w, h, s, k) {
  const m = 3 * k, iw = w - 2 * m;
  let o = '', cy = y + m;
  const br = Math.min(6 * k, iw * 0.2);
  o += `<circle cx="${f(x + w / 2)}" cy="${f(cy + br)}" r="${f(br)}" fill="none" stroke="${CU}"/><text x="${f(x + w / 2)}" y="${f(cy + br + br * 0.18)}" text-anchor="middle" ${MONT} font-weight="600" font-size="${f(br * 0.34)}" fill="${CU}">TERN-8™</text>`;
  cy += br * 2 + 4 * k;
  const big = Math.min(iw / 2.4, 11 * k);
  o += `<text x="${f(x + w / 2)}" y="${f(cy + big * 0.75)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(big)}" fill="${CU}">${s.usp[0]}</text>`;
  cy += big + 1.5 * k;
  const sm = Math.max(1.9 * k, 4);
  o += `<text x="${f(x + w / 2)}" y="${f(cy + sm)}" text-anchor="middle" ${SANS} font-weight="600" font-size="${f(sm)}" ${s.usp[1].length * sm > iw ? `textLength="${f(iw)}" lengthAdjust="spacingAndGlyphs"` : ''} fill="${CU}">${s.usp[1]}</text>`;
  cy += sm * 2.2;
  o += `<text x="${f(x + w / 2)}" y="${f(cy)}" text-anchor="middle" ${SANS} font-size="${f(sm * 0.75)}" fill="${WHITE}" opacity=".75">무보정 · UNRETOUCHED</text>`;
  cy += sm * 0.9;
  const ph = Math.max(0, (y + h - m - 6 * k - cy) / 2 - 2 * k);
  ['BEFORE', 'AFTER*'].forEach((t, i) => {
    const py = cy + i * (ph + 3 * k);
    if (ph > 6) o += `<rect x="${f(x + m)}" y="${f(py)}" width="${f(iw)}" height="${f(ph)}" fill="url(#skin)"/><text x="${f(x + m + 2)}" y="${f(py + ph - 3)}" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="#3A2A20">${t}</text>`;
  });
  o += `<text x="${f(x + w / 2)}" y="${f(y + h - m)}" text-anchor="middle" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="${WHITE}" opacity=".7">* 시험 조건 각주</text>`;
  return o;
}
const panelBg = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#cartonBlue)"/>`;
const wingOuter = right; // 날개 바깥면: 닫혔을 때 보이는 USP 헤드라인
// 백보드: 날개를 90° 열면 정면과 같은 방향으로 서는 면 (2겹 날개의 안쪽 장)
function backboard(x, y, w, h, s, k) {
  const m = 3 * k, iw = w - 2 * m, sm = Math.max(1.8 * k, 4);
  let o = '', cy = y + m + sm;
  o += `<text x="${f(x + w / 2)}" y="${f(cy)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(Math.min(iw / 5.5, 4.2 * k))}" fill="${CU}">BEFORE · AFTER</text>`;
  cy += sm * 1.2;
  o += `<text x="${f(x + w / 2)}" y="${f(cy)}" text-anchor="middle" ${SANS} font-size="${f(sm * 0.72)}" fill="${WHITE}" opacity=".75">무보정 · UNRETOUCHED</text>`;
  cy += sm * 0.8;
  const listH = s.check.length * sm * 1.55 + sm * 2.4;
  const ph = Math.max(0, (y + h - m - listH - cy) / 2 - 2 * k);
  ['BEFORE', 'AFTER*'].forEach((t, i) => {
    const py = cy + i * (ph + 3 * k);
    if (ph > 6) o += `<rect x="${f(x + m)}" y="${f(py)}" width="${f(iw)}" height="${f(ph)}" fill="url(#skin)"/><text x="${f(x + m + 2)}" y="${f(py + ph - 3)}" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="#3A2A20">${t}</text>`;
  });
  cy += 2 * (ph + 3 * k) + sm * 0.6;
  s.check.forEach(t => {
    const bx = sm * 0.8;
    o += `<rect x="${f(x + m)}" y="${f(cy - bx * 0.85)}" width="${f(bx)}" height="${f(bx)}" fill="none" stroke="${CU}"/><path d="M${f(x + m + bx * 0.2)} ${f(cy - bx * 0.4)} l${f(bx * 0.25)} ${f(bx * 0.3)} l${f(bx * 0.45)} ${f(-bx * 0.6)}" fill="none" stroke="${CU}" stroke-width="1.2"/>`;
    o += `<text x="${f(x + m + bx * 1.5)}" y="${f(cy)}" ${SANS} font-weight="600" font-size="${f(sm * 0.8)}" ${t.length * sm * 0.8 > iw - bx * 1.5 ? `textLength="${f(iw - bx * 1.5)}" lengthAdjust="spacingAndGlyphs"` : ''} fill="${CU}">${t}</text>`;
    cy += sm * 1.55;
  });
  o += `<text x="${f(x + w / 2)}" y="${f(y + h - m)}" text-anchor="middle" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="${WHITE}" opacity=".7">* 1회 사용 직후 · 무보정 · 개인차 있음</text>`;
  return o;
}
// 우측면: 날개를 열면 드러나는 면 — 사용법 · 8 PM 루틴
function rightUse(x, y, w, h, s, k) {
  const m = 3 * k, iw = w - 2 * m, sm = Math.max(1.8 * k, 4);
  let o = '', cy = y + m + sm * 1.2;
  o += `<text x="${f(x + w / 2)}" y="${f(cy)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(Math.min(iw / 4.6, 4 * k))}" fill="${CU}">8 PM</text>`;
  cy += sm * 1.3;
  o += `<text x="${f(x + w / 2)}" y="${f(cy)}" text-anchor="middle" ${MONT} font-weight="600" font-size="${f(sm * 0.75)}" letter-spacing="1" fill="${CU}">YOUR TURN</text>`;
  cy += sm * 1.6;
  ['STEP 1', 'STEP 2', 'STEP 3'].forEach(t => {
    o += `<text x="${f(x + m)}" y="${f(cy)}" ${MONT} font-weight="600" font-size="${f(sm * 0.72)}" fill="${CU}">${t}</text>`; cy += sm * 0.9;
    o += bars(x + m, cy - sm * 0.5, iw, 2, Math.max(1.35 * k, 3), k, 0.5); cy += sm * 1.6;
  });
  o += `<text x="${f(x + w / 2)}" y="${f(y + h - m)}" text-anchor="middle" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="${WHITE}" opacity=".7">사용법 · KO/EN</text>`;
  return o;
}

// ---------- unfolded dieline: STE + 2겹 우측 날개 ----------
// 펼친 순서(바깥면): [백보드 B][날개 A][후면][좌측][정면][우측][접착]. B는 A 안쪽으로 접어 붙여 양면 모두 바깥면(AF 라미)이 됩니다.
function dieline(s, k) {
  if (s.bb === 'top') return dielineTop(s, k);
  const W = s.W * k, D = s.D * k, H = s.H * k, G = 13 * k, tuck = 15 * k, dust = Math.min(s.D * 0.8, s.W * 0.5) * k, bleed = 3 * k;
  const x0 = 30, top = 34 + D + tuck;
  const xB = x0, xA = x0 + D, xs = [x0 + 2 * D, x0 + 2 * D + W, x0 + 3 * D + W, x0 + 3 * D + 2 * W, x0 + 4 * D + 2 * W];
  const bodyW = 4 * D + 2 * W, VW = x0 * 2 + bodyW + G + 10, VH = top + H + D + tuck + 40;
  let o = `<svg viewBox="0 0 ${f(VW)} ${f(VH)}" width="${f(VW)}" height="${f(VH)}" role="img" aria-label="${esc(s.name)} 단상자 펼친 칼선 시안, 우측 날개 백보드 포함, 내치수 ${s.W}×${s.D}×${s.H} mm (추정)">`;
  o += `<rect x="${f(x0 - bleed)}" y="${f(top - bleed)}" width="${f(bodyW + bleed * 2)}" height="${f(H + bleed * 2)}" fill="url(#cartonBlue)"/>`;
  o += panelBg(xB, top, D, H) + backboard(xB, top, D, H, s, k);
  o += panelBg(xA, top, D, H) + wingOuter(xA, top, D, H, s, k);
  o += panelBg(xs[0], top, W, H) + back(xs[0], top, W, H, s, k);
  o += panelBg(xs[1], top, D, H) + left(xs[1], top, D, H, s, k);
  o += panelBg(xs[2], top, W, H) + front(xs[2], top, W, H, s, k);
  o += panelBg(xs[3], top, D, H) + rightUse(xs[3], top, D, H, s, k);
  o += `<path d="M${f(xs[4])} ${f(top)} L${f(xs[4] + G)} ${f(top + G * 0.27)} L${f(xs[4] + G)} ${f(top + H - G * 0.27)} L${f(xs[4])} ${f(top + H)} Z" class="ko"/>`;
  // 날개 끝 엄지 홈
  o += `<path d="M${f(xB)} ${f(top + H / 2 - 7 * k)} q${f(5 * k)} ${f(7 * k)} 0 ${f(14 * k)}" fill="var(--sheet)" stroke="var(--ink)"/>`;
  const tY = top - D;
  o += `<rect x="${f(xs[0])}" y="${f(tY)}" width="${f(W)}" height="${f(D)}" fill="url(#cartonBlue)"/><text x="${f(xs[0] + W / 2)}" y="${f(tY + D / 2 + 3)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(Math.min(W / 6, D / 3))}" textLength="${f(Math.min(W * 0.8, Math.min(W / 6, D / 3) * 5.3))}" lengthAdjust="spacingAndGlyphs" fill="url(#foil)" transform="rotate(180 ${f(xs[0] + W / 2)} ${f(tY + D / 2)})">TURNOVA</text>`;
  o += `<path d="M${f(xs[0] + 2)} ${f(tY)} Q${f(xs[0] + 2)} ${f(tY - tuck)} ${f(xs[0] + tuck)} ${f(tY - tuck)} L${f(xs[0] + W - tuck)} ${f(tY - tuck)} Q${f(xs[0] + W - 2)} ${f(tY - tuck)} ${f(xs[0] + W - 2)} ${f(tY)}" class="flap"/>`;
  [xs[1], xs[3]].forEach(xx => { o += `<path d="M${f(xx)} ${f(top)} L${f(xx + 2)} ${f(top - dust)} L${f(xx + D - 4 * k)} ${f(top - dust)} L${f(xx + D)} ${f(top - 4 * k)} L${f(xx + D)} ${f(top)}" class="flap"/>`; });
  const bY = top + H;
  o += `<rect x="${f(xs[0])}" y="${f(bY)}" width="${f(W)}" height="${f(D)}" fill="url(#cartonBlue)"/>`;
  const cw = Math.min(40 * k, W - 6 * k), ch = Math.min(15 * k, D * 0.42);
  o += `<rect x="${f(xs[0] + (W - cw) / 2)}" y="${f(bY + 3 * k)}" width="${f(cw)}" height="${f(ch)}" fill="#ECE7E0"/><text x="${f(xs[0] + W / 2)}" y="${f(bY + 3 * k + ch / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(Math.min(2.4 * k, ch / 2.5))}" fill="#333">LOT / MFG / EXP</text>`;
  const bw = Math.min(30 * k, W - 6 * k), bh = Math.min(D - ch - 9 * k, 14 * k);
  if (bh > 8) { o += `<rect x="${f(xs[0] + (W - bw) / 2)}" y="${f(bY + 6 * k + ch)}" width="${f(bw)}" height="${f(bh)}" fill="#fff"/>`; for (let i = 0; i < 28; i++) o += `<rect x="${f(xs[0] + (W - bw) / 2 + 3 + i * (bw - 6) / 28)}" y="${f(bY + 7 * k + ch)}" width="${f(((i * 7) % 3 + 1) * 0.6)}" height="${f(bh - 2 * k)}" fill="#111"/>`; }
  o += `<path d="M${f(xs[0] + 2)} ${f(bY + D)} Q${f(xs[0] + 2)} ${f(bY + D + tuck)} ${f(xs[0] + tuck)} ${f(bY + D + tuck)} L${f(xs[0] + W - tuck)} ${f(bY + D + tuck)} Q${f(xs[0] + W - 2)} ${f(bY + D + tuck)} ${f(xs[0] + W - 2)} ${f(bY + D)}" class="flap"/>`;
  [xs[1], xs[3]].forEach(xx => { o += `<path d="M${f(xx)} ${f(bY)} L${f(xx + 2)} ${f(bY + dust)} L${f(xx + D - 4 * k)} ${f(bY + dust)} L${f(xx + D)} ${f(bY + 4 * k)} L${f(xx + D)} ${f(bY)}" class="flap"/>`; });
  o += `<rect x="${f(x0)}" y="${f(top)}" width="${f(bodyW)}" height="${f(H)}" class="cut"/><rect x="${f(xs[0])}" y="${f(tY)}" width="${f(W)}" height="${f(D)}" class="cut"/><rect x="${f(xs[0])}" y="${f(bY)}" width="${f(W)}" height="${f(D)}" class="cut"/>`;
  [xs[1], xs[2], xs[3], xs[4]].forEach(xx => { o += `<line x1="${f(xx)}" y1="${f(top)}" x2="${f(xx)}" y2="${f(top + H)}" class="crease"/>`; });
  o += `<line x1="${f(xA)}" y1="${f(top)}" x2="${f(xA)}" y2="${f(top + H)}" class="fold"/>`;
  [xs[0] - 1.5, xs[0] + 1.5].forEach(xx => { o += `<line x1="${f(xx)}" y1="${f(top)}" x2="${f(xx)}" y2="${f(top + H)}" class="hinge"/>`; });
  o += `<line x1="${f(xs[0])}" y1="${f(top)}" x2="${f(xs[0] + 2 * W + 2 * D)}" y2="${f(top)}" class="crease"/><line x1="${f(xs[0])}" y1="${f(bY)}" x2="${f(xs[0] + 2 * W + 2 * D)}" y2="${f(bY)}" class="crease"/>`;
  const lab = (xx, ww, t) => `<text x="${f(xx + ww / 2)}" y="${f(top + H + D + tuck + 24)}" text-anchor="middle" class="dlab">${t}</text>`;
  o += lab(xB, D, '백보드') + lab(xA, D, '날개') + lab(xs[0], W, `후면 ${s.W}`) + lab(xs[1], D, `좌 ${s.D}`) + lab(xs[2], W, `정면 ${s.W}`) + lab(xs[3], D, `우 ${s.D}`) + lab(xs[4], G, '접착');
  o += `<text x="${f(x0 - 8)}" y="${f(top + H / 2)}" text-anchor="middle" class="dlab" transform="rotate(-90 ${f(x0 - 8)} ${f(top + H / 2)})">높이 ${s.H}</text>`;
  return o + '</svg>';
}

// ---------- 3/4 view: closed (날개가 우측면을 덮음) / open (날개 90° = 백보드) ----------
const A3 = 0.5, B3 = -0.28;
function box3(s, k, x0, G, open) {
  if (s.bb === 'top') return box3Top(s, k, x0, G, open);
  const W = s.W * k, D = s.D * k, H = s.H * k, y0 = G - H;
  const hx = x0 + W + D * A3, hy = y0 + D * B3; // 우측-후면 모서리(경첩)
  let o = `<ellipse cx="${f(x0 + (W + (open ? D * 1.6 : D * A3)) / 2)}" cy="${f(G + 3)}" rx="${f((W + (open ? D * 1.4 : D * 0.5)) * 0.6)}" ry="5" fill="rgba(10,14,50,.22)"/>`;
  if (open) o += `<g>${panelBg(hx, hy, D, H)}${backboard(hx, hy, D, H, s, k)}<rect x="${f(hx)}" y="${f(hy)}" width="2" height="${f(H)}" fill="rgba(0,0,30,.35)"/></g>`;
  o += `<g transform="matrix(${A3},${B3},0,1,${f(x0 + W)},${f(y0)})">${panelBg(0, 0, D, H)}${open ? rightUse(0, 0, D, H, s, k) : wingOuter(0, 0, D, H, s, k)}<rect width="${f(D)}" height="${f(H)}" fill="rgba(0,0,30,.22)"/></g>`;
  o += `<path d="M${f(x0)} ${f(y0)} L${f(x0 + W)} ${f(y0)} L${f(hx)} ${f(hy)} L${f(x0 + D * A3)} ${f(hy)} Z" fill="${BLUE_D}"/>`;
  o += panelBg(x0, y0, W, H) + front(x0, y0, W, H, s, k);
  return o;
}
function box3Top(s, k, x0, G, open) {
  const W = s.W * k, D = s.D * k, H = s.H * k, y0 = G - H, bx = x0 + D * A3, by = y0 + D * B3;
  let o = `<ellipse cx="${f(x0 + (W + D * A3) / 2)}" cy="${f(G + 3)}" rx="${f((W + D * 0.5) * 0.6)}" ry="5" fill="rgba(10,14,50,.22)"/>`;
  if (open) o += `${panelBg(bx, by - D, W, D)}${backboardLow(bx, by - D, W, D, s, k)}<rect x="${f(bx)}" y="${f(by - 2)}" width="${f(W)}" height="2" fill="rgba(0,0,30,.35)"/>`;
  o += `<g transform="matrix(${A3},${B3},0,1,${f(x0 + W)},${f(y0)})">${panelBg(0, 0, D, H)}${rightUse(0, 0, D, H, s, k)}<rect width="${f(D)}" height="${f(H)}" fill="rgba(0,0,30,.22)"/></g>`;
  if (open) o += `<path d="M${f(x0)} ${f(y0)} L${f(x0 + W)} ${f(y0)} L${f(x0 + W + D * A3)} ${f(by)} L${f(bx)} ${f(by)} Z" fill="${BLUE_D}"/>`;
  else o += `<g transform="matrix(1,0,${-A3},${-B3},${f(x0 + D * A3)},${f(y0 + D * B3)})">${panelBg(0, 0, W, D)}${wingOuterLow(0, 0, W, D, s, k)}<rect width="${f(W)}" height="${f(D)}" fill="rgba(0,0,30,.12)"/></g>`;
  o += panelBg(x0, y0, W, H) + front(x0, y0, W, H, s, k);
  return o;
}
const boxW = (s, k, open) => s.W * k + s.D * k * (open && s.bb !== 'top' ? A3 + 1 : A3);
function lineupSvg(k) {
  const G = 300, gap = 30; let x = 30, o = '';
  C.skus.forEach(s => { o += box3(s, k, x, G, true); o += `<text x="${f(x + s.W * k / 2)}" y="${f(G + 26)}" text-anchor="middle" class="dlab">${esc(s.name)} · ${s.W}×${s.D}×${s.H}</text>`; x += boxW(s, k, true) + gap; });
  return `<svg viewBox="0 0 ${f(x + 10)} 340" width="${f(x + 10)}" height="340" role="img" aria-label="단상자 4종, 우측 날개를 90도 열어 백보드가 보이는 모습, 같은 축척"><rect width="${f(x + 10)}" height="340" fill="var(--well)"/><line x1="0" y1="${G}" x2="${f(x + 10)}" y2="${G}" stroke="var(--line-2)"/>${o}</svg>`;
}

// ---------- 자 타입: 상단 백보드 (후면 윗선 경첩, 2겹, 닫으면 윗면을 덮음) ----------
// 펼친 순서(바깥면): 가로 [후면][좌측][정면][우측][접착], 후면 위로 [상단 날개 A][백보드 B], 정면 위로 윗면 턱, 바닥은 후면 아래.
function dielineTop(s, k) {
  const W = s.W * k, D = s.D * k, H = s.H * k, G = 13 * k, tuck = 15 * k, dust = Math.min(s.D * 0.8, s.W * 0.5) * k, bleed = 3 * k;
  const x0 = 30, top = 30 + 2 * D + 10, xs = [x0, x0 + W, x0 + W + D, x0 + 2 * W + D, x0 + 2 * W + 2 * D];
  const totalW = 2 * W + 2 * D + G, VW = x0 * 2 + totalW + 10, VH = top + H + D + tuck + 40;
  let o = `<svg viewBox="0 0 ${f(VW)} ${f(VH)}" width="${f(VW)}" height="${f(VH)}" role="img" aria-label="${esc(s.name)} 단상자 펼친 칼선 시안, 상단 백보드 포함, 내치수 ${s.W}×${s.D}×${s.H} mm (추정)">`;
  o += `<rect x="${f(x0 - bleed)}" y="${f(top - bleed)}" width="${f(totalW - G + bleed * 2)}" height="${f(H + bleed * 2)}" fill="url(#cartonBlue)"/>`;
  o += panelBg(xs[0], top, W, H) + back(xs[0], top, W, H, s, k);
  o += panelBg(xs[1], top, D, H) + left(xs[1], top, D, H, s, k);
  o += panelBg(xs[2], top, W, H) + front(xs[2], top, W, H, s, k);
  o += panelBg(xs[3], top, D, H) + rightUse(xs[3], top, D, H, s, k);
  o += `<path d="M${f(xs[4])} ${f(top)} L${f(xs[4] + G)} ${f(top + G * 0.27)} L${f(xs[4] + G)} ${f(top + H - G * 0.27)} L${f(xs[4])} ${f(top + H)} Z" class="ko"/>`;
  // 상단 날개 A (바깥면 = USP 헤드라인, 윗면을 덮음) + 백보드 B (A 안쪽으로 접어 붙임)
  const aY = top - D, bY0 = top - 2 * D;
  o += panelBg(xs[0], aY, W, D) + `<g transform="rotate(180 ${f(xs[0] + W / 2)} ${f(aY + D / 2)})">${wingOuterLow(xs[0], aY, W, D, s, k)}</g>`;
  o += panelBg(xs[0], bY0, W, D) + `<g transform="rotate(180 ${f(xs[0] + W / 2)} ${f(bY0 + D / 2)})">${backboardLow(xs[0], bY0, W, D, s, k)}</g>`;
  o += `<path d="M${f(xs[0] + W / 2 - 7 * k)} ${f(bY0)} q${f(7 * k)} ${f(5 * k)} ${f(14 * k)} 0" fill="var(--sheet)" stroke="var(--ink)"/>`;
  // 윗면 턱: 정면 윗선에 붙음
  o += `<rect x="${f(xs[2])}" y="${f(top - D)}" width="${f(W)}" height="${f(D)}" fill="url(#cartonBlue)"/>`;
  o += `<path d="M${f(xs[2] + 2)} ${f(top - D)} Q${f(xs[2] + 2)} ${f(top - D - tuck)} ${f(xs[2] + tuck)} ${f(top - D - tuck)} L${f(xs[2] + W - tuck)} ${f(top - D - tuck)} Q${f(xs[2] + W - 2)} ${f(top - D - tuck)} ${f(xs[2] + W - 2)} ${f(top - D)}" class="flap"/>`;
  [xs[1], xs[3]].forEach(xx => { o += `<path d="M${f(xx)} ${f(top)} L${f(xx + 2)} ${f(top - dust)} L${f(xx + D - 4 * k)} ${f(top - dust)} L${f(xx + D)} ${f(top - 4 * k)} L${f(xx + D)} ${f(top)}" class="flap"/>`; });
  // 바닥: 후면 아래
  const bY = top + H;
  o += `<rect x="${f(xs[0])}" y="${f(bY)}" width="${f(W)}" height="${f(D)}" fill="url(#cartonBlue)"/>`;
  const cw = Math.min(40 * k, W - 6 * k), ch = Math.min(15 * k, D * 0.3);
  o += `<rect x="${f(xs[0] + (W - cw) / 2)}" y="${f(bY + 3 * k)}" width="${f(cw)}" height="${f(ch)}" fill="#ECE7E0"/><text x="${f(xs[0] + W / 2)}" y="${f(bY + 3 * k + ch / 2 + 3)}" text-anchor="middle" ${SANS} font-size="${f(Math.min(2.4 * k, ch / 2.5))}" fill="#333">LOT / MFG / EXP</text>`;
  o += bars(xs[0] + 3 * k, bY + 6 * k + ch, W - 6 * k, 5, Math.max(1.35 * k, 3), k, 0.5);
  o += `<text x="${f(xs[0] + 3 * k)}" y="${f(bY + D - 3 * k)}" ${SANS} font-size="${f(Math.max(1.6 * k, 3.4))}" fill="${WHITE}" opacity=".8">전성분 이어짐 · 바코드</text>`;
  o += `<path d="M${f(xs[0] + 2)} ${f(bY + D)} Q${f(xs[0] + 2)} ${f(bY + D + tuck)} ${f(xs[0] + tuck)} ${f(bY + D + tuck)} L${f(xs[0] + W - tuck)} ${f(bY + D + tuck)} Q${f(xs[0] + W - 2)} ${f(bY + D + tuck)} ${f(xs[0] + W - 2)} ${f(bY + D)}" class="flap"/>`;
  [xs[1], xs[3]].forEach(xx => { o += `<path d="M${f(xx)} ${f(bY)} L${f(xx + 2)} ${f(bY + dust)} L${f(xx + D - 4 * k)} ${f(bY + dust)} L${f(xx + D)} ${f(bY + 4 * k)} L${f(xx + D)} ${f(bY)}" class="flap"/>`; });
  o += `<rect x="${f(x0)}" y="${f(top)}" width="${f(totalW - G)}" height="${f(H)}" class="cut"/><rect x="${f(xs[0])}" y="${f(bY0)}" width="${f(W)}" height="${f(2 * D)}" class="cut"/><rect x="${f(xs[2])}" y="${f(top - D)}" width="${f(W)}" height="${f(D)}" class="cut"/><rect x="${f(xs[0])}" y="${f(bY)}" width="${f(W)}" height="${f(D)}" class="cut"/>`;
  [xs[1], xs[2], xs[3], xs[4]].forEach(xx => { o += `<line x1="${f(xx)}" y1="${f(top)}" x2="${f(xx)}" y2="${f(top + H)}" class="crease"/>`; });
  o += `<line x1="${f(xs[0])}" y1="${f(aY)}" x2="${f(xs[0] + W)}" y2="${f(aY)}" class="fold"/>`;
  [top - 1.5, top + 1.5].forEach(yy => { o += `<line x1="${f(xs[0])}" y1="${f(yy)}" x2="${f(xs[0] + W)}" y2="${f(yy)}" class="hinge"/>`; });
  o += `<line x1="${f(xs[1])}" y1="${f(top)}" x2="${f(x0 + totalW - G)}" y2="${f(top)}" class="crease"/><line x1="${f(x0)}" y1="${f(bY)}" x2="${f(x0 + totalW - G)}" y2="${f(bY)}" class="crease"/>`;
  const lab = (xx, ww, t) => `<text x="${f(xx + ww / 2)}" y="${f(top + H + D + tuck + 24)}" text-anchor="middle" class="dlab">${t}</text>`;
  o += lab(xs[0], W, `후면 ${s.W}`) + lab(xs[1], D, `좌 ${s.D}`) + lab(xs[2], W, `정면 ${s.W}`) + lab(xs[3], D, `우 ${s.D}`) + lab(xs[4], G, '접착');
  o += `<text x="${f(xs[0] - 6)}" y="${f(bY0 + D / 2)}" text-anchor="end" class="dlab">백보드</text><text x="${f(xs[0] - 6)}" y="${f(aY + D / 2)}" text-anchor="end" class="dlab">상단 날개</text>`;
  return o + '</svg>';
}
// 낮고 넓은 면용 레이아웃 (가로형)
function wingOuterLow(x, y, w, h, s, k) {
  const m = 3 * k, big = Math.min(h * 0.42, 12 * k), sm = Math.max(1.8 * k, 4);
  let o = `<text x="${f(x + w * 0.3)}" y="${f(y + h * 0.55)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(big)}" fill="${CU}">${s.usp[0]}</text>`;
  o += `<text x="${f(x + w * 0.3)}" y="${f(y + h * 0.55 + sm * 1.4)}" text-anchor="middle" ${SANS} font-weight="600" font-size="${f(sm * 0.8)}" fill="${CU}">${s.usp[1]}</text>`;
  const pw = w * 0.36, ph = h - 2 * m;
  o += `<rect x="${f(x + w - m - pw)}" y="${f(y + m)}" width="${f(pw)}" height="${f(ph)}" fill="url(#skin)"/><text x="${f(x + w - m - pw + 2)}" y="${f(y + m + ph - 3)}" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="#3A2A20">TEXTURE</text>`;
  return o;
}
function backboardLow(x, y, w, h, s, k) {
  const m = 3 * k, sm = Math.max(1.8 * k, 4), iw = w - 2 * m;
  let o = `<text x="${f(x + w / 2)}" y="${f(y + m + sm)}" text-anchor="middle" ${MONT} font-weight="700" font-size="${f(Math.min(iw / 7, 3.6 * k))}" fill="${CU}">BEFORE · AFTER</text>`;
  const pw = (iw - 3 * k) / 2, ph = h - 2 * m - sm * 2 - s.check.length * sm * 1.2;
  ['BEFORE', 'AFTER*'].forEach((t, i) => { if (ph > 6) o += `<rect x="${f(x + m + i * (pw + 3 * k))}" y="${f(y + m + sm * 1.6)}" width="${f(pw)}" height="${f(ph)}" fill="url(#skin)"/><text x="${f(x + m + i * (pw + 3 * k) + 2)}" y="${f(y + m + sm * 1.6 + ph - 3)}" ${SANS} font-size="${f(Math.max(1.5 * k, 3.2))}" fill="#3A2A20">${t}</text>`; });
  let cy = y + m + sm * 1.6 + ph + sm * 1.1;
  s.check.forEach(t => { const bx = sm * 0.7; o += `<rect x="${f(x + m)}" y="${f(cy - bx * 0.85)}" width="${f(bx)}" height="${f(bx)}" fill="none" stroke="${CU}"/><text x="${f(x + m + bx * 1.5)}" y="${f(cy)}" ${SANS} font-weight="600" font-size="${f(sm * 0.72)}" fill="${CU}">${t}</text>`; cy += sm * 1.2; });
  return o;
}
// ---------- page ----------
const defsExtra = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="cartonBlue" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2230A3"/><stop offset="1" stop-color="#18208A"/></linearGradient>
<linearGradient id="cartonPhoto" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2A38B0"/><stop offset="1" stop-color="#121A6E"/></linearGradient>
<linearGradient id="skin" x1="0" x2="1"><stop offset="0" stop-color="#D9B39A"/><stop offset="1" stop-color="#C79A80"/></linearGradient>
</defs></svg>`;
const K = 2.6;
const skuCards = C.skus.map(s => `
  <article class="cart">
    <header><span class="sid">${s.id}</span><h3>${esc(s.name)}</h3><span class="tag ${s.place === '욕실' ? '' : 'gold'}">${s.place}</span><span class="muted">내치수 ${s.W} × ${s.D} × ${s.H} mm (추정) · ${esc(s.fit)} · 포장공간비율 ${(100 * (1 - s.prod[0] * s.prod[1] * s.prod[2] / (s.W * s.D * s.H))).toFixed(1)}% · ${s.bb === 'top' ? '상단 백보드' : '우측 날개 백보드 (깊이:폭 ' + (s.D / s.W).toFixed(2) + ')'}</span></header>
    <div class="cartrow">
      <figure class="closed">${(() => { const G = s.H * K + 30 + s.D * K * 0.3, w = boxW(s, K, false) + 30; return `<svg viewBox="0 0 ${f(w)} ${f(G + 14)}" width="${f(w)}" height="${f(G + 14)}" role="img" aria-label="${esc(s.name)} 단상자 닫힌 모습">${box3(s, K, 14, G, false)}</svg>`; })()}<figcaption>${s.bb === 'top' ? '닫힘 · 상단 날개가 윗면을 덮음' : '닫힘 · 날개 바깥면'}</figcaption></figure>
      <figure class="closed">${(() => { const G = s.H * K + 30 + s.D * K * 0.3 + (s.bb === 'top' ? s.D * K : 0), w = boxW(s, K, true) + 30; return `<svg viewBox="0 0 ${f(w)} ${f(G + 14)}" width="${f(w)}" height="${f(G + 14)}" role="img" aria-label="${esc(s.name)} 단상자 날개를 연 모습, 백보드">${box3(s, K, 14, G, true)}</svg>`; })()}<figcaption>${s.bb === 'top' ? '열림 · 상단 날개 90° = 백보드' : '열림 · 날개 90° = 백보드'}</figcaption></figure>
      <figure class="dl">${dieline(s, K)}<figcaption>펼친 칼선 (백보드 | 날개 | 후면 | 좌측 | 정면 | 우측 | 접착) · 실선 = 재단, 점선 = 괘선, 이중선 = 날개 경첩, 굵은 점선 = 2겹 접어 붙임</figcaption></figure>
    </div>
  </article>`).join('');

const refs = [
  ['ab4d0fec-image.jpg', 'RoC 세럼 스틱', '흰 상자 + 블루 우측면 USP: 94% 큰 수치, "무보정" 표기, 비포/애프터 세로 2컷, 시험 기간 각주', '우측면 USP 구조 (C07)'],
  ['e8210c48-image.jpg', 'RoC PR 박스', '골드·화이트 상자 정면에 용기 이미지, 클레임 한 줄, 용량', '좌측면 상품 이미지 (C05)'],
  ['88a13084-image.jpg', '샬롯 틸버리 (닫힘)', '정면 브랜드 + 제품명 + 성분, 옆면 -52% 헤드라인 + 비포/애프터', '정면 위계 · 우측 USP'],
  ['ecbe6451-image.jpg', '샬롯 틸버리 (날개 열림)', '우측 날개를 열면 측면 8X 헤드라인 + 날개 안쪽 -52% 백보드, 비포/애프터 4컷, 체크리스트', '우측 날개 백보드 (C07 · C08)'],
  ['b10821cc-image.jpg', '오거스티너스 바더', '로열블루 무광 상자, 코퍼 포일 모노그램, 중앙 정렬, 이중 언어 제품명', '바디 블루 + 코퍼 포일 (C01)']
];
let refHtml = '';
if (!REPO) {
  const { execSync } = require('child_process');
  const up = '/root/.claude/uploads/c78a5259-949e-57bc-b1cf-1c10a6751e9b/';
  refHtml = refs.map(r => {
    let src = '';
    try { src = 'data:image/jpeg;base64,' + execSync(`convert "${up + r[0]}" -resize 520x520 -quality 72 jpg:-`).toString('base64'); } catch (e) {}
    return `<figure class="refc">${src ? `<img src="${src}" alt="${esc(r[1])} 단상자 레퍼런스">` : ''}<figcaption><b>${esc(r[1])}</b><span>${esc(r[2])}</span><span class="tag gold">가져올 것 · ${esc(r[3])}</span></figcaption></figure>`;
  }).join('');
} else {
  refHtml = refs.map(r => `<figure class="refc"><figcaption><b>${esc(r[1])}</b><span>${esc(r[2])}</span><span class="tag gold">가져올 것 · ${esc(r[3])}</span></figcaption></figure>`).join('');
}

const faceRows = C.faces.map(x => `<tr><td><b>${esc(x.face)}</b><br><span class="muted">${esc(x.owner)}</span></td><td>${esc(x.what)}</td><td>${esc(x.rule)}</td><td class="muted">${esc(x.src)}</td></tr>`).join('');
const ruleRows = C.rules.map(r => `<tr><td class="rid">${r.id}</td><td><b>${esc(r.area)}</b></td><td>${esc(r.rule)}</td><td class="muted">${esc(r.src)}</td></tr>`).join('');
const visual = [
  ['높음', 'AF 라미 위에 포일이 잘 안 붙을 수 있습니다', '지문 방지·소프트 계열 무광 필름은 표면이 미끄러워 핫포일과 UV 밀착이 떨어지는 경우가 많습니다(추정). 유광 로고가 이 상자의 유일한 광택이라 벗겨지면 치명적입니다.', '포일 적성이 있는 AF 라미 품번을 지정하고, 포일 테이프 시험과 손기름 지문 시험을 샘플 승인 조건으로 겁니다(C02).'],
  ['높음', '에칭 UV와 지문 방지가 부딪힙니다', '가이드 v5(10/4)는 전면 에칭 UV를 확정했지만, 에칭 결 위에는 손기름이 남기 쉬워 AF 효과가 줄어듭니다(추정).', '기본안에서 에칭을 빼고, 넣으려면 지문 시험을 통과하게 합니다(C03). 대표님 결정이 필요합니다.'],
  ['높음', '백보드 B&A는 인쇄 후 고칠 수 없습니다', '대표 결정대로 B&A를 넣습니다. 온라인 이미지는 지적받으면 내리면 되지만, 단상자는 재고 전량 재작업이 됩니다. 사용 전후 비교 사진은 실증 자료를 요구받을 수 있습니다(추정, RA 확인).', '① 칼선 확정(12월) 전에 즉시효과 단기 시험(1회 사용 전후 기기 측정·사진, 2–3주, 수백만 원대 추정)으로 근거를 만듭니다. ② 무보정 원본·초상권 동의서·촬영 조건을 보관합니다. ③ 시점(사용 직후)과 개인차를 각주로 씁니다. ④ 수출판은 국가별로 교체합니다(EU 보정 사진 금지).'],
  ['높음', '포장공간비율 10% 이하(화장품류, 추정)를 지켜야 합니다', '앞 버전 치수(여유 2–3 mm)로는 에센스 18%, 필링밤 17%, 배리어 11%로 기준을 넘었습니다. 상자를 키워 정면을 넓히는 방법은 쓸 수 없습니다.', '내치수를 용기 외곽 + 1 mm(높이 + 2 mm)로 줄여 4종 모두 5–9%로 맞췄습니다(C17). 면적이 더 필요하면 상자 대신 백보드로 늘립니다. 조문·계산법은 RA 확인이 필요합니다.'],
  ['중간', '필링 에센스·필링밤은 후면에 한·영 전성분이 다 안 들어갈 수 있습니다', '에센스 후면 34 × 110 mm, 필링밤 후면 53 × 40 mm입니다. 성분 30개 기준 한·영 5 pt면 각각 약 130 mm·70 mm 높이가 필요합니다(추정).', '필링밤은 후면 + 바닥(53 × 53)으로 이어 싣고, 에센스는 후면 + 우측면 하단을 씁니다. 전성분 확정(12/15) 뒤 칼선으로 다시 계산합니다.'],
  ['중간', '좌측 상품 이미지는 실제 기성 용기 사진이어야 합니다', '렌더와 실물이 다르면 오인 표시가 되고, 리뷰 사진과도 어긋납니다.', '10월 말 샘플이 오면 같은 조명으로 4종을 촬영해 좌측면과 상세페이지에 같이 씁니다.'],
  ['중간', '종이 블루와 용기 블루가 다르게 나옵니다', 'SBS 원지 인쇄 블루와 PBL 튜브·PETG 병·PP 캡 블루는 같은 팬톤이어도 톤이 다릅니다.', '용기와 같은 칩 1개로 상자 드로다운을 승인하고, 상자와 용기를 나란히 폰 촬영합니다(C12).'],
  ['중간', '4종 상자가 매대에서 비슷해 보입니다', '전부 같은 블루라 정면 제품명과 크기로만 구분됩니다.', '좌측 상품 이미지와 윗면을 활용합니다. 윗면에 제품명을 작게 추가할지 결정이 필요합니다.'],
  ['중간', '기록마다 메탈 색·성분 코드가 다릅니다', '디자인 의뢰서(10/11)는 골드·미드나잇 블루, 가이드 v5는 TRX-8™, 제품명·표기 세션(10/13)은 TERN-8™입니다.', '가장 최근 대표 결정을 따릅니다: 코퍼 876C(골드 금지), 로열블루, "with TERN-8™". 보드·용기 라벨도 TERN-8™로 고쳤습니다.'],
  ['높음', '날개가 90°로 서 있어야 백보드가 보입니다', '종이 날개는 시간이 지나면 닫히거나 처집니다. 매대에서 반쯤 닫히면 백보드가 안 보입니다.', '경첩을 이중 괘선으로 하고, 매장 진열용은 날개 하단에 작은 받침 턱을 두는 안을 견적받습니다. 2겹 날개라 강성도 1겹보다 좋습니다.'],
  ['중간', '날개가 닫히면 우측면 사용법이 가려집니다', '법정 필수 표시가 날개 밑에 있으면 "보이는 곳에 표시" 요건에 걸릴 수 있습니다(추정).', '필수 표시는 모두 후면·바닥에 두고, 우측면은 사용법·루틴만 넣습니다(C07).'],
  ['낮음', '바닥 코딩창', '라미 위 잉크젯은 잘 안 붙습니다.', '레이저 코딩 또는 라벨로 정하고, 창은 무코팅 밝은 면으로 둡니다(C14).']
];
const vrows = visual.map(v => `<tr><td><span class="tag ${v[0] === '높음' ? 'bad' : v[0] === '중간' ? 'warn' : 'ok'}">${v[0]}</span></td><td><b>${v[1]}</b><br><span class="muted">${v[2]}</span></td><td>${v[3]}</td></tr>`).join('');
const decisions = [
  ['에칭 UV', '빼기 (권장)', '지문 방지와 포일 밀착을 우선합니다. 유지하려면 지문 시험 통과 조건을 겁니다.'],
  ['날개 적용 범위', '4종 모두 (권장)', '라인업 사진에서 백보드가 같은 높이로 줄지어 보입니다. 비용을 줄이려면 배리어·랩핑 2종만 먼저 적용합니다.'],
  ['1차 생산 USP', '실증 전에는 성분·루틴 면으로 인쇄 (권장)', '시험 결과가 나오면 슬리브 또는 2차 인쇄로 % 수치를 넣습니다.'],
  ['필링밤 백보드', '상단 백보드 (대표 10/14, 권장)', '낮고 넓은 자 상자라 위로 세워야 매대·손샷에서 보입니다. 닫으면 윗면을 덮고, 윗면 턱은 정면 쪽으로 옮깁니다.'],
  ['B&A 근거 확보', '즉시효과 단기 시험 (권장)', '1회 사용 직후 변화만 측정해 2–3주 안에 끝냅니다(추정). 랩핑 마스크는 사용 중(필름이 마르는 모습) → 떼어낸 직후 컷이 SNS 훅이 됩니다.'],
  ['윗면 표기', 'TURNOVA + 제품명 소형', '서랍·박스 적재 상태에서 SKU를 찾기 쉽습니다.'],
  ['날개 닫힘 방식', '마찰 턱 (권장) / 투명 원형 씰 / 마이크로 자석', '씰은 첫 개봉 표시가 되지만 매장 테스트 때 다시 닫기 어렵고, 자석은 단가가 오릅니다(추정).']
];
const drows = decisions.map((d, i) => `<li><b>${i + 1}. ${d[0]}</b> → <span class="pick">${d[1]}</span><span class="muted">${d[2]}</span></li>`).join('');

const brief = `[터노바 TURNOVA] 단상자 디자인 작업 요청 (2026-10-13)

안녕하세요. 용기 4종(배리어 크림 50 mL · 랩핑 마스크 60 mL · 필링 에센스 30 mL · 필링밤 20 g)에 맞춰 단상자 시안을 부탁드립니다. 상자 치수는 용기 도면 회신(10/24) 뒤 확정하며, 아래는 추정 내치수입니다.

1. 상자 내치수 (폭 × 깊이 × 높이, 추정)
${C.skus.map(s => `- ${s.name}: ${s.W} × ${s.D} × ${s.H} mm (${s.fit})`).join('\n')}

2. 면별 배치
${C.faces.map(x => `- ${x.face} (${x.owner}): ${x.what} / 규칙: ${x.rule}`).join('\n')}

3. 규칙
${C.rules.map(r => `- ${r.id} ${r.area}: ${r.rule}`).join('\n')}

4. 납품 파일
- SKU별 칼선(AI, 레이어: 재단·괘선·도련·안전영역·포일·녹아웃), 별색 분판(블루 / 코퍼 무광 잉크 / 코퍼 포일 / 화이트)
- 우측 2겹 날개(백보드) 포함 칼선, 날개 90° 열림 목업
- 닫힌 상자 목업(정면, 정면+우측 3/4, 4종 라인업) 폰 촬영 기준

5. 확인 부탁
- 필링 에센스·필링밤 후면에 한·영 전성분이 5 pt로 들어가는지, 안 되면 대안
- 우측면 USP는 수치를 "00%" 자리표시로 두고, 실증 전 1차 인쇄용 성분·루틴 면도 함께 만들어 주세요.

감사합니다.
터노바 드림`;

let head = fs.readFileSync(__dirname + '/head.html', 'utf8').replace('<title>터노바 튜브 패키지 보드</title>', '<title>터노바 단상자 시안</title>');
const css = `<style>
  section{padding-block:36px}
  .muted{color:var(--muted);font-size:13px}
  .lineup{background:var(--sheet);border:1px solid var(--line);border-radius:10px;padding:12px;overflow-x:auto}
  .lineup svg{display:block;width:100%;min-width:760px;max-width:none;height:auto;margin:0 auto}
  .carts{display:grid;gap:16px}
  .cart{background:var(--sheet);border:1px solid var(--line);border-radius:10px;padding:14px;min-width:0}
  .cart header{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .cart h3{font-size:16px}
  .sid{font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:.1em}
  .cartrow{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap}
  .cartrow figure{margin:0;min-width:0}
  .cartrow figcaption{font-size:12px;color:var(--muted);margin-top:6px}
  .closed{flex:0 1 auto;max-width:100%;overflow-x:auto;background:var(--well);border-radius:8px;padding:10px}
  .closed svg{display:block}
  .dl{flex:1 1 100%;overflow-x:auto;background:var(--well);border-radius:8px;padding:10px}
  .dl svg{display:block;max-width:none}
  .dl .cut{fill:none;stroke:var(--ink);stroke-width:1}
  .dl .crease{stroke:var(--ink-2);stroke-width:.8;stroke-dasharray:4 3}
  .dl .flap{fill:#2230A3;stroke:var(--ink);stroke-width:1}
  .dl .fold{stroke:var(--gold);stroke-width:1.4;stroke-dasharray:6 3}
  .dl .hinge{stroke:var(--ink);stroke-width:.8}
  .dl .ko{fill:var(--sheet);stroke:var(--ink);stroke-width:1}
  .dlab{fill:var(--ink-2);font-family:var(--mono);font-size:11px}
  .refs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px}
  .refc{margin:0;background:var(--sheet);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
  .refc img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;max-width:100%}
  .refc figcaption{padding:10px 12px;display:grid;gap:5px;font-size:13px}
  .refc .tag{white-space:normal;justify-self:start}
  .rid{font-family:var(--mono);color:var(--gold);white-space:nowrap}
  .msg{background:var(--sheet);border:1px solid var(--line);border-radius:10px;display:flex;flex-direction:column;min-width:0}
  .msg header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
  .msg pre{margin:0;padding:14px;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;font-family:var(--body);font-size:13px;line-height:1.6;max-height:520px;overflow:auto}
  .copy{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--gold-line);background:transparent;color:var(--gold);border-radius:999px;padding:5px 14px;cursor:pointer}
  .copy:hover{background:var(--gold-soft)}
  .decide{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .decide li{background:var(--sheet);border:1px solid var(--line);border-radius:8px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
  .decide .pick{color:var(--gold);font-weight:600}
  .decide .muted{flex-basis:100%}
</style>`;

const body = `
<header class="hero">
  <div class="wrap">
    <div class="eyebrow">TURNOVA · 단상자 시안 · 2026-10-14 · 우측 날개 백보드 · 대표 지시 + 가이드 v5 + 지니어스 비주얼팀</div>
    <h1>날개를 열면 <span class="oct">백보드</span>가 섭니다.<br>튜브·병은 오른쪽, 자는 위쪽.</h1>
    <p class="lede">대표님이 정하신 면 배치(정면 브랜드 · 좌측 상품 이미지 · 후면 한·영 전성분 · 우측 날개 USP)를 가이드 v5의 단상자 규칙(무광 라미, 샤넬식 정면 비율, 칼선·수출 표시 부록)과 합쳤습니다. 가이드의 "좌측면 = 성분 스토리"는 대표님 지시대로 상품 이미지로 바꿨습니다. 치수는 <span class="tag warn">추정</span>이고 용기 도면 회신(10/24) 뒤 다시 계산합니다.</p>
    <div class="verdict" role="list">
      <div role="listitem"><div class="k">마감</div><div class="v">무광 로열블루 + 지문 방지 AF 라미 · 로고만 유광 코퍼 포일</div><div class="s">포일 적성 AF 필름 지정 · 에칭 UV는 기본안에서 제외 권장</div></div>
      <div role="listitem"><div class="k">면 배치</div><div class="v">정면 브랜드 · 좌 상품 이미지 · 후 한·영 전성분 · 우 USP</div><div class="s">윗면 TURNOVA · 바닥 LOT/EXP + 바코드</div></div>
      <div role="listitem"><div class="k">구조</div><div class="v">STE 몸통 + 우측 2겹 날개 · 90° 열면 백보드</div><div class="s">닫힘 = USP 헤드라인 · 열림 = 비포/애프터 + 체크리스트 · 우측면 = 사용법</div></div>
    </div>
    <div class="alts">
      <div><b>대안 1</b> 날개를 1겹으로 만들고 백보드 면은 안쪽 인쇄로 합니다. 단가는 줄지만 무코팅 면이라 블루 색과 지문 방지가 바깥면과 달라집니다.</div>
      <div><b>대안 2</b> AF 라미 대신 일반 무광 라미 + 에칭 UV(가이드 10/4 안)로 갑니다. 질감은 살지만 지문이 남기 쉽습니다.</div>
    </div>
  </div>
</header>
<main>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">01 · 라인업</div><h2>4종 백보드를 연 모습 (같은 축척)</h2><p class="lede">튜브·병 상자는 샬롯 틸버리처럼 우측 날개를 90° 열면 정면 오른쪽에, 필링밤 자 상자는 상단 날개를 세우면 위쪽에 백보드가 섭니다. 매장 진열과 릴스 손샷에서 브랜드(정면)와 근거(백보드)가 한 컷에 잡힙니다.</p></div>
  <div class="lineup">${lineupSvg(2.2)}</div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">02 · 면별 배치</div><h2>어느 면에 무엇을 넣는가</h2></div>
  <div class="tbl"><table><thead><tr><th>면</th><th>들어갈 내용</th><th>규칙</th><th>근거</th></tr></thead><tbody>${faceRows}</tbody></table></div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">03 · SKU별 시안</div><h2>닫힘 · 열림 · 펼친 칼선</h2><p class="lede">칼선은 백보드 | 날개 | 후면 | 좌측 | 정면 | 우측 | 접착날개 순서입니다. 날개는 후면 모서리 경첩에 붙고, 백보드 장을 날개 안쪽으로 접어 붙입니다. 상·하 턱은 모두 후면에 붙습니다. 정면 비율은 코드로 계산했고(워드마크 87%, 낮은 상자 60%, 심볼 = 워드마크 × 0.236, 황금비 위치), 텍스트 막대는 자리표시입니다.</p></div>
  <div class="carts">${skuCards}</div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">04 · 대표님 레퍼런스</div><h2>보내 주신 5장에서 가져올 것</h2><p class="lede">구조와 면 역할만 가져옵니다. 다른 브랜드의 로고·문구·수치·사진 구도는 쓰지 않습니다(가이드 9-0 트레이드드레스 규칙).</p></div>
  <div class="refs">${refHtml}</div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">05 · 단상자 규칙</div><h2>자동 적용 규칙 ${C.rules.length}개 (C01–C${String(C.rules.length).padStart(2, '0')})</h2></div>
  <div class="tbl"><table><thead><tr><th>ID</th><th>영역</th><th>규칙</th><th>근거</th></tr></thead><tbody>${ruleRows}</tbody></table></div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">06 · 지니어스 비주얼팀 검토</div><h2>인쇄 전에 먼저 막을 것</h2></div>
  <div class="tbl"><table><thead><tr><th>심각도</th><th>이슈</th><th>대응</th></tr></thead><tbody>${vrows}</tbody></table></div>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">07 · 전달 문안</div><h2>디자이너에게 보낼 내용</h2></div>
  <article class="msg"><header><h3>단상자 디자인 작업 요청</h3><button class="copy" type="button" data-t="brief">복사</button></header><pre id="brief">${esc(brief)}</pre></article>
</div></section>
<section><div class="wrap">
  <div class="sec-head"><div class="eyebrow">08 · 대표 결정 필요</div><h2>시안 확정 전에 정할 6가지</h2></div>
  <ol class="decide">${drows}</ol>
  <p class="lede" style="margin-top:18px">근거: 대표 지시(10/13), 디자인 가이드 v5(4장 마감, 8장 정면 비율, 9-1 수출 RA, 9-2 커머스, 9-4 공정, 9-5 플립, 부록 A 칼선·부록 B 수출 표시), 용기 발주 스펙 통합본(10/13).</p>
</div></section>
</main>
<script>
document.querySelectorAll('.copy').forEach(function(btn){
  btn.addEventListener('click',function(){
    var el=document.getElementById(btn.dataset.t), txt=el.textContent;
    function done(m){ btn.textContent=m; setTimeout(function(){ btn.textContent='복사'; },1800); }
    function sel(){ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); done('선택됨 · Ctrl+C'); }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){ done('복사됨'); },sel); } else sel();
  });
});
</script>`;
const out = REPO ? 'carton-repo.html' : 'carton.html';
fs.writeFileSync(__dirname + '/' + out, head + fs.readFileSync(__dirname + '/defs.html', 'utf8') + defsExtra + css + body);
fs.writeFileSync(__dirname + '/carton-brief.txt', brief);
console.log('ok', out, fs.statSync(__dirname + '/' + out).size);
