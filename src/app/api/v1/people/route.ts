import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 20;

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const territoryId = searchParams.get("territory_id");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  if (category) where.category = category;
  if (territoryId) where.territoryId = territoryId;

  const [data, total] = await Promise.all([
    prisma.person.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true, type: true } },
        _count: { select: { demands: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.person.count({ where }),
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
    name,
    phone,
    email,
    category,
    territoryId,
    contactOrigin,
    notes,
    consentGiven,
    consentIp,
  } = body;

  if (!name || !phone || !category) {
    return NextResponse.json(
      { error: "name, phone e category são obrigatórios" },
      { status: 422 }
    );
  }

  if (!consentGiven) {
    return NextResponse.json(
      { error: "Consentimento LGPD é obrigatório" },
      { status: 422 }
    );
  }

  const validCategories = [
    "lideranca",
    "morador",
    "empresario",
    "vereador",
    "ex_vereador",
    "presidente_associacao",
    "sindicato",
    "influenciador",
    "parceiro_institucional",
  ];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 422 });
  }

  const person = await prisma.person.create({
    data: {
      name,
      phone,
      email: email || null,
      category,
      territoryId: territoryId || null,
      contactOrigin: contactOrigin || null,
      notes: notes || null,
      createdBy: (session.user as any).id,
      consentGiven,
      consentIp: consentIp || null,
      consentVersion: "1.0",
      consentAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "people",
      entityId: person.id,
      changes: { name, phone, category, territoryId },
    },
  });

  return NextResponse.json({ data: person }, { status: 201 });
}
