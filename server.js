import "dotenv/config";
import express from "express";
import path from "path";
import zlib from "zlib";
import bcrypt from "bcrypt";
import session from "express-session";
import PDFDocument from "pdfkit";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { ZPI_QUESTIONS, getScoredQuestions } from "./questions.js";
import { SPORT_QUESTIONS, getSportScoredQuestions } from "./sport-questions.js";

const prisma = new PrismaClient({
  log: ["warn", "error"]
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});


function formatDateTimeRome(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("it-IT", {
    timeZone: "Europe/Rome"
  });
}

function parseRomeDateStart(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00+02:00`);
}

function parseRomeDateEnd(value) {
  if (!value) return null;
  return new Date(`${value}T23:59:59.999+02:00`);
}

function buildAdminAssessmentWhere(source, organizationId) {
  const companyFilter = (source.company || "").toString().trim();
  const assessmentTypeFilter = (source.assessmentType || "").toString().trim();
  const fromDate = (source.fromDate || "").toString().trim();
  const toDate = (source.toDate || "").toString().trim();

  const where = { organizationId };

  if (companyFilter) {
    where.candidateCompany = {
      contains: companyFilter,
      mode: "insensitive"
    };
  }

  if (assessmentTypeFilter) {
    where.assessmentType = assessmentTypeFilter;
  }

  if (fromDate || toDate) {
    where.createdAt = {};

    const start = parseRomeDateStart(fromDate);
    const end = parseRomeDateEnd(toDate);

    if (start) where.createdAt.gte = start;
    if (end) where.createdAt.lte = end;
  }

  return {
    where,
    filters: {
      company: companyFilter,
      assessmentType: assessmentTypeFilter,
      fromDate,
      toDate
    }
  };
}

function buildAdminQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}



function normalizeBrokenUtf8(text) {
  const value = String(text ?? "");

  if (!/[ÃÂâ�]/.test(value)) {
    return value;
  }

  let repaired = value;

  try {
    const decoded = Buffer.from(value, "latin1").toString("utf8");
    const badBefore = (value.match(/[ÃÂâ�]/g) || []).length;
    const badAfter = (decoded.match(/[ÃÂâ�]/g) || []).length;

    if (badAfter < badBefore || /[àèéìòùÀÈÉÌÒÙ’“”–—™€]/.test(decoded)) {
      repaired = decoded;
    }
  } catch (_error) {
    repaired = value;
  }

  return String(repaired || "")
    .replace(/Ã€|A\u0300/g, "À")
    .replace(/Ãˆ|E\u0300/g, "È")
    .replace(/Ã‰/g, "É")
    .replace(/ÃŒ|I\u0300/g, "Ì")
    .replace(/Ã’|O\u0300/g, "Ò")
    .replace(/Ã™|U\u0300/g, "Ù")
    .replace(/Ã[\u00A0 ]/g, "à")
    .replace(/Ã¡/g, "á")
    .replace(/Ã¨/g, "è")
    .replace(/Ã©/g, "é")
    .replace(/Ã¬/g, "ì")
    .replace(/Ã­/g, "í")
    .replace(/Ã²/g, "ò")
    .replace(/Ã³/g, "ó")
    .replace(/Ã¹/g, "ù")
    .replace(/Ãº/g, "ú")
    .replace(/Ã§/g, "ç")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã¼/g, "ü")
    .replace(/Ã¶/g, "ö")
    .replace(/Ã¤/g, "ä")
    .replace(/Â°/g, "°")
    .replace(/Â«/g, "«")
    .replace(/Â»/g, "»")
    .replace(/Â/g, "")
    .replace(/â€™/g, "’")
    .replace(/â€˜/g, "‘")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€¦/g, "…")
    .replace(/â€¢/g, "•")
    .replace(/â„¢/g, "™")
    .replace(/â‚¬/g, "€")
    .replace(/�/g, "");
}

function normalizeTextPayload(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeTextPayload(item));

  if (value && typeof value === "object" && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeTextPayload(item)])
    );
  }

  if (typeof value === "string") {
    return normalizeBrokenUtf8(value)
      .replace(/La risorsa può essere gestita/gi, "Può essere utile lavorare")
      .replace(/La risorsa può rendere/gi, "La persona può rendere")
      .replace(/la risorsa/gi, "la persona")
      .replace(/La risorsa/g, "La persona")
      .replace(/\d{1,3}\s*\/\s*100/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  return value;
}

function normalizePdfVisibleText(text) {
  // Correzione SOLO VISIVA per rendering PDF/Word: non va usata su nomi interni,
  // mapping, scoring, filtri o JSON salvati. Serve solo a ripulire output già calcolato.
  return normalizeBrokenUtf8(text)
    .replace(/ResponsabilitÃ\b/g, "Responsabilità")
    .replace(/ResponsabilitÃ\s/g, "Responsabilità ")
    .replace(/ResponsabilitÃ$/g, "Responsabilità")
    .replace(/EspansivitÃ\b/g, "Espansività")
    .replace(/EspansivitÃ\s/g, "Espansività ")
    .replace(/EspansivitÃ$/g, "Espansività")
    .replace(/AttendibilitÃ\b/g, "Attendibilità")
    .replace(/AttendibilitÃ\s/g, "Attendibilità ")
    .replace(/AttendibilitÃ$/g, "Attendibilità")
    .replace(/prioritÃ\b/g, "priorità")
    .replace(/prioritÃ\s/g, "priorità ")
    .replace(/prioritÃ$/g, "priorità")
    .replace(/modalitÃ\b/g, "modalità")
    .replace(/modalitÃ\s/g, "modalità ")
    .replace(/modalitÃ$/g, "modalità")
    .replace(/rigiditÃ\b/g, "rigidità")
    .replace(/rigiditÃ\s/g, "rigidità ")
    .replace(/rigiditÃ$/g, "rigidità")
    .replace(/continuitÃ\b/g, "continuità")
    .replace(/continuitÃ\s/g, "continuità ")
    .replace(/continuitÃ$/g, "continuità")
    .replace(/utilitÃ\b/g, "utilità")
    .replace(/utilitÃ\s/g, "utilità ")
    .replace(/utilitÃ$/g, "utilità")
    .replace(/soliditÃ\b/g, "solidità")
    .replace(/soliditÃ\s/g, "solidità ")
    .replace(/soliditÃ$/g, "solidità")
    .replace(/attivitÃ\b/g, "attività")
    .replace(/attivitÃ\s/g, "attività ")
    .replace(/attivitÃ$/g, "attività")
    .replace(/capacitÃ\b/g, "capacità")
    .replace(/capacitÃ\s/g, "capacità ")
    .replace(/capacitÃ$/g, "capacità")
    .replace(/compatibilitÃ\b/g, "compatibilità")
    .replace(/compatibilitÃ\s/g, "compatibilità ")
    .replace(/compatibilitÃ$/g, "compatibilità")
    .replace(/EtÃ\b/g, "Età")
    .replace(/EtÃ\s/g, "Età ")
    .replace(/EtÃ$/g, "Età")
    .replace(/puÃ²/g, "può")
    .replace(/\bpu(?=\s+(essere|avere|risultare|dare|emergere|accettare|invece|percepire|mostrare|rendere|creare|succedere|portare|aiutare|diventare|funzionare|tradursi|richiedere|sostenere|modificare|generare|appoggiarsi|subire|fare|restare|variare|riuscire|preferire|mettere|vivere|accogliere|cercare|mantenere|apparire|offrire|produrre|facilitare|riflettere|indicare|rappresentare|rivelare|dipendere|servire)\b)/gi, "può")
    .replace(/\bpi(?=\s+(efficace|chiaro|chiara|chiari|chiare|deciso|decisa|decisi|decise|solido|solida|solidi|solide|stabile|stabili|marcato|marcata|marcati|marcate|facile|facili|utile|utili|strutturato|strutturata|strutturati|strutturate|forte|forti|rapido|rapida|rapidi|rapide|complesso|complessa|complessi|complesse|profondo|profonda|profondi|profonde)\b)/gi, "più")
    .replace(/\bgi(?=\s+(conosciuto|conosciuta|conosciuti|conosciute|presente|presenti|chiaro|chiara|chiari|chiare|visto|vista|visti|viste|fatto|fatta|fatti|fatte|stato|stata|stati|state|maturo|matura|maturi|mature)\b)/gi, "già")
    .replace(/\bperch(?=\s)/gi, "perché")
    .replace(/\bqualit(?=\s|$)/gi, "qualità")
    .replace(/\bopportunit(?=\s|$)/gi, "opportunità")
    .replace(/\bnecessit(?=\s|$)/gi, "necessità")
    .replace(/\bdifficolt(?=\s|$)/gi, "difficoltà")
    .replace(/\bambiguit(?=\s|$)/gi, "ambiguità")
    .replace(/\bdisponibilit(?=\s|$)/gi, "disponibilità")
    .replace(/\bvisibilit(?=\s|$)/gi, "visibilità")
    .replace(/\btracciabilit(?=\s|$)/gi, "tracciabilità")
    .replace(/\baffidabilit(?=\s|$)/gi, "affidabilità")
    .replace(/\bResponsabilit(?=\s|$)/g, "Responsabilità")
    .replace(/\bEspansivit(?=\s|$)/g, "Espansività")
    .replace(/\bAttendibilit(?=\s|$)/g, "Attendibilità")
    .replace(/\bpriorit(?=\s|$)/g, "priorità")
    .replace(/\bmodalit(?=\s|$)/g, "modalità")
    .replace(/\brigidit(?=\s|$)/g, "rigidità")
    .replace(/\bcontinuit(?=\s|$)/g, "continuità")
    .replace(/\butilit(?=\s|$)/g, "utilità")
    .replace(/\bsolidit(?=\s|$)/g, "solidità")
    .replace(/\battivit(?=\s|$)/g, "attività")
    .replace(/\bcapacit(?=\s|$)/g, "capacità")
    .replace(/\bcompatibilit(?=\s|$)/g, "compatibilità")
    .replace(/\boperativit(?=[:;,.!?\s]|$)/gi, "operatività")
    .replace(/\bproduttivit(?=[:;,.!?\s]|$)/gi, "produttività")
    .replace(/\bcontinuit(?=[:;,.!?\s]|$)/gi, "continuità")
    .replace(/\bresponsabilit(?=[:;,.!?\s]|$)/gi, "responsabilità")
    .replace(/\bpriorit(?=[:;,.!?\s]|$)/gi, "priorità")
    .replace(/\battivit(?=[:;,.!?\s]|$)/gi, "attività")
    .replace(/\bcapacit(?=[:;,.!?\s]|$)/gi, "capacità")
    .replace(/\bpi(?=\s+(efficac|util|chiar|concret|solid|stabil|marcat|facil|strutturat|fort|rapid|compless|profond|vicin|amp|adatt|coerent|puntual|frequent|semplic|specific|motivanti|decis|produttiv|visibil)\w*\b)/gi, "più")
    .replace(/\bpu(?=\s+(essere|avere|risultare|dare|emergere|accettare|invece|percepire|mostrare|rendere|creare|succedere|portare|aiutare|diventare|funzionare|tradursi|richiedere|sostenere|modificare|generare|appoggiarsi|subire|fare|restare|variare|riuscire|preferire|mettere|vivere|accogliere|cercare|mantenere|apparire|offrire|produrre|facilitare|riflettere|indicare|rappresentare|rivelare|dipendere|servire|favorire|rivedere|incidere|limitare|mostrarsi|tradurre|contribuire|sostenere|perdere|gestire|aiutare|diventare|richiedere)\b)/gi, "può")
    .replace(/\bgi(?=\s+(conosciut|present|chiar|vist|fatt|stat|matur|consolidat|format|emers|attiv|avviat|definit)\w*\b)/gi, "già")
    .replace(/(^|\n)(\s*)Attendibilità\s+(S[IÌ]|FORZATA|NO)\s*[.:]/g, "$1$2Attendibilità: $3.")
    .replace(/(^|\n)(\s*)Attendibilit[aà]\s+(S[IÌ]|FORZATA|NO)\s*[.:]/gi, "$1$2Attendibilità: $3.")
    .replace(/\bEt(?=:|\s|$)/g, "Età")
    .replace(/[\u0018\u0019]/g, "’");
}

function patchPdfTextNormalization(doc) {
  if (!doc || doc.__zpiTextNormalizationPatched) return doc;

  const originalText = doc.text.bind(doc);
  doc.text = (text, ...args) => originalText(normalizePdfVisibleText(text), ...args);
  doc.__zpiTextNormalizationPatched = true;

  return doc;
}


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

app.get("/favicon.ico", (_req, res) => {
  res.type("image/svg+xml");
  res.sendFile(path.join(__dirname, "public", "favicon.svg"));
});

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


const ASSESSMENT_TYPES = {
  zpi_hr: {
    key: "zpi_hr",
    title: "ZPIâ„¢ â€“ Zenith Performance Index",
    shortTitle: "ZPIâ„¢",
    publicPath: "/zenith-assessment",
    qrDownloadPath: "/admin/qr/zenith/download",
    tokenEnv: "ZENITH_ASSESSMENT_TOKEN",
    defaultTokenSuffix: "manager-001",
    questions: ZPI_QUESTIONS,
    getScoredQuestions,
    active: true
  },
  sport_performance: {
    key: "sport_performance",
    title: "Human & Sport Performance",
    shortTitle: "Sport Performance",
    publicPath: "/human-sport-performance",
    qrDownloadPath: "/admin/qr/sport/download",
    tokenEnv: "SPORT_ASSESSMENT_TOKEN",
    defaultTokenSuffix: "sport-performance-001",
    questions: SPORT_QUESTIONS,
    getScoredQuestions: getSportScoredQuestions,
    active: true
  }
};

function getAssessmentConfig(type = "zpi_hr") {
  const config = ASSESSMENT_TYPES[type] || ASSESSMENT_TYPES.zpi_hr;
  return {
    ...config,
    title: normalizeBrokenUtf8(config.title),
    shortTitle: normalizeBrokenUtf8(config.shortTitle)
  };
}

function inferAssessmentTypeFromToken(token = "") {
  const value = String(token || "").toLowerCase();
  if (value.includes("sport") || value.includes("human")) return "sport_performance";
  return "zpi_hr";
}

function getLinkAssessmentType(link) {
  return link?.assessmentType || inferAssessmentTypeFromToken(link?.token);
}

function getAssessmentPublicUrl(type, publicBaseUrl) {
  return `${publicBaseUrl}${getAssessmentConfig(type).publicPath}`;
}

function buildQrCodeUrl(url, size = 220, margin = 14) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=${margin}&data=${encodeURIComponent(url)}`;
}

const ROLE_OPTIONS = [
  { value: "direzione", label: "Direzione / Imprenditore" },
  { value: "manager", label: "Manager / Responsabile di funzione" },

  { value: "sales", label: "Sales / Commerciale" },
  { value: "marketing", label: "Marketing / Comunicazione" },

  { value: "amministrativo", label: "Amministrazione / Finance" },
  { value: "segreteria", label: "Segreteria" },
  { value: "segreteria_direzione", label: "Segreteria direzione" },
  { value: "impiegato_amministrativo", label: "Impiegato amministrativo" },
  { value: "responsabile_amministrativo", label: "Responsabile amministrativo" },

  { value: "operations", label: "Operations / Produzione / Logistica" },
  { value: "responsabile_produzione", label: "Responsabile produzione" },
  { value: "responsabile_logistica", label: "Responsabile logistica" },
  { value: "responsabile_magazzino", label: "Responsabile magazzino" },
  { value: "operai", label: "Operai" },
  { value: "magazzinieri", label: "Magazzinieri" },
  { value: "addetti_logistica", label: "Addetti alla logistica" },

  { value: "customer_service", label: "Customer service / Post-vendita" },

  { value: "hr", label: "HR / People" },

  { value: "it_digital", label: "IT / Digital / Project" },

  { value: "altro", label: "Altro" }
];

function normalizeRequestedRole(bodyRole, bodyOtherRole, fallbackRole) {
  const role = String(bodyRole || "").trim();
  const other = String(bodyOtherRole || "").trim();

  if (role === "altro") return other ? `Altro: ${other}` : "Altro";
  return role || fallbackRole || "non_specificato";
}


const DIMENSION_CATEGORY = {
  TRAIT: "trait",
  ADDITIONAL: "additional"
};

const TRAIT_DIMENSIONS = [
  "Organizzazione e pianificazione",
  "Automotivazione",
  "AffidabilitÃ  + autodisciplina",
  "Sicurezza",
  "Stress",
  "Dinamismo",
  "FlessibilitÃ  comunicativa",
  "ResponsabilitÃ ",
  "Ascolto attivo",
  "Comprensione",
  "EspansivitÃ "
];

const ADDITIONAL_PARAMETER_DIMENSIONS = [
  "Resistenza al cambiamento",
  "Leadership naturale",
  "Management",
  "Cooperazione",
  "Principi",
  "Vendite",
  "Gestione prioritÃ ",
  "CapacitÃ  di gestione finanziaria",
  "AttendibilitÃ "
];

const DIMENSION_ORDER = new Map(
  [...TRAIT_DIMENSIONS, ...ADDITIONAL_PARAMETER_DIMENSIONS].map((name, index) => [name, index])
);

