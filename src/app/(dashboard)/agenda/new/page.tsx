import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/event-form";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
        <h2 className="text-2xl font-semibold text-gray-800">Novo Evento</h2>
      </div>
      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <EventForm territories={territories} people={people} />
        </div>
      </div>
    </div>
  );
}
