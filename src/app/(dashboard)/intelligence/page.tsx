import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RefreshButton } from "./refresh-button";

const severityColors: Record<string, string> = {
  baixo: "bg-blue-100 text-blue-800",
  medio: "bg-yellow-100 text-yellow-800",
  alto: "bg-orange-100 text-orange-800",
  critico: "bg-red-100 text-red-800",
};

function scoreClass(score: number) {
  if (score <= 20) return "text-red-600";
  if (score <= 40) return "text-orange-600";
  if (score <= 60) return "text-yellow-600";
  if (score <= 80) return "text-lime-600";
  return "text-emerald-600";
}

function scoreBg(score: number) {
  if (score <= 20) return "bg-red-50 border-red-200";
  if (score <= 40) return "bg-orange-50 border-orange-200";
  if (score <= 60) return "bg-yellow-50 border-yellow-200";
  if (score <= 80) return "bg-lime-50 border-lime-200";
  return "bg-emerald-50 border-emerald-200";
}

function scoreLabel(score: number) {
  if (score <= 20) return "Crítico";
  if (score <= 40) return "Fraco";
  if (score <= 60) return "Regular";
  if (score <= 80) return "Forte";
  return "Estratégico";
}

export default async function IntelligencePage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as { roleLevel: number };
  const canRefresh = user.roleLevel >= 80;

  const [metrics, alerts, totalPeople, totalDemands, totalActivities, totalSurveys] =
    await Promise.all([
      prisma.territoryMetric.findMany({
        orderBy: { score: "desc" },
        include: {
          territory: { select: { id: true, name: true, type: true, slug: true } },
        },
      }),
      prisma.alert.findMany({
        where: { resolvedAt: null },
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        take: 20,
        include: { territory: { select: { id: true, name: true } } },
      }),
      prisma.person.count({ where: { deletedAt: null } }),
      prisma.demand.count({ where: { deletedAt: null } }),
      prisma.activity.count({ where: { deletedAt: null } }),
      prisma.survey.count({ where: { deletedAt: null } }),
    ]);

  const avgScore =
    metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length)
      : 0;

  const topTerritories = metrics.slice(0, 5);
  const criticalTerritories = metrics.filter((m) => m.score <= 40).slice(0, 10);

  const topDemands = await prisma.demand.groupBy({
    by: ["category"],
    _count: { id: true },
    where: { deletedAt: null },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inteligência Territorial</h1>
          <p className="text-sm text-gray-500 mt-1">
            Score médio: <span className={`font-semibold ${scoreClass(avgScore)}`}>{avgScore}</span> — {metrics.length} territórios avaliados
          </p>
        </div>
        {canRefresh && <RefreshButton />}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pessoas</p>
          <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Demandas</p>
          <p className="text-2xl font-bold text-gray-900">{totalDemands}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Atividades</p>
          <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pesquisas</p>
          <p className="text-2xl font-bold text-gray-900">{totalSurveys}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Territórios</h2>
          <div className="space-y-2">
            {topTerritories.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum território avaliado ainda.</p>
            )}
            {topTerritories.map((m, i) => (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg border ${scoreBg(m.score)}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.territory.name}</p>
                    <p className="text-xs text-gray-500">{m.territory.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${scoreClass(m.score)}`}>{m.score}</p>
                  <p className="text-xs text-gray-500">{scoreLabel(m.score)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Territórios Críticos</h2>
          <div className="space-y-2">
            {criticalTerritories.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum território em estado crítico.</p>
            )}
            {criticalTerritories.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-red-50 border-red-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.territory.name}</p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {m.activitiesCount === 0 && <li className="text-red-600">Sem visitas</li>}
                    {m.surveysCount === 0 && <li className="text-red-600">Sem pesquisas</li>}
                    {m.leadersCount === 0 && <li className="text-red-600">Sem lideranças</li>}
                    {m.openDemands > 5 && <li className="text-orange-600">{m.openDemands} demandas abertas</li>}
                  </ul>
                </div>
                <p className={`text-lg font-bold ${scoreClass(m.score)}`}>{m.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Principais Demandas</h2>
          <div className="space-y-2">
            {topDemands.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma demanda registrada.</p>
            )}
            {topDemands.map((d) => (
              <div key={d.category} className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-700 capitalize">{d.category}</span>
                <span className="text-sm font-semibold text-gray-900">{d._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas ({alerts.length})
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum alerta ativo.</p>
            )}
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[a.severity]}`}>
                  {a.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                  {a.territory && (
                    <p className="text-xs text-gray-400 mt-1">{a.territory.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
