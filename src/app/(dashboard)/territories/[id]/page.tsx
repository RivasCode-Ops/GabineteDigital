import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

const typeLabels: Record<string, string> = {
  state: "Estado",
  region: "Região",
  city: "Município",
  neighborhood: "Bairro",
  community: "Comunidade",
};

export default async function TerritoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };

  const territory = await prisma.territory.findFirst({
    where: { id, deletedAt: null },
    include: {
      parent: true,
      children: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
      _count: { select: { children: true, people: true, demands: true } },
    },
  });

  if (!territory) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/territories" className="hover:text-blue-600">
            Territórios
          </Link>
          <span>/</span>
          <span className="text-gray-900">{territory.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {territory.name}
            </h2>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
              {typeLabels[territory.type] || territory.type}
            </span>
          </div>

          {user.roleLevel >= 100 && (
            <Link
              href={`/territories/${id}/edit`}
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
              Informações
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Slug</dt>
                <dd className="text-gray-900 font-medium">{territory.slug}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tipo</dt>
                <dd className="text-gray-900 font-medium">
                  {typeLabels[territory.type] || territory.type}
                </dd>
              </div>
              {territory.parent && (
                <div>
                  <dt className="text-gray-500">Pai</dt>
                  <dd className="text-gray-900 font-medium">
                    <Link
                      href={`/territories/${territory.parent.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {territory.parent.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">População</dt>
                <dd className="text-gray-900 font-medium">
                  {territory.population?.toLocaleString("pt-BR") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Código IBGE</dt>
                <dd className="text-gray-900 font-medium">
                  {territory.ibgeCode || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Criado em</dt>
                <dd className="text-gray-900 font-medium">
                  {territory.createdAt.toLocaleDateString("pt-BR")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Territórios filhos ({territory._count.children})
            </h3>
            {territory.children.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum filho cadastrado</p>
            ) : (
              <ul className="space-y-1">
                {territory.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/territories/${child.id}`}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-50 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <span className="text-xs text-gray-400 uppercase w-20">
                        {typeLabels[child.type] || child.type}
                      </span>
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Estatísticas
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {territory._count.children}
                </p>
                <p className="text-xs text-gray-500">Filhos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {territory._count.people}
                </p>
                <p className="text-xs text-gray-500">Pessoas vinculadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {territory._count.demands}
                </p>
                <p className="text-xs text-gray-500">Demandas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
