import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const id = process.argv[2];

if (!id) {
  console.log("ERRORE: passa ID assessment. Esempio:");
  console.log("node .\\scripts\\inspect-one-assessment.mjs cmpaa6c9z0001nt1qufwiedmo");
  process.exit(1);
}

const a = await prisma.assessment.findUnique({
  where: { id },
  include: { result: true }
});

if (!a || !a.result) {
  console.log("Assessment non trovato o senza result:", id);
  await prisma.$disconnect();
  process.exit(0);
}

const payload = a.result.traitsJson || {};
const answers = a.result.answersJson || {};
const traits = Array.isArray(payload.traits) ? payload.traits : [];
const mainTraits = Array.isArray(payload.mainTraits) ? payload.mainTraits : [];
const params = Array.isArray(payload.additionalParameters) ? payload.additionalParameters : [];

console.log("ID:", a.id);
console.log("Nome:", a.respondentName);
console.log("Data:", a.createdAt);
console.log("Tipo:", a.assessmentType || payload.assessmentType);
console.log("Ruolo:", a.requestedRole);
console.log("");
console.log("answersJson keys:", Object.keys(answers).length);
console.log("answers non vuote:", Object.values(answers).filter(Boolean).length);
console.log("");
console.log("traitsJson.traits:", traits.length);
console.log("mainTraits:", mainTraits.length);
console.log("additionalParameters:", params.length);
console.log("");
console.log("TRAITS RAW:");
traits.forEach((t, i) => {
  console.log(`${String(i + 1).padStart(2, "0")}. ${t.name} | ${t.category} | score=${t.score} | q=${t.questionCount}`);
});

await prisma.$disconnect();
