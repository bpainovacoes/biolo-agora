"use client";

import { useState } from "react";
import { User, ChatMessage } from "@/lib/bioloTypes";
import { Send, CheckCircle } from "lucide-react";

interface Props {
  user: User;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onConfirm: () => void;
}

export default function WorkerChatScreen({ user, messages, onAddMessage, onConfirm }: Props) {
  const [text, setText] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    onAddMessage({
      id: Date.now().toString(),
      requestId: "active",
      from: "worker",
      fromName: user.name,
      text,
      time: now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      createdAt: now.toISOString(),
      read: false,
    });
    setText("");
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onConfirm, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">PM</div>
          <div>
            <p className="font-jakarta font-bold text-white text-sm">Paulo Mendes</p>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Online · cliente
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="bg-primary/20 rounded-xl px-4 py-2 text-sm text-primary-foreground/90 font-medium">
            💬 Negoceia o preço e confirma para iniciar o serviço
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col">
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "worker" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm ${
                msg.from === "worker"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === "worker" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {!confirmed && (
          <div className="bg-primary-light border border-primary/30 rounded-2xl p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Valor proposto: 15.000 Kz</p>
              <p className="text-xs text-muted-foreground">Confirma para iniciar o serviço</p>
            </div>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Iniciar
            </button>
          </div>
        )}

        {confirmed && (
          <div className="bg-primary-light border border-primary/30 rounded-2xl p-4 mb-3 text-center">
            <p className="text-sm font-bold text-primary">✓ Serviço confirmado! A iniciar...</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Escreve uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} className="bg-primary text-primary-foreground p-3 rounded-2xl hover:bg-primary/90 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
