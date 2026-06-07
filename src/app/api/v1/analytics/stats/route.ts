import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 80) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalViews, viewsByPage, viewsByDay, activeSessions, clickEvents] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.groupBy({
      by: ["page"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo }, action: "view" },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo }, sessionId: { not: null } },
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: weekAgo }, action: "click" },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const entry of viewsByDay) {
    const day = entry.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + entry._count.id);
  }

  return NextResponse.json({
    data: {
      totalViews,
      viewsWeek: viewsByPage.reduce((acc, v) => acc + v._count.id, 0),
      clicksWeek: clickEvents,
      sessionsWeek: activeSessions.length,
      byPage: viewsByPage.map((v) => ({ page: v.page, views: v._count.id })),
      byDay: Array.from(byDay.entries()).map(([day, views]) => ({ day, views })),
    },
  });
}
