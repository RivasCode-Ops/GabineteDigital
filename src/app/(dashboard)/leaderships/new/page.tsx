import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadershipForm } from "@/components/leadership-form";

export default async function NewLeadershipPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 40) redirect("/dashboard");

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
          Nova Liderança
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Vincular liderança à rede hierárquica
        </p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <LeadershipForm people={people} territories={territories} />
        </div>
      </div>
    </div>
  );
}
