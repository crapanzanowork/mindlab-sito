#!/usr/bin/env node
// MindLab · generatore del sito. Uso: node build.js  → scrive tutto in docs/ (la cartella che GitHub Pages pubblica).
// Dati in src/data/*.js, stile in src/css, script in src/js, immagini e font in src/assets.
const fs = require('fs'), path = require('path');
const ROOT = __dirname, SRC = path.join(ROOT, 'src'), OUT = path.join(ROOT, 'docs');
const site = require('./src/data/site');
const pros = require('./src/data/pros');
const { corsi, settimana, edizioniPercorsi } = require('./src/data/corsi');
const blog = require('./src/data/blog');
const MARK = fs.readFileSync(path.join(SRC, 'assets/mark-path.txt'), 'utf8').trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = n => `${n} €`;
const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const proBy = id => pros.find(p => p.id === id);
const corsoBy = s => corsi.find(c => c.slug === s);
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const dataIt = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI[m - 1]} ${y}`; };

// ---------- pezzi riusabili ----------
const MESI_IT = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const W2 = (() => { const a = new Date(site.primaSettimana + 'T12:00:00'); a.setDate(a.getDate() + 7); const b = new Date(a); b.setDate(b.getDate() + 5); return a.getDate() + (a.getMonth() === b.getMonth() ? '' : ' ' + MESI_IT[a.getMonth()]) + '–' + b.getDate() + ' ' + MESI_IT[b.getMonth()]; })();
// anteprima riservata: il codice sta in _privato/codice-anteprima.txt (non va su GitHub); nel sito resta solo il suo hash
const GATE_CODE = (() => { try { return fs.readFileSync(path.join(__dirname, '_privato', 'codice-anteprima.txt'), 'utf8').trim(); } catch (e) { return ''; } })();
const GATE_HASH = GATE_CODE ? require('crypto').createHash('sha256').update('mindlab-bozza:' + GATE_CODE.toLowerCase()).digest('hex') : 'nessuno';
const ARR = `<svg class="arr" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 7h19M14 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const markSvg = (cls = '') => `<svg class="mark ${cls}" viewBox="56 56 1488 1488" aria-hidden="true"><circle cx="800" cy="800" r="690" mask="url(#mkm)"/></svg>`;
const ringSvg = (cls = 'ring-deco', style = '', gap = 28, rot = 100) => `<svg class="${cls}" style="${style}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="90" pathLength="100" stroke-dasharray="${100 - gap} ${gap}" transform="rotate(${rot} 100 100)"/></svg>`;
const breath = (label = true) => `<div class="breath" role="img" aria-label="Cerchi che si espandono e si restringono, al ritmo del respiro"><i></i><i></i><i></i><i></i>${label ? '<div class="breath-label" aria-hidden="true"><span class="b-in">Inspira</span></div>' : ''}</div>`;
const avatarOf = (p, big = false) => p.foto
  ? `<img src="__R__assets/img/${p.foto}" alt="${esc(p.nome)}, ${esc(p.ruolo)} (immagine di prova)" loading="lazy" width="640" height="640">`
  : `<div class="avatar" role="img" aria-label="Ritratto di ${esc(p.nome)}: immagine in arrivo"><span>${esc(p.nome[0])}</span></div>`;
const mini = p => p.foto ? `<span class="mini"><img src="__R__assets/img/${p.foto}" alt="" width="60" height="60"></span>` : `<span class="mini" aria-hidden="true">${esc(p.nome[0])}</span>`;

const proCard = (p, style = '') => `<article class="pro-card rv" style="${style}"><a class="stack" href="__R__professionisti/${p.id}.html" style="--s:.9rem;display:block">
  <div class="pro-photo">${avatarOf(p)}<span class="tag-ex">Profilo di esempio</span></div>
  <div style="margin-top:14px"><h3 class="t-h3">${esc(p.nome)}</h3><p class="t-small muted">${esc(p.ruolo)}</p><p class="t-small" style="margin-top:6px">${esc(p.focus)}</p></div></a></article>`;
const courseCard = (c, theme = '', style = '') => `<article class="card course-card ${theme}" style="${style}"><a class="card-link" href="__R__${c.slug === 'mbsr' ? 'mbsr.html' : 'corsi/' + c.slug + '.html'}" aria-label="${esc(c.nome)}"></a>
  <div><h3 class="t-h3">${esc(c.nome)}</h3><p class="t-small ${theme ? '' : 'muted'}" style="margin-top:4px">${esc(c.sottotitolo)}</p></div>
  <div><p class="t-small">${esc(c.tagline)}</p><div class="pills" style="margin-top:14px"><span class="pill">${esc(c.durata)}</span>${c.stato === 'prossimamente' ? '<span class="pill sage">Prossimamente</span>' : '<span class="pill sage">Prima lezione gratuita</span>'}</div>
  <p class="price" style="margin-top:14px">${eur(c.prezzo)} <span class="t-small muted" style="font-weight:400">${esc(c.prezzoNota)}</span></p>
  <a class="btn ${theme === 'dark' ? 'btn-ember' : 'btn-ink'} course-cta" href="__R__${ctaFor(c)[0]}">${ctaFor(c)[1]}${ARR}</a></div></article>`;
const postCard = b => `<article class="post-card rv"><a class="card-link" href="__R__blog/${b.slug}.html" aria-label="${esc(b.titolo)}"></a>
  <div class="pills"><span class="pill">${esc(b.cat)}</span>${b.accesso === 'iscritti' ? '<span class="pill solid lock">Per iscritti</span>' : ''}</div>
  <h3 class="t-h3">${esc(b.titolo)}</h3><p class="muted t-small">${esc(b.estratto)}</p><p class="t-small" style="margin-top:auto">${dataIt(b.data)} · ${b.min} min</p></article>`;
const btn = (href, txt, cls = 'btn-ink') => `<a class="btn ${cls}" href="${href}">${txt}${ARR}</a>`;
const ctaBand = () => `<section class="section on-sage"><div class="wrap center stack" style="--s:1.6rem"><p class="t-caps">Pronto quando vuoi</p><h2 class="t-display balance mx" style="max-width:16ch">Scegli la tua <span class="it">settimana</span>.</h2><p class="t-lead mx measure-s">Un corso intero o una lezione alla volta: componi quello che ti serve, quando ti serve.</p><div class="pills" style="justify-content:center"><a class="btn btn-ink" href="__R__settimana.html">Componi la settimana${ARR}</a><a class="btn btn-ghost" href="__R__corsi.html">Vedi tutti i corsi</a></div></div></section>`;

