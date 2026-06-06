import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const [metrics, alerts, totalPeople, totalDemands, totalActivities] =
    await Promise.all([
      prisma.territoryMetric.findMany({
        orderBy: { score: "desc" },
        include: {
          territory: { select: { id: true, name: true, type: true, slug: true } },
        },
      }),
      prisma.alert.findMany({
        where: { resolvedAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { territory: { select: { id: true, name: true } } },
      }),
      prisma.person.count({ where: { deletedAt: null } }),
      prisma.demand.count({ where: { deletedAt: null } }),
      prisma.activity.count({ where: { deletedAt: null } }),
    ]);

  const topTerritories = metrics.slice(0, 10);
  const criticalTerritories = metrics
    .filter((m) => m.score <= 40)
    .slice(0, 10);
  const avgScore =
    metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length)
      : 0;

  return NextResponse.json({
    data: {
      metrics,
      alerts,
      topTerritories,
      criticalTerritories,
      totals: {
        territories: metrics.length,
        people: totalPeople,
        demands: totalDemands,
        activities: totalActivities,
        avgScore,
      },
    },
  });
}
