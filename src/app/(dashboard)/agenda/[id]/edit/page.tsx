import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: { participants: true },
  });
  if (!event) notFound();

  const [territories, people] = await Promise.all([
    prisma.territory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.person.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Editar Evento</h2>
        <p className="text-sm text-gray-500 mt-1">{event.title}</p>
      </div>
      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <EventForm
            territories={territories}
            people={people}
            initialData={{
              id: event.id,
              title: event.title,
              description: event.description,
              type: event.type,
              territoryId: event.territoryId,
              startAt: event.startAt.toISOString(),
              endAt: event.endAt.toISOString(),
              allDay: event.allDay,
              location: event.location,
              address: event.address,
              status: event.status,
              color: event.color,
              participantIds: event.participants.map((p) => p.personId),
            }}
          />
        </div>
      </div>
    </div>
  );
}