const DIMENSION_DEFINITIONS = {
  "Organizzazione e metodo": [
    { name: "Organizzazione e pianificazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Gestione prioritÃ ", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Visione e orientamento al futuro": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Ambizione e competitivitÃ ": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Indice di attendibilitÃ ": [
    { name: "AffidabilitÃ  + autodisciplina", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Principi", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "ContinuitÃ  professionale": [
    { name: "AffidabilitÃ  + autodisciplina", category: DIMENSION_CATEGORY.TRAIT },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "ResponsabilitÃ  e ownership": [
    { name: "ResponsabilitÃ ", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "StabilitÃ  emotiva e fiducia": [
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
    { name: "FlessibilitÃ  comunicativa", category: DIMENSION_CATEGORY.TRAIT }
  ],
  "FlessibilitÃ  e adattabilitÃ ": [
    { name: "FlessibilitÃ  comunicativa", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Resistenza al cambiamento", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "AssertivitÃ  e negoziazione": [
    { name: "FlessibilitÃ  comunicativa", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Empatia e collaborazione": [
    { name: "Ascolto attivo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Comprensione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Estroversione e networking": [
    { name: "EspansivitÃ ", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Vendite", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Leadership e influenza": [
    { name: "Leadership naturale", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "ResponsabilitÃ ", category: DIMENSION_CATEGORY.TRAIT }
  ],
  "Orientamento alla performance": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Management", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "Principi", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "SensibilitÃ  al riconoscimento": [
    { name: "Sicurezza", category: DIMENSION_CATEGORY.TRAIT },
    { name: "Cooperazione", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "Autonomia economica e iniziativa": [
    { name: "Automotivazione", category: DIMENSION_CATEGORY.TRAIT },
    { name: "ResponsabilitÃ ", category: DIMENSION_CATEGORY.TRAIT },
    { name: "CapacitÃ  di gestione finanziaria", category: DIMENSION_CATEGORY.ADDITIONAL },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
  ],
  "CreativitÃ  e innovazione": [
    { name: "Dinamismo", category: DIMENSION_CATEGORY.TRAIT },
    { name: "AttendibilitÃ ", category: DIMENSION_CATEGORY.ADDITIONAL }
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

const ZENITH_INDIGO = "#2F4B7C";

const DISPLAY_LABELS = {
  "AffidabilitÃ  + autodisciplina": "AffidabilitÃ ",
  "Stress": "Gestione pressioni / Stress",
  "CapacitÃ  di gestiÃ³ne finanziaria": "CapacitÃ  di gestione finanziaria"
};

const DIMENSION_DESCRIPTIONS = {
  "Organizzazione e pianificazione": "misura la capacitÃ  di programmare il lavoro nel breve e nel lungo periodo",
  "Automotivazione": "misura quanto la persona crede in se stessa e nelle proprie capacitÃ  di avere successo",
  "AffidabilitÃ  + autodisciplina": "misura coscienziositÃ , senso di responsabilitÃ , accuratezza e capacitÃ  di mantenere ciÃ² che viene affidato",
  "AffidabilitÃ ": "misura coscienziositÃ , senso di responsabilitÃ , accuratezza e capacitÃ  di mantenere ciÃ² che viene affidato",
  "Sicurezza": "misura la struttura delle convinzioni della persona: quanto Ã¨ certa delle proprie idee, quanto le difende, quanto Ã¨ disposta a metterle in discussione e quanto il suo punto di vista Ã¨ concreto o teorico",
  "Stress": "misura la presenza di pressioni, contrasti o situazioni che possono drenare energia e luciditÃ ",
  "Gestione pressioni / Stress": "misura la presenza di pressioni, contrasti o situazioni che possono drenare energia e luciditÃ ",
  "Dinamismo": "misura il livello di energia, movimento e prontezza nellâ€™iniziare le attivitÃ ",
  "FlessibilitÃ  comunicativa": "misura determinazione, assertivitÃ , focus sul risultato e capacitÃ  di comunicare con decisione",
  "ResponsabilitÃ ": "misura proattivitÃ , centralitÃ  e capacitÃ  di assumersi responsabilitÃ  senza subire gli eventi",
  "Ascolto attivo": "misura la capacitÃ  di comprendere punti di vista diversi senza filtrarli attraverso pregiudizi",
  "Comprensione": "misura la capacitÃ  di comprendere gli altri da un punto di vista emotivo e relazionale",
  "EspansivitÃ ": "misura la qualitÃ  del primo approccio e la disponibilitÃ  a relazionarsi con apertura",
  "Resistenza al cambiamento": "misura la disponibilitÃ  ad accettare cambiamenti, nuove procedure e nuove modalitÃ  di lavoro",
  "Leadership naturale": "misura la tendenza a coinvolgere, guidare e diventare punto di riferimento per gli altri",
  "Management": "misura la capacitÃ  di organizzare persone, attivitÃ  e responsabilitÃ  in modo concreto",
  "Cooperazione": "misura la capacitÃ  di collaborare, condividere informazioni e lavorare con continuitÃ  insieme agli altri",
  "Principi": "misura la coerenza con regole, valori aziendali e comportamenti professionali corretti",
  "Vendite": "misura la predisposizione a proporre, influenzare, negoziare e sostenere una proposta commerciale",
  "Gestione prioritÃ ": "misura la capacitÃ  di distinguere ciÃ² che Ã¨ importante da ciÃ² che Ã¨ solo urgente",
  "CapacitÃ  di gestione finanziaria": "misura la capacitÃ  di generare reddito autonomo, risparmiare e gestire le risorse economiche in ottica futura",
  "AttendibilitÃ ": "misura se le risposte risultano sincere, forzate o non sufficientemente attendibili"
};

const ZPI_EVO_TRAIT_GUIDE = {
  "Organizzazione e pianificazione": { evo: "Vision Organizzativa", bands: [{ min: 50, text: "capacità concreta di programmare il lavoro a breve, mantenere ordine operativo e rispettare consegne e scadenze" }, { min: 30, text: "fascia intermedia positiva: in genere riesce a programmarsi, ma può confondersi o disperdersi quando ci sono molte cose da fare" }, { min: 10, text: "ha bisogno di aiuto per trasformare il lavoro in piani, priorità e programmazione settimanale" }, { min: -10, text: "tendenza a correre dietro alle urgenze senza programmare davvero, con rischio di dispersione" }, { min: -100, text: "forte disorganizzazione operativa e marcata dispersione nella gestione delle attività" }] },
  "Automotivazione": { evo: "Automotivazione", bands: [{ min: 70, text: "spinta personale molto elevata, con forte fiducia nelle proprie possibilità; attenzione all’eccesso di considerazione di sé" }, { min: 40, text: "molto motivata e ambiziosa, con buona spinta autonoma verso il risultato" }, { min: 0, text: "riesce ad automotivarsi, ma può avere difficoltà ad accendere o motivare gli altri" }, { min: -30, text: "ha bisogno di motivazione, carica e riconoscimento esterni, soprattutto nei momenti di difficoltà" }, { min: -100, text: "crede poco nelle proprie possibilità e può essersi allontanata da scopi o obiettivi importanti" }] },
  "AffidabilitÃ ": { evo: "Autodisciplina", bands: [{ min: 60, text: "molto affidabile: dà peso alla parola data, mantiene gli accordi e sostiene la continuità esecutiva anche quando costa sacrificio" }, { min: 40, text: "decisamente affidabile, opera con buon senso del dovere e con uno scambio corretto rispetto al ruolo" }, { min: 20, text: "può non curare fino in fondo alcuni aspetti del ruolo, soprattutto sotto pressione o quando il controllo diminuisce" }, { min: 0, text: "tende a rimandare, tamponare o lasciare attività non completamente gestite; la continuità esecutiva va presidiata" }, { min: -100, text: "può essere produttiva con direttive chiare e controllo costante, ma l’incostanza rischia di lasciare cose non gestite" }] },
  "Sicurezza": { evo: "Convinzioni", bands: [{ min: 70, text: "convinzioni molto radicate: puÃ² avere una visione d'insieme forte, ma rischia di diventare teorica o rigida se non verifica le idee nell'azione" }, { min: 50, text: "convinzioni strutturate e stabili: tende a sostituire se stessa con dati e criteri, ma puÃ² essere poco facile farle cambiare idea" }, { min: 10, text: "mantiene un punto di vista abbastanza stabile, pur potendo metterlo in discussione davanti a dati o alternative migliori" }, { min: -20, text: "puÃ² mettere facilmente in discussione le proprie idee e cercare riferimenti esterni, con rischio di influenzabilitÃ " }, { min: -100, text: "convinzioni poco stabili: puÃ² essere vittima di ciÃ² che non conosce, cercando sicurezza fuori da sÃ©" }] },
  "Gestione pressioni / Stress": { evo: "Gestione Pressioni", bands: [{ min: 70, text: "può aver incelofanato una situazione o una persona che crea difficoltà: all’esterno mantiene equilibrio, ma tende ad accettare compromessi senza affrontare fino in fondo il nodo" }, { min: 30, text: "gestisce efficacemente eventuali situazioni di stress o pressione: la persona è sostanzialmente serena e, anche se ha qualche pressione, riesce a gestirla" }, { min: 0, text: "può esserci una persona o situazione che la ostacola o la preoccupa, con rischio di drenare energia, buonumore e attenzione" }, { min: -30, text: "sono presenti situazioni di conflitto o influenze negative evidenti, con possibili alti e bassi e riprese discontinue" }, { min: -70, text: "vive una forte condizione di stress legata a conflitti o pressioni, con rischio di errori e distrazioni" }, { min: -100, text: "agitazione marcata causata da una situazione conflittuale o da pressioni molto significative" }] },
  "Dinamismo": { evo: "Dinamismo", bands: [{ min: 70, text: "molto attiva e dinamica: inizia rapidamente ciò che deve fare e preferisce contesti in movimento" }, { min: 50, text: "attiva: avvia abbastanza rapidamente i lavori e preferisce attività dinamiche a quelle troppo sedentarie" }, { min: 30, text: "attiva ma non troppo: può preferire routine e lavori più tranquilli rispetto ad attività molto movimentate" }, { min: 0, text: "poco attiva: può fare fatica a mettere energia nell’avviare nuove attività e preferire lavori sedentari" }, { min: -100, text: "bassa energia di azione e forte difficoltà ad avviare anche attività di routine" }] },
  "FlessibilitÃ  comunicativa": { evo: "Determinazione", bands: [{ min: 80, text: "molto autorevole, diretta e orientata al risultato; può convincere gli altri, ma deve evitare eccesso di dominanza o impazienza" }, { min: 60, text: "concreta e assertiva: affronta le situazioni di petto e sostiene con efficacia la propria posizione" }, { min: 40, text: "mantiene un buon focus sul risultato e una discreta assertività, utile anche in ambito commerciale" }, { min: 20, text: "può manifestare lentezza produttiva o difficoltà a incidere, chiedendo le cose senza vera assertività" }, { min: -100, text: "tende ad aggirare i problemi, non affronta le situazioni di petto e può perdere focus sui risultati" }] },
  "ResponsabilitÃ ": { evo: "CentralitÃ ", bands: [{ min: 60, text: "molto propositiva: tende a farsi carico dei problemi, mettersi in discussione e muoversi da causa rispetto alle situazioni" }, { min: 30, text: "proattiva nei rapporti con gli altri, orientata alle soluzioni e al problem solving" }, { min: 10, text: "si prende responsabilità soprattutto per ciò che dipende direttamente da lei, ma può essere permalosa se messa in discussione" }, { min: -10, text: "non sempre propositiva: può ragionare da effetto e reagire soprattutto sotto pressione o quando incontra disaccordi" }, { min: -100, text: "tende a sentirsi effetto degli eventi, attribuire le cause all’esterno e subire le situazioni" }] },
  "Ascolto attivo": { evo: "Comprensione", bands: [{ min: 60, text: "comprende molto bene persone e situazioni, sa mettersi nei panni dell’altro e tende a vedere il buono negli altri" }, { min: 10, text: "comprende abbastanza bene persone e situazioni, analizza senza troppi pregiudizi e può correggere positivamente gli altri" }, { min: -20, text: "non sempre comprende gli altri: quando qualcosa non rientra nella sua valutazione può criticare o leggere la situazione in modo parziale" }, { min: -100, text: "fatica a comprendere punti di vista diversi e può avere una comunicazione critica, centrata sugli errori" }] },
  "Comprensione": { evo: "Empatia", bands: [{ min: 60, text: "mette gli altri a proprio agio e coglie bene stati dâ€™animo e bisogni" }, { min: 20, text: "calorosa, disponibile e attenta agli altri" }, { min: -20, text: "puÃ² mostrare freddezza o distacco, soprattutto in situazioni di disaccordo" }, { min: -100, text: "generalmente distaccata e fredda, con rischio di risultare poco sensibile" }] },
  "EspansivitÃ ": { evo: "Estroversione", bands: [{ min: 70, text: "fortemente spigliata, disinibita e calorosa nellâ€™approccio" }, { min: 40, text: "aperta e cordiale nel primo approccio" }, { min: 20, text: "selettiva e formale, ma capace di approcciare se necessario" }, { min: 0, text: "traspare un poâ€™ di timidezza con persone nuove" }, { min: -40, text: "non fa facilmente il primo passo e puÃ² restare sulle sue" }, { min: -100, text: "chiusa, ritirata o impacciata con persone che non conosce" }] }
};

function evoGuideForDimension(name, score) {
  const displayName = displayDimensionName(name);
  const guide =
    ZPI_EVO_TRAIT_GUIDE[displayName] ||
    ZPI_EVO_TRAIT_GUIDE[normalizeBrokenUtf8(displayName)] ||
    Object.entries(ZPI_EVO_TRAIT_GUIDE).find(([guideName]) => {
      return dimensionAiMatchKey(guideName) === dimensionAiMatchKey(displayName);
    })?.[1];

  if (!guide) return null;

  const value = chartScore(score);
  const band = guide.bands.find((item) => value >= item.min) || guide.bands[guide.bands.length - 1];
  return { evoParameter: guide.evo, chartScore: value, interpretation: band.text };
}

function truthfulnessStatusFromScore(score) {
  const value = Number(score || 0);
  if (value >= 50) return { label: "Attendibilità: SÌ", text: "le risposte risultano complessivamente coerenti e il profilo puÃ² essere letto con buona fiducia, pur restando da confrontare con colloquio e osservazione concreta." };
  if (value >= 30) return { label: "Attendibilità: FORZATA", text: "le risposte appaiono parzialmente controllate o orientate a presentarsi in modo favorevole; il profilo va letto con prudenza e verificato con esempi reali." };
  return { label: "Attendibilità: NO", text: "le risposte non offrono una base sufficientemente coerente; la relazione va considerata indicativa e richiede approfondimento diretto prima di trarre conclusioni operative." };
}

function stripForbiddenGeneralRelationPhrases(text) {
  return String(text || "")
    .replace(/La persona Ã¨ stata valutata in riferimento al ruolo di\s+[^.]+\.\s*/gi, "")
    .replace(/La risorsa Ã¨ stata valutata in riferimento al ruolo di\s+[^.]+\.\s*/gi, "")
    .trim();
}


function displayDimensionName(name) {
  const value = normalizeBrokenUtf8(String(name || "").trim());
  const normalizedValue = value
    .replace(/gestiÃ³ne/gi, "gestione")
    .replace(/gestiÃ²ne/gi, "gestione")
    .replace(/gestióne/gi, "gestione")
    .replace(/gestiòne/gi, "gestione");

  return normalizeBrokenUtf8(DISPLAY_LABELS[value] || DISPLAY_LABELS[normalizedValue] || normalizedValue);
}

function dimensionDescription(name) {
  const displayName = displayDimensionName(name);
  return normalizeBrokenUtf8(DIMENSION_DESCRIPTIONS[displayName] || DIMENSION_DESCRIPTIONS[String(name || "").trim()] || "");
}

function withDisplayMeta(item) {
  const displayName = displayDimensionName(item?.name);
  return {
    ...item,
    displayName,
    description: dimensionDescription(item?.name),
    chartScore: chartScore(item?.score)
  };
}

function normalizeDimensionDefinitions(originalTrait) {
  return DIMENSION_DEFINITIONS[originalTrait] || [
    { name: String(originalTrait || "Dinamismo"), category: DIMENSION_CATEGORY.TRAIT }
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

  const operationsRoleValues = new Set([
    "operations",
    "responsabile_produzione",
    "responsabile_logistica",
    "responsabile_magazzino",
    "operai",
    "magazzinieri",
    "addetti_logistica"
  ]);

  if (operationsRoleValues.has(value)) return "operations";
  if (value === "altro" || value.startsWith("altro:")) return "altro";

  const directValues = new Set(ROLE_OPTIONS.map((item) => item.value));
  if (directValues.has(value)) return value;

  if (/direzione|imprenditore|ceo|founder|titolare/.test(value)) return "direzione";
  if (/operations|produzione|logistica|magazzin|operaio|operai|supply/.test(value)) return "operations";
  if (/responsabile amministrativo|responsabile amministrazione/.test(value)) return "responsabile_amministrativo";
  if (/impiegato amministrativo|impiegata amministrativa/.test(value)) return "impiegato_amministrativo";
  if (/manager|responsabile|store manager|coordinatore|coordinator/.test(value)) return "manager";
  if (/sales|commerciale|vendit|account/.test(value)) return "sales";
  if (/marketing|comunicazione|communication|brand/.test(value)) return "marketing";
  if (/segreteria direzione|segretaria direzione|assistant direzione|assistente direzione/.test(value)) return "segreteria_direzione";
  if (/segreteria|segretaria|front office|back office/.test(value)) return "segreteria";
  if (/amministr|finance|contabil|accounting/.test(value)) return "amministrativo";
  if (/customer|post.?vendita|assistenza|support/.test(value)) return "customer_service";
  if (/hr|people|risorse umane|recruit/.test(value)) return "hr";
  if (/it|digital|project|developer|ecommerce|e-commerce/.test(value)) return "it_digital";

  return "altro";
}


function isDirectionalExecutiveRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return (
    value === "direzione" ||
    value.includes("direzione") ||
    value.includes("imprenditore") ||
    value.includes("titolare") ||
    value.includes("ceo") ||
    value.includes("founder")
  );
}

function isDirectionalExecutiveNormalized(normalized = {}) {
  return isDirectionalExecutiveRole(normalized?.roleFit?.roleKey || normalized?.requestedRole || "");
}
const ROLE_FIT_WEIGHTS = {
  direzione: {
    "Automotivazione": 1.35,
    "ResponsabilitÃ ": 1.35,
    "Sicurezza": 1.2,
    "FlessibilitÃ  comunicativa": 1.15,
    "Organizzazione e pianificazione": 1.1,
    "Leadership naturale": 1.35,
    "Management": 1.3,
    "CapacitÃ  di gestione finanziaria": 1.1,
    "AttendibilitÃ ": 1.2,
    "Principi": 1.05
  },
  manager: {
    "ResponsabilitÃ ": 1.35,
    "Organizzazione e pianificazione": 1.25,
    "AffidabilitÃ  + autodisciplina": 1.25,
    "Sicurezza": 1.1,
    "Ascolto attivo": 1.1,
    "Leadership naturale": 1.3,
    "Management": 1.35,
    "Gestione prioritÃ ": 1.25,
    "Cooperazione": 1.1
  },
  sales: {
    "EspansivitÃ ": 1.35,
    "FlessibilitÃ  comunicativa": 1.3,
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
    "FlessibilitÃ  comunicativa": 1.25,
    "EspansivitÃ ": 1.15,
    "Automotivazione": 1.15,
    "Comprensione": 1.15,
    "CapacitÃ  di gestione finanziaria": 1.1,
    "AttendibilitÃ ": 1.25,
    "Vendite": 1.15,
    "Cooperazione": 1.1
  },
  amministrativo: {
    "Organizzazione e pianificazione": 1.45,
    "AffidabilitÃ  + autodisciplina": 1.4,
    "ResponsabilitÃ ": 1.25,
    "Stress": 1.1,
    "Gestione prioritÃ ": 1.3,
    "Principi": 1.25,
    "CapacitÃ  di gestione finanziaria": 1.1,
    "AttendibilitÃ ": 1.2,
    "Resistenza al cambiamento": 0.85
  },
  operations: {
    "Organizzazione e pianificazione": 1.35,
    "ResponsabilitÃ ": 1.3,
    "AffidabilitÃ  + autodisciplina": 1.25,
    "Stress": 1.15,
    "Dinamismo": 1.1,
    "Gestione prioritÃ ": 1.35,
    "Management": 1.15,
    "CapacitÃ  di gestione finanziaria": 1.05,
    "AttendibilitÃ ": 1.3,
    "Cooperazione": 1.1
  },
  customer_service: {
    "Ascolto attivo": 1.4,
    "Comprensione": 1.35,
    "FlessibilitÃ  comunicativa": 1.25,
    "Stress": 1.15,
    "Sicurezza": 1.1,
    "Cooperazione": 1.25,
    "Cooperazione": 1.2,
    "Principi": 1.1
  },
  hr: {
    "Ascolto attivo": 1.4,
    "Comprensione": 1.35,
    "FlessibilitÃ  comunicativa": 1.2,
    "Sicurezza": 1.1,
    "ResponsabilitÃ ": 1.1,
    "Cooperazione": 1.3,
    "Principi": 1.2,
    "Management": 1.1,
    "Cooperazione": 1.1
  },
  it_digital: {
    "Organizzazione e pianificazione": 1.25,
    "AffidabilitÃ  + autodisciplina": 1.25,
    "Automotivazione": 1.2,
    "Stress": 1.1,
    "FlessibilitÃ  comunicativa": 1.05,
    "Gestione prioritÃ ": 1.25,
    "CapacitÃ  di gestione finanziaria": 1.0,
    "AttendibilitÃ ": 1.35,
    "Principi": 1.1,
    "Cooperazione": 1.05
  },
  altro: {
    // Fallback prudente per ruoli liberi: profilo equilibrato da impiegato/collaboratore generalista.
    // Evita interpretazioni troppo specialistiche quando il ruolo non rientra nei preset.
    "Organizzazione e pianificazione": 1.2,
    "AffidabilitÃ  + autodisciplina": 1.2,
    "ResponsabilitÃ ": 1.15,
    "Gestione prioritÃ ": 1.15,
    "AttendibilitÃ ": 1.15,
    "Cooperazione": 1.1,
    "Comprensione": 1.05,
    "Ascolto attivo": 1.05,
    "Sicurezza": 1.0,
    "Stress": 1.0,
    "Automotivazione": 1.0,
    "Dinamismo": 1.0,
    "FlessibilitÃ  comunicativa": 1.0,
    "Principi": 1.0,
    "CapacitÃ  di gestione finanziaria": 0.95,
    "EspansivitÃ ": 0.9,
    "Vendite": 0.85,
    "Leadership naturale": 0.85,
    "Management": 0.85,
    "Resistenza al cambiamento": 0.85
  }
};


ROLE_FIT_WEIGHTS.segreteria = {
  "Organizzazione e pianificazione": 1.35,
  "AffidabilitÃ  + autodisciplina": 1.35,
  "ResponsabilitÃ ": 1.15,
  "Ascolto attivo": 1.2,
  "Comprensione": 1.15,
  "FlessibilitÃ  comunicativa": 1.1,
  "Gestione prioritÃ ": 1.3,
  "Cooperazione": 1.2,
  "Principi": 1.2,
  "AttendibilitÃ ": 1.15,
  "Stress": 1.05
};

ROLE_FIT_WEIGHTS.segreteria_direzione = {
  "Organizzazione e pianificazione": 1.4,
  "AffidabilitÃ  + autodisciplina": 1.35,
  "ResponsabilitÃ ": 1.25,
  "Sicurezza": 1.1,
  "Ascolto attivo": 1.15,
  "Comprensione": 1.1,
  "FlessibilitÃ  comunicativa": 1.15,
  "Gestione prioritÃ ": 1.35,
  "Cooperazione": 1.15,
  "Principi": 1.2,
  "AttendibilitÃ ": 1.2,
  "Management": 1.05
};

ROLE_FIT_WEIGHTS.impiegato_amministrativo = {
  ...ROLE_FIT_WEIGHTS.amministrativo,
  "Gestione prioritÃ ": 1.35,
  "Cooperazione": 1.1
};

ROLE_FIT_WEIGHTS.responsabile_amministrativo = {
  ...ROLE_FIT_WEIGHTS.amministrativo,
  "ResponsabilitÃ ": 1.35,
  "Management": 1.25,
  "Leadership naturale": 1.1,
  "Gestione prioritÃ ": 1.35,
  "AttendibilitÃ ": 1.3
};

function scoreToPercent(score) {
  const safeScore = Math.max(-30, Math.min(30, Number(score || 0)));
  return Math.round(((safeScore + 30) / 60) * 100);
}

function roleFitLabel(score) {
  if (score >= 85) return "CompatibilitÃ  molto alta";
  if (score >= 70) return "CompatibilitÃ  alta";
  if (score >= 55) return "CompatibilitÃ  discreta";
  if (score >= 40) return "CompatibilitÃ  da approfondire";
  return "CompatibilitÃ  bassa / da presidiare";
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
    note: "La compatibilitÃ  con il ruolo Ã¨ una lettura orientativa e non sostituisce il colloquio con la persona."
  };
}

function buildManagementAdvice({ traits, roleFit }) {
  const { traits: mainTraits } = splitDimensions(traits);
  const byName = new Map(mainTraits.map((trait) => [displayDimensionName(trait.name), trait]));
  const top = [...mainTraits].sort((a, b) => b.score - a.score).slice(0, 3).map((trait) => displayDimensionName(trait.name));
  const low = [...mainTraits].sort((a, b) => a.score - b.score).slice(0, 3).map((trait) => displayDimensionName(trait.name));

  if (roleFit?.score >= 75) {
    return "È utile lavorare con obiettivi chiari, margini progressivi di autonomia e momenti di confronto periodici. Il profilo suggerisce una buona coerenza con il ruolo: i tratti più solidi vanno tradotti in responsabilità osservabili e indicatori di risultato condivisi.";
  }

  if (low.includes("Gestione pressioni / Stress") || low.includes("Stress") || (byName.get("Gestione pressioni / Stress")?.score ?? 0) < 0) {
    return "È consigliabile prevedere priorità chiare, feedback frequenti e carichi progressivi. Nelle fasi più intense conviene evitare ambiguità operative e inserire punti di controllo ravvicinati, così da ridurre dispersione e pressione non necessaria.";
  }

  if (top.includes("Espansività") || top.includes("Dinamismo")) {
    return "Il contesto più adatto è dinamico, con interazione, confronto e obiettivi visibili. È utile canalizzare l’energia relazionale su attività con responsabilità definite, evitando che la spinta comunicativa si disperda in iniziative poco prioritarie.";
  }

  if (top.includes("Organizzazione e pianificazione") || top.includes("Affidabilità + autodisciplina")) {
    return "È utile gestire il lavoro con processi chiari, responsabilità definite e spazio per presidiare attività operative o progettuali. Gli obiettivi devono essere misurabili e la continuità di esecuzione va riconosciuta con riscontri concreti.";
  }

  return "Si consiglia una gestione bilanciata, con obiettivi chiari, feedback regolari e un contesto coerente con i tratti emersi. Le aree meno solide vanno presidiate con affiancamento operativo, mentre i punti forti vanno tradotti in responsabilità concrete.";
}

function isSuperAdmin(admin) {
  return String(admin?.role || "").toUpperCase() === "SUPER_ADMIN";
}

async function requireAdmin(req, res, next) {
  if (!req.session?.admin?.id) {
    return res.redirect("/admin/login");
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.session.admin.id },
      include: { organization: true }
    });

    if (!admin || admin.isActive === false) {
      return req.session.destroy(() => res.redirect("/admin/login"));
    }

    if (
      typeof req.session.admin.sessionVersion === "number" &&
      typeof admin.sessionVersion === "number" &&
      req.session.admin.sessionVersion !== admin.sessionVersion
    ) {
      return req.session.destroy(() => res.redirect("/admin/login"));
    }

    req.session.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || "VIEWER",
      sessionVersion: admin.sessionVersion || 1,
      organizationId: admin.organizationId,
      organizationName: admin.organization?.name || req.session.admin.organizationName
    };

    res.locals.currentAdmin = req.session.admin;
    res.locals.isSuperAdmin = isSuperAdmin(req.session.admin);

    return next();
  } catch (error) {
    console.error("Errore controllo sessione admin:", error);
    return res.status(500).send("Errore durante il controllo della sessione admin.");
  }
}

function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.session?.admin)) {
    return res.status(403).send("Operazione consentita solo a un Super Admin.");
  }

  return next();
}

function baseScore(answer) {
  if (answer === "agree") return 30;
  if (answer === "uncertain") return 10;
  if (answer === "disagree") return -30;
  if (answer === "high") return 30;
  if (answer === "medium") return 10;
  if (answer === "low") return -30;
  return 0;
}

function scoreAnswer(answer, reverse = false, question = null) {
  const customScore = question?.optionScores?.[answer];
  const value = typeof customScore === "number" ? customScore : baseScore(answer);
  return reverse ? value * -1 : value;
}

function answerLabel(answer, question = null) {
  const option = Array.isArray(question?.options)
    ? question.options.find((item) => item.value === answer)
    : null;

  if (option?.label) return option.label;
  if (answer === "agree") return "Sono dâ€™accordo";
  if (answer === "uncertain") return "Incerto";
  if (answer === "disagree") return "Non sono dâ€™accordo";
  if (answer === "high") return "Alta";
  if (answer === "medium") return "Intermedia";
  if (answer === "low") return "Bassa";
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

function getQuestionTexts(assessmentType = "zpi_hr") {
  const config = getAssessmentConfig(assessmentType);
  return Object.fromEntries(config.questions.map((q) => [q.key, q.text]));
}

function getQuestionnaireQuestions(assessmentType = "zpi_hr") {
  const config = getAssessmentConfig(assessmentType);
  return config.questions.map((q) => ({
    key: q.key,
    id: q.id,
    text: q.text,
    responseType: q.responseType || "likert",
    options: Array.isArray(q.options) ? q.options : null
  }));
}

function collectAnswers(body, assessmentType = "zpi_hr") {
  const config = getAssessmentConfig(assessmentType);
  return Object.fromEntries(
    config.questions.map((q) => [q.key, body[q.key] || null])
  );
}

function buildTraitsFromAnswers(answers, assessmentType = "zpi_hr") {
  const groups = new Map();
  const config = getAssessmentConfig(assessmentType);

  config.getScoredQuestions().forEach((question) => {
    const answer = answers[question.key];

    if (!answer) return;

    const sourceTrait = question.trait || "Comportamento generale";
    const value = scoreAnswer(answer, question.reverse, question);
    const dimensions = assessmentType === "sport_performance"
      ? [{ name: sourceTrait, category: DIMENSION_CATEGORY.TRAIT }]
      : normalizeDimensionDefinitions(sourceTrait);

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

  if (topSet.has("ResponsabilitÃ ") || topSet.has("AffidabilitÃ  + autodisciplina")) {
    orientation = "orientamento manageriale / guida";
  } else if (
    topSet.has("EspansivitÃ ") ||
    topSet.has("FlessibilitÃ  comunicativa") ||
    topSet.has("Dinamismo")
  ) {
    orientation = "orientamento commerciale / relazione";
  } else if (topSet.has("Organizzazione e pianificazione") || topSet.has("AffidabilitÃ  + autodisciplina")) {
    orientation = "orientamento organizzativo / metodo";
  } else if (topSet.has("Automotivazione") || topSet.has("Dinamismo")) {
    orientation = "orientamento evolutivo / progettuale";
  }

  let roleComment =
    "Il profilo richiede ulteriori elementi per una lettura piÃ¹ precisa rispetto al ruolo.";

  if (role === "manager") {
    roleComment =
      topSet.has("ResponsabilitÃ ") ||
      topSet.has("AffidabilitÃ  + autodisciplina") ||
      topSet.has("Organizzazione e pianificazione")
        ? "Il profilo mostra elementi coerenti con un ruolo manageriale, soprattutto sul piano della guida, della responsabilitÃ  e della struttura operativa."
        : "Per un ruolo manageriale sarÃ  utile approfondire in particolare guida, responsabilitÃ , capacitÃ  organizzativa e tenuta nella gestione delle persone.";
  } else if (role === "sales") {
    roleComment =
      topSet.has("EspansivitÃ ") ||
      topSet.has("FlessibilitÃ  comunicativa") ||
      topSet.has("Automotivazione") ||
      topSet.has("Dinamismo")
        ? "Il profilo mostra elementi interessanti per un ruolo commerciale, soprattutto su relazione, influenza, energia comunicativa e orientamento al risultato."
        : "Per un ruolo commerciale sarÃ  utile approfondire soprattutto componente relazionale, iniziativa, capacitÃ  negoziale e orientamento al risultato.";
  } else if (role === "amministrativo") {
    roleComment =
      topSet.has("Organizzazione e pianificazione") ||
      topSet.has("ResponsabilitÃ ") ||
      topSet.has("AffidabilitÃ  + autodisciplina")
        ? "Il profilo mostra elementi coerenti con un ruolo amministrativo, soprattutto su metodo, affidabilitÃ , continuitÃ  e presidio operativo."
        : "Per un ruolo amministrativo sarÃ  utile approfondire soprattutto metodo, precisione, affidabilitÃ  e continuitÃ  nellâ€™esecuzione.";
  }

  return {
    orientation,
    topTraits: top,
    weakTraits: low,
    roleComment
  };
}

function reliabilityBand(score) {
  const value = Number(score || 0);
  if (value >= 50) return "coerente";
  if (value >= 30) return "da_approfondire";
  return "prudente";
}

function reliabilityLabelFromScore(score) {
  const band = reliabilityBand(score);
  if (band === "coerente") return "Indice di coerenza delle risposte adeguato";
  if (band === "da_approfondire") return "Indice di coerenza delle risposte da approfondire";
  return "Indice di coerenza delle risposte basso";
}

const THEORETICAL_PROFILE_THRESHOLD = 60;
const THEORETICAL_PROFILE_MIN_COUNT = 11;

function getTheoreticalProfileSignal(dimensions = []) {
  const highDimensions = (Array.isArray(dimensions) ? dimensions : [])
    .filter((dimension) => chartScore(dimension?.score) >= THEORETICAL_PROFILE_THRESHOLD)
    .map((dimension) => displayDimensionName(dimension?.name));

  return {
    isTheoretical: highDimensions.length >= THEORETICAL_PROFILE_MIN_COUNT,
    count: highDimensions.length,
    highDimensions
  };
}

function theoreticalProfileFlag(signal) {
  if (!signal?.isTheoretical) return null;

  return `Profilo teorico: sono presenti ${signal.count} tratti o parametri con punteggio pari o superiore a ${THEORETICAL_PROFILE_THRESHOLD}. Il questionario va letto come teorico e richiede verifica tramite colloquio e osservazione concreta.`;
}

function hasTheoreticalProfileFlag(flags = []) {
  return (Array.isArray(flags) ? flags : []).some((flag) => /profilo teorico/i.test(String(flag || "")));
}

function reliabilityPromptGuidance(score, flags = []) {
  const band = reliabilityBand(score);
  const flagText = Array.isArray(flags) && flags.length ? ` Segnali da considerare: ${flags.join("; ")}.` : "";

  if (band === "coerente") {
    return `Le risposte risultano abbastanza coerenti: puoi scrivere una lettura diretta, sempre evitando giudizi assoluti.${flagText}`;
  }

  if (band === "da_approfondire") {
    return `Le risposte presentano alcune oscillazioni: usa formule prudenti come "puÃ² emergere", "sembra indicare", "andrebbe verificato". Evita affermazioni definitive e collega le conclusioni al colloquio o all'osservazione sul lavoro.${flagText}`;
  }

  return `Le risposte hanno un indice di coerenza basso: l'intera relazione deve essere letta come ipotesi da verificare. Non scrivere conclusioni nette. Non dare indicazioni troppo prescrittive. Per ogni tratto, privilegia formulazioni esplorative e invita a verificare il comportamento con esempi concreti, colloquio e osservazione diretta.${flagText}`;
}

function buildReliability(answers, traits) {
  const scoredQuestions = getScoredQuestions();
  const answered = scoredQuestions.filter((q) => answers[q.key]);
  const total = answered.length;

  if (!total) {
    return {
      reliabilityScore: 0,
      reliabilityLabel: reliabilityLabelFromScore(0),
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
    penalty += 25;
    flags.push("Elevata concentrazione di risposte positive");
  }

  if (disagreeRatio >= 0.85) {
    penalty += 25;
    flags.push("Elevata concentrazione di risposte negative");
  }

  if (uncertainRatio <= 0.03 && total >= 80) {
    penalty += 12;
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
    penalty += 18;
    flags.push("Sono presenti oscillazioni interne significative su piÃ¹ tratti");
  }

  const theoreticalSignal = getTheoreticalProfileSignal(traits);
  const theoreticalFlag = theoreticalProfileFlag(theoreticalSignal);

  if (theoreticalFlag) {
    penalty += 30;
    flags.push(theoreticalFlag);
  }

  let reliabilityScore = Math.max(0, Math.round(100 - penalty));

  // Regola cliente: se almeno 11 tratti/parametri dell'istogramma sono >=60,
  // il profilo va registrato come "teorico" e l'attendibilitÃ  non deve risultare pienamente coerente.
  if (theoreticalSignal.isTheoretical) {
    reliabilityScore = Math.min(reliabilityScore, 45);
  }

  return {
    reliabilityScore,
    reliabilityLabel: reliabilityLabelFromScore(reliabilityScore),
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

function normalizeDimensionKeyText(name) {
  return normalizeBrokenUtf8(String(name || ""))
    .replace(/\u00A0/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dimensionAiMatchKey(name) {
  // Chiave SOLO per collegare il testo AI alla dimensione già calcolata.
  // Non modifica scoring, istogrammi, DB, canonical names o mapping.
  const raw = normalizeTraitName(name);
  const normalized = normalizeDimensionNameForDisplay(raw);
  const displayed = displayDimensionName(normalized);
  const key = normalizeDimensionKeyText(displayed || normalized || raw);

  const aliases = new Map([
    ["stress", "gestione pressioni stress"],
    ["gestione della pressione", "gestione pressioni stress"],
    ["gestione pressioni", "gestione pressioni stress"],
    ["gestione pressioni stress", "gestione pressioni stress"],

    ["affidabilita", "affidabilita autodisciplina"],
    ["autodisciplina", "affidabilita autodisciplina"],
    ["autodisciplina affidabilita", "affidabilita autodisciplina"],
    ["affidabilita autodisciplina", "affidabilita autodisciplina"],

    ["responsabilita e ownership", "responsabilita"],
    ["centralita", "responsabilita"],

    ["estroversione", "espansivita"],
    ["estroversione e networking", "espansivita"],

    ["gestione priorita", "gestione priorita"],
    ["priorita", "gestione priorita"],

    ["capacita di gestione finanziaria", "capacita di gestione finanziaria"],
    ["gestione finanziaria", "capacita di gestione finanziaria"],
    ["autonomia economica e iniziativa", "capacita di gestione finanziaria"],

    ["indice di attendibilita", "attendibilita"],
    ["attendibilita si", "attendibilita"],
    ["attendibilita forzata", "attendibilita"],
    ["attendibilita no", "attendibilita"]
  ]);

  return aliases.get(key) || key;
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
          name: displayDimensionName(normalizeTraitName(trait.name)),
          description: dimensionDescription(trait.name)
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
    .map((trait) => {
      const name = displayDimensionName(normalizeTraitName(trait.name));
      const value = chartScore(trait.score);
      const evoGuide = evoGuideForDimension(name, trait.score);
      const truthfulness = name === "Attendibilità" ? truthfulnessStatusFromScore(value) : null;

      return {
        name,
        description: dimensionDescription(trait.name),
        category: trait.category === DIMENSION_CATEGORY.ADDITIONAL ? "Parametro aggiuntivo" : "Tratto",
        score: trait.score,
        chartScore: value,
        evoGuide,
        truthfulness,
        writingGuidance: scoreGuidanceForPrompt(trait.score),
        questionCount: trait.questionCount || (Array.isArray(trait.answers) ? trait.answers.length : undefined)
      };
    });
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
  managementAdvice,
  assessmentTitle = "ZPIâ„¢ â€“ Zenith Performance Index",
  assessmentType = "zpi_hr"
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
  const reliabilityGuidance = reliabilityPromptGuidance(reliabilityScore, reliabilityFlags);
  const theoreticalProfileNote = theoreticalProfileNoteFromFlags(reliabilityFlags);
  const convictionChange = convictionChangePattern(traits);
  const securityTheory = theoreticalSecuritySignal(traits, reliabilityFlags);
  const convictionChangeNote = convictionChange
    ? `${convictionChange.label}: ${convictionChange.interpretation} Chiave di sblocco: ${convictionChange.unlockKey}`
    : "";
  const securityTheoryNote = securityTheory ? `${securityTheory.label}: ${securityTheory.text}` : "";

  const input = `
Sei un consulente organizzativo senior.
Genera una relazione professionale in italiano per un assessment comportamentale. Se il questionario Ã¨ sportivo, usa un tono adatto ad atleta, staff tecnico, squadra e contesto di performance.

ISTRUZIONE OBBLIGATORIA E PRIORITARIA PER generalSummary
Il campo generalSummary è l’unica sezione che deve parlare direttamente alla persona che ha compilato il test.

generalSummary DEVE:
- essere scritto SEMPRE in seconda persona singolare;
- iniziare con una formula naturale come "Nel lavoro tendi a...", "Quando ti trovi...", "In questo ruolo puoi..." oppure "Per te può essere utile...";
- usare formule dirette come "tu", "tendi", "puoi", "potresti", "per te", "la tua compatibilità", "ti aiuta";
- mantenere un tono umano, concreto, osservativo e professionale;
- parlare alla persona, non dellapersona;
- citare compatibilità con il ruolo e indice di coerenza in modo naturale, sempre rivolgendosi direttamente alla persona.

STILE OBBLIGATORIO DI generalSummary
Scrivi con la stessa impostazione di questi esempi:
- "Nel lavoro tendi a cercare ordine, priorità chiare e una buona gestione delle attività..."
- "La tua compatibilità con il ruolo risulta alta..."
- "Allo stesso tempo, per te può essere utile lavorare su..."
- "Questo suggerisce di verificare sul campo..."

generalSummary NON DEVE MAI usare:
- "il profilo"
- "il profilo mostra"
- "il profilo evidenzia"
- "la persona"
- "la risorsa"
- "il candidato"
- "il soggetto"
- "emerge"
- "emergono"
- "si osserva"
- "si evidenzia"
- "risulta utile approfondire"
- "sarà utile approfondire"
- "viene evidenziato"
- formule impersonali, passive o da report HR aziendale.

Se generalSummary contiene una di queste formule, la risposta è errata e deve essere riscritta in seconda persona.

REGOLE DI TONO PER LE SEZIONI
- generalSummary: seconda persona singolare, rivolto direttamente alla persona che ha compilato il test.
- expandedText: tono consulenziale HR/organizzativo in terza persona.
- improvementPlan: tono HR/organizzativo in terza persona, salvo ruolo direzione/imprenditore/titolare/CEO/founder.
- skillAction: tono HR/organizzativo in terza persona.
- Se il ruolo è direzione/imprenditore/titolare/CEO/founder, improvementPlan deve parlare direttamente alla persona e skillAction non deve contenere indicazioni su come gestirla.

CONTESTO
- Questionario: ${assessmentTitle}
- Tipo assessment: ${assessmentType}
- Organizzazione / societÃ : ${companyName}
- Ruolo target: ${role}
- Orientamento prevalente: ${summary.orientation}
- Lettura rispetto al ruolo: ${summary.roleComment}
- CompatibilitÃ  con il ruolo ricoperto: ${roleFit?.label || "Non disponibile"}
- Consiglio generale di gestione: ${managementAdvice || "Non disponibile"}
- Indice di coerenza delle risposte: ${reliabilityLabel}
- Filtro di lettura da applicare a tutta la relazione: ${reliabilityGuidance}
${theoreticalProfileNote ? `- Nota attendibilitÃ : ${theoreticalProfileNote}` : ""}
${securityTheoryNote ? `- Nota su Sicurezza/Convinzioni: ${securityTheoryNote}` : ""}
${convictionChangeNote ? `- Lettura Sicurezza/Resistenza: ${convictionChangeNote}` : ""}

TRATTI E PARAMETRI VALUTATI
${JSON.stringify(traitsForPrompt, null, 2)}

MAPPATURA EVO E PARAMETRIZZAZIONE
- Sicurezza deve essere interpretata come Convinzioni: non Ã¨ semplice autostima, ma modo in cui la persona costruisce, difende o mette in discussione le proprie idee.
- Se Sicurezza Ã¨ alta, valuta il rischio di rigiditÃ , punto di osservazione troppo distante o sicurezza teorica, soprattutto se Ã¨ presente Profilo teorico.
- Se Sicurezza Ã¨ bassa, valuta il rischio di influenzabilitÃ , ricerca di conferme esterne o instabilitÃ  decisionale.
- Resistenza al cambiamento Ã¨ un sotto-tratto delle Convinzioni/Sicurezza relativo all'approccio specifico al cambiamento.
- Quando sono presenti le note Sicurezza/Convinzioni o Lettura Sicurezza/Resistenza, usale per arricchire il tratto Sicurezza, il tratto Resistenza al cambiamento e la relazione generale, senza inventare diagnosi.
- Per i tratti ZPI usa il campo evoGuide come riferimento principale: contiene il parametro EVO equivalente e la lettura corretta del punteggio.
- Non inventare significati diversi da quelli indicati in evoGuide.
- Se evoGuide Ã¨ presente, l'analisi deve rispettare quella descrizione e puÃ² ampliarla in modo consulenziale, senza contraddirla.
- Per il tratto AttendibilitÃ  devi usare il campo truthfulness e indicare chiaramente una delle tre letture: AttendibilitÃ  SÃŒ, AttendibilitÃ  FORZATA, AttendibilitÃ  NO. Non usare formulazioni vaghe. Scrivi in modo professionale: non usare espressioni come "dice bugie" o "dice palle" nel report finale.
- Se Ã¨ presente la Nota attendibilitÃ  "Profilo teorico", devi integrarla nell'AttendibilitÃ  una sola volta, spiegando che la prevalenza di punteggi molto alti rende il questionario teorico e richiede verifica tramite colloquio/osservazione.

REGOLE SEMANTICHE CHIRURGICHE PER I TRATTI ZPI
Queste regole valgono solo per expandedText, improvementPlan e skillAction dei singoli tratti. Non modificano generalSummary, compatibilità ruolo, istogrammi o punteggi.
- Organizzazione e pianificazione: interpretala come capacità concreta di programmare il lavoro, mettere ordine, non disperdersi e non correre solo dietro alle urgenze. Non trasformarla in precisione mentale astratta.
- Automotivazione: interpretala come spinta interna, ambizione e capacità di caricarsi verso il risultato. Non confonderla con entusiasmo generico o umore positivo.
- Affidabilità / Autodisciplina: interpretala come continuità esecutiva, parola data, cura degli accordi, capacità di non rimandare e non lasciare attività non gestite. Non confonderla con organizzazione.
- Gestione pressioni / Stress: non interpretarla come stress generico o fragilità emotiva. Da 30 a 60 indica gestione efficace e serenità operativa. Da 70 in su può indicare che la persona ha “incelofanato” una situazione difficile: mantiene equilibrio e compromessi, ma potrebbe non affrontare davvero il nodo. Da 0 a 20 indica una situazione/persona che inizia a drenare energia e attenzione. Sotto 0 indica conflitto o influenza negativa più evidente.
- Dinamismo: interpretalo come energia di azione, movimento e prontezza nell’iniziare attività. Non confonderlo con motivazione, entusiasmo o stress.
- Flessibilità comunicativa: interpretala come determinazione/assertività orientata al risultato, capacità di affrontare le situazioni di petto e sostenere una posizione. Non leggerla come empatia, diplomazia o morbidezza relazionale.
- Responsabilità: interpretala come centralità/locus of control operativo: essere causa, mettersi in discussione, problem solving e proattività. Non confonderla con affidabilità o serietà generica.
- Ascolto attivo: interpretalo come comprensione delle persone e delle situazioni, capacità di mettersi nei panni dell’altro, vedere punti di vista diversi e non giudicare subito. Non ridurlo ad ascolto tecnico o raccolta informazioni.

PRINCIPI DI LETTURA
- Non descrivere la persona come se fosse definita una volta per tutte: descrivi il suo funzionamento comportamentale attuale nel lavoro.
- Il report non misura il valore della persona, ma il modo in cui tende ad agire, reagire, organizzarsi e relazionarsi nel contesto lavorativo.
- Un tratto alto non Ã¨ automaticamente positivo e un tratto basso non Ã¨ automaticamente negativo: il valore dipende dal ruolo, dal contesto e dal livello di consapevolezza.
- Integra, quando utile, i concetti di conoscenza pratica, comportamento e controllo: cosa sa fare concretamente, come tende ad agire/reagire, quanto riesce a governare il tratto in modo utile.
- Se l'indice di coerenza delle risposte Ã¨ basso o da approfondire, riduci il grado di certezza dell'intera relazione e usa un tono esplorativo.

REGOLE DI LETTURA DEI PUNTEGGI
- Usa il campo writingGuidance come regola principale per scrivere ogni tratto.
- Non citare mai nel testo finale le fasce, le soglie numeriche o formule come "70-100", "31-50", "valore alto", "valore adeguato", "alta produttivitÃ ", "profonda difficoltÃ ".
- L'analisi deve essere coerente con la fascia del punteggio: non mischiare nella stessa analisi segnali positivi e negativi opposti.
- Applica sempre il filtro dell'indice di coerenza delle risposte: con coerenza bassa scrivi come ipotesi da verificare, con coerenza media scrivi come tendenza possibile, con coerenza adeguata puoi essere piÃ¹ diretto ma mai assoluto.
- Se il punteggio Ã¨ alto, eventuali attenzioni devono derivare dall'eccesso o dall'intensitÃ  del tratto, non da una sua assenza.
- Se il punteggio Ã¨ basso, non descrivere il tratto come stabile o giÃ  maturo: evidenzia la difficoltÃ  concreta e l'impatto sul lavoro.
- Per valori molto alti, non celebrare in modo assoluto: descrivi il tratto come molto marcato e aggiungi prudenza professionale, spiegando che la continuitÃ  del comportamento va verificata nei fatti. Non accusare mai la persona di non essere sincera.
- Se il tratto ResponsabilitÃ  Ã¨ in area migliorabile bassa, includi il concetto che la persona puÃ² contrariarsi quando l'interlocutore ha un'opinione diversa, anche se non lo manifesta apertamente.

REGOLA SPECIALE PER DIREZIONE / IMPRENDITORE
- Se il ruolo target è direzione, imprenditore, titolare, CEO o founder, non scrivere indicazioni su come gestire la persona.
- In questi casi i rimedi pratici devono essere rivolti direttamente alla persona che ha fatto il test: usa formule come "per te può essere utile", "potresti", "ti aiuta".
- Evita "la risorsa", "il candidato", "come gestirlo" e formule manageriali rivolte a un responsabile.

ISTRUZIONI GENERALI
1. Scrivi in modo semplice, diretto e utile per un imprenditore o responsabile di PMI.
2. Non usare linguaggio clinico, diagnostico o psicologico-medico.
3. Non presentare il questionario come valutazione definitiva.
4. Evita parole tecniche o inglesi non necessarie. Se proprio servono, spiega subito il significato in italiano.
5. Non usare formule come â€œdiscretoâ€, â€œbuonoâ€, â€œottimoâ€ nel testo finale.
6. Evita frasi generiche, ripetitive o troppo â€œda AIâ€.
7. Quando possibile, collega le osservazioni al lavoro quotidiano, ai rapporti con colleghi/clienti e alla gestione pratica della persona.
8. Non trasformare l'analisi del tratto in una lista di consigli: prima interpreta il comportamento, poi solo nei campi dedicati indica eventuali azioni pratiche coerenti.
9. Usa frasi brevi, chiare e senza gergo manageriale complesso.
10. Compila generalManagementAdvice con un consiglio generale pratico, ma non contraddittorio rispetto ai tratti emersi.
11. Nella relazione generale cita in modo naturale la compatibilitÃ  con il ruolo ricoperto e l'indice di coerenza delle risposte, senza creare una nota ripetitiva separata e sempre in seconda persona.
12. Non scrivere mai frasi come "La persona Ã¨ stata valutata in riferimento al ruolo di..." o "La risorsa Ã¨ stata valutata in riferimento al ruolo di...".

ISTRUZIONI PER OGNI TRATTO
Per ogni tratto restituisci:
- expandedText: vera analisi comportamentale del tratto, coerente con writingGuidance. Deve spiegare come la persona tende a funzionare, cosa puÃ² emergere nel lavoro e quali effetti operativi o relazionali puÃ² produrre. NON ripetere la definizione del campo description, perchÃ© verrÃ  giÃ  mostrata tra parentesi nel report. NON inserire consigli operativi in questo campo.
- improvementPlan: rimedi pratici solo se il tratto Ã¨ sotto 40 su scala -100/+100. Se il tratto Ã¨ pari o superiore a 40, scrivi una frase breve di valorizzazione/consolidamento non correttiva, perchÃ© questa sezione non verrÃ  mostrata nella relazione finale.
- skillAction: indicazione gestionale solo se il tratto Ã¨ sotto 50 su scala -100/+100. Se il tratto Ã¨ da 50 a 100, non dare indicazioni pratiche di gestione: limitati a una frase breve di valorizzazione contestuale, perchÃ© questa sezione non verrÃ  mostrata nella relazione finale. Non deve contraddire expandedText.

STILE DI SCRITTURA
- Per generalSummary scrivi come un consulente che restituisce il profilo direttamente alla persona che ha compilato il test.
- Per expandedText, improvementPlan e skillAction scrivi invece come un consulente organizzativo che parla a imprenditore, manager o referente operativo.
- Non usare tono da psicologo clinico o grande reparto HR.
- Usa parole semplici e frasi brevi.
- Non iniziare mai un approfondimento con frasi definitorie tipo "Misura...", "Valuta...", "Indica..." se ripetono la descrizione del tratto.
- Evita formule ripetitive tra i tratti.
- Evita struttura da checklist dentro expandedText.
- Dove câ€™Ã¨ un rischio, spiega cosa puÃ² succedere in azienda.
- Dove câ€™Ã¨ una forza, spiega come puÃ² produrre valore concreto.
- Dove serve un rimedio, deve essere coerente con il punteggio: obiettivi chiari, controllo periodico, affiancamento, prioritÃ  scritte, confronto diretto, senza consigli opposti all'analisi.

IMPORTANTE
- Non scrivere "uso della forza".
- Non usare metafore tipo Jedi, superpoteri o simili.
- Non forzare una skill debole come se fosse un punto di forza.
- Per skill deboli, parla di sviluppo, compensazione, presidio o affiancamento.
- Per skill forti, parla di valorizzazione, leva organizzativa, applicazione nel team.
- Usa esclusivamente i nomi di tratti e parametri aggiuntivi ricevuti nel JSON.
- Quando parli di Gestione pressioni / Stress, usa la regola semantica chirurgica sopra: 30-60 = gestione efficace/serenità; 70+ = possibile equilibrio mantenuto senza affrontare il nodo; 0-20 = elemento che inizia a drenare attenzione; sotto 0 = conflitto o influenza negativa più evidente.
- Quando parli di CapacitÃ  di gestione finanziaria, interpretala come capacitÃ  pratica di generare reddito autonomo, risparmiare e gestire risorse economiche con continuitÃ  e visione futura.
- Non usare la parola inglese skill nel testo finale: usa competenza, capacitÃ  o tratto.
- Non usare espressioni come â€œKPIâ€, â€œstakeholderâ€, â€œperformance reviewâ€, â€œcoachingâ€, â€œdebriefingâ€, salvo tradurle in parole semplici.
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
  managementAdvice,
  assessmentTitle = "ZPIâ„¢ â€“ Zenith Performance Index",
  assessmentType = "zpi_hr"
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
        managementAdvice,
        assessmentTitle,
        assessmentType
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

function shouldShowRemediesForChartValue(value) {
  // Richiesta cliente: da 40 a 100 non mostrare la sezione â€œRimedi praticiâ€.
  return Number(value || 0) < 40;
}

function shouldShowSkillActionForChartValue(value) {
  // Richiesta cliente: da 50 a 100 niente indicazione pratica di gestione sul singolo tratto.
  return Number(value || 0) < 50;
}

function findDimensionByDisplayName(dimensions, name) {
  const target = displayDimensionName(name);
  return (Array.isArray(dimensions) ? dimensions : []).find((item) => {
    return displayDimensionName(item?.name) === target || item?.name === name;
  }) || null;
}

function scoreGuidanceForPrompt(score) {
  const value = chartScore(score);

  if (value >= 70) {
    return "70-100: tratto dominante e molto marcato. L'analisi deve descrivere una forte manifestazione del tratto e, con tono prudente, indicare che valori cosÃ¬ elevati possono anche riflettere una risposta molto controllata o socialmente desiderabile. Non insinuare falsitÃ  o scarsa sinceritÃ ; scrivi che la continuitÃ  del comportamento va verificata nella pratica. I consigli devono essere di valorizzazione e verifica concreta, non correttivi.";
  }

  if (value >= 51) {
    return "51-69: tratto solido e produttivo. L'analisi deve descrivere una manifestazione stabile, utile nel lavoro quotidiano, senza introdurre criticitÃ  opposte al punteggio. I consigli devono valorizzare e consolidare il tratto.";
  }

  if (value >= 31) {
    return "31-50: tratto adeguato. L'analisi deve descrivere una base presente ma non dominante, con eventuale discontinuitÃ  leggera. I consigli devono aiutare a consolidare il comportamento, senza drammatizzare.";
  }

  if (value >= 0) {
    return "0-30: tratto migliorabile. L'analisi deve descrivere fragilitÃ  o presenza discontinua del tratto, con esempi concreti nel lavoro. I consigli devono essere di supporto, chiarimento e allenamento operativo.";
  }

  if (value >= -30) {
    return "-30-0: tratto in difficoltÃ . L'analisi deve descrivere una difficoltÃ  concreta che puÃ² emergere nel lavoro quotidiano, con impatto operativo o relazionale. I consigli devono essere di presidio, affiancamento e controllo semplice.";
  }

  return "-100--31: profonda difficoltÃ  da approfondire. L'analisi deve descrivere una criticitÃ  importante da verificare con attenzione, senza toni clinici o giudicanti. I consigli devono essere prudenti, orientati a osservazione, affiancamento e verifica sul campo.";
}

function dimensionByName(dimensions, name) {
  const target = displayDimensionName(name);
  return (Array.isArray(dimensions) ? dimensions : []).find((item) => {
    return displayDimensionName(item?.name) === target || item?.name === name;
  }) || null;
}

function convictionChangePattern(dimensions = []) {
  const sicurezza = dimensionByName(dimensions, "Sicurezza");
  const resistance = dimensionByName(dimensions, "Resistenza al cambiamento");

  if (!sicurezza || !resistance) {
    return null;
  }

  const sicurezzaValue = chartScore(sicurezza.score);
  const resistanceValue = chartScore(resistance.score);

  const sicurezzaAlta = sicurezzaValue >= 50;
  const sicurezzaBassa = sicurezzaValue <= 0;
  const resistenzaAlta = resistanceValue >= 40;
  const resistenzaBassa = resistanceValue <= -20;

  let label = "Sicurezza e cambiamento da leggere in colloquio";
  let interpretation = "Il rapporto tra convinzioni e cambiamento non Ã¨ estremo: conviene verificare nel colloquio come la persona reagisce quando deve modificare abitudini, procedure o punti di vista.";
  let unlockKey = "Usare esempi concreti, piccoli test operativi e confronto sui risultati ottenuti.";

  if (sicurezzaAlta && resistenzaBassa) {
    label = "Convinzioni alte e bassa resistenza al cambiamento";
    interpretation = "La persona puÃ² avere idee radicate sulla necessitÃ  di cambiare come soluzione ai problemi. PuÃ² essere strutturata nelle proprie convinzioni, ma disponibile a sperimentare se vede una direzione utile.";
    unlockKey = "Mettere in azione e far sperimentare in modo pratico, piÃ¹ che spiegare solo in teoria.";
  } else if (sicurezzaBassa && resistenzaAlta) {
    label = "Convinzioni basse e alta resistenza al cambiamento";
    interpretation = "La persona puÃ² mettere in discussione le proprie idee, ma vivere il cambiamento con timore operativo. PuÃ² accogliere nuove idee e poi frenare quando deve uscire dalla propria zona di comfort.";
    unlockKey = "Dare dati nuovi, formazione e affiancamento graduale, procedendo per piccoli passaggi.";
  } else if (sicurezzaAlta && resistenzaAlta) {
    label = "Convinzioni alte e alta resistenza al cambiamento";
    interpretation = "La persona puÃ² essere molto ancorata al proprio modello mentale e percepire il cambiamento come una fonte di potenziali problemi o perdita di controllo.";
    unlockKey = "Gestire con numeri, dati concreti, aspettative chiare e fermezza professionale.";
  } else if (sicurezzaBassa && resistenzaBassa) {
    label = "Convinzioni basse e bassa resistenza al cambiamento";
    interpretation = "La persona puÃ² essere aperta al cambiamento e disponibile a modificare le proprie idee, ma va monitorato il rischio di cambiare troppo spesso direzione o adattarsi eccessivamente.";
    unlockKey = "Gestire con pro e contro a 360 gradi, prioritÃ  scritte e criteri chiari di scelta.";
  }

  return {
    label,
    sicurezzaScore: sicurezzaValue,
    resistanceScore: resistanceValue,
    interpretation,
    unlockKey
  };
}

function theoreticalSecuritySignal(dimensions = [], reliabilityFlags = []) {
  const sicurezza = dimensionByName(dimensions, "Sicurezza");
  if (!sicurezza) return null;

  const sicurezzaValue = chartScore(sicurezza.score);
  const isTheoreticalProfile = hasTheoreticalProfileFlag(reliabilityFlags);

  if (sicurezzaValue >= 50 && isTheoreticalProfile) {
    return {
      label: "Sicurezza teorica",
      text: "La Sicurezza appare alta dentro un profilo teorico: la persona puÃ² appoggiarsi a ciÃ² che conosce o ritiene corretto, ma la concretezza va verificata nei risultati e nell'azione pratica."
    };
  }

  return null;
}

function shouldAddResponsibilityOpinionNote(normalized) {
  const dimensions = Array.isArray(normalized?.traits) ? normalized.traits : [];
  const responsibility = dimensions.find((item) => displayDimensionName(item?.name) === "ResponsabilitÃ " || item?.name === "ResponsabilitÃ ");
  if (!responsibility) return false;

  const value = chartScore(responsibility.score);
  return value >= 0 && value <= 20;
}

function responsibilityOpinionNote() {
  return "La persona tende a contrariarsi, anche non manifestandolo, quando il suo interlocutore ha un'opinione diversa.";
}

function stripLeadingTruthfulnessStatus(text) {
  let value = String(text || "").trim();

  // Evita duplicazioni tipo:
  // "AttendibilitÃ  SÃ¬: ... AttendibilitÃ  SÃ¬. Le risposte ..."
  // L'AI puÃ² usare due formati:
  // - AttendibilitÃ  SÃŒ: testo...
  // - AttendibilitÃ  SÃ¬. Le risposte...
  // Noi aggiungiamo giÃ  il prefisso ufficiale da codice, quindi rimuoviamo
  // qualunque prefisso AttendibilitÃ  generato dall'AI all'inizio del testo.
  const truthfulnessPattern =
    /^Attendibilit(?:à|Ã )\s*:?[\s]*(SÌ|SÃŒ|SI|Sì|SÃ¬|FORZATA|NO)\s*[:.]\s*(?:le\s+risposte\s+)?[^.]+\.(?:\s*(?:Attendibilit(?:à|Ã )\s*:?[\s]*(SÌ|SÃŒ|SI|Sì|SÃ¬|FORZATA|NO)\s*[:.]\s*)?(?:le\s+risposte\s+)?[^.]+\.)?/i;

  while (truthfulnessPattern.test(value)) {
    value = value.replace(truthfulnessPattern, "").trim();
  }

  return value;
}

function theoreticalProfileNoteFromFlags(flags = []) {
  return (Array.isArray(flags) ? flags : []).find((flag) => /profilo teorico/i.test(String(flag || ""))) || "";
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
    const color = ZENITH_INDIGO;

    doc.rect(x, y, barWidth, h).fillOpacity(0.9).fill(color).fillOpacity(1);

    // Valore sopra/sotto la barra.
    const valueY = value >= 0 ? y - 13 : y + h + 3;
    doc.fontSize(7.5).fillColor(color).text(String(value), x - 5, valueY, {
      width: barWidth + 10,
      align: "center"
    });

    // Label verticale, come reference.
    doc.save();
    doc.rotate(-90, { origin: [x + barWidth / 2, chartBottom + labelHeight - 2] });
    doc.fontSize(6.9).fillColor("#333333").text(displayDimensionName(trait.name), x + barWidth / 2, chartBottom + labelHeight - 2, {
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
  const barColor = ZENITH_INDIGO;
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

      doc.fontSize(8.5).fillColor("#111111").text(displayDimensionName(item.name), x, y, {
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
  if (value === "AttuabilitÃ ") return "AttendibilitÃ ";
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
    .map((name) => displayDimensionName(normalizeDimensionNameForDisplay(name)))
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

  const assessmentType = payload.assessmentType || "zpi_hr";
  const isSportAssessment = assessmentType === "sport_performance";

  // ZPI usa una griglia fissa di tratti/parametri per mantenere sempre lo stesso istogramma.
  // Human & Sport Performance ha tratti propri: NON va forzato dentro la griglia ZPI,
  // altrimenti quasi tutti i valori finiscono a fallback 0 nel PDF.
  // Patch isolata: non tocca scoring, mapping ZPI, chartScore, DB o AI.
  const fullMainTraits = isSportAssessment
    ? mainTraits
    : TRAIT_DIMENSIONS.map((name) => {
        return mainTraits.find((item) => normalizeDimensionNameForDisplay(item.name) === normalizeDimensionNameForDisplay(name)) || {
          name,
          category: DIMENSION_CATEGORY.TRAIT,
          score: 0,
          range: range(0),
          questionCount: 0,
          items: []
        };
      });

  const fullAdditionalParameters = isSportAssessment
    ? additionalParameters
    : ADDITIONAL_PARAMETER_DIMENSIONS.map((name) => {
        return additionalParameters.find((item) => normalizeDimensionNameForDisplay(item.name) === normalizeDimensionNameForDisplay(name)) || {
          name,
          category: DIMENSION_CATEGORY.ADDITIONAL,
          score: 0,
          range: range(0),
          questionCount: 0,
          items: []
        };
      });

  const fullTraits = [...fullMainTraits, ...fullAdditionalParameters];

  const roleFit = payload.roleFit || calculateRoleFit(fullTraits, requestedRole);
  const managementAdvice = payload.managementAdvice || buildManagementAdvice({ traits: fullTraits, roleFit });

  const existingReliabilityFlags = Array.isArray(payload.reliabilityFlags) ? payload.reliabilityFlags : [];
  const theoreticalSignal = getTheoreticalProfileSignal(fullTraits);
  const theoreticalFlag = theoreticalProfileFlag(theoreticalSignal);
  const reliabilityFlags = theoreticalFlag && !hasTheoreticalProfileFlag(existingReliabilityFlags)
    ? [...existingReliabilityFlags, theoreticalFlag]
    : existingReliabilityFlags;

  const convictionChange = convictionChangePattern(fullTraits);
  const securityTheory = theoreticalSecuritySignal(fullTraits, reliabilityFlags);

  return {
    traits: fullTraits,
    mainTraits: fullMainTraits,
    additionalParameters: fullAdditionalParameters,
    requestedRole,
    roleFit,
    managementAdvice,
    topTraits: normalizeNameList(payload.topTraits || fullMainTraits.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.name)),
    weakTraits: normalizeNameList(payload.weakTraits || fullMainTraits.slice().sort((a, b) => a.score - b.score).slice(0, 2).map((item) => item.name)),
    reliabilityFlags,
    convictionChange,
    securityTheory
  };
}

function drawAssessmentHistograms(doc, dimensions, assessmentTitle = "Performance Assessment Report") {
  const { traits, additionalParameters } = splitDimensions(dimensions);

  drawLogo(doc);
  doc.fontSize(20).fillColor("black").text(assessmentTitle || "Performance Assessment Report", { align: "center" });
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
  res.send("openai-expanded-report-v17-multi-assessment");
});

app.get("/", (_req, res) => {
  res.redirect("/questionnaires");
});

function getAssessmentToken(type = "zpi_hr") {
  const companySlug = process.env.COMPANY_SLUG || "demo-company";
  const config = getAssessmentConfig(type);
  return process.env[config.tokenEnv] || `${companySlug}-${config.defaultTokenSuffix}`;
}

async function findAssessmentLinkByType(type = "zpi_hr") {
  const token = getAssessmentToken(type);

  const directLink = await prisma.assessmentLink.findUnique({
    where: { token },
    include: { organization: true }
  });

  if (directLink?.isActive) return directLink;

  return prisma.assessmentLink.findFirst({
    where: { isActive: true, assessmentType: type },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  }).catch(() => prisma.assessmentLink.findFirst({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  }));
}

app.get("/questionnaires", async (_req, res) => {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
  const adminUrl = "/admin";

  const zpiUrl = getAssessmentPublicUrl("zpi_hr", publicBaseUrl);
  const sportUrl = getAssessmentPublicUrl("sport_performance", publicBaseUrl);
  const qrCodeUrl = buildQrCodeUrl(zpiUrl);

  res.render("questionnaire-welcome", {
    companyName: process.env.COMPANY_NAME || "Zenith",
    publicBaseUrl,
    assessmentUrl: zpiUrl,
    adminUrl,
    qrCodeUrl,
    products: [
      {
        eyebrow: "Questionario attivo",
        title: getAssessmentConfig("zpi_hr").title,
        description: "Questionario comportamentale per aziende, team HR e percorsi di valutazione interna.",
        cta: "Apri questionario",
        url: zpiUrl,
        status: "active"
      },
      {
        eyebrow: "Questionario attivo",
        title: getAssessmentConfig("sport_performance").title,
        description: "Questionario dedicato ad aziende sportive, organizzazioni, staff tecnici e contesti di performance sportiva.",
        cta: "Apri questionario",
        url: sportUrl,
        status: "active"
      }
    ]
  });
});

app.get("/zenith-assessment", async (_req, res) => {
  const link = await findAssessmentLinkByType("zpi_hr");

  if (!link || !link.isActive) {
    return res.status(404).send("Questionario ZPI non disponibile o non attivo.");
  }

  const assessmentType = "zpi_hr";
  const config = getAssessmentConfig(assessmentType);

  res.render("questionnaire", {
    token: link.token,
    companyName: link.organization.name,
    assessmentType,
    assessmentTitle: config.title,
    requestedRole: link.requestedRole,
    roleOptions: ROLE_OPTIONS,
    questions: getQuestionnaireQuestions(assessmentType)
  });
});

app.get("/human-sport-performance", async (_req, res) => {
  const link = await findAssessmentLinkByType("sport_performance");

  if (!link || !link.isActive) {
    return res.status(404).send("Questionario Human & Sport Performance non disponibile o non attivo.");
  }

  const assessmentType = "sport_performance";
  const config = getAssessmentConfig(assessmentType);

  res.render("questionnaire", {
    token: link.token,
    companyName: link.organization.name,
    assessmentType,
    assessmentTitle: config.title,
    requestedRole: link.requestedRole,
    roleOptions: ROLE_OPTIONS,
    questions: getQuestionnaireQuestions(assessmentType)
  });
});


app.get("/admin/qr/zenith/download", requireAdmin, async (_req, res) => {
  try {
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
    const assessmentUrl = getAssessmentPublicUrl("zpi_hr", publicBaseUrl);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&margin=40&data=${encodeURIComponent(assessmentUrl)}`;

    const qrResponse = await fetch(qrUrl);

    if (!qrResponse.ok) {
      throw new Error(`QR generation failed: ${qrResponse.status}`);
    }

    const buffer = Buffer.from(await qrResponse.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="zpi-zenith-performance-index-qr.png"');
    res.send(buffer);
  } catch (error) {
    console.error("Errore download QR Zenith:", error);
    res.status(500).send("Errore durante la generazione del QR code.");
  }
});



app.get("/admin/qr/sport/download", requireAdmin, async (_req, res) => {
  try {
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
    const assessmentUrl = getAssessmentPublicUrl("sport_performance", publicBaseUrl);
    const qrUrl = buildQrCodeUrl(assessmentUrl, 1200, 40);

    const qrResponse = await fetch(qrUrl);

    if (!qrResponse.ok) {
      throw new Error(`QR generation failed: ${qrResponse.status}`);
    }

    const buffer = Buffer.from(await qrResponse.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="human-sport-performance-qr.png"');
    res.send(buffer);
  } catch (error) {
    console.error("Errore download QR Sport:", error);
    res.status(500).send("Errore durante la generazione del QR code.");
  }
});


app.get("/q/:token", async (req, res) => {
  const link = await prisma.assessmentLink.findUnique({
    where: { token: req.params.token },
    include: { organization: true }
  });

  if (!link || !link.isActive) {
    return res.status(404).send("Link questionario non valido o non attivo.");
  }

  const assessmentType = getLinkAssessmentType(link);
  const config = getAssessmentConfig(assessmentType);

  res.render("questionnaire", {
    token: link.token,
    companyName: link.organization.name,
    assessmentType,
    assessmentTitle: config.title,
    requestedRole: link.requestedRole,
    roleOptions: ROLE_OPTIONS,
    questions: getQuestionnaireQuestions(assessmentType)
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

    const assessmentType = getLinkAssessmentType(link);
    const answers = collectAnswers(req.body, assessmentType);
    const traits = buildTraitsFromAnswers(answers, assessmentType);
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
        assessmentType,
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
          assessmentType,
          assessmentTitle: getAssessmentConfig(assessmentType).title,
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
      managementAdvice,
      assessmentTitle: getAssessmentConfig(assessmentType).title,
      assessmentType
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

  if (!admin || admin.isActive === false) {
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

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  }).catch(() => null);

  req.session.admin = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role || "VIEWER",
    sessionVersion: admin.sessionVersion || 1,
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
  const { where, filters } = buildAdminAssessmentWhere(
    req.query || {},
    req.session.admin.organizationId
  );

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      result: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const submissions = assessments.map((item) => {
    const payload = item.result?.traitsJson || {};
    const assessmentType = payload.assessmentType || item.assessmentType || "zpi_hr";
    const normalized = getNormalizedAnalysis(payload, item.requestedRole);

    return {
      assessmentType,
      assessmentTitle: payload.assessmentTitle || getAssessmentConfig(assessmentType).title,
      id: item.id,
      name: item.respondentName,
      email: item.respondentEmail,
      candidateCompany: item.candidateCompany,
      age: item.age,
      role: item.requestedRole,
      createdAt: item.createdAt,
      createdAtFormatted: formatDateTimeRome(item.createdAt),
      avgScore: item.result?.avgScore ?? null,
      orientation: item.result?.orientation ?? "-",
      topTraits: normalized.topTraits || [],
      roleFit: normalized.roleFit,
      expandedReady: !!item.result?.expandedReportJson,
      expandedGenerating: !!item.result?.isGenerating,
      generationError: item.result?.generationError || null,
      isValidated: !!item.result?.isValidated,
      validatedAt: item.result?.validatedAt || null
    };
  });

  const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
  const adminAssessmentCards = Object.values(ASSESSMENT_TYPES).map((config) => {
    const url = getAssessmentPublicUrl(config.key, publicBaseUrl);
    return {
      key: config.key,
      title: config.title,
      url,
      qrCodeUrl: buildQrCodeUrl(url),
      qrDownloadUrl: config.qrDownloadPath
    };
  });

  res.render("admin", {
    submissions,
    organizationName: req.session.admin.organizationName,
    assessmentUrl: adminAssessmentCards[0]?.url,
    qrCodeUrl: adminAssessmentCards[0]?.qrCodeUrl,
    qrDownloadUrl: adminAssessmentCards[0]?.qrDownloadUrl,
    adminAssessmentCards,
    homeUrl: "/questionnaires",
    filters,
    assessmentTypeOptions: Object.values(ASSESSMENT_TYPES).map((config) => ({
      key: config.key,
      title: config.title
    })),
    currentAdmin: req.session.admin
  });
});

app.post("/admin/regenerate-reports", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { where, filters } = buildAdminAssessmentWhere(
      req.body || {},
      req.session.admin.organizationId
    );

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        result: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    let queued = 0;

    for (const assessment of assessments) {
      if (!assessment.result || assessment.result.isGenerating) {
        continue;
      }

      const payload = assessment.result.traitsJson || {};
      const assessmentType = assessment.assessmentType || payload.assessmentType || "zpi_hr";
      const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
      const traits = normalized.traits;
      const roleFit = normalized.roleFit;
      const managementAdvice = normalized.managementAdvice;

      await prisma.assessmentResult.update({
        where: { assessmentId: assessment.id },
        data: {
          expandedReportJson: null,
          expandedReportGeneratedAt: null,
          generationError: null,
          isGenerating: false
        }
      });

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
        managementAdvice,
        assessmentTitle: getAssessmentConfig(assessmentType).title,
        assessmentType
      });

      queued += 1;
    }

    console.log("[ADMIN] bulk report regeneration queued", {
      queued,
      filters
    });

    return res.redirect(`/admin${buildAdminQueryString(filters)}`);
  } catch (error) {
    console.error("Errore rigenerazione massiva relazioni:", error);
    return res.status(500).send("Errore durante la rigenerazione massiva delle relazioni.");
  }
});

app.post("/admin/:id/generate-expanded-report", requireAdmin, requireSuperAdmin, async (req, res) => {
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
    const assessmentType = assessment.assessmentType || payload.assessmentType || "zpi_hr";
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
      managementAdvice,
      assessmentTitle: getAssessmentConfig(assessmentType).title,
      assessmentType
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore avvio generazione relazione esplosa:", error);
    res.status(500).send("Errore durante l'avvio della generazione della relazione esplosa.");
  }
});


app.post("/admin/:id/regenerate-expanded-report", requireAdmin, requireSuperAdmin, async (req, res) => {
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

    if (assessment.result.isGenerating) {
      return res.redirect(`/admin/${assessment.id}`);
    }

    const payload = assessment.result.traitsJson || {};
    const assessmentType = assessment.assessmentType || payload.assessmentType || "zpi_hr";
    const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
    const traits = normalized.traits;
    const roleFit = normalized.roleFit;
    const managementAdvice = normalized.managementAdvice;

    await prisma.assessmentResult.update({
      where: { assessmentId: assessment.id },
      data: {
        expandedReportJson: null,
        expandedReportGeneratedAt: null,
        generationError: null,
        isGenerating: false
      }
    });

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
      managementAdvice,
      assessmentTitle: getAssessmentConfig(assessmentType).title,
      assessmentType
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore rigenerazione relazione AI:", error);
    return res.status(500).send("Errore durante la rigenerazione della relazione AI.");
  }
});

app.post("/admin/:id/duplicate-test", requireAdmin, requireSuperAdmin, async (req, res) => {
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

    const sourcePayload = source.result.traitsJson || {};
    const assessmentType = sourcePayload.assessmentType || source.assessmentType || getLinkAssessmentType(source.assessmentLink);
    const answers = source.result.answersJson || {};
    const requestedRole = source.requestedRole || source.assessmentLink?.requestedRole || "non_specificato";

    // IMPORTANTE:
    // la duplicazione serve per test/debug di assessment già salvati.
    // Non deve ricalcolare i tratti dalle risposte con il questions.js corrente,
    // perché se il mapping domande/dimensioni è stato evoluto nel tempo si rischia
    // di alterare punteggi storici già corretti (es. Affidabilità + autodisciplina
    // o Resistenza al cambiamento che possono finire a 0).
    //
    // Quindi, quando il risultato sorgente contiene già traitsJson valido,
    // cloniamo il payload numerico salvato e lo usiamo come fonte di verità.
    // Il ricalcolo resta solo come fallback per vecchi record privi di traitsJson.
    const hasStoredTraits = Array.isArray(sourcePayload.traits) && sourcePayload.traits.length > 0;

    let traits;
    let mainTraits;
    let additionalParameters;
    let avgScore;
    let avgRange;
    let summary;
    let roleFit;
    let managementAdvice;
    let reliabilityScore;
    let reliabilityLabel;
    let reliabilityFlags;
    let traitsJson;

    if (hasStoredTraits) {
      traits = sourcePayload.traits || [];
      const splitStored = splitDimensions(traits);

      mainTraits = Array.isArray(sourcePayload.mainTraits) && sourcePayload.mainTraits.length
        ? sourcePayload.mainTraits
        : splitStored.traits;

      additionalParameters = Array.isArray(sourcePayload.additionalParameters) && sourcePayload.additionalParameters.length
        ? sourcePayload.additionalParameters
        : splitStored.additionalParameters;

      const normalizedStored = getNormalizedAnalysis(
        {
          ...sourcePayload,
          assessmentType,
          traits,
          mainTraits,
          additionalParameters
        },
        requestedRole
      );

      roleFit = sourcePayload.roleFit || normalizedStored.roleFit || calculateRoleFit(traits, requestedRole);
      managementAdvice = sourcePayload.managementAdvice || normalizedStored.managementAdvice || buildManagementAdvice({ traits, roleFit });

      const fallbackSummary = buildSummary(traits, requestedRole);
      summary = {
        orientation: source.result.orientation || fallbackSummary.orientation,
        roleComment: source.result.roleComment || fallbackSummary.roleComment,
        topTraits: Array.isArray(sourcePayload.topTraits) ? sourcePayload.topTraits : (normalizedStored.topTraits || fallbackSummary.topTraits),
        weakTraits: Array.isArray(sourcePayload.weakTraits) ? sourcePayload.weakTraits : (normalizedStored.weakTraits || fallbackSummary.weakTraits)
      };

      avgScore = typeof source.result.avgScore === "number"
        ? source.result.avgScore
        : avg(mainTraits.map((t) => t.score));

      avgRange = source.result.avgRange || range(avgScore);

      reliabilityScore = typeof source.result.reliabilityScore === "number"
        ? source.result.reliabilityScore
        : buildReliability(answers, traits).reliabilityScore;

      reliabilityLabel = source.result.reliabilityLabel || reliabilityLabelFromScore(reliabilityScore);
      reliabilityFlags = Array.isArray(sourcePayload.reliabilityFlags) ? sourcePayload.reliabilityFlags : [];

      traitsJson = {
        ...sourcePayload,
        assessmentType,
        assessmentTitle: sourcePayload.assessmentTitle || getAssessmentConfig(assessmentType).title,
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
      };
    } else {
      traits = buildTraitsFromAnswers(answers, assessmentType);
      const splitRecalculated = splitDimensions(traits);
      mainTraits = splitRecalculated.traits;
      additionalParameters = splitRecalculated.additionalParameters;
      avgScore = avg(mainTraits.map((t) => t.score));
      avgRange = range(avgScore);
      summary = buildSummary(traits, requestedRole);
      roleFit = calculateRoleFit(traits, requestedRole);
      managementAdvice = buildManagementAdvice({ traits, roleFit });
      const reliability = buildReliability(answers, traits);
      reliabilityScore = reliability.reliabilityScore;
      reliabilityLabel = reliability.reliabilityLabel;
      reliabilityFlags = reliability.reliabilityFlags;

      traitsJson = {
        assessmentType,
        assessmentTitle: getAssessmentConfig(assessmentType).title,
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
      };
    }

    const copiedName = `${source.respondentName || "Anonimo"} - copia test`;
    const copiedCompany = source.candidateCompany
      ? `${source.candidateCompany} [TEST]`
      : "TEST";

    const duplicated = await prisma.assessment.create({
      data: {
        organizationId: source.organizationId,
        assessmentLinkId: source.assessmentLinkId,
        assessmentType,
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
        traitsJson,
        answersJson: answers,
        expandedReportJson: null,
        expandedReportGeneratedAt: null,
        isGenerating: false,
        generationError: null
      }
    });

    if (req.body.generateAi === "yes") {
      const normalizedForAi = getNormalizedAnalysis(traitsJson, requestedRole);

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
        traits: normalizedForAi.traits || traits,
        reliabilityScore,
        reliabilityLabel,
        reliabilityFlags,
        roleFit,
        managementAdvice,
        assessmentTitle: getAssessmentConfig(assessmentType).title,
        assessmentType
      });
    }

    return res.redirect(`/admin/${duplicated.id}`);
  } catch (error) {
    console.error("Errore duplicazione assessment test:", error);
    return res.status(500).send("Errore durante la duplicazione del questionario test.");
  }
});


function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtmlParagraphs(text) {
  return String(text || "-")
    .split(/\r?\n\s*\r?\n/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\r?\n/g, "<br>")}</p>`)
    .join("\n");
}

function buildEditableWordHtml({ assessment, normalized, expanded }) {
  const title = assessment.result?.traitsJson?.assessmentTitle || getAssessmentConfig(assessment.assessmentType).title;
  const generalRelation = buildPlainGeneralRelation({ assessment, normalized, expanded });
  const traits = Array.isArray(expanded?.traits) ? expanded.traits : [];

  const traitHtml = traits.map((trait) => {
    const title = trait.displayName || trait.name || "Tratto";
    const description = trait.description ? `<p><em>(${escapeHtml(trait.description)})</em></p>` : "";
    const remedies = trait.showRemedies !== false ? `<p><strong>Rimedi pratici:</strong> ${escapeHtml(trait.improvementPlan || "-")}</p>` : "";
    const action = trait.showSkillAction !== false ? `<p><strong>Come gestirlo nella pratica:</strong> ${escapeHtml(trait.skillAction || trait.teamLeverage || "-")}</p>` : "";

    return `
      <h2>${escapeHtml(title)}</h2>
      ${description}
      ${textToHtmlParagraphs(trait.expandedText || "-")}
      ${remedies}
      ${action}
    `;
  }).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.45; color: #111; }
    h1 { font-size: 24px; }
    h2 { font-size: 18px; margin-top: 26px; }
    p { font-size: 11pt; }
    .muted { color: #666; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="muted">Documento esportato per revisione. Modificare il testo e ricaricare il file revisionato dalla scheda assessment.</p>

  <h2>Dati anagrafici</h2>
  <p><strong>Nome:</strong> ${escapeHtml(assessment.respondentName || "-")}</p>
  <p><strong>Email:</strong> ${escapeHtml(assessment.respondentEmail || "-")}</p>
  <p><strong>EtÃ :</strong> ${escapeHtml(assessment.age || "-")}</p>
  <p><strong>Azienda risorsa:</strong> ${escapeHtml(assessment.candidateCompany || "-")}</p>
  <p><strong>Ruolo target:</strong> ${escapeHtml(assessment.requestedRole || "-")}</p>
  <p><strong>Data compilazione:</strong> ${escapeHtml(formatDateTimeRome(assessment.createdAt))}</p>

  <h2>Relazione generale</h2>
  ${textToHtmlParagraphs(generalRelation)}

  ${traitHtml}
</body>
</html>`;
}

async function readRequestBodyBuffer(req, maxBytes = 15 * 1024 * 1024) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new Error("File troppo grande. Dimensione massima: 15 MB.");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function parseMultipartForm(req, bodyBuffer) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) {
    throw new Error("Upload non valido: boundary mancante.");
  }

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const body = bodyBuffer.toString("binary");
  const parts = body.split(boundary).slice(1, -1);
  const fields = {};
  const files = {};

  parts.forEach((rawPart) => {
    let part = rawPart;
    if (part.startsWith("\r\n")) part = part.slice(2);
    if (part.endsWith("\r\n")) part = part.slice(0, -2);

    const separator = "\r\n\r\n";
    const separatorIndex = part.indexOf(separator);
    if (separatorIndex < 0) return;

    const header = part.slice(0, separatorIndex);
    const contentBinary = part.slice(separatorIndex + separator.length);
    const disposition = header.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i);
    if (!disposition) return;

    const name = disposition[1];
    const filename = disposition[2];

    if (filename !== undefined) {
      const contentTypeMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
      files[name] = {
        originalFileName: filename,
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : "application/octet-stream",
        buffer: Buffer.from(contentBinary, "binary")
      };
    } else {
      fields[name] = Buffer.from(contentBinary, "binary").toString("utf8").trim();
    }
  });

  return { fields, files };
}

function decodeBasicHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#8217;/gi, "â€™")
    .replace(/&#8220;/gi, "â€œ")
    .replace(/&#8221;/gi, "â€")
    .replace(/&#8211;/gi, "â€“")
    .replace(/&#8482;/gi, "â„¢")
    .replace(/&#(\d+);/g, (_match, code) => {
      try {
        return String.fromCharCode(Number(code));
      } catch (_error) {
        return "";
      }
    });
}

function htmlToPlainText(html) {
  return decodeBasicHtmlEntities(String(html || "")
    .replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, " ")
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, " ")
    .replace(/<\s*(h1|h2|h3|h4)\b[^>]*>/gi, "\n\n")
    .replace(/<\s*\/\s*(h1|h2|h3|h4)\s*>/gi, "\n\n")
    .replace(/<\s*(p|div|li|tr)\b[^>]*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|tr)\s*>/gi, "\n\n")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim());
}

function xmlToPlainText(xml) {
  const withBreaks = String(xml || "")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<\/w:tc>/g, " ");

  return decodeBasicHtmlEntities(withBreaks
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim());
}

