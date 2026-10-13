// Builds spec.html (용기 발주 스펙): head.html tokens + scaled drawings from spec-data.js + checklist + copy-ready briefs.
const fs = require('fs');
const S = require('./spec-data.js');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mm = (v, est) => v + (est ? ' <span class="est">추정</span>' : '');
const K = 2.3; // px per mm, same for every drawing so sizes compare true to scale

// --- scaled side drawing with dimension lines -------------------------------------------
function drawing(s) {
  const padL = 74, padR = 86, padT = 30, padB = 40;
  const wide = Math.max(s.dia, s.capD, s.type === 'tube' ? s.flat : 0);
  const W = padL + wide * K + padR, H = padT + s.total * K + padB;
  const cx = padL + wide * K / 2, g = padT + s.total * K; // ground line y
  const out = [];
  const rect = (x, y, w, h, cls, r) => out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${r || 0}" class="${cls}"/>`);
  // vertical dimension at x from y1 to y2 (y1<y2)
  const vdim = (x, y1, y2, txt, side) => {
    const tx = side === 'l' ? x - 6 : x + 6, anchor = side === 'l' ? 'end' : 'start';
    out.push(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="dl" marker-start="url(#ar)" marker-end="url(#ar)"/>`);
    out.push(`<text x="${tx}" y="${(y1 + y2) / 2 + 4}" text-anchor="${anchor}" class="dt">${txt}</text>`);
  };
  const hdim = (y, x1, x2, txt, below) => {
    out.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="dl" marker-start="url(#ar)" marker-end="url(#ar)"/>`);
    out.push(`<text x="${(x1 + x2) / 2}" y="${below ? y + 15 : y - 6}" text-anchor="middle" class="dt">${txt}</text>`);
  };
  const ext = (x1, y1, x2, y2) => out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ex"/>`);

  if (s.type === 'tube') {
    // stand-up one-touch: cap on the ground, crimp at the top
    const cw = s.capD * K, ch = s.capH * K, bw = s.dia * K, fw = s.flat * K, bl = s.len * K;
    const capTop = g - ch, crimp = 5 * K, top = capTop - bl;
    rect(cx - cw / 2, capTop, cw, ch, s.place === '화장대' ? 'cu' : 'bl', 3);
    if (s.place === '욕실') rect(cx - cw / 2, capTop + ch * 0.18, cw, ch * 0.2, 'cu');
    out.push(`<line x1="${cx - cw / 2 + 2}" y1="${capTop + ch * 0.62}" x2="${cx + cw / 2 - 2}" y2="${capTop + ch * 0.62}" class="seam"/>`);
    out.push(`<path d="M${cx - bw / 2} ${capTop} L${cx - fw / 2} ${top + crimp} L${cx - fw / 2} ${top} L${cx + fw / 2} ${top} L${cx + fw / 2} ${top + crimp} L${cx + bw / 2} ${capTop} Z" class="bl"/>`);
    out.push(`<line x1="${cx - fw / 2}" y1="${top + crimp}" x2="${cx + fw / 2}" y2="${top + crimp}" class="seam"/>`);
    // printable face (front panel)
    const py = top + crimp + 8 * K, ph = bl - crimp - 16 * K;
    out.push(`<rect x="${cx - fw * 0.36}" y="${py}" width="${fw * 0.72}" height="${ph}" class="pa"/>`);
    vdim(padL - 18, top, g, s.total + ' 전체', 'l');
    ext(cx + Math.max(fw, cw) / 2 + 2, top, padL + wide * K + 22, top);
    ext(cx + cw / 2 + 2, capTop, padL + wide * K + 22, capTop);
    ext(cx + cw / 2 + 2, g, padL + wide * K + 22, g);
    vdim(padL + wide * K + 18, top, capTop, s.len + ' 튜브', 'r');
    vdim(padL + wide * K + 18, capTop, g, s.capH + ' 캡', 'r');
    hdim(top - 12, cx - fw / 2, cx + fw / 2, '실링 ' + s.flat);
    hdim(g + 16, cx - cw / 2, cx + cw / 2, '캡 Φ' + s.capD, false);
    out.push(`<text x="${cx}" y="${capTop - 8}" text-anchor="middle" class="dt in">Φ${s.dia}</text>`);
  } else if (s.type === 'jar') {
    const w = s.dia * K, lh = s.capH * K, bh = s.len * K;
    const top = g - bh - lh;
    rect(cx - w / 2 + 2, g - bh, w - 4, bh, 'bl', 4);
    rect(cx - w / 2, top, w, lh, 'cu', 3);
    rect(cx - w / 2 + 6, g - bh + bh * 0.2, w - 12, bh * 0.6, 'pa');
    vdim(padL - 18, top, g, s.total + ' 전체', 'l');
    ext(cx + w / 2 + 2, top, padL + wide * K + 22, top);
    ext(cx + w / 2 + 2, g - bh, padL + wide * K + 22, g - bh);
    ext(cx + w / 2 + 2, g, padL + wide * K + 22, g);
    vdim(padL + wide * K + 18, top, g - bh, s.capH + ' 뚜껑', 'r');
    vdim(padL + wide * K + 18, g - bh, g, s.len + ' 몸통', 'r');
    hdim(g + 16, cx - w / 2, cx + w / 2, 'Φ' + s.dia, false);
  } else {
    // bottle: dropper or pump on a heavy-blow bottle
    const bw = s.dia * K, bh = s.len * K, cw = s.capD * K, ch = s.capH * K, top = g - bh - ch;
    out.push(`<path d="M${cx - bw / 2} ${g} L${cx - bw / 2} ${g - bh + 9 * K} Q${cx - bw / 2} ${g - bh + 2} ${cx - bw * 0.3} ${g - bh} L${cx + bw * 0.3} ${g - bh} Q${cx + bw / 2} ${g - bh + 2} ${cx + bw / 2} ${g - bh + 9 * K} L${cx + bw / 2} ${g} Z" class="bl"/>`);
    if (s.type === 'dropper') {
      const collar = ch * 0.42;
      rect(cx - cw / 2, g - bh - collar, cw, collar, 'cu', 2);
      out.push(`<path d="M${cx - cw * 0.34} ${g - bh - collar} L${cx - cw * 0.34} ${top + cw * 0.34} Q${cx} ${top - 4} ${cx + cw * 0.34} ${top + cw * 0.34} L${cx + cw * 0.34} ${g - bh - collar} Z" class="bulb"/>`);
      out.push(`<line x1="${cx}" y1="${g - bh}" x2="${cx}" y2="${g - bh + 55 * K}" class="pip"/>`);
    } else {
      rect(cx - cw / 2, top, cw, ch, 'cu', 4);
      out.push(`<line x1="${cx - cw / 2 + 2}" y1="${top + ch * 0.7}" x2="${cx + cw / 2 - 2}" y2="${top + ch * 0.7}" class="seam"/>`);
    }
    rect(cx - bw * 0.36, g - bh * 0.78, bw * 0.72, bh * 0.56, 'pa');
    vdim(padL - 18, top, g, s.total + ' 전체', 'l');
    ext(cx + cw / 2 + 2, top, padL + wide * K + 22, top);
    ext(cx + bw / 2 + 2, g - bh, padL + wide * K + 22, g - bh);
    ext(cx + bw / 2 + 2, g, padL + wide * K + 22, g);
    vdim(padL + wide * K + 18, top, g - bh, s.capH + (s.type === 'pump' ? ' 펌프' : ' 스포이드'), 'r');
    vdim(padL + wide * K + 18, g - bh, g, s.len + ' 병', 'r');
    hdim(g + 16, cx - bw / 2, cx + bw / 2, 'Φ' + s.dia, false);
  }
  out.push(`<line x1="8" y1="${g}" x2="${W - 8}" y2="${g}" class="gr"/>`);
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" role="img" aria-label="${esc(s.name)} ${esc(s.vol)} 측면 치수도, 전체 높이 ${s.total} mm">${out.join('')}</svg>`;
}

