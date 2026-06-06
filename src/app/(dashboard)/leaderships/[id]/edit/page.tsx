import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { LeadershipForm } from "@/components/leadership-form";

export default async function EditLeadershipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 40) redirect("/dashboard");

  const leadership = await prisma.leadership.findFirst({
    where: { id, deletedAt: null },
  });
  if (!leadership) notFound();

  const [people, territories] = await Promise.all([
    prisma.person.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    }),
    prisma.territory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Editar Liderança
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {leadership.leaderId}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <LeadershipForm
            people={people}
            territories={territories}
            initialData={{
              id: leadership.id,
              leaderId: leadership.leaderId,
              superiorId: leadership.superiorId,
              role: leadership.role,
              territoryId: leadership.territoryId,
              isCoordinator: leadership.isCoordinator,
              startDate: leadership.startDate.toISOString(),
              endDate: leadership.endDate?.toISOString() || null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
