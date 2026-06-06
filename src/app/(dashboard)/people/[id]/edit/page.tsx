import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { PersonForm } from "@/components/person-form";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 20) redirect("/dashboard");

  const person = await prisma.person.findFirst({
    where: { id, deletedAt: null },
  });
  if (!person) notFound();

  const territories = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Editar Pessoa</h2>
        <p className="text-sm text-gray-500 mt-1">{person.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <PersonForm
            territories={territories}
            initialData={{
              id: person.id,
              name: person.name,
              phone: person.phone,
              email: person.email,
              category: person.category,
              territoryId: person.territoryId,
              contactOrigin: person.contactOrigin,
              notes: person.notes,
            }}
          />
        </div>
      </div>
    </div>
  );
}
