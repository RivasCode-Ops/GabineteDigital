import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

async function generateBackupData() {
  const [territories, people, leaderships, demands, activities, events, surveys, templates, metrics, alerts] =
    await Promise.all([
      prisma.territory.findMany({ where: { deletedAt: null } }),
      prisma.person.findMany({ where: { deletedAt: null }, include: { territory: { select: { name: true } } } }),
      prisma.leadership.findMany({
        where: { deletedAt: null },
        include: { leader: { select: { name: true } }, territory: { select: { name: true } } },
      }),
      prisma.demand.findMany({ where: { deletedAt: null }, include: { territory: { select: { name: true } } } }),
      prisma.activity.findMany({ where: { deletedAt: null }, include: { territory: { select: { name: true } } } }),
      prisma.event.findMany({ where: { deletedAt: null }, include: { territory: { select: { name: true } } } }),
      prisma.survey.findMany({ where: { deletedAt: null }, include: { territory: { select: { name: true } } } }),
      prisma.messageTemplate.findMany(),
      prisma.territoryMetric.findMany({ include: { territory: { select: { name: true } } } }),
      prisma.alert.findMany({ include: { territory: { select: { name: true } } } }),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      territories: territories.length,
      people: people.length,
      leaderships: leaderships.length,
      demands: demands.length,
      activities: activities.length,
      events: events.length,
      surveys: surveys.length,
      templates: templates.length,
    },
    data: {
      territories,
      people: people.map((p) => ({
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        territory: p.territory?.name || null, consentGiven: p.consentGiven,
        createdAt: p.createdAt,
      })),
      leaderships: leaderships.map((l) => ({
        id: l.id, leader: l.leader.name, role: l.role,
        territory: l.territory?.name || null, isActive: l.isActive,
      })),
      demands: demands.map((d) => ({
        id: d.id, title: d.title, description: d.description,
        category: d.category, status: d.status,
        territory: d.territory?.name || null,
        createdAt: d.createdAt,
      })),
      activities, events, surveys, templates, metrics, alerts,
    },
  };
}

export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 100) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const backup = await generateBackupData();

  await createAuditLog({
    userId,
    action: "BACKUP",
    entity: "backup",
    description: `Backup gerado: ${backup.stats.territories} territórios, ${backup.stats.people} pessoas, ${backup.stats.demands} demandas`,
    metadata: backup.stats as any,
  });

  return NextResponse.json({ data: backup });
}

async function restoreBackupData(backup: any) {
  const results: Record<string, number> = {};

  if (backup.data?.territories) {
    for (const t of backup.data.territories) {
      await prisma.territory.upsert({
        where: { id: t.id },
        create: t,
        update: t,
      });
    }
    results.territories = backup.data.territories.length;
  }

  return results;
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 100) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const backup = await request.json();

  if (!backup.data) {
    return NextResponse.json({ error: "Dados de backup inválidos" }, { status: 400 });
  }

  try {
    const results = await restoreBackupData(backup);

    await createAuditLog({
      userId,
      action: "RESTORE",
      entity: "backup",
      description: `Restauração de backup: ${JSON.stringify(results)}`,
      metadata: results as any,
    });

    return NextResponse.json({ data: { restored: results } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
