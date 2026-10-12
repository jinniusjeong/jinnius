/* TURNOVA 조합 렌더러 — 가이드 v5 문법(무광 로열블루, 브러시드 코퍼, 볼드 워드마크, 8잎 심볼, 샤넬식 2단)으로
   배리어+랩핑 페어와 필름밤 자를 SVG 문자열로 그린다. 그라데이션·심볼은 페이지의 #tn-defs에 한 번만 정의. */
(function (root) {
  var PHI = 1.618, CU_TXT = '#E8956A', BLUE_TXT = '#1E2AA0';
  var WM = 'font-family="Montserrat, \'Helvetica Neue\', Arial, sans-serif" font-weight="700"';
  var SANS = 'font-family="Montserrat, \'Helvetica Neue\', Arial, sans-serif"';
  var KR = 'font-family="\'IBM Plex Sans KR\', sans-serif"';

  var CAPS = {
    octScrew:  { label: '8각 스크류', mech: 'screw', shape: 'oct', h: 70, wr: 0.72 },
    octFlip:   { label: '8각 원터치', mech: 'flip', shape: 'oct', h: 40, wr: 0.78 },
    roundScrew:{ label: '원형 스크류', mech: 'screw', shape: 'round', h: 50, wr: 0.7 },
    roundFlip: { label: '원형 원터치(기성)', mech: 'flip', shape: 'round', h: 40, wr: 0.76 },
    discTop:   { label: '디스크탑', mech: 'disc', shape: 'round', h: 34, wr: 0.8 },
    wideFlat:  { label: '와이드 플랫 캡', mech: 'screw', shape: 'round', h: 28, wr: 0.9 },
    column:    { label: '롱 컬럼 캡', mech: 'screw', shape: 'round', h: 98, wr: 0.5 },
    octColumn: { label: '8각 롱 컬럼', mech: 'screw', shape: 'oct', h: 98, wr: 0.54 },
    clearFlip: { label: '반투명 블루 8각 원터치', mech: 'flip', shape: 'oct', h: 40, wr: 0.78 },
    pump:      { label: '에어리스 펌프', mech: 'pump', shape: 'round', h: 72, wr: 0.72 },
    tallRound: { label: '키 큰 원형 스크류', mech: 'screw', shape: 'round', h: 86, wr: 0.64 },
    shortRound:{ label: '낮은 원형 스크류', mech: 'screw', shape: 'round', h: 34, wr: 0.76 },
    clearRoundFlip: { label: '반투명 블루 원형 원터치', mech: 'flip', shape: 'round', h: 40, wr: 0.76 }
  };
  var SHAPES = {
    slim:  { label: '35Φ 슬림', w: 112, bodyH: 280 },
    std:   { label: '38Φ 표준', w: 132, bodyH: 262 },
    wide:  { label: '40Φ 와이드', w: 156, bodyH: 236 },
    oval:  { label: '오벌 플랫', w: 176, bodyH: 214 },
    xslim: { label: '30Φ 롱', w: 98, bodyH: 300 },
    fat:   { label: '45Φ 숏', w: 182, bodyH: 196 }
  };
  var BODIES = { blue: '로열블루', copper: '코퍼(색 반전)' };
  var METALS = { copper: '코퍼', blue: '블루', ringed: '블루 + 코퍼 링' };
  var BANDS = { none: '없음', printCu: '무광 코퍼 인쇄 띠', foilCu: '유광 금박 띠', metalCollar: '코퍼 메탈 칼라', crimpCu: '코퍼 크림프(끝 실링부)' };

  function f(n) { return (+n).toFixed(1); }

  function oct(x, y, w, h, tone) {
    var s = w / 2.414, side = s * 0.707, x0 = x - w / 2;
    var F = tone === 'blue' ? 'url(#rbF)' : tone === 'clear' ? 'url(#clr)' : 'url(#cu)';
    var L = tone === 'blue' ? 'url(#rbL)' : tone === 'clear' ? 'url(#clrL)' : 'url(#cuL)';
    var R = tone === 'blue' ? 'url(#rbR)' : tone === 'clear' ? 'url(#clrR)' : 'url(#cuR)';
    var k = tone === 'copper' ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.38)';
    return '<rect x="' + f(x0) + '" y="' + f(y) + '" width="' + f(side) + '" height="' + h + '" fill="' + L + '"/>' +
      '<rect x="' + f(x0 + side) + '" y="' + f(y) + '" width="' + f(s) + '" height="' + h + '" fill="' + F + '"/>' +
      '<rect x="' + f(x0 + side + s) + '" y="' + f(y) + '" width="' + f(side) + '" height="' + h + '" fill="' + R + '"/>' +
      '<path d="M' + f(x0 + side) + ' ' + f(y) + 'V' + f(y + h) + 'M' + f(x0 + side + s) + ' ' + f(y) + 'V' + f(y + h) + '" stroke="' + k + '"/>';
  }
  function roundCap(x, y, w, h, tone) {
    var fill = tone === 'blue' ? 'url(#rbF)' : tone === 'clear' ? 'url(#clr)' : 'url(#cu)';
    return '<rect x="' + f(x - w / 2) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + h + '" rx="3" fill="' + fill + '"/>';
  }

  function label(x, yT, yB, W, name, vol, ink, wmInk, jar) {
    var H = yB - yT, wmW = W * (jar ? 0.58 : 0.85), fs1 = wmW / 5.9, cap = fs1 * 0.72;
    var wmBase = yT + (jar ? 0.12 : 0.13) * H + cap, f2 = fs1 / PHI, f3 = f2 / PHI;
    var t = '<text x="' + f(x) + '" y="' + f(wmBase) + '" text-anchor="middle" ' + WM + ' font-size="' + f(fs1) + '" textLength="' + f(wmW) + '" lengthAdjust="spacingAndGlyphs" fill="' + wmInk + '">TURNOVA</text>';
    var lines = name.split('|'), i;
    if (jar) {
      var y = wmBase + f2 * 1.5;
      for (i = 0; i < lines.length; i++) { t += '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" ' + WM + ' font-size="' + f(f2 * 0.82) + '" letter-spacing=".6" fill="' + ink + '">' + lines[i] + '</text>'; y += f2 * 1.05; }
      return t + '<text x="' + f(x) + '" y="' + f(y + f3 * 0.4) + '" text-anchor="middle" ' + SANS + ' font-size="' + f(f3) + '" fill="' + ink + '">TRX-8™ · ' + vol + '</text>';
    }
    var volBase = yB - 0.07 * H, trxBase = volBase - f3 * 2.1, nameLast = trxBase - f3 * 1.9;
    var nameFirst = nameLast - (lines.length - 1) * f2 * 1.12;
    for (i = 0; i < lines.length; i++) t += '<text x="' + f(x) + '" y="' + f(nameFirst + i * f2 * 1.12) + '" text-anchor="middle" ' + WM + ' font-size="' + f(f2) + '" letter-spacing=".8" fill="' + ink + '">' + lines[i] + '</text>';
    t += '<text x="' + f(x) + '" y="' + f(trxBase) + '" text-anchor="middle" ' + SANS + ' font-weight="500" font-size="' + f(f3) + '" fill="' + ink + '">TRX-8™</text>';
    t += '<text x="' + f(x) + '" y="' + f(volBase) + '" text-anchor="middle" ' + SANS + ' font-weight="500" font-size="' + f(f3) + '" fill="' + ink + '">' + vol + '</text>';
    var gapTop = wmBase + fs1 * 0.12, gapBot = nameFirst - f2 * 0.78, s = W * 0.18, free = (gapBot - gapTop) - s;
    var sy = gapTop + free / (1 + PHI);
    return t + '<use href="#tn8" x="' + f(x - s / 2) + '" y="' + f(sy) + '" width="' + f(s) + '" height="' + f(s) + '" style="color:' + (ink === CU_TXT ? '#E8956A' : ink) + '"/>';
  }

  // o: {shape, body, cap, metal, band, name, vol}
  function tube(x, ground, o) {
    var sh = SHAPES[o.shape], cp = CAPS[o.cap];
    var w = sh.w, bodyH = sh.bodyH, capH = cp.h, capW = Math.min(w * cp.wr, w * 0.92);
    var capY = ground - capH, neckY = capY, shY = neckY - 14, yTop = shY - bodyH, sw = w * (o.shape === 'oval' ? 0.86 : 0.8);
    var p = 'M' + f(x - w / 2) + ' ' + f(yTop + 12) + 'L' + f(x + w / 2) + ' ' + f(yTop + 12) + 'L' + f(x + sw / 2) + ' ' + f(shY) + 'Q' + f(x + sw / 2) + ' ' + f(neckY) + ' ' + f(x + capW / 2 - 3) + ' ' + f(neckY) + 'L' + f(x - capW / 2 + 3) + ' ' + f(neckY) + 'Q' + f(x - sw / 2) + ' ' + f(neckY) + ' ' + f(x - sw / 2) + ' ' + f(shY) + 'Z';
    var blue = o.body !== 'copper', cid = 'c' + Math.random().toString(36).slice(2, 8);
    var s = '<ellipse cx="' + f(x) + '" cy="' + f(ground + 2) + '" rx="' + f(w * 0.62) + '" ry="8" fill="url(#sh)"/>';
    s += '<clipPath id="' + cid + '"><path d="' + p + '"/></clipPath><path d="' + p + '" fill="' + (blue ? 'url(#rb)' : 'url(#cuBody)') + '"/>';
    var labelBottom = shY;
    var band = o.band === true ? 'printCu' : (o.band || 'none');
    if (band === 'printCu' || band === 'foilCu') {
      var bh = bodyH * 0.1;
      s += '<g clip-path="url(#' + cid + ')"><rect x="' + f(x - w) + '" y="' + f(shY - bh) + '" width="' + f(w * 2) + '" height="' + f(bh + 40) + '" fill="' + (band === 'foilCu' ? 'url(#foil)' : '#D98F63') + '"/>' + (band === 'foilCu' ? '<rect x="' + f(x - w * 0.18) + '" y="' + f(shY - bh) + '" width="' + f(w * 0.07) + '" height="' + f(bh + 40) + '" fill="rgba(255,255,255,.55)"/>' : '') + '</g>';
      labelBottom = shY - bh;
    }
    s += '<rect x="' + f(x - w / 2 - 1.5) + '" y="' + f(yTop) + '" width="' + f(w + 3) + '" height="13" rx="1.5" fill="' + (band === 'crimpCu' ? 'url(#cu)' : (blue ? '#18217F' : '#D98F63')) + '"/>';
    for (var i = 1; i <= 24; i++) { var lx = x - w / 2 + (w / 25) * i; s += '<line x1="' + f(lx) + '" y1="' + f(yTop + 3) + '" x2="' + f(lx) + '" y2="' + f(yTop + 10) + '" stroke="' + (blue ? '#2836B4' : '#C27A50') + '" stroke-width=".7"/>'; }
    s += label(x, yTop + 13, labelBottom, w * 0.9, o.name, o.vol, blue ? CU_TXT : BLUE_TXT, blue ? 'url(#cu)' : BLUE_TXT, false);
    var tone = (o.cap === 'clearFlip' || o.cap === 'clearRoundFlip') ? 'clear' : (o.metal === 'copper' ? 'copper' : 'blue');
    if (cp.mech === 'pump') {
      s += '<rect x="' + f(x - capW / 2) + '" y="' + f(capY) + '" width="' + f(capW) + '" height="' + capH + '" rx="3" fill="url(#clr)" stroke="rgba(18,28,74,.35)"/>';
      s += '<rect x="' + f(x - 13) + '" y="' + f(capY + 6) + '" width="26" height="' + (capH - 22) + '" rx="3" fill="url(#cu)"/><rect x="' + f(x - capW / 2) + '" y="' + f(capY) + '" width="' + f(capW) + '" height="2.4" fill="url(#cu)"/>';
    } else {
      s += cp.shape === 'oct' ? oct(x, capY, capW, capH, tone) : roundCap(x, capY, capW, capH, tone);
      if (tone === 'copper') s += '<rect x="' + f(x - capW / 2) + '" y="' + f(capY) + '" width="' + f(capW) + '" height="2.4" fill="rgba(255,255,255,.3)"/>';
      if (o.metal === 'ringed' && tone !== 'copper') s += '<rect x="' + f(x - capW / 2) + '" y="' + f(capY) + '" width="' + f(capW) + '" height="3" fill="url(#cu)"/>';
      var dark = tone === 'copper' ? '#6E3A18' : '#0B1048';
      if (cp.mech === 'flip') { var py = capY + capH * 0.45; s += '<path d="M' + f(x - capW / 2) + ' ' + f(py) + 'H' + f(x + capW / 2) + '" stroke="' + dark + '" stroke-width="1.3"/><path d="M' + f(x - 10) + ' ' + f(py) + 'Q' + f(x) + ' ' + f(py + 8) + ' ' + f(x + 10) + ' ' + f(py) + '" fill="' + dark + '"/>'; }
      if (o.cap === 'clearFlip' || o.cap === 'clearRoundFlip') s += '<rect x="' + f(x - 5) + '" y="' + f(capY + 6) + '" width="10" height="' + (capH - 12) + '" rx="2" fill="#1E2AA0" opacity=".55"/>';
      if (band === 'metalCollar') s += '<rect x="' + f(x - capW / 2 - 2) + '" y="' + f(capY - 9) + '" width="' + f(capW + 4) + '" height="11" rx="2" fill="url(#cu)"/><rect x="' + f(x - capW / 2 - 2) + '" y="' + f(capY - 9) + '" width="' + f(capW + 4) + '" height="2" fill="rgba(255,255,255,.4)"/>';
      if (cp.mech === 'disc') { var dy = capY + capH - 9; s += '<path d="M' + f(x - capW / 2) + ' ' + f(dy) + 'H' + f(x + capW / 2) + '" stroke="' + dark + '" stroke-width="1"/><ellipse cx="' + f(x) + '" cy="' + f(dy + 4) + '" rx="' + f(capW * 0.22) + '" ry="3" fill="' + dark + '" opacity=".55"/>'; }
    }
    return s;
  }

  // jar: {shape: low|std|tall|dw, lid: round|tallLid|blueLid|blueAll|oct, body: blue|copper}, k = scale
  var JAR_SHAPES = { low: { label: '넓고 낮은 자 (확정)', w: 136, bodyH: 66, lidH: 28 }, std: { label: '표준 자', w: 120, bodyH: 74, lidH: 30 }, tall: { label: '높은 자', w: 108, bodyH: 88, lidH: 30 }, dw: { label: '이중벽 두툼한 자', w: 132, bodyH: 78, lidH: 34 } };
  var JAR_LIDS = { round: '코퍼 뚜껑 (확정)', tallLid: '높은 코퍼 뚜껑', blueLid: '블루 뚜껑 + 코퍼 링', blueAll: '올 블루 뚜껑', oct: '8각 코퍼 뚜껑 (금형 필요)' };
  var JAR_BODIES = { blue: '로열블루', copper: '코퍼(한정판)' };
  function jar(x, ground, o, k) {
    o = o || {}; k = k || 1;
    var js = JAR_SHAPES[o.shape || 'low'], w = js.w * k, bodyH = js.bodyH * k, lidH = (o.lid === 'tallLid' ? js.lidH * 1.5 : js.lidH) * k;
    var by = ground - bodyH, ly = by - lidH, s = '', blue = o.body !== 'copper';
    s += '<ellipse cx="' + f(x) + '" cy="' + f(ground + 2) + '" rx="' + f(w * 0.62) + '" ry="' + f(7 * k) + '" fill="url(#sh)"/>';
    s += '<rect x="' + f(x - w / 2 + 3 * k) + '" y="' + f(by) + '" width="' + f(w - 6 * k) + '" height="' + f(bodyH) + '" rx="' + f(8 * k) + '" fill="' + (blue ? 'url(#rb)' : 'url(#cuBody)') + '"/>';
    if (o.shape === 'dw') s += '<rect x="' + f(x - w / 2 + 3 * k) + '" y="' + f(ground - 8 * k) + '" width="' + f(w - 6 * k) + '" height="' + f(8 * k) + '" rx="' + f(4 * k) + '" fill="rgba(0,0,0,.18)"/>';
    if (o.lid === 'oct') s += oct(x, ly, w, lidH, 'copper');
    else if (o.lid === 'blueLid' || o.lid === 'blueAll') { s += '<rect x="' + f(x - w / 2) + '" y="' + f(ly) + '" width="' + f(w) + '" height="' + f(lidH) + '" rx="3" fill="url(#rbF)"/>'; if (o.lid === 'blueLid') s += '<rect x="' + f(x - w / 2) + '" y="' + f(ly + lidH - 4 * k) + '" width="' + f(w) + '" height="' + f(4 * k) + '" fill="url(#cu)"/>'; }
    else s += '<rect x="' + f(x - w / 2) + '" y="' + f(ly) + '" width="' + f(w) + '" height="' + f(lidH) + '" rx="3" fill="url(#cu)"/><rect x="' + f(x - w / 2) + '" y="' + f(ly) + '" width="' + f(w) + '" height="2" fill="rgba(255,255,255,.35)"/>';
    return s + label(x, by + 2 * k, ground, w - 6 * k, 'THE FILM|BALM CREAM', '18 mL', blue ? CU_TXT : BLUE_TXT, blue ? 'url(#cu)' : BLUE_TXT, true);
  }
  function jarWarn(j) {
    var w = [];
    if (j.lid === 'oct') w.push('[R06] 자 8각 뚜껑은 신규 금형 필요 · 보류');
    if (j.lid === 'blueLid' || j.lid === 'blueAll') w.push('[R07] 자 뚜껑 블루는 확정 규칙(용기 블루·뚜껑 코퍼)과 다름');
    if (j.body === 'copper') w.push('[R12] 코퍼 바디 자는 한정판 옵션');
    if (j.shape && j.shape !== 'low') w.push('[R07] 자 형태는 가이드 확정(넓고 낮은 원형)과 다름');
    return w;
  }

  function scene(W, H, split, ground) {
    var s = '<rect width="' + W + '" height="' + H + '" fill="#EFECE6"/><rect x="' + split + '" width="' + (W - split) + '" height="' + H + '" fill="#E6EAF1"/>';
    for (var gx = split; gx < W; gx += 40) s += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + ground + '" stroke="#D3D9E4"/>';
    for (var gy = 0; gy < ground; gy += 40) s += '<line x1="' + split + '" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#D3D9E4"/>';
    s += '<rect y="' + ground + '" width="' + split + '" height="' + (H - ground) + '" fill="#D9D1C4"/><rect x="' + split + '" y="' + ground + '" width="' + (W - split) + '" height="' + (H - ground) + '" fill="#CAD2DF"/>';
    return s + '<text x="14" y="22" ' + SANS + ' font-size="10.5" letter-spacing="2" fill="#7A6E5C">VANITY</text><text x="' + (split + 14) + '" y="22" ' + SANS + ' font-size="10.5" letter-spacing="2" fill="#5C6A82">BATH</text>';
  }

  var BAR = { name: 'THE BARRIER|CREAM', vol: '58 mL / 1.9 fl oz' };
  var MSK = { name: 'THE WRAPPING|MASK', vol: '80 mL / 2.7 fl oz' };
  function merge(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }

  function pair(b, m, opts) {
    opts = opts || {};
    var W = 560, H = 476, G = 420;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || '배리어와 랩핑 조합') + '">' + scene(W, H, 280, G);
    s += tube(140, G, merge(BAR, b)) + tube(420, G, merge(MSK, m));
    s += cap2(140, G, '배리어 · ' + SHAPES[b.shape].label, capName(b), '#5B5040') + cap2(420, G, '랩핑 · ' + SHAPES[m.shape].label, capName(m), '#3F4C66');
    return s + '</svg>';
  }
  function cap2(x, G, l1, l2, col) {
    return '<text x="' + x + '" y="' + (G + 24) + '" text-anchor="middle" ' + KR + ' font-size="11.5" font-weight="600" fill="' + col + '">' + l1 + '</text><text x="' + x + '" y="' + (G + 41) + '" text-anchor="middle" ' + KR + ' font-size="10.5" fill="' + col + '">' + l2 + '</text>';
  }
  function trio(j, b, m, opts) {
    opts = opts || {};
    var W = 800, H = 476, G = 420, split = 500;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || '필름밤 자, 배리어, 랩핑 라인업') + '">' + scene(W, H, split, G);
    s += jar(120, G, j, 0.92) + tube(355, G, merge(BAR, b)) + tube(650, G, merge(MSK, m));
    s += cap2(120, G, '필름밤 · 18ml', (JAR_SHAPES[j.shape || 'low'].label + ' · ' + JAR_LIDS[j.lid || 'round']).replace(' (확정)', '').replace(' (확정)', ''), '#5B5040');
    s += cap2(355, G, '배리어 · ' + SHAPES[b.shape].label, capName(b), '#5B5040') + cap2(650, G, '랩핑 · ' + SHAPES[m.shape].label, capName(m), '#3F4C66');
    return s + '</svg>';
  }
  function capName(o) {
    var c = CAPS[o.cap];
    if (o.cap === 'clearFlip' || o.cap === 'clearRoundFlip' || c.mech === 'pump') return c.label;
    return (METALS[o.metal] || '') + ' ' + c.label + (o.body === 'copper' ? ' · 코퍼 바디' : '') + (o.band && o.band !== 'none' ? ' · ' + BANDS[o.band === true ? 'printCu' : o.band] : '');
  }
  function jarCard(lid, caption) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" role="img" aria-label="필름밤 자 ' + caption + '"><rect width="260" height="200" fill="#EFECE6"/><rect y="160" width="260" height="40" fill="#D9D1C4"/>';
    return s + jar(130, 160, { lid: lid === 'tall' ? 'tallLid' : lid, shape: 'low' }) + '</svg>';
  }


  // 앰플·세럼 병: {type: dropper|pump|airless|spray, body: blue|copper, finish: smooth|ribbed, bulb: copper|blue}
  var BOTTLE_TYPES = { dropper: '스포이드 병', pump: '펌프 병', airless: '슬림 에어리스 + 코퍼 밴드', spray: '미스트 스프레이 + 오버캡' };
  var FINISHES = { smooth: '브러시드 코퍼(민무늬)', ribbed: '리브드 코퍼(세로 홈)' };
  var BULBS = { copper: '코퍼 벌브', blue: '블루 벌브 + 코퍼 링' };
  function ribs(x, y, w, h) { var s = '', n = Math.max(6, Math.round(w / 4)); for (var i = 1; i < n; i++) { var lx = x - w / 2 + (w / n) * i; s += '<line x1="' + f(lx) + '" y1="' + f(y + 2) + '" x2="' + f(lx) + '" y2="' + f(y + h - 2) + '" stroke="rgba(90,45,15,.35)" stroke-width=".8"/>'; } return s; }
  function metal(x, y, w, h, finish, rx) { return '<rect x="' + f(x - w / 2) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + (rx || 3) + '" fill="url(#cu)"/>' + (finish === 'ribbed' ? ribs(x, y, w, h) : '') + '<rect x="' + f(x - w / 2) + '" y="' + f(y) + '" width="' + f(w) + '" height="2" fill="rgba(255,255,255,.35)"/>'; }
  function bottle(x, ground, o, name, vol) {
    o = o || {}; var t = o.type || 'dropper', blue = o.body !== 'copper', s = '';
    var w = t === 'airless' ? 64 : 98, bh = t === 'airless' ? 236 : (t === 'pump' || t === 'spray' ? 178 : 164);
    var top = ground - bh, fill = blue ? 'url(#rb)' : 'url(#cuBody)';
    s += '<ellipse cx="' + f(x) + '" cy="' + f(ground + 2) + '" rx="' + f(w * 0.62) + '" ry="7" fill="url(#sh)"/>';
    if (t === 'airless') {
      s += '<rect x="' + f(x - w / 2) + '" y="' + f(top) + '" width="' + w + '" height="' + bh + '" rx="10" fill="' + fill + '"/>';
      s += metal(x, top + 26, w, 14, o.finish, 0);
      s += metal(x, top - 46, w - 2, 46, o.finish, 6);
      s += label(x, top + 44, ground - 4, w * 0.92, name, vol, blue ? CU_TXT : BLUE_TXT, blue ? 'url(#cu)' : BLUE_TXT, false);
      return s;
    }
    s += '<path d="M' + f(x - w / 2) + ' ' + f(ground - 8) + 'V' + f(top + 26) + 'Q' + f(x - w / 2) + ' ' + f(top) + ' ' + f(x - w / 2 + 26) + ' ' + f(top) + 'H' + f(x + w / 2 - 26) + 'Q' + f(x + w / 2) + ' ' + f(top) + ' ' + f(x + w / 2) + ' ' + f(top + 26) + 'V' + f(ground - 8) + 'Q' + f(x + w / 2) + ' ' + f(ground) + ' ' + f(x + w / 2 - 8) + ' ' + f(ground) + 'H' + f(x - w / 2 + 8) + 'Q' + f(x - w / 2) + ' ' + f(ground) + ' ' + f(x - w / 2) + ' ' + f(ground - 8) + 'Z" fill="' + fill + '"/>';
    if (t === 'dropper') {
      s += metal(x, top - 36, 46, 38, o.finish, 3);
      if (o.bulb === 'blue') s += '<rect x="' + f(x - 15) + '" y="' + f(top - 82) + '" width="30" height="50" rx="14" fill="url(#rbF)"/>' + metal(x, top - 38, 46, 6, o.finish, 1);
      else s += '<rect x="' + f(x - 15) + '" y="' + f(top - 82) + '" width="30" height="50" rx="14" fill="url(#cu)"/>' + (o.finish === 'ribbed' ? ribs(x, top - 70, 30, 34) : '');
    } else if (t === 'pump') {
      s += metal(x, top - 30, 64, 32, o.finish, 3);
      s += '<rect x="' + f(x - 9) + '" y="' + f(top - 58) + '" width="18" height="30" fill="url(#cu)"/>' + metal(x - 4, top - 72, 44, 16, o.finish, 3) + '<rect x="' + f(x - 34) + '" y="' + f(top - 68) + '" width="16" height="7" rx="2" fill="url(#cu)"/>';
    } else if (t === 'spray') {
      s += metal(x, top - 74, 66, 76, o.finish, 4);
    }
    s += label(x, top + 6, ground - 4, w * 0.9, name, vol, blue ? CU_TXT : BLUE_TXT, blue ? 'url(#cu)' : BLUE_TXT, false);
    return s;
  }
  function bottleWarn(kind, o) {
    var w = [], who = kind === 'a' ? '앰플' : '세럼', std = kind === 'a' ? 'dropper' : 'pump';
    if (o.type !== std) w.push((kind === 'a' ? '[R10] ' : '[R11] ') + who + ' 기준 용기(' + BOTTLE_TYPES[std] + ')와 다름');
    if (o.body === 'copper') w.push('[R12] ' + who + ' 코퍼 바디는 한정판 옵션');
    if (o.type === 'dropper' && o.bulb === 'blue') w.push('[R08] 앰플은 화장대 제품 · 블루 벌브면 코퍼 메탈 비중이 줄어듦');
    if (o.type === 'spray' && kind === 'a') w.push('앰플 미스트는 점도 높은 처방에 맞지 않을 수 있음(처방 확인)');
    return w;
  }
  var AMP = { name: 'THE|AMPOULE', vol: '30 mL / 1.0 fl oz' }, SER = { name: 'THE|SERUM', vol: '30 mL / 1.0 fl oz' };
  function lineup(j, b, m, a, sv, opts) {
    opts = opts || {}; a = a || { type: 'dropper', body: 'blue', finish: 'smooth', bulb: 'copper' }; sv = sv || { type: 'pump', body: 'blue', finish: 'smooth' };
    var W = 1000, H = 476, G = 420, split = 760;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || '터노바 5종 라인업') + '">' + scene(W, H, split, G);
    s += jar(95, G, j, 0.92) + tube(270, G, merge(BAR, b)) + bottle(450, G, a, AMP.name, AMP.vol) + bottle(620, G, sv, SER.name, SER.vol) + tube(880, G, merge(MSK, m));
    s += cap2(95, G, '필름밤 · 18ml', JAR_LIDS[j.lid || 'round'].replace(' (확정)', ''), '#5B5040');
    s += cap2(270, G, '배리어 · ' + SHAPES[b.shape].label, capName(b), '#5B5040');
    s += cap2(450, G, '앰플 · 30ml', BOTTLE_TYPES[a.type] + (a.finish === 'ribbed' ? ' · 리브드' : ''), '#5B5040');
    s += cap2(620, G, '세럼 · 30ml', BOTTLE_TYPES[sv.type] + (sv.finish === 'ribbed' ? ' · 리브드' : ''), '#5B5040');
    s += cap2(880, G, '랩핑 · ' + SHAPES[m.shape].label, capName(m), '#3F4C66');
    return s + '</svg>';
  }
  function duo(a, sv, opts) {
    opts = opts || {}; var W = 420, H = 400, G = 344;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || '앰플과 세럼') + '"><rect width="' + W + '" height="' + H + '" fill="#EFECE6"/><rect y="' + G + '" width="' + W + '" height="' + (H - G) + '" fill="#D9D1C4"/><text x="14" y="22" ' + SANS + ' font-size="10.5" letter-spacing="2" fill="#7A6E5C">VANITY</text>';
    s += bottle(120, G, a, AMP.name, AMP.vol) + bottle(300, G, sv, SER.name, SER.vol);
    s += cap2(120, G, '앰플 · 30ml', BOTTLE_TYPES[a.type], '#5B5040') + cap2(300, G, '세럼 · 30ml', BOTTLE_TYPES[sv.type], '#5B5040');
    return s + '</svg>';
  }

  // 구분 축 판정: 여는 방식, 캡 높이, 캡 색, 튜브 지름, 캡 소재
  function axes(b, m) {
    var cb = CAPS[b.cap], cm = CAPS[m.cap];
    var cl = function (o) { return o.cap === 'clearFlip' || o.cap === 'clearRoundFlip'; };
    var toneB = cl(b) ? 'clear' : b.metal, toneM = cl(m) ? 'clear' : m.metal;
    var res = [
      ['여는 방식', cb.mech !== cm.mech],
      ['캡 높이', Math.abs(cb.h - cm.h) >= 20],
      ['캡 색', toneB !== toneM || b.body !== m.body],
      ['튜브 지름', SHAPES[b.shape].w !== SHAPES[m.shape].w],
      ['캡 소재(메탈/PP)', (toneB === 'copper') !== (toneM === 'copper')]
    ];
    var warn = [];
    if (b.body === 'copper' || m.body === 'copper') warn.push('[R12] 코퍼 바디는 한정판 옵션 · 상시 SKU는 블루');
    if (cb.shape === 'oct' || cm.shape === 'oct') warn.push('[R06] 8각은 신규 금형 필요(800만–2,500만 원 추정) · 비용으로 보류');
    if (cb.mech === 'pump' || cm.mech === 'pump') warn.push('에어리스는 캡슐·젤 경화 리스크로 제외 대상');
    if (toneM === 'copper' && cm.mech === 'flip') warn.push('욕실 코퍼 증착 원터치는 마모 시험 필요');
    if (cm.mech === 'screw') warn.push('[R08] 욕실 제품은 원터치 · 젖은 손 스크류 개폐 불편');
    if (cm.mech === 'disc') warn.push('디스크탑은 필름 젤 잔여물 고착 위험');
    [b, m].forEach(function (o, i) {
      var bd = o.band === true ? 'printCu' : o.band, who = i ? '랩핑' : '배리어';
      if (bd === 'foilCu') warn.push('[R04] ' + who + ' 유광 금박 띠: "유광은 로고만" 규칙과 충돌' + (i ? ', 욕실 습기에 박 들뜸 위험' : ''));
      if (bd === 'printCu') warn.push('[R07] ' + who + ' 무광 코퍼 띠: 자 "띠 없음"(10/6) 결정과 같은 판단 필요');
    });
    if (cb.mech === 'flip') warn.push('[R08] 화장대 제품은 코퍼 메탈 캡 · 원터치는 메탈 무게감이 약함');
    if (m.band === 'metalCollar') warn.push('욕실 코퍼 메탈 칼라: 물 얼룩·부식 시험 필요(아노다이징 실링 또는 PP 증착으로 대체 가능)');
    return { axes: res, score: res.filter(function (r) { return r[1]; }).length, warn: warn };
  }

  root.TNC = { BOTTLE_TYPES: BOTTLE_TYPES, FINISHES: FINISHES, BULBS: BULBS, bottleWarn: bottleWarn, lineup: lineup, duo: duo, JAR_SHAPES: JAR_SHAPES, JAR_LIDS: JAR_LIDS, JAR_BODIES: JAR_BODIES, jarWarn: jarWarn, trio: trio, CAPS: CAPS, SHAPES: SHAPES, BODIES: BODIES, METALS: METALS, BANDS: BANDS, oct: oct, pair: pair, jarCard: jarCard, axes: axes };
})(typeof window !== 'undefined' ? window : globalThis);
