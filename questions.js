// ZPI™ – Zenith Performance Index
// questions.js
// Generated from uploaded ZPI questionnaire blocks.
// NOTE: uploaded files currently include questions 1–243 with some numbering gaps.
// Missing ranges/items are listed in MISSING_QUESTION_IDS below.

export const ZPI_TRAITS = [
  "Ambizione e competitività",
  "Assertività e negoziazione",
  "Autocontrollo e gestione emotiva",
  "Autonomia economica e iniziativa",
  "Comportamento generale",
  "Continuità professionale",
  "Creatività e innovazione",
  "Empatia e collaborazione",
  "Energia sociale e comunicazione",
  "Estroversione e networking",
  "Fiducia relazionale e sicurezza sociale",
  "Flessibilità e adattabilità",
  "Gestione della pressione",
  "Indice di attendibilità",
  "Leadership e influenza",
  "Organizzazione e metodo",
  "Orientamento alla performance",
  "Responsabilità e ownership",
  "Sensibilità al riconoscimento",
  "Stabilità emotiva e fiducia",
  "Visione e orientamento al futuro"
];

export const MISSING_QUESTION_IDS = [
  182,
  186,
  194,
  202,
  217,
  224,
  231,
  239
];

export const ZPI_QUESTIONS = [
  {
    "id": 1,
    "key": "q1",
    "text": "È necessario, secondo la tua opinione, essere disposti a rinunciare a benefici immediati nel presente per ottenere un miglioramento significativo del proprio benessere o della propria situazione nel futuro?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 2,
    "key": "q2",
    "text": "Ritieni che all’interno del tuo ambiente personale o professionale sia presente una persona che, con il suo comportamento o atteggiamento, rappresenta per te una fonte di preoccupazione o disagio?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 3,
    "key": "q3",
    "text": "Quando ascolti musica particolarmente coinvolgente e adatta al ballo, ti risulta difficile rimanere fermo e non lasciarti trasportare dal ritmo?",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "socialita",
      "umorismo"
    ]
  },
  {
    "id": 4,
    "key": "q4",
    "text": "Ti capita frequentemente che le persone che ti circondano si rivolgano a te come punto di riferimento prima di prendere decisioni importanti?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 5,
    "key": "q5",
    "text": "Hai la percezione di aver già incontrato, nel corso della tua vita, quella che potresti definire una “grande opportunità” determinante per il tuo percorso?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 6,
    "key": "q6",
    "text": "In contesti sociali in cui non conosci gli altri partecipanti, tendi ad essere tra i primi a prendere l’iniziativa e presentarti spontaneamente alle persone?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 7,
    "key": "q7",
    "text": "Hai talvolta la sensazione di essere l’unico ad assumerti pienamente la responsabilità per determinate situazioni o attività?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 8,
    "key": "q8",
    "text": "Ti capita frequentemente di dover gestire situazioni problematiche o compiti complessi lasciati in sospeso o non risolti da altri?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 9,
    "key": "q9",
    "text": "Hai la percezione che il raggiungimento dei tuoi obiettivi richieda uno sforzo eccessivo rispetto a quanto ti aspettavi o ritieni appropriato?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 10,
    "key": "q10",
    "text": "Ti consideri una persona capace di raccontare barzellette o storie divertenti in modo efficace, suscitando il coinvolgimento degli altri?",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "socialita",
      "umorismo"
    ]
  },
  {
    "id": 11,
    "key": "q11",
    "text": "Ti accade spesso che le persone si entusiasmino e si sentano motivate grazie alle tue parole o al tuo modo di comunicare?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 12,
    "key": "q12",
    "text": "Hai mai avviato un’attività autonoma oppure svolto un lavoro in cui la tua remunerazione dipendeva esclusivamente dalle provvigioni?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "economia",
      "iniziativa"
    ]
  },
  {
    "id": 13,
    "key": "q13",
    "text": "Ti riconosci come una persona pronta alla battuta, capace di rispondere con rapidità e spirito nelle conversazioni?",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "socialita",
      "umorismo"
    ]
  },
  {
    "id": 14,
    "key": "q14",
    "text": "Tendi a essere più indulgente e comprensivo nei confronti dei tuoi amici rispetto a quanto saresti con altre persone?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 15,
    "key": "q15",
    "text": "Ritieni che, in assenza di una preparazione adeguata e del giusto atteggiamento mentale, il futuro possa presentare difficoltà o esiti negativi?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 16,
    "key": "q16",
    "text": "Nel tuo ambiente, percepisci la presenza di persone particolarmente suscettibili o facilmente irritabili?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 17,
    "key": "q17",
    "text": "Durante conversazioni telefoniche, riesci a esprimere con facilità le tue emozioni e i tuoi stati d’animo?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 18,
    "key": "q18",
    "text": "Ritieni che molte persone sarebbero disposte a seguirti e sostenerti anche in situazioni particolarmente impegnative?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 19,
    "key": "q19",
    "text": "A quale età hai iniziato a generare un reddito autonomo significativo (escludendo paghette o attività domestiche)?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "select",
    "scored": false,
    "tags": [
      "factual",
      "economia"
    ]
  },
  {
    "id": 20,
    "key": "q20",
    "text": "Quando frequenti locali o ambienti pubblici, tendi a instaurare spontaneamente una breve conversazione con il personale?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 21,
    "key": "q21",
    "text": "Ti capita spesso di percepire il comportamento delle altre persone come poco logico o difficile da comprendere?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 22,
    "key": "q22",
    "text": "Quale percentuale del tuo reddito annuo riesci generalmente a risparmiare o accantonare in ottica futura?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "select",
    "scored": false,
    "tags": [
      "factual",
      "economia"
    ]
  },
  {
    "id": 23,
    "key": "q23",
    "text": "C’è qualcuno con cui provi difficoltà o timore nel comunicare apertamente e in modo diretto?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 24,
    "key": "q24",
    "text": "Ti piace assumere un ruolo direttivo indicando agli altri cosa fare e come comportarsi?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 25,
    "key": "q25",
    "text": "Ritieni che le persone tendano a imitare i tuoi comportamenti o il tuo stile?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 26,
    "key": "q26",
    "text": "Hai avuto, nel corso della tua vita, numerose occasioni che potresti definire come grandi opportunità?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 27,
    "key": "q27",
    "text": "Quando ti trovi in un ambiente nuovo, riesci rapidamente a conoscere e instaurare relazioni con molte persone?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 28,
    "key": "q28",
    "text": "Hai talvolta la sensazione di non essere considerato dagli altri nella misura che ritieni adeguata?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 29,
    "key": "q29",
    "text": "Ti capita frequentemente di dover prendere in carico attività o responsabilità trascurate dai tuoi colleghi?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 30,
    "key": "q30",
    "text": "Ritieni che, nel tuo ambiente, ci siano molte persone con cui è necessario prestare particolare attenzione nel modo di comunicare?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 31,
    "key": "q31",
    "text": "Ti senti a disagio quando sei osservato da un gruppo numeroso di persone durante lo svolgimento di un’attività?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 32,
    "key": "q32",
    "text": "Incontri difficoltà nel far comprendere e accettare le tue idee e i tuoi progetti agli altri?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 33,
    "key": "q33",
    "text": "Hai raggiunto l’indipendenza economica prima dei 26 anni oppure ritieni di essere economicamente indipendente attualmente?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "economia",
      "iniziativa"
    ]
  },
  {
    "id": 34,
    "key": "q34",
    "text": "Riesci con facilità a instaurare un rapporto amichevole con una persona appena conosciuta in tempi brevi?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 35,
    "key": "q35",
    "text": "Ti capita che critiche o lamentele nei tuoi confronti ti colpiscano in modo improvviso e inaspettato?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 36,
    "key": "q36",
    "text": "Utilizzi un sistema strutturato per organizzare e monitorare i tuoi impegni e le attività da svolgere?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 37,
    "key": "q37",
    "text": "C’è una persona con cui ti trovi frequentemente a discutere o a dover giustificare le tue scelte?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 38,
    "key": "q38",
    "text": "Sei coinvolto in così tante attività che gli altri devono spesso ricordarti cosa fare?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 39,
    "key": "q39",
    "text": "Ritieni che un imprenditore dovrebbe incentivare economicamente i collaboratori prima del raggiungimento dei risultati?",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "performance"
    ]
  },
  {
    "id": 40,
    "key": "q40",
    "text": "Aspiri a diventare il migliore in assoluto nel tuo ambito professionale?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 41,
    "key": "q41",
    "text": "Pensi che cercare di migliorare il carattere delle altre persone sia spesso una perdita di tempo?",
    "trait": "Empatia e collaborazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "criticita_relazionale"
    ]
  },
  {
    "id": 42,
    "key": "q42",
    "text": "Riesci facilmente a trovare il giusto approccio anche con persone particolarmente difficili?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 43,
    "key": "q43",
    "text": "Sei generalmente la persona che ricorda agli altri impegni e scadenze?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 44,
    "key": "q44",
    "text": "Ritieni che qualcuno nel tuo ambiente dovrebbe cambiare atteggiamento nei tuoi confronti ma non lo fa?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 45,
    "key": "q45",
    "text": "Ti distrai facilmente da ciò che stai facendo a causa di fattori esterni?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 46,
    "key": "q46",
    "text": "Le persone si rivolgono spesso a te per ricevere indicazioni su cosa fare?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 47,
    "key": "q47",
    "text": "L’idea di dover affrontare quotidianamente un lungo tragitto casa-lavoro ti metterebbe a disagio?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 48,
    "key": "q48",
    "text": "Tendi a mantenere un atteggiamento formale finché non conosci bene le persone?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 49,
    "key": "q49",
    "text": "Ti risulta facile comprendere le motivazioni e i punti di vista degli altri?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 50,
    "key": "q50",
    "text": "Ti capita di dover essere insistente affinché il lavoro venga portato a termine correttamente?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 51,
    "key": "q51",
    "text": "C’è qualcuno che ti fa sentire, anche occasionalmente, inadeguato o sbagliato?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 52,
    "key": "q52",
    "text": "Quando ti trovi in gruppo, preferisci non attirare l’attenzione su di te?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 53,
    "key": "q53",
    "text": "Hai mai la sensazione di essere osservato o giudicato dagli altri?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 54,
    "key": "q54",
    "text": "Saresti disposto a trasferirti stabilmente per un lavoro che ami, anche con una retribuzione inizialmente inferiore?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "economia",
      "iniziativa"
    ]
  },
  {
    "id": 55,
    "key": "q55",
    "text": "Trovi difficile interrompere i rapporti con qualcuno anche se ti ha fatto un torto?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 56,
    "key": "q56",
    "text": "Ti dà fastidio essere osservato mentre lavori?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 57,
    "key": "q57",
    "text": "Hai riscontrato una diminuzione dei tuoi guadagni negli ultimi dodici mesi?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 58,
    "key": "q58",
    "text": "Ti capita frequentemente di avere sbalzi d’umore?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 59,
    "key": "q59",
    "text": "Ti consideri timido quando interagisci con persone sconosciute?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 60,
    "key": "q60",
    "text": "Ritieni che il tuo modo di comunicare riesca a motivare e valorizzare gli altri?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 61,
    "key": "q61",
    "text": "Ti capita di eliminare oggetti o materiali per poi renderti conto successivamente di averne ancora bisogno?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 62,
    "key": "q62",
    "text": "Tendi a utilizzare l’autoironia, scherzando su te stesso nelle conversazioni con gli altri?",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "socialita",
      "umorismo"
    ]
  },
  {
    "id": 63,
    "key": "q63",
    "text": "Cerchi generalmente di evitare di esprimere giudizi sulle altre persone?",
    "trait": "Empatia e collaborazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "criticita_relazionale"
    ]
  },
  {
    "id": 64,
    "key": "q64",
    "text": "Quando pensi al tuo futuro, hai la sensazione che ci siano aspetti che dovresti affrontare o migliorare diversamente?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 65,
    "key": "q65",
    "text": "Ritieni che le tue idee siano troppo importanti per essere tenute solo per te e non condivise con gli altri?",
    "trait": "Creatività e innovazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio_influenza"
    ]
  },
  {
    "id": 66,
    "key": "q66",
    "text": "Ti senti in grado, se lo desideri, di utilizzare il tuo sguardo o la tua presenza in modo seduttivo?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 67,
    "key": "q67",
    "text": "Ti consideri una persona ricca di idee innovative e creative?",
    "trait": "Creatività e innovazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "creativita"
    ]
  },
  {
    "id": 68,
    "key": "q68",
    "text": "Hai l’ambizione di diventare una persona conosciuta o affermata pubblicamente?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 69,
    "key": "q69",
    "text": "Ti risulta semplice creare un legame di amicizia con nuove persone?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 70,
    "key": "q70",
    "text": "Ti è stato detto che tendi a essere eccessivamente tollerante nei confronti degli altri?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 71,
    "key": "q71",
    "text": "In alcune aree della tua vita percepisci la necessità di intervenire perché ti senti inadeguato?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 72,
    "key": "q72",
    "text": "Vorresti cambiare l’atteggiamento di qualcuno nei tuoi confronti ma non riesci a farlo?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 73,
    "key": "q73",
    "text": "Ti capita frequentemente di rimandare le attività fino all’ultimo momento utile?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 74,
    "key": "q74",
    "text": "Le persone, dopo aver parlato con te, si sentono generalmente più motivate ed energiche?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 75,
    "key": "q75",
    "text": "Riesci a mantenere la calma anche in situazioni particolarmente difficili o stressanti?",
    "trait": "Gestione della pressione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "stress"
    ]
  },
  {
    "id": 76,
    "key": "q76",
    "text": "Ci sono molte persone che suscitano in te curiosità al punto da volerle conoscere meglio?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 77,
    "key": "q77",
    "text": "Tendi ad assumere un atteggiamento polemico nelle discussioni?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 78,
    "key": "q78",
    "text": "Sei particolarmente esigente nei confronti di te stesso?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 79,
    "key": "q79",
    "text": "Ti sentiresti tranquillo nell’affrontare un viaggio senza aver pianificato o prenotato in anticipo?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 80,
    "key": "q80",
    "text": "In contesti sociali ristretti, come piccole feste, ti trovi spesso al centro dell’attenzione?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 81,
    "key": "q81",
    "text": "Ti percepisci come una persona fuori dagli schemi o con un modo di pensare non convenzionale?",
    "trait": "Creatività e innovazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "creativita"
    ]
  },
  {
    "id": 82,
    "key": "q82",
    "text": "Ritieni che un buon leader debba controllare attentamente la qualità del lavoro dei collaboratori?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 83,
    "key": "q83",
    "text": "Sei incline a fare complimenti sinceri alle altre persone?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 84,
    "key": "q84",
    "text": "Ti capita di dimenticare dove hai riposto oggetti o cose personali?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 85,
    "key": "q85",
    "text": "Stai attualmente portando avanti un progetto chiaro e definito per le principali aree della tua vita?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 86,
    "key": "q86",
    "text": "Ti è capitato, in alcune circostanze, di dire una bugia?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 87,
    "key": "q87",
    "text": "Ti metterebbe a disagio insistere con un cliente insicuro per portarlo a concludere un acquisto?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 88,
    "key": "q88",
    "text": "Sei in grado di descrivere o rappresentare qualcosa in modo così efficace da farla sembrare reale anche se non esiste?",
    "trait": "Creatività e innovazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "creativita"
    ]
  },
  {
    "id": 89,
    "key": "q89",
    "text": "Aspiri a raggiungere una posizione economica tale da rientrare tra il 10% più ricco della popolazione?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 90,
    "key": "q90",
    "text": "Quando sei in vacanza, riesci facilmente a fare nuove conoscenze e amicizie?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 91,
    "key": "q91",
    "text": "Ti consideri una persona tendenzialmente severa o rigorosa nei confronti degli altri?",
    "trait": "Empatia e collaborazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "criticita_relazionale"
    ]
  },
  {
    "id": 92,
    "key": "q92",
    "text": "Nutri ancora dei rimpianti o delle recriminazioni legate al tuo passato?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 93,
    "key": "q93",
    "text": "Ti è mai capitato di incontrare persone che hai trovato particolarmente antipatiche?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 94,
    "key": "q94",
    "text": "Ti sentiresti a disagio nel dover insistere con decisione su un cliente per concludere una vendita?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 95,
    "key": "q95",
    "text": "Ti consideri una persona costantemente felice anche in assenza di motivi specifici?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 96,
    "key": "q96",
    "text": "Ti definiresti come una persona disposta a fare tutto il necessario pur di concludere una vendita?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 97,
    "key": "q97",
    "text": "Ti capita talvolta di chiuderti in te stesso o mostrare atteggiamenti di chiusura emotiva?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 98,
    "key": "q98",
    "text": "Ritieni che le persone valutino il tuo operato in modo imparziale e obiettivo?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 99,
    "key": "q99",
    "text": "Utilizzi strumenti o metodi per monitorare e valutare le tue prestazioni lavorative?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 100,
    "key": "q100",
    "text": "Ti capita di avere pensieri che scegli consapevolmente di non esprimere?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 101,
    "key": "q101",
    "text": "Riesci a mantenere il controllo e affrontare efficacemente situazioni difficili o complesse?",
    "trait": "Gestione della pressione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "stress"
    ]
  },
  {
    "id": 102,
    "key": "q102",
    "text": "Sei considerato un punto di riferimento da molti dei tuoi colleghi o collaboratori?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 103,
    "key": "q103",
    "text": "Ritieni che, in alcune situazioni, sia giusto agire seguendo l’impulso del momento?",
    "trait": "Gestione della pressione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "impulso",
      "pressione"
    ]
  },
  {
    "id": 104,
    "key": "q104",
    "text": "Pensi che, per ottenere determinati risultati, sia talvolta necessario andare contro la volontà degli altri?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 105,
    "key": "q105",
    "text": "Ritieni che i dettagli non abbiano un ruolo particolarmente rilevante nello svolgimento delle attività?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 106,
    "key": "q106",
    "text": "Stai costruendo attivamente una riserva economica o finanziaria per il tuo futuro?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "economia",
      "iniziativa"
    ]
  },
  {
    "id": 107,
    "key": "q107",
    "text": "Ti capita di avere pensieri critici nei confronti di altre persone?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 108,
    "key": "q108",
    "text": "Preferisci affidarti alla memoria piuttosto che annotare le cose da fare?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 109,
    "key": "q109",
    "text": "Hai la tendenza ad avviare frequentemente nuovi progetti nel tuo ambito lavorativo?",
    "trait": "Creatività e innovazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "creativita"
    ]
  },
  {
    "id": 110,
    "key": "q110",
    "text": "I tuoi interessi tendono a cambiare frequentemente passando da un ambito all’altro?",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "disorganizzazione"
    ]
  },
  {
    "id": 111,
    "key": "q111",
    "text": "Sei in grado di alleggerire situazioni tese utilizzando l’umorismo?",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "socialita",
      "umorismo"
    ]
  },
  {
    "id": 112,
    "key": "q112",
    "text": "Ti capita di percepire una certa ripetitività nelle attività che svolgi?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 113,
    "key": "q113",
    "text": "Rispetto a un anno fa, ritieni di aver fatto progressi significativi nella tua carriera o professione?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 114,
    "key": "q114",
    "text": "Dedichi regolarmente del tempo alla gestione e pianificazione dei tuoi investimenti?",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "economia",
      "iniziativa"
    ]
  },
  {
    "id": 115,
    "key": "q115",
    "text": "Ti consideri un acquirente per il quale è facile vendere un prodotto o servizio?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 116,
    "key": "q116",
    "text": "Accetteresti un lavoro con una retribuzione basata esclusivamente sulle provvigioni?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 117,
    "key": "q117",
    "text": "Ti infastidisce renderti conto che un bene di uso quotidiano sta per esaurirsi senza avere una scorta?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 118,
    "key": "q118",
    "text": "Ti consideri una persona incline ad attaccare facilmente conversazione con chiunque?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 119,
    "key": "q119",
    "text": "Ti capita di essere sorpreso dalle scelte o dai comportamenti delle altre persone?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 120,
    "key": "q120",
    "text": "Nel tuo lavoro, ti imponi delle regole che segui con costanza e disciplina?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 121,
    "key": "q121",
    "text": "Le mie riserve finanziarie attuali sono adeguate rispetto al mio reddito mensile netto.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 122,
    "key": "q122",
    "text": "Tendo a essere disordinato nella gestione degli spazi o delle mie cose.",
    "trait": "Organizzazione e metodo",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 123,
    "key": "q123",
    "text": "Mi risulta difficile accettare di avere torto nelle discussioni o nei confronti con gli altri.",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 124,
    "key": "q124",
    "text": "Mi crea disagio dover convincere altre persone ad accettare le mie idee o proposte.",
    "trait": "Assertività e negoziazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 125,
    "key": "q125",
    "text": "La mia timidezza rappresenta un ostacolo nelle mie relazioni o opportunità.",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 126,
    "key": "q126",
    "text": "Riesco a comprendere in anticipo le intenzioni o gli obiettivi delle persone con cui interagisco.",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 127,
    "key": "q127",
    "text": "Possiedo un immobile di proprietà, anche se soggetto a mutuo.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 128,
    "key": "q128",
    "text": "Ho aderito a forme di risparmio o investimento a lungo termine per il mio futuro, come fondi pensione o PAC.",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 129,
    "key": "q129",
    "text": "Mostro forte curiosità verso le persone appena conosciute, ponendo molte domande per conoscerle meglio.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 130,
    "key": "q130",
    "text": "Dopo aver conosciuto una persona, mi capita spesso di modificare l’opinione iniziale che avevo su di lei.",
    "trait": "Flessibilità e adattabilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 131,
    "key": "q131",
    "text": "Mi sentirei a disagio nel dover dire a un cliente che un prodotto non gli si addice.",
    "trait": "Assertività e negoziazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 132,
    "key": "q132",
    "text": "Mi capita di sentirmi fuori posto o non completamente integrato in determinati contesti.",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 133,
    "key": "q133",
    "text": "Ritengo che la maggior parte degli errori in azienda dipenda da scarso impegno o applicazione.",
    "trait": "Empatia e collaborazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 134,
    "key": "q134",
    "text": "Quando acquisto qualcosa, tendo a negoziare o cercare di ottenere un prezzo migliore.",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 135,
    "key": "q135",
    "text": "Dedico tempo alla pianificazione del mio futuro finanziario.",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 136,
    "key": "q136",
    "text": "Mi piace porre domande agli altri per conoscere la loro storia personale e professionale.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 137,
    "key": "q137",
    "text": "I regali che faccio superano spesso le aspettative delle persone che li ricevono.",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 138,
    "key": "q138",
    "text": "Ricevo frequentemente chiamate di lavoro anche al di fuori dell’orario lavorativo.",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 139,
    "key": "q139",
    "text": "Mi infastidiscono i gesti affettuosi da parte di persone con cui non ho confidenza.",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 140,
    "key": "q140",
    "text": "Riesco spesso ad anticipare ciò che una persona desidera comunicarmi prima che lo faccia esplicitamente.",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 141,
    "key": "q141",
    "text": "Propongo attivamente idee per migliorare l’efficienza o la redditività della mia azienda.",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 142,
    "key": "q142",
    "text": "Sono incline a donare o cedere oggetti anche quando potrebbero essermi ancora utili.",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 143,
    "key": "q143",
    "text": "Mi risulta facile perdonare gli errori o le mancanze degli altri.",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 144,
    "key": "q144",
    "text": "Nell’ultimo anno, il mio lavoro è diventato più stimolante e ricco di contenuti.",
    "trait": "Continuità professionale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 145,
    "key": "q145",
    "text": "Valuto il mio potenziale di successo come superiore rispetto a quello della maggior parte delle altre persone.",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 146,
    "key": "q146",
    "text": "Sono in grado di sostenere efficacemente le mie idee di fronte a colleghi o superiori indecisi.",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 147,
    "key": "q147",
    "text": "Negli ultimi due mesi ho ricevuto incarichi direttamente dal vertice aziendale.",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 148,
    "key": "q148",
    "text": "Riesco a non farmi influenzare dal fatto che gli altri parlino più dei propri problemi che dei miei.",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 149,
    "key": "q149",
    "text": "Rispetto a due anni fa, la mia situazione finanziaria è migliorata.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 150,
    "key": "q150",
    "text": "Nell’ultimo anno ho partecipato ad almeno due corsi di formazione specialistica legati al mio lavoro.",
    "trait": "Continuità professionale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 151,
    "key": "q151",
    "text": "In alcune situazioni mi capita di percepire la realtà come irreale o simile a un sogno.",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 152,
    "key": "q152",
    "text": "Riesco a individuare con facilità gli argomenti che risultano più interessanti per le altre persone.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 153,
    "key": "q153",
    "text": "Le mie risorse finanziarie attuali mi permetterebbero di sostenermi a lungo anche senza entrate.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 154,
    "key": "q154",
    "text": "Ritengo di avere una fiducia in me stesso superiore rispetto alla media delle altre persone.",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 155,
    "key": "q155",
    "text": "Sono considerato da colleghi o collaboratori un modello da seguire o una figura di riferimento.",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 156,
    "key": "q156",
    "text": "Utilizzo strumenti o dati statistici per monitorare l’andamento del mio lavoro.",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 157,
    "key": "q157",
    "text": "Ritengo sbagliato premiare le persone solo in base ai risultati senza considerare l’impegno.",
    "trait": "Orientamento alla performance",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 158,
    "key": "q158",
    "text": "Adatto il mio modo di comunicare in base alla persona con cui sto interagendo.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 159,
    "key": "q159",
    "text": "Il mio ruolo lavorativo prevede un contatto frequente con i clienti.",
    "trait": "Contesto ruolo",
    "reverse": false,
    "responseType": "likert",
    "scored": false,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 160,
    "key": "q160",
    "text": "Ho affrontato situazioni finanziarie o debitorie particolarmente difficili nella mia vita.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 161,
    "key": "q161",
    "text": "Mi capita di non sapere di cosa parlare con alcune persone.",
    "trait": "Energia sociale e comunicazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 162,
    "key": "q162",
    "text": "Il mio lavoro contribuisce direttamente alla generazione di fatturato per l’azienda.",
    "trait": "Contesto ruolo",
    "reverse": false,
    "responseType": "likert",
    "scored": false,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 163,
    "key": "q163",
    "text": "Mi pongo obiettivi sempre più sfidanti per migliorare le mie performance lavorative.",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 164,
    "key": "q164",
    "text": "Mi considero abile nello scrivere messaggi o comunicazioni che coinvolgono emotivamente gli altri.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 165,
    "key": "q165",
    "text": "Ho un rapporto diretto e personale con diversi clienti dell’azienda per cui lavoro.",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 166,
    "key": "q166",
    "text": "Mi sento a disagio in ambienti disordinati.",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 167,
    "key": "q167",
    "text": "Mi dispiace quando il mio superiore non mi coinvolge nelle decisioni.",
    "trait": "Sensibilità al riconoscimento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 168,
    "key": "q168",
    "text": "Mi considero tra i professionisti più competenti e aggiornati nel mio settore.",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 169,
    "key": "q169",
    "text": "Il mio lavoro mi entusiasma al punto da volerlo condividere con gli altri.",
    "trait": "Energia sociale e comunicazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 170,
    "key": "q170",
    "text": "Nei momenti difficili, i miei colleghi fanno riferimento a me per mantenere motivazione e fiducia.",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 171,
    "key": "q171",
    "text": "Ci sono attività fondamentali all’interno dell’azienda che solo io sono in grado di svolgere.",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 172,
    "key": "q172",
    "text": "Quando presento un’idea, preferisco utilizzare uno stile comunicativo incisivo anche a costo di enfatizzare il messaggio.",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 173,
    "key": "q173",
    "text": "Il mio lavoro contribuisce a generare risparmi economici per l’azienda.",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 174,
    "key": "q174",
    "text": "Sono spesso invitato a partecipare a riunioni strategiche o di vertice.",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 175,
    "key": "q175",
    "text": "Ritengo che eseguire le direttive dei superiori sia sempre la priorità principale di un buon collaboratore.",
    "trait": "Autonomia economica e iniziativa",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 176,
    "key": "q176",
    "text": "Penso che sia più corretto premiare uniformemente tutto il personale piuttosto che valorizzare i singoli più meritevoli.",
    "trait": "Orientamento alla performance",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 177,
    "key": "q177",
    "text": "Mi è stato detto che possiedo un carattere difficile.",
    "trait": "Empatia e collaborazione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 178,
    "key": "q178",
    "text": "Investo parte delle mie entrate con l’obiettivo di ottenere benefici futuri.",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 179,
    "key": "q179",
    "text": "Ritengo di avere una forte influenza sul modo di pensare delle persone che mi circondano.",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 180,
    "key": "q180",
    "text": "Mi infastidisce quando gli altri mi dicono cosa dovrei fare.",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "integrazione_121_180"
    ]
  },
  {
    "id": 181,
    "key": "q181",
    "text": "Ti infastidisce il fatto che le altre persone non riconoscano adeguatamente il tuo contributo o i tuoi risultati?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 183,
    "key": "q183",
    "text": "Tendi a insistere affinché le cose vengano fatte esattamente come desideri, piuttosto che adattarti agli altri?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 184,
    "key": "q184",
    "text": "Senti frequentemente la necessità di giustificare o difendere le opinioni che esprimi?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 185,
    "key": "q185",
    "text": "Hai la percezione che le persone intorno a te possano ferirti senza rendersene conto?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 187,
    "key": "q187",
    "text": "Ti senti a disagio nel prendere posizioni contrarie rispetto alla maggioranza?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 188,
    "key": "q188",
    "text": "Ti infastidiscono le critiche nei tuoi confronti anche quando potrebbero essere costruttive?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 189,
    "key": "q189",
    "text": "Ti è stato detto che tendi a essere geloso o possessivo?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 190,
    "key": "q190",
    "text": "Offri aiuto o favori agli altri anche quando questo comporta sacrifici personali?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 191,
    "key": "q191",
    "text": "Sei in grado di affermarti e far valere la tua posizione nei rapporti interpersonali?",
    "trait": "Assertività e negoziazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "sales",
      "assertivita"
    ]
  },
  {
    "id": 192,
    "key": "q192",
    "text": "L’idea di essere una persona “nella media” ti risulta particolarmente sgradita?",
    "trait": "Ambizione e competitività",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ego",
      "competitivita"
    ]
  },
  {
    "id": 193,
    "key": "q193",
    "text": "Ti capita di reagire negativamente quando gli altri non condividono le tue opinioni?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 195,
    "key": "q195",
    "text": "Ti capita di dare indicazioni agli altri anche in ambiti in cui non sei particolarmente esperto?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 196,
    "key": "q196",
    "text": "Quando qualcuno ottiene risultati migliori dei tuoi, senti una forte spinta a superarlo?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 197,
    "key": "q197",
    "text": "Ritieni di aver raggiunto gli obiettivi che ti eri prefissato nel tuo attuale o ultimo lavoro?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 198,
    "key": "q198",
    "text": "Trovi difficoltà nell’iniziare attività o compiti che devi svolgere?",
    "trait": "Responsabilità e ownership",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "procrastinazione"
    ]
  },
  {
    "id": 199,
    "key": "q199",
    "text": "Quando pianifichi qualcosa, ti capita di cedere facilmente alle pressioni o richieste degli altri?",
    "trait": "Gestione della pressione",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "impulso",
      "pressione"
    ]
  },
  {
    "id": 200,
    "key": "q200",
    "text": "Tendi a nascondere i tuoi sentimenti anziché esprimerli apertamente?",
    "trait": "Estroversione e networking",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "chiusura",
      "inibizione"
    ]
  },
  {
    "id": 201,
    "key": "q201",
    "text": "Sei una persona metodica e precisa nell’organizzazione e archiviazione dei documenti personali?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 203,
    "key": "q203",
    "text": "Pensi che le persone intorno a te sappiano realmente prendersi cura di te?",
    "trait": "Fiducia relazionale e sicurezza sociale",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "percezione sociale",
      "rischio"
    ]
  },
  {
    "id": 204,
    "key": "q204",
    "text": "Hai la sensazione che le tue capacità siano inferiori a quanto dimostrano i risultati concreti?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 205,
    "key": "q205",
    "text": "Ritieni di spendere in modo eccessivamente libero rispetto alle tue entrate?",
    "trait": "Responsabilità e ownership",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "finanze"
    ]
  },
  {
    "id": 206,
    "key": "q206",
    "text": "Accetteresti una situazione ingiusta pur di evitare conflitti o tensioni?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 207,
    "key": "q207",
    "text": "Quando conosci qualcuno, tendi a condividere rapidamente informazioni personali su di te?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "confini"
    ]
  },
  {
    "id": 208,
    "key": "q208",
    "text": "Ritieni che un collaboratore debba essere valutato principalmente in base ai risultati ottenuti?",
    "trait": "Orientamento alla performance",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "performance"
    ]
  },
  {
    "id": 209,
    "key": "q209",
    "text": "Ti capita di mostrarti così sicuro di te da risultare talvolta eccessivo agli occhi degli altri?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 210,
    "key": "q210",
    "text": "Di fronte a obiettivi o desideri, pensi spesso che riuscirai a ottenerli in futuro?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 211,
    "key": "q211",
    "text": "Riesci a rispettare con costanza le scadenze e gli impegni prefissati?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 212,
    "key": "q212",
    "text": "Ti infastidisce quando qualcuno scherza sui tuoi errori o punti deboli?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 213,
    "key": "q213",
    "text": "Riesci a mantenere fiducia in te stesso anche quando le situazioni diventano difficili?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  },
  {
    "id": 214,
    "key": "q214",
    "text": "Sei solito pianificare in anticipo le attività per poi portarle a termine con metodo?",
    "trait": "Responsabilità e ownership",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ownership"
    ]
  },
  {
    "id": 215,
    "key": "q215",
    "text": "Cerchi di mantenere armonia e pace nelle relazioni anche a costo di sacrificare il tuo punto di vista?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 216,
    "key": "q216",
    "text": "Vieni percepito come una persona competitiva nei vari ambiti della tua vita?",
    "trait": "Ambizione e competitività",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "ambizione"
    ]
  },
  {
    "id": 218,
    "key": "q218",
    "text": "Riesci con facilità a convincere gli altri della validità delle tue opinioni?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 219,
    "key": "q219",
    "text": "È importante per te mantenere una buona considerazione da parte degli altri?",
    "trait": "Sensibilità al riconoscimento",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "riconoscimento",
      "critica"
    ]
  },
  {
    "id": 220,
    "key": "q220",
    "text": "Ti senti in grado di prendere decisioni anche per conto di altre persone?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 221,
    "key": "q221",
    "text": "Ti dà fastidio quando gli altri ottengono risultati migliori dei tuoi?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 222,
    "key": "q222",
    "text": "Ti capita di vedere tutto in modo positivo anche quando riconosci che alcune cose dovrebbero cambiare?",
    "trait": "Indice di attendibilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "validita",
      "desiderabilita"
    ]
  },
  {
    "id": 223,
    "key": "q223",
    "text": "Tendi ad attaccarti a oggetti o situazioni anche quando non sono più necessari?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 225,
    "key": "q225",
    "text": "Hai la sensazione, a volte, di parlare più del necessario?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 226,
    "key": "q226",
    "text": "Ti capita di attraversare periodi in cui sei particolarmente attivo ed energico?",
    "trait": "Estroversione e networking",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "relazione",
      "networking"
    ]
  },
  {
    "id": 227,
    "key": "q227",
    "text": "Ritieni che le persone intorno a te dovrebbero essere più responsabili?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 228,
    "key": "q228",
    "text": "Il disordine ti infastidisce al punto da spingerti a intervenire immediatamente?",
    "trait": "Organizzazione e metodo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "metodo"
    ]
  },
  {
    "id": 229,
    "key": "q229",
    "text": "Hai periodi di tristezza o calo emotivo senza una causa apparente?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 230,
    "key": "q230",
    "text": "Lavori da almeno due anni nella stessa azienda o organizzazione?",
    "trait": "Continuità professionale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "factual",
      "carriera"
    ]
  },
  {
    "id": 232,
    "key": "q232",
    "text": "Gli altri ti considerano una persona impulsiva?",
    "trait": "Autocontrollo e gestione emotiva",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "impulsivita"
    ]
  },
  {
    "id": 233,
    "key": "q233",
    "text": "Tendi a criticare gli errori delle altre persone?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 234,
    "key": "q234",
    "text": "Riesci a rispettare la scelta di qualcuno di lavorare in autonomia senza intervenire?",
    "trait": "Flessibilità e adattabilità",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "autonomia_altrui"
    ]
  },
  {
    "id": 235,
    "key": "q235",
    "text": "Ritieni che la tua situazione attuale dipenda principalmente da fattori esterni?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 236,
    "key": "q236",
    "text": "E’ importante per te valorizzare le persone?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 237,
    "key": "q237",
    "text": "Se una persona mantiene lo stesso livello di rendimento nel tempo, pensi che meriti comunque un riconoscimento?",
    "trait": "Empatia e collaborazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "empatia",
      "collaborazione"
    ]
  },
  {
    "id": 238,
    "key": "q238",
    "text": "Ti capita di sentirti più giù del solito quando il tempo è brutto o grigio? 239.Credi che un cliente vada sempre stupito, offrendo più di quanto si aspetta?",
    "trait": "Stabilità emotiva e fiducia",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rischio",
      "autoefficacia"
    ]
  },
  {
    "id": 240,
    "key": "q240",
    "text": "Ti infastidisce quando qualcuno continua a ripetere gli stessi errori, anche dopo averli fatti notare?",
    "trait": "Flessibilità e adattabilità",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "rigidita"
    ]
  },
  {
    "id": 241,
    "key": "q241",
    "text": "Un leader dovrebbe essere disposto a sacrificare il singolo per il bene del gruppo?",
    "trait": "Leadership e influenza",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "leadership"
    ]
  },
  {
    "id": 242,
    "key": "q242",
    "text": "Quando ti senti giù, hai un metodo concreto che ti aiuta a recuperare energia, fiducia e motivazione?",
    "trait": "Comportamento generale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "auto-mapped"
    ]
  },
  {
    "id": 243,
    "key": "q243",
    "text": "Nel tuo percorso professionale hai assunto responsabilità sempre maggiori nel tempo?",
    "trait": "Visione e orientamento al futuro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "tags": [
      "futuro",
      "progettualita"
    ]
  }
];

export function getQuestionTexts() {
  return Object.fromEntries(ZPI_QUESTIONS.map((q) => [q.key, q.text]));
}

export function getScoredQuestions() {
  return ZPI_QUESTIONS.filter((q) => q.scored !== false);
}

export default ZPI_QUESTIONS;
