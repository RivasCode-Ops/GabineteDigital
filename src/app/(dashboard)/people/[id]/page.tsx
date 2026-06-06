import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  lideranca: "Liderança",
  morador: "Morador",
  empresario: "Empresário",
  vereador: "Vereador",
  ex_vereador: "Ex-Vereador",
  presidente_associacao: "Presidente de Associação",
  sindicato: "Sindicato",
  influenciador: "Influenciador",
  parceiro_institucional: "Parceiro Institucional",
};

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };

  const person = await prisma.person.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      _count: { select: { demands: true, leaderships: true } },
    },
  });

  if (!person) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/people" className="hover:text-blue-600">
            Pessoas
          </Link>
          <span>/</span>
          <span className="text-gray-900">{person.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {person.name}
            </h2>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 rounded">
              {categoryLabels[person.category] || person.category}
            </span>
          </div>

          {user.roleLevel >= 20 && (
            <Link
              href={`/people/${id}/edit`}
              className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
            >
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Dados da Pessoa
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Telefone</dt>
                <dd className="text-gray-900 font-medium">{person.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">E-mail</dt>
                <dd className="text-gray-900 font-medium">
                  {person.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Categoria</dt>
                <dd className="text-gray-900 font-medium">
                  {categoryLabels[person.category] || person.category}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Território</dt>
                <dd className="text-gray-900 font-medium">
                  {person.territory ? (
                    <Link
                      href={`/territories/${person.territory.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {person.territory.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Origem do contato</dt>
                <dd className="text-gray-900 font-medium">
                  {person.contactOrigin || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Cadastrado em</dt>
                <dd className="text-gray-900 font-medium">
                  {person.createdAt.toLocaleDateString("pt-BR")}
                </dd>
              </div>
            </dl>
          </div>

          {person.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Observações
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {person.notes}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Estatísticas
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {person._count.demands}
                </p>
                <p className="text-xs text-gray-500">Demandas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {person._count.leaderships}
                </p>
                <p className="text-xs text-gray-500">Lideranças</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              LGPD
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${person.consentGiven ? "bg-green-500" : "bg-red-500"}`}
                />
                <span>
                  {person.consentGiven
                    ? "Consentimento registrado"
                    : "Sem consentimento"}
                </span>
              </div>
              {person.consentAt && (
                <p className="text-xs text-gray-500">
                  Em: {person.consentAt.toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
