import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const categoryLabels: Record<string, string> = {
  lideranca: "Liderança",
  morador: "Morador",
  empresario: "Empresário",
  vereador: "Vereador",
  ex_vereador: "Ex-Vereador",
  presidente_associacao: "Pres. Associação",
  sindicato: "Sindicato",
  influenciador: "Influenciador",
  parceiro_institucional: "Parceiro Institucional",
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  const sp = await searchParams;
  const search = sp.search || "";
  const categoryFilter = sp.category || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  if (categoryFilter) where.category = categoryFilter;

  const [people, total] = await Promise.all([
    prisma.person.findMany({
      where,
      include: {
        territory: { select: { name: true, type: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.person.count({ where }),
  ]);

  const categories = await prisma.person.groupBy({
    by: ["category"],
    _count: true,
    where: { deletedAt: null },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Pessoas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {total} pessoas cadastradas
          </p>
        </div>
        {user.roleLevel >= 20 && (
          <Link
            href="/people/new"
            className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
          >
            + Nova Pessoa
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <form className="p-4 flex gap-3">
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Buscar por nome ou telefone..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            name="category"
            defaultValue={categoryFilter}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>
                {categoryLabels[c.category] || c.category} ({c._count})
              </option>
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
        {people.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma pessoa encontrada</p>
            {!search && (
              <Link
                href="/people/new"
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
              >
                Cadastrar primeira pessoa
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Telefone
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Território
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Cadastro
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/people/${person.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{person.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                      {categoryLabels[person.category] || person.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {person.territory?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {person.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/people/${person.id}`}
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
                  href={`/people?page=${page - 1}${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Anterior
                </Link>
              )}
              {page * perPage < total && (
                <Link
                  href={`/people?page=${page + 1}${search ? `&search=${search}` : ""}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
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
