// TURNOVA tube system mockups in guide v5/v16 language: matte royal blue + brushed copper, bold sans wordmark,
// 8-petal symbol, Chanel-style 2-tier layout with golden-ratio spacing. Output: g2-a/b/c.svg, g2-details.svg
const fs = require('fs');
const OUT = __dirname;
const SYM = fs.readFileSync(`${OUT}/sym-path.txt`, 'utf8');
const PHI = 1.618;
let uid = 0; const id = p => `${p}${++uid}`;
const WM = `font-family="Montserrat, 'Helvetica Neue', Arial, sans-serif" font-weight="700"`;
const SANS = `font-family="Montserrat, 'Helvetica Neue', Arial, sans-serif"`;
const COPPER_TXT = '#E8956A';

function defs() {
  return `<defs>
  <linearGradient id="cu" x1="0" x2="1"><stop offset="0" stop-color="#9C5A2A"/><stop offset=".22" stop-color="#E9A57A"/><stop offset=".45" stop-color="#C47E4E"/><stop offset=".7" stop-color="#F4C2A0"/><stop offset="1" stop-color="#A5622F"/></linearGradient>
  <linearGradient id="cuL" x1="0" x2="1"><stop offset="0" stop-color="#7E4520"/><stop offset="1" stop-color="#B9733F"/></linearGradient>
  <linearGradient id="cuR" x1="0" x2="1"><stop offset="0" stop-color="#D99A6E"/><stop offset="1" stop-color="#7E4520"/></linearGradient>
  <linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#121A6E"/><stop offset=".3" stop-color="#2533B0"/><stop offset=".62" stop-color="#1E2AA0"/><stop offset="1" stop-color="#111865"/></linearGradient>
  <linearGradient id="rbF" x1="0" x2="1"><stop offset="0" stop-color="#1A2590"/><stop offset=".5" stop-color="#2836B4"/><stop offset="1" stop-color="#18228A"/></linearGradient>
  <linearGradient id="rbL" x1="0" x2="1"><stop offset="0" stop-color="#0D1352"/><stop offset="1" stop-color="#1B2694"/></linearGradient>
  <linearGradient id="rbR" x1="0" x2="1"><stop offset="0" stop-color="#2230A6"/><stop offset="1" stop-color="#0D1352"/></linearGradient>
  <linearGradient id="cuBody" x1="0" x2="1"><stop offset="0" stop-color="#C98157"/><stop offset=".32" stop-color="#F2B48D"/><stop offset=".62" stop-color="#E7A177"/><stop offset="1" stop-color="#BE774E"/></linearGradient>
  <radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <symbol id="tn8" viewBox="0 0 1000 1000"><path d="${SYM}" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round"/></symbol>
  </defs>`;
}

function oct({ x, y, w, h, F = 'url(#cu)', L = 'url(#cuL)', R = 'url(#cuR)', k = 'rgba(0,0,0,.25)' }) {
  const s = w / 2.414, side = s * 0.707, x0 = x - w / 2;
  return `<rect x="${x0}" y="${y}" width="${side}" height="${h}" fill="${L}"/>
  <rect x="${x0 + side}" y="${y}" width="${s}" height="${h}" fill="${F}"/>
  <rect x="${x0 + side + s}" y="${y}" width="${side}" height="${h}" fill="${R}"/>
  <path d="M${x0 + side} ${y}V${y + h}M${x0 + side + s} ${y}V${y + h}" stroke="${k}"/>`;
}

