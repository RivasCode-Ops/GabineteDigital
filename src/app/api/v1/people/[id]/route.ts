import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROLE_LEVEL_MIN = 20;

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

  const person = await prisma.person.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      demands: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!person) {
    return NextResponse.json(
      { error: "Pessoa não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: person });
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

  const existing = await prisma.person.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Pessoa não encontrada" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { name, phone, email, category, territoryId, contactOrigin, notes } =
    body;

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (category) updateData.category = category;
  if (territoryId !== undefined) updateData.territoryId = territoryId;
  if (contactOrigin !== undefined) updateData.contactOrigin = contactOrigin;
  if (notes !== undefined) updateData.notes = notes;

  const person = await prisma.person.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update",
      entity: "people",
      entityId: id,
      changes: updateData as any,
    },
  });

  return NextResponse.json({ data: person });
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

  const existing = await prisma.person.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Pessoa não encontrada" },
      { status: 404 }
    );
  }

  await prisma.person.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete",
      entity: "people",
      entityId: id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
