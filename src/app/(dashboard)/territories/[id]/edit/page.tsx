import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { TerritoryForm } from "@/components/territory-form";

export default async function EditTerritoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 100) redirect("/dashboard");

  const territory = await prisma.territory.findFirst({
    where: { id, deletedAt: null },
  });
  if (!territory) notFound();

  const parents = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true, id: { not: id } },
    orderBy: { name: "asc" },
    include: { parent: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Editar Território
        </h2>
        <p className="text-sm text-gray-500 mt-1">{territory.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <TerritoryForm
            parents={parents}
            initialData={{
              id: territory.id,
              name: territory.name,
              type: territory.type,
              parentId: territory.parentId,
              population: territory.population,
              ibgeCode: territory.ibgeCode,
            }}
          />
        </div>
      </div>
    </div>
  );
}