function findZipEntryBuffer(zipBuffer, targetName) {
  const buffer = Buffer.from(zipBuffer || []);
  const eocdSignature = 0x06054b50;

  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i -= 1) {
    if (buffer.readUInt32LE(i) === eocdSignature) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset < 0) return null;

  const entries = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);

  let offset = centralDirectoryOffset;

  for (let index = 0; index < entries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.slice(offset + 46, offset + 46 + fileNameLength).toString("utf8");

    if (fileName === targetName) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) return null;

      const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressed = buffer.slice(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) return compressed;
      if (compressionMethod === 8) return zlib.inflateRawSync(compressed);
      return null;
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return null;
}

function extractDocxPlainText(fileBytes) {
  const xmlBuffer = findZipEntryBuffer(fileBytes, "word/document.xml");
  if (!xmlBuffer) return "";
  return xmlToPlainText(xmlBuffer.toString("utf8"));
}

function extractValidatedWordPlainText(revision) {
  if (!revision?.fileBytes) return "";

  const buffer = Buffer.from(revision.fileBytes);
  const fileName = String(revision.originalFileName || "").toLowerCase();

  try {
    if (fileName.endsWith(".docx") || buffer.slice(0, 2).toString("utf8") === "PK") {
      const text = extractDocxPlainText(buffer);
      if (text) return cleanValidatedReportPlainText(text);
    }

    const utf8Text = buffer.toString("utf8");

    if (/<html|<body|<p|<h1|<h2/i.test(utf8Text)) {
      return cleanValidatedReportPlainText(htmlToPlainText(utf8Text));
    }

    const latinText = buffer.toString("latin1");
    if (/<html|<body|<p|<h1|<h2/i.test(latinText)) {
      return cleanValidatedReportPlainText(htmlToPlainText(latinText));
    }

    return "";
  } catch (error) {
    console.error("Errore estrazione testo Word validato:", error);
    return "";
  }
}

