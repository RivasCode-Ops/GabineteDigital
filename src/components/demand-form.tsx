"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categoryOptions = [
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "transporte", label: "Transporte" },
  { value: "agricultura", label: "Agricultura" },
  { value: "assistencia_social", label: "Assistência Social" },
  { value: "regularizacao_fundiaria", label: "Regularização Fundiária" },
  { value: "outro", label: "Outro" },
];

const priorityOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

type TerritoryItem = { id: string; name: string; type: string };
type PersonItem = { id: string; name: string };
type UserItem = { id: string; name: string };

export function DemandForm({
  territories,
  people,
  users,
  initialData,
}: {
  territories: TerritoryItem[];
  people: PersonItem[];
  users: UserItem[];
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    priority: string;
    territoryId: string | null;
    requesterId: string | null;
    assignedTo: string | null;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [priority, setPriority] = useState(initialData?.priority || "media");
  const [territoryId, setTerritoryId] = useState(
    initialData?.territoryId || ""
  );
  const [requesterId, setRequesterId] = useState(
    initialData?.requesterId || ""
  );
  const [assignedTo, setAssignedTo] = useState(
    initialData?.assignedTo || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim()) {
      setError("Título é obrigatório");
      setLoading(false);
      return;
    }
    if (!category) {
      setError("Categoria é obrigatória");
      setLoading(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/v1/demands/${initialData.id}`
        : "/api/v1/demands";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        territoryId: territoryId || null,
        requesterId: requesterId || null,
        assignedTo: assignedTo || null,
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

      router.push("/demands");
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
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Buraco na rua João XXIII"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Detalhes da demanda..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Selecione</option>
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Território
          </label>
          <select
            value={territoryId}
            onChange={(e) => setTerritoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Nenhum</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requerente
          </label>
          <select
            value={requesterId}
            onChange={(e) => setRequesterId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Nenhum</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável (opcional)
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Nenhum</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </button>
        <Link
          href="/demands"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
