import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 20) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "people";
  const format = searchParams.get("format") || "csv";

  let data: Record<string, unknown>[];
  let filename: string;
  let headers: string[];

  if (type === "people") {
    const records = await prisma.person.findMany({
      where: { deletedAt: null },
      select: { name: true, email: true, phone: true, createdAt: true },
    });
    data = records.map((r) => ({
      nome: r.name,
      email: r.email || "",
      telefone: r.phone || "",
      cadastro: r.createdAt.toISOString().split("T")[0],
    }));
    filename = "pessoas";
    headers = ["nome", "email", "telefone", "cadastro"];
  } else if (type === "demands") {
    const records = await prisma.demand.findMany({
      where: { deletedAt: null },
      select: { title: true, description: true, category: true, status: true, createdAt: true },
    });
    data = records.map((r) => ({
      titulo: r.title,
      descricao: r.description || "",
      categoria: r.category || "",
      status: r.status,
      cadastro: r.createdAt.toISOString().split("T")[0],
    }));
    filename = "demandas";
    headers = ["titulo", "descricao", "categoria", "status", "cadastro"];
  } else if (type === "leaderships") {
    const records = await prisma.leadership.findMany({
      where: { deletedAt: null },
      select: {
        role: true,
        leader: { select: { name: true } },
        territory: { select: { name: true } },
        isActive: true,
        createdAt: true,
      },
    });
    data = records.map((r) => ({
      lider: r.leader.name,
      funcao: r.role,
      territorio: r.territory?.name || "",
      ativo: r.isActive ? "Sim" : "Não",
      cadastro: r.createdAt.toISOString().split("T")[0],
    }));
    filename = "liderancas";
    headers = ["lider", "funcao", "territorio", "ativo", "cadastro"];
  } else {
    return NextResponse.json({ error: "Tipo não suportado" }, { status: 400 });
  }

  await createAuditLog({
    userId,
    action: "EXPORT",
    entity: type as any,
    description: `Exportou ${data.length} registros de ${type} como ${format}`,
    metadata: { type, format, count: data.length },
  });

  if (format === "csv") {
    const csv = stringify(data, { header: true, columns: headers });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, filename);
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ data });
}
