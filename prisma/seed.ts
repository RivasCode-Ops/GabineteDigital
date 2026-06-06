import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", level: 100, description: "Acesso total ao sistema" },
    }),
    prisma.role.upsert({
      where: { name: "COORDENADOR_GERAL" },
      update: {},
      create: { name: "COORDENADOR_GERAL", level: 80, description: "Coordenação nacional/estadual" },
    }),
    prisma.role.upsert({
      where: { name: "COORDENADOR_REGIONAL" },
      update: {},
      create: { name: "COORDENADOR_REGIONAL", level: 60, description: "Coordenação regional" },
    }),
    prisma.role.upsert({
      where: { name: "COORDENADOR_MUNICIPAL" },
      update: {},
      create: { name: "COORDENADOR_MUNICIPAL", level: 40, description: "Coordenação municipal" },
    }),
    prisma.role.upsert({
      where: { name: "LIDERANCA" },
      update: {},
      create: { name: "LIDERANCA", level: 20, description: "Liderança comunitária" },
    }),
    prisma.role.upsert({
      where: { name: "OPERADOR" },
      update: {},
      create: { name: "OPERADOR", level: 10, description: "Operador de campo" },
    }),
  ]);

  const adminRole = roles.find((r) => r.name === "ADMIN")!;
  const passwordHash = await hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@gabinete.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@gabinete.com",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  console.log("Seed concluído: 6 perfis e 1 admin criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