// ---------- pagina ----------
const pages = [];
function addPage(p) { pages.push(p); }
function render(p) {
  const depth = p.out.split('/').length - 1;
  const R = depth ? '../'.repeat(depth) : '';
  const fix = s => s.replace(/__R__/g, R);
  const title = p.title ? `${p.title} · MindLab` : 'MindLab · Uno spazio per fermarsi';
  const desc = p.desc || site.descrizione;
  const isHome = p.out === 'index.html';
  const isChat = p.out === 'conversazione.html';
  const scripts = ['data.js', 'app.js', ...(p.scripts || [])].map(s => `<script src="${R}assets/js/${s}" defer></script>`).join('\n');
  const navItems = site.nav.map(([t, h], i) => `<li><a href="${R}${h}">${esc(t).replace(/^(\S+)/, '<span class="it">$1</span>')}</a></li>`).join('');
  const head = `<!doctype html>
<html lang="it" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#edede8">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="it_IT">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><style>html.locked body>*:not(#lockscreen):not(svg){display:none!important}html:not(.locked) #lockscreen{display:none}</style><script>try{if(localStorage.getItem('ml_gate')!=='${GATE_HASH}')document.documentElement.classList.add('locked')}catch(e){document.documentElement.classList.add('locked')}</script>
<link rel="preload" href="${R}assets/fonts/HankenGrotesk-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${R}assets/fonts/InstrumentSerif-Italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" type="image/svg+xml" href="${R}assets/favicon.svg">
<link rel="stylesheet" href="${R}assets/css/mindlab.css">
<script>document.documentElement.classList.remove('no-js')</script>
${p.schema ? `<script type="application/ld+json">${JSON.stringify(p.schema)}</script>` : ''}
</head>`;
  const header = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><mask id="mkm" maskUnits="userSpaceOnUse" x="56" y="56" width="1488" height="1488"><rect x="56" y="56" width="1488" height="1488" fill="#fff"/><path d="${MARK}" fill="#000" fill-rule="evenodd"/></mask></defs></svg>
<a class="skip" href="#main">Vai al contenuto</a>
<header class="site-head" id="head"><a class="logo" href="${R}index.html" aria-label="MindLab, home">${markSvg()}<span>Mind<span class="it">Lab</span></span></a>
<div class="head-r"><a class="btn btn-ember head-cta" href="${R}calendario.html#mbsr">Scegli la prossima data</a><a class="head-link" href="${R}accedi.html">Accedi / Registrati</a>
<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="overlay" aria-label="Apri il menù"><span class="sr">Menù</span><svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" pathLength="100" stroke-dasharray="72 28" transform="rotate(100 100 100)"/><circle class="dot" cx="100" cy="100" r="22" stroke="none"/></svg></button></div></header>
<a class="date-fab btn btn-ember" href="${R}calendario.html#mbsr">Scegli la data</a>
<div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-label="Menù principale" aria-hidden="true">
<div class="ov-top"><a class="logo" href="${R}index.html">${markSvg()}<span>Mind<span class="it">Lab</span></span></a><button class="ov-close" id="menuClose"><span>Chiudi</span><span aria-hidden="true">✕</span></button></div>
<ul class="ov-list" id="ovList">${navItems}</ul>
<div class="ov-side" aria-hidden="true"><svg viewBox="0 0 200 200"><circle class="ringc" id="ovRing" cx="100" cy="100" r="90" pathLength="100" stroke-dasharray="72 28" transform="rotate(100 100 100)"/><circle class="ember-dot" id="ovDot" cx="100" cy="100" r="9"/></svg></div>
<div class="ov-foot"><span>Uno spazio per fermarsi.</span><span><a href="${R}accedi.html">Accedi</a> · <a href="${R}faq.html">Domande frequenti</a> · <a href="${R}contatti.html">Contatti</a></span></div></div>`;
  const foot = `<footer class="foot"><div class="wrap"><p class="big" aria-hidden="true">Mind<span class="it">Lab</span></p>
<div class="cols" style="margin-top:clamp(30px,5vw,70px)">
<div class="stack" style="--s:1rem"><p class="t-lead measure-s">Un corso per te: per sciogliere ciò che pesa e stare bene con te stesso. Sei professionisti, un solo metodo.</p>
<form class="chat-form-mini" data-form="newsletter" style="display:flex;gap:8px;max-width:420px;margin-top:18px"><label class="sr" for="nl">La tua email</label><input class="input" id="nl" type="email" required placeholder="La tua email per le pillole" style="background:transparent;color:inherit;border-color:rgba(233,235,228,.3)"><button class="btn btn-ember" type="submit" style="padding:.7em 1.3em">Iscrivimi</button></form></div>
<div><h4>Percorsi</h4><ul><li><a href="${R}mbsr.html">MBSR · 8 settimane</a></li><li><a href="${R}corsi.html">Tutti i corsi</a></li><li><a href="${R}settimana.html">Componi la settimana</a></li><li><a href="${R}calendario.html">Calendario</a></li><li><a href="${R}gruppi.html">Aziende e squadre</a></li></ul></div>
<div><h4>MindLab</h4><ul><li><a href="${R}metodo.html">Il metodo</a></li><li><a href="${R}professionisti.html">Professionisti</a></li><li><a href="${R}blog.html">Pillole</a></li><li><a href="${R}conversazione.html">Parla con noi</a></li><li><a href="${R}verifica.html">Verifica un attestato</a></li></ul></div>
<div><h4>Informazioni</h4><ul><li><a href="${R}faq.html">Domande frequenti</a></li><li><a href="${R}contatti.html">Contatti</a></li><li><a href="${R}termini.html">Termini di vendita</a></li><li><a href="${R}privacy.html">Privacy</a></li><li><a href="${R}cookie.html">Cookie</a></li></ul></div></div>
<div class="legal"><span>© 2026 MindLab · un progetto di ${esc(site.azienda.nome)} · P.IVA ${site.azienda.piva} (dati provvisori)</span><span>La mindfulness non sostituisce cure mediche o psicologiche.</span></div></div></footer>`;
  const fab = (isHome || isChat) ? '' : `<div class="sticky-cta"><a class="chat-fab" href="${R}conversazione.html"><span class="breath" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Parla con noi</span></a></div>`;
  const banner = (isHome || isChat) ? '' : '<div class="banner-ex" role="note">Bozza · dati di esempio</div>';
  const gate = `<div id="lockscreen" class="lockscreen" role="dialog" aria-modal="true" aria-labelledby="lockT" data-h="${GATE_HASH}"><form class="lock-box" id="lockF" autocomplete="off">${markSvg()}<p class="t-caps">Anteprima riservata</p><h1 id="lockT" class="t-h1">Mind<span class="it">Lab</span></h1><p class="muted">Il sito è in preparazione. Inserisci il codice che ti abbiamo dato.</p><label class="sr" for="lockC">Codice di accesso</label><input class="input lock-in" id="lockC" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40" placeholder="codice" required><button class="btn btn-ember" type="submit">Entra${ARR}</button><p class="lock-err" id="lockE" role="alert"></p></form></div>`;
  const body = `<body class="${p.bodyClass || ''}" data-page="${esc(p.out)}">${gate}${header}<main id="main">${fix(typeof p.body === 'function' ? p.body() : p.body)}</main>${p.noFooter ? '' : foot}${fab}${banner}<div class="toast" id="toast" role="status" aria-live="polite"></div>${scripts}</body></html>`;
  return fix(head) + fix(body);
}

