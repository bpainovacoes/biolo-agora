"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { ServiceRequest } from "@/lib/bioloTypes";
import { useServicesSocket } from "@/lib/useServicesSocket";

interface Props {
  request: ServiceRequest;
}

export default function IncomingRequestScreen({ request }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const socket = useServicesSocket(session?.accessToken);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((v) => {
      if (v <= 1) {
        clearInterval(t);
        handleDecline();
        return 0;
      }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  function handleAccept() {
    if (loading) return;
    setLoading("accept");
    if (socket?.connected) {
      socket.emit("acceptServiceRequest", { serviceRequestId: request.id });
      router.push("/worker/chat");
    } else {
      router.push("/worker/chat");
    }
  }

  function handleDecline() {
    if (loading) return;
    setLoading("decline");
    if (socket?.connected) {
      socket.emit("rejectServiceRequest", { serviceRequestId: request.id });
    }
    router.push("/worker/available");
  }

  const pct = (timeLeft / 60) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Alert animation */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-amber/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-amber-light rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-amber" />
          </div>
        </div>

        <h1 className="font-jakarta font-extrabold text-2xl text-foreground text-center mb-1">Novo pedido!</h1>
        <p className="text-muted-foreground text-center mb-6">Um cliente precisa de ti agora</p>

        {/* Timer */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground font-medium">Tempo para responder</span>
            <span className={`font-bold ${timeLeft < 20 ? "text-destructive" : "text-primary"}`}>{timeLeft}s</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${timeLeft < 20 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Request card */}
        <div className="bg-card border-2 border-primary/30 rounded-3xl p-5 mb-6 card-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-jakarta font-extrabold text-xl text-foreground">{request.clientName}</p>
              <p className="text-muted-foreground text-sm">Cliente verificado ✓</p>
            </div>
            <p className="font-jakarta font-extrabold text-2xl text-primary">{request.price}</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de serviço</p>
                <p className="font-semibold text-foreground">{request.service} — {request.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="font-semibold text-foreground">{request.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-light rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Urgência</p>
                <p className="font-semibold text-foreground">Imediato</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-destructive/30 text-destructive font-bold py-4 rounded-2xl hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" /> Recusar
          </button>
          <button
            onClick={handleAccept}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" /> Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
