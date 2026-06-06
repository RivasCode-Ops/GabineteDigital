import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sentiment = searchParams.get("sentiment");
  const territoryId = searchParams.get("territory_id");
  const collectedBy = searchParams.get("collected_by");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);

  const where: Record<string, unknown> = { deletedAt: null };

  if (sentiment) where.sentiment = sentiment;
  if (territoryId) where.territoryId = territoryId;
  if (collectedBy) where.collectedBy = collectedBy;
  if (startDate) where.collectedAt = { gte: new Date(startDate) };
  if (endDate) {
    where.collectedAt = {
      ...((where.collectedAt as object) || {}),
      lte: new Date(endDate),
    };
  }

  const [data, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      include: {
        territory: { select: { id: true, name: true, type: true } },
        collector: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { collectedAt: "desc" },
    }),
    prisma.survey.count({ where }),
  ]);

  return NextResponse.json({
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    territoryId,
    collectedAt,
    sentiment,
    problems,
    priorities,
    notes,
    questions,
  } = body;

  if (!title || !sentiment || !collectedAt) {
    return NextResponse.json(
      { error: "title, sentiment e collectedAt são obrigatórios" },
      { status: 422 }
    );
  }

  const survey = await prisma.survey.create({
    data: {
      title,
      territoryId: territoryId || null,
      collectedBy: (session.user as any).id,
      collectedAt: new Date(collectedAt),
      sentiment,
      problems: problems || null,
      priorities: priorities || null,
      notes: notes || null,
      questions: questions
        ? {
            create: questions.map(
              (q: { question: string; answer?: string; answerType?: string; options?: string[] }) => ({
                question: q.question,
                answer: q.answer || null,
                answerType: q.answerType || "text",
                options: q.options || null,
              })
            ),
          }
        : undefined,
    },
    include: { questions: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create",
      entity: "surveys",
      entityId: survey.id,
      changes: { title, sentiment, territoryId } as any,
    },
  });

  return NextResponse.json({ data: survey }, { status: 201 });
}
