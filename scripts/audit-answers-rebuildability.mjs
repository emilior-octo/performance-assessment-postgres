import { PrismaClient } from "@prisma/client";
import { ZPI_QUESTIONS, getScoredQuestions } from "./questions.js";

const prisma = new PrismaClient();

const rows = await prisma.assessment.findMany({
  include: { result: true },
  orderBy: { createdAt: "desc" },
  take: 100
});

for (const a of rows) {
  const answers = a.result?.answersJson || {};
  const answeredKeys = Object.keys(answers).filter(k => answers[k]);
  const scoredKeys = getScoredQuestions().map(q => q.key);
  const validScoredAnswers = scoredKeys.filter(k => answers[k]);

  const payload = a.result?.traitsJson || {};
  const traitsCount = Array.isArray(payload.traits) ? payload.traits.length : 0;

  if (traitsCount < 20) {
    console.log("");
    console.log("ASSESSMENT:", a.id);
    console.log("Nome:", a.respondentName);
    console.log("Data:", a.createdAt);
    console.log("Ruolo:", a.requestedRole);
    console.log("traitsJson.traits count:", traitsCount);
    console.log("answersJson keys totali:", answeredKeys.length);
    console.log("risposte valide su domande scored:", validScoredAnswers.length + "/" + scoredKeys.length);
    console.log("assessmentType:", a.assessmentType || payload.assessmentType);
  }
}

await prisma.$disconnect();
