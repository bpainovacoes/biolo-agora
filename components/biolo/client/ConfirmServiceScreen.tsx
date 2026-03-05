"use client";

import { User } from "@/lib/bioloTypes";
import { ArrowLeft, CheckCircle, MapPin, Clock, AlertCircle } from "lucide-react";

interface Props {
  worker: User;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ConfirmServiceScreen({ worker, onConfirm, onBack }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="font-jakarta font-bold text-lg">Confirmar serviço</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-card border border-border rounded-3xl p-6 mb-5 card-shadow">
          <h2 className="font-jakarta font-bold text-xl mb-5 text-foreground">Resumo do serviço</h2>

          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: worker.avatarColor }}
            >
              {worker.avatar}
            </div>
            <div>
              <p className="font-jakarta font-bold text-foreground">{worker.name}</p>
              <p className="text-muted-foreground text-sm">{worker.profession}</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: CheckCircle, label: "Serviço", value: worker.profession ?? "—" },
              { icon: MapPin, label: "Local", value: "Rangel, Luanda (a combinar)" },
              { icon: Clock, label: "Duração estimada", value: "2–3 horas" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Valor acordado</p>
              <p className="font-jakarta font-extrabold text-2xl text-foreground">15.000 Kz</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Comissão plataforma</p>
              <p className="text-sm font-semibold text-destructive">1.500 Kz (10%)</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-light border border-amber/20 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Ao confirmar, o profissional iniciará o serviço. O pagamento é feito após a conclusão.
          </p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full hero-gradient text-primary-foreground font-extrabold py-4 rounded-2xl text-lg hover:opacity-95 transition-opacity"
        >
          ✓ Confirmar e iniciar serviço
        </button>
      </main>
    </div>
  );
}