// --- sections -------------------------------------------------------------------------
const cards = S.skus.map(s => `
  <article class="sku">
    <header><span class="sid">${s.id}</span><h3>${esc(s.name)} · ${esc(s.vol)}</h3><span class="tag ${s.role === '확정' ? 'ok' : s.role === '기준안 A' ? 'gold' : ''}">${s.role}</span><span class="tag">${s.place}</span></header>
    <figure class="dwg">${drawing(s)}</figure>
    <dl>
      <div><dt>바디</dt><dd>${esc(s.body)}</dd></div>
      <div><dt>사용</dt><dd>${esc(s.use)} · ${esc(s.fill)}</dd></div>
      <div><dt>캡</dt><dd>${esc(s.cap)} · ${esc(s.capFinish)}</dd></div>
      <div><dt>토출</dt><dd>${esc(s.orifice)}</dd></div>
      <div><dt>기성 품번</dt><dd>${esc(s.ref)}</dd></div>
    </dl>
    <p class="note">${esc(s.note)}</p>
  </article>`).join('') + `
  <article class="sku common">
    <header><span class="sid">ALL</span><h3>전 SKU 공통 마감</h3></header>
    <dl>
      <div><dt>바디</dt><dd>로열블루 팬톤 1종 · 무광 AF(안티핑거프린트)</dd></div>
      <div><dt>코퍼</dt><dd>876C 마스터 칩 1개 · 골드·로즈골드·브론즈 반려</dd></div>
      <div><dt>로고</dt><dd>워드마크·8잎 심볼만 유광 코퍼 박</dd></div>
      <div><dt>장소 코드</dt><dd>화장대 = 코퍼 캡 · 욕실 = 블루 톱 + 코퍼 띠</dd></div>
      <div><dt>욕실 코퍼</dt><dd>PP 착색 또는 박만 · 증착·메탈 금지</dd></div>
      <div><dt>파손</dt><dd>병·자는 헤비블로우 PETG/PCTG · 유리 금지</dd></div>
      <div><dt>튜브</dt><dd>기성 원터치 · 신규 금형 없음 · 캡으로 세움</dd></div>
      <div><dt>코딩</dt><dd>튜브 실링부 · 병·자 바닥</dd></div>
    </dl>
    <p class="note">대표 결정 10/13 · 견적서 엑셀 10/13 · 가이드 v5 3·4장 · 룰북 R02 · R03 · R08 · R09 · R10 · R14</p>
  </article>`;

