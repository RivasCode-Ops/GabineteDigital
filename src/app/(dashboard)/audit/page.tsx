import { auth } from "@/lib/auth";
import { getAuditLogs, getAuditDescription } from "@/lib/audit";

const actionColors: Record<string, string> = {
  LOGIN: "bg-emerald-100 text-emerald-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  CREATE: "bg-blue-100 text-blue-800",
  UPDATE: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
  ANONYMIZE: "bg-purple-100 text-purple-800",
  EXPORT: "bg-indigo-100 text-indigo-800",
  IMPORT: "bg-cyan-100 text-cyan-800",
  STATUS_CHANGE: "bg-orange-100 text-orange-800",
  CONSENT_REVOKE: "bg-pink-100 text-pink-800",
  BACKUP: "bg-slate-100 text-slate-800",
  RESTORE: "bg-rose-100 text-rose-800",
};

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 100) {
    return <p className="p-6 text-red-600">Acesso restrito a administradores.</p>;
  }

  const { logs, total } = await getAuditLogs({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoria do Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">{total} registros no total</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-100">
          {logs.length === 0 && (
            <p className="text-sm text-gray-400 p-6">Nenhum registro de auditoria encontrado.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="px-6 py-3 flex items-start gap-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${actionColors[log.action] || "bg-gray-100"}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{log.user?.name || "Sistema"}</span>
                  {" "}{getAuditDescription(log)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {log.entity} · {log.createdAt.toLocaleString("pt-BR")}
                  {log.ip && ` · IP: ${log.ip}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
