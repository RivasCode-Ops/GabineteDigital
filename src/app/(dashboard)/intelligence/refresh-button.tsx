"use client";

import { useState } from "react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/intelligence/refresh", { method: "POST" });
      const data = await res.json();
      setMessage(`Atualizado: ${data.meta.updated} territórios, ${data.meta.alertsGenerated} alertas`);
      window.location.reload();
    } catch {
      setMessage("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && <span className="text-sm text-gray-500">{message}</span>}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-md hover:bg-[#162d4a] disabled:opacity-50 transition-colors"
      >
        {loading ? "Atualizando..." : "Atualizar Indicadores"}
      </button>
    </div>
  );
}
