import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const typeLabels: Record<string, string> = {
  reuniao: "Reunião",
  evento: "Evento",
  audiencia: "Audiência",
  viagem: "Viagem",
  visita: "Visita",
  entrevista: "Entrevista",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Realizado",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = { deletedAt: null };
  if (sp.type) where.type = sp.type;
  if (sp.status) where.status = sp.status;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { startAt: "asc" },
    }),
    prisma.event.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Agenda</h2>
          <p className="text-sm text-gray-500 mt-1">{total} eventos</p>
        </div>
        <Link
          href="/agenda/new"
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800"
        >
          + Novo Evento
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
          <select name="status" defaultValue={sp.status || ""} className="px-3 py-2 border rounded-md text-sm">
            <option value="">Todos status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
            Filtrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum evento encontrado</p>
            <Link href="/agenda/new" className="text-blue-600 text-sm mt-2 inline-block">Criar primeiro evento</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Local</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Território</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/agenda/${e.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {e.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{typeLabels[e.type] || e.type}</td>
                  <td className="px-4 py-3 text-gray-600">{e.startAt.toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-gray-500">{e.location || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{e.territory?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusColors[e.status]}`}>
                      {statusLabels[e.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">
              Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
            </span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/agenda?page=${page - 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Anterior</Link>}
              {page * perPage < total && <Link href={`/agenda?page=${page + 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Próxima</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
