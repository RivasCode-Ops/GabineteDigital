import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const feedbacks: Array<{
  id: string;
  userId?: string;
  userName?: string;
  message: string;
  url?: string;
  createdAt: string;
}> = [];

export async function POST(request: Request) {
  const session = await auth();
  const { message, url } = await request.json();

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
  }

  const feedback = {
    id: crypto.randomUUID(),
    userId: (session?.user as any)?.id,
    userName: (session?.user as any)?.name,
    message: message.trim(),
    url: url || null,
    createdAt: new Date().toISOString(),
  };

  feedbacks.push(feedback);

  if (feedbacks.length > 1000) feedbacks.shift();

  return NextResponse.json({ data: feedback });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 80) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  return NextResponse.json({
    data: feedbacks.reverse(),
    meta: { total: feedbacks.length },
  });
}
