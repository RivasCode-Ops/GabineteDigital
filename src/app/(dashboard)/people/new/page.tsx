import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PersonForm } from "@/components/person-form";

export default async function NewPersonPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  if (user.roleLevel < 20) redirect("/dashboard");

  const territories = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Nova Pessoa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cadastrar nova pessoa no sistema
        </p>
      </div>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6">
          <PersonForm territories={territories} />
        </div>
      </div>
    </div>
  );
}
