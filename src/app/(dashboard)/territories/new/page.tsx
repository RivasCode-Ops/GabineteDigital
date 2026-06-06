import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TerritoryForm } from "@/components/territory-form";

export default async function NewTerritoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 100) redirect("/dashboard");

  const parents = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
    include: {
      parent: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Novo Território</h2>
        <p className="text-sm text-gray-500 mt-1">Cadastrar novo território na hierarquia</p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <TerritoryForm parents={parents} />
        </div>
      </div>
    </div>
  );
}