const rows = S.skus.map(s => `<tr>
  <td><b>${esc(s.name)} ${esc(s.vol)}</b><br><span class="muted">${s.role} · ${s.place} · ${esc(s.fill)}</span></td>
  <td>${esc(s.body)}</td>
  <td class="num">${mm(s.total, s.totalEst)}</td>
  <td class="num">${mm(s.len, s.lenEst)}<br><span class="muted">${esc(s.tol)}</span></td>
  <td class="num">Φ${s.capD}${s.capDNote ? `<br><span class="muted">${esc(s.capDNote)}</span>` : ''}</td>
  <td class="num">${s.capH}${s.capHNote ? `<br><span class="muted">${esc(s.capHNote)}</span>` : ''}</td>
  <td>${esc(s.orifice)}</td>
  <td>${esc(s.capFinish)}</td>
  <td>${esc(s.print)}</td></tr>`).join('');

const checks = S.checklist.map((c, i) => `
  <li><input type="checkbox" id="ck${i}" data-k="${i}"><label for="ck${i}"><span class="area">${esc(c.area)} · ${esc(c.target)}</span><b>${esc(c.item)}</b><span class="test">검사 · ${esc(c.test)}</span><span class="who">${esc(c.who)}</span></label></li>`).join('');

const line = s => `- ${s.name} ${s.vol} [${s.role}] (${s.place} · ${s.use}): ${s.body} / ${s.fill} / 길이 ${s.len}mm(${s.tol}) / 캡 Φ${s.capD}${s.capDNote ? '(' + s.capDNote + ')' : ''} × H${s.capH}${s.capHNote ? '(' + s.capHNote + ')' : ''} / 전체 약 ${s.total}mm / 토출 ${s.orifice} / 캡 ${s.cap}, ${s.capFinish} / 참고 ${s.ref}`;

