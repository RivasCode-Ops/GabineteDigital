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
  const territoryId = searchParams.get("territory_id");
  const performedBy = searchParams.get("performed_by");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (type) where.type = type;
  if (territoryId) where.territoryId = territoryId;
  if (performedBy) where.performedBy = performedBy;
  if (startDate) where.performedAt = { gte: new Date(startDate) };
  if (endDate) {
    where.performedAt = {
      ...((where.performedAt as object) || {}),
      lte: new Date(endDate),
    };
  }

  const [data, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true, type: true } },
        performer: { select: { id: true, name: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { performedAt: "desc" },
    }),
    prisma.activity.count({ where }),
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

  if (!type || !title || !performedAt) {
    return NextResponse.json(
      { error: "type, title e performedAt são obrigatórios" },
      { status: 422 }
    );
  }

  const activity = await prisma.activity.create({
    data: {
      type,
      title,
      description: description || null,
      territoryId: territoryId || null,
      peopleIds: peopleIds || null,
      performedBy: (session.user as any).id,
      performedAt: new Date(performedAt),
      durationMin: durationMin || null,
      location: location || null,
      notes: notes || null,
      isPublic: isPublic || false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "activities",
      entityId: activity.id,
      changes: { type, title, territoryId } as any,
    },
  });

  return NextResponse.json({ data: activity }, { status: 201 });
}
