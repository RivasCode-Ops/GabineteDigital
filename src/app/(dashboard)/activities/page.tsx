import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const typeLabels: Record<string, string> = {
  visita: "Visita",
  reuniao: "Reunião",
  evento: "Evento",
  ligacao: "Ligação",
  atendimento: "Atendimento",
};

const typeColors: Record<string, string> = {
  visita: "bg-blue-100 text-blue-800",
  reuniao: "bg-purple-100 text-purple-800",
  evento: "bg-green-100 text-green-800",
  ligacao: "bg-yellow-100 text-yellow-800",
  atendimento: "bg-orange-100 text-orange-800",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = { deletedAt: null };
  if (sp.type) where.type = sp.type;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true } },
        performer: { select: { id: true, name: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { performedAt: "desc" },
    }),
    prisma.activity.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Atividades</h2>
          <p className="text-sm text-gray-500 mt-1">{total} atividades</p>
        </div>
        <Link href="/activities/new" className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800">
          + Nova Atividade
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <form className="p-4 flex gap-3">
          <select name="type" defaultValue={sp.type || ""} className="px-3 py-2 border rounded-md text-sm">
            <option value="">Todos tipos</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">Filtrar</button>
        </form>
      </div>

      <div className="grid gap-4">
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12 text-gray-500">
            <p>Nenhuma atividade encontrada</p>
            <Link href="/activities/new" className="text-blue-600 text-sm mt-2 inline-block">Registrar primeira atividade</Link>
          </div>
        ) : (
          activities.map((a) => (
            <Link key={a.id} href={`/activities/${a.id}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${typeColors[a.type]}`}>
                      {typeLabels[a.type]}
                    </span>
                    {a.isPublic && <span className="text-xs text-gray-400">Público</span>}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{a.title}</h3>
                  {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                </div>
                <div className="text-right text-xs text-gray-400 shrink-0 ml-4">
                  <p>{a.performedAt.toLocaleDateString("pt-BR")}</p>
                  {a.durationMin && <p>{a.durationMin}min</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {a.performer && <span>{a.performer.name}</span>}
                {a.territory && <span>{a.territory.name}</span>}
                {a.location && <span>{a.location}</span>}
              </div>
            </Link>
          ))
        )}
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white rounded-lg shadow">
          <span className="text-sm text-gray-500">{(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/activities?page=${page - 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Anterior</Link>}
            {page * perPage < total && <Link href={`/activities?page=${page + 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Próxima</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
