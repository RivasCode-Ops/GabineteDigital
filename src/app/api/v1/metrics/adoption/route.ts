import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalPeople,
    demandsCreated,
    demandsResolved,
    activitiesCount,
    eventsCount,
    surveysCount,
    avgScore,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.user.count({
      where: { deletedAt: null, isActive: true, lastLoginAt: { gte: weekAgo } },
    }),
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.demand.count({ where: { deletedAt: null, createdAt: { gte: weekAgo } } }),
    prisma.demand.count({
      where: { deletedAt: null, status: "resolvida", updatedAt: { gte: weekAgo } },
    }),
    prisma.activity.count({ where: { deletedAt: null, performedAt: { gte: weekAgo } } }),
    prisma.event.count({ where: { deletedAt: null, startAt: { gte: weekAgo } } }),
    prisma.survey.count({ where: { deletedAt: null, createdAt: { gte: monthAgo } } }),
    prisma.territoryMetric
      .aggregate({ _avg: { score: true } })
      .then((r) => Math.round(r._avg.score ?? 0)),
  ]);

  const loginActivity = await prisma.auditLog.groupBy({
    by: ["createdAt"],
    _count: { id: true },
    where: {
      action: "LOGIN",
      createdAt: { gte: weekAgo },
    },
  });

  const adoptionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  return NextResponse.json({
    data: {
      period: {
        week: weekAgo.toISOString(),
        month: monthAgo.toISOString(),
      },
      users: {
        total: totalUsers,
        activeWeek: activeUsers,
        adoptionRate,
      },
      people: { total: totalPeople },
      demands: {
        createdWeek: demandsCreated,
        resolvedWeek: demandsResolved,
        resolutionRate: demandsCreated > 0
          ? Math.round((demandsResolved / demandsCreated) * 100)
          : 0,
      },
      activities: { week: activitiesCount },
      events: { week: eventsCount },
      surveys: { month: surveysCount },
      score: { avg: avgScore },
      logins: loginActivity.length,
    },
  });
}
