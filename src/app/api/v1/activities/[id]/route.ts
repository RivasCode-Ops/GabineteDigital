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

  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      performer: { select: { id: true, name: true } },
    },
  });

  if (!activity) {
    return NextResponse.json(
      { error: "Atividade não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: activity });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const existing = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Atividade não encontrada" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const {
    type,
    title,
    description,
    territoryId,
    peopleIds,
    performedAt,
    durationMin,
    location,
    notes,
    isPublic,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (type) updateData.type = type;
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (territoryId !== undefined) updateData.territoryId = territoryId;
  if (peopleIds !== undefined) updateData.peopleIds = peopleIds;
  if (performedAt) updateData.performedAt = new Date(performedAt);
  if (durationMin !== undefined) updateData.durationMin = durationMin;
  if (location !== undefined) updateData.location = location;
  if (notes !== undefined) updateData.notes = notes;
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  const activity = await prisma.activity.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "activities",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: activity });
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

  const existing = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Atividade não encontrada" },
      { status: 404 }
    );
  }

  await prisma.activity.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "activities",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
