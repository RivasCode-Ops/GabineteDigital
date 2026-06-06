"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [variables, setVariables] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const parsedVars = variables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const res = await fetch("/api/v1/message-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, body, variables: parsedVars }),
    });

    if (res.ok) {
      router.push("/templates");
      router.refresh();
    } else {
      alert("Erro ao salvar");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Novo Template</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Corpo</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Use {"{variavel}"} para placeholders</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variáveis <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
          </label>
          <input
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder="nome, territorio, data"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162d4a] disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/templates")}
            className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
