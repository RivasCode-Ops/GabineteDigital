import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function LeadershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };

  const leadership = await prisma.leadership.findFirst({
    where: { id, deletedAt: null },
    include: {
      leader: {
        include: { territory: { select: { id: true, name: true } } },
      },
      superior: { select: { id: true, name: true, phone: true } },
      territory: true,
    },
  });

  if (!leadership) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/leaderships" className="hover:text-blue-600">
            Lideranças
          </Link>
          <span>/</span>
          <span className="text-gray-900">{leadership.leader.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {leadership.leader.name}
            </h2>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
              {leadership.role}
            </span>
            <span
              className={`inline-block mt-1 ml-2 px-2 py-0.5 text-xs rounded ${
                leadership.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {leadership.isActive ? "Ativo" : "Inativo"}
            </span>
            {leadership.isCoordinator && (
              <span className="inline-block mt-1 ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                Coordenador
              </span>
            )}
          </div>

          {user.roleLevel >= 40 && (
            <Link
              href={`/leaderships/${id}/edit`}
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
              Informações da Liderança
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <dt className="text-gray-500">Liderança</dt>
                <dd className="text-gray-900 font-medium">
                  <Link
                    href={`/people/${leadership.leader.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {leadership.leader.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Função</dt>
                <dd className="text-gray-900 font-medium">{leadership.role}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Coordenador</dt>
                <dd className="text-gray-900 font-medium">
                  {leadership.isCoordinator ? "Sim" : "Não"}
                </dd>
              </div>
              {leadership.superior && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Superior hierárquico</dt>
                  <dd className="text-gray-900 font-medium">
                    <Link
                      href={`/people/${leadership.superior.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {leadership.superior.name}
                    </Link>
                  </dd>
                </div>
              )}
              {leadership.territory && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Território de atuação</dt>
                  <dd className="text-gray-900 font-medium">
                    <Link
                      href={`/territories/${leadership.territory.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {leadership.territory.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Data de início</dt>
                <dd className="text-gray-900 font-medium">
                  {leadership.startDate.toLocaleDateString("pt-BR")}
                </dd>
              </div>
              {leadership.endDate && (
                <div>
                  <dt className="text-gray-500">Data de fim</dt>
                  <dd className="text-gray-900 font-medium">
                    {leadership.endDate.toLocaleDateString("pt-BR")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
