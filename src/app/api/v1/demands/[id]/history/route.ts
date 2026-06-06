import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const history = await prisma.demandHistory.findMany({
    where: { demandId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: history });
}
