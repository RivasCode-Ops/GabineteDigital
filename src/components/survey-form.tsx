"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const sentimentOptions = [
  { value: "muito_favoravel", label: "Muito Favorável", color: "text-green-700 bg-green-50" },
  { value: "favoravel", label: "Favorável", color: "text-blue-700 bg-blue-50" },
  { value: "neutro", label: "Neutro", color: "text-gray-700 bg-gray-50" },
  { value: "resistente", label: "Resistente", color: "text-yellow-700 bg-yellow-50" },
  { value: "muito_resistente", label: "Muito Resistente", color: "text-red-700 bg-red-50" },
];

type TerritoryItem = { id: string; name: string; type: string };

export function SurveyForm({ territories }: { territories: TerritoryItem[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [territoryId, setTerritoryId] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [collectedAt, setCollectedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [problems, setProblems] = useState<string[]>([""]);
  const [priorities, setPriorities] = useState<string[]>([""]);
  const [questions, setQuestions] = useState<{ question: string; answer: string; answerType: string }[]>([
    { question: "", answer: "", answerType: "text" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addProblem() { setProblems([...problems, ""]); }
  function updateProblem(i: number, v: string) { const p = [...problems]; p[i] = v; setProblems(p); }
  function removeProblem(i: number) { if (problems.length > 1) setProblems(problems.filter((_, idx) => idx !== i)); }

  function addPriority() { setPriorities([...priorities, ""]); }
  function updatePriority(i: number, v: string) { const p = [...priorities]; p[i] = v; setPriorities(p); }
  function removePriority(i: number) { if (priorities.length > 1) setPriorities(priorities.filter((_, idx) => idx !== i)); }

  function addQuestion() { setQuestions([...questions, { question: "", answer: "", answerType: "text" }]); }
  function updateQuestion(i: number, field: string, v: string) {
    const q = [...questions]; (q[i] as any)[field] = v; setQuestions(q);
  }
  function removeQuestion(i: number) { if (questions.length > 1) setQuestions(questions.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !sentiment) {
      setError("Título e sentimento são obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          territoryId: territoryId || null,
          collectedAt,
          sentiment,
          problems: problems.filter((p) => p.trim()),
          priorities: priorities.filter((p) => p.trim()),
          notes: notes.trim() || null,
          questions: questions.filter((q) => q.question.trim()).map((q) => ({
            question: q.question.trim(),
            answer: q.answer.trim() || null,
            answerType: q.answerType,
          })),
        }),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar"); }
      router.push("/surveys");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título da Pesquisa</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Território</label>
          <select value={territoryId} onChange={(e) => setTerritoryId(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="">Nenhum</option>
            {territories.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data da coleta</label>
          <input type="datetime-local" value={collectedAt} onChange={(e) => setCollectedAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sentimento</label>
        <div className="grid grid-cols-5 gap-2">
          {sentimentOptions.map((o) => (
            <button key={o.value} type="button" onClick={() => setSentiment(o.value)}
              className={`px-3 py-2 text-xs rounded-md border transition ${sentiment === o.value ? `ring-2 ring-blue-500 ${o.color}` : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Problemas identificados</label>
        {problems.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={p} onChange={(e) => updateProblem(i, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm" placeholder="Ex: Falta de iluminação" />
            <button type="button" onClick={() => removeProblem(i)} className="text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={addProblem} className="text-sm text-blue-600 hover:text-blue-800">+ Adicionar problema</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prioridades apontadas</label>
        {priorities.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={p} onChange={(e) => updatePriority(i, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm" placeholder="Ex: Iluminação pública" />
            <button type="button" onClick={() => removePriority(i)} className="text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={addPriority} className="text-sm text-blue-600 hover:text-blue-800">+ Adicionar prioridade</button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Perguntas</label>
          <button type="button" onClick={addQuestion} className="text-sm text-blue-600 hover:text-blue-800">+ Adicionar pergunta</button>
        </div>
        {questions.map((q, i) => (
          <div key={i} className="p-3 mb-2 border rounded-md bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-gray-400">Pergunta {i + 1}</span>
              <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 text-xs">Remover</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)}
                className="px-3 py-2 border rounded-md text-sm" placeholder="Pergunta" />
              <div className="flex gap-2">
                <select value={q.answerType} onChange={(e) => updateQuestion(i, "answerType", e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm w-28">
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="multiple_choice">Múltipla</option>
                  <option value="scale">Escala</option>
                </select>
                <input type="text" value={q.answer} onChange={(e) => updateQuestion(i, "answer", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm" placeholder="Resposta" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" rows={2} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50">
          {loading ? "Salvando..." : "Registrar Pesquisa"}
        </button>
        <Link href="/surveys" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</Link>
      </div>
    </form>
  );
}
