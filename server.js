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

    const traitName = question.trait || "Comportamento generale";
    const value = scoreAnswer(answer, question.reverse);

    if (!groups.has(traitName)) {
      groups.set(traitName, []);
    }

    groups.get(traitName).push({
      questionKey: question.key,
      questionId: question.id,
      answer,
      reverse: !!question.reverse,
      value
    });
  });

  return Array.from(groups.entries())
    .map(([name, items]) => {
      const values = items.map((item) => item.value);
      const finalScore = avg(values);

      return {
        name,
        score: finalScore,
        range: range(finalScore),
        questionCount: items.length,
        items
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildSummary(traits, role) {
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 3).map((t) => t.name);
  const low = [...sorted].reverse().slice(0, 2).map((t) => t.name);

  let orientation = "profilo equilibrato";
  const topSet = new Set(top);

  if (topSet.has("Leadership e influenza") || topSet.has("Responsabilità e ownership")) {
    orientation = "orientamento manageriale / guida";
  } else if (
    topSet.has("Estroversione e networking") ||
    topSet.has("Assertività e negoziazione") ||
    topSet.has("Energia sociale e comunicazione")
  ) {
    orientation = "orientamento commerciale / relazione";
  } else if (topSet.has("Organizzazione e metodo") || topSet.has("Continuità professionale")) {
    orientation = "orientamento organizzativo / metodo";
  } else if (topSet.has("Creatività e innovazione") || topSet.has("Visione e orientamento al futuro")) {
    orientation = "orientamento evolutivo / progettuale";
  }

  let roleComment =
    "Il profilo richiede ulteriori elementi per una lettura più precisa rispetto al ruolo.";

  if (role === "manager") {
    roleComment =
      topSet.has("Leadership e influenza") ||
      topSet.has("Responsabilità e ownership") ||
      topSet.has("Organizzazione e metodo")
        ? "Il profilo mostra elementi coerenti con un ruolo manageriale, soprattutto sul piano della guida, della responsabilità e della struttura operativa."
        : "Per un ruolo manageriale sarà utile approfondire in particolare guida, responsabilità, capacità organizzativa e tenuta nella gestione delle persone.";
  } else if (role === "sales") {
    roleComment =
      topSet.has("Estroversione e networking") ||
      topSet.has("Assertività e negoziazione") ||
      topSet.has("Orientamento alla performance") ||
      topSet.has("Energia sociale e comunicazione")
        ? "Il profilo mostra elementi interessanti per un ruolo commerciale, soprattutto su relazione, influenza, energia comunicativa e orientamento al risultato."
        : "Per un ruolo commerciale sarà utile approfondire soprattutto componente relazionale, iniziativa, capacità negoziale e orientamento al risultato.";
  } else if (role === "amministrativo") {
    roleComment =
      topSet.has("Organizzazione e metodo") ||
      topSet.has("Responsabilità e ownership") ||
      topSet.has("Continuità professionale")
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
  reliabilityFlags
}) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY non configurata.");
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      generalSummary: { type: "string" },
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
    required: ["generalSummary", "traits"]
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
- Attendibilità: ${reliabilityLabel} (${reliabilityScore})
- Eventuali segnali attendibilità: ${(reliabilityFlags || []).join("; ") || "nessun segnale rilevante"}

TRATTI VALUTATI
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
  reliabilityFlags
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
        reliabilityFlags
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

function drawTraitHistogram(doc, traits) {
  if (!Array.isArray(traits) || traits.length === 0) return;

  const pageWidth = doc.page.width;
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const usableWidth = pageWidth - marginLeft - marginRight;

  const labelWidth = 115;
  const scoreWidth = 35;
  const gap = 10;
  const trackWidth = usableWidth - labelWidth - scoreWidth - gap * 2;
  const trackX = marginLeft + labelWidth + gap;
  const scoreX = trackX + trackWidth + gap;
  const centerX = trackX + trackWidth / 2;

  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("black").text("Distribuzione dei punteggi");
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor("#666").text(
    "Scala da -30 a +30. Lo zero rappresenta il punto neutro; le barre verso destra indicano punteggi positivi, quelle verso sinistra aree da presidiare."
  );
  doc.moveDown(0.8);

  const startY = doc.y;
  const rowHeight = 24;
  const barHeight = 9;

  doc.fontSize(8).fillColor("#666");
  doc.text("-30", trackX, startY, { width: 30, align: "left" });
  doc.text("0", centerX - 8, startY, { width: 16, align: "center" });
  doc.text("+30", trackX + trackWidth - 30, startY, { width: 30, align: "right" });

  let y = startY + 16;

  traits.forEach((trait) => {
    if (y > doc.page.height - doc.page.margins.bottom - 35) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    const rawScore = Number(trait.score || 0);
    const safeScore = Math.max(-30, Math.min(30, rawScore));
    const halfTrack = trackWidth / 2;
    const barWidth = Math.abs(safeScore) / 30 * halfTrack;
    const barX = safeScore >= 0 ? centerX : centerX - barWidth;

    doc.fontSize(9).fillColor("black").text(trait.name || "Tratto", marginLeft, y - 2, {
      width: labelWidth
    });

    doc.roundedRect(trackX, y, trackWidth, barHeight, 4).fillAndStroke("#f3f3f3", "#dddddd");

    doc
      .moveTo(centerX, y - 3)
      .lineTo(centerX, y + barHeight + 3)
      .lineWidth(0.8)
      .strokeColor("#999999")
      .stroke();

    doc
      .roundedRect(barX, y, Math.max(barWidth, 1), barHeight, 4)
      .fill(safeScore >= 0 ? "#111111" : "#999999");

    doc.fontSize(9).fillColor("black").text(String(rawScore), scoreX, y - 2, {
      width: scoreWidth,
      align: "right"
    });

    y += rowHeight;
  });

  doc.y = y + 4;
  doc.fillColor("black");
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
  res.send("openai-expanded-report-v7-dynamic-questions");
});

app.get("/", (_req, res) => {
  res.redirect("/questionnaires");
});

async function getPrimaryAssessmentLink() {
  const preferredSlug = process.env.COMPANY_SLUG || "zenith";

  const preferredOrganization = await prisma.organization.findFirst({
    where: { slug: preferredSlug },
    include: {
      assessmentLinks: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  if (preferredOrganization?.assessmentLinks?.[0]) {
    return {
      ...preferredOrganization.assessmentLinks[0],
      organization: preferredOrganization
    };
  }

  return prisma.assessmentLink.findFirst({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  });
}

app.get("/questionnaires", async (_req, res) => {
  const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
  const assessmentUrl = `${publicBaseUrl}/zenith-assessment`;
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
        description: "Assessment comportamentale per profili aziendali, con trait, parametri aggiuntivi, compatibilità con il ruolo e report consulenziale.",
        cta: "Apri questionario",
        url: assessmentUrl,
        status: "active"
      },
      {
        eyebrow: "Nuovo percorso",
        title: "Human & Sport Performance",
        description: "Questionario dedicato ad aziende, team e organizzazioni sportive. Il percorso è già previsto come sviluppo successivo.",
        cta: "Disponibile a breve",
        url: null,
        status: "coming_soon"
      }
    ]
  });
});

