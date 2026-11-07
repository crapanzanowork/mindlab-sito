/* MindLab · area personale, area docenti, verifica attestati, pillole riservate (versione di prova).
   Tutti i dati sono di esempio e restano nel browser. */
(function () {
  'use strict';
  var d = document, w = window, ML = w.ML, B = w.MLB;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var page = d.body.getAttribute('data-page') || '';

  // ---------- pillole riservate ----------
  var gate = d.getElementById('gate'), full = d.getElementById('full');
  if (gate && full) { var u = ML.state().user; if (u) { gate.classList.add('hide'); full.classList.remove('hide'); var fo = d.querySelector('.fade-out'); if (fo) fo.classList.add('hide'); } }

  // ---------- attestati: archivio di prova ----------
  var CODICI = {
    'ML-MBSR-26-0001': { nome: 'Partecipante di esempio', corso: 'MBSR · edizione ottobre 2026', data: '2026-12-14', ore: 16 },
    'ML-SIT-26-0014': { nome: 'Partecipante di esempio', corso: 'Mindfulness Sitting · 10 lezioni', data: '2026-11-30', ore: 8 },
  };
  var vf = d.querySelector('form[data-form="verifica"]');
  if (vf) vf.addEventListener('submit', function (e) {
    e.preventDefault(); var code = vf.codice.value.trim().toUpperCase(), out = d.getElementById('vOut');
    var s = ML.state(), found = CODICI[code] || (s.certs.filter(function (c) { return c.codice === code; })[0]);
    if (found) {
      var dt = found.data.split('-');
      out.innerHTML = '<div class="cert"><p class="t-caps sage">Attestato valido</p><h2 class="t-h2">' + esc(found.corso) + '</h2><p class="muted">Rilasciato a ' + esc(found.nome) + ' · ' + (+dt[2]) + '/' + (+dt[1]) + '/' + dt[0] + (found.ore ? ' · ' + found.ore + ' ore di pratica guidata' : '') + '</p><p><span class="code">' + esc(code) + '</span></p></div>';
    } else out.innerHTML = '<div class="note"><b>Codice non trovato.</b> Controlla di averlo digitato per intero, oppure scrivici.</div>';
  });

  // =========================================================
  // AREA PERSONALE
  // =========================================================
  var root = d.getElementById('areaRoot');
  if (root && B) {
    var s = ML.state();
    if (s.user) {
      var render = function () {
        var s = ML.state(), now = B.nowSim();
        d.getElementById('hello').innerHTML = 'Ciao, <span class="it">' + esc(s.user.nome) + '</span>.';
        d.getElementById('helloSub').textContent = s.user.email + ' · versione di prova: i dati restano in questo browser.';
        var up = s.bookings.filter(function (b) { return B.at(b) >= now; }).sort(function (a, b) { return B.at(a) - B.at(b); });
        var next = up[0];
        var html = '<div class="dash"><div class="stack" style="--s:2.4rem">' +
          '<section><p class="t-caps sage">Le tue prossime lezioni</p>' + (up.length ? '<ul class="list" style="margin-top:14px">' + up.map(function (b) {
            var p = B.pro(b.pro), cl = B.closed(b), h = B.hoursTo(b);
            return '<li style="grid-template-columns:5.6rem minmax(0,1fr) auto"><span class="n">' + B.GIORNI[(new Date(b.date).getDay() + 6) % 7].slice(0, 3).toUpperCase() + ' ' + B.fmt(b.date) + '</span><span><b>' + esc(b.titolo) + '</b><br><span class="t-small muted">' + b.ora + ' · con ' + esc(p.nome) + ' · ' + (h <= 24 ? 'link in arrivo a breve' : 'link per mail 24 ore prima') + '</span></span><button class="btn btn-ghost" style="padding:.5em 1em;font-size:.85rem" data-cancel="' + esc(b.id) + '"' + (cl ? ' disabled title="Disdetta chiusa (48 ore)"' : '') + '>' + (cl ? 'Confermata' : 'Disdici') + '</button></li>';
          }).join('') + '</ul>' : '<div class="note" style="margin-top:14px">Non hai ancora lezioni prenotate. <a class="ulink b" href="calendario.html">Vai al calendario</a> o <a class="ulink b" href="settimana.html">componi la settimana</a>.</div>') + '</section>' +
          (s.recuperi && s.recuperi.length ? '<section><p class="t-caps sage">Da recuperare</p><div class="grid" style="margin-top:14px;--g:12px">' + s.recuperi.map(function (r) { return '<div class="note"><b>' + esc(r.corso) + ' · lezione ' + r.lezione + '</b> (' + esc(r.edizione) + ')<br><span class="muted">La recuperi in qualsiasi orario dell’edizione successiva, entro ' + ML.regole.recuperoMesi + ' mesi. <a class="ulink b" href="calendario.html#mbsr">Scegli l’orario</a></span></div>'; }).join('') + '</div></section>' : '') +
          '<section><p class="t-caps sage">I tuoi attestati</p>' + (s.certs.length ? '<div class="grid g2" style="margin-top:14px;--g:14px">' + s.certs.map(function (c) { return '<div class="cert"><b>' + esc(c.corso) + '</b><span class="muted t-small">' + B.fmtY(c.data) + '</span><span class="code" style="align-self:flex-start">' + esc(c.codice) + '</span><a class="ulink b t-small" href="verifica.html">Verifica pubblica</a></div>'; }).join('') + '</div>' : '<p class="muted" style="margin-top:12px">Gli attestati compaiono qui al termine di ogni corso, ciascuno con il suo codice.</p>') + '</section>' +
          '<section><p class="t-caps sage">Pagamenti</p>' + (s.payments.length ? '<div class="tbl-wrap"><table class="tbl" style="margin-top:10px"><thead><tr><th>Data</th><th>Voce</th><th>Importo</th></tr></thead><tbody>' + s.payments.map(function (p) { return '<tr><td>' + esc(p.quando) + '</td><td>' + esc(p.voce) + '</td><td>' + p.importo + ' €</td></tr>'; }).join('') + '</tbody></table></div><p class="t-small muted" style="margin-top:8px">Nella versione vera: ricevute e fatture scaricabili da qui.</p>' : '<p class="muted" style="margin-top:12px">Nessun pagamento (prova).</p>') + '</section></div>' +
          '<aside class="stack" style="--s:1.4rem"><div class="card dark"><p class="t-caps" style="color:var(--on-dark-muted)">Crediti per lezioni singole</p><p class="stat">' + s.credits + '</p><div class="pills"><button class="btn btn-ember" data-buy="5" style="padding:.6em 1.1em">+5 · ' + ML.prezzi.pack5 + ' €</button><button class="btn btn-ghost" data-buy="10" style="padding:.6em 1.1em">+10 · ' + ML.prezzi.pack10 + ' €</button></div></div>' +
          '<div class="card"><p class="t-caps sage">Prossimo appuntamento</p>' + (next ? '<p class="t-h3">' + esc(next.titolo) + '</p><p class="muted">' + B.fmtY(next.date) + ' · ' + next.ora + '</p>' : '<p class="muted">Nessuno in programma.</p>') + '</div>' +
          '<div class="card on-sage"><p class="t-caps">Pillole riservate</p><p>Il tuo accesso è attivo.</p><a class="btn btn-ink" href="blog.html" style="align-self:flex-start">Leggi le pillole</a></div>' +
          '<div class="note t-small"><b>Strumenti di prova</b><div class="pills" style="margin-top:10px"><button class="pill" data-seed>Carica dati di esempio</button><button class="pill" data-reset>Azzera i dati di prova</button><button class="pill" data-logout>Esci</button></div></div></aside></div>';
        root.innerHTML = html; if (ML.reveal) ML.reveal(root);
      };
      render();
      root.addEventListener('click', function (e) {
        var c = e.target.closest('[data-cancel]'), b = e.target.closest('[data-buy]');
        if (c && B.cancel(c.getAttribute('data-cancel'))) render();
        if (b) { var n = +b.getAttribute('data-buy'), st = ML.state(); st.credits += n; st.payments.push({ quando: ML.today(), voce: 'Pacchetto ' + n + ' lezioni', importo: n === 5 ? ML.prezzi.pack5 : ML.prezzi.pack10 }); ML.save(st); w.toast(n + ' crediti aggiunti (prova).'); render(); }
        if (e.target.closest('[data-logout]')) { var st2 = ML.state(); delete st2.user; ML.save(st2); location.href = 'index.html'; }
        if (e.target.closest('[data-reset]')) { var u = ML.state().user; ML.save({ user: u }); w.toast('Dati di prova azzerati.'); render(); }
        if (e.target.closest('[data-seed]')) {
          var st3 = ML.state(), ed = ML.edizioniMbsr[0];
          [1, 2].forEach(function (k) { var sl = B.mbsrSlots(ed, k)[k - 1]; if (!st3.bookings.some(function (x) { return x.id === sl.id; })) st3.bookings.push({ id: sl.id, kind: 'mbsr', corso: 'mbsr', titolo: sl.titolo, date: sl.date, ora: sl.ora, min: sl.min, pro: sl.pro, prezzo: 0, pagato: 'incluso', ed: ed, wk: k }); });
          st3.enrolled[ed] = true; st3.credits = Math.max(st3.credits, 3);
          st3.certs = [{ codice: 'ML-MBSR-26-0001', corso: 'MBSR · edizione ottobre 2026', data: '2026-12-14' }, { codice: 'ML-SIT-26-0014', corso: 'Mindfulness Sitting · 10 lezioni', data: '2026-11-30' }];
          st3.recuperi = [{ corso: 'MBSR', lezione: 3, edizione: 'ottobre 2026' }];
          st3.payments = [{ quando: '2026-10-02', voce: 'MBSR · edizione ottobre 2026', importo: ML.prezzi.mbsr }, { quando: '2026-11-04', voce: 'Pacchetto 5 lezioni', importo: ML.prezzi.pack5 }];
          ML.save(st3); w.toast('Dati di esempio caricati.'); render();
        }
      });
    }
  }

  // =========================================================
  // AREA DOCENTI
  // =========================================================
  var dr = d.getElementById('docRoot'), who = d.getElementById('whoami');
  if (dr && who && B) {
    var NOMI = ['Anna R.', 'Luca B.', 'Marta C.', 'Paolo G.', 'Elisa V.', 'Giorgio T.', 'Sofia M.', 'Andrea D.', 'Chiara P.', 'Matteo S.', 'Irene L.', 'Davide F.'];
    var first = ML.edizioniMbsr[0];
    var draw = function () {
      var id = who.value, p = B.pro(id), slots = [], mon = B.monday(ML.primaSettimana);
      [1, 2].forEach(function (k) { B.mbsrSlots(first, k).forEach(function (s) { if (s.pro === id) slots.push(s); }); });
      [0, 1].forEach(function (k) { B.singSlots(B.add(mon, 7 * k)).forEach(function (s) { if (s.pro === id) slots.push(s); }); });
      ML.edizioniPercorsi.forEach(function (e) { if (e.pro === id) slots.push(B.percMeetings(e)[0]); });
      slots.sort(function (a, b) { return B.at(a) - B.at(b); });
      var st = ML.state(), att = ML.read('ml_presenze') || {};
      dr.innerHTML = '<div class="dash" style="grid-template-columns:minmax(0,3fr) minmax(0,1.4fr)"><div class="stack" style="--s:1.6rem">' + (slots.length ? slots.map(function (s) {
        var n = B.hash(s.id) % 9 + 3, names = NOMI.slice(B.hash(s.id) % 4).concat(NOMI).slice(0, Math.min(n, NOMI.length));
        if (st.user && st.bookings.some(function (b) { return b.id === s.id; })) names = [st.user.nome + ' (tu, prova)'].concat(names.slice(0, n - 1));
        var t24 = new Date(B.at(s).getTime() - 24 * 36e5), t5 = new Date(B.at(s).getTime() - 5 * 6e4), f = function (x) { return x.getDate() + '/' + (x.getMonth() + 1) + ' ' + ('0' + x.getHours()).slice(-2) + ':' + ('0' + x.getMinutes()).slice(-2); };
        return '<article class="card" data-s="' + esc(s.id) + '"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><p class="t-caps sage">' + B.GIORNI[s.giorno] + ' ' + B.fmt(s.date) + ' · ' + s.ora + '</p><h3 class="t-h3">' + esc(s.titolo) + '</h3></div><span class="pill">' + names.length + ' iscritti / ' + ML.regole.postiPerSlot + '</span></div>' +
          '<ul class="list">' + names.map(function (nm, i) { var k = s.id + '|' + i; return '<li style="grid-template-columns:2.4rem 1fr auto"><span class="n">' + ('0' + (i + 1)).slice(-2) + '</span><span>' + esc(nm) + '</span><label class="check t-small"><input type="checkbox" data-att="' + esc(k) + '"' + (att[k] ? ' checked' : '') + '> presente</label></li>'; }).join('') + '</ul>' +
          '<p class="t-small muted">Foglio inviato per mail: <b>' + f(t24) + '</b> (24 ore prima) e <b>' + f(t5) + '</b> (5 minuti prima), con il link alla videochiamata.</p><div class="pills"><button class="btn btn-ghost" data-csv="' + esc(s.id) + '" style="padding:.55em 1.1em;font-size:.86rem">Esporta il foglio (CSV)</button></div></article>';
      }).join('') : '<div class="note">Nessuna lezione in programma per questa persona.</div>') + '</div>' +
        '<aside class="stack" style="--s:1.2rem"><div class="card dark"><p class="t-caps" style="color:var(--on-dark-muted)">' + esc(p.nome) + '</p><p class="t-h3">' + esc(p.ruolo) + '</p><p class="t-small" style="color:var(--on-dark-muted)">Nella settimana MBSR: ' + B.GIORNI[p.giorno] + ' alle ' + p.ora + '</p></div><div class="note"><b>Cosa succede in automatico</b><ol class="timeline" style="margin-top:14px"><li class="now"><p class="t-small"><b>Quando si iscrive qualcuno</b> compare qui e nel foglio.</p></li><li><p class="t-small"><b>24 ore prima:</b> il foglio arriva per mail.</p></li><li><p class="t-small"><b>5 minuti prima:</b> il foglio aggiornato e il link.</p></li><li><p class="t-small"><b>A fine corso:</b> l’attestato parte in automatico.</p></li></ol></div><p class="t-small muted">Nomi dei partecipanti di esempio. La versione vera mostra solo gli iscritti alle tue lezioni.</p></aside></div>';
    };
    who.addEventListener('change', draw); draw();
    dr.addEventListener('change', function (e) { var c = e.target.closest('[data-att]'); if (c) { var a = ML.read('ml_presenze') || {}; a[c.getAttribute('data-att')] = c.checked; ML.write('ml_presenze', a); } });
    dr.addEventListener('click', function (e) {
      var b = e.target.closest('[data-csv]'); if (!b) return;
      var card = b.closest('article'), rows = [['N', 'Partecipante', 'Presente']];
      card.querySelectorAll('.list li').forEach(function (li, i) { rows.push([i + 1, li.children[1].textContent, li.querySelector('input').checked ? 'sì' : '']); });
      var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })), a = d.createElement('a'); a.href = url; a.download = 'foglio-' + b.getAttribute('data-csv').replace(/[^a-z0-9]+/gi, '-') + '.csv'; d.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 500);
      w.toast('Foglio esportato.');
    });
  }
})();
