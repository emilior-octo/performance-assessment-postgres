import "dotenv/config";
import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import PDFDocument from "pdfkit";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { ZPI_QUESTIONS, getScoredQuestions } from "./questions.js";

const prisma = new PrismaClient();

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me-now",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentAdmin = req.session?.admin || null;
  next();
});

const ROLE_OPTIONS = [
  { value: "direzione", label: "Direzione / Imprenditore" },
  { value: "manager", label: "Manager / Responsabile di funzione" },
  { value: "sales", label: "Sales / Commerciale" },
  { value: "marketing", label: "Marketing / Comunicazione" },
  { value: "amministrativo", label: "Amministrazione / Finance" },
  { value: "operations", label: "Operations / Produzione / Logistica" },
  { value: "customer_service", label: "Customer service / Post-vendita" },
  { value: "hr", label: "HR / People" },
  { value: "it_digital", label: "IT / Digital / Project" },
  { value: "altro", label: "Altro" }
];

function normalizeRequestedRole(bodyRole, bodyOtherRole, fallbackRole) {
  const role = String(bodyRole || "").trim();
  const other = String(bodyOtherRole || "").trim();

  if (role === "altro") return other || "Altro";
  return role || fallbackRole || "non_specificato";
}


const DIMENSION_CATEGORY = {
  TRAIT: "trait",
  ADDITIONAL: "additional"
};

const TRAIT_DIMENSIONS = [
  "Organizzazione e pianificazione",
  "Automotivazione",
  "Affidabilità + autodisciplina",
  "Sicurezza",
  "Stress",
  "Dinamismo",
  "Flessibilità comunicativa",
  "Responsabilità",
  "Ascolto attivo",
  "Comprensione",
  "Espansività"
];

const ADDITIONAL_PARAMETER_DIMENSIONS = [
  "Resistenza al cambiamento",
  "Leadership naturale",
  "Management",
  "Cooperazione",
  "Principi",
  "Vendite",
  "Gestione priorità",
  "Attuabilità",
  "Emotiva"
];

const DIMENSION_ORDER = new Map(
  [...TRAIT_DIMENSIONS, ...ADDITIONAL_PARAMETER_DIMENSIONS].map((name, index) => [name, index])
);

