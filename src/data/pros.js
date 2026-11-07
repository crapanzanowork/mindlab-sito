// Sei professionisti IPOTETICI (EX): nomi, ruoli e testi sono segnaposto in attesa del team vero e dello shooting.
// Chiara e Marco hanno la foto AI di prova; gli altri hanno un avatar grafico.
// `giorno`: 0 = lunedì … 5 = sabato. Ogni giorno della settimana MBSR è coperto da un docente diverso.
module.exports = [
  { id: 'chiara', nome: 'Chiara', ruolo: 'Insegnante MBSR', focus: 'Mindfulness Sitting', foto: 'chiara.jpg', giorno: 0, ora: '18:30',
    bio: 'Accompagna chi inizia con calma e concretezza: pratiche brevi, linguaggio semplice, nessuna fretta di “riuscire”.',
    citazione: 'Non si tratta di svuotare la mente, ma di accorgersi di dov’è.', temi: ['MBSR', 'Sitting serale', 'Gestione dello stress'] },
  { id: 'marco', nome: 'Marco', ruolo: 'Insegnante MBSR', focus: 'Sitting del mattino', foto: 'marco.jpg', giorno: 1, ora: '07:30',
    bio: 'Porta la pratica dentro le giornate piene: pochi minuti, ma regolari. Segue le classi del mattino presto.',
    citazione: 'Cominciare bene la giornata non richiede un’ora, richiede un respiro.', temi: ['MBSR', 'Sitting del mattino', 'Routine'] },
  { id: 'giulia', nome: 'Giulia', ruolo: 'Insegnante MBSR · Counsellor', focus: 'Colloqui individuali', foto: null, giorno: 2, ora: '20:00',
    bio: 'Affianca le persone nei momenti di passaggio, con colloqui individuali e un lavoro sull’ansia sociale.',
    citazione: 'A volte basta uno spazio in cui nessuno ti chiede di essere diverso.', temi: ['Counselling', 'Ansia sociale', 'Colloquio iniziale MBSR'] },
  { id: 'davide', nome: 'Davide', ruolo: 'Insegnante MBSR · Mindset sportivo', focus: 'Mindset per sportivi', foto: null, giorno: 3, ora: '12:30',
    bio: 'Lavora con atleti e squadre sulla pressione, sull’errore e sulla concentrazione, partendo dalla pratica di presenza.',
    citazione: 'La pressione non si elimina: si impara a starci dentro.', temi: ['Sport', 'Errore e ripartenza', 'Concentrazione'] },
  { id: 'sara', nome: 'Sara', ruolo: 'Insegnante MBSR · Percorsi pre-gravidanza', focus: 'Mindset pre-gravidanza', foto: null, giorno: 4, ora: '18:00',
    bio: 'Propone percorsi di consapevolezza del corpo e del respiro per chi si prepara ad avere un figlio.',
    citazione: 'Prepararsi non significa controllare tutto, significa ascoltarsi.', temi: ['Pre-gravidanza', 'Respiro e corpo', 'Coppie'] },
  { id: 'luca', nome: 'Luca', ruolo: 'Insegnante MBSR · Giovani', focus: 'Giovani e sonno', foto: null, giorno: 5, ora: '09:30',
    bio: 'Lavora con ragazzi e giovani adulti su esami, sonno e relazione con sé stessi. Dalla primavera 2027 guiderà il corso per ragazzi.',
    citazione: 'Essere gentili con sé stessi si impara, come una lingua.', temi: ['Giovani', 'Esami', 'Sonno', 'Make friends with yourself'] },
];
