"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categoryOptions = [
  { value: "lideranca", label: "Liderança" },
  { value: "morador", label: "Morador" },
  { value: "empresario", label: "Empresário" },
  { value: "vereador", label: "Vereador" },
  { value: "ex_vereador", label: "Ex-Vereador" },
  { value: "presidente_associacao", label: "Presidente de Associação" },
  { value: "sindicato", label: "Sindicato" },
  { value: "influenciador", label: "Influenciador" },
  { value: "parceiro_institucional", label: "Parceiro Institucional" },
];

type TerritoryItem = {
  id: string;
  name: string;
  type: string;
};

export function PersonForm({
  territories,
  initialData,
}: {
  territories: TerritoryItem[];
  initialData?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    category: string;
    territoryId: string | null;
    contactOrigin: string | null;
    notes: string | null;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [territoryId, setTerritoryId] = useState(
    initialData?.territoryId || ""
  );
  const [contactOrigin, setContactOrigin] = useState(
    initialData?.contactOrigin || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }
    if (!phone.trim()) {
      setError("Telefone é obrigatório");
      setLoading(false);
      return;
    }
    if (!category) {
      setError("Categoria é obrigatória");
      setLoading(false);
      return;
    }
    if (!isEdit && !consentGiven) {
      setError(
        "É necessário confirmar o consentimento LGPD para cadastrar a pessoa"
      );
      setLoading(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/v1/people/${initialData.id}`
        : "/api/v1/people";

      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        category,
        territoryId: territoryId || null,
        contactOrigin: contactOrigin.trim() || null,
        notes: notes.trim() || null,
      };

      if (!isEdit) {
        body.consentGiven = true;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/people");
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

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-9999"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="joao@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Selecione a categoria</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Território
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Origem do contato
        </label>
        <input
          type="text"
          value={contactOrigin}
          onChange={(e) => setContactOrigin(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Evento do dia 15/05"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Informações adicionais..."
        />
      </div>

      {!isEdit && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-blue-900">
              A pessoa foi informada e autorizou o armazenamento dos dados
              conforme a Lei Geral de Proteção de Dados (LGPD). Os dados serão
              utilizados exclusivamente para fins de gestão política e
              relacionamento comunitário.
            </span>
          </label>
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
          href="/people"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
