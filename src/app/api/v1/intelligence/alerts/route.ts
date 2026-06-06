import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const alerts = await prisma.alert.findMany({
    where: { resolvedAt: null },
    orderBy: [
      { severity: "asc" },
      { createdAt: "desc" },
    ],
    include: { territory: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json({ data: alerts });
}

async function clearResolved() {
  await prisma.alert.deleteMany({ where: { resolvedAt: { not: null } } });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id, clearAll } = await request.json();

  if (clearAll) {
    const result = await prisma.alert.updateMany({
      where: { resolvedAt: null },
      data: { resolvedAt: new Date() },
    });
    await clearResolved();
    return NextResponse.json({ data: { resolved: result.count } });
  }

  if (id) {
    await prisma.alert.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });
    await clearResolved();
    return NextResponse.json({ data: { resolved: 1 } });
  }

  return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
}
