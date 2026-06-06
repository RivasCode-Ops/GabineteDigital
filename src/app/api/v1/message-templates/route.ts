import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const templates = await prisma.messageTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: templates });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 80) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { name, subject, body, variables } = await request.json();

  if (!name || !subject || !body) {
    return NextResponse.json({ error: "name, subject e body são obrigatórios" }, { status: 400 });
  }

  const template = await prisma.messageTemplate.create({
    data: { name, subject, body, variables: variables || [] },
  });

  return NextResponse.json({ data: template });
}
