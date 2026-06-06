import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function calculateScore(metrics: {
  leadersCount: number;
  activitiesCount: number;
  resolvedDemands: number;
  surveysCount: number;
}): number {
  let score = 0;
  if (metrics.leadersCount > 0) score += Math.min(metrics.leadersCount * 15, 25);
  if (metrics.activitiesCount > 0) score += Math.min(metrics.activitiesCount * 10, 25);
  if (metrics.surveysCount > 0) score += Math.min(metrics.surveysCount * 20, 25);
  const resolveRate =
    metrics.resolvedDemands > 0
      ? Math.min((metrics.resolvedDemands / Math.max(metrics.resolvedDemands, 1)) * 25, 25)
      : 0;
  score += resolveRate;
  return Math.min(Math.round(score), 100);
}

async function generateAlerts() {
  await prisma.alert.deleteMany({ where: { resolvedAt: null } });

  const metrics = await prisma.territoryMetric.findMany({
    include: { territory: { select: { id: true, name: true } } },
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const m of metrics) {
    if (m.activitiesCount === 0) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "TERRITORIO_SEM_VISITA",
          severity: "alto",
          title: "Território sem visitas",
          description: `${m.territory.name} não possui nenhuma atividade registrada.`,
        },
      });
    } else if (m.lastActivityAt && m.lastActivityAt < thirtyDaysAgo) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "TERRITORIO_SEM_VISITA",
          severity: "medio",
          title: "Território sem visitas recentes",
          description: `Última atividade em ${m.lastActivityAt.toLocaleDateString("pt-BR")}.`,
        },
      });
    }

    if (m.leadersCount === 0) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "LIDERANCA_INATIVA",
          severity: "alto",
          title: "Sem lideranças no território",
          description: `${m.territory.name} não possui lideranças cadastradas.`,
        },
      });
    }

    if (m.surveysCount === 0) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "SEM_PESQUISA",
          severity: "medio",
          title: "Nenhuma pesquisa realizada",
          description: `${m.territory.name} não possui pesquisas de campo.`,
        },
      });
    }

    if (m.eventsCount === 0) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "SEM_EVENTO",
          severity: "baixo",
          title: "Nenhum evento realizado",
          description: `${m.territory.name} não possui eventos registrados.`,
        },
      });
    }

    if (m.openDemands > 10) {
      await prisma.alert.create({
        data: {
          territoryId: m.territoryId,
          type: "DEMANDA_ATRASADA",
          severity: "critico",
          title: "Acúmulo de demandas abertas",
          description: `${m.territory.name} tem ${m.openDemands} demandas em aberto sem resolução.`,
          metadata: { openDemands: m.openDemands },
        },
      });
    }
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 80) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const territories = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true },
  });

  let updated = 0;
  for (const t of territories) {
    const [peopleCount, leadersCount, demandsCount, openDemands, resolvedDemands, activitiesCount, eventsCount, surveysCount, lastActivity] = await Promise.all([
      prisma.person.count({ where: { territoryId: t.id, deletedAt: null } }),
      prisma.leadership.count({ where: { territoryId: t.id, deletedAt: null, isActive: true } }),
      prisma.demand.count({ where: { territoryId: t.id, deletedAt: null } }),
      prisma.demand.count({ where: { territoryId: t.id, deletedAt: null, status: { notIn: ["resolvida", "encerrada", "arquivada"] } } }),
      prisma.demand.count({ where: { territoryId: t.id, deletedAt: null, status: { in: ["resolvida", "encerrada"] } } }),
      prisma.activity.count({ where: { territoryId: t.id, deletedAt: null } }),
      prisma.event.count({ where: { territoryId: t.id, deletedAt: null } }),
      prisma.survey.count({ where: { territoryId: t.id, deletedAt: null } }),
      prisma.activity.findFirst({
        where: { territoryId: t.id, deletedAt: null },
        orderBy: { performedAt: "desc" },
        select: { performedAt: true },
      }),
    ]);

    const score = calculateScore({ leadersCount, activitiesCount, resolvedDemands, surveysCount });

    await prisma.territoryMetric.upsert({
      where: { territoryId: t.id },
      create: {
        territoryId: t.id,
        peopleCount,
        leadersCount,
        demandsCount,
        openDemands,
        resolvedDemands,
        activitiesCount,
        eventsCount,
        surveysCount,
        lastActivityAt: lastActivity?.performedAt || null,
        score,
      },
      update: {
        peopleCount,
        leadersCount,
        demandsCount,
        openDemands,
        resolvedDemands,
        activitiesCount,
        eventsCount,
        surveysCount,
        lastActivityAt: lastActivity?.performedAt || null,
        score,
      },
    });

    updated++;
  }

  await generateAlerts();

  const allMetrics = await prisma.territoryMetric.findMany({
    orderBy: { score: "desc" },
    include: { territory: { select: { id: true, name: true, type: true } } },
  });

  const alerts = await prisma.alert.findMany({
    where: { resolvedAt: null },
    orderBy: { severity: "asc" },
    include: { territory: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: allMetrics, alerts, meta: { updated, alertsGenerated: alerts.length } });
}