const DIMENSION_DEFINITIONS = {
  "Organizzazione e metodo": [
    { name: "Organizzazione e pianificazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Gestione priorità", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Visione e orientamento al futuro": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Ambizione e competitività": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Indice di attendibilità": [
    { name: "Affidabilità + autodisciplina", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Principi", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Continuità professionale": [
    { name: "Affidabilità + autodisciplina", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Responsabilità e ownership": [
    { name: "Responsabilità", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Stabilità emotiva e fiducia": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Emotiva", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Fiducia relazionale e sicurezza sociale": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Emotiva", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Gestione della pressione": [
    { name: "Stress", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Emotiva", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Autocontrollo e gestione emotiva": [
    { name: "Stress", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Emotiva", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Energia sociale e comunicazione": [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Flessibilità comunicativa", category: DIMENSION_CATEGORY.TRAIT }
  ],
  "Flessibilità e adattabilità": [
    { name: "Flessibilità comunicativa", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Resistenza al cambiamento", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Assertività e negoziazione": [
    { name: "Flessibilità comunicativa", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Empatia e collaborazione": [
    { name: "Ascolto attivo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Comprensione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Estroversione e networking": [
    { name: "Espansività", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Leadership e influenza": [
    { name: "Leadership naturale", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Responsabilità", category: DIMENSION_CATEGORY.TRAIT }
  ],
  "Orientamento alla performance": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Principi", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Sensibilità al riconoscimento": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Emotiva", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Autonomia economica e iniziativa": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Responsabilità", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Creatività e innovazione": [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attuabilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Comportamento generale": [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT }
  ],
  "Contesto ruolo": []
};

const HISTOGRAM_COLORS = {
  text: "#2B2B2B",
  mutedText: "#6B6B6B",
  axis: "#A8A8A8",
  track: "#EFEFEF",
  trackBorder: "#D8D8D8",
  low: "#D94B3D",
  medium: "#E5A43A",
  good: "#7EB26D",
  strong: "#3F8F68"
};

function normalizeDimensionDefinitions(originalTrait) {
  return DIMENSION_DEFINITIONS[originalTrait] || [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT }
  ];
}

function histogramColor(score) {
  if (score <= -15) return HISTOGRAM_COLORS.low;
  if (score < 15) return HISTOGRAM_COLORS.medium;
  if (score < 30) return HISTOGRAM_COLORS.good;
  return HISTOGRAM_COLORS.strong;
}

function splitDimensions(dimensions) {
  const list = Array.isArray(dimensions) ? dimensions : [];

  return {
    traits: list.filter((item) => item.category === DIMENSION_CATEGORY.TRAIT),
    additionalParameters: list.filter((item) => item.category === DIMENSION_CATEGORY.ADDITIONAL)
  };
}


function normalizeRoleKey(role) {
  const value = String(role || "").trim().toLowerCase();

  const directValues = new Set(ROLE_OPTIONS.map((item) => item.value));
  if (directValues.has(value)) return value;

  if (/direzione|imprenditore|ceo|founder|titolare/.test(value)) return "direzione";
  if (/manager|responsabile|store manager|coordinatore|coordinator/.test(value)) return "manager";
  if (/sales|commerciale|vendit|account/.test(value)) return "sales";
  if (/marketing|comunicazione|communication|brand/.test(value)) return "marketing";
  if (/amministr|finance|contabil|accounting/.test(value)) return "amministrativo";
  if (/operations|produzione|logistica|supply/.test(value)) return "operations";
  if (/customer|post.?vendita|assistenza|support/.test(value)) return "customer_service";
  if (/hr|people|risorse umane|recruit/.test(value)) return "hr";
  if (/it|digital|project|developer|ecommerce|e-commerce/.test(value)) return "it_digital";

  return "altro";
}

const ROLE_FIT_WEIGHTS = {
  direzione: {
    "Automotivazione": 1.35,
    "Responsabilità": 1.35,
    "Sicurezza": 1.2,
    "Flessibilità comunicativa": 1.15,
    "Organizzazione e pianificazione": 1.1,
    "Leadership naturale": 1.35,
    "Management": 1.3,
    "Attuabilità": 1.2,
    "Principi": 1.05
  },
  manager: {
    "Responsabilità": 1.35,
    "Organizzazione e pianificazione": 1.25,
    "Affidabilità + autodisciplina": 1.25,
    "Sicurezza": 1.1,
    "Ascolto attivo": 1.1,
    "Leadership naturale": 1.3,
    "Management": 1.35,
    "Gestione priorità": 1.25,
    "Cooperazione": 1.1
  },
  sales: {
    "Espansività": 1.35,
    "Flessibilità comunicativa": 1.3,
    "Dinamismo": 1.25,
    "Sicurezza": 1.2,
    "Automotivazione": 1.15,
    "Vendite": 1.45,
    "Ascolto attivo": 1.15,
    "Comprensione": 1.1,
    "Emotiva": 1.05
  },
  marketing: {
    "Dinamismo": 1.25,
    "Flessibilità comunicativa": 1.25,
    "Espansività": 1.15,
    "Automotivazione": 1.15,
    "Comprensione": 1.15,
    "Attuabilità": 1.25,
    "Vendite": 1.15,
    "Cooperazione": 1.1
  },
  amministrativo: {
    "Organizzazione e pianificazione": 1.45,
    "Affidabilità + autodisciplina": 1.4,
    "Responsabilità": 1.25,
    "Stress": 1.1,
    "Gestione priorità": 1.3,
    "Principi": 1.25,
    "Attuabilità": 1.2,
    "Resistenza al cambiamento": 0.85
  },
  operations: {
    "Organizzazione e pianificazione": 1.35,
    "Responsabilità": 1.3,
    "Affidabilità + autodisciplina": 1.25,
    "Stress": 1.15,
    "Dinamismo": 1.1,
    "Gestione priorità": 1.35,
    "Management": 1.15,
    "Attuabilità": 1.3,
    "Cooperazione": 1.1
  },
  customer_service: {
    "Ascolto attivo": 1.4,
    "Comprensione": 1.35,
    "Flessibilità comunicativa": 1.25,
    "Stress": 1.15,
    "Sicurezza": 1.1,
    "Cooperazione": 1.25,
    "Emotiva": 1.2,
    "Principi": 1.1
  },
  hr: {
    "Ascolto attivo": 1.4,
    "Comprensione": 1.35,
    "Flessibilità comunicativa": 1.2,
    "Sicurezza": 1.1,
    "Responsabilità": 1.1,
    "Cooperazione": 1.3,
    "Principi": 1.2,
    "Management": 1.1,
    "Emotiva": 1.1
  },
  it_digital: {
    "Organizzazione e pianificazione": 1.25,
    "Affidabilità + autodisciplina": 1.25,
    "Automotivazione": 1.2,
    "Stress": 1.1,
    "Flessibilità comunicativa": 1.05,
    "Gestione priorità": 1.25,
    "Attuabilità": 1.35,
    "Principi": 1.1,
    "Cooperazione": 1.05
  },
  altro: {
    "Organizzazione e pianificazione": 1.15,
    "Automotivazione": 1.15,
    "Affidabilità + autodisciplina": 1.15,
    "Sicurezza": 1.05,
    "Stress": 1.05,
    "Dinamismo": 1.05,
    "Flessibilità comunicativa": 1.05,
    "Responsabilità": 1.15,
    "Ascolto attivo": 1.05,
    "Comprensione": 1.05,
    "Espansività": 1.0,
    "Gestione priorità": 1.1,
    "Attuabilità": 1.1,
    "Cooperazione": 1.05,
    "Principi": 1.05
  }
};

function scoreToPercent(score) {
  const safeScore = Math.max(-30, Math.min(30, Number(score || 0)));
  return Math.round(((safeScore + 30) / 60) * 100);
}

function roleFitLabel(score) {
  if (score >= 85) return "Compatibilità molto alta";
  if (score >= 70) return "Compatibilità alta";
  if (score >= 55) return "Compatibilità discreta";
  if (score >= 40) return "Compatibilità da approfondire";
  return "Compatibilità bassa / da presidiare";
}

function calculateRoleFit(dimensions, requestedRole) {
  const roleKey = normalizeRoleKey(requestedRole);
  const weights = ROLE_FIT_WEIGHTS[roleKey] || ROLE_FIT_WEIGHTS.altro;
  const byName = new Map((Array.isArray(dimensions) ? dimensions : []).map((item) => [item.name, item]));

  let weightedTotal = 0;
  let weightTotal = 0;
  const details = [];

  Object.entries(weights).forEach(([name, weight]) => {
    const dimension = byName.get(name);
    if (!dimension) return;

    const score = scoreToPercent(dimension.score);
    weightedTotal += score * weight;
    weightTotal += weight;

    details.push({
      name,
      score: dimension.score,
      percent: score,
      weight
    });
  });

  const score = weightTotal ? Math.round(weightedTotal / weightTotal) : 0;

  return {
    roleKey,
    score,
    label: roleFitLabel(score),
    details: details.sort((a, b) => b.weight - a.weight),
    note: "La compatibilità con il ruolo è una lettura orientativa basata sui trait e sui parametri aggiuntivi, non modifica i punteggi di base e non sostituisce il colloquio valutativo."
  };
}

function buildManagementAdvice({ traits, roleFit }) {
  const { traits: mainTraits } = splitDimensions(traits);
  const byName = new Map(mainTraits.map((trait) => [trait.name, trait]));
  const top = [...mainTraits].sort((a, b) => b.score - a.score).slice(0, 3).map((trait) => trait.name);
  const low = [...mainTraits].sort((a, b) => a.score - b.score).slice(0, 3).map((trait) => trait.name);

  if (roleFit?.score >= 75) {
    return "La risorsa può essere gestita con obiettivi chiari, margini progressivi di autonomia e momenti di confronto periodici. Il profilo suggerisce una buona coerenza con il ruolo: è utile valorizzare i tratti più solidi assegnando responsabilità osservabili e indicatori di risultato condivisi.";
  }

  if (low.includes("Stress") || (byName.get("Stress")?.score ?? 0) < 0) {
    return "È consigliabile inserire la risorsa in un contesto con priorità chiare, feedback frequenti e carichi progressivi. Nelle fasi più intense conviene evitare ambiguità operative e prevedere punti di controllo ravvicinati, così da ridurre dispersione e pressione non necessaria.";
  }

  if (top.includes("Espansività") || top.includes("Dinamismo")) {
    return "La risorsa può rendere meglio in contesti dinamici, con interazione, confronto e obiettivi visibili. È utile canalizzare l’energia relazionale su attività con responsabilità definite, evitando che la spinta comunicativa si disperda in iniziative poco prioritarie.";
  }

  if (top.includes("Organizzazione e pianificazione") || top.includes("Affidabilità + autodisciplina")) {
    return "La risorsa può essere gestita efficacemente con processi chiari, responsabilità definite e spazio per presidiare attività operative o progettuali. È utile affidarle obiettivi misurabili e riconoscere la continuità di esecuzione.";
  }

  return "Si consiglia una gestione bilanciata, con obiettivi chiari, feedback regolari e un contesto coerente con i tratti emersi. Le aree meno solide andrebbero presidiate con affiancamento operativo, mentre i punti forti vanno tradotti in responsabilità concrete.";
}

function requireAdmin(req, res, next) {
  if (!req.session?.admin) {
    return res.redirect("/admin/login");
  }

  next();
}

function baseScore(answer) {
  if (answer === "agree") return 30;
  if (answer === "uncertain") return 10;
  if (answer === "disagree") return -30;
  return 0;
}

function scoreAnswer(answer, reverse = false) {
  const value = baseScore(answer);
  return reverse ? value * -1 : value;
}

function answerLabel(answer) {
  if (answer === "agree") return "D’accordo";
  if (answer === "uncertain") return "Incerto / parzialmente";
  if (answer === "disagree") return "In disaccordo";
  return answer || "-";
}

function range(v) {
  if (v >= 30) return "Alto / positivo";
  if (v >= 15) return "Buono / in crescita";
  if (v >= 0) return "Discreto";
  if (v > -30) return "Area di miglioramento";
  return "Area su cui porre attenzione";
}

function avg(arr) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

function getQuestionTexts() {
  return Object.fromEntries(ZPI_QUESTIONS.map((q) => [q.key, q.text]));
}

function collectAnswers(body) {
  return Object.fromEntries(
    ZPI_QUESTIONS.map((q) => [q.key, body[q.key] || null])
  );
}

function buildTraitsFromAnswers(answers) {
  const groups = new Map();

  getScoredQuestions().forEach((question) => {
    const answer = answers[question.key];

    if (!answer) return;

    const sourceTrait = question.trait || "Comportamento generale";
    const value = scoreAnswer(answer, question.reverse);
    const dimensions = normalizeDimensionDefinitions(sourceTrait);

    dimensions.forEach((dimension) => {
      if (!dimension?.name || !dimension?.category) return;

      if (!groups.has(dimension.name)) {
        groups.set(dimension.name, {
          name: dimension.name,
          category: dimension.category,
          items: []
        });
      }

      groups.get(dimension.name).items.push({
        questionKey: question.key,
        questionId: question.id,
        sourceTrait,
        answer,
        reverse: !!question.reverse,
        value
      });
    });
  });

  return Array.from(groups.values())
    .map((dimension) => {
      const values = dimension.items.map((item) => item.value);
      const finalScore = avg(values);

      return {
        name: dimension.name,
        category: dimension.category,
        score: finalScore,
        range: range(finalScore),
        questionCount: dimension.items.length,
        items: dimension.items
      };
    })
    .sort((a, b) => {
      const orderA = DIMENSION_ORDER.has(a.name) ? DIMENSION_ORDER.get(a.name) : 999;
      const orderB = DIMENSION_ORDER.has(b.name) ? DIMENSION_ORDER.get(b.name) : 999;
      return orderA - orderB;
    });
}

function buildSummary(traits, role) {
  const { traits: mainTraits } = splitDimensions(traits);
  const sorted = [...mainTraits].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 3).map((t) => t.name);
  const low = [...sorted].reverse().slice(0, 2).map((t) => t.name);

  let orientation = "profilo equilibrato";
  const topSet = new Set(top);

  if (topSet.has("Responsabilità") || topSet.has("Affidabilità + autodisciplina")) {
    orientation = "orientamento manageriale / guida";
  } else if (
    topSet.has("Espansività") ||
    topSet.has("Flessibilità comunicativa") ||
    topSet.has("Dinamismo")
  ) {
    orientation = "orientamento commerciale / relazione";
  } else if (topSet.has("Organizzazione e pianificazione") || topSet.has("Affidabilità + autodisciplina")) {
    orientation = "orientamento organizzativo / metodo";
  } else if (topSet.has("Automotivazione") || topSet.has("Dinamismo")) {
    orientation = "orientamento evolutivo / progettuale";
  }

  let roleComment =
    "Il profilo richiede ulteriori elementi per una lettura più precisa rispetto al ruolo.";

  if (role === "manager") {
    roleComment =
      topSet.has("Responsabilità") ||
      topSet.has("Affidabilità + autodisciplina") ||
      topSet.has("Organizzazione e pianificazione")
        ? "Il profilo mostra elementi coerenti con un ruolo manageriale, soprattutto sul piano della guida, della responsabilità e della struttura operativa."
        : "Per un ruolo manageriale sarà utile approfondire in particolare guida, responsabilità, capacità organizzativa e tenuta nella gestione delle persone.";
  } else if (role === "sales") {
    roleComment =
      topSet.has("Espansività") ||
      topSet.has("Flessibilità comunicativa") ||
      topSet.has("Automotivazione") ||
      topSet.has("Dinamismo")
        ? "Il profilo mostra elementi interessanti per un ruolo commerciale, soprattutto su relazione, influenza, energia comunicativa e orientamento al risultato."
        : "Per un ruolo commerciale sarà utile approfondire soprattutto componente relazionale, iniziativa, capacità negoziale e orientamento al risultato.";
  } else if (role === "amministrativo") {
    roleComment =
      topSet.has("Organizzazione e pianificazione") ||
      topSet.has("Responsabilità") ||
      topSet.has("Affidabilità + autodisciplina")
        ? "Il profilo mostra elementi coerenti con un ruolo amministrativo, soprattutto su metodo, affidabilità, continuità e presidio operativo."
        : "Per un ruolo amministrativo sarà utile approfondire soprattutto metodo, precisione, affidabilità e continuità nell’esecuzione.";
  }

  return {
    orientation,
    topTraits: top,
    weakTraits: low,
    roleComment
  };
}

function buildReliability(answers, traits) {
  const scoredQuestions = getScoredQuestions();
  const answered = scoredQuestions.filter((q) => answers[q.key]);
  const total = answered.length;

  if (!total) {
    return {
      reliabilityScore: 0,
      reliabilityLabel: "Attendibilità da verificare",
      reliabilityFlags: ["Nessuna risposta valutabile"]
    };
  }

  const counts = answered.reduce(
    (acc, q) => {
      const answer = answers[q.key];
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    },
    { agree: 0, uncertain: 0, disagree: 0 }
  );

  const flags = [];
  let penalty = 0;

  const agreeRatio = counts.agree / total;
  const disagreeRatio = counts.disagree / total;
  const uncertainRatio = counts.uncertain / total;

  if (agreeRatio >= 0.85) {
    penalty += 20;
    flags.push("Elevata concentrazione di risposte positive");
  }

  if (disagreeRatio >= 0.85) {
    penalty += 20;
    flags.push("Elevata concentrazione di risposte negative");
  }

  if (uncertainRatio <= 0.03 && total >= 80) {
    penalty += 10;
    flags.push("Uso molto basso delle risposte intermedie");
  }

  const extremeTraits = traits.filter((trait) => {
    const values = Array.isArray(trait.items) ? trait.items.map((item) => item.value) : [];
    if (values.length < 4) return false;

    const min = Math.min(...values);
    const max = Math.max(...values);
    return max - min >= 60;
  });

  if (extremeTraits.length >= 3) {
    penalty += 15;
    flags.push("Sono presenti oscillazioni interne significative su più tratti");
  }

  const reliabilityScore = Math.max(0, Math.round(100 - penalty));

  let reliabilityLabel = "Alta affidabilità";
  if (reliabilityScore < 80) reliabilityLabel = "Buona affidabilità";
  if (reliabilityScore < 60) reliabilityLabel = "Attendibilità da verificare";
  if (reliabilityScore < 40) reliabilityLabel = "Bassa attendibilità";

  return {
    reliabilityScore,
    reliabilityLabel,
    reliabilityFlags: flags
  };
}

async function withTimeout(promise, ms, label = "Operazione") {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timeout dopo ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeTraitName(name) {
  return String(name || "")
    .replace(/\s*\(duplicato controllo\)\s*/gi, "")
    .trim();
}

function isPlaceholderText(value) {
  return String(value || "").includes("REPEAT_PLACEHOLDER");
}

function isValidExpandedTrait(trait, seenNames = new Set()) {
  const rawName = String(trait?.name || "").trim();
  const name = normalizeTraitName(rawName);
  const serialized = JSON.stringify(trait || {});

  if (!name) return false;
  if (seenNames.has(name.toLowerCase())) return false;
  if (/duplicato controllo/i.test(rawName)) return false;
  if (isPlaceholderText(serialized)) return false;

  seenNames.add(name.toLowerCase());
  return true;
}

function cleanExpandedReport(expandedReportJson) {
  if (!expandedReportJson || typeof expandedReportJson !== "object") {
    return expandedReportJson;
  }

  const seenNames = new Set();
  const cleanTraits = Array.isArray(expandedReportJson.traits)
    ? expandedReportJson.traits
        .filter((trait) => isValidExpandedTrait(trait, seenNames))
        .map((trait) => ({
          ...trait,
          name: normalizeTraitName(trait.name)
        }))
    : [];

  return {
    ...expandedReportJson,
    traits: cleanTraits
  };
}

function buildAiTraitsForPrompt(traits) {
  const seenNames = new Set();

  return (Array.isArray(traits) ? traits : [])
    .filter((trait) => {
      const name = normalizeTraitName(trait?.name);
      if (!name) return false;
      if (seenNames.has(name.toLowerCase())) return false;
      if (/duplicato controllo/i.test(String(trait?.name || ""))) return false;
      seenNames.add(name.toLowerCase());
      return true;
    })
    .map((trait) => ({
      name: normalizeTraitName(trait.name),
      category: trait.category === DIMENSION_CATEGORY.ADDITIONAL ? "Parametro aggiuntivo" : "Trait",
      score: trait.score,
      range: trait.range,
      questionCount: trait.questionCount || (Array.isArray(trait.answers) ? trait.answers.length : undefined)
    }));
}

async function generateExpandedReportPayload({
  companyName,
  role,
  avgScore,
  avgRange,
  summary,
  traits,
  reliabilityScore,
  reliabilityLabel,
  reliabilityFlags,
  roleFit,
  managementAdvice
}) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY non configurata.");
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      generalSummary: { type: "string" },
      generalManagementAdvice: { type: "string" },
      traits: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            expandedText: { type: "string" },
            improvementPlan: { type: "string" },
            skillAction: { type: "string" }
          },
          required: ["name", "expandedText", "improvementPlan", "skillAction"]
        }
      }
    },
    required: ["generalSummary", "generalManagementAdvice", "traits"]
  };

  const traitsForPrompt = buildAiTraitsForPrompt(traits);

  const input = `
Sei un consulente organizzativo senior.
Genera una relazione professionale in italiano per un assessment comportamentale in ambito aziendale.

CONTESTO
- Azienda: ${companyName}
- Ruolo target: ${role}
- Score medio: ${avgScore}
- Fascia media: ${avgRange}
- Orientamento prevalente: ${summary.orientation}
- Lettura rispetto al ruolo: ${summary.roleComment}
- Compatibilità con il ruolo: ${roleFit?.label || "Non disponibile"} (${roleFit?.score ?? "-"}%)
- Consiglio generale di gestione: ${managementAdvice || "Non disponibile"}
- Attendibilità: ${reliabilityLabel} (${reliabilityScore})
- Eventuali segnali attendibilità: ${(reliabilityFlags || []).join("; ") || "nessun segnale rilevante"}

TRAIT E PARAMETRI VALUTATI
${JSON.stringify(traitsForPrompt, null, 2)}

ISTRUZIONI GENERALI
1. Scrivi una relazione generale chiara, consulenziale e concreta.
2. Non usare linguaggio clinico, diagnostico o psicologico-medico.
3. Non presentare il questionario come valutazione definitiva.
4. Non contraddire i punteggi numerici e le fasce.
5. Mantieni un tono professionale, utile per HR, management e restituzione al cliente.
6. Evita frasi generiche, ripetitive o troppo "da AI".
7. Quando possibile, collega le osservazioni al ruolo target.
8. Evidenzia potenziale, rischi operativi e azioni manageriali concrete.
9. Evita inglesismi inutili quando esiste una forma italiana chiara.
10. Se usi termini inglesi non ovvi o non di larghissimo impiego, aggiungi subito la traduzione italiana tra parentesi. Esempi: mindset (mentalità), accountability (responsabilità), feedback (riscontro), follow-up (seguito operativo).
11. Termini ormai comuni come mission e vision possono restare senza traduzione, ma non abusarne.
12. Compila generalManagementAdvice con un consiglio generale su come gestire la risorsa esaminata, coerente con i punteggi e con la compatibilità con il ruolo.

ISTRUZIONI PER OGNI TRATTO
Per ogni tratto restituisci:
- expandedText: lettura approfondita del tratto, circa 7-9 righe, concreta e collegata al ruolo.
- improvementPlan: piano di sviluppo pratico, con azioni osservabili e applicabili.
- skillAction: campo dinamico:
  - se il tratto è positivo o forte, spiega come valorizzare concretamente quella skill nel ruolo, nel team e nell'organizzazione;
  - se il tratto è debole o critico, spiega come svilupparlo, compensarlo o presidiarlo operativamente nel contesto aziendale;
  - se il tratto è intermedio, spiega come consolidarlo e renderlo più stabile.

STILE DI SCRITTURA
- Scrivi come un consulente HR senior, non come un modello AI.
- Evita formule ripetitive tra i tratti.
- Usa frasi concrete, osservabili e collegate al lavoro.
- Non gonfiare artificialmente il testo.
- Ogni sezione deve aggiungere un’informazione nuova.
- Dove c’è un rischio, descrivilo in termini operativi.
- Dove c’è una forza, descrivi come può produrre valore nel team.

IMPORTANTE
- Non scrivere "uso della forza".
- Non usare metafore tipo Jedi, superpoteri o simili.
- Non forzare una skill debole come se fosse un punto di forza.
- Per skill deboli, parla di sviluppo, compensazione, presidio o affiancamento.
- Per skill forti, parla di valorizzazione, leva organizzativa, applicazione nel team.
- Usa esclusivamente i nomi di trait e parametri aggiuntivi ricevuti nel JSON.
- Non usare la parola inglese skill nel testo finale: usa competenza, capacità o tratto.
- Non aggiungere tratti duplicati, tratti di controllo o sezioni placeholder.
- Non scrivere mai REPEAT_PLACEHOLDER o testi provvisori.
`;

  console.log("[EXPANDED] OpenAI call start", {
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    traitCount: traits.length,
    role,
    avgScore
  });

  const response = await withTimeout(
    openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input,
      text: {
        format: {
          type: "json_schema",
          name: "expanded_assessment_report",
          schema,
          strict: true
        }
      }
    }),
    Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    "OpenAI expanded report"
  );

  console.log("[EXPANDED] OpenAI call done");

  return cleanExpandedReport(JSON.parse(response.output_text));
}

function startExpandedReportJob({
  assessmentId,
  companyName,
  role,
  avgScore,
  avgRange,
  summary,
  traits,
  reliabilityScore,
  reliabilityLabel,
  reliabilityFlags,
  roleFit,
  managementAdvice
}) {
  if (!assessmentId) {
    console.error("[EXPANDED] missing assessmentId, job skipped");
    return;
  }

  console.log("[EXPANDED] job queued", { assessmentId, role, avgScore });

  prisma.assessmentResult
    .update({
      where: { assessmentId },
      data: {
        isGenerating: true,
        generationError: null
      }
    })
    .then(() => {
      console.log("[EXPANDED] background start", { assessmentId });

      return generateExpandedReportPayload({
        companyName,
        role,
        avgScore,
        avgRange,
        summary,
        traits,
        reliabilityScore,
        reliabilityLabel,
        reliabilityFlags,
        roleFit,
        managementAdvice
      });
    })
    .then(async (expandedReportJson) => {
      const cleanedExpandedReportJson = cleanExpandedReport(expandedReportJson);

      await prisma.assessmentResult.update({
        where: { assessmentId },
        data: {
          expandedReportJson: cleanedExpandedReportJson,
          expandedReportGeneratedAt: new Date(),
          isGenerating: false,
          generationError: null
        }
      });

      console.log("[EXPANDED] background done", { assessmentId });
    })
    .catch(async (error) => {
      console.error("[EXPANDED] background error", {
        assessmentId,
        message: error?.message,
        status: error?.status,
        stack: error?.stack
      });

      try {
        await prisma.assessmentResult.update({
          where: { assessmentId },
          data: {
            isGenerating: false,
            generationError: error?.message || "Errore generazione relazione"
          }
        });
      } catch (updateError) {
        console.error("[EXPANDED] failed to save generation error", {
          assessmentId,
          message: updateError?.message
        });
      }
    });
}

function drawDimensionHistogram(doc, dimensions, { title, subtitle, compact = false }) {
  if (!Array.isArray(dimensions) || dimensions.length === 0) return;

  const pageWidth = doc.page.width;
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const usableWidth = pageWidth - marginLeft - marginRight;

  const labelWidth = compact ? 158 : 170;
  const scoreWidth = 35;
  const gap = compact ? 9 : 12;
  const trackWidth = usableWidth - labelWidth - scoreWidth - gap * 2;
  const trackX = marginLeft + labelWidth + gap;
  const scoreX = trackX + trackWidth + gap;
  const centerX = trackX + trackWidth / 2;

  doc.moveDown(compact ? 0.25 : 0.5);
  doc.fontSize(compact ? 14 : 17).fillColor(HISTOGRAM_COLORS.text).text(title);
  doc.moveDown(0.15);
  doc.fontSize(compact ? 8 : 9).fillColor(HISTOGRAM_COLORS.mutedText).text(
    subtitle || "Scala da -30 a +30. Il centro rappresenta il punto neutro."
  );
  doc.moveDown(compact ? 0.45 : 0.9);

  const startY = doc.y;
  const rowHeight = compact ? 18 : 27;
  const barHeight = compact ? 8 : 11;

  doc.fontSize(8).fillColor(HISTOGRAM_COLORS.mutedText);
  doc.text("-30", trackX, startY, { width: 30, align: "left" });
  doc.text("0", centerX - 8, startY, { width: 16, align: "center" });
  doc.text("+30", trackX + trackWidth - 30, startY, { width: 30, align: "right" });

  let y = startY + (compact ? 13 : 18);

  dimensions.forEach((dimension) => {
    if (y > doc.page.height - doc.page.margins.bottom - 28) {
      doc.addPage();
      drawLogo(doc);
      y = doc.y;
    }

    const rawScore = Number(dimension.score || 0);
    const safeScore = Math.max(-30, Math.min(30, rawScore));
    const halfTrack = trackWidth / 2;
    const barWidth = Math.abs(safeScore) / 30 * halfTrack;
    const barX = safeScore >= 0 ? centerX : centerX - barWidth;

    doc.fontSize(compact ? 8 : 9).fillColor(HISTOGRAM_COLORS.text).text(dimension.name || "Voce", marginLeft, y - 2, {
      width: labelWidth
    });

    doc
      .roundedRect(trackX, y, trackWidth, barHeight, 4)
      .fillAndStroke(HISTOGRAM_COLORS.track, HISTOGRAM_COLORS.trackBorder);

    doc
      .moveTo(centerX, y - 3)
      .lineTo(centerX, y + barHeight + 3)
      .lineWidth(0.7)
      .strokeColor(HISTOGRAM_COLORS.axis)
      .stroke();

    doc
      .roundedRect(barX, y, Math.max(barWidth, 1), barHeight, 4)
      .fill(histogramColor(safeScore));

    doc.fontSize(compact ? 8 : 9).fillColor(HISTOGRAM_COLORS.text).text(String(rawScore), scoreX, y - 2, {
      width: scoreWidth,
      align: "right"
    });

    y += rowHeight;
  });

  doc.y = y + (compact ? 8 : 4);
  doc.fillColor("black");
}

function drawAssessmentHistograms(doc, dimensions) {
  const { traits, additionalParameters } = splitDimensions(dimensions);

  drawLogo(doc);
  doc.fontSize(20).fillColor("black").text("Performance Assessment Report", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor("#666").text("Sintesi grafica del profilo", { align: "center" });
  doc.moveDown(0.7);

  drawDimensionHistogram(doc, traits, {
    title: "Trait",
    subtitle: "Sintesi dei principali tratti comportamentali rilevati dal questionario.",
    compact: true
  });

  if (additionalParameters.length) {
    drawDimensionHistogram(doc, additionalParameters, {
      title: "Parametri aggiuntivi",
      subtitle: "Indicatori di supporto alla lettura consulenziale del profilo.",
      compact: true
    });
  }
}

function drawLogo(doc) {
  const logoPath = path.join(__dirname, "public", "zenith-logo-pdf.jpeg");

  try {
    doc.image(logoPath, 50, 32, { width: 170 });
    doc.y = 100;
  } catch (_error) {
    doc.y = 50;
  }
}

app.get("/ping-version", (_req, res) => {
  res.send("openai-expanded-report-v8-role-fit-age-pdf");
});

app.get("/", (_req, res) => {
  res.redirect("/questionnaires");
});

app.get("/questionnaires", async (_req, res) => {
  const companySlug = process.env.COMPANY_SLUG || "demo-company";
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;

  const links = [
    { role: "manager", label: "Manager", token: `${companySlug}-manager-001` },
    { role: "sales", label: "Sales", token: `${companySlug}-sales-001` },
    { role: "amministrativo", label: "Amministrativo", token: `${companySlug}-amministrativo-001` }
  ].map((item) => ({
    ...item,
    url: `${publicBaseUrl}/q/${item.token}`
  }));

  res.render("questionnaire-welcome", {
    links,
    companyName: process.env.COMPANY_NAME || "Demo Company",
    publicBaseUrl
  });
});

app.get("/q/:token", async (req, res) => {
  const link = await prisma.assessmentLink.findUnique({
    where: { token: req.params.token },
    include: { organization: true }
  });

  if (!link || !link.isActive) {
    return res.status(404).send("Link questionario non valido o non attivo.");
  }

  res.render("questionnaire", {
    token: link.token,
    companyName: link.organization.name,
    requestedRole: link.requestedRole,
    roleOptions: ROLE_OPTIONS,
    questions: getQuestionTexts()
  });
});

app.post("/q/:token", async (req, res) => {
  try {
    const link = await prisma.assessmentLink.findUnique({
      where: { token: req.params.token },
      include: { organization: true }
    });

    if (!link || !link.isActive) {
      return res.status(404).send("Link questionario non valido o non attivo.");
    }

    const answers = collectAnswers(req.body);
    const traits = buildTraitsFromAnswers(answers);
    const { traits: mainTraits, additionalParameters } = splitDimensions(traits);
    const avgScore = avg(mainTraits.map((t) => t.score));
    const avgRange = range(avgScore);
    const requestedRole = normalizeRequestedRole(
      req.body.requestedRole,
      req.body.requestedRoleOther,
      link.requestedRole
    );
    const summary = buildSummary(traits, requestedRole);
    const roleFit = calculateRoleFit(traits, requestedRole);
    const managementAdvice = buildManagementAdvice({ traits, roleFit });
    const { reliabilityScore, reliabilityLabel, reliabilityFlags } = buildReliability(answers, traits);

    const assessment = await prisma.assessment.create({
      data: {
        organizationId: link.organizationId,
        assessmentLinkId: link.id,
        respondentName: req.body.respondentName || "Anonimo",
        respondentEmail: req.body.respondentEmail || null,
        age: req.body.age ? Number(req.body.age) : null,
        candidateCompany: req.body.candidateCompany || null,
        requestedRole
      }
    });

    await prisma.assessmentResult.create({
      data: {
        assessmentId: assessment.id,
        avgScore,
        avgRange,
        orientation: summary.orientation,
        roleComment: summary.roleComment,
        reliabilityScore,
        reliabilityLabel,
        traitsJson: {
          traits,
          mainTraits,
          additionalParameters,
          roleFit,
          managementAdvice,
          topTraits: summary.topTraits,
          weakTraits: summary.weakTraits,
          reliabilityFlags
        },
        answersJson: answers,
        isGenerating: false,
        generationError: null
      }
    });

    startExpandedReportJob({
      assessmentId: assessment.id,
      companyName: link.organization.name,
      role: requestedRole,
      avgScore,
      avgRange,
      summary: {
        orientation: summary.orientation,
        roleComment: summary.roleComment,
        roleFit,
        managementAdvice
      },
      traits,
      reliabilityScore,
      reliabilityLabel,
      reliabilityFlags,
      roleFit,
      managementAdvice
    });

    res.redirect("/thank-you");
  } catch (error) {
    console.error("Errore submit questionario:", error);
    res.status(500).send("Errore durante il salvataggio della compilazione.");
  }
});

app.get("/thank-you", (_req, res) => {
  res.render("thank-you");
});

app.get("/admin/login", (_req, res) => {
  res.render("admin-login", { error: null });
});

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    include: { organization: true }
  });

  if (!admin) {
    return res.status(401).render("admin-login", {
      error: "Credenziali non valide."
    });
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);

  if (!ok) {
    return res.status(401).render("admin-login", {
      error: "Credenziali non valide."
    });
  }

  req.session.admin = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    organizationId: admin.organizationId,
    organizationName: admin.organization.name
  };

  res.redirect("/admin");
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

app.get("/admin", requireAdmin, async (req, res) => {
  const companyFilter = (req.query.company || "").toString().trim();

  const assessments = await prisma.assessment.findMany({
    where: {
      organizationId: req.session.admin.organizationId,
      ...(companyFilter
        ? {
            candidateCompany: {
              contains: companyFilter,
              mode: "insensitive"
            }
          }
        : {})
    },
    include: {
      result: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const submissions = assessments.map((item) => {
    const payload = item.result?.traitsJson || {};

    return {
      id: item.id,
      name: item.respondentName,
      email: item.respondentEmail,
      candidateCompany: item.candidateCompany,
      age: item.age,
      role: item.requestedRole,
      createdAt: item.createdAt,
      avgScore: item.result?.avgScore ?? null,
      orientation: item.result?.orientation ?? "-",
      topTraits: payload.topTraits || [],
      roleFit: payload.roleFit || calculateRoleFit(payload.traits || [], item.requestedRole),
      expandedReady: !!item.result?.expandedReportJson,
      expandedGenerating: !!item.result?.isGenerating,
      generationError: item.result?.generationError || null
    };
  });

  res.render("admin", {
    submissions,
    organizationName: req.session.admin.organizationName,
    filters: {
      company: companyFilter
    }
  });
});

app.post("/admin/:id/generate-expanded-report", requireAdmin, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.session.admin.organizationId
      },
      include: {
        result: true
      }
    });

    if (!assessment || !assessment.result) {
      return res.status(404).send("Assessment non trovato");
    }

    if (assessment.result.expandedReportJson || assessment.result.isGenerating) {
      return res.redirect(`/admin/${assessment.id}`);
    }

    const payload = assessment.result.traitsJson || {};
    const traits = Array.isArray(payload.traits) ? payload.traits : [];
    const roleFit = payload.roleFit || calculateRoleFit(traits, assessment.requestedRole);
    const managementAdvice = payload.managementAdvice || buildManagementAdvice({ traits, roleFit });

    startExpandedReportJob({
      assessmentId: assessment.id,
      companyName: req.session.admin.organizationName,
      role: assessment.requestedRole,
      avgScore: assessment.result.avgScore,
      avgRange: assessment.result.avgRange,
      summary: {
        orientation: assessment.result.orientation,
        roleComment: assessment.result.roleComment,
        roleFit,
        managementAdvice
      },
      traits,
      reliabilityScore: assessment.result.reliabilityScore ?? 0,
      reliabilityLabel: assessment.result.reliabilityLabel ?? "Non disponibile",
      reliabilityFlags: payload.reliabilityFlags || [],
      roleFit,
      managementAdvice
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore avvio generazione relazione esplosa:", error);
    res.status(500).send("Errore durante l'avvio della generazione della relazione esplosa.");
  }
});

app.get("/admin/:id", requireAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: {
      result: true
    }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};
  const expanded = cleanExpandedReport(assessment.result?.expandedReportJson || null);

  const submission = {
    id: assessment.id,
    name: assessment.respondentName,
    email: assessment.respondentEmail,
    age: assessment.age,
    candidateCompany: assessment.candidateCompany,
    role: assessment.requestedRole,
    createdAt: assessment.createdAt,
    analysis: {
      avgScore: assessment.result?.avgScore ?? "-",
      avgRange: assessment.result?.avgRange ?? "-",
      reliabilityScore: assessment.result?.reliabilityScore ?? "-",
      reliabilityLabel: assessment.result?.reliabilityLabel ?? "-",
      reliabilityFlags: payload.reliabilityFlags || [],
      answers: assessment.result?.answersJson || {},
      questions: getQuestionTexts(),
      isGenerating: !!assessment.result?.isGenerating,
      generationError: assessment.result?.generationError || null,
      summary: {
        orientation: assessment.result?.orientation ?? "-",
        roleComment: assessment.result?.roleComment ?? "-",
        topTraits: payload.topTraits || [],
        weakTraits: payload.weakTraits || [],
        roleFit: payload.roleFit || calculateRoleFit(payload.traits || [], assessment.requestedRole),
        managementAdvice: payload.managementAdvice || buildManagementAdvice({
          traits: payload.traits || [],
          roleFit: payload.roleFit || calculateRoleFit(payload.traits || [], assessment.requestedRole)
        })
      },
      traits: payload.traits || [],
      mainTraits: payload.mainTraits || splitDimensions(payload.traits || []).traits,
      additionalParameters: payload.additionalParameters || splitDimensions(payload.traits || []).additionalParameters,
      expandedReport: expanded
    }
  };

  res.render("detail", {
    submission,
    organizationName: req.session.admin.organizationName,
    isGenerating: !!assessment.result?.isGenerating && !expanded
  });
});

app.get("/admin/:id/pdf", requireAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: {
      result: true
    }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};
  const traits = Array.isArray(payload.traits) ? payload.traits : [];
  const mainTraits = Array.isArray(payload.mainTraits) ? payload.mainTraits : splitDimensions(traits).traits;
  const additionalParameters = Array.isArray(payload.additionalParameters)
    ? payload.additionalParameters
    : splitDimensions(traits).additionalParameters;
  const expanded = cleanExpandedReport(assessment.result?.expandedReportJson || null);

  const doc = new PDFDocument({
    margin: 50,
    size: "A4"
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=report-${assessment.id}.pdf`
  );

  doc.pipe(res);

  const roleFit = payload.roleFit || calculateRoleFit(traits, assessment.requestedRole);
  const managementAdvice = payload.managementAdvice || buildManagementAdvice({ traits, roleFit });

  // PAGINA 1: istogrammi principali e parametri aggiuntivi.
  if (traits.length) {
    drawAssessmentHistograms(doc, traits);
  } else {
    drawLogo(doc);
    doc.fontSize(20).fillColor("black").text("Performance Assessment Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text("Nessun dato grafico disponibile.");
  }

  // PAGINA 2: dati anagrafici.
  doc.addPage();
  drawLogo(doc);
  doc.fontSize(18).fillColor("black").text("Dati anagrafici");
  doc.moveDown(0.8);
  doc.fontSize(11);
  doc.text(`Nome: ${assessment.respondentName || "-"}`);
  doc.text(`Email: ${assessment.respondentEmail || "-"}`);
  doc.text(`Età: ${assessment.age || "-"}`);
  doc.text(`Azienda risorsa: ${assessment.candidateCompany || "-"}`);
  doc.text(`Ruolo target: ${assessment.requestedRole || "-"}`);
  doc.text(`Data compilazione: ${new Date(assessment.createdAt).toLocaleString("it-IT")}`);
  doc.moveDown();
  doc.fontSize(10).fillColor("#666").text(
    "I dati anagrafici servono a contestualizzare la lettura del profilo e ad associare correttamente la compilazione al percorso di assessment.",
    { align: "left" }
  );
  doc.fillColor("black");

  // PAGINA 3: sintesi, compatibilità con il ruolo e consiglio gestionale.
  doc.addPage();
  drawLogo(doc);
  doc.fontSize(18).fillColor("black").text("Sintesi del profilo");
  doc.moveDown(0.7);

  doc.fontSize(11);
  doc.text(`Score medio: ${assessment.result?.avgScore ?? "-"}`);
  doc.text(`Fascia media: ${assessment.result?.avgRange ?? "-"}`);
  doc.text(`Orientamento prevalente: ${assessment.result?.orientation ?? "-"}`);
  doc.text(`Lettura rispetto al ruolo: ${assessment.result?.roleComment ?? "-"}`);
  doc.text(`Compatibilità con il ruolo: ${roleFit.label} (${roleFit.score}%)`);
  doc.text(`Attendibilità: ${assessment.result?.reliabilityLabel ?? "-"} (${assessment.result?.reliabilityScore ?? "-"})`);

  if (Array.isArray(payload.reliabilityFlags) && payload.reliabilityFlags.length) {
    doc.text(`Segnali attendibilità: ${payload.reliabilityFlags.join("; ")}`);
  }

  doc.moveDown();
  doc.fontSize(14).text("Punti forti emergenti");
  doc.fontSize(11).text((payload.topTraits || []).join(", ") || "-");

  doc.moveDown();
  doc.fontSize(14).text("Aree di miglioramento");
  doc.fontSize(11).text((payload.weakTraits || []).join(", ") || "-");

  doc.moveDown();
  doc.fontSize(14).text("Consiglio generale di gestione");
  doc.fontSize(11).text(managementAdvice || "-");

  doc.moveDown();
  doc.fontSize(9).fillColor("#666").text(roleFit.note || "", { align: "left" });
  doc.fillColor("black");

  // PAGINE SUCCESSIVE: dettaglio trait e parametri.
  doc.addPage();
  drawLogo(doc);
  doc.fontSize(16).fillColor("black").text("Dettaglio trait e parametri aggiuntivi");
  doc.moveDown(0.7);

  doc.fontSize(14).text("Trait");
  doc.moveDown(0.4);

  if (!mainTraits.length) {
    doc.fontSize(11).text("Nessun dettaglio trait disponibile.");
  } else {
    mainTraits.forEach((t) => {
      doc.fontSize(11).text(`${t.name}: ${t.score} (${t.range})`);
    });
  }

  if (additionalParameters.length) {
    doc.moveDown();
    doc.fontSize(14).text("Parametri aggiuntivi");
    doc.moveDown(0.4);
    additionalParameters.forEach((t) => {
      doc.fontSize(11).text(`${t.name}: ${t.score} (${t.range})`);
    });
  }

  if (expanded?.generalSummary) {
    doc.addPage();
    drawLogo(doc);

    doc.fontSize(16).fillColor("black").text("Relazione estesa");
    doc.moveDown(0.5);
    doc.fontSize(11).text(expanded.generalSummary);

    const expandedAdvice = expanded.generalManagementAdvice || managementAdvice;
    if (expandedAdvice) {
      doc.moveDown();
      doc.fontSize(14).text("Consiglio generale di gestione");
      doc.moveDown(0.2);
      doc.fontSize(11).text(expandedAdvice);
    }

    doc.moveDown();

    if (Array.isArray(expanded.traits)) {
      expanded.traits.forEach((t) => {
        doc.fontSize(14).text(t.name || "Trait");
        doc.moveDown(0.2);

        doc.fontSize(11).text(t.expandedText || "");
        doc.moveDown(0.3);

        doc.fontSize(11).text(`Piano di sviluppo: ${t.improvementPlan || "-"}`);
        doc.moveDown(0.3);

        doc.fontSize(11).text(
          `Come valorizzare o sviluppare questa competenza: ${t.skillAction || t.teamLeverage || "-"}`
        );
        doc.moveDown();
      });
    }
  }

  doc.moveDown();
  doc.fontSize(9).fillColor("#666").text(
    "Questa relazione rappresenta una prima lettura strutturata dei tratti emersi dal questionario e non costituisce una valutazione definitiva.",
    { align: "left" }
  );

  doc.end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
