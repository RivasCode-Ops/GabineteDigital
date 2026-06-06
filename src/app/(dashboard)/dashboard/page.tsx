import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userCount = await prisma.user.count({ where: { deletedAt: null } });
  const roleCount = await prisma.role.count();
  const logCount = await prisma.auditLog.count();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">COMANDO 360</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name} ({session.user.role})
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Usuários</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{userCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Perfis</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{roleCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Logs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{logCount}</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sessão Ativa</h3>
          <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
