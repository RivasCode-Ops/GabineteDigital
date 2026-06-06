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

  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      creator: { select: { id: true, name: true } },
      participants: {
        include: { person: { select: { id: true, name: true, phone: true } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evento não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: event });
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

  const existing = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Evento não encontrado" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const {
    title,
    description,
    type,
    territoryId,
    startAt,
    endAt,
    allDay,
    location,
    address,
    status,
    color,
    participants,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (type) updateData.type = type;
  if (territoryId !== undefined) updateData.territoryId = territoryId;
  if (startAt) updateData.startAt = new Date(startAt);
  if (endAt) updateData.endAt = new Date(endAt);
  if (allDay !== undefined) updateData.allDay = allDay;
  if (location !== undefined) updateData.location = location;
  if (address !== undefined) updateData.address = address;
  if (status) updateData.status = status;
  if (color !== undefined) updateData.color = color;

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  if (participants && Array.isArray(participants)) {
    await prisma.eventParticipant.deleteMany({ where: { eventId: id } });
    await prisma.eventParticipant.createMany({
      data: participants.map((pid: string) => ({
        eventId: id,
        personId: pid,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "events",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: event });
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

  const existing = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Evento não encontrado" },
      { status: 404 }
    );
  }

  await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "events",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
