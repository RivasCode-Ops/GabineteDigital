import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as { roleLevel: number };
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates de Mensagem</h1>
          <p className="text-sm text-gray-500 mt-1">Modelos para e-mail, WhatsApp e SMS</p>
        </div>
        {user.roleLevel >= 80 && (
          <Link
            href="/templates/new"
            className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162d4a]"
          >
            Novo Template
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {templates.length === 0 && (
          <p className="text-sm text-gray-400 p-6">Nenhum template cadastrado.</p>
        )}
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500">{t.subject}</p>
              {t.variables && Array.isArray(t.variables) && t.variables.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Variáveis: {(t.variables as string[]).join(", ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/templates/${t.id}`}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
