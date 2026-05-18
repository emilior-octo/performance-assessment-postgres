import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const assessment = await prisma.assessment.findFirst({
  where: {
    respondentName: {
      contains: "Vincenzina",
      mode: "insensitive"
    }
  },
  include: {
    result: true
  },
  orderBy: {
    createdAt: "desc"
  }
});

if (!assessment) {
  console.log("Nessun assessment trovato.");
  await prisma.$disconnect();
  process.exit(0);
}

const result = assessment.result;
const payload = result?.traitsJson || {};
const answers = result?.answersJson || {};

console.log("ASSESSMENT");
console.log("ID:", assessment.id);
console.log("Nome:", assessment.respondentName);
console.log("Email:", assessment.respondentEmail);
console.log("Ruolo:", assessment.requestedRole);
console.log("Assessment type:", assessment.assessmentType || payload.assessmentType);
console.log("Created at:", assessment.createdAt);
console.log("");

console.log("TRAITS JSON");
console.log("traitsJson.traits count:", Array.isArray(payload.traits) ? payload.traits.length : 0);
console.log("mainTraits count:", Array.isArray(payload.mainTraits) ? payload.mainTraits.length : 0);
console.log("additionalParameters count:", Array.isArray(payload.additionalParameters) ? payload.additionalParameters.length : 0);
console.log("");

console.log("traitsJson.traits names:");
(Array.isArray(payload.traits) ? payload.traits : []).forEach((t, i) => {
  console.log(`${String(i + 1).padStart(2, "0")}. ${t.name} | category=${t.category} | score=${t.score} | q=${t.questionCount}`);
});

console.log("");
console.log("mainTraits names:");
(Array.isArray(payload.mainTraits) ? payload.mainTraits : []).forEach((t, i) => {
  console.log(`${String(i + 1).padStart(2, "0")}. ${t.name} | score=${t.score} | q=${t.questionCount}`);
});

console.log("");
console.log("additionalParameters names:");
(Array.isArray(payload.additionalParameters) ? payload.additionalParameters : []).forEach((t, i) => {
  console.log(`${String(i + 1).padStart(2, "0")}. ${t.name} | score=${t.score} | q=${t.questionCount}`);
});

console.log("");
console.log("ANSWERS JSON");
console.log("answersJson keys totali:", Object.keys(answers).length);
console.log("answers non vuote:", Object.entries(answers).filter(([k, v]) => v).length);

console.log("");
console.log("Prime 30 answers:");
Object.entries(answers).slice(0, 30).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

await prisma.$disconnect();
