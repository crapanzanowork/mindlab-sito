// Catalogo di esempio (EX): nomi dei corsi dati da Mattia; descrizioni, prezzi, orari e date sono segnaposto.
const corsi = [
  { slug: 'mbsr', nome: 'MBSR', sottotitolo: 'Mindfulness-Based Stress Reduction', tipo: 'percorso', cat: 'percorsi', stato: 'attivo', num: '01',
    durata: '8 settimane · 8 lezioni da 2 ore', formato: 'Online, in videochiamata', prezzo: 290, prezzoNota: 'percorso completo',
    tagline: 'Il percorso di punta di MindLab: otto settimane per cambiare il modo in cui stai con lo stress.',
    descr: [
      'L’MBSR è un programma di otto settimane nato nel 1979 alla University of Massachusetts con Jon Kabat-Zinn, oggi tra i percorsi di mindfulness più noti e studiati.',
      'Ogni settimana c’è una lezione di gruppo di due ore, e ogni lezione è proposta in sei orari diversi, dal lunedì al sabato, con sei insegnanti diversi: scegli quello che si incastra con la tua settimana. Se salti una lezione, la recuperi nell’edizione successiva.',
      'Tra una lezione e l’altra si pratica a casa, poco ogni giorno. Non serve esperienza: serve la voglia di provare.'],
    perChi: ['Chi sente che lo stress occupa troppo spazio', 'Chi non ha mai meditato e vuole un metodo, non un’app', 'Chi lavora con le persone e arriva a sera svuotato', 'Chi vuole imparare a rispondere invece di reagire'],
    programma: [
      ['Pilota automatico', 'Accorgersi di quanto facciamo senza esserci davvero.'],
      ['Percepire e interpretare', 'La differenza tra ciò che accade e la storia che ci raccontiamo.'],
      ['La presenza che fa bene', 'Notare ciò che c’è di piacevole, anche nei giorni pesanti.'],
      ['Reattività allo stress', 'Come il corpo e la mente reagiscono sotto pressione.'],
      ['Rispondere, non reagire', 'Lo spazio tra lo stimolo e la nostra risposta.'],
      ['Comunicare quando è difficile', 'Ascoltare e parlare senza difese.'],
      ['Prendersi cura di sé', 'Le abitudini che sostengono la pratica.'],
      ['Continuare', 'Portare la pratica nella vita, dopo il corso.']],
    docenti: ['chiara', 'marco', 'giulia', 'davide', 'sara', 'luca'],
    note: 'Prima dell’inizio è previsto un breve colloquio individuale gratuito. L’MBSR non sostituisce una cura medica o psicologica.' },

  { slug: 'sitting', nome: 'Mindfulness Sitting', sottotitolo: 'Meditazioni guidate', tipo: 'settimanale', cat: 'sitting', stato: 'attivo', num: '02',
    durata: '30–45 minuti', formato: 'Online, in videochiamata', prezzo: 18, prezzoNota: 'a lezione',
    tagline: 'Una pausa guidata, una o più volte a settimana, senza impegni a lungo termine.',
    descr: ['Mezz’ora o tre quarti d’ora per sedersi, respirare e tornare in sé, insieme a un piccolo gruppo.',
      'Ci sono due appuntamenti ogni settimana: il lunedì sera con Chiara e il mercoledì mattina presto con Marco. Si prenotano a lezione singola, o con un pacchetto di crediti.'],
    perChi: ['Chi ha già fatto un corso e vuole continuare', 'Chi vuole provare prima di impegnarsi', 'Chi ha bisogno di una pausa regolare'],
    programma: [['Accogliere', 'Arrivare, sedersi, notare come si sta.'], ['Respiro e corpo', 'Un punto d’appoggio semplice.'], ['Pensieri', 'Guardarli passare senza inseguirli.'], ['Chiusura', 'Portare con sé un minuto di calma.']],
    docenti: ['chiara', 'marco'], note: 'Lezioni singole o in pacchetto: scegli tu quante e quando.' },

  { slug: 'counselling', nome: 'Percorso con il Counsellor', sottotitolo: 'Colloqui individuali', tipo: 'individuale', cat: 'individuale', stato: 'attivo', num: '03',
    durata: '5 colloqui da 50 minuti', formato: 'Online, in videochiamata', prezzo: 60, prezzoNota: 'a colloquio',
    tagline: 'Uno spazio tuo, con una professionista, per fare chiarezza.',
    descr: ['Il counselling è una relazione di aiuto: ti ascolti, ti fai ascoltare e trovi risorse che già hai. Non è psicoterapia e non fa diagnosi.',
      'Il percorso parte da cinque colloqui, poi decidi se continuare. Scegli tu giorno e orario tra quelli liberi.'],
    perChi: ['Chi attraversa un cambiamento', 'Chi sente di non riuscire a decidere', 'Chi vuole un accompagnamento più personale della classe'],
    programma: [['Primo colloquio', 'Conoscersi e fissare un obiettivo.'], ['Colloqui centrali', 'Esplorare, con tempi tuoi.'], ['Ultimo colloquio', 'Fare il punto e decidere come proseguire.']],
    docenti: ['giulia'], note: 'Il counselling non sostituisce la psicoterapia né una visita medica.' },

  { slug: 'make-friends-with-yourself', nome: 'Make friends with yourself', sottotitolo: 'Per ragazzi', tipo: 'giovani', cat: 'giovani', stato: 'prossimamente', num: '04',
    durata: 'In arrivo · primavera 2027', formato: 'Online, in videochiamata', prezzo: 180, prezzoNota: 'a ciclo',
    tagline: 'Un corso per ragazzi per imparare a trattarsi con gentilezza.',
    descr: ['Dedicato a ragazze e ragazzi, in piccoli gruppi guidati, con pratiche semplici e brevi per stare meglio con sé stessi.',
      'Il corso parte in primavera 2027. Lascia il tuo contatto: ti avvisiamo appena si aprono le date.'],
    perChi: ['Ragazzi e ragazze (fascia d’età da definire)', 'Genitori che cercano un’alternativa alle app', 'Scuole e gruppi'],
    programma: [['Incontro 1', 'Conoscersi.'], ['Incontro 2', 'Il critico interiore.'], ['Incontro 3', 'Gentilezza che funziona.'], ['Incontro 4', 'Portarla a casa.']],
    docenti: ['luca'], note: 'Le iscrizioni dei minori richiedono il consenso di un genitore.' },

  { slug: 'mindset-sportivi', nome: 'Mindset per sportivi', sottotitolo: 'Pressione, errore, concentrazione', tipo: 'percorso', cat: 'sport', stato: 'attivo', num: '05',
    durata: '4 incontri da 90 minuti', formato: 'Online, in videochiamata', prezzo: 160, prezzoNota: 'percorso completo',
    tagline: 'La pressione non si elimina: si impara a starci dentro.',
    descr: ['Per atleti di ogni livello e allenatori: come stare nell’errore, come ripartire dopo un gol subìto, come tenere la concentrazione quando conta.',
      'Quattro incontri il sabato mattina con Davide, con pratiche da portare in allenamento e in gara.'],
    perChi: ['Atleti amatori e agonisti', 'Portieri e ruoli “di reazione”', 'Allenatori e preparatori'],
    programma: [['Pressione', 'Che cos’è e dove si sente.'], ['L’errore', 'Il secondo errore nasce dal primo pensiero.'], ['Concentrazione', 'Tornare al presente.'], ['Routine', 'Pratiche pre e post gara.']],
    docenti: ['davide'], note: 'Per gruppi e società sportive si possono organizzare edizioni dedicate.' },

  { slug: 'mindset-pre-gravidanza', nome: 'Mindset pre-gravidanza', sottotitolo: 'Respiro, corpo, ascolto', tipo: 'percorso', cat: 'quotidiano', stato: 'attivo', num: '06',
    durata: '4 incontri da 90 minuti', formato: 'Online, in videochiamata', prezzo: 140, prezzoNota: 'percorso completo',
    tagline: 'Prepararsi non significa controllare tutto: significa ascoltarsi.',
    descr: ['Un percorso per chi si prepara ad avere un figlio, da soli o in coppia: respiro, consapevolezza del corpo, gestione dell’attesa e dell’incertezza.',
      'Quattro incontri il giovedì sera con Sara, in piccolo gruppo.'],
    perChi: ['Chi desidera un figlio e vive l’attesa con ansia', 'Coppie', 'Chi vuole un momento solo per sé, prima'],
    programma: [['Corpo e respiro', 'Conoscere i propri punti d’appoggio.'], ['Attesa', 'Stare nell’incertezza.'], ['Coppia', 'Ascoltarsi senza fretta.'], ['Fiducia', 'Pratiche per i giorni difficili.']],
    docenti: ['sara'], note: 'Non sostituisce il parere del medico o dell’ostetrica.' },

  { slug: 'dormire-meglio', nome: 'Dormire meglio', sottotitolo: 'Mini-corso · ogni settimana', tipo: 'settimanale', cat: 'quotidiano', stato: 'attivo', num: '07',
    durata: '60 minuti', formato: 'Online, in videochiamata', prezzo: 18, prezzoNota: 'a lezione',
    tagline: 'Una lezione per imparare a rallentare la sera.',
    descr: ['Una serata alla settimana per capire cosa succede quando non si riesce a spegnere la testa, con pratiche da fare a letto.', 'Il martedì alle 21:00 con Luca.'],
    perChi: ['Chi si sveglia di notte con i pensieri', 'Chi va a letto stanco ma agitato'], programma: [['Cosa succede', 'Testa e corpo la sera.'], ['Pratica a letto', 'Respiro e scansione del corpo.'], ['Abitudini', 'Piccoli rituali.']],
    docenti: ['luca'], note: 'Se i problemi di sonno persistono, parlane con il tuo medico.' },

  { slug: 'ansia-sociale', nome: 'Ansia sociale: stare tra le persone', sottotitolo: 'Mini-corso · ogni settimana', tipo: 'settimanale', cat: 'quotidiano', stato: 'attivo', num: '08',
    durata: '60 minuti', formato: 'Online, in videochiamata', prezzo: 18, prezzoNota: 'a lezione',
    tagline: 'Un’ora per diminuire l’imbarazzo e ritrovare naturalezza.',
    descr: ['Mettere un nome a ciò che si prova prima di una riunione, di una cena, di un colloquio. Pratiche brevi per arrivarci più presenti.', 'Il giovedì alle 18:30 con Giulia.'],
    perChi: ['Chi evita le situazioni sociali', 'Chi si sente giudicato', 'Chi cambia lavoro o città'], programma: [['Il corpo prima della mente', 'Segnali e respiro.'], ['Il giudizio', 'Pensieri che sembrano fatti.'], ['Piccoli passi', 'Esercizi graduali.']],
    docenti: ['giulia'], note: 'Non è un trattamento clinico dell’ansia.' },

  { slug: 'prima-dellesame', nome: 'Prima dell’esame', sottotitolo: 'Mini-corso · ogni settimana', tipo: 'settimanale', cat: 'quotidiano', stato: 'attivo', num: '09',
    durata: '60 minuti', formato: 'Online, in videochiamata', prezzo: 18, prezzoNota: 'a lezione',
    tagline: 'Studiare, ricordare e presentarsi con meno tensione.',
    descr: ['Un’ora per prepararsi a un esame, a un concorso o a un colloquio: come studiare senza rimuginare, cosa fare la sera prima e nei cinque minuti prima di entrare.', 'Il venerdì alle 17:30 con Luca.'],
    perChi: ['Studenti e studentesse', 'Chi prepara un concorso', 'Chi ha un colloquio importante'], programma: [['Tensione utile', 'Quando serve e quando no.'], ['Studio', 'Sessioni brevi, pause vere.'], ['Cinque minuti prima', 'Una pratica da portare con te.']],
    docenti: ['luca'], note: '' },

  { slug: 'concentrazione', nome: 'Concentrazione e pressione', sottotitolo: 'Mini-corso · ogni settimana', tipo: 'settimanale', cat: 'sport', stato: 'attivo', num: '10',
    durata: '60 minuti', formato: 'Online, in videochiamata', prezzo: 18, prezzoNota: 'a lezione',
    tagline: 'Rimanere sul compito quando tutto spinge a distrarsi.',
    descr: ['Un’ora per allenare l’attenzione, utile nello sport, nello studio e al lavoro.', 'Il sabato alle 09:30 con Davide.'],
    perChi: ['Sportivi', 'Chi lavora per obiettivi', 'Chi si distrae di continuo'], programma: [['Attenzione', 'Cos’è e come si allena.'], ['Distrazioni', 'Riconoscerle senza combatterle.'], ['Ripartire', 'Tornare al compito.']],
    docenti: ['davide'], note: '' },
];

