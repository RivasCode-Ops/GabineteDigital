import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  reuniao: "Reunião", evento: "Evento", audiencia: "Audiência",
  viagem: "Viagem", visita: "Visita", entrevista: "Entrevista",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado", confirmed: "Confirmado", cancelled: "Cancelado", completed: "Realizado",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-100 text-yellow-800", confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800", completed: "bg-green-100 text-green-800",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      territory: true,
      creator: { select: { id: true, name: true } },
      participants: {
        include: { person: { select: { id: true, name: true, phone: true } } },
      },
    },
  });

  if (!event) notFound();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/agenda" className="hover:text-blue-600">Agenda</Link>
          <span>/</span>
          <span className="text-gray-900">{event.title}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{event.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">{typeLabels[event.type]}</span>
              <span className="text-xs text-gray-400">|</span>
              <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusColors[event.status]}`}>
                {statusLabels[event.status]}
              </span>
              {event.color && (
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: event.color }} />
              )}
            </div>
          </div>
          <Link href={`/agenda/${id}/edit`} className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800">
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes</h3>
            {event.description && <p className="text-sm text-gray-700 mb-4">{event.description}</p>}
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Início</dt>
                <dd>{event.startAt.toLocaleString("pt-BR")}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Término</dt>
                <dd>{event.endAt.toLocaleString("pt-BR")}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Dia inteiro</dt>
                <dd>{event.allDay ? "Sim" : "Não"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Local</dt>
                <dd>{event.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Território</dt>
                <dd>{event.territory?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Criado por</dt>
                <dd>{event.creator?.name || "—"}</dd>
              </div>
            </dl>
          </div>

          {event.participants.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participantes ({event.participants.length})</h3>
              <div className="space-y-2">
                {event.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-1">
                    <Link href={`/people/${p.person.id}`} className="text-blue-600 hover:text-blue-800">
                      {p.person.name}
                    </Link>
                    <span className="text-gray-400">{p.person.phone || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
