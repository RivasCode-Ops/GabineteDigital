import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

const sentimentLabels: Record<string, string> = {
  muito_favoravel: "Muito Favorável", favoravel: "Favorável",
  neutro: "Neutro", resistente: "Resistente", muito_resistente: "Muito Resistente",
};

const sentimentColors: Record<string, string> = {
  muito_favoravel: "bg-green-100 text-green-800", favoravel: "bg-blue-100 text-blue-800",
  neutro: "bg-gray-100 text-gray-800", resistente: "bg-yellow-100 text-yellow-800",
  muito_resistente: "bg-red-100 text-red-800",
};

const answerTypeLabels: Record<string, string> = {
  text: "Texto", number: "Número", multiple_choice: "Múltipla Escolha", scale: "Escala",
};

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const survey = await prisma.survey.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      collector: { select: { id: true, name: true } },
      questions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!survey) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/surveys" className="hover:text-blue-600">Pesquisas</Link>
          <span>/</span><span className="text-gray-900">{survey.title}</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{survey.title}</h2>
        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${sentimentColors[survey.sentiment]}`}>
          {sentimentLabels[survey.sentiment]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Coletado por</dt><dd>{survey.collector?.name || "—"}</dd></div>
              <div><dt className="text-gray-500">Data da coleta</dt><dd>{survey.collectedAt.toLocaleString("pt-BR")}</dd></div>
              <div><dt className="text-gray-500">Território</dt><dd>{survey.territory?.name || "—"}</dd></div>
              <div><dt className="text-gray-500">Sentimento</dt><dd>{sentimentLabels[survey.sentiment]}</dd></div>
            </dl>
          </div>

          {survey.questions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Perguntas ({survey.questions.length})</h3>
              <div className="space-y-3">
                {survey.questions.map((q, i) => (
                  <div key={q.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>#{i + 1}</span>
                      <span>{answerTypeLabels[q.answerType]}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{q.question}</p>
                    {q.answer && <p className="text-sm text-gray-600 mt-1">Resposta: {q.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Problemas</h3>
            {Array.isArray(survey.problems) && survey.problems.length > 0 ? (
              <ul className="text-sm space-y-1">
                {(survey.problems as string[]).map((p, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" />{p}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-400">Nenhum</p>}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Prioridades</h3>
            {Array.isArray(survey.priorities) && survey.priorities.length > 0 ? (
              <ul className="text-sm space-y-1">
                {(survey.priorities as string[]).map((p, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />{p}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-400">Nenhuma</p>}
          </div>

          {survey.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Observações</h3>
              <p className="text-sm text-gray-700">{survey.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
