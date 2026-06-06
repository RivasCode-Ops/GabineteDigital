import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


const statusColors: Record<string, string> = {
  recebida: "bg-gray-100 text-gray-800",
  triagem: "bg-blue-100 text-blue-800",
  encaminhada: "bg-yellow-100 text-yellow-800",
  acompanhamento: "bg-indigo-100 text-indigo-800",
  resolvida: "bg-emerald-100 text-emerald-800",
  encerrada: "bg-slate-100 text-slate-800",
  arquivada: "bg-red-100 text-red-800",
};

const severityColors: Record<string, string> = {
  baixo: "bg-blue-100 text-blue-800 border-blue-200",
  medio: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alto: "bg-orange-100 text-orange-800 border-orange-200",
  critico: "bg-red-100 text-red-800 border-red-200",
};

export default async function WarRoomPage() {
  const session = await auth();
  if (!session?.user) return null;

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
        territory: { select: { id: true, name: true } },
      },
    }),
    prisma.territoryMetric.findMany({
      orderBy: { score: "desc" },
      include: { territory: { select: { id: true, name: true, type: true } } },
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
  ]);

  const avgScore = metrics.length > 0
    ? Math.round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length)
    : 0;

  const topTerritories = metrics.slice(0, 5);
  const criticalCount = metrics.filter((m) => m.score <= 40).length;
  const totalDemandCount = demandByStatus.reduce((a, d) => a + d._count.id, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">War Room</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard executivo consolidado</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {[
          { label: "Pessoas", value: totalPeople, color: "text-blue-600" },
          { label: "Demandas", value: totalDemandCount, color: "text-amber-600" },
          { label: "Atividades", value: totalActivities, color: "text-emerald-600" },
          { label: "Pesquisas", value: totalSurveys, color: "text-purple-600" },
          { label: "Eventos", value: totalEvents, color: "text-rose-600" },
          { label: "Score Médio", value: `${avgScore}`, color: avgScore > 60 ? "text-emerald-600" : "text-red-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Demandas</h2>
          <div className="space-y-3">
            {demandByStatus.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma demanda cadastrada.</p>
            )}
            {demandByStatus.map((d) => {
              const pct = totalDemandCount > 0 ? Math.round((d._count.id / totalDemandCount) * 100) : 0;
              return (
                <div key={d.status} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium w-28 text-center ${statusColors[d.status] || "bg-gray-100"}`}>
                    {d.status}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1e3a5f] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{d._count.id}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas <span className="text-sm font-normal text-gray-400">({alerts.length})</span>
          </h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum alerta ativo.</p>
            )}
            {alerts.map((a) => (
              <div key={a.id} className={`p-2 rounded border text-sm ${severityColors[a.severity]}`}>
                <p className="font-medium">{a.title}</p>
                {a.territory && <p className="text-xs opacity-75">{a.territory.name}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum evento futuro.</p>
            )}
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-2 border-b border-gray-100 last:border-0">
                <div className="text-center min-w-[40px]">
                  <p className="text-lg font-bold text-[#1e3a5f]">
                    {new Date(e.startAt).getDate()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(e.startAt).toLocaleDateString("pt-BR", { month: "short" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{e.type}</p>
                  {e.territory && <p className="text-xs text-gray-400">{e.territory.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Territórios</h2>
          <div className="space-y-2">
            {topTerritories.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum dado disponível.</p>
            )}
            {topTerritories.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <div>
                    <p className="text-sm text-gray-900">{m.territory.name}</p>
                    <p className="text-xs text-gray-400">{m.territory.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{m.score}</p>
                </div>
              </div>
            ))}
          </div>
          {criticalCount > 0 && (
            <p className="text-sm text-red-600 mt-3 font-medium">
              {criticalCount} território{criticalCount > 1 ? "s" : ""} em estado crítico
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Lideranças</h2>
          <div className="space-y-2">
            {topLeaders.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma liderança ativa.</p>
            )}
            {topLeaders.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <div>
                    <p className="text-sm text-gray-900">{l.leader.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{l.role} · {l.territory?.name ?? ""}</p>
                  </div>
                </div>
                  <span className="text-xs text-gray-500 capitalize">{l.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
