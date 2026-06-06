import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LeadershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where = { deletedAt: null };

  const [leaderships, total] = await Promise.all([
    prisma.leadership.findMany({
      where,
      include: {
        leader: { select: { id: true, name: true, phone: true, category: true } },
        superior: { select: { id: true, name: true } },
        territory: { select: { id: true, name: true, type: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { startDate: "desc" },
    }),
    prisma.leadership.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Lideranças</h2>
          <p className="text-sm text-gray-500 mt-1">
            {total} lideranças cadastradas
          </p>
        </div>
        {user.roleLevel >= 40 && (
          <Link
            href="/leaderships/new"
            className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
          >
            + Nova Liderança
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {leaderships.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma liderança cadastrada</p>
            {user.roleLevel >= 40 && (
              <Link
                href="/leaderships/new"
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
              >
                Cadastrar primeira liderança
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Liderança
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Função
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Superior
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Território
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Início
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaderships.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/leaderships/${l.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {l.leader.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{l.role}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {l.superior?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {l.territory?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {l.startDate.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        l.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {l.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/leaderships/${l.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">
              Mostrando {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, total)} de {total}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/leaderships?page=${page - 1}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Anterior
                </Link>
              )}
              {page * perPage < total && (
                <Link
                  href={`/leaderships?page=${page + 1}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Próxima
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
