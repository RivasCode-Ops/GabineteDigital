import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).roleLevel < 80) redirect("/dashboard");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalViews, viewsWeek, clicksWeek, sessions, topPages, dailyViews] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: weekAgo }, action: "click" } }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo }, sessionId: { not: null } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["page"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: weekAgo }, action: "view" },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    byDay.set(d.toLocaleDateString("pt-BR", { weekday: "short" }), 0);
  }
  for (const entry of dailyViews) {
    const day = entry.createdAt.toLocaleDateString("pt-BR", { weekday: "short" });
    byDay.set(day, (byDay.get(day) || 0) + entry._count.id);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics</h1>
      <p className="text-gray-500 mb-6">Métricas de uso do sistema (7 dias)</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total de eventos" value={totalViews} />
        <MetricCard label="Eventos na semana" value={viewsWeek} />
        <MetricCard label="Cliques" value={clicksWeek} />
        <MetricCard label="Sessões" value={sessions.length} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Visualizações por dia</h2>
          <div className="space-y-2">
            {Array.from(byDay.entries()).map(([day, views]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12">{day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-[#1e3a5f] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (views / Math.max(...byDay.values(), 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8 text-right">{views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Páginas mais acessadas</h2>
          <div className="space-y-2">
            {topPages.map((p) => (
              <div key={p.page} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 flex-1 truncate">{p.page || "/"}</span>
                <span className="text-xs font-medium text-gray-700">{p._count.id}</span>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum dado nesta semana</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <strong>Privacidade:</strong> Nenhum dado pessoal é armazenado. Apenas página acessada, ação e sessão anônima.
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
