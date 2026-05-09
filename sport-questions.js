// Human & Sport Performance
// sport-questions.js
// Popolato da "Sport definitivo questionario.pdf".
// Nota: nel PDF la domanda "C’è qualcuno..." è numerata di nuovo 40; qui è mantenuta come "40-bis" con key s40b per non creare collisioni.

export const SPORT_TRAITS = [
  "Goal setting",
  "Automotivazione",
  "Eustress",
  "Gestione delle pressioni",
  "Leadership naturale",
  "Affidabilità ed etica personale",
  "Proattività e capacità di adattamento",
  "Resistenza al cambiamento",
  "Sacrificio e lavoro duro",
  "Lavoro di squadra e ascolto attivo",
  "Equilibrio vita personale e gestione del tempo",
  "Responsabilità economica sportiva",
  "Mentalità vincente e disciplina",
  "Valori sportivi e crescita personale"
];

export const SPORT_RESPONSE_OPTIONS = [
  {
    "value": "agree",
    "label": "Sì, oppure tendenzialmente sì"
  },
  {
    "value": "uncertain",
    "label": "Incerto / non saprei"
  },
  {
    "value": "disagree",
    "label": "No, oppure tendenzialmente no"
  }
];

export const SPORT_QUESTIONS = [
  {
    "id": 1,
    "key": "s1",
    "text": "Quanto spesso ti poni obiettivi precisi e misurabili da raggiungere entro la settimana, sia negli allenamenti che nelle partite?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 2,
    "key": "s2",
    "text": "Ti capita di scrivere o segnare su un quaderno o sul cellulare i tuoi obiettivi sportivi per monitorarli nel tempo?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 3,
    "key": "s3",
    "text": "In che misura consideri importante avere obiettivi a medio termine, come migliorare in un aspetto tecnico durante la stagione?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 4,
    "key": "s4",
    "text": "Quanto pensi a obiettivi di lungo termine, ad esempio costruire una carriera sportiva solida o arrivare a un determinato livello di campionato?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 5,
    "key": "s5",
    "text": "Riesci a mantenere alta la motivazione anche quando gli obiettivi che ti poni sembrano lontani o difficili da raggiungere?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 6,
    "key": "s6",
    "text": "Quanto spesso rivedi i tuoi obiettivi in base ai cambiamenti di squadra, di ruolo o di allenatore?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 7,
    "key": "s7",
    "text": "Ti capita di condividere con il mister i tuoi obiettivi personali per ricevere consigli o conferme?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 8,
    "key": "s8",
    "text": "Quanto gli obiettivi collettivi della squadra vengono per te prima di quelli personali?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 9,
    "key": "s9",
    "text": "Quando raggiungi un obiettivo, senti il bisogno di fissarne subito un altro per continuare a crescere?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 10,
    "key": "s10",
    "text": "Quanto gli obiettivi che ti poni ti aiutano a rimanere disciplinato nella vita quotidiana e sportiva?",
    "trait": "Goal setting",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 11,
    "key": "s11",
    "text": "Riesci a trarre motivazione anche da sfide che inizialmente appaiono impossibili?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 12,
    "key": "s12",
    "text": "Ti capita di automotivarti attraverso frasi, immagini o ricordi che ti spingono ad andare avanti?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 13,
    "key": "s13",
    "text": "In che misura il pensiero del tuo percorso sportivo ti stimola a continuare anche nei momenti difficili?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 14,
    "key": "s14",
    "text": "Sei capace di riconoscere i tuoi progressi passo dopo passo anche se l’obiettivo finale non è ancora stato raggiunto?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 15,
    "key": "s15",
    "text": "Ti capita di premiarti con piccoli gesti quando raggiungi un traguardo, per rinforzare la motivazione?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 16,
    "key": "s16",
    "text": "Quanto ritieni che la tua motivazione interiore sia indipendente da quella dei compagni o dall’approvazione esterna?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 17,
    "key": "s17",
    "text": "Riesci a trovare energia anche nei momenti in cui nessuno ti spinge o ti controlla?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 18,
    "key": "s18",
    "text": "Ti capita di visualizzare mentalmente i tuoi obiettivi come se fossero già stati raggiunti?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 19,
    "key": "s19",
    "text": "Quanto ti senti gratificato quando raggiungi piccoli obiettivi giornalieri che ti portano a grandi traguardi?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 20,
    "key": "s20",
    "text": "Pensi che la chiarezza degli obiettivi personali sia alla base di una mentalità vincente?",
    "trait": "Automotivazione",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 21,
    "key": "s21",
    "text": "Lo stress pre-partita ti carica positivamente e ti dà energia per affrontare al meglio la gara?",
    "trait": "Eustress",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 22,
    "key": "s22",
    "text": "Riesci a trasformare la tensione in una spinta utile per migliorare la tua prestazione?",
    "trait": "Eustress",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 23,
    "key": "s23",
    "text": "Accetti lo stress come parte integrante del calcio e cerchi di gestirlo senza subirlo?",
    "trait": "Eustress",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 24,
    "key": "s24",
    "text": "Senti che la pressione, anziché frenarti, ti aiuta a dare il massimo in campo?",
    "trait": "Eustress",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 25,
    "key": "s25",
    "text": "Riesci a gestire con calma e lucidità le aspettative del mister su di te?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 26,
    "key": "s26",
    "text": "Nei momenti difficili della partita riesci a mantenere concentrazione senza crollare emotivamente?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 27,
    "key": "s27",
    "text": "Dopo un errore in campo, riesci a ritrovare subito la concentrazione necessaria per continuare a giocare?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 28,
    "key": "s28",
    "text": "Sai accettare le critiche senza abbatterti e le usi per migliorare?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 29,
    "key": "s29",
    "text": "Ti capita di non farti trascinare da emozioni negative come rabbia o frustrazione?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 30,
    "key": "s30",
    "text": "Riesci a mantenere la lucidità nelle partite più importanti e decisive?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 31,
    "key": "s31",
    "text": "La pressione del pubblico ti stimola a rendere meglio piuttosto che bloccarti?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 32,
    "key": "s32",
    "text": "Non ti lasci distrarre dalle provocazioni degli avversari e mantieni autocontrollo?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 33,
    "key": "s33",
    "text": "Consideri le difficoltà come un’occasione per crescere e migliorare?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 34,
    "key": "s34",
    "text": "Riesci a non portare in campo i problemi personali e a separarli dal calcio?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 35,
    "key": "s35",
    "text": "Dopo una sconfitta, cerchi di imparare dagli errori piuttosto che abbatterti?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 36,
    "key": "s36",
    "text": "Nei momenti di rabbia riesci a mantenere autocontrollo senza reazioni impulsive?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 37,
    "key": "s37",
    "text": "Accetti la fatica e lo sforzo fisico come parte inevitabile del gioco?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 38,
    "key": "s38",
    "text": "Ti consideri una persona mentalmente resistente e difficile da abbattere?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 39,
    "key": "s39",
    "text": "Riesci a rialzarti e ritrovare fiducia dopo un infortunio o un fallimento?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 40,
    "key": "s40",
    "text": "Per te la resilienza significa continuare ad andare avanti anche nelle difficoltà?",
    "trait": "Gestione delle pressioni",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": "40-bis",
    "key": "s40b",
    "text": "C’è qualcuno nella tua vita personale o professionale rappresenta per te un fonte di preoccupazione?",
    "trait": "Gestione delle pressioni",
    "reverse": true,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 41,
    "key": "s41",
    "text": "Cerco di essere d’esempio ai compagni, attraverso il mio comportamento e il mio impegno dentro e fuori dal campo.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 42,
    "key": "s42",
    "text": "Mi assumo la responsabilità delle mie azioni e delle decisioni prese, soprattutto quando la squadra ne è coinvolta.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 43,
    "key": "s43",
    "text": "Non cerco di comandare, ma di guidare i compagni dando l’esempio con atteggiamento positivo e corretto.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 44,
    "key": "s44",
    "text": "Aiuto i compagni in difficoltà, sia a livello sportivo che personale, per creare un gruppo unito.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 45,
    "key": "s45",
    "text": "Accetto e rispetto i ruoli di leadership all’interno del gruppo, senza metterli in discussione inutilmente.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 46,
    "key": "s46",
    "text": "Cerco di motivare anche i compagni che giocano meno, per farli sentire parte integrante della squadra.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 47,
    "key": "s47",
    "text": "Mantengo sempre un atteggiamento positivo nello spogliatoio, evitando di trasmettere negatività.",
    "trait": "Leadership naturale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 48,
    "key": "s48",
    "text": "Non insulto o offendo avversari, arbitri o compagni, mantenendo sempre autocontrollo e rispetto.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 49,
    "key": "s49",
    "text": "Accetto la sconfitta con dignità, senza cercare scuse o dare la colpa agli altri.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 50,
    "key": "s50",
    "text": "Rispetto sempre gli impegni presi con la squadra e con la società.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 51,
    "key": "s51",
    "text": "Non cerco favoritismi o trattamenti speciali dal mister o dalla società.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 52,
    "key": "s52",
    "text": "Mantengo la mia parola data e mi impegno a rispettarla fino in fondo.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 53,
    "key": "s53",
    "text": "Non baro durante allenamenti o partite, rispettando sempre le regole del gioco.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 54,
    "key": "s54",
    "text": "Riconosco e rispetto i sacrifici economici e organizzativi che la società fa per la squadra.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 55,
    "key": "s55",
    "text": "Credo che l’etica sportiva sia più importante della vittoria a ogni costo.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 56,
    "key": "s56",
    "text": "Non parlo male dei compagni alle loro spalle e cerco di risolvere i conflitti apertamente.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 57,
    "key": "s57",
    "text": "Ritengo che rispettare arbitri e avversari sia fondamentale per il vero spirito sportivo.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 58,
    "key": "s58",
    "text": "Non tradisco mai la fiducia che i miei compagni ripongono in me.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 59,
    "key": "s59",
    "text": "Per me l’umiltà è un segno di forza e non di debolezza.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 60,
    "key": "s60",
    "text": "Sono convinto che il calcio, senza etica, perda gran parte del suo valore.",
    "trait": "Affidabilità ed etica personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 61,
    "key": "s61",
    "text": "Quando noto un problema o una difficoltà all’interno della squadra o durante una partita, mi impegno a proporre soluzioni pratiche invece di limitarmi a evidenziarlo.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 62,
    "key": "s62",
    "text": "Riesco ad adattarmi con rapidità a nuovi schemi tattici o a modifiche improvvise richieste dall’allenatore.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 63,
    "key": "s63",
    "text": "Accetto i cambiamenti organizzativi o tecnici senza lamentarmi, cercando di capirne l’utilità.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 64,
    "key": "s64",
    "text": "Non mi blocco davanti agli imprevisti, ma cerco di reagire con lucidità e spirito pratico.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 65,
    "key": "s65",
    "text": "Vedo ogni cambiamento come un’opportunità per crescere piuttosto che come una minaccia.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 66,
    "key": "s66",
    "text": "Accetto nuove sfide senza timori, affrontandole con determinazione.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 67,
    "key": "s67",
    "text": "Riesco a lavorare bene con compagni diversi da me per carattere o stile di gioco.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 68,
    "key": "s68",
    "text": "Cerco sempre il lato positivo nelle novità introdotte, anche se inizialmente non le comprendo.",
    "trait": "Proattività e capacità di adattamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 69,
    "key": "s69",
    "text": "Non mi oppongo al cambiamento solo per abitudine o per principio.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 70,
    "key": "s70",
    "text": "Reagisco in modo costruttivo anche quando le circostanze cambiano improvvisamente.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 71,
    "key": "s71",
    "text": "Sono disposto a cambiare ruolo o posizione in campo se la squadra lo richiede.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 72,
    "key": "s72",
    "text": "Non mi lamento se la formazione subisce variazioni rispetto alle mie aspettative.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 73,
    "key": "s73",
    "text": "Mi apro con disponibilità a nuove metodologie di allenamento o preparazione.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 74,
    "key": "s74",
    "text": "Accetto che la crescita sportiva e personale richieda cambiamenti costanti.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 75,
    "key": "s75",
    "text": "Non giudico negativamente ciò che è nuovo solo perché diverso da quello a cui ero abituato.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 76,
    "key": "s76",
    "text": "So rivedere le mie abitudini quotidiane e sportive per migliorare il mio rendimento.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 77,
    "key": "s77",
    "text": "Mi sforzo sempre di imparare qualcosa da ogni cambiamento.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 78,
    "key": "s78",
    "text": "Non mi spaventa affrontare l’ignoto, lo considero una possibilità di crescita.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 79,
    "key": "s79",
    "text": "Credo che l’adattabilità sia una delle forze principali di un atleta.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 80,
    "key": "s80",
    "text": "Mi considero una persona proattiva, sia nello sport che nella vita personale.",
    "trait": "Resistenza al cambiamento",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 81,
    "key": "s81",
    "text": "Accetti di sottoporti ad allenamenti duri e impegnativi senza protestare o cercare giustificazioni?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 82,
    "key": "s82",
    "text": "Cerchi di evitare scorciatoie oppure affronti ogni allenamento con serietà e dedizione?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 83,
    "key": "s83",
    "text": "Ti impegni anche negli esercizi che non ti piacciono particolarmente o che ritieni meno stimolanti?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 84,
    "key": "s84",
    "text": "Credi che soltanto attraverso il sacrificio e il duro lavoro si possa davvero crescere come atleta?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 85,
    "key": "s85",
    "text": "Sei disposto a non rinunciare davanti alla fatica, affrontandola come parte integrante del percorso sportivo?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 86,
    "key": "s86",
    "text": "Accetti di svolgere il cosiddetto 'lavoro sporco' in campo per aiutare la squadra anche senza ricevere riconoscimenti?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 87,
    "key": "s87",
    "text": "Non ricerchi solo la gloria personale ma anche l’impegno costante a favore del gruppo?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 88,
    "key": "s88",
    "text": "Dopo un allenamento particolarmente intenso, ti senti più forte e motivato?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 89,
    "key": "s89",
    "text": "Accetti le rinunce che il calcio comporta, come limitare uscite o divertimenti, per raggiungere i tuoi obiettivi?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 90,
    "key": "s90",
    "text": "Ti prepari mentalmente ad affrontare allenamenti o partite che richiedono grande sacrificio fisico e mentale?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 91,
    "key": "s91",
    "text": "Accetti di allenarti anche in condizioni difficili, come maltempo o campi non perfetti?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 92,
    "key": "s92",
    "text": "Eviti di trovare scuse per sottrarti alla fatica durante allenamenti o partite?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 93,
    "key": "s93",
    "text": "Credi che la costanza e l’impegno quotidiano valgano più del solo talento naturale?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 94,
    "key": "s94",
    "text": "Se serve, sei disposto a sacrificarti anche per il bene dei tuoi compagni di squadra?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 95,
    "key": "s95",
    "text": "Se la squadra ha bisogno, non ti tiri indietro e sei pronto a dare un impegno extra?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 96,
    "key": "s96",
    "text": "Consideri la fatica e il sacrificio come un investimento sul tuo futuro sportivo?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 97,
    "key": "s97",
    "text": "Sei disposto a rinunciare a comodità o abitudini personali pur di migliorare le tue prestazioni?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 98,
    "key": "s98",
    "text": "Credi che il sacrificio sia ciò che costruisce il carattere di un atleta vincente?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 99,
    "key": "s99",
    "text": "Sei disposto a lavorare anche al di fuori degli allenamenti ufficiali per migliorarti?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 100,
    "key": "s100",
    "text": "Pensi che la dedizione totale sia un valore assoluto nello sport?",
    "trait": "Sacrificio e lavoro duro",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 101,
    "key": "s101",
    "text": "Ascolto attentamente le indicazioni del mister e cerco di applicarle con precisione in allenamento e in partita.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 102,
    "key": "s102",
    "text": "Non interrompo chi parla, mostrando rispetto e attenzione per le opinioni degli altri.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 103,
    "key": "s103",
    "text": "Mostro interesse autentico per ciò che dicono i compagni, cercando di comprendere i loro punti di vista.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 104,
    "key": "s104",
    "text": "Chiedo chiarimenti quando non capisco qualcosa, senza vergognarmi di farlo.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 105,
    "key": "s105",
    "text": "Collaboro con tutti i compagni, indipendentemente dal ruolo o dall’esperienza.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 106,
    "key": "s106",
    "text": "Non escludo nessuno nelle attività di squadra, dentro e fuori dal campo.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 107,
    "key": "s107",
    "text": "Accetto suggerimenti costruttivi e li utilizzo per migliorarmi.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 108,
    "key": "s108",
    "text": "So mettere da parte l’orgoglio per il bene del gruppo.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 109,
    "key": "s109",
    "text": "Condivido informazioni utili con i compagni per facilitare il lavoro di squadra.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 110,
    "key": "s110",
    "text": "Cerco di comprendere diversi punti di vista, anche quando non coincidono con i miei.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 111,
    "key": "s111",
    "text": "Rispetto i ruoli nello spogliatoio e sul campo, senza contestare inutilmente.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 112,
    "key": "s112",
    "text": "Mi adatto alle decisioni prese dal gruppo o dal mister anche se non sempre le condivido.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 113,
    "key": "s113",
    "text": "Non porto rancore dopo discussioni o litigi con i compagni.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 114,
    "key": "s114",
    "text": "Aiuto i nuovi arrivati a integrarsi e sentirsi parte del gruppo.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 115,
    "key": "s115",
    "text": "Mantengo un atteggiamento positivo che favorisca la coesione della squadra.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 116,
    "key": "s116",
    "text": "Credo che l’unione e la collaborazione siano fondamentali per il successo collettivo.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 117,
    "key": "s117",
    "text": "Non giudico i compagni in base al livello tecnico, ma per l’impegno e l’atteggiamento.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 118,
    "key": "s118",
    "text": "Non cerco di primeggiare a discapito del gruppo, ma di crescere insieme a esso.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 119,
    "key": "s119",
    "text": "Credo che ascolto e spirito di squadra siano la chiave per affrontare anche le sfide più difficili.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 120,
    "key": "s120",
    "text": "Mi sento parte integrante di una vera e propria famiglia sportiva quando gioco nella mia squadra.",
    "trait": "Lavoro di squadra e ascolto attivo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 121,
    "key": "s121",
    "text": "Organizzo bene il tempo tra sport e vita privata.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 122,
    "key": "s122",
    "text": "Non trascuro la famiglia per il calcio.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 123,
    "key": "s123",
    "text": "Gestisco bene lo studio/lavoro insieme al calcio.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 124,
    "key": "s124",
    "text": "Mantengo equilibrio tra sport e amicizie.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 125,
    "key": "s125",
    "text": "Non mi lascio andare a eccessi notturni.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 126,
    "key": "s126",
    "text": "Dormo le ore necessarie per recuperare.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 127,
    "key": "s127",
    "text": "Programmo i pasti in funzione degli allenamenti.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 128,
    "key": "s128",
    "text": "Mi impegno a rispettare il mio corpo e a fare scelte che favoriscono salute, lucidità e concentrazione.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 129,
    "key": "s129",
    "text": "Uso in modo equilibrato i social media.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 130,
    "key": "s130",
    "text": "Cerco di avere relazioni sane fuori dal campo.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 131,
    "key": "s131",
    "text": "Non porto conflitti personali nello spogliatoio.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 132,
    "key": "s132",
    "text": "Dedico tempo a riposo e recupero.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 133,
    "key": "s133",
    "text": "Riesco a proteggere la mia concentrazione e il mio stile di vita, evitando ciò che potrebbe farmi perdere energia o lucidità.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 134,
    "key": "s134",
    "text": "Mi circondo di persone positive.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 135,
    "key": "s135",
    "text": "Gestisco bene lo stress della vita quotidiana.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 136,
    "key": "s136",
    "text": "Non rinuncio agli affetti importanti.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 137,
    "key": "s137",
    "text": "Cerco di crescere come persona oltre che atleta.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 138,
    "key": "s138",
    "text": "Mantengo equilibrio tra vita privata e sportiva.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 139,
    "key": "s139",
    "text": "Credo che disciplina personale migliori anche lo sport in generale.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 140,
    "key": "s140",
    "text": "Mi sento responsabile delle mie scelte nella vita quotidiana.",
    "trait": "Equilibrio vita personale e gestione del tempo",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 141,
    "key": "s141",
    "text": "Gestisci in modo responsabile i tuoi rimborsi o compensi economici legati all’attività calcistica?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 142,
    "key": "s142",
    "text": "Eviti di spendere immediatamente tutto ciò che ricevi, cercando di risparmiare o investire una parte?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 143,
    "key": "s143",
    "text": "Sai distinguere chiaramente tra spese utili per la tua crescita sportiva e spese superflue?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 144,
    "key": "s144",
    "text": "Rispetti sempre gli accordi economici presi con la società o con i tuoi compagni di squadra?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 145,
    "key": "s145",
    "text": "Eviti di confrontare continuamente il tuo compenso con quello degli altri giocatori?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 146,
    "key": "s146",
    "text": "Riesci a non lamentarti costantemente di questioni economiche, mantenendo un atteggiamento equilibrato?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 147,
    "key": "s147",
    "text": "Comprendi e rispetti i sacrifici economici che la società sostiene per mantenere la squadra?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 148,
    "key": "s148",
    "text": "Eviti di sprecare risorse come acqua, materiale tecnico o attrezzature della squadra?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 149,
    "key": "s149",
    "text": "Accetti e rispetti le regole economiche stabilite dal gruppo o dalla società?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 150,
    "key": "s150",
    "text": "Vedi il denaro come una conseguenza naturale dell’impegno e della serietà sportiva, e non come unico obiettivo?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 151,
    "key": "s151",
    "text": "Non anteponi mai il guadagno alla passione e all’impegno verso lo sport?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 152,
    "key": "s152",
    "text": "Ti senti grato alla società per ciò che ricevi, indipendentemente dall’entità economica?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 153,
    "key": "s153",
    "text": "Sei in grado di gestire con responsabilità anche piccole somme di denaro?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 154,
    "key": "s154",
    "text": "Eviti di usare il denaro come strumento per vantarti o sentirti superiore agli altri?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 155,
    "key": "s155",
    "text": "Se hai la possibilità, sei disposto ad aiutare chi ha difficoltà economiche all’interno del gruppo?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 156,
    "key": "s156",
    "text": "Credi che il denaro debba essere sempre guadagnato con merito e sacrificio, e non attraverso scorciatoie?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 157,
    "key": "s157",
    "text": "Eviti di prendere decisioni basate esclusivamente sul guadagno economico?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 158,
    "key": "s158",
    "text": "Accetti che il budget della società o della squadra possa avere dei limiti?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 159,
    "key": "s159",
    "text": "Per te l’etica e i valori sportivi vengono sempre prima dell’aspetto economico?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 160,
    "key": "s160",
    "text": "Credi che la serietà e la trasparenza nella gestione economica portino benefici anche a lungo termine?",
    "trait": "Responsabilità economica sportiva",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 161,
    "key": "s161",
    "text": "Quanto ritieni importante essere puntuale a ogni impegno sportivo, dagli allenamenti alle partite, per dimostrare serietà e rispetto verso compagni e staff?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 162,
    "key": "s162",
    "text": "Ti assicuri sempre di avere con te tutto il materiale sportivo necessario, evitando dimenticanze che possano compromettere la tua prestazione o quella della squadra?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 163,
    "key": "s163",
    "text": "Mantieni ordine e cura nel tuo armadietto e nel materiale personale, come segno di disciplina e organizzazione?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 164,
    "key": "s164",
    "text": "Segui con attenzione e costanza le regole e le linee guida stabilite dalla squadra, anche quando non vengono controllate direttamente?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 165,
    "key": "s165",
    "text": "Eviti di trovare scuse se arrivi in ritardo, assumendoti la responsabilità delle tue azioni senza scaricare colpe all’esterno?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 166,
    "key": "s166",
    "text": "Comunichi subito eventuali imprevisti che ti impediscono di rispettare gli impegni, per rispetto verso i compagni e lo staff tecnico?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 167,
    "key": "s167",
    "text": "Riesci a mantenere la calma e il controllo anche nelle discussioni accese, evitando comportamenti impulsivi che potrebbero danneggiare il gruppo?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 168,
    "key": "s168",
    "text": "Rispetti le gerarchie interne della squadra, comprendendo il ruolo del mister, dei capitani e dei compagni più esperti?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 169,
    "key": "s169",
    "text": "Ti impegni a non portare disordine o caos nello spogliatoio, contribuendo invece a creare un ambiente positivo e collaborativo?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 170,
    "key": "s170",
    "text": "Rispetti sempre arbitri e ufficiali di gara, indipendentemente dalle decisioni prese, anche quando non le condividi?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 171,
    "key": "s171",
    "text": "Accetti le decisioni del mister senza polemizzare eccessivamente, cercando di dimostrare sul campo il tuo valore?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 172,
    "key": "s172",
    "text": "Non abbandoni mai mentalmente la partita, anche nei momenti più difficili o quando il risultato sembra compromesso?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 173,
    "key": "s173",
    "text": "Mantieni un comportamento corretto e responsabile anche fuori dal campo, consapevole di rappresentare la tua squadra nella vita quotidiana?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 174,
    "key": "s174",
    "text": "Eviti di frequentare ambienti o contesti che possano danneggiare la tua immagine sportiva o compromettere la tua forma fisica?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 175,
    "key": "s175",
    "text": "Ti sforzi di non utilizzare linguaggi offensivi o discriminatori, sia verso compagni e avversari che al di fuori del contesto sportivo?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 176,
    "key": "s176",
    "text": "Mantieni sempre fede agli impegni presi con compagni, staff e società, senza tirarti indietro all’ultimo momento?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 177,
    "key": "s177",
    "text": "Ti impegni a dare l’esempio di disciplina e serietà agli altri, in particolare ai compagni più giovani?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 178,
    "key": "s178",
    "text": "Accetti le correzioni e i feedback senza reagire con fastidio o rabbia, utilizzandoli come occasione di crescita personale e sportiva?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 179,
    "key": "s179",
    "text": "Credi che la disciplina quotidiana sia il fondamento principale per costruire risultati sportivi duraturi?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 180,
    "key": "s180",
    "text": "Ti senti orgoglioso e motivato quando riesci a rispettare con costanza le regole e i valori della tua squadra?",
    "trait": "Mentalità vincente e disciplina",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 181,
    "key": "s181",
    "text": "Credo che lo sport migliori la mia vita non solo a livello fisico ma anche personale, aiutandomi a crescere come individuo.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 182,
    "key": "s182",
    "text": "Imparo dal calcio valori fondamentali che mi servono anche nella vita quotidiana, come il rispetto e la disciplina.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 183,
    "key": "s183",
    "text": "Cerco costantemente di crescere come persona oltre che come atleta, imparando dalle mie esperienze.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 184,
    "key": "s184",
    "text": "Lavoro anche sul mio carattere e sulla mia personalità, non limitandomi al solo miglioramento fisico.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 185,
    "key": "s185",
    "text": "Credo che l’umiltà sia una qualità indispensabile per ogni sportivo, indipendentemente dal livello raggiunto.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 186,
    "key": "s186",
    "text": "Non inseguo la gloria personale a tutti i costi, ma penso prima al valore della squadra e alla correttezza.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 187,
    "key": "s187",
    "text": "Il rispetto per gli altri, siano essi compagni, avversari o arbitri, per me è un valore assoluto.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 188,
    "key": "s188",
    "text": "Non porto rancore nelle relazioni personali o sportive, ma cerco sempre di ripartire con serenità.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 189,
    "key": "s189",
    "text": "Credo che la coerenza tra ciò che dico e ciò che faccio valga più di mille parole.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 190,
    "key": "s190",
    "text": "Non tradisco mai i valori fondamentali che mi sono stati insegnati dalla mia famiglia e dal mio percorso di vita.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 191,
    "key": "s191",
    "text": "Sono convinto che i valori sportivi possano essere applicati anche fuori dal campo in ogni ambito della vita.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 192,
    "key": "s192",
    "text": "Mantengo sempre la mia integrità morale, sia nelle situazioni sportive sia in quelle quotidiane.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 193,
    "key": "s193",
    "text": "Cerco continuamente di essere una persona migliore, dentro e fuori dal campo.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 194,
    "key": "s194",
    "text": "Non accetto compromessi che possano abbassare i miei principi o la mia dignità personale.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 195,
    "key": "s195",
    "text": "Credo che il vero coraggio stia nel restare coerente ai propri valori anche nei momenti difficili.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 196,
    "key": "s196",
    "text": "Ritengo che la vera vittoria non sia solo sul campo, ma anche nella crescita come uomo.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 197,
    "key": "s197",
    "text": "Non rinuncio mai ai miei principi, anche se questo comporta sacrifici.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 198,
    "key": "s198",
    "text": "Credo che i valori personali e sportivi siano più forti delle difficoltà che si incontrano.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 199,
    "key": "s199",
    "text": "Mi impegno a trasmettere i valori positivi dello sport ai più giovani e a chi mi guarda come esempio.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  },
  {
    "id": 200,
    "key": "s200",
    "text": "Sono convinto che lo sport senza valori etici e morali perda il suo significato più profondo.",
    "trait": "Valori sportivi e crescita personale",
    "reverse": false,
    "responseType": "likert",
    "scored": true,
    "options": [
      {
        "value": "agree",
        "label": "Sì, oppure tendenzialmente sì"
      },
      {
        "value": "uncertain",
        "label": "Incerto / non saprei"
      },
      {
        "value": "disagree",
        "label": "No, oppure tendenzialmente no"
      }
    ],
    "tags": [
      "sport",
      "human-performance"
    ]
  }
];

export function getSportQuestionTexts() {
  return Object.fromEntries(SPORT_QUESTIONS.map((q) => [q.key, q.text]));
}

export function getSportScoredQuestions() {
  return SPORT_QUESTIONS.filter((q) => q.scored !== false);
}

export default SPORT_QUESTIONS;