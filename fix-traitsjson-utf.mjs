import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function fixValue(value) {
  if (typeof value === "string") {
    return value
      .replace(/â„¢/g, "™")
      .replace(/â€“/g, "–")
      .replace(/Ã /g, "à")
      .replace(/Ã¨/g, "è")
      .replace(/Ã©/g, "é")
      .replace(/Ã¬/g, "ì")
      .replace(/Ã²/g, "ò")
      .replace(/Ã¹/g, "ù");
  }

  if (Array.isArray(value)) return value.map(fixValue);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fixValue(v)])
    );
  }

  return value;
}

const results = await prisma.assessmentResult.findMany();

let count = 0;

for (const result of results) {
  const fixed = fixValue(result.traitsJson);

  await prisma.assessmentResult.update({
    where: { id: result.id },
    data: { traitsJson: fixed }
  });

  count++;
}

console.log("traitsJson bonificati:", count);

await prisma.$disconnect();
