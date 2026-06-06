"use client";

import { useState } from "react";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          url: window.location.pathname,
        }),
      });
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 2000);
    } catch {
      alert("Erro ao enviar feedback");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-full shadow-lg hover:bg-[#162d4a] transition-all"
        >
          Encontrou dificuldade?
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          {sent ? (
            <p className="text-sm text-emerald-600 text-center py-3">
              Obrigado! Seu feedback foi enviado.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Conte o que aconteceu
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva o problema, dúvida ou sugestão..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="px-3 py-1.5 bg-[#1e3a5f] text-white text-xs rounded-md hover:bg-[#162d4a] disabled:opacity-50"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 text-xs rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
