import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DemandForm } from "@/components/demand-form";

export default async function NewDemandPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
        <h2 className="text-2xl font-semibold text-gray-800">Nova Demanda</h2>
        <p className="text-sm text-gray-500 mt-1">Registrar nova demanda</p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <DemandForm territories={territories} people={people} users={users} />
        </div>
      </div>
    </div>
  );
}
