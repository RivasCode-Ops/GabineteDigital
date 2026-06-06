import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ANONYMIZE"
  | "EXPORT"
  | "IMPORT"
  | "STATUS_CHANGE"
  | "CONSENT_REVOKE"
  | "BACKUP"
  | "RESTORE";

export type AuditEntity =
  | "territory"
  | "person"
  | "leadership"
  | "demand"
  | "activity"
  | "event"
  | "survey"
  | "user"
  | "notification"
  | "template"
  | "backup";

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const changes: Record<string, unknown> = {};
    if (params.description) changes.description = params.description;
    if (params.metadata) Object.assign(changes, params.metadata);

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        changes: Object.keys(changes).length > 0 ? (changes as any) : undefined,
        ip: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export async function getAuditLogs(options: {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.entity) where.entity = options.entity;
  if (options.entityId) where.entityId = options.entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 50,
      skip: options.offset ?? 0,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);

  return { logs, total };
}

export function getAuditDescription(log: {
  action: string;
  entity: string;
  entityId: string | null;
  changes: any;
}): string {
  if (log.changes?.description) return log.changes.description as string;
  return `${log.action} em ${log.entity}${log.entityId ? ` [${log.entityId.slice(0, 8)}]` : ""}`;
}
