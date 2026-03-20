// Static guide data for each behavior: positive and negative observation clues
export const BEHAVIOR_GUIDE = {
  SCAN: {
    positive: [
      "Ruota la testa prima di ricevere palla",
      "Sa già dove si trovano avversari e compagni",
      "Agisce senza guardare intorno dopo la ricezione",
    ],
    negative: [
      "Fissa solo il pallone senza esplorare il campo",
      "Sorpreso dalla pressione avversaria",
      "Deve cercare opzioni solo dopo aver ricevuto",
    ],
  },
  OPL: {
    positive: [
      "Ha già deciso il prossimo gesto prima di ricevere",
      "Esegue immediatamente senza pausa decisionale",
      "Postura del corpo già orientata all'azione successiva",
    ],
    negative: [
      "Cerca opzioni solo dopo aver ricevuto palla",
      "Guarda in giro dopo la ricezione, rallentando il gioco",
      "Spesso sorpreso dalla situazione al momento del controllo",
    ],
  },
  PRAD: {
    positive: [
      "Individua la pressione avversaria in anticipo",
      "Si posiziona preventivamente lontano dalla pressione",
      "Non subisce pressing evitabile grazie alla consapevolezza spaziale",
    ],
    negative: [
      "Sorpreso dalla pressione, perde palla evitabilmente",
      "Non percepisce avversari alle spalle o sul fianco",
      "Riceve palla in zona già pressata senza accorgersene",
    ],
  },
  SENV: {
    positive: [
      "Crea spazio con movimenti intelligenti",
      "Utilizza efficacemente gli spazi disponibili",
      "Non intasa le zone con altri compagni",
    ],
    negative: [
      "Si sovrappone inutilmente ai compagni",
      "Non usa gli spazi liberi, rimane in zone affollate",
      "Movimenti che riducono le opzioni di passaggio del compagno",
    ],
  },
  DLAT: {
    positive: [
      "Decisioni rapide, spesso al primo tocco",
      "Non esita, sceglie con sicurezza",
      "Gestisce bene i tempi di gioco senza rallentare l'azione",
    ],
    negative: [
      "Tiene palla troppo a lungo prima di decidere",
      "Indeciso tra due opzioni, rallenta l'azione",
      "Frequente esitazione che porta a perdita di palla",
    ],
  },
  RREAD: {
    positive: [
      "Anticipa lo sviluppo dell'azione, si trova nel posto giusto",
      "Reagisce prima che l'azione si sviluppi completamente",
      "Intuisce traiettorie e movimenti degli avversari",
    ],
    negative: [
      "Sempre in ritardo rispetto all'azione",
      "Reagisce solo dopo che l'azione è già avvenuta",
      "Frequentemente fuori posizione per mancata lettura del gioco",
    ],
  },
  TFLEX: {
    positive: [
      "Cambia il piano d'azione quando la situazione cambia",
      "Legge il contesto e adatta le scelte tattiche",
      "Non ripete soluzioni che hanno già fallito",
    ],
    negative: [
      "Rigido nell'approccio, insiste su azioni che non funzionano",
      "Non si adatta ai cambiamenti tattici della squadra",
      "Scelte stereotipate indipendentemente dal contesto",
    ],
  },
  EREC: {
    positive: [
      "Si rifocalizza immediatamente dopo un errore",
      "Insegue / rincorre dopo aver perso palla",
      "Il linguaggio del corpo rimane positivo dopo l'errore",
    ],
    negative: [
      "Si ferma o rallenta dopo l'errore",
      "Rimane mentalmente sull'errore, distaccato dall'azione",
      "Linguaggio del corpo negativo che dura più di un'azione",
    ],
  },
  ASRES: {
    positive: [
      "Si calma visibilmente dopo situazioni di stress",
      "Mantiene linguaggio del corpo positivo anche sotto pressione",
      "Torna rapidamente al livello operativo dopo lo stress",
    ],
    negative: [
      "Porta lo stress nelle azioni successive",
      "Linguaggio del corpo negativo persistente dopo l'evento stressante",
      "Ha difficoltà a rientrare in partita emotivamente",
    ],
  },
  LACC: {
    positive: [
      "Va avanti rapidamente dopo aver perso palla o commesso errori",
      "Aiuta la squadra anche dopo aver perso la palla",
      "Elabora costruttivamente l'errore senza indugiare",
    ],
    negative: [
      "Protesta o si lamenta dopo aver perso palla",
      "Incolpa i compagni o le circostanze",
      "Rimane bloccato sull'errore, non si reintegra nell'azione",
    ],
  },
  FRUST: {
    positive: [
      "Rimane calmo in situazioni avverse",
      "Reazioni costruttive anche sotto pressione",
      "Non lascia che la frustrazione influenzi le scelte",
    ],
    negative: [
      "Litiga con i compagni in situazioni di difficoltà",
      "Mostra frustrazione eccessiva (gesti, parole)",
      "La frustrazione influenza negativamente le successive scelte tattiche",
    ],
  },
  QCOM: {
    positive: [
      "Fornisce indicazioni verbali chiare e utili",
      "Comunica la posizione degli avversari ai compagni",
      "Richiede palla o indica soluzioni nei momenti giusti",
    ],
    negative: [
      "Silenzioso anche quando la comunicazione sarebbe utile",
      "Comunicazione confusa o intempestiva",
      "Urla non costruttive, spesso frutto di frustrazione",
    ],
  },
  CTIM: {
    positive: [
      "Fornisce informazioni nel momento esatto in cui servono",
      "Indicazioni brevi, chiare e azionabili",
      "Il compagno che riceve le indicazioni beneficia effettivamente",
    ],
    negative: [
      "Informazioni arrivano troppo tardi o troppo presto",
      "Indicazioni vaghe o difficili da interpretare",
      "Comunica fuori contesto o durante fasi sbagliati dell'azione",
    ],
  },
  LPRESS: {
    positive: [
      "Prende l'iniziativa nei momenti difficili per la squadra",
      "Presenza vocale positiva e motivante sotto pressione",
      "Organizza i compagni quando la squadra è in difficoltà",
    ],
    negative: [
      "Scompare o si isola nei momenti di pressione",
      "Comunicazione negativa o assente nelle situazioni critiche",
      "Non dà riferimenti ai compagni quando ne avrebbero bisogno",
    ],
  },
  CMLEAD: {
    positive: [
      "Organizza i compagni con calma e lucidità",
      "Influenza positiva sull'atmosfera della squadra",
      "Gestisce le situazioni di tensione con maturità",
    ],
    negative: [
      "Trasmette panico o agitazione ai compagni",
      "Crea confusione invece di ordine nelle situazioni caotiche",
      "Non riesce a stabilizzare il gruppo nei momenti difficili",
    ],
  },
  CRIG: {
    positive: [
      "Aperto alle correzioni, implementa il feedback immediatamente",
      "Non ripete lo stesso errore dopo una correzione",
      "Accetta le indicazioni senza difendersi",
    ],
    negative: [
      "Ignora o minimizza le correzioni dello staff",
      "Ripete gli stessi errori anche dopo le indicazioni",
      "Risponde alle correzioni con atteggiamento difensivo",
    ],
  },
  ADEC: {
    positive: [
      "Accetta le decisioni tattiche/di formazione con atteggiamento positivo",
      "Rimane concentrato e contribuisce anche nelle situazioni non gradite",
      "Non mostra risentimento visibile verso le decisioni dello staff",
    ],
    negative: [
      "Protesta visibilmente le decisioni di sostituzione o tattiche",
      "Mostra scontento che si riflette sulle prestazioni",
      "Atteggiamento passivo-aggressivo dopo decisioni non gradite",
    ],
  },
  FEEDB: {
    positive: [
      "Applica il feedback ricevuto nell'azione successiva",
      "Annuisce o conferma verbalmente di aver recepito la correzione",
      "Chiede chiarimenti se non ha capito l'indicazione",
    ],
    negative: [
      "Continua lo stesso comportamento dopo la correzione",
      "Ascolta distrattamente, non integra il feedback",
      "Ripete lo stesso schema anche dopo spiegazioni multiple",
    ],
  },
  SELFC: {
    positive: [
      "Identifica autonomamente i propri errori senza correzione esterna",
      "Si autocorregge nel corso dell'esercizio",
      "Mostra consapevolezza critica delle proprie azioni",
    ],
    negative: [
      "Necessita di correzioni esterne ripetute per lo stesso errore",
      "Non mostra consapevolezza degli errori commessi",
      "Aspetta sempre indicazioni esterne senza processo di analisi interno",
    ],
  },
  CAMBAL: {
    positive: [
      "Incoraggia i compagni, specialmente dopo i loro errori",
      "Contribuisce a un'atmosfera positiva nel gruppo",
      "Equilibrio tra competitività individuale e spirito di squadra",
    ],
    negative: [
      "Critica i compagni in modo non costruttivo",
      "Crea tensioni o divisioni nel gruppo",
      "Antepone l'interesse individuale a quello della squadra in modo evidente",
    ],
  },
  CPTRIG: {
    positive: [
      "Reazione immediata alla perdita di palla, pressione ad alta intensità",
      "Primo a scattare nel contro-pressing dopo la perdita",
      "Dà il segnale agli altri di attivare il pressing",
    ],
    negative: [
      "Reazione lenta o assente alla perdita di palla",
      "Si ferma o si abbassa dopo la perdita invece di pressare",
      "Non contribuisce alla fase di contro-pressing della squadra",
    ],
  },
  CMREAD: {
    positive: [
      "Regola l'intensità in base al momento della partita",
      "Riconosce le transizioni chiave e si posiziona correttamente",
      "Sa quando accelerare e quando gestire il ritmo",
    ],
    negative: [
      "Intensità costante senza lettura del momento di gioco",
      "Manca i momenti chiave di transizione",
      "Fuori ritmo rispetto alla squadra nelle fasi di cambio di possesso",
    ],
  },
  DISTH: {
    positive: [
      "Mantiene posizione e ruolo tattico anche sotto pressione",
      "Disciplina tattica costante nelle situazioni difficili",
      "Non lascia il proprio compito anche quando sarebbe più comodo",
    ],
    negative: [
      "Abbandona il ruolo tattico quando sotto stress",
      "Indisciplina tattica che crea buchi o squilibri",
      "La pressione porta a scelte che contraddicono il piano di gioco",
    ],
  },
  SPDISC: {
    positive: [
      "Posizionamento corretto su calci piazzati (difensivi e offensivi)",
      "Esegue i compiti assegnati sui calci piazzati",
      "Lettura corretta della palla ferma avversaria",
    ],
    negative: [
      "Posizione scorretta sui calci piazzati",
      "Non esegue i movimenti assegnati sulle situazioni di palla inattiva",
      "Distrazione o errata lettura delle situazioni di palla ferma",
    ],
  },
};