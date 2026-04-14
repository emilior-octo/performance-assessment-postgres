import "dotenv/config";
import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-me-now",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));
app.use((req, res, next) => { res.locals.currentAdmin = req.session?.admin || null; next(); });

function requireAdmin(req, res, next) {
  if (!req.session?.admin) return res.redirect("/admin/login");
  next();
}

function score(answer) {
  if (answer === "agree") return 30;
  if (answer === "uncertain") return 10;
  if (answer === "disagree") return -30;
  return 0;
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
  return { name, answers, score: finalScore, range: range(finalScore) };
}

function buildSummary(traits, role) {
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 3).map(t => t.name);
  const low = [...sorted].reverse().slice(0, 2).map(t => t.name);

  let orientation = "profilo equilibrato";
  const topSet = new Set(top);

  if (topSet.has("Leadership") && topSet.has("Responsabilità")) {
    orientation = "orientamento manageriale / guida";
  } else if (topSet.has("Estroversione") && topSet.has("Determinazione")) {
    orientation = "orientamento commerciale / influenza";
  } else if (topSet.has("Organizzazione") && topSet.has("Collaborazione")) {
    orientation = "orientamento organizzativo / coordinamento";
  }

  let roleComment = "Il profilo richiede ulteriori elementi per una lettura più precisa rispetto al ruolo.";

  if (role === "manager") {
    roleComment =
      (topSet.has("Leadership") || topSet.has("Responsabilità") || topSet.has("Organizzazione"))
        ? "Il profilo mostra elementi coerenti con un ruolo manageriale, soprattutto sul piano della guida, della responsabilità e della struttura."
        : "Per un ruolo manageriale sarà utile approfondire in particolare guida, responsabilità e capacità organizzativa.";
  } else if (role === "sales") {
    roleComment =
      (topSet.has("Estroversione") || topSet.has("Determinazione") || topSet.has("Empatia"))
        ? "Il profilo mostra elementi interessanti per un ruolo commerciale, soprattutto su spinta, relazione e influenza."
        : "Per un ruolo commerciale sarà utile approfondire soprattutto componente relazionale, iniziativa e orientamento al risultato.";
  } else if (role === "amministrativo") {
    roleComment =
      (topSet.has("Organizzazione") || topSet.has("Collaborazione") || topSet.has("Responsabilità"))
        ? "Il profilo mostra elementi coerenti con un ruolo amministrativo, soprattutto su metodo, affidabilità e continuità."
        : "Per un ruolo amministrativo sarà utile approfondire soprattutto metodo, precisione e affidabilità.";
  }

  return { orientation, topTraits: top, weakTraits: low, roleComment };
}

app.get("/", (_req, res) => res.redirect("/admin/login"));

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
    requestedRole: link.requestedRole
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

    const traits = [
      buildTrait("Determinazione", [req.body.q1, req.body.q9]),
      buildTrait("Organizzazione", [req.body.q2, req.body.q10]),
      buildTrait("Gestione pressione", [req.body.q3, req.body.q11]),
      buildTrait("Empatia", [req.body.q4, req.body.q12]),
      buildTrait("Estroversione", [req.body.q5, req.body.q13]),
      buildTrait("Leadership", [req.body.q6, req.body.q14]),
      buildTrait("Collaborazione", [req.body.q7, req.body.q15]),
      buildTrait("Responsabilità", [req.body.q8, req.body.q16])
    ];

    const avgScore = avg(traits.map(t => t.score));
    const requestedRole = req.body.requestedRole || link.requestedRole;
    const summary = buildSummary(traits, requestedRole);

    const assessment = await prisma.assessment.create({
      data: {
        organizationId: link.organizationId,
        assessmentLinkId: link.id,
        respondentName: req.body.respondentName || "Anonimo",
        respondentEmail: req.body.respondentEmail || null,
        requestedRole
      }
    });

    await prisma.assessmentResult.create({
      data: {
        assessmentId: assessment.id,
        avgScore,
        avgRange: range(avgScore),
        orientation: summary.orientation,
        roleComment: summary.roleComment,
        traitsJson: { traits, topTraits: summary.topTraits, weakTraits: summary.weakTraits }
      }
    });

    res.redirect("/thank-you");
  } catch (error) {
    console.error("Errore submit questionario:", error);
    res.status(500).send("Errore durante il salvataggio della compilazione.");
  }
});

