import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const territoryId = searchParams.get("territory_id");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (type) where.type = type;
  if (status) where.status = status;
  if (territoryId) where.territoryId = territoryId;
  if (startDate) where.startAt = { gte: new Date(startDate) };
  if (endDate) where.endAt = { lte: new Date(endDate) };

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true, type: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { startAt: "asc" },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
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

  if (!title || !type || !startAt) {
    return NextResponse.json(
      { error: "title, type e startAt são obrigatórios" },
      { status: 422 }
    );
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      type,
      territoryId: territoryId || null,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : new Date(startAt),
      allDay: allDay || false,
      location: location || null,
      address: address || null,
      createdBy: (session.user as any).id,
      status: status || "scheduled",
      color: color || null,
    },
  });

  if (participants && Array.isArray(participants)) {
    await prisma.eventParticipant.createMany({
      data: participants.map((pid: string) => ({
        eventId: event.id,
        personId: pid,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "events",
      entityId: event.id,
      changes: { title, type, startAt } as any,
    },
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