const rfq = `[터노바 TURNOVA] 용기 기성품 견적·샘플 요청 (2026-10-13)

안녕하세요. 터노바 4종 용기를 기성품으로 진행하려고 합니다. 아래 스펙에 가장 가까운 기성 품번과 도면(mm, PDF/DWG), 샘플, 단가·MOQ·리드타임을 첨부 엑셀의 회신 칸(노란 칸)에 적어 10/24까지 보내 주세요. 샘플은 10월 말, 입고는 2027년 1월을 희망합니다. 튜브 길이는 계산값이라 가장 가까운 기성 규격으로 회신해 주시면 됩니다.

1. 품목별 스펙 (랩핑은 A가 기준안, B·C는 비교 견적)
${S.skus.map(line).join('\n')}

2. 공통 조건
- 튜브는 모두 기성 원터치입니다. 신규 금형은 없고, 캡으로 세울 수 있어야 합니다(캡 지름 ≈ 튜브 지름).
- 바디: 로열블루 팬톤 1종(샘플로 확정), 무광 안티핑거프린트(AF). 소재가 달라도 같은 칩에 맞춰 주세요.
- 코퍼: Pantone 876C(피치 톤) 마스터 칩 1개에 맞춥니다. 골드·로즈골드·브론즈 톤은 불가합니다.
- 장소 코드: 화장대 제품(배리어·필링밤)은 코퍼 캡, 욕실 제품(랩핑·필링 에센스)은 블루 톱 + 코퍼 띠입니다.
- 욕실 제품의 코퍼는 PP 원료 착색 또는 박만 씁니다. 증착과 메탈은 쓰지 않습니다.
- 로고(워드마크·심볼)만 유광 코퍼 박이고, 나머지는 무광입니다.
- 에센스 병과 필링밤 자는 파손 방지를 위해 헤비블로우 PETG/PCTG로 합니다. 유리는 쓰지 않습니다.

3. 회신 요청 사항
① 배리어 35Φ 50 mL: 길이 90–100 mm 기성 규격, 플러시 원터치(Φ35) 가능 여부, Φ4 토출구 가능 여부(없으면 Φ5)
② 랩핑 50Φ: 60 mL(길이 73–82)·80 mL(84–93) 기성 튜브 품번, 높이 22 mm 이하(최대 26) 로우 원터치, Φ5 + 씰 핀
③ 랩핑 40Φ 80 mL 비교 견적: 아크팩 ATVY4018A 같은 기성품, 토출 Φ5 + 씰 핀
④ 랩핑 캡 측면 코퍼 띠: PP 착색 링 또는 핫스탬핑 박 가능 여부와 공정별 단가, 40°C/90%RH 72시간 박리 데이터
⑤ 배리어 코퍼 캡 공정별 단가: PP 착색 / 캡 몸통 증착(힌지 제외) / 알루미늄 쉘
⑥ 에센스 Ø33 헤비블로우 스포이드 병(넥 18 mm), 칼라 Ø22–24, 피펫 길이, 내산성 블루 벌브. Ø33이 없으면 가장 가까운 기성(예: Ø36·넥 20)
⑦ 필링밤 헤비블로우 PETG 20 g 자(Ø50–54 × H36–40), 알루미늄 쉘 + PP 내캡, 내부 디스크, 스패출러 별도 견적
⑧ 충전기 최소 튜브 길이(50Φ 60 mL = 77 mm 통과 여부)
⑨ 품목별 MOQ, 공정별 단가, 샘플 가능일, 양산 리드타임

4. 샘플 승인 체크리스트
${S.checklist.map((c, i) => `${i + 1}) [${c.area} · ${c.target}] ${c.item} — 확인: ${c.test}`).join('\n')}

샘플은 블루 칩과 코퍼 마스터 칩을 옆에 두고 비교해 승인하겠습니다. 감사합니다.
터노바 드림`;

const brief = `[터노바 TURNOVA] 용기 디자인 작업 요청 (2026-10-13)

안녕하세요. 라인업이 4종(배리어 50 mL · 랩핑 60 mL · 필링 에센스 30 mL · 필링밤 20 g)으로 정해졌고, 용기는 기성품으로 진행합니다. 아래 치수로 인쇄 시안을 부탁드립니다. 용기사 도면이 오면(10/24 예정) 치수를 바로 업데이트해 드리겠습니다.

1. 인쇄 영역
${S.skus.map(s => `- ${s.name} ${s.vol} [${s.role}]: ${s.print} · ${s.body}`).join('\n')}

2. 꼭 지켜 주실 규칙 (가이드 v5 + 대표 결정 10/13)
- 컬러: 로열블루 팬톤 1종 + 코퍼 Pantone 876C. 골드·로즈골드·브론즈 금지.
- 마감: 바디 무광 AF, 로고(워드마크·8잎 심볼)만 유광 코퍼 박.
- 장소 코드: 화장대(배리어·필링밤) = 코퍼 캡, 욕실(랩핑·필링 에센스) = 블루 톱 + 코퍼 띠.
- 레이아웃: 샤넬식 2단. 워드마크는 패널 폭의 75–92%, 심볼은 15–24%, 여백은 황금비 1:1.618.
- 최소 크기: 잉크 글자 1.2 mm, 용량 표기 1.6 mm, 박 선 0.15 mm.
- 표시: 제조번호·사용기한은 튜브 실링부, 병·자는 바닥. ℮ 숫자 높이는 50 mL 초과 3 mm, 이하 2 mm. 필링밤은 g 표기.
- 필링밤 자는 띠 없음. 색 반전(DUA)은 단상자·키트·한정판에만 씁니다.
- 랩핑은 역인쇄 라미(PBL)라 인쇄면이 필름 안쪽입니다. 박 위치는 용기사와 확인해 주세요.

3. 납품 파일
- 품목별 인쇄 칼선(AI), 별색 분판(블루 / 코퍼 잉크 / 코퍼 박), 박 동판용 선 데이터
- 랩핑은 50Φ 60 mL 기준으로 만들고, 80 mL(50Φ·40Φ) 비교안은 칼선만 함께 주세요.
- 폰 촬영 기준 목업 1장씩(정면, 45°, 인스타 4:5 썸네일)

4. 확인 부탁
- 50Φ 숏 튜브(실링 폭 약 79 mm, 길이 77 mm)에서 워드마크 비율 규칙이 지켜지는지
- Ø33 원통 병 곡면에서 워드마크가 휘어 보이지 않는 최대 폭
- 코퍼 4종(PP 착색 캡·박 띠·PP 칼라·알루미늄 뚜껑)이 한 사진에서 같은 색으로 보이도록 색 지정 방법

감사합니다.
터노바 드림`;

