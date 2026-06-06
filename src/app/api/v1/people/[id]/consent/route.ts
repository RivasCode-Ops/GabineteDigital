import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  _req: Request,
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
    return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
  }

  await prisma.person.update({
    where: { id },
    data: {
      consentGiven: !person.consentGiven,
    },
  });

  await createAuditLog({
    userId: (session.user as any).id,
    action: "CONSENT_REVOKE",
    entity: "person",
    entityId: id,
    description: `Consentimento ${person.consentGiven ? "revogado" : "concedido"} para ${person.name}`,
  });

  return NextResponse.json({
    data: { consentGiven: !person.consentGiven },
  });
}
