(function(){
  var T = window.TNC; if (!T) return;
  var PRESETS = [{"id":"P01","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P02","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"ringed"}},{"id":"P03","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"roundFlip","metal":"blue"}},{"id":"P04","b":{"shape":"slim","body":"blue","cap":"octColumn","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P05","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"oval","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P06","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"clearFlip","metal":"blue"}},{"id":"P07","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"discTop","metal":"blue"}},{"id":"P08","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"wideFlat","metal":"blue"}},{"id":"P09","b":{"shape":"slim","body":"copper","cap":"octScrew","metal":"blue"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"copper"}},{"id":"P10","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"copper","cap":"octFlip","metal":"blue"}},{"id":"P11","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper","band":true},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P12","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"blue"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P13","b":{"shape":"slim","body":"blue","cap":"octScrew","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"copper"}},{"id":"P14","b":{"shape":"slim","body":"blue","cap":"column","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"roundFlip","metal":"blue"}},{"id":"P15","b":{"shape":"slim","body":"blue","cap":"pump","metal":"copper"},"m":{"shape":"wide","body":"blue","cap":"octFlip","metal":"blue"}},{"id":"P16","b":{"shape":"std","body":"blue","cap":"roundScrew","metal":"copper"},"m":{"shape":"std","body":"blue","cap":"roundScrew","metal":"copper"}},{"id":"P17","b":{"shape":"slim","body":"blue","cap":"octColumn","metal":"copper"},"m":{"shape":"oval","body":"blue","cap":"clearFlip","metal":"blue"}},{"id":"P18","b":{"shape":"slim","body":"blue","cap":"octFlip","metal":"blue"},"m":{"shape":"wide","body":"blue","cap":"octScrew","metal":"copper"}}];
  var fig = document.getElementById('bfig'), axEl = document.getElementById('baxes'), wEl = document.getElementById('bwarn');
  var preset = document.getElementById('preset');
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function read(p){
    var o = {}; ['shape','body','cap','metal'].forEach(function(k){ o[k] = document.getElementById(p + '-' + k).value; });
    o.band = document.getElementById(p + '-band').checked; return o;
  }
  function write(p, o){
    ['shape','body','cap','metal'].forEach(function(k){ document.getElementById(p + '-' + k).value = o[k]; });
    document.getElementById(p + '-band').checked = !!o.band;
  }
  function render(){
    var b = read('b'), m = read('m'), a = T.axes(b, m);
    fig.innerHTML = T.pair(b, m, { aria: '빌더 미리보기' });
    axEl.innerHTML = a.axes.map(function(r){ return '<span class="ax ' + (r[1] ? 'on' : '') + '">' + (r[1] ? '✓' : '–') + ' ' + r[0] + '</span>'; }).join('') + '<b class="sc">' + a.score + '/5</b>';
    wEl.innerHTML = a.warn.length ? a.warn.map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('') : '<li style="color:var(--ok)">걸리는 점 없음</li>';
    try { localStorage.setItem('tn-builder', JSON.stringify({ b: b, m: m })); } catch(e) {}
  }
  function load(id){
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) { write('b', PRESETS[i].b); write('m', PRESETS[i].m); preset.value = id; render(); return; }
  }
  document.querySelectorAll('#builder select, #builder input').forEach(function(el){
    if (el.id !== 'preset') el.addEventListener('change', render);
  });
  preset.addEventListener('change', function(){ load(preset.value); });
  function pick(obj){ var k = Object.keys(obj); return k[Math.floor(Math.random() * k.length)]; }
  document.getElementById('shuffle').addEventListener('click', function(){
    ['b','m'].forEach(function(p){ write(p, { shape: pick(T.SHAPES), body: Math.random() < .8 ? 'blue' : 'copper', cap: pick(T.CAPS), metal: pick(T.METALS), band: Math.random() < .2 }); });
    render();
  });
  document.querySelectorAll('.combo .load').forEach(function(btn){
    btn.addEventListener('click', function(){ load(btn.dataset.id); document.getElementById('builder-h').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  });
  var cbtn = document.querySelectorAll('[data-c]'), cards = document.querySelectorAll('#combo-grid .combo');
  cbtn.forEach(function(b){ b.addEventListener('click', function(){
    var c = b.dataset.c;
    cards.forEach(function(card){ card.hidden = !(c === 'all' || card.dataset.tag === c); });
    cbtn.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  }); });
  try { var s = JSON.parse(localStorage.getItem('tn-builder') || 'null'); if (s && s.b && s.m) { write('b', s.b); write('m', s.m); render(); } } catch(e) {}
})();
