import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 100;

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parent_id");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (type) where.type = type;
  if (parentId) where.parentId = parentId;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.territory.findMany({
      where,
      include: { _count: { select: { children: true } } },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { name: "asc" },
    }),
    prisma.territory.count({ where }),
  ]);

  return NextResponse.json({
    data: data.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      slug: t.slug,
      parentId: t.parentId,
      childrenCount: t._count.children,
      isActive: t.isActive,
    })),
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < ROLE_LEVEL_MIN) {
    return unauthorized();
  }

  const body = await req.json();
  const { name, type, parentId, population, ibgeCode } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "name e type são obrigatórios" },
      { status: 422 }
    );
  }

  const validTypes = ["state", "region", "city", "neighborhood", "community"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 422 });
  }

  if (parentId) {
    const parent = await prisma.territory.findUnique({
      where: { id: parentId, deletedAt: null },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "Território pai não encontrado" },
        { status: 404 }
      );
    }
  }

  const slug = `${type}-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

  const territory = await prisma.territory.create({
    data: {
      name,
      type,
      slug,
      parentId: parentId || null,
      population: population || null,
      ibgeCode: ibgeCode || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "territories",
      entityId: territory.id,
      changes: { name, type, parentId },
    },
  });

  return NextResponse.json({ data: territory }, { status: 201 });
}