function latestValidatedRevisionFromAssessment(assessment) {
  const revisions = assessment?.result?.reportRevisions;
  if (!Array.isArray(revisions) || revisions.length === 0) return null;
  return revisions.find((revision) => revision.status === "VALIDATED") || revisions[0];
}


app.get("/admin/users", requireAdmin, requireSuperAdmin, async (req, res) => {
  const users = await prisma.adminUser.findMany({
    where: { organizationId: req.session.admin.organizationId },
    orderBy: { createdAt: "asc" }
  });

  res.render("admin-users", {
    users,
    organizationName: req.session.admin.organizationName,
    error: null
  });
});

app.post("/admin/users", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "VIEWER").toUpperCase() === "SUPER_ADMIN" ? "SUPER_ADMIN" : "VIEWER";

    if (!name || !email || password.length < 8) {
      throw new Error("Nome, email e password di almeno 8 caratteri sono obbligatori.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.adminUser.create({
      data: {
        organizationId: req.session.admin.organizationId,
        name,
        email,
        passwordHash,
        role,
        isActive: true,
        sessionVersion: 1
      }
    });

    return res.redirect("/admin/users");
  } catch (error) {
    console.error("Errore creazione admin user:", error);

    const users = await prisma.adminUser.findMany({
      where: { organizationId: req.session.admin.organizationId },
      orderBy: { createdAt: "asc" }
    });

    return res.status(400).render("admin-users", {
      users,
      organizationName: req.session.admin.organizationName,
      error: error?.message || "Errore durante la creazione utente."
    });
  }
});

