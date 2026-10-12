// Builds strategy.html from head.html (shared tokens/CSS) + strategy-body.html, injecting the P01 pair mockup.
const fs = require('fs');
require('./combos.js');
const T = globalThis.TNC, D = require('./combos-data.js');
const p1 = D.pairs[0];
let head = fs.readFileSync(__dirname + '/head.html', 'utf8').replace('<title>터노바 튜브 패키지 보드</title>', '<title>터노바 왕복 리추얼 전략</title>');
let body = fs.readFileSync(__dirname + '/strategy-body.html', 'utf8');
body = body.replace('{{P01}}', T.pair(p1.b, p1.m, { aria: '추천 조합 P01: 화장대 배리어 코퍼 8각 스크류, 욕실 랩핑 블루 8각 원터치' }));
fs.writeFileSync(__dirname + '/strategy.html', head + fs.readFileSync(__dirname + '/defs.html', 'utf8') + body);
console.log('ok', fs.statSync(__dirname + '/strategy.html').size);
