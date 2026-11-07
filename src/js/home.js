/* MindLab · home a scorrimento orizzontale.
   Una "pagina" per volta: rotella, frecce, tasti o trascinamento portano alla sezione successiva con movimento lento.
   Su telefono, con "riduci movimento" o con la scelta "Scorri in verticale" la home diventa una pagina normale. */
(function () {
  'use strict';
  var d = document, w = window, hz = d.getElementById('hz');
  if (!hz) return;
  var panels = [].slice.call(hz.querySelectorAll('.panel'));
  var dots = [].slice.call(d.querySelectorAll('#hzDots button'));
  var count = d.getElementById('hzCount'), prog = d.getElementById('hzProg'), nav = d.getElementById('hzNav'), head = d.getElementById('head');
  var cur = 0, lock = false, reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // preferenza "verticale" salvata, se possibile
  var pref; try { pref = w.localStorage.getItem('ml_vertical'); } catch (e) {}
  if (pref === '1') d.body.classList.add('vertical');
  var tog = d.getElementById('vertToggle');
  function isHz() { return !d.body.classList.contains('vertical') && w.innerWidth > 860 && !reduce; }
  function labelToggle() { if (tog) tog.textContent = d.body.classList.contains('vertical') ? 'Scorri in orizzontale' : 'Scorri in verticale'; }
  labelToggle();
  if (tog) tog.addEventListener('click', function () { var v = d.body.classList.toggle('vertical'); try { w.localStorage.setItem('ml_vertical', v ? '1' : '0'); } catch (e) {} labelToggle(); hz.scrollLeft = 0; w.scrollTo(0, 0); });

  function paint(i) {
    cur = i;
    dots.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (count) count.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + panels.length).slice(-2);
    if (prog) prog.style.width = ((i + 1) / panels.length * 100) + '%';
    var th = panels[i].getAttribute('data-theme');
    var dk = th === 'dark' || th === 'sage' && false;
    if (head) head.classList.toggle('is-dark', th === 'dark');
    if (nav) nav.classList.toggle('is-dark', th === 'dark');
    panels[i].querySelectorAll('.rv,.mask').forEach(function (e) { e.classList.add('in'); });
  }
  function go(i, instant) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    hz.scrollTo({ left: panels[i].offsetLeft, behavior: instant || reduce ? 'auto' : 'smooth' });
    paint(i);
  }
  // sincronizza l'indice quando si scorre a mano (trascinamento, touchpad)
  var st;
  hz.addEventListener('scroll', function () {
    if (!isHz()) return;
    clearTimeout(st);
    st = setTimeout(function () { var i = Math.round(hz.scrollLeft / w.innerWidth); if (i !== cur) paint(i); }, 90);
  }, { passive: true });

  var railT = 0;
  // rotella: un passo alla volta
  hz.addEventListener('wheel', function (e) {
    if (!isHz()) return;
    if (e.target.closest && e.target.closest('.rail') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // scorrimento orizzontale dentro la fila di schede
    var rl = e.target.closest && e.target.closest('.rail');
    if (rl && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) { // la rotella fa scorrere le schede; a fine fila passa alla sezione dopo
      var dir = e.deltaY > 0 ? 1 : -1, max = rl.scrollWidth - rl.clientWidth, can = (dir > 0 && rl.scrollLeft < max - 2) || (dir < 0 && rl.scrollLeft > 2);
      if (can || Date.now() - railT < 350) { e.preventDefault(); if (can) { rl.style.scrollSnapType = 'none'; rl.scrollLeft += e.deltaY * 1.4; railT = Date.now(); clearTimeout(rl._st); rl._st = setTimeout(function () { rl.style.scrollSnapType = ''; }, 400); } return; }
    }
    var pi = e.target.closest && e.target.closest('.panel-in');
    if (pi && pi.scrollHeight > pi.clientHeight + 4 && ((e.deltaY > 0 && pi.scrollTop + pi.clientHeight < pi.scrollHeight - 2) || (e.deltaY < 0 && pi.scrollTop > 0))) return; // c'è ancora contenuto da scorrere in verticale
    var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 8) return;
    e.preventDefault();
    if (lock) return;
    lock = true; go(cur + (delta > 0 ? 1 : -1)); setTimeout(function () { lock = false; }, 1100);
  }, { passive: false });

  d.addEventListener('keydown', function (e) {
    if (!isHz()) return;
    var ov = d.getElementById('overlay'); if (ov && ov.classList.contains('open')) return;
    var t = e.target; if (t && /input|textarea|select/i.test(t.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(panels.length - 1); }
  });
  dots.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  var pv = d.getElementById('hzPrev'), nx = d.getElementById('hzNext');
  if (pv) pv.addEventListener('click', function () { go(cur - 1); });
  if (nx) nx.addEventListener('click', function () { go(cur + 1); });

  // collegamenti interni alla home (#p3 ecc.)
  w.addEventListener('resize', function () { if (isHz()) hz.scrollTo({ left: panels[cur].offsetLeft, behavior: 'auto' }); });
  paint(0);
  if (location.hash && /^#p\d$/.test(location.hash)) go(parseInt(location.hash.slice(2), 10) - 1, true);
})();
