import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const sentimentLabels: Record<string, string> = {
  muito_favoravel: "Muito Favorável",
  favoravel: "Favorável",
  neutro: "Neutro",
  resistente: "Resistente",
  muito_resistente: "Muito Resistente",
};

const sentimentColors: Record<string, string> = {
  muito_favoravel: "bg-green-100 text-green-800",
  favoravel: "bg-blue-100 text-blue-800",
  neutro: "bg-gray-100 text-gray-800",
  resistente: "bg-yellow-100 text-yellow-800",
  muito_resistente: "bg-red-100 text-red-800",
};

export default async function SurveysPage({
  searchParams,
}: {
  searchParams: Promise<{ sentiment?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = { deletedAt: null };
  if (sp.sentiment) where.sentiment = sp.sentiment;

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true } },
        collector: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { collectedAt: "desc" },
    }),
    prisma.survey.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Pesquisas de Campo</h2>
          <p className="text-sm text-gray-500 mt-1">{total} pesquisas</p>
        </div>
        <Link href="/surveys/new" className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800">
          + Nova Pesquisa
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <form className="p-4 flex gap-3">
          <select name="sentiment" defaultValue={sp.sentiment || ""} className="px-3 py-2 border rounded-md text-sm">
            <option value="">Todos sentimentos</option>
            {Object.entries(sentimentLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">Filtrar</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {surveys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma pesquisa encontrada</p>
            <Link href="/surveys/new" className="text-blue-600 text-sm mt-2 inline-block">Realizar primeira pesquisa</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sentimento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Território</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Coletor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Perguntas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {surveys.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/surveys/${s.id}`} className="text-blue-600 hover:text-blue-800 font-medium">{s.title}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${sentimentColors[s.sentiment]}`}>
                      {sentimentLabels[s.sentiment]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.territory?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.collector?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.collectedAt.toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-gray-500">{s._count.questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">{(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/surveys?page=${page - 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Anterior</Link>}
              {page * perPage < total && <Link href={`/surveys?page=${page + 1}`} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Próxima</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
