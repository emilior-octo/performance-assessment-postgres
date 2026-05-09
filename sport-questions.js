// Human & Sport Performance
// Placeholder tecnico: sostituire SPORT_QUESTIONS con le domande definitive del questionario sportivo.
// La struttura è identica a questions.js per permettere al motore multi-assessment di funzionare senza cambiare le view.

export const SPORT_TRAITS = [
  "Disciplina sportiva",
  "Gestione pressione agonistica",
  "Motivazione e obiettivi",
  "Collaborazione e squadra",
  "Leadership sportiva",
  "Resilienza",
  "Concentrazione",
  "Energia e recupero"
];

export const SPORT_QUESTIONS = [
  {
    id: 1,
    key: "s1",
    text: "Riesco a mantenere concentrazione e lucidità anche nei momenti più intensi della prestazione sportiva.",
    trait: "Gestione pressione agonistica",
    reverse: false,
    responseType: "likert",
    scored: true,
    tags: ["sport", "pressione"]
  },
  {
    id: 2,
    key: "s2",
    text: "Seguo con costanza programmi di allenamento, recupero e preparazione anche quando non ho risultati immediati.",
    trait: "Disciplina sportiva",
    reverse: false,
    responseType: "likert",
    scored: true,
    tags: ["sport", "disciplina"]
  },
  {
    id: 3,
    key: "s3",
    text: "Quando ricevo una critica tecnica, riesco a trasformarla rapidamente in un miglioramento concreto.",
    trait: "Resilienza",
    reverse: false,
    responseType: "likert",
    scored: true,
    tags: ["sport", "resilienza"]
  }
];

export function getSportQuestionTexts() {
  return Object.fromEntries(SPORT_QUESTIONS.map((q) => [q.key, q.text]));
}

export function getSportScoredQuestions() {
  return SPORT_QUESTIONS.filter((q) => q.scored !== false);
}

export default SPORT_QUESTIONS;
