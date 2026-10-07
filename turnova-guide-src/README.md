# TURNOVA 디자인 가이드 소스

`turnova-design-guide-v5.docx/.txt`는 이 폴더의 `build_guide.js`로 생성한다.

```bash
cd turnova-guide-src && node build_guide.js && cp turnova-design-guide-v5.* ..
```

- 가이드 본문 데이터: `build_guide.js` 안의 `V` 객체
- 부록(칼선 면별 배치·수출 표시): `data.js`의 `D` (v4 데이터)
- `docx` npm 패키지 필요
