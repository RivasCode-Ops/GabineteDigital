import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider, generateDiagnostic } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const provider = getAIProvider();

  const [metrics, demandByCategory] = await Promise.all([
    prisma.territoryMetric.findMany({
      orderBy: { score: "desc" },
      include: { territory: { select: { id: true, name: true, type: true } } },
    }),
    prisma.demand.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { deletedAt: null },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const totalPeople = await prisma.person.count({ where: { deletedAt: null } });
  const totalDemands = await prisma.demand.count({ where: { deletedAt: null } });
  const totalActivities = await prisma.activity.count({ where: { deletedAt: null } });
  const avgScore = metrics.length > 0
    ? Math.round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length)
    : 0;
  const criticalTerritories = metrics.filter((m) => m.score <= 40).length;

  const insights = await provider.generateInsights({
    territories: metrics.map((m) => ({
      name: m.territory.name,
      type: m.territory.type,
      score: m.score,
      peopleCount: m.peopleCount,
      leadersCount: m.leadersCount,
      demandsCount: m.demandsCount,
      openDemands: m.openDemands,
      resolvedDemands: m.resolvedDemands,
      activitiesCount: m.activitiesCount,
      eventsCount: m.eventsCount,
      surveysCount: m.surveysCount,
      lastActivityAt: m.lastActivityAt?.toISOString() ?? null,
    })),
    demandsByCategory: demandByCategory.map((d) => ({
      category: d.category,
      count: d._count.id,
    })),
    totalPeople,
    totalDemands,
    totalActivities,
    avgScore,
    criticalTerritories,
  });

  const diagnostics = metrics
    .filter((m) => m.score <= 40)
    .slice(0, 10)
    .map((m) =>
      generateDiagnostic({
        name: m.territory.name,
        type: m.territory.type,
        score: m.score,
        peopleCount: m.peopleCount,
        leadersCount: m.leadersCount,
        demandsCount: m.demandsCount,
        openDemands: m.openDemands,
        resolvedDemands: m.resolvedDemands,
        activitiesCount: m.activitiesCount,
        eventsCount: m.eventsCount,
        surveysCount: m.surveysCount,
        lastActivityAt: m.lastActivityAt?.toISOString() ?? null,
      })
    );

  return NextResponse.json({ data: { insights, diagnostics, meta: { avgScore, criticalTerritories } } });
}
