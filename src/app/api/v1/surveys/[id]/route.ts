import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const survey = await prisma.survey.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      collector: { select: { id: true, name: true } },
      questions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!survey) {
    return NextResponse.json(
      { error: "Pesquisa não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: survey });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const existing = await prisma.survey.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Pesquisa não encontrada" },
      { status: 404 }
    );
  }

  await prisma.survey.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "surveys",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
