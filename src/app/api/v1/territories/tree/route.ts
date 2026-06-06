import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function fetchTree(parentId: string | null = null): Promise<unknown[]> {
  const children = await prisma.territory.findMany({
    where: { parentId, deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
  });

  const result = [];
  for (const child of children) {
    const grandchildren = await fetchTree(child.id);
    result.push({
      id: child.id,
      name: child.name,
      type: child.type,
      slug: child.slug,
      parentId: child.parentId,
      children: grandchildren,
    });
  }
  return result;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const tree = await fetchTree(null);
  return NextResponse.json({ data: tree });
}