// Front label per guide: wordmark 85% of panel width at 13% from top; bottom group fixed; symbol splits the gap 1:1.618.
function label({ x, yT, yB, W, name, vol, ink = COPPER_TXT, wmInk = 'url(#cu)', jar = false }) {
  const H = yB - yT;
  const wmW = W * (jar ? 0.62 : 0.85);
  const fs1 = wmW / 5.9;                 // bold caps "TURNOVA" ≈ 5.9 em wide in Montserrat 700
  const cap = fs1 * 0.72;
  const wmBase = yT + (jar ? 0.18 : 0.13) * H + cap;
  const f2 = fs1 / PHI, f3 = f2 / PHI;
  let t = `<text x="${x}" y="${wmBase}" text-anchor="middle" ${WM} font-size="${fs1.toFixed(1)}" textLength="${wmW.toFixed(1)}" lengthAdjust="spacingAndGlyphs" fill="${wmInk}">TURNOVA</text>`;
  const lines = name.split('|');
  if (jar) {
    let y = wmBase + f2 * 1.7;
    lines.forEach(l => { t += `<text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" ${WM} font-size="${(f2 * 0.82).toFixed(1)}" letter-spacing=".6" fill="${ink}">${l}</text>`; y += f2 * 1.05; });
    t += `<text x="${x}" y="${(y + f3 * 0.4).toFixed(1)}" text-anchor="middle" ${SANS} font-size="${f3.toFixed(1)}" fill="${ink}">TRX-8™ · ${vol}</text>`;
    return t;
  }
  const volBase = yB - 0.07 * H;
  const trxBase = volBase - f3 * 2.1;
  const nameLast = trxBase - f3 * 1.9;
  const nameFirst = nameLast - (lines.length - 1) * f2 * 1.12;
  lines.forEach((l, i) => { t += `<text x="${x}" y="${(nameFirst + i * f2 * 1.12).toFixed(1)}" text-anchor="middle" ${WM} font-size="${f2.toFixed(1)}" letter-spacing=".8" fill="${ink}">${l}</text>`; });
  t += `<text x="${x}" y="${trxBase.toFixed(1)}" text-anchor="middle" ${SANS} font-weight="500" font-size="${f3.toFixed(1)}" letter-spacing=".5" fill="${ink}">TRX-8™</text>`;
  t += `<text x="${x}" y="${volBase.toFixed(1)}" text-anchor="middle" ${SANS} font-weight="500" font-size="${f3.toFixed(1)}" fill="${ink}">${vol}</text>`;
  const gapTop = wmBase + fs1 * 0.12, gapBot = nameFirst - f2 * 0.78;
  const s = W * 0.18, free = (gapBot - gapTop) - s;
  const sy = gapTop + free / (1 + PHI);
  t += `<use href="#tn8" x="${x - s / 2}" y="${sy.toFixed(1)}" width="${s}" height="${s}" style="color:${ink === COPPER_TXT ? '#E8956A' : ink}"/>`;
  return t;
}

function tube({ x, ground, w, bodyH, body = 'blue', cap, capH, capW, name, vol }) {
  const capY = ground - capH, neckY = capY, shY = neckY - 14, yTop = shY - bodyH, sw = w * 0.8;
  const p = `M${x - w / 2} ${yTop + 12}L${x + w / 2} ${yTop + 12}L${x + sw / 2} ${shY}Q${x + sw / 2} ${neckY} ${x + capW / 2 - 3} ${neckY}L${x - capW / 2 + 3} ${neckY}Q${x - sw / 2} ${neckY} ${x - sw / 2} ${shY}Z`;
  const blue = body === 'blue';
  let s = `<ellipse cx="${x}" cy="${ground + 2}" rx="${w * 0.62}" ry="8" fill="url(#sh)"/>`;
  s += `<path d="${p}" fill="${blue ? 'url(#rb)' : 'url(#cuBody)'}"/>`;
  s += `<rect x="${x - w / 2 - 1.5}" y="${yTop}" width="${w + 3}" height="13" rx="1.5" fill="${blue ? '#18217F' : '#D98F63'}"/>`;
  for (let i = 1; i <= 24; i++) { const lx = x - w / 2 + (w / 25) * i; s += `<line x1="${lx}" y1="${yTop + 3}" x2="${lx}" y2="${yTop + 10}" stroke="${blue ? '#2836B4' : '#C27A50'}" stroke-width=".7"/>`; }
  s += label({ x, yT: yTop + 13, yB: shY, W: w * 0.9, name, vol, ink: blue ? COPPER_TXT : '#1E2AA0', wmInk: blue ? 'url(#cu)' : '#1E2AA0' });
  if (cap === 'cuOct') { s += oct({ x, y: capY, w: capW, h: capH }); s += `<rect x="${x - capW / 2}" y="${capY}" width="${capW}" height="2.5" fill="rgba(255,255,255,.3)"/>`; }
  if (cap === 'blueOct') { s += oct({ x, y: capY, w: capW, h: capH, F: 'url(#rbF)', L: 'url(#rbL)', R: 'url(#rbR)', k: 'rgba(0,0,0,.4)' }); }
  if (cap === 'blueFlip' || cap === 'cuFlip') {
    const cu = cap === 'cuFlip';
    s += cu ? oct({ x, y: capY, w: capW, h: capH }) : oct({ x, y: capY, w: capW, h: capH, F: 'url(#rbF)', L: 'url(#rbL)', R: 'url(#rbR)', k: 'rgba(0,0,0,.4)' });
    const py = capY + capH * 0.45, dark = cu ? '#6E3A18' : '#0B1048';
    s += `<path d="M${x - capW / 2} ${py}H${x + capW / 2}" stroke="${dark}" stroke-width="1.3"/><path d="M${x - 10} ${py}Q${x} ${py + 8} ${x + 10} ${py}" fill="${dark}"/>`;
  }
  if (cap === 'cuRound') s += `<rect x="${x - capW / 2}" y="${capY}" width="${capW}" height="${capH}" rx="3" fill="url(#cu)"/>`;
  return s;
}

