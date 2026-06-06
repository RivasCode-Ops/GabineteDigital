import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default async function MessageQueuePage() {
  const session = await auth();
  if (!session?.user) return null;

  const queue = await prisma.messageQueue.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { template: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fila de Mensagens</h1>
        <p className="text-sm text-gray-500 mt-1">{queue.length} itens na fila</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {queue.length === 0 && (
          <p className="text-sm text-gray-400 p-6">Nenhuma mensagem na fila.</p>
        )}
        <div className="divide-y divide-gray-100">
          {queue.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {item.subject || (item.template?.name ?? "Sem assunto")}
                </p>
                <p className="text-xs text-gray-500">
                  {item.channel} → {item.recipient}
                </p>
                {item.error && (
                  <p className="text-xs text-red-500 mt-0.5">{item.error}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}>
                  {item.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
