import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRAITS = [
  "Organizzazione e pianificazione",
  "Automotivazione",
  "Affidabilità",
  "Sicurezza",
  "Stress",
  "Dinamismo",
  "Flessibilità comunicativa",
  "Responsabilità",
  "Ascolto attivo",
  "Comprensione",
  "Espansività"
];

const PARAMS = [
  "Resistenza al cambiamento",
  "Leadership naturale",
  "Management",
  "Cooperazione",
  "Principi",
  "Vendite",
  "Gestione priorità",
  "Capacità di gestione finanziaria",
  "Attendibilità"
];

function fixName(name = "") {
  return String(name)
    .replaceAll("Affidabilità + autodisciplina", "Affidabilità")
    .replaceAll("AffidabilitÃ  + autodisciplina", "Affidabilità")
    .replaceAll("AffidabilitÃ  + autodisciplina", "Affidabilità")
    .replaceAll("ResponsabilitÃ ", "Responsabilità")
    .replaceAll("ResponsabilitÃ ", "Responsabilità")
    .replaceAll("FlessibilitÃ  comunicativa", "Flessibilità comunicativa")
    .replaceAll("FlessibilitÃ  comunicativa", "Flessibilità comunicativa")
    .replaceAll("EspansivitÃ ", "Espansività")
    .replaceAll("EspansivitÃ ", "Espansività")
    .replaceAll("Gestione prioritÃ ", "Gestione priorità")
    .replaceAll("Gestione prioritÃ ", "Gestione priorità")
    .replaceAll("CapacitÃ  di gestione finanziaria", "Capacità di gestione finanziaria")
    .replaceAll("CapacitÃ  di gestione finanziaria", "Capacità di gestione finanziaria")
    .replaceAll("AttendibilitÃ ", "Attendibilità")
    .replaceAll("AttendibilitÃ ", "Attendibilità")
    .replaceAll("Continuità professionale", "Affidabilità")
    .replaceAll("Organizzazione e metodo", "Organizzazione e pianificazione")
    .replaceAll("Visione e orientamento al futuro", "Automotivazione")
    .replaceAll("Gestione della pressione", "Stress")
    .replaceAll("Autocontrollo e gestione emotiva", "Stress")
    .replaceAll("Energia sociale e comunicazione", "Dinamismo")
    .replaceAll("Assertività e negoziazione", "Flessibilità comunicativa")
    .replaceAll("Empatia e collaborazione", "Ascolto attivo")
    .replaceAll("Estroversione e networking", "Espansività")
    .replaceAll("Leadership e influenza", "Leadership naturale")
    .replaceAll("Orientamento alla performance", "Management")
    .replaceAll("Autonomia economica e iniziativa", "Capacità di gestione finanziaria")
    .trim();
}

const rows = await prisma.assessment.findMany({
  include: { result: true },
  orderBy: { createdAt: "desc" },
  take: 100
});

let broken = 0;

for (const a of rows) {
  const payload = a.result?.traitsJson || {};
  const raw = Array.isArray(payload.traits) ? payload.traits : [];
  const names = raw.map(t => fixName(t.name));

  const traitNames = [...new Set(names.filter(n => TRAITS.includes(n)))];
  const paramNames = [...new Set(names.filter(n => PARAMS.includes(n)))];

  const missingTraits = TRAITS.filter(n => !traitNames.includes(n));
  const missingParams = PARAMS.filter(n => !paramNames.includes(n));

  if (missingTraits.length || missingParams.length) {
    broken++;

    console.log("");
    console.log("ASSESSMENT:", a.id);
    console.log("Nome:", a.respondentName);
    console.log("Data:", a.createdAt);
    console.log("Ruolo:", a.requestedRole);
    console.log("Tratti:", traitNames.length + "/11", traitNames);
    console.log("Parametri:", paramNames.length + "/9", paramNames);
    console.log("Mancano tratti:", missingTraits);
    console.log("Mancano parametri:", missingParams);
    console.log("Nomi raw DB:", raw.map(t => t.name));
  }
}

console.log("");
console.log("Totale assessment controllati:", rows.length);
console.log("Assessment con tratti/parametri mancanti:", broken);

await prisma.$disconnect();
