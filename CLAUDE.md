# jinnius 저장소 작업 규칙

## TURNOVA 패키지 디자인 (오너 지시, 2026-10-04)
- 브랜드명은 **TURNOVA** (TERNOVA 아님).
- **오너가 디자인 관련 의견을 말할 때마다** `turnova-guide-src/build_guide.js`의 가이드 내용을 수정·보완하고,
  `V.changelog`(변경 이력)에 날짜·오너 의견·반영 위치를 한 줄 추가한 뒤
  `turnova-design-guide-v5.docx/.txt`를 재생성해 커밋한다. 시안만 만들고 가이드를 안 고치는 것은 금지.
- **마스터 시안** `turnova-brand-assets/turnova-master-tube.png`(+ v9_1 수정본)이 스타일·카피의 유일한 기준. 모든 시안은 이 이미지를 레퍼런스로 편집 생성하고 카피 덱(가이드 ★)을 그대로 쓴다.
- 용기·단상자 전부 무광 라미네이팅, 유광은 로고(워드마크·심볼)만. 심볼은 패널 폭 12%.
- 단상자는 플립(앞표지 개폐)형 — `turnova-dielines/make_flip_dielines.py`.
- 심볼은 `turnova-brand-assets/turnova-symbol-8*.svg` 고정 — 꽃잎은 반드시 8장. 시안 생성 후 꽃잎 수 검수.
- 칼선은 `turnova-dielines/make_dielines.py`로 생성. 치수 변경 시 SKUS만 수정해 재출력.
- 시안(이미지 생성) 문구는 지어낸 클레임·제품명이 들어가지 않았는지 확인 후 전달.
- 해외 수출 RA(가이드 9-1)를 모든 표시 결정에 반영.

## 전문가 검수 정책 (오너 지시, 2026-10-06)
- 오너가 묻기 전에 검수한다. 시안·칼선·가이드를 전달할 때마다 `.claude/skills/turnova-review/SKILL.md`의
  6개 관점(아트디렉터·브랜드·SNS커머스·인쇄칼선·수출RA·법무) 검수를 돌리고, 보고 형식대로 결과를 함께 보낸다.
- 비율은 `turnova-qa/measure_front.py`로 실측. 워드마크 >62%·심볼 >12%면 오너에게 보내기 전에 내부 반려 후 재작업.
- 내 실수·기준 미달은 숨기지 않고 먼저 보고한다. 오너에게는 오너만 결정할 수 있는 것만 묻는다.