app.post("/admin/users/invalidate-sessions", requireAdmin, requireSuperAdmin, async (req, res) => {
  await prisma.adminUser.updateMany({
    where: { organizationId: req.session.admin.organizationId },
    data: { sessionVersion: { increment: 1 } }
  });

  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

app.post("/admin/users/:userId/role", requireAdmin, requireSuperAdmin, async (req, res) => {
  const role = String(req.body.role || "VIEWER").toUpperCase() === "SUPER_ADMIN" ? "SUPER_ADMIN" : "VIEWER";

  await prisma.adminUser.updateMany({
    where: {
      id: req.params.userId,
      organizationId: req.session.admin.organizationId
    },
    data: {
      role,
      sessionVersion: { increment: 1 }
    }
  });

  res.redirect("/admin/users");
});

app.post("/admin/users/:userId/toggle", requireAdmin, requireSuperAdmin, async (req, res) => {
  const user = await prisma.adminUser.findFirst({
    where: {
      id: req.params.userId,
      organizationId: req.session.admin.organizationId
    }
  });

  if (user && user.id !== req.session.admin.id) {
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        isActive: !user.isActive,
        sessionVersion: { increment: 1 }
      }
    });
  }

  res.redirect("/admin/users");
});

app.post("/admin/users/:userId/reset-password", requireAdmin, requireSuperAdmin, async (req, res) => {
  const password = String(req.body.password || "");
  if (password.length < 8) {
    return res.status(400).send("La password deve avere almeno 8 caratteri.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.updateMany({
    where: {
      id: req.params.userId,
      organizationId: req.session.admin.organizationId
    },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 }
    }
  });

  res.redirect("/admin/users");
});

