import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider, generateDiagnostic } from "@/lib/ai";


const typeColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-orange-100 text-orange-800 border-orange-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const typeIcons: Record<string, string> = {
  critical: "🔴",
  warning: "🟡",
  info: "🔵",
  positive: "🟢",
};

export default async function AiPage() {
  const session = await auth();
  if (!session?.user) return null;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inteligência Artificial</h1>
          <p className="text-sm text-gray-500 mt-1">
            Assistente operacional · Baseado em dados reais · {insights.length} insights gerados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Score Médio</p>
          <p className={`text-2xl font-bold mt-1 ${avgScore > 60 ? "text-emerald-600" : "text-red-600"}`}>
            {avgScore}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Territórios Críticos</p>
          <p className={`text-2xl font-bold mt-1 ${criticalTerritories > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {criticalTerritories}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights ({insights.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border ${typeColors[insight.type]}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">{typeIcons[insight.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs mt-0.5 opacity-75">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wide opacity-60">{insight.category}</span>
                      {insight.relatedTerritory && (
                        <span className="text-[10px] opacity-60">· {insight.relatedTerritory}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnósticos Críticos</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {diagnostics.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum território em estado crítico.</p>
            )}
            {diagnostics.map((d) => (
              <div key={d.territory} className="p-3 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{d.territory}</p>
                  <span className="text-xs font-bold text-red-600">{d.score}</span>
                </div>
                {d.weaknesses.length > 0 && (
                  <ul className="text-xs text-red-700 space-y-0.5 mb-2">
                    {d.weaknesses.map((w, i) => (
                      <li key={i}>→ {w}</li>
                    ))}
                  </ul>
                )}
                <p className="text-[11px] font-medium text-gray-700 mt-2">Recomendações:</p>
                <ul className="text-[11px] text-gray-600 space-y-0.5">
                  {d.recommendations.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
