import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const { page, action, label, sessionId, duration } = body;

  if (!page || !action) {
    return NextResponse.json({ error: "page e action são obrigatórios" }, { status: 400 });
  }

  await prisma.analyticsEvent.create({
    data: {
      page,
      action,
      label: label || null,
      sessionId: sessionId || null,
      duration: duration || null,
      userId: (session?.user as any)?.id || null,
    },
  });

  return NextResponse.json({ ok: true });
}
