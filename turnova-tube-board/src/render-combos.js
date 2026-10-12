// Pre-renders the combo gallery (static, complete at rest) and the builder shell into combos-section.html.
const fs = require('fs');
require('./combos.js');
const T = globalThis.TNC;
const D = require('./combos-data.js');
const SYM = fs.readFileSync(require('path').join(__dirname, '..', require('fs').existsSync(__dirname + '/../mockups') ? 'mockups' : 'mock', 'sym-path.txt'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const TAG = { pick: ['gold', '추천'], alt: ['warn', '대안'], ref: ['', '참고'], no: ['bad', '비추천'] };

const defs = `<svg id="tn-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="cu" x1="0" x2="1"><stop offset="0" stop-color="#9C5A2A"/><stop offset=".22" stop-color="#E9A57A"/><stop offset=".45" stop-color="#C47E4E"/><stop offset=".7" stop-color="#F4C2A0"/><stop offset="1" stop-color="#A5622F"/></linearGradient>
<linearGradient id="cuL" x1="0" x2="1"><stop offset="0" stop-color="#7E4520"/><stop offset="1" stop-color="#B9733F"/></linearGradient>
<linearGradient id="cuR" x1="0" x2="1"><stop offset="0" stop-color="#D99A6E"/><stop offset="1" stop-color="#7E4520"/></linearGradient>
<linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#121A6E"/><stop offset=".3" stop-color="#2533B0"/><stop offset=".62" stop-color="#1E2AA0"/><stop offset="1" stop-color="#111865"/></linearGradient>
<linearGradient id="rbF" x1="0" x2="1"><stop offset="0" stop-color="#1A2590"/><stop offset=".5" stop-color="#2836B4"/><stop offset="1" stop-color="#18228A"/></linearGradient>
<linearGradient id="rbL" x1="0" x2="1"><stop offset="0" stop-color="#0D1352"/><stop offset="1" stop-color="#1B2694"/></linearGradient>
<linearGradient id="rbR" x1="0" x2="1"><stop offset="0" stop-color="#2230A6"/><stop offset="1" stop-color="#0D1352"/></linearGradient>
<linearGradient id="clr" x1="0" x2="1"><stop offset="0" stop-color="#5865C8" stop-opacity=".75"/><stop offset=".45" stop-color="#B7BFF0" stop-opacity=".8"/><stop offset="1" stop-color="#4C59C0" stop-opacity=".75"/></linearGradient>
<linearGradient id="clrL" x1="0" x2="1"><stop offset="0" stop-color="#3A46A8" stop-opacity=".8"/><stop offset="1" stop-color="#6C78D2" stop-opacity=".75"/></linearGradient>
<linearGradient id="clrR" x1="0" x2="1"><stop offset="0" stop-color="#7A86DA" stop-opacity=".75"/><stop offset="1" stop-color="#3A46A8" stop-opacity=".8"/></linearGradient>
<linearGradient id="foil" x1="0" x2="1"><stop offset="0" stop-color="#B86A35"/><stop offset=".35" stop-color="#FFD9BE"/><stop offset=".5" stop-color="#E39466"/><stop offset=".8" stop-color="#FFE6D3"/><stop offset="1" stop-color="#B26332"/></linearGradient>
<linearGradient id="cuBody" x1="0" x2="1"><stop offset="0" stop-color="#C98157"/><stop offset=".32" stop-color="#F2B48D"/><stop offset=".62" stop-color="#E7A177"/><stop offset="1" stop-color="#BE774E"/></linearGradient>
<radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<symbol id="tn8" viewBox="0 0 1000 1000"><path d="${SYM}" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round"/></symbol>
</defs></svg>`;

function chips(a) {
  return a.axes.map(([k, on]) => `<span class="ax ${on ? 'on' : ''}">${on ? '✓' : '–'} ${k}</span>`).join('');
}
function card(p, held) {
  const a = T.axes(p.b, p.m), [cls, t] = held ? ['', '8각 보류'] : TAG[p.tag];
  return `<article class="combo ${p.tag === 'pick' && !held ? 'pick' : ''}" data-tag="${held ? 'held' : p.tag}">
  <figure>${T.pair(p.b, p.m, { aria: p.id + ' ' + p.title })}</figure>
  <div class="cb">
    <div class="ct"><span class="cid">${p.id}</span><span class="tag ${cls}">${t}</span><h3>${esc(p.title)}</h3></div>
    <p>${esc(p.idea)}</p>
    ${p.sns ? `<p class="sns"><b>SNS</b> ${esc(p.sns)}</p>` : ''}
    <div class="axrow">${chips(a)}<b class="sc">${a.score}/5</b></div>
    ${a.warn.length ? `<ul class="warn">${a.warn.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
    <div class="from">참고: ${esc(p.from)}</div>
    <button type="button" class="load" data-id="${p.id}">빌더에서 열기</button>
  </div>
</article>`;
}
const stockCards = D.stock.map(p => card(p, false)).join('\n');
const heldCards = D.pairs.map(p => card(p, true)).join('\n');
const jarTag = { round: ['gold', '추천'], tall: ['warn', '대안'], blueLid: ['', '참고'], oct: ['', '8각 보류'] };
const jars = D.jars.map(j => { const [cls, t] = jarTag[j.lid]; return `<article class="jarc"><figure>${T.jarCard(j.lid, j.title)}</figure><div class="cb"><div class="ct"><span class="tag ${cls}">${t}</span><h3>${esc(j.title)}</h3></div><p>${esc(j.lid === 'oct' ? '튜브 8각 캡과 한 가족. 금형 비용으로 보류.' : j.note)}</p></div></article>`; }).join('\n');

// 같은 80ml를 지름별로: 길이 L = (V + c·k) / (s·k), k = (Φ/35)^2, s = 0.968 ml/mm, c = 43.6 (35Φ 107mm≈60ml, 138mm≈90ml 기준, 추정)
function bodyChart() {
  const rows = [30, 35, 40, 45].map(D0 => { const k = (D0 / 35) ** 2; return { D0, w: Math.PI * D0 / 2, L: (80 + 43.6 * k) / (0.968 * k), L58: (58 + 43.6 * k) / (0.968 * k) }; });
  const S = 1.7, G = 362, W = 900; let s = `<svg viewBox="0 0 ${W} 430" role="img" aria-label="같은 80ml 튜브를 지름 30·35·40·45Φ로 만들 때의 길이와 폭 비교(추정)"><rect width="${W}" height="430" fill="#F1F2F6"/><line x1="40" y1="${G}" x2="${W - 40}" y2="${G}" stroke="#C9CEDD"/>`;
  rows.forEach((r, i) => {
    const cx = 130 + i * 210, w = r.w * S, h = r.L * S, capH = 22 * S, capW = Math.min(w * 0.7, 46 * S), top = G - capH - h;
    s += `<rect x="${(cx - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${(h).toFixed(1)}" rx="4" fill="url(#rb)"/>`;
    s += `<rect x="${(cx - w / 2 - 1).toFixed(1)}" y="${top.toFixed(1)}" width="${(w + 2).toFixed(1)}" height="10" fill="#18217F"/>`;
    s += `<rect x="${(cx - capW / 2).toFixed(1)}" y="${(G - capH).toFixed(1)}" width="${capW.toFixed(1)}" height="${capH.toFixed(1)}" rx="3" fill="url(#cu)"/>`;
    s += `<text x="${cx}" y="${(top + 34).toFixed(1)}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="${Math.max(11, w * 0.15).toFixed(1)}" fill="#E8956A">TURNOVA</text>`;
    s += `<text x="${cx}" y="${G + 26}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="13" fill="#2B3260">${r.D0}Φ × ${Math.round(r.L)}mm</text>`;
    s += `<text x="${cx}" y="${G + 46}" text-anchor="middle" font-family="'IBM Plex Sans KR', sans-serif" font-size="11.5" fill="#6B7287">정면 폭 약 ${Math.round(r.w)}mm · 58ml면 ${Math.round(r.L58)}mm</text>`;
  });
  return s + `<text x="40" y="28" font-family="'IBM Plex Sans KR', sans-serif" font-size="13" fill="#2B3260">같은 80 mL · 지름만 바꾼 4가지 체형 (축척 동일, 캡 높이 22mm 가정)</text></svg>`;
}

const opt = (obj, sel) => Object.keys(obj).map(k => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(typeof obj[k] === 'string' ? obj[k] : obj[k].label)}${obj[k].shape === 'oct' ? ' (금형 필요)' : ''}</option>`).join('');
function side(prefix, title, o) {
  return `<fieldset class="side"><legend>${title}</legend>
  <label for="${prefix}-shape">튜브 체형</label><select id="${prefix}-shape" data-k="shape">${opt(T.SHAPES, o.shape)}</select>
  <label for="${prefix}-body">바디</label><select id="${prefix}-body" data-k="body">${opt(T.BODIES, o.body)}</select>
  <label for="${prefix}-cap">캡</label><select id="${prefix}-cap" data-k="cap">${opt(T.CAPS, o.cap)}</select>
  <label for="${prefix}-metal">캡 색</label><select id="${prefix}-metal" data-k="metal">${opt(T.METALS, o.metal)}</select>
  <label for="${prefix}-band">띠·칼라</label><select id="${prefix}-band" data-k="band">${opt(T.BANDS, o.band || 'none')}</select>
</fieldset>`;
}
const ALL = D.stock.concat(D.pairs);
const p1 = D.stock[0], a1 = T.axes(p1.b, p1.m);
const builder = `<div class="builder" id="builder">
  <div class="bctl">
    <div class="brow"><label for="preset">시작 조합</label><select id="preset">${ALL.map(p => `<option value="${p.id}">${p.id} · ${esc(p.title)}</option>`).join('')}</select>
    <button type="button" id="shuffle">무작위 조합</button></div>
    <div class="sides">${side('b', '배리어 · 화장대', p1.b)}${side('m', '랩핑 · 화장실', p1.m)}</div>
  </div>
  <div class="bview">
    <figure id="bfig">${T.pair(p1.b, p1.m, { aria: '빌더 미리보기' })}</figure>
    <div class="axrow" id="baxes">${chips(a1)}<b class="sc">${a1.score}/5</b></div>
    <ul class="warn" id="bwarn">${a1.warn.length ? a1.warn.map(w => `<li>${esc(w)}</li>`).join('') : '<li style="color:var(--ok)">걸리는 점 없음</li>'}</ul>
    <p class="bnote">'(금형 필요)'가 붙은 8각 캡은 비용 때문에 보류한 옵션입니다. 판정은 다섯 구분 축과 가이드 규칙을 기준으로 자동 계산합니다.</p>
  </div>
</div>`;

fs.writeFileSync(__dirname + '/combos-section.html', `<section id="combos">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">05 · 기성 부자재 조합 · 8각 없이 ${D.stock.length}종 + 체형 차트 + 자 ${D.jars.length}종</div>
      <h2>금형 없이 체형·캡·띠로 구분하는 ${D.stock.length}가지</h2>
      <p class="lede">8각은 신규 금형비(800만–2,500만 원, 추정) 때문에 보류하고, 기성 튜브와 기성 캡으로만 다시 짰습니다. 왼쪽이 배리어(화장대), 오른쪽이 랩핑(화장실)입니다. 카드마다 SNS에서 어떻게 보이는지 한 줄씩 붙였습니다. 체크 표시는 다섯 구분 축 가운데 두 튜브가 실제로 다른 축이고, 주황 줄은 가이드나 기능 면에서 걸리는 점입니다.</p>
    </div>
    <figure class="chart">${bodyChart()}<figcaption>같은 용량이어도 지름을 바꾸면 체형이 달라집니다. 길이는 35Φ 기성 규격(107mm≈60ml, 138mm≈90ml)에서 지름 비율로 환산한 추정치이며, 공급사 도면으로 확정합니다.</figcaption></figure>
    <div class="filters" role="group" aria-label="조합 필터">
      <button type="button" id="c-all" data-c="all" aria-pressed="true">전체</button>
      <button type="button" id="c-pick" data-c="pick" aria-pressed="false">추천</button>
      <button type="button" id="c-alt" data-c="alt" aria-pressed="false">대안</button>
      <button type="button" id="c-ref" data-c="ref" aria-pressed="false">참고</button>
      <button type="button" id="c-no" data-c="no" aria-pressed="false">비추천</button>
    </div>
    <div class="combos" id="combo-grid">
${stockCards}
    </div>
    <h3 class="subh">필름밤 18ml 자 · 뚜껑 4가지</h3>
    <div class="jars">${jars}</div>
    <h3 class="subh" id="builder-h">조합 빌더 · 직접 섞어 보기</h3>
    ${builder}
    <details class="held">
      <summary>8각 캡 조합 18종 (비용으로 보류, 기록용)</summary>
      <div class="combos" style="margin-top:14px">
${heldCards}
      </div>
    </details>
  </div>
</section>`);
fs.writeFileSync(__dirname + '/defs.html', defs);
console.log('stock', D.stock.map(p => p.id + ':' + T.axes(p.b, p.m).score + '/' + T.axes(p.b, p.m).warn.length).join(' '));
fs.writeFileSync(__dirname + '/builder.js', fs.readFileSync(__dirname + '/builder.tpl.js', 'utf8').replace('__PRESETS__', JSON.stringify(D.stock.concat(D.pairs).map(p => ({ id: p.id, b: p.b, m: p.m })))));
