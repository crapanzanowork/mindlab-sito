/* MindLab · conversazione a schermo intero (versione guidata, senza intelligenza artificiale).
   Una domanda alla volta, parole che compaiono piano, risposte a scelta o con parole libere.
   In Fase 3 si può collegare a un modello linguistico tramite una funzione lato server (la chiave non va mai nel sito). */
(function () {
  'use strict';
  var d = document, w = window, ML = w.ML;
  var textEl = d.getElementById('chatText'), chEl = d.getElementById('chatChoices'), recoEl = d.getElementById('chatReco'), orb = d.getElementById('orb');
  var form = d.getElementById('chatForm'), inp = d.getElementById('chatIn'), stage = d.querySelector('.chat-stage');
  if (!textEl) return;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var C = function (slug) { return ML.corsi.filter(function (c) { return c.slug === slug; })[0]; };

  // ---------- albero delle domande ----------
  var N = {
    start: { t: 'Ciao. Prenditi un momento. Come stai oggi?', c: [['Stanco/a, e sempre di fretta', 'stress'], ['Agitato/a: la testa non si ferma', 'ansia'], ['Abbastanza bene, sono curioso/a', 'curioso'], ['Cerco qualcosa di preciso', 'cerca']] },
    stress: { t: 'Capisco. Preferisci un metodo completo, o una pausa ogni tanto?', c: [['Un metodo completo', ['mbsr']], ['Una pausa ogni tanto', ['sitting', 'dormire-meglio']], ['Non lo so ancora', 'tempo']] },
    tempo: { t: 'Quanto tempo puoi dedicarci, ogni settimana?', c: [['Circa due ore e mezza', ['mbsr']], ['Un’ora, più o meno', ['sitting', 'ansia-sociale']], ['Pochissimo, ma costante', ['sitting']]] },
    ansia: { t: 'Quando la senti di più?', c: [['La sera, prima di dormire', ['dormire-meglio', 'sitting']], ['Con le altre persone', ['ansia-sociale', 'counselling']], ['Prima di un esame o di una prova', ['prima-dellesame', 'concentrazione']], ['Un po’ sempre', ['mbsr', 'counselling']]] },
    curioso: { t: 'Bello. Cosa ti incuriosisce?', c: [['La mindfulness, in generale', ['sitting', 'mbsr']], ['Lo sport', ['mindset-sportivi', 'concentrazione']], ['Un figlio in arrivo', ['mindset-pre-gravidanza']], ['Un ragazzo o una ragazza', ['make-friends-with-yourself']]] },
    cerca: { t: 'Dimmelo con parole tue, oppure scegli un tema.', c: [['Sport', ['mindset-sportivi']], ['Esami', ['prima-dellesame']], ['Sonno', ['dormire-meglio']], ['Ansia sociale', ['ansia-sociale']], ['Parlare con qualcuno', ['counselling']], ['Gravidanza', ['mindset-pre-gravidanza']], ['Ragazzi', ['make-friends-with-yourself']]] },
  };
  var KEY = [
    [/(sport|gara|partita|portier|allena|atlet|calcio|squadra)/i, ['mindset-sportivi', 'concentrazione']],
    [/(esame|concorso|interrogazion|universit|studi)/i, ['prima-dellesame', 'concentrazione']],
    [/(sonno|dorm|insonn|notte|addorment)/i, ['dormire-meglio', 'sitting']],
    [/(social|imbarazz|timid|vergogn|gente|persone)/i, ['ansia-sociale', 'counselling']],
    [/(gravid|figli|bambino|mamma|papà|coppia)/i, ['mindset-pre-gravidanza']],
    [/(ragazz|figlio|adolesc|teen|scuola)/i, ['make-friends-with-yourself']],
    [/(parlare|ascolt|decidere|cambiament|lutto|separaz|counsel)/i, ['counselling']],
    [/(stress|lavoro|burnout|stanc|ansia|agitat|tension)/i, ['mbsr', 'sitting']],
    [/(medit|respir|pausa|pratic|calma)/i, ['sitting', 'mbsr']],
    [/(mbsr|otto settimane|corso completo)/i, ['mbsr']],
  ];
  var CRISI = /(suicid|farmi del male|autolesion|non voglio più vivere|voglio morire|ammazzarmi)/i;

  // ---------- scrittura lenta ----------
  var timers = [];
  function clearT() { timers.forEach(clearTimeout); timers = []; }
  function say(text, then) {
    clearT(); chEl.innerHTML = ''; recoEl.innerHTML = ''; textEl.innerHTML = '';
    orb.classList.add('think'); stage.classList.remove('reco');
    var words = text.split(' ');
    words.forEach(function (wd, i) { var s = d.createElement('span'); s.className = 'w'; s.textContent = wd; s.style.animationDelay = reduce ? '0s' : (i * 0.09 + 0.25) + 's'; textEl.appendChild(s); });
    timers.push(setTimeout(function () { orb.classList.remove('think'); if (then) then(); }, reduce ? 50 : words.length * 90 + 900));
  }
  function choices(list, fn) {
    chEl.innerHTML = '';
    list.forEach(function (c, i) { var b = d.createElement('button'); b.type = 'button'; b.className = 'ch'; b.textContent = c[0]; b.style.animationDelay = (reduce ? 0 : i * 0.12) + 's'; b.addEventListener('click', function () { fn(c[1], c[0]); }); chEl.appendChild(b); });
    var f = chEl.querySelector('button'); if (f && !reduce) setTimeout(function () { f.focus({ preventScroll: true }); }, 400);
  }
  function reco(slugs) {
    var list = slugs.map(C).filter(Boolean).slice(0, 3);
    var intro = list.length > 1 ? 'Ecco due strade possibili, tutte e due gentili.' : 'Ti consiglio questo.';
    say(intro, function () {
      recoEl.innerHTML = list.map(function (c, i) { return '<article class="card dark" style="border:1px solid rgba(233,235,228,.25);animation:wordin .9s var(--ease) ' + (i * .15) + 's both"><p class="t-caps" style="color:var(--on-dark-muted)">' + (c.stato === 'prossimamente' ? 'Prossimamente' : c.prezzo + ' € · esempio') + '</p><h2 class="t-h3">' + esc(c.nome) + '</h2><p class="t-small" style="color:var(--on-dark-muted)">' + esc(c.tagline) + '</p><a class="btn btn-ember" style="align-self:flex-start;padding:.6em 1.2em;font-size:.88rem" href="corsi/' + c.slug + '.html">Scopri</a></article>'; }).join('');
      stage.classList.add('reco');
      choices([['Ricominciamo', 'start'], ['Voglio parlare con una persona', 'umano']], function (k) { go(k); });
    });
  }
  function go(key) {
    if (key === 'umano') { say('Volentieri. Scrivici, rispondiamo noi, entro un giorno lavorativo.', function () { choices([['Vai ai contatti', 'contatti'], ['Ricominciamo', 'start']], function (k) { if (k === 'contatti') w.location.href = 'contatti.html'; else go(k); }); }); return; }
    if (Array.isArray(key)) { reco(key); return; }
    var n = N[key]; say(n.t, function () { choices(n.c, function (k) { go(k); }); });
  }
  function free(text) {
    if (CRISI.test(text)) {
      say('Mi dispiace che tu stia così. Se sei in pericolo adesso chiama il 112. Puoi anche parlare con Telefono Amico Italia, 02 2327 2327. Non sei solo/a.', function () { choices([['Parlare con una persona di MindLab', 'umano'], ['Torno indietro', 'start']], go); }); return;
    }
    for (var i = 0; i < KEY.length; i++) if (KEY[i][0].test(text)) { reco(KEY[i][1]); return; }
    say('Non sono sicuro di aver capito, e va bene così. Scegli tu da dove partire.', function () { choices(N.start.c, go); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value.trim(); if (!v) return; inp.value = ''; free(v); });
  go('start');
})();
