/* MindLab · comportamento comune. Nessuna libreria, nessuna chiamata a servizi esterni.
   Lo "stato" (utente, prenotazioni, crediti) è solo di prova e resta nel browser (localStorage). */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'ml_state';

  // ---------- archivio locale (può non esistere: modalità privata) ----------
  var mem = {};
  function read(k) { try { return JSON.parse(w.localStorage.getItem(k)); } catch (e) { return mem[k] || null; } }
  function write(k, v) { try { w.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } }
  var ML = w.ML = w.ML || {};
  ML.read = read; ML.write = write;
  ML.state = function () { var s = read(KEY) || {}; s.bookings = s.bookings || []; s.credits = s.credits || 0; s.enrolled = s.enrolled || {}; s.certs = s.certs || []; s.payments = s.payments || []; return s; };
  ML.save = function (s) { write(KEY, s); };
  ML.today = function () { var t = read('ml_today'); return t || new Date().toISOString().slice(0, 10); };
  ML.setToday = function (v) { write('ml_today', v || null); };
  ML.q = function (k) { return new URLSearchParams(w.location.search).get(k); };

  // ---------- avviso ----------
  var toastEl = d.getElementById('toast'), toastT;
  w.toast = function (msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3800); };

  // ---------- menù a schermo intero ----------
  var btn = d.getElementById('menuBtn'), ov = d.getElementById('overlay'), closeB = d.getElementById('menuClose');
  if (btn && ov) {
    var items = ov.querySelectorAll('.ov-list a'), ring = d.getElementById('ovRing'), dot = d.getElementById('ovDot'), lastFocus;
    var open = function () { lastFocus = d.activeElement; ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); d.documentElement.style.overflow = 'hidden'; setTimeout(function () { closeB.focus(); }, 450); };
    var close = function () { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); d.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    btn.addEventListener('click', open); closeB.addEventListener('click', close);
    d.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { var f = ov.querySelectorAll('a,button'), a = f[0], z = f[f.length - 1]; if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    // l'Anello ruota e la Brace si sposta mentre scorri le voci
    var turn = function (i) { if (!ring || reduce) return; ring.style.transform = 'rotate(' + (i * 38) + 'deg)'; var a = (i * 38 - 40) * Math.PI / 180; dot.style.transform = 'translate(' + (Math.cos(a) * 90).toFixed(1) + 'px,' + (Math.sin(a) * 90).toFixed(1) + 'px)'; };
    items.forEach(function (a, i) { a.addEventListener('mouseenter', function () { turn(i); }); a.addEventListener('focus', function () { turn(i); }); a.addEventListener('click', close); });
    var here = w.location.pathname.split('/').pop() || 'index.html';
    items.forEach(function (a) { if (a.getAttribute('href').split('/').pop() === here) a.setAttribute('aria-current', 'page'); });
  }

  // ---------- intestazione chiara/scura in base alla sezione sotto ----------
  var head = d.getElementById('head');
  function paintHead() {
    if (!head || d.body.classList.contains('home')) return;
    var els = d.elementsFromPoint(Math.round(w.innerWidth / 2), 44), dark = false;
    for (var i = 0; i < els.length; i++) { if (els[i].closest && els[i].closest('.site-head')) continue; var s = els[i].closest('.on-dark,.foot,.chat'); if (s) { dark = true; } break; }
    head.classList.toggle('is-dark', dark);
  }
  var tick = false;
  w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { paintHead(); tick = false; }); } }, { passive: true });
  paintHead(); w.addEventListener('load', paintHead);

  // ---------- comparsa dolce ----------
  var targets = d.querySelectorAll('.rv,.rv-l,.mask');
  if ('IntersectionObserver' in w && !reduce) {
    var root = d.querySelector('.hz');
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, root: null, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
    ML.reveal = function (scope) { (scope || d).querySelectorAll('.rv,.rv-l,.mask').forEach(function (t) { if (!t.classList.contains('in')) io.observe(t); }); };
  } else { targets.forEach(function (t) { t.classList.add('in'); }); ML.reveal = function () {}; }

  // ---------- respiro: la parola cambia con il ritmo (4 in, 6 out) ----------
  var lab = d.querySelector('.breath-label .b-in');
  if (lab && !reduce) { var inh = true; (function loop() { lab.textContent = inh ? 'Inspira' : 'Espira'; var wait = inh ? 4000 : 6000; inh = !inh; setTimeout(loop, wait); })(); }

  // ---------- moduli di prova ----------
  d.querySelectorAll('form[data-form]').forEach(function (f) {
    var kind = f.getAttribute('data-form');
    if (kind === 'verifica') return; // gestito in area.js
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      if (kind === 'login') {
        var s = ML.state(); s.user = { email: data.email, nome: (data.nome || '').trim() || data.email.split('@')[0] }; ML.save(s);
        w.location.href = (ML.q('next') || 'area.html'); return;
      }
      if (kind === 'newsletter') { w.toast('Grazie. Ti scriveremo (nella bozza non viene inviato nulla).'); f.reset(); return; }
      var list = read('ml_preiscrizioni') || []; list.push({ data: data, quando: new Date().toISOString() }); write('ml_preiscrizioni', list);
      var depth = (w.location.pathname.match(/\//g) || []).length; // sempre root in questa bozza
      w.location.href = 'grazie.html';
    });
  });
  var sel = d.getElementById('pc'); if (sel && ML.q('corso')) { sel.value = ML.q('corso'); }

  // ---------- accesso: collegamento "Accedi" diventa il nome ----------
  var s0 = ML.state(), hl = d.querySelector('.head-link');
  if (hl && s0.user) { hl.textContent = 'Ciao, ' + s0.user.nome; hl.setAttribute('href', hl.getAttribute('href').replace('accedi.html', 'area.html')); }
})();

/* anteprima riservata: confronta l'impronta (SHA-256) del codice, senza tenerlo scritto nel sito.
   Non è una protezione forte: tiene fuori motori di ricerca e curiosi. */
(function () {
  var g = document.getElementById('lockscreen'); if (!g) return;
  var f = document.getElementById('lockF'), inp = document.getElementById('lockC'), err = document.getElementById('lockE');
  if (document.documentElement.classList.contains('locked')) setTimeout(function () { inp.focus(); }, 50);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bytes = new TextEncoder().encode('mindlab-bozza:' + inp.value.trim().toLowerCase());
    (window.crypto && crypto.subtle ? crypto.subtle.digest('SHA-256', bytes) : Promise.reject()).then(function (h) {
      var hex = Array.prototype.map.call(new Uint8Array(h), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      if (hex === g.getAttribute('data-h')) { try { localStorage.setItem('ml_gate', hex); } catch (x) {} document.documentElement.classList.remove('locked'); }
      else { err.textContent = 'Codice non corretto.'; g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake'); inp.select(); }
    }, function () { err.textContent = 'Questo browser non supporta l’accesso: usa una versione recente.'; });
  });
})();
