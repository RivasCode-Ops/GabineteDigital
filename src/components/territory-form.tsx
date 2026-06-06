"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const typeOptions = [
  { value: "state", label: "Estado" },
  { value: "region", label: "Região" },
  { value: "city", label: "Município" },
  { value: "neighborhood", label: "Bairro" },
  { value: "community", label: "Comunidade" },
];

const typeLevel: Record<string, number> = {
  state: 0,
  region: 1,
  city: 2,
  neighborhood: 3,
  community: 4,
};

type ParentItem = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
};

export function TerritoryForm({
  parents,
  initialData,
}: {
  parents: ParentItem[];
  initialData?: {
    id: string;
    name: string;
    type: string;
    parentId: string | null;
    population: number | null;
    ibgeCode: string | null;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "");
  const [parentId, setParentId] = useState(initialData?.parentId || "");
  const [population, setPopulation] = useState(
    initialData?.population?.toString() || ""
  );
  const [ibgeCode, setIbgeCode] = useState(initialData?.ibgeCode || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredParents = parents.filter((p) => {
    if (!type) return true;
    const currentLevel = typeLevel[type];
    if (currentLevel === undefined) return true;
    const parentLevel = typeLevel[p.type];
    if (parentLevel === undefined) return true;
    return parentLevel === currentLevel - 1;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }
    if (!type) {
      setError("Tipo é obrigatório");
      setLoading(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/v1/territories/${initialData.id}`
        : "/api/v1/territories";

      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: name.trim(),
        type,
        parentId: parentId || null,
        population: population ? Number(population) : null,
        ibgeCode: ibgeCode || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/territories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Piauí"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setParentId("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Selecione o tipo</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {type && filteredParents.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Território pai
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Nenhum (raiz)</option>
            {filteredParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            População
          </label>
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código IBGE
          </label>
          <input
            type="text"
            value={ibgeCode}
            onChange={(e) => setIbgeCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Opcional"
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </button>
        <Link
          href="/territories"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