const visual = [
  ['높음', '코퍼가 4가지 공정으로 나뉩니다', '배리어 PP 착색 캡, 랩핑 박 띠, 에센스 PP 칼라, 필링밤 알루미늄 뚜껑은 같은 876C라도 색이 다르게 나옵니다. 라인업 사진에서 가장 먼저 티가 납니다.', '코퍼 마스터 칩 1개를 정하고, 4종 샘플을 같은 조명에서 나란히 찍어 승인합니다.'],
  ['높음', 'PP 착색 코퍼는 플라스틱처럼 보일 수 있습니다', '엑셀 기준인 무광 코퍼 PP 착색은 내구성은 좋지만, 가까이 찍으면 메탈 느낌이 약합니다. 화장대 배리어가 가장 크게 영향을 받습니다.', '배리어만 증착(힌지 제외)·알루미늄 쉘 견적을 같이 받아 샘플로 비교합니다. 욕실 제품은 착색·박만 씁니다.'],
  ['높음', '랩핑 지름이 SNS 구분을 좌우합니다', '50Φ(A·B)면 배리어와 15 mm 차이라 썸네일에서도 체형이 갈립니다. 40Φ(C)면 5 mm 차이라 캡 색만 남습니다.', '기준안은 50Φ 60 mL(A)입니다. 50Φ 기성 튜브 품번이 회신에서 확인되지 않으면 C로 내립니다.'],
  ['중간', '블루가 4가지 소재로 나뉩니다', 'PBL 튜브(역인쇄 포함), PETG 원료 착색 병, PP 캡, PETG 자는 같은 팬톤이어도 톤이 다르게 나옵니다.', '팬톤 1종을 먼저 정하고 소재별 드로다운을 승인합니다(ΔE 2 이하).'],
  ['중간', '폰 카메라에서 로열블루가 보라로 뜹니다', '진한 로열블루는 폰 자동 보정에서 보라 쪽으로 뜨는 경우가 많습니다(추정).', '샘플 승인 때 아이폰·갤럭시로 찍어 확인합니다(체크리스트 1번).'],
  ['중간', '지문 방지와 오일 내성이 부딪힙니다', '소프트터치는 지문에 강하지만 오일 내용물에 끈적이거나 벗겨질 수 있습니다.', 'AF 무광을 기본으로, 핸드크림 손 10회 파지와 내용물 러빙 20회를 함께 봅니다.'],
  ['중간', '50Φ 숏 튜브는 짧고 넓습니다', '길이 77 mm에 실링 폭 약 79 mm라 정면이 거의 정사각형입니다. 라벨 2단 레이아웃의 세로 여백이 빠듯합니다.', '디자이너에게 50Φ 칼선으로 비율 검토를 먼저 요청합니다.'],
  ['낮음', '헤비블로우 PETG는 긁힘에 약합니다', '유리처럼 보이고 깨지지 않지만 표면이 쉽게 긁힙니다.', 'AF 무광 코팅으로 긁힘을 가리고, 출고 때 개별 슬리브를 씁니다.']
];

