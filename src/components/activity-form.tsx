"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const typeOptions = [
  { value: "visita", label: "Visita" },
  { value: "reuniao", label: "Reunião" },
  { value: "evento", label: "Evento" },
  { value: "ligacao", label: "Ligação" },
  { value: "atendimento", label: "Atendimento" },
];

type TerritoryItem = { id: string; name: string; type: string };
type PersonItem = { id: string; name: string };

export function ActivityForm({
  territories,
  people,
  initialData,
}: {
  territories: TerritoryItem[];
  people: PersonItem[];
  initialData?: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    territoryId: string | null;
    peopleIds: string[];
    performedAt: string;
    durationMin: number | null;
    location: string | null;
    notes: string | null;
    isPublic: boolean;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [type, setType] = useState(initialData?.type || "visita");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [territoryId, setTerritoryId] = useState(initialData?.territoryId || "");
  const [selectedPeople, setSelectedPeople] = useState<string[]>(initialData?.peopleIds || []);
  const [performedAt, setPerformedAt] = useState(
    initialData?.performedAt
      ? new Date(initialData.performedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [durationMin, setDurationMin] = useState(initialData?.durationMin?.toString() || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim()) { setError("Título é obrigatório"); setLoading(false); return; }

    try {
      const url = isEdit ? `/api/v1/activities/${initialData.id}` : "/api/v1/activities";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        type, title: title.trim(),
        description: description.trim() || null,
        territoryId: territoryId || null,
        peopleIds: selectedPeople.length > 0 ? selectedPeople : null,
        performedAt, durationMin: durationMin ? Number(durationMin) : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        isPublic,
      };

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar"); }
      router.push("/activities");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally { setLoading(false); }
  }

  function togglePerson(id: string) {
    setSelectedPeople((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
            {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Território</label>
          <select value={territoryId} onChange={(e) => setTerritoryId(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="">Nenhum</option>
            {territories.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
          <input type="datetime-local" value={performedAt} onChange={(e) => setPerformedAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
          <input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm" placeholder="60" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pessoas envolvidas ({selectedPeople.length})</label>
        <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
          {people.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <input type="checkbox" checked={selectedPeople.includes(p.id)} onChange={() => togglePerson(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" rows={2} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <label htmlFor="isPublic" className="text-sm text-gray-700">Atividade pública</label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50">
          {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </button>
        <Link href="/activities" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</Link>
      </div>
    </form>
  );
}
