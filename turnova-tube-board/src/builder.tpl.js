(function(){
  var T = window.TNC; if (!T) return;
  var PRESETS = __PRESETS__;
  var fig = document.getElementById('bfig'), axEl = document.getElementById('baxes'), wEl = document.getElementById('bwarn');
  var preset = document.getElementById('preset');
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function read(p){
    var o = {}; ['shape','body','cap','metal','band'].forEach(function(k){ o[k] = document.getElementById(p + '-' + k).value; });
    return o;
  }
  function write(p, o){
    var band = o.band === true ? 'printCu' : (o.band || 'none');
    ['shape','body','cap','metal'].forEach(function(k){ document.getElementById(p + '-' + k).value = o[k]; });
    document.getElementById(p + '-band').value = band;
  }
  function readJ(){ return { shape: document.getElementById('j-shape').value, lid: document.getElementById('j-lid').value, body: document.getElementById('j-body').value }; }
  function writeJ(j){ j = j || { shape: 'low', lid: 'round', body: 'blue' }; document.getElementById('j-shape').value = j.shape; document.getElementById('j-lid').value = j.lid; document.getElementById('j-body').value = j.body; }
  function render(){
    var b = read('b'), m = read('m'), j = readJ(), a = T.axes(b, m);
    a.warn = a.warn.concat(T.jarWarn(j));
    fig.innerHTML = T.trio(j, b, m, { aria: '빌더 미리보기' });
    axEl.innerHTML = a.axes.map(function(r){ return '<span class="ax ' + (r[1] ? 'on' : '') + '">' + (r[1] ? '✓' : '–') + ' ' + r[0] + '</span>'; }).join('') + '<b class="sc">' + a.score + '/5</b>';
    wEl.innerHTML = a.warn.length ? a.warn.map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('') : '<li style="color:var(--ok)">걸리는 점 없음</li>';
    try { localStorage.setItem('tn-builder3', JSON.stringify({ j: j, b: b, m: m })); } catch(e) {}
  }
  function load(id){
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) { writeJ(PRESETS[i].j); write('b', PRESETS[i].b); write('m', PRESETS[i].m); preset.value = id; render(); return; }
  }
  document.querySelectorAll('#builder select, #builder input').forEach(function(el){
    if (el.id !== 'preset') el.addEventListener('change', render);
  });
  preset.addEventListener('change', function(){ load(preset.value); });
  function pick(obj){ var k = Object.keys(obj); return k[Math.floor(Math.random() * k.length)]; }
  document.getElementById('shuffle').addEventListener('click', function(){
    writeJ({ shape: pick(T.JAR_SHAPES), lid: pick(T.JAR_LIDS), body: Math.random() < .85 ? 'blue' : 'copper' });
    ['b','m'].forEach(function(p){ write(p, { shape: pick(T.SHAPES), body: Math.random() < .8 ? 'blue' : 'copper', cap: pick(T.CAPS), metal: pick(T.METALS), band: Math.random() < .6 ? 'none' : pick(T.BANDS) }); });
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
  try { var s = JSON.parse(localStorage.getItem('tn-builder3') || 'null'); if (s && s.b && s.m) { writeJ(s.j); write('b', s.b); write('m', s.m); render(); } } catch(e) {}
})();
