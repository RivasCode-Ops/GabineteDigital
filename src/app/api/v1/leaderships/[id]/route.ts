import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 40;

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

  const leadership = await prisma.leadership.findFirst({
    where: { id, deletedAt: null },
    include: {
      leader: {
        include: { territory: { select: { id: true, name: true } } },
      },
      superior: {
        select: { id: true, name: true, phone: true },
      },
      territory: true,
    },
  });

  if (!leadership) {
    return NextResponse.json(
      { error: "Liderança não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: leadership });
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

  const existing = await prisma.leadership.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Liderança não encontrada" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { role, superiorId, territoryId, isCoordinator, endDate, isActive } =
    body;

  // Cycle detection if superiorId changed
  if (superiorId !== undefined && superiorId !== existing.superiorId) {
    if (superiorId === existing.leaderId) {
      return NextResponse.json(
        { error: "Uma liderança não pode ser superior de si mesma" },
        { status: 422 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (role !== undefined) updateData.role = role;
  if (superiorId !== undefined) updateData.superiorId = superiorId || null;
  if (territoryId !== undefined)
    updateData.territoryId = territoryId || null;
  if (isCoordinator !== undefined) updateData.isCoordinator = isCoordinator;
  if (endDate !== undefined)
    updateData.endDate = endDate ? new Date(endDate) : null;
  if (isActive !== undefined) updateData.isActive = isActive;

  const leadership = await prisma.leadership.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "leadership_network",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: leadership });
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

  const existing = await prisma.leadership.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Liderança não encontrada" },
      { status: 404 }
    );
  }

  await prisma.leadership.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "leadership_network",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