app.get("/admin/:id/word", requireAdmin, requireSuperAdmin, async (req, res) => {
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

  const payload = assessment.result.traitsJson || {};
  const assessmentType = payload.assessmentType || assessment.assessmentType || "zpi_hr";
  const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
  const expanded = applyClientOutputRulesToExpandedReport(
    cleanExpandedReport(assessment.result.expandedReportJson || null),
    normalized
  );

  const html = buildEditableWordHtml({ assessment, normalized, expanded });

  res.setHeader("Content-Type", "application/msword; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=report-${assessment.id}.doc`);
  res.send(normalizePdfVisibleText(html));
});


app.post("/admin/:id/validate-ai", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.session.admin.organizationId
      },
      include: { result: true }
    });

    if (!assessment || !assessment.result) {
      return res.status(404).send("Assessment non trovato");
    }

    await prisma.assessmentResult.update({
      where: { id: assessment.result.id },
      data: {
        isValidated: true,
        validatedAt: new Date(),
        validatedById: req.session.admin.id
      }
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore validazione relazione AI:", error);
    return res.status(500).send("Errore durante la validazione della relazione AI.");
  }
});

app.post("/admin/:id/upload-validated-report", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.session.admin.organizationId
      },
      include: { result: true }
    });

    if (!assessment || !assessment.result) {
      return res.status(404).send("Assessment non trovato");
    }

    const bodyBuffer = await readRequestBodyBuffer(req);
    const parsed = parseMultipartForm(req, bodyBuffer);
    const file = parsed.files.reportFile;

    if (!file || !file.buffer?.length) {
      return res.status(400).send("File Word mancante.");
    }

    const fileName = String(file.originalFileName || "").toLowerCase();
    if (!fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
      return res.status(400).send("Carica un file .docx oppure un .doc esportato dalla piattaforma.");
    }

    const uploadPreview = file.buffer.toString("utf8", 0, Math.min(file.buffer.length, 3000));
    const looksLikeHtmlWord = /<html|<body|<p|<h1|<h2|mso-|urn:schemas-microsoft-com:office/i.test(uploadPreview);
    const looksLikeDocx = fileName.endsWith(".docx") || file.buffer.slice(0, 2).toString("utf8") === "PK";

    if (fileName.endsWith(".doc") && !looksLikeHtmlWord) {
      return res.status(400).send("File .doc binario non supportato. Aprilo in Word e salvalo come .docx, poi ricaricalo.");
    }

    if (!looksLikeDocx && !looksLikeHtmlWord) {
      return res.status(400).send("Formato Word non leggibile. Carica un file .docx.");
    }

    await prisma.reportRevision.create({
      data: {
        assessmentResultId: assessment.result.id,
        uploadedById: req.session.admin.id,
        originalFileName: file.originalFileName || `report-${assessment.id}.doc`,
        mimeType: file.contentType || "application/octet-stream",
        fileBytes: file.buffer,
        fileSize: file.buffer.length,
        status: "VALIDATED",
        validatedAt: new Date()
      }
    });

    await prisma.assessmentResult.update({
      where: { id: assessment.result.id },
      data: {
        isValidated: true,
        validatedAt: new Date(),
        validatedById: req.session.admin.id
      }
    });

    return res.redirect(`/admin/${assessment.id}`);
  } catch (error) {
    console.error("Errore upload report validato:", error);
    return res.status(500).send(error?.message || "Errore durante upload report validato.");
  }
});

