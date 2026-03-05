"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Wrench, CheckCircle, Clock, MapPin, Navigation, Play, Flag } from "lucide-react";
import { GeoLocation, ServiceProgress, ServiceProgressStep, calcDistance } from "@/lib/bioloTypes";

interface Props {
  onFinalize: () => void;
  serviceLocation?: GeoLocation; // localização do serviço (do cliente)
  onProgressUpdate?: (progress: ServiceProgress) => void;
}

// Raio em metros para considerar "chegou ao local"
const ARRIVAL_RADIUS_M = 200;

const STEP_CONFIG: { step: ServiceProgressStep; label: string; description: string }[] = [
  { step: "heading",  label: "A caminho do cliente",  description: "GPS activo — será notificado ao chegar" },
  { step: "arrived",  label: "No local",               description: "Chegou à morada do cliente" },
  { step: "started",  label: "Serviço em curso",        description: "Serviço iniciado pelo profissional" },
  { step: "done",     label: "Concluído",               description: "Serviço finalizado pelo profissional" },
];

const STEP_ORDER: ServiceProgressStep[] = ["heading", "arrived", "started", "done"];

function stepIndex(step: ServiceProgressStep) {
  return STEP_ORDER.indexOf(step);
}

export default function WorkerInProgressScreen({
  onFinalize,
  serviceLocation,
  onProgressUpdate,
}: Props) {
  const [progress, setProgress] = useState<ServiceProgress>({
    step: "heading",
    headingAt: new Date().toISOString(),
  });
  const [elapsed, setElapsed] = useState(0);
  const [workerGeo, setWorkerGeo] = useState<GeoLocation | null>(null);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const startTime = useRef<Date>(new Date());

  // — Avança o passo e notifica —
  const advanceTo = useCallback((step: ServiceProgressStep) => {
    setProgress((prev) => {
      const now = new Date().toISOString();
      const updated: ServiceProgress = {
        ...prev,
        step,
        ...(step === "arrived" && !prev.arrivedAt ? { arrivedAt: now } : {}),
        ...(step === "started" && !prev.startedAt ? { startedAt: now } : {}),
        ...(step === "done"    && !prev.doneAt    ? { doneAt: now, durationMin: Math.round((Date.now() - startTime.current.getTime()) / 60000) } : {}),
      };
      onProgressUpdate?.(updated);
      return updated;
    });
  }, [onProgressUpdate]);

  // — Timer —
  useEffect(() => {
    const t = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // — GPS Watchdog: acompanha posição e detecta chegada automática —
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS não disponível neste dispositivo");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const geo: GeoLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area: "Posição actual",
        };
        setWorkerGeo(geo);
        setGpsError(null);

        if (serviceLocation) {
          const km = calcDistance(geo, serviceLocation);
          const m = Math.round(km * 1000);
          setDistanceM(m);

          // GPS detecta chegada automaticamente ao entrar no raio de 200m
          setProgress((prev) => {
            if (prev.step === "heading" && m <= ARRIVAL_RADIUS_M) {
              const updated: ServiceProgress = {
                ...prev,
                step: "arrived",
                arrivedAt: new Date().toISOString(),
                workerLocation: geo,
                distanceToServiceM: m,
              };
              onProgressUpdate?.(updated);
              return updated;
            }
            return { ...prev, workerLocation: geo, distanceToServiceM: m };
          });
        }
      },
      (err) => {
        setGpsError("Sem sinal GPS — activa a localização");
        console.warn("GPS error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [serviceLocation, onProgressUpdate]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const currentIdx = stepIndex(progress.step);

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

        <h1 className="font-jakarta font-extrabold text-2xl text-center text-foreground mb-1">Em andamento</h1>
        <p className="text-muted-foreground text-center text-sm mb-5">Serviço para Paulo Mendes</p>

        {/* Timer */}
        <div className="flex justify-center mb-5">
          <div className="bg-card border border-border rounded-2xl px-6 py-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-jakarta font-bold text-2xl text-foreground">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* GPS status */}
        <div className={`rounded-xl px-4 py-2 mb-5 flex items-center gap-2 text-sm font-medium ${gpsError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Navigation className="w-4 h-4 flex-shrink-0" />
          {gpsError ? gpsError : (
            distanceM !== null
              ? distanceM <= ARRIVAL_RADIUS_M
                ? "✓ No local do serviço"
                : `${distanceM > 1000 ? (distanceM / 1000).toFixed(1) + " km" : distanceM + " m"} do local`
              : "A obter localização GPS…"
          )}
        </div>

        {/* Passos de progresso */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 space-y-1">
          {STEP_CONFIG.map((cfg, i) => {
            const done = i <= currentIdx;
            const current = i === currentIdx;
            return (
              <div key={cfg.step}>
                <div className="flex items-start gap-3 py-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-500 ${done ? "bg-primary" : "bg-muted"}`}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {cfg.label}
                    </p>
                    {current && (
                      <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
                    )}
                  </div>
                  {cfg.step === "heading" && current && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex-shrink-0">GPS</span>
                  )}
                </div>
                {i < STEP_CONFIG.length - 1 && (
                  <div className={`ml-3.5 w-0.5 h-3 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Local do serviço */}
        {serviceLocation && (
          <div className="bg-card border border-border rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Local do serviço</p>
              <p className="text-sm font-semibold text-foreground">{serviceLocation.area}</p>
            </div>
          </div>
        )}

        {/* Botões de acção conforme o passo */}
        {progress.step === "arrived" && (
          <button
            onClick={() => advanceTo("started")}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Iniciar serviço
          </button>
        )}

        {progress.step === "started" && (
          <button
            onClick={() => advanceTo("done")}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <Flag className="w-5 h-5" />
            Concluir serviço
          </button>
        )}

        {progress.step === "done" && (
          <button
            onClick={onFinalize}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Ver resumo e comissão →
          </button>
        )}

        {progress.step === "heading" && (
          <p className="text-center text-xs text-muted-foreground">
            O sistema detectará a tua chegada automaticamente via GPS ({ARRIVAL_RADIUS_M} m)
          </p>
        )}
      </div>
    </div>
  );
}
