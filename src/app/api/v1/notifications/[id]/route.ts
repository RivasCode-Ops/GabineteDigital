import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ data: updated });
}