app.post("/admin/:id/unvalidate-report", requireAdmin, requireSuperAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: { result: true }
  });

  if (!assessment || !assessment.result) {
    return res.status(404).send("Assessment non trovato");
  }

  await prisma.assessmentResult.update({
    where: { id: assessment.result.id },
    data: {
      isValidated: false,
      validatedAt: null,
      validatedById: null
    }
  });

  res.redirect(`/admin/${assessment.id}`);
});

app.get("/admin/:id", requireAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: {
      result: {
        include: {
          reportRevisions: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};
  const assessmentType = payload.assessmentType || assessment.assessmentType || "zpi_hr";
  const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
  const expanded = applyClientOutputRulesToExpandedReport(
    cleanExpandedReport(assessment.result?.expandedReportJson || null),
    normalized
  );

  const submission = {
    id: assessment.id,
    name: assessment.respondentName,
    email: assessment.respondentEmail,
    age: assessment.age,
    candidateCompany: assessment.candidateCompany,
    role: assessment.requestedRole,
    assessmentType,
    assessmentTitle: payload.assessmentTitle || getAssessmentConfig(assessmentType).title,
    createdAt: assessment.createdAt,
    createdAtFormatted: formatDateTimeRome(assessment.createdAt),
    analysis: {
      avgScore: assessment.result?.avgScore ?? "-",
      avgRange: assessment.result?.avgRange ?? "-",
      reliabilityScore: assessment.result?.reliabilityScore ?? "-",
      reliabilityLabel: assessment.result?.reliabilityLabel ?? "-",
      reliabilityFlags: normalized.reliabilityFlags || [],
      answers: assessment.result?.answersJson || {},
      questions: getQuestionTexts(assessmentType),
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
      traits: normalized.traits.map(withDisplayMeta),
      mainTraits: normalized.mainTraits.map(withDisplayMeta),
      additionalParameters: normalized.additionalParameters.map(withDisplayMeta),
      expandedReport: expanded,
      isValidated: !!assessment.result?.isValidated,
      validatedAt: assessment.result?.validatedAt || null,
      validatedRevision: latestValidatedRevisionFromAssessment(assessment),
      validatedReportText: assessment.result?.isValidated
        ? extractValidatedWordPlainText(latestValidatedRevisionFromAssessment(assessment))
        : ""
    }
  };

  res.render("detail", {
    submission,
    organizationName: req.session.admin.organizationName,
    currentAdmin: req.session.admin,
    isGenerating: !!assessment.result?.isGenerating && !expanded
  });
});


function valueDirectionLabel(score) {
  const value = Number(score || 0);
  if (value >= 15) return "area che puÃ² aiutare la persona nel lavoro";
  if (value <= -15) return "area da seguire con attenzione";
  return "area abbastanza equilibrata, da osservare nel lavoro quotidiano";
}


function stripLeadingDefinitionSentence(text, description = "") {
  let value = String(text || "").trim();
  if (!value) return value;

  // La spiegazione tecnica del tratto viene giÃ  mostrata tra parentesi.
  // Qui togliamo l'eventuale prima frase definitoria per evitare ripetizioni tipo:
  // "Misura...", "Valuta...", "Indica...", "Riguarda...".
  const definitionStartPattern = /^(misura|valuta|indica|rappresenta|riguarda|si riferisce|il tratto misura|questo tratto misura)\b/i;
  const firstSentenceMatch = value.match(/^(.{1,420}?[.!?])\s+/s);
  const firstSentence = firstSentenceMatch ? firstSentenceMatch[1].trim() : "";

  if (firstSentence && definitionStartPattern.test(firstSentence)) {
    value = value.slice(firstSentenceMatch[0].length).trim();
  }

  // Secondo passaggio: se l'AI ha iniziato ripetendo quasi testualmente la descrizione
  // ma senza punto dopo la prima frase, tagliamo fino al primo punto utile.
  if (definitionStartPattern.test(value)) {
    value = value.replace(/^(.{1,360}?[.!?])\s*/s, "").trim();
  }

  return value || String(text || "").trim();
}


function stressFallbackExpandedText(chartValue) {
  const value = Number(chartValue || 0);

  if (value >= 70) {
    return "Il dato indica una possibile gestione esterna della pressione: la persona può apparire in equilibrio, ma potrebbe aver accettato compromessi o mantenere sotto controllo una situazione che non affronta fino in fondo. La lettura va verificata con esempi concreti, distinguendo tra reale serenità e mantenimento dell’equilibrio.";
  }

  if (value >= 30) {
    return "La persona gestisce efficacemente eventuali situazioni di stress o pressione. Il dato suggerisce una condizione complessivamente serena: anche se sono presenti impegni, richieste o qualche fonte di tensione, tende a mantenere lucidità e continuità operativa.";
  }

  if (value >= 0) {
    return "Può esserci una situazione o una persona che ostacola la persona e assorbe parte della sua attenzione. Questo può drenare energia, buonumore e continuità operativa, soprattutto se il nodo non viene chiarito con esempi concreti.";
  }

  if (value >= -30) {
    return "Sono presenti situazioni di conflitto o influenze negative che possono incidere sul modo di lavorare. Possono emergere alti e bassi, cali di motivazione o riprese discontinue, soprattutto quando la persona è esposta alla fonte del contrasto.";
  }

  if (value >= -70) {
    return "La persona può vivere una forte condizione di stress legata a una o più situazioni conflittuali. Questo può tradursi in errori, distrazioni e perdita di continuità, per cui il dato va approfondito con attenzione e senza letture generiche.";
  }

  return "Il dato suggerisce agitazione marcata legata a una situazione conflittuale o a pressioni significative. La lettura richiede confronto diretto e osservazione concreta prima di trarre conclusioni operative.";
}

function stressFallbackImprovementPlan(chartValue) {
  const value = Number(chartValue || 0);

  if (value >= 30 && value < 70) {
    return "Valorizzare la capacità di gestione della pressione mantenendo priorità chiare e condizioni operative ordinate, senza trattare il dato come una criticità.";
  }

  if (value >= 70) {
    return "Verificare se esistono compromessi, situazioni sospese o relazioni non affrontate che la persona mantiene sotto controllo senza risolvere. Usare domande concrete, non interpretazioni generiche.";
  }

  return "Individuare con esempi concreti le situazioni o le persone che assorbono attenzione, poi trasformare il nodo in azioni semplici: chiarimento, priorità scritte, tempi realistici e confronto tempestivo.";
}

function stressFallbackSkillAction(chartValue) {
  const value = Number(chartValue || 0);

  if (value >= 30 && value < 70) {
    return "Mantenere un contesto chiaro e ordinato, perché la persona tende già a gestire efficacemente eventuali pressioni.";
  }

  if (value >= 70) {
    return "Aprire un confronto prudente su eventuali situazioni mantenute in equilibrio ma non affrontate, chiedendo fatti, esempi e conseguenze pratiche.";
  }

  return "Ridurre ambiguità e fonti di pressione non chiarite, verificando cosa assorbe attenzione e quali passaggi pratici possono liberare continuità operativa.";
}


function firstNonEmptyAiField(source, fieldNames = []) {
  for (const fieldName of fieldNames) {
    const value = source?.[fieldName];

    if (typeof value === "string" && value.trim() && !isPlaceholderText(value)) {
      return value.trim();
    }
  }

  return "";
}

function expandedTraitTextFromAi(trait) {
  return firstNonEmptyAiField(trait, [
    "expandedText",
    "analysis",
    "text",
    "descriptionText",
    "traitAnalysis"
  ]);
}

function improvementPlanFromAi(trait) {
  return firstNonEmptyAiField(trait, [
    "improvementPlan",
    "practicalRemedies",
    "remedies",
    "remedy",
    "actionPlan",
    "developmentPlan"
  ]);
}

function skillActionFromAi(trait) {
  return firstNonEmptyAiField(trait, [
    "skillAction",
    "teamLeverage",
    "managementTips",
    "managementAdvice",
    "practicalManagement",
    "managerAction"
  ]);
}

function applyClientOutputRulesToExpandedReport(expandedReportJson, normalized) {
  if (!expandedReportJson || typeof expandedReportJson !== "object") {
    expandedReportJson = { generalSummary: "", generalManagementAdvice: "", traits: [] };
  }

  const directionalExecutive = isDirectionalExecutiveNormalized(normalized);
  const shouldAddResponsibilityNote = shouldAddResponsibilityOpinionNote(normalized);
  const cleanedGeneralSummary = stripForbiddenGeneralRelationPhrases(expandedReportJson.generalSummary || "");
  const aiTraits = Array.isArray(expandedReportJson.traits) ? expandedReportJson.traits : [];

  const aiTraitByName = new Map();
  aiTraits.forEach((trait) => {
    const keys = [
      dimensionAiMatchKey(trait?.canonicalName || trait?.name),
      dimensionAiMatchKey(trait?.name),
      dimensionAiMatchKey(trait?.displayName)
    ].filter(Boolean);

    keys.forEach((key) => {
      if (key && !aiTraitByName.has(key)) aiTraitByName.set(key, trait);
    });
  });

  const allApprovedDimensions = [
    ...(Array.isArray(normalized?.mainTraits) ? normalized.mainTraits : []),
    ...(Array.isArray(normalized?.additionalParameters) ? normalized.additionalParameters : [])
  ];

  const traits = allApprovedDimensions.map((dimension) => {
    const canonicalName = normalizeDimensionNameForDisplay(dimension?.name);
    const displayName = displayDimensionName(canonicalName);
    const aiMatchKey = dimensionAiMatchKey(canonicalName);
    const aiTrait = aiTraitByName.get(aiMatchKey) || {};
    const value = chartScore(dimension?.score ?? 0);
    const description = dimensionDescription(canonicalName);
    const evoGuide = evoGuideForDimension(displayName, dimension?.score ?? 0);
    const truthfulness = displayName === "Attendibilità"
      ? truthfulnessStatusFromScore(value)
      : null;

    let expandedText = stripLeadingDefinitionSentence(
      expandedTraitTextFromAi(aiTrait),
      description
    );

    if (!expandedText) {
      if (displayName === "Attendibilità" && truthfulness) {
        expandedText = `${truthfulness.label}. ${truthfulness.text}`;
      } else if (canonicalName === "Stress" || displayName === "Gestione pressioni / Stress") {
        expandedText = stressFallbackExpandedText(value);
      } else if (evoGuide?.interpretation) {
        expandedText = `Il dato emerso indica che questo tratto va letto così: ${evoGuide.interpretation}. Nel lavoro quotidiano questa indicazione va verificata con esempi concreti, osservazione sul campo e colloquio.`;
      } else {
        expandedText = "Questo indicatore va letto come una traccia operativa da verificare nel lavoro quotidiano, attraverso colloquio, osservazione e confronto con esempi concreti.";
      }
    }

    if (displayName === "Attendibilità") {
      const statusText = `${truthfulness.label}. ${truthfulness.text}`;
      const theoreticalNote = theoreticalProfileNoteFromFlags(normalized?.reliabilityFlags || []);

      expandedText = stripLeadingTruthfulnessStatus(expandedText);
      expandedText = expandedText
        .replace(/L[’']indice di coerenza complessivo resta adeguato, quindi le indicazioni sono utilizzabili\.?/gi, "L’indice resta utilizzabile, ma richiede una lettura prudente.")
        .replace(/L[’']indice di coerenza delle risposte è adeguato, quindi le indicazioni sono utilizzabili\.?/gi, "L’indice resta utilizzabile, ma richiede una lettura prudente.")
        .replace(/\d{1,3}\s*\/\s*100/g, "");

      if (theoreticalNote && !/profilo teorico/i.test(expandedText)) {
        expandedText = expandedText ? `${statusText} ${theoreticalNote} ${expandedText}` : `${statusText} ${theoreticalNote}`;
      } else {
        expandedText = expandedText ? `${statusText} ${expandedText}` : statusText;
      }
    }

    if (displayName === "Sicurezza" && normalized?.securityTheory && !/sicurezza teorica/i.test(expandedText)) {
      expandedText = expandedText ? `${expandedText} ${normalized.securityTheory.text}` : normalized.securityTheory.text;
    }

    if (
      (displayName === "Sicurezza" || displayName === "Resistenza al cambiamento") &&
      normalized?.convictionChange &&
      !expandedText.includes(normalized.convictionChange.label)
    ) {
      expandedText = expandedText
        ? `${expandedText} ${normalized.convictionChange.label}: ${normalized.convictionChange.interpretation} Chiave di sblocco: ${normalized.convictionChange.unlockKey}`
        : `${normalized.convictionChange.label}: ${normalized.convictionChange.interpretation} Chiave di sblocco: ${normalized.convictionChange.unlockKey}`;
    }

    if (shouldAddResponsibilityNote && displayName === "Responsabilità") {
      const note = responsibilityOpinionNote();
      if (!expandedText.includes("opinione diversa") && !expandedText.includes("interlocutore")) {
        expandedText = expandedText ? `${expandedText} ${note}` : note;
      }
    }

    const fallbackImprovementPlan = displayName === "Gestione pressioni / Stress"
      ? stressFallbackImprovementPlan(value)
      : "Collegare il miglioramento a obiettivi misurabili e a tappe brevi. Prevedere momenti di verifica dei progressi e riconoscimento dei risultati raggiunti.";

    const fallbackSkillAction = displayName === "Gestione pressioni / Stress"
      ? stressFallbackSkillAction(value)
      : "Dare obiettivi concreti, visibili e ravvicinati. Evitare incarichi lunghi senza riscontro, perché potrebbero ridurre continuità e iniziativa.";

    return {
      ...aiTrait,
      name: canonicalName,
      displayName,
      description,
      chartScore: value,
      score: dimension?.score ?? 0,
      showRemedies: shouldShowRemediesForChartValue(value),
      showSkillAction: !directionalExecutive && shouldShowSkillActionForChartValue(value),
      expandedText,
      improvementPlan: improvementPlanFromAi(aiTrait) || fallbackImprovementPlan,
      skillAction: skillActionFromAi(aiTrait) || fallbackSkillAction
    };
  });

  return normalizeTextPayload({
    ...expandedReportJson,
    generalSummary: cleanedGeneralSummary || expandedReportJson.generalSummary,
    traits
  });
}

function buildPlainGeneralRelation({ assessment, normalized, expanded }) {
  if (expanded?.generalSummary) return stripForbiddenGeneralRelationPhrases(expanded.generalSummary);

  const topTraits = Array.isArray(normalized.topTraits) ? normalized.topTraits.slice(0, 3) : [];
  const weakTraits = Array.isArray(normalized.weakTraits) ? normalized.weakTraits.slice(0, 2) : [];
  const topText = topTraits.length ? topTraits.join(", ") : "alcuni punti utili al ruolo";
  const weakText = weakTraits.length ? weakTraits.join(", ") : "alcuni comportamenti da osservare meglio nel lavoro";
  const roleFitText = normalized?.roleFit?.score != null && !isDirectionalExecutiveRole(assessment?.requestedRole)
    ? `La compatibilità con il ruolo ricoperto è pari al ${normalized.roleFit.score}%. `
    : "";
  const theoreticalNote = theoreticalProfileNoteFromFlags(normalized?.reliabilityFlags || []);
  const theoreticalText = theoreticalNote ? `${theoreticalNote} ` : "";
  const securityTheoryText = normalized?.securityTheory ? `${normalized.securityTheory.text} ` : "";
  const convictionChangeText = normalized?.convictionChange
    ? `${normalized.convictionChange.label}: ${normalized.convictionChange.interpretation} Chiave di sblocco: ${normalized.convictionChange.unlockKey} `
    : "";

  return `${roleFitText}${theoreticalText}${securityTheoryText}${convictionChangeText}Nel modo in cui affronti il lavoro emergono alcuni elementi che possono aiutarti a dare continuità e struttura, in particolare ${topText}. Quando hai obiettivi chiari e responsabilità ben definite, puoi riuscire a trasformare meglio queste caratteristiche in risultati concreti.

Le aree che meritano maggiore attenzione sono ${weakText}. Non vanno lette come un giudizio definitivo, ma come segnali pratici da verificare nel colloquio e nell’osservazione sul campo. In alcune situazioni potresti avere bisogno di priorità più chiare, maggiore confronto o un affiancamento più vicino per evitare dispersione e mantenere coerenza tra intenzioni e azioni.

Questa valutazione non definisce chi sei e non sostituisce l’esperienza reale. Serve come prima traccia di lettura: va confrontata con esempi concreti, comportamenti osservati, colloquio e risultati nel lavoro quotidiano.`;
}

function drawSimpleSectionTitle(doc, title) {
  doc.fontSize(18).fillColor("black").text(title);
  doc.moveDown(0.6);
}

function writeParagraphs(doc, text) {
  String(normalizePdfVisibleText(text) || "-")
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


function cleanValidatedReportPlainText(text) {
  return normalizePdfVisibleText(normalizeBrokenUtf8(text))
    .replace(/Lattendibilità/g, "L’attendibilità")
    .replace(/lapertura/g, "l’apertura")
    .replace(/Lassetto/g, "L’assetto")
    .replace(/Latteggiamento/g, "L’atteggiamento")
    .replace(/lefficienza/g, "l’efficienza")
    .replace(/limplementazione/g, "l’implementazione")
    .replace(/dilogistica/gi, "di logistica")
    .replace(/trattto/gi, "tratto")
    .replace(/trattò/gi, "tratto")
    .replace(/dominance/gi, "dominante")
    .replace(/poich/gi, "poiché")
    .replace(/criticit/gi, "criticità")
    .replace(/realt/gi, "realtà")
    .replace(/veridicit/gi, "veridicità")
    .replace(/influenzabilit/gi, "influenzabilità")
    .replace(/proattivit/gi, "proattività")
    .replace(/reattivit/gi, "reattività")
    .replace(/stabilit/gi, "stabilità")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isValidatedReportHeading(line) {
  const value = normalizePdfVisibleText(line).trim();
  if (!value || value.length > 90) return false;

  const knownHeadings = new Set([
    "Human & Sport Performance",
    "ZPI™ – Zenith Performance Index",
    "Dati anagrafici",
    "Relazione generale",
    "Approfondimento dei tratti",
    ...TRAIT_DIMENSIONS.map((name) => displayDimensionName(name)),
    ...ADDITIONAL_PARAMETER_DIMENSIONS.map((name) => displayDimensionName(name))
  ]);

  if (knownHeadings.has(value)) return true;

  return /^(Organizzazione|Automotivazione|Autodisciplina|Affidabilità|Sicurezza|Gestione pressioni|Stress|Dinamismo|Flessibilità|Responsabilità|Ascolto attivo|Comprensione|Espansività|Resistenza al cambiamento|Leadership naturale|Management|Cooperazione|Principi|Vendite|Gestione priorità|Capacità di gestione finanziaria|Attendibilità)$/i.test(value);
}

function writeValidatedReportText(doc, text) {
  const normalizedText = cleanValidatedReportPlainText(text);
  const blocks = String(normalizedText || "-")
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  blocks.forEach((block) => {
    const oneLine = block.replace(/\s+/g, " ").trim();

    if (isValidatedReportHeading(oneLine)) {
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("black").text(oneLine, {
        align: "left",
        lineGap: 3
      });
      doc.font("Helvetica").moveDown(0.35);
      return;
    }

    const labelMatch = oneLine.match(/^(Rimedi pratici|Come gestirlo nella pratica|Nome|Email|Età|Azienda risorsa|Ruolo target|Data compilazione):\s*(.*)$/i);
    if (labelMatch) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("black").text(`${labelMatch[1]}: `, {
        continued: !!labelMatch[2],
        align: "left",
        lineGap: 3
      });
      if (labelMatch[2]) {
        doc.font("Helvetica").fontSize(11).text(labelMatch[2], {
          align: "left",
          lineGap: 3
        });
      }
      doc.font("Helvetica").moveDown(0.55);
      return;
    }

    doc.font("Helvetica").fontSize(11).fillColor("black").text(block, {
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
      result: {
        include: {
          reportRevisions: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};
  const assessmentType = payload.assessmentType || assessment.assessmentType || "zpi_hr";
  const assessmentTitle = payload.assessmentTitle || getAssessmentConfig(assessmentType).title;
  const normalized = getNormalizedAnalysis(payload, assessment.requestedRole);
  const traits = normalized.traits;
  const mainTraits = normalized.mainTraits;
  const additionalParameters = normalized.additionalParameters;
  const expanded = applyClientOutputRulesToExpandedReport(
    cleanExpandedReport(assessment.result?.expandedReportJson || null),
    normalized
  );
  const validatedRevision = assessment.result?.isValidated
    ? latestValidatedRevisionFromAssessment(assessment)
    : null;
  const validatedReportText = validatedRevision
    ? extractValidatedWordPlainText(validatedRevision)
    : "";

  const doc = patchPdfTextNormalization(new PDFDocument({
    margin: 50,
    size: "A4"
  }));

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
    drawAssessmentHistograms(doc, traits, assessmentTitle);
  } else {
    drawLogo(doc);
    doc.fontSize(20).fillColor("black").text(assessmentTitle || "Performance Assessment Report", { align: "center" });
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
  doc.text(`EtÃ : ${assessment.age || "-"}`);
  doc.text(`Azienda risorsa: ${assessment.candidateCompany || "-"}`);
  doc.text(`Ruolo target: ${assessment.requestedRole || "-"}`);
  doc.text(`Data compilazione: ${formatDateTimeRome(assessment.createdAt)}`);
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

  if (validatedReportText) {
    doc.fontSize(9).fillColor("#2f4b7c").text("Relazione validata da revisione Word caricata.", { align: "left" });
    doc.moveDown(0.5);
    writeValidatedReportText(doc, validatedReportText);
  } else {
    const generalRelation = buildPlainGeneralRelation({ assessment, normalized, expanded });
    writeParagraphs(doc, generalRelation);
  }

  if (roleFit?.score != null && !isDirectionalExecutiveRole(assessment.requestedRole)) {
    doc.moveDown(0.1);
    doc.fontSize(12).fillColor("black").text(`CompatibilitÃ  con il ruolo ricoperto: ${roleFit.score}%`, {
      align: "left"
    });
    doc.moveDown(0.6);
  }

  if (!isDirectionalExecutiveRole(assessment.requestedRole)) {
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor("black").text("Indicazione pratica per la gestione");
    doc.moveDown(0.2);
    writeParagraphs(doc, managementAdvice || "Gestire con obiettivi chiari, priorità scritte e momenti di confronto periodici.");
  }

  doc.fillColor("black");

  // Pagina "Dettaglio tratti e parametri aggiuntivi" rimossa su richiesta cliente.
  // Il report passa direttamente dalla relazione generale all'approfondimento dei tratti.

  if (!validatedReportText && expanded?.generalSummary) {
    doc.addPage();
    drawLogo(doc);

    doc.fontSize(16).fillColor("black").text("Approfondimento dei tratti");
    doc.moveDown(0.5);

    doc.moveDown();

    if (Array.isArray(expanded.traits)) {
      expanded.traits.forEach((t) => {
        const displayName = displayDimensionName(t.name || "Tratto");
        const description = dimensionDescription(t.name);
        doc.fontSize(14).text(displayName);
        if (description) {
          doc.moveDown(0.1);
          doc.fontSize(9).fillColor("#666666").text(`(${description})`);
          doc.fillColor("black");
        }
        doc.moveDown(0.2);

        doc.fontSize(11).text(t.expandedText || "");
        doc.moveDown(0.3);

        if (t.showRemedies !== false) {
          doc.fontSize(11).text(`Rimedi pratici: ${t.improvementPlan || "-"}`);
          doc.moveDown(0.3);
        }

        if (t.showSkillAction !== false) {
          doc.fontSize(11).text(
            `Come gestirlo nella pratica: ${t.skillAction || t.teamLeverage || "-"}`
          );
          doc.moveDown(0.3);
        }

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


