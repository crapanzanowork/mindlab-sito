// Dati generali del sito MindLab. Tutto ciò che è "di esempio" è segnato EX: da sostituire prima della messa online vera.
module.exports = {
  nome: 'MindLab',
  tagline: 'Uno spazio per fermarsi.',
  descrizione: 'Corsi di mindfulness per stare bene con te stesso: sei professionisti, un solo metodo. Scegli la tua settimana, prenota le lezioni, ritrova il respiro.',
  // EX: azienda e dati legali provvisori
  azienda: { nome: 'Azienda X', piva: '00000000000', sede: 'Sede da definire', email: 'ciao@mindlab.example', pec: 'pec@mindlab.example' },
  dominio: 'https://mindlab.example', // EX: nessun dominio associato, per ora
  regole: {
    chiusuraOre: 48,
    recuperoMesi: 6,
    postiPerSlot: 12,
    primaLezioneGratuita: true,
    paragrafoGratis: 'La prima lezione è gratuita, in ogni corso.',
    paragrafoChiusura: 'Iscrizioni e disdette si chiudono 48 ore prima dell’inizio.',
  },
  // prezzi di esempio (EX)
  prezzi: {
    lezione: 18,
    pack5: 75,
    pack10: 140,
    mbsr: 290,
  },
  nav: [
    ['MBSR', 'mbsr.html'],
    ['Corsi', 'corsi.html'],
    ['Componi la settimana', 'settimana.html'],
    ['Calendario', 'calendario.html'],
    ['Professionisti', 'professionisti.html'],
    ['Pillole', 'blog.html'],
    ['Il metodo', 'metodo.html'],
    ['Parla con noi', 'conversazione.html'],
  ],
  // inizio settimane (lunedì)
  primaSettimana: '2027-01-11',
  edizioniMbsr: ['2027-01-11', '2027-03-15', '2027-05-10', '2027-09-20'],
};
