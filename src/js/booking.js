/* MindLab · prenotazioni (versione di prova).
   Genera dal catalogo (window.ML, data.js) le edizioni e gli slot, applica le regole (48 ore, posti, crediti)
   e salva le prenotazioni solo nel browser. La versione vera userà un database con login (vedi README). */
(function () {
  'use strict';
  var d = document, w = window, ML = w.ML;
  var GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var TEMI = ['Pilota automatico', 'Percepire e interpretare', 'La presenza che fa bene', 'Reattività allo stress', 'Rispondere, non reagire', 'Comunicare quando è difficile', 'Prendersi cura di sé', 'Continuare'];
  var CAP = ML.regole.postiPerSlot, H48 = ML.regole.chiusuraOre;

  // ---------- date ----------
  function parse(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
  function add(isoS, n) { var x = parse(isoS); x.setDate(x.getDate() + n); return iso(x); }
  function monday(isoS) { var x = parse(isoS), g = (x.getDay() + 6) % 7; x.setDate(x.getDate() - g); return iso(x); }
  function fmt(isoS) { var x = parse(isoS); return x.getDate() + ' ' + MESI[x.getMonth()]; }
  function fmtY(isoS) { var x = parse(isoS); return x.getDate() + ' ' + MESI[x.getMonth()] + ' ' + x.getFullYear(); }
  function at(slot) { var p = slot.ora.split(':'); var x = parse(slot.date); x.setHours(+p[0], +p[1], 0, 0); return x; }
  function nowSim() { var t = ML.read('ml_today'); if (t) { var x = parse(t); x.setHours(9, 0, 0, 0); return x; } return new Date(); }
  function hoursTo(slot) { return (at(slot) - nowSim()) / 36e5; }
  function closed(slot) { return hoursTo(slot) < H48; }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function seats(id) { var h = hash(id); if (h % 23 === 0) return 0; return CAP - (h % 9); }
  function pro(id) { return ML.pros.filter(function (p) { return p.id === id; })[0]; }
  function corso(s) { return ML.corsi.filter(function (c) { return c.slug === s; })[0]; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function eur(n) { return n + ' €'; }

  // ---------- generazione slot ----------
  function mbsrSlots(ed, wk) {
    return ML.pros.map(function (p) {
      var date = add(ed, (wk - 1) * 7 + p.giorno);
      return { id: 'mbsr|' + ed + '|' + wk + '|' + p.id, kind: 'mbsr', corso: 'mbsr', titolo: 'MBSR · lezione ' + wk + ' · ' + TEMI[wk - 1], date: date, ora: p.ora, min: 120, pro: p.id, prezzo: 0, ed: ed, wk: wk, giorno: p.giorno };
    });
  }
  function singSlots(mon) {
    return ML.settimana.map(function (s) {
      return { id: 'sing|' + add(mon, s.giorno) + '|' + s.id, kind: 'sing', corso: s.corso, titolo: s.titolo, date: add(mon, s.giorno), ora: s.ora, min: s.min, pro: s.pro, prezzo: ML.prezzi.lezione, giorno: s.giorno };
    });
  }
  function collSlots(mon) {
    var out = [], ore = ['15:00', '16:00', '17:00'];
    [1, 3].forEach(function (g) { ore.forEach(function (o) { out.push({ id: 'coll|' + add(mon, g) + '|' + o, kind: 'coll', corso: 'counselling', titolo: 'Colloquio individuale', date: add(mon, g), ora: o, min: 50, pro: 'giulia', prezzo: 60, giorno: g }); }); });
    return out;
  }
  function percMeetings(e) {
    var out = [], c = corso(e.corso);
    for (var i = 0; i < e.incontri; i++) out.push({ id: 'perc|' + e.corso + '|' + e.inizio + '|' + (i + 1), kind: 'perc', corso: e.corso, titolo: c.nome + ' · incontro ' + (i + 1), date: add(e.inizio, i * 7), ora: e.ora, min: e.min, pro: e.pro, prezzo: 0, giorno: e.giorno, n: i + 1 });
    return out;
  }

  function slotById(id) {
    var p = id.split('|'), f = function (list) { return list.filter(function (s) { return s.id === id; })[0]; };
    if (p[0] === 'mbsr') return f(mbsrSlots(p[1], +p[2]));
    if (p[0] === 'sing') return f(singSlots(monday(p[1])));
    if (p[0] === 'coll') return f(collSlots(monday(p[1])));
    if (p[0] === 'perc') { var e = ML.edizioniPercorsi.filter(function (x) { return x.corso === p[1] && x.inizio === p[2]; })[0]; return e && f(percMeetings(e)); }
  }

  // ---------- stato ----------
  function S() { return ML.state(); }
  function bookedIds() { var m = {}; S().bookings.forEach(function (b) { m[b.id] = true; }); return m; }
  // prima lezione gratuita: una per corso, per persona
  function freeFor(slot) {
    if (!ML.regole.primaLezioneGratuita) return false;
    var s = S(), has = s.bookings.some(function (b) { return b.corso === slot.corso; });
    if (slot.kind === 'mbsr') return slot.wk === 1 && !s.enrolled[slot.ed] && !has;
    if (slot.kind === 'perc') return /\|1$/.test(slot.id) && !has;
    return !has;
  }
  function mine(id) { return !!bookedIds()[id]; }
  function addBooking(s, slot, how) {
    s.bookings.push({ id: slot.id, kind: slot.kind, corso: slot.corso, titolo: slot.titolo, date: slot.date, ora: slot.ora, min: slot.min, pro: slot.pro, prezzo: slot.prezzo, pagato: how, ed: slot.ed || null, wk: slot.wk || null });
  }
  function cancel(id) {
    var s = S(), i = s.bookings.map(function (b) { return b.id; }).indexOf(id); if (i < 0) return false;
    var b = s.bookings[i];
    if (closed(b)) { w.toast('La disdetta si chiude ' + H48 + ' ore prima della lezione.'); return false; }
    if (b.pagato === 'credito') s.credits += 1;
    s.bookings.splice(i, 1); ML.save(s); w.toast('Prenotazione annullata' + (b.pagato === 'credito' ? ': credito restituito.' : '.')); return true;
  }

  // ---------- finestra di conferma ----------
  var modal;
  function ensureModal() {
    if (modal) return modal;
    modal = d.createElement('div'); modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="modal-box"><div id="mBody"></div></div>';
    d.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
    return modal;
  }
  function openModal(html, onReady) { ensureModal(); modal.querySelector('#mBody').innerHTML = html; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); var f = modal.querySelector('button.btn-ember,button.btn-ink'); if (f) f.focus(); if (onReady) onReady(modal); }
  function closeModal() { if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); } }
  function needLogin() { if (S().user) return false; openModal('<p class="t-caps sage">Per prenotare</p><h2 class="t-h2" style="margin:8px 0 14px">Entra nella tua area.</h2><p class="muted">Servono due secondi, nella bozza basta un’email di prova.</p><div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-ember" href="accedi.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.hash) + '">Accedi</a><button class="btn btn-ghost" data-close>Chiudi</button></div>', function (m) { m.querySelector('[data-close]').addEventListener('click', closeModal); }); return true; }

  // riepilogo + conferma di uno slot
  function confirmSlot(slot, opts) {
    if (needLogin()) return;
    opts = opts || {};
    var s = S(), p = pro(slot.pro), price = slot.prezzo, extra = '', useCredit = false, free = freeFor(slot);
    if (slot.kind === 'mbsr' && !s.enrolled[slot.ed] && !free) { price = ML.prezzi.mbsr; extra = '<p class="note" style="margin:14px 0">Prenotando questa lezione ti iscrivi all’edizione che parte il <b>' + fmtY(slot.ed) + '</b>: ' + eur(ML.prezzi.mbsr) + ', percorso completo. Poi scegli ogni settimana l’orario che preferisci.</p>'; }
    else if (slot.kind === 'mbsr') { price = 0; if (free) extra = '<p class="note" style="margin:14px 0">Prima lezione gratuita. Per continuare con le altre sette ti iscrivi all’edizione (' + eur(ML.prezzi.mbsr) + ').</p>'; }
    if (free && slot.kind !== 'mbsr') { price = 0; }
    else if (slot.kind === 'sing' && s.credits > 0) { useCredit = true; price = 0; }
    var replaced = slot.kind === 'mbsr' ? s.bookings.filter(function (b) { return b.kind === 'mbsr' && b.ed === slot.ed && b.wk === slot.wk; })[0] : null;
    var html = '<p class="t-caps sage">Riepilogo</p><h2 class="t-h2" style="margin:8px 0 6px">' + esc(slot.titolo) + '</h2><p class="muted">' + GIORNI[slot.giorno] + ' ' + fmt(slot.date) + ' · ' + slot.ora + ' · ' + slot.min + ' min · con ' + esc(p.nome) + '</p>' + extra +
      (replaced ? '<p class="note" style="margin:14px 0">Sposti la tua lezione ' + slot.wk + ' dal ' + fmt(replaced.date) + ' (' + replaced.ora + ') a questa.</p>' : '') +
      '<p class="stat" style="font-size:2.4rem;margin:18px 0 4px">' + (price ? eur(price) : useCredit ? '1 credito' : free ? 'Gratuita' : 'Incluso') + '</p><p class="t-small muted">Il link alla videochiamata ti arriva per mail 24 ore prima e 5 minuti prima. ' + H48 + ' ore prima dell’inizio non si può più disdire.</p>' +
      '<div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ember" id="mOk">' + (price ? 'Conferma e paga (prova)' : 'Conferma') + '</button><button class="btn btn-ghost" id="mNo">Annulla</button></div>';
    openModal(html, function (m) {
      m.querySelector('#mNo').addEventListener('click', closeModal);
      m.querySelector('#mOk').addEventListener('click', function () {
        var st = S();
        if (replaced) { var ix = st.bookings.map(function (b) { return b.id; }).indexOf(replaced.id); if (ix >= 0) st.bookings.splice(ix, 1); }
        if (slot.kind === 'mbsr' && !st.enrolled[slot.ed] && !free) { st.enrolled[slot.ed] = true; st.payments.push({ quando: ML.today(), voce: 'MBSR · edizione ' + fmtY(slot.ed), importo: ML.prezzi.mbsr }); }
        if (useCredit) { st.credits -= 1; addBooking(st, slot, 'credito'); }
        else { addBooking(st, slot, price ? 'carta' : free ? 'gratuita' : 'incluso'); if (price) st.payments.push({ quando: ML.today(), voce: slot.titolo, importo: price }); }
        ML.save(st); closeModal(); w.toast('Prenotato. Ti abbiamo inviato la conferma (nella bozza: simulata).');
        if (opts.after) opts.after();
      });
    });
  }

  // ---------- scheda slot ----------
  function slotCard(slot, o) {
    o = o || {};
    var p = pro(slot.pro), left = seats(slot.id), isMine = mine(slot.id), cl = closed(slot);
    var label, dis = false;
    if (isMine) label = 'Prenotata'; else if (cl) { label = 'Chiuso (48 h)'; dis = true; } else if (left === 0) { label = 'Completo'; dis = true; } else label = o.label || (freeFor(slot) ? 'Prova gratis' : 'Prenota');
    var av = p.foto ? '<span class="mini"><img src="assets/img/' + p.foto + '" alt="" width="60" height="60"></span>' : '<span class="mini" aria-hidden="true">' + esc(p.nome[0]) + '</span>';
    return '<div class="slot' + (isMine ? ' is-mine' : '') + '" data-id="' + esc(slot.id) + '"><span class="time">' + slot.ora + '</span><span class="t-small">' + esc(slot.titolo) + '</span><span class="who">' + av + esc(p.nome) + '</span><span class="seats">' + (left === 0 ? 'Posti esauriti' : left <= 3 ? 'Ultimi ' + left + ' posti' : left + ' posti liberi') + ' · ' + slot.min + ' min</span>' +
      (isMine ? '<button class="btn btn-ghost" data-cancel="' + esc(slot.id) + '"' + (cl ? ' disabled' : '') + '>' + (cl ? 'Prenotata' : 'Disdici') + '</button>' : '<button class="btn btn-ink' + (dis ? ' is-off' : '') + '" data-book="' + esc(slot.id) + '"' + (dis ? ' disabled' : '') + '>' + label + '</button>') + '</div>';
  }
  function dayGrid(slots, mon) {
    var cols = [0, 1, 2, 3, 4, 5].map(function (g) {
      var list = slots.filter(function (s) { return s.giorno === g; }).sort(function (a, b) { return a.ora < b.ora ? -1 : 1; });
      return '<div class="day"><h3>' + GIORNI[g] + ' ' + fmt(add(mon, g)) + '</h3>' + (list.map(function (s) { return slotCard(s); }).join('') || '<p class="t-small muted">—</p>') + '</div>';
    });
    return '<div class="daygrid">' + cols.join('') + '</div>';
  }

  // =========================================================
  // PAGINA CALENDARIO
  // =========================================================
  var calBody = d.getElementById('calBody');
  if (calBody) {
    var tab = 'mese', ed = ML.edizioniMbsr[0], wk = 1, mon = monday(ML.primaSettimana), ctl = d.getElementById('calCtl'), reg = {};
    var tabs = d.getElementById('calTabs');
    var hashTab = (location.hash || '').slice(1); if (['mese', 'mbsr', 'settimana', 'percorsi', 'colloqui'].indexOf(hashTab) >= 0) tab = hashTab;
    var todayInput = d.getElementById('demoToday'); todayInput.value = ML.read('ml_today') || ''; todayInput.addEventListener('change', function () { ML.setToday(todayInput.value); draw(); });
    function sel(id, opts, val) { return '<label class="sr" for="' + id + '">' + id + '</label><select class="select" id="' + id + '" style="width:auto">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
    var mY = nowSim().getFullYear(), mM = nowSim().getMonth(), mSel = null, mF = '';
    function eventsOn(isoS) {
      var out = singSlots(monday(isoS)).concat(collSlots(monday(isoS)));
      ML.edizioniMbsr.forEach(function (e) { for (var k = 1; k <= 8; k++) { var a = add(e, (k - 1) * 7); if (a <= isoS && isoS <= add(a, 5)) out = out.concat(mbsrSlots(e, k)); } });
      ML.edizioniPercorsi.forEach(function (e) { out = out.concat(percMeetings(e)); });
      return out.filter(function (s) { return s.date === isoS && (!mF || s.corso === mF); }).sort(function (a, b) { return a.ora < b.ora ? -1 : 1; });
    }
    function drawMonth() {
      var base = nowSim(), nd = new Date(mY, mM + 1, 0).getDate(), lead = (new Date(mY, mM, 1).getDay() + 6) % 7, pad2 = function (n) { return ('0' + n).slice(-2); };
      var iso0 = function (k) { return mY + '-' + pad2(mM + 1) + '-' + pad2(k); };
      var slugs = []; ML.settimana.forEach(function (s) { if (slugs.indexOf(s.corso) < 0) slugs.push(s.corso); }); ['mbsr', 'counselling'].concat(ML.edizioniPercorsi.map(function (e) { return e.corso; })).forEach(function (c) { if (slugs.indexOf(c) < 0) slugs.push(c); });
      var order = ML.corsi.map(function (c) { return c.slug; }); slugs.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
      if (mSel) { var sp = parse(mSel); if (sp.getMonth() !== mM || sp.getFullYear() !== mY) mSel = null; }
      var okFree = function (s) { return !closed(s) && seats(s.id) > 0; };
      if (!mSel) for (var k = 1; k <= nd; k++) if (eventsOn(iso0(k)).some(okFree)) { mSel = iso0(k); break; }
      var cells = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(function (n) { return '<span class="cal-h">' + n + '</span>'; }).join('');
      for (var i = 0; i < lead; i++) cells += '<span></span>';
      for (var dd = 1; dd <= nd; dd++) {
        var di = iso0(dd), ev = eventsOn(di), fr = ev.filter(okFree), mineD = ev.some(function (s) { return mine(s.id); });
        cells += '<button type="button" class="cal-d' + (fr.length ? '' : ' is-off') + (mSel === di ? ' is-sel' : '') + '" data-day="' + di + '"' + (ev.length ? '' : ' disabled') + ' aria-pressed="' + (mSel === di) + '"><b>' + dd + '</b>' + (ev.length ? '<i class="' + (mineD ? 'pk' : fr.length ? 'on' : '') + '"></i>' : '') + '</button>';
      }
      var chips = '<div class="chips" role="group" aria-label="Filtra per corso"><button type="button" class="chip" data-chip="" aria-pressed="' + (!mF) + '">Tutti i corsi</button>' + slugs.map(function (c) { return '<button type="button" class="chip" data-chip="' + c + '" aria-pressed="' + (mF === c) + '">' + esc(corso(c).nome) + '</button>'; }).join('') + '</div>';
      var list = mSel ? eventsOn(mSel) : [];
      var dayH = mSel ? '<p class="t-caps sage" style="margin:6px 0 14px">' + GIORNI[(parse(mSel).getDay() + 6) % 7] + ' ' + fmt(mSel) + '</p>' : '';
      var dayL = mSel ? (list.length ? list.map(function (s) {
        var c = slotCard(s);
        if (s.kind === 'perc') { var cc = corso(s.corso), e = ML.edizioniPercorsi.filter(function (x) { return x.corso === s.corso; })[0]; c += '<p style="margin:-4px 0 14px"><button class="btn btn-ghost" data-perc="' + s.corso + '|' + e.inizio + '">Iscriviti a tutto il percorso · ' + eur(cc.prezzo) + '</button></p>'; }
        return c;
      }).join('') : '<p class="muted">Nessuna lezione con questo filtro.</p>') : '<p class="muted">Scegli un giorno con un punto: ci sono date disponibili.</p>';
      var ctrl = '<button class="btn btn-ghost" id="mPrev" type="button"' + (mY === base.getFullYear() && mM === base.getMonth() ? ' disabled' : '') + '>← Mese prima</button><b aria-live="polite">' + MESI[mM].charAt(0).toUpperCase() + MESI[mM].slice(1) + ' ' + mY + '</b><button class="btn btn-ghost" id="mNext" type="button">Mese dopo →</button>';
      return { ctrl: ctrl, html: chips + '<div class="cal">' + cells + '</div>' + dayH + '<div class="daylist">' + dayL + '</div><p class="t-small muted" style="margin-top:10px">' + ML.regole.paragrafoGratis + ' ' + ML.regole.paragrafoChiusura + '</p>' };
    }
    function draw() {
      tabs.querySelectorAll('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === tab)); });
      var html = '', ctrl = '';
      if (tab === 'mese') {
        var r = drawMonth(); ctrl = r.ctrl; html = r.html;
      } else if (tab === 'mbsr') {
        ctrl = '<b style="margin-right:8px">Edizione</b>' + sel('edSel', ML.edizioniMbsr.map(function (e) { return [e, 'dal ' + fmtY(e)]; }), ed) + '<button class="btn btn-ghost" id="kPrev" type="button">← Settimana</button><b aria-live="polite">Lezione ' + wk + ' di 8 · ' + TEMI[wk - 1] + '</b><button class="btn btn-ghost" id="kNext" type="button">Settimana →</button>';
        var slots = mbsrSlots(ed, wk); var wkMon = add(ed, (wk - 1) * 7);
        html = '<p class="muted" style="margin-bottom:16px">Settimana dal ' + fmt(wkMon) + ' · la stessa lezione, sei orari: scegline uno. ' + (S().enrolled[ed] ? '<span class="pill sage">Sei iscritto a questa edizione</span>' : 'Prenotando la prima lezione ti iscrivi all’edizione (' + eur(ML.prezzi.mbsr) + ', esempio).') + '</p>' + dayGrid(slots, wkMon);
      } else if (tab === 'settimana') {
        ctrl = '<button class="btn btn-ghost" id="wP" type="button">← Prima</button><b aria-live="polite">Settimana dal ' + fmt(mon) + '</b><button class="btn btn-ghost" id="wN" type="button">Dopo →</button><span class="pill">Credito disponibile: ' + S().credits + '</span><a class="ulink b" href="settimana.html">Componi la settimana con il carrello</a>';
        html = dayGrid(singSlots(mon), mon);
      } else if (tab === 'colloqui') {
        ctrl = '<button class="btn btn-ghost" id="wP" type="button">← Prima</button><b aria-live="polite">Settimana dal ' + fmt(mon) + '</b><button class="btn btn-ghost" id="wN" type="button">Dopo →</button>';
        html = '<p class="muted" style="margin-bottom:16px">Colloqui individuali di 50 minuti con Giulia. ' + eur(60) + ' a colloquio (esempio).</p>' + dayGrid(collSlots(mon), mon);
      } else {
        ctrl = '<b>Percorsi a incontri fissi</b>';
        html = '<div class="grid g2" style="--g:20px">' + ML.edizioniPercorsi.map(function (e) {
          var c = corso(e.corso), ms = percMeetings(e), first = ms[0], p = pro(e.pro), joined = ms.every(function (m) { return mine(m.id); }), cl = closed(first);
          return '<article class="card"><p class="t-caps sage">' + esc(c.sottotitolo) + '</p><h3 class="t-h2">' + esc(c.nome) + '</h3><p class="muted">Dal ' + fmtY(e.inizio) + ' · ' + e.incontri + ' incontri · ' + GIORNI[e.giorno] + ' ' + e.ora + ' · con ' + esc(p.nome) + '</p><ul class="list">' + ms.map(function (m) { return '<li><span class="n">' + m.n + '</span><span>' + GIORNI[m.giorno] + ' ' + fmt(m.date) + '</span><span class="t-small">' + m.ora + '</span></li>'; }).join('') + '</ul>' +
            '<p class="price">' + eur(c.prezzo) + ' <span class="t-small muted" style="font-weight:400">percorso completo · ' + seats(first.id) + ' posti liberi</span></p>' + (joined ? '<button class="btn btn-ghost" disabled>Sei iscritto</button>' : '<button class="btn btn-ink' + (cl ? ' is-off' : '') + '" data-perc="' + e.corso + '|' + e.inizio + '"' + (cl ? ' disabled' : '') + '>' + (cl ? 'Iscrizioni chiuse (48 h)' : 'Iscriviti al percorso') + '</button>') + '</article>';
        }).join('') + '</div>';
      }
      ctl.innerHTML = ctrl; calBody.innerHTML = html;
      // eventi
      var q = function (id) { return d.getElementById(id); };
      if (q('mPrev')) q('mPrev').addEventListener('click', function () { if (mM === 0) { mM = 11; mY--; } else mM--; draw(); });
      if (q('mNext')) q('mNext').addEventListener('click', function () { if (mM === 11) { mM = 0; mY++; } else mM++; draw(); });
      if (q('edSel')) q('edSel').addEventListener('change', function (e) { ed = e.target.value; wk = 1; draw(); });
      if (q('kPrev')) q('kPrev').addEventListener('click', function () { wk = Math.max(1, wk - 1); draw(); });
      if (q('kNext')) q('kNext').addEventListener('click', function () { wk = Math.min(8, wk + 1); draw(); });
      if (q('wP')) q('wP').addEventListener('click', function () { mon = add(mon, -7); draw(); });
      if (q('wN')) q('wN').addEventListener('click', function () { mon = add(mon, 7); draw(); });
      if (ML.reveal) ML.reveal(calBody);
    }
    calBody.addEventListener('click', function (e) {
      var dy = e.target.closest('[data-day]'), ch = e.target.closest('[data-chip]');
      if (dy) { mSel = dy.getAttribute('data-day'); draw(); return; }
      if (ch) { mF = ch.getAttribute('data-chip'); mSel = null; draw(); return; }
      var b = e.target.closest('[data-book]'), c = e.target.closest('[data-cancel]'), pe = e.target.closest('[data-perc]');
      if (b) { var id = b.getAttribute('data-book'); var slot = slotById(id); if (slot) confirmSlot(slot, { after: draw }); }
      if (c) { if (cancel(c.getAttribute('data-cancel'))) draw(); }
      if (pe) {
        if (needLogin()) return;
        var parts = pe.getAttribute('data-perc').split('|'), e0 = ML.edizioniPercorsi.filter(function (x) { return x.corso === parts[0] && x.inizio === parts[1]; })[0], c0 = corso(e0.corso), ms = percMeetings(e0);
        openModal('<p class="t-caps sage">Riepilogo</p><h2 class="t-h2" style="margin:8px 0 6px">' + esc(c0.nome) + '</h2><p class="muted">' + ms.length + ' incontri dal ' + fmtY(e0.inizio) + ' · ' + GIORNI[e0.giorno] + ' alle ' + e0.ora + '</p><p class="stat" style="font-size:2.4rem;margin:18px 0 4px">' + eur(c0.prezzo) + '</p><p class="t-small muted">Iscrizioni e disdette si chiudono ' + H48 + ' ore prima del primo incontro.</p><div style="margin-top:22px;display:flex;gap:10px"><button class="btn btn-ember" id="mOk">Conferma e paga (prova)</button><button class="btn btn-ghost" id="mNo">Annulla</button></div>', function (m) {
          m.querySelector('#mNo').addEventListener('click', closeModal);
          m.querySelector('#mOk').addEventListener('click', function () { var st = S(); ms.forEach(function (sl) { addBooking(st, sl, 'carta'); }); st.payments.push({ quando: ML.today(), voce: c0.nome, importo: c0.prezzo }); ML.save(st); closeModal(); w.toast('Iscritto al percorso. Conferma inviata (simulata).'); draw(); });
        });
      }
    });
    tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) { tab = t.getAttribute('data-tab'); history.replaceState(null, '', '#' + tab); draw(); } });
    draw();
  }

  // =========================================================
  // PAGINA "COMPONI LA SETTIMANA" (carrello)
  // =========================================================
  var wGrid = d.getElementById('wGrid');
  if (wGrid) {
    // vista mensile: si sceglie il giorno sul calendario, oppure si filtra per lezione
    var grid = wGrid, picked = {}, now0 = nowSim(), baseY = now0.getFullYear(), baseM = now0.getMonth(), year = baseY, month = baseM, selDay = null, filt = '';
    var chips = d.getElementById('wChips'), dayBox = d.getElementById('wDay');
    var DOW = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    function slotsOn(isoS) { return singSlots(monday(isoS)).filter(function (s) { return s.date === isoS; }); }
    function shown(isoS) { return slotsOn(isoS).filter(function (s) { return !filt || s.corso === filt; }); }
    function isOff(s) { return closed(s) || seats(s.id) === 0 || mine(s.id); }
    function drawWeek() {
      var first = new Date(year, month, 1), lead = (first.getDay() + 6) % 7, nd = new Date(year, month + 1, 0).getDate();
      d.getElementById('wLabel').textContent = MESI[month].charAt(0).toUpperCase() + MESI[month].slice(1) + ' ' + year;
      d.getElementById('wPrev').disabled = year === baseY && month === baseM;
      var cs = []; ML.settimana.forEach(function (s) { if (cs.indexOf(s.corso) < 0) cs.push(s.corso); });
      chips.innerHTML = '<button type="button" class="chip" data-chip="" aria-pressed="' + (!filt) + '">Tutte</button>' + cs.map(function (c) { return '<button type="button" class="chip" data-chip="' + c + '" aria-pressed="' + (filt === c) + '">' + esc(corso(c).nome) + '</button>'; }).join('');
      if (selDay) { var sp = parse(selDay); if (sp.getMonth() !== month || sp.getFullYear() !== year) selDay = null; }
      if (!selDay) { for (var k = 1; k <= nd; k++) { var iso0 = year + '-' + ('0' + (month + 1)).slice(-2) + '-' + ('0' + k).slice(-2); if (shown(iso0).some(function (s) { return !isOff(s); })) { selDay = iso0; break; } } }
      var cells = DOW.map(function (n) { return '<span class="cal-h">' + n + '</span>'; }).join('');
      for (var i = 0; i < lead; i++) cells += '<span></span>';
      for (var dd = 1; dd <= nd; dd++) {
        var isoD = year + '-' + ('0' + (month + 1)).slice(-2) + '-' + ('0' + dd).slice(-2), sl = shown(isoD), free = sl.filter(function (s) { return !isOff(s); }), pk = sl.some(function (s) { return picked[s.id]; });
        cells += '<button type="button" class="cal-d' + (free.length ? '' : ' is-off') + (selDay === isoD ? ' is-sel' : '') + '" data-day="' + isoD + '"' + (sl.length ? '' : ' disabled') + ' aria-pressed="' + (selDay === isoD) + '" aria-label="' + dd + ' ' + MESI[month] + (free.length ? ', lezioni disponibili' : sl.length ? ', non prenotabile' : ', nessuna lezione') + '"><b>' + dd + '</b>' + (sl.length ? '<i class="' + (pk ? 'pk' : free.length ? 'on' : '') + '"></i>' : '') + '</button>';
      }
      grid.innerHTML = cells;
      var list = selDay ? shown(selDay) : [];
      dayBox.innerHTML = selDay ? '<p class="t-caps sage" style="margin:6px 0 12px">' + GIORNI[(parse(selDay).getDay() + 6) % 7] + ' ' + fmt(selDay) + '</p>' + (list.length ? list.map(function (s) {
        var p = pro(s.pro), off = isOff(s), on = !!picked[s.id], why = closed(s) ? 'Chiuso (48 h)' : mine(s.id) ? 'Già prenotata' : seats(s.id) === 0 ? 'Completo' : on ? 'Scelta' : 'Aggiungi';
        return '<button class="slot slot-pick' + (off ? ' is-off' : '') + '" data-pick="' + esc(s.id) + '" aria-pressed="' + on + '"' + (off ? ' disabled' : '') + ' style="width:100%;flex-direction:row;align-items:center;flex-wrap:wrap;gap:6px 16px;margin-bottom:10px"><span class="time">' + s.ora + '</span><span style="flex:1 1 180px">' + esc(s.titolo) + ' <span class="t-small muted">· ' + s.min + ' min</span></span><span class="who"><span class="mini" aria-hidden="true">' + esc(p.nome[0]) + '</span>' + esc(p.nome) + '</span><span class="t-small">' + why + ' · ' + (freeFor(s) ? 'Prima gratis' : eur(ML.prezzi.lezione)) + '</span></button>';
      }).join('') : '<p class="muted">Nessuna lezione per questo filtro.</p>') : '<p class="muted">Scegli un giorno con un punto: ci sono lezioni disponibili.</p>';
    }
    function plan(ids) {
      var used = {}; S().bookings.forEach(function (b) { used[b.corso] = 1; }); var free = 0;
      var list = ids.map(function (id) { var sl = picked[id], f = !!ML.regole.primaLezioneGratuita && !used[sl.corso]; if (f) { used[sl.corso] = 1; free++; } return { s: sl, f: f }; });
      return { list: list, free: free };
    }
    function pack() { return +d.getElementById('pack').value; }
    function cart() {
      var ids = Object.keys(picked).filter(function (k) { return picked[k]; }), st = S(), n = ids.length;
      var ul = d.getElementById('cartList');
      var pl = plan(ids); ul.innerHTML = n ? pl.list.map(function (it) { var s = it.s; return '<li><span>' + GIORNI[s.giorno].slice(0, 3) + ' ' + s.ora + ' · ' + esc(s.titolo) + '</span><span>' + (it.f ? 'Gratis' : eur(ML.prezzi.lezione)) + '</span></li>'; }).join('') : '<li class="muted t-small">Nessuna lezione scelta.</li>';
      var cr = st.credits, packP = pack() === 5 ? ML.prezzi.pack5 : pack() === 10 ? ML.prezzi.pack10 : 0, packN = pack(); var nPay = n - pl.free, credits = cr + packN, usa = Math.min(credits, nPay), pay = (nPay - usa) * ML.prezzi.lezione + packP;
      d.getElementById('cartTot').textContent = eur(pay);
      d.getElementById('cartNote').textContent = n ? (usa ? usa + (usa === 1 ? ' lezione pagata' : ' lezioni pagate') + ' con i crediti' + (packN ? ' del pacchetto' : '') : 'Lezioni singole') + (credits - usa > 0 ? ' · ti restano ' + (credits - usa) + ' crediti' : '') : '';
      d.getElementById('cartGo').disabled = !n;
    }
    function singSlotById(id) { var p = id.split('|'); return singSlots(monday(p[1])).filter(function (s) { return s.id === id; })[0]; }
    function onPick(e) {
      var dy = e.target.closest('[data-day]'), ch = e.target.closest('[data-chip]'), b = e.target.closest('[data-pick]');
      if (dy) { selDay = dy.getAttribute('data-day'); drawWeek(); return; }
      if (ch) { filt = ch.getAttribute('data-chip'); selDay = null; drawWeek(); return; }
      if (!b) return; var id = b.getAttribute('data-pick');
      if (picked[id]) delete picked[id]; else picked[id] = singSlotById(id);
      drawWeek(); cart();
    }
    [wGrid, chips, dayBox].forEach(function (el) { el.addEventListener('click', onPick); });
    d.getElementById('wPrev').addEventListener('click', function () { if (month === 0) { month = 11; year--; } else month--; drawWeek(); });
    d.getElementById('wNext').addEventListener('click', function () { if (month === 11) { month = 0; year++; } else month++; drawWeek(); });
    d.getElementById('pack').addEventListener('change', cart);
    d.getElementById('cartGo').addEventListener('click', function () {
      if (needLogin()) return;
      var ids = Object.keys(picked).filter(function (k) { return picked[k]; }), n = ids.length; if (!n) return;
      var st = S(), packN = pack(), packP = packN === 5 ? ML.prezzi.pack5 : packN === 10 ? ML.prezzi.pack10 : 0;
      var pl = plan(ids), nPay = n - pl.free, credits = st.credits + packN, usa = Math.min(credits, nPay), pay = (nPay - usa) * ML.prezzi.lezione + packP;
      openModal('<p class="t-caps sage">Riepilogo</p><h2 class="t-h2" style="margin:8px 0 12px">La tua settimana</h2><ul class="list">' + ids.map(function (id) { var s = picked[id]; return '<li><span class="n">' + GIORNI[s.giorno].slice(0, 3).toUpperCase() + '</span><span>' + esc(s.titolo) + '</span><span class="t-small">' + s.ora + '</span></li>'; }).join('') + '</ul><p class="stat" style="font-size:2.4rem;margin:18px 0 4px">' + eur(pay) + '</p><p class="t-small muted">' + usa + ' lezioni con crediti. ' + H48 + ' ore prima di ogni lezione non si può più disdire.</p><div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ember" id="mOk">Conferma e paga (prova)</button><button class="btn btn-ghost" id="mNo">Annulla</button></div>', function (m) {
        m.querySelector('#mNo').addEventListener('click', closeModal);
        m.querySelector('#mOk').addEventListener('click', function () {
          var s2 = S(); if (packN) { s2.credits += packN; s2.payments.push({ quando: ML.today(), voce: 'Pacchetto ' + packN + ' lezioni', importo: packP }); }
          pl.list.forEach(function (it) { var sl = it.s; if (it.f) { addBooking(s2, sl, 'gratuita'); } else if (s2.credits > 0) { s2.credits -= 1; addBooking(s2, sl, 'credito'); } else { addBooking(s2, sl, 'carta'); s2.payments.push({ quando: ML.today(), voce: sl.titolo, importo: ML.prezzi.lezione }); } });
          ML.save(s2); picked = {}; closeModal(); drawWeek(); cart(); w.toast('Settimana prenotata. Trovi tutto nella tua area.');
        });
      });
    });
    drawWeek(); cart();
  }

  // ---------- esposto alle altre pagine ----------
  w.MLB = { GIORNI: GIORNI, fmt: fmt, fmtY: fmtY, at: at, closed: closed, hoursTo: hoursTo, cancel: cancel, pro: pro, corso: corso, add: add, monday: monday, mbsrSlots: mbsrSlots, singSlots: singSlots, percMeetings: percMeetings, seats: seats, hash: hash, esc: esc, eur: eur, nowSim: nowSim, openModal: openModal, closeModal: closeModal };
})();
