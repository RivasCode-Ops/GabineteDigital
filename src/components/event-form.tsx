"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const typeOptions = [
  { value: "reuniao", label: "Reunião" },
  { value: "evento", label: "Evento" },
  { value: "audiencia", label: "Audiência" },
  { value: "viagem", label: "Viagem" },
  { value: "visita", label: "Visita" },
  { value: "entrevista", label: "Entrevista" },
];

type TerritoryItem = { id: string; name: string; type: string };
type PersonItem = { id: string; name: string };

export function EventForm({
  territories,
  people,
  initialData,
}: {
  territories: TerritoryItem[];
  people: PersonItem[];
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    territoryId: string | null;
    startAt: string;
    endAt: string;
    allDay: boolean;
    location: string | null;
    address: string | null;
    status: string;
    color: string | null;
    participantIds: string[];
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "reuniao");
  const [territoryId, setTerritoryId] = useState(initialData?.territoryId || "");
  const [startAt, setStartAt] = useState(
    initialData?.startAt
      ? new Date(initialData.startAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [endAt, setEndAt] = useState(
    initialData?.endAt
      ? new Date(initialData.endAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [allDay, setAllDay] = useState(initialData?.allDay || false);
  const [location, setLocation] = useState(initialData?.location || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [color, setColor] = useState(initialData?.color || "#3b82f6");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialData?.participantIds || []
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

    try {
      const url = isEdit ? `/api/v1/events/${initialData.id}` : "/api/v1/events";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        territoryId: territoryId || null,
        startAt,
        endAt: endAt || startAt,
        allDay,
        location: location.trim() || null,
        address: address.trim() || null,
        color: color || null,
        participants: selectedParticipants,
      };

      if (isEdit) body.status = initialData?.status || "scheduled";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/agenda");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function toggleParticipant(id: string) {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Território</label>
          <select value={territoryId} onChange={(e) => setTerritoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="">Nenhum</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        <label htmlFor="allDay" className="text-sm text-gray-700">Dia inteiro</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Ex: Sede do gabinete" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="w-full h-9 px-1 border border-gray-300 rounded-md" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Participantes ({selectedParticipants.length})</label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
          {people.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <input type="checkbox" checked={selectedParticipants.includes(p.id)}
                onChange={() => toggleParticipant(p.id)} />
              {p.name}
            </label>
          ))}
          {people.length === 0 && <p className="text-xs text-gray-400">Nenhuma pessoa disponível</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50">
          {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </button>
        <Link href="/agenda" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</Link>
      </div>
    </form>
  );
}
