"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PersonItem = { id: string; name: string; category: string };
type TerritoryItem = { id: string; name: string; type: string };

export function LeadershipForm({
  people,
  territories,
  initialData,
}: {
  people: PersonItem[];
  territories: TerritoryItem[];
  initialData?: {
    id: string;
    leaderId: string;
    superiorId: string | null;
    role: string;
    territoryId: string | null;
    isCoordinator: boolean;
    startDate: string;
    endDate: string | null;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [leaderId, setLeaderId] = useState(initialData?.leaderId || "");
  const [superiorId, setSuperiorId] = useState(
    initialData?.superiorId || ""
  );
  const [role, setRole] = useState(initialData?.role || "");
  const [territoryId, setTerritoryId] = useState(
    initialData?.territoryId || ""
  );
  const [isCoordinator, setIsCoordinator] = useState(
    initialData?.isCoordinator || false
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!leaderId) {
      setError("Selecione a liderança");
      setLoading(false);
      return;
    }
    if (!role.trim()) {
      setError("Função é obrigatória");
      setLoading(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/v1/leaderships/${initialData.id}`
        : "/api/v1/leaderships";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        leaderId,
        superiorId: superiorId || null,
        role: role.trim(),
        territoryId: territoryId || null,
        isCoordinator,
        startDate,
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

      router.push("/leaderships");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const availableSuperiors = people.filter((p) => p.id !== leaderId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Liderança
        </label>
        <select
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Selecione a pessoa</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superior hierárquico
        </label>
        <select
          value={superiorId}
          onChange={(e) => setSuperiorId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Nenhum (topo da hierarquia)</option>
          {availableSuperiors.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Função / Cargo
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Coordenador Regional"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Território de atuação
        </label>
        <select
          value={territoryId}
          onChange={(e) => setTerritoryId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Nenhum</option>
          {territories.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de início
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de fim
            </label>
            <input
              type="date"
              value={
                initialData?.endDate
                  ? new Date(initialData.endDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => console.log(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isCoordinator"
          checked={isCoordinator}
          onChange={(e) => setIsCoordinator(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="isCoordinator" className="text-sm text-gray-700">
          É coordenador(a)
        </label>
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
          href="/leaderships"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
