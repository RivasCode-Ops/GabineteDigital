import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusLabels: Record<string, string> = {
  recebida: "Recebida",
  triagem: "Triagem",
  encaminhada: "Encaminhada",
  acompanhamento: "Acompanhamento",
  resolvida: "Resolvida",
  encerrada: "Encerrada",
  arquivada: "Arquivada",
};

const statusColors: Record<string, string> = {
  recebida: "bg-gray-100 text-gray-800",
  triagem: "bg-yellow-100 text-yellow-800",
  encaminhada: "bg-blue-100 text-blue-800",
  acompanhamento: "bg-purple-100 text-purple-800",
  resolvida: "bg-green-100 text-green-800",
  encerrada: "bg-green-100 text-green-800",
  arquivada: "bg-gray-100 text-gray-600",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const categoryLabels: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  infraestrutura: "Infraestrutura",
  transporte: "Transporte",
  agricultura: "Agricultura",
  assistencia_social: "Assistência Social",
  regularizacao_fundiaria: "Regularização Fundiária",
  outro: "Outro",
};

export default async function DemandsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = { deletedAt: null };
  if (sp.status) where.status = sp.status;
  if (sp.category) where.category = sp.category;
  if (sp.priority) where.priority = sp.priority;
  if (sp.search) where.title = { contains: sp.search, mode: "insensitive" };

  const [demands, total] = await Promise.all([
    prisma.demand.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.demand.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Demandas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {total} demandas cadastradas
          </p>
        </div>
        <Link
          href="/demands/new"
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
        >
          + Nova Demanda
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <form className="p-4 flex gap-3 flex-wrap">
          <input
            name="search"
            type="text"
            defaultValue={sp.search || ""}
            placeholder="Buscar por título..."
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            name="status"
            defaultValue={sp.status || ""}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            name="category"
            defaultValue={sp.category || ""}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todas categorias</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {demands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma demanda encontrada</p>
            <Link
              href="/demands/new"
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              Abrir primeira demanda
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Território</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsável</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {demands.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/demands/${d.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {categoryLabels[d.category] || d.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusColors[d.status]}`}>
                      {statusLabels[d.status] || d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${d.priority === "urgente" ? "text-red-600" : d.priority === "alta" ? "text-orange-600" : "text-gray-600"}`}>
                      {priorityLabels[d.priority] || d.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.territory?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.assignee?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.createdAt.toLocaleDateString("pt-BR")}
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
              {page > 1 && (
                <Link href={`/demands?page=${page - 1}&search=${sp.search || ""}&status=${sp.status || ""}&category=${sp.category || ""}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Anterior</Link>
              )}
              {page * perPage < total && (
                <Link href={`/demands?page=${page + 1}&search=${sp.search || ""}&status=${sp.status || ""}&category=${sp.category || ""}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Próxima</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
