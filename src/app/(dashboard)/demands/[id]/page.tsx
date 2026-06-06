import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

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
  encerrada: "bg-gray-100 text-gray-600",
  arquivada: "bg-gray-100 text-gray-600",
};

const categoryLabels: Record<string, string> = {
  saude: "Saúde", educacao: "Educação", infraestrutura: "Infraestrutura",
  transporte: "Transporte", agricultura: "Agricultura",
  assistencia_social: "Assistência Social",
  regularizacao_fundiaria: "Regularização Fundiária", outro: "Outro",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente",
};

const validTransitions: Record<string, string[]> = {
  recebida: ["triagem", "arquivada"],
  triagem: ["encaminhada", "arquivada"],
  encaminhada: ["acompanhamento", "arquivada"],
  acompanhamento: ["resolvida", "arquivada"],
  resolvida: ["encerrada"],
  encerrada: [],
  arquivada: [],
};

export default async function DemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number; id: string };

  const demand = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      requester: true,
      assignee: { select: { id: true, name: true, email: true } },
      assigner: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
      history: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!demand) notFound();

  const allowedNext = validTransitions[demand.status] || [];
  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/demands" className="hover:text-blue-600">Demandas</Link>
          <span>/</span>
          <span className="text-gray-900">{demand.title}</span>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">{demand.title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusColors[demand.status]}`}>
            {statusLabels[demand.status] || demand.status}
          </span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">{categoryLabels[demand.category] || demand.category}</span>
          <span className="text-xs text-gray-400">|</span>
          <span className={`text-xs font-medium ${demand.priority === "urgente" ? "text-red-600" : "text-gray-500"}`}>
            {priorityLabels[demand.priority]} {demand.priority === "urgente" ? "🔴" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes</h3>
            {demand.description && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{demand.description}</p>
            )}
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Território</dt>
                <dd>{demand.territory?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Requerente</dt>
                <dd>{demand.requester?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Responsável</dt>
                <dd>{demand.assignee?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Criado por</dt>
                <dd>{demand.creator?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Criado em</dt>
                <dd>{demand.createdAt.toLocaleDateString("pt-BR")}</dd>
              </div>
              {demand.resolvedAt && (
                <div>
                  <dt className="text-gray-500">Resolvido em</dt>
                  <dd>{demand.resolvedAt.toLocaleDateString("pt-BR")}</dd>
                </div>
              )}
            </dl>
          </div>

          {demand.history.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico</h3>
              <div className="space-y-2">
                {demand.history.map((h) => (
                  <div key={h.id} className="text-sm flex items-start gap-2 py-1">
                    <span className="text-gray-400 w-20 shrink-0">
                      {h.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-gray-500">{h.field}:</span>
                    <span className="text-gray-400 line-through">{h.oldValue || "—"}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-900 font-medium">{h.newValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {allowedNext.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Avançar Status
              </h3>
              <div className="space-y-2">
                {allowedNext.map((nextStatus) => (
                  <form
                    key={nextStatus}
                    action={`/api/v1/demands/${id}/status`}
                    method="POST"
                    className="space-y-2"
                  >
                    {(nextStatus === "encaminhada") && (
                      <select
                        name="assignedTo"
                        className="w-full px-2 py-1.5 border rounded text-sm"
                        required
                      >
                        <option value="">Selecionar responsável...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="submit"
                      name="status"
                      value={nextStatus}
                      className="w-full px-3 py-2 text-sm rounded-md bg-blue-700 text-white hover:bg-blue-800"
                    >
                      Mover para {statusLabels[nextStatus]}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          )}

          {user.roleLevel >= 10 && (
            <Link
              href={`/demands/${id}/edit`}
              className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
            >
              Editar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
