"use client";

import { useState } from "react";

type Diagnostic = {
  territory: string;
  score: number;
  status: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  metrics: { label: string; value: number; status: string }[];
};

export function AiClient({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const [sending, setSending] = useState(false);

  async function notifyAll() {
    setSending(true);
    try {
      for (const d of diagnostics) {
        const title = `Diagnóstico IA: ${d.territory} (${d.score})`;
        const message = [
          `Status: ${d.status}`,
          d.weaknesses.length > 0 ? `Problemas: ${d.weaknesses.join("; ")}` : "",
          d.recommendations.length > 0 ? `Recomendações: ${d.recommendations[0]}` : "",
        ]
          .filter(Boolean)
          .join(". ");

        await fetch("/api/v1/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds: [],
            title,
            message,
            type: d.score <= 20 ? "CRITICAL" : "WARNING",
            link: `/intelligence`,
          }),
        });
      }
      alert("Notificações enviadas!");
    } catch {
      alert("Erro ao enviar notificações");
    } finally {
      setSending(false);
    }
  }

  return null;
}