app.get("/thank-you", (_req, res) => res.render("thank-you"));
app.get("/admin/login", (_req, res) => res.render("admin-login", { error: null }));

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.adminUser.findUnique({
    where: { email },
    include: { organization: true }
  });

  if (!admin) {
    return res.status(401).render("admin-login", { error: "Credenziali non valide." });
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);

  if (!ok) {
    return res.status(401).render("admin-login", { error: "Credenziali non valide." });
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
  req.session.destroy(() => res.redirect("/admin/login"));
});

app.get("/admin", requireAdmin, async (req, res) => {
  const assessments = await prisma.assessment.findMany({
    where: { organizationId: req.session.admin.organizationId },
    include: { result: true },
    orderBy: { createdAt: "desc" }
  });

  const submissions = assessments.map((item) => {
    const payload = item.result?.traitsJson || {};
    return {
      id: item.id,
      name: item.respondentName,
      email: item.respondentEmail,
      role: item.requestedRole,
      createdAt: item.createdAt,
      avgScore: item.result?.avgScore ?? null,
      orientation: item.result?.orientation ?? "-",
      topTraits: payload.topTraits || []
    };
  });

  res.render("admin", {
    submissions,
    organizationName: req.session.admin.organizationName
  });
});

app.get("/admin/:id", requireAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: { result: true }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};

  const submission = {
    id: assessment.id,
    name: assessment.respondentName,
    email: assessment.respondentEmail,
    role: assessment.requestedRole,
    createdAt: assessment.createdAt,
    analysis: {
      avgScore: assessment.result?.avgScore ?? "-",
      avgRange: assessment.result?.avgRange ?? "-",
      summary: {
        orientation: assessment.result?.orientation ?? "-",
        roleComment: assessment.result?.roleComment ?? "-",
        topTraits: payload.topTraits || [],
        weakTraits: payload.weakTraits || []
      },
      traits: payload.traits || []
    }
  };

  res.render("detail", {
    submission,
    organizationName: req.session.admin.organizationName
  });
});

app.get("/admin/:id/pdf", requireAdmin, async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.session.admin.organizationId
    },
    include: { result: true }
  });

  if (!assessment) {
    return res.status(404).send("Assessment non trovato");
  }

  const payload = assessment.result?.traitsJson || {};
  const traits = Array.isArray(payload.traits) ? payload.traits : [];

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=report-${assessment.id}.pdf`);

  doc.pipe(res);

  doc.fontSize(22).text("Performance Assessment Report", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#666").text(req.session.admin.organizationName, { align: "center" });
  doc.fillColor("black");
  doc.moveDown();

  doc.fontSize(14).text("Dati compilazione");
  doc.fontSize(11);
  doc.text(`Nome: ${assessment.respondentName || "-"}`);
  doc.text(`Email: ${assessment.respondentEmail || "-"}`);
  doc.text(`Ruolo: ${assessment.requestedRole || "-"}`);
  doc.text(`Data: ${new Date(assessment.createdAt).toLocaleString("it-IT")}`);

  doc.moveDown();
  doc.fontSize(14).text("Sintesi generale");
  doc.fontSize(11);
  doc.text(`Score medio: ${assessment.result?.avgScore ?? "-"}`);
  doc.text(`Fascia media: ${assessment.result?.avgRange ?? "-"}`);
  doc.text(`Orientamento prevalente: ${assessment.result?.orientation ?? "-"}`);
  doc.text(`Lettura rispetto al ruolo: ${assessment.result?.roleComment ?? "-"}`);

  doc.moveDown();
  doc.fontSize(14).text("Punti forti emergenti");
  doc.fontSize(11).text((payload.topTraits || []).join(", ") || "-");

  doc.moveDown();
  doc.fontSize(14).text("Aree più deboli");
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