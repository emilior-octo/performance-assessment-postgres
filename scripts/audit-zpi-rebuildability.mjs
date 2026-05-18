import { PrismaClient } from "@prisma/client";
import { getScoredQuestions } from "../questions.js";

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

function decodeMojibake(value = "") {
  let text = String(value || "").trim();

  try {
    const decoded = Buffer.from(text, "latin1").toString("utf8");
    const badBefore = (text.match(/[ÃÂâ�]/g) || []).length;
    const badAfter = (decoded.match(/[ÃÂâ�]/g) || []).length;

    if (badAfter < badBefore || /[àèéìòùÀÈÉÌÒÙ’“”–—™€]/.test(decoded)) {
      text = decoded;
    }
  } catch {}

  return text
    .replaceAll("Ã ", "à")
    .replaceAll("Ã²", "ò")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¬", "ì")
    .replaceAll("Ã¹", "ù")
    .replaceAll("Â", "")
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â„¢", "™")
    .trim();
}

function fixName(name = "") {
  const text = decodeMojibake(name);

  const aliases = {
    "Affidabilità + autodisciplina": "Affidabilità",
    "Affidabilità ed etica personale": "Affidabilità",

    "Responsabilità e ownership": "Responsabilità",
    "Proattività e capacità di adattamento": "Responsabilità",

    "Stabilità emotiva e fiducia": "Sicurezza",
    "Fiducia relazionale e sicurezza sociale": "Sicurezza",
    "Sensibilità al riconoscimento": "Sicurezza",

    "Assertività e negoziazione": "Flessibilità comunicativa",

    "Ambizione e competitività": "Automotivazione",

    "Creatività e innovazione": "Dinamismo",

    "Indice di attendibilità": "Attendibilità",

    "Flessibilità e adattabilità": "Resistenza al cambiamento",

    "Continuità professionale": "Affidabilità",

    "Organizzazione e metodo": "Organizzazione e pianificazione",
    "Visione e orientamento al futuro": "Automotivazione",

    "Gestione della pressione": "Stress",
    "Gestione delle pressioni": "Stress",
    "Eustress": "Stress",
    "Autocontrollo e gestione emotiva": "Stress",

    "Energia sociale e comunicazione": "Dinamismo",

    "Empatia e collaborazione": "Ascolto attivo",
    "Lavoro di squadra e ascolto attivo": "Ascolto attivo",

    "Estroversione e networking": "Espansività",

    "Leadership e influenza": "Leadership naturale",

    "Orientamento alla performance": "Management",

    "Autonomia economica e iniziativa": "Capacità di gestione finanziaria",
    "Responsabilità economica sportiva": "Capacità di gestione finanziaria"
  };

  return aliases[text] || text;
}

const scoredKeys = getScoredQuestions().map(q => q.key);

const rows = await prisma.assessment.findMany({
  include: { result: true },
  orderBy: { createdAt: "desc" },
  take: 100
});

let broken = 0;

for (const a of rows) {
  const payload = a.result?.traitsJson || {};
  const assessmentType = a.assessmentType || payload.assessmentType || "zpi_hr";

  if (assessmentType !== "zpi_hr") {
    continue;
  }

  const raw = Array.isArray(payload.traits) ? payload.traits : [];
  const names = raw.map(t => fixName(t.name));

  const traitNames = [...new Set(names.filter(n => TRAITS.includes(n)))];
  const paramNames = [...new Set(names.filter(n => PARAMS.includes(n)))];

  const missingTraits = TRAITS.filter(n => !traitNames.includes(n));
  const missingParams = PARAMS.filter(n => !paramNames.includes(n));

  const answers = a.result?.answersJson || {};
  const answeredKeys = Object.keys(answers).filter(k => answers[k]);
  const validScoredAnswers = scoredKeys.filter(k => answers[k]);

  if (missingTraits.length || missingParams.length) {
    broken++;

    console.log("");
    console.log("ASSESSMENT:", a.id);
    console.log("Nome:", a.respondentName);
    console.log("Data:", a.createdAt);
    console.log("Ruolo:", a.requestedRole);
    console.log("assessmentType:", assessmentType);
    console.log("traitsJson.traits raw count:", raw.length);
    console.log("Tratti riconosciuti:", traitNames.length + "/11", traitNames);
    console.log("Parametri riconosciuti:", paramNames.length + "/9", paramNames);
    console.log("Mancano tratti:", missingTraits);
    console.log("Mancano parametri:", missingParams);
    console.log("answersJson keys totali:", answeredKeys.length);
    console.log("risposte valide su domande scored:", validScoredAnswers.length + "/" + scoredKeys.length);
    console.log("Nomi normalizzati:", names);
  }
}

console.log("");
console.log("Totale assessment ZPI controllati:", rows.filter(a => (a.assessmentType || a.result?.traitsJson?.assessmentType || "zpi_hr") === "zpi_hr").length);
console.log("Assessment ZPI ancora con tratti/parametri mancanti:", broken);

await prisma.$disconnect();