// =====================================================================
// HOME (scorrimento orizzontale)
// =====================================================================
addPage({ out: 'index.html', title: '', bodyClass: 'home', noFooter: true, scripts: ['home.js'],
  schema: { '@context': 'https://schema.org', '@type': 'Organization', name: 'MindLab', description: site.descrizione },
  body: () => {
    const week = pros.map(p => `<li class="list-row"><span class="n">${GIORNI[p.giorno].slice(0, 3).toUpperCase()}</span><span>${esc(p.nome)}</span><span class="t-small muted">${p.ora}</span></li>`).join('');
    return `<div class="hz-progress" id="hzProg"></div>
<div class="hz" id="hz" tabindex="-1">
<section class="panel" data-theme="light" id="p1" aria-label="Benvenuto"><div class="panel-in"><div class="hero-grid">
 <div class="stack" style="--s:clamp(16px,3vh,30px)"><p class="t-caps sage rv">Un corso per te, per stare bene con te stesso</p>
 <h1 class="t-hero"><span class="mask"><span>Uno spazio</span></span><span class="mask"><span style="--d:.12s">per <span class="it">fermarsi</span>.</span></span></h1>
 <p class="t-lead measure-s rv" style="--d:.4s">Impari a stare con quello che senti, a lasciar andare ciò che pesa, a ritrovare il respiro. Scegli un percorso o una lezione alla volta, nei giorni che ti servono.</p>
 <div class="pills rv" style="--d:.55s;gap:12px"><a class="btn btn-ink" href="__R__calendario.html">Scopri i corsi${ARR}</a><a class="btn btn-ghost" href="__R__conversazione.html">Parla con noi</a></div>
 <p class="t-small rv" style="--d:.7s;margin-top:4px"><b>La prima lezione è gratuita</b>, in ogni corso.</p>
 <p class="scroll-cue rv" style="--d:.8s">Scorri <svg viewBox="0 0 46 14" aria-hidden="true"><path d="M1 7h42M37 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></p></div>
 <div class="orb">${ringSvg('ring-deco', '', 24, 100)}${breath()}</div></div></div></section>

<section class="panel on-dark" data-theme="dark" id="p2" aria-label="MBSR"><div class="panel-in"><div class="split" style="align-items:center">
 <div class="stack" style="--s:clamp(14px,2.6vh,26px)"><p class="t-caps sage">Il percorso di punta</p><h2 class="t-display">MBSR.<br><span class="it">Otto settimane.</span></h2>
 <p class="t-lead measure-s">Il protocollo di riduzione dello stress basato sulla mindfulness: otto lezioni di due ore, in sei orari diversi ogni settimana. Se ne salti una, la recuperi.</p>
 <div class="weeks" style="max-width:520px">${Array.from({ length: 8 }, (_, i) => `<div><i class="${i === 0 ? 'now' : ''}" style="background:${i === 0 ? '' : 'var(--ink)'}"></i><span>${i + 1}</span></div>`).join('')}</div>
 <div class="pills" style="gap:12px">${btn('__R__mbsr.html', 'Scopri l’MBSR', 'btn-ember')}${btn('__R__calendario.html#mbsr', 'Vedi le date', 'btn-ghost')}</div></div>
 <div class="card how-card" style="background:var(--paper-raised);color:var(--ink)"><p class="t-caps sage">Come prenoti le lezioni</p>
 <ol class="how">${[['Ti iscrivi a un’edizione', 'Otto settimane, una lezione a settimana. La prima lezione è gratuita; la prima edizione parte l’11 gennaio 2027.'], ['Ogni lezione ha la sua settimana', 'La lezione 2 si fa nella seconda settimana, la 3 nella terza, e così via.'], ['In quella settimana scegli il tuo giorno', 'La stessa lezione è disponibile in sei orari, dal lunedì al sabato, con sei insegnanti diversi.']].map(([t, d], i) => `<li><b>${i + 1}</b><span><b class="h">${t}</b><br><span class="muted t-small">${d}</span></span></li>`).join('')}</ol>
 <p class="t-caps sage" style="margin-top:6px">Esempio · lezione 2, settimana del ${W2}</p>
 <ul class="list" style="--x:1">${pros.map(p => `<li><span class="n">${GIORNI[p.giorno].slice(0, 3).toUpperCase()}</span><span>${esc(p.nome)}</span><span class="t-small">${p.ora}</span></li>`).join('')}</ul>
 <p class="t-small muted">Se salti una lezione, la recuperi in un altro orario o nell’edizione dopo.</p></div></div></div></section>

<section class="panel" data-theme="light" id="p3" aria-label="Corsi"><div class="panel-in stack" style="--s:clamp(14px,2.4vh,24px)">
 <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap"><div class="stack"><p class="t-caps sage">Il catalogo</p><h2 class="t-h1">Dieci modi per <span class="it">cominciare</span>.</h2></div>${btn('__R__corsi.html', 'Tutti i corsi', 'btn-ghost')}</div>
 <p class="rail-hint"><svg width="40" height="12" viewBox="0 0 40 12" aria-hidden="true"><path d="M1 6h36M31 1l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Scorri le schede</p>
 <div class="rail" style="padding-bottom:10px">${corsi.slice(0, 6).map((c, i) => courseCard(c, i === 0 ? 'dark' : i === 3 ? 'sage' : '')).join('')}</div></div></section>

<section class="panel on-mist" data-theme="light" id="p4" aria-label="Professionisti"><div class="panel-in stack" style="--s:clamp(14px,2.4vh,24px)">
 <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap"><div class="stack"><p class="t-caps sage">Il gruppo</p><h2 class="t-h1">Sei professionisti, <span class="it">un solo metodo</span>.</h2></div>${btn('__R__professionisti.html', 'Conosci il team', 'btn-ghost')}</div>
 <div class="rail" style="padding-bottom:10px">${pros.map(proCard).join('')}</div></div></section>

<section class="panel on-sage" data-theme="sage" id="p5" aria-label="Come funziona"><div class="panel-in"><div class="split" style="align-items:center">
 <div class="stack"><p class="t-caps">Come funziona</p><h2 class="t-display">Prenoti da solo. <span class="it">Tutto il resto è automatico.</span></h2>
 <p class="t-lead measure-s">Scegli, paga, ricevi la mail con il link alla videochiamata. Un promemoria prima di ogni lezione, e alla fine un attestato con il suo codice.</p></div>
 <ol class="list" style="--x:1">${[['Scegli', 'Un corso intero o lezioni singole, dal catalogo o dalla settimana.'], ['Prenota', 'Occupi i tuoi slot nella tua area personale.'], ['Pratica', 'Entri dal link che ti arriva per mail, da dove vuoi.'], ['Attestato', 'A fine corso, con un codice verificabile.']].map(([t, d], i) => `<li><span class="n">0${i + 1}</span><span><b>${t}.</b> ${d}</span><span></span></li>`).join('')}</ol></div></div></section>

<section class="panel" data-theme="light" id="p6" aria-label="Pillole"><div class="panel-in stack" style="--s:clamp(14px,2.4vh,24px)">
 <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap"><div class="stack"><p class="t-caps sage">Pillole</p><h2 class="t-h1">Letture brevi, <span class="it">per tornare in sé</span>.</h2></div>${btn('__R__blog.html', 'Tutte le pillole', 'btn-ghost')}</div>
 <div class="grid g3" style="--g:18px">${blog.slice(0, 3).map(postCard).join('')}</div></div></section>

<section class="panel on-dark" data-theme="dark" id="p7" aria-label="Pre-iscrizione"><div class="panel-in"><div class="split" style="align-items:center">
 <div class="stack"><p class="t-caps sage">Si parte a gennaio</p><h2 class="t-display">La prima edizione parte <span class="it">a gennaio</span>.</h2>
 <p class="t-lead measure-s">Si comincia lunedì 11 gennaio 2027. Lascia la tua email: ti avvisiamo quando si aprono le iscrizioni e ti teniamo un posto.</p></div>
 <form class="stack" data-form="preiscrizione" style="--s:.8rem"><div class="field"><label for="hn">Nome</label><input class="input" id="hn" name="nome" required autocomplete="given-name"></div><div class="field"><label for="he">Email</label><input class="input" id="he" name="email" type="email" required autocomplete="email"></div>
 <label class="check"><input type="checkbox" required><span>Acconsento al trattamento dei dati per essere ricontattato (<a class="ulink" href="__R__privacy.html">informativa</a>).</span></label>
 <button class="btn btn-ember" type="submit">Tienimi un posto${ARR}</button></form></div>
 <p class="t-small muted" style="margin-top:28px;display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between"><span>© 2026 MindLab · un progetto di ${esc(site.azienda.nome)} (dati provvisori)</span><span><a class="ulink" href="__R__faq.html">Domande</a> · <a class="ulink" href="__R__contatti.html">Contatti</a> · <a class="ulink" href="__R__privacy.html">Privacy</a> · <button class="ulink" id="vertToggle" type="button">Scorri in verticale</button></span></p></div></section>
</div>
<nav class="hz-nav" id="hzNav" aria-label="Sezioni della pagina"><span class="hz-count" id="hzCount">01 / 07</span><div class="hz-dots" id="hzDots">${Array.from({ length: 7 }, (_, i) => `<button type="button" aria-label="Sezione ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}></button>`).join('')}</div>
<div class="hz-arrows"><button type="button" id="hzPrev" aria-label="Sezione precedente"><svg viewBox="0 0 18 18"><path d="M11 3L5 9l6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" id="hzNext" aria-label="Sezione successiva"><svg viewBox="0 0 18 18"><path d="M7 3l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></nav>`;
  } });

// =====================================================================
// MBSR
// =====================================================================
const mbsr = corsoBy('mbsr');
addPage({ out: 'mbsr.html', title: 'MBSR · otto settimane', desc: mbsr.tagline, scripts: [],
  schema: { '@context': 'https://schema.org', '@type': 'Course', name: 'MBSR · Mindfulness-Based Stress Reduction', description: mbsr.tagline, provider: { '@type': 'Organization', name: 'MindLab' } },
  body: () => `
<section class="page-top on-dark"><div class="wrap"><div class="split" style="align-items:center">
 <div class="stack" style="--s:1.4rem"><p class="crumbs"><a href="__R__index.html">Home</a> / <a href="__R__corsi.html">Corsi</a> / MBSR</p><p class="t-caps sage">Il percorso di punta</p><h1 class="t-display">MBSR.<br><span class="it">Otto settimane</span> per stare con lo stress.</h1>
 <p class="t-lead measure-s">${esc(mbsr.descr[0])}</p><div class="pills" style="gap:12px">${btn('__R__calendario.html#mbsr', 'Scegli l’edizione', 'btn-ember')}${btn('__R__preiscrizione.html?corso=mbsr', 'Colloquio gratuito', 'btn-ghost')}</div></div>
 <div style="position:relative;display:grid;place-items:center;min-height:320px">${ringSvg('ring-deco spin-slow', 'width:100%;max-width:520px;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)', 24)}${breath()}</div></div></div></section>

<section class="section tight"><div class="wrap"><div class="grid g4" style="--g:0">
 ${[['8', 'lezioni di gruppo'], ['2 h', 'ogni lezione'], ['6', 'orari ogni settimana, dal lunedì al sabato'], [eur(site.prezzi.mbsr), 'percorso completo (prezzo di esempio)']].map(([n, t]) => `<div class="rv" style="padding:22px 0;border-top:1px solid var(--line);padding-right:24px"><p class="stat">${n}</p><p class="t-small muted" style="margin-top:8px">${t}</p></div>`).join('')}</div></div></section>

<section class="section"><div class="wrap split"><div class="stack"><p class="t-caps sage">Come funziona</p><h2 class="t-h1">Una lezione a settimana, <span class="it">sei orari</span> a scelta.</h2></div>
 <div class="prose stack" style="--s:1.1rem"><p>${esc(mbsr.descr[1])}</p><p>${esc(mbsr.descr[2])}</p>
 <div class="note"><b>Recuperi.</b> Se perdi una lezione puoi recuperarla nello stesso orario o in un altro, nell’edizione successiva, entro ${site.regole.recuperoMesi} mesi.</div>
 <div class="note"><b>Prima di iniziare.</b> ${esc(mbsr.note)}</div></div></div></section>

<section class="section on-mist"><div class="wrap"><p class="t-caps sage">Il programma</p><h2 class="t-h1" style="margin:12px 0 36px">Otto settimane, <span class="it">un tema alla volta</span>.</h2>
 <ol class="timeline">${mbsr.programma.map(([t, d], i) => `<li class="${i === 0 ? 'now' : ''} rv"><p class="t-caps sage">Settimana ${i + 1}</p><h3 class="t-h3" style="margin:4px 0">${esc(t)}</h3><p class="muted measure-s">${esc(d)}</p></li>`).join('')}</ol></div></section>

<section class="section"><div class="wrap"><p class="t-caps sage">La settimana tipo</p><h2 class="t-h1" style="margin:12px 0 30px">Ogni lezione, <span class="it">sei volte</span>.</h2>
 <p class="rail-hint">Scorri per vedere tutta la settimana</p>
 <div class="rail">${pros.map(p => `<article class="card" style="width:min(70vw,240px)"><p class="t-caps sage">${GIORNI[p.giorno]}</p><p class="stat" style="font-size:2.4rem">${p.ora}</p><div style="display:flex;align-items:center;gap:10px">${mini(p)}<span><b>${esc(p.nome)}</b><br><span class="t-small muted">${esc(p.focus)}</span></span></div></article>`).join('')}</div>
 <p class="t-small muted" style="margin-top:6px">Gli orari sono di esempio. ${site.regole.paragrafoChiusura}</p></div></section>

<section class="section on-raised"><div class="wrap split"><div class="stack"><p class="t-caps sage">Per chi è</p><h2 class="t-h1">Se ti riconosci <span class="it">in una di queste</span>.</h2></div>
 <ul class="list">${mbsr.perChi.map((t, i) => `<li><span class="n">0${i + 1}</span><span class="t-lead">${esc(t)}</span><span></span></li>`).join('')}</ul></div></section>
${ctaBand()}` });

