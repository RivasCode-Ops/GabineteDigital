import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const now = new Date();

  const [
    totalPeople,
    totalDemands,
    totalActivities,
    totalSurveys,
    totalEvents,
    demandByStatus,
    upcomingEvents,
    metrics,
    alerts,
    topLeaders,
    sentimentAgg,
  ] = await Promise.all([
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.demand.count({ where: { deletedAt: null } }),
    prisma.activity.count({ where: { deletedAt: null } }),
    prisma.survey.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.demand.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { deletedAt: null },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        startAt: { gte: now },
        status: { notIn: ["cancelled"] },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        startAt: true,
        status: true,
        territory: { select: { id: true, name: true } },
      },
    }),
    prisma.territoryMetric.findMany({
      orderBy: { score: "desc" },
      include: {
        territory: { select: { id: true, name: true, type: true } },
      },
    }),
    prisma.alert.findMany({
      where: { resolvedAt: null },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      take: 10,
      include: { territory: { select: { id: true, name: true } } },
    }),
    prisma.leadership.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        leader: { select: { id: true, name: true } },
        territory: { select: { id: true, name: true } },
      },
    }),
    prisma.survey.groupBy({
      by: ["sentiment"],
      _count: { id: true },
      where: { deletedAt: null },
    }),
  ]);

  const avgScore =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length)
      : 0;

  const topTerritories = metrics.slice(0, 5);
  const criticalCount = metrics.filter((m) => m.score <= 40).length;

  return NextResponse.json({
    data: {
      totals: {
        people: totalPeople,
        demands: totalDemands,
        activities: totalActivities,
        surveys: totalSurveys,
        events: totalEvents,
        avgScore,
        criticalCount,
        activeTerritories: metrics.length,
      },
      demandByStatus,
      upcomingEvents,
      topTerritories,
      alerts,
      topLeaders: topLeaders.map((l) => ({
        id: l.id,
        name: l.leader.name,
        role: l.role,
        territory: l.territory?.name ?? null,
      })),
      sentiment: sentimentAgg.map((s) => ({
        sentiment: s.sentiment,
        count: s._count.id,
      })),
    },
  });
}
