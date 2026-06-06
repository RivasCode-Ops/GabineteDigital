import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const validTransitions: Record<string, string[]> = {
  recebida: ["triagem", "arquivada"],
  triagem: ["encaminhada", "arquivada"],
  encaminhada: ["acompanhamento", "arquivada"],
  acompanhamento: ["resolvida", "arquivada"],
  resolvida: ["encerrada"],
  encerrada: [],
  arquivada: [],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 10) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const existing = await prisma.demand.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Demanda não encontrada" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { status, assignedTo, solution } = body;

  if (!status) {
    return NextResponse.json(
      { error: "status é obrigatório" },
      { status: 422 }
    );
  }

  const allowed = validTransitions[existing.status];
  if (!allowed || !allowed.includes(status)) {
    return NextResponse.json(
      {
        error: `Transição inválida de "${existing.status}" para "${status}"`,
        allowedTransitions: allowed || [],
      },
      { status: 422 }
    );
  }

  const updateData: Record<string, unknown> = { status };

  if (assignedTo && existing.status === "recebida" && status === "triagem") {
    updateData.assignedTo = assignedTo;
    updateData.assignedBy = (session.user as any).id;
  }

  if (status === "resolvida") {
    updateData.solution = solution || null;
    updateData.resolvedAt = new Date();
  }

  if (status === "encerrada") {
    updateData.closedAt = new Date();
  }

  const demand = await prisma.demand.update({
    where: { id },
    data: updateData,
  });

  await prisma.demandHistory.create({
    data: {
      demandId: id,
      field: "status",
      oldValue: existing.status,
      newValue: status,
      changedBy: (session.user as any).id,
    },
  });

  if (assignedTo) {
    await prisma.demandHistory.create({
      data: {
        demandId: id,
        field: "assignedTo",
        oldValue: existing.assignedTo,
        newValue: assignedTo,
        changedBy: (session.user as any).id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "status_change",
      entity: "demands",
      entityId: id,
      changes: { oldStatus: existing.status, newStatus: status } as any,
    },
  });

  return NextResponse.json({ data: demand });
}
