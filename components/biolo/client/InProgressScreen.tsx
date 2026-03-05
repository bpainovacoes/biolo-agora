"use client";

import { useEffect, useRef, useState } from "react";
import { User, ServiceProgress, ServiceProgressStep } from "@/lib/bioloTypes";
import { Clock, CheckCircle, Wrench, Navigation2 } from "lucide-react";

interface Props {
  worker: User;
  onComplete: () => void;
  /** Progresso partilhado via AppState (actualizado pelo profissional) */
  serviceProgress: ServiceProgress;
}

const STEP_LABELS: Record<ServiceProgressStep, string> = {
  heading:  "Profissional a caminho",
  arrived:  "Profissional chegou ao local",
  started:  "Serviço em curso",
  done:     "Serviço concluído",
};

const STEP_ORDER: ServiceProgressStep[] = ["heading", "arrived", "started", "done"];

function stepIndex(step: ServiceProgressStep) {
  return STEP_ORDER.indexOf(step);
}

export default function InProgressScreen({ worker, onComplete, serviceProgress }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [displayedIdx, setDisplayedIdx] = useState(stepIndex(serviceProgress.step));

  // — Timer —
  useEffect(() => {
    const t = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /**
   * POLLING: Em produção isto seria um fetch ao backend a cada 5s.
   *   fetch(`/api/service-requests/${requestId}/progress`)
   *     .then(r => r.json())
   *     .then(data => setDisplayedIdx(stepIndex(data.step)));
   *
   * Por agora, observa as mudanças no serviceProgress (prop) que o profissional
   * actualiza via botões/GPS na mesma sessão (simula o polling em mock).
   */
  useEffect(() => {
    const newIdx = stepIndex(serviceProgress.step);
    if (newIdx > displayedIdx) {
      setDisplayedIdx(newIdx);
    }
  }, [serviceProgress.step, displayedIdx]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const currentStep = STEP_ORDER[displayedIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Ícone animado */}
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <div className="absolute inset-3 hero-gradient rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </div>
        </div>

        <h1 className="font-jakarta font-extrabold text-2xl text-center text-foreground mb-1">
          Serviço em andamento
        </h1>
        <p className="text-muted-foreground text-center mb-5">
          <span className="font-semibold text-foreground">{worker.name}</span> está a trabalhar
        </p>

        {/* Timer */}
        <div className="flex justify-center mb-5">
          <div className="bg-card border border-border rounded-2xl px-6 py-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-jakarta font-bold text-2xl text-foreground">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Passo actual em destaque */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
          <Navigation2 className="w-5 h-5 text-primary animate-pulse flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Estado actual</p>
            <p className="text-sm font-bold text-primary">{STEP_LABELS[currentStep]}</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full">
            {displayedIdx + 1}/4
          </span>
        </div>

        {/* Passos de progresso */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 space-y-1">
          {STEP_ORDER.map((step, i) => {
            const done = i <= displayedIdx;
            const current = i === displayedIdx;
            return (
              <div key={step}>
                <div className="flex items-center gap-3 py-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-700 ${done ? "bg-primary scale-110" : "bg-muted"}`}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    }
                  </div>
                  <p className={`text-sm font-medium transition-all duration-500 ${done ? "text-foreground" : "text-muted-foreground"} ${current ? "font-bold" : ""}`}>
                    {STEP_LABELS[step]}
                  </p>
                  {current && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`ml-3.5 w-0.5 h-3 transition-colors duration-700 ${i < displayedIdx ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Nota de polling */}
        {displayedIdx < 3 && (
          <p className="text-center text-xs text-muted-foreground mb-4">
            🔄 Esta página actualiza automaticamente conforme o profissional avança os passos
          </p>
        )}

        {/* Botão de avaliação — só aparece quando profissional conclui */}
        {displayedIdx >= 3 && (
          <button
            onClick={onComplete}
            className="w-full hero-gradient text-primary-foreground font-extrabold py-4 rounded-2xl text-lg hover:opacity-95 transition-opacity"
          >
            ✓ Serviço concluído — Avaliar
          </button>
        )}
      </div>
    </div>
  );
}
