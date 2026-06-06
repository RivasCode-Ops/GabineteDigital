import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 100;

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

  const territory = await prisma.territory.findFirst({
    where: { id, deletedAt: null },
    include: {
      parent: true,
      children: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
      _count: { select: { children: true, people: true, demands: true } },
    },
  });

  if (!territory) {
    return NextResponse.json(
      { error: "Território não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: territory });
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

  const existing = await prisma.territory.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Território não encontrado" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { name, population, ibgeCode } = body;

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (population !== undefined) updateData.population = population;
  if (ibgeCode !== undefined) updateData.ibgeCode = ibgeCode;

  if (name) {
    updateData.slug = `${existing.type}-${name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`;
  }

  const territory = await prisma.territory.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "territories",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: territory });
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

  const existing = await prisma.territory.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { children: true } } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Território não encontrado" },
      { status: 404 }
    );
  }

  if (existing._count.children > 0) {
    return NextResponse.json(
      {
        error:
          "Não é possível excluir um território que possui filhos ativos",
      },
      { status: 409 }
    );
  }

  await prisma.territory.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "territories",
      entityId: id,
      changes: { deletedAt: new Date().toISOString() },
    },
  });

  return new NextResponse(null, { status: 204 });
}
