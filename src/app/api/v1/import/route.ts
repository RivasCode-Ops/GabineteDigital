import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { createAuditLog } from "@/lib/audit";
import { sanitizeInput } from "@/lib/csrf";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).roleLevel < 60) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;

  if (!file || !type) {
    return NextResponse.json({ error: "Arquivo e tipo são obrigatórios" }, { status: 400 });
  }

  const text = await file.text();
  let records: Record<string, string>[];

  try {
    if (file.name.endsWith(".csv")) {
      records = parse(text, { columns: true, skip_empty_lines: true, trim: true });
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(text, { type: "string" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      records = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json({ error: "Formato não suportado. Use CSV ou XLSX." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 400 });
  }

  let imported = 0;
  let errors: string[] = [];

  try {
    if (type === "people") {
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        try {
          const name = sanitizeInput(r.nome || r.name || "");
          const phone = sanitizeInput(r.telefone || r.phone || "");
          const email = sanitizeInput(r.email || "");
          if (!name) { errors.push(`Linha ${i + 1}: nome é obrigatório`); continue; }

          await prisma.person.create({
            data: {
              name,
              phone,
              email: email || null,
              category: "morador",
              consentGiven: true,
              createdBy: userId,
            },
          });
          imported++;
        } catch (err: any) {
          errors.push(`Linha ${i + 1}: ${err.message}`);
        }
      }
    } else if (type === "demands") {
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        try {
          const title = sanitizeInput(r.titulo || r.title || "");
          const description = sanitizeInput(r.descricao || r.description || "");
          const category = sanitizeInput(r.categoria || r.category || "");
          if (!title) { errors.push(`Linha ${i + 1}: título é obrigatório`); continue; }

          const validCategories = ["saude", "educacao", "infraestrutura", "transporte", "agricultura", "assistencia_social", "regularizacao_fundiaria", "outro"];
          const demandCategory = validCategories.includes(category) ? category : "outro";

          await prisma.demand.create({
            data: {
              title,
              description: description || null,
              category: demandCategory as any,
              createdBy: userId,
            },
          });
          imported++;
        } catch (err: any) {
          errors.push(`Linha ${i + 1}: ${err.message}`);
        }
      }
    } else {
      return NextResponse.json({ error: "Tipo não suportado. Use: people, demands" }, { status: 400 });
    }

    await createAuditLog({
      userId,
      action: "IMPORT",
      entity: type === "people" ? "person" : "demand",
      description: `Importou ${imported} registros de ${type}`,
      metadata: { type, total: records.length, imported, errors: errors.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({
    data: { imported, total: records.length, errors: errors.length > 0 ? errors.slice(0, 10) : [] },
  });
}
