import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const person = await prisma.person.findFirst({
    where: { id, deletedAt: null },
  });
  if (!person) {
    return NextResponse.json(
      { error: "Pessoa não encontrada" },
      { status: 404 }
    );
  }

  await prisma.person.update({
    where: { id },
    data: {
      name: "[ANONIMIZADO]",
      phone: "[ANONIMIZADO]",
      email: null,
      contactOrigin: null,
      notes: null,
      consentGiven: false,
      consentIp: null,
      consentVersion: null,
      consentAt: null,
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: (session.user as any).id,
    action: "ANONYMIZE",
    entity: "person",
    entityId: id,
    description: `Dados anonimizados: ${person.name}`,
    metadata: { previouslyHadConsent: person.consentGiven },
  });

  return NextResponse.json({ message: "Dados anonimizados com sucesso" });
}
