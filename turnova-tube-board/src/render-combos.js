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
<linearGradient id="cuBody" x1="0" x2="1"><stop offset="0" stop-color="#C98157"/><stop offset=".32" stop-color="#F2B48D"/><stop offset=".62" stop-color="#E7A177"/><stop offset="1" stop-color="#BE774E"/></linearGradient>
<radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<symbol id="tn8" viewBox="0 0 1000 1000"><path d="${SYM}" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round"/></symbol>
</defs></svg>`;

function chips(a) {
  return a.axes.map(([k, on]) => `<span class="ax ${on ? 'on' : ''}">${on ? '✓' : '–'} ${k}</span>`).join('');
}
const cards = D.pairs.map(p => {
  const a = T.axes(p.b, p.m), [cls, t] = TAG[p.tag];
  return `<article class="combo ${p.tag === 'pick' ? 'pick' : ''}" data-tag="${p.tag}">
  <figure>${T.pair(p.b, p.m, { aria: p.id + ' ' + p.title })}</figure>
  <div class="cb">
    <div class="ct"><span class="cid">${p.id}</span><span class="tag ${cls}">${t}</span><h3>${esc(p.title)}</h3></div>
    <p>${esc(p.idea)}</p>
    <div class="axrow">${chips(a)}<b class="sc">${a.score}/5</b></div>
    ${a.warn.length ? `<ul class="warn">${a.warn.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
    <div class="from">참고: ${esc(p.from)}</div>
    <button type="button" class="load" data-id="${p.id}">빌더에서 열기</button>
  </div>
</article>`;
}).join('\n');
const jars = D.jars.map(j => { const [cls, t] = TAG[j.tag]; return `<article class="jarc"><figure>${T.jarCard(j.lid, j.title)}</figure><div class="cb"><div class="ct"><span class="tag ${cls}">${t}</span><h3>${esc(j.title)}</h3></div><p>${esc(j.note)}</p></div></article>`; }).join('\n');

const opt = (obj, sel) => Object.keys(obj).map(k => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(typeof obj[k] === 'string' ? obj[k] : obj[k].label)}</option>`).join('');
function side(prefix, title, o) {
  return `<fieldset class="side"><legend>${title}</legend>
  <label for="${prefix}-shape">튜브 형태</label><select id="${prefix}-shape" data-k="shape">${opt(T.SHAPES, o.shape)}</select>
  <label for="${prefix}-body">바디</label><select id="${prefix}-body" data-k="body">${opt(T.BODIES, o.body)}</select>
  <label for="${prefix}-cap">캡</label><select id="${prefix}-cap" data-k="cap">${opt(T.CAPS, o.cap)}</select>
  <label for="${prefix}-metal">캡 색</label><select id="${prefix}-metal" data-k="metal">${opt(T.METALS, o.metal)}</select>
  <label class="chk" for="${prefix}-band"><input type="checkbox" id="${prefix}-band" data-k="band"${o.band ? ' checked' : ''}> 코퍼 숄더 밴드</label>
</fieldset>`;
}
const p1 = D.pairs[0], a1 = T.axes(p1.b, p1.m);
const builder = `<div class="builder" id="builder">
  <div class="bctl">
    <div class="brow"><label for="preset">시작 조합</label><select id="preset">${D.pairs.map(p => `<option value="${p.id}">${p.id} · ${esc(p.title)}</option>`).join('')}</select>
    <button type="button" id="shuffle">무작위 조합</button></div>
    <div class="sides">${side('b', '배리어 · 화장대', p1.b)}${side('m', '랩핑 · 화장실', p1.m)}</div>
  </div>
  <div class="bview">
    <figure id="bfig">${T.pair(p1.b, p1.m, { aria: '빌더 미리보기' })}</figure>
    <div class="axrow" id="baxes">${chips(a1)}<b class="sc">${a1.score}/5</b></div>
    <ul class="warn" id="bwarn">${a1.warn.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
    <p class="bnote">튜브 4형태 × 바디 2 × 캡 10 × 캡 색 3 × 밴드 2 = 한쪽 480가지, 두 튜브를 합치면 23만 가지가 넘습니다. 판정은 다섯 구분 축과 가이드 정합 기준으로 자동 계산합니다.</p>
  </div>
</div>`;

fs.writeFileSync(__dirname + '/combos-section.html', `<section id="combos">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">05 · 조합 갤러리 · 페어 ${D.pairs.length}종 + 자 ${D.jars.length}종</div>
      <h2>배리어 × 랩핑 조합 ${D.pairs.length}가지</h2>
      <p class="lede">레퍼런스에서 나온 방법을 조합별로 그렸습니다. 왼쪽이 배리어(화장대), 오른쪽이 랩핑(화장실)입니다. 체크 표시는 다섯 구분 축(여는 방식, 캡 높이, 캡 색, 지름, 캡 소재) 가운데 두 튜브가 실제로 다른 축이고, 아래 줄은 가이드나 기능 면에서 걸리는 점입니다. 모든 시안은 가이드 설계값으로 그린 콘셉트이며 실측본이 아닙니다.</p>
    </div>
    <div class="filters" role="group" aria-label="조합 필터">
      <button type="button" id="c-all" data-c="all" aria-pressed="true">전체</button>
      <button type="button" id="c-pick" data-c="pick" aria-pressed="false">추천</button>
      <button type="button" id="c-alt" data-c="alt" aria-pressed="false">대안</button>
      <button type="button" id="c-ref" data-c="ref" aria-pressed="false">참고</button>
      <button type="button" id="c-no" data-c="no" aria-pressed="false">비추천</button>
    </div>
    <div class="combos" id="combo-grid">
${cards}
    </div>
    <h3 class="subh">필름밤 18ml 자 · 뚜껑 4가지</h3>
    <div class="jars">${jars}</div>
    <h3 class="subh" id="builder-h">조합 빌더 · 직접 섞어 보기</h3>
    ${builder}
  </div>
</section>`);
fs.writeFileSync(__dirname + '/defs.html', defs);
console.log('pairs', D.pairs.length, 'scores', D.pairs.map(p => p.id + ':' + T.axes(p.b, p.m).score).join(' '));
fs.writeFileSync(__dirname + '/builder.js', fs.readFileSync(__dirname + '/builder.tpl.js', 'utf8').replace('__PRESETS__', JSON.stringify(D.pairs.map(p => ({ id: p.id, b: p.b, m: p.m })))));