function jar({ x, ground, w = 136, bodyH = 64, lidH = 30, name, vol }) {
  const by = ground - bodyH, ly = by - lidH;
  let s = `<ellipse cx="${x}" cy="${ground + 2}" rx="${w * 0.62}" ry="7" fill="url(#sh)"/>`;
  s += `<rect x="${x - w / 2 + 3}" y="${by}" width="${w - 6}" height="${bodyH}" rx="8" fill="url(#rb)"/>`;
  s += `<rect x="${x - w / 2}" y="${ly}" width="${w}" height="${lidH}" rx="3" fill="url(#cu)"/><rect x="${x - w / 2}" y="${ly}" width="${w}" height="2" fill="rgba(255,255,255,.35)"/>`;
  s += label({ x, yT: by + 2, yB: ground, W: w - 6, name, vol, jar: true });
  return s;
}

function scene(W, H, split) {
  let s = `<rect width="${W}" height="${H}" fill="#EFECE6"/><rect x="${split}" width="${W - split}" height="${H}" fill="#E6EAF1"/>`;
  for (let gx = split; gx < W; gx += 44) s += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H - 78}" stroke="#D3D9E4"/>`;
  for (let gy = 0; gy < H - 78; gy += 44) s += `<line x1="${split}" y1="${gy}" x2="${W}" y2="${gy}" stroke="#D3D9E4"/>`;
  s += `<rect y="${H - 78}" width="${split}" height="78" fill="#D9D1C4"/><rect x="${split}" y="${H - 78}" width="${W - split}" height="78" fill="#CAD2DF"/>`;
  s += `<text x="20" y="28" ${SANS} font-size="12" letter-spacing="2" fill="#7A6E5C">VANITY · 화장대</text><text x="${split + 20}" y="28" ${SANS} font-size="12" letter-spacing="2" fill="#5C6A82">BATH · 화장실</text>`;
  return s;
}

function concept(file, o) {
  const W = 900, H = 560, G = H - 78;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria}">${defs()}${scene(W, H, 560)}`;
  s += jar({ x: 150, ground: G, name: 'THE FILM|BALM CREAM', vol: '18 mL' });
  s += tube({ x: 380, ground: G, ...o.b });
  s += tube({ x: 720, ground: G, ...o.m });
  [[150, o.c1, '#5B5040'], [380, o.c2, '#5B5040'], [720, o.c3, '#3F4C66']].forEach(([cx, t, c]) => s += `<text x="${cx}" y="${G + 34}" text-anchor="middle" font-family="'IBM Plex Sans KR', sans-serif" font-size="12" fill="${c}">${t}</text>`);
  fs.writeFileSync(`${OUT}/${file}`, s + '</svg>');
}

const B = { w: 116, bodyH: 280, name: 'THE BARRIER|CREAM', vol: '58 mL / 1.9 fl oz' };
const M = { w: 156, bodyH: 236, name: 'THE WRAPPING|MASK', vol: '80 mL / 2.7 fl oz' };
concept('g2-a.svg', { aria: '시안 A: 같은 로열블루, 배리어는 코퍼 8각 스크류, 랩핑은 블루 8각 원터치',
  b: { ...B, cap: 'cuOct', capH: 70, capW: 84 }, m: { ...M, cap: 'blueFlip', capH: 40, capW: 120 },
  c1: '필름밤 18ml · 원형 자 + 코퍼 뚜껑(확정 사양)', c2: '배리어 58ml · 35Φ · 코퍼 8각 스크류', c3: '랩핑 80ml · 40Φ · 블루 8각 원터치' });
