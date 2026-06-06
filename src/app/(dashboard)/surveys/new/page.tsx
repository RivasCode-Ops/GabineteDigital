import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SurveyForm } from "@/components/survey-form";

export default async function NewSurveyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const territories = await prisma.territory.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-semibold text-gray-800">Nova Pesquisa de Campo</h2></div>
      <div className="bg-white rounded-lg shadow max-w-2xl"><div className="p-6">
        <SurveyForm territories={territories} />
      </div></div>
    </div>
  );
}
