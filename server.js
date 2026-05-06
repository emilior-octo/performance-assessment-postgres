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
  "Attendibilità"
];

const DIMENSION_ORDER = new Map(
  [...TRAIT_DIMENSIONS, ...ADDITIONAL_PARAMETER_DIMENSIONS].map((name, index) => [name, index])
);

const DIMENSION_DEFINITIONS = {
  "Organizzazione e metodo": [
    { name: "Organizzazione e pianificazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Gestione priorità", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Visione e orientamento al futuro": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
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
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Responsabilità e ownership": [
    { name: "Responsabilità", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Stabilità emotiva e fiducia": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Fiducia relazionale e sicurezza sociale": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Gestione della pressione": [
    { name: "Stress", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Autocontrollo e gestione emotiva": [
    { name: "Stress", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
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
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Autonomia economica e iniziativa": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Responsabilità", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Creatività e innovazione": [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Attendibilità", category: DIMENSION_CATEGORY.ADDITIONAL }
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
    "Attendibilità": 1.2,
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
    "Cooperazione": 1.05
  },
  marketing: {
    "Dinamismo": 1.25,
    "Flessibilità comunicativa": 1.25,
    "Espansività": 1.15,
    "Automotivazione": 1.15,
    "Comprensione": 1.15,
    "Attendibilità": 1.25,
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
    "Attendibilità": 1.2,
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
    "Attendibilità": 1.3,
    "Cooperazione": 1.1
  },
  customer_service: {
    "Ascolto attivo": 1.4,
    "Comprensione": 1.35,
    "Flessibilità comunicativa": 1.25,
    "Stress": 1.15,
    "Sicurezza": 1.1,
    "Cooperazione": 1.25,
    "Cooperazione": 1.2,
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
    "Cooperazione": 1.1
  },
  it_digital: {
    "Organizzazione e pianificazione": 1.25,
    "Affidabilità + autodisciplina": 1.25,
    "Automotivazione": 1.2,
    "Stress": 1.1,
    "Flessibilità comunicativa": 1.05,
    "Gestione priorità": 1.25,
    "Attendibilità": 1.35,
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
    "Attendibilità": 1.1,
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
    note: "La compatibilità con il ruolo è una lettura orientativa e non sostituisce il colloquio con la persona."
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
      category: trait.category === DIMENSION_CATEGORY.ADDITIONAL ? "Parametro aggiuntivo" : "Tratto",
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
- Orientamento prevalente: ${summary.orientation}
- Lettura rispetto al ruolo: ${summary.roleComment}
- Compatibilità con il ruolo: ${roleFit?.label || "Non disponibile"}
- Consiglio generale di gestione: ${managementAdvice || "Non disponibile"}
- Attendibilità generale: ${reliabilityLabel}
- Eventuali segnali attendibilità: ${(reliabilityFlags || []).join("; ") || "nessun segnale rilevante"}

TRATTI E PARAMETRI VALUTATI
${JSON.stringify(traitsForPrompt, null, 2)}

ISTRUZIONI GENERALI
1. Scrivi in modo semplice, diretto e utile per un imprenditore o responsabile di PMI.
2. Non usare linguaggio clinico, diagnostico o psicologico-medico.
3. Non presentare il questionario come valutazione definitiva.
4. Evita parole tecniche o inglesi non necessarie. Se proprio servono, spiega subito il significato in italiano.
5. Non usare formule come “discreto”, “buono”, “ottimo” nel testo finale.
6. Evita frasi generiche, ripetitive o troppo “da AI”.
7. Quando possibile, collega le osservazioni al lavoro quotidiano, ai rapporti con colleghi/clienti e alla gestione pratica della persona.
8. Descrivi rischi e rimedi in modo concreto: cosa può fare il titolare, il responsabile o il referente diretto già da domani.
9. Usa frasi brevi, chiare e senza gergo manageriale complesso.
10. Compila generalManagementAdvice con un consiglio generale molto pratico su come gestire la risorsa esaminata.

ISTRUZIONI PER OGNI TRATTO
Per ogni tratto restituisci:
- expandedText: spiegazione semplice del tratto, con esempi pratici di come può vedersi nel lavoro.
- improvementPlan: rimedi pratici, facili da applicare, senza teoria complessa.
- skillAction: cosa fare nella gestione quotidiana: come valorizzare il tratto se è forte, oppure come presidiare e migliorare il comportamento se è debole.

STILE DI SCRITTURA
- Scrivi come un consulente che parla a un imprenditore, non a uno psicologo e non a un grande reparto HR.
- Usa parole semplici e frasi brevi.
- Evita formule ripetitive tra i tratti.
- Dove c’è un rischio, spiega cosa può succedere in azienda.
- Dove c’è una forza, spiega come usarla nella pratica.
- Dove serve un rimedio, indica azioni semplici: obiettivi chiari, controllo periodico, affiancamento, priorità scritte, confronto diretto.

IMPORTANTE
- Non scrivere "uso della forza".
- Non usare metafore tipo Jedi, superpoteri o simili.
- Non forzare una skill debole come se fosse un punto di forza.
- Per skill deboli, parla di sviluppo, compensazione, presidio o affiancamento.
- Per skill forti, parla di valorizzazione, leva organizzativa, applicazione nel team.
- Usa esclusivamente i nomi di tratti e parametri aggiuntivi ricevuti nel JSON.
- Non usare la parola inglese skill nel testo finale: usa competenza, capacità o tratto.
- Non usare espressioni come “KPI”, “stakeholder”, “performance review”, “coaching”, “debriefing”, salvo tradurle in parole semplici.
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

function chartScore(score) {
  const safeScore = Math.max(-30, Math.min(30, Number(score || 0)));
  return Math.round((safeScore / 30) * 100);
}

function drawChartTitle(doc, title, subtitle) {
  const marginLeft = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // PDFKit mantiene l'ultima posizione X dopo testi ruotati/colonne.
  // Reset esplicito per evitare titoli tagliati a destra, es. "Parametri a...".
  doc.x = marginLeft;

  doc.fontSize(16).fillColor("#222222").text(title, marginLeft, doc.y, {
    width: usableWidth,
    lineBreak: false
  });

  if (subtitle) {
    doc.moveDown(0.2);
    doc.x = marginLeft;
    doc.fontSize(8.5).fillColor("#666666").text(subtitle, marginLeft, doc.y, {
      width: usableWidth
    });
  }

  doc.x = marginLeft;
  doc.fillColor("black");
}

function drawTraitsVerticalChart(doc, traits) {
  if (!Array.isArray(traits) || traits.length === 0) return;

  drawChartTitle(doc, "Tratti");

  const marginLeft = doc.page.margins.left;
  const pageBottom = doc.page.height - doc.page.margins.bottom;
  const chartTop = doc.y + 14;
  const chartHeight = 205;
  const labelHeight = 82;
  const chartBottom = chartTop + chartHeight;
  const chartWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const axisX = marginLeft + 28;
  const plotWidth = chartWidth - 38;
  const zeroY = chartTop + chartHeight / 2;
  const valueToY = (value) => zeroY - (value / 100) * (chartHeight / 2);
  const rowStep = chartHeight / 20;

  doc.save();

  // Griglia -100 / +100 come reference.
  for (let value = -100; value <= 100; value += 10) {
    const y = valueToY(value);
    doc
      .moveTo(axisX, y)
      .lineTo(axisX + plotWidth, y)
      .lineWidth(value === 0 ? 1.1 : 0.45)
      .strokeColor(value === 0 ? "#9E9E9E" : "#DDDDDD")
      .stroke();

    doc.fontSize(6.5).fillColor("#555555").text(String(value), marginLeft, y - 3, {
      width: 22,
      align: "right"
    });
  }

  const count = traits.length;
  const slot = plotWidth / count;
  const barWidth = Math.min(28, Math.max(16, slot * 0.72));
  const palette = [
    "#147FBD", // Zenith blue
    "#0D1424", // deep navy
    "#36A3D9", // light blue
    "#5E6878", // muted slate
    "#7CB342", // olive green
    "#F2A33A", // warm amber
    "#8E5CF7", // violet
    "#00A6A6", // teal
    "#D66BA0", // muted rose
    "#6B8E23", // dark olive
    "#BFC7D5"  // soft grey blue
  ];

  traits.forEach((trait, index) => {
    const value = chartScore(trait.score);
    const x = axisX + slot * index + (slot - barWidth) / 2;
    const y = value >= 0 ? valueToY(value) : zeroY;
    const h = Math.max(1, Math.abs(zeroY - valueToY(value)));
    const color = palette[index % palette.length];

    doc.rect(x, y, barWidth, h).fillOpacity(0.88).fill(color).fillOpacity(1);

    // Valore sopra/sotto la barra.
    const valueY = value >= 0 ? y - 13 : y + h + 3;
    doc.fontSize(7.5).fillColor(color).text(String(value), x - 5, valueY, {
      width: barWidth + 10,
      align: "center"
    });

    // Label verticale, come reference.
    doc.save();
    doc.rotate(-90, { origin: [x + barWidth / 2, chartBottom + labelHeight - 2] });
    doc.fontSize(6.9).fillColor("#333333").text(trait.name, x + barWidth / 2, chartBottom + labelHeight - 2, {
      width: labelHeight,
      align: "right",
      lineBreak: false
    });
    doc.restore();
  });

  doc.restore();
  doc.x = doc.page.margins.left;
  doc.y = chartBottom + labelHeight + 22;
  doc.fillColor("black");
}

function drawAdditionalParameterBars(doc, parameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) return;

  doc.x = doc.page.margins.left;
  drawChartTitle(doc, "Parametri aggiuntivi");

  const marginLeft = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columnGap = 34;
  const columnWidth = (usableWidth - columnGap) / 2;
  const labelHeight = 18;
  const trackHeight = 12;
  const rowHeight = 44;
  const trackColor = "#E9E9E9";
  const barColor = "#2E5F9E";
  const axisColor = "#8A8A8A";
  const startY = doc.y + 12;

  const left = parameters.filter((_, index) => index % 2 === 0);
  const right = parameters.filter((_, index) => index % 2 === 1);

  function drawColumn(items, x, y0) {
    items.forEach((item, row) => {
      const y = y0 + row * rowHeight;
      const value = chartScore(item.score);
      const trackX = x + 38;
      const trackW = columnWidth - 78;
      const zeroX = trackX + trackW / 2;
      const barW = Math.max(2, Math.abs(value) / 100 * (trackW / 2));
      const barX = value >= 0 ? zeroX : zeroX - barW;
      const barY = y + labelHeight + 1;

      doc.fontSize(8.5).fillColor("#111111").text(item.name, x, y, {
        width: columnWidth,
        lineBreak: false
      });

      doc.fontSize(6.5).fillColor("#111111").text("-100", x, barY + 2, {
        width: 32,
        align: "right"
      });

      doc.roundedRect(trackX, barY, trackW, trackHeight, 1).fill(trackColor);

      doc
        .moveTo(zeroX, barY - 1)
        .lineTo(zeroX, barY + trackHeight + 1)
        .lineWidth(0.8)
        .strokeColor(axisColor)
        .stroke();

      doc.roundedRect(barX, barY, barW, trackHeight, 1).fill(barColor);

      doc.fontSize(6.3).fillColor("#FFFFFF").text(String(value), barX, barY + 2.2, {
        width: Math.max(barW, 14),
        align: "center"
      });

      doc.fontSize(6.5).fillColor("#111111").text("100", trackX + trackW + 7, barY + 2, {
        width: 28,
        align: "left"
      });
    });
  }

  drawColumn(left, marginLeft, startY);
  drawColumn(right, marginLeft + columnWidth + columnGap, startY);

  const rows = Math.max(left.length, right.length);
  doc.y = startY + rows * rowHeight + 8;
  doc.fillColor("black");
}

function normalizeDimensionNameForDisplay(name) {
  const value = String(name || "").trim();
  if (value === "Attuabilità") return "Attendibilità";
  if (value === "Emotiva") return "Cooperazione";
  return value;
}

function mergeDimensionList(list = []) {
  const groups = new Map();

  (Array.isArray(list) ? list : []).forEach((item) => {
    const name = normalizeDimensionNameForDisplay(item?.name);
    if (!name) return;

    const existing = groups.get(name);
    const items = Array.isArray(item.items) ? item.items : [];
    const score = Number(item.score || 0);
    const questionCount = Number(item.questionCount || items.length || 0);

    if (!existing) {
      groups.set(name, {
        ...item,
        name,
        score,
        questionCount,
        items: [...items]
      });
      return;
    }

    const oldWeight = Number(existing.questionCount || existing.items?.length || 1);
    const newWeight = questionCount || 1;
    const totalWeight = oldWeight + newWeight;
    existing.score = Math.round(((Number(existing.score || 0) * oldWeight) + (score * newWeight)) / totalWeight);
    existing.range = range(existing.score);
    existing.questionCount = totalWeight;
    existing.items = [...(existing.items || []), ...items];
  });

  return Array.from(groups.values()).sort((a, b) => {
    const orderA = DIMENSION_ORDER.has(a.name) ? DIMENSION_ORDER.get(a.name) : 999;
    const orderB = DIMENSION_ORDER.has(b.name) ? DIMENSION_ORDER.get(b.name) : 999;
    return orderA - orderB;
  });
}

function normalizeNameList(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((name) => normalizeDimensionNameForDisplay(name))
    .filter(Boolean)
    .filter((name, index, arr) => arr.indexOf(name) === index);
}

function getNormalizedAnalysis(payload = {}, requestedRole = "") {
  const rawTraits = Array.isArray(payload.traits) ? payload.traits : [];
  const traits = mergeDimensionList(rawTraits);
  const split = splitDimensions(traits);
  const mainTraits = mergeDimensionList(Array.isArray(payload.mainTraits) ? payload.mainTraits : split.traits)
    .filter((item) => item.category === DIMENSION_CATEGORY.TRAIT);
  const additionalParameters = mergeDimensionList(Array.isArray(payload.additionalParameters) ? payload.additionalParameters : split.additionalParameters)
    .filter((item) => item.category === DIMENSION_CATEGORY.ADDITIONAL);
  const roleFit = payload.roleFit || calculateRoleFit(traits, requestedRole);
  const managementAdvice = payload.managementAdvice || buildManagementAdvice({ traits, roleFit });

  return {
    traits,
    mainTraits,
    additionalParameters,
    roleFit,
    managementAdvice,
    topTraits: normalizeNameList(payload.topTraits || mainTraits.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.name)),
    weakTraits: normalizeNameList(payload.weakTraits || mainTraits.slice().sort((a, b) => a.score - b.score).slice(0, 2).map((item) => item.name)),
    reliabilityFlags: payload.reliabilityFlags || []
  };
}

function drawAssessmentHistograms(doc, dimensions) {
  const { traits, additionalParameters } = splitDimensions(dimensions);

  drawLogo(doc);
  doc.fontSize(20).fillColor("black").text("Performance Assessment Report", { align: "center" });
  doc.moveDown(0.15);
  doc.fontSize(9).fillColor("#666666").text("Sintesi grafica del profilo", { align: "center" });
  doc.moveDown(0.65);

  drawTraitsVerticalChart(doc, traits);

  if (additionalParameters.length) {
    drawAdditionalParameterBars(doc, additionalParameters);
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
  res.send("openai-expanded-report-v10-v5-1-no-automatic-labels");
});

app.get("/", (_req, res) => {
  res.redirect("/questionnaires");
});

function getZenithAssessmentToken() {
  const companySlug = process.env.COMPANY_SLUG || "demo-company";
  return process.env.ZENITH_ASSESSMENT_TOKEN || `${companySlug}-manager-001`;
}

async function findZenithAssessmentLink() {
  const token = getZenithAssessmentToken();

  const directLink = await prisma.assessmentLink.findUnique({
    where: { token },
    include: { organization: true }
  });

  if (directLink?.isActive) return directLink;

  return prisma.assessmentLink.findFirst({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  });
}

app.get("/questionnaires", async (_req, res) => {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
  const assessmentPath = "/zenith-assessment";
  const assessmentUrl = `${publicBaseUrl}${assessmentPath}`;
  const adminUrl = "/admin";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=14&data=${encodeURIComponent(assessmentUrl)}`;

  res.render("questionnaire-welcome", {
    companyName: process.env.COMPANY_NAME || "Zenith",
    publicBaseUrl,
    assessmentUrl,
    adminUrl,
    qrCodeUrl,
    products: [
      {
        eyebrow: "Questionario attivo",
        title: "Zenith Assessment",
        description: "Assessment comportamentale per aziende, team HR e percorsi di valutazione interna.",
        cta: "Apri questionario",
        url: assessmentUrl,
        status: "active"
      },
      {
        eyebrow: "Prossimo percorso",
        title: "Human & Sport Performance",
        description: "Questionario dedicato ad aziende sportive, organizzazioni, staff tecnici e contesti di performance sportiva.",
        cta: "Disponibile a breve",
        url: null,
        status: "coming_soon"
      }
    ]
  });
});

app.get("/zenith-assessment", async (_req, res) => {
  const link = await findZenithAssessmentLink();

  if (!link || !link.isActive) {
    return res.status(404).send("Questionario Zenith non disponibile o non attivo.");
  }

  res.render("questionnaire", {
    token: link.token,
    companyName: link.organization.name,
    requestedRole: link.requestedRole,
    roleOptions: ROLE_OPTIONS,
    questions: getQuestionTexts()
  });
});

app.get("/human-sport-performance", (_req, res) => {
  res.status(503).send("Human & Sport Performance - Work in progress");
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
    const normalized = getNormalizedAnalysis(payload, item.requestedRole);

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
      topTraits: normalized.topTraits || [],
      roleFit: normalized.roleFit,
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
    const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
    const traits = normalized.traits;
    const roleFit = normalized.roleFit;
    const managementAdvice = normalized.managementAdvice;

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
      reliabilityFlags: normalized.reliabilityFlags || [],
      roleFit,
      managementAdvice
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore avvio generazione relazione esplosa:", error);
    res.status(500).send("Errore durante l'avvio della generazione della relazione esplosa.");
  }
});


app.post("/admin/:id/duplicate-test", requireAdmin, async (req, res) => {
  try {
    const source = await prisma.assessment.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.session.admin.organizationId
      },
      include: {
        result: true,
        assessmentLink: true
      }
    });

    if (!source || !source.result) {
      return res.status(404).send("Assessment sorgente non trovato");
    }

    const answers = source.result.answersJson || {};
    const traits = buildTraitsFromAnswers(answers);
    const { traits: mainTraits, additionalParameters } = splitDimensions(traits);
    const avgScore = avg(mainTraits.map((t) => t.score));
    const avgRange = range(avgScore);
    const requestedRole = source.requestedRole || source.assessmentLink?.requestedRole || "non_specificato";
    const summary = buildSummary(traits, requestedRole);
    const roleFit = calculateRoleFit(traits, requestedRole);
    const managementAdvice = buildManagementAdvice({ traits, roleFit });
    const { reliabilityScore, reliabilityLabel, reliabilityFlags } = buildReliability(answers, traits);

    const copiedName = `${source.respondentName || "Anonimo"} - copia test`;
    const copiedCompany = source.candidateCompany
      ? `${source.candidateCompany} [TEST]`
      : "TEST";

    const duplicated = await prisma.assessment.create({
      data: {
        organizationId: source.organizationId,
        assessmentLinkId: source.assessmentLinkId,
        respondentName: copiedName,
        respondentEmail: source.respondentEmail,
        age: source.age,
        candidateCompany: copiedCompany,
        requestedRole
      }
    });

    await prisma.assessmentResult.create({
      data: {
        assessmentId: duplicated.id,
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
          reliabilityFlags,
          duplicatedFromAssessmentId: source.id,
          duplicatedAt: new Date().toISOString()
        },
        answersJson: answers,
        expandedReportJson: null,
        expandedReportGeneratedAt: null,
        isGenerating: false,
        generationError: null
      }
    });

    if (req.body.generateAi === "yes") {
      startExpandedReportJob({
        assessmentId: duplicated.id,
        companyName: req.session.admin.organizationName,
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
    }

    return res.redirect(`/admin/${duplicated.id}`);
  } catch (error) {
    console.error("Errore duplicazione assessment test:", error);
    return res.status(500).send("Errore durante la duplicazione del questionario test.");
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
  const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
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
      reliabilityFlags: normalized.reliabilityFlags || [],
      answers: assessment.result?.answersJson || {},
      questions: getQuestionTexts(),
      isGenerating: !!assessment.result?.isGenerating,
      generationError: assessment.result?.generationError || null,
      summary: {
        orientation: assessment.result?.orientation ?? "-",
        roleComment: assessment.result?.roleComment ?? "-",
        topTraits: normalized.topTraits || [],
        weakTraits: normalized.weakTraits || [],
        roleFit: normalized.roleFit,
        managementAdvice: normalized.managementAdvice,
        generalRelation: buildPlainGeneralRelation({ assessment, normalized, expanded })
      },
      traits: normalized.traits,
      mainTraits: normalized.mainTraits,
      additionalParameters: normalized.additionalParameters,
      expandedReport: expanded
    }
  };

  res.render("detail", {
    submission,
    organizationName: req.session.admin.organizationName,
    isGenerating: !!assessment.result?.isGenerating && !expanded
  });
});


function valueDirectionLabel(score) {
  const value = Number(score || 0);
  if (value >= 15) return "area che può aiutare la persona nel lavoro";
  if (value <= -15) return "area da seguire con attenzione";
  return "area abbastanza equilibrata, da osservare nel lavoro quotidiano";
}

function buildPlainGeneralRelation({ assessment, normalized, expanded }) {
  if (expanded?.generalSummary) return expanded.generalSummary;

  const topTraits = Array.isArray(normalized.topTraits) ? normalized.topTraits.slice(0, 3) : [];
  const weakTraits = Array.isArray(normalized.weakTraits) ? normalized.weakTraits.slice(0, 2) : [];
  const topText = topTraits.length ? topTraits.join(", ") : "alcuni punti utili al ruolo";
  const weakText = weakTraits.length ? weakTraits.join(", ") : "alcuni comportamenti da osservare meglio nel lavoro";
  const role = assessment.requestedRole || "ruolo indicato";

  return `La persona è stata valutata in riferimento al ruolo di ${role}. Il profilo mostra alcuni elementi che possono essere utili nella gestione quotidiana del lavoro, in particolare ${topText}. Questi aspetti possono aiutare la risorsa a dare continuità al proprio contributo, soprattutto se inserita in un contesto con obiettivi chiari e responsabilità ben definite.\n\nLe aree da seguire con maggiore attenzione sono ${weakText}. Non vanno lette come un giudizio definitivo, ma come segnali pratici da verificare nel colloquio e nell’osservazione sul campo. In una PMI è importante tradurre questi elementi in indicazioni semplici: cosa affidare alla persona, quanto controllo prevedere, quali priorità chiarire e in quali situazioni affiancarla.\n\nQuesta valutazione è indicativa e non deve essere usata come unico strumento per decidere inserimenti, promozioni o cambi di mansione. Il risultato va sempre confrontato con colloquio, esperienza reale, referenze interne e comportamento osservato nel lavoro.`;
}

function drawSimpleSectionTitle(doc, title) {
  doc.fontSize(18).fillColor("black").text(title);
  doc.moveDown(0.6);
}

function writeParagraphs(doc, text) {
  String(text || "-")
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((paragraph) => {
      doc.fontSize(11).fillColor("black").text(paragraph, {
        align: "left",
        lineGap: 3
      });
      doc.moveDown(0.6);
    });
}

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
  const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
  const traits = normalized.traits;
  const mainTraits = normalized.mainTraits;
  const additionalParameters = normalized.additionalParameters;
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

  const roleFit = normalized.roleFit;
  const managementAdvice = normalized.managementAdvice;

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

  // PAGINA 3: relazione generale, in stile semplice e utilizzabile dall'imprenditore.
  doc.addPage();
  drawLogo(doc);
  drawSimpleSectionTitle(doc, "Relazione generale");

  const generalRelation = buildPlainGeneralRelation({ assessment, normalized, expanded });
  writeParagraphs(doc, generalRelation);

  doc.moveDown(0.2);
  doc.fontSize(14).fillColor("black").text("Indicazione pratica per la gestione");
  doc.moveDown(0.2);
  writeParagraphs(doc, managementAdvice || "Gestire la risorsa con obiettivi chiari, priorità scritte e momenti di confronto periodici.");

  if (Array.isArray(normalized.reliabilityFlags) && normalized.reliabilityFlags.length) {
    doc.moveDown(0.2);
    doc.fontSize(12).fillColor("#A33A2F").text("Nota da tenere presente");
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("black").text(
      "Alcune risposte mostrano oscillazioni interne. Il risultato va quindi letto con attenzione e verificato nel confronto diretto con la persona.",
      { lineGap: 2 }
    );
  }

  doc.fillColor("black");

  // PAGINE SUCCESSIVE: dettaglio tratti e parametri.
  doc.addPage();
  drawLogo(doc);
  doc.fontSize(16).fillColor("black").text("Dettaglio tratti e parametri aggiuntivi");
  doc.moveDown(0.7);

  doc.fontSize(14).text("Tratti");
  doc.moveDown(0.4);

  if (!mainTraits.length) {
    doc.fontSize(11).text("Nessun dettaglio tratti disponibile.");
  } else {
    mainTraits.forEach((t) => {
      doc.fontSize(11).text(`${t.name}: ${chartScore(t.score)}`);
    });
  }

  if (additionalParameters.length) {
    doc.moveDown();
    doc.fontSize(14).text("Parametri aggiuntivi");
    doc.moveDown(0.4);
    additionalParameters.forEach((t) => {
      doc.fontSize(11).text(`${t.name}: ${chartScore(t.score)}`);
    });
  }

  if (expanded?.generalSummary) {
    doc.addPage();
    drawLogo(doc);

    doc.fontSize(16).fillColor("black").text("Approfondimento dei tratti");
    doc.moveDown(0.5);

    doc.moveDown();

    if (Array.isArray(expanded.traits)) {
      expanded.traits.forEach((t) => {
        doc.fontSize(14).text(t.name || "Tratto");
        doc.moveDown(0.2);

        doc.fontSize(11).text(t.expandedText || "");
        doc.moveDown(0.3);

        doc.fontSize(11).text(`Rimedi pratici: ${t.improvementPlan || "-"}`);
        doc.moveDown(0.3);

        doc.fontSize(11).text(
          `Come gestirlo nella pratica: ${t.skillAction || t.teamLeverage || "-"}`
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
