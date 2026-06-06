import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 40;

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
}

async function detectCycle(
  leaderId: string,
  superiorId: string | null
): Promise<boolean> {
  if (!superiorId) return false;
  if (leaderId === superiorId) return true;

  const visited = new Set<string>();
  const queue = [superiorId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === leaderId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const leaderships = await prisma.leadership.findMany({
      where: { leaderId: currentId, isActive: true, deletedAt: null },
      select: { superiorId: true },
    });

    for (const l of leaderships) {
      if (l.superiorId && !visited.has(l.superiorId)) {
        queue.push(l.superiorId);
      }
    }
  }

  return false;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const leaderId = searchParams.get("leader_id");
  const superiorId = searchParams.get("superior_id");
  const territoryId = searchParams.get("territory_id");
  const isActive = searchParams.get("is_active");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (leaderId) where.leaderId = leaderId;
  if (superiorId) where.superiorId = superiorId;
  if (territoryId) where.territoryId = territoryId;
  if (isActive !== null) where.isActive = isActive === "true";

  const [data, total] = await Promise.all([
    prisma.leadership.findMany({
      where,
      include: {
        leader: { select: { id: true, name: true, phone: true, category: true } },
        superior: { select: { id: true, name: true } },
        territory: { select: { id: true, name: true, type: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { startDate: "desc" },
    }),
    prisma.leadership.count({ where }),
  ]);

  return NextResponse.json({
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < ROLE_LEVEL_MIN) {
    return unauthorized();
  }

  const body = await req.json();
  const { leaderId, superiorId, role, territoryId, isCoordinator, startDate } =
    body;

  if (!leaderId || !role) {
    return NextResponse.json(
      { error: "leaderId e role são obrigatórios" },
      { status: 422 }
    );
  }

  const person = await prisma.person.findFirst({
    where: { id: leaderId, deletedAt: null },
  });
  if (!person) {
    return NextResponse.json(
      { error: "Pessoa não encontrada" },
      { status: 404 }
    );
  }

  if (superiorId) {
    const superior = await prisma.person.findFirst({
      where: { id: superiorId, deletedAt: null },
    });
    if (!superior) {
      return NextResponse.json(
        { error: "Superior não encontrado" },
        { status: 404 }
      );
    }

    const hasCycle = await detectCycle(leaderId, superiorId);
    if (hasCycle) {
      return NextResponse.json(
        { error: "Ciclo hierárquico detectado. Esta relação criaria um loop." },
        { status: 422 }
      );
    }
  }

  if (territoryId) {
    const territory = await prisma.territory.findFirst({
      where: { id: territoryId, deletedAt: null },
    });
    if (!territory) {
      return NextResponse.json(
        { error: "Território não encontrado" },
        { status: 404 }
      );
    }
  }

  const leadership = await prisma.leadership.create({
    data: {
      leaderId,
      superiorId: superiorId || null,
      role,
      territoryId: territoryId || null,
      isCoordinator: isCoordinator || false,
      startDate: startDate ? new Date(startDate) : new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "leadership_network",
      entityId: leadership.id,
      changes: { leaderId, superiorId, role, territoryId } as any,
    },
  });

  return NextResponse.json({ data: leadership }, { status: 201 });
}
