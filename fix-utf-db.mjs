import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function fix(text) {
  if (!text) return text;

  return String(text)
    .replace(/â„¢/g, "™")
    .replace(/â€“/g, "–")
    .replace(/Ã /g, "à")
    .replace(/Ã¨/g, "è")
    .replace(/Ã©/g, "é")
    .replace(/Ã¬/g, "ì")
    .replace(/Ã²/g, "ò")
    .replace(/Ã¹/g, "ù")
    .replace(/Ã€/g, "À")
    .replace(/Ãˆ/g, "È")
    .replace(/Ã‰/g, "É")
    .replace(/Ã’/g, "Ò")
    .replace(/Ã™/g, "Ù");
}

const assessments = await prisma.assessment.findMany();

for (const a of assessments) {
  await prisma.assessment.update({
    where: { id: a.id },
    data: {
      assessmentType: fix(a.assessmentType),
      role: fix(a.role),
      company: fix(a.company)
    }
  });
}

console.log("Bonifica UTF completata");

await prisma.$disconnect();
