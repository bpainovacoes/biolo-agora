"use client";

import { useState } from "react";
import { User, ChatMessage } from "@/lib/bioloTypes";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

interface Props {
  user: User;
  worker: User;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onConfirm: () => void;
}

export default function ChatNegotiateScreen({ user, worker, messages, onAddMessage, onConfirm }: Props) {
  const [text, setText] = useState("");
  const [priceAgreed, setPriceAgreed] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    onAddMessage({
      id: Date.now().toString(),
      requestId: "active",
      from: "client",
      fromName: "Tu",
      text,
      time: now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      createdAt: now.toISOString(),
      read: false,
    });
    setText("");
    // Simulate worker reply
    setTimeout(() => {
      const t = new Date();
      onAddMessage({
        id: (Date.now() + 1).toString(),
        requestId: "active",
        from: "worker",
        fromName: worker.name,
        text: "Perfeito, combinado! Confirmas o serviço?",
        time: t.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        createdAt: t.toISOString(),
        read: false,
      });
      setPriceAgreed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: worker.avatarColor }}
          >
            {worker.avatar}
          </div>
          <div>
            <p className="font-jakarta font-bold text-foreground text-sm">{worker.name}</p>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Online · a negociar
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="bg-amber-light rounded-xl px-4 py-2 text-sm text-amber-700 font-medium flex items-center gap-2">
            💬 Negociação de preço — Concorda com o valor e confirma o serviço
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col">
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.from === "client"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === "client" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {priceAgreed && (
          <div className="bg-primary-light border border-primary/30 rounded-2xl p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Valor acordado: 15.000 Kz</p>
              <p className="text-xs text-muted-foreground">Clica em confirmar para avançar</p>
            </div>
            <button
              onClick={onConfirm}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Confirmar
            </button>
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
          <button
            onClick={send}
            className="bg-primary text-primary-foreground p-3 rounded-2xl hover:bg-primary/90 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
