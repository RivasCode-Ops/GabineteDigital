"use client";

import { useState } from "react";
import Link from "next/link";

type TerritoryNode = {
  id: string;
  name: string;
  type: string;
  slug: string;
  parentId: string | null;
  children: TerritoryNode[];
};

const typeLabels: Record<string, string> = {
  state: "Estado",
  region: "Região",
  city: "Município",
  neighborhood: "Bairro",
  community: "Comunidade",
};

function TreeItem({
  node,
  depth = 0,
}: {
  node: TerritoryNode;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 group cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-gray-600 w-4 text-center text-xs"
          >
            {open ? "▼" : "▶"}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-xs text-gray-400 uppercase w-24 shrink-0">
          {typeLabels[node.type] || node.type}
        </span>
        <Link
          href={`/territories/${node.id}`}
          className="text-sm text-gray-900 hover:text-blue-600 font-medium"
        >
          {node.name}
        </Link>
      </div>
      {open && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TerritoryTree({ data }: { data: TerritoryNode[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Nenhum território cadastrado</p>
        <Link
          href="/territories/new"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Criar primeiro território
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {data.map((node) => (
        <TreeItem key={node.id} node={node} />
      ))}
    </div>
  );
}
