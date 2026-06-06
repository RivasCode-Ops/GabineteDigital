import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 10;

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
}

const validTransitions: Record<string, string[]> = {
  recebida: ["triagem", "arquivada"],
  triagem: ["encaminhada", "arquivada"],
  encaminhada: ["acompanhamento", "arquivada"],
  acompanhamento: ["resolvida", "arquivada"],
  resolvida: ["encerrada"],
  encerrada: [],
  arquivada: [],
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const territoryId = searchParams.get("territory_id");
  const assignedTo = searchParams.get("assigned_to");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (territoryId) where.territoryId = territoryId;
  if (assignedTo) where.assignedTo = assignedTo;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.demand.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true, type: true } },
        requester: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.demand.count({ where }),
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
  const {
    title,
    description,
    category,
    priority,
    territoryId,
    requesterId,
    assignedTo,
  } = body;

  if (!title || !category) {
    return NextResponse.json(
      { error: "title e category são obrigatórios" },
      { status: 422 }
    );
  }

  const validCategories = [
    "saude",
    "educacao",
    "infraestrutura",
    "transporte",
    "agricultura",
    "assistencia_social",
    "regularizacao_fundiaria",
    "outro",
  ];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 422 });
  }

  const demand = await prisma.demand.create({
    data: {
      title,
      description: description || null,
      category,
      priority: priority || "media",
      territoryId: territoryId || null,
      requesterId: requesterId || null,
      assignedTo: assignedTo || null,
      assignedBy: assignedTo ? (session.user as any).id : null,
      createdBy: (session.user as any).id,
    },
  });

  await prisma.demandHistory.create({
    data: {
      demandId: demand.id,
      field: "status",
      oldValue: null,
      newValue: "recebida",
      changedBy: (session.user as any).id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "demands",
      entityId: demand.id,
      changes: { title, category, priority } as any,
    },
  });

  return NextResponse.json({ data: demand }, { status: 201 });
}
