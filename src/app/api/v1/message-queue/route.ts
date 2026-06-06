import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const queue = await prisma.messageQueue.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { template: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: queue });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { templateId, recipient, channel, subject, body } = await request.json();

  if (!recipient || !channel) {
    return NextResponse.json({ error: "recipient e channel são obrigatórios" }, { status: 400 });
  }

  const item = await prisma.messageQueue.create({
    data: { templateId, recipient, channel, subject, body },
  });

  return NextResponse.json({ data: item });
}