// =====================================================================
// CATALOGO
// =====================================================================
addPage({ out: 'corsi.html', title: 'Corsi e percorsi', desc: 'Tutti i corsi MindLab: MBSR, Mindfulness Sitting, counselling, mindset per sportivi, pre-gravidanza e mini-corsi per la quotidianità.', scripts: ['catalogo.js'],
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Corsi</p><p class="t-caps sage">Il catalogo</p><h1 class="t-hero">Corsi e <span class="it">percorsi</span>.</h1><p class="t-lead measure">Un percorso intero o una lezione alla volta: l’MBSR è il cuore, tutto il resto serve a farti trovare il tuo ritmo.</p></div></section>
<section class="section tight"><div class="wrap"><div class="tabs" role="tablist" aria-label="Filtra per tipo" id="filters">${[['tutti', 'Tutti'], ['percorsi', 'Percorsi'], ['sitting', 'Sitting'], ['quotidiano', 'Vita quotidiana'], ['sport', 'Sport'], ['individuale', 'Individuale'], ['giovani', 'Giovani']].map(([k, t], i) => `<button class="tab" role="tab" data-f="${k}" aria-selected="${i === 0}">${t}</button>`).join('')}</div>
 <div class="grid g3" id="catalog" style="--g:20px">${corsi.map((c, i) => `<div class="cat-item rv" data-cat="${c.cat}">${courseCard(c, i === 0 ? 'dark' : '', 'width:auto;min-height:420px')}</div>`).join('')}</div></div></section>
<section class="section on-mist"><div class="wrap split"><div class="stack"><p class="t-caps sage">Lezioni singole</p><h2 class="t-h1">Ogni settimana, <span class="it">una lezione a scelta</span>.</h2><p class="t-lead measure-s">I mini-corsi si comprano a lezione. Componi la tua settimana con quello che ti serve.</p>${btn('__R__settimana.html', 'Componi la settimana', 'btn-ink')}</div>
 <ul class="list">${settimana.map(s => `<li><span class="n">${GIORNI[s.giorno].slice(0, 3).toUpperCase()}</span><span><b>${esc(s.titolo)}</b> <span class="muted t-small">· ${proBy(s.pro).nome}</span></span><span class="t-small">${s.ora}</span></li>`).join('')}</ul></div></section>
${ctaBand()}` });

// =====================================================================
// PAGINE CORSO
// =====================================================================
const ctaFor = c => c.slug === 'mbsr' ? ['calendario.html#mbsr', 'Scegli l’edizione'] : c.stato === 'prossimamente' ? [`preiscrizione.html?corso=${c.slug}`, 'Avvisami quando parte'] : c.tipo === 'individuale' ? ['calendario.html#colloqui', 'Prenota un colloquio'] : (c.slug === 'mindset-sportivi' || c.slug === 'mindset-pre-gravidanza') ? ['calendario.html#percorsi', 'Vedi le date'] : ['settimana.html', 'Aggiungi alla settimana'];
corsi.forEach(c => {
  if (c.slug === 'mbsr') return;
  const [href, label] = ctaFor(c);
  addPage({ out: `corsi/${c.slug}.html`, title: c.nome, desc: c.tagline,
    schema: { '@context': 'https://schema.org', '@type': 'Course', name: c.nome, description: c.tagline, provider: { '@type': 'Organization', name: 'MindLab' } },
    body: () => `<section class="page-top ${c.cat === 'sport' ? 'on-dark' : 'on-mist'}"><div class="wrap split" style="align-items:center"><div class="stack" style="--s:1.3rem"><p class="crumbs"><a href="__R__index.html">Home</a> / <a href="__R__corsi.html">Corsi</a> / ${esc(c.nome)}</p><p class="t-caps sage">${esc(c.sottotitolo)}</p><h1 class="t-hero" style="font-size:clamp(40px,7vw,110px)">${esc(c.nome)}</h1><p class="t-lead measure-s">${esc(c.tagline)}</p>
 <div class="pills"><span class="pill">${esc(c.durata)}</span><span class="pill">${esc(c.formato)}</span>${c.stato === 'prossimamente' ? '<span class="pill sage">Prossimamente</span>' : ''}</div>
 <p class="price" style="font-size:1.9rem">${eur(c.prezzo)} <span class="t-small muted" style="font-weight:400">${esc(c.prezzoNota)} · prezzo di esempio</span></p><div class="pills" style="gap:12px">${btn('__R__' + href, label, 'btn-ink')}${btn('__R__conversazione.html', 'Non so se fa per me', 'btn-ghost')}</div></div>
 <div style="display:grid;place-items:center;min-height:280px">${breath(false)}</div></div></section>
<section class="section"><div class="wrap split"><div class="stack"><p class="t-caps sage">Di cosa si tratta</p><h2 class="t-h1">Cosa <span class="it">troverai</span>.</h2></div><div class="prose">${c.descr.map(p => `<p>${esc(p)}</p>`).join('')}${c.note ? `<div class="note" style="margin-top:1.4em">${esc(c.note)}</div>` : ''}</div></div></section>
<section class="section on-raised"><div class="wrap split"><div class="stack"><p class="t-caps sage">Per chi è</p><h2 class="t-h1">Può fare <span class="it">per te</span> se.</h2></div><ul class="list">${c.perChi.map((t, i) => `<li><span class="n">0${i + 1}</span><span class="t-lead">${esc(t)}</span><span></span></li>`).join('')}</ul></div></section>
<section class="section"><div class="wrap"><p class="t-caps sage">Il percorso</p><h2 class="t-h1" style="margin:12px 0 30px">Passo <span class="it">dopo passo</span>.</h2><div class="rail">${c.programma.map(([t, d], i) => `<article class="card" style="width:min(74vw,290px);min-height:230px"><span class="num" style="font-family:var(--font-serif);font-style:italic;font-size:2.6rem;color:var(--sage-ink)">${i + 1}</span><h3 class="t-h3">${esc(t)}</h3><p class="muted t-small">${esc(d)}</p></article>`).join('')}</div></div></section>
<section class="section on-mist"><div class="wrap"><p class="t-caps sage">Chi ti accompagna</p><h2 class="t-h1" style="margin:12px 0 30px">${c.docenti.length > 1 ? 'I professionisti' : 'La professionista'}.</h2><div class="rail">${c.docenti.map(id => proCard(proBy(id))).join('')}</div></div></section>
<section class="section"><div class="wrap split"><div class="stack"><p class="t-caps sage">Prenotare</p><h2 class="t-h1">Tre passi, <span class="it">nessuna burocrazia</span>.</h2></div><ol class="list">${[['Scegli', 'Il corso o le lezioni singole.'], ['Paga e prenota', 'Occupi i tuoi slot dalla tua area personale. ' + site.regole.paragrafoChiusura], ['Ricevi il link', 'Arriva per mail, con un promemoria prima di ogni lezione.']].map(([t, d], i) => `<li><span class="n">0${i + 1}</span><span><b>${t}.</b> ${d}</span><span></span></li>`).join('')}</ol></div></section>
<section class="section tight on-raised"><div class="wrap"><p class="t-caps sage">Ti potrebbe interessare</p><div class="rail" style="margin-top:20px">${corsi.filter(x => x.slug !== c.slug).slice(0, 5).map(x => courseCard(x)).join('')}</div></div></section>
${ctaBand()}` });
});

// =====================================================================
// SETTIMANA / CALENDARIO (contenuti dinamici, script booking.js)
// =====================================================================
addPage({ out: 'settimana.html', title: 'Componi la tua settimana', desc: 'Scegli le lezioni singole che preferisci e componi la tua settimana di mindfulness.', scripts: ['booking.js'], bodyClass: 'p-settimana',
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Settimana</p><p class="t-caps sage">Lezioni singole</p><h1 class="t-hero">Componi la tua <span class="it">settimana</span>.</h1><p class="t-lead measure">Scegli il giorno sul calendario del mese, oppure filtra per le lezioni che ti interessano. La prima lezione di ogni corso è gratuita, poi paghi solo quelle che prenoti.</p></div></section>
<section class="section tight"><div class="wrap dash dash-w">
 <div><div class="weekbar"><button class="btn btn-ghost" id="wPrev" type="button">← Mese prima</button><b id="wLabel" aria-live="polite"></b><button class="btn btn-ghost" id="wNext" type="button">Mese dopo →</button></div>
 <div class="chips" id="wChips" role="group" aria-label="Filtra per lezione"></div>
 <div class="cal" id="wGrid"></div>
 <div class="dayview" id="wDay" aria-live="polite"></div>
 <p class="t-small muted" style="margin-top:10px">${site.regole.paragrafoChiusura} Prezzi di esempio.</p></div>
 <aside class="cart" aria-label="La tua settimana"><p class="t-caps" style="color:var(--on-dark-muted)">La tua settimana</p><ul id="cartList"><li class="muted t-small">Nessuna lezione scelta.</li></ul>
 <div><p class="t-small" style="color:var(--on-dark-muted)">Totale</p><p class="tot" id="cartTot">0 €</p><p class="t-small" id="cartNote" style="color:var(--on-dark-muted)"></p></div>
 <div class="field" style="margin:0"><label for="pack" style="color:var(--on-dark-muted)">Hai crediti?</label><select class="select" id="pack"><option value="0">Pago le lezioni singole</option><option value="5">Pacchetto 5 lezioni (${eur(site.prezzi.pack5)})</option><option value="10">Pacchetto 10 lezioni (${eur(site.prezzi.pack10)})</option></select></div>
 <button class="btn btn-ember" id="cartGo" type="button" disabled>Prenota la settimana${ARR}</button></aside></div></section>
<section class="section on-mist"><div class="wrap grid g3" style="--g:20px">${[['Singola', eur(site.prezzi.lezione), 'Una lezione, quando vuoi. La prima di ogni corso è gratuita.'], ['Pacchetto 5', eur(site.prezzi.pack5), `${(site.prezzi.pack5 / 5).toFixed(0)} € a lezione, crediti utilizzabili su qualsiasi lezione singola.`], ['Pacchetto 10', eur(site.prezzi.pack10), `${(site.prezzi.pack10 / 10).toFixed(0)} € a lezione: per chi ha un ritmo regolare.`]].map(([t, p, d]) => `<article class="card rv"><p class="t-caps sage">${t}</p><p class="stat">${p}</p><p class="muted">${d}</p></article>`).join('')}</div></section>` });

