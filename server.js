import "dotenv/config";
import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import PDFDocument from "pdfkit";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import ZPI_QUESTIONS from "./questions.js";

const QUESTIONS = Array.isArray(ZPI_QUESTIONS) ? ZPI_QUESTIONS : [];

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

app.use(express.urlencoded({ extended: true }));
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

function score(answer) {
  if (answer === "agree") return 30;
  if (answer === "uncertain") return 10;
  if (answer === "disagree") return -30;
  return 0;
}

function scoreQuestion(answer, question) {
  const baseScore = score(answer);
  return question?.reverse ? baseScore * -1 : baseScore;
}

function answerLabel(answer) {
  if (answer === "agree") return "D’accordo";
  if (answer === "uncertain") return "Incerto / parzialmente";
  if (answer === "disagree") return "In disaccordo";
  return "-";
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

function buildTrait(name, answers) {
  const finalScore = avg(answers.map(score));

  return {
    name,
    answers,
    score: finalScore,
    range: range(finalScore)
  };
}

function getScoredQuestions() {
  return QUESTIONS.filter((q) => q && q.key && q.scored !== false && (q.responseType || "likert") === "likert");
}

function buildTraitsFromAnswers(answers) {
  const traitMap = {};

  getScoredQuestions().forEach((question) => {
    const answer = answers[question.key];

    if (!answer) {
      return;
    }

    const traitName = question.trait || "Comportamento generale";

    if (!traitMap[traitName]) {
      traitMap[traitName] = { scores: [], questionKeys: [] };
    }

    traitMap[traitName].scores.push(scoreQuestion(answer, question));
    traitMap[traitName].questionKeys.push(question.key);
  });

  return Object.entries(traitMap)
    .map(([name, payload]) => {
      const finalScore = avg(payload.scores);

      return {
        name,
        answers: payload.questionKeys,
        score: finalScore,
        range: range(finalScore)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

function buildSummary(traits, role) {
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 3).map((t) => t.name);
  const low = [...sorted].reverse().slice(0, 2).map((t) => t.name);

  let orientation = "profilo equilibrato";
  const topSet = new Set(top);

  if (topSet.has("Leadership") && topSet.has("Responsabilità")) {
    orientation = "orientamento manageriale / guida";
  } else if (topSet.has("Estroversione") && topSet.has("Determinazione")) {
    orientation = "orientamento commerciale / influenza";
  } else if (topSet.has("Organizzazione") && topSet.has("Collaborazione")) {
    orientation = "orientamento organizzativo / coordinamento";
  }

  let roleComment =
    "Il profilo richiede ulteriori elementi per una lettura più precisa rispetto al ruolo.";

  if (role === "manager") {
    roleComment =
      topSet.has("Leadership") ||
      topSet.has("Responsabilità") ||
      topSet.has("Organizzazione")
        ? "Il profilo mostra elementi coerenti con un ruolo manageriale, soprattutto sul piano della guida, della responsabilità e della struttura."
        : "Per un ruolo manageriale sarà utile approfondire in particolare guida, responsabilità e capacità organizzativa.";
  } else if (role === "sales") {
    roleComment =
      topSet.has("Estroversione") ||
      topSet.has("Determinazione") ||
      topSet.has("Empatia")
        ? "Il profilo mostra elementi interessanti per un ruolo commerciale, soprattutto su spinta, relazione e influenza."
        : "Per un ruolo commerciale sarà utile approfondire soprattutto componente relazionale, iniziativa e orientamento al risultato.";
  } else if (role === "amministrativo") {
    roleComment =
      topSet.has("Organizzazione") ||
      topSet.has("Collaborazione") ||
      topSet.has("Responsabilità")
        ? "Il profilo mostra elementi coerenti con un ruolo amministrativo, soprattutto su metodo, affidabilità e continuità."
        : "Per un ruolo amministrativo sarà utile approfondire soprattutto metodo, precisione e affidabilità.";
  }

  return {
    orientation,
    topTraits: top,
    weakTraits: low,
    roleComment
  };
}

function buildReliability(answers) {
  let issues = 0;
  let checks = 0;

  const pair = (a, b) => {
    checks += 1;

    if ((a === "agree" && b === "disagree") || (a === "disagree" && b === "agree")) {
      issues += 1;
    }
  };

  pair(answers.q1, answers.q9);
  pair(answers.q2, answers.q10);
  pair(answers.q3, answers.q11);
  pair(answers.q4, answers.q12);
  pair(answers.q5, answers.q13);
  pair(answers.q6, answers.q14);
  pair(answers.q7, answers.q15);
  pair(answers.q8, answers.q16);

  const reliabilityScore = Math.max(
    0,
    Math.round(100 - (issues / Math.max(checks, 1)) * 100)
  );

  let reliabilityLabel = "Alta affidabilità";
  if (reliabilityScore < 80) reliabilityLabel = "Buona affidabilità";
  if (reliabilityScore < 60) reliabilityLabel = "Attendibilità da verificare";
  if (reliabilityScore < 40) reliabilityLabel = "Bassa attendibilità";

  return { reliabilityScore, reliabilityLabel };
}

function getQuestionTexts() {
  return Object.fromEntries(
    QUESTIONS
      .filter((q) => q && q.key && q.text)
      .map((q) => [q.key, q.text])
  );
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

async function generateExpandedReportPayload({
  companyName,
  role,
  avgScore,
  avgRange,
  summary,
  traits,
  reliabilityScore,
  reliabilityLabel
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

TRATTI VALUTATI
${JSON.stringify(traits, null, 2)}

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

  return JSON.parse(response.output_text);
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
  reliabilityLabel
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
        reliabilityLabel
      });
    })
    .then(async (expandedReportJson) => {
      await prisma.assessmentResult.update({
        where: { assessmentId },
        data: {
          expandedReportJson,
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

    const answers = Object.fromEntries(
      QUESTIONS
        .filter((q) => q && q.key)
        .map((q) => [q.key, req.body[q.key] || null])
    );

    const traits = buildTraitsFromAnswers(answers);

    const avgScore = avg(traits.map((t) => t.score));
    const avgRange = range(avgScore);
    const requestedRole = req.body.requestedRole || link.requestedRole;
    const summary = buildSummary(traits, requestedRole);
    const { reliabilityScore, reliabilityLabel } = buildReliability(answers);

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
          weakTraits: summary.weakTraits
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
      reliabilityLabel
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

    if (assessment.result.expandedReportJson) {
      return res.redirect(`/admin/${assessment.id}`);
    }

    if (assessment.result.isGenerating) {
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
      reliabilityLabel: assessment.result.reliabilityLabel ?? "Non disponibile"
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
  const expanded = assessment.result?.expandedReportJson || null;

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
  const expanded = assessment.result?.expandedReportJson || null;

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