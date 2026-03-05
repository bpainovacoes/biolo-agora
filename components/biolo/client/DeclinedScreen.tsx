"use client";

import { ArrowLeft, XCircle } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function DeclinedScreen({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-2">Pedido recusado</h1>
      <p className="text-muted-foreground mb-8">O profissional não está disponível. Podes tentar outro.</p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Escolher outro profissional
      </button>
    </div>
  );
}
