import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TerritoryTree } from "@/components/territory-tree";

type TerritoryNode = {
  id: string;
  name: string;
  type: string;
  slug: string;
  parentId: string | null;
  children: TerritoryNode[];
};

async function fetchTree(parentId: string | null = null): Promise<TerritoryNode[]> {
  const children = await prisma.territory.findMany({
    where: { parentId, deletedAt: null, isActive: true },
    orderBy: { name: "asc" },
  });

  const result: TerritoryNode[] = [];
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

export default async function TerritoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { roleLevel: number };
  const tree = await fetchTree(null);
  const total = await prisma.territory.count({ where: { deletedAt: null } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Territórios</h2>
          <p className="text-sm text-gray-500 mt-1">{total} territórios cadastrados</p>
        </div>
        {user.roleLevel >= 100 && (
          <Link
            href="/territories/new"
            className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
          >
            + Novo
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <TerritoryTree data={tree} />
        </div>
      </div>
    </div>
  );
}
