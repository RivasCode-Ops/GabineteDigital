import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const userId = (session.user as any).id;

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return NextResponse.json({ data: notifications, meta: { unread } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { userId, title, message, type, link } = await request.json();

  if (!userId || !title) {
    return NextResponse.json({ error: "userId e title são obrigatórios" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: { userId, title, message, type: type || "INFO", link },
  });

  return NextResponse.json({ data: notification });
}