const decisions = [
  ['랩핑 지름·용량', '50Φ 60 mL (기준안 A)', '차별화가 가장 큽니다. 회신(10/24)에서 50Φ 기성 품번과 충전기 최소 길이가 확인되면 확정하고, 안 되면 40Φ 80 mL(C)로 갑니다.'],
  ['랩핑 80 mL 운영', '50Φ 같은 캡으로 비교 견적 (B)', '같은 캡이라 나중에 대용량을 추가해도 부자재가 그대로입니다.'],
  ['배리어 코퍼 캡 공정', 'PP 착색 기본, 증착·알루미늄은 비교 견적', '화장대 제품이라 증착이 가능하지만, 샘플 사진으로 차이가 클 때만 올립니다.'],
  ['로열블루 팬톤', '칩 3개(2728C / 2736C / Reflex Blue)를 폰으로 찍어 비교', '실물보다 사진이 기준입니다.'],
  ['에센스 병 지름', 'Ø33 (엑셀 기준), 없으면 가장 가까운 기성', 'Ø36 기성(럭스팩 HB CU30)은 품번이 확인돼 있습니다.'],
  ['필링밤 부속', '내부 디스크 포함, 스패출러 별도 견적', '스패출러를 넣으면 단상자 크기가 바뀝니다.']
];

const vrows = visual.map(v => `<tr><td><span class="tag ${v[0] === '높음' ? 'bad' : v[0] === '중간' ? 'warn' : 'ok'}">${v[0]}</span></td><td><b>${v[1]}</b><br><span class="muted">${v[2]}</span></td><td>${v[3]}</td></tr>`).join('');
const drows = decisions.map((d, i) => `<li><b>${i + 1}. ${d[0]}</b> → <span class="pick">${d[1]}</span><span class="muted">${d[2]}</span></li>`).join('');

let head = fs.readFileSync(__dirname + '/head.html', 'utf8').replace('<title>터노바 튜브 패키지 보드</title>', '<title>터노바 용기 발주 스펙</title>');
const css = `<style>
  .est{font-family:var(--mono);font-size:10.5px;color:var(--warn);background:var(--warn-tint);padding:0 4px;border-radius:3px;white-space:nowrap}
  .muted{color:var(--muted);font-size:13px}
  .skus{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px;align-items:start}
  .sku{background:var(--sheet);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
  .sku header{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .sku h3{font-size:15.5px;flex:1 1 auto}
  .sid{font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:.1em}
  .dwg{margin:0;background:var(--well);border-radius:8px;overflow-x:auto;display:flex;justify-content:center;align-items:flex-end;min-height:390px;padding:8px 0}
  .dwg svg{max-width:none;height:auto;display:block}
  .dwg .bl{fill:#1D2795;stroke:var(--line-2);stroke-width:1}
  .dwg .cu{fill:#B7703F;stroke:var(--line-2);stroke-width:1}
  .dwg .bulb{fill:#1D2795;stroke:var(--line-2);stroke-width:1}
  .dwg .pa{fill:none;stroke:#E9B48F;stroke-width:1;stroke-dasharray:3 3}
  .dwg .seam{stroke:rgba(255,255,255,.35);stroke-width:1}
  .dwg .pip{stroke:var(--muted);stroke-width:1.2;stroke-dasharray:2 3}
  .dwg .dl{stroke:var(--ink-2);stroke-width:1}
  .dwg .ex{stroke:var(--line-2);stroke-width:1;stroke-dasharray:2 2}
  .dwg .gr{stroke:var(--ink-2);stroke-width:1.4}
  .dwg .dt{fill:var(--ink);font-family:var(--mono);font-size:11px}
  .dwg .dt.in{fill:#F6EDE6}
  #ar path{fill:var(--ink-2)}
  .sku dl{margin:0;display:grid;gap:6px}
  .sku dl div{display:grid;grid-template-columns:76px 1fr;gap:8px;font-size:13px}
  .sku dt{color:var(--muted)} .sku dd{margin:0;min-width:0}
  .sku.common{grid-column:1/-1}
  .sku.common dl{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:8px 18px}
  .sku .note{font-size:12.5px;color:var(--ink-2);border-top:1px solid var(--line);padding-top:8px}
  .legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;color:var(--ink-2)}
  .legend i{display:inline-block;width:18px;height:10px;vertical-align:-1px;margin-right:6px;border-radius:2px}
  .checks{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px}
  .checks li{display:flex;gap:10px;align-items:flex-start;background:var(--sheet);border:1px solid var(--line);border-radius:8px;padding:10px 12px;min-width:0}
  .checks input{width:18px;height:18px;margin-top:3px;accent-color:var(--gold);flex:none}
  .checks label{display:grid;gap:3px;font-size:13.5px;cursor:pointer;min-width:0}
  .checks .area{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--gold)}
  .checks .test{color:var(--ink-2);font-size:12.5px}
  .checks .who{color:var(--muted);font-size:12px}
  .checks li:has(input:checked){background:var(--ok-tint);border-color:transparent}
  .progress{font-family:var(--mono);font-size:13px;color:var(--ink-2)}
  .msgs{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}
  .msg{background:var(--sheet);border:1px solid var(--line);border-radius:10px;display:flex;flex-direction:column;min-width:0}
  .msg header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
  .msg pre{margin:0;padding:14px;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;font-family:var(--body);font-size:13px;line-height:1.6;max-height:520px;overflow:auto}
  .copy{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--gold-line);background:transparent;color:var(--gold);border-radius:999px;padding:5px 14px;cursor:pointer}
  .copy:hover{background:var(--gold-soft)}
  .decide{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .decide li{background:var(--sheet);border:1px solid var(--line);border-radius:8px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
  .decide .pick{color:var(--gold);font-weight:600}
  .decide .muted{flex-basis:100%}
  section{padding-block:36px}
</style>`;
const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="ar" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L7 4 L0 7 Z"/></marker></defs></svg>`;

