import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { DemandForm } from "@/components/demand-form";

export default async function EditDemandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const demand = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
  });
  if (!demand) notFound();

  const [territories, people, users] = await Promise.all([
    prisma.territory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.person.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Editar Demanda</h2>
        <p className="text-sm text-gray-500 mt-1">{demand.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <DemandForm
            territories={territories}
            people={people}
            users={users}
            initialData={{
              id: demand.id,
              title: demand.title,
              description: demand.description,
              category: demand.category,
              priority: demand.priority,
              territoryId: demand.territoryId,
              requesterId: demand.requesterId,
              assignedTo: demand.assignedTo,
            }}
          />
        </div>
      </div>
    </div>
  );
}
