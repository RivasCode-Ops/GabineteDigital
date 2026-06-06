import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Territórios", href: "/territories" },
  { label: "Pessoas", href: "/people" },
  { label: "Lideranças", href: "/leaderships" },
  { label: "Demandas", href: "/demands" },
  { label: "Atividades", href: "/activities" },
  { label: "Agenda", href: "/agenda" },
  { label: "Pesquisas", href: "/surveys" },
  { label: "Inteligência", href: "/intelligence" },
  { label: "War Room", href: "/war-room" },
  { label: "Templates", href: "/templates" },
  { label: "Fila", href: "/message-queue" },
  { label: "IA", href: "/ai" },
  { label: "Admin", href: "/admin" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    name: string;
    email: string;
    role: string;
    roleLevel: number;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-lg font-bold">COMANDO 360</h1>
          <p className="text-xs text-white/60 mt-1">Gabinete Digital</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded">
                {user.role} ({user.roleLevel})
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="text-sm text-gray-500">
              <span className="text-gray-900 font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Sair
              </button>
            </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
