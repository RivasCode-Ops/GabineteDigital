import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  visita: "Visita", reuniao: "Reunião", evento: "Evento",
  ligacao: "Ligação", atendimento: "Atendimento",
};

const typeColors: Record<string, string> = {
  visita: "bg-blue-100 text-blue-800", reuniao: "bg-purple-100 text-purple-800",
  evento: "bg-green-100 text-green-800", ligacao: "bg-yellow-100 text-yellow-800",
  atendimento: "bg-orange-100 text-orange-800",
};

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
    include: { territory: true, performer: { select: { id: true, name: true } } },
  });

  if (!activity) notFound();

  const linkedPeople = Array.isArray(activity.peopleIds) && activity.peopleIds.length > 0
    ? await prisma.person.findMany({
        where: { id: { in: activity.peopleIds as string[] } },
        select: { id: true, name: true },
      })
    : [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/activities" className="hover:text-blue-600">Atividades</Link>
          <span>/</span><span className="text-gray-900">{activity.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{activity.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-2 py-0.5 text-xs rounded ${typeColors[activity.type]}`}>
                {typeLabels[activity.type]}
              </span>
              {activity.isPublic && <span className="text-xs text-gray-400">Pública</span>}
            </div>
          </div>
          <Link href={`/activities/${id}/edit`} className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800">
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {activity.description && <p className="text-sm text-gray-700 mb-4">{activity.description}</p>}
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Data</dt><dd>{activity.performedAt.toLocaleString("pt-BR")}</dd></div>
          <div><dt className="text-gray-500">Duração</dt><dd>{activity.durationMin ? `${activity.durationMin} min` : "—"}</dd></div>
          <div><dt className="text-gray-500">Realizado por</dt><dd>{activity.performer?.name || "—"}</dd></div>
          <div><dt className="text-gray-500">Território</dt><dd>{activity.territory?.name || "—"}</dd></div>
          <div><dt className="text-gray-500">Local</dt><dd>{activity.location || "—"}</dd></div>
          <div><dt className="text-gray-500">Público</dt><dd>{activity.isPublic ? "Sim" : "Não"}</dd></div>
        </dl>

        {activity.notes && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Observações</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.notes}</p>
          </div>
        )}

        {linkedPeople.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Pessoas envolvidas ({linkedPeople.length})</h4>
            <div className="space-y-1">
              {linkedPeople.map((p) => (
                <Link key={p.id} href={`/people/${p.id}`} className="block text-sm text-blue-600 hover:text-blue-800">{p.name}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
