"use client";

import { User } from "@/lib/bioloTypes";
import { Star, CheckCircle, Home } from "lucide-react";

interface Props {
  worker: User;
  rating: number;
  onHome: () => void;
}

export default function DoneScreen({ worker, rating, onHome }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-sm">
        <div className="w-24 h-24 hero-gradient rounded-full mx-auto flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="font-jakarta font-extrabold text-3xl text-foreground mb-2">Obrigado! 🎉</h1>
        <p className="text-muted-foreground mb-6">
          Avaliaste <span className="font-semibold text-foreground">{worker.name}</span> com
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-8 h-8 ${s <= rating ? "text-amber fill-current" : "text-muted"}`} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            { label: "Serviço", value: worker.profession ?? "—" },
            { label: "Profissional", value: worker.name },
            { label: "Valor pago", value: "15.000 Kz" },
            { label: "Comissão plataforma", value: "1.500 Kz" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg hover:bg-primary/90 transition-colors"
        >
          <Home className="w-5 h-5" /> Voltar ao início
        </button>
      </div>
    </div>
  );
}