concept('g2-b.svg', { aria: '시안 B: DUA식 색 반전, 배리어 코퍼 바디',
  b: { ...B, body: 'copper', cap: 'blueOct', capH: 70, capW: 84 }, m: { ...M, cap: 'cuFlip', capH: 40, capW: 120 },
  c1: '필름밤 18ml · 원형 자 + 코퍼 뚜껑', c2: '배리어 58ml · 코퍼 바디 · 블루 8각 스크류', c3: '랩핑 80ml · 블루 바디 · 코퍼 8각 원터치' });
concept('g2-c.svg', { aria: '시안 C: 현상 유지, 둘 다 마스터 튜브와 같은 원형 코퍼 캡',
  b: { ...B, w: 130, bodyH: 262, cap: 'cuRound', capH: 50, capW: 92 }, m: { ...M, w: 140, bodyH: 262, cap: 'cuRound', capH: 50, capW: 98 },
  c1: '필름밤 18ml · 원형 자 + 코퍼 뚜껑', c2: '배리어 58ml · 원형 코퍼 캡', c3: '랩핑 80ml · 원형 코퍼 캡' });

(function details() {
  const W = 900, H = 320;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="캡 디테일">${defs()}<rect width="${W}" height="${H}" fill="#F1F2F6"/>`;
  const pts = (cx, cy, r) => { const a = []; for (let i = 0; i < 8; i++) { const t = Math.PI / 8 + i * Math.PI / 4; a.push(`${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`); } return a.join(' '); };
  s += `<polygon points="${pts(130, 140, 80)}" fill="url(#cu)" stroke="#8A4E24"/><use href="#tn8" x="96" y="106" width="68" height="68" style="color:#9A5A2C"/>`;
  s += `<text x="130" y="262" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="12" fill="#3B4258">① 위에서 본 캡 = 정8각형</text><text x="130" y="280" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="11" fill="#6B7287">윗면 8잎 심볼 톤온톤 각인</text>`;
  s += oct({ x: 380, y: 60, w: 100, h: 120 }) + `<rect x="330" y="60" width="100" height="3" fill="rgba(255,255,255,.35)"/>`;
  s += `<text x="380" y="262" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="12" fill="#3B4258">② 배리어 · 브러시드 코퍼 8각 스크류</text><text x="380" y="280" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="11" fill="#6B7287">높고 좁게 · 화장대 정면 진열</text>`;
  s += oct({ x: 620, y: 110, w: 110, h: 64, F: 'url(#rbF)', L: 'url(#rbL)', R: 'url(#rbR)', k: 'rgba(0,0,0,.4)' }) + `<path d="M565 139H675" stroke="#0B1048" stroke-width="1.3"/><path d="M610 139Q620 147 630 139" fill="#0B1048"/>`;
  s += `<g transform="translate(745 150)"><rect x="-52" y="-28" width="104" height="28" fill="url(#rbF)" stroke="rgba(0,0,0,.35)"/><circle cx="0" cy="-4" r="7" fill="#0B1048"/><circle cx="0" cy="-4" r="3" fill="#E6E8F4"/><g transform="rotate(-62 52 0)"><rect x="52" y="0" width="104" height="36" fill="url(#rbF)" stroke="rgba(0,0,0,.35)"/><rect x="99" y="2" width="10" height="10" rx="2" fill="#0B1048"/></g></g>`;
  s += `<text x="700" y="262" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="12" fill="#3B4258">③ 랩핑 · 블루 8각 원터치 (닫힘 / 열림)</text><text x="700" y="280" text-anchor="middle" font-family="'IBM Plex Sans KR',sans-serif" font-size="11" fill="#6B7287">젖은 손 한 손 개폐 · 토출구 5mm 내외 + 씰 핀</text>`;
  fs.writeFileSync(`${OUT}/g2-details.svg`, s + '</svg>');
})();
console.log('ok');