const body = `
<header class="hero">
  <div class="wrap">
    <div class="eyebrow">TURNOVA · 용기 발주 스펙 통합본 · 2026-10-13 · 견적서 엑셀 + 기성 품번 + 지니어스 비주얼팀</div>
    <h1>4종 모두 기성품,<br>화장대는 <span class="oct">코퍼 캡</span>, 욕실은 블루 톱 + 코퍼 띠.</h1>
    <p class="lede">대표님 견적서 엑셀과 공급사 카탈로그 품번 치수, 장소 코드 결정을 하나로 합쳤습니다. 엑셀의 허용 범위·만액·회신 칸은 그대로 두고, 기성 품번에서 확인된 값은 옆에 적었습니다. <span class="est">추정</span> 값은 회신 도면(10/24)으로 확정합니다. 그림은 모두 같은 축척(1 mm = ${K} px)입니다.</p>
    <div class="verdict" role="list">
      <div role="listitem"><div class="k">배리어 크림 · 50 mL · 화장대</div><div class="v">35Φ PBL · 길이 95 (90–100) · 원터치 Φ35×20 · 토출 Φ4</div><div class="s">무광 코퍼 PP 착색 캡 · 전체 약 115 mm</div></div>
      <div role="listitem"><div class="k">랩핑 마스크 · 60 mL · 욕실 (기준안 A)</div><div class="v">50Φ PBL 역인쇄 · 길이 77 (73–82) · 로우 원터치 Φ48–50×22 · Φ5 + 씰 핀</div><div class="s">블루 캡 + 코퍼 띠(착색·박) · 비교: 50Φ 80 mL / 40Φ 80 mL</div></div>
      <div role="listitem"><div class="k">필링 에센스 30 mL · 필링밤 20 g</div><div class="v">헤비블로우 PETG Ø33×74 스포이드 · PETG 자 Ø52×38</div><div class="s">욕실 = 블루 벌브 + 코퍼 PP 칼라 · 화장대 = 알루미늄 쉘 코퍼 뚜껑</div></div>
    </div>
    <div class="alts">
      <div><b>대안 1</b> 50Φ 기성 튜브나 충전기 길이가 안 맞으면 랩핑을 40Φ 80 mL(아크팩 ATVY4018A)로 내립니다. 품번은 확인돼 있지만 배리어와 체형 차이가 작아집니다.</div>
      <div><b>대안 2</b> 배리어 PP 착색 캡이 사진에서 플라스틱처럼 보이면 캡 몸통 증착이나 알루미늄 쉘로 올립니다. 화장대 제품이라 가능합니다.</div>
    </div>
  </div>
</header>
<main>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">01 · 치수도</div>
      <h2>측면 치수도 (같은 축척 · 랩핑 3안 비교)</h2>
      <p class="lede">튜브는 캡을 바닥에 두고 세운 모습입니다. 길이는 캡을 뺀 실링 후 길이, 단위는 mm입니다.</p>
    </div>
    <div class="legend" aria-hidden="true"><span><i style="background:#1D2795"></i>블루 무광 바디</span><span><i style="background:#B7703F"></i>새틴 코퍼</span><span><i style="border:1px dashed #E9B48F"></i>인쇄 영역(추정)</span></div>
    <div class="skus" style="margin-top:14px">${cards}</div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">02 · 발주 스펙 표</div>
      <h2>제조사에 그대로 넘길 표</h2>
    </div>
    <div class="tbl"><table>
      <thead><tr><th>제품</th><th>바디</th><th>전체 높이</th><th>튜브·병 길이 (허용)</th><th>캡 파이</th><th>캡 높이</th><th>토출구</th><th>캡 마감</th><th>인쇄 영역</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">03 · 샘플 승인 체크리스트</div>
      <h2>샘플이 오면 이 ${S.checklist.length}개를 확인합니다</h2>
      <p class="lede">엑셀 체크리스트 13항목에 폰 촬영 색 확인, 원터치 개폐 500회, 코퍼 4종 대조, 벌브 내산성을 합쳤습니다. 체크 표시는 이 브라우저에만 저장됩니다.</p>
      <p class="progress" id="prog" aria-live="polite">0 / ${S.checklist.length} 확인</p>
    </div>
    <ul class="checks">${checks}</ul>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">04 · 전달 문안</div>
      <h2>제조사 · 디자이너에게 보낼 내용</h2>
      <p class="lede">복사해서 카톡이나 메일로 바로 보내면 됩니다. 치수와 체크리스트는 위 표와 같은 데이터에서 만들어집니다.</p>
    </div>
    <div class="msgs">
      <article class="msg"><header><h3>제조사 · 용기사 견적 요청</h3><button class="copy" type="button" data-t="rfq">복사</button></header><pre id="rfq">${esc(rfq)}</pre></article>
      <article class="msg"><header><h3>디자이너 작업 요청</h3><button class="copy" type="button" data-t="brief">복사</button></header><pre id="brief">${esc(brief)}</pre></article>
    </div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">05 · 지니어스 비주얼팀 검토</div>
      <h2>사진에서 먼저 티 나는 순서로 정리했습니다</h2>
    </div>
    <div class="tbl"><table>
      <thead><tr><th>심각도</th><th>이슈</th><th>대응</th></tr></thead>
      <tbody>${vrows}</tbody>
    </table></div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">06 · 대표 결정 필요</div>
      <h2>회신 전후로 정할 6가지</h2>
    </div>
    <ol class="decide">${drows}</ol>
    <p class="lede" style="margin-top:18px">출처: 대표님 견적서 엑셀(10/13), 럭스팩·프리팩·아크팩·대지영 공개 카탈로그, 해외 튜브 용량·길이 기준표(Viva, IOO). 같은 내용을 공급사 회신 칸이 있는 엑셀로도 만들었습니다. 단가·MOQ는 카탈로그 게시값이며 견적으로 확정합니다.</p>
  </div>
</section>
</main>
<script>
(function(){
  var KEY='tn-spec-check', st={};
  try{ st=JSON.parse(localStorage.getItem(KEY)||'{}')||{}; }catch(e){}
  var boxes=document.querySelectorAll('.checks input'), prog=document.getElementById('prog');
  function upd(){ var n=0; boxes.forEach(function(b){ if(b.checked) n++; }); prog.textContent=n+' / '+boxes.length+' 확인'; }
  boxes.forEach(function(b){ b.checked=!!st[b.dataset.k]; b.addEventListener('change',function(){ st[b.dataset.k]=b.checked; try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} upd(); }); });
  upd();
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click',function(){
      var el=document.getElementById(btn.dataset.t), txt=el.textContent;
      function done(m){ btn.textContent=m; setTimeout(function(){ btn.textContent='복사'; },1800); }
      function sel(){ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); done('선택됨 · Ctrl+C'); }
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){ done('복사됨'); },sel); } else sel();
    });
  });
})();
</script>`;
fs.writeFileSync(__dirname + '/spec.html', head + css + defs + body);
fs.writeFileSync(__dirname + '/spec-rfq.txt', rfq);
fs.writeFileSync(__dirname + '/spec-brief.txt', brief);
console.log('ok', fs.statSync(__dirname + '/spec.html').size);