// Settimana tipo delle lezioni singole (0 = lunedì … 5 = sabato). Stessi orari ogni settimana.
const settimana = [
  { id: 'sit-sera', corso: 'sitting', giorno: 0, ora: '18:30', min: 45, titolo: 'Mindfulness Sitting · sera', pro: 'chiara' },
  { id: 'dormire', corso: 'dormire-meglio', giorno: 1, ora: '21:00', min: 60, titolo: 'Dormire meglio', pro: 'luca' },
  { id: 'sit-mattina', corso: 'sitting', giorno: 2, ora: '07:30', min: 30, titolo: 'Sitting del mattino', pro: 'marco' },
  { id: 'ansia', corso: 'ansia-sociale', giorno: 3, ora: '18:30', min: 60, titolo: 'Ansia sociale', pro: 'giulia' },
  { id: 'esame', corso: 'prima-dellesame', giorno: 4, ora: '17:30', min: 60, titolo: 'Prima dell’esame', pro: 'luca' },
  { id: 'conc', corso: 'concentrazione', giorno: 5, ora: '09:30', min: 60, titolo: 'Concentrazione e pressione', pro: 'davide' },
];

// Percorsi a incontri fissi (EX)
const edizioniPercorsi = [
  { corso: 'mindset-sportivi', inizio: '2027-02-06', incontri: 4, giorno: 5, ora: '11:00', min: 90, pro: 'davide' },
  { corso: 'mindset-pre-gravidanza', inizio: '2027-02-04', incontri: 4, giorno: 3, ora: '20:30', min: 90, pro: 'sara' },
];

module.exports = { corsi, settimana, edizioniPercorsi };
