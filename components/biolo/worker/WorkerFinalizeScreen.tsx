"use client";

import { CheckCircle } from "lucide-react";

interface Props {
  onDone: () => void;
}

export default function WorkerFinalizeScreen({ onDone }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm">
        <div className="w-24 h-24 hero-gradient rounded-full mx-auto flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-2">Serviço concluído!</h1>
        <p className="text-muted-foreground mb-8">O cliente foi notificado. O pagamento será processado em breve.</p>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left space-y-3">
          {[
            { label: "Cliente", value: "Paulo Mendes" },
            { label: "Serviço", value: "Canalizador" },
            { label: "Duração", value: "1h 45min" },
            { label: "Valor cobrado", value: "15.000 Kz" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onDone}
          className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity"
        >
          Ver comissão →
        </button>
      </div>
    </div>
  );
}