addPage({ out: 'calendario.html', title: 'Calendario e prenotazioni', desc: 'Il calendario di MindLab: edizioni MBSR, lezioni singole, percorsi e colloqui individuali.', scripts: ['booking.js'], bodyClass: 'p-calendario',
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Calendario</p><p class="t-caps sage">Prenota</p><h1 class="t-hero">Il <span class="it">calendario</span>.</h1><p class="t-lead measure">Scegli il giorno in cui sei libero e prenota subito. ${site.regole.paragrafoGratis} Vuoi prima leggere tutto? <a class="ulink" href="__R__corsi.html">Sfoglia il catalogo completo</a>.</p></div></section>
<section class="section tight"><div class="wrap">
 <div class="tabs" role="tablist" aria-label="Tipo di prenotazione" id="calTabs">${[['mese', 'Tutte le date'], ['mbsr', 'MBSR'], ['settimana', 'Lezioni singole'], ['percorsi', 'Percorsi'], ['colloqui', 'Colloqui']].map(([k, t], i) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${i === 0}">${t}</button>`).join('')}</div>
 <div id="calCtl" class="weekbar"></div>
 <div id="calBody" aria-live="polite"></div>
 <div class="note" style="margin-top:28px;display:flex;gap:18px;align-items:center;flex-wrap:wrap"><span><b>Simulatore (solo bozza)</b> · Cambia la data di “oggi” per provare la regola delle 48 ore:</span><input class="input" type="date" id="demoToday" style="max-width:190px" aria-label="Data di oggi (simulata)"></div></div></section>` });

// =====================================================================
// PROFESSIONISTI
// =====================================================================
addPage({ out: 'professionisti.html', title: 'I professionisti', desc: 'Il gruppo di professionisti MindLab: insegnanti MBSR, counsellor, mindset sportivo e pre-gravidanza.',
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Professionisti</p><p class="t-caps sage">Il gruppo</p><h1 class="t-hero">Sei persone, <span class="it">un solo metodo</span>.</h1><p class="t-lead measure">Ogni professionista segue il programma allo stesso modo, e porta la sua esperienza. Le foto e i profili sono segnaposto in attesa dello shooting ufficiale.</p></div></section>
<section class="section tight"><div class="wrap"><div class="grid g3" style="--g:28px">${pros.map(p => proCard(p, 'width:auto')).join('')}</div></div></section>
<section class="section on-dark"><div class="wrap split" style="align-items:center"><div class="photo rv" style="aspect-ratio:1;max-width:540px"><img src="__R__assets/img/divisa.jpg" alt="Prototipo della divisa MindLab: casacca verde salvia con targhetta con il nome e patch con il logo" loading="lazy" width="1024" height="1024"></div>
 <div class="stack"><p class="t-caps sage">Riconoscersi</p><h2 class="t-h1">Una <span class="it">divisa</span> semplice.</h2><p class="t-lead measure-s">Verde salvia, targhetta con il nome, il logo sulla spalla. Un segno di appartenenza al gruppo, senza uniformare chi la indossa.</p><p class="t-small muted">Immagine di prova generata con AI, in attesa del campione reale.</p></div></div></section>
${ctaBand()}` });

pros.forEach(p => {
  const myCorsi = corsi.filter(c => c.docenti.includes(p.id));
  addPage({ out: `professionisti/${p.id}.html`, title: `${p.nome} · ${p.ruolo}`, desc: p.bio,
    body: () => `<section class="page-top on-mist"><div class="wrap split" style="align-items:center"><div class="pro-photo" style="max-width:460px;border-radius:999px 999px var(--r-md) var(--r-md)">${avatarOf(p)}<span class="tag-ex">Profilo di esempio</span></div>
 <div class="stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / <a href="__R__professionisti.html">Professionisti</a> / ${esc(p.nome)}</p><p class="t-caps sage">${esc(p.ruolo)}</p><h1 class="t-hero">${esc(p.nome)}</h1><p class="t-lead measure-s">${esc(p.bio)}</p>
 <blockquote class="prose" style="margin:0"><p class="it t-h2" style="line-height:1.2">«${esc(p.citazione)}»</p></blockquote><div class="pills">${p.temi.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>${btn('__R__calendario.html', 'Vedi le sue lezioni', 'btn-ink')}</div></div></section>
<section class="section"><div class="wrap"><p class="t-caps sage">I suoi corsi</p><h2 class="t-h1" style="margin:12px 0 30px">Con <span class="it">${esc(p.nome)}</span>.</h2><div class="rail">${myCorsi.map(c => courseCard(c)).join('')}</div>
 <p class="t-small muted" style="margin-top:10px">Nella settimana MBSR: ${GIORNI[p.giorno]} alle ${p.ora}.</p></div></section>${ctaBand()}` });
});

// =====================================================================
// METODO
// =====================================================================
addPage({ out: 'metodo.html', title: 'Il metodo', desc: 'Come lavoriamo: poco ma spesso, gruppi piccoli, flessibilità e gentilezza.',
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Il metodo</p><p class="t-caps sage">Il metodo</p><h1 class="t-hero">Fermarsi non è <span class="it">perdere tempo</span>.</h1><p class="t-lead measure">MindLab nasce da un’idea semplice: la pratica funziona quando entra nella settimana, non quando la sostituisce. Per questo ogni cosa è fatta per essere flessibile.</p></div></section>
<section class="section tight"><div class="wrap"><div class="grid g2" style="--g:0">${[['Poco, ma spesso', 'Dieci minuti al giorno valgono più di un’ora ogni tanto. Il programma è costruito per questo.'], ['Gruppi piccoli', 'Fino a ' + site.regole.postiPerSlot + ' persone per lezione: abbastanza per sentirsi parte di qualcosa, pochi per essere visti.'], ['Orari che si incastrano', 'Ogni lezione è proposta in più orari. Se salti, recuperi: la vita non si ferma per un corso.'], ['Gentilezza, non performance', 'Nessuno “riesce” o “fallisce”. Si pratica, si nota, si riparte.']].map(([t, d], i) => `<div class="rv" style="padding:34px 28px 34px 0;border-top:1px solid var(--line)"><p class="t-caps sage">0${i + 1}</p><h2 class="t-h2" style="margin:10px 0">${t}</h2><p class="muted measure-s">${d}</p></div>`).join('')}</div></div></section>
<section class="section on-sage"><div class="wrap split"><div class="stack"><p class="t-caps">Cosa non facciamo</p><h2 class="t-h1">Poche <span class="it">promesse</span>.</h2></div><ul class="list" style="--x:1">${['Non promettiamo di eliminare lo stress, ma di cambiare il modo di starci.', 'Non sostituiamo cure mediche o psicologiche.', 'Non vendiamo abbonamenti che si rinnovano da soli.', 'Non raccogliamo più dati di quelli che servono per prenotare.'].map((t, i) => `<li><span class="n">0${i + 1}</span><span class="t-lead">${t}</span><span></span></li>`).join('')}</ul></div></section>
<section class="section"><div class="wrap split" style="align-items:center"><div class="stack"><p class="t-caps sage">Quando prenoti</p><h2 class="t-h1">Cosa succede <span class="it">dopo</span>.</h2></div><ol class="timeline">${[['Subito', 'Ti arriva la mail di conferma con il riepilogo.'], ['24 ore prima', 'Un promemoria per te e il foglio presenze per l’insegnante.'], ['5 minuti prima', 'Il link alla videochiamata, di nuovo, nella tua casella.'], ['A fine corso', 'L’attestato, con il suo codice verificabile.']].map(([t, d], i) => `<li class="${i === 0 ? 'now' : ''}"><p class="t-caps sage">${t}</p><p class="muted">${d}</p></li>`).join('')}</ol></div></section>${ctaBand()}` });

// =====================================================================
// BLOG
// =====================================================================
addPage({ out: 'blog.html', title: 'Pillole', desc: 'Letture brevi e pratiche per tornare in sé. Alcune pillole sono riservate agli iscritti.', scripts: ['catalogo.js'],
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Pillole</p><p class="t-caps sage">Il blog, ma diverso</p><h1 class="t-hero">Pillole per <span class="it">tornare in sé</span>.</h1><p class="t-lead measure">Brevi, con una pratica in fondo. Alcune sono per tutti, altre solo per chi ha un corso attivo.</p></div></section>
<section class="section tight"><div class="wrap"><div class="tabs" id="filters" role="tablist" aria-label="Filtra le pillole">${[['tutti', 'Tutte'], ['pubblico', 'Per tutti'], ['iscritti', 'Per iscritti']].map(([k, t], i) => `<button class="tab" role="tab" data-f="${k}" aria-selected="${i === 0}">${t}</button>`).join('')}</div>
 <div class="grid g3" id="catalog" style="--g:20px">${blog.map(b => `<div class="cat-item" data-cat="${b.accesso}">${postCard(b)}</div>`).join('')}</div></div></section>${ctaBand()}` });

blog.forEach(b => {
  const a = proBy(b.autore); const locked = b.accesso === 'iscritti';
  addPage({ out: `blog/${b.slug}.html`, title: b.titolo, desc: b.estratto, scripts: ['area.js'],
    body: () => `<article class="page-top"><div class="wrap" style="max-width:860px"><p class="crumbs"><a href="__R__index.html">Home</a> / <a href="__R__blog.html">Pillole</a> / ${esc(b.cat)}</p>
 <div class="pills" style="margin-bottom:18px"><span class="pill">${esc(b.cat)}</span>${locked ? '<span class="pill solid">Per iscritti</span>' : ''}</div><h1 class="t-h1 balance">${esc(b.titolo)}</h1>
 <p class="muted" style="margin:18px 0 36px;display:flex;align-items:center;gap:10px">${mini(a)} ${esc(a.nome)} · ${dataIt(b.data)} · ${b.min} min</p>
 <div class="prose" data-lock="${locked}">${locked ? `<div class="fade-out">${b.testo.slice(0, 1).map(t => `<p>${esc(t)}</p>`).join('')}</div>
 <div class="gate" id="gate"><p class="t-h3">Questa pillola è per gli iscritti</p><p class="muted" style="color:var(--on-dark-muted);margin:8px 0 18px">Accedi alla tua area personale per leggerla per intero.</p><a class="btn btn-ember" href="__R__accedi.html?next=blog/${b.slug}.html">Accedi${ARR}</a></div>
 <div id="full" class="hide">${b.testo.map(t => t.startsWith('«') ? `<blockquote>${esc(t)}</blockquote>` : `<p>${esc(t)}</p>`).join('')}</div>` : b.testo.map(t => t.startsWith('«') ? `<blockquote>${esc(t)}</blockquote>` : `<p>${esc(t)}</p>`).join('')}</div>
 <div class="note" style="margin-top:2em"><b>Una pratica, adesso.</b> ${esc(b.pratica)}</div></div></article>
<section class="section tight on-raised"><div class="wrap"><p class="t-caps sage">Altre pillole</p><div class="grid g3" style="margin-top:20px;--g:18px">${blog.filter(x => x.slug !== b.slug).slice(0, 3).map(postCard).join('')}</div></div></section>` });
});

// =====================================================================
// CHAT A SCHERMO INTERO
// =====================================================================
addPage({ out: 'conversazione.html', title: 'Parla con noi', desc: 'Una conversazione per capire quale percorso fa per te.', bodyClass: 'chat', noFooter: true, scripts: ['chat.js'],
  body: () => `<a class="btn btn-ghost chat-back" href="__R__index.html" style="color:var(--on-dark);margin-top:56px;padding:.5em 1.2em;font-size:.85rem">← Esci</a>
<div class="chat-root" id="chatRoot"><div class="chat-stage"><div class="breath chat-orb" id="orb" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<h1 class="chat-text" id="chatText" aria-live="polite"></h1><div class="chat-reco" id="chatReco"></div><div class="chat-choices" id="chatChoices"></div></div>
<div><form class="chat-form" id="chatForm" autocomplete="off"><label class="sr" for="chatIn">Scrivi qui</label><input id="chatIn" placeholder="Oppure scrivi con parole tue" maxlength="240"><button type="submit" aria-label="Invia"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>
<p class="chat-foot">Non sono una persona né un terapeuta: ti aiuto a orientarti tra i percorsi. Versione di prova, senza intelligenza artificiale.</p></div></div>` });

// =====================================================================
// ACCESSO / AREA / DOCENTI / VERIFICA
// =====================================================================
addPage({ out: 'accedi.html', title: 'Accedi', desc: 'Entra nella tua area personale.', scripts: ['area.js'], noindex: true,
  body: () => `<section class="page-top"><div class="wrap" style="max-width:560px"><p class="t-caps sage">Area personale</p><h1 class="t-h1" style="margin:10px 0 24px">Bentornato<span class="it">/a</span>.</h1>
 <form data-form="login" class="stack" style="--s:.4rem"><div class="field"><label for="le">Email</label><input class="input" id="le" name="email" type="email" required autocomplete="email" placeholder="nome@esempio.it"></div><div class="field"><label for="ln">Come ti chiami?</label><input class="input" id="ln" name="nome" autocomplete="given-name" placeholder="Solo il nome"></div>
 <button class="btn btn-ink" type="submit">Entra${ARR}</button><p class="t-small muted" style="margin-top:12px">Versione di prova: nessuna password e nessun dato inviato. Nella versione vera ricevi un link di accesso per email.</p></form>
 <hr class="rule" style="margin:34px 0"><p class="t-small">Sei un insegnante? <a class="ulink b" href="__R__docenti.html">Vai all’area docenti</a></p></div></section>` });

addPage({ out: 'area.html', title: 'La tua area', desc: 'Le tue prenotazioni, i tuoi crediti e i tuoi attestati.', scripts: ['booking.js', 'area.js'], noindex: true, bodyClass: 'p-area',
  body: () => `<section class="page-top"><div class="wrap stack" style="--s:1rem"><p class="t-caps sage">Area personale</p><h1 class="t-h1" id="hello">Ciao.</h1><p class="muted" id="helloSub"></p></div></section>
<section class="section tight"><div class="wrap" id="areaRoot"><div class="note">Accedi per vedere la tua area. <a class="ulink b" href="__R__accedi.html">Vai all’accesso</a></div></div></section>` });

addPage({ out: 'docenti.html', title: 'Area docenti', desc: 'Le classi, i partecipanti e il foglio presenze, sempre aggiornati.', scripts: ['booking.js', 'area.js'], noindex: true, bodyClass: 'p-docenti',
  body: () => `<section class="page-top on-mist"><div class="wrap stack" style="--s:1rem"><p class="t-caps sage">Area docenti</p><h1 class="t-h1">Le tue <span class="it">classi</span>.</h1><p class="muted measure">Al posto del foglio di calcolo inviato per mail: qui vedi sempre l’elenco aggiornato. Il foglio parte comunque 24 ore prima e 5 minuti prima di ogni lezione (versione vera).</p>
 <div class="field" style="max-width:300px;margin-top:10px"><label for="whoami">Sono (simulazione)</label><select class="select" id="whoami">${pros.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select></div></div></section>
<section class="section tight"><div class="wrap" id="docRoot"></div></section>` });

addPage({ out: 'verifica.html', title: 'Verifica un attestato', desc: 'Controlla l’autenticità di un attestato MindLab inserendo il suo codice.', scripts: ['area.js'],
  body: () => `<section class="page-top"><div class="wrap" style="max-width:700px"><p class="t-caps sage">Attestati</p><h1 class="t-h1" style="margin:10px 0 18px">Verifica un <span class="it">attestato</span>.</h1><p class="muted">Ogni attestato MindLab ha un codice univoco. Inseriscilo per controllare nome, corso e data.</p>
 <form data-form="verifica" class="stack" style="--s:.6rem;margin-top:24px"><div class="field"><label for="vc">Codice</label><input class="input" id="vc" name="codice" required placeholder="ML-MBSR-26-0001" style="text-transform:uppercase" autocomplete="off"></div><button class="btn btn-ink" type="submit">Verifica${ARR}</button></form>
 <div id="vOut" aria-live="polite" style="margin-top:26px"></div><p class="t-small muted" style="margin-top:20px">Codici di prova: <span class="code">ML-MBSR-26-0001</span> · <span class="code">ML-SIT-26-0014</span></p>
 <p class="t-small muted" style="margin-top:12px">L’attestato certifica la partecipazione a un corso MindLab: non è un titolo abilitante né attribuisce crediti formativi.</p></div></section>` });

// =====================================================================
// PRE-ISCRIZIONE, GRAZIE, GRUPPI, FAQ, CONTATTI, LEGALI, 404
// =====================================================================
addPage({ out: 'preiscrizione.html', title: 'Pre-iscrizione', desc: 'Lascia il tuo contatto: ti avvisiamo quando si aprono le iscrizioni.', scripts: ['area.js'],
  body: () => `<section class="page-top"><div class="wrap split"><div class="stack" style="--s:1.2rem"><p class="t-caps sage">Pre-iscrizione</p><h1 class="t-h1">Tieni un posto, <span class="it">senza impegno</span>.</h1><p class="t-lead measure-s">Le iscrizioni online aprono a breve. Lascia il tuo contatto: ti scriviamo per primo e, per l’MBSR, fissiamo un breve colloquio gratuito.</p></div>
 <form data-form="preiscrizione" class="stack" style="--s:.4rem"><div class="field"><label for="pn">Nome</label><input class="input" id="pn" name="nome" required autocomplete="given-name"></div><div class="field"><label for="pe">Email</label><input class="input" id="pe" name="email" type="email" required autocomplete="email"></div>
 <div class="field"><label for="pc">Mi interessa</label><select class="select" id="pc" name="corso">${corsi.map(c => `<option value="${c.slug}">${esc(c.nome)}</option>`).join('')}</select></div>
 <div class="field"><label for="pm">Vuoi dirci qualcosa? (facoltativo)</label><textarea class="textarea" id="pm" name="msg"></textarea></div>
 <label class="check"><input type="checkbox" required><span>Ho letto l’<a class="ulink" href="__R__privacy.html">informativa privacy</a> e acconsento a essere ricontattato.</span></label><div style="margin-top:14px"><button class="btn btn-ink" type="submit">Invia${ARR}</button></div></form></div></section>` });

addPage({ out: 'grazie.html', title: 'Grazie', desc: 'Abbiamo ricevuto la tua richiesta.', noindex: true,
  body: () => `<section class="page-top on-sage" style="min-height:80vh;display:grid;place-items:center"><div class="wrap center stack" style="--s:1.4rem">${breath(false).replace('class="breath"', 'class="breath mx" style="--bs:140px"')}<h1 class="t-display balance mx" style="max-width:14ch">Grazie. <span class="it">A presto.</span></h1><p class="t-lead mx measure-s">Abbiamo registrato la tua richiesta. Intanto, concediti tre respiri.</p>${btn('__R__index.html', 'Torna alla home', 'btn-ink')}</div></section>` });

addPage({ out: 'gruppi.html', title: 'Aziende, scuole e squadre', desc: 'Percorsi di mindfulness su misura per aziende, scuole e società sportive.',
  body: () => `<section class="page-top on-dark"><div class="wrap stack" style="--s:1.2rem"><p class="crumbs"><a href="__R__index.html">Home</a> / Gruppi</p><p class="t-caps sage">Su misura</p><h1 class="t-hero">Per aziende, scuole <span class="it">e squadre</span>.</h1><p class="t-lead measure">Percorsi dedicati a un gruppo che già lavora o gioca insieme: stessa pratica, tempi e linguaggio pensati per il vostro contesto.</p></div></section>
<section class="section"><div class="wrap grid g3" style="--g:20px">${[['Aziende', 'Pause di pratica per team, workshop sulla gestione dello stress, cicli brevi online.'], ['Scuole', 'Incontri per studenti e docenti, in vista di esami e di momenti di passaggio.'], ['Squadre sportive', 'Mindset per atleti e staff: pressione, errore, concentrazione e routine di gara.']].map(([t, d]) => `<article class="card rv"><h2 class="t-h2">${t}</h2><p class="muted">${d}</p></article>`).join('')}</div></section>
<section class="section on-mist"><div class="wrap split"><div class="stack"><p class="t-caps sage">Come si lavora</p><h2 class="t-h1">Un <span class="it">primo incontro</span>, poi si costruisce.</h2></div><ol class="list">${[['Ascolto', 'Capiamo il contesto e l’obiettivo.'], ['Proposta', 'Formato, durata e calendario su misura.'], ['Pratica', 'Gli incontri, online, con un referente del gruppo.'], ['Verifica', 'Un confronto finale per decidere se proseguire.']].map(([t, d], i) => `<li><span class="n">0${i + 1}</span><span><b>${t}.</b> ${d}</span><span></span></li>`).join('')}</ol></div></section>
<section class="section"><div class="wrap" style="max-width:700px"><p class="t-caps sage">Scrivici</p><h2 class="t-h1" style="margin:10px 0 22px">Raccontaci il <span class="it">vostro gruppo</span>.</h2><form data-form="preiscrizione" class="stack" style="--s:.4rem"><div class="field"><label for="gn">Nome e organizzazione</label><input class="input" id="gn" name="nome" required></div><div class="field"><label for="ge">Email</label><input class="input" id="ge" name="email" type="email" required></div><div class="field"><label for="gm">Di cosa avete bisogno?</label><textarea class="textarea" id="gm" name="msg"></textarea></div><input type="hidden" name="corso" value="gruppi"><label class="check"><input type="checkbox" required><span>Ho letto l’<a class="ulink" href="__R__privacy.html">informativa privacy</a>.</span></label><div style="margin-top:14px"><button class="btn btn-ink" type="submit">Invia${ARR}</button></div></form></div></section>` });

const FAQ = [
  ['La prima lezione è davvero gratuita?', 'Sì: la prima lezione di ogni corso è gratuita, una per corso e per persona. Serve solo la registrazione. Per l’MBSR la prima lezione è gratuita; per continuare ti iscrivi all’edizione.'],
  ['Come funziona la prenotazione?', 'Scegli un corso o componi la settimana con lezioni singole, paghi online e occupi i tuoi slot dalla tua area personale. Ti arriva subito una mail di conferma.'],
  ['Posso cambiare orario?', `Sì, finché mancano più di ${site.regole.chiusuraOre} ore all’inizio. Nelle ${site.regole.chiusuraOre} ore precedenti iscrizioni e disdette sono chiuse, così l’insegnante ha un gruppo certo.`],
  ['E se salto una lezione dell’MBSR?', `La recuperi nell’edizione successiva, nello stesso orario o in un altro, entro ${site.regole.recuperoMesi} mesi.`],
  ['Come entro in videochiamata?', 'Il link ti arriva per mail 24 ore prima e di nuovo 5 minuti prima della lezione. Non serve installare niente di particolare.'],
  ['Quanto costano i corsi?', 'I prezzi sulla bozza sono di esempio. I corsi si pagano interi; le lezioni singole una per una, oppure con un pacchetto di crediti.'],
  ['Cosa sono i crediti?', 'Pacchetti da 5 o 10 lezioni, da usare su qualsiasi lezione singola. Scadono dopo un periodo che indicheremo prima dell’acquisto.'],
  ['Ricevo un attestato?', 'Sì, al termine di ogni corso. Ha un codice univoco che chiunque può verificare su questo sito. Non è un titolo abilitante.'],
  ['Serve esperienza?', 'No. Tutti i percorsi partono da zero.'],
  ['La mindfulness è una terapia?', 'No. Non sostituisce cure mediche o psicologiche. Se stai attraversando un momento difficile, parlane con il tuo medico o con un professionista.'],
  ['Che dati raccogliete?', 'Solo quelli necessari a prenotare e a inviarti le comunicazioni. Dettagli nella pagina Privacy.'],
];
addPage({ out: 'faq.html', title: 'Domande frequenti', desc: 'Prenotazioni, recuperi, pagamenti, attestati: le risposte alle domande più comuni.',
  schema: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  body: () => `<section class="page-top"><div class="wrap split"><div class="stack"><p class="t-caps sage">Domande frequenti</p><h1 class="t-h1">Quello che <span class="it">ci chiedono</span> più spesso.</h1><p class="muted measure-s">Non trovi la tua? <a class="ulink b" href="__R__contatti.html">Scrivici</a> o <a class="ulink b" href="__R__conversazione.html">parla con noi</a>.</p></div>
 <div>${FAQ.map(([q, a], i) => `<details class="faq rv" ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p class="muted">${esc(a)}</p></details>`).join('')}</div></div></section>
<style>.faq{border-top:1px solid var(--line);padding:1.2rem 0}.faq:last-child{border-bottom:1px solid var(--line)}.faq summary{cursor:pointer;list-style:none;font-size:clamp(18px,1.6vw,24px);font-weight:500;letter-spacing:-.02em;display:flex;justify-content:space-between;gap:20px}.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";font-family:var(--font-serif);font-size:1.6em;line-height:.8;transition:transform .6s var(--ease)}.faq[open] summary::after{transform:rotate(45deg)}.faq p{margin-top:.8rem;max-width:60ch}</style>` });

addPage({ out: 'contatti.html', title: 'Contatti', desc: 'Come contattare MindLab.', scripts: ['area.js'],
  body: () => `<section class="page-top"><div class="wrap split"><div class="stack" style="--s:1.2rem"><p class="t-caps sage">Contatti</p><h1 class="t-h1">Scrivici, <span class="it">rispondiamo noi</span>.</h1><dl class="kv"><div><dt>Email</dt><dd>${site.azienda.email} (esempio)</dd></div><div><dt>Azienda</dt><dd>${esc(site.azienda.nome)} · P.IVA ${site.azienda.piva} (provvisoria)</dd></div><div><dt>Orari</dt><dd>Lun–ven, 10–18 (da definire)</dd></div></dl></div>
 <form data-form="preiscrizione" class="stack" style="--s:.4rem"><div class="field"><label for="cn">Nome</label><input class="input" id="cn" name="nome" required></div><div class="field"><label for="ce">Email</label><input class="input" id="ce" name="email" type="email" required></div><div class="field"><label for="cm">Messaggio</label><textarea class="textarea" id="cm" name="msg" required></textarea></div><input type="hidden" name="corso" value="contatti"><label class="check"><input type="checkbox" required><span>Ho letto l’<a class="ulink" href="__R__privacy.html">informativa privacy</a>.</span></label><div style="margin-top:14px"><button class="btn btn-ink" type="submit">Invia${ARR}</button></div></form></div></section>` });

const legal = (out, title, intro, items) => addPage({ out, title, desc: title, noindex: true,
  body: () => `<section class="page-top"><div class="wrap" style="max-width:820px"><p class="t-caps sage">Informazioni legali</p><h1 class="t-h1" style="margin:10px 0 18px">${title}</h1><div class="note"><b>Bozza.</b> ${intro}</div><div class="prose" style="margin-top:2em">${items.map(([h, t]) => `<h2 class="t-h3" style="margin-top:1.6em">${h}</h2><p>${t}</p>`).join('')}</div></div></section>` });
legal('termini.html', 'Termini di vendita', 'Testo segnaposto: va fatto redigere o verificare da un professionista prima della messa online. Nome dell’azienda venditrice, regime fiscale e importi sono provvisori.', [
  ['Chi vende', `I corsi sono venduti da ${site.azienda.nome} (dati provvisori).`],
  ['Prenotazione e pagamento', 'La prenotazione è confermata al pagamento. Il pagamento avviene online tramite un fornitore terzo.'],
  ['Prima lezione gratuita', 'La prima lezione di ogni corso è gratuita, una per corso e per persona. Resta valida la regola delle ' + site.regole.chiusuraOre + ' ore.'],
  ['Iscrizioni e disdette', `Iscrizioni e disdette si chiudono ${site.regole.chiusuraOre} ore prima dell’inizio del corso o della lezione.`],
  ['Recuperi', `Una lezione di un corso perduta si recupera nell’edizione successiva, entro ${site.regole.recuperoMesi} mesi.`],
  ['Recesso e rimborsi', 'Da definire con un professionista, in base alla normativa sulla vendita a distanza di servizi a data fissa.'],
  ['Attestati', 'Gli attestati certificano la partecipazione, non sono titoli abilitanti e non attribuiscono crediti formativi.'],
  ['Minori', 'L’iscrizione dei minori richiede il consenso di chi esercita la responsabilità genitoriale.']]);
legal('privacy.html', 'Privacy', 'Testo segnaposto: va completato con i dati reali del titolare e verificato da un professionista.', [
  ['Titolare', `${site.azienda.nome} (dati provvisori).`],
  ['Quali dati', 'Nome, email, prenotazioni e pagamenti: solo quelli necessari al servizio. Non raccogliamo informazioni sulla salute.'],
  ['Perché', 'Per gestire iscrizioni, inviare conferme e promemoria, emettere attestati e rispondere alle richieste.'],
  ['Servizi di terze parti', 'In produzione: fornitore dei pagamenti, della posta e dell’accesso. Da elencare con precisione prima della pubblicazione.'],
  ['Su questa bozza', 'Nessun dato lasciato nei moduli viene inviato: resta nel tuo browser. Le pagine non caricano risorse da siti esterni.'],
  ['I tuoi diritti', 'Puoi chiedere accesso, correzione e cancellazione dei dati scrivendo all’indirizzo di contatto.']]);
legal('cookie.html', 'Cookie', 'Testo segnaposto.', [
  ['Cosa usiamo', 'Nessun cookie di profilazione. Il sito salva nel tuo browser (localStorage) solo le preferenze e, nella versione di prova, i dati delle prenotazioni di esempio.'],
  ['Prima della messa online', 'Se verranno aggiunti strumenti di statistica o di terze parti, questa pagina e un eventuale banner andranno aggiornati.']]);

addPage({ out: '404.html', title: 'Pagina non trovata', desc: 'Pagina non trovata', noindex: true,
  body: () => `<section class="page-top on-mist" style="min-height:90vh;display:grid;place-items:center"><div class="wrap center stack" style="--s:1.4rem"><p class="stat">404</p><h1 class="t-h1 balance mx" style="max-width:16ch">Questa pagina <span class="it">non c’è</span>. Respira, torna indietro.</h1>${btn('__R__index.html', 'Torna alla home', 'btn-ink')}</div></section>` });

// =====================================================================
// SCRITTURA
// =====================================================================
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    if (f.startsWith('._') || f === '.DS_Store') continue;
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}
// non cancelliamo mai: si sovrascrivono i file generati
fs.mkdirSync(OUT, { recursive: true });
for (const p of pages) { const f = path.join(OUT, p.out); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, render(p)); }
copyDir(path.join(SRC, 'assets/fonts'), path.join(OUT, 'assets/fonts'));
copyDir(path.join(SRC, 'assets/img'), path.join(OUT, 'assets/img'));
copyDir(path.join(SRC, 'css'), path.join(OUT, 'assets/css'));
copyDir(path.join(SRC, 'js'), path.join(OUT, 'assets/js'));
// dati per gli script del browser
const ML = { regole: site.regole, prezzi: site.prezzi, primaSettimana: site.primaSettimana, edizioniMbsr: site.edizioniMbsr,
  pros: pros.map(({ id, nome, ruolo, focus, foto, giorno, ora }) => ({ id, nome, ruolo, focus, foto, giorno, ora })),
  corsi: corsi.map(({ slug, nome, prezzo, tipo, stato, cat, tagline }) => ({ slug, nome, prezzo, tipo, stato, cat, tagline })),
  settimana, edizioniPercorsi };
fs.writeFileSync(path.join(OUT, 'assets/js/data.js'), `window.ML=${JSON.stringify(ML)};`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
// nessuna sitemap: il sito è in anteprima riservata e non va indicizzato
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'assets/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="56 56 1488 1488"><circle cx="800" cy="800" r="690" fill="#7c9880"/><path fill="#f7f7f3" fill-rule="evenodd" d="${MARK}"/></svg>`);
console.log(`ok: ${pages.length} pagine in docs/`);
