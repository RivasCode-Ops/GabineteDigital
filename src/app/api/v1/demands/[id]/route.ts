import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 10;

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return unauthorized();

  const demand = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      requester: true,
      assignee: { select: { id: true, name: true, email: true } },
      assigner: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      history: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!demand) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: demand });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < ROLE_LEVEL_MIN) {
    return unauthorized();
  }

  const existing = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { title, description, category, priority, territoryId, requesterId } =
    body;

  const updateData: Record<string, unknown> = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category) updateData.category = category;
  if (priority) updateData.priority = priority;
  if (territoryId !== undefined) updateData.territoryId = territoryId;
  if (requesterId !== undefined) updateData.requesterId = requesterId;
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo para atualizar" },
      { status: 422 }
    );
  }

  const demand = await prisma.demand.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "demands",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: demand });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < ROLE_LEVEL_MIN) {
    return unauthorized();
  }

  const existing = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  await prisma.demand.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "demands",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
