"use client";

import { TrendingUp, ArrowRight, History } from "lucide-react";

interface Props {
  onHistory: () => void;
}

export default function WorkerCommissionScreen({ onHistory }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm">
        <div className="w-24 h-24 bg-amber-light rounded-full mx-auto flex items-center justify-center mb-6">
          <TrendingUp className="w-12 h-12 text-amber" />
        </div>
        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-2">Cálculo de comissão</h1>
        <p className="text-muted-foreground mb-8">Detalhes automáticos do sistema</p>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground text-sm">Valor do serviço</span>
            <span className="font-bold text-foreground text-lg">15.000 Kz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Comissão plataforma (10%)</span>
            <span className="font-semibold text-destructive">−1.500 Kz</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="font-bold text-foreground">Total a receber</span>
            <span className="font-extrabold text-primary text-xl">13.500 Kz</span>
          </div>
        </div>

        <div className="bg-primary-light border border-primary/20 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-primary mb-1">✓ Registado com sucesso</p>
          <p className="text-xs text-muted-foreground">Este serviço foi adicionado ao teu histórico e ao sistema de comissões.</p>
        </div>

        <button
          onClick={onHistory}
          className="w-full flex items-center justify-center gap-2 hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity"
        >
          <History className="w-5 h-5" /> Ver histórico completo
        </button>
      </div>
    </div>
  );
}
