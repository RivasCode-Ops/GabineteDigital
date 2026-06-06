import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider, generateDiagnostic } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const territoryId = searchParams.get("territoryId");

  if (!territoryId) {
    return NextResponse.json({ error: "territoryId é obrigatório" }, { status: 400 });
  }

  const metric = await prisma.territoryMetric.findUnique({
    where: { territoryId },
    include: { territory: { select: { id: true, name: true, type: true } } },
  });

  if (!metric) {
    return NextResponse.json({ error: "Território não encontrado" }, { status: 404 });
  }

  const data = {
    name: metric.territory.name,
    type: metric.territory.type,
    score: metric.score,
    peopleCount: metric.peopleCount,
    leadersCount: metric.leadersCount,
    demandsCount: metric.demandsCount,
    openDemands: metric.openDemands,
    resolvedDemands: metric.resolvedDemands,
    activitiesCount: metric.activitiesCount,
    eventsCount: metric.eventsCount,
    surveysCount: metric.surveysCount,
    lastActivityAt: metric.lastActivityAt?.toISOString() ?? null,
  };

  const diagnostic = generateDiagnostic(data);

  return NextResponse.json({ data: diagnostic });
}