app.get("/zenith-assessment", async (_req, res) => {
  const link = await getPrimaryAssessmentLink();

  if (!link || !link.isActive) {
    return res.status(404).send("Questionario Zenith Assessment non disponibile.");
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
    const avgScore = avg(traits.map((t) => t.score));
    const avgRange = range(avgScore);
    const requestedRole = req.body.requestedRole || link.requestedRole;
    const summary = buildSummary(traits, requestedRole);
    const { reliabilityScore, reliabilityLabel, reliabilityFlags } = buildReliability(answers, traits);

    const assessment = await prisma.assessment.create({
      data: {
        organizationId: link.organizationId,
        assessmentLinkId: link.id,
        respondentName: req.body.respondentName || "Anonimo",
        respondentEmail: req.body.respondentEmail || null,
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
        roleComment: summary.roleComment
      },
      traits,
      reliabilityScore,
      reliabilityLabel,
      reliabilityFlags
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
      role: item.requestedRole,
      createdAt: item.createdAt,
      avgScore: item.result?.avgScore ?? null,
      orientation: item.result?.orientation ?? "-",
      topTraits: payload.topTraits || [],
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

    startExpandedReportJob({
      assessmentId: assessment.id,
      companyName: req.session.admin.organizationName,
      role: assessment.requestedRole,
      avgScore: assessment.result.avgScore,
      avgRange: assessment.result.avgRange,
      summary: {
        orientation: assessment.result.orientation,
        roleComment: assessment.result.roleComment
      },
      traits,
      reliabilityScore: assessment.result.reliabilityScore ?? 0,
      reliabilityLabel: assessment.result.reliabilityLabel ?? "Non disponibile",
      reliabilityFlags: payload.reliabilityFlags || []
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
        weakTraits: payload.weakTraits || []
      },
      traits: payload.traits || [],
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

  drawLogo(doc);

  doc.fontSize(22).fillColor("black").text("Performance Assessment Report", {
    align: "center"
  });

  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#666").text(req.session.admin.organizationName, {
    align: "center"
  });

  doc.fillColor("black");
  doc.moveDown();

  doc.fontSize(14).text("Dati compilazione");
  doc.fontSize(11);
  doc.text(`Nome: ${assessment.respondentName || "-"}`);
  doc.text(`Email: ${assessment.respondentEmail || "-"}`);
  doc.text(`Azienda risorsa: ${assessment.candidateCompany || "-"}`);
  doc.text(`Ruolo: ${assessment.requestedRole || "-"}`);
  doc.text(`Data: ${new Date(assessment.createdAt).toLocaleString("it-IT")}`);

  doc.moveDown();
  doc.fontSize(14).text("Sintesi generale");
  doc.fontSize(11);
  doc.text(`Score medio: ${assessment.result?.avgScore ?? "-"}`);
  doc.text(`Fascia media: ${assessment.result?.avgRange ?? "-"}`);
  doc.text(`Orientamento prevalente: ${assessment.result?.orientation ?? "-"}`);
  doc.text(`Lettura rispetto al ruolo: ${assessment.result?.roleComment ?? "-"}`);
  doc.text(
    `Attendibilità: ${assessment.result?.reliabilityLabel ?? "-"} (${assessment.result?.reliabilityScore ?? "-"})`
  );

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
  doc.fontSize(14).text("Dettaglio tratti");
  doc.moveDown(0.5);

  if (!traits.length) {
    doc.fontSize(11).text("Nessun dettaglio tratti disponibile.");
  } else {
    traits.forEach((t) => {
      doc.fontSize(11).text(`${t.name}: ${t.score} (${t.range})`);
    });

    doc.addPage();
    drawLogo(doc);
    drawTraitHistogram(doc, traits);
  }

  if (expanded?.generalSummary) {
    doc.addPage();
    drawLogo(doc);

    doc.fontSize(16).fillColor("black").text("Relazione esplosa");
    doc.moveDown(0.5);
    doc.fontSize(11).text(expanded.generalSummary);
    doc.moveDown();

    if (Array.isArray(expanded.traits)) {
      expanded.traits.forEach((t) => {
        doc.fontSize(14).text(t.name || "Tratto");
        doc.moveDown(0.2);

        doc.fontSize(11).text(t.expandedText || "");
        doc.moveDown(0.3);

        doc.fontSize(11).text(`Piano di improvement: ${t.improvementPlan || "-"}`);
        doc.moveDown(0.3);

        doc.fontSize(11).text(
          `Come valorizzare o sviluppare questa skill: ${t.skillAction || t.teamLeverage || "-"}`
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
