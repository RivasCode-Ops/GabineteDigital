"use client";

import { useState } from "react";

export default function AdminPage() {
  const [generating, setGenerating] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  async function generateBackup() {
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/backup", { method: "POST" });
      const data = await res.json();
      setBackupData(data.data);
    } catch {
      alert("Erro ao gerar backup");
    } finally {
      setGenerating(false);
    }
  }

  function downloadBackup() {
    if (!backupData) return;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-sm text-gray-500 mt-1">Backup, auditoria e manutenção do sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Backup do Sistema</h2>
          <p className="text-sm text-gray-500">
            Gera um arquivo JSON com todos os dados do sistema (territórios, pessoas, demandas, etc.)
          </p>
          <div className="flex gap-3">
            <button
              onClick={generateBackup}
              disabled={generating}
              className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162d4a] disabled:opacity-50"
            >
              {generating ? "Gerando..." : "Gerar Backup"}
            </button>
            {backupData && (
              <button
                onClick={downloadBackup}
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
              >
                Download
              </button>
            )}
          </div>
          {backupData && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Territórios: {backupData.stats.territories}</p>
              <p>Pessoas: {backupData.stats.people}</p>
              <p>Demandas: {backupData.stats.demands}</p>
              <p>Atividades: {backupData.stats.activities}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Importação</h2>
          <p className="text-sm text-gray-500">Importar dados de CSV ou XLSX</p>
          <ImportForm />
        </div>
      </div>
    </div>
  );
}

function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("people");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch("/api/v1/import", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data.data);
    } catch {
      alert("Erro na importação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="people">Pessoas</option>
        <option value="demands">Demandas</option>
      </select>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-sm"
      />
      <button
        type="submit"
        disabled={loading || !file}
        className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162d4a] disabled:opacity-50"
      >
        {loading ? "Importando..." : "Importar"}
      </button>
      {result && (
        <div className="text-sm space-y-1">
          <p className="text-emerald-600">Importados: {result.imported}/{result.total}</p>
          {result.errors?.length > 0 && (
            <div className="text-red-600 text-xs">
              {result.errors.map((e: string, i: number) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
