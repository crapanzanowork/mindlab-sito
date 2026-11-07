# MindLab · sito web (bozza Fase 1)

Sito di MindLab: più professionisti che tengono insieme gli stessi corsi (MBSR in testa), prenotazioni dalla propria area personale, blog «pillole», conversazione a schermo intero.
Questa è la **bozza pubblicabile**: tutte le pagine ci sono e funzionano, ma i dati sono **di esempio** e le prenotazioni restano nel browser. Nessun pagamento, nessuna mail, nessun dato inviato.

## Come è fatto
- `src/data/` → i contenuti: `site.js` (azienda, regole, prezzi), `corsi.js`, `pros.js` (i 6 professionisti), `blog.js` (le pillole).
- `src/css/mindlab.css` → il design system «Respiro» (salvia, carta, Brace, Hanken Grotesk + Instrument Serif).
- `src/js/` → il comportamento (`home.js`, `booking.js`, `area.js`, `chat.js`…). Niente librerie, nessuna chiamata a servizi esterni.
- `build.js` → genera tutte le pagine in `docs/` (44 pagine). **`docs/` è quello che va online.**

Dopo ogni modifica a `src/`: `node build.js` (serve Node, nessun'altra installazione).

## Pubblicare con GitHub
1. In GitHub Desktop: *File → Add Local Repository…* e scegli questa cartella (`mindlab-sito`), poi *Publish repository*.
2. Su github.com, nel repository: *Settings → Pages → Source: Deploy from a branch → main / docs*.
3. Dopo ogni modifica: *Commit* e *Push* in GitHub Desktop.

Il repository privato è gratuito; **pubblicare un sito da un repository privato con GitHub Pages richiede un piano a pagamento** (controlla i piani attuali). In alternativa si tiene il repository privato e si pubblica con Cloudflare Pages o Vercel, che leggono da GitHub.
Su questo disco (exFAT) macOS crea file `._*`: sono in `.gitignore`. Se Git dà errori su `.git`, vedi la nota «Git su A001».

## Aggiungere o cambiare qualcosa
- **Un corso**: aggiungi una voce in `src/data/corsi.js` → compare in catalogo, nella sua pagina e nel calendario.
- **Un professionista**: voce in `src/data/pros.js` (foto in `src/assets/img/`, nome file nel campo `foto`).
- **Una pillola**: voce in `src/data/blog.js` (`accesso: 'iscritti'` per le riservate).
- **Prezzi, regola delle 48 ore, posti per lezione**: `src/data/site.js`.

## Cosa è di esempio (EX) e va sostituito prima di andare online
- Azienda «X», P.IVA, sede, email, dominio → `src/data/site.js`.
- Nomi, ruoli, biografie e foto dei professionisti (le foto di Chiara e Marco sono AI di prova).
- Prezzi, orari, date delle edizioni (la prima: lunedì 11 gennaio 2027).
- Pagine **Termini, Privacy, Cookie**: testi segnaposto, da far scrivere o verificare a un professionista.
- Numeri della chat per le emergenze (112, Telefono Amico Italia 02 2327 2327): **verificarli** prima della pubblicazione.
- Nome del corso «Make friends with yourself»: controllare se richiede licenza o formazione specifica.
- Chi può insegnare «MBSR» (titoli degli insegnanti).

## Cosa NON c'è ancora (Fase 2 e 3)
| Cosa | Come si farà |
|---|---|
| Accesso vero (link via email) e database di iscritti e prenotazioni | Supabase (login + database con regole di sicurezza) |
| Pagamenti e fatture | Stripe + fatturazione elettronica; prima va deciso **chi vende** |
| Mail di conferma, promemoria 24 h e 5 min prima, link della videocall | servizio di posta + attività programmate lato server |
| Foglio presenze ai docenti | già visibile in «area docenti» (bozza); l'invio per mail e l'export in Google Sheets sono Fase 3 |
| Attestati con codice univoco e verifica pubblica | generazione PDF lato server; la pagina «Verifica» c'è già (codici di prova) |
| Pillole riservate davvero | si sbloccano con l'accesso vero (ora è una simulazione) |
| Chat con intelligenza artificiale | funzione lato server: **la chiave non va mai messa nel sito** |

## Privacy (regole da rispettare)
- Mai nel repository: dati di iscritti, chiavi, password, contratti. Vanno nel database o in `_privato/` (ignorata da Git).
- Il sito non carica risorse da altri siti e non usa cookie di profilazione. Se si aggiunge qualcosa (statistiche, video, font esterni), aggiornare la pagina Privacy.
- Foto: solo di persone che hanno dato il consenso; AI e segnaposto vanno tolti dal sito finale.

## Accessibilità
Menu e chat si usano da tastiera; «riduci movimento» disattiva animazioni e scroll orizzontale; in fondo alla home c'è «Scorri in verticale». Da ricontrollare con un test reale prima della pubblicazione.
