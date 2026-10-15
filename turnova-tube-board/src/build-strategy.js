// Builds strategy.html from head.html (shared tokens/CSS) + strategy-body.html, injecting the P01 pair mockup.
const fs = require('fs');
require('./combos.js');
const T = globalThis.TNC, D = require('./combos-data.js');
const p1 = D.stock[0];
let head = fs.readFileSync(__dirname + '/head.html', 'utf8').replace('<title>터노바 튜브 패키지 보드</title>', '<title>터노바 왕복 리추얼 전략</title>');
let body = fs.readFileSync(__dirname + '/strategy-body.html', 'utf8');
body = body.replace('{{P01}}', T.lineup(p1.j, p1.b, p1.m, null, null, { aria: '대표 선택안 S00 4종 라인업: 화장대에 필링밤 자와 배리어, 욕실에 필링 에센스와 랩핑' }));
fs.writeFileSync(__dirname + '/strategy.html', head + fs.readFileSync(__dirname + '/defs.html', 'utf8') + body);
console.log('ok', fs.statSync(__dirname + '/strategy.html').size);
