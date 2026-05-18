import { getScoredQuestions } from "../questions.js";

const DIMENSION_KEYS = new Set([
  "Organizzazione e metodo",
  "Visione e orientamento al futuro",
  "Ambizione e competitività",
  "Indice di attendibilità",
  "Continuità professionale",
  "Responsabilità e ownership",
  "Stabilità emotiva e fiducia",
  "Fiducia relazionale e sicurezza sociale",
  "Gestione della pressione",
  "Autocontrollo e gestione emotiva",
  "Energia sociale e comunicazione",
  "Flessibilità e adattabilità",
  "Assertività e negoziazione",
  "Empatia e collaborazione",
  "Estroversione e networking",
  "Leadership e influenza",
  "Orientamento alla performance",
  "Sensibilità al riconoscimento",
  "Autonomia economica e iniziativa",
  "Creatività e innovazione",
  "Comportamento generale",
  "Contesto ruolo"
]);

const counts = new Map();

for (const q of getScoredQuestions()) {
  const trait = String(q.trait || "NO_TRAIT").trim();
  counts.set(trait, (counts.get(trait) || 0) + 1);
}

console.log("SOURCE TRAITS IN questions.js");
console.log("");

for (const [trait, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const status = DIMENSION_KEYS.has(trait) ? "OK" : "NON MAPPATO";
  console.log(`${String(count).padStart(3, " ")} | ${status.padEnd(12)} | ${trait}`);
}
