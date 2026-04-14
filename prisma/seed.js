import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const companyName = process.env.COMPANY_NAME || "Demo Company";
  const companySlug = process.env.COMPANY_SLUG || "demo-company";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const org = await prisma.organization.upsert({
    where: { slug: companySlug },
    update: {},
    create: { name: companyName, slug: companySlug }
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { organizationId: org.id, passwordHash },
    create: {
      organizationId: org.id,
      name: "Admin Demo",
      email: adminEmail,
      passwordHash
    }
  });

  const links = [
    { token: `${companySlug}-manager-001`, label: "Manager Demo", requestedRole: "manager" },
    { token: `${companySlug}-sales-001`, label: "Sales Demo", requestedRole: "sales" },
    { token: `${companySlug}-amministrativo-001`, label: "Amministrativo Demo", requestedRole: "amministrativo" }
  ];

  for (const link of links) {
    await prisma.assessmentLink.upsert({
      where: { token: link.token },
      update: { label: link.label, requestedRole: link.requestedRole, isActive: true },
      create: {
        organizationId: org.id,
        token: link.token,
        label: link.label,
        requestedRole: link.requestedRole,
        isActive: true
      }
    });
  }

  console.log("Seed completato.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});