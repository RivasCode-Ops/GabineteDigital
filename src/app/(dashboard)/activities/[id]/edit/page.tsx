import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/components/activity-form";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
  });
  if (!activity) notFound();

  const [territories, people] = await Promise.all([
    prisma.territory.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
    prisma.person.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-semibold text-gray-800">Editar Atividade</h2></div>
      <div className="bg-white rounded-lg shadow max-w-2xl"><div className="p-6">
        <ActivityForm
          territories={territories}
          people={people}
          initialData={{
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            territoryId: activity.territoryId,
            peopleIds: (activity.peopleIds as string[]) || [],
            performedAt: activity.performedAt.toISOString(),
            durationMin: activity.durationMin,
            location: activity.location,
            notes: activity.notes,
            isPublic: activity.isPublic,
          }}
        />
      </div></div>
    </div>
  );
}
